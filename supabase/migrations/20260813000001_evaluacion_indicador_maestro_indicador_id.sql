-- ============================================================================
-- Migration: Support personal-route indicators in evaluacion_indicador
-- Date: 2026-08-13
-- Motivo:
--   evaluacion_indicador.indicator_id es NOT NULL con FK a public.indicators
--   (catálogo institucional). El mapa de rutas propio del maestro
--   (maestro_indicadores, ver 20260812000001) NO puede usar esa columna:
--   cualquier INSERT con un id de maestro_indicadores violaría la FK.
--
--   Solución aditiva (mismo patrón ya usado para recovery_status en
--   20260812000002): agregar maestro_indicador_id como alternativa,
--   volver indicator_id nullable, y exigir con CHECK que cada fila tenga
--   exactamente uno de los dos. No se altera ni se pierde ningún dato
--   institucional existente (todas las filas actuales ya tienen
--   indicator_id NOT NULL, así que siguen siendo válidas).
-- ============================================================================

ALTER TABLE public.evaluacion_indicador
  ALTER COLUMN indicator_id DROP NOT NULL;

ALTER TABLE public.evaluacion_indicador
  ADD COLUMN IF NOT EXISTS maestro_indicador_id UUID REFERENCES public.maestro_indicadores(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ei_maestro_indicador ON public.evaluacion_indicador(maestro_indicador_id);

-- review_flag: marca un indicador ya calificado bajo advertencia blanda de
-- prerrequisito (ver indicador_prerequisito) cuando el prerrequisito se
-- recupera después. El diseño lo documentaba pero la migración de
-- recovery_status (20260812000002) nunca lo agregó — se corrige aquí.
ALTER TABLE public.evaluacion_indicador
  ADD COLUMN IF NOT EXISTS review_flag BOOLEAN NOT NULL DEFAULT FALSE;

-- La spec (attendance-debt-tracking.md) distingue "Recuperado" de
-- "No Recuperable" como dos resultados finales distintos para un alumno
-- ausente, pero el CHECK original de 20260812000002 solo admitía
-- ('pendiente', 'recuperado', 'no_aplica'). Se agrega 'no_recuperable'.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'evaluacion_indicador_recovery_status_check'
      AND conrelid = 'public.evaluacion_indicador'::regclass
  ) THEN
    ALTER TABLE public.evaluacion_indicador
      DROP CONSTRAINT evaluacion_indicador_recovery_status_check;
  END IF;
END $$;

ALTER TABLE public.evaluacion_indicador
  ADD CONSTRAINT evaluacion_indicador_recovery_status_check
  CHECK (recovery_status IN ('pendiente', 'recuperado', 'no_recuperable', 'no_aplica'));

CREATE INDEX IF NOT EXISTS idx_ei_review_flag ON public.evaluacion_indicador(review_flag) WHERE review_flag = TRUE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'evaluacion_indicador_exactly_one_indicator_source'
      AND conrelid = 'public.evaluacion_indicador'::regclass
  ) THEN
    ALTER TABLE public.evaluacion_indicador
      ADD CONSTRAINT evaluacion_indicador_exactly_one_indicator_source
      CHECK (
        (indicator_id IS NOT NULL AND maestro_indicador_id IS NULL)
        OR (indicator_id IS NULL AND maestro_indicador_id IS NOT NULL)
      );
  END IF;
END $$;

-- Unique constraint equivalente al de indicator_id, para el nuevo origen.
-- NULLs no colisionan en Postgres, así que esta convive sin conflicto con
-- evaluacion_indicador_alumno_indicator_clase_unique (20260804000003).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'evaluacion_indicador_alumno_maestro_indicador_clase_unique'
      AND conrelid = 'public.evaluacion_indicador'::regclass
  ) THEN
    ALTER TABLE public.evaluacion_indicador
      ADD CONSTRAINT evaluacion_indicador_alumno_maestro_indicador_clase_unique
      UNIQUE (alumno_id, maestro_indicador_id, clase_id);
  END IF;
END $$;
