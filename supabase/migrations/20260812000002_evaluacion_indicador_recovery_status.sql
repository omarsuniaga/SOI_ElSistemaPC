-- ============================================================================
-- Migration: Add recovery status tracking to evaluacion_indicador
-- Date: 2026-08-12
-- Purpose: Track absence-based academic deficits and recovery sessions
-- ============================================================================

-- 1. Add recovery_status column with default 'pendiente'
ALTER TABLE evaluacion_indicador
ADD COLUMN IF NOT EXISTS recovery_status TEXT DEFAULT 'pendiente'
CHECK (recovery_status IN ('pendiente', 'recuperado', 'no_aplica'));

-- 2. Add recovery_notes for teacher observations during recovery
ALTER TABLE evaluacion_indicador
ADD COLUMN IF NOT EXISTS recovery_notes TEXT;

-- 3. Add recovery_timestamp to record when recovery was registered
ALTER TABLE evaluacion_indicador
ADD COLUMN IF NOT EXISTS recovery_timestamp TIMESTAMPTZ;

-- 4. Add recovery_grade (optional grade assigned during recovery, 1-5)
ALTER TABLE evaluacion_indicador
ADD COLUMN IF NOT EXISTS recovery_grade INTEGER
CHECK (recovery_grade IS NULL OR recovery_grade BETWEEN 1 AND 5);

-- 5. Create indices for efficient querying by recovery status
CREATE INDEX IF NOT EXISTS idx_ei_recovery_status ON evaluacion_indicador(recovery_status);
CREATE INDEX IF NOT EXISTS idx_ei_maestro_clase_recovery ON evaluacion_indicador(maestro_id, clase_id, recovery_status);

-- Note: maestro_id is obtained via evaluado_por column which references maestros(id)
-- The index above should work once evaluado_por is used for teacher filtering.
