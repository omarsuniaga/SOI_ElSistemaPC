-- Hardening for the enrollment-funnel objects (Supabase advisor findings):
--  1. vw_admin_enrollment_calendar was SECURITY DEFINER (default) -> would let
--     any 'authenticated' user with the view GRANT read applicant PII past the
--     admin-only RLS on applicants/appointments. Switch to security_invoker so
--     the caller's RLS applies (only role 'admin' sees rows).
--  2. Pin search_path on the module functions (SECURITY DEFINER hardening).

ALTER VIEW public.vw_admin_enrollment_calendar SET (security_invoker = true);

ALTER FUNCTION public.fn_enrollment_funnel_set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_morning_admissions_briefing()      SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_dispatch_enrollment_reminders()    SET search_path = public, pg_temp;