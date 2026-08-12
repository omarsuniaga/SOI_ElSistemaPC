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
-- No existe columna maestro_id en esta tabla; el autor de la evaluación se
-- registra en evaluado_por (FK a maestros). Se indexa clase_id+recovery_status,
-- que es el filtro real que usan las consultas de deuda académica.
CREATE INDEX IF NOT EXISTS idx_ei_clase_recovery ON evaluacion_indicador(clase_id, recovery_status);
