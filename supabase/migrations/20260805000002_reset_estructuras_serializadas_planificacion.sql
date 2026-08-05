-- ============================================================================
-- RESET CONTROLADO: estructuras serializadas del diseñador curricular
-- Fecha: 2026-08-05
--
-- Objetivo:
--   Dejar en cero la estructura visible en `/planificacion-disenador`,
--   limpiando las fuentes REALES que esa vista hidrata:
--   1) `planificaciones.contenidos` / `planificaciones.objetivos`
--   2) fallback `plantillas_planificacion` ligado a `clase_id`
--
-- Importante:
--   - Preserva los registros de planificaciones y plantillas.
--   - Borra solamente el árbol serializado de unidades/objetivos/indicadores.
--   - NO toca plantillas genéricas (`clase_id IS NULL`).
-- ============================================================================

BEGIN;

DO $$
DECLARE
  has_contenidos boolean := false;
  has_objetivos boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'planificaciones'
      AND column_name = 'contenidos'
  ) INTO has_contenidos;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'planificaciones'
      AND column_name = 'objetivos'
  ) INTO has_objetivos;

  IF has_contenidos AND has_objetivos THEN
    EXECUTE $sql$
      UPDATE public.planificaciones
      SET contenidos = '[]'::jsonb,
          objetivos = NULL,
          updated_at = now()
    $sql$;
  ELSIF has_contenidos THEN
    EXECUTE $sql$
      UPDATE public.planificaciones
      SET contenidos = '[]'::jsonb,
          updated_at = now()
    $sql$;
  ELSIF has_objetivos THEN
    EXECUTE $sql$
      UPDATE public.planificaciones
      SET objetivos = NULL,
          updated_at = now()
    $sql$;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.plantillas_planificacion') IS NOT NULL THEN
    UPDATE public.plantillas_planificacion
    SET objetivos = '',
        contenido = '',
        updated_at = now()
    WHERE clase_id IS NOT NULL;
  END IF;
END $$;

COMMIT;
