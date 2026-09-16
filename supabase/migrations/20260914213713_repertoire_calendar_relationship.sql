-- Phase 11: canonical institutional event relationship. Local only.
-- calendario_institucional is the verified event SSOT; the audit bus is not used.
CREATE TABLE IF NOT EXISTS public.montaje_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE RESTRICT,
  calendario_evento_id uuid NOT NULL REFERENCES public.calendario_institucional(id) ON DELETE RESTRICT,
  tipo_relacion text NOT NULL DEFAULT 'performance',
  es_principal boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_eventos_unique UNIQUE (montaje_id, calendario_evento_id)
);
CREATE INDEX IF NOT EXISTS idx_montaje_eventos_event ON public.montaje_eventos(calendario_evento_id);
ALTER TABLE public.montaje_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY repertoire_event_relation_read ON public.montaje_eventos FOR SELECT TO authenticated USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
CREATE POLICY repertoire_event_relation_write ON public.montaje_eventos FOR ALL TO authenticated USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica'])) WITH CHECK (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
