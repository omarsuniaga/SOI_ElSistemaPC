-- ════════════════════════════════════════════════════════════════════════════
-- ROLLBACK of 20261020132000_close_secdef_email_departamento_and_instrument_report.sql
--
-- Restores the production state captured read-only on 2026-10-20:
--   fn_email_departamento              ACL {=X, postgres, anon, authenticated, service_role}
--   fn_reportar_instrumento_danado     original body, ACL {postgres, authenticated, service_role}
--
-- WARNING: this REOPENS the anonymous read of department mailboxes and lets every signed-in account mark any
-- instrument as damaged. Idempotent: safe to run twice.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

GRANT EXECUTE ON FUNCTION public.fn_email_departamento(text) TO PUBLIC, anon, authenticated, service_role;

DO $$
BEGIN
  IF to_regprocedure('public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text)') IS NOT NULL THEN
    DROP FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text);
    ALTER FUNCTION public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text)
      RENAME TO fn_reportar_instrumento_danado;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text) TO authenticated, service_role;

COMMIT;
