-- Telegram pipeline: cron jobs para ingest y clasificación

CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Ingest: cada 2 minutos, GET /poll al webhook
SELECT cron.schedule(
  'telegram-ingest-poll',
  '*/2 * * * *',
  'SELECT http_get(
    url := ''https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/telegram-webhook/poll'',
    headers := ''{"Content-Type": "application/json"}''::jsonb
  ) AS request_id;'
);

-- 2. Clasificador: cada 5 minutos, POST /process al classifier cron
SELECT cron.schedule(
  'telegram-classifier-process',
  '*/5 * * * *',
  'SELECT http_post(
    url := ''https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/telegram-classifier-cron/process'',
    headers := jsonb_build_object(
      ''Content-Type'', ''application/json'',
      ''X-Monitor-Token'', ''c4dfb0e7a1239685''
    ),
    body := ''{}''::jsonb
  ) AS request_id;'
);
