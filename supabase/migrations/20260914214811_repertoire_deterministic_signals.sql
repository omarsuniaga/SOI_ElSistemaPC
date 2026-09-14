-- Phase 12: deterministic signals, separate from delivery channels.
-- Local migration only; do not apply to production without explicit approval.
CREATE TABLE IF NOT EXISTS public.repertoire_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  source_entity_type text NOT NULL,
  source_entity_id uuid NOT NULL,
  montage_id uuid REFERENCES public.montajes(id) ON DELETE RESTRICT,
  event_id uuid REFERENCES public.calendario_institucional(id) ON DELETE RESTRICT,
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  deep_link text,
  dedupe_key text NOT NULL,
  lifecycle text NOT NULL DEFAULT 'OPEN' CHECK (lifecycle IN ('OPEN','ACKNOWLEDGED','RESOLVED','SUPERSEDED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.repertoire_signal_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES public.repertoire_signals(id) ON DELETE RESTRICT,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  channel text NOT NULL CHECK (channel IN ('IN_APP','WEB_PUSH','EMAIL','WHATSAPP')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','DELIVERED','READ','FAILED')),
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (signal_id, profile_id, channel)
);
CREATE INDEX IF NOT EXISTS idx_repertoire_signals_dedupe ON public.repertoire_signals(dedupe_key, lifecycle);
CREATE INDEX IF NOT EXISTS idx_repertoire_signal_delivery_profile ON public.repertoire_signal_deliveries(profile_id, status);
ALTER TABLE public.repertoire_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repertoire_signal_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY repertoire_signals_read ON public.repertoire_signals FOR SELECT TO authenticated USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
CREATE POLICY repertoire_signal_delivery_read ON public.repertoire_signal_deliveries FOR SELECT TO authenticated USING (profile_id = auth.uid() OR get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
COMMENT ON TABLE public.repertoire_signals IS 'Deterministic actionable repertoire signals; delivery is modeled separately and Hermes is not invoked here.';
