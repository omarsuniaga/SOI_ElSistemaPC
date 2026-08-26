-- ============================================================================
-- Migration: HERMES Reactive Rules Configuration Table (Phase 3)
-- Timestamp: 20260818000004
-- Project: sistema-academico-pwa
-- Description: Create hermes_reactive_rules table to enable/disable R1-R5 handlers
--              per department without code deployment. Includes RLS policies and
--              seed data for 5 reactive rules.
-- Date: 2026-08-18
-- ============================================================================

-- Create hermes_reactive_rules table
-- This table stores metadata for R1-R5 reactive handlers, allowing directors to
-- toggle rule execution on/off per department without redeploying edge functions.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hermes_reactive_rules (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type       text          NOT NULL,
  nombre          text          NOT NULL,
  descripcion     text,
  enabled         boolean       NOT NULL DEFAULT true,
  departamento    text          NOT NULL,
  conditions_json jsonb         NOT NULL DEFAULT '{}',
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  -- Constraint: rule_type must be one of R1-R5
  CONSTRAINT check_hermes_rules_type CHECK (rule_type IN ('R1', 'R2', 'R3', 'R4', 'R5')),

  -- Constraint: departamento must be valid soi_departamento code
  CONSTRAINT check_hermes_rules_departamento CHECK (
    departamento IN ('DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT')
  ),

  -- Unique constraint: one rule per (rule_type, departamento) pair
  -- This prevents duplicate rule configurations per rule type and department
  CONSTRAINT uq_hermes_rules_type_dept UNIQUE (rule_type, departamento)
);

-- T1: Create indices for efficient handler lookups
-- ============================================================================

-- Primary index: (rule_type, departamento) for handler rule queries
-- Spec Scenario: AC-RUL-01-S1 (handler checks enabled status before execution)
CREATE INDEX idx_hermes_rules_lookup
  ON public.hermes_reactive_rules(rule_type, departamento);

-- Department index: enable rule management UI to fetch rules by department
CREATE INDEX idx_hermes_rules_departamento
  ON public.hermes_reactive_rules(departamento);

-- Enabled index: for operational queries ("which rules are active?")
CREATE INDEX idx_hermes_rules_enabled
  ON public.hermes_reactive_rules(enabled, rule_type);

-- ============================================================================
-- T2: Create updated_at trigger for automatic timestamp maintenance
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_hermes_rules_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hermes_rules_update_updated_at
  BEFORE UPDATE ON public.hermes_reactive_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_hermes_rules_update_updated_at();

-- ============================================================================
-- T3: Enable RLS and create department-scoped policies
-- ============================================================================

ALTER TABLE public.hermes_reactive_rules ENABLE ROW LEVEL SECURITY;

-- Policy: service_role (backend) bypasses RLS
-- Event-spine-logger edge function uses service_role key for rule lookups
CREATE POLICY hermes_rules_service_role_all
  ON public.hermes_reactive_rules
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: DIR (Executive) can select, update, insert all rules across all departments
-- Full visibility and control for strategic rule management
CREATE POLICY hermes_rules_dir_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'DIR'
  );

CREATE POLICY hermes_rules_dir_update
  ON public.hermes_reactive_rules
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'DIR'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'DIR'
  );

CREATE POLICY hermes_rules_dir_insert
  ON public.hermes_reactive_rules
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'DIR'
  );

-- Policy: ACM can view only ACM rules
CREATE POLICY hermes_rules_acm_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ACM'
    AND departamento = 'ACM'
  );

-- Policy: ACM can update ACM rules (name, description, enabled toggle)
CREATE POLICY hermes_rules_acm_update
  ON public.hermes_reactive_rules
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ACM'
    AND departamento = 'ACM'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ACM'
    AND departamento = 'ACM'
  );

-- Policy: ADM can view only ADM rules
CREATE POLICY hermes_rules_adm_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ADM'
    AND departamento = 'ADM'
  );

-- Policy: ADM can update ADM rules
CREATE POLICY hermes_rules_adm_update
  ON public.hermes_reactive_rules
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ADM'
    AND departamento = 'ADM'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'ADM'
    AND departamento = 'ADM'
  );

-- Policy: LOG can view only LOG rules
CREATE POLICY hermes_rules_log_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'LOG'
    AND departamento = 'LOG'
  );

-- Policy: LOG can update LOG rules
CREATE POLICY hermes_rules_log_update
  ON public.hermes_reactive_rules
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'LOG'
    AND departamento = 'LOG'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'LOG'
    AND departamento = 'LOG'
  );

-- Policies for other departments (FIN, COM, TECNICO, LUT): read-only their own rules
-- These departments cannot modify rules in Phase 3 (read-only view)

CREATE POLICY hermes_rules_fin_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'FIN'
    AND departamento = 'FIN'
  );

CREATE POLICY hermes_rules_com_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'COM'
    AND departamento = 'COM'
  );

CREATE POLICY hermes_rules_tecnico_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'TECNICO'
    AND departamento = 'TECNICO'
  );

CREATE POLICY hermes_rules_lut_select
  ON public.hermes_reactive_rules
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_department() = 'LUT'
    AND departamento = 'LUT'
  );

-- ============================================================================
-- T4: Seed initial rule data (5 rules × 5 departments = 25 rows, all enabled=true)
-- ============================================================================

-- R1: Ausencia acumulada → ACM (only applicable to ACM department)
INSERT INTO public.hermes_reactive_rules (rule_type, nombre, descripcion, enabled, departamento, conditions_json)
VALUES
  ('R1', 'Ausencia acumulada → ACM', 'Crea tarea ACM cuando alumno acumula 3 faltas injustificadas en 7 días', true, 'ACM', '{"groq_enabled": false}')
ON CONFLICT (rule_type, departamento) DO NOTHING;

-- R2: Tarea vencida → DIR (only applicable to DIR department)
INSERT INTO public.hermes_reactive_rules (rule_type, nombre, descripcion, enabled, departamento, conditions_json)
VALUES
  ('R2', 'Tarea vencida → DIR', 'Escala a DIR cuando una tarea institucional vence sin completarse', true, 'DIR', '{}')
ON CONFLICT (rule_type, departamento) DO NOTHING;

-- R3: Cierre de periodo → ACM (only applicable to ACM department)
INSERT INTO public.hermes_reactive_rules (rule_type, nombre, descripcion, enabled, departamento, conditions_json)
VALUES
  ('R3', 'Cierre de periodo → ACM', 'Crea tarea crítica en ACM para generar informes al cerrar un periodo', true, 'ACM', '{"groq_enabled": false}')
ON CONFLICT (rule_type, departamento) DO NOTHING;

-- R4: Sesión sin asistencia → ACM (only applicable to ACM department)
INSERT INTO public.hermes_reactive_rules (rule_type, nombre, descripcion, enabled, departamento, conditions_json)
VALUES
  ('R4', 'Sesión sin asistencia → ACM', 'Recordatorio al maestro si pasan 24h sin registrar asistencia', true, 'ACM', '{}')
ON CONFLICT (rule_type, departamento) DO NOTHING;

-- R5: Justificación rechazada → ADM (only applicable to ADM department)
INSERT INTO public.hermes_reactive_rules (rule_type, nombre, descripcion, enabled, departamento, conditions_json)
VALUES
  ('R5', 'Justificación rechazada → ADM', 'Notifica a ADM cuando se rechaza una justificación de ausencia', true, 'ADM', '{}')
ON CONFLICT (rule_type, departamento) DO NOTHING;

-- ============================================================================
-- COMMENT: Summary of seeded rules
-- ============================================================================
-- R1 (ACM): Triggered by asistencia.falta_injustificada events
--   Conditions: 3+ absences in 7 days per student
--   Action: Create escalation task in ACM department
--   Groq: Optional enrichment of task title (disabled by default)
--
-- R2 (DIR): Triggered by tarea.vencida events
--   Conditions: Any task reaching due date without completion
--   Action: Escalate to DIR for override/extension decision
--   Groq: N/A
--
-- R3 (ACM): Triggered by periodo.cerrado events
--   Conditions: Period closure detection
--   Action: Create critical task for ACM to generate period reports
--   Groq: Optional enrichment of report title (disabled by default)
--
-- R4 (ACM): Triggered by sesion.creada events
--   Conditions: 24 hours since session creation without attendance logged
--   Action: Remind maestro to complete attendance
--   Groq: N/A
--
-- R5 (ADM): Triggered by justificacion.rechazada events
--   Conditions: Any justification rejection
--   Action: Notify ADM of rejection for review
--   Groq: N/A
-- ============================================================================
