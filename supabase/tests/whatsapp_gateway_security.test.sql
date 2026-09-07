-- Run against a disposable Supabase database after applying the WhatsApp
-- migrations. This test intentionally checks privileges and policy shape, not
-- application data.

BEGIN;

DO $$
DECLARE
  v_rls boolean;
  v_policy_count integer;
  v_privileges text[];
BEGIN
  SELECT c.relrowsecurity INTO v_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'hermes_gateway_health';
  IF coalesce(v_rls, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'hermes_gateway_health must have RLS enabled';
  END IF;

  SELECT count(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'hermes_gateway_worker_lease'
    AND roles = ARRAY['service_role']::name[];
  IF v_policy_count <> 1 THEN
    RAISE EXCEPTION 'worker lease must have exactly one service_role policy';
  END IF;

  SELECT array_agg(privilege_type ORDER BY privilege_type) INTO v_privileges
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'fn_hermes_gateway_heartbeat'
    AND grantee = 'authenticated';
  IF coalesce(v_privileges, ARRAY[]::text[]) <> ARRAY[]::text[] THEN
    RAISE EXCEPTION 'authenticated must not execute gateway heartbeat';
  END IF;

  SELECT array_agg(privilege_type ORDER BY privilege_type) INTO v_privileges
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'fn_hermes_gateway_acquire_lease'
    AND grantee = 'authenticated';
  IF coalesce(v_privileges, ARRAY[]::text[]) <> ARRAY[]::text[] THEN
    RAISE EXCEPTION 'authenticated must not acquire worker lease';
  END IF;
END $$;

ROLLBACK;
