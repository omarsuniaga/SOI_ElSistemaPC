-- Fase 3: aprobación humana antes de cada disparo proactivo de WhatsApp (R6).
-- El handler R6 encola con estado 'pendiente_aprobacion' por defecto; el
-- dispatcher/fn_whatsapp_reclamar_pendientes solo toma mensajes en 'pendiente',
-- así que un mensaje pendiente de aprobación nunca se envía hasta que alguien
-- de ACM/DIR lo apruebe explícitamente.

ALTER TABLE public.hermes_whatsapp_queue
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_queue_estado_check;

ALTER TABLE public.hermes_whatsapp_queue
  ADD CONSTRAINT hermes_whatsapp_queue_estado_check
  CHECK (estado IN ('pendiente', 'pendiente_aprobacion', 'procesando', 'enviado', 'fallido', 'cancelado'));

CREATE OR REPLACE FUNCTION public.fn_hermes_aprobar_whatsapp(p_queue_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol text;
BEGIN
  SELECT rol INTO v_rol FROM public.profiles WHERE id = auth.uid();
  IF coalesce(v_rol, '') NOT IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica') THEN
    RAISE EXCEPTION 'No autorizado para aprobar mensajes de WhatsApp';
  END IF;

  UPDATE public.hermes_whatsapp_queue
  SET estado = 'pendiente'
  WHERE id = p_queue_id AND estado = 'pendiente_aprobacion';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mensaje % no está pendiente de aprobación', p_queue_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_hermes_rechazar_whatsapp(p_queue_id uuid, p_motivo text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol text;
BEGIN
  SELECT rol INTO v_rol FROM public.profiles WHERE id = auth.uid();
  IF coalesce(v_rol, '') NOT IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica') THEN
    RAISE EXCEPTION 'No autorizado para rechazar mensajes de WhatsApp';
  END IF;

  UPDATE public.hermes_whatsapp_queue
  SET estado = 'cancelado', error_msg = p_motivo
  WHERE id = p_queue_id AND estado = 'pendiente_aprobacion';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mensaje % no está pendiente de aprobación', p_queue_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_hermes_aprobar_whatsapp(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_hermes_aprobar_whatsapp(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.fn_hermes_rechazar_whatsapp(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_hermes_rechazar_whatsapp(uuid, text) TO authenticated;
