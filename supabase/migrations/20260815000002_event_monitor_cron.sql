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
SELECT cron.schedule(
  'hermes-event-completion-monitor',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/hermes-event-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-hermes-token', current_setting('app.hermes_email_token', true)
    ),
    body := '{"check_all": true}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- Verificar que el cron fue creado:
-- SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'hermes-event-completion-monitor';
