-- Effective WRITE exposure per role, for every public table (read-only catalog query).
-- A role can write a table when it holds the table privilege AND (RLS is off OR a permissive
-- policy that targets that role -- directly or through PUBLIC -- covers the command).
-- 'wide_open' = the permissive policy predicate is literally true / absent.
-- Safe to run on any database: it only reads pg_catalog.
WITH t AS (
  SELECT c.oid, c.relname, c.relrowsecurity AS rls, c.relforcerowsecurity AS forced
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
), roles(role) AS (VALUES ('anon'), ('authenticated')),
cmds(cmd, priv) AS (VALUES ('INSERT','INSERT'), ('UPDATE','UPDATE'), ('DELETE','DELETE')),
x AS (
  SELECT t.relname, r.role, k.cmd, t.rls,
         has_table_privilege(r.role, t.oid, k.priv) AS has_priv,
         (SELECT array_agg(p.policyname || ' [' || p.cmd || '] qual=' || coalesce(p.qual,'∅') || ' check=' || coalesce(p.with_check,'∅'))
            FROM pg_policies p
           WHERE p.schemaname = 'public' AND p.tablename = t.relname AND p.permissive = 'PERMISSIVE'
             AND (p.cmd IN ('ALL', k.cmd))
             AND (p.roles && ARRAY[r.role::name, 'public'::name])) AS policies,
         EXISTS (SELECT 1 FROM pg_policies p
           WHERE p.schemaname = 'public' AND p.tablename = t.relname AND p.permissive = 'PERMISSIVE'
             AND p.cmd IN ('ALL', k.cmd) AND p.roles && ARRAY[r.role::name, 'public'::name]
             AND coalesce(p.qual,'true') IN ('true','(true)') AND coalesce(p.with_check, p.qual, 'true') IN ('true','(true)')) AS wide_open
  FROM t CROSS JOIN roles r CROSS JOIN cmds k
)
SELECT relname AS "table", role, cmd,
       CASE WHEN NOT has_priv THEN 'no-grant'
            WHEN NOT rls THEN 'RLS-OFF'
            WHEN wide_open THEN 'WIDE-OPEN'
            WHEN policies IS NOT NULL THEN 'conditional'
            ELSE 'blocked-by-rls' END AS exposure,
       policies
FROM x
WHERE has_priv AND (NOT rls OR policies IS NOT NULL)
ORDER BY role, exposure, relname, cmd;
