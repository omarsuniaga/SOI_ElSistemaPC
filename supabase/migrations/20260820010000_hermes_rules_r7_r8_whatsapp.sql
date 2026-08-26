-- ============================================================================
-- Migration: HERMES Rules R7 (WhatsApp Maestros) y R8 (WhatsApp Tareas Vencidas)
-- Timestamp: 20260820010000
-- Project: sistema-academico-pwa (zmhmdvmyeyswunurcyow)
-- Description: Extiende check_hermes_rules_type con R7/R8 e inserta configuración
--              seed. Sigue el mismo patrón que R6 (20260818000006).
-- ============================================================================

-- 1. Actualizar Check Constraint para permitir R7 y R8
ALTER TABLE public.hermes_reactive_rules
  DROP CONSTRAINT IF EXISTS check_hermes_rules_type;

ALTER TABLE public.hermes_reactive_rules
  ADD CONSTRAINT check_hermes_rules_type
  CHECK (rule_type IN ('R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8'));

-- 2. Insertar Regla R7 — WhatsApp a Maestros por Asistencia Pendiente
INSERT INTO public.hermes_reactive_rules (
  rule_type,
  nombre,
  descripcion,
  enabled,
  departamento,
  conditions_json
) VALUES (
  'R7',
  'WhatsApp a Maestros por Asistencia Pendiente',
  'Sub-acción de R4: cuando una sesión lleva 24h sin asistencia registrada, además del recordatorio interno, envía un WhatsApp al maestro (requiere aprobación por defecto).',
  true,
  'ACM',
  '{
    "cooldown_hours": 24,
    "requiere_aprobacion": true,
    "template": "Hola {nombre_maestro}, notamos que aún no se ha registrado la asistencia de la sesión del {fecha}. Por favor complétala cuando pueda. Gracias por su compromiso con El Sistema Punta Cana."
  }'::jsonb
)
ON CONFLICT (rule_type, departamento) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  conditions_json = EXCLUDED.conditions_json,
  updated_at = now();

-- 3. Insertar Regla R8 — WhatsApp de Seguimiento por Tareas Vencidas
-- NOTA: telefono_contacto queda vacío a propósito — no hay directorio telefónico
-- de responsables en el esquema actual (ver comentario en r8-whatsapp-tareas.ts).
-- Sin ese valor configurado, R8 se salta el envío (reason: no_contact_configured).
-- Editar conditions_json.telefono_contacto vía rulesView o SQL antes de usar.
INSERT INTO public.hermes_reactive_rules (
  rule_type,
  nombre,
  descripcion,
  enabled,
  departamento,
  conditions_json
) VALUES (
  'R8',
  'WhatsApp de Seguimiento por Tareas Vencidas',
  'Sub-acción de R2: cuando se escala una tarea vencida a DIR, además de la tarea interna, envía un resumen por WhatsApp al contacto de seguimiento configurado (requiere aprobación por defecto).',
  true,
  'DIR',
  '{
    "cooldown_hours": 24,
    "requiere_aprobacion": true,
    "telefono_contacto": "",
    "template": "Seguimiento HERMES: la tarea \"{titulo}\" del departamento {departamento} lleva {dias} día(s) vencida. Requiere revisión."
  }'::jsonb
)
ON CONFLICT (rule_type, departamento) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  conditions_json = EXCLUDED.conditions_json,
  updated_at = now();
