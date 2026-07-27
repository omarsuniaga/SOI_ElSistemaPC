-- Migration: 20260715_pedagogical_evaluations_dashboard.sql
-- Descripción: Dashboard de evaluaciones pedagógicas — vista unificada, RPC de cobertura, RLS
-- Date: 2026-07-15

-- ═══════════════════════════════════════════════════════════════════
-- 1. Vista unificada de evaluaciones pedagógicas
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.view_evaluaciones_pedagogicas AS
SELECT
  ia.id AS attempt_id,
  ia.student_id,
  a.nombre_completo AS student_name,
  ia.indicator_id,
  i.description AS indicator_description,
  i.nombre AS indicator_name,
  n.id AS node_id,
  n.name AS node_name,
  lv.id AS level_id,
  lv.name AS level_name,
  ia.result,
  ia.nota,
  ia.observations,
  ia.created_by AS maestro_id,
  m.nombre_completo AS maestro_name,
  ia.covered_by_clase_id AS clase_id,
  c.nombre AS clase_name,
  ia.covered_date,
  ia.created_at,
  ia.updated_at
FROM public.indicator_attempts ia
JOIN public.indicators i ON ia.indicator_id = i.id
JOIN public.nodes n ON i.node_id = n.id
JOIN public.levels lv ON n.level_id = lv.id
JOIN public.alumnos a ON ia.student_id = a.id
LEFT JOIN public.maestros m ON ia.created_by = m.user_id
LEFT JOIN public.clases c ON ia.covered_by_clase_id = c.id;

-- ═══════════════════════════════════════════════════════════════════
-- 2. RPC: cobertura de evaluaciones por clase
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fn_evaluacion_cobertura(p_clase_id uuid)
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_indicators', COUNT(DISTINCT i.id),
    'evaluated_indicators', COUNT(DISTINCT CASE WHEN ia.result IS NOT NULL THEN i.id END),
    'total_students', COUNT(DISTINCT a.id),
    'evaluated_students', COUNT(DISTINCT CASE WHEN ia.result IS NOT NULL THEN a.id END),
    'coverage_pct', CASE WHEN COUNT(DISTINCT i.id) > 0
      THEN ROUND(COUNT(DISTINCT CASE WHEN ia.result IS NOT NULL THEN i.id END)::numeric / COUNT(DISTINCT i.id) * 100, 1)
      ELSE 0 END,
    'by_teacher', (
      SELECT json_agg(t.*)
      FROM (
        SELECT
          m.nombre_completo AS teacher_name,
          ia2.created_by AS teacher_id,
          COUNT(DISTINCT CASE WHEN ia2.result IS NOT NULL THEN ia2.indicator_id END) AS evaluated,
          COUNT(DISTINCT i2.id) AS total,
          CASE WHEN COUNT(DISTINCT i2.id) > 0
            THEN ROUND(COUNT(DISTINCT CASE WHEN ia2.result IS NOT NULL THEN ia2.indicator_id END)::numeric / COUNT(DISTINCT i2.id) * 100, 1)
            ELSE 0 END AS pct
        FROM public.indicator_attempts ia2
        JOIN public.indicators i2 ON ia2.indicator_id = i2.id
        JOIN public.nodes n2 ON i2.node_id = n2.id
        JOIN public.levels lv2 ON n2.level_id = lv2.id
        JOIN public.clases cl2 ON ia2.covered_by_clase_id = cl2.id
        LEFT JOIN public.maestros m ON ia2.created_by = m.user_id
        WHERE ia2.covered_by_clase_id = p_clase_id
        GROUP BY ia2.created_by, m.nombre_completo
      ) t
    )
  ) INTO result
  FROM public.indicator_attempts ia
  JOIN public.indicators i ON ia.indicator_id = i.id
  JOIN public.nodes n ON i.node_id = n.id
  JOIN public.levels lv ON n.level_id = lv.id
  WHERE ia.covered_by_clase_id = p_clase_id;

  RETURN COALESCE(result, json_build_object(
    'total_indicators', 0, 'evaluated_indicators', 0,
    'total_students', 0, 'evaluated_students', 0,
    'coverage_pct', 0, 'by_teacher', '[]'::json
  ));
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- 3. RLS policies para dashboard
-- ═══════════════════════════════════════════════════════════════════

-- Admin can read all indicator_attempts (for dashboard)
CREATE POLICY admin_read_all_indicator_attempts ON public.indicator_attempts
FOR SELECT TO authenticated
USING (es_admin());

-- Authenticated users can read indicator_attempts for classes they teach
CREATE POLICY auth_read_class_indicator_attempts ON public.indicator_attempts
FOR SELECT TO authenticated
USING (
  covered_by_clase_id IN (
    SELECT c.id FROM public.clases c
    JOIN public.maestros m ON c.maestro_id = m.id
    WHERE m.user_id = auth.uid()
  )
);
