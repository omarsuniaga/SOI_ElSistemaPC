-- Migration: Schedule recordar-citas Edge Function daily at 7:00 AM
--
-- Depende de: pg_net extension (ya activa, usada en trigger de notificaciones push)
-- Edge Function: recordar-citas (enviada como POST)

-- Programar ejecución diaria a las 7:00 AM (hora del servidor, UTC-4 / UTC-5)
SELECT cron.schedule(
  'recordar-citas-diario',
  '0 11 * * *', -- 11:00 UTC = 7:00 AM EST / 6:00 AM AST
  $$
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/recordar-citas',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'
    )::json,
    body := '{}'::json,
    timeout_milliseconds := 60000
  );
  $$
);
