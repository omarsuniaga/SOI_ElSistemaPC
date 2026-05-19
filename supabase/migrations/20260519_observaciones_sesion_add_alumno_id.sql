-- Phase C: Add alumno_id column to observaciones_sesion for promotion filtering
-- Idempotent migration: safe to re-run

-- Add alumno_id column if not present
ALTER TABLE observaciones_sesion
ADD COLUMN IF NOT EXISTS alumno_id UUID;

-- Create index for fast filtering on (sesion_id, alumno_id, es_borrador)
-- This supports the promotion query pattern: SELECT ... WHERE sesion_id = ? AND es_borrador = true
CREATE INDEX IF NOT EXISTS idx_observaciones_sesion_sesion_alumno_borrador
ON observaciones_sesion(sesion_id, alumno_id, es_borrador);

-- Comment for documentation
COMMENT ON COLUMN observaciones_sesion.alumno_id IS 'Student identifier for filtering during promotion from session to alumno tables. Populated during promotion or bulk backfill.';
COMMENT ON INDEX idx_observaciones_sesion_sesion_alumno_borrador IS 'Supports promotion queries: (sesion_id, alumno_id, es_borrador) filter pattern.';
