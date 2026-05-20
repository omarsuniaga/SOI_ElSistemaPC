-- Migration: Create maestro_desempeño table for performance tracking
-- Purpose: Track teacher registration compliance patterns and categorize performance
-- Date: 2026-05-20

CREATE TABLE maestro_desempeño (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID UNIQUE REFERENCES maestros(id) ON DELETE CASCADE,

  -- Counters (rolling 4-week window)
  total_sesiones INT DEFAULT 0,
  sesiones_verde INT DEFAULT 0 COMMENT 'On-time registrations (0 days overdue)',
  sesiones_amarillo INT DEFAULT 0 COMMENT '1-2 day delays',
  sesiones_naranja INT DEFAULT 0 COMMENT '3+ day delays (intensive monitoring)',
  sesiones_rojo INT DEFAULT 0 COMMENT '7+ day delays (critical)',

  -- Categorization
  categoria TEXT DEFAULT 'responsable' CHECK (categoria IN ('responsable', 'regular', 'incumplidor', 'negligente')),
  fecha_ultima_evaluacion TIMESTAMPTZ,

  -- Trend
  tendencia TEXT DEFAULT 'estable' CHECK (tendencia IN ('mejorando', 'estable', 'empeorando')),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for admin dashboard and reporting
CREATE INDEX idx_maestro_desempeño_categoria ON maestro_desempeño(categoria);
CREATE INDEX idx_maestro_desempeño_tendencia ON maestro_desempeño(tendencia);
CREATE INDEX idx_maestro_desempeño_updated_at ON maestro_desempeño(updated_at);

-- Enable RLS
ALTER TABLE maestro_desempeño ENABLE ROW LEVEL SECURITY;

-- Policy: Admin-only read access for performance data
CREATE POLICY admin_read_maestro_desempeño ON maestro_desempeño
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Policy: System-only write access (via scheduler Edge Function)
CREATE POLICY system_write_maestro_desempeño ON maestro_desempeño
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY system_update_maestro_desempeño ON maestro_desempeño
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
