-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — vista de estrellas (Tarea 1.4)
-- Fecha: 2026-07-31
-- Contexto (openspec/changes/mapa-gamificado-planificacion/design.md,
--   Decisión 5, REQ-06/07/08):
--
--   Las estrellas del nodo NUNCA se escriben: se derivan en esta vista. Si
--   nadie puede escribir la estrella, nadie puede escribirla mal (cumple
--   §5.3 de la propuesta por construcción).
--
--   "Superador" = alumno con TODOS sus indicadores REQUERIDOS
--   (es_requerido = true) y NO archivados (archived_at IS NULL) evaluados
--   con nota >= 3 (via clase_indicador_id). Un indicador sin evaluar
--   EXCLUYE al alumno del promedio — nunca cuenta como 0 (REQ-07).
--
--   Bandas: 3.0–3.4 -> 1★, 3.5–4.2 -> 2★, 4.3–5.0 -> 3★.
--   estado_visual = 'en_progreso' cuando alumnos_superadores = 0 (REQ-08),
--   nunca "0★".
--
-- LECCIÓN de la migración #3 (ver Orchestrator Follow-up en
--   apply-progress.md): CUALQUIER CREATE VIEW sobre una tabla con RLS debe
--   llevar WITH (security_invoker = true). Sin esto, Postgres ejecuta la
--   vista con privilegios del owner y bypasea el RLS por completo —
--   exactamente el bug que get_advisors(type: "security") atrapó la vez
--   pasada como "Security Definer View". Esta vista lee evaluacion_indicador
--   y clase_mapa_indicadores/clase_mapa_objetivos, todas con RLS.
--
-- REQ-12 (aislamiento estructural, ver design.md Decisión 7): esta vista NO
--   debe poder leer la tabla de bitácora libre bajo ninguna circunstancia.
--   Blindado con un test Vitest (estrellas.test.js) que falla si este
--   archivo menciona esa tabla en cualquier forma. La cláusula FROM de abajo
--   no la nombra ni la referencia.
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_clase_objetivo_estrellas
WITH (security_invoker = true) AS
WITH indicadores_req AS (
  -- Indicadores requeridos y no archivados: son los únicos que cuentan para
  -- "superar el objetivo" (REQ-07) y para total_indicadores (REQ-06).
  SELECT
    cmi.id AS indicador_id,
    cmi.objetivo_id,
    cmi.clase_id
  FROM public.clase_mapa_indicadores cmi
  WHERE cmi.es_requerido = true
    AND cmi.archived_at IS NULL
),
totales AS (
  SELECT objetivo_id, clase_id, COUNT(*) AS total_indicadores
  FROM indicadores_req
  GROUP BY objetivo_id, clase_id
),
indicadores_con_alguna_evaluacion AS (
  -- indicadores_evaluados a nivel de objetivo: cuántos de los indicadores
  -- requeridos ya tienen AL MENOS una evaluación de cualquier alumno.
  SELECT ir.objetivo_id, ir.clase_id, COUNT(DISTINCT ir.indicador_id) AS indicadores_evaluados
  FROM indicadores_req ir
  JOIN public.evaluacion_indicador ei ON ei.clase_indicador_id = ir.indicador_id
  GROUP BY ir.objetivo_id, ir.clase_id
),
cobertura_alumno AS (
  -- Por alumno: cuántos de los indicadores requeridos evaluó, y si TODOS
  -- los que evaluó tienen nota >= 3 (BOOL_AND ignora NULLs por diseño de
  -- Postgres, así que solo pondera evaluaciones que realmente existen).
  SELECT
    ir.objetivo_id,
    ir.clase_id,
    ei.alumno_id,
    COUNT(*) AS indicadores_del_alumno_evaluados,
    BOOL_AND(ei.nota >= 3) AS todos_superados,
    AVG(ei.nota::numeric) AS promedio_alumno
  FROM indicadores_req ir
  JOIN public.evaluacion_indicador ei ON ei.clase_indicador_id = ir.indicador_id
  GROUP BY ir.objetivo_id, ir.clase_id, ei.alumno_id
),
superadores AS (
  -- Superador = evaluó TODOS los indicadores requeridos (cobertura completa)
  -- Y todas esas notas son >= 3. Los incompletos quedan fuera del promedio,
  -- nunca cuentan como 0 (REQ-07).
  SELECT
    ca.objetivo_id,
    ca.clase_id,
    COUNT(*) AS alumnos_superadores,
    AVG(ca.promedio_alumno) AS promedio_superadores
  FROM cobertura_alumno ca
  JOIN totales t ON t.objetivo_id = ca.objetivo_id AND t.clase_id = ca.clase_id
  WHERE ca.indicadores_del_alumno_evaluados = t.total_indicadores
    AND ca.todos_superados IS TRUE
  GROUP BY ca.objetivo_id, ca.clase_id
)
SELECT
  t.objetivo_id,
  t.clase_id,
  t.total_indicadores,
  COALESCE(ie.indicadores_evaluados, 0) AS indicadores_evaluados,
  ROUND((COALESCE(ie.indicadores_evaluados, 0)::numeric / t.total_indicadores) * 100, 1) AS pct_avance,
  COALESCE(s.alumnos_superadores, 0) AS alumnos_superadores,
  s.promedio_superadores,
  CASE
    WHEN COALESCE(s.alumnos_superadores, 0) = 0 THEN 0
    WHEN s.promedio_superadores >= 4.3 THEN 3
    WHEN s.promedio_superadores >= 3.5 THEN 2
    WHEN s.promedio_superadores >= 3.0 THEN 1
    ELSE 0
  END AS estrellas,
  CASE
    WHEN COALESCE(s.alumnos_superadores, 0) = 0 THEN 'en_progreso'
    ELSE 'con_estrellas'
  END AS estado_visual
FROM totales t
LEFT JOIN indicadores_con_alguna_evaluacion ie
  ON ie.objetivo_id = t.objetivo_id AND ie.clase_id = t.clase_id
LEFT JOIN superadores s
  ON s.objetivo_id = t.objetivo_id AND s.clase_id = t.clase_id;

GRANT SELECT ON public.vw_clase_objetivo_estrellas TO authenticated;

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP VIEW IF EXISTS public.vw_clase_objetivo_estrellas;
-- ============================================================================
