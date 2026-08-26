-- ============================================================================
-- MIGRATION: 20260814000003_hermes_wbs_project_manager_engine.sql
-- Motor de Orquestación WBS y Project Manager Institucional (SOI V9)
-- Reconciliación completa validada para Hermes Core
-- ============================================================================

-- 1. Nuevo estado en el ENUM de Tareas (bloqueo DAG)
ALTER TYPE public.tarea_institucional_estado 
  ADD VALUE IF NOT EXISTS 'bloqueada_por_dependencia';

-- 2. Columnas WBS y Grafo DAG en tareas_institucionales
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS depende_de_tarea_id UUID 
    REFERENCES public.tareas_institucionales(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS t_minus_dias INT;

CREATE INDEX IF NOT EXISTS idx_tareas_dag 
  ON public.tareas_institucionales(depende_de_tarea_id) 
  WHERE depende_de_tarea_id IS NOT NULL;

-- 3. Extensión de calendario_institucional para macro-eventos y salud de proyectos
ALTER TABLE public.calendario_institucional
  ADD COLUMN IF NOT EXISTS es_macro_evento BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS salud_proyecto TEXT DEFAULT 'en_orden' 
    CHECK (salud_proyecto IN ('en_orden', 'en_riesgo', 'critico', 'completado')),
  ADD COLUMN IF NOT EXISTS venue_id TEXT,
  ADD COLUMN IF NOT EXISTS aforo_proyectado INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata_pm JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_calendario_macro 
  ON public.calendario_institucional(es_macro_evento) 
  WHERE es_macro_evento = true;

-- 4. Extensión de hermes_protocolos para plantillas WBS
ALTER TABLE public.hermes_protocolos
  ADD COLUMN IF NOT EXISTS protocolo_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS hitos JSONB DEFAULT '[]'::jsonb;

-- 5. Trigger Transaccional de Desbloqueo Automático (DAG)
CREATE OR REPLACE FUNCTION public.fn_trigger_desbloqueo_tareas_dependientes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'completada' AND (OLD.estado IS DISTINCT FROM 'completada') THEN
    UPDATE public.tareas_institucionales
    SET 
      estado = 'pendiente', 
      updated_at = now()
    WHERE 
      depende_de_tarea_id = NEW.id 
      AND estado = 'bloqueada_por_dependencia';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_desbloqueo_tareas ON public.tareas_institucionales;
CREATE TRIGGER trg_desbloqueo_tareas
  AFTER UPDATE ON public.tareas_institucionales
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_desbloqueo_tareas_dependientes();

-- 6. Función de Desplazamiento Temporal Transaccional (Delta T)
CREATE OR REPLACE FUNCTION public.fn_desplazar_cronograma_evento(
  p_event_id UUID, 
  p_delta_dias INT
)
RETURNS INT AS $$
DECLARE
  v_rows_updated INT;
BEGIN
  -- 1. Desplazar fechas del evento macro en calendario_institucional
  UPDATE public.calendario_institucional
  SET 
    fecha_inicio = fecha_inicio + (p_delta_dias || ' days')::INTERVAL,
    fecha_fin = fecha_fin + (p_delta_dias || ' days')::INTERVAL,
    updated_at = now()
  WHERE id = p_event_id;

  -- 2. Desplazar fechas de vencimiento solo en tareas pendientes o bloqueadas
  UPDATE public.tareas_institucionales
  SET 
    fecha_vencimiento = fecha_vencimiento + (p_delta_dias || ' days')::INTERVAL,
    updated_at = now()
  WHERE 
    event_id = p_event_id 
    AND estado NOT IN ('completada', 'cancelada');

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated;
END;
$$ LANGUAGE plpgsql;
