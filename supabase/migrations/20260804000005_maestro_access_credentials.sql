-- =============================================================================
-- Maestro access credentials vault
-- Stores recoverable maestro portal passwords encrypted at rest.
-- Access to plaintext must happen only through the admin-only Edge Function.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.maestro_access_credentials (
  maestro_id uuid PRIMARY KEY REFERENCES public.maestros(id) ON DELETE CASCADE,
  password_ciphertext text NOT NULL,
  password_iv text NOT NULL,
  password_version integer NOT NULL DEFAULT 1,
  last_generated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_revealed_at timestamp with time zone,
  last_revealed_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.maestro_access_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS maestro_access_credentials_service_role ON public.maestro_access_credentials;
CREATE POLICY maestro_access_credentials_service_role
  ON public.maestro_access_credentials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_maestro_access_credentials_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maestro_access_credentials_updated_at ON public.maestro_access_credentials;
CREATE TRIGGER trg_maestro_access_credentials_updated_at
  BEFORE UPDATE ON public.maestro_access_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_maestro_access_credentials_updated_at();

COMMENT ON TABLE public.maestro_access_credentials IS
'Encrypted vault for recoverable maestro portal passwords. Plaintext is only returned by the admin-only Edge Function.';
