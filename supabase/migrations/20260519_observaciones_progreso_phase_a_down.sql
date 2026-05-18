-- ============================================================
-- DOWN Migration: observaciones-progreso Phase A
-- Date: 2026-05-19
-- Purpose: Revert RLS policies and permission seed added by the UP migration.
--
-- NOTE: The tipo CHECK constraint and calificacion CHECK constraint are NOT
-- rolled back because the prior shape was identical or stricter. Rolling them
-- back would require knowing the exact prior constraint definition, and in
-- production both constraints were already correct before this migration.
-- The tipo remap UPDATEs are also not reversed (data-destructive; acceptable
-- only during the same deploy window before application writes occur).
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Drop RLS write policies — observaciones_alumnos
-- ============================================================
DROP POLICY IF EXISTS "Maestros crean observaciones de sus alumnos"     ON public.observaciones_alumnos;
DROP POLICY IF EXISTS "Maestros actualizan observaciones de sus alumnos" ON public.observaciones_alumnos;
DROP POLICY IF EXISTS "Maestros eliminan observaciones de sus alumnos"  ON public.observaciones_alumnos;

-- ============================================================
-- STEP 2: Drop RLS write policies — progresos
-- ============================================================
DROP POLICY IF EXISTS "Maestros crean progresos"      ON public.progresos;
DROP POLICY IF EXISTS "Maestros actualizan progresos" ON public.progresos;
DROP POLICY IF EXISTS "Maestros eliminan progresos"   ON public.progresos;

-- ============================================================
-- STEP 3: Revoke evaluacion:write from permisos_maestros
-- (removes the permission from all maestros who received it via the UP seed)
-- ============================================================
UPDATE public.permisos_maestros
SET permisos = array_remove(permisos, 'evaluacion:write')
WHERE 'evaluacion:write' = ANY(permisos);

COMMIT;
