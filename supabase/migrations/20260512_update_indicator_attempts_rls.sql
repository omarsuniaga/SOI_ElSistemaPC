-- Migration: 20260512_update_indicator_attempts_rls.sql
-- Descripción: Actualiza RLS policies para indicator_attempts usando created_by

-- Drop old policies
DROP POLICY IF EXISTS teacher_insert_attempts ON public.indicator_attempts;
DROP POLICY IF EXISTS teacher_read_attempts ON public.indicator_attempts;

-- Nuevas políticas basadas en created_by
-- Los maestros pueden insertar intentos donde created_by es su ID
CREATE POLICY teacher_insert_attempts ON public.indicator_attempts 
FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Los maestros pueden leer intentos que ellos crearon
CREATE POLICY teacher_read_own_attempts ON public.indicator_attempts 
FOR SELECT TO authenticated 
USING (created_by = auth.uid());

-- Los maestros pueden actualizar sus propios intentos
CREATE POLICY teacher_update_own_attempts ON public.indicator_attempts 
FOR UPDATE TO authenticated 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());
