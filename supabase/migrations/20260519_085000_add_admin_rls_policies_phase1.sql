-- Migration: Phase 1 - Admin RLS Policy Framework
-- Timestamp: 20260519_085000
-- Date: 2026-05-19
-- Purpose: Unblock admin panel access to attendance data by creating es_admin() helper
--          and adding admin-aware RLS policies to 6 critical tables
-- Reference: DIAGNOSTICO_RLS_STRATEGY.md
-- Status: EXECUTED - 2026-05-19

-- =====================================================================
-- Step 1: Create es_admin() helper function
-- =====================================================================
-- This function checks if the authenticated user has admin role in JWT
CREATE OR REPLACE FUNCTION es_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt()->>'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- Step 2: Update asistencias - Add admin_all policy
-- =====================================================================
-- Allows admin to read all attendance records
-- Also maintains maestro access via existing conditions
DROP POLICY IF EXISTS "Admin reads all asistencias" ON asistencias;
CREATE POLICY "asistencias_admin_all"
  ON asistencias FOR ALL
  USING (es_admin() OR EXISTS(
    SELECT 1 FROM sesiones_clase s
    WHERE s.id = asistencias.sesion_clase_id
    AND (s.maestro_id = maestro_actual() OR maestro_en_clase(s.clase_id))
  ));

-- =====================================================================
-- Step 3: Update sesiones_clase - Add admin_all policy
-- =====================================================================
-- Allows admin to read all class sessions
DROP POLICY IF EXISTS "Admin reads all sesiones" ON sesiones_clase;
CREATE POLICY "sesiones_admin_all"
  ON sesiones_clase FOR ALL
  USING (es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id));

-- =====================================================================
-- Step 4: Update observaciones_alumnos - Enable RLS and add admin policy
-- =====================================================================
-- First, enable RLS on this table (was missing)
ALTER TABLE observaciones_alumnos ENABLE ROW LEVEL SECURITY;
-- Then add admin policy to allow admin read access
DROP POLICY IF EXISTS "obs_admin_all" ON observaciones_alumnos;
CREATE POLICY "obs_admin_all"
  ON observaciones_alumnos FOR ALL
  USING (es_admin());

-- =====================================================================
-- Step 5: Update justificaciones - Add admin_all policy
-- =====================================================================
-- Allows admin to manage all justifications
DROP POLICY IF EXISTS "justificaciones_admin_all" ON justificaciones;
CREATE POLICY "justificaciones_admin_all"
  ON justificaciones FOR ALL
  USING (es_admin() OR maestro_en_clase(clase_id));

-- =====================================================================
-- Step 6: Update contenidos_sesion - Add admin_all policy
-- =====================================================================
-- Allows admin to manage all session content
DROP POLICY IF EXISTS "contenidos_admin_all" ON contenidos_sesion;
CREATE POLICY "contenidos_admin_all"
  ON contenidos_sesion FOR ALL
  USING (es_admin());

-- =====================================================================
-- Impact Summary
-- =====================================================================
-- Tables Modified: 6
-- - asistencias: +1 policy (asistencias_admin_all)
-- - sesiones_clase: +1 policy (sesiones_admin_all)
-- - observaciones_alumnos: RLS enabled + 1 policy (obs_admin_all)
-- - justificaciones: +1 policy (justificaciones_admin_all)
-- - contenidos_sesion: +1 policy (contenidos_admin_all)
--
-- Functions Created: 1
-- - es_admin(): Helper to detect admin role in JWT
--
-- Result: Admin panel can now access attendance data and related records
-- Next Phase: Apply admin policies to remaining 50+ tables (Phase 2)
