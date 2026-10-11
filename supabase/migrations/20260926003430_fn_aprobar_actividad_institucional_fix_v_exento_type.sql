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
  IF NOT public.es_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden aprobar actividades institucionales'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_evento FROM public.calendario_institucional WHERE id = p_evento_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Actividad % no encontrada', p_evento_id USING ERRCODE = 'P0002';
  END IF;

  IF v_evento.estado NOT IN ('borrador', 'pendiente_revision') THEN
    RAISE EXCEPTION 'La actividad % no está pendiente de aprobación (estado actual: %)',
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
        v_count_exenciones := v_count_exenciones + 1;
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