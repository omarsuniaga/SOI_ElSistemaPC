-- Migration: Create RPCs for Monthly and Semester Academic Reports
-- Timestamp: 20260826_000000
-- Purpose: Provide high-performance aggregated academic metrics for Director and Admin dashboard

-- =====================================================================
-- 1. RPC: Resumen Académico Mensual
-- =====================================================================
CREATE OR REPLACE FUNCTION get_resumen_academico_mensual(
  p_periodo_id UUID DEFAULT NULL,
  p_mes INT DEFAULT NULL,
  p_anio INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mes INT;
  v_anio INT;
  v_fecha_inicio DATE;
  v_fecha_fin DATE;
  v_resumen_general JSONB;
  v_patron_semanal JSONB;
  v_alumnos_riesgo JSONB;
  v_cumplimiento_docente JSONB;
  v_efectividad_clases JSONB;
  v_dia_pico TEXT;
  v_dia_valle TEXT;
BEGIN
  -- Determinar mes y año objetivo
  v_mes := COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE)::INT);
  v_anio := COALESCE(p_anio, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
  
  v_fecha_inicio := MAKE_DATE(v_anio, v_mes, 1);
  v_fecha_fin := (v_fecha_inicio + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- 1. Resumen General de Asistencias
  SELECT jsonb_build_object(
    'mes', v_mes,
    'anio', v_anio,
    'fecha_inicio', v_fecha_inicio,
    'fecha_fin', v_fecha_fin,
    'total_registros', COUNT(*),
    'presentes', COUNT(*) FILTER (WHERE a.estado = 'presente'),
    'tardes', COUNT(*) FILTER (WHERE a.estado = 'tarde'),
    'ausentes', COUNT(*) FILTER (WHERE a.estado = 'ausente'),
    'justificados', COUNT(*) FILTER (WHERE a.estado = 'justificado'),
    'tasa_asistencia_pct', ROUND(
      (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
    ),
    'ratio_justificacion_pct', ROUND(
      (COUNT(*) FILTER (WHERE a.estado = 'justificado')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'justificado')), 0)) * 100, 2
    )
  )
  INTO v_resumen_general
  FROM asistencias a
  WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND (p_periodo_id IS NULL OR a.periodo_id = p_periodo_id);

  -- 2. Patrón Semanal (Día Pico vs. Día Valle)
  WITH dias_stats AS (
    SELECT
      EXTRACT(DOW FROM a.fecha) AS dow,
      CASE EXTRACT(DOW FROM a.fecha)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
      END AS dia_nombre,
      COUNT(*) AS total_dia,
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde')) AS presentes_dia,
      COUNT(*) FILTER (WHERE a.estado = 'ausente') AS ausentes_dia,
      ROUND((COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) AS tasa_asistencia_dia
    FROM asistencias a
    WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
      AND (p_periodo_id IS NULL OR a.periodo_id = p_periodo_id)
    GROUP BY dow, dia_nombre
  ),
  ranked_dias AS (
    SELECT *,
      ROW_NUMBER() OVER (ORDER BY tasa_asistencia_dia DESC NULLS LAST) AS rank_max,
      ROW_NUMBER() OVER (ORDER BY tasa_asistencia_dia ASC NULLS LAST) AS rank_min
    FROM dias_stats
    WHERE total_dia > 0
  )
  SELECT 
    COALESCE(jsonb_agg(to_jsonb(dias_stats) ORDER BY dow), '[]'::jsonb),
    (SELECT dia_nombre FROM ranked_dias WHERE rank_max = 1 LIMIT 1),
    (SELECT dia_nombre FROM ranked_dias WHERE rank_min = 1 LIMIT 1)
  INTO v_patron_semanal, v_dia_pico, v_dia_valle
  FROM dias_stats;

  -- 3. Alumnos en Riesgo (>= 2 ausencias en el mes)
  WITH riesgo AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.representante_nombre,
      al.representante_tlf,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'justificado')) AS total_inasistencias,
      COUNT(*) FILTER (WHERE a.estado = 'ausente') AS ausencias_injustificadas,
      COUNT(*) FILTER (WHERE a.estado = 'justificado') AS ausencias_justificadas
    FROM asistencias a
    JOIN alumnos al ON al.id = a.alumno_id
    WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
      AND (p_periodo_id IS NULL OR a.periodo_id = p_periodo_id)
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.representante_nombre, al.representante_tlf
    HAVING COUNT(*) FILTER (WHERE a.estado = 'ausente') >= 2
    ORDER BY ausencias_injustificadas DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(riesgo)), '[]'::jsonb)
  INTO v_alumnos_riesgo
  FROM riesgo;

  -- 4. Cumplimiento Docente del Mes
  WITH docente_stats AS (
    SELECT
      m.id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      m.especialidad_principal AS especialidad,
      COUNT(s.id) AS total_sesiones,
      COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')) AS sesiones_cerradas,
      COUNT(s.id) FILTER (WHERE s.estado IN ('programada', 'abierta', 'pendiente', 'atrasada')) AS sesiones_pendientes,
      ROUND(
        (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 2
      ) AS cumplimiento_pct,
      COUNT(obs.id) AS sesiones_con_observaciones
    FROM maestros m
    JOIN clases c ON c.maestro_id = m.id
    JOIN sesiones_clase s ON s.clase_id = c.id
    LEFT JOIN observaciones_sesion obs ON obs.sesion_clase_id = s.id
    WHERE s.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
      AND (p_periodo_id IS NULL OR s.periodo_id = p_periodo_id)
    GROUP BY m.id, m.nombre_completo, m.especialidad_principal
    ORDER BY cumplimiento_pct ASC, total_sesiones DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(docente_stats)), '[]'::jsonb)
  INTO v_cumplimiento_docente
  FROM docente_stats;

  -- 5. Efectividad de Clases
  SELECT jsonb_build_object(
    'total_programadas', COUNT(*),
    'dictadas', COUNT(*) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')),
    'pendientes', COUNT(*) FILTER (WHERE s.estado IN ('programada', 'abierta', 'pendiente', 'atrasada')),
    'canceladas', COUNT(*) FILTER (WHERE s.estado = 'cancelada'),
    'tasa_efectividad_pct', ROUND(
      (COUNT(*) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
    )
  )
  INTO v_efectividad_clases
  FROM sesiones_clase s
  WHERE s.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND (p_periodo_id IS NULL OR s.periodo_id = p_periodo_id);

  RETURN jsonb_build_object(
    'status', 'success',
    'tipo', 'mensual',
    'resumen_general', v_resumen_general,
    'patron_semanal', jsonb_build_object(
      'dias', v_patron_semanal,
      'dia_pico_asistencia', COALESCE(v_dia_pico, 'N/A'),
      'dia_valle_asistencia', COALESCE(v_dia_valle, 'N/A')
    ),
    'alumnos_en_riesgo', v_alumnos_riesgo,
    'cumplimiento_docente', v_cumplimiento_docente,
    'efectividad_clases', v_efectividad_clases
  );
END;
$$;


-- =====================================================================
-- 2. RPC: Informe Académico Semestral Consolidado
-- =====================================================================
CREATE OR REPLACE FUNCTION get_informe_academico_semestral(
  p_periodo_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_periodo_id UUID;
  v_periodo RECORD;
  v_evolucion_mensual JSONB;
  v_cuadro_honor JSONB;
  v_ranking_ausencias JSONB;
  v_causas_justificaciones JSONB;
  v_retencion_catedra JSONB;
  v_alumnos_destacados JSONB;
  v_evaluacion_docente JSONB;
BEGIN
  -- Determinar período académico objetivo
  IF p_periodo_id IS NOT NULL THEN
    v_periodo_id := p_periodo_id;
  ELSE
    SELECT id INTO v_periodo_id
    FROM periodos
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  SELECT * INTO v_periodo FROM periodos WHERE id = v_periodo_id;

  -- 1. Evolución Mensual de Asistencias en el Semestre
  WITH meses_agg AS (
    SELECT
      EXTRACT(YEAR FROM a.fecha) AS anio,
      EXTRACT(MONTH FROM a.fecha) AS mes,
      TO_CHAR(a.fecha, 'TMMonth YYYY') AS mes_nombre,
      COUNT(*) AS total_registros,
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde')) AS presentes_total,
      COUNT(*) FILTER (WHERE a.estado = 'ausente') AS ausentes_total,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS tasa_asistencia_pct
    FROM asistencias a
    WHERE (v_periodo_id IS NULL OR a.periodo_id = v_periodo_id)
       OR (v_periodo.fecha_inicio IS NOT NULL AND a.fecha BETWEEN v_periodo.fecha_inicio AND v_periodo.fecha_fin)
    GROUP BY anio, mes, mes_nombre
    ORDER BY anio ASC, mes ASC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(meses_agg)), '[]'::jsonb)
  INTO v_evolucion_mensual
  FROM meses_agg;

  -- 2. Cuadro de Honor de Asistencia (>= 95% asistencia)
  WITH honor AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.nivel_actual,
      COUNT(*) AS total_clases,
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde')) AS asistencias,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS porcentaje_asistencia
    FROM asistencias a
    JOIN alumnos al ON al.id = a.alumno_id
    WHERE (v_periodo_id IS NULL OR a.periodo_id = v_periodo_id)
       OR (v_periodo.fecha_inicio IS NOT NULL AND a.fecha BETWEEN v_periodo.fecha_inicio AND v_periodo.fecha_fin)
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.nivel_actual
    HAVING COUNT(*) >= 5 
       AND (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'tarde'))::NUMERIC / NULLIF(COUNT(*), 0)) >= 0.95
    ORDER BY porcentaje_asistencia DESC, total_clases DESC
    LIMIT 20
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(honor)), '[]'::jsonb)
  INTO v_cuadro_honor
  FROM honor;

  -- 3. Ranking de Alumnos con Más Ausencias
  WITH ausencias_rank AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.representante_nombre,
      al.representante_tlf,
      COUNT(*) AS total_clases,
      COUNT(*) FILTER (WHERE a.estado = 'ausente') AS total_ausencias_injustificadas,
      COUNT(*) FILTER (WHERE a.estado = 'justificado') AS total_ausencias_justificadas,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado = 'ausente')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS porcentaje_inasistencia
    FROM asistencias a
    JOIN alumnos al ON al.id = a.alumno_id
    WHERE (v_periodo_id IS NULL OR a.periodo_id = v_periodo_id)
       OR (v_periodo.fecha_inicio IS NOT NULL AND a.fecha BETWEEN v_periodo.fecha_inicio AND v_periodo.fecha_fin)
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.representante_nombre, al.representante_tlf
    HAVING COUNT(*) FILTER (WHERE a.estado = 'ausente') > 0
    ORDER BY total_ausencias_injustificadas DESC
    LIMIT 15
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(ausencias_rank)), '[]'::jsonb)
  INTO v_ranking_ausencias
  FROM ausencias_rank;

  -- 4. Distribución de Motivos de Justificación
  WITH causas AS (
    SELECT
      COALESCE(NULLIF(TRIM(j.motivo), ''), 'No especificado') AS motivo,
      COUNT(*) AS cantidad,
      ROUND((COUNT(*)::NUMERIC / NULLIF(SUM(COUNT(*)) OVER(), 0)) * 100, 2) AS porcentaje
    FROM justificaciones j
    WHERE (v_periodo.fecha_inicio IS NULL OR j.created_at BETWEEN v_periodo.fecha_inicio AND v_periodo.fecha_fin + INTERVAL '1 day')
    GROUP BY motivo
    ORDER BY cantidad DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(causas)), '[]'::jsonb)
  INTO v_causas_justificaciones
  FROM causas;

  -- 5. Tasa de Retención por Cátedra / Instrumento
  WITH catedra_stats AS (
    SELECT
      COALESCE(NULLIF(TRIM(al.instrumento_principal), ''), 'Sin asignar') AS instrumento,
      COUNT(DISTINCT al.id) AS total_matriculados,
      COUNT(DISTINCT al.id) FILTER (WHERE al.activo = true) AS activos_cierre,
      COUNT(DISTINCT al.id) FILTER (WHERE al.activo = false) AS retirados,
      ROUND(
        (COUNT(DISTINCT al.id) FILTER (WHERE al.activo = true)::NUMERIC / NULLIF(COUNT(DISTINCT al.id), 0)) * 100, 2
      ) AS tasa_retencion_pct
    FROM alumnos al
    GROUP BY instrumento
    ORDER BY total_matriculados DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(catedra_stats)), '[]'::jsonb)
  INTO v_retencion_catedra
  FROM catedra_stats;

  -- 6. Alumnos Destacados (Merit Score: Asistencia + Logros + Indicadores)
  WITH merit AS (
    SELECT
      al.id AS alumno_id,
      al.nombre_completo,
      al.instrumento_principal,
      al.nivel_actual,
      COALESCE(asist.pct_asistencia, 0) AS pct_asistencia,
      COALESCE(logros.total_logros, 0) AS total_logros,
      COALESCE(ind.indicadores_aprobados, 0) AS indicadores_aprobados,
      ROUND(
        (COALESCE(asist.pct_asistencia, 0) * 0.40) +
        (LEAST(COALESCE(logros.total_logros, 0) * 10, 100) * 0.30) +
        (LEAST(COALESCE(ind.indicadores_aprobados, 0) * 10, 100) * 0.30),
        2
      ) AS merit_score
    FROM alumnos al
    LEFT JOIN (
      SELECT
        alumno_id,
        ROUND((COUNT(*) FILTER (WHERE estado IN ('presente', 'tarde'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) AS pct_asistencia
      FROM asistencias
      GROUP BY alumno_id
    ) asist ON asist.alumno_id = al.id
    LEFT JOIN (
      SELECT alumno_id, COUNT(*) AS total_logros
      FROM alumnos_logros
      GROUP BY alumno_id
    ) logros ON logros.alumno_id = al.id
    LEFT JOIN (
      SELECT student_id AS alumno_id, COUNT(*) AS indicadores_aprobados
      FROM indicator_attempts
      WHERE nota_tarea >= 70 OR score >= 70
      GROUP BY student_id
    ) ind ON ind.alumno_id = al.id
    WHERE al.activo = true
    ORDER BY merit_score DESC
    LIMIT 15
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(merit)), '[]'::jsonb)
  INTO v_alumnos_destacados
  FROM merit;

  -- 7. Evaluación Consolidada de Desempeño Docente del Semestre
  WITH docente_eval AS (
    SELECT
      m.id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      m.especialidad_principal AS especialidad,
      COUNT(s.id) AS total_sesiones_semestre,
      COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')) AS sesiones_cumplidas,
      COUNT(obs.id) AS observaciones_cargadas,
      ROUND(
        (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 2
      ) AS solvencia_registro_pct,
      ROUND(
        (
          (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 60 +
          LEAST(COUNT(obs.id)::NUMERIC / NULLIF(COUNT(s.id), 0) * 100, 100) * 40
        ), 2
      ) AS score_docente_global
    FROM maestros m
    JOIN clases c ON c.maestro_id = m.id
    JOIN sesiones_clase s ON s.clase_id = c.id
    LEFT JOIN observaciones_sesion obs ON obs.sesion_clase_id = s.id
    WHERE (v_periodo_id IS NULL OR s.periodo_id = v_periodo_id)
       OR (v_periodo.fecha_inicio IS NOT NULL AND s.fecha BETWEEN v_periodo.fecha_inicio AND v_periodo.fecha_fin)
    GROUP BY m.id, m.nombre_completo, m.especialidad_principal
    ORDER BY score_docente_global DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(docente_eval)), '[]'::jsonb)
  INTO v_evaluacion_docente
  FROM docente_eval;

  RETURN jsonb_build_object(
    'status', 'success',
    'tipo', 'semestral',
    'periodo', jsonb_build_object(
      'id', v_periodo.id,
      'nombre', COALESCE(v_periodo.nombre, 'Período Actual'),
      'fecha_inicio', v_periodo.fecha_inicio,
      'fecha_fin', v_periodo.fecha_fin
    ),
    'evolucion_mensual', v_evolucion_mensual,
    'cuadro_honor', v_cuadro_honor,
    'ranking_ausencias', v_ranking_ausencias,
    'causas_justificaciones', v_causas_justificaciones,
    'retencion_por_catedra', v_retencion_catedra,
    'alumnos_destacados', v_alumnos_destacados,
    'evaluacion_docente', v_evaluacion_docente
  );
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION get_resumen_academico_mensual(UUID, INT, INT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION get_informe_academico_semestral(UUID) TO authenticated, service_role, anon;
