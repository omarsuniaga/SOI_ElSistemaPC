CREATE TABLE IF NOT EXISTS public.telegram_allowed_users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id    bigint NOT NULL UNIQUE,
  nombre              text NOT NULL,
  rol                 text NOT NULL,
  activo              boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS telegram_allowed_users_activo_idx
  ON public.telegram_allowed_users (telegram_user_id)
  WHERE activo = true;

ALTER TABLE public.telegram_allowed_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.telegram_allowed_users;
CREATE POLICY "service_role_all" ON public.telegram_allowed_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_own" ON public.telegram_allowed_users;
CREATE POLICY "authenticated_read_own" ON public.telegram_allowed_users
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );
