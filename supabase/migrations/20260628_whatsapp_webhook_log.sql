-- ============================================================
-- Migration: WhatsApp Webhook Log
-- Date: 2026-06-28
-- ============================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_log (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id              text NOT NULL,
  jid_remitente           text NOT NULL,
  postulante_id           uuid REFERENCES postulantes(id) ON DELETE SET NULL,
  mensaje_texto           text,
  push_name               text,
  intencion_detectada     text,
  confianza               numeric(4,3),
  argumento               text,
  respuesta_enviada       text,
  estado_conversacion_nuevo text,
  accion_pipeline         jsonb,
  created_at              timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_log_message_id
  ON public.whatsapp_webhook_log(message_id);

CREATE INDEX IF NOT EXISTS idx_webhook_log_postulante
  ON public.whatsapp_webhook_log(postulante_id);

CREATE INDEX IF NOT EXISTS idx_webhook_log_created_at
  ON public.whatsapp_webhook_log(created_at DESC);

ALTER TABLE public.whatsapp_webhook_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_webhook_log ON public.whatsapp_webhook_log;
CREATE POLICY allow_all_webhook_log
  ON public.whatsapp_webhook_log FOR ALL USING (true) WITH CHECK (true);
