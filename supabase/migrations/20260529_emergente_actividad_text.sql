-- Hacer clase_id nullable para sesiones emergentes sin clase real
ALTER TABLE public.sesiones_clase
ALTER COLUMN clase_id DROP NOT NULL;

-- Columna para texto libre de actividad/clase en emergentes
ALTER TABLE public.sesiones_clase
ADD COLUMN IF NOT EXISTS actividad TEXT;

-- Columna para maestro auxiliar en co-docencia
ALTER TABLE public.sesiones_clase
ADD COLUMN IF NOT EXISTS maestro_auxiliar_id UUID REFERENCES public.maestros(id);

-- Columna para motivo de la sesion emergente
ALTER TABLE public.sesiones_clase
ADD COLUMN IF NOT EXISTS motivo TEXT;
