-- ============================================================
-- Migration: DIR Governance Records
-- Timestamp: 20260628_dir_governance
-- Description: Persistent audit layer for DIR decisions and payment governance
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dir_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type text NOT NULL CHECK (decision_type IN ('acta', 'pago', 'decision', 'veto')),
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'executed', 'archived')),
  amount_rd numeric(12,2),
  requires_dual_signature boolean NOT NULL DEFAULT false,
  requires_board_review boolean NOT NULL DEFAULT false,
  source_doc_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_minuta_id uuid REFERENCES public.minutas(id) ON DELETE SET NULL,
  correlation_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dir_decisions_type ON public.dir_decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_dir_decisions_status ON public.dir_decisions(status);
CREATE INDEX IF NOT EXISTS idx_dir_decisions_corr ON public.dir_decisions(correlation_id);
CREATE INDEX IF NOT EXISTS idx_dir_decisions_minuta ON public.dir_decisions(related_minuta_id);

CREATE OR REPLACE FUNCTION public.set_dir_decisions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dir_decisions_updated_at ON public.dir_decisions;
CREATE TRIGGER trg_dir_decisions_updated_at
BEFORE UPDATE ON public.dir_decisions
FOR EACH ROW
EXECUTE FUNCTION public.set_dir_decisions_updated_at();
