-- ============================================================================
-- MIGRACION: Rediseño Planificación — Limpieza de Tablas Deprecated
-- Fecha: 2026-07-22
-- Descripción: Elimina tablas plan_* y planificacion_nodos que ya no se usan.
-- ⚠️  PRECAUCIÓN: Ejecutar SOLO después de verificar que la migración de datos
--     (20260722_planificacion_rediseño_modificaciones.sql) fue exitosa.
--     Verificar en producción que no existen queries activas sobre estas tablas.
--     Recomendado: crear backup antes de ejecutar.
-- ============================================================================

-- Eliminar en orden inverso de dependencias FK:
-- plan_indicator_links depende de plan_indicadores
-- plan_indicadores depende de plan_objetivos
-- plan_objetivos depende de plan_temas
-- plan_temas depende de plan_niveles
-- plan_niveles depende de plan_clases

-- 1. Eliminar policies RLS primero (para evitar errores si la tabla se dropea con CASCADE)
DROP POLICY IF EXISTS "Maestros ven vinculos de indicadores pedagogicos" ON public.plan_indicator_links;
DROP POLICY IF EXISTS "Maestros gestionan vinculos de indicadores pedagogicos" ON public.plan_indicator_links;

-- 2. Eliminar tablas en orden de dependencias (hijo → padre)
DROP TABLE IF EXISTS public.plan_indicator_links CASCADE;
DROP TABLE IF EXISTS public.plan_indicadores CASCADE;
DROP TABLE IF EXISTS public.plan_objetivos CASCADE;
DROP TABLE IF EXISTS public.plan_temas CASCADE;
DROP TABLE IF EXISTS public.plan_niveles CASCADE;
DROP TABLE IF EXISTS public.plan_clases CASCADE;
DROP TABLE IF EXISTS public.planificacion_nodos CASCADE;

-- Verificación: si alguna de estas tablas existía, CASCADE eliminó las dependencias.
-- Las vistas y funciones que referencian estas tablas también fueron eliminadas por CASCADE.
-- Verificar que el sistema sigue funcionando después de esta migración.
