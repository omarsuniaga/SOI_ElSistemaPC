-- ============================================================
-- Migration: Hermes Proactive WhatsApp Integration
-- Timestamp: 20260623_hermes_whatsapp_integration
-- Project: sistema-academico-pwa
-- Description: Schema and triggers to handle active WhatsApp message queuing and config
-- Date: 2026-06-23
-- ============================================================

-- 1. Configuration table for the WhatsApp API Gateway
CREATE TABLE IF NOT EXISTS public.hermes_whatsapp_config (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_url  text NOT NULL, -- Endpoint of Baileys/Evolution API
  api_key      text,          -- Secret authorization key
  instance_name text NOT NULL DEFAULT 'soi-main',
  activo       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- 2. Message queue for WhatsApp alerts
CREATE TABLE IF NOT EXISTS public.hermes_whatsapp_queue (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jid          text NOT NULL, -- Group JID (e.g. 1203630283@g.us) or individual (1809xxxx@s.whatsapp.net)
  mensaje      text NOT NULL,
  estado       text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'enviado', 'fallido')),
  intentos     integer DEFAULT 0,
  error_msg    text,
  created_at   timestamptz DEFAULT now(),
  procesado_at timestamptz
);

-- Enable RLS for config and queue
ALTER TABLE public.hermes_whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hermes_whatsapp_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_wa_config ON public.hermes_whatsapp_config;
CREATE POLICY allow_all_wa_config ON public.hermes_whatsapp_config FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_wa_queue ON public.hermes_whatsapp_queue;
CREATE POLICY allow_all_wa_queue ON public.hermes_whatsapp_queue FOR ALL USING (true) WITH CHECK (true);

-- 3. Utility Function: Queue WhatsApp Notification
CREATE OR REPLACE FUNCTION public.fn_hermes_queue_whatsapp(
  p_jid text,
  p_mensaje text
) RETURNS uuid AS $$
DECLARE
  v_queue_id uuid;
BEGIN
  IF p_jid IS NULL OR p_jid = '' OR p_mensaje IS NULL OR p_mensaje = '' THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje)
  VALUES (p_jid, p_mensaje)
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger Function: Send Alert when an Institutional Task is Delegated
CREATE OR REPLACE FUNCTION public.fn_trigger_hermes_task_wa_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_event_title text;
  v_group_jid text;
  v_msg text;
  v_teacher_phone text;
BEGIN
  -- Fetch event details
  SELECT titulo INTO v_event_title 
  FROM public.calendario_institucional 
  WHERE id = NEW.event_id;

  -- 1. Notify the general department/group JID (if configured)
  -- For demo, we default to sending an alert to the responsible department coordinator
  -- If the task is critical or high, we queue a WhatsApp message
  IF NEW.prioridad IN ('critica', 'alta') THEN
    v_msg := '🚨 *HERMES TASK DELEGATED* (' || NEW.prioridad || ')' || E'\n' ||
             '• *Evento:* ' || coalesce(v_event_title, 'General') || E'\n' ||
             '• *Tarea:* ' || NEW.titulo || E'\n' ||
             '• *Dept:* ' || NEW.departamento || E'\n' ||
             '• *Vence:* ' || coalesce(NEW.fecha_vencimiento::text, 'Sin fecha') || E'\n\n' ||
             'Por favor, ingresa al portal de tareas de Hermes para completar los requisitos.';

    -- Queue to a placeholder JID matching the department group
    -- In practice, these JIDs would be configured in a department registry
    -- We construct a JID like 'LOG_group@g.us' as placeholder
    PERFORM public.fn_hermes_queue_whatsapp(
      NEW.departamento::text || '_coordinator@s.whatsapp.net',
      v_msg
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to tareas_institucionales
DROP TRIGGER IF EXISTS trg_hermes_task_wa_alert ON public.tareas_institucionales;
CREATE TRIGGER trg_hermes_task_wa_alert
  AFTER INSERT ON public.tareas_institucionales
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_hermes_task_wa_alert();

COMMENT ON TABLE public.hermes_whatsapp_config IS 'WhatsApp API Gateway configurations for Hermes Manager.';
COMMENT ON TABLE public.hermes_whatsapp_queue IS 'Outgoing WhatsApp message outbox queue managed by Hermes.';
