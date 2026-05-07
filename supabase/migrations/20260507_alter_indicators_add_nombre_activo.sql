-- Add nombre (display name) and activo (soft delete) to existing indicators table
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS nombre text;
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;

UPDATE indicators SET nombre = description WHERE nombre IS NULL;

COMMENT ON COLUMN indicators.nombre IS 'Short display name for the indicator (shown in tree and DSL autocomplete)';
COMMENT ON COLUMN indicators.activo IS 'Soft delete flag — inactive indicators hidden from teacher UI';
