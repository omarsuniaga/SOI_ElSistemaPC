-- Política RLS para storage.objects, bucket 'documentos', carpeta 'justificaciones/'.
--
-- Contexto: el bucket 'documentos' tenía RLS activo en storage.objects pero sin
-- ninguna policy definida para él (solo existían para 'db-backups' y 'signage'),
-- por lo que toda subida fallaba con "new row violates row-level security policy".
-- Antes de esto el bucket era público sin protección (ver discovery de seguridad
-- previa: certificados médicos/evidencia de alumnos quedaban accesibles por URL
-- directa a cualquiera). Esta migración cierra esa brecha para la carpeta
-- 'justificaciones/': solo maestros autenticados (vía maestro_actual()) o admins
-- (es_admin()) pueden subir, leer o borrar evidencia de inasistencias.
--
-- No toca otras carpetas del bucket 'documentos' (ausencias/, planificacion/,
-- inventario/, etc.) — esas quedan fuera del alcance de este fix.

create policy "justificaciones_evidencia_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'documentos'
    and name like 'justificaciones/%'
    and (es_admin() or maestro_actual() is not null)
  );

create policy "justificaciones_evidencia_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documentos'
    and name like 'justificaciones/%'
    and (es_admin() or maestro_actual() is not null)
  );

create policy "justificaciones_evidencia_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'documentos'
    and name like 'justificaciones/%'
    and (es_admin() or maestro_actual() is not null)
  );
