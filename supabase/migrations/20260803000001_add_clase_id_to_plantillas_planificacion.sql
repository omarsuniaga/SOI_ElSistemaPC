-- Migration: Agregar clase_id a plantillas_planificacion
-- Permite vincular una plantilla curricular a una clase específica (1:1 por clase+nivel).
-- El id sigue siendo UUID generado automáticamente.

ALTER TABLE public.plantillas_planificacion
  ADD COLUMN IF NOT EXISTS clase_id UUID REFERENCES public.clases(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pp_clase_id ON public.plantillas_planificacion(clase_id);

COMMENT ON COLUMN public.plantillas_planificacion.clase_id IS
  'Clase a la que pertenece este plan curricular. NULL = plantilla genérica reutilizable.';
