-- Bridge table between pedagogical planning indicators and real academic route indicators.

CREATE TABLE IF NOT EXISTS public.plan_indicator_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_indicator_id uuid NOT NULL REFERENCES public.plan_indicadores(id) ON DELETE CASCADE,
  indicator_id uuid NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plan_indicator_links_unique_plan UNIQUE (plan_indicator_id)
);

CREATE INDEX IF NOT EXISTS idx_plan_indicator_links_plan_indicator_id
  ON public.plan_indicator_links(plan_indicator_id);

CREATE INDEX IF NOT EXISTS idx_plan_indicator_links_indicator_id
  ON public.plan_indicator_links(indicator_id);

ALTER TABLE public.plan_indicator_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Maestros ven vinculos de indicadores pedagogicos" ON public.plan_indicator_links;
CREATE POLICY "Maestros ven vinculos de indicadores pedagogicos" ON public.plan_indicator_links
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plan_indicadores pi
    JOIN public.plan_objetivos o ON pi.objetivo_id = o.id
    JOIN public.plan_temas t ON o.tema_id = t.id
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE pi.id = plan_indicator_links.plan_indicator_id
      AND public.maestro_en_clase(pc.id::uuid)
  )
);

DROP POLICY IF EXISTS "Maestros gestionan vinculos de indicadores pedagogicos" ON public.plan_indicator_links;
CREATE POLICY "Maestros gestionan vinculos de indicadores pedagogicos" ON public.plan_indicator_links
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plan_indicadores pi
    JOIN public.plan_objetivos o ON pi.objetivo_id = o.id
    JOIN public.plan_temas t ON o.tema_id = t.id
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE pi.id = plan_indicator_links.plan_indicator_id
      AND public.maestro_en_clase(pc.id::uuid)
  )
)
WITH CHECK (
  public.tiene_permiso('planificacion:write')
);

COMMENT ON TABLE public.plan_indicator_links IS
  'Maps pedagogical planning indicators to real academic route indicators so mastery can be measured honestly.';
