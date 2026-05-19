-- Phase D: Add es_promocionado column and index for batch promotion scheduler

-- Add es_promocionado boolean column to sesiones_clase
ALTER TABLE sesiones_clase
ADD COLUMN IF NOT EXISTS es_promocionado BOOLEAN DEFAULT false;

-- Compound index for query performance during cron batch operations
-- Filters on both fecha_fin and es_promocionado to find pending sessions
CREATE INDEX IF NOT EXISTS idx_sesiones_clase_promotion
ON sesiones_clase(fecha_fin, es_promocionado)
WHERE fecha_fin IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN sesiones_clase.es_promocionado IS 'Flag indicating whether draft observations from this session have been promoted to observaciones_alumnos. Used by nightly cron job to prevent re-promotion (idempotence guard).';
