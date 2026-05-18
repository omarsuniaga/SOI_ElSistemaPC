-- ============================================================
-- Migration: observaciones-progreso Phase A
-- Date: 2026-05-19
-- Purpose:
--   1. Audit + remap legacy observaciones_alumnos.tipo values
--   2. Idempotent CHECK constraint recreate for tipo (canonical 7)
--   3. Idempotent CHECK constraint confirm for progresos.calificacion (0..10)
--   4. 6 RLS write policies (INSERT/UPDATE/DELETE × 2 tables)
--   5. Seed evaluacion:write permission for maestros with asistencias:write
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Audit existing tipo distribution (visible in migration output)
-- ============================================================
DO $$
DECLARE r record;
BEGIN
  RAISE NOTICE '=== PRE-MIGRATION tipo audit ===';
  FOR r IN SELECT tipo, COUNT(*) AS c FROM public.observaciones_alumnos GROUP BY tipo ORDER BY tipo LOOP
    RAISE NOTICE 'tipo=% count=%', r.tipo, r.c;
  END LOOP;
  RAISE NOTICE '=== END audit ===';
END $$;

-- ============================================================
-- STEP 2: Deterministic remap of legacy JS-model tipo values
-- ============================================================
UPDATE public.observaciones_alumnos SET tipo = 'conductual'  WHERE tipo = 'comportamiento';
UPDATE public.observaciones_alumnos SET tipo = 'academica'   WHERE tipo = 'academico';
UPDATE public.observaciones_alumnos SET tipo = 'otra'        WHERE tipo = 'social';
UPDATE public.observaciones_alumnos SET tipo = 'conductual'  WHERE tipo = 'disciplina';

-- Catch-all: any remaining unknown value → 'otra'
DO $$
DECLARE unknown_count integer;
BEGIN
  SELECT COUNT(*) INTO unknown_count
  FROM public.observaciones_alumnos
  WHERE tipo NOT IN ('academica','conductual','asistencia','tecnica','motivacional','administrativa','otra');

  IF unknown_count > 0 THEN
    RAISE WARNING 'Remapping % row(s) with unrecognized tipo → otra', unknown_count;
    UPDATE public.observaciones_alumnos
    SET tipo = 'otra'
    WHERE tipo NOT IN ('academica','conductual','asistencia','tecnica','motivacional','administrativa','otra');
  END IF;
END $$;

-- ============================================================
-- STEP 3: Idempotent CHECK constraint recreate for observaciones_alumnos.tipo
-- (no-op on production where constraint already matches; safety net for dev/test)
-- ============================================================
ALTER TABLE public.observaciones_alumnos
  DROP CONSTRAINT IF EXISTS observaciones_alumnos_tipo_check;

ALTER TABLE public.observaciones_alumnos
  ADD CONSTRAINT observaciones_alumnos_tipo_check
  CHECK (tipo = ANY (ARRAY['academica','conductual','asistencia','tecnica','motivacional','administrativa','otra']::text[]));

-- ============================================================
-- STEP 4: Idempotent CHECK confirm for progresos.calificacion (0..10)
-- ============================================================
ALTER TABLE public.progresos
  DROP CONSTRAINT IF EXISTS progresos_calificacion_check;

ALTER TABLE public.progresos
  ADD CONSTRAINT progresos_calificacion_check
  CHECK (calificacion IS NULL OR (calificacion >= 0 AND calificacion <= 10));

-- ============================================================
-- STEP 5: RLS write policies — observaciones_alumnos (INSERT / UPDATE)
-- DELETE is not permitted by RLS
-- ============================================================
DROP POLICY IF EXISTS "Maestros crean observaciones de sus alumnos"     ON public.observaciones_alumnos;
DROP POLICY IF EXISTS "Maestros actualizan observaciones de sus alumnos" ON public.observaciones_alumnos;
CREATE POLICY "Maestros crean observaciones de sus alumnos"
  ON public.observaciones_alumnos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      WHERE ac.alumno_id = observaciones_alumnos.alumno_id
        AND public.maestro_en_clase(ac.clase_id)
    )
    AND public.tiene_permiso('evaluacion:write')
  );

CREATE POLICY "Maestros actualizan observaciones de sus alumnos"
  ON public.observaciones_alumnos
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      WHERE ac.alumno_id = observaciones_alumnos.alumno_id
        AND public.maestro_en_clase(ac.clase_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      WHERE ac.alumno_id = observaciones_alumnos.alumno_id
        AND public.maestro_en_clase(ac.clase_id)
    )
    AND public.tiene_permiso('evaluacion:write')
  );

-- ============================================================
-- STEP 5b: RLS write policies — progresos (INSERT / UPDATE)
-- DELETE is not permitted by RLS
-- ============================================================
DROP POLICY IF EXISTS "Maestros crean progresos"      ON public.progresos;
DROP POLICY IF EXISTS "Maestros actualizan progresos" ON public.progresos;

CREATE POLICY "Maestros crean progresos"
  ON public.progresos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.maestro_en_clase(clase_id)
    AND public.tiene_permiso('evaluacion:write')
  );

CREATE POLICY "Maestros actualizan progresos"
  ON public.progresos
  FOR UPDATE TO authenticated
  USING (public.maestro_en_clase(clase_id))
  WITH CHECK (
    public.maestro_en_clase(clase_id)
    AND public.tiene_permiso('evaluacion:write')
  );

-- ============================================================
-- STEP 6: Seed evaluacion:write for maestros who already have asistencias:write
-- (idempotent: skips rows that already have the permission)
-- ============================================================
UPDATE public.permisos_maestros
SET permisos = array_append(permisos, 'evaluacion:write')
WHERE 'asistencias:write' = ANY(permisos)
  AND NOT ('evaluacion:write' = ANY(permisos));

COMMIT;
