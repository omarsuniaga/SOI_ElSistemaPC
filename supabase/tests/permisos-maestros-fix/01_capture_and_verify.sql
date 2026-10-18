-- Read-only. Run in production BEFORE applying (state must match the rollback) and AFTER (state must be "after").
-- Nothing here writes; every statement is a catalog SELECT.

-- 1. Policies. BEFORE: 5 rows (Maestro ve..., Permitir actualizar..., Permitir insertar..., Todos pueden leer..., permisos_maestros_admin_read)
--    AFTER : 4 rows (Maestro ve..., permisos_maestros_admin_insert, permisos_maestros_admin_read, permisos_maestros_admin_update)
SELECT policyname, cmd, permissive, roles::text, qual, with_check
FROM pg_policies WHERE schemaname = 'public' AND tablename = 'permisos_maestros' ORDER BY policyname;

-- 2. Table privileges. BEFORE: anon, authenticated, service_role, postgres with 8 privileges each.
--    AFTER : authenticated = INSERT,SELECT,UPDATE ; no anon ; service_role and postgres unchanged.
SELECT coalesce(r.rolname, 'PUBLIC') AS grantee, string_agg(x.privilege_type, ',' ORDER BY x.privilege_type) AS privileges
FROM (SELECT (aclexplode(relacl)).* FROM pg_class WHERE oid = 'public.permisos_maestros'::regclass) x
LEFT JOIN pg_roles r ON r.oid = x.grantee GROUP BY 1 ORDER BY 1;

-- 3. Triggers (must be the same before and after): set_actualizado_en_permisos, trigger_check_permisos_maestros_integrity
SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'public.permisos_maestros'::regclass AND NOT tgisinternal ORDER BY 1;

-- 4. Column-level grants (must return no rows) and RLS flags (must be true / false)
SELECT attname, attacl FROM pg_attribute WHERE attrelid = 'public.permisos_maestros'::regclass AND attnum > 0 AND attacl IS NOT NULL;
SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid = 'public.permisos_maestros'::regclass;
