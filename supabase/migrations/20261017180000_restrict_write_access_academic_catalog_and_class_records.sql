-- ════════════════════════════════════════════════════════════════════════════
-- 20261017180000_restrict_write_access_academic_catalog_and_class_records.sql
--
-- Closes anonymous (and over-broad authenticated) WRITE access on eight tables.
--
-- PROBLEM
-- -------
-- Eight tables carry permissive policies "TO public USING (true) / WITH CHECK (true)"
-- for INSERT/UPDATE/DELETE, and the API roles hold full table grants (Supabase legacy
-- default privileges). `public` includes `anon`, so anyone holding the project anon key
-- (it ships in the browser bundle) can create, alter and delete rows with a plain
-- PostgREST call and no login:
--
--     programas, salones, horarios                       institutional catalogue
--     class_events, class_event_methodology,
--     homework_assignments, planned_content              teacher class records
--     notificaciones_asistencia (UPDATE only)            attendance alert queue
--
-- On top of that, programas / salones / horarios also carry an `*_authenticated_all`
-- policy (ALL TO authenticated USING true), so merely swapping `public` for
-- `authenticated` would still let ANY registered account (alumno, representante, user)
-- rewrite the institutional catalogue.
--
-- FIX (least privilege)
-- ---------------------
--  Catalogue (programas, salones, horarios)
--      write  : capability catalogo:escribir -> admin, superadmin, coordinacion_academica,
--               or an explicit grant in permisos_maestros.permisos. `direccion` has NO default write.
--      read   : every authenticated user (unchanged); anon keeps SELECT on programas only
--               (policy programas_anon_read, used by public flows) -- not on the others.
--  Class records (class_events, class_event_methodology, homework_assignments,
--  planned_content)
--      write  : the owning teacher (maestros.id = maestro_actual()) or, for events of a
--               class, its titular/suplente; plus holders of registros_clase:gestionar
--               (admin, superadmin, coordinacion_academica or an explicit grant).
--      delete : registros_clase:gestionar only (no application flow deletes these rows).
--      read   : every authenticated user (UNCHANGED -- tightening reads needs flow work
--               and is tracked as a follow-up). anon loses all access.
--  Attendance alerts (notificaciones_asistencia)
--      The UPDATE-for-everyone policy is removed (its stated purpose was the Hermes service
--      role, which bypasses RLS anyway). Insert and read move from "any registered account" to
--      holders of alertas_asistencia:gestionar: the queue holds guardian phone numbers and its only application
--      consumer is the admin dashboard widget.
--
--  Table privileges are narrowed too: `REVOKE ALL ... FROM anon, authenticated`, then only
--  what the policies need is granted back (this also removes TRUNCATE, which RLS cannot
--  restrict). service_role is untouched.
--
-- NOT TOUCHED: any other table, any storage object/bucket policy (separate migration),
-- the QR module, SECURITY DEFINER functions, views (signage views run as owner and keep
-- working for anon).
--
-- ROLLBACK: supabase/rollback/20261017180000_restrict_write_access_academic_catalog_and_class_records.rollback.sql
-- TESTS   : supabase/tests/anon-write-fix/ (npm run test:db:anon-write)
--
-- POLICY-EXCEPTION R3: no new table is created; existing tables already predate R3.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 0. Helpers ──────────────────────────────────────────────────────────────

-- Capability check. Authorisations are defined per capability, never "per role by default":
--   admin, superadmin        every capability
--   coordinacion_academica   catalogo:escribir, registros_clase:gestionar, alertas_asistencia:gestionar
--   anyone else (maestro, direccion, finanzas, ...)  only by an explicit, dated grant in
--                            permisos_maestros.permisos (e.g. 'catalogo:escribir'), which requires a
--                            maestros row. direccion therefore has NO write access by default.
-- Uses the existing soi_security.has_role (requires profiles.estado = 'activo').
CREATE OR REPLACE FUNCTION public.tiene_capacidad_academica(p_capacidad text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    soi_security.has_role(ARRAY['admin', 'superadmin'])
    OR (soi_security.has_role(ARRAY['coordinacion_academica'])
        AND p_capacidad IN ('catalogo:escribir', 'registros_clase:gestionar', 'alertas_asistencia:gestionar'))
    OR EXISTS (
      SELECT 1
        FROM public.permisos_maestros pm
       WHERE pm.maestro_id = public.maestro_actual()
         AND p_capacidad = ANY (pm.permisos)
         AND (pm.fecha_inicio IS NULL OR pm.fecha_inicio <= current_date)
         AND (pm.fecha_fin    IS NULL OR pm.fecha_fin    >= current_date))
$$;

COMMENT ON FUNCTION public.tiene_capacidad_academica(text) IS
  'Capability check for academic writes. Capabilities: catalogo:escribir (programas, salones, horarios), registros_clase:gestionar (class_events and children, planned_content, homework), alertas_asistencia:gestionar (notificaciones_asistencia).';

-- Can the caller write a class event (or rows hanging from it)?
--   · the teacher that owns the event, or
--   · titular/suplente of the class the event's session belongs to, or
--   · holder of the capability registros_clase:gestionar.
CREATE OR REPLACE FUNCTION public.puede_escribir_evento_clase(p_teacher_id uuid, p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.tiene_capacidad_academica('registros_clase:gestionar')
      OR (p_teacher_id IS NOT NULL AND p_teacher_id = public.maestro_actual())
      OR (p_session_id IS NOT NULL AND EXISTS (
            SELECT 1
              FROM public.sesiones_clase s
             WHERE s.id = p_session_id
               AND public.maestro_en_clase(s.clase_id)))
$$;

COMMENT ON FUNCTION public.puede_escribir_evento_clase(uuid, uuid) IS
  'true when the caller owns the class event (teacher_id), teaches the class of its session, or holds registros_clase:gestionar.';

REVOKE ALL ON FUNCTION public.tiene_capacidad_academica(text)               FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.puede_escribir_evento_clase(uuid, uuid)        FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tiene_capacidad_academica(text)            TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_escribir_evento_clase(uuid, uuid)     TO authenticated, service_role;

-- ── 1. Institutional catalogue: programas, salones, horarios ────────────────

-- programas
DROP POLICY IF EXISTS "Permitir crear programas"       ON public.programas;
DROP POLICY IF EXISTS "Permitir actualizar programas"  ON public.programas;
DROP POLICY IF EXISTS "Permitir eliminar programas"    ON public.programas;
DROP POLICY IF EXISTS programas_authenticated_all      ON public.programas;
DROP POLICY IF EXISTS programas_read_authenticated     ON public.programas;
DROP POLICY IF EXISTS programas_gestor_write           ON public.programas;
CREATE POLICY programas_read_authenticated ON public.programas
  FOR SELECT TO authenticated USING (true);
CREATE POLICY programas_gestor_write ON public.programas
  FOR ALL TO authenticated
  USING (public.tiene_capacidad_academica('catalogo:escribir'))
  WITH CHECK (public.tiene_capacidad_academica('catalogo:escribir'));
REVOKE ALL ON public.programas FROM anon, authenticated;
GRANT SELECT ON public.programas TO anon;                                  -- programas_anon_read (public flows)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programas TO authenticated;

-- salones
DROP POLICY IF EXISTS "Permitir crear salones"         ON public.salones;
DROP POLICY IF EXISTS "Permitir actualizar salones"    ON public.salones;
DROP POLICY IF EXISTS "Permitir eliminar salones"      ON public.salones;
DROP POLICY IF EXISTS salones_authenticated_all        ON public.salones;
DROP POLICY IF EXISTS salones_read_authenticated       ON public.salones;
DROP POLICY IF EXISTS salones_gestor_write             ON public.salones;
CREATE POLICY salones_read_authenticated ON public.salones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY salones_gestor_write ON public.salones
  FOR ALL TO authenticated
  USING (public.tiene_capacidad_academica('catalogo:escribir'))
  WITH CHECK (public.tiene_capacidad_academica('catalogo:escribir'));
REVOKE ALL ON public.salones FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salones TO authenticated;

-- horarios
DROP POLICY IF EXISTS "Permitir crear horarios"        ON public.horarios;
DROP POLICY IF EXISTS "Permitir actualizar horarios"   ON public.horarios;
DROP POLICY IF EXISTS "Permitir eliminar horarios"     ON public.horarios;
DROP POLICY IF EXISTS horarios_authenticated_all       ON public.horarios;
DROP POLICY IF EXISTS horarios_read_authenticated      ON public.horarios;
DROP POLICY IF EXISTS horarios_gestor_write            ON public.horarios;
CREATE POLICY horarios_read_authenticated ON public.horarios
  FOR SELECT TO authenticated USING (true);
CREATE POLICY horarios_gestor_write ON public.horarios
  FOR ALL TO authenticated
  USING (public.tiene_capacidad_academica('catalogo:escribir'))
  WITH CHECK (public.tiene_capacidad_academica('catalogo:escribir'));
REVOKE ALL ON public.horarios FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.horarios TO authenticated;

-- ── 2. Class records: class_events, class_event_methodology, homework, planned ──

-- class_events
DROP POLICY IF EXISTS ce_select_all                    ON public.class_events;
DROP POLICY IF EXISTS ce_insert_all                    ON public.class_events;
DROP POLICY IF EXISTS ce_update_all                    ON public.class_events;
DROP POLICY IF EXISTS ce_delete_all                    ON public.class_events;
DROP POLICY IF EXISTS class_events_read_authenticated  ON public.class_events;
DROP POLICY IF EXISTS class_events_owner_insert        ON public.class_events;
DROP POLICY IF EXISTS class_events_owner_update        ON public.class_events;
DROP POLICY IF EXISTS class_events_gestor_delete       ON public.class_events;
CREATE POLICY class_events_read_authenticated ON public.class_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY class_events_owner_insert ON public.class_events
  FOR INSERT TO authenticated
  WITH CHECK (public.puede_escribir_evento_clase(teacher_id, session_id));
CREATE POLICY class_events_owner_update ON public.class_events
  FOR UPDATE TO authenticated
  USING (public.puede_escribir_evento_clase(teacher_id, session_id))
  WITH CHECK (public.puede_escribir_evento_clase(teacher_id, session_id));
CREATE POLICY class_events_gestor_delete ON public.class_events
  FOR DELETE TO authenticated
  USING (public.tiene_capacidad_academica('registros_clase:gestionar'));
REVOKE ALL ON public.class_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_events TO authenticated;

-- class_event_methodology (child of class_events)
DROP POLICY IF EXISTS cem_select_all                              ON public.class_event_methodology;
DROP POLICY IF EXISTS cem_insert_all                              ON public.class_event_methodology;
DROP POLICY IF EXISTS cem_update_all                              ON public.class_event_methodology;
DROP POLICY IF EXISTS cem_delete_all                              ON public.class_event_methodology;
DROP POLICY IF EXISTS class_event_methodology_read_authenticated  ON public.class_event_methodology;
DROP POLICY IF EXISTS class_event_methodology_owner_insert        ON public.class_event_methodology;
DROP POLICY IF EXISTS class_event_methodology_owner_update        ON public.class_event_methodology;
DROP POLICY IF EXISTS class_event_methodology_gestor_delete       ON public.class_event_methodology;
CREATE POLICY class_event_methodology_read_authenticated ON public.class_event_methodology
  FOR SELECT TO authenticated USING (true);
CREATE POLICY class_event_methodology_owner_insert ON public.class_event_methodology
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.class_events ce
     WHERE ce.id = class_event_methodology.class_event_id
       AND public.puede_escribir_evento_clase(ce.teacher_id, ce.session_id)));
CREATE POLICY class_event_methodology_owner_update ON public.class_event_methodology
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.class_events ce
     WHERE ce.id = class_event_methodology.class_event_id
       AND public.puede_escribir_evento_clase(ce.teacher_id, ce.session_id)))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.class_events ce
     WHERE ce.id = class_event_methodology.class_event_id
       AND public.puede_escribir_evento_clase(ce.teacher_id, ce.session_id)));
CREATE POLICY class_event_methodology_gestor_delete ON public.class_event_methodology
  FOR DELETE TO authenticated
  USING (public.tiene_capacidad_academica('registros_clase:gestionar'));
REVOKE ALL ON public.class_event_methodology FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_event_methodology TO authenticated;

-- homework_assignments
DROP POLICY IF EXISTS hw_select_all                               ON public.homework_assignments;
DROP POLICY IF EXISTS hw_insert_all                               ON public.homework_assignments;
DROP POLICY IF EXISTS hw_update_all                               ON public.homework_assignments;
DROP POLICY IF EXISTS hw_delete_all                               ON public.homework_assignments;
DROP POLICY IF EXISTS homework_assignments_read_authenticated     ON public.homework_assignments;
DROP POLICY IF EXISTS homework_assignments_owner_insert           ON public.homework_assignments;
DROP POLICY IF EXISTS homework_assignments_owner_update           ON public.homework_assignments;
DROP POLICY IF EXISTS homework_assignments_gestor_delete          ON public.homework_assignments;
CREATE POLICY homework_assignments_read_authenticated ON public.homework_assignments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY homework_assignments_owner_insert ON public.homework_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.tiene_capacidad_academica('registros_clase:gestionar')
    OR (teacher_id IS NOT NULL AND teacher_id = public.maestro_actual())
    OR EXISTS (SELECT 1 FROM public.class_events ce
                WHERE ce.id = homework_assignments.class_event_id
                  AND public.puede_escribir_evento_clase(ce.teacher_id, ce.session_id)));
CREATE POLICY homework_assignments_owner_update ON public.homework_assignments
  FOR UPDATE TO authenticated
  USING (
    public.tiene_capacidad_academica('registros_clase:gestionar')
    OR (teacher_id IS NOT NULL AND teacher_id = public.maestro_actual())
    OR EXISTS (SELECT 1 FROM public.class_events ce
                WHERE ce.id = homework_assignments.class_event_id
                  AND public.puede_escribir_evento_clase(ce.teacher_id, ce.session_id)))
  WITH CHECK (
    public.tiene_capacidad_academica('registros_clase:gestionar')
    OR (teacher_id IS NOT NULL AND teacher_id = public.maestro_actual())
    OR EXISTS (SELECT 1 FROM public.class_events ce
                WHERE ce.id = homework_assignments.class_event_id
                  AND public.puede_escribir_evento_clase(ce.teacher_id, ce.session_id)));
CREATE POLICY homework_assignments_gestor_delete ON public.homework_assignments
  FOR DELETE TO authenticated
  USING (public.tiene_capacidad_academica('registros_clase:gestionar'));
REVOKE ALL ON public.homework_assignments FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_assignments TO authenticated;

-- planned_content
DROP POLICY IF EXISTS planned_content_select_all                  ON public.planned_content;
DROP POLICY IF EXISTS planned_content_insert_all                  ON public.planned_content;
DROP POLICY IF EXISTS planned_content_update_all                  ON public.planned_content;
DROP POLICY IF EXISTS planned_content_delete_all                  ON public.planned_content;
DROP POLICY IF EXISTS planned_content_read_authenticated          ON public.planned_content;
DROP POLICY IF EXISTS planned_content_owner_insert                ON public.planned_content;
DROP POLICY IF EXISTS planned_content_owner_update                ON public.planned_content;
DROP POLICY IF EXISTS planned_content_gestor_delete               ON public.planned_content;
CREATE POLICY planned_content_read_authenticated ON public.planned_content
  FOR SELECT TO authenticated USING (true);
CREATE POLICY planned_content_owner_insert ON public.planned_content
  FOR INSERT TO authenticated
  WITH CHECK (public.tiene_capacidad_academica('registros_clase:gestionar')
              OR (maestro_id IS NOT NULL AND maestro_id = public.maestro_actual()));
CREATE POLICY planned_content_owner_update ON public.planned_content
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_academica('registros_clase:gestionar')
         OR (maestro_id IS NOT NULL AND maestro_id = public.maestro_actual()))
  WITH CHECK (public.tiene_capacidad_academica('registros_clase:gestionar')
              OR (maestro_id IS NOT NULL AND maestro_id = public.maestro_actual()));
CREATE POLICY planned_content_gestor_delete ON public.planned_content
  FOR DELETE TO authenticated
  USING (public.tiene_capacidad_academica('registros_clase:gestionar'));
REVOKE ALL ON public.planned_content FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planned_content TO authenticated;

-- ── 3. Attendance alerts: notificaciones_asistencia ─────────────────────────
-- · hermes_update_notifications (UPDATE TO public USING true) is removed: Hermes works with the
--   service role, which bypasses RLS, so no policy is needed for it.
-- · The queue holds guardian phone numbers and message bodies, and its only application consumer
--   is the admin dashboard widget (attendanceAlertsWidget). Insert and read are therefore limited
--   to academic managers instead of every registered account.
DROP POLICY IF EXISTS hermes_update_notifications           ON public.notificaciones_asistencia;
DROP POLICY IF EXISTS portal_insert_notifications           ON public.notificaciones_asistencia;
DROP POLICY IF EXISTS portal_read_own_notifications         ON public.notificaciones_asistencia;
DROP POLICY IF EXISTS notificaciones_asistencia_gestor_read   ON public.notificaciones_asistencia;
DROP POLICY IF EXISTS notificaciones_asistencia_gestor_insert ON public.notificaciones_asistencia;
CREATE POLICY notificaciones_asistencia_gestor_read ON public.notificaciones_asistencia
  FOR SELECT TO authenticated USING (public.tiene_capacidad_academica('alertas_asistencia:gestionar'));
CREATE POLICY notificaciones_asistencia_gestor_insert ON public.notificaciones_asistencia
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_academica('alertas_asistencia:gestionar'));
REVOKE ALL ON public.notificaciones_asistencia FROM anon, authenticated;
GRANT SELECT, INSERT ON public.notificaciones_asistencia TO authenticated;

-- ── 4. Self-check: abort the whole migration if anything stayed open ───────
DO $$
DECLARE
  v_tables constant text[] := ARRAY[
    'class_event_methodology', 'class_events', 'homework_assignments', 'horarios',
    'notificaciones_asistencia', 'planned_content', 'programas', 'salones'];
  v_bad text;
BEGIN
  SELECT string_agg(t || ':' || p, ', ') INTO v_bad
  FROM unnest(v_tables) AS t,
       unnest(ARRAY['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p
  WHERE has_table_privilege('anon', format('public.%I', t), p);
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'anon still holds write privileges: %', v_bad;
  END IF;

  SELECT string_agg(tablename || '.' || policyname, ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = ANY (v_tables)
    AND permissive = 'PERMISSIVE' AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    AND (roles && ARRAY['public', 'anon']::name[]);
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'write policies still target anon/public: %', v_bad;
  END IF;

  SELECT string_agg(tablename || '.' || policyname, ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = ANY (v_tables)
    AND permissive = 'PERMISSIVE' AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    AND coalesce(qual, 'true') IN ('true', '(true)')
    AND coalesce(with_check, qual, 'true') IN ('true', '(true)');
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'unconditional write policies remain: %', v_bad;
  END IF;
END $$;

COMMIT;
