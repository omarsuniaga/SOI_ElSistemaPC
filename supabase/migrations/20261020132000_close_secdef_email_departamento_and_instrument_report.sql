-- ════════════════════════════════════════════════════════════════════════════
-- 20261020132000_close_secdef_email_departamento_and_instrument_report.sql
--
-- Two SECURITY DEFINER functions found while auditing block 5 (see docs/security/authenticated-wide-open/
-- INFORME_BLOQUE_5.md, findings L1 and L2). Row level security does not apply to them: they run as owner.
--
--  public.fn_email_departamento(text)
--     returns the mailbox of a department by its code. EXECUTE was granted to PUBLIC/anon/authenticated:
--     anybody without a session could read department mailboxes. Its only caller is the send-email edge
--     function, which invokes it with the service-role key (no client code, no cron, no other function).
--     -> EXECUTE only for service_role (the owner keeps it implicitly).
--
--  public.fn_reportar_instrumento_danado(uuid, text, uuid, text)
--     marks ANY instrument as damaged and opens five Hermes tasks (LUT/LOG/FIN/ACM/COM). EXECUTE belonged to
--     every signed-in account and the body checks no role. Only the instruments screen calls it.
--     -> The original body is kept untouched as fn_reportar_instrumento_danado_impl (no EXECUTE for anybody
--        but the owner) and the public name becomes a guarded wrapper with the same signature and result:
--        it requires tiene_capacidad_academica('catalogo:escribir') (admin, superadmin, coordinacion_academica),
--        the same authority that may edit the inventory after block 5. anon: no EXECUTE.
--
-- NOT TOUCHED: every other SECURITY DEFINER function (see the secdef-anon audit), p_actor_id (still supplied
-- by the caller, as before).
--
-- ROLLBACK: supabase/rollback/20261020132000_close_secdef_email_departamento_and_instrument_report.rollback.sql
-- TESTS   : supabase/tests/secdef-email-instrument/
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

DO $$
BEGIN
  IF to_regprocedure('public.tiene_capacidad_academica(text)') IS NULL THEN
    RAISE EXCEPTION 'missing public.tiene_capacidad_academica(text): apply 20261017180000 first';
  END IF;
  IF to_regprocedure('public.fn_email_departamento(text)') IS NULL THEN
    RAISE EXCEPTION 'missing public.fn_email_departamento(text)';
  END IF;
  IF to_regprocedure('public.fn_reportar_instrumento_danado(uuid, text, uuid, text)') IS NULL THEN
    RAISE EXCEPTION 'missing public.fn_reportar_instrumento_danado(uuid, text, uuid, text)';
  END IF;
END $$;

-- ── 1. fn_email_departamento: service_role only ─────────────────────────────
REVOKE ALL ON FUNCTION public.fn_email_departamento(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_email_departamento(text) TO service_role;

-- ── 2. fn_reportar_instrumento_danado: original body -> _impl, guarded wrapper under the public name ──
-- First run: the public name still holds the original body. Re-run: the _impl already exists, keep it.
DO $$
BEGIN
  IF to_regprocedure('public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text)') IS NULL THEN
    ALTER FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text)
      RENAME TO fn_reportar_instrumento_danado_impl;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fn_reportar_instrumento_danado(
  p_instrumento_id uuid, p_descripcion text, p_actor_id uuid, p_actor_nombre text)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.tiene_capacidad_academica('catalogo:escribir') THEN
    RAISE EXCEPTION 'not authorised to report a damaged instrument' USING ERRCODE = '42501';
  END IF;
  RETURN public.fn_reportar_instrumento_danado_impl(p_instrumento_id, p_descripcion, p_actor_id, p_actor_nombre);
END
$$;

COMMENT ON FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text) IS
  'Guarded entry point: requires catalogo:escribir (admin, superadmin, coordinacion_academica), then delegates to fn_reportar_instrumento_danado_impl (the original body).';

REVOKE ALL ON FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text) TO authenticated;

-- ── 3. Self-check ───────────────────────────────────────────────────────────
DO $$
DECLARE v_bad text;
BEGIN
  SELECT string_agg(f || ':' || r, ', ') INTO v_bad
  FROM unnest(ARRAY['public.fn_email_departamento(text)',
                    'public.fn_reportar_instrumento_danado(uuid, text, uuid, text)',
                    'public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text)']) AS f,
       unnest(ARRAY['anon', 'public']) AS r
  WHERE has_function_privilege(r, f::regprocedure, 'EXECUTE');
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'anon/public can still execute: %', v_bad;
  END IF;
  IF has_function_privilege('authenticated', 'public.fn_email_departamento(text)'::regprocedure, 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text)'::regprocedure, 'EXECUTE')
     OR has_function_privilege('service_role', 'public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text)'::regprocedure, 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated/service_role can still execute a function that must be closed';
  END IF;
  IF NOT has_function_privilege('service_role', 'public.fn_email_departamento(text)'::regprocedure, 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.fn_reportar_instrumento_danado(uuid, text, uuid, text)'::regprocedure, 'EXECUTE') THEN
    RAISE EXCEPTION 'a legitimate caller lost EXECUTE';
  END IF;
  IF (SELECT prosrc FROM pg_proc WHERE oid = 'public.fn_reportar_instrumento_danado(uuid, text, uuid, text)'::regprocedure)
       NOT LIKE '%tiene_capacidad_academica%' THEN
    RAISE EXCEPTION 'the public entry point lost its authorisation guard';
  END IF;
END $$;

COMMIT;
