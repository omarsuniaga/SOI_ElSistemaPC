-- Migration: Add escalation tracking fields to registros_pendientes
-- Purpose: Track notification timing, count, and escalation state for asistencias reminders
-- Date: 2026-05-20

ALTER TABLE registros_pendientes ADD COLUMN (
  last_notified_at TIMESTAMPTZ,
  notif_count INT DEFAULT 0,
  notification_state TEXT DEFAULT 'VERDE' CHECK (notification_state IN ('VERDE', 'AMARILLO', 'NARANJA', 'ROJO')),
  dias_atraso INT GENERATED ALWAYS AS (
    CEIL(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400)
  ) STORED
);

-- Create index for efficient scheduler queries
CREATE INDEX idx_registros_pendientes_notification_state ON registros_pendientes(notification_state);
CREATE INDEX idx_registros_pendientes_last_notified ON registros_pendientes(last_notified_at);
