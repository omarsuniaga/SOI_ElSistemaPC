-- ============================================================
-- Migration: WhatsApp Conversation Tracking
-- Date: 2026-06-25
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversaciones_whatsapp (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postulante_id         uuid NOT NULL REFERENCES postulantes(id) ON DELETE CASCADE,
  estado_conversacion   text NOT NULL DEFAULT 'esperando_respuesta_campania',
  reintentos            integer DEFAULT 0,
  jid                   text NOT NULL,
  ultimo_mensaje_enviado text,
  ultimo_mensaje_recibido text,
  ultima_intencion      text,
  fecha_cita_propuesta  timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  CONSTRAINT unique_postulante_conversacion UNIQUE (postulante_id)
);

CREATE INDEX IF NOT EXISTS idx_conversaciones_estado
  ON public.conversaciones_whatsapp(estado_conversacion);

ALTER TABLE public.conversaciones_whatsapp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_conversaciones ON public.conversaciones_whatsapp;
CREATE POLICY allow_all_conversaciones
  ON public.conversaciones_whatsapp FOR ALL USING (true) WITH CHECK (true);
