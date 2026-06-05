-- Migration: Create indicator_sessions table
-- Purpose: Store teaching observations for academic indicators
-- Date: 2026-06-04

CREATE TABLE IF NOT EXISTS indicator_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  route_version_id UUID NOT NULL REFERENCES route_versions(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  clase_id UUID REFERENCES clases(id) ON DELETE SET NULL,

  -- Observation metadata
  fecha DATE NOT NULL,
  descripcion TEXT,
  calificacion VARCHAR(20) CHECK (calificacion IN ('bien', 'regular', 'mal')),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_maestro_route CHECK (maestro_id IS NOT NULL),
  CONSTRAINT valid_node_route CHECK (node_id IS NOT NULL)
);

-- Indices for fast lookups
CREATE INDEX idx_indicator_sessions_maestro ON indicator_sessions(maestro_id);
CREATE INDEX idx_indicator_sessions_route ON indicator_sessions(route_version_id);
CREATE INDEX idx_indicator_sessions_node ON indicator_sessions(node_id);
CREATE INDEX idx_indicator_sessions_fecha ON indicator_sessions(fecha DESC);
CREATE INDEX idx_indicator_sessions_maestro_route_node ON indicator_sessions(maestro_id, route_version_id, node_id);

-- Enable RLS
ALTER TABLE indicator_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: maestro puede ver/editar solo sus propias sesiones
CREATE POLICY "maestros_can_view_own_indicator_sessions" ON indicator_sessions
  FOR SELECT USING (
    maestro_id = (SELECT id FROM auth.users WHERE auth.uid() = id LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM maestros WHERE maestros.id = maestro_id
      AND maestros.user_id = auth.uid()
    )
  );

CREATE POLICY "maestros_can_insert_indicator_sessions" ON indicator_sessions
  FOR INSERT WITH CHECK (
    maestro_id IN (
      SELECT id FROM maestros WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "maestros_can_update_own_indicator_sessions" ON indicator_sessions
  FOR UPDATE USING (
    maestro_id IN (
      SELECT id FROM maestros WHERE user_id = auth.uid()
    )
  );
