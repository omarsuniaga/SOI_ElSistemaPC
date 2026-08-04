-- MIGRATION: Add missing UNIQUE constraint on evaluacion_indicador
-- Fixes error 42P10: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
--
-- The original table (20260730000001_deploy_evaluacion_indicador.sql) created
-- regular indexes but NOT a UNIQUE CONSTRAINT. Supabase's .upsert() with
-- onConflict: 'alumno_id,indicator_id,clase_id' requires a real UNIQUE CONSTRAINT.
--
-- This migration adds the constraint idempotently (only if it does not exist).
-- After applying this, the simpler .upsert() pattern can be restored in
-- evaluacionClaseService.js (currently working around it with SELECT + UPDATE/INSERT).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evaluacion_indicador_alumno_indicator_clase_unique'
      AND conrelid = 'public.evaluacion_indicador'::regclass
  ) THEN
    ALTER TABLE public.evaluacion_indicador
      ADD CONSTRAINT evaluacion_indicador_alumno_indicator_clase_unique
      UNIQUE (alumno_id, indicator_id, clase_id);

    RAISE NOTICE 'Constraint evaluacion_indicador_alumno_indicator_clase_unique added.';
  ELSE
    RAISE NOTICE 'Constraint already exists — skipped.';
  END IF;
END
$$;
