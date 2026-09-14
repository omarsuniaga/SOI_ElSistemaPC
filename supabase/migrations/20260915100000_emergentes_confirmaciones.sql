-- Migration: justificacion-actividades-emergentes / Fase 1: SQL Base
-- Created: 2026-09-15 10:00:00
-- Purpose: Add institutional activity confirmation workflow with multi-maestro scope filtering, RLS, and audit trail

-- ============================================================================
-- 1. ALTER TABLE sesiones_clase: Add scope columns for institutional activities
-- ============================================================================
-- Root sessions (clase_id IS NULL) can now specify how widely an activity applies:
-- - lugar: Physical location (optional, e.g. "Auditorium")
-- - alcance_tipo: Type of scope (institution, program, orchestra, etc.)
-- - alcance_config: JSON config for scope parameters (e.g., programa_id, maestro_ids)

-- CORRECTED (orchestrator review): the original draft omitted "ADD COLUMN
-- IF NOT EXISTS" before the 2nd and 3rd columns. In Postgres, each column
-- addition in a comma-separated ALTER TABLE action list needs its own
-- "ADD COLUMN" clause — the repo's own 20260606_emergentes_columns_and_asistencias.sql
-- migration follows this pattern; the un-prefixed form is a syntax error.
ALTER TABLE sesiones_clase
  ADD COLUMN IF NOT EXISTS lugar VARCHAR(255),
  ADD COLUMN IF NOT EXISTS alcance_tipo TEXT DEFAULT 'institucion'
    CHECK (alcance_tipo IN ('institucion','orquesta','coro','programa','grupo','maestros_especificos')),
  ADD COLUMN IF NOT EXISTS alcance_config JSONB DEFAULT '{}';

-- ============================================================================
-- 2. CREATE TABLE confirmaciones_emergentes: Maestro confirmations
-- ============================================================================
-- Stores maestro confirmations of whether an institutional activity applied to their classes
-- - UNIQUE (actividad_id, maestro_id, fecha): One confirmation per activity+maestro+date
-- - respondido_por references auth.users for audit trail (SET NULL if user deleted)
-- - maestro_id references maestros (CASCADE to maintain referential integrity)
-- - respuesta values: 'si' (yes), 'no' (no), 'no_aplica' (N/A), 'no_se' (pending ACM validation)
-- - estado_validacion: 'pendiente' (waiting ACM), 'validado' (approved), 'rechazado' (rejected)

CREATE TABLE IF NOT EXISTS confirmaciones_emergentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES sesiones_clase(id) ON DELETE SET NULL,
    -- SET NULL preserves confirmations even if the parent activity is deleted; audit trail remains complete
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  respuesta TEXT NOT NULL
    CHECK (respuesta IN ('si','no','no_aplica','no_se')),
  estado_validacion TEXT DEFAULT 'pendiente'
    CHECK (estado_validacion IN ('pendiente','validado','rechazado')),
  respondido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- auth.users FK (not maestros) preserves audit trail even if maestro record deleted; ensures RLS predicates work
  respondido_at TIMESTAMPTZ DEFAULT NOW(),
  clases_afectadas JSONB DEFAULT '[]',
    -- Format: [{ clase_id: UUID, clase_nombre: text, hora_inicio: time, hora_fin: time, alumnos_count: int }, ...]
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (actividad_id, maestro_id, fecha)
    -- Idempotency: one confirmation per maestro+activity+date; UPSERT on retry
);

-- ============================================================================
-- 3. CREATE INDEXES for common query patterns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_confirmaciones_maestro_fecha
  ON confirmaciones_emergentes(maestro_id, fecha)
  -- Efficient lookup: "what confirmations does maestro M have on date D?"
;

CREATE INDEX IF NOT EXISTS idx_confirmaciones_actividad
  ON confirmaciones_emergentes(actividad_id)
  -- Efficient lookup: "who confirmed activity A?"
;

CREATE INDEX IF NOT EXISTS idx_confirmaciones_estado
  ON confirmaciones_emergentes(estado_validacion)
  -- Efficient lookup: "what confirmations are pending ACM validation?"
;

-- ============================================================================
-- 4. CREATE TRIGGER: Auto-update updated_at on every change
-- ============================================================================

CREATE OR REPLACE FUNCTION tg_confirmaciones_touch()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_confirmaciones_touch ON confirmaciones_emergentes CASCADE;
CREATE TRIGGER trg_confirmaciones_touch BEFORE UPDATE ON confirmaciones_emergentes
  FOR EACH ROW
  EXECUTE FUNCTION tg_confirmaciones_touch();

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE confirmaciones_emergentes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS POLICIES for confirmaciones_emergentes
-- ============================================================================

-- POLICY: Maestro SELECT (sees own confirmations + activities in their scope)
DROP POLICY IF EXISTS confirmaciones_select_maestro ON confirmaciones_emergentes;
CREATE POLICY confirmaciones_select_maestro ON confirmaciones_emergentes
  FOR SELECT TO authenticated
  USING (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  );

-- POLICY: ACM SELECT (sees all confirmations for management + validation)
-- CORRECTED: Removed non-existent tiene_rol() function
-- Uses direct EXISTS predicate against profiles table, matching pattern from existing migrations
DROP POLICY IF EXISTS confirmaciones_select_acm ON confirmaciones_emergentes;
CREATE POLICY confirmaciones_select_acm ON confirmaciones_emergentes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('coordinacion_academica', 'admin', 'superadmin')
    )
  );

-- POLICY: ADM SELECT (read-only, audit access)
-- Uses es_admin() helper which checks rol IN ('admin', 'inventarista')
DROP POLICY IF EXISTS confirmaciones_select_adm ON confirmaciones_emergentes;
CREATE POLICY confirmaciones_select_adm ON confirmaciones_emergentes
  FOR SELECT TO authenticated
  USING (public.es_admin());

-- POLICY: Maestro INSERT (via RPC only, enforced in RPC function logic)
-- RLS policy here allows maestro to insert their own confirmation
-- The actual maestro_id validation happens in fn_confirmar_actividad_emergente
DROP POLICY IF EXISTS confirmaciones_insert_maestro ON confirmaciones_emergentes;
CREATE POLICY confirmaciones_insert_maestro ON confirmaciones_emergentes
  FOR INSERT TO authenticated
  WITH CHECK (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    AND respondido_por = auth.uid()
  );

-- POLICY: Maestro UPDATE (only own confirmations)
DROP POLICY IF EXISTS confirmaciones_update_maestro ON confirmaciones_emergentes;
CREATE POLICY confirmaciones_update_maestro ON confirmaciones_emergentes
  FOR UPDATE TO authenticated
  USING (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  )
  WITH CHECK (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    AND respondido_por = auth.uid()
  );

-- POLICY: ACM UPDATE (validate 'no_se' responses — estado_validacion only)
-- ADDED (orchestrator review): the proposal/spec require ACM to validate
-- "no sé" responses (Portal ACM: "Validar respuestas 'No sé'"), but no policy
-- granted ACM write access — confirmaciones_update_maestro is scoped to the
-- maestro's own row + respondido_por = auth.uid(), which an ACM user never
-- satisfies. Without this, Fase 5 (Portal ACM) would be silently blocked by RLS.
DROP POLICY IF EXISTS confirmaciones_update_acm ON confirmaciones_emergentes;
CREATE POLICY confirmaciones_update_acm ON confirmaciones_emergentes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('coordinacion_academica', 'admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('coordinacion_academica', 'admin', 'superadmin')
    )
  );

-- ============================================================================
-- 7. RPC FUNCTION: fn_maestros_afectados_por_alcance
-- ============================================================================
-- Deterministically returns the array of maestro_ids affected by an institutional activity
-- based on its scope type and configuration.
--
-- CORRECTED: Changed from IMMUTABLE to STABLE because this function reads
-- sesiones_clase/clases tables (mutable data). IMMUTABLE is incorrect and risks
-- query planner caching stale results across statements.
--
-- Scope types:
--   - institucion: All maestros teaching that day
--   - orquesta/coro: Maestros of classes with tipo_clase='orquesta'/'coro'
--   - programa: Maestros of classes in specific programa_id
--   - grupo: Maestros of specific clase_ids (stored in alcance_config->'clase_ids')
--   - maestros_especificos: Explicit maestro_ids array (alcance_config->'maestro_ids')

CREATE OR REPLACE FUNCTION fn_maestros_afectados_por_alcance(
  p_actividad_id UUID,
  p_alcance_tipo TEXT,
  p_alcance_config JSONB,
  p_fecha DATE
) RETURNS UUID[] LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_result UUID[];
BEGIN
  CASE p_alcance_tipo
    WHEN 'institucion' THEN
      -- All maestros with regular classes (not institutional activities) on that date
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      WHERE sc.fecha = p_fecha
        AND sc.clase_id IS NOT NULL
        AND sc.emergente_id IS NULL;

    WHEN 'programa' THEN
      -- Maestros of classes in specific programa_id
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      JOIN clases c ON sc.clase_id = c.id
      WHERE sc.fecha = p_fecha
        AND c.programa_id = (p_alcance_config->>'programa_id')::UUID
        AND sc.emergente_id IS NULL;

    WHEN 'orquesta' THEN
      -- CORRECTED: 'orquesta' is a clases.tipo_clase value, not a separate table
      -- (verified against schema: clases_tipo_clase_check allows 'orquesta')
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      JOIN clases c ON sc.clase_id = c.id
      WHERE sc.fecha = p_fecha
        AND c.tipo_clase = 'orquesta'
        AND sc.emergente_id IS NULL;

    WHEN 'coro' THEN
      -- Maestros of classes with tipo_clase='coro'
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      JOIN clases c ON sc.clase_id = c.id
      WHERE sc.fecha = p_fecha
        AND c.tipo_clase = 'coro'
        AND sc.emergente_id IS NULL;

    WHEN 'grupo' THEN
      -- CORRECTED: clases table has NO grupo_id column (verified against schema_reference.sql)
      -- A "grupo" in this domain IS a clase row. The ACM form selects specific clase_id(s)
      -- and stores them as array in alcance_config->'clase_ids'
      SELECT ARRAY_AGG(DISTINCT sc.maestro_id)
      INTO v_result
      FROM sesiones_clase sc
      WHERE sc.fecha = p_fecha
        AND sc.clase_id = ANY (
          SELECT jsonb_array_elements_text(p_alcance_config->'clase_ids')::UUID
        )
        AND sc.emergente_id IS NULL;

    WHEN 'maestros_especificos' THEN
      -- Explicit maestro_ids from config (ACM manually selected them in the form)
      -- CORRECTED: JSONB cannot cast directly to UUID[]; must use jsonb_array_elements_text
      SELECT ARRAY_AGG(x::UUID)
      INTO v_result
      FROM jsonb_array_elements_text(p_alcance_config->'maestro_ids') AS x;

    ELSE
      -- Unknown scope type; return empty array
      v_result := ARRAY[]::UUID[];
  END CASE;

  -- Return empty array if no results, preserving type safety
  RETURN COALESCE(v_result, ARRAY[]::UUID[]);
END $$;

-- ============================================================================
-- 8. RPC FUNCTION: fn_confirmar_actividad_emergente
-- ============================================================================
-- Idempotent UPSERT of maestro confirmation for an institutional activity.
-- Validates that:
--   - The activity exists and is a root session (clase_id IS NULL)
--   - The maestro exists
--   - The confirming user (auth.uid()) matches the maestro
--
-- Returns the full confirmacion row for client inspection.
-- The trigger in registros_pendientes handles status escalation and notifications.

CREATE OR REPLACE FUNCTION fn_confirmar_actividad_emergente(
  p_actividad_id UUID,
  p_maestro_id UUID,
  p_fecha DATE,
  p_respuesta TEXT,
  p_observaciones TEXT DEFAULT NULL
) RETURNS confirmaciones_emergentes LANGUAGE plpgsql AS $$
DECLARE
  v_conf confirmaciones_emergentes;
  v_actividad sesiones_clase;
  v_maestro maestros;
BEGIN
  -- Validate that actividad exists and is a root session (clase_id IS NULL)
  SELECT * INTO v_actividad
  FROM sesiones_clase
  WHERE id = p_actividad_id AND clase_id IS NULL;

  IF v_actividad IS NULL THEN
    RAISE EXCEPTION 'Actividad not found or not a root session';
  END IF;

  -- Validate that maestro exists
  SELECT * INTO v_maestro FROM maestros WHERE id = p_maestro_id;
  IF v_maestro IS NULL THEN
    RAISE EXCEPTION 'Maestro not found';
  END IF;

  -- UPSERT confirmation with idempotency guarantee via UNIQUE constraint
  INSERT INTO confirmaciones_emergentes (
    actividad_id, maestro_id, fecha, respuesta,
    respondido_por, respondido_at, observaciones
  ) VALUES (
    p_actividad_id, p_maestro_id, p_fecha, p_respuesta,
    auth.uid(), now(), p_observaciones
  )
  ON CONFLICT (actividad_id, maestro_id, fecha)
  DO UPDATE SET
    respuesta = EXCLUDED.respuesta,
    respondido_por = EXCLUDED.respondido_por,
    respondido_at = EXCLUDED.respondido_at,
    observaciones = EXCLUDED.observaciones,
    updated_at = now()
  RETURNING * INTO v_conf;

  -- The caller (or a separate trigger) is responsible for:
  -- - Updating registros_pendientes status (resolved, escalated)
  -- - Sending notifications if respuesta='no_se' (pending ACM validation)

  RETURN v_conf;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
--
-- IMPORTANT: This migration creates the foundational schema for the
-- institutional activity confirmation workflow. It does NOT:
--   - Create notification triggers (handled by registros_pendientes infrastructure)
--   - Modify existing pipeline code (getSesionesPorRango, asistenciaDataService)
--   - Deploy frontend components
--
-- Next steps (Fases 2-8):
--   - Fase 2: Fix asistencias pipeline to respect emergente_id
--   - Fase 3: Deploy DataAdapter + service layer
--   - Fase 4-6: Deploy portal UIs (maestros, ACM, ADM)
--   - Fase 7: Run 15 mandatory test cases
--   - Fase 8: Deploy documentation
--
-- TO APPLY THIS MIGRATION:
-- In a staging/branch Supabase environment:
--   supabase migration up
-- Do NOT apply to production without explicit user confirmation and testing.
