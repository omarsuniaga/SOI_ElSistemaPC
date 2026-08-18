-- ============================================================================
-- Migration: SOI Event Spine — DDL Foundation (Phase 1)
-- Timestamp: 20260818000000
-- Project: sistema-academico-pwa
-- Description: Core immutable event log table, indices, RLS policies, and event type taxonomy
-- Date: 2026-08-18
-- ============================================================================
-- This migration creates the soi_eventos table and supporting infrastructure
-- for the Event Spine system. Phase 1 is logging-only: triggers (Phase 2) insert
-- events, but no side effects are performed. The table is append-only (immutable
-- via RLS), indexed for timeline and causality queries, and protected by
-- department-scoped RLS policies.
-- ============================================================================

-- T1: Create soi_eventos table with 8 columns
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.soi_eventos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo            text        NOT NULL,
  entidad_tipo    text        NOT NULL,
  entidad_id      uuid,
  actor_id        uuid,
  payload         jsonb       NOT NULL DEFAULT '{}',
  correlation_id  uuid,
  procesado       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- T11: Add CHECK constraint for event type taxonomy
-- Valid event types: 15 semantic types across 5 domains
-- Sesiones Clase (3): sesion.creada, sesion.completada, sesion.cancelada
-- Asistencias (3): asistencia.registrada, asistencia.falta_injustificada, asistencia.falta_justificada
-- Tareas (4): tarea.creada, tarea.completada, tarea.escalada, tarea.vencida
-- Justificaciones (3): justificacion.solicitada, justificacion.aprobada, justificacion.rechazada
-- Periodos (2): periodo.abierto, periodo.cerrado
ALTER TABLE public.soi_eventos
ADD CONSTRAINT check_soi_eventos_tipo CHECK (
  tipo IN (
    'sesion.creada', 'sesion.completada', 'sesion.cancelada',
    'asistencia.registrada', 'asistencia.falta_injustificada', 'asistencia.falta_justificada',
    'tarea.creada', 'tarea.completada', 'tarea.escalada', 'tarea.vencida',
    'justificacion.solicitada', 'justificacion.aprobada', 'justificacion.rechazada',
    'periodo.abierto', 'periodo.cerrado'
  )
);

-- T12: Payload structure documentation by event type
-- These schemas document the JSONB payload structure expected for each event type.
-- Phase 2 enrichment and Phase 3 consumers use these contracts to parse and act on events.
-- ============================================================================
-- PAYLOAD SCHEMAS (documented in SQL comments for reference):
--
-- sesion.creada:
--   { clase_id, maestro_id, fecha, horario_id }
--   Logged when a new sesion is inserted into sesiones_clase
--
-- sesion.completada:
--   { anterior_estado, nuevo_estado, timestamp_cambio }
--   Logged when sesion.estado changes to "completada"
--
-- sesion.cancelada:
--   { anterior_estado, nuevo_estado, timestamp_cambio }
--   Logged when sesion.estado changes to "cancelada"
--
-- asistencia.registrada:
--   { alumno_id, sesion_id, maestro_id, tipo_asistencia, clase_id }
--   Logged when a new asistencia record is inserted
--
-- asistencia.falta_injustificada:
--   { alumno_id, sesion_id, dias_consecutivos }
--   Logged when asistencia.estado changes to "falta_injustificada"
--
-- asistencia.falta_justificada:
--   { alumno_id, sesion_id, justificacion_id }
--   Logged when asistencia.estado changes to "falta_justificada"
--   NOTE: correlation_id links to the justificacion.aprobada event
--
-- tarea.creada:
--   { titulo, departamento, prioridad, fecha_vencimiento }
--   Logged when new tarea_institucional is inserted
--
-- tarea.completada:
--   { titulo, departamento, completada_en, dias_resolucion }
--   Logged when tarea.estado changes to "completada"
--
-- tarea.escalada:
--   { titulo, departamento, nivel_escalacion, razon }
--   Logged when tarea.estado changes to "escalada"
--
-- tarea.vencida:
--   { titulo, departamento, dias_vencida }
--   Logged when tarea.estado changes to "vencida"
--
-- justificacion.solicitada:
--   { alumno_id, ausencia_fecha, motivo, maestro_id }
--   Logged when new justificacion record is inserted
--
-- justificacion.aprobada:
--   { alumno_id, ausencia_fecha, aprobada_por }
--   Logged when justificacion.estado changes to "aprobada"
--   NOTE: correlation_id may link to asistencia.falta_injustificada
--
-- justificacion.rechazada:
--   { alumno_id, ausencia_fecha, razon_rechazo }
--   Logged when justificacion.estado changes to "rechazada"
--
-- periodo.abierto:
--   { periodo_id, nombre, fecha_inicio }
--   Logged when new periodo record is inserted
--
-- periodo.cerrado:
--   { periodo_id, nombre, total_sesiones, total_alumnos }
--   Logged when periodo.cerrado changes from false to true
--
-- ============================================================================

-- T2: Create indices for timeline and causality queries
-- ============================================================================

-- Entity timeline index: (entidad_id, created_at DESC)
-- Used for querying all events for a specific entity (student, session, task, etc.)
-- Enables efficient timeline queries: SELECT * FROM soi_eventos WHERE entidad_id=? ORDER BY created_at DESC
CREATE INDEX idx_soi_eventos_entity_timeline
  ON public.soi_eventos(entidad_id, created_at DESC);

-- Event type timeline index: (tipo, created_at DESC)
-- Used for filtering by event type (e.g., all asistencia.registrada events)
-- Enables efficient queries: SELECT * FROM soi_eventos WHERE tipo='asistencia.registrada' ORDER BY created_at DESC
CREATE INDEX idx_soi_eventos_tipo_timeline
  ON public.soi_eventos(tipo, created_at DESC);

-- Procesado queue index: (procesado, created_at) WHERE procesado = false
-- Filtered partial index used by Phase 2 enrichment consumer for polling
-- Enables efficient queries: SELECT * FROM soi_eventos WHERE procesado=false ORDER BY created_at LIMIT 100
CREATE INDEX idx_soi_eventos_procesado_queue
  ON public.soi_eventos(procesado, created_at)
  WHERE procesado = false;

-- Correlation ID index for causality chains
-- Used for querying all events linked by correlation_id (e.g., absence → justification chain)
-- Enables efficient queries: SELECT * FROM soi_eventos WHERE correlation_id=? ORDER BY created_at
CREATE INDEX idx_soi_eventos_correlation
  ON public.soi_eventos(correlation_id);

-- ============================================================================
-- T3: Enable RLS and create department-scoped policies
-- ============================================================================

ALTER TABLE public.soi_eventos ENABLE ROW LEVEL SECURITY;

-- Helper function: Get the current user's department from auth claims
-- Falls back to check profiles table if auth claims not available
CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS text AS $$
DECLARE
  v_department text;
BEGIN
  -- Try to get from auth.jwt() claims first
  v_department := auth.jwt() -> 'app_metadata' ->> 'departamento';
  IF v_department IS NOT NULL THEN
    RETURN v_department;
  END IF;

  -- Fallback to profiles table lookup
  SELECT profile_data -> 'departamento' ->> 0 INTO v_department
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_department, 'TECNICO');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Policy: service_role (backend) bypasses RLS
-- Trigger functions and edge functions use SECURITY DEFINER with service_role
-- This policy allows unrestricted access for backend operations
CREATE POLICY soi_eventos_service_role_all
  ON public.soi_eventos
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: ACM (Academic) can read events from:
--   - sesiones_clase (sesion.*)
--   - asistencias (asistencia.*)
--   - periodos (periodo.*)
-- Cannot see: tareas_institucionales or justificaciones (unless escalated by DIR)
CREATE POLICY soi_eventos_acm_select
  ON public.soi_eventos
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ACM'
    AND entidad_tipo IN ('sesiones_clase', 'asistencias', 'periodos')
  );

-- Policy: ADM (Administration) can read events from:
--   - justificaciones (justificacion.*)
--   - periodos (periodo.*)
-- Cannot see: academic events or tasks (unless escalated to them)
CREATE POLICY soi_eventos_adm_select
  ON public.soi_eventos
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ADM'
    AND entidad_tipo IN ('justificaciones', 'periodos')
  );

-- Policy: DIR (Executive) can read ALL events across all departments
-- Full visibility for strategic oversight and escalation management
CREATE POLICY soi_eventos_dir_select
  ON public.soi_eventos
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'DIR'
  );

-- Policy: LOG (Logistics) can read events from:
--   - tareas_institucionales (tarea.*)
-- Cannot see: academic or administrative events (unless escalated to them)
CREATE POLICY soi_eventos_log_select
  ON public.soi_eventos
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'LOG'
    AND entidad_tipo = 'tareas_institucionales'
  );

-- Policy: FIN (Finance) has no access to soi_eventos in Phase 1
-- Finance event logging deferred to Phase 2 (billing, revenue events)
-- This policy ensures empty result set if FIN users query the table
CREATE POLICY soi_eventos_fin_select
  ON public.soi_eventos
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'FIN'
    AND false  -- Always false: no events visible to FIN in Phase 1
  );

-- Policy: TECNICO (IT) has no access to soi_eventos
-- IT infrastructure team does not need event timeline visibility
-- This policy ensures empty result set if TECNICO users query the table
CREATE POLICY soi_eventos_tecnico_select
  ON public.soi_eventos
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'TECNICO'
    AND false  -- Always false: no events visible to TECNICO
  );

-- ============================================================================
-- T4: Immutability Policy — Block UPDATE and DELETE for authenticated users
-- ============================================================================
-- The soi_eventos table is append-only. Authenticated users cannot modify
-- or delete events. Only INSERT is allowed (via SECURITY DEFINER triggers).
-- This guarantees audit trail integrity and prevents accidental data loss.

-- Block all UPDATE operations for authenticated users
CREATE POLICY soi_eventos_immutable_update
  ON public.soi_eventos
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- Block all DELETE operations for authenticated users
CREATE POLICY soi_eventos_immutable_delete
  ON public.soi_eventos
  FOR DELETE
  USING (false);

-- ============================================================================
-- End of Migration
-- ============================================================================
