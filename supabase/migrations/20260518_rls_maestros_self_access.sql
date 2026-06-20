-- Migration: Permitir acceso a la tabla Maestros y corregir dependencias circulares
-- Date: 2026-05-18
-- Objetivo: Habilitar que el helper maestro_actual() pueda leer la tabla maestros bajo RLS

-- ==============================================================================
-- 1. POLÍTICA PARA LA TABLA MAESTROS
-- ==============================================================================
-- Sin esta política, el helper public.maestro_actual() retorna NULL porque 
-- no puede leer la tabla maestros para encontrar el ID vinculado al auth.uid().

ALTER TABLE public.maestros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Maestros pueden leer su propia información" ON public.maestros;
CREATE POLICY "Maestros pueden leer su propia información" ON public.maestros
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Permitir a los maestros actualizar su propio perfil (opcional pero recomendado)
DROP POLICY IF EXISTS "Maestros pueden actualizar su perfil" ON public.maestros;
CREATE POLICY "Maestros pueden actualizar su perfil" ON public.maestros
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- 2. AJUSTE DE PRIVILEGIOS DE ESQUEMA
-- ==============================================================================
-- Asegurar que el rol authenticated tenga acceso al esquema public para ejecutar funciones
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- ==============================================================================
-- 3. POLÍTICA PARA PROFILES (Información de usuario vinculada)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios ven su propio perfil" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

-- ==============================================================================
-- 4. VERIFICACIÓN DE AYUDA (Para debugging futuro)
-- ==============================================================================
-- Nota: Si un maestro sigue sin ver sus clases, verificar que el campo 
-- `maestros.user_id` coincida exactamente con el UUID de `auth.users`.
