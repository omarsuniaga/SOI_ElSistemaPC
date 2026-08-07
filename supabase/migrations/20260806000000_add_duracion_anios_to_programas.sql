-- Agregar columna duracion_anios a la tabla programas
ALTER TABLE public.programas ADD COLUMN IF NOT EXISTS duracion_anios numeric;
