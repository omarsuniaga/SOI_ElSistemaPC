-- Migration: Extend notificaciones table for escalation tracking
-- Purpose: Link notifications to specific pending registros and track escalation level
-- Date: 2026-05-20

ALTER TABLE notificaciones ADD COLUMN (
  registro_pendiente_id UUID REFERENCES registros_pendientes(id) ON DELETE CASCADE,
  escalation_level INT DEFAULT 0 COMMENT 'Escalation tier: 0=first (2h), 1=AMARILLO (4h), 2=NARANJA (4h), 3=ROJO (30min)',
  scheduled_for TIMESTAMPTZ COMMENT 'Next intended send time if record not resolved'
);

-- Create index for efficient notification history queries
CREATE INDEX idx_notificaciones_registro_pendiente ON notificaciones(registro_pendiente_id);
CREATE INDEX idx_notificaciones_escalation_level ON notificaciones(escalation_level);
