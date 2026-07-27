-- ============================================================================
-- 📦 ARCHIVADO / OMITIDO DE DESPLIEGUE
-- MIGRACION: Rediseño Planificación de Clases — Tablas Nuevas
-- Fecha: 2026-07-22
-- Razón de Omisión:
--   1. RLS permisivo inseguro: auth.role() = 'authenticated' sin WITH CHECK.
--   2. Tablas pre-creadas vacías en producción.
--   3. FK NOT NULL bloqueante contra planificaciones (0 filas).
-- ============================================================================

-- ============================================================================
-- 1. TABLA: class_curriculum_plan
-- Bridge explícito 1:1 entre clases y route_versions.
-- Reemplaza el hack de _resolveRouteVersionIdForClase().
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.class_curriculum_plan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clase_id UUID NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  route_version_id UUID NOT NULL REFERENCES public.route_versions(id) ON DELETE RESTRICT,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activo', 'archivado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNIQUE parcial: solo UNA ruta activa por clase
CREATE UNIQUE INDEX IF NOT EXISTS idx_ccp_active_route
  ON public.class_curriculum_plan(clase_id) WHERE estado = 'activo';

CREATE INDEX IF NOT EXISTS idx_ccp_clase ON public.class_curriculum_plan(clase_id);
CREATE INDEX IF NOT EXISTS idx_ccp_route ON public.class_curriculum_plan(route_version_id);

-- RLS
ALTER TABLE public.class_curriculum_plan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_ccp" ON public.class_curriculum_plan;
CREATE POLICY "authenticated_read_ccp" ON public.class_curriculum_plan
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_crud_ccp" ON public.class_curriculum_plan;
CREATE POLICY "authenticated_crud_ccp" ON public.class_curriculum_plan
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger: auto-set updated_at
CREATE OR REPLACE FUNCTION public.update_ccp_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ccp_updated_at ON public.class_curriculum_plan;
CREATE TRIGGER trg_ccp_updated_at
  BEFORE UPDATE ON public.class_curriculum_plan
  FOR EACH ROW EXECUTE FUNCTION public.update_ccp_timestamp();

-- ============================================================================
-- 2. TABLA: clase_objetivos
-- Vincula planificaciones con nodos e indicadores específicos de la ruta.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clase_objetivos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  planificacion_id UUID NOT NULL REFERENCES public.planificaciones(id) ON DELETE CASCADE,
  class_curriculum_plan_id UUID NOT NULL REFERENCES public.class_curriculum_plan(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE RESTRICT,
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE RESTRICT,
  semana INTEGER,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_co_plan ON public.clase_objetivos(planificacion_id);
CREATE INDEX IF NOT EXISTS idx_co_ccp ON public.clase_objetivos(class_curriculum_plan_id);
CREATE INDEX IF NOT EXISTS idx_co_node ON public.clase_objetivos(node_id);
CREATE INDEX IF NOT EXISTS idx_co_indicator ON public.clase_objetivos(indicator_id);

-- RLS
ALTER TABLE public.clase_objetivos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_co" ON public.clase_objetivos;
CREATE POLICY "authenticated_read_co" ON public.clase_objetivos
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_crud_co" ON public.clase_objetivos;
CREATE POLICY "authenticated_crud_co" ON public.clase_objetivos
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. TABLA: evaluacion_indicador
-- Evaluación por indicador por alumno. Tracking de mastery.
-- UNIQUE(alumno_id, indicator_id, clase_id) → un registro por combinación.
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_ei_alumno ON public.evaluacion_indicador(alumno_id);
CREATE INDEX IF NOT EXISTS idx_ei_indicator ON public.evaluacion_indicador(indicator_id);
CREATE INDEX IF NOT EXISTS idx_ei_clase ON public.evaluacion_indicador(clase_id);
CREATE INDEX IF NOT EXISTS idx_ei_clase_alumno ON public.evaluacion_indicador(clase_id, alumno_id);

-- RLS
ALTER TABLE public.evaluacion_indicador ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_ei" ON public.evaluacion_indicador;
CREATE POLICY "authenticated_read_ei" ON public.evaluacion_indicador
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_crud_ei" ON public.evaluacion_indicador;
CREATE POLICY "authenticated_crud_ei" ON public.evaluacion_indicador
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger: auto-set updated_at
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
