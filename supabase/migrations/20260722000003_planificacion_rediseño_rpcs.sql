-- ============================================================================
-- 📦 ARCHIVADO / OMITIDO DE DESPLIEGUE
-- MIGRACION: Rediseño Planificación — RPCs
-- Fecha: 2026-07-22
-- Razón de Omisión:
--   1. Depende del modelo de bridge class_curriculum_plan omitido.
-- ============================================================================

-- ============================================================================
-- 1. fn_obtener_ruta_por_clase
-- Resuelve la ruta activa de una clase via class_curriculum_plan.
-- Reemplaza el hack de _resolveRouteVersionIdForClase().
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_obtener_ruta_por_clase(p_clase_id UUID)
RETURNS TABLE(
  route_version_id UUID,
  estado TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ccp.route_version_id,
    ccp.estado,
    ccp.created_at
  FROM public.class_curriculum_plan ccp
  WHERE ccp.clase_id = p_clase_id
    AND ccp.estado = 'activo'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. fn_evaluacion_indicadores_por_clase
-- Retorna el progreso de cada alumno en cada indicador de una clase.
-- Dashboard de progreso multi-alumno.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_evaluacion_indicadores_por_clase(p_clase_id UUID)
RETURNS TABLE(
  alumno_id UUID,
  alumno_nombre TEXT,
  total_indicadores BIGINT,
  dominados BIGINT,
  en_progreso BIGINT,
  inician BIGINT,
  sin_evaluar BIGINT,
  nota_promedio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ei.alumno_id,
    a.nombre_completo AS alumno_nombre,
    COUNT(*) AS total_indicadores,
    COUNT(*) FILTER (WHERE ei.estado = 'dominado') AS dominados,
    COUNT(*) FILTER (WHERE ei.estado = 'en_progreso') AS en_progreso,
    COUNT(*) FILTER (WHERE ei.estado = 'inicia') AS inician,
    COUNT(*) FILTER (WHERE ei.estado = 'sin_evaluar') AS sin_evaluar,
    ROUND(AVG(ei.nota), 1) AS nota_promedio
  FROM public.evaluacion_indicador ei
  JOIN public.alumnos a ON ei.alumno_id = a.id
  WHERE ei.clase_id = p_clase_id
  GROUP BY ei.alumno_id, a.nombre_completo
  ORDER BY a.nombre_completo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. fn_registrar_evaluacion_indicador
-- Registra/actualiza la evaluación de un alumno en un indicador.
-- UPSERT atómico: inserta si no existe, actualiza si ya existe.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_registrar_evaluacion_indicador(
  p_alumno_id UUID,
  p_indicator_id UUID,
  p_clase_id UUID,
  p_nota INTEGER DEFAULT NULL,
  p_estado TEXT DEFAULT 'sin_evaluar',
  p_observaciones TEXT DEFAULT NULL,
  p_evaluado_por UUID DEFAULT NULL
)
RETURNS public.evaluacion_indicador AS $$
DECLARE
  result public.evaluacion_indicador;
BEGIN
  INSERT INTO public.evaluacion_indicador (
    alumno_id, indicator_id, clase_id,
    nota, estado, observaciones, evaluado_por
  ) VALUES (
    p_alumno_id, p_indicator_id, p_clase_id,
    p_nota, p_estado, p_observaciones, p_evaluado_por
  )
  ON CONFLICT (alumno_id, indicator_id, clase_id)
  DO UPDATE SET
    nota = EXCLUDED.nota,
    estado = EXCLUDED.estado,
    observaciones = EXCLUDED.observaciones,
    evaluado_por = EXCLUDED.evaluado_por,
    fecha_evaluacion = NOW(),
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
