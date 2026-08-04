-- ============================================================================
-- MIGRATION: Unified academic summary for student profile
-- Fecha: 2026-08-04
-- Objetivo:
--   Exponer una única fuente oficial para el perfil académico del alumno
--   cruzando:
--     - indicator_attempts
--     - evaluacion_indicador
--   La función devuelve un JSON con métricas integradas y dos historiales
--   listos para la UI.
--
-- Seguridad:
--   - SECURITY DEFINER para poder leer evaluacion_indicador sin depender del
--     SELECT limitado por evaluado_por.
--   - Se valida acceso: admin o maestro vinculado a al menos una clase activa
--     del alumno.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_resumen_academico_integrado(
  p_alumno_id uuid,
  p_limite integer DEFAULT 25
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_autorizado boolean;
  v_result jsonb;
BEGIN
  v_autorizado := public.is_admin() OR EXISTS (
    SELECT 1
    FROM public.alumnos_clases ac
    WHERE ac.alumno_id = p_alumno_id
      AND ac.activo = true
      AND public.maestro_en_clase(ac.clase_id)
  );

  IF NOT v_autorizado THEN
    RAISE EXCEPTION 'No autorizado para consultar el perfil integrado del alumno'
      USING ERRCODE = '42501';
  END IF;

  WITH attempts AS (
    SELECT
      ia.id,
      ia.student_id,
      ia.indicator_id,
      ia.covered_by_clase_id AS clase_id,
      ia.nota,
      ia.observations,
      ia.tarea,
      ia.created_at,
      i.nombre AS indicador_nombre,
      n.name AS nodo_nombre,
      c.nombre AS clase_nombre
    FROM public.indicator_attempts ia
    LEFT JOIN public.indicators i ON i.id = ia.indicator_id
    LEFT JOIN public.nodes n ON n.id = i.node_id
    LEFT JOIN public.clases c ON c.id = ia.covered_by_clase_id
    WHERE ia.student_id = p_alumno_id
    ORDER BY ia.created_at DESC
    LIMIT GREATEST(COALESCE(p_limite, 25), 1)
  ),
  stars AS (
    SELECT
      ei.id,
      ei.alumno_id,
      ei.indicator_id,
      ei.clase_id,
      ei.nota,
      ei.estado,
      ei.observaciones,
      COALESCE(ei.fecha_evaluacion, ei.created_at) AS fecha_referencia,
      ei.created_at,
      i.nombre AS indicador_nombre,
      n.name AS nodo_nombre,
      c.nombre AS clase_nombre
    FROM public.evaluacion_indicador ei
    LEFT JOIN public.indicators i ON i.id = ei.indicator_id
    LEFT JOIN public.nodes n ON n.id = i.node_id
    LEFT JOIN public.clases c ON c.id = ei.clase_id
    WHERE ei.alumno_id = p_alumno_id
    ORDER BY COALESCE(ei.fecha_evaluacion, ei.created_at) DESC
    LIMIT GREATEST(COALESCE(p_limite, 25), 1)
  )
  SELECT jsonb_build_object(
    'alumno_id', p_alumno_id,
    'total_indicator_attempts', (SELECT count(*) FROM attempts),
    'total_indicator_attempts_with_note', (SELECT count(*) FROM attempts WHERE nota IS NOT NULL AND nota <> 0),
    'indicadores_aprobados', (SELECT count(*) FROM attempts WHERE nota >= 4),
    'promedio_indicator_attempts', (
      SELECT round(avg(nota)::numeric, 2)
      FROM attempts
      WHERE nota IS NOT NULL AND nota <> 0
    ),
    'total_star_evaluations', (SELECT count(*) FROM stars),
    'total_star_evaluations_with_note', (SELECT count(*) FROM stars WHERE nota IS NOT NULL AND nota <> 0),
    'estrellas_aprobadas', (SELECT count(*) FROM stars WHERE nota >= 4),
    'promedio_star_evaluations', (
      SELECT round(avg(nota)::numeric, 2)
      FROM stars
      WHERE nota IS NOT NULL AND nota <> 0
    ),
    'promedio_integrado', (
      SELECT round(avg(valor)::numeric, 2)
      FROM (
        SELECT nota AS valor FROM attempts WHERE nota IS NOT NULL AND nota <> 0
        UNION ALL
        SELECT nota AS valor FROM stars WHERE nota IS NOT NULL AND nota <> 0
      ) t
    ),
    'historial_indicator_attempts', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'fuente', 'indicator_attempt',
          'fuenteLabel', 'Indicador',
          'fuenteIcono', '📘',
          'indicator_id', indicator_id,
          'clase_id', clase_id,
          'clase_nombre', clase_nombre,
          'indicador_nombre', indicador_nombre,
          'nodo_nombre', nodo_nombre,
          'nota', nota,
          'observations', observations,
          'tarea', tarea,
          'created_at', created_at
        )
        ORDER BY created_at DESC
      )
      FROM attempts
    ), '[]'::jsonb),
    'historial_star_evaluations', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'fuente', 'estrella',
          'fuenteLabel', 'Estrella',
          'fuenteIcono', '⭐',
          'indicator_id', indicator_id,
          'clase_id', clase_id,
          'clase_nombre', clase_nombre,
          'indicador_nombre', indicador_nombre,
          'nodo_nombre', nodo_nombre,
          'nota', nota,
          'estado', estado,
          'observaciones', observaciones,
          'fechaReferencia', fecha_referencia,
          'created_at', created_at
        )
        ORDER BY fecha_referencia DESC
      )
      FROM stars
    ), '[]'::jsonb)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_resumen_academico_integrado(uuid, integer) TO authenticated, service_role;
