-- Migration: Add dedup_key column to notificaciones for deduplication tracking
-- Purpose: Enables smart dedup logic to prevent duplicate notifications within 24h window
-- Used by: generate_pending_class_notifications() function
-- Date: 2026-05-20

ALTER TABLE notificaciones
ADD COLUMN dedup_key TEXT;

-- Index for efficient dedup lookups
CREATE INDEX idx_notificaciones_dedup_key
ON notificaciones(dedup_key)
WHERE dedup_key IS NOT NULL;
