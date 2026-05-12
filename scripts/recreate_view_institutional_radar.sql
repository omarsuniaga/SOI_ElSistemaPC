-- Script para recrear view_institutional_radar
-- Usa la tabla correcta: student_node_progress

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS view_institutional_radar;

-- 2. Recrear la vista con la tabla correcta
CREATE OR REPLACE VIEW view_institutional_radar AS
SELECT 
    -- Dimensiones del radar
    n.id AS node_id,
    n.title AS node_title,
    n.description AS node_description,
    n.order_index AS node_order,
    nl.level_name,
    nr.route_name,
    
    -- Métricas por nodo
    COUNT(DISTINCT snp.id) AS total_estudiantes,
    COUNT(DISTINCT CASE WHEN snp.status = 'approved' THEN snp.id END) AS approved_count,
    COUNT(DISTINCT CASE WHEN snp.status = 'in_process' THEN snp.id END) AS in_process_count,
    COUNT(DISTINCT CASE WHEN snp.status = 'pending' THEN snp.id END) AS pending_count,
    COUNT(DISTINCT CASE WHEN snp.status = 'rejected' THEN snp.id END) AS rejected_count,
    
    -- Cálculo de progreso (porcentaje de aprobados)
    CASE 
        WHEN COUNT(DISTINCT snp.id) > 0 
        THEN ROUND(
            COUNT(DISTINCT CASE WHEN snp.status = 'approved' THEN snp.id END)::numeric / 
            COUNT(DISTINCT snp.id)::numeric * 100, 
            1
        )
        ELSE 0 
    END AS completion_percentage,
    
    -- Métricas de intentos por indicador
    COUNT(DISTINCT ia.id) AS total_attempts,
    ROUND(AVG(CASE WHEN ia.result = 'approved' THEN 100 ELSE 0 END), 1) AS indicator_approval_rate,
    
    -- Timestamps
    MAX(snp.updated_at) AS last_activity,
    MIN(snp.created_at) AS first_activity

FROM nodes n
-- Relación con niveles y rutas
LEFT JOIN node_levels nl ON nl.id = n.level_id
LEFT JOIN node_routes nr ON nr.id = n.route_id
-- Relación con progreso de estudiantes por nodo
LEFT JOIN student_node_progress snp ON snp.node_id = n.id
LEFT JOIN student_level_progress slp ON slp.id = snp.student_level_progress_id
LEFT JOIN students s ON s.id = slp.student_id
-- Relación con intentos de indicadores
LEFT JOIN indicator_attempts ia ON ia.student_node_progress_id = snp.id

WHERE 
    n.active = true 
    AND n.visible = true
    AND s.active = true

GROUP BY 
    n.id, 
    n.title, 
    n.description, 
    n.order_index,
    nl.level_name,
    nr.route_name;

-- 3. Agregar comentarios a la vista
COMMENT ON VIEW view_institutional_radar IS 
'Vista de radar institucional que muestra el progreso de estudiantes por nodo. 
Usa student_node_progress para obtener status (pending, in_process, approved, rejected).';

-- 4. Permisos (GRANT)
GRANT SELECT ON view_institutional_radar TO authenticated;
GRANT SELECT ON view_institutional_radar TO anon;

-- 5. Notificar a PostgREST para recargar schema
NOTIFY pgrst, 'reload schema';

-- 6. Verificar la vista
SELECT 
    'Vista creada exitosamente' AS status,
    COUNT(*) AS total_nodos
FROM view_institutional_radar;