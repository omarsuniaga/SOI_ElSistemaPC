-- ============================================================================
-- Migration: Tareas Institucionales Idempotency Schema (M2)
-- Timestamp: 20260818000003
-- Project: sistema-academico-pwa
-- Description: Add correlation_id and source_event_id columns for idempotency
-- Requirement: AC-CON-05 (Idempotency — Replay-Safe)
-- Date: 2026-08-18
-- ============================================================================

-- Add correlation_id column (nullable, links to soi_eventos.correlation_id)
-- This enables idempotency checks: handlers can query existing tasks by correlation_id
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS correlation_id uuid;

-- Add source_event_id column (nullable, links to soi_eventos.id)
-- This tracks which event created this task for audit trail
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS source_event_id uuid REFERENCES public.soi_eventos(id) ON DELETE SET NULL;

-- Create partial UNIQUE index on (correlation_id, departamento) where correlation_id IS NOT NULL
-- This ensures at most one task per (correlation_id, department) pair
-- Allows multiple departments to create tasks for same correlation_id if needed
CREATE UNIQUE INDEX IF NOT EXISTS uq_tareas_correlation_departamento
  ON public.tareas_institucionales(correlation_id, departamento)
  WHERE correlation_id IS NOT NULL;

-- Create partial index for fast idempotency queries
-- Used by handlers to check: SELECT id FROM tareas WHERE correlation_id = ? AND created_at > now()-48h
CREATE INDEX IF NOT EXISTS idx_tareas_correlation_created
  ON public.tareas_institucionales(correlation_id, created_at DESC)
  WHERE correlation_id IS NOT NULL;

-- ============================================================================
-- NOTE: Idempotency Strategy
-- ============================================================================
-- Layer 1 (Database Level): UNIQUE constraint prevents duplicate inserts
-- Layer 2 (Handler Level): Handlers query for existing tasks by correlation_id
--   before creating new tasks, with time-window checks per rule:
--   - R1 (absences): 48h window
--   - R2 (vencida): 48h window
--   - R3 (periodo): 7d window
--   - R4 (sesion): 24h window
--   - R5 (justificacion): 24h window
--
-- This dual-layer design provides both database-level safety and
-- business-logic flexibility per rule.
-- ============================================================================
