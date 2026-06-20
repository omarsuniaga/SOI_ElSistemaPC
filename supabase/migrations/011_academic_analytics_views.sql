-- Migración 011: Vistas Analíticas Académicas (Torre de Control)

-- 1. Vista de Radar Institucional: Visión 360 de alumnos y su progreso
CREATE OR REPLACE VIEW public.view_institutional_radar AS
WITH current_student_level AS (
    -- Obtenemos el nivel más alto en proceso o pendiente para cada estudiante
    SELECT DISTINCT ON (slp.student_id) 
        slp.student_id, 
        slp.level_id, 
        l.name as level_name,
        l.order_index as level_order
    FROM public.student_level_progress slp
    JOIN public.levels l ON slp.level_id = l.id
    WHERE slp.status IN ('in_process', 'pending', 'failed')
    ORDER BY slp.student_id, l.order_index DESC
),
node_stats AS (
    -- Calculamos nodos aprobados vs totales por nivel para cada estudiante
    SELECT 
        snp.student_id,
        n.level_id,
        COUNT(*) as total_nodes,
        COUNT(*) FILTER (WHERE snp.status = 'approved') as approved_nodes
    FROM public.student_node_progress snp
    JOIN public.nodes n ON snp.node_id = n.id
    GROUP BY snp.student_id, n.level_id
),
latest_evaluator AS (
    -- Obtenemos el último maestro que evaluó al alumno
    SELECT DISTINCT ON (ia.student_id)
        ia.student_id,
        m.id as maestro_id,
        m.nombre as maestro_name
    FROM public.indicator_attempts ia
    JOIN public.class_sessions cs ON ia.session_id = cs.id
    JOIN public.maestros m ON cs.maestro_id = m.id
    ORDER BY ia.student_id, ia.created_at DESC
),
last_pedagogical_activity AS (
    SELECT 
        student_id, 
        MAX(created_at) as last_activity_at
    FROM public.indicator_attempts
    GROUP BY student_id
)
SELECT 
    s.id as student_id,
    s.nombre as student_name,
    s.seccion,
    csl.level_name as current_level,
    le.maestro_name as last_evaluator,
    COALESCE(ns.approved_nodes, 0) as approved_nodes,
    COALESCE(ns.total_nodes, 0) as total_nodes,
    CASE 
        WHEN COALESCE(ns.total_nodes, 0) = 0 THEN 0
        ELSE ROUND((ns.approved_nodes::float / ns.total_nodes) * 100) 
    END as progress_percentage,
    lpa.last_activity_at,
    EXTRACT(DAY FROM (NOW() - lpa.last_activity_at)) as days_inactive,
    CASE 
        WHEN EXTRACT(DAY FROM (NOW() - lpa.last_activity_at)) > 15 THEN 'stagnant'
        WHEN COALESCE(ns.approved_nodes, 0) = 0 THEN 'not_started'
        ELSE 'active'
    END as health_status
FROM public.students s
LEFT JOIN current_student_level csl ON s.id = csl.student_id
LEFT JOIN node_stats ns ON s.id = ns.student_id AND ns.level_id = csl.level_id
LEFT JOIN latest_evaluator le ON s.id = le.student_id
LEFT JOIN last_pedagogical_activity lpa ON s.id = lpa.student_id;

-- 2. Vista de Dificultad de Nodos (Hotspots): Identificación de cuellos de botella pedagógicos
CREATE OR REPLACE VIEW public.view_node_difficulty AS
SELECT 
    n.id as node_id,
    n.name as node_name,
    l.name as level_name,
    COUNT(ia.id) as total_attempts,
    COUNT(ia.id) FILTER (WHERE ia.result = 'failed') as failed_attempts,
    ROUND((COUNT(ia.id) FILTER (WHERE ia.result = 'failed')::float / NULLIF(COUNT(ia.id), 0)) * 100) as failure_percentage
FROM public.indicator_attempts ia
JOIN public.indicators i ON ia.indicator_id = i.id
JOIN public.nodes n ON i.node_id = n.id
JOIN public.levels l ON n.level_id = l.id
GROUP BY n.id, n.name, l.name
HAVING COUNT(ia.id) > 5
ORDER BY failure_percentage DESC;

-- Comentarios para PostgREST
COMMENT ON VIEW public.view_institutional_radar IS 'Vista central para el radar institucional y detección de estancamiento.';
COMMENT ON VIEW public.view_node_difficulty IS 'Analítica de dificultad por nodo para identificar puntos calientes pedagógicos.';
