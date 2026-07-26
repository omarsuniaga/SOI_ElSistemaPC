-- ============================================================================
-- MIGRACION: Rediseño Planificación — Modificar Tablas Existentes
-- Fecha: 2026-07-22
-- Descripción: Agrega FKs a planificaciones y migra datos existentes.
-- DEBE ejecutarse DESPUÉS de 20260722_planificacion_rediseño_tablas.sql
-- ============================================================================

-- ============================================================================
-- 1. AGREGAR route_version_id A planificaciones
-- Resolución directa de ruta sin hack por instrumento.
-- ============================================================================

ALTER TABLE public.planificaciones
  ADD COLUMN IF NOT EXISTS route_version_id UUID
  REFERENCES public.route_versions(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. AGREGAR class_curriculum_plan_id A planificaciones
-- FK al bridge table para vinculación explícita.
-- ============================================================================

ALTER TABLE public.planificaciones
  ADD COLUMN IF NOT EXISTS class_curriculum_plan_id UUID
  REFERENCES public.class_curriculum_plan(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. MIGRACIÓN DE DATOS: Backfill class_curriculum_plan
-- Resuelve route_version_id por instrumento para planificaciones existentes.
-- Idempotente: ON CONFLICT DO NOTHING.
-- ============================================================================

-- 3a. Crear registros en class_curriculum_plan para clases que ya tienen planificaciones
--     pero NO tienen bridge activo.
INSERT INTO public.class_curriculum_plan (clase_id, route_version_id, estado)
SELECT DISTINCT ON (p.clase_id)
  p.clase_id,
  rv.id AS route_version_id,
  'activo' AS estado
FROM public.planificaciones p
JOIN public.clases c ON p.clase_id = c.id
JOIN public.routes r ON r.instrument ILIKE '%' || c.instrumento || '%'
JOIN public.route_versions rv ON rv.route_id = r.id AND rv.status = 'published'
WHERE p.class_curriculum_plan_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.class_curriculum_plan ccp
    WHERE ccp.clase_id = p.clase_id AND ccp.estado = 'activo'
  )
ON CONFLICT DO NOTHING;

-- 3b. Backfill FK en planificaciones desde class_curriculum_plan activo
UPDATE public.planificaciones p
SET class_curriculum_plan_id = ccp.id,
    route_version_id = ccp.route_version_id
FROM public.class_curriculum_plan ccp
WHERE p.clase_id = ccp.clase_id
  AND ccp.estado = 'activo'
  AND p.class_curriculum_plan_id IS NULL;

-- ============================================================================
-- 4. ÍNDICES para las nuevas FKs en planificaciones
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_planificaciones_route
  ON public.planificaciones(route_version_id);

CREATE INDEX IF NOT EXISTS idx_planificaciones_ccp
  ON public.planificaciones(class_curriculum_plan_id);
