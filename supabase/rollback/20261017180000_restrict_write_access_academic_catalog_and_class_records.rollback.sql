-- ROLLBACK for 20261017180000_restrict_write_access_academic_catalog_and_class_records.sql
--
-- Restores the pre-migration state: the permissive policies on the eight tables and the full
-- table grants for anon/authenticated.
-- THIS REOPENS THE VULNERABILITY. Use it only if the migration breaks a legitimate flow that
-- cannot be fixed forward, and ship a corrected migration as soon as possible.
--
-- The recreated definitions come from the production catalog as modelled in
-- supabase/tests/anon-write-fix (schema_reference.sql + earlier migrations). Before applying the
-- migration in production, capture the real state with
-- supabase/tests/anon-write-fix/03_capture_current_state.sql and diff it against this file.
--
-- Idempotent: every statement can run twice.

BEGIN;

-- ── class_event_methodology ──
DROP POLICY IF EXISTS cem_select_all ON public.class_event_methodology;
DROP POLICY IF EXISTS cem_insert_all ON public.class_event_methodology;
DROP POLICY IF EXISTS cem_update_all ON public.class_event_methodology;
DROP POLICY IF EXISTS cem_delete_all ON public.class_event_methodology;
CREATE POLICY cem_select_all ON public.class_event_methodology FOR SELECT TO public USING (true);
CREATE POLICY cem_insert_all ON public.class_event_methodology FOR INSERT TO public WITH CHECK (true);
CREATE POLICY cem_update_all ON public.class_event_methodology FOR UPDATE TO public USING (true);
CREATE POLICY cem_delete_all ON public.class_event_methodology FOR DELETE TO public USING (true);

-- ── class_events ──
DROP POLICY IF EXISTS ce_select_all ON public.class_events;
DROP POLICY IF EXISTS ce_insert_all ON public.class_events;
DROP POLICY IF EXISTS ce_update_all ON public.class_events;
DROP POLICY IF EXISTS ce_delete_all ON public.class_events;
CREATE POLICY ce_select_all ON public.class_events FOR SELECT TO public USING (true);
CREATE POLICY ce_insert_all ON public.class_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY ce_update_all ON public.class_events FOR UPDATE TO public USING (true);
CREATE POLICY ce_delete_all ON public.class_events FOR DELETE TO public USING (true);

-- ── homework_assignments ──
DROP POLICY IF EXISTS hw_select_all ON public.homework_assignments;
DROP POLICY IF EXISTS hw_insert_all ON public.homework_assignments;
DROP POLICY IF EXISTS hw_update_all ON public.homework_assignments;
DROP POLICY IF EXISTS hw_delete_all ON public.homework_assignments;
CREATE POLICY hw_select_all ON public.homework_assignments FOR SELECT TO public USING (true);
CREATE POLICY hw_insert_all ON public.homework_assignments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY hw_update_all ON public.homework_assignments FOR UPDATE TO public USING (true);
CREATE POLICY hw_delete_all ON public.homework_assignments FOR DELETE TO public USING (true);

-- ── planned_content ──
DROP POLICY IF EXISTS planned_content_select_all ON public.planned_content;
DROP POLICY IF EXISTS planned_content_insert_all ON public.planned_content;
DROP POLICY IF EXISTS planned_content_update_all ON public.planned_content;
DROP POLICY IF EXISTS planned_content_delete_all ON public.planned_content;
CREATE POLICY planned_content_select_all ON public.planned_content FOR SELECT TO public USING (true);
CREATE POLICY planned_content_insert_all ON public.planned_content FOR INSERT TO public WITH CHECK (true);
CREATE POLICY planned_content_update_all ON public.planned_content FOR UPDATE TO public USING (true);
CREATE POLICY planned_content_delete_all ON public.planned_content FOR DELETE TO public USING (true);

-- ── horarios ──
DROP POLICY IF EXISTS "Permitir crear horarios"      ON public.horarios;
DROP POLICY IF EXISTS "Permitir actualizar horarios" ON public.horarios;
DROP POLICY IF EXISTS "Permitir eliminar horarios"   ON public.horarios;
DROP POLICY IF EXISTS horarios_authenticated_all     ON public.horarios;
CREATE POLICY "Permitir crear horarios"      ON public.horarios FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir actualizar horarios" ON public.horarios FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir eliminar horarios"   ON public.horarios FOR DELETE TO public USING (true);
CREATE POLICY horarios_authenticated_all     ON public.horarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── programas ──
DROP POLICY IF EXISTS "Permitir crear programas"      ON public.programas;
DROP POLICY IF EXISTS "Permitir actualizar programas" ON public.programas;
DROP POLICY IF EXISTS "Permitir eliminar programas"   ON public.programas;
DROP POLICY IF EXISTS programas_authenticated_all     ON public.programas;
CREATE POLICY "Permitir crear programas"      ON public.programas FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir actualizar programas" ON public.programas FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir eliminar programas"   ON public.programas FOR DELETE TO public USING (true);
CREATE POLICY programas_authenticated_all     ON public.programas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── salones ──
DROP POLICY IF EXISTS "Permitir crear salones"      ON public.salones;
DROP POLICY IF EXISTS "Permitir actualizar salones" ON public.salones;
DROP POLICY IF EXISTS "Permitir eliminar salones"   ON public.salones;
DROP POLICY IF EXISTS salones_authenticated_all     ON public.salones;
CREATE POLICY "Permitir crear salones"      ON public.salones FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir actualizar salones" ON public.salones FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir eliminar salones"   ON public.salones FOR DELETE TO public USING (true);
CREATE POLICY salones_authenticated_all     ON public.salones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── notificaciones_asistencia ──
DROP POLICY IF EXISTS hermes_update_notifications   ON public.notificaciones_asistencia;
DROP POLICY IF EXISTS portal_insert_notifications   ON public.notificaciones_asistencia;
DROP POLICY IF EXISTS portal_read_own_notifications ON public.notificaciones_asistencia;
CREATE POLICY hermes_update_notifications   ON public.notificaciones_asistencia FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY portal_insert_notifications   ON public.notificaciones_asistencia FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY portal_read_own_notifications ON public.notificaciones_asistencia FOR SELECT TO authenticated USING (true);

-- ── Remove the policies introduced by the migration ──
DROP POLICY IF EXISTS programas_read_authenticated                    ON public.programas;
DROP POLICY IF EXISTS programas_gestor_write                          ON public.programas;
DROP POLICY IF EXISTS salones_read_authenticated                      ON public.salones;
DROP POLICY IF EXISTS salones_gestor_write                            ON public.salones;
DROP POLICY IF EXISTS horarios_read_authenticated                     ON public.horarios;
DROP POLICY IF EXISTS horarios_gestor_write                           ON public.horarios;
DROP POLICY IF EXISTS class_events_read_authenticated                 ON public.class_events;
DROP POLICY IF EXISTS class_events_owner_insert                       ON public.class_events;
DROP POLICY IF EXISTS class_events_owner_update                       ON public.class_events;
DROP POLICY IF EXISTS class_events_gestor_delete                      ON public.class_events;
DROP POLICY IF EXISTS class_event_methodology_read_authenticated      ON public.class_event_methodology;
DROP POLICY IF EXISTS class_event_methodology_owner_insert            ON public.class_event_methodology;
DROP POLICY IF EXISTS class_event_methodology_owner_update            ON public.class_event_methodology;
DROP POLICY IF EXISTS class_event_methodology_gestor_delete           ON public.class_event_methodology;
DROP POLICY IF EXISTS homework_assignments_read_authenticated         ON public.homework_assignments;
DROP POLICY IF EXISTS homework_assignments_owner_insert               ON public.homework_assignments;
DROP POLICY IF EXISTS homework_assignments_owner_update               ON public.homework_assignments;
DROP POLICY IF EXISTS homework_assignments_gestor_delete              ON public.homework_assignments;
DROP POLICY IF EXISTS planned_content_read_authenticated              ON public.planned_content;
DROP POLICY IF EXISTS planned_content_owner_insert                    ON public.planned_content;
DROP POLICY IF EXISTS planned_content_owner_update                    ON public.planned_content;
DROP POLICY IF EXISTS planned_content_gestor_delete                   ON public.planned_content;
DROP POLICY IF EXISTS notificaciones_asistencia_gestor_read           ON public.notificaciones_asistencia;
DROP POLICY IF EXISTS notificaciones_asistencia_gestor_insert         ON public.notificaciones_asistencia;

-- ── Restore the Supabase legacy default grants (full table access for the API roles) ──
GRANT ALL ON public.class_event_methodology  TO anon, authenticated;
GRANT ALL ON public.class_events             TO anon, authenticated;
GRANT ALL ON public.homework_assignments     TO anon, authenticated;
GRANT ALL ON public.horarios                 TO anon, authenticated;
GRANT ALL ON public.notificaciones_asistencia TO anon, authenticated;
GRANT ALL ON public.planned_content          TO anon, authenticated;
GRANT ALL ON public.programas                TO anon, authenticated;
GRANT ALL ON public.salones                  TO anon, authenticated;

-- ── Helpers: dropped last, once no policy references them ──
DROP FUNCTION IF EXISTS public.puede_escribir_evento_clase(uuid, uuid);
DROP FUNCTION IF EXISTS public.es_gestor_academico();

COMMIT;
