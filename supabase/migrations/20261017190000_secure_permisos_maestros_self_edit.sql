-- ════════════════════════════════════════════════════════════════════════════
-- 20261017190000_secure_permisos_maestros_self_edit.sql
--
-- Closes R9: a teacher could write to their OWN row of public.permisos_maestros.
--
-- PROBLEM
-- -------
-- The INSERT/UPDATE policies of permisos_maestros allowed `es_admin() OR <own row>`, so any
-- teacher could edit the authorization row that gates their own capabilities. Production
-- already carries a BEFORE trigger (check_permisos_maestros_integrity) that resets
-- puede_registrar_alumnos, puede_inscribir_clases, puede_crear_clases, permisos and
-- concedido_por for non-admins, but it does NOT cover puede_planificar, puede_asistir,
-- fecha_inicio, fecha_fin or solicitudes: a teacher could re-enable a planning/attendance
-- flag that an admin revoked (retirar_maestro_seguro sets them to false) or erase an expiry.
-- Protection by trigger is also fragile: every authorization column added later is exposed
-- until someone remembers to extend the trigger.
-- Additionally "Todos pueden leer permisos" lets every signed-in account read every row, and
-- anon / authenticated hold TRUNCATE, REFERENCES, TRIGGER, MAINTAIN (anon: full table access).
--
-- EVIDENCE (read-only capture of production, 2026-10-17)
-- -------
--  · Application code writes permisos_maestros only from admin screens (actualizarPermiso,
--    aprobarSolicitud, inactivar maestro) and from SECURITY DEFINER RPCs (approve_maestro_profile,
--    retirar_maestro_seguro, eliminar_maestro_limpio; owner postgres, BYPASSRLS).
--  · Teachers only READ their own row (portal getPermisos, realtime channel filtered by
--    maestro_id). The permission REQUEST flow writes public.solicitudes_permisos, not this table;
--    permisos_maestros.solicitudes is empty in all 19 rows and has no writer.
--  · API logs 2026-10-13..17: every write came from one admin account, teachers only issued
--    GET ... maestro_id=eq.<own id>.
--
-- FIX (least privilege)
-- ---------------------
--  · INSERT / UPDATE: es_admin() only. The teacher cannot write ANY column of the table.
--    (A column-level GRANT cannot separate admin from teacher: both are `authenticated`.)
--  · SELECT: own row (existing policy "Maestro ve sus propios permisos", used by tiene_permiso())
--    plus admin (existing permisos_maestros_admin_read). "Todos pueden leer permisos" is dropped.
--  · Privileges: anon none; authenticated SELECT, INSERT, UPDATE only (no DELETE: no policy
--    allows it; no TRUNCATE / REFERENCES / TRIGGER / MAINTAIN).
--  · The integrity trigger is left untouched as defence in depth.
--
-- NOT TOUCHED: es_admin() semantics (admin + inventarista, profile state ignored), the
-- trigger, tiene_permiso(), the RPCs, and public.solicitudes_permisos (see report, R10).
-- Idempotent and transactional; the self-check at the end aborts the whole transaction.
-- Rollback: supabase/rollback/20261017190000_secure_permisos_maestros_self_edit.rollback.sql
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

SET LOCAL lock_timeout = '10s';

-- ── 1. Policies ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Permitir actualizar sus propios permisos o por admin" ON public.permisos_maestros;
DROP POLICY IF EXISTS "Permitir insertar sus propios permisos o por admin"   ON public.permisos_maestros;
DROP POLICY IF EXISTS "Todos pueden leer permisos"                           ON public.permisos_maestros;
DROP POLICY IF EXISTS permisos_maestros_admin_insert                         ON public.permisos_maestros;
DROP POLICY IF EXISTS permisos_maestros_admin_update                         ON public.permisos_maestros;

CREATE POLICY permisos_maestros_admin_insert ON public.permisos_maestros
  AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY permisos_maestros_admin_update ON public.permisos_maestros
  AS PERMISSIVE FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK (es_admin());

-- ── 2. Privileges ───────────────────────────────────────────────────────────
REVOKE ALL ON public.permisos_maestros FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.permisos_maestros TO authenticated;

-- ── 3. Self-check: abort the whole migration if a teacher could still write ─
DO $$
DECLARE
  v_rel constant regclass := 'public.permisos_maestros'::regclass;
  v_bad text;
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = v_rel) THEN
    RAISE EXCEPTION 'RLS is disabled on permisos_maestros';
  END IF;

  -- every write policy must be admin-only, authenticated-only and permissive-free of OR branches
  SELECT string_agg(policyname || '(' || cmd || ')', ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'permisos_maestros'
    AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    AND NOT (
      policyname IN ('permisos_maestros_admin_insert', 'permisos_maestros_admin_update')
      AND permissive = 'PERMISSIVE'
      AND roles = ARRAY['authenticated']::name[]
      AND coalesce(qual, 'es_admin()') = 'es_admin()'
      AND coalesce(with_check, 'es_admin()') = 'es_admin()');
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'permisos_maestros: write policy is not admin-only: %', v_bad;
  END IF;

  -- no unconditional read
  SELECT string_agg(policyname, ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'permisos_maestros' AND cmd IN ('ALL', 'SELECT')
    AND permissive = 'PERMISSIVE' AND coalesce(qual, 'true') IN ('true', '(true)');
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'permisos_maestros: unconditional read policy remains: %', v_bad;
  END IF;

  -- privileges: anon nothing; authenticated only SELECT/INSERT/UPDATE; no PUBLIC; no column grants
  SELECT string_agg(coalesce(a.rolname, 'PUBLIC') || ':' || x.privilege_type, ', ') INTO v_bad
  FROM (SELECT (aclexplode(relacl)).* FROM pg_class WHERE oid = v_rel) x
  LEFT JOIN pg_roles a ON a.oid = x.grantee
  WHERE coalesce(a.rolname, 'PUBLIC') IN ('PUBLIC', 'anon')
     OR (a.rolname = 'authenticated' AND x.privilege_type NOT IN ('SELECT', 'INSERT', 'UPDATE'));
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'permisos_maestros: excess privileges remain: %', v_bad;
  END IF;

  SELECT string_agg(attname, ', ') INTO v_bad
  FROM pg_attribute WHERE attrelid = v_rel AND attnum > 0 AND NOT attisdropped AND attacl IS NOT NULL;
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'permisos_maestros: unexpected column-level grants on: %', v_bad;
  END IF;
END $$;

COMMIT;
