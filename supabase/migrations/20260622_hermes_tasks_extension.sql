-- ============================================================
-- Migration: Hermes Tasks Schema Extension
-- Timestamp: 20260622_hermes_tasks_extension
-- Project: sistema-academico-pwa
-- Description: Extends tareas_institucionales to link minutas and document attachments
-- Date: 2026-06-22
-- ============================================================

-- 1. Add fields to public.tareas_institucionales
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS minuta_id uuid REFERENCES public.minutas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS documentos_adjuntos jsonb DEFAULT '[]'::jsonb;

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_tareas_minuta ON public.tareas_institucionales(minuta_id);
