-- (A) Nueva columna telegram_user_id en hermes_inbox
ALTER TABLE public.hermes_inbox
  ADD COLUMN IF NOT EXISTS telegram_user_id bigint NULL;

CREATE INDEX IF NOT EXISTS hermes_inbox_rate_limit_idx
  ON public.hermes_inbox (telegram_user_id, created_at DESC)
  WHERE telegram_user_id IS NOT NULL;

-- (B) CHECK constraint nuevo (la tabla NO tiene CHECK hoy)
ALTER TABLE public.hermes_inbox
  ADD CONSTRAINT hermes_inbox_canal_check
  CHECK (canal IN ('db_trigger', 'telegram'));
