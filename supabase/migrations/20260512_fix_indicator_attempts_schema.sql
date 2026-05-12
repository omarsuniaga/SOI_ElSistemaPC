-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Script: Add created_by to indicator_attempts + fix RLS          ║
-- ║  Ejecutar en: Supabase Dashboard → SQL Editor                   ║
-- ║  Autor: baseado en RLS-first, sin service role                   ║
-- ╚══════════════════════════════════════════════════════════════════╝
--
-- OBJETIVO:
--   Agregar columna created_by a indicator_attempts para:
--   1. Trackear qué maestro creó cada intento de evaluación
--   2. RLS policies basadas en auth.uid() = created_by
--
-- PRECAUCIÓN:
--   Este script hace ALTER TABLE. Ejecutar en orden y verificar.
--   Si la columna ya existe, el ALTER con IF NOT EXISTS no falla.

-- ═══════════════════════════════════════════════════════════════════
-- PASO 1: Verificar que la tabla existe y tiene la estructura actual
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'indicator_attempts' 
    AND column_name = 'created_by'
  ) THEN
    RAISE NOTICE 'Agregando columna created_by a indicator_attempts...';
  ELSE
    RAISE NOTICE 'Columna created_by ya existe. Saltando ALTER.';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- PASO 2: Agregar columnas si no existen
-- ═══════════════════════════════════════════════════════════════════

-- Columna created_by: FK a maestros para tracking del autor
ALTER TABLE public.indicator_attempts 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.maestros(id) ON DELETE SET NULL;

-- Columna updated_at: para auditoría
ALTER TABLE public.indicator_attempts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ═══════════════════════════════════════════════════════════════════
-- PASO 3: Índices para performance
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_indicator_attempts_created_by 
ON public.indicator_attempts(created_by);

CREATE INDEX IF NOT EXISTS idx_indicator_attempts_session_indicator 
ON public.indicator_attempts(session_id, indicator_id);

-- ═══════════════════════════════════════════════════════════════════
-- PASO 4: Actualizar RLS policies (solo maestros, solo sus datos)
-- ═══════════════════════════════════════════════════════════════════

-- Asegurar que RLS está habilitado
ALTER TABLE public.indicator_attempts ENABLE ROW LEVEL SECURITY;

-- Drop policies antiguas (si existen con reglas abiertas)
DROP POLICY IF EXISTS teacher_insert_attempts ON public.indicator_attempts;
DROP POLICY IF EXISTS teacher_read_attempts ON public.indicator_attempts;

-- Nueva política: maestros pueden INSERTAR sus propios intentos
CREATE POLICY teacher_insert_attempts ON public.indicator_attempts 
FOR INSERT 
TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Nueva política: maestros pueden LEER sus propios intentos
CREATE POLICY teacher_read_own_attempts ON public.indicator_attempts 
FOR SELECT 
TO authenticated 
USING (created_by = auth.uid());

-- Nueva política: maestros pueden ACTUALIZAR sus propios intentos
CREATE POLICY teacher_update_own_attempts ON public.indicator_attempts 
FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Nueva política: maestros pueden BORRAR sus propios intentos
CREATE POLICY teacher_delete_own_attempts ON public.indicator_attempts 
FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- PASO 5: Trigger para auto-actualizar updated_at
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger si ya existe y crear nuevo
DROP TRIGGER IF EXISTS trigger_indicator_attempts_updated_at 
ON public.indicator_attempts;

CREATE TRIGGER trigger_indicator_attempts_updated_at
  BEFORE UPDATE ON public.indicator_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICACIÓN: Mostrar estructura final
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'indicator_attempts'
ORDER BY ordinal_position;

-- Ver políticas activas
SELECT policyname, cmd, qual, with_check
FROM pg_policy
WHERE polrelid = 'public.indicator_attempts'::regclass;