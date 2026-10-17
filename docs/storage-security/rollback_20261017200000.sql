-- REVERSIÓN de 20261017200000_storage_buckets_privados_y_politicas.sql
--
-- Restaura el estado de producción documentado el 2026-10-17 (antes de la migración).
-- Ejecutar solo con autorización. Es idempotente.
--
-- ⚠ Reabre el bucket 'documentos' al público. Úsese únicamente si el despliegue rompe
--   flujos críticos y no hay forma de corregir hacia delante; si ya se subieron archivos
--   sensibles, NO reabrir 'documentos': corregir las políticas en su lugar.
--
-- NO borra los buckets nuevos ('tareas', 'planificacion-docs'): Supabase bloquea el DELETE
-- directo sobre storage.* y quedan vacíos y privados (inocuos). Elimínalos desde el panel
-- si lo deseas.

-- 1. documentos: público y sin límites (estado previo)
update storage.buckets
set public = true, file_size_limit = null, allowed_mime_types = null
where id = 'documentos';

-- 2. Políticas nuevas de la migración
drop policy if exists "documentos_ausencias_insert"   on storage.objects;
drop policy if exists "documentos_ausencias_select"   on storage.objects;
drop policy if exists "documentos_ausencias_delete"   on storage.objects;
drop policy if exists "documentos_planning_insert"    on storage.objects;
drop policy if exists "documentos_planning_select"    on storage.objects;
drop policy if exists "documentos_planning_delete"    on storage.objects;
drop policy if exists "documentos_comodatos_admin"    on storage.objects;
drop policy if exists "instrumentos_fotos_admin_write" on storage.objects;
drop policy if exists "planificacion_docs_owner"      on storage.objects;
drop policy if exists "tareas_adjuntos_admin"         on storage.objects;

-- 3. Políticas de justificaciones: definiciones originales (migración 20261009012849)
drop policy if exists "justificaciones_evidencia_insert" on storage.objects;
drop policy if exists "justificaciones_evidencia_select" on storage.objects;
drop policy if exists "justificaciones_evidencia_delete" on storage.objects;

create policy "justificaciones_evidencia_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documentos' and name like 'justificaciones/%'
              and (es_admin() or maestro_actual() is not null));
create policy "justificaciones_evidencia_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'documentos' and name like 'justificaciones/%'
         and (es_admin() or maestro_actual() is not null));
create policy "justificaciones_evidencia_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documentos' and name like 'justificaciones/%'
         and (es_admin() or maestro_actual() is not null));

-- 4. signage: política de escritura original (es_admin) y sin límites
drop policy if exists "signage_bucket_admin_write" on storage.objects;
create policy "signage_bucket_admin_write" on storage.objects
  for all to authenticated
  using      (bucket_id = 'signage' and es_admin())
  with check (bucket_id = 'signage' and es_admin());

update storage.buckets
set file_size_limit = null, allowed_mime_types = null
where id = 'signage';

-- 5. Funciones e índice añadidos
alter function public.es_admin()       reset search_path;
alter function public.maestro_actual() reset search_path;
drop function if exists public.es_admin_estricto();
drop index if exists public.idx_justificaciones_evidencia_url;
