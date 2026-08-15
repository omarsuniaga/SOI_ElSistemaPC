-- ============================================================
-- Migration: Cron — hermes-event-monitor (chequeo de completitud cada 1h)
-- Timestamp: 20260815000002
-- Description:
--   Programa el cron job que invoca hermes-event-monitor cada hora.
--   La función detecta eventos con 100% de tareas completadas/canceladas
--   y envía email de alerta a DIR para descargar el Acta de Cierre PDF.
--
-- IMPORTANTE: Requiere pg_net (ya activo en el proyecto).
-- Ejecutar DESPUÉS de deployar la edge function hermes-event-monitor.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron: revisar completitud de eventos cada hora (minuto 5 de cada hora)
-- Auth: anon key como Bearer JWT (la edge function acepta Bearer OR x-hermes-token)
-- Guard: si el job ya existe, lo desprograma antes de reprogramar (idempotente).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'hermes-event-completion-monitor') THEN
    PERFORM cron.unschedule('hermes-event-completion-monitor');
  END IF;
END $$;

SELECT cron.schedule(
  'hermes-event-completion-monitor',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/hermes-event-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaG1kdm15ZXlzd3VudXJjeW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzI3MjEsImV4cCI6MjA5MjkwODcyMX0.ZEPI2FuJ-apwZYR20PAjAOLRUNIpfknG1LHDCUUwMRs'
    ),
    body := '{"check_all": true}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- Verificar que el cron fue creado:
-- SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'hermes-event-completion-monitor';
