ALTER TABLE public.calendario_convocatoria ADD COLUMN maestro_id uuid REFERENCES public.maestros(id);
ALTER TABLE public.calendario_convocatoria DROP CONSTRAINT calendario_convocatoria_referencia_unica;
ALTER TABLE public.calendario_convocatoria ADD CONSTRAINT calendario_convocatoria_referencia_unica
  CHECK (num_nonnulls(programa_id, clase_id, alumno_id, maestro_id) = 1);

CREATE FUNCTION public.fn_publicar_convocatoria_institucional(
  p_evento_id uuid, p_afectaciones jsonb, p_convocatoria jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  evento public.calendario_institucional%ROWTYPE;
  decision jsonb;
  afectacion uuid;
  inicio date;
  fin date;
BEGIN
  SELECT * INTO STRICT evento FROM public.calendario_institucional WHERE id = p_evento_id FOR UPDATE;
  IF evento.categoria <> 'actividad_especial' OR evento.estado NOT IN ('borrador','pendiente_revision','aprobado') THEN
    RAISE EXCEPTION 'La actividad no admite publicar una convocatoria';
  END IF;
  IF evento.version IS DISTINCT FROM (p_convocatoria->>'version')::integer THEN
    RAISE EXCEPTION 'La actividad cambió. Vuelve a cargarla antes de publicar' USING ERRCODE = '40001';
  END IF;

  inicio := CASE WHEN (evento.fecha_inicio AT TIME ZONE 'UTC')::time = time '00:00'
    THEN (evento.fecha_inicio AT TIME ZONE 'UTC')::date ELSE (evento.fecha_inicio AT TIME ZONE 'America/Santo_Domingo')::date END;
  fin := CASE WHEN (evento.fecha_fin AT TIME ZONE 'UTC')::time = time '00:00'
    THEN (evento.fecha_fin AT TIME ZONE 'UTC')::date ELSE (evento.fecha_fin AT TIME ZONE 'America/Santo_Domingo')::date END;

  -- Derive occurrences on the server from the confirmed snapshot and valid schedules.
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'clase_id', clase_id, 'fecha', fecha, 'tipo_afectacion',
    CASE WHEN suspendida THEN 'suspendida' ELSE 'impartida_con_exencion' END
  )), '[]'::jsonb) INTO p_afectaciones
  FROM (
    SELECT c.id AS clase_id, d::date AS fecha,
      bool_or(coalesce(h.maestro_id,c.maestro_principal_id,c.maestro_id)::text IN
        (SELECT value FROM jsonb_array_elements_text(p_convocatoria->'maestros'))) AS suspendida,
      EXISTS (SELECT 1 FROM public.alumnos_clases i WHERE i.clase_id=c.id AND i.activo
        AND i.alumno_id::text IN (SELECT value FROM jsonb_array_elements_text(p_convocatoria->'alumnos'))) AS exenta
    FROM generate_series(inicio,fin,interval '1 day') d
    JOIN public.clase_horarios h ON lower(trim(h.dia)) = (ARRAY[
      'domingo','lunes','martes','miércoles','jueves','viernes','sábado'
    ])[extract(dow FROM d)::int+1]
    JOIN public.clases c ON c.id=h.clase_id AND c.activo
    WHERE d::date >= coalesce(c.fecha_inicio,(c.created_at AT TIME ZONE 'America/Santo_Domingo')::date,'-infinity')
      AND d::date >= coalesce(h.vigente_desde,(h.created_at AT TIME ZONE 'America/Santo_Domingo')::date,'-infinity')
      AND (h.vigente_hasta IS NULL OR d::date <= h.vigente_hasta)
    GROUP BY c.id,d::date
  ) ocurrencias WHERE suspendida OR exenta;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_afectaciones) d
    JOIN public.calendario_afectaciones_clase a
      ON a.clase_id = (d->>'clase_id')::uuid AND a.fecha = (d->>'fecha')::date AND a.vigente
    WHERE a.evento_id <> p_evento_id AND d->>'tipo_afectacion' <> 'impartida_sin_cambios'
  ) THEN RAISE EXCEPTION 'Otra actividad ya tiene una decisión vigente sobre una de estas clases'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE (s.estado IN ('registrada','cerrada') OR EXISTS (
      SELECT 1 FROM public.asistencias a WHERE a.sesion_clase_id = s.id
    ))
    AND (
      EXISTS (SELECT 1 FROM public.calendario_afectaciones_clase a
        WHERE a.evento_id=p_evento_id AND a.vigente AND a.clase_id=s.clase_id AND a.fecha=s.fecha)
      OR EXISTS (SELECT 1 FROM jsonb_array_elements(p_afectaciones) d
        WHERE (d->>'clase_id')::uuid=s.clase_id AND (d->>'fecha')::date=s.fecha
          AND d->>'tipo_afectacion' <> 'impartida_sin_cambios')
    )
  ) THEN RAISE EXCEPTION 'Hay clases con asistencia registrada. Revisa esos registros antes de publicar'; END IF;

  UPDATE public.calendario_afectaciones_clase SET vigente = false
  WHERE evento_id = p_evento_id AND vigente;

  DELETE FROM public.calendario_convocatoria WHERE evento_id = p_evento_id;
  INSERT INTO public.calendario_convocatoria(evento_id, maestro_id)
  SELECT DISTINCT p_evento_id, value::uuid FROM jsonb_array_elements_text(p_convocatoria->'maestros');
  INSERT INTO public.calendario_convocatoria(evento_id, alumno_id)
  SELECT DISTINCT p_evento_id, value::uuid FROM jsonb_array_elements_text(p_convocatoria->'alumnos');

  FOR decision IN SELECT value FROM jsonb_array_elements(p_afectaciones)
    WHERE value->>'tipo_afectacion' <> 'impartida_sin_cambios'
  LOOP
    INSERT INTO public.calendario_afectaciones_clase(evento_id, clase_id, fecha, tipo_afectacion, motivo, creado_por)
    VALUES (p_evento_id, (decision->>'clase_id')::uuid, (decision->>'fecha')::date,
      decision->>'tipo_afectacion', evento.titulo, auth.uid()) RETURNING id INTO afectacion;

    IF decision->>'tipo_afectacion' = 'impartida_con_exencion' THEN
      INSERT INTO public.calendario_exenciones_alumno(afectacion_id, alumno_id, creado_por)
      SELECT DISTINCT afectacion, c.alumno_id, auth.uid()
      FROM public.calendario_convocatoria c JOIN public.alumnos_clases i ON i.alumno_id=c.alumno_id
      WHERE c.evento_id=p_evento_id AND i.activo AND i.clase_id=(decision->>'clase_id')::uuid;
    END IF;
  END LOOP;

  UPDATE public.calendario_institucional SET estado='aprobado', aprobado_por=auth.uid(),
    aprobado_en=now(), version=version+1, updated_at=now() WHERE id=p_evento_id;
  RETURN jsonb_build_object('evento_id',p_evento_id,'estado','aprobado','version',evento.version+1);
END;
$$;
REVOKE ALL ON FUNCTION public.fn_publicar_convocatoria_institucional(uuid,jsonb,jsonb) FROM PUBLIC, anon, authenticated;

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
  IF NOT COALESCE(public.es_coordinador_acm(), false) THEN
    RAISE EXCEPTION 'Solo administradores o coordinación académica pueden aprobar actividades institucionales'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_evento FROM public.calendario_institucional WHERE id = p_evento_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Actividad % no encontrada', p_evento_id USING ERRCODE = 'P0002';
  END IF;

  IF jsonb_typeof(p_convocatoria) = 'object' THEN
    RETURN public.fn_publicar_convocatoria_institucional(p_evento_id, p_afectaciones, p_convocatoria);
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


-- The same occurrence state drives the teacher calendar and compliance reports.
DO $$
DECLARE definition text;
DECLARE anchor text := 'WHEN EXISTS (SELECT 1 FROM public.registro_exoneraciones x WHERE x.clase_id=e.clase_id';
BEGIN
  definition := pg_get_functiondef('public.fn_estado_asistencia_maestro(uuid,date,date)'::regprocedure);
  IF strpos(definition, anchor) = 0 THEN
    RAISE EXCEPTION 'No se encontró el punto de integración del estado de asistencia';
  END IF;
  EXECUTE replace(definition, anchor, 'WHEN EXISTS (
    SELECT 1 FROM public.calendario_afectaciones_clase a
    JOIN public.calendario_institucional c ON c.id = a.evento_id
    WHERE a.clase_id=e.clase_id AND a.fecha=e.fecha AND a.vigente
      AND c.estado = ''aprobado'' AND a.tipo_afectacion IN (''suspendida'',''sustituida'')
  ) THEN ''exonerada''
  ' || anchor);
END;
$$;

CREATE FUNCTION public.aplicar_convocatoria_a_asistencia() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE decision record;
BEGIN
  SELECT a.id, a.tipo_afectacion, c.titulo INTO decision
  FROM public.calendario_afectaciones_clase a
  JOIN public.calendario_institucional c ON c.id=a.evento_id
  WHERE a.clase_id=NEW.clase_id AND a.fecha=NEW.fecha AND a.vigente AND c.estado='aprobado';

  IF decision.tipo_afectacion IN ('suspendida','sustituida') THEN
    RAISE EXCEPTION 'La clase está suspendida por una actividad institucional';
  END IF;
  IF decision.tipo_afectacion='impartida_con_exencion' AND EXISTS (
    SELECT 1 FROM public.calendario_exenciones_alumno x WHERE x.afectacion_id=decision.id AND x.alumno_id=NEW.alumno_id
  ) THEN
    NEW.estado := 'justificado';
    NEW.justificacion_texto := decision.titulo;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER aplicar_convocatoria_a_asistencia BEFORE INSERT OR UPDATE OF estado ON public.asistencias
FOR EACH ROW EXECUTE FUNCTION public.aplicar_convocatoria_a_asistencia();

-- Legacy reminders must observe the same published decision.
DO $$
DECLARE definition text;
DECLARE entry record;
BEGIN
  FOR entry IN SELECT * FROM (VALUES
    ('public.fn_check_and_notify_pending_asistencias()', 'c.id', 'v_hoy'),
    ('public.generate_pending_class_notifications()', 'tcfm.clase_id', 'tcfm.fecha'),
    ('public.fn_maestros_asistencia_pendiente(text)', 'sc.clase_id', 'sc.fecha')
  ) AS targets(signature, clase, fecha)
  LOOP
    definition := pg_get_functiondef(entry.signature::regprocedure);
    EXECUTE regexp_replace(definition, 'and not exists \(select 1 from public\.registro_exoneraciones x where x\.clase_id=' || replace(entry.clase,'.','\.'), format(
      'AND NOT EXISTS (
        SELECT 1 FROM public.calendario_afectaciones_clase a
        JOIN public.calendario_institucional evento_cal ON evento_cal.id=a.evento_id
        WHERE a.clase_id=%s AND a.fecha=%s AND a.vigente AND evento_cal.estado=''aprobado''
          AND a.tipo_afectacion IN (''suspendida'',''sustituida'')
      ) AND NOT EXISTS (SELECT 1 FROM public.registro_exoneraciones x WHERE x.clase_id=%s',
      entry.clase,entry.fecha,entry.clase), 'gi');
  END LOOP;
END;
$$;
NOTIFY pgrst, 'reload schema';
