-- ============================================================================
-- CRÍTICO: 'Publicar Plan Oficial' en DisenadorCurricularView.js enviaba
-- objetivosEstructurados / frecuenciaSemanal / semanasTotales / nivelId en
-- el payload, pero planificaciones.model.js nunca los serializaba y la
-- tabla no tenía columnas para ellos — se guardaba solo el título, el
-- árbol de unidades e indicadores desaparecía en silencio.
--
-- No se reutiliza la columna jsonb `contenidos` existente porque
-- MaestroPlanificacionView.js ya la consume como array de strings.
-- ============================================================================

ALTER TABLE public.planificaciones
  ADD COLUMN IF NOT EXISTS objetivos_estructurados jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS frecuencia_semanal numeric,
  ADD COLUMN IF NOT EXISTS semanas_totales integer,
  ADD COLUMN IF NOT EXISTS nivel_texto text;

COMMENT ON COLUMN public.planificaciones.objetivos_estructurados IS
  'Árbol de unidades/indicadores del Diseñador Curricular (feat/planificacion-clases-rediseño). Antes se enviaba como objetivosEstructurados y se descartaba en silencio — no existía la columna.';
COMMENT ON COLUMN public.planificaciones.nivel_texto IS
  'Identificador de nivel interno del Diseñador (ej. "nivel-1"), NO es FK — nivel_id (uuid) es de otro sistema de niveles, no tocar.';

-- ============================================================================
-- DOWN
-- ============================================================================
-- ALTER TABLE public.planificaciones
--   DROP COLUMN IF EXISTS objetivos_estructurados,
--   DROP COLUMN IF EXISTS frecuencia_semanal,
--   DROP COLUMN IF EXISTS semanas_totales,
--   DROP COLUMN IF EXISTS nivel_texto;
-- ============================================================================
