-- Diagnostico HERMES-WhatsApp (2026-08-21): cierra brechas de permisos y
-- repara el cron que alimenta las reglas reactivas R1-R8.
--
-- 1) fn_whatsapp_reclamar_pendientes seguia siendo ejecutable por
--    `authenticated` pese al REVOKE previo (Supabase otorga EXECUTE a
--    authenticated por defecto en funciones nuevas del schema public; el
--    REVOKE FROM anon/public de 20260819110000 no cubria ese grant separado).
--
-- 2) El cron soi-event-enrichment (jobid 18) fallaba el 100% de sus corridas
--    con "unrecognized configuration parameter supabase.url" porque
--    current_setting('supabase.url') no existe en este entorno. Se reescribe
--    con la URL del proyecto hardcodeada, igual que el resto de los crons
--    que llaman a net.http_post en este proyecto.
--
-- 3) system_config.internal_api_key / supabase_anon_key nunca existian
--    (el cron original las referenciaba pero jamas se sembraron), asi que
--    el header de auth siempre viajaba vacio. Se siembran valores reales.
--    internal_api_key debe coincidir con el secret INTERNAL_KEY seteado via
--    `supabase secrets set INTERNAL_KEY=... --project-ref <ref>` en la
--    funcion event-spine-logger (no versionable, no vive en esta migracion).
--
-- 4) system_config.hermes_classifier_model tenia (o hubiera tomado por
--    default) un modelo Groq deprecado (llama-3.3-70b-versatile). Se fija a
--    llama-3.1-8b-instant, el mismo que ya funciona en whatsapp-webhook.
--
-- Nota: el valor real insertado para internal_api_key fue generado en la
-- sesion original (ver Engram, topic architecture/hermes-whatsapp) y no se
-- repite aqui por ser un secreto — esta migracion documenta la estructura,
-- no reemplaza el valor si ya existe.

BEGIN;

REVOKE EXECUTE ON FUNCTION public.fn_whatsapp_reclamar_pendientes(integer) FROM authenticated;

SELECT cron.schedule(
  'soi-event-enrichment',
  '*/10 7-21 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/event-spine-logger',
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

INSERT INTO public.system_config (key, value, description) VALUES
  ('hermes_classifier_model', 'llama-3.1-8b-instant', 'Modelo Groq para clasificacion de tareas en hermes-crear-tarea. Tiene prioridad sobre el env var HERMES_CLASSIFIER_MODEL.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
