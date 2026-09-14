-- Phase 11 integrity boundary. PostgreSQL function is atomic by transaction semantics.
-- Local migration only; never apply to production without explicit approval.
CREATE OR REPLACE FUNCTION public.fn_repertoire_update_preparation(
  p_montage_id uuid, p_measure_id uuid, p_new_state public.estado_preparacion,
  p_actor_id uuid, p_scope text DEFAULT 'collective', p_source text DEFAULT 'PREPARATION_MUTATION',
  p_fila_id uuid DEFAULT NULL, p_student_id uuid DEFAULT NULL, p_session_id uuid DEFAULT NULL,
  p_bulk_operation_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE previous_state public.estado_preparacion; resulting_state public.estado_preparacion; affected integer := 0; effective_actor uuid := public.maestro_actual();
BEGIN
  IF NOT (public.get_user_department() = 'ACM' OR public.get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica'])) THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF p_actor_id IS DISTINCT FROM effective_actor AND public.get_user_role() NOT IN ('admin','superadmin','direccion') THEN RAISE EXCEPTION 'actor mismatch'; END IF;
  IF p_scope NOT IN ('collective', 'student') THEN RAISE EXCEPTION 'invalid scope'; END IF;
  IF p_scope = 'student' THEN
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
  INSERT INTO public.montaje_preparacion_historial(montaje_id, montaje_fila_id, alumno_id, montaje_compas_id, estado_anterior, estado_nuevo, actor_maestro_id, alcance, fuente, sesion_id, operacion_masiva_id) VALUES (p_montage_id, p_fila_id, p_student_id, p_measure_id, previous_state, resulting_state, effective_actor, p_scope, p_source, p_session_id, p_bulk_operation_id);
  RETURN jsonb_build_object('affected', affected, 'measure_id', p_measure_id, 'previous_state', previous_state, 'new_state', resulting_state, 'scope', p_scope, 'bulk_operation_id', p_bulk_operation_id);
END; $$;
