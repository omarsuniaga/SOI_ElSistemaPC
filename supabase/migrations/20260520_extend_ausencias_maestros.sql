-- Migration: extend ausencias_maestros with director/admin approval workflow columns
-- Date: 2026-05-20

-- Add review tracking columns
ALTER TABLE ausencias_maestros
  ADD COLUMN IF NOT EXISTS revisado_por UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS revision_notas TEXT,
  ADD COLUMN IF NOT EXISTS revision_en TIMESTAMPTZ,

  -- aprobado_por already exists; add aprobado_en
  ADD COLUMN IF NOT EXISTS aprobado_en TIMESTAMPTZ,

  -- Rejection tracking
  ADD COLUMN IF NOT EXISTS rechazado_por UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rechazado_en TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS razon_rechazo TEXT,

  -- Request tracking
  ADD COLUMN IF NOT EXISTS intentos_solicitud INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fecha_solicitud_original DATE;

-- Indexes for frequent query patterns
CREATE INDEX IF NOT EXISTS idx_ausencias_maestros_revisado_por
  ON ausencias_maestros(revisado_por);

CREATE INDEX IF NOT EXISTS idx_ausencias_maestros_rechazado_por
  ON ausencias_maestros(rechazado_por);

CREATE INDEX IF NOT EXISTS idx_ausencias_maestros_revision_en
  ON ausencias_maestros(revision_en);

CREATE INDEX IF NOT EXISTS idx_ausencias_maestros_aprobado_en
  ON ausencias_maestros(aprobado_en);

CREATE INDEX IF NOT EXISTS idx_ausencias_maestros_fecha_solicitud_original
  ON ausencias_maestros(fecha_solicitud_original);
