-- READ-ONLY. Run in the Supabase SQL editor BEFORE applying the migration and save the output.
-- It captures the real policies and ACLs of the eight tables so that (a) the rollback can be compared
-- with the true production state and (b) the before/after diff is evidence.
-- Reads pg_catalog only; touches no application data.

-- 1. Policies
SELECT tablename, policyname, cmd, roles::text AS roles, permissive,
       regexp_replace(coalesce(qual, ''), '\s+', ' ', 'g')       AS using_expr,
       regexp_replace(coalesce(with_check, ''), '\s+', ' ', 'g') AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('class_event_methodology','class_events','homework_assignments','horarios',
                    'notificaciones_asistencia','planned_content','programas','salones')
ORDER BY tablename, cmd, policyname;

-- 2. Table ACLs and RLS flags
SELECT c.relname, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced,
       pg_get_userbyid(c.relowner) AS owner, c.relacl::text AS acl
FROM pg_class c
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relname IN ('class_event_methodology','class_events','homework_assignments','horarios',
                    'notificaciones_asistencia','planned_content','programas','salones')
ORDER BY c.relname;

-- 3. Do the helper names already exist? (the migration CREATE OR REPLACEs them)
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
WHERE p.pronamespace = 'public'::regnamespace
  AND p.proname IN ('tiene_capacidad_academica', 'puede_escribir_evento_clase', 'es_admin', 'maestro_actual', 'maestro_en_clase');

-- 4. profiles.rol values in use (confirms no role outside the helper's list needs write access)
SELECT rol, count(*) FROM public.profiles GROUP BY rol ORDER BY 2 DESC;

-- 4b. Accounts that would pass soi_security.has_role (estado = activo and activo not false), aggregated
SELECT rol, estado, (activo IS DISTINCT FROM false) AS has_role_ok, count(*) FROM public.profiles GROUP BY 1,2,3 ORDER BY 1,2;

-- 5. Row-count estimates (statistics only, no table scan)
SELECT relname, reltuples::bigint AS approx_rows
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN ('class_event_methodology','class_events','homework_assignments','horarios',
                  'notificaciones_asistencia','planned_content','programas','salones')
ORDER BY relname;
