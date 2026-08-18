-- ============================================================================
-- Migration: SOI Event Enrichment Consumer — pg_cron Scheduler (M1)
-- Timestamp: 20260818000002
-- Project: sistema-academico-pwa
-- Description: Schedule event-spine-logger edge function via pg_cron
-- Requirement: AC-CON-04 (Scheduling via pg_cron)
-- Date: 2026-08-18
-- ============================================================================

-- Ensure pg_cron and pg_net extensions are enabled
-- These are already active in most Supabase projects
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotent unschedule guard: remove job if it already exists
-- This allows migrations to be re-run without errors
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'soi-event-enrichment') THEN
    PERFORM cron.unschedule('soi-event-enrichment');
  END IF;
END $$;

-- Schedule event-spine-logger consumer
-- Pattern: */10 7-21 * * 1-5 = Every 10 minutes, 07:00–21:00 UTC, Monday–Friday
-- This matches academic hours in Dominican time (UTC-4)
SELECT cron.schedule(
  'soi-event-enrichment',
  '*/10 7-21 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://' || (SELECT current_setting('supabase.url')) || '/functions/v1/event-spine-logger',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM system_config WHERE key = 'supabase_anon_key'),
      'x-internal-key', (SELECT value FROM system_config WHERE key = 'internal_api_key')
    ),
    body := '{"source":"cron"}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- ============================================================================
-- NOTE: Supabase Functions URL and API Keys
-- ============================================================================
-- The URLs and keys are stored in system_config table for centralized management.
-- If these keys don't exist in system_config, the job will fail silently.
-- To verify the schedule is active, run:
--   SELECT * FROM cron.job WHERE jobname = 'soi-event-enrichment';
-- ============================================================================
