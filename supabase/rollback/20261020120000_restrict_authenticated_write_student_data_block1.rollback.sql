-- ════════════════════════════════════════════════════════════════════════════
-- ROLLBACK of 20261020120000_restrict_authenticated_write_student_data_block1.sql
--
-- Restores the policies and ACLs captured read-only from production on 2026-10-20
-- (pg_policies / pg_class.relacl) and removes the helper functions and the RPC.
--
-- WARNING: this REOPENS the vulnerability (any signed-in account can read/write/delete the eleven
-- tables, and `anon` can read alumnos_programas). Use it only if a legitimate flow breaks and
-- cannot be fixed forward (e.g. by extending tiene_capacidad_estudiantil in a reviewed migration).
-- Idempotent: safe to run twice.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Drop every policy this migration created (and the restored names, so a second run is a no-op)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('alumno_escolaridad', 'alumnos_programas', 'comunicaciones_seguimiento', 'notificaciones',
                        'postulantes', 'registros_pendientes', 'student_case_actions', 'student_case_alerts',
                        'student_case_events', 'student_cases', 'tarea_comentarios')
      AND policyname NOT IN ('postulantes_delete_service_role', 'postulantes_insert_service_role', 'postulantes_update_service_role')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 2. Restore the original policies (verbatim from production)
CREATE POLICY rls_student_cases_all ON public.student_cases AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_student_case_actions_all ON public.student_case_actions AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_student_case_events_all ON public.student_case_events AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_student_case_alerts_all ON public.student_case_alerts AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_alumno_escolaridad_all ON public.alumno_escolaridad AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY alumnos_programas_authenticated_all ON public.alumnos_programas AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.alumnos_programas AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY alumnos_programas_admin_read ON public.alumnos_programas AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY com_seg_delete_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY com_seg_insert_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY com_seg_select_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY com_seg_update_authenticated ON public.comunicaciones_seguimiento AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY notificaciones_authenticated_all ON public.notificaciones AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY notificaciones_admin_read ON public.notificaciones AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY postulantes_delete_authenticated ON public.postulantes AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY postulantes_select_authenticated ON public.postulantes AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY postulantes_update_authenticated ON public.postulantes AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY registros_pendientes_authenticated_all ON public.registros_pendientes AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY registros_pendientes_admin_read ON public.registros_pendientes AS PERMISSIVE FOR SELECT TO public USING (es_admin());
CREATE POLICY tc_auth_all ON public.tarea_comentarios AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Restore the original ACLs: arwdDxtm for anon/authenticated (tarea_comentarios: no anon).
--    Column-level grants of the migration disappear with the REVOKE.
REVOKE ALL ON public.alumno_escolaridad, public.alumnos_programas, public.comunicaciones_seguimiento,
  public.notificaciones, public.postulantes, public.registros_pendientes, public.student_case_actions,
  public.student_case_alerts, public.student_case_events, public.student_cases, public.tarea_comentarios
  FROM anon, authenticated;
GRANT ALL ON public.alumno_escolaridad, public.alumnos_programas, public.comunicaciones_seguimiento,
  public.notificaciones, public.postulantes, public.registros_pendientes, public.student_case_actions,
  public.student_case_alerts, public.student_case_events, public.student_cases
  TO anon, authenticated;
GRANT ALL ON public.tarea_comentarios TO authenticated;

-- 4. Remove the helpers and the RPC
DROP FUNCTION IF EXISTS public.marcar_postulante_inscrito(uuid, uuid);
DROP FUNCTION IF EXISTS public.puede_ver_registro_pendiente(uuid, uuid);
DROP FUNCTION IF EXISTS public.es_perfil_directivo(uuid);
DROP FUNCTION IF EXISTS public.puede_leer_postulantes();
DROP FUNCTION IF EXISTS public.es_personal_institucional();
DROP FUNCTION IF EXISTS public.puede_leer_seguimiento_estudiantil();
DROP FUNCTION IF EXISTS public.tiene_capacidad_estudiantil(text);

COMMIT;
