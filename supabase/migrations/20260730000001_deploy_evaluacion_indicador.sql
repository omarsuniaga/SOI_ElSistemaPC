-- ============================================================================
-- DEPLOY: evaluacion_indicador (antes archivada en 20260722000001)
-- Fecha: 2026-07-30
-- Motivo del re-despliegue:
--   La tabla se archivó originalmente por RLS permisivo (auth.role() = 'authenticated'
--   sin WITH CHECK). Se redeploya con RLS corregido siguiendo el patrón establecido
--   de indicator_attempts (por creador + admin) y se agrega la función de trigger
--   de updated_at que ya existía en la migración original.
--
-- Ver offlineSyncAdapter.js: el stub TODO se reemplaza por remoteSyncFn real que
-- escribe acá vía evaluacionClaseService.registrarEvaluacion().
-- ============================================================================

-- 1. TABLA: evaluacion_indicador
CREATE TABLE IF NOT EXISTS public.evaluacion_indicador (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  clase_id UUID NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  nota INTEGER CHECK (nota BETWEEN 1 AND 5),
  estado TEXT DEFAULT 'sin_evaluar' CHECK (estado IN (
    'sin_evaluar', 'inicia', 'en_progreso', 'avanzado', 'dominado'
  )),
  observaciones TEXT,
  evaluado_por UUID REFERENCES public.maestros(id),
  fecha_evaluacion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, indicator_id, clase_id)
);

-- 2. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_ei_alumno ON public.evaluacion_indicador(alumno_id);
CREATE INDEX IF NOT EXISTS idx_ei_indicator ON public.evaluacion_indicador(indicator_id);
CREATE INDEX IF NOT EXISTS idx_ei_clase ON public.evaluacion_indicador(clase_id);
CREATE INDEX IF NOT EXISTS idx_ei_clase_alumno ON public.evaluacion_indicador(clase_id, alumno_id);

-- 3. RLS — políticas corregidas (reemplazan las archivadas sin WITH CHECK)
ALTER TABLE public.evaluacion_indicador ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas viejas si la tabla existía por CREATE IF NOT EXISTS
DROP POLICY IF EXISTS "authenticated_read_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "authenticated_crud_ei" ON public.evaluacion_indicador;

-- Teacher: insertar evaluaciones propias
DROP POLICY IF EXISTS "teacher_insert_ei" ON public.evaluacion_indicador;
CREATE POLICY "teacher_insert_ei" ON public.evaluacion_indicador
  FOR INSERT TO authenticated
  WITH CHECK (evaluado_por = auth.uid());

-- Teacher: leer evaluaciones propias
DROP POLICY IF EXISTS "teacher_read_own_ei" ON public.evaluacion_indicador;
CREATE POLICY "teacher_read_own_ei" ON public.evaluacion_indicador
  FOR SELECT TO authenticated
  USING (evaluado_por = auth.uid());

-- Teacher: actualizar evaluaciones propias
DROP POLICY IF EXISTS "teacher_update_own_ei" ON public.evaluacion_indicador;
CREATE POLICY "teacher_update_own_ei" ON public.evaluacion_indicador
  FOR UPDATE TO authenticated
  USING (evaluado_por = auth.uid())
  WITH CHECK (evaluado_por = auth.uid());

-- Teacher: borrar evaluaciones propias
DROP POLICY IF EXISTS "teacher_delete_own_ei" ON public.evaluacion_indicador;
CREATE POLICY "teacher_delete_own_ei" ON public.evaluacion_indicador
  FOR DELETE TO authenticated
  USING (evaluado_por = auth.uid());

-- Admin: leer todas
DROP POLICY IF EXISTS "admin_read_all_ei" ON public.evaluacion_indicador;
CREATE POLICY "admin_read_all_ei" ON public.evaluacion_indicador
  FOR SELECT TO authenticated
  USING (es_admin());

-- 4. TRIGGER: auto-set updated_at
CREATE OR REPLACE FUNCTION public.update_ei_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ei_updated_at ON public.evaluacion_indicador;
CREATE TRIGGER trg_ei_updated_at
  BEFORE UPDATE ON public.evaluacion_indicador
  FOR EACH ROW EXECUTE FUNCTION public.update_ei_timestamp();
