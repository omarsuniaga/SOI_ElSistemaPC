-- Fix schema for ausencias_maestros to match the frontend expectations and fix inconsistencies
-- 1. Fix Foreign Key: maestro_id should point to public.maestros(id), not auth.users(id)
-- First, drop the old constraint if it exists
ALTER TABLE public.ausencias_maestros DROP CONSTRAINT IF EXISTS ausencias_maestros_maestro_id_fkey;

-- Then add the new one pointing to public.maestros
ALTER TABLE public.ausencias_maestros 
  ADD CONSTRAINT ausencias_maestros_maestro_id_fkey 
  FOREIGN KEY (maestro_id) REFERENCES public.maestros(id) ON DELETE CASCADE;

-- 2. Add missing columns used by the frontend
ALTER TABLE public.ausencias_maestros ADD COLUMN IF NOT EXISTS duracion_tipo TEXT;
ALTER TABLE public.ausencias_maestros ADD COLUMN IF NOT EXISTS clases_afectadas UUID[];
ALTER TABLE public.ausencias_maestros ADD COLUMN IF NOT EXISTS actividades_por_clase JSONB;
ALTER TABLE public.ausencias_maestros ADD COLUMN IF NOT EXISTS clase_emergente JSONB;

-- 3. Fix RLS policies to correctly identify the maestro via their user_id
-- We need to check if the maestro_id in the table corresponds to the current auth user
DROP POLICY IF EXISTS "Maestros pueden ver sus propias ausencias" ON public.ausencias_maestros;
CREATE POLICY "Maestros pueden ver sus propias ausencias" 
ON public.ausencias_maestros FOR SELECT 
USING (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Maestros pueden crear sus propias solicitudes" ON public.ausencias_maestros;
CREATE POLICY "Maestros pueden crear sus propias solicitudes" 
ON public.ausencias_maestros FOR INSERT 
WITH CHECK (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Maestros pueden cancelar sus propias solicitudes" ON public.ausencias_maestros;
CREATE POLICY "Maestros pueden cancelar sus propias solicitudes" 
ON public.ausencias_maestros FOR UPDATE 
USING (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

COMMENT ON TABLE public.ausencias_maestros IS 'Tabla corregida para gestionar ausencias de maestros con detalles de clases afectadas y FK vinculada a tabla maestros.';
