-- Fix: progresos.objetivo_id was referencing plan_objetivos (wrong table).
-- Correct target is curriculo_objetivos (curriculum catalog).

ALTER TABLE public.progresos
  DROP CONSTRAINT IF EXISTS progresos_objetivo_id_fkey;

ALTER TABLE public.progresos
  ADD CONSTRAINT progresos_objetivo_id_fkey
  FOREIGN KEY (objetivo_id)
  REFERENCES public.curriculo_objetivos(id)
  ON DELETE SET NULL;

COMMENT ON COLUMN public.progresos.objetivo_id IS
  'FK opcional a curriculo_objetivos. NULL = registro libre sin objetivo asignado. Se vincula automáticamente al adoptar un plan curricular.';
