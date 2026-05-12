-- Migration: 20260512_add_created_by_to_indicator_attempts.sql
-- Descripción: Agrega columna created_by a indicator_attempts para tracking de quién creó cada intento
-- y hacer compatible el código con RLS policies basadas en el maestro.

ALTER TABLE public.indicator_attempts 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.maestros(id) ON DELETE SET NULL;

ALTER TABLE public.indicator_attempts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

COMMENT ON COLUMN public.indicator_attempts.created_by IS 'ID del maestro que creó este intento de indicador';
COMMENT ON COLUMN public.indicator_attempts.updated_at IS 'Fecha de última actualización del intento';

-- Index para consultas por maestro
CREATE INDEX IF NOT EXISTS idx_indicator_attempts_created_by 
ON public.indicator_attempts(created_by);
