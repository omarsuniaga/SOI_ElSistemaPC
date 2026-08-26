-- Canonical service-balance foundation for FIN.
-- Provider credentials and raw provider payloads are intentionally excluded.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.fin_service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_key text NOT NULL UNIQUE CHECK (connector_key ~ '^[a-z0-9_-]+$'),
  display_name text NOT NULL,
  connector_status text NOT NULL DEFAULT 'unconfigured'
    CHECK (connector_status IN ('unconfigured', 'active', 'disabled', 'unsupported')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_service_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.fin_service_providers(id) ON DELETE RESTRICT,
  display_name text NOT NULL,
  external_account_ref text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('energia', 'internet', 'agua', 'alquiler', 'software', 'seguro', 'otro')),
  currency_code char(3) NOT NULL DEFAULT 'DOP' CHECK (currency_code ~ '^[A-Z]{3}$'),
  essential boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  refresh_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_account_ref)
);

CREATE TABLE IF NOT EXISTS public.fin_service_refresh_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_account_id uuid NOT NULL REFERENCES public.fin_service_accounts(id) ON DELETE CASCADE,
  trigger_source text NOT NULL CHECK (trigger_source IN ('schedule', 'manual')),
  status text NOT NULL CHECK (status IN ('running', 'success', 'unsupported', 'skipped', 'error')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  error_code text,
  error_message text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.fin_service_balance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_account_id uuid NOT NULL REFERENCES public.fin_service_accounts(id) ON DELETE CASCADE,
  refresh_run_id uuid REFERENCES public.fin_service_refresh_runs(id) ON DELETE SET NULL,
  observed_at timestamptz NOT NULL,
  -- Some providers, such as CEPM's public endpoint, expose consumption units
  -- but no bill currency. Keep monetary fields null instead of inventing a price.
  balance_centavos bigint CHECK (balance_centavos IS NULL OR balance_centavos >= 0),
  amount_due_centavos bigint CHECK (amount_due_centavos IS NULL OR amount_due_centavos >= 0),
  due_date date,
  currency_code char(3) NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  source_snapshot_key text NOT NULL,
  provider_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_account_id, source_snapshot_key)
);

CREATE TABLE IF NOT EXISTS public.fin_service_refresh_state (
  service_account_id uuid PRIMARY KEY REFERENCES public.fin_service_accounts(id) ON DELETE CASCADE,
  locked_until timestamptz,
  lock_run_id uuid REFERENCES public.fin_service_refresh_runs(id) ON DELETE SET NULL,
  last_query_at timestamptz,
  last_success_at timestamptz,
  last_status text NOT NULL DEFAULT 'never'
    CHECK (last_status IN ('never', 'success', 'unsupported', 'skipped', 'error')),
  last_error_code text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fin_service_accounts_active
  ON public.fin_service_accounts (active, refresh_enabled);
CREATE INDEX IF NOT EXISTS idx_fin_service_snapshots_latest
  ON public.fin_service_balance_snapshots (service_account_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_fin_service_refresh_runs_recent
  ON public.fin_service_refresh_runs (service_account_id, started_at DESC);

CREATE OR REPLACE FUNCTION public.fn_fin_service_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fin_service_providers_updated_at ON public.fin_service_providers;
CREATE TRIGGER trg_fin_service_providers_updated_at
  BEFORE UPDATE ON public.fin_service_providers
  FOR EACH ROW EXECUTE FUNCTION public.fn_fin_service_set_updated_at();

DROP TRIGGER IF EXISTS trg_fin_service_accounts_updated_at ON public.fin_service_accounts;
CREATE TRIGGER trg_fin_service_accounts_updated_at
  BEFORE UPDATE ON public.fin_service_accounts
  FOR EACH ROW EXECUTE FUNCTION public.fn_fin_service_set_updated_at();

DROP TRIGGER IF EXISTS trg_fin_service_refresh_state_updated_at ON public.fin_service_refresh_state;
CREATE TRIGGER trg_fin_service_refresh_state_updated_at
  BEFORE UPDATE ON public.fin_service_refresh_state
  FOR EACH ROW EXECUTE FUNCTION public.fn_fin_service_set_updated_at();

CREATE OR REPLACE FUNCTION public.fn_fin_service_read_authorized()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() IN ('admin', 'superadmin', 'finanzas');
$$;

-- Atomically leases one account to a worker. Only backend service_role may call it.
CREATE OR REPLACE FUNCTION public.fn_fin_acquire_service_refresh_lock(
  p_service_account_id uuid,
  p_refresh_run_id uuid,
  p_lease_seconds integer DEFAULT 300
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id uuid;
BEGIN
  IF p_lease_seconds < 30 OR p_lease_seconds > 900 THEN
    RAISE EXCEPTION 'Invalid refresh lease duration';
  END IF;

  INSERT INTO public.fin_service_refresh_state (service_account_id, locked_until, lock_run_id)
  VALUES (p_service_account_id, clock_timestamp() + make_interval(secs => p_lease_seconds), p_refresh_run_id)
  ON CONFLICT (service_account_id) DO UPDATE
    SET locked_until = EXCLUDED.locked_until,
        lock_run_id = EXCLUDED.lock_run_id
    WHERE public.fin_service_refresh_state.locked_until IS NULL
       OR public.fin_service_refresh_state.locked_until < clock_timestamp()
  RETURNING service_account_id INTO v_account_id;

  RETURN v_account_id IS NOT NULL;
END;
$$;

-- Releases only the lease held by the same refresh run. A late worker cannot
-- clear a newer worker's lock after its original lease has expired.
CREATE OR REPLACE FUNCTION public.fn_fin_complete_service_refresh(
  p_service_account_id uuid,
  p_refresh_run_id uuid,
  p_status text,
  p_error_code text,
  p_record_query boolean,
  p_success boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF p_status NOT IN ('success', 'unsupported', 'skipped', 'error') THEN
    RAISE EXCEPTION 'Invalid refresh status';
  END IF;

  UPDATE public.fin_service_refresh_state
  SET locked_until = NULL,
      lock_run_id = NULL,
      last_query_at = CASE WHEN p_record_query THEN clock_timestamp() ELSE last_query_at END,
      last_success_at = CASE WHEN p_success THEN clock_timestamp() ELSE last_success_at END,
      last_status = p_status,
      last_error_code = p_error_code
  WHERE service_account_id = p_service_account_id
    AND lock_run_id = p_refresh_run_id;
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN v_updated = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_fin_service_dashboard()
RETURNS TABLE (
  service_account_id uuid,
  provider_key text,
  provider_name text,
  account_name text,
  service_type text,
  essential boolean,
  refresh_enabled boolean,
  connector_status text,
  observed_at timestamptz,
  balance_centavos bigint,
  amount_due_centavos bigint,
  due_date date,
  currency_code char(3),
  days_remaining integer,
  last_query_at timestamptz,
  last_success_at timestamptz,
  last_status text,
  last_error_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.fn_fin_service_read_authorized() THEN
    RAISE EXCEPTION 'FIN service balance access denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    account.id,
    provider.connector_key,
    provider.display_name,
    account.display_name,
    account.service_type,
    account.essential,
    account.refresh_enabled,
    provider.connector_status,
    snapshot.observed_at,
    snapshot.balance_centavos,
    snapshot.amount_due_centavos,
    snapshot.due_date,
    COALESCE(snapshot.currency_code, account.currency_code),
    CASE WHEN snapshot.due_date IS NULL THEN NULL ELSE snapshot.due_date - current_date END,
    state.last_query_at,
    state.last_success_at,
    COALESCE(state.last_status, 'never'),
    state.last_error_code
  FROM public.fin_service_accounts account
  JOIN public.fin_service_providers provider ON provider.id = account.provider_id
  LEFT JOIN public.fin_service_refresh_state state ON state.service_account_id = account.id
  LEFT JOIN LATERAL (
    SELECT s.observed_at, s.balance_centavos, s.amount_due_centavos, s.due_date, s.currency_code
    FROM public.fin_service_balance_snapshots s
    WHERE s.service_account_id = account.id
    ORDER BY s.observed_at DESC, s.created_at DESC
    LIMIT 1
  ) snapshot ON true
  WHERE account.active = true AND provider.active = true
  ORDER BY snapshot.due_date NULLS LAST, account.display_name;
END;
$$;

ALTER TABLE public.fin_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_service_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_service_refresh_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_service_balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_service_refresh_state ENABLE ROW LEVEL SECURITY;

-- No direct browser table access. FIN reads the restricted dashboard RPC only.
REVOKE ALL ON TABLE public.fin_service_providers,
  public.fin_service_accounts,
  public.fin_service_refresh_runs,
  public.fin_service_balance_snapshots,
  public.fin_service_refresh_state FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.fn_fin_service_read_authorized() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_fin_acquire_service_refresh_lock(uuid, uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_fin_complete_service_refresh(uuid, uuid, text, text, boolean, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_fin_service_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_fin_service_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_fin_acquire_service_refresh_lock(uuid, uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_fin_complete_service_refresh(uuid, uuid, text, text, boolean, boolean) TO service_role;
