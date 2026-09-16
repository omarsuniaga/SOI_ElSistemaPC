-- Solo lectura. Todos los checks deben devolver ok=true tras la instalación.
WITH table_checks AS (
  SELECT 'anon_denied:' || c.relname AS check_name,
    NOT (has_table_privilege('anon',c.oid,'SELECT')
      OR has_table_privilege('anon',c.oid,'INSERT')
      OR has_table_privilege('anon',c.oid,'UPDATE')
      OR has_table_privilege('anon',c.oid,'DELETE')) AS ok
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN
    ('profiles','alumnos','alumnos_clases','clases','clase_horarios','conversaciones_whatsapp','alertas_log',
     'vw_seguimiento_ausentes','vw_asistencias_consolidada')
), function_checks AS (
  SELECT 'merge_unavailable:' || r AS check_name,
    NOT has_function_privilege(r,'public.fn_fusionar_alumnos_duplicados(uuid,uuid,jsonb)','EXECUTE') AS ok
  FROM unnest(ARRAY['anon','authenticated','service_role']) r
), view_checks AS (
  SELECT 'view_invoker:' || c.relname AS check_name,
    coalesce(c.reloptions @> ARRAY['security_invoker=true'],false) AS ok
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN ('vw_seguimiento_ausentes','vw_asistencias_consolidada')
)
SELECT * FROM table_checks
UNION ALL SELECT * FROM function_checks
UNION ALL SELECT * FROM view_checks
UNION ALL SELECT 'table_check_count', (SELECT count(*)=9 FROM table_checks)
UNION ALL SELECT 'view_check_count', (SELECT count(*)=2 FROM view_checks)
UNION ALL SELECT 'close_not_anonymous',
  NOT has_function_privilege('anon','public.fn_cerrar_periodo_academico(uuid,date,date,uuid,text,boolean)','EXECUTE')
UNION ALL SELECT 'close_fields_not_directly_writable',
  NOT has_column_privilege('authenticated','public.periodos','cerrado','UPDATE')
UNION ALL SELECT 'audit_not_directly_writable',
  NOT has_table_privilege('authenticated','public.periodos_cierre_auditoria','INSERT')
UNION ALL SELECT 'profile_rpc_not_anonymous:' || signature,
  NOT has_function_privilege('anon',signature,'EXECUTE')
  FROM unnest(ARRAY['public.cambiar_rol_usuario(uuid,text)','public.aprobar_usuario(uuid)',
    'public.rechazar_usuario(uuid)','public.approve_maestro_profile(uuid,text,text)']) signature
ORDER BY check_name;
