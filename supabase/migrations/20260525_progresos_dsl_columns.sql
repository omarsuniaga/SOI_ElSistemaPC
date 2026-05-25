ALTER TABLE public.progresos
  ADD COLUMN IF NOT EXISTS contenido_dsl  text,
  ADD COLUMN IF NOT EXISTS objetivo_id    uuid
    REFERENCES public.plan_objetivos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.progresos.contenido_dsl IS
  'Contenido libre extraído por IA o por token DSL manual. Linkeable retroactivamente a objetivo_id cuando exista plan curricular.';
COMMENT ON COLUMN public.progresos.objetivo_id IS
  'FK opcional a plan_objetivos. NULL = estado libre sin plan. Poblar retroactivamente al aceptar un plan al fin del semestre.';
