-- ============================================================
-- Migration: Hermes Proactive WhatsApp Integration
-- Date: 2026-06-23
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hermes_whatsapp_config (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_url  text NOT NULL,
  api_key      text,
  instance_name text NOT NULL DEFAULT 'soi-main',
  activo       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hermes_whatsapp_queue (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jid          text NOT NULL,
  mensaje      text NOT NULL,
  estado       text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'enviado', 'fallido')),
  intentos     integer DEFAULT 0,
  error_msg    text,
  created_at   timestamptz DEFAULT now(),
  procesado_at timestamptz
);

ALTER TABLE public.hermes_whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hermes_whatsapp_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_wa_config ON public.hermes_whatsapp_config;
CREATE POLICY allow_all_wa_config ON public.hermes_whatsapp_config FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_wa_queue ON public.hermes_whatsapp_queue;
CREATE POLICY allow_all_wa_queue ON public.hermes_whatsapp_queue FOR ALL USING (true) WITH CHECK (true);

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

CREATE OR REPLACE FUNCTION public.fn_trigger_hermes_task_wa_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_event_title text;
  v_group_jid text;
  v_msg text;
  v_teacher_phone text;
BEGIN
  SELECT titulo INTO v_event_title 
  FROM public.calendario_institucional 
  WHERE id = NEW.event_id;

  IF NEW.prioridad IN ('critica', 'alta') THEN
    v_msg := '🚨 *HERMES TASK DELEGATED* (' || NEW.prioridad || ')' || E'\n' ||
             '• *Evento:* ' || coalesce(v_event_title, 'General') || E'\n' ||
             '• *Tarea:* ' || NEW.titulo || E'\n' ||
             '• *Dept:* ' || NEW.departamento || E'\n' ||
             '• *Vence:* ' || coalesce(NEW.fecha_vencimiento::text, 'Sin fecha') || E'\n\n' ||
             'Por favor, ingresa al portal de tareas de Hermes para completar los requisitos.';

    PERFORM public.fn_hermes_queue_whatsapp(
      NEW.departamento::text || '_coordinator@s.whatsapp.net',
      v_msg
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_hermes_task_wa_alert ON public.tareas_institucionales;
CREATE TRIGGER trg_hermes_task_wa_alert
  AFTER INSERT ON public.tareas_institucionales
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_hermes_task_wa_alert();
