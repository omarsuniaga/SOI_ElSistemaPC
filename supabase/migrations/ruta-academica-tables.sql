-- ============================================================
-- RUTA ACADÉMICA POR NODOS - Tablas para el Portal del Maestro
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. ENUMS
-- ============================================================

-- Estado de ruta
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_status') THEN
        CREATE TYPE route_status AS ENUM ('draft', 'published', 'archived');
    END IF;
END $$;

-- Estado de progreso
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status') THEN
        CREATE TYPE progress_status AS ENUM ('pending', 'in_process', 'approved', 'failed');
    END IF;
END $$;

-- Resultado de intento
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attempt_result') THEN
        CREATE TYPE attempt_result AS ENUM ('in_process', 'approved', 'failed');
    END IF;
END $$;

-- 2. TABLAS PRINCIPALES
-- ============================================================

-- Rutas oficiales (ej: Ruta Integral de Violín por Nodos)
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    instrument TEXT NOT NULL,
    description TEXT,
    status route_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Versiones de rutas (para versionado)
CREATE TABLE IF NOT EXISTS route_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    status route_status NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    UNIQUE(route_id, version)
);

-- Bloques de niveles (agrupación lógica)
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_version_id UUID NOT NULL REFERENCES route_versions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level_from INT NOT NULL,
    level_to INT NOT NULL,
    objective TEXT,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0
);

-- Niveles (los 40 de la ruta completa)
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
    route_version_id UUID NOT NULL REFERENCES route_versions(id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    name TEXT NOT NULL,
    main_objective TEXT,
    suggested_duration_value INT,
    suggested_duration_unit TEXT,
    is_flexible_duration BOOLEAN NOT NULL DEFAULT true,
    target_work JSONB DEFAULT '{}'::jsonb,
    unlock_criteria JSONB DEFAULT '{}'::jsonb,
    order_index INT NOT NULL DEFAULT 0,
    UNIQUE(route_version_id, level_number)
);

-- Nodos (los 8 por nivel: Escalas, Arpegios, Mano Izquierda, Arco, Sonido, Afinación, Estudios, Repertorio)
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    route_version_id UUID NOT NULL REFERENCES route_versions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_critical BOOLEAN NOT NULL DEFAULT false,
    is_required BOOLEAN NOT NULL DEFAULT true,
    objective TEXT,
    order_index INT NOT NULL DEFAULT 0
);

-- Indicadores (criterios de evaluación por nodo)
CREATE TABLE IF NOT EXISTS indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    minimum_criteria JSONB DEFAULT '{}'::jsonb,
    is_required BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0
);

-- 3. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_routes_instrument ON routes(instrument);
CREATE INDEX IF NOT EXISTS idx_route_versions_route ON route_versions(route_id);
CREATE INDEX IF NOT EXISTS idx_route_versions_status ON route_versions(status);
CREATE INDEX IF NOT EXISTS idx_levels_route_version ON levels(route_version_id);
CREATE INDEX IF NOT EXISTS idx_levels_number ON levels(level_number);
CREATE INDEX IF NOT EXISTS idx_nodes_level ON nodes(level_id);
CREATE INDEX IF NOT EXISTS idx_nodes_critical ON nodes(is_critical);
CREATE INDEX IF NOT EXISTS idx_indicators_node ON indicators(node_id);

-- 4. SEED: RUTA DE VIOLÍN v1.0.0 (10 niveles, 8 nodos cada uno)
-- ============================================================

-- Insertar ruta oficial
INSERT INTO routes (name, instrument, description, status)
VALUES ('Ruta Integral de Violín por Nodos', 'violín', 
  'Ruta académica progresiva por nodos técnicos para violín con 40 niveles', 'published')
ON CONFLICT DO NOTHING;

-- Insertar versión 1.0.0
INSERT INTO route_versions (route_id, version, status, published_at)
SELECT r.id, '1.0.0', 'published', NOW()
FROM routes r
WHERE r.name = 'Ruta Integral de Violín por Nodos'
ON CONFLICT DO NOTHING;

-- Insertar bloque inicial (Niveles 1-10)
INSERT INTO blocks (route_version_id, name, level_from, level_to, objective, order_index)
SELECT rv.id, 'Fundamentos y Técnica Básica', 1, 10, 
  'Dominar fundamentos técnicos básicos del violín', 0
FROM route_versions rv
WHERE rv.version = '1.0.0' AND rv.status = 'published'
ON CONFLICT DO NOTHING;

-- Los 8 nodos oficiales por nivel (constante para violín)
-- Orden: 1=Escalas, 2=Arpegios, 3=Mano Izquierda, 4=Arco, 5=Sonido, 6=Afinación, 7=Estudios, 8=Repertorio
DO $$
DECLARE
  route_ver_id UUID;
  level_id_val UUID;
  node_names TEXT[] := ARRAY['Escalas', 'Arpegios y patrones', 'Mano izquierda', 'Arco', 'Sonido', 'Afinación', 'Estudios técnicos', 'Repertorio / Fragmentos'];
  node_types TEXT[] := ARRAY['ESCALA', 'ARPEGIO', 'MANO_IZQ', 'ARCO', 'SONIDO', 'AFINACION', 'TECNICA', 'REPERTORIO'];
  node_critical BOOLEAN[] := ARRAY[false, false, false, false, true, true, false, false]; -- SONIDO y AFINACION son críticos
BEGIN
  -- Obtener ID de la versión
  SELECT rv.id INTO route_ver_id FROM route_versions rv WHERE rv.version = '1.0.0' AND rv.status = 'published';
  
  IF route_ver_id IS NOT NULL THEN
    -- Crear niveles 1-10
    FOR i IN 1..10 LOOP
      INSERT INTO levels (route_version_id, block_id, level_number, name, main_objective, order_index)
      SELECT route_ver_id, b.id, i, 
        CASE i
          WHEN 1 THEN 'Iniciación Musical'
          WHEN 2 THEN 'Primeros Intervalos'
          WHEN 3 THEN 'Escalas Básicas'
          WHEN 4 THEN 'Arpegios Simples'
          WHEN 5 THEN 'Técnica Elemental'
          WHEN 6 THEN 'Velocidad Inicial'
          WHEN 7 THEN 'Estudios Intermedios'
          WHEN 8 THEN 'Repertorio Sencillo'
          WHEN 9 THEN 'Nivel Intermedio'
          WHEN 10 THEN 'Vivaldi Boss Level'
        END,
        'Objetivo del nivel ' || i,
        i
      FROM blocks b WHERE b.route_version_id = route_ver_id
      ON CONFLICT DO NOTHING;
      
      -- Obtener nivel creado
      SELECT l.id INTO level_id_val FROM levels l WHERE l.route_version_id = route_ver_id AND l.level_number = i;
      
      -- Crear los 8 nodos para este nivel
      IF level_id_val IS NOT NULL THEN
        FOR j IN 1..8 LOOP
          INSERT INTO nodes (level_id, route_version_id, name, type, is_critical, is_required, objective, order_index)
          VALUES (level_id_val, route_ver_id, node_names[j], node_types[j], node_critical[j], true, 
            'Dominar ' || LOWER(node_names[j]) || ' en nivel ' || i, j)
          ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 5. VERIFICACIÓN
-- ============================================================

SELECT 
  'Rutas creadas: ' || COUNT(*) AS routes_count
FROM routes;

SELECT 
  'Versiones: ' || COUNT(*) AS versions_count
FROM route_versions;

SELECT 
  'Niveles: ' || COUNT(*) AS levels_count
FROM levels;

SELECT 
  'Nodos: ' || COUNT(*) AS nodes_count
FROM nodes;

SELECT 
  'Indicadores: ' || COUNT(*) AS indicators_count
FROM indicators;

-- Mostrar estructura de niveles y nodos
SELECT 
  l.level_number,
  l.name AS level_name,
  array_agg(n.name ORDER BY n.order_index) AS nodos
FROM levels l
LEFT JOIN nodes n ON n.level_id = l.id
GROUP BY l.level_number, l.name
ORDER BY l.level_number;

SELECT '✅ Ruta Académica de Violín creada correctamente' AS status;