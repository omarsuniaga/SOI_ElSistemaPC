-- Amplía quién puede aprobar/rechazar actividades institucionales: hoy solo
-- es_admin() (admin/inventarista). El coordinador del programa orquestal
-- (rol coordinacion_academica) también debe poder hacerlo — es quien de
-- hecho coordina el calendario académico día a día, no solo un admin de
-- sistema. Se usa es_coordinador_acm(), ya existente y usado en otras
-- políticas del sistema, que reconoce ('admin', 'coordinacion_academica').
--
-- NOTA: esto no corrige el hallazgo ya documentado de que es_admin() no
-- reconoce 'superadmin' — sigue pendiente, fuera de alcance de este cambio.

CREATE OR REPLACE FUNCTION public.fn_aprobar_actividad_institucional(
  p_evento_id uuid,
  p_afectaciones jsonb DEFAULT '[]'::jsonb,
  p_convocatoria jsonb DEFAULT '[]'::jsonb,
  p_responsable_asistencia_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evento public.calendario_institucional%ROWTYPE;
  v_afectacion jsonb;
  v_exento text;
  v_convocado jsonb;
  v_old_id uuid;
  v_old_tipo text;
  v_new_afectacion_id uuid;
  v_count_afectaciones int := 0;
  v_count_exenciones int := 0;
  v_count_convocatoria int := 0;
BEGIN
  IF NOT public.es_coordinador_acm() THEN
    RAISE EXCEPTION 'Solo administradores o coordinación académica pueden aprobar actividades institucionales'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_evento FROM public.calendario_institucional WHERE id = p_evento_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Actividad % no encontrada', p_evento_id USING ERRCODE = 'P0002';
  END IF;

  IF v_evento.estado NOT IN ('borrador', 'pendiente_revision', 'aprobado') THEN
    RAISE EXCEPTION 'La actividad % no se puede aprobar/corregir desde su estado actual (%)',
      p_evento_id, v_evento.estado USING ERRCODE = '42501';
  END IF;

  UPDATE public.calendario_institucional
  SET estado = 'aprobado',
      aprobado_por = auth.uid(),
      aprobado_en = now(),
      version = version + 1,
      responsable_asistencia_id = COALESCE(p_responsable_asistencia_id, responsable_asistencia_id),
      updated_at = now()
  WHERE id = p_evento_id AND estado = v_evento.estado;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La actividad % fue modificada concurrentemente — aprobación abortada', p_evento_id
      USING ERRCODE = '40001';
  END IF;

  FOR v_afectacion IN SELECT * FROM jsonb_array_elements(p_afectaciones)
  LOOP
    SELECT id, tipo_afectacion INTO v_old_id, v_old_tipo
    FROM public.calendario_afectaciones_clase
    WHERE clase_id = (v_afectacion->>'clase_id')::uuid
      AND fecha = (v_afectacion->>'fecha')::date
      AND vigente;

    IF v_old_id IS NOT NULL AND v_old_tipo = (v_afectacion->>'tipo_afectacion') THEN
      v_new_afectacion_id := v_old_id;
    ELSE
      IF v_old_id IS NOT NULL THEN
        UPDATE public.calendario_afectaciones_clase SET vigente = false WHERE id = v_old_id;
      END IF;

      INSERT INTO public.calendario_afectaciones_clase (
        evento_id, clase_id, fecha, tipo_afectacion, motivo, reemplaza_a, creado_por
      ) VALUES (
        p_evento_id,
        (v_afectacion->>'clase_id')::uuid,
        (v_afectacion->>'fecha')::date,
        v_afectacion->>'tipo_afectacion',
        v_afectacion->>'motivo',
        v_old_id,
        auth.uid()
      ) RETURNING id INTO v_new_afectacion_id;

      v_count_afectaciones := v_count_afectaciones + 1;
    END IF;

    IF v_afectacion->>'tipo_afectacion' = 'impartida_con_exencion' AND v_afectacion ? 'exentos' THEN
      FOR v_exento IN SELECT * FROM jsonb_array_elements_text(v_afectacion->'exentos')
      LOOP
        INSERT INTO public.calendario_exenciones_alumno (afectacion_id, alumno_id, creado_por)
        VALUES (v_new_afectacion_id, v_exento::uuid, auth.uid())
        ON CONFLICT (afectacion_id, alumno_id) DO NOTHING;
        IF FOUND THEN
          v_count_exenciones := v_count_exenciones + 1;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  FOR v_convocado IN SELECT * FROM jsonb_array_elements(p_convocatoria)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.calendario_convocatoria c
      WHERE c.evento_id = p_evento_id
        AND c.programa_id IS NOT DISTINCT FROM NULLIF(v_convocado->>'programa_id', '')::uuid
        AND c.clase_id IS NOT DISTINCT FROM NULLIF(v_convocado->>'clase_id', '')::uuid
        AND c.alumno_id IS NOT DISTINCT FROM NULLIF(v_convocado->>'alumno_id', '')::uuid
    ) THEN
      INSERT INTO public.calendario_convocatoria (evento_id, programa_id, clase_id, alumno_id)
      VALUES (
        p_evento_id,
        NULLIF(v_convocado->>'programa_id', '')::uuid,
        NULLIF(v_convocado->>'clase_id', '')::uuid,
        NULLIF(v_convocado->>'alumno_id', '')::uuid
      );
      v_count_convocatoria := v_count_convocatoria + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'evento_id', p_evento_id,
    'estado', 'aprobado',
    'version', v_evento.version + 1,
    'afectaciones_creadas', v_count_afectaciones,
    'exenciones_creadas', v_count_exenciones,
    'convocatoria_creada', v_count_convocatoria
  );
END;
$$;

COMMENT ON FUNCTION public.fn_aprobar_actividad_institucional(uuid, jsonb, jsonb, uuid) IS
  'Aprueba (o corrige, si ya estaba aprobado) una actividad institucional y publica sus afectaciones de clase, exenciones y convocatoria en una sola transacción, incrementando version. Idempotente: reintentar con el mismo payload no duplica filas. Admin o coordinación académica vía es_coordinador_acm(). Precondición: estado en (borrador, pendiente_revision, aprobado) — rechazado/cancelado son terminales.';

REVOKE EXECUTE ON FUNCTION public.fn_aprobar_actividad_institucional(uuid, jsonb, jsonb, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_aprobar_actividad_institucional(uuid, jsonb, jsonb, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.fn_aprobar_actividad_institucional(uuid, jsonb, jsonb, uuid) TO authenticated;

-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_rechazar_actividad_institucional(
  p_evento_id uuid,
  p_motivo text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated public.calendario_institucional%ROWTYPE;
BEGIN
  IF NOT public.es_coordinador_acm() THEN
    RAISE EXCEPTION 'Solo administradores o coordinación académica pueden rechazar actividades institucionales'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.calendario_institucional
  SET estado = 'rechazado', motivo_rechazo = p_motivo, updated_at = now()
  WHERE id = p_evento_id AND estado IN ('borrador', 'pendiente_revision')
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Actividad % no encontrada o ya no está pendiente de revisión', p_evento_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object('evento_id', p_evento_id, 'estado', 'rechazado', 'motivo_rechazo', p_motivo);
END;
$$;

COMMENT ON FUNCTION public.fn_rechazar_actividad_institucional(uuid, text) IS
  'Rechaza una actividad institucional pendiente. No toca afectaciones ni métricas (§3: "las propuestas no tienen efecto"). Admin o coordinación académica vía es_coordinador_acm().';

REVOKE EXECUTE ON FUNCTION public.fn_rechazar_actividad_institucional(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_rechazar_actividad_institucional(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.fn_rechazar_actividad_institucional(uuid, text) TO authenticated;

-- ============================================================
-- RLS: calendario_institucional ya tenía un intento previo de incluir
-- coordinación (calendario_write_staff, migración 20260910170000) pero
-- comparaba contra el string 'coordinacion', que no es un rol real —
-- el rol real es 'coordinacion_academica', así que en la práctica nunca
-- aplicaba. Se reemplaza por es_coordinador_acm().
DROP POLICY IF EXISTS calendario_write_staff ON public.calendario_institucional;
CREATE POLICY calendario_write_staff ON public.calendario_institucional
  FOR ALL TO authenticated
  USING (public.es_coordinador_acm())
  WITH CHECK (public.es_coordinador_acm());

-- Tablas hijas creadas en 20260925120000: mismo criterio.
DROP POLICY IF EXISTS calendario_afectaciones_write ON public.calendario_afectaciones_clase;
CREATE POLICY calendario_afectaciones_write ON public.calendario_afectaciones_clase
  FOR ALL TO authenticated USING (public.es_coordinador_acm()) WITH CHECK (public.es_coordinador_acm());

DROP POLICY IF EXISTS calendario_exenciones_write ON public.calendario_exenciones_alumno;
CREATE POLICY calendario_exenciones_write ON public.calendario_exenciones_alumno
  FOR ALL TO authenticated USING (public.es_coordinador_acm()) WITH CHECK (public.es_coordinador_acm());

DROP POLICY IF EXISTS calendario_convocatoria_write ON public.calendario_convocatoria;
CREATE POLICY calendario_convocatoria_write ON public.calendario_convocatoria
  FOR ALL TO authenticated USING (public.es_coordinador_acm()) WITH CHECK (public.es_coordinador_acm());

DROP POLICY IF EXISTS calendario_asistencia_actividad_write ON public.calendario_asistencia_actividad;
CREATE POLICY calendario_asistencia_actividad_write ON public.calendario_asistencia_actividad
  FOR ALL TO authenticated USING (
    public.es_coordinador_acm()
    OR evento_id IN (
      SELECT id FROM public.calendario_institucional
      WHERE responsable_asistencia_id = auth.uid()
    )
  ) WITH CHECK (
    public.es_coordinador_acm()
    OR evento_id IN (
      SELECT id FROM public.calendario_institucional
      WHERE responsable_asistencia_id = auth.uid()
    )
  );
