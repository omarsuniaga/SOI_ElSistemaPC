-- Justifications initiated from "Clases de hoy" must always be linked to a
-- concrete session because asistencias.sesion_clase_id is NOT NULL.
CREATE OR REPLACE FUNCTION public.registrar_justificacion_asistencia(
  p_clase_id uuid,
  p_alumno_id uuid,
  p_fecha date,
  p_motivo text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_sesion_id uuid;
  v_maestro_id uuid;
  v_asistencia_id uuid;
BEGIN
  SELECT maestro_principal_id
    INTO v_maestro_id
    FROM public.clases
   WHERE id = p_clase_id;

  IF v_maestro_id IS NULL THEN
    RAISE EXCEPTION 'La clase % no tiene un maestro titular asignado', p_clase_id;
  END IF;

  -- Prefer an existing session regardless of who opened it (for example, a substitute).
  SELECT id
    INTO v_sesion_id
    FROM public.sesiones_clase
   WHERE clase_id = p_clase_id
     AND fecha = p_fecha
   ORDER BY created_at DESC
   LIMIT 1;

  -- The class/date/teacher unique constraint makes this creation idempotent.
  IF v_sesion_id IS NULL THEN
    INSERT INTO public.sesiones_clase (clase_id, maestro_id, fecha, estado, borrador)
    VALUES (p_clase_id, v_maestro_id, p_fecha, 'pendiente', false)
    ON CONFLICT ON CONSTRAINT sesiones_clase_clase_fecha_maestro_unique
    DO UPDATE SET updated_at = now()
    RETURNING id INTO v_sesion_id;
  END IF;

  INSERT INTO public.asistencias (
    sesion_clase_id,
    clase_id,
    alumno_id,
    fecha,
    estado,
    justificacion_texto
  )
  VALUES (
    v_sesion_id,
    p_clase_id,
    p_alumno_id,
    p_fecha,
    'justificado',
    nullif(btrim(p_motivo), '')
  )
  ON CONFLICT ON CONSTRAINT uk_asistencias_clase_alumno_fecha
  DO UPDATE SET
    sesion_clase_id = excluded.sesion_clase_id,
    estado = excluded.estado,
    justificacion_texto = excluded.justificacion_texto,
    updated_at = now()
  RETURNING id INTO v_asistencia_id;

  RETURN v_asistencia_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_justificacion_asistencia(uuid, uuid, date, text)
TO authenticated;
