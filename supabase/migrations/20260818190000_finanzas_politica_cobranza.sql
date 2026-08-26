-- Canonical financial policy for the collection workflow.
-- The portal may classify risk, but enforcement requires an approved workflow.

CREATE TABLE IF NOT EXISTS public.finanzas_politica_cobranza (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  dia_vencimiento smallint NOT NULL DEFAULT 10 CHECK (dia_vencimiento BETWEEN 1 AND 28),
  dias_mora_amarilla integer NOT NULL DEFAULT 30 CHECK (dias_mora_amarilla >= 1),
  dias_mora_critica integer NOT NULL DEFAULT 60 CHECK (dias_mora_critica > dias_mora_amarilla),
  bloqueo_requiere_aprobacion boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid DEFAULT auth.uid()
);

INSERT INTO public.finanzas_politica_cobranza (
  singleton, dia_vencimiento, dias_mora_amarilla, dias_mora_critica, bloqueo_requiere_aprobacion
)
VALUES (true, 10, 30, 60, true)
ON CONFLICT (singleton) DO NOTHING;

ALTER TABLE public.finanzas_politica_cobranza ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS finanzas_politica_cobranza_authenticated_read ON public.finanzas_politica_cobranza;
CREATE POLICY finanzas_politica_cobranza_authenticated_read
  ON public.finanzas_politica_cobranza
  FOR SELECT TO authenticated
  USING (true);

-- Changes are intentionally restricted to service role or a future audited RPC.
REVOKE INSERT, UPDATE, DELETE ON public.finanzas_politica_cobranza FROM authenticated;
