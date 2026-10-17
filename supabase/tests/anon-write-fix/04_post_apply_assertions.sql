-- READ-ONLY. Run right after applying the migration. Every row must show ok = true.
WITH eight(t) AS (VALUES ('class_event_methodology'),('class_events'),('homework_assignments'),('horarios'),
                         ('notificaciones_asistencia'),('planned_content'),('programas'),('salones'))
SELECT 'anon holds no INSERT/UPDATE/DELETE/TRUNCATE on any of the eight tables' AS check_name,
       NOT EXISTS (SELECT 1 FROM eight, unnest(ARRAY['INSERT','UPDATE','DELETE','TRUNCATE']) p
                   WHERE has_table_privilege('anon', format('public.%I', t), p)) AS ok
UNION ALL
SELECT 'no write policy targets public/anon',
       NOT EXISTS (SELECT 1 FROM pg_policies, eight
                   WHERE schemaname='public' AND tablename=t AND permissive='PERMISSIVE'
                     AND cmd IN ('ALL','INSERT','UPDATE','DELETE') AND roles && ARRAY['public','anon']::name[])
UNION ALL
SELECT 'no unconditional (USING true / CHECK true) write policy remains',
       NOT EXISTS (SELECT 1 FROM pg_policies, eight
                   WHERE schemaname='public' AND tablename=t AND permissive='PERMISSIVE'
                     AND cmd IN ('ALL','INSERT','UPDATE','DELETE')
                     AND coalesce(qual,'true') IN ('true','(true)')
                     AND coalesce(with_check, qual, 'true') IN ('true','(true)'))
UNION ALL
SELECT 'RLS enabled on all eight',
       (SELECT bool_and(relrowsecurity) FROM pg_class WHERE relnamespace='public'::regnamespace AND relname IN (SELECT t FROM eight))
UNION ALL
SELECT 'anon keeps SELECT on programas (public flows)', has_table_privilege('anon','public.programas','SELECT')
UNION ALL
SELECT 'helper functions exist and anon cannot execute them',
       (SELECT count(*) = 2 AND NOT bool_or(has_function_privilege('anon', p.oid, 'EXECUTE'))
          FROM pg_proc p WHERE p.pronamespace='public'::regnamespace
           AND p.proname IN ('es_gestor_academico','puede_escribir_evento_clase'))
UNION ALL
SELECT 'signage views still readable by anon',
       bool_and(has_table_privilege('anon', format('public.%I', v), 'SELECT'))
  FROM (VALUES ('signage_v_horario_semana'),('signage_v_horario_hoy'),('signage_v_horario_manana'),('signage_v_calendario_mes')) s(v);
