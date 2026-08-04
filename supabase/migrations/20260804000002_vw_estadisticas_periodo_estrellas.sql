-- ============================================================================
-- MIGRATION: Fix period statistics view and integrate star ratings (1-5★)
-- Fecha: 2026-08-04
-- Motivo:
--   El KPI "Promedio Global" del dashboard de métricas muestra 0.00 en modo
--   Supabase por DOS razones que esta migración corrige:
--
--   1) Mapeo de columnas roto: el frontend esperaba campos que la vista nunca
--      expuso (promedio_general, total_alumnos, asistencia_hoy_porcentaje).
--      La vista real usa alumnos_activos, promedio_calificacion_periodo y
--      tasa_asistencia_periodo. El frontend ya fue corregido para leer estos
--      nombres (dashboardMetricasView.js).
--
--   2) Datos huérfanos de período: asistencias y progresos tienen la columna
--      periodo_id pero NINGÚN registro la tiene poblada (verificado en DB:
--      0/195 progresos, 0/286 asistencias). La vista anterior unía por
--      periodo_id, por lo que devolvía 0 en todo. Esta migración une por
--      rango de fechas (fecha/fecha_evaluacion BETWEEN p.fecha_inicio/fin),
--      el mismo patrón que ya usaba la vista para observaciones_alumnos.
--
--   3) Producto cartesiano: la vista anterior unía 4 tablas con LEFT JOIN
--      sin relación entre ellas (asistencias × progresos × observaciones ×
--      evaluaciones). Cada fila de una tabla multiplicaba las filas de las
--      demás, inflando los counts. Esta migración reescribe la vista con
--      subconsultas escalares independientes: cada métrica se calcula sobre
--      su propia tabla sin multiplicar filas.
--
--   4) Estrellas del Diseñador Curricular fuera de las métricas: las
--      evaluaciones por estrellas (1-5★) se guardan en evaluacion_indicador
--      y nunca alimentaban el promedio institucional. Se agregan tres
--      columnas nuevas:
--      - promedio_estrellas: promedio 1-5★ del período
--      - total_evaluaciones_estrellas: conteo de evaluaciones por estrellas
--      - promedio_integrado: media ponderada 0-10 combinando progresos (0-10)
--        y estrellas normalizadas (nota*2 → 2-10), ponderada por el número de
--        registros de cada fuente. Si no hay registros en ninguna fuente,
--        devuelve NULL (el frontend cae a promedio_calificacion_periodo).
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_estadisticas_periodo AS
SELECT
  p.id AS periodo_id,
  p.nombre AS periodo_nombre,
  p.fecha_inicio,
  p.fecha_fin,
  p.activo,
  (SELECT count(*) FROM public.alumnos WHERE alumnos.activo = true) AS alumnos_activos,
  (SELECT count(DISTINCT ast.alumno_id)
     FROM public.asistencias ast
    WHERE ast.fecha BETWEEN p.fecha_inicio AND p.fecha_fin) AS alumnos_con_asistencia,
  (SELECT count(ast.id)
     FROM public.asistencias ast
    WHERE ast.fecha BETWEEN p.fecha_inicio AND p.fecha_fin) AS total_registros_asistencia,
  round(
    (SELECT count(ast.id) FILTER (WHERE ast.estado = ANY (ARRAY['presente','justificado']))
       FROM public.asistencias ast
      WHERE ast.fecha BETWEEN p.fecha_inicio AND p.fecha_fin)::numeric
    / NULLIF(
        (SELECT count(ast.id)
           FROM public.asistencias ast
          WHERE ast.fecha BETWEEN p.fecha_inicio AND p.fecha_fin),
        0)::numeric * 100::numeric,
    1
  ) AS tasa_asistencia_periodo,
  (SELECT count(DISTINCT pr.alumno_id)
     FROM public.progresos pr
    WHERE pr.fecha_evaluacion BETWEEN p.fecha_inicio AND p.fecha_fin) AS alumnos_evaluados,
  (SELECT count(pr.id)
     FROM public.progresos pr
    WHERE pr.fecha_evaluacion BETWEEN p.fecha_inicio AND p.fecha_fin) AS total_evaluaciones,
  round(
    (SELECT avg(pr.calificacion)
       FROM public.progresos pr
      WHERE pr.fecha_evaluacion BETWEEN p.fecha_inicio AND p.fecha_fin),
    2
  ) AS promedio_calificacion_periodo,
  (SELECT count(DISTINCT o.id) FILTER (WHERE o.estado = 'abierta')
     FROM public.observaciones_alumnos o
    WHERE COALESCE(o.fecha_observacion, o.fecha) BETWEEN p.fecha_inicio AND p.fecha_fin) AS obs_abiertas,
  (SELECT count(DISTINCT o.id) FILTER (WHERE o.estado = 'resuelta')
     FROM public.observaciones_alumnos o
    WHERE COALESCE(o.fecha_observacion, o.fecha) BETWEEN p.fecha_inicio AND p.fecha_fin) AS obs_resueltas,
  (SELECT count(DISTINCT o.id) FILTER (WHERE o.prioridad = 'alta' AND o.estado <> 'resuelta')
     FROM public.observaciones_alumnos o
    WHERE COALESCE(o.fecha_observacion, o.fecha) BETWEEN p.fecha_inicio AND p.fecha_fin) AS alertas_alta_activas,
  -- ── Nuevas columnas: integración de estrellas (evaluacion_indicador) ──
  round(
    (SELECT avg(ei.nota)
       FROM public.evaluacion_indicador ei
      WHERE ei.created_at::date BETWEEN p.fecha_inicio AND p.fecha_fin),
    2
  ) AS promedio_estrellas,
  (SELECT count(ei.id)
     FROM public.evaluacion_indicador ei
    WHERE ei.created_at::date BETWEEN p.fecha_inicio AND p.fecha_fin) AS total_evaluaciones_estrellas,
  round(
    CASE
      WHEN (SELECT count(pr.calificacion) FROM public.progresos pr WHERE pr.fecha_evaluacion BETWEEN p.fecha_inicio AND p.fecha_fin)
           + (SELECT count(ei.nota) FROM public.evaluacion_indicador ei WHERE ei.created_at::date BETWEEN p.fecha_inicio AND p.fecha_fin) = 0
      THEN NULL
      ELSE (
        (SELECT COALESCE(avg(pr.calificacion), 0) FROM public.progresos pr WHERE pr.fecha_evaluacion BETWEEN p.fecha_inicio AND p.fecha_fin)
          * (SELECT count(pr.calificacion) FROM public.progresos pr WHERE pr.fecha_evaluacion BETWEEN p.fecha_inicio AND p.fecha_fin)
        +
        (SELECT COALESCE(avg(ei.nota), 0) * 2 FROM public.evaluacion_indicador ei WHERE ei.created_at::date BETWEEN p.fecha_inicio AND p.fecha_fin)
          * (SELECT count(ei.nota) FROM public.evaluacion_indicador ei WHERE ei.created_at::date BETWEEN p.fecha_inicio AND p.fecha_fin)
      ) / NULLIF(
          (SELECT count(pr.calificacion) FROM public.progresos pr WHERE pr.fecha_evaluacion BETWEEN p.fecha_inicio AND p.fecha_fin)
          + (SELECT count(ei.nota) FROM public.evaluacion_indicador ei WHERE ei.created_at::date BETWEEN p.fecha_inicio AND p.fecha_fin),
          0)
    END,
    2
  ) AS promedio_integrado
FROM public.periodos p
ORDER BY p.fecha_inicio DESC;

-- Mantener security_invoker = true (patrón establecido en 20260518_rls_security_audit_fix.sql)
ALTER VIEW public.vw_estadisticas_periodo SET (security_invoker = true);
