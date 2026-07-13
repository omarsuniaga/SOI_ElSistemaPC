-- Migration: Secure internal edge function authentication
-- Date: 2026-07-15
-- Description:
--   1. Seeds INTERNAL_FN_KEY into system_config (placeholder — replace before running)
--   2. Creates helper to read the key at runtime
--   3. Updates on_notification_inserted() trigger to send x-internal-key
--   4. Reschedules cron jobs with x-internal-key header
--
-- IMPORTANT: Replace 'CHANGE_ME_GENERATE_A_RANDOM_KEY' below with a real secret
-- and set it via: supabase secrets set INTERNAL_FN_KEY=<same_key>

-- ── 1. Helper: read internal fn key from system_config ──────────────────────
CREATE OR REPLACE FUNCTION public.get_internal_fn_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_key TEXT;
BEGIN
  SELECT value INTO v_key FROM public.system_config WHERE key = 'internal_fn_key' LIMIT 1;
  RETURN v_key;
END;
$$;

-- ── 2. Seed placeholder INTERNAL_FN_KEY ─────────────────────────────────────
INSERT INTO public.system_config (key, value, description)
VALUES (
  'internal_fn_key',
  '4ARF5zMcQ66jvtoX37bOjLmhLZTtsWSU2rkwUPpTms',
  'Internal function key for edge-to-edge function auth (x-internal-key header). Must match supabase secrets set INTERNAL_FN_KEY'
)
ON CONFLICT (key) DO NOTHING;

-- ── 3. Update push notification trigger ─────────────────────────────────────
-- Remove anon key from the trigger function; use x-internal-key instead.
CREATE OR REPLACE FUNCTION public.on_notification_inserted()
RETURNS TRIGGER AS $$
DECLARE
  v_payload JSONB;
  v_url TEXT;
  v_fn_key TEXT;
  v_actions JSONB := '[]'::jsonb;
BEGIN
  v_url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/send-push';
  v_fn_key := public.get_internal_fn_key();

  IF v_fn_key IS NULL OR v_fn_key = '' THEN
    RAISE WARNING '[on_notification_inserted] INTERNAL_FN_KEY no configurada en system_config — saltando push para %', NEW.id;
    RETURN NEW;
  END IF;

  IF NEW.tipo = 'sesion_sin_registrar' OR NEW.titulo = 'Asistencia Pendiente' THEN
    v_actions := '[
      {
        "action": "mark-read",
        "title": "Entendido (Marcar Leído)",
        "icon": "/icons/check.png"
      }
    ]'::jsonb;
  ELSE
    v_actions := '[
      {
        "action": "mark-read",
        "title": "Marcar como Leído",
        "icon": "/icons/check.png"
      }
    ]'::jsonb;
  END IF;

  v_payload := jsonb_build_object(
    'profile_id', NEW.profile_id,
    'title', NEW.titulo,
    'body', NEW.mensaje,
    'actions', v_actions,
    'data', jsonb_build_object(
      'notification_id', NEW.id,
      'clase_id', NEW.clase_id,
      'tipo', NEW.tipo,
      'created_at', NEW.created_at
    )
  );

  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-key', v_fn_key
    )::json,
    body := v_payload::json,
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[on_notification_inserted] Fallo al enviar push para notificacion %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. Reschedule recordar-citas cron with x-internal-key ───────────────────
SELECT cron.unschedule('recordar-citas-diario');

SELECT cron.schedule(
  'recordar-citas-diario',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/recordar-citas',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-key', public.get_internal_fn_key()
    )::json,
    body := '{}'::json,
    timeout_milliseconds := 60000
  );
  $$
);

-- ── 5. Reschedule telegram cron jobs with x-internal-key ────────────────────
SELECT cron.unschedule('telegram-ingest-poll');
SELECT cron.unschedule('telegram-classifier-process');

SELECT cron.schedule(
  'telegram-ingest-poll',
  '*/2 * * * *',
  $$
  SELECT net.http_get(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/telegram-webhook/poll',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-key', public.get_internal_fn_key()
    )::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'telegram-classifier-process',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/telegram-classifier-cron/process',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-key', public.get_internal_fn_key()
    )::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
