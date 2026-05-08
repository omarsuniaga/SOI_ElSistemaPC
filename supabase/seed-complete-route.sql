-- Complete Route Seeding Script
-- Create Route → Route Version → 10 Levels → 160 Nodes → 640 Indicators
-- Execute this in Supabase Dashboard > SQL Editor

-- 1. Create Route
INSERT INTO routes (name, instrument, description, status)
VALUES (
  'Ruta del Violín',
  'violín',
  'Camino completo de aprendizaje del violín desde principiante hasta maestría',
  'published'
) RETURNING id AS route_id;

-- Store the route_id from above (e.g., if it's abc123, use it below)
-- For automation, we'll use a WITH clause:

WITH route_insert AS (
  INSERT INTO routes (name, instrument, description, status)
  VALUES (
    'Ruta del Violín',
    'violín',
    'Camino completo de aprendizaje del violín desde principiante hasta maestría',
    'published'
  )
  RETURNING id
),
version_insert AS (
  INSERT INTO route_versions (route_id, version, status, description)
  SELECT id, 1, 'published', 'Versión 1.0 de la ruta del violín'
  FROM route_insert
  RETURNING id, route_id
),
levels_insert AS (
  INSERT INTO levels (route_version_id, level_number, name, main_objective)
  SELECT
    vr.id,
    t.num,
    t.name,
    t.objective
  FROM version_insert vr
  CROSS JOIN (
    VALUES
      (1, 'Primer Contacto', 'Introducción al instrumento, postura básica y primeras notas'),
      (2, 'Fundamentos I', 'Desarrollo de habilidades de lectura y técnica básica'),
      (3, 'Fundamentos II', 'Mejora de la precisión y control del sonido'),
      (4, 'Progresión I', 'Introducción a dinámicas y articulaciones'),
      (5, 'Progresión II', 'Desarrollo de velocidad y agilidad'),
      (6, 'Intermedio I', 'Repertorio más complejo y técnica avanzada'),
      (7, 'Intermedio II', 'Interpretación musical y expresión'),
      (8, 'Avanzado I', 'Piezas de concierto y técnica especializada'),
      (9, 'Avanzado II', 'Dominio del instrumento y virtuosismo'),
      (10, 'Maestría', 'Perfección técnica y artística del instrumento')
  ) AS t(num, name, objective)
  RETURNING id, level_number
)
SELECT 'Route and Levels created successfully!' AS status;

-- 2. Create Nodes (160 total - 16 per level, across 8 node types)
-- This script creates nodes for each level with the distribution:
-- L1: ESCALA/ARCO, L2: ESCALA/SONIDO, L3: MANO_IZQ/ARCO, L4: AFINACION/TECNICA, etc.

WITH levels_data AS (
  SELECT id, level_number FROM levels WHERE route_version_id IN (
    SELECT id FROM route_versions WHERE status = 'published' ORDER BY created_at DESC LIMIT 1
  )
),
node_data AS (
  SELECT
    l.id AS level_id,
    l.level_number,
    t.node_type,
    t.node_num,
    t.node_name,
    (CASE WHEN t.node_type IN ('SONIDO', 'AFINACION') AND l.level_number >= 3 THEN true ELSE false END) AS is_critical
  FROM levels_data l
  CROSS JOIN LATERAL (
    -- Level 1: ESCALA, ARCO
    SELECT 1, i, CASE WHEN i <= 8 THEN 'ESCALA' ELSE 'ARCO' END, 'ESCALA ' || i || ' - Nivel 1'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 1

    UNION ALL

    -- Level 2: ESCALA, SONIDO
    SELECT 2, i, CASE WHEN i <= 8 THEN 'ESCALA' ELSE 'SONIDO' END, 'ESCALA ' || i || ' - Nivel 2'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 2

    UNION ALL

    -- Level 3: MANO_IZQ, ARCO
    SELECT 3, i, CASE WHEN i <= 8 THEN 'MANO_IZQ' ELSE 'ARCO' END, 'MANO_IZQ ' || i || ' - Nivel 3'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 3

    UNION ALL

    -- Level 4: AFINACION, TECNICA
    SELECT 4, i, CASE WHEN i <= 8 THEN 'AFINACION' ELSE 'TECNICA' END, 'AFINACION ' || i || ' - Nivel 4'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 4

    UNION ALL

    -- Level 5: ARPEGIO, SONIDO
    SELECT 5, i, CASE WHEN i <= 8 THEN 'ARPEGIO' ELSE 'SONIDO' END, 'ARPEGIO ' || i || ' - Nivel 5'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 5

    UNION ALL

    -- Level 6: MANO_IZQ, REPERTORIO
    SELECT 6, i, CASE WHEN i <= 8 THEN 'MANO_IZQ' ELSE 'REPERTORIO' END, 'MANO_IZQ ' || i || ' - Nivel 6'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 6

    UNION ALL

    -- Level 7: TECNICA, AFINACION
    SELECT 7, i, CASE WHEN i <= 8 THEN 'TECNICA' ELSE 'AFINACION' END, 'TECNICA ' || i || ' - Nivel 7'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 7

    UNION ALL

    -- Level 8: ARPEGIO, REPERTORIO
    SELECT 8, i, CASE WHEN i <= 8 THEN 'ARPEGIO' ELSE 'REPERTORIO' END, 'ARPEGIO ' || i || ' - Nivel 8'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 8

    UNION ALL

    -- Level 9: ESCALA, TECNICA
    SELECT 9, i, CASE WHEN i <= 8 THEN 'ESCALA' ELSE 'TECNICA' END, 'ESCALA ' || i || ' - Nivel 9'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 9

    UNION ALL

    -- Level 10: SONIDO, REPERTORIO
    SELECT 10, i, CASE WHEN i <= 8 THEN 'SONIDO' ELSE 'REPERTORIO' END, 'SONIDO ' || i || ' - Nivel 10'
    FROM generate_series(1, 16) i
    WHERE l.level_number = 10
  ) AS t(level_num, node_num, node_type, node_name)
)
INSERT INTO nodes (level_id, name, type, order_index, is_critical, description)
SELECT
  nd.level_id,
  nd.node_name,
  nd.node_type,
  nd.node_num,
  nd.is_critical,
  'Nodo de ' || nd.node_type || ' para nivel ' || nd.level_number
FROM node_data nd;

-- 3. Create Indicators (4 per node)
-- Templates per node type (8 types × 4 indicators = 32 templates)

WITH node_indicators AS (
  SELECT
    n.id AS node_id,
    n.type,
    t.template_num,
    t.nombre,
    t.description
  FROM nodes n
  CROSS JOIN (
    -- ESCALA indicators
    SELECT 1, 'ESCALA', 'Postura de Pie', 'Posición correcta del cuerpo al tocar de pie, con brazos relajados y postura abierta' WHERE n.type = 'ESCALA'
    UNION ALL
    SELECT 1, 'ESCALA', 'Postura Sentado', 'Posición correcta del cuerpo al tocar sentado, con instrumento bien apoyado' WHERE n.type = 'ESCALA'
    UNION ALL
    SELECT 1, 'ESCALA', 'Agarre del Arco', 'Forma correcta de sostener el arco con todos los dedos en posición natural' WHERE n.type = 'ESCALA'
    UNION ALL
    SELECT 1, 'ESCALA', 'Punto de Contacto', 'Control consistente del punto de contacto del arco con la cuerda' WHERE n.type = 'ESCALA'
    UNION ALL

    -- ARPEGIO indicators
    SELECT 2, 'ARPEGIO', 'Arpegios Diatónicos', 'Ejecutar arpegios diatónicos con claridad y uniformidad en velocidad' WHERE n.type = 'ARPEGIO'
    UNION ALL
    SELECT 2, 'ARPEGIO', 'Patrones de Dedos', 'Patrones de dedos consistentes y rítmicos sin vacilaciones' WHERE n.type = 'ARPEGIO'
    UNION ALL
    SELECT 2, 'ARPEGIO', 'Fluidez de Movimiento', 'Movimiento fluido entre cuerdas sin tensión en mano o brazo' WHERE n.type = 'ARPEGIO'
    UNION ALL
    SELECT 2, 'ARPEGIO', 'Velocidad Gradual', 'Capacidad de ejecutar arpegios a diferentes velocidades con control' WHERE n.type = 'ARPEGIO'
    UNION ALL

    -- MANO_IZQ indicators
    SELECT 3, 'MANO_IZQ', 'Posición Correcta', 'Posición correcta de la mano izquierda con muñeca recta y dedos curvados' WHERE n.type = 'MANO_IZQ'
    UNION ALL
    SELECT 3, 'MANO_IZQ', 'Afinación Primera Posición', 'Afinación precisa en primera posición con variaciones de semitono' WHERE n.type = 'MANO_IZQ'
    UNION ALL
    SELECT 3, 'MANO_IZQ', 'Presión de Dedos', 'Presión suficiente de dedos sin tensión excesiva' WHERE n.type = 'MANO_IZQ'
    UNION ALL
    SELECT 3, 'MANO_IZQ', 'Cambios de Posición', 'Cambios de posición fluidos y precisos manteniendo continuidad tonal' WHERE n.type = 'MANO_IZQ'
    UNION ALL

    -- ARCO indicators
    SELECT 4, 'ARCO', 'Distribución de Arco', 'Distribución equilibrada del arco a lo largo de la duración de notas' WHERE n.type = 'ARCO'
    UNION ALL
    SELECT 4, 'ARCO', 'Velocidad de Arco', 'Control de velocidad del arco proporcional a dinámicas requeridas' WHERE n.type = 'ARCO'
    UNION ALL
    SELECT 4, 'ARCO', 'Dirección Limpia', 'Cambios de dirección del arco sin saltos o ruidos parásitos' WHERE n.type = 'ARCO'
    UNION ALL
    SELECT 4, 'ARCO', 'Presión del Arco', 'Presión adecuada para producir sonido de calidad según dinámicas' WHERE n.type = 'ARCO'
    UNION ALL

    -- SONIDO indicators
    SELECT 5, 'SONIDO', 'Calidad Tonal', 'Producción de sonido cálido, resonante y sin tensión' WHERE n.type = 'SONIDO'
    UNION ALL
    SELECT 5, 'SONIDO', 'Proyección', 'Proyección clara del sonido sin exceso de presión' WHERE n.type = 'SONIDO'
    UNION ALL
    SELECT 5, 'SONIDO', 'Uniformidad', 'Uniformidad tonal consistente en todas las dinámicas' WHERE n.type = 'SONIDO'
    UNION ALL
    SELECT 5, 'SONIDO', 'Vibrato', 'Vibrato natural y controlado cuando es apropiado' WHERE n.type = 'SONIDO'
    UNION ALL

    -- AFINACION indicators
    SELECT 6, 'AFINACION', 'Afinación Intervalos', 'Afinación precisa de intervalos mayores, menores y perfectos' WHERE n.type = 'AFINACION'
    UNION ALL
    SELECT 6, 'AFINACION', 'Escala Cromática', 'Ejecución de escala cromática afinada en todas las posiciones' WHERE n.type = 'AFINACION'
    UNION ALL
    SELECT 6, 'AFINACION', 'Oído Relativo', 'Identificación auditiva de notas desafinadas y corrección rápida' WHERE n.type = 'AFINACION'
    UNION ALL
    SELECT 6, 'AFINACION', 'Estabilidad Intonación', 'Estabilidad de afinación durante transiciones dinámicas' WHERE n.type = 'AFINACION'
    UNION ALL

    -- TECNICA indicators
    SELECT 7, 'TECNICA', 'Estudios Progresivos', 'Ejecución de estudios técnicos con tempo y precisión adecuados' WHERE n.type = 'TECNICA'
    UNION ALL
    SELECT 7, 'TECNICA', 'Coordinación Manos', 'Coordinación perfecta entre mano izquierda y derecha' WHERE n.type = 'TECNICA'
    UNION ALL
    SELECT 7, 'TECNICA', 'Agilidad de Dedos', 'Agilidad de dedos en pasajes técnicos a diferentes velocidades' WHERE n.type = 'TECNICA'
    UNION ALL
    SELECT 7, 'TECNICA', 'Claridad Técnica', 'Claridad en la ejecución de técnicas especializadas sin errores' WHERE n.type = 'TECNICA'
    UNION ALL

    -- REPERTORIO indicators
    SELECT 8, 'REPERTORIO', 'Interpretación Musical', 'Interpretación musical con fraseo y expresión apropiados' WHERE n.type = 'REPERTORIO'
    UNION ALL
    SELECT 8, 'REPERTORIO', 'Memoria Musical', 'Capacidad de tocar de memoria piezas del repertorio con confianza' WHERE n.type = 'REPERTORIO'
    UNION ALL
    SELECT 8, 'REPERTORIO', 'Estilo y Periodo', 'Entendimiento y aplicación de características estilísticas del periodo' WHERE n.type = 'REPERTORIO'
    UNION ALL
    SELECT 8, 'REPERTORIO', 'Consistencia Ejecución', 'Ejecución consistente de piezas complejas sin vacilaciones' WHERE n.type = 'REPERTORIO'
  ) AS t(template_num, type_name, nombre, description)
  WHERE n.type = t.type_name
)
INSERT INTO indicators (node_id, nombre, description, is_required, activo, order_index)
SELECT
  node_id,
  nombre,
  description,
  true,
  true,
  template_num
FROM node_indicators;

-- Verify the seeding was successful
SELECT
  (SELECT COUNT(*) FROM routes) AS routes_count,
  (SELECT COUNT(*) FROM route_versions) AS versions_count,
  (SELECT COUNT(*) FROM levels) AS levels_count,
  (SELECT COUNT(*) FROM nodes) AS nodes_count,
  (SELECT COUNT(*) FROM indicators) AS indicators_count;
