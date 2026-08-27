-- =====================================================================
-- MIGRATION: 20260827000003_fix_academic_reports_rpcs.sql
-- Provee agregación analítica real para los informes mensuales y semestrales
-- =====================================================================

-- 1. RPC: Resumen Académico Mensual
CREATE OR REPLACE FUNCTION public.get_resumen_academico_mensual(
  p_periodo_id UUID DEFAULT NULL,
  p_mes INT DEFAULT NULL,
  p_anio INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
    'presentes', COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P')),
    'tardes', COUNT(*) FILTER (WHERE a.estado IN ('tarde', 'T')),
    'ausentes', COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')),
    'justificados', COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J')),
    'tasa_asistencia_pct', ROUND(
      (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
    ),
    'ratio_justificacion_pct', ROUND(
      (COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J'))::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A', 'justificado', 'J')), 0)) * 100, 2
    )
  )
  INTO v_resumen_general
  FROM public.asistencias a
  WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin;

  -- 2. Patrón Semanal
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
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T')) AS presentes_dia,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS ausentes_dia,
      ROUND((COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) AS tasa_asistencia_dia
    FROM public.asistencias a
    WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
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
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A', 'justificado', 'J')) AS total_inasistencias,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS ausencias_injustificadas,
      COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J')) AS ausencias_justificadas
    FROM public.asistencias a
    JOIN public.alumnos al ON al.id = a.alumno_id
    WHERE a.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.representante_nombre, al.representante_tlf
    HAVING COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) >= 2
    ORDER BY ausencias_injustificadas DESC
    LIMIT 20
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(riesgo)), '[]'::jsonb)
  INTO v_alumnos_riesgo
  FROM riesgo;

  -- 4. Cumplimiento Docente del Mes
  WITH docente_stats AS (
    SELECT
      m.id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      COALESCE(m.especialidad, 'General') AS especialidad,
      COUNT(s.id) AS total_sesiones,
      COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')) AS sesiones_cerradas,
      COUNT(s.id) FILTER (WHERE s.estado IN ('programada', 'abierta', 'pendiente', 'atrasada', 'borrador')) AS sesiones_pendientes,
      ROUND(
        (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 2
      ) AS cumplimiento_pct,
      (
        SELECT COUNT(*)
        FROM public.observaciones_alumnos obs
        WHERE obs.clase_id IN (
          SELECT c.id FROM public.clases c WHERE c.maestro_principal_id = m.id OR c.maestro_id = m.id
        )
        AND obs.created_at >= v_fecha_inicio AND obs.created_at <= v_fecha_fin + INTERVAL '1 day'
      ) AS sesiones_con_observaciones
    FROM public.maestros m
    LEFT JOIN public.sesiones_clase s ON (
      s.maestro_id = m.id OR s.maestro_id = m.user_id
      OR s.clase_id IN (SELECT c.id FROM public.clases c WHERE c.maestro_principal_id = m.id OR c.maestro_id = m.id)
    ) AND s.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    WHERE m.activo = true
    GROUP BY m.id, m.nombre_completo, m.especialidad
    HAVING COUNT(s.id) > 0
    ORDER BY cumplimiento_pct ASC, total_sesiones DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(docente_stats)), '[]'::jsonb)
  INTO v_cumplimiento_docente
  FROM docente_stats;

  -- 5. Efectividad de Clases
  SELECT jsonb_build_object(
    'total_programadas', COUNT(*),
    'dictadas', COUNT(*) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')),
    'pendientes', COUNT(*) FILTER (WHERE s.estado IN ('programada', 'abierta', 'pendiente', 'atrasada', 'borrador')),
    'canceladas', COUNT(*) FILTER (WHERE s.estado = 'cancelada'),
    'tasa_efectividad_pct', ROUND(
      (COUNT(*) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
    )
  )
  INTO v_efectividad_clases
  FROM public.sesiones_clase s
  WHERE s.fecha BETWEEN v_fecha_inicio AND v_fecha_fin;

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


-- 2. RPC: Informe Académico Semestral Consolidado
CREATE OR REPLACE FUNCTION public.get_informe_academico_semestral(
  p_periodo_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
    FROM public.periodos
    WHERE activo = true
    LIMIT 1;

    IF v_periodo_id IS NULL THEN
      SELECT id INTO v_periodo_id
      FROM public.periodos
      ORDER BY fecha_inicio DESC
      LIMIT 1;
    END IF;
  END IF;

  SELECT * INTO v_periodo FROM public.periodos WHERE id = v_periodo_id;

  -- 1. Evolución Mensual de Asistencias en el Semestre
  WITH meses_agg AS (
    SELECT
      EXTRACT(YEAR FROM a.fecha) AS anio,
      EXTRACT(MONTH FROM a.fecha) AS mes,
      TO_CHAR(a.fecha, 'TMMonth YYYY') AS mes_nombre,
      COUNT(*) AS total_registros,
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T')) AS presentes_total,
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS ausentes_total,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS tasa_asistencia_pct
    FROM public.asistencias a
    WHERE (v_periodo.fecha_inicio IS NULL OR a.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR a.fecha <= v_periodo.fecha_fin)
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
      COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T')) AS asistencias,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS porcentaje_asistencia
    FROM public.asistencias a
    JOIN public.alumnos al ON al.id = a.alumno_id
    WHERE (v_periodo.fecha_inicio IS NULL OR a.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR a.fecha <= v_periodo.fecha_fin)
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.nivel_actual
    HAVING COUNT(*) >= 3 
       AND (COUNT(*) FILTER (WHERE a.estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) >= 0.95
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
      COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) AS total_ausencias_injustificadas,
      COUNT(*) FILTER (WHERE a.estado IN ('justificado', 'J')) AS total_ausencias_justificadas,
      ROUND(
        (COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ) AS porcentaje_inasistencia
    FROM public.asistencias a
    JOIN public.alumnos al ON al.id = a.alumno_id
    WHERE (v_periodo.fecha_inicio IS NULL OR a.fecha >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR a.fecha <= v_periodo.fecha_fin)
    GROUP BY al.id, al.nombre_completo, al.instrumento_principal, al.representante_nombre, al.representante_tlf
    HAVING COUNT(*) FILTER (WHERE a.estado IN ('ausente', 'A')) > 0
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
    FROM public.justificaciones j
    WHERE (v_periodo.fecha_inicio IS NULL OR j.created_at >= v_periodo.fecha_inicio)
      AND (v_periodo.fecha_fin IS NULL OR j.created_at <= v_periodo.fecha_fin + INTERVAL '1 day')
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
    FROM public.alumnos al
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
      ROUND(
        (COALESCE(asist.pct_asistencia, 0) * 0.70) +
        (LEAST(COALESCE(logros.total_logros, 0) * 10, 100) * 0.30),
        2
      ) AS merit_score
    FROM public.alumnos al
    LEFT JOIN (
      SELECT
        alumno_id,
        ROUND((COUNT(*) FILTER (WHERE estado IN ('presente', 'P', 'tarde', 'T'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) AS pct_asistencia
      FROM public.asistencias
      WHERE (v_periodo.fecha_inicio IS NULL OR fecha >= v_periodo.fecha_inicio)
        AND (v_periodo.fecha_fin IS NULL OR fecha <= v_periodo.fecha_fin)
      GROUP BY alumno_id
    ) asist ON asist.alumno_id = al.id
    LEFT JOIN (
      SELECT alumno_id, COUNT(*) AS total_logros
      FROM public.alumnos_logros
      GROUP BY alumno_id
    ) logros ON logros.alumno_id = al.id
    WHERE al.activo = true
    ORDER BY merit_score DESC
    LIMIT 15
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(merit)), '[]'::jsonb)
  INTO v_alumnos_destacados
  FROM merit;

  -- 7. Evaluación y Solvencia Docente Real del Semestre
  WITH docente_eval AS (
    SELECT
      m.id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      COALESCE(m.especialidad, 'General') AS especialidad,
      COUNT(s.id) AS total_sesiones_semestre,
      COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')) AS sesiones_cumplidas,
      (
        SELECT COUNT(*)
        FROM public.observaciones_alumnos obs
        WHERE obs.clase_id IN (
          SELECT c.id FROM public.clases c WHERE c.maestro_principal_id = m.id OR c.maestro_id = m.id
        )
        AND (v_periodo.fecha_inicio IS NULL OR obs.created_at >= v_periodo.fecha_inicio)
        AND (v_periodo.fecha_fin IS NULL OR obs.created_at <= v_periodo.fecha_fin + INTERVAL '1 day')
      ) AS observaciones_cargadas,
      COALESCE(
        ROUND(
          (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 2
        ),
        0
      ) AS solvencia_registro_pct,
      COALESCE(
        ROUND(
          (
            (COUNT(s.id) FILTER (WHERE s.estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 80 +
            LEAST((SELECT COUNT(*) FROM public.observaciones_alumnos obs WHERE obs.clase_id IN (SELECT c.id FROM public.clases c WHERE c.maestro_principal_id = m.id OR c.maestro_id = m.id) AND (v_periodo.fecha_inicio IS NULL OR obs.created_at >= v_periodo.fecha_inicio) AND (v_periodo.fecha_fin IS NULL OR obs.created_at <= v_periodo.fecha_fin + INTERVAL '1 day'))::NUMERIC / NULLIF(COUNT(s.id), 0) * 100, 100) * 20
          ), 2
        ),
        0
      ) AS score_docente_global
    FROM public.maestros m
    LEFT JOIN public.sesiones_clase s ON (
      s.maestro_id = m.id OR s.maestro_id = m.user_id
      OR s.clase_id IN (SELECT c.id FROM public.clases c WHERE c.maestro_principal_id = m.id OR c.maestro_id = m.id)
    )
    AND (v_periodo.fecha_inicio IS NULL OR s.fecha >= v_periodo.fecha_inicio)
    AND (v_periodo.fecha_fin IS NULL OR s.fecha <= v_periodo.fecha_fin)
    WHERE m.activo = true
    GROUP BY m.id, m.nombre_completo, m.especialidad
    HAVING COUNT(s.id) > 0
    ORDER BY score_docente_global DESC, total_sesiones_semestre DESC
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(docente_eval)), '[]'::jsonb)
  INTO v_evaluacion_docente
  FROM docente_eval;

  RETURN jsonb_build_object(
    'status', 'success',
    'tipo', 'semestral',
    'periodo', jsonb_build_object(
      'id', v_periodo.id,
      'nombre', COALESCE(v_periodo.nombre, 'Semestre Actual'),
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
REVOKE ALL ON FUNCTION public.get_resumen_academico_mensual(UUID, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_resumen_academico_mensual(UUID, INT, INT) TO authenticated, service_role, anon;

REVOKE ALL ON FUNCTION public.get_informe_academico_semestral(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_informe_academico_semestral(UUID) TO authenticated, service_role, anon;
