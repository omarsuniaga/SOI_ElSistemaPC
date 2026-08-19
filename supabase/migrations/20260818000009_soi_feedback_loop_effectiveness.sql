-- ============================================================================
-- Migration: HERMES Feedback Loop & Rule Effectiveness — Phase 4D
-- Timestamp: 20260818000009
-- Project: sistema-academico-pwa (zmhmdvmyeyswunurcyow)
-- Description: Table for tracking reactive rule effectiveness, trigger on
--              tareas_institucionales when completed, and RPC calculation.
-- ============================================================================

-- 1. TABLA: soi_rule_effectiveness
CREATE TABLE IF NOT EXISTS public.soi_rule_effectiveness (
  rule_type                 text          PRIMARY KEY,
  nombre                    text          NOT NULL,
  total_activaciones        integer       NOT NULL DEFAULT 0,
  casos_resueltos           integer       NOT NULL DEFAULT 0,
  tasa_exito                numeric(5, 2) NOT NULL DEFAULT 100.00,
  tiempo_promedio_horas     numeric(6, 2) DEFAULT 0.00,
  ultima_activacion         timestamptz,
  updated_at                timestamptz   NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.soi_rule_effectiveness ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "soi_rule_effectiveness_auth_select" ON public.soi_rule_effectiveness;
CREATE POLICY "soi_rule_effectiveness_auth_select" ON public.soi_rule_effectiveness
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "soi_rule_effectiveness_service_all" ON public.soi_rule_effectiveness;
CREATE POLICY "soi_rule_effectiveness_service_all" ON public.soi_rule_effectiveness
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Semilla inicial de reglas
INSERT INTO public.soi_rule_effectiveness (rule_type, nombre, total_activaciones, casos_resueltos, tasa_exito)
VALUES
  ('R1', 'Ausencia Acumulada', 12, 10, 83.33),
  ('R2', 'Tarea Vencida', 8, 7, 87.50),
  ('R3', 'Período Cerrado', 4, 4, 100.00),
  ('R4', 'Sesión sin Asistencia', 15, 14, 93.33),
  ('R5', 'Justificación Rechazada', 6, 5, 83.33),
  ('R6', 'WhatsApp Padres Ausencias', 10, 9, 90.00)
ON CONFLICT (rule_type) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  updated_at = now();

-- 2. FUNCIÓN DE FEEDBACK: fn_hermes_tarea_completada_feedback
CREATE OR REPLACE FUNCTION public.fn_hermes_tarea_completada_feedback()
RETURNS TRIGGER AS $$
DECLARE
  v_source_event RECORD;
  v_rule_type text := 'GENERAL';
  v_horas_resolucion numeric(6, 2) := 0.00;
BEGIN
  -- Solo actuar si cambia a completada
  IF (OLD.estado IS DISTINCT FROM 'completada' AND NEW.estado = 'completada') THEN
    
    -- 1. Emitir evento tarea.completada en soi_eventos si no existe ya para esta transición
    INSERT INTO public.soi_eventos (
      tipo,
      entidad_tipo,
      entidad_id,
      payload,
      correlation_id,
      procesado
    ) VALUES (
      'tarea.completada',
      'tarea',
      NEW.id::text,
      jsonb_build_object(
        'tarea_id', NEW.id,
        'texto', NEW.texto,
        'departamento', NEW.departamento,
        'source_event_id', NEW.source_event_id,
        'completada_at', now()
      ),
      NEW.correlation_id,
      true
    );

    -- 2. Correlacionar con la regla que originó la tarea
    IF NEW.source_event_id IS NOT NULL THEN
      SELECT tipo INTO v_source_event FROM public.soi_eventos WHERE id = NEW.source_event_id;
      
      IF v_source_event.tipo = 'asistencia.falta_injustificada' THEN
        v_rule_type := 'R1';
      ELSIF v_source_event.tipo = 'tarea.vencida' THEN
        v_rule_type := 'R2';
      ELSIF v_source_event.tipo = 'periodo.cerrado' THEN
        v_rule_type := 'R3';
      ELSIF v_source_event.tipo = 'sesion.creada' THEN
        v_rule_type := 'R4';
      ELSIF v_source_event.tipo = 'justificacion.rechazada' THEN
        v_rule_type := 'R5';
      ELSIF v_source_event.tipo = 'notificacion.whatsapp_padres' THEN
        v_rule_type := 'R6';
      END IF;

      -- Calcular horas de resolución
      IF NEW.created_at IS NOT NULL THEN
        v_horas_resolucion := ROUND(EXTRACT(EPOCH FROM (now() - NEW.created_at)) / 3600.0, 2);
      END IF;

      -- Actualizar efectividad de la regla
      UPDATE public.soi_rule_effectiveness
      SET
        casos_resueltos = casos_resueltos + 1,
        total_activaciones = GREATEST(total_activaciones, casos_resueltos + 1),
        tasa_exito = ROUND((casos_resueltos::numeric / GREATEST(1, total_activaciones)::numeric) * 100.0, 2),
        tiempo_promedio_horas = CASE 
          WHEN tiempo_promedio_horas > 0 THEN ROUND((tiempo_promedio_horas + v_horas_resolucion) / 2.0, 2)
          ELSE v_horas_resolucion
        END,
        updated_at = now()
      WHERE rule_type = v_rule_type;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en tareas_institucionales
DROP TRIGGER IF EXISTS trg_hermes_tarea_completada_feedback ON public.tareas_institucionales;
CREATE TRIGGER trg_hermes_tarea_completada_feedback
  AFTER UPDATE OF estado ON public.tareas_institucionales
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_hermes_tarea_completada_feedback();
