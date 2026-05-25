-- Add unique constraint required by progressAggregatorService.js upsert
-- onConflict: 'alumno_id,clase_id,sesion_clase_id,contenido_dsl'
--
-- Using a partial unique index so that:
--   1. Rows with contenido_dsl NOT NULL (new DSL-based records) are deduplicated.
--   2. Older rows where contenido_dsl IS NULL are not affected.
--
-- PostgreSQL allows multiple NULLs in a regular UNIQUE constraint which would break
-- the upsert, so we scope the index to non-null values only.

CREATE UNIQUE INDEX IF NOT EXISTS progresos_upsert_idx
  ON public.progresos (alumno_id, clase_id, sesion_clase_id, contenido_dsl)
  WHERE contenido_dsl IS NOT NULL;
