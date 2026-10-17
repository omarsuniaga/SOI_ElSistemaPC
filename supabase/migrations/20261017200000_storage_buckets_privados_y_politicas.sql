-- Storage: buckets privados, políticas por propietario y endurecimiento de roles.
--
-- Auditoría 2026-10-17 (ver docs/storage-security/AUDITORIA_Y_PLAN_DESPLIEGUE.md):
--   * 'documentos' era público: toda URL guardada (justificaciones médicas, ausencias,
--     contratos de comodato) era accesible sin sesión.
--   * Solo existían políticas para 'justificaciones/' y eran demasiado amplias: cualquier
--     maestro podía leer y borrar la evidencia de TODOS los alumnos.
--   * Las subidas a ausencias/, planning/ y comodatos/ eran rechazadas por RLS.
--   * El código usa buckets inexistentes ('planificacion-docs', 'tareas') y
--     'instrumentos-fotos' no tenía políticas de escritura.
--   * es_admin() incluye el rol 'inventarista', que el CHECK de profiles.rol NO permite
--     hoy (0 filas, imposible de asignar). Si algún día se habilita, heredaría 194 políticas.
--     Los buckets sensibles usan es_admin_estricto() para no depender de eso.
--
-- ORDEN DE DESPLIEGUE: publicar primero el frontend de esta rama (guarda rutas con el uid
-- del propietario y firma las URLs) y DESPUÉS aplicar esta migración. Al auditar,
-- 'documentos' tenía 0 objetos y ninguna tabla referenciaba archivos: no hay datos que migrar.
-- Reversión: docs/storage-security/rollback_20261017200000.sql
--
-- NO toca la visibilidad de 'signage' (sigue público: la Raspberry Pi y el iframe leen
-- /storage/v1/object/public/signage/). Solo añade límites y restringe la ESCRITURA a admin.
-- NO aplicar 20260915110000_signage_storage_rls_fix.sql: es más permisiva que producción.

-- ─── 0. Funciones de rol ──────────────────────────────────────────────────────────
-- Administrador estricto: solo profiles.rol = 'admin'. No incluye 'inventarista'.
create or replace function public.es_admin_estricto()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select p.rol = 'admin' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.es_admin_estricto() from public, anon;
grant execute on function public.es_admin_estricto() to authenticated, service_role;

-- Las funciones SECURITY DEFINER existentes no fijaban search_path (riesgo de secuestro
-- de búsqueda). Todas sus referencias ya están calificadas (public.*, auth.*), por lo que
-- fijarlo no cambia su comportamiento.
alter function public.es_admin() set search_path = public, pg_temp;
alter function public.maestro_actual() set search_path = public, pg_temp;

-- Índice para resolver la evidencia de una justificación por su ruta (política de lectura).
create index if not exists idx_justificaciones_evidencia_url
  on public.justificaciones (evidencia_url)
  where evidencia_url is not null;

-- ─── 1. documentos: privado, 10 MB, tipos permitidos ──────────────────────────────
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

-- justificaciones/<auth.uid()>/<archivo>
--   subir/borrar: el maestro propietario (carpeta = su uid) o un admin estricto.
--   leer: lo anterior, o el maestro (titular o suplente) de la clase de la fila de
--         `justificaciones` que referencia el archivo.
drop policy if exists "justificaciones_evidencia_insert" on storage.objects;
drop policy if exists "justificaciones_evidencia_select" on storage.objects;
drop policy if exists "justificaciones_evidencia_delete" on storage.objects;

create policy "justificaciones_evidencia_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documentos'
    and name like 'justificaciones/%'
    and cardinality(storage.foldername(name)) = 2
    and (
      public.es_admin_estricto()
      or ((storage.foldername(name))[2] = auth.uid()::text and public.maestro_actual() is not null)
    )
  );

create policy "justificaciones_evidencia_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documentos'
    and name like 'justificaciones/%'
    and (
      public.es_admin_estricto()
      or ((storage.foldername(name))[2] = auth.uid()::text and public.maestro_actual() is not null)
      -- Maestro (titular o suplente) de la clase de la justificación que referencia el archivo.
      -- Se exige maestro_en_clase() de forma explícita: la política de la tabla usa es_admin(),
      -- que incluye 'inventarista', y aquí no debe heredarse ese acceso.
      or exists (
        select 1 from public.justificaciones j
        where j.evidencia_url = storage.objects.name
          and public.maestro_en_clase(j.clase_id)
      )
    )
  );

create policy "justificaciones_evidencia_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documentos'
    and name like 'justificaciones/%'
    and (
      public.es_admin_estricto()
      or ((storage.foldername(name))[2] = auth.uid()::text and public.maestro_actual() is not null)
    )
  );

-- ausencias/<maestro_id>/<archivo> y planning/<maestro_id>/<archivo>:
-- el maestro dueño de la carpeta (maestros.id) o un admin estricto.
drop policy if exists "documentos_ausencias_insert" on storage.objects;
drop policy if exists "documentos_ausencias_select" on storage.objects;
drop policy if exists "documentos_ausencias_delete" on storage.objects;
drop policy if exists "documentos_planning_insert"  on storage.objects;
drop policy if exists "documentos_planning_select"  on storage.objects;
drop policy if exists "documentos_planning_delete"  on storage.objects;

create policy "documentos_ausencias_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documentos' and name like 'ausencias/%'
    and cardinality(storage.foldername(name)) = 2
    and (public.es_admin_estricto() or (storage.foldername(name))[2] = public.maestro_actual()::text)
  );
create policy "documentos_ausencias_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documentos' and name like 'ausencias/%'
    and (public.es_admin_estricto() or (storage.foldername(name))[2] = public.maestro_actual()::text)
  );
create policy "documentos_ausencias_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documentos' and name like 'ausencias/%'
    and (public.es_admin_estricto() or (storage.foldername(name))[2] = public.maestro_actual()::text)
  );

create policy "documentos_planning_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documentos' and name like 'planning/%'
    and cardinality(storage.foldername(name)) = 2
    and (public.es_admin_estricto() or (storage.foldername(name))[2] = public.maestro_actual()::text)
  );
create policy "documentos_planning_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documentos' and name like 'planning/%'
    and (public.es_admin_estricto() or (storage.foldername(name))[2] = public.maestro_actual()::text)
  );
create policy "documentos_planning_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documentos' and name like 'planning/%'
    and (public.es_admin_estricto() or (storage.foldername(name))[2] = public.maestro_actual()::text)
  );

-- comodatos/<id>/contrato.pdf: personal de inventario (es_admin() incluye 'inventarista',
-- que es la intención del portal de inventario). La subida con upsert requiere UPDATE.
drop policy if exists "documentos_comodatos_admin" on storage.objects;
create policy "documentos_comodatos_admin" on storage.objects
  for all to authenticated
  using      (bucket_id = 'documentos' and name like 'comodatos/%' and public.es_admin())
  with check (bucket_id = 'documentos' and name like 'comodatos/%' and public.es_admin());

-- ─── 2. instrumentos-fotos (público, imágenes ≤5 MB) ──────────────────────────────
-- La lectura pública no depende de políticas; se habilita la escritura al personal de inventario.
drop policy if exists "instrumentos_fotos_admin_write" on storage.objects;
create policy "instrumentos_fotos_admin_write" on storage.objects
  for all to authenticated
  using      (bucket_id = 'instrumentos-fotos' and public.es_admin())
  with check (bucket_id = 'instrumentos-fotos' and public.es_admin());

-- ─── 3. planificacion-docs (nuevo, privado): cada maestro en su carpeta ───────────
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
    and (
      public.es_admin_estricto()
      or ((storage.foldername(name))[2] = auth.uid()::text and public.maestro_actual() is not null)
    )
  )
  with check (
    bucket_id = 'planificacion-docs'
    and (
      public.es_admin_estricto()
      or ((storage.foldername(name))[2] = auth.uid()::text and public.maestro_actual() is not null)
    )
  );

-- ─── 4. tareas (nuevo, privado): adjuntos de Hermes, solo administración ──────────
-- Hoy no existe flujo de subida en el frontend (solo lectura vía URL firmada). Se concede
-- el mínimo: admin estricto. Ampliar cuando se defina quién puede adjuntar (ver auditoría:
-- la tabla tareas_institucionales tiene la política tareas_auth_all = true).
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

drop policy if exists "tareas_adjuntos_auth"  on storage.objects;
drop policy if exists "tareas_adjuntos_admin" on storage.objects;
create policy "tareas_adjuntos_admin" on storage.objects
  for all to authenticated
  using      (bucket_id = 'tareas' and public.es_admin_estricto())
  with check (bucket_id = 'tareas' and public.es_admin_estricto());

-- ─── 5. signage: sigue público; límites y escritura solo para admin estricto ──────
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif', 'image/bmp',
      'video/mp4', 'video/webm'
    ]
where id = 'signage';

drop policy if exists "signage_bucket_admin_write" on storage.objects;
create policy "signage_bucket_admin_write" on storage.objects
  for all to authenticated
  using      (bucket_id = 'signage' and public.es_admin_estricto())
  with check (bucket_id = 'signage' and public.es_admin_estricto());
-- "signage_bucket_auth_read" (SELECT para authenticated) se conserva tal cual.
