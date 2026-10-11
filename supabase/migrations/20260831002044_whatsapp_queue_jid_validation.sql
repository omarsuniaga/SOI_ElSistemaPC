-- Hardening: la cola de WhatsApp aceptaba JIDs inválidos como
-- 'ACM_coordinator@s.whatsapp.net' (placeholder que el trigger
-- fn_trigger_hermes_task_wa_alert genera y que nunca resuelve a un número
-- real). Resultado: 6 mensajes trabados 5 días que jamás se enviarían.
-- Ahora fn_hermes_queue_whatsapp rechaza cualquier JID que no sea
-- <digitos>@s.whatsapp.net (individual) o <id>@g.us (grupo).
CREATE OR REPLACE FUNCTION public.fn_hermes_queue_whatsapp(p_jid text, p_mensaje text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_queue_id uuid;
BEGIN
  IF p_jid IS NULL OR p_jid = '' OR p_mensaje IS NULL OR p_mensaje = '' THEN
    RETURN NULL;
  END IF;

  -- JID válido: número individual (<digitos>@s.whatsapp.net) o grupo (<id>@g.us).
  -- Rechaza placeholders tipo '<DEPT>_coordinator@s.whatsapp.net'.
  IF p_jid !~ '^[0-9]{7,15}@s\.whatsapp\.net$' AND p_jid !~ '^[0-9-]+@g\.us$' THEN
    RAISE WARNING 'fn_hermes_queue_whatsapp: JID inválido rechazado: %', p_jid;
    RETURN NULL;
  END IF;

  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje)
  VALUES (p_jid, p_mensaje)
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$function$;

-- Cancela los 6 mensajes basura ya encolados (JID placeholder, nunca enviables).
UPDATE public.hermes_whatsapp_queue
SET estado = 'cancelado',
    error_msg = 'JID placeholder inválido (<DEPT>_coordinator@s.whatsapp.net) — cancelado en el hardening 2026-08-31',
    procesado_at = now()
WHERE estado = 'pendiente'
  AND jid ~ '_coordinator@s\.whatsapp\.net$';