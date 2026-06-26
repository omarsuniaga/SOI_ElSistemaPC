-- 20260626_gateway_subsistema4_numero_consentimiento.sql
-- Subsistema 4: configuracion del gateway (numero dedicado + compliance).
-- Un numero de WhatsApp diferente al de SOI para campanias.
-- Registro de consentimiento para compliance (menores).

ALTER TABLE public.hermes_whatsapp_config
  ADD COLUMN IF NOT EXISTS numero_wid text UNIQUE,
  ADD COLUMN IF NOT EXISTS numero_nombre text,
  ADD COLUMN IF NOT EXISTS consentimiento_registrado boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.whatsapp_consentimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jid text NOT NULL,
  nombre_representante text,
  representante_cedula text,
  niño_nombre text,
  niño_edad int,
  campania_id uuid REFERENCES public.campanias_periodo(id) ON DELETE CASCADE,
  acepta_campania boolean NOT NULL DEFAULT true,
  acepta_estadisticas boolean NOT NULL DEFAULT false,
  firmas_digitales text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(jid, campania_id)
);

ALTER TABLE public.whatsapp_consentimientos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wc_admin_all ON public.whatsapp_consentimientos;
CREATE POLICY wc_admin_all ON public.whatsapp_consentimientos FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.whatsapp_consentimientos FROM anon;
GRANT SELECT, INSERT ON public.whatsapp_consentimientos TO authenticated;
