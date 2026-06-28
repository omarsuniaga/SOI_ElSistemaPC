-- ============================================================
-- Migration: Hermes Task Contracts V1
-- Timestamp: 20260628_task_contracts_v1
-- Project: sistema-academico-pwa
-- Description: Task contracts + audit trail for Hermes
-- Date: 2026-06-28
-- ============================================================

CREATE TABLE IF NOT EXISTS public.task_contracts (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id text UNIQUE NOT NULL,
  emitted_at timestamptz NOT NULL DEFAULT now(),
  emitted_by text NOT NULL,
  source_event jsonb NOT NULL DEFAULT '{}'::jsonb,
  soi_policy_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  assignee jsonb NOT NULL DEFAULT '{}'::jsonb,
  assignee_user_id uuid NULL,
  action_required text NOT NULL,
  evidence_required jsonb NOT NULL DEFAULT '{}'::jsonb,
  close_criteria text NOT NULL,
  deadline timestamptz NOT NULL,
  priority text NOT NULL CHECK (priority IN ('normal', 'urgente', 'critica')),
  escalation_path jsonb NOT NULL DEFAULT '[]'::jsonb,
  state text NOT NULL CHECK (state IN (
    'emitted','acknowledged','in_progress','submitted',
    'verified','closed','escalated','vetoed','revoked'
  )),
  state_updated_at timestamptz NOT NULL DEFAULT now(),
  linked_task_id uuid NULL REFERENCES public.tareas_institucionales(id) ON DELETE SET NULL,
  supersedes text NULL,
  superseded_by text NULL,
  tags text[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.task_contract_events (
  id bigserial PRIMARY KEY,
  contract_uuid uuid NOT NULL REFERENCES public.task_contracts(uuid) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  actor text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_task_contracts_assignee_state
  ON public.task_contracts (assignee_user_id, state);

CREATE INDEX IF NOT EXISTS idx_task_contracts_state_deadline
  ON public.task_contracts (state, deadline);

CREATE INDEX IF NOT EXISTS idx_task_contracts_linked_task
  ON public.task_contracts (linked_task_id);

CREATE INDEX IF NOT EXISTS idx_task_contract_events_contract_time
  ON public.task_contract_events (contract_uuid, occurred_at);

ALTER TABLE public.task_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_contract_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_task_contracts ON public.task_contracts;
CREATE POLICY allow_all_task_contracts ON public.task_contracts
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_task_contract_events ON public.task_contract_events;
CREATE POLICY allow_all_task_contract_events ON public.task_contract_events
  FOR ALL USING (true) WITH CHECK (true);
