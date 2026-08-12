-- Persistent review evidence for the capability matrix.
-- This migration deliberately cannot apply or alter authorization.

CREATE TABLE IF NOT EXISTS public.shadow_capability_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  change_id text NOT NULL UNIQUE CHECK (change_id ~ '^shadow-[a-z0-9-]+$'),
  portal_id text NOT NULL CHECK (portal_id ~ '^[A-Za-z0-9_-]+$'),
  module_id text NOT NULL CHECK (module_id ~ '^[a-z0-9-]+$'),
  capability_id text NOT NULL CHECK (capability_id IN ('read', 'write', 'administer', 'execute')),
  operation text NOT NULL CHECK (operation IN ('propose-enable', 'propose-disable')),
  reason_code text NOT NULL CHECK (reason_code IN ('catalog-owner', 'coverage-correction', 'operational-review')),
  rollback_strategy text CHECK (rollback_strategy IN ('discard-proposal', 'restore-previous-proposal')),
  rollback_verification text CHECK (rollback_verification IN ('catalog-audit', 'navigation-smoke')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'simulated')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((rollback_strategy IS NULL) = (rollback_verification IS NULL)),
  CHECK (status NOT IN ('approved', 'simulated') OR rollback_strategy IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.shadow_capability_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.shadow_capability_proposals(id) ON DELETE RESTRICT,
  sequence integer NOT NULL CHECK (sequence > 0),
  from_status text CHECK (from_status IS NULL OR from_status IN ('draft', 'submitted', 'approved', 'rejected', 'simulated')),
  to_status text NOT NULL CHECK (to_status IN ('draft', 'submitted', 'approved', 'rejected', 'simulated')),
  action text NOT NULL CHECK (action IN ('create', 'submit', 'approve', 'reject', 'revise', 'simulate')),
  actor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
  request_key uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, sequence),
  UNIQUE (request_key)
);

CREATE INDEX IF NOT EXISTS idx_shadow_capability_proposals_updated_at
  ON public.shadow_capability_proposals(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_shadow_capability_audit_proposal
  ON public.shadow_capability_audit_events(proposal_id, sequence);

ALTER TABLE public.shadow_capability_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_capability_proposals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_capability_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_capability_audit_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shadow_capability_proposals_admin_select ON public.shadow_capability_proposals;
CREATE POLICY shadow_capability_proposals_admin_select
  ON public.shadow_capability_proposals FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS shadow_capability_audit_admin_select ON public.shadow_capability_audit_events;
CREATE POLICY shadow_capability_audit_admin_select
  ON public.shadow_capability_audit_events FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

CREATE OR REPLACE FUNCTION public.create_shadow_capability_proposal(
  p_payload jsonb,
  p_request_key uuid
)
RETURNS public.shadow_capability_proposals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_result public.shadow_capability_proposals;
  v_existing record;
  v_rollback jsonb := p_payload->'rollbackPlan';
BEGIN
  IF v_actor IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'shadow capability proposals require an administrator' USING ERRCODE = '42501';
  END IF;
  IF p_request_key IS NULL THEN
    RAISE EXCEPTION 'request_key is required' USING ERRCODE = '22023';
  END IF;

  SELECT e.proposal_id, e.action INTO v_existing
  FROM public.shadow_capability_audit_events e WHERE e.request_key = p_request_key;
  IF FOUND THEN
    IF v_existing.action <> 'create' THEN
      RAISE EXCEPTION 'request_key was already used for another operation' USING ERRCODE = '23505';
    END IF;
    SELECT * INTO v_result FROM public.shadow_capability_proposals WHERE id = v_existing.proposal_id;
    RETURN v_result;
  END IF;

  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object'
     OR NOT (p_payload ?& ARRAY['changeId','portalId','moduleId','capabilityId','operation','reasonCode'])
     OR EXISTS (SELECT 1 FROM jsonb_each_text(p_payload - 'rollbackPlan') entry
                WHERE entry.value IS NULL OR btrim(entry.value) = '')
     OR EXISTS (SELECT 1 FROM jsonb_object_keys(p_payload) k
                WHERE k NOT IN ('changeId','portalId','moduleId','capabilityId','operation','reasonCode','rollbackPlan')) THEN
    RAISE EXCEPTION 'invalid shadow proposal payload' USING ERRCODE = '22023';
  END IF;
  IF v_rollback IS NOT NULL AND (
       jsonb_typeof(v_rollback) <> 'object'
       OR EXISTS (SELECT 1 FROM jsonb_object_keys(v_rollback) k WHERE k NOT IN ('strategy','verification'))
     ) THEN
    RAISE EXCEPTION 'invalid rollback plan' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.shadow_capability_proposals (
    change_id, portal_id, module_id, capability_id, operation, reason_code,
    rollback_strategy, rollback_verification, created_by
  ) VALUES (
    p_payload->>'changeId', p_payload->>'portalId', p_payload->>'moduleId',
    p_payload->>'capabilityId', p_payload->>'operation', p_payload->>'reasonCode',
    v_rollback->>'strategy', v_rollback->>'verification', v_actor
  ) RETURNING * INTO v_result;

  INSERT INTO public.shadow_capability_audit_events
    (proposal_id, sequence, from_status, to_status, action, actor_id, request_key)
  VALUES (v_result.id, 1, NULL, 'draft', 'create', v_actor, p_request_key);
  RETURN v_result;
EXCEPTION WHEN unique_violation THEN
  SELECT e.proposal_id, e.action INTO v_existing
  FROM public.shadow_capability_audit_events e WHERE e.request_key = p_request_key;
  IF FOUND AND v_existing.action = 'create' THEN
    SELECT * INTO v_result FROM public.shadow_capability_proposals WHERE id = v_existing.proposal_id;
    RETURN v_result;
  END IF;
  RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_shadow_capability_proposal(
  p_proposal_id uuid,
  p_action text,
  p_expected_version integer,
  p_request_key uuid
)
RETURNS public.shadow_capability_proposals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_result public.shadow_capability_proposals;
  v_existing record;
  v_next_status text;
BEGIN
  IF v_actor IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'shadow capability transitions require an administrator' USING ERRCODE = '42501';
  END IF;
  IF p_request_key IS NULL OR p_expected_version IS NULL THEN
    RAISE EXCEPTION 'request_key and expected_version are required' USING ERRCODE = '22023';
  END IF;

  SELECT e.proposal_id, e.action INTO v_existing
  FROM public.shadow_capability_audit_events e WHERE e.request_key = p_request_key;
  IF FOUND THEN
    IF v_existing.proposal_id <> p_proposal_id OR v_existing.action <> p_action THEN
      RAISE EXCEPTION 'request_key was already used for another operation' USING ERRCODE = '23505';
    END IF;
    SELECT * INTO v_result FROM public.shadow_capability_proposals WHERE id = p_proposal_id;
    RETURN v_result;
  END IF;

  SELECT * INTO v_result FROM public.shadow_capability_proposals
  WHERE id = p_proposal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'shadow proposal not found' USING ERRCODE = 'P0002'; END IF;
  -- Re-read after waiting on the row lock: the winning same-key request may
  -- have committed while this invocation was blocked.
  SELECT e.proposal_id, e.action INTO v_existing
  FROM public.shadow_capability_audit_events e WHERE e.request_key = p_request_key;
  IF FOUND THEN
    IF v_existing.proposal_id <> p_proposal_id OR v_existing.action <> p_action THEN
      RAISE EXCEPTION 'request_key was already used for another operation' USING ERRCODE = '23505';
    END IF;
    RETURN v_result;
  END IF;
  IF v_result.version <> p_expected_version THEN
    RAISE EXCEPTION 'shadow proposal version conflict' USING ERRCODE = '40001';
  END IF;

  v_next_status := CASE
    WHEN v_result.status = 'draft' AND p_action = 'submit' THEN 'submitted'
    WHEN v_result.status = 'submitted' AND p_action = 'approve' THEN 'approved'
    WHEN v_result.status = 'submitted' AND p_action = 'reject' THEN 'rejected'
    WHEN v_result.status = 'rejected' AND p_action = 'revise' THEN 'draft'
    WHEN v_result.status = 'approved' AND p_action = 'simulate' THEN 'simulated'
    ELSE NULL END;
  IF v_next_status IS NULL THEN
    RAISE EXCEPTION 'invalid shadow capability transition' USING ERRCODE = '22023';
  END IF;
  IF v_next_status IN ('approved', 'simulated') AND v_result.rollback_strategy IS NULL THEN
    RAISE EXCEPTION 'rollback plan is required before approval or simulation' USING ERRCODE = '23514';
  END IF;

  UPDATE public.shadow_capability_proposals
  SET status = v_next_status, version = version + 1, updated_at = now()
  WHERE id = p_proposal_id RETURNING * INTO v_result;
  INSERT INTO public.shadow_capability_audit_events
    (proposal_id, sequence, from_status, to_status, action, actor_id, request_key)
  VALUES (v_result.id, v_result.version, CASE p_action
    WHEN 'submit' THEN 'draft' WHEN 'approve' THEN 'submitted' WHEN 'reject' THEN 'submitted'
    WHEN 'revise' THEN 'rejected' WHEN 'simulate' THEN 'approved' END,
    v_next_status, p_action, v_actor, p_request_key);
  RETURN v_result;
EXCEPTION WHEN unique_violation THEN
  -- A same-key concurrent retry may lose the insert race after doing its
  -- pre-lock lookup. The exception block rolls back this invocation's update.
  SELECT e.proposal_id, e.action INTO v_existing
  FROM public.shadow_capability_audit_events e WHERE e.request_key = p_request_key;
  IF FOUND AND v_existing.proposal_id = p_proposal_id AND v_existing.action = p_action THEN
    SELECT * INTO v_result FROM public.shadow_capability_proposals WHERE id = p_proposal_id;
    RETURN v_result;
  END IF;
  RAISE;
END;
$$;

REVOKE ALL ON TABLE public.shadow_capability_proposals FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.shadow_capability_audit_events FROM PUBLIC, anon, authenticated;
-- UUID primary keys create no sequences, so this migration grants and revokes
-- no sequence privileges (and intentionally does not touch unrelated sequences).
GRANT SELECT ON TABLE public.shadow_capability_proposals TO authenticated;
GRANT SELECT ON TABLE public.shadow_capability_audit_events TO authenticated;
REVOKE ALL ON FUNCTION public.create_shadow_capability_proposal(jsonb, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transition_shadow_capability_proposal(uuid, text, integer, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_shadow_capability_proposal(jsonb, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_shadow_capability_proposal(uuid, text, integer, uuid) TO authenticated;
