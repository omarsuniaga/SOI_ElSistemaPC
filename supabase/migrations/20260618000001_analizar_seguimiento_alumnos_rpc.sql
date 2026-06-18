-- Scalable student follow-up analysis for the admin Pedagógico > Seguimiento de Alumnos view.
-- Moves aggregate risk computation from browser-side batching to Postgres.

CREATE INDEX IF NOT EXISTS idx_alumnos_activo_nombre
  ON public.alumnos (activo, nombre_completo);

CREATE INDEX IF NOT EXISTS idx_asistencias_alumno_fecha_estado
  ON public.asistencias (alumno_id, fecha, estado);

CREATE INDEX IF NOT EXISTS idx_progresos_alumno_fecha_calificacion
  ON public.progresos (alumno_id, fecha_evaluacion DESC)
  WHERE calificacion IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_observaciones_alumnos_followup
  ON public.observaciones_alumnos (alumno_id, estado, tipo)
  WHERE estado IN ('abierta', 'seguimiento', 'pendiente');

CREATE OR REPLACE FUNCTION public.analizar_seguimiento_alumnos(
  p_desde    date DEFAULT (CURRENT_DATE - 28),
  p_hasta    date DEFAULT CURRENT_DATE,
  p_limit    integer DEFAULT 50,
  p_offset   integer DEFAULT 0,
  p_busqueda text DEFAULT NULL
)
RETURNS TABLE (
  alumno_id uuid,
  nombre_completo text,
  instrumento_principal text,
  asistencia_total integer,
  asistencia_presentes integer,
  asistencia_rate numeric,
  progreso_count integer,
  progreso_promedio numeric,
  observaciones_count integer,
  risk_reasons text[],
  en_riesgo boolean,
  risk_score integer,
  nivel_riesgo text,
  total_count bigint,
  risk_count bigint
)
LANGUAGE sql
STABLE
AS $$
WITH params AS (
  SELECT
    COALESCE(p_desde, CURRENT_DATE - 28) AS desde,
    COALESCE(p_hasta, CURRENT_DATE) AS hasta,
    GREATEST(1, LEAST(COALESCE(p_limit, 50), 200)) AS page_limit,
    GREATEST(0, COALESCE(p_offset, 0)) AS page_offset,
    NULLIF(BTRIM(p_busqueda), '') AS search_text
),
filtered_students AS (
  SELECT a.id, a.nombre_completo, a.instrumento_principal
  FROM public.alumnos a
  CROSS JOIN params p
  WHERE COALESCE(a.activo, true) = true
    AND (
      p.search_text IS NULL
      OR a.nombre_completo ILIKE ('%' || p.search_text || '%')
      OR COALESCE(a.instrumento_principal, '') ILIKE ('%' || p.search_text || '%')
    )
),
attendance AS (
  SELECT
    asi.alumno_id,
    COUNT(*)::integer AS total,
    COUNT(*) FILTER (WHERE asi.estado IN ('P', 'presente'))::integer AS presentes
  FROM public.asistencias asi
  CROSS JOIN params p
  JOIN filtered_students fs ON fs.id = asi.alumno_id
  WHERE asi.fecha >= p.desde
    AND asi.fecha <= p.hasta
  GROUP BY asi.alumno_id
),
latest_grades AS (
  SELECT alumno_id, calificacion
  FROM (
    SELECT
      pr.alumno_id,
      pr.calificacion,
      ROW_NUMBER() OVER (
        PARTITION BY pr.alumno_id
        ORDER BY pr.fecha_evaluacion DESC, pr.created_at DESC NULLS LAST
      ) AS rn
    FROM public.progresos pr
    JOIN filtered_students fs ON fs.id = pr.alumno_id
    WHERE pr.calificacion IS NOT NULL
  ) ranked
  WHERE rn <= 3
),
grades AS (
  SELECT
    alumno_id,
    COUNT(*)::integer AS count,
    AVG(calificacion)::numeric AS promedio
  FROM latest_grades
  GROUP BY alumno_id
),
observations AS (
  SELECT
    obs.alumno_id,
    COUNT(*) FILTER (WHERE obs.tipo IN ('disciplina', 'conductual'))::integer AS disciplina_count,
    COUNT(*)::integer AS total_count
  FROM public.observaciones_alumnos obs
  JOIN filtered_students fs ON fs.id = obs.alumno_id
  WHERE obs.estado IN ('abierta', 'seguimiento', 'pendiente')
  GROUP BY obs.alumno_id
),
computed_base AS (
  SELECT
    fs.id AS alumno_id,
    fs.nombre_completo,
    fs.instrumento_principal,
    COALESCE(att.total, 0)::integer AS asistencia_total,
    COALESCE(att.presentes, 0)::integer AS asistencia_presentes,
    CASE
      WHEN COALESCE(att.total, 0) > 0 THEN ROUND((att.presentes::numeric / att.total::numeric), 4)
      ELSE NULL
    END AS asistencia_rate,
    COALESCE(gr.count, 0)::integer AS progreso_count,
    CASE WHEN gr.promedio IS NULL THEN NULL ELSE ROUND(gr.promedio, 2) END AS progreso_promedio,
    COALESCE(obs.total_count, 0)::integer AS observaciones_count,
    (COALESCE(att.total, 0) >= 4 AND (att.presentes::numeric / NULLIF(att.total, 0)) < 0.70) AS riesgo_asistencia,
    (COALESCE(gr.count, 0) >= 1 AND gr.promedio < 6.0) AS riesgo_calificacion,
    (COALESCE(obs.disciplina_count, 0) > 0) AS riesgo_disciplina
  FROM filtered_students fs
  LEFT JOIN attendance att ON att.alumno_id = fs.id
  LEFT JOIN grades gr ON gr.alumno_id = fs.id
  LEFT JOIN observations obs ON obs.alumno_id = fs.id
),
computed AS (
  SELECT
    cb.*,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN cb.riesgo_asistencia THEN 'asistencia' END,
      CASE WHEN cb.riesgo_calificacion THEN 'calificacion' END,
      CASE WHEN cb.riesgo_disciplina THEN 'disciplina' END
    ]::text[], NULL) AS risk_reasons,
    ((CASE WHEN cb.riesgo_asistencia THEN 40 ELSE 0 END) +
     (CASE WHEN cb.riesgo_calificacion THEN 30 ELSE 0 END) +
     (CASE WHEN cb.riesgo_disciplina THEN 20 ELSE 0 END))::integer AS risk_score
  FROM computed_base cb
),
counted AS (
  SELECT
    c.*,
    (COALESCE(array_length(c.risk_reasons, 1), 0) > 0) AS en_riesgo,
    CASE
      WHEN c.risk_score >= 70 THEN 'alto'
      WHEN c.risk_score >= 40 THEN 'medio'
      WHEN c.risk_score > 0 THEN 'bajo'
      ELSE NULL
    END AS nivel_riesgo,
    COUNT(*) OVER () AS total_count,
    COUNT(*) FILTER (WHERE COALESCE(array_length(c.risk_reasons, 1), 0) > 0) OVER () AS risk_count
  FROM computed c
)
SELECT
  counted.alumno_id,
  counted.nombre_completo,
  counted.instrumento_principal,
  counted.asistencia_total,
  counted.asistencia_presentes,
  counted.asistencia_rate,
  counted.progreso_count,
  counted.progreso_promedio,
  counted.observaciones_count,
  counted.risk_reasons,
  counted.en_riesgo,
  counted.risk_score,
  counted.nivel_riesgo,
  counted.total_count,
  counted.risk_count
FROM counted, params
ORDER BY counted.en_riesgo DESC, counted.risk_score DESC, counted.nombre_completo ASC
LIMIT (SELECT page_limit FROM params)
OFFSET (SELECT page_offset FROM params);
$$;

GRANT EXECUTE ON FUNCTION public.analizar_seguimiento_alumnos(date, date, integer, integer, text) TO authenticated;
