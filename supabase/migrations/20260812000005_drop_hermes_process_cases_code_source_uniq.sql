-- ============================================================================
-- Migration: 20260812000005_drop_hermes_process_cases_code_source_uniq.sql
-- Description: Drop erroneous unique constraint on (process_code, source).
-- Institutional process cases are recurring and allow multiple executions.
-- ============================================================================

ALTER TABLE public.hermes_process_cases
  DROP CONSTRAINT IF EXISTS hermes_process_cases_code_source_uniq;

DROP INDEX IF EXISTS public.hermes_process_cases_code_source_uniq;
DROP INDEX IF EXISTS public.idx_hermes_process_cases_code_source;
