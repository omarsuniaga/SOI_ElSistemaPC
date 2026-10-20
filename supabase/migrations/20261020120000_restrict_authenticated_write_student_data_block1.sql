-- ════════════════════════════════════════════════════════════════════════════
-- 20261020120000_restrict_authenticated_write_student_data_block1.sql
--
-- BLOCK 1 of the "authenticated wide open" remediation: student personal data.
-- Closes write (and, where it leaked, read) access that ANY signed-in account holds on
-- eleven tables. A signed-in `alumno`, `representante` or `user` could read, rewrite and
-- delete the rows below through a plain PostgREST call.
--
--   postulantes (404 rows)               applicant PII: guardians' names and WhatsApp numbers
--   alumnos_programas (456)              enrolment per student/programme, incl. `calificacion`
--                                        (also readable by ANON: policy "Enable read access
--                                        for all users", SELECT TO public USING true)
--   notificaciones (526)                 in-app notifications; every INSERT fires a push to
--                                        `profile_id` (AFTER INSERT trigger -> pg_net), so an
--                                        open INSERT is a push-spam / phishing channel
--   student_cases, student_case_actions,
--   student_case_alerts, student_case_events   pedagogical follow-up with risk levels
--   comunicaciones_seguimiento           guardian contact log (phones, notes)
--   registros_pendientes                 teachers' pending-attendance records
--   alumno_escolaridad                   school data of a student
--   tarea_comentarios                    comments on institutional tasks
--
-- DESIGN (least privilege; authorisation by capability, never "per role by default")
-- ---------------------------------------------------------------------------------
--  public.tiene_capacidad_estudiantil(cap)   admin, superadmin: every capability;
--      coordinacion_academica: casos_estudiantiles:gestionar, seguimiento_alumnos:gestionar,
--      tareas:comentar. `direccion` and every other role: none (owner's decision).
--      Does NOT read permisos_maestros.permisos (self-editable by each teacher).
--  Capabilities admin/superadmin only: postulantes:gestionar, matricula:gestionar,
--      notificaciones:administrar.
--
--  student_cases / _actions / _alerts / _events : read = gestores + `direccion` (read only);
--      write = casos_estudiantiles:gestionar. _events and _actions are append-only (no
--      UPDATE/DELETE grant), cases and alerts have no DELETE grant: no application flow deletes.
--  comunicaciones_seguimiento : read = same readers; write/delete = seguimiento_alumnos:gestionar.
--  postulantes : read = admin, superadmin, direccion, coordinacion, and teachers (the enrolment
--      wizard of the teacher portal preloads applicants); UPDATE/DELETE = postulantes:gestionar.
--      Teachers mark an applicant as enrolled only through the new RPC
--      public.marcar_postulante_inscrito(postulante, alumno) which can touch estado/alumno_id only.
--      INSERT stays closed to the API (the sync edge function uses service_role).
--  alumnos_programas, alumno_escolaridad : read = institutional staff (admin, superadmin,
--      direccion, coordinacion, finanzas, operaciones, teachers); anon and student/guardian
--      accounts lose read; write = matricula:gestionar (no client code writes them today; the
--      enrolment RPCs are SECURITY DEFINER and unaffected).
--  notificaciones : read/update(estado, leida_en)/delete = own rows (profile_id = auth.uid()) or
--      notificaciones:administrar; INSERT = notificaciones:administrar, or a teacher notifying
--      management (profile_id NULL or an admin/direccion/coordinacion profile, tipo 'sistema'),
--      which is the absence-request flow. UPDATE is column-restricted: a user can only flip
--      estado / leida_en, never rewrite titulo/mensaje/deep_link.
--  registros_pendientes : SELECT only (admin dashboard; teacher sees own or of a class he teaches).
--      Writers are service_role (edge functions), cron and SECURITY DEFINER functions.
--  tarea_comentarios : read = readers above; INSERT = tareas:comentar with autor_id NULL or
--      autor_id = auth.uid() (no impersonation); comments are immutable from the API.
--
--  Every table: REVOKE ALL FROM anon, authenticated, then GRANT only what the policies use
--  (no TRUNCATE/REFERENCES/TRIGGER). service_role, the table owner (cron, triggers, SECURITY
--  DEFINER functions) are untouched.
--
-- NOT TOUCHED: the other 36 tables of the inventory, SECURITY DEFINER functions executable by anon
-- (R2 follow-up), views, storage, edge functions.
--
-- ROLLBACK: supabase/rollback/20261020120000_restrict_authenticated_write_student_data_block1.rollback.sql
-- TESTS   : supabase/tests/authenticated-wide-open/ (npm run test:db:authenticated-wide-open)
--
-- POLICY-EXCEPTION R3: no table is created; the eleven tables predate R3 and carry no institucion_id.
--   They are paid for in the multi-institution backlog, not here.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 0. Helpers ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.tiene_capacidad_estudiantil(p_capacidad text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    soi_security.has_role(ARRAY['admin', 'superadmin'])
    OR (soi_security.has_role(ARRAY['coordinacion_academica'])
        AND p_capacidad IN ('casos_estudiantiles:gestionar', 'seguimiento_alumnos:gestionar', 'tareas:comentar'))
$$;

COMMENT ON FUNCTION public.tiene_capacidad_estudiantil(text) IS
  'Capability check for student-data writes. admin/superadmin: all (casos_estudiantiles:gestionar, seguimiento_alumnos:gestionar, tareas:comentar, postulantes:gestionar, matricula:gestionar, notificaciones:administrar). coordinacion_academica: the first three. No other role (not direccion, not maestro). Never reads permisos_maestros.';

-- Read access to follow-up data (cases, contact log, task comments): managers + direccion (read only).
CREATE OR REPLACE FUNCTION public.puede_leer_seguimiento_estudiantil()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'coordinacion_academica', 'direccion'])
$$;

-- Institutional staff: may read enrolment/school data. Teachers count through maestro_actual()
-- (same criterion as the class-record policies), so a teacher whose profile.activo flag is false
-- but who still teaches keeps the lists he sees today.
CREATE OR REPLACE FUNCTION public.es_personal_institucional()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion', 'coordinacion_academica', 'finanzas', 'operaciones'])
      OR public.maestro_actual() IS NOT NULL
$$;

-- Applicants may be read by management and by teachers (enrolment wizard).
CREATE OR REPLACE FUNCTION public.puede_leer_postulantes()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion', 'coordinacion_academica'])
      OR public.maestro_actual() IS NOT NULL
$$;

-- Is this profile a management account that teachers may notify (absence requests)?
CREATE OR REPLACE FUNCTION public.es_perfil_directivo(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
     WHERE p.id = p_profile_id
       AND p.rol IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica')
       AND p.estado = 'activo' AND p.activo IS TRUE)
$$;

-- A pending-attendance record is visible to its teacher or to the titular/suplente of its class.
CREATE OR REPLACE FUNCTION public.puede_ver_registro_pendiente(p_maestro_id uuid, p_sesion_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.tiene_capacidad_estudiantil('notificaciones:administrar')
      OR (p_maestro_id IS NOT NULL AND p_maestro_id = public.maestro_actual())
      OR (p_sesion_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.sesiones_clase s
             WHERE s.id = p_sesion_id AND public.maestro_en_clase(s.clase_id)))
$$;

-- Teachers mark an applicant as enrolled (the enrolment wizard): estado and alumno_id only.
CREATE OR REPLACE FUNCTION public.marcar_postulante_inscrito(p_postulante_id uuid, p_alumno_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_alumno_actual uuid;
BEGIN
  IF NOT (soi_security.has_role(ARRAY['admin', 'superadmin', 'coordinacion_academica'])
          OR public.maestro_actual() IS NOT NULL) THEN
    RAISE EXCEPTION 'not authorised to enrol applicants' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.alumnos WHERE id = p_alumno_id) THEN
    RAISE EXCEPTION 'unknown alumno %', p_alumno_id USING ERRCODE = '23503';
  END IF;
  SELECT alumno_id INTO v_alumno_actual FROM public.postulantes WHERE id = p_postulante_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'unknown postulante %', p_postulante_id USING ERRCODE = 'P0002';
  END IF;
  IF v_alumno_actual IS NOT NULL AND v_alumno_actual <> p_alumno_id THEN
    RAISE EXCEPTION 'postulante already linked to another alumno' USING ERRCODE = '23505';
  END IF;
  UPDATE public.postulantes
     SET estado = 'inscrito', alumno_id = p_alumno_id, updated_at = now()
   WHERE id = p_postulante_id;
END
$$;

COMMENT ON FUNCTION public.marcar_postulante_inscrito(uuid, uuid) IS
  'Marks an applicant as enrolled and links the created alumno. Callable by admin/superadmin/coordinacion_academica and by teachers; touches estado, alumno_id, updated_at only.';

REVOKE ALL ON FUNCTION public.tiene_capacidad_estudiantil(text)               FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.puede_leer_seguimiento_estudiantil()            FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.es_personal_institucional()                      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.puede_leer_postulantes()                         FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.es_perfil_directivo(uuid)                        FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.puede_ver_registro_pendiente(uuid, uuid)         FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.marcar_postulante_inscrito(uuid, uuid)           FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tiene_capacidad_estudiantil(text)            TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_leer_seguimiento_estudiantil()         TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.es_personal_institucional()                   TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_leer_postulantes()                      TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.es_perfil_directivo(uuid)                     TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.puede_ver_registro_pendiente(uuid, uuid)      TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.marcar_postulante_inscrito(uuid, uuid)        TO authenticated, service_role;

-- ── 1. Pedagogical follow-up: student_cases and children ────────────────────

-- student_cases
DROP POLICY IF EXISTS rls_student_cases_all          ON public.student_cases;
DROP POLICY IF EXISTS student_cases_read             ON public.student_cases;
DROP POLICY IF EXISTS student_cases_gestor_insert    ON public.student_cases;
DROP POLICY IF EXISTS student_cases_gestor_update    ON public.student_cases;
CREATE POLICY student_cases_read ON public.student_cases
  FOR SELECT TO authenticated USING (public.puede_leer_seguimiento_estudiantil());
CREATE POLICY student_cases_gestor_insert ON public.student_cases
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'));
CREATE POLICY student_cases_gestor_update ON public.student_cases
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'))
  WITH CHECK (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'));
REVOKE ALL ON public.student_cases FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_cases TO authenticated;

-- student_case_actions (append-only from the API)
DROP POLICY IF EXISTS rls_student_case_actions_all       ON public.student_case_actions;
DROP POLICY IF EXISTS student_case_actions_read          ON public.student_case_actions;
DROP POLICY IF EXISTS student_case_actions_gestor_insert ON public.student_case_actions;
CREATE POLICY student_case_actions_read ON public.student_case_actions
  FOR SELECT TO authenticated USING (public.puede_leer_seguimiento_estudiantil());
CREATE POLICY student_case_actions_gestor_insert ON public.student_case_actions
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'));
REVOKE ALL ON public.student_case_actions FROM anon, authenticated;
GRANT SELECT, INSERT ON public.student_case_actions TO authenticated;

-- student_case_events (append-only audit trail)
DROP POLICY IF EXISTS rls_student_case_events_all        ON public.student_case_events;
DROP POLICY IF EXISTS student_case_events_read           ON public.student_case_events;
DROP POLICY IF EXISTS student_case_events_gestor_insert  ON public.student_case_events;
CREATE POLICY student_case_events_read ON public.student_case_events
  FOR SELECT TO authenticated USING (public.puede_leer_seguimiento_estudiantil());
CREATE POLICY student_case_events_gestor_insert ON public.student_case_events
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'));
REVOKE ALL ON public.student_case_events FROM anon, authenticated;
GRANT SELECT, INSERT ON public.student_case_events TO authenticated;

-- student_case_alerts
DROP POLICY IF EXISTS rls_student_case_alerts_all        ON public.student_case_alerts;
DROP POLICY IF EXISTS student_case_alerts_read           ON public.student_case_alerts;
DROP POLICY IF EXISTS student_case_alerts_gestor_insert  ON public.student_case_alerts;
DROP POLICY IF EXISTS student_case_alerts_gestor_update  ON public.student_case_alerts;
CREATE POLICY student_case_alerts_read ON public.student_case_alerts
  FOR SELECT TO authenticated USING (public.puede_leer_seguimiento_estudiantil());
CREATE POLICY student_case_alerts_gestor_insert ON public.student_case_alerts
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'));
CREATE POLICY student_case_alerts_gestor_update ON public.student_case_alerts
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'))
  WITH CHECK (public.tiene_capacidad_estudiantil('casos_estudiantiles:gestionar'));
REVOKE ALL ON public.student_case_alerts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_case_alerts TO authenticated;

-- ── 2. Guardian contact log: comunicaciones_seguimiento ─────────────────────
DROP POLICY IF EXISTS com_seg_select_authenticated        ON public.comunicaciones_seguimiento;
DROP POLICY IF EXISTS com_seg_insert_authenticated        ON public.comunicaciones_seguimiento;
DROP POLICY IF EXISTS com_seg_update_authenticated        ON public.comunicaciones_seguimiento;
DROP POLICY IF EXISTS com_seg_delete_authenticated        ON public.comunicaciones_seguimiento;
DROP POLICY IF EXISTS comunicaciones_seguimiento_read     ON public.comunicaciones_seguimiento;
DROP POLICY IF EXISTS comunicaciones_seguimiento_gestor_insert ON public.comunicaciones_seguimiento;
DROP POLICY IF EXISTS comunicaciones_seguimiento_gestor_update ON public.comunicaciones_seguimiento;
DROP POLICY IF EXISTS comunicaciones_seguimiento_gestor_delete ON public.comunicaciones_seguimiento;
CREATE POLICY comunicaciones_seguimiento_read ON public.comunicaciones_seguimiento
  FOR SELECT TO authenticated USING (public.puede_leer_seguimiento_estudiantil());
CREATE POLICY comunicaciones_seguimiento_gestor_insert ON public.comunicaciones_seguimiento
  FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_estudiantil('seguimiento_alumnos:gestionar'));
CREATE POLICY comunicaciones_seguimiento_gestor_update ON public.comunicaciones_seguimiento
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_estudiantil('seguimiento_alumnos:gestionar'))
  WITH CHECK (public.tiene_capacidad_estudiantil('seguimiento_alumnos:gestionar'));
CREATE POLICY comunicaciones_seguimiento_gestor_delete ON public.comunicaciones_seguimiento
  FOR DELETE TO authenticated USING (public.tiene_capacidad_estudiantil('seguimiento_alumnos:gestionar'));
REVOKE ALL ON public.comunicaciones_seguimiento FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comunicaciones_seguimiento TO authenticated;

-- ── 3. Applicants: postulantes ──────────────────────────────────────────────
-- The three *_service_role policies are kept as they are (service_role bypasses RLS anyway).
DROP POLICY IF EXISTS postulantes_select_authenticated   ON public.postulantes;
DROP POLICY IF EXISTS postulantes_update_authenticated   ON public.postulantes;
DROP POLICY IF EXISTS postulantes_delete_authenticated   ON public.postulantes;
DROP POLICY IF EXISTS postulantes_read                   ON public.postulantes;
DROP POLICY IF EXISTS postulantes_gestor_update          ON public.postulantes;
DROP POLICY IF EXISTS postulantes_gestor_delete          ON public.postulantes;
CREATE POLICY postulantes_read ON public.postulantes
  FOR SELECT TO authenticated USING (public.puede_leer_postulantes());
CREATE POLICY postulantes_gestor_update ON public.postulantes
  FOR UPDATE TO authenticated
  USING (public.tiene_capacidad_estudiantil('postulantes:gestionar'))
  WITH CHECK (public.tiene_capacidad_estudiantil('postulantes:gestionar'));
CREATE POLICY postulantes_gestor_delete ON public.postulantes
  FOR DELETE TO authenticated USING (public.tiene_capacidad_estudiantil('postulantes:gestionar'));
REVOKE ALL ON public.postulantes FROM anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.postulantes TO authenticated;

-- ── 4. Enrolment and school data: alumnos_programas, alumno_escolaridad ─────
DROP POLICY IF EXISTS alumnos_programas_authenticated_all ON public.alumnos_programas;
DROP POLICY IF EXISTS "Enable read access for all users"  ON public.alumnos_programas;
DROP POLICY IF EXISTS alumnos_programas_admin_read        ON public.alumnos_programas;
DROP POLICY IF EXISTS alumnos_programas_read              ON public.alumnos_programas;
DROP POLICY IF EXISTS alumnos_programas_gestor_write      ON public.alumnos_programas;
CREATE POLICY alumnos_programas_read ON public.alumnos_programas
  FOR SELECT TO authenticated USING (public.es_personal_institucional());
CREATE POLICY alumnos_programas_gestor_write ON public.alumnos_programas
  FOR ALL TO authenticated
  USING (public.tiene_capacidad_estudiantil('matricula:gestionar') AND soi_security.has_role(ARRAY['admin', 'superadmin']))
  WITH CHECK (public.tiene_capacidad_estudiantil('matricula:gestionar') AND soi_security.has_role(ARRAY['admin', 'superadmin']));
REVOKE ALL ON public.alumnos_programas FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumnos_programas TO authenticated;

DROP POLICY IF EXISTS rls_alumno_escolaridad_all          ON public.alumno_escolaridad;
DROP POLICY IF EXISTS alumno_escolaridad_read             ON public.alumno_escolaridad;
DROP POLICY IF EXISTS alumno_escolaridad_gestor_write     ON public.alumno_escolaridad;
CREATE POLICY alumno_escolaridad_read ON public.alumno_escolaridad
  FOR SELECT TO authenticated USING (public.es_personal_institucional());
CREATE POLICY alumno_escolaridad_gestor_write ON public.alumno_escolaridad
  FOR ALL TO authenticated
  USING (public.tiene_capacidad_estudiantil('matricula:gestionar') AND soi_security.has_role(ARRAY['admin', 'superadmin']))
  WITH CHECK (public.tiene_capacidad_estudiantil('matricula:gestionar') AND soi_security.has_role(ARRAY['admin', 'superadmin']));
REVOKE ALL ON public.alumno_escolaridad FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumno_escolaridad TO authenticated;

-- ── 5. Notifications: notificaciones ────────────────────────────────────────
DROP POLICY IF EXISTS notificaciones_authenticated_all    ON public.notificaciones;
DROP POLICY IF EXISTS notificaciones_admin_read           ON public.notificaciones;
DROP POLICY IF EXISTS notificaciones_read                 ON public.notificaciones;
DROP POLICY IF EXISTS notificaciones_insert               ON public.notificaciones;
DROP POLICY IF EXISTS notificaciones_update               ON public.notificaciones;
DROP POLICY IF EXISTS notificaciones_delete               ON public.notificaciones;
CREATE POLICY notificaciones_read ON public.notificaciones
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.tiene_capacidad_estudiantil('notificaciones:administrar'));
CREATE POLICY notificaciones_insert ON public.notificaciones
  FOR INSERT TO authenticated
  WITH CHECK (
    public.tiene_capacidad_estudiantil('notificaciones:administrar')
    OR (public.maestro_actual() IS NOT NULL
        AND tipo = 'sistema'
        AND (profile_id IS NULL OR public.es_perfil_directivo(profile_id))));
CREATE POLICY notificaciones_update ON public.notificaciones
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR public.tiene_capacidad_estudiantil('notificaciones:administrar'))
  WITH CHECK (profile_id = auth.uid() OR public.tiene_capacidad_estudiantil('notificaciones:administrar'));
CREATE POLICY notificaciones_delete ON public.notificaciones
  FOR DELETE TO authenticated
  USING (profile_id = auth.uid() OR public.tiene_capacidad_estudiantil('notificaciones:administrar'));
REVOKE ALL ON public.notificaciones FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.notificaciones TO authenticated;
GRANT UPDATE (estado, leida_en) ON public.notificaciones TO authenticated;     -- read receipts only

-- ── 6. Pending-attendance records: registros_pendientes (read only) ─────────
DROP POLICY IF EXISTS registros_pendientes_authenticated_all ON public.registros_pendientes;
DROP POLICY IF EXISTS registros_pendientes_admin_read        ON public.registros_pendientes;
DROP POLICY IF EXISTS registros_pendientes_read              ON public.registros_pendientes;
CREATE POLICY registros_pendientes_read ON public.registros_pendientes
  FOR SELECT TO authenticated USING (public.puede_ver_registro_pendiente(maestro_id, sesion_clase_id));
REVOKE ALL ON public.registros_pendientes FROM anon, authenticated;
GRANT SELECT ON public.registros_pendientes TO authenticated;

-- ── 7. Task comments: tarea_comentarios ─────────────────────────────────────
DROP POLICY IF EXISTS tc_auth_all                         ON public.tarea_comentarios;
DROP POLICY IF EXISTS tarea_comentarios_read              ON public.tarea_comentarios;
DROP POLICY IF EXISTS tarea_comentarios_gestor_insert     ON public.tarea_comentarios;
CREATE POLICY tarea_comentarios_read ON public.tarea_comentarios
  FOR SELECT TO authenticated USING (public.puede_leer_seguimiento_estudiantil());
CREATE POLICY tarea_comentarios_gestor_insert ON public.tarea_comentarios
  FOR INSERT TO authenticated
  WITH CHECK (public.tiene_capacidad_estudiantil('tareas:comentar')
              AND (autor_id IS NULL OR autor_id = auth.uid()));
REVOKE ALL ON public.tarea_comentarios FROM anon, authenticated;
GRANT SELECT, INSERT ON public.tarea_comentarios TO authenticated;

-- ── 8. Self-check: abort the whole migration if anything stayed open ────────
DO $$
DECLARE
  v_tables constant text[] := ARRAY[
    'alumno_escolaridad', 'alumnos_programas', 'comunicaciones_seguimiento', 'notificaciones',
    'postulantes', 'registros_pendientes', 'student_case_actions', 'student_case_alerts',
    'student_case_events', 'student_cases', 'tarea_comentarios'];
  v_bad text;
BEGIN
  -- anon: no privilege of any kind
  SELECT string_agg(t || ':' || p, ', ') INTO v_bad
  FROM unnest(v_tables) AS t,
       unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p
  WHERE has_table_privilege('anon', format('public.%I', t), p);
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

  -- no policy (any command) for anon/public
  SELECT string_agg(tablename || '.' || policyname, ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = ANY (v_tables)
    AND roles && ARRAY['public', 'anon']::name[];
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'policies still target anon/public: %', v_bad;
  END IF;

  -- no unconditional permissive policy for anyone but service_role (read or write)
  SELECT string_agg(tablename || '.' || policyname, ', ') INTO v_bad
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = ANY (v_tables)
    AND permissive = 'PERMISSIVE'
    AND NOT (roles = ARRAY['service_role']::name[])
    AND coalesce(qual, 'true') IN ('true', '(true)')
    AND coalesce(with_check, qual, 'true') IN ('true', '(true)');
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'unconditional policies remain: %', v_bad;
  END IF;
END $$;

COMMIT;
