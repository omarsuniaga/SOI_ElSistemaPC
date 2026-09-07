-- One active queue worker per WhatsApp instance.
BEGIN;

CREATE TABLE IF NOT EXISTS public.hermes_gateway_worker_lease (
  instance_name text PRIMARY KEY,
  owner_id text NOT NULL,
  lease_until timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hermes_gateway_worker_lease ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hermes_gateway_worker_lease_service_role ON public.hermes_gateway_worker_lease;
CREATE POLICY hermes_gateway_worker_lease_service_role
  ON public.hermes_gateway_worker_lease
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.hermes_gateway_worker_lease FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.hermes_gateway_worker_lease TO service_role;

CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_acquire_lease(
  p_instance_name text,
  p_owner_id text,
  p_duration_seconds integer DEFAULT 30
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acquired boolean := false;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Solo service_role puede adquirir el lease del gateway';
  END IF;
  IF nullif(btrim(p_instance_name), '') IS NULL OR nullif(btrim(p_owner_id), '') IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.hermes_gateway_worker_lease (instance_name, owner_id, lease_until)
  VALUES (btrim(p_instance_name), btrim(p_owner_id), now() + make_interval(secs => greatest(p_duration_seconds, 10)))
  ON CONFLICT (instance_name) DO UPDATE
  SET owner_id = EXCLUDED.owner_id,
      lease_until = EXCLUDED.lease_until,
      updated_at = now()
  WHERE public.hermes_gateway_worker_lease.lease_until < now()
     OR public.hermes_gateway_worker_lease.owner_id = EXCLUDED.owner_id
  RETURNING true INTO v_acquired;

  RETURN coalesce(v_acquired, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_release_lease(
  p_instance_name text,
  p_owner_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Solo service_role puede liberar el lease del gateway';
  END IF;

  DELETE FROM public.hermes_gateway_worker_lease
  WHERE instance_name = btrim(p_instance_name)
    AND owner_id = btrim(p_owner_id);
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_hermes_gateway_acquire_lease(text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_hermes_gateway_release_lease(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_acquire_lease(text, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_release_lease(text, text) TO service_role;

COMMIT;
