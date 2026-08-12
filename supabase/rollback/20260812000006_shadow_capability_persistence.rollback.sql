-- CONTROLLED-ENVIRONMENT ROLLBACK ONLY.
-- This permanently deletes shadow proposal/audit evidence. Export it first.
BEGIN;
REVOKE ALL ON FUNCTION public.create_shadow_capability_proposal(jsonb, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transition_shadow_capability_proposal(uuid, text, integer, uuid) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.transition_shadow_capability_proposal(uuid, text, integer, uuid);
DROP FUNCTION IF EXISTS public.create_shadow_capability_proposal(jsonb, uuid);
DROP TABLE IF EXISTS public.shadow_capability_audit_events;
DROP TABLE IF EXISTS public.shadow_capability_proposals;
COMMIT;

