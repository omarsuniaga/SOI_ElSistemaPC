-- ============================================================================
-- Migration: HERMES Rule R6 — WhatsApp Proactivo a Padres (Phase 4A)
-- Timestamp: 20260818000006
-- Project: sistema-academico-pwa (zmhmdvmyeyswunurcyow)
-- Description: Extends check_hermes_rules_type with R6 and inserts seed configuration
--              for proactive WhatsApp alerts to parents upon 3 unjustified absences.
-- ============================================================================

-- 1. Actualizar Check Constraint para permitir R6
ALTER TABLE public.hermes_reactive_rules 
  DROP CONSTRAINT IF EXISTS check_hermes_rules_type;

ALTER TABLE public.hermes_reactive_rules 
  ADD CONSTRAINT check_hermes_rules_type 
  CHECK (rule_type IN ('R1', 'R2', 'R3', 'R4', 'R5', 'R6'));

-- 2. Insertar Regla R6 en hermes_reactive_rules
INSERT INTO public.hermes_reactive_rules (
  rule_type,
  nombre,
  descripcion,
  enabled,
  departamento,
  conditions_json
) VALUES (
  'R6',
  'WhatsApp Proactivo a Padres por Ausencias Acumuladas',
  'Envía automáticamente un mensaje de WhatsApp al representante cuando un alumno acumula 3 faltas injustificadas en 7 días, con guardia estricta de 48h de enfriamiento.',
  true,
  'ACM',
  '{
    "threshold_days": 7,
    "min_faltas": 3,
    "cooldown_hours": 48,
    "template": "Estimado/a representante de {nombre_alumno}: Le informamos que el/la estudiante ha acumulado {faltas} inasistencias injustificadas en los últimos 7 días en El Sistema Punta Cana. Por favor comuníquese con Coordinación Académica para coordinar el seguimiento."
  }'::jsonb
)
ON CONFLICT (rule_type, departamento) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  conditions_json = EXCLUDED.conditions_json,
  updated_at = now();
