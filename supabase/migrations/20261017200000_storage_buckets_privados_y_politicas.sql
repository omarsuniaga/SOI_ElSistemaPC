-- Storage: bucket 'documentos' privado + políticas por prefijo + buckets faltantes.
--
-- Contexto (auditoría 2026-10-17):
--   * 'documentos' era público: cualquier URL guardada (justificaciones médicas,
--     ausencias, contratos de comodato) era accesible sin sesión.
--   * Solo existían políticas para 'justificaciones/'; las subidas de ausencias/,
--     planning/ y comodatos/ eran rechazadas por RLS.
--   * El código usa buckets inexistentes ('planificacion-docs', 'tareas') y
--     'instrumentos-fotos' no tenía políticas.
--
-- ORDEN DE DESPLIEGUE (importante): publicar primero el frontend que guarda rutas y
-- genera URLs firmadas (src/lib/storageFiles.js) y DESPUÉS aplicar esta migración.
-- Al momento de la auditoría 'documentos' tenía 0 objetos y ninguna tabla referenciaba
-- archivos, por lo que no hay datos que migrar.
--
-- NO toca el bucket 'signage' salvo límites de tamaño/MIME: sigue siendo público porque
-- la Raspberry Pi y el iframe de preview leen /storage/v1/object/public/signage/.
-- NO aplicar 20260915110000_signage_storage_rls_fix.sql: es más permisiva que la
-- configuración vigente en producción (permite escribir a cualquier autenticado).

-- ─── 1. documentos: privado, 10 MB, tipos permitidos ─────────────────────────────
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array[
      'application/pdf',
      'image/jpeg', 'image/png', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/markdown'
    ]
where id = 'documentos';

-- Reemplaza las políticas de justificaciones por versiones idempotentes.
drop policy if exists "justificaciones_evidencia_insert" on storage.objects;
drop policy if exists "justificaciones_evidencia_select" on storage.objects;
drop policy if exists "justificaciones_evidencia_delete" on storage.objects;

create policy "justificaciones_evidencia_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documentos' and name like 'justificaciones/%'
    and (es_admin() or maestro_actual() is not null)
  );
create policy "justificaciones_evidencia_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documentos' and name like 'justificaciones/%'
    and (es_admin() or maestro_actual() is not null)
  );
create policy "justificaciones_evidencia_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documentos' and name like 'justificaciones/%'
    and (es_admin() or maestro_actual() is not null)
  );

-- ausencias/<maestro_id>/<archivo>: el maestro dueño (carpeta = su id) o un admin.
drop policy if exists "documentos_ausencias_insert" on storage.objects;
drop policy if exists "documentos_ausencias_select" on storage.objects;
drop policy if exists "documentos_ausencias_delete" on storage.objects;

create policy "documentos_ausencias_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documentos' and name like 'ausencias/%'
    and (es_admin() or (storage.foldername(name))[2] = maestro_actual()::text)
  );
create policy "documentos_ausencias_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documentos' and name like 'ausencias/%'
    and (es_admin() or (storage.foldername(name))[2] = maestro_actual()::text)
  );
create policy "documentos_ausencias_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documentos' and name like 'ausencias/%'
    and (es_admin() or (storage.foldername(name))[2] = maestro_actual()::text)
  );

-- planning/<maestro_id>/<archivo>: mismo criterio.
drop policy if exists "documentos_planning_insert" on storage.objects;
drop policy if exists "documentos_planning_select" on storage.objects;
drop policy if exists "documentos_planning_delete" on storage.objects;

create policy "documentos_planning_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documentos' and name like 'planning/%'
    and (es_admin() or (storage.foldername(name))[2] = maestro_actual()::text)
  );
create policy "documentos_planning_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documentos' and name like 'planning/%'
    and (es_admin() or (storage.foldername(name))[2] = maestro_actual()::text)
  );
create policy "documentos_planning_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documentos' and name like 'planning/%'
    and (es_admin() or (storage.foldername(name))[2] = maestro_actual()::text)
  );

-- comodatos/<id>/contrato.pdf: solo administración (upsert requiere update).
drop policy if exists "documentos_comodatos_admin" on storage.objects;
create policy "documentos_comodatos_admin" on storage.objects
  for all to authenticated
  using      (bucket_id = 'documentos' and name like 'comodatos/%' and es_admin())
  with check (bucket_id = 'documentos' and name like 'comodatos/%' and es_admin());

-- ─── 2. instrumentos-fotos (público, imágenes ≤5 MB): faltaban políticas de escritura ─
-- La lectura pública no depende de políticas; solo se habilita la escritura admin.
drop policy if exists "instrumentos_fotos_admin_write" on storage.objects;
create policy "instrumentos_fotos_admin_write" on storage.objects
  for all to authenticated
  using      (bucket_id = 'instrumentos-fotos' and es_admin())
  with check (bucket_id = 'instrumentos-fotos' and es_admin());

-- ─── 3. planificacion-docs (nuevo, privado): cada usuario en su carpeta ──────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'planificacion-docs', 'planificacion-docs', false, 10485760,
  array['application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/markdown', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "planificacion_docs_owner" on storage.objects;
create policy "planificacion_docs_owner" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'planificacion-docs'
    and (es_admin() or (storage.foldername(name))[2] = auth.uid()::text)
  )
  with check (
    bucket_id = 'planificacion-docs'
    and (es_admin() or (storage.foldername(name))[2] = auth.uid()::text)
  );

-- ─── 4. tareas (nuevo, privado): adjuntos de Hermes con URL firmada ──────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tareas', 'tareas', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "tareas_adjuntos_auth" on storage.objects;
create policy "tareas_adjuntos_auth" on storage.objects
  for all to authenticated
  using      (bucket_id = 'tareas' and (es_admin() or maestro_actual() is not null))
  with check (bucket_id = 'tareas' and (es_admin() or maestro_actual() is not null));

-- ─── 5. signage: se mantiene público; solo límites de tamaño y tipo ──────────────
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif', 'image/bmp',
      'video/mp4', 'video/webm'
    ]
where id = 'signage';
