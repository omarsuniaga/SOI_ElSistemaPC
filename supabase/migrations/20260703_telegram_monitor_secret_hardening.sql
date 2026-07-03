-- Fix: telegram_monitor_healthcheck_secret era legible por CUALQUIER usuario
-- autenticado vía "system_config_public_keys_read" (su blocklist es anterior al
-- pipeline de Telegram y nunca incluyó esta key). Además, el secreto quedó
-- hardcodeado en texto plano en 20260702_telegram_cron_jobs.sql (commiteado a git).
--
-- Aplicada en producción vía MCP el 2026-07-03.

-- 1) Cierra el gap de RLS
drop policy if exists "system_config_public_keys_read" on public.system_config;
create policy "system_config_public_keys_read" on public.system_config
  for select to authenticated
  using (
    key not in ('groq_api_key','openrouter_api_key','vapid_private_key','admin_invite_code','telegram_monitor_healthcheck_secret')
  );

-- 2) Rota el secreto (el valor viejo quedó en el historial de git + fue legible por
-- cualquier autenticado, así que no se puede confiar en él)
update public.system_config
set value = encode(gen_random_bytes(24), 'hex'), updated_at = now()
where key = 'telegram_monitor_healthcheck_secret';

-- 3) Reprograma los cron jobs para leer el secreto dinámicamente en vez de un
-- literal, y califica pg_net por schema (consistente con recordar-citas-diario).
select cron.schedule(
  'telegram-ingest-poll',
  '*/2 * * * *',
  $cron$
  select net.http_get(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/telegram-webhook/poll',
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $cron$
);

select cron.schedule(
  'telegram-classifier-process',
  '*/5 * * * *',
  $cron$
  select net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/telegram-classifier-cron/process',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Monitor-Token', (select value from public.system_config where key = 'telegram_monitor_healthcheck_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $cron$
);
