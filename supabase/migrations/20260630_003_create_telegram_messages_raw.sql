CREATE TABLE IF NOT EXISTS public.telegram_messages_raw (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_message_id bigint NOT NULL UNIQUE,
  telegram_chat_id    bigint NOT NULL,
  telegram_user_id    bigint NOT NULL,
  message_type        text NOT NULL DEFAULT 'text',
  raw_payload         jsonb NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS telegram_messages_raw_chat_idx
  ON public.telegram_messages_raw (telegram_chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS telegram_messages_raw_user_idx
  ON public.telegram_messages_raw (telegram_user_id, created_at DESC);

ALTER TABLE public.telegram_messages_raw ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.telegram_messages_raw;
CREATE POLICY "service_role_all" ON public.telegram_messages_raw
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "deny_anon" ON public.telegram_messages_raw;
CREATE POLICY "deny_anon" ON public.telegram_messages_raw
  FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_authenticated" ON public.telegram_messages_raw;
CREATE POLICY "deny_authenticated" ON public.telegram_messages_raw
  FOR ALL TO authenticated USING (false) WITH CHECK (false);
