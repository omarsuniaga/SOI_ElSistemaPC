-- Tras aplicar docs/storage-security/rollback_20261017200000.sql el estado debe ser el de
-- producción previo a la migración.
\set ON_ERROR_STOP on
\set u2 '00000000-0000-0000-0000-000000000002'
\set inv 'd0000000-0000-0000-0000-000000000001'
\o /dev/null
truncate t.results;

select t.expect('R.01 documentos vuelve a ser público sin límites',
  (select public and file_size_limit is null and allowed_mime_types is null from storage.buckets where id = 'documentos'));
select t.expect('R.02 signage sigue público y sin límites',
  (select public and file_size_limit is null and allowed_mime_types is null from storage.buckets where id = 'signage'));
select t.expect('R.03 es_admin_estricto() eliminada', to_regprocedure('public.es_admin_estricto()') is null);
select t.expect('R.04 índice eliminado', to_regclass('public.idx_justificaciones_evidencia_url') is null);
select t.expect('R.05 es_admin() sin search_path fijado',
  (select proconfig is null from pg_proc where oid = 'public.es_admin()'::regprocedure));
select t.expect('R.06 solo quedan las políticas originales de Storage',
  (select array_agg(policyname::text order by policyname) from pg_policies where schemaname = 'storage' and tablename = 'objects')
  = array['db_backups_superadmin_delete','db_backups_superadmin_read','db_backups_superadmin_write',
          'justificaciones_evidencia_delete','justificaciones_evidencia_insert','justificaciones_evidencia_select',
          'signage_bucket_admin_write','signage_bucket_auth_read']);

select t.seed('documentos', 'justificaciones/evidencia.jpg');
select t.as_user(:'u2');
select t.expect('R.07 comportamiento original restaurado (cualquier maestro lee justificaciones/)',
  t.can_see('documentos', 'justificaciones/evidencia.jpg'));
select t.back();
select t.as_user(:'inv');
select t.expect('R.08 comportamiento original restaurado (es_admin() escribe en signage)',
  t.try_insert('signage', 'subidos/x.png'));
select t.back();
select t.wipe();

\o
\echo
\echo '=== RESULTADOS DE LA REVERSIÓN ==='
select count(*) filter (where ok) as pasaron, count(*) filter (where not ok) as fallaron from t.results;
select name as "FALLO" from t.results where not ok order by n;
do $$ begin
  if exists (select 1 from t.results where not ok) then raise exception 'FALLÓ LA VERIFICACIÓN DE LA REVERSIÓN'; end if;
end $$;
