-- R1: explicit teacher-to-Repertoire-fila authorization boundary.
-- Local migration only. Do not apply to production without explicit approval.

CREATE TABLE IF NOT EXISTS public.montaje_fila_maestros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE CASCADE,
  fila_id uuid NOT NULL REFERENCES public.montaje_filas(id) ON DELETE CASCADE,
  maestro_id uuid NOT NULL REFERENCES public.maestros(id) ON DELETE RESTRICT,
  assignment_role text NOT NULL DEFAULT 'RESPONSABLE' CHECK (assignment_role IN ('RESPONSABLE', 'ASISTENTE', 'LECTURA')),
  can_read boolean NOT NULL DEFAULT true,
  can_edit_preparation boolean NOT NULL DEFAULT false,
  can_manage_passages boolean NOT NULL DEFAULT false,
  can_manage_targets boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  valid_from date,
  valid_until date,
  created_by uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_fila_maestros_dates_valid CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from),
  CONSTRAINT montaje_fila_maestros_unique_active UNIQUE (montaje_id, fila_id, maestro_id)
);

CREATE INDEX IF NOT EXISTS idx_montaje_fila_maestros_actor ON public.montaje_fila_maestros(maestro_id, active);
CREATE INDEX IF NOT EXISTS idx_montaje_fila_maestros_scope ON public.montaje_fila_maestros(montaje_id, fila_id, active);

CREATE OR REPLACE FUNCTION public.repertoire_maestro_puede_leer_fila(p_montaje_id uuid, p_fila_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
  SELECT public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica')
    OR EXISTS (
      SELECT 1 FROM public.montaje_fila_maestros a
      WHERE a.montaje_id = p_montaje_id AND a.fila_id = p_fila_id
        AND a.maestro_id = public.maestro_actual() AND a.active AND a.can_read
        AND (a.valid_from IS NULL OR a.valid_from <= current_date)
        AND (a.valid_until IS NULL OR a.valid_until >= current_date)
    )
$$;

CREATE OR REPLACE FUNCTION public.repertoire_maestro_puede_editar_fila(p_montaje_id uuid, p_fila_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
  SELECT public.get_user_role() IN ('admin', 'superadmin', 'coordinacion_academica')
    OR EXISTS (
      SELECT 1 FROM public.montaje_fila_maestros a
      WHERE a.montaje_id = p_montaje_id AND a.fila_id = p_fila_id
        AND a.maestro_id = public.maestro_actual() AND a.active AND a.can_edit_preparation
        AND (a.valid_from IS NULL OR a.valid_from <= current_date)
        AND (a.valid_until IS NULL OR a.valid_until >= current_date)
    )
$$;

CREATE OR REPLACE FUNCTION public.repertoire_maestro_puede_editar_montage(p_montaje_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
  SELECT public.get_user_role() IN ('admin', 'superadmin', 'coordinacion_academica')
    OR EXISTS (
      SELECT 1 FROM public.montaje_fila_maestros a
      WHERE a.montaje_id = p_montaje_id AND a.maestro_id = public.maestro_actual()
        AND a.active AND a.can_manage_passages
        AND (a.valid_from IS NULL OR a.valid_from <= current_date)
        AND (a.valid_until IS NULL OR a.valid_until >= current_date)
    )
$$;

CREATE OR REPLACE FUNCTION public.repertoire_maestro_puede_leer_montage(p_montaje_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
  SELECT public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica')
    OR EXISTS (SELECT 1 FROM public.montaje_fila_maestros a WHERE a.montaje_id = p_montaje_id AND a.maestro_id = public.maestro_actual() AND a.active AND a.can_read AND (a.valid_from IS NULL OR a.valid_from <= current_date) AND (a.valid_until IS NULL OR a.valid_until >= current_date))
$$;
ALTER TABLE public.montaje_fila_maestros ENABLE ROW LEVEL SECURITY;
CREATE POLICY repertoire_fila_assignment_read ON public.montaje_fila_maestros
  FOR SELECT TO authenticated
  USING (public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica') OR maestro_id = public.maestro_actual());
CREATE POLICY repertoire_fila_assignment_manage ON public.montaje_fila_maestros
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica'))
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica'));
REVOKE INSERT, UPDATE, DELETE ON public.montaje_fila_maestros FROM authenticated;
GRANT SELECT ON public.montaje_fila_maestros TO authenticated;

-- Teachers must have explicit fila evidence; academic/admin roles retain the
-- intentionally broad academic capability. Finanzas is excluded explicitly.
DROP POLICY IF EXISTS repertoire_acm_write ON public.montaje_compases;
-- State DML is already revoked from authenticated in the atomic migration.
-- Keep read access explicit and leave all writes to the RPC.
DROP POLICY IF EXISTS repertoire_student_override_write ON public.montaje_alumno_compases;
CREATE POLICY repertoire_student_override_read_scope ON public.montaje_alumno_compases
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica')
    OR EXISTS (
      SELECT 1 FROM public.montaje_alumnos ma
      JOIN public.montaje_filas mf ON mf.id = ma.montaje_fila_id
      JOIN public.montaje_compases mc ON mc.id = montaje_compas_id
      WHERE ma.id = montaje_alumno_id
        AND public.repertoire_maestro_puede_leer_fila(mc.montaje_id, mf.id)
    )
  );

DROP POLICY IF EXISTS repertoire_preparation_history_read ON public.montaje_preparacion_historial;
CREATE POLICY repertoire_preparation_history_read_scope ON public.montaje_preparacion_historial
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica')
    OR public.repertoire_maestro_puede_leer_fila(montaje_id, montaje_fila_id)
  );

-- Passage/group edits are montage-scoped and require an explicit assignment
-- capability; event relation management remains academic/admin only.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['montaje_pasajes','montaje_pasaje_compases','montaje_grupos_compases','montaje_grupo_compases'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS repertoire_passages_acm ON public.%I', t);
  END LOOP;
END $$;
CREATE POLICY repertoire_passages_read_scope ON public.montaje_pasajes FOR SELECT TO authenticated
  USING (public.repertoire_maestro_puede_leer_montage(montaje_id));
CREATE POLICY repertoire_passages_write_scope ON public.montaje_pasajes FOR INSERT TO authenticated
  WITH CHECK (public.repertoire_maestro_puede_editar_montage(montaje_id));
CREATE POLICY repertoire_passages_update_scope ON public.montaje_pasajes FOR UPDATE TO authenticated
  USING (public.repertoire_maestro_puede_editar_montage(montaje_id)) WITH CHECK (public.repertoire_maestro_puede_editar_montage(montaje_id));

DROP POLICY IF EXISTS repertoire_targets_write ON public.montaje_targets;
CREATE POLICY repertoire_targets_write_scope ON public.montaje_targets FOR ALL TO authenticated
  USING (
    public.get_user_role() IN ('admin','superadmin','coordinacion_academica')
    OR (alcance = 'fila' AND public.repertoire_maestro_puede_editar_fila(montaje_id, montaje_fila_id))
    OR (alcance = 'student' AND EXISTS (SELECT 1 FROM public.montaje_alumnos ma JOIN public.montaje_filas mf ON mf.id = ma.montaje_fila_id WHERE ma.alumno_id = montaje_targets.alumno_id AND mf.id = montaje_targets.montaje_fila_id AND public.repertoire_maestro_puede_editar_fila(montaje_id, mf.id)))
  )
  WITH CHECK (
    public.get_user_role() IN ('admin','superadmin','coordinacion_academica')
    OR (alcance = 'fila' AND public.repertoire_maestro_puede_editar_fila(montaje_id, montaje_fila_id))
    OR (alcance = 'student' AND public.repertoire_maestro_puede_editar_fila(montaje_id, montaje_fila_id))
  );

DROP POLICY IF EXISTS repertoire_target_milestones_write ON public.montaje_target_milestones;
CREATE POLICY repertoire_target_milestones_write_scope ON public.montaje_target_milestones FOR ALL TO authenticated
  USING (public.get_user_role() IN ('admin','superadmin','coordinacion_academica') OR EXISTS (SELECT 1 FROM public.montaje_targets t WHERE t.id = target_id AND public.repertoire_maestro_puede_editar_fila(t.montaje_id, t.montaje_fila_id)))
  WITH CHECK (public.get_user_role() IN ('admin','superadmin','coordinacion_academica') OR EXISTS (SELECT 1 FROM public.montaje_targets t WHERE t.id = target_id AND public.repertoire_maestro_puede_editar_fila(t.montaje_id, t.montaje_fila_id)));

DROP POLICY IF EXISTS repertoire_event_relation_write ON public.montaje_eventos;
CREATE POLICY repertoire_event_relation_manage ON public.montaje_eventos FOR ALL TO authenticated
  USING (public.get_user_role() IN ('admin','superadmin','direccion','coordinacion_academica'))
  WITH CHECK (public.get_user_role() IN ('admin','superadmin','direccion','coordinacion_academica'));

DROP POLICY IF EXISTS repertoire_signal_delivery_read ON public.repertoire_signal_deliveries;
CREATE POLICY repertoire_signal_delivery_recipient_read ON public.repertoire_signal_deliveries FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.get_user_role() IN ('admin','superadmin','direccion','coordinacion_academica'));
CREATE POLICY repertoire_signal_delivery_recipient_ack ON public.repertoire_signal_deliveries FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR public.get_user_role() IN ('admin','superadmin'))
  WITH CHECK (profile_id = auth.uid() OR public.get_user_role() IN ('admin','superadmin'));

COMMENT ON TABLE public.montaje_fila_maestros IS 'Authoritative teacher-to-montage/fila assignment and capability boundary for Repertoire.';

-- Scope core Repertoire reads to assigned montages while retaining academic/admin breadth.
DROP POLICY IF EXISTS repertoire_acm_read ON public.montajes;
CREATE POLICY repertoire_montage_read_scope ON public.montajes FOR SELECT TO authenticated
  USING (public.repertoire_maestro_puede_leer_montage(id));
DROP POLICY IF EXISTS repertoire_acm_read ON public.montaje_secciones;
CREATE POLICY repertoire_section_read_scope ON public.montaje_secciones FOR SELECT TO authenticated
  USING (public.repertoire_maestro_puede_leer_montage(montaje_id));
DROP POLICY IF EXISTS repertoire_acm_read ON public.montaje_filas;
CREATE POLICY repertoire_fila_read_scope ON public.montaje_filas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.montaje_secciones s WHERE s.id = montaje_seccion_id AND public.repertoire_maestro_puede_leer_montage(s.montaje_id)));
DROP POLICY IF EXISTS repertoire_acm_read ON public.montaje_alumnos;
CREATE POLICY repertoire_student_assignment_read_scope ON public.montaje_alumnos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.montaje_filas f JOIN public.montaje_secciones s ON s.id = f.montaje_seccion_id WHERE f.id = montaje_fila_id AND public.repertoire_maestro_puede_leer_montage(s.montaje_id)));
DROP POLICY IF EXISTS repertoire_acm_read ON public.montaje_compases;
CREATE POLICY repertoire_measure_read_scope ON public.montaje_compases FOR SELECT TO authenticated
  USING (public.repertoire_maestro_puede_leer_montage(montaje_id));

-- Re-define the RPC after the helper exists so teachers require explicit
-- active assignment evidence for both collective and student mutations.
CREATE OR REPLACE FUNCTION public.fn_repertoire_update_preparation(
  p_montage_id uuid, p_measure_id uuid, p_new_state public.estado_preparacion,
  p_actor_id uuid, p_scope text DEFAULT 'collective', p_source text DEFAULT 'PREPARATION_MUTATION',
  p_fila_id uuid DEFAULT NULL, p_student_id uuid DEFAULT NULL, p_session_id uuid DEFAULT NULL,
  p_bulk_operation_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE previous_state public.estado_preparacion; resulting_state public.estado_preparacion; history_student_id uuid; affected integer := 0; effective_actor uuid := public.maestro_actual();
BEGIN
  IF NOT (public.get_user_department() = 'ACM' OR public.get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica'])) THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_actor_id IS DISTINCT FROM effective_actor AND public.get_user_role() NOT IN ('admin','superadmin','direccion') THEN RAISE EXCEPTION 'actor mismatch'; END IF;
  IF p_scope NOT IN ('collective', 'student') THEN RAISE EXCEPTION 'invalid scope'; END IF;
  IF public.get_user_role() NOT IN ('admin','superadmin','coordinacion_academica') THEN
    IF p_scope = 'collective' AND NOT public.repertoire_maestro_puede_editar_fila(p_montage_id, p_fila_id) THEN RAISE EXCEPTION 'fila assignment denied'; END IF;
    IF p_scope = 'student' AND NOT EXISTS (
      SELECT 1 FROM public.montaje_alumnos ma JOIN public.montaje_filas mf ON mf.id = ma.montaje_fila_id
      WHERE ma.id = p_student_id AND public.repertoire_maestro_puede_editar_fila(p_montage_id, mf.id)
    ) THEN RAISE EXCEPTION 'student fila assignment denied'; END IF;
  END IF;
  IF p_scope = 'student' THEN
    SELECT ma.alumno_id INTO history_student_id FROM public.montaje_alumnos ma WHERE ma.id = p_student_id;
    IF NOT EXISTS (SELECT 1 FROM public.montaje_alumnos ma JOIN public.montaje_filas mf ON mf.id = ma.montaje_fila_id JOIN public.montaje_secciones ms ON ms.id = mf.montaje_seccion_id JOIN public.montaje_compases mc ON mc.id = p_measure_id WHERE ma.id = p_student_id AND ms.montaje_id = p_montage_id AND mc.montaje_id = p_montage_id) THEN RAISE EXCEPTION 'student assignment outside montage'; END IF;
    SELECT estado_preparacion INTO previous_state FROM public.montaje_alumno_compases WHERE montaje_alumno_id = p_student_id AND montaje_compas_id = p_measure_id FOR UPDATE;
    IF p_new_state IS NULL THEN DELETE FROM public.montaje_alumno_compases WHERE montaje_alumno_id = p_student_id AND montaje_compas_id = p_measure_id; GET DIAGNOSTICS affected = ROW_COUNT; resulting_state := (SELECT estado_preparacion FROM public.montaje_compases WHERE id = p_measure_id); p_source := 'OVERRIDE_REMOVED';
    ELSE INSERT INTO public.montaje_alumno_compases(montaje_alumno_id, montaje_compas_id, estado_preparacion) VALUES (p_student_id, p_measure_id, p_new_state) ON CONFLICT (montaje_alumno_id, montaje_compas_id) DO UPDATE SET estado_preparacion = EXCLUDED.estado_preparacion, updated_at = now(); affected := 1; resulting_state := p_new_state; END IF;
  ELSE
    SELECT estado_preparacion INTO previous_state FROM public.montaje_compases WHERE id = p_measure_id AND montaje_id = p_montage_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'measure not found'; END IF;
    UPDATE public.montaje_compases SET estado_preparacion = p_new_state, updated_at = now() WHERE id = p_measure_id AND montaje_id = p_montage_id; GET DIAGNOSTICS affected = ROW_COUNT; resulting_state := p_new_state;
  END IF;
  IF affected = 0 THEN RAISE EXCEPTION 'zero-row mutation'; END IF;
  INSERT INTO public.montaje_preparacion_historial(montaje_id, montaje_fila_id, alumno_id, montaje_compas_id, estado_anterior, estado_nuevo, actor_maestro_id, alcance, fuente, sesion_id, operacion_masiva_id) VALUES (p_montage_id, p_fila_id, history_student_id, p_measure_id, previous_state, resulting_state, effective_actor, p_scope, p_source, p_session_id, p_bulk_operation_id);
  RETURN jsonb_build_object('affected', affected, 'measure_id', p_measure_id, 'previous_state', previous_state, 'new_state', resulting_state, 'scope', p_scope, 'bulk_operation_id', p_bulk_operation_id);
END; $$;
REVOKE ALL ON FUNCTION public.fn_repertoire_update_preparation(uuid, uuid, public.estado_preparacion, uuid, text, text, uuid, uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_repertoire_update_preparation(uuid, uuid, public.estado_preparacion, uuid, text, text, uuid, uuid, uuid, uuid) TO authenticated;