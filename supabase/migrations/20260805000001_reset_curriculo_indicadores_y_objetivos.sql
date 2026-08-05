-- ============================================================================
-- RESET CONTROLADO: indicadores + objetivos curriculares de prueba
-- Fecha: 2026-08-05
--
-- Objetivo:
--   Vaciar la capa curricular medible que hoy está inflando el módulo de
--   planificación con datos de prueba (indicadores, objetivos y derivados).
--
-- Alcance intencional:
--   - SÍ elimina indicadores, objetivos y tablas derivadas / vínculos directos.
--   - SÍ limpia progreso y snapshots dependientes de indicadores.
--   - NO elimina clases, maestros, alumnos, rutas, versiones, niveles ni nodos.
--   - NO borra planificaciones pedagógicas serializadas en `planificaciones`.
--
-- Razón:
--   Preservamos el armazón institucional (routes/levels/nodes) para no romper
--   otras vistas del portal. Este reset deja la capa medible en cero para
--   reconstruirla correctamente desde el diseñador curricular.
-- ============================================================================

BEGIN;

-- 1) Tablas que podrían bloquear el borrado de indicators por FK restrictiva
DO $$
BEGIN
  IF to_regclass('public.clase_objetivos') IS NOT NULL THEN
    DELETE FROM public.clase_objetivos;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.plan_indicator_links') IS NOT NULL THEN
    DELETE FROM public.plan_indicator_links;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.evaluacion_indicador') IS NOT NULL THEN
    DELETE FROM public.evaluacion_indicador;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.student_indicator_progress') IS NOT NULL THEN
    DELETE FROM public.student_indicator_progress;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.indicator_attempts') IS NOT NULL THEN
    DELETE FROM public.indicator_attempts;
  END IF;
END $$;

-- 2) Tablas sin FK CASCADE/RESTRICT dura, pero que deben quedar limpias
DO $$
BEGIN
  IF to_regclass('public.class_session_content_snapshots') IS NOT NULL THEN
    DELETE FROM public.class_session_content_snapshots
    WHERE indicator_id IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.teacher_session_indicators') IS NOT NULL THEN
    DELETE FROM public.teacher_session_indicators
    WHERE indicator_id IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.acm_weekly_plan_items') IS NOT NULL THEN
    DELETE FROM public.acm_weekly_plan_items
    WHERE indicator_id IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.acm_evidence_files') IS NOT NULL THEN
    DELETE FROM public.acm_evidence_files
    WHERE indicator_id IS NOT NULL;
  END IF;
END $$;

-- 3) Progreso derivado del árbol curricular
DO $$
BEGIN
  IF to_regclass('public.student_node_progress') IS NOT NULL THEN
    DELETE FROM public.student_node_progress;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.student_level_progress') IS NOT NULL THEN
    DELETE FROM public.student_level_progress;
  END IF;
END $$;

-- 4) Capa curricular a reconstruir
DO $$
BEGIN
  IF to_regclass('public.indicators') IS NOT NULL THEN
    DELETE FROM public.indicators;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.objetivos') IS NOT NULL THEN
    DELETE FROM public.objetivos;
  END IF;
END $$;

COMMIT;
