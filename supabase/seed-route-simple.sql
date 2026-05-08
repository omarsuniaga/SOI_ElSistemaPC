-- PASO 1: Crear la Ruta
INSERT INTO routes (name, instrument, description, status)
VALUES ('Ruta del Violín', 'violín', 'Camino completo de aprendizaje del violín desde principiante hasta maestría', 'published');

-- PASO 2: Crear la Versión de Ruta (obtener route_id de PASO 1)
-- Ejecuta esto DESPUÉS de PASO 1, reemplazando {route_id} con el ID de la ruta creada
-- INSERT INTO route_versions (route_id, version, status, description)
-- VALUES ('{route_id}', 1, 'published', 'Versión 1.0 de la ruta del violín');

-- ALTERNATIVA: Usar el último route_id creado
INSERT INTO route_versions (route_id, version, status, description)
VALUES (
  (SELECT id FROM routes WHERE name = 'Ruta del Violín' ORDER BY created_at DESC LIMIT 1),
  1,
  'published',
  'Versión 1.0 de la ruta del violín'
);

-- PASO 3: Crear los 10 Niveles
INSERT INTO levels (route_version_id, level_number, name, main_objective)
SELECT
  (SELECT id FROM route_versions WHERE status = 'published' ORDER BY created_at DESC LIMIT 1),
  t.level_num,
  t.level_name,
  t.objective
FROM (
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
) AS t(level_num, level_name, objective);

-- PASO 4: Crear los 160 Nodos (16 por nivel)
-- Niveles con tipos de nodos:
-- L1: ESCALA+ARCO, L2: ESCALA+SONIDO, L3: MANO_IZQ+ARCO, L4: AFINACION+TECNICA
-- L5: ARPEGIO+SONIDO, L6: MANO_IZQ+REPERTORIO, L7: TECNICA+AFINACION
-- L8: ARPEGIO+REPERTORIO, L9: ESCALA+TECNICA, L10: SONIDO+REPERTORIO

INSERT INTO nodes (level_id, name, type, order_index, is_critical, description)
WITH levels_map AS (
  SELECT id, level_number FROM levels
  WHERE route_version_id = (SELECT id FROM route_versions WHERE status = 'published' ORDER BY created_at DESC LIMIT 1)
),
node_list AS (
  -- Level 1: ESCALA (1-8), ARCO (9-16)
  SELECT lm.id, 'ESCALA ' || seq || ' - Nivel 1', 'ESCALA', seq, false, 'Nodo de ESCALA para nivel 1'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 1
  UNION ALL
  SELECT lm.id, 'ARCO ' || (seq - 8) || ' - Nivel 1', 'ARCO', seq, false, 'Nodo de ARCO para nivel 1'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 1

  UNION ALL
  -- Level 2: ESCALA (1-8), SONIDO (9-16)
  SELECT lm.id, 'ESCALA ' || seq || ' - Nivel 2', 'ESCALA', seq, false, 'Nodo de ESCALA para nivel 2'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 2
  UNION ALL
  SELECT lm.id, 'SONIDO ' || (seq - 8) || ' - Nivel 2', 'SONIDO', seq, true, 'Nodo de SONIDO para nivel 2'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 2

  UNION ALL
  -- Level 3: MANO_IZQ (1-8), ARCO (9-16)
  SELECT lm.id, 'MANO_IZQ ' || seq || ' - Nivel 3', 'MANO_IZQ', seq, false, 'Nodo de MANO_IZQ para nivel 3'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 3
  UNION ALL
  SELECT lm.id, 'ARCO ' || (seq - 8) || ' - Nivel 3', 'ARCO', seq, false, 'Nodo de ARCO para nivel 3'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 3

  UNION ALL
  -- Level 4: AFINACION (1-8), TECNICA (9-16)
  SELECT lm.id, 'AFINACION ' || seq || ' - Nivel 4', 'AFINACION', seq, true, 'Nodo de AFINACION para nivel 4'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 4
  UNION ALL
  SELECT lm.id, 'TECNICA ' || (seq - 8) || ' - Nivel 4', 'TECNICA', seq, false, 'Nodo de TECNICA para nivel 4'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 4

  UNION ALL
  -- Level 5: ARPEGIO (1-8), SONIDO (9-16)
  SELECT lm.id, 'ARPEGIO ' || seq || ' - Nivel 5', 'ARPEGIO', seq, false, 'Nodo de ARPEGIO para nivel 5'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 5
  UNION ALL
  SELECT lm.id, 'SONIDO ' || (seq - 8) || ' - Nivel 5', 'SONIDO', seq, true, 'Nodo de SONIDO para nivel 5'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 5

  UNION ALL
  -- Level 6: MANO_IZQ (1-8), REPERTORIO (9-16)
  SELECT lm.id, 'MANO_IZQ ' || seq || ' - Nivel 6', 'MANO_IZQ', seq, false, 'Nodo de MANO_IZQ para nivel 6'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 6
  UNION ALL
  SELECT lm.id, 'REPERTORIO ' || (seq - 8) || ' - Nivel 6', 'REPERTORIO', seq, false, 'Nodo de REPERTORIO para nivel 6'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 6

  UNION ALL
  -- Level 7: TECNICA (1-8), AFINACION (9-16)
  SELECT lm.id, 'TECNICA ' || seq || ' - Nivel 7', 'TECNICA', seq, false, 'Nodo de TECNICA para nivel 7'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 7
  UNION ALL
  SELECT lm.id, 'AFINACION ' || (seq - 8) || ' - Nivel 7', 'AFINACION', seq, true, 'Nodo de AFINACION para nivel 7'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 7

  UNION ALL
  -- Level 8: ARPEGIO (1-8), REPERTORIO (9-16)
  SELECT lm.id, 'ARPEGIO ' || seq || ' - Nivel 8', 'ARPEGIO', seq, false, 'Nodo de ARPEGIO para nivel 8'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 8
  UNION ALL
  SELECT lm.id, 'REPERTORIO ' || (seq - 8) || ' - Nivel 8', 'REPERTORIO', seq, false, 'Nodo de REPERTORIO para nivel 8'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 8

  UNION ALL
  -- Level 9: ESCALA (1-8), TECNICA (9-16)
  SELECT lm.id, 'ESCALA ' || seq || ' - Nivel 9', 'ESCALA', seq, false, 'Nodo de ESCALA para nivel 9'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 9
  UNION ALL
  SELECT lm.id, 'TECNICA ' || (seq - 8) || ' - Nivel 9', 'TECNICA', seq, false, 'Nodo de TECNICA para nivel 9'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 9

  UNION ALL
  -- Level 10: SONIDO (1-8), REPERTORIO (9-16)
  SELECT lm.id, 'SONIDO ' || seq || ' - Nivel 10', 'SONIDO', seq, true, 'Nodo de SONIDO para nivel 10'
  FROM levels_map lm CROSS JOIN generate_series(1, 8) seq WHERE lm.level_number = 10
  UNION ALL
  SELECT lm.id, 'REPERTORIO ' || (seq - 8) || ' - Nivel 10', 'REPERTORIO', seq, false, 'Nodo de REPERTORIO para nivel 10'
  FROM levels_map lm CROSS JOIN generate_series(9, 16) seq WHERE lm.level_number = 10
)
SELECT * FROM node_list;

-- PASO 5: Crear los Indicadores (4 por nodo = 640 total)
INSERT INTO indicators (node_id, nombre, description, is_required, activo, order_index)
SELECT
  n.id,
  CASE n.type
    WHEN 'ESCALA' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Postura de Pie'
      WHEN 1 THEN 'Postura Sentado'
      WHEN 2 THEN 'Agarre del Arco'
      WHEN 3 THEN 'Punto de Contacto'
    END
    WHEN 'ARPEGIO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Arpegios Diatónicos'
      WHEN 1 THEN 'Patrones de Dedos'
      WHEN 2 THEN 'Fluidez de Movimiento'
      WHEN 3 THEN 'Velocidad Gradual'
    END
    WHEN 'MANO_IZQ' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Posición Correcta'
      WHEN 1 THEN 'Afinación Primera Posición'
      WHEN 2 THEN 'Presión de Dedos'
      WHEN 3 THEN 'Cambios de Posición'
    END
    WHEN 'ARCO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Distribución de Arco'
      WHEN 1 THEN 'Velocidad de Arco'
      WHEN 2 THEN 'Dirección Limpia'
      WHEN 3 THEN 'Presión del Arco'
    END
    WHEN 'SONIDO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Calidad Tonal'
      WHEN 1 THEN 'Proyección'
      WHEN 2 THEN 'Uniformidad'
      WHEN 3 THEN 'Vibrato'
    END
    WHEN 'AFINACION' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Afinación Intervalos'
      WHEN 1 THEN 'Escala Cromática'
      WHEN 2 THEN 'Oído Relativo'
      WHEN 3 THEN 'Estabilidad Intonación'
    END
    WHEN 'TECNICA' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Estudios Progresivos'
      WHEN 1 THEN 'Coordinación Manos'
      WHEN 2 THEN 'Agilidad de Dedos'
      WHEN 3 THEN 'Claridad Técnica'
    END
    WHEN 'REPERTORIO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Interpretación Musical'
      WHEN 1 THEN 'Memoria Musical'
      WHEN 2 THEN 'Estilo y Periodo'
      WHEN 3 THEN 'Consistencia Ejecución'
    END
  END,
  CASE n.type
    WHEN 'ESCALA' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Posición correcta del cuerpo al tocar de pie, con brazos relajados y postura abierta'
      WHEN 1 THEN 'Posición correcta del cuerpo al tocar sentado, con instrumento bien apoyado'
      WHEN 2 THEN 'Forma correcta de sostener el arco con todos los dedos en posición natural'
      WHEN 3 THEN 'Control consistente del punto de contacto del arco con la cuerda'
    END
    WHEN 'ARPEGIO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Ejecutar arpegios diatónicos con claridad y uniformidad en velocidad'
      WHEN 1 THEN 'Patrones de dedos consistentes y rítmicos sin vacilaciones'
      WHEN 2 THEN 'Movimiento fluido entre cuerdas sin tensión en mano o brazo'
      WHEN 3 THEN 'Capacidad de ejecutar arpegios a diferentes velocidades con control'
    END
    WHEN 'MANO_IZQ' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Posición correcta de la mano izquierda con muñeca recta y dedos curvados'
      WHEN 1 THEN 'Afinación precisa en primera posición con variaciones de semitono'
      WHEN 2 THEN 'Presión suficiente de dedos sin tensión excesiva'
      WHEN 3 THEN 'Cambios de posición fluidos y precisos manteniendo continuidad tonal'
    END
    WHEN 'ARCO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Distribución equilibrada del arco a lo largo de la duración de notas'
      WHEN 1 THEN 'Control de velocidad del arco proporcional a dinámicas requeridas'
      WHEN 2 THEN 'Cambios de dirección del arco sin saltos o ruidos parásitos'
      WHEN 3 THEN 'Presión adecuada para producir sonido de calidad según dinámicas'
    END
    WHEN 'SONIDO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Producción de sonido cálido, resonante y sin tensión'
      WHEN 1 THEN 'Proyección clara del sonido sin exceso de presión'
      WHEN 2 THEN 'Uniformidad tonal consistente en todas las dinámicas'
      WHEN 3 THEN 'Vibrato natural y controlado cuando es apropiado'
    END
    WHEN 'AFINACION' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Afinación precisa de intervalos mayores, menores y perfectos'
      WHEN 1 THEN 'Ejecución de escala cromática afinada en todas las posiciones'
      WHEN 2 THEN 'Identificación auditiva de notas desafinadas y corrección rápida'
      WHEN 3 THEN 'Estabilidad de afinación durante transiciones dinámicas'
    END
    WHEN 'TECNICA' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Ejecución de estudios técnicos con tempo y precisión adecuados'
      WHEN 1 THEN 'Coordinación perfecta entre mano izquierda y derecha'
      WHEN 2 THEN 'Agilidad de dedos en pasajes técnicos a diferentes velocidades'
      WHEN 3 THEN 'Claridad en la ejecución de técnicas especializadas sin errores'
    END
    WHEN 'REPERTORIO' THEN CASE ((row_number() OVER (PARTITION BY n.id) - 1) % 4)
      WHEN 0 THEN 'Interpretación musical con fraseo y expresión apropiados'
      WHEN 1 THEN 'Capacidad de tocar de memoria piezas del repertorio con confianza'
      WHEN 2 THEN 'Entendimiento y aplicación de características estilísticas del periodo'
      WHEN 3 THEN 'Ejecución consistente de piezas complejas sin vacilaciones'
    END
  END,
  true,
  true,
  1
FROM (
  SELECT DISTINCT ON (id) id, type FROM nodes
) n
CROSS JOIN generate_series(1, 4);

-- Verificar los resultados
SELECT
  'Routes' AS "Table", COUNT(*) AS "Count" FROM routes
UNION ALL
SELECT 'Route Versions', COUNT(*) FROM route_versions
UNION ALL
SELECT 'Levels', COUNT(*) FROM levels
UNION ALL
SELECT 'Nodes', COUNT(*) FROM nodes
UNION ALL
SELECT 'Indicators', COUNT(*) FROM indicators;
