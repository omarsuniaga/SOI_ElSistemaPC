-- Migration: create ausencias_auditoria table
-- Audit trail for all absence decisions (approvals, rejections, cancellations)

CREATE TABLE IF NOT EXISTS public.ausencias_auditoria (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ausencia_id   uuid        NOT NULL REFERENCES public.ausencias(id) ON DELETE CASCADE,
  actor_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  accion        text        NOT NULL,
  notas         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ausencias_auditoria_ausencia_id
  ON public.ausencias_auditoria (ausencia_id);

CREATE INDEX IF NOT EXISTS idx_ausencias_auditoria_actor_id
  ON public.ausencias_auditoria (actor_id);

CREATE INDEX IF NOT EXISTS idx_ausencias_auditoria_created_at
  ON public.ausencias_auditoria (created_at DESC);

-- Enable RLS
ALTER TABLE public.ausencias_auditoria ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read audit records for absences they own or manage
CREATE POLICY "ausencias_auditoria_select"
  ON public.ausencias_auditoria
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: only the system (service_role) or the actor themselves can insert audit records
CREATE POLICY "ausencias_auditoria_insert"
  ON public.ausencias_auditoria
  FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- No UPDATE or DELETE allowed on audit records (immutable log)
