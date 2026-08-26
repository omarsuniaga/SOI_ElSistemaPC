-- Migration: Add dynamic roles and methodology fields to system_config
-- These replace the hardcoded arrays in the frontend.

INSERT INTO system_config (key, value, description) VALUES
  (
    'available_roles', 
    '["superadmin", "admin", "direccion", "coordinacion_academica", "maestro", "monitor", "finanzas", "operaciones", "representante", "alumno", "user"]', 
    'Lista de roles disponibles en el sistema (JSON array)'
  ),
  (
    'methodology_fields', 
    '[{"key": "repertoire_used", "label": "Repertorio / Material", "type": "text", "placeholder": "Ej: obra o material trabajado"}, {"key": "sight_reading_work", "label": "Lectura a Primera Vista", "type": "text", "placeholder": ""}, {"key": "ear_training_work", "label": "Entrenamiento Auditivo", "type": "text", "placeholder": ""}, {"key": "closing_observation", "label": "Observación de Cierre", "type": "textarea", "placeholder": "Notas finales..."}]', 
    'Campos de formulario de metodología (JSON array)'
  )
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
