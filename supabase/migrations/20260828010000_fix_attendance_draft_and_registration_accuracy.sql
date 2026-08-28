-- Migration: Ensure attendance is marked registered when attendance records exist
-- Fixes issue where draft sessions with recorded attendances were falsely flagged as pending/borrador.

CREATE OR REPLACE FUNCTION public.fn_estado_asistencia_maestro(
  p_maestro_id uuid,
  p_desde date,
  p_hasta date
)
RETURNS TABLE (
  fecha date,
  clase_id uuid,
  clase_nombre text,
  maestro_id uuid,
  hora_inicio time,
  hora_fin time,
  sesion_id uuid,
  estado text,
  dias_atraso integer,
  asistencia_completa boolean,
  cubierta_emergente boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_maestro_id uuid;
  v_es_admin boolean := COALESCE(public.is_admin(), false);
  v_periodo record;
  v_desde date;
  v_hasta date;
  v_now_local timestamp := now() AT TIME ZONE 'America/Santo_Domingo';
  v_hoy date := v_now_local::date;
  v_ahora time := v_now_local::time;
BEGIN
  IF p_maestro_id IS NULL OR p_desde IS NULL OR p_hasta IS NULL OR p_desde > p_hasta THEN
    RAISE EXCEPTION 'Maestro y rango de fechas válidos son requeridos';
  END IF;

  IF p_hasta - p_desde > 93 THEN
    RAISE EXCEPTION 'El rango máximo de consulta es 93 días';
  END IF;

  SELECT m.id INTO v_actor_maestro_id
  FROM public.maestros m
  WHERE m.user_id = auth.uid()
  LIMIT 1;

  IF NOT v_es_admin AND v_actor_maestro_id IS DISTINCT FROM p_maestro_id THEN
    RAISE EXCEPTION 'No tiene permiso para consultar este maestro';
  END IF;

  SELECT p.fecha_inicio, p.fecha_fin INTO v_periodo
  FROM public.periodos p
  WHERE p.activo = true AND COALESCE(p.cerrado, false) = false
  ORDER BY p.fecha_inicio DESC
  LIMIT 1;

  v_desde := p_desde;
  v_hasta := p_hasta;
  IF FOUND THEN
    v_desde := GREATEST(v_desde, v_periodo.fecha_inicio);
    v_hasta := LEAST(v_hasta, v_periodo.fecha_fin);
  END IF;
  IF v_desde > v_hasta THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH fechas AS (
    SELECT d::date AS fecha
    FROM generate_series(v_desde, v_hasta, interval '1 day') AS d
    WHERE public.fn_es_dia_lectivo(d::date)
  ), programadas AS (
    SELECT
      f.fecha,
      c.id AS clase_id,
      c.nombre AS clase_nombre,
      p_maestro_id AS maestro_id,
      h.hora_inicio,
      h.hora_fin
    FROM fechas f
    JOIN public.clase_horarios h
      ON lower(trim(h.dia)) = CASE extract(dow FROM f.fecha)
        WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes'
        WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes'
        WHEN 6 THEN 'sábado'
      END
    JOIN public.clases c ON c.id = h.clase_id
    WHERE COALESCE(c.activo, true)
      AND (
        c.maestro_principal_id = p_maestro_id
        OR c.maestro_suplente_id = p_maestro_id
        OR c.maestro_id = p_maestro_id
        OR h.maestro_id = p_maestro_id
      )
  ), evaluadas AS (
    SELECT
      p.*,
      s.id AS sesion_id,
      s.estado AS sesion_estado,
      s.borrador,
      s.emergente_id,
      s.asistencia AS asistencia_json,
      COALESCE(a.total, 0) AS total_marcas
    FROM programadas p
    LEFT JOIN LATERAL (
      SELECT sc.*
      FROM public.sesiones_clase sc
      WHERE (sc.maestro_id = p.maestro_id OR sc.clase_id = p.clase_id)
        AND sc.clase_id = p.clase_id
        AND sc.fecha = p.fecha
      ORDER BY
        CASE WHEN (sc.estado IN ('registrada', 'cerrada') OR (jsonb_typeof(sc.asistencia) = 'array' AND jsonb_array_length(sc.asistencia) > 0)) AND NOT COALESCE(sc.borrador, false) THEN 0 ELSE 1 END,
        sc.updated_at DESC NULLS LAST,
        sc.created_at DESC NULLS LAST
      LIMIT 1
    ) s ON true
    LEFT JOIN LATERAL (
      SELECT count(*)::integer AS total
      FROM public.asistencias a
      WHERE (s.id IS NOT NULL AND a.sesion_clase_id = s.id)
         OR (a.clase_id = p.clase_id AND a.fecha = p.fecha)
    ) a ON true
  )
  SELECT
    e.fecha,
    e.clase_id,
    e.clase_nombre,
    e.maestro_id,
    e.hora_inicio,
    e.hora_fin,
    e.sesion_id,
    CASE
      WHEN e.emergente_id IS NOT NULL THEN 'cubierta_emergente'
      WHEN e.total_marcas > 0
        OR (e.sesion_id IS NOT NULL AND (
          (jsonb_typeof(e.asistencia_json) = 'array' AND jsonb_array_length(e.asistencia_json) > 0)
          OR (NOT COALESCE(e.borrador, false) AND e.sesion_estado IN ('registrada', 'cerrada'))
        )) THEN 'registrada'
      WHEN e.fecha > v_hoy
        OR (e.fecha = v_hoy AND v_ahora < e.hora_fin) THEN 'futura'
      WHEN e.fecha >= v_hoy - 7 THEN 'pendiente'
      ELSE 'vencida'
    END AS estado,
    GREATEST(v_hoy - e.fecha, 0)::integer AS dias_atraso,
    (e.total_marcas > 0
      OR (e.sesion_id IS NOT NULL AND (
        (jsonb_typeof(e.asistencia_json) = 'array' AND jsonb_array_length(e.asistencia_json) > 0)
        OR (NOT COALESCE(e.borrador, false) AND e.sesion_estado IN ('registrada', 'cerrada'))
      ))
    ) AS asistencia_completa,
    e.emergente_id IS NOT NULL AS cubierta_emergente
  FROM evaluadas e
  ORDER BY e.fecha, e.hora_inicio, e.clase_nombre;
END;
$$;

NOTIFY pgrst, 'reload schema';
