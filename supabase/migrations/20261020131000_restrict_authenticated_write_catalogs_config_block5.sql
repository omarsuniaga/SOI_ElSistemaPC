-- ════════════════════════════════════════════════════════════════════════════
-- 20261020131000_restrict_authenticated_write_catalogs_config_block5.sql
--
-- BLOCK 5 of the "authenticated wide open" remediation: institutional catalogues and configuration.
-- Any signed-in account (`alumno`, `representante`, `user`…) could read, rewrite and delete the rows of nine
-- tables through a plain PostgREST call; `anon` also held every table privilege on seven of them (no policy let
-- it through, so it read nothing, but one permissive policy away from a leak).
--
--   departamentos (7 rows)            department mailboxes: `email` is what Hermes/send-email use to dispatch
--                                     institutional mail -> an open UPDATE diverts that mail
--   instrumentos (3)                  instrument inventory (incl. alumno_nombre of the borrower)
--   niveles (3), modulos (1), unidades (1), ejercicios (2)   curricular catalogue
--   seguimiento_reglas (5)            thresholds that drive the absence-follow-up levels (vw_seguimiento_ausentes)
--   soi_process_contracts (4)         Hermes process contracts (owners, evidence, task templates)
--   configuracion_recordatorios (1)   NOT institutional: per-user reminder preferences of the teacher portal
--
-- DESIGN (least privilege; authorisation by capability, never "per role by default")
-- ---------------------------------------------------------------------------------
--  Write
--   · niveles, modulos, unidades, ejercicios, instrumentos : public.tiene_capacidad_academica('catalogo:escribir')
--       (already in production since 20261018042037: admin, superadmin, coordinacion_academica). `direccion` no.
--   · departamentos, seguimiento_reglas : public.tiene_capacidad_configuracion(...) -> admin, superadmin only
--       (new; unknown capability strings evaluate to false, so a typo fails closed).
--   · soi_process_contracts : no client write at all (no client code writes it; the Hermes RPCs are
--       SECURITY DEFINER and the edge functions use service_role).
--   · configuracion_recordatorios : each account its own row (profile_id = auth.uid()); never another one's.
--  Read
--   · niveles, modulos, unidades, ejercicios : every signed-in account (teacher/student portals; non-sensitive
--       catalogue, same as programas). anon: nothing.
--   · departamentos, instrumentos : institutional staff (admin, superadmin, direccion, coordinacion, finanzas,
--       operaciones, teachers).
--   · seguimiento_reglas, soi_process_contracts : the same staff WITHOUT teachers (nobody in the teacher portal
--       reads them; vw_seguimiento_ausentes is security_invoker and is only used by the pedagogical module).
--   · configuracion_recordatorios : the owner; admin/superadmin read every row (support).
--  Grants: REVOKE ALL FROM anon, authenticated then the minimum (no TRUNCATE/REFERENCES/TRIGGER, no DELETE where
--   no flow deletes; departamentos UPDATE is column-restricted to the columns the screen edits).
--
-- Does NOT read permisos_maestros. Independent of block 1 (own helper functions) and of R9/Storage.
-- The SECURITY DEFINER functions that touch these tables (fn_email_departamento, fn_hermes_*, fn_generate_class_
-- start_reminders, fn_sincronizar_arbol_curricular, fn_reportar_instrumento_danado…) run as owner and are unaffected.
--
-- ROLLBACK: supabase/rollback/20261020131000_restrict_authenticated_write_catalogs_config_block5.rollback.sql
-- TESTS   : supabase/tests/authenticated-wide-open-block5/ (npm run test:db:authenticated-wide-open-block5)
--
-- POLICY-EXCEPTION R3: no table is created; the nine tables predate R3 and carry no institucion_id. They are
--   paid for in the multi-institution backlog (departamentos/instrumentos/niveles… are the first candidates).
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 0. Preconditions and helpers ────────────────────────────────────────────

DO $$
BEGIN
  IF to_regprocedure('public.tiene_capacidad_academica(text)') IS NULL THEN
    RAISE EXCEPTION 'missing public.tiene_capacidad_academica(text): apply 20261017180000 first';
  END IF;
END $$;

-- Configuration capabilities: admin and superadmin only. Anything else (including a typo) is false.
CREATE OR REPLACE FUNCTION public.tiene_capacidad_configuracion(p_capacidad text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT soi_security.has_role(ARRAY['admin', 'superadmin'])
     AND p_capacidad IN ('departamentos:gestionar', 'seguimiento_reglas:gestionar', 'recordatorios:administrar')
$$;

COMMENT ON FUNCTION public.tiene_capacidad_configuracion(text) IS
  'Capability check for institutional configuration. departamentos:gestionar, seguimiento_reglas:gestionar, recordatorios:administrar (read every reminder preference row): admin/superadmin only. Unknown capability = false. Never reads permisos_maestros.';

-- Staff that may read department mailboxes and the instrument inventory (teachers count through
-- maestro_actual(), the criterion of the class-record policies).
CREATE OR REPLACE FUNCTION public.puede_leer_catalogo_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion', 'coordinacion_academica', 'finanzas', 'operaciones'])
      OR public.maestro_actual() IS NOT NULL
$$;

-- Staff that may read the follow-up rules and the Hermes process contracts (no teachers).
CREATE OR REPLACE FUNCTION public.puede_leer_configuracion_institucional()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion', 'coordinacion_academica', 'finanzas', 'operaciones'])
$$;

REVOKE ALL ON FUNCTION public.tiene_capacidad_configuracion(text)             FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.puede_leer_catalogo_staff()                      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.puede_leer_configuracion_institucional()         FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tiene_capacidad_configuracion(text)          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_leer_catalogo_staff()                   TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_leer_configuracion_institucional()      TO authenticated, service_role;

-- ── 1. Curricular catalogue: niveles, modulos, unidades, ejercicios ─────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['niveles', 'modulos', 'unidades', 'ejercicios'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_authenticated_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_read', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_read', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_gestor_write', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t || '_read', t);
    EXECUTE format($p$CREATE POLICY %I ON public.%I FOR ALL TO authenticated
      USING (public.tiene_capacidad_academica('catalogo:escribir'))
      WITH CHECK (public.tiene_capacidad_academica('catalogo:escribir'))$p$, t || '_gestor_write', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- ── 2. Department mailboxes: departamentos (read staff; edit the screen's columns, admin only) ─────
DROP POLICY IF EXISTS departamentos_authenticated_all ON public.departamentos;
DROP POLICY IF EXISTS departamentos_read              ON public.departamentos;
DROP POLICY IF EXISTS departamentos_gestor_update     ON public.departamentos;
CREATE POLICY departamentos_read ON public.departamentos
  FOR SELECT TO authenticated USING (public.puede_leer_catalogo_staff());
CREATE POLICY departamentos_gestor_update ON public.departamentos
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_configuracion('departamentos:gestionar'))
  WITH CHECK (public.tiene_capacidad_configuracion('departamentos:gestionar'));
REVOKE ALL ON public.departamentos FROM anon, authenticated;
GRANT SELECT ON public.departamentos TO authenticated;
GRANT UPDATE (nombre, email, responsable_nombre, responsable_email, activo, updated_at) ON public.departamentos TO authenticated;

-- ── 3. Instrument inventory: instrumentos (no client deletes) ───────────────
DROP POLICY IF EXISTS instrumentos_auth_all       ON public.instrumentos;
DROP POLICY IF EXISTS instrumentos_read           ON public.instrumentos;
DROP POLICY IF EXISTS instrumentos_gestor_insert  ON public.instrumentos;
DROP POLICY IF EXISTS instrumentos_gestor_update  ON public.instrumentos;
CREATE POLICY instrumentos_read ON public.instrumentos
  FOR SELECT TO authenticated USING (public.puede_leer_catalogo_staff());
CREATE POLICY instrumentos_gestor_insert ON public.instrumentos
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_academica('catalogo:escribir'));
CREATE POLICY instrumentos_gestor_update ON public.instrumentos
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_academica('catalogo:escribir'))
  WITH CHECK (public.tiene_capacidad_academica('catalogo:escribir'));
REVOKE ALL ON public.instrumentos FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.instrumentos TO authenticated;

-- ── 4. Absence-follow-up rules: seguimiento_reglas (admin/superadmin write) ─
DROP POLICY IF EXISTS rls_seguimiento_reglas_all        ON public.seguimiento_reglas;
DROP POLICY IF EXISTS seguimiento_reglas_read           ON public.seguimiento_reglas;
DROP POLICY IF EXISTS seguimiento_reglas_gestor_insert  ON public.seguimiento_reglas;
DROP POLICY IF EXISTS seguimiento_reglas_gestor_update  ON public.seguimiento_reglas;
CREATE POLICY seguimiento_reglas_read ON public.seguimiento_reglas
  FOR SELECT TO authenticated USING (public.puede_leer_configuracion_institucional());
CREATE POLICY seguimiento_reglas_gestor_insert ON public.seguimiento_reglas
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_configuracion('seguimiento_reglas:gestionar'));
CREATE POLICY seguimiento_reglas_gestor_update ON public.seguimiento_reglas
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_configuracion('seguimiento_reglas:gestionar'))
  WITH CHECK (public.tiene_capacidad_configuracion('seguimiento_reglas:gestionar'));
REVOKE ALL ON public.seguimiento_reglas FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.seguimiento_reglas TO authenticated;

-- ── 5. Hermes process contracts: soi_process_contracts (read only for the API) ──
DROP POLICY IF EXISTS soi_process_contracts_auth_read   ON public.soi_process_contracts;
DROP POLICY IF EXISTS soi_process_contracts_auth_write  ON public.soi_process_contracts;
DROP POLICY IF EXISTS soi_process_contracts_read        ON public.soi_process_contracts;
CREATE POLICY soi_process_contracts_read ON public.soi_process_contracts
  FOR SELECT TO authenticated USING (public.puede_leer_configuracion_institucional());
REVOKE ALL ON public.soi_process_contracts FROM anon, authenticated;
GRANT SELECT ON public.soi_process_contracts TO authenticated;

-- ── 6. Teacher reminder preferences: configuracion_recordatorios (own row) ──
-- The portal saves with an upsert on profile_id: INSERT ... ON CONFLICT (profile_id) DO UPDATE SET <payload>,
-- profile_id included, hence table-level INSERT/UPDATE; WITH CHECK pins every written row to the caller.
DROP POLICY IF EXISTS configuracion_recordatorios_admin_read          ON public.configuracion_recordatorios;
DROP POLICY IF EXISTS configuracion_recordatorios_authenticated_all   ON public.configuracion_recordatorios;
DROP POLICY IF EXISTS configuracion_recordatorios_read                ON public.configuracion_recordatorios;
DROP POLICY IF EXISTS configuracion_recordatorios_insert              ON public.configuracion_recordatorios;
DROP POLICY IF EXISTS configuracion_recordatorios_update              ON public.configuracion_recordatorios;
CREATE POLICY configuracion_recordatorios_read ON public.configuracion_recordatorios
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.tiene_capacidad_configuracion('recordatorios:administrar'));
CREATE POLICY configuracion_recordatorios_insert ON public.configuracion_recordatorios
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY configuracion_recordatorios_update ON public.configuracion_recordatorios
  FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
REVOKE ALL ON public.configuracion_recordatorios FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.configuracion_recordatorios TO authenticated;

-- ── 7. Self-check: abort the whole migration if anything stayed open ────────
DO $$
DECLARE
  v_tables constant text[] := ARRAY[
    'configuracion_recordatorios', 'departamentos', 'ejercicios', 'instrumentos', 'modulos',
    'niveles', 'seguimiento_reglas', 'soi_process_contracts', 'unidades'];
  -- the ONLY policies allowed to exist (anything else, however it is written, aborts the migration)
  v_expected constant text[] := ARRAY[
    'configuracion_recordatorios.configuracion_recordatorios_insert',
    'configuracion_recordatorios.configuracion_recordatorios_read',
    'configuracion_recordatorios.configuracion_recordatorios_update',
    'departamentos.departamentos_gestor_update', 'departamentos.departamentos_read',
    'ejercicios.ejercicios_gestor_write', 'ejercicios.ejercicios_read',
    'instrumentos.instrumentos_gestor_insert', 'instrumentos.instrumentos_gestor_update', 'instrumentos.instrumentos_read',
    'modulos.modulos_gestor_write', 'modulos.modulos_read',
    'niveles.niveles_gestor_write', 'niveles.niveles_read',
    'seguimiento_reglas.seguimiento_reglas_gestor_insert', 'seguimiento_reglas.seguimiento_reglas_gestor_update',
    'seguimiento_reglas.seguimiento_reglas_read',
    'soi_process_contracts.soi_process_contracts_read',
    'unidades.unidades_gestor_write', 'unidades.unidades_read'];
  v_bad text;
BEGIN
  -- row level security must still be on for every table
  SELECT string_agg(c.relname, ', ') INTO v_bad
  FROM pg_class c WHERE c.relnamespace = 'public'::regnamespace AND c.relname = ANY (v_tables) AND NOT c.relrowsecurity;
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'row level security is disabled on: %', v_bad;
  END IF;

  -- anon: no privilege of any kind, table or column level
  SELECT string_agg(t || ':' || p, ', ') INTO v_bad
  FROM unnest(v_tables) AS t,
       unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p
  WHERE has_table_privilege('anon', format('public.%I', t), p)
     OR (p IN ('SELECT', 'INSERT', 'UPDATE', 'REFERENCES') AND has_any_column_privilege('anon', format('public.%I', t), p));
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'anon still holds privileges: %', v_bad;
  END IF;

  -- authenticated: never TRUNCATE / REFERENCES / TRIGGER
  SELECT string_agg(t || ':' || p, ', ') INTO v_bad
  FROM unnest(v_tables) AS t, unnest(ARRAY['TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p
  WHERE has_table_privilege('authenticated', format('public.%I', t), p);
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'authenticated still holds dangerous privileges: %', v_bad;
  END IF;

  -- exact policy set: nothing unknown (permissive, restrictive, any role, any command), nothing missing
  SELECT string_agg(tablename || '.' || policyname, ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = ANY (v_tables)
    AND (tablename || '.' || policyname) <> ALL (v_expected);
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'unknown policies remain: %', v_bad;
  END IF;
  SELECT string_agg(e, ', ') INTO v_bad
  FROM unnest(v_expected) AS e
  WHERE NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename || '.' || p.policyname = e);
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'expected policies are missing: %', v_bad;
  END IF;

  -- no policy for anon/public, and no unconditional write policy for anybody but service_role
  SELECT string_agg(tablename || '.' || policyname, ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = ANY (v_tables)
    AND (roles && ARRAY['public', 'anon']::name[]
         OR (cmd <> 'SELECT'
             AND NOT (roles = ARRAY['service_role']::name[])
             AND coalesce(qual, 'true') IN ('true', '(true)')
             AND coalesce(with_check, qual, 'true') IN ('true', '(true)')));
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'open policies remain: %', v_bad;
  END IF;
END $$;

COMMIT;
