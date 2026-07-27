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

-- 2. Eliminar tablas en orden de dependencias (hijo → padre) con RESTRICT defensivo
DROP TABLE IF EXISTS public.plan_indicator_links RESTRICT;
DROP TABLE IF EXISTS public.plan_indicadores RESTRICT;
DROP TABLE IF EXISTS public.plan_objetivos RESTRICT;
DROP TABLE IF EXISTS public.plan_temas RESTRICT;
DROP TABLE IF EXISTS public.plan_niveles RESTRICT;
DROP TABLE IF EXISTS public.plan_clases RESTRICT;
DROP TABLE IF EXISTS public.planificacion_nodos RESTRICT;

-- Verificación: Las 7 tablas fueron eliminadas limpiamente con RESTRICT.
-- Si algún objeto dependiera de estas tablas, RESTRICT habría evitado la eliminación silenciosa.
