DROP POLICY IF EXISTS allow_all_wa_queue ON public.hermes_whatsapp_queue;
DROP POLICY IF EXISTS wa_queue_read_authenticated ON public.hermes_whatsapp_queue;
CREATE POLICY wa_queue_read_admin ON public.hermes_whatsapp_queue
  FOR SELECT TO authenticated USING (public.es_admin());
DROP POLICY IF EXISTS wa_queue_service_role_all ON public.hermes_whatsapp_queue;
CREATE POLICY wa_queue_service_role_all ON public.hermes_whatsapp_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE INSERT, UPDATE, DELETE ON public.hermes_whatsapp_queue FROM anon, authenticated;

DROP POLICY IF EXISTS hgh_authenticated_read ON public.hermes_gateway_health;
DROP POLICY IF EXISTS hgh_admin_read ON public.hermes_gateway_health;
CREATE POLICY hgh_admin_read ON public.hermes_gateway_health
  FOR SELECT TO authenticated USING (public.es_admin());
REVOKE INSERT, UPDATE, DELETE ON public.hermes_gateway_health FROM anon, authenticated;

DROP POLICY IF EXISTS allow_all_wa_config ON public.hermes_whatsapp_config;
DROP POLICY IF EXISTS wa_config_admin_all ON public.hermes_whatsapp_config;
CREATE POLICY wa_config_admin_all ON public.hermes_whatsapp_config
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
DROP POLICY IF EXISTS wa_config_service_role_all ON public.hermes_whatsapp_config;
CREATE POLICY wa_config_service_role_all ON public.hermes_whatsapp_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.hermes_whatsapp_config FROM anon;

CREATE OR REPLACE FUNCTION public.fn_hermes_queue_whatsapp(p_jid text, p_mensaje text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_queue_id uuid;
BEGIN
  IF auth.role() IS NOT NULL AND auth.role() <> 'service_role'
     AND NOT COALESCE(public.es_admin(), false) THEN
    RAISE EXCEPTION 'No autorizado para encolar mensajes de WhatsApp';
  END IF;
  IF p_jid IS NULL OR btrim(p_jid) = '' OR p_mensaje IS NULL OR btrim(p_mensaje) = '' THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado, intentos)
  VALUES (btrim(p_jid), btrim(p_mensaje), 'pendiente', 0)
  RETURNING id INTO v_queue_id;
  RETURN v_queue_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_hermes_gateway_heartbeat(text, text, text, integer, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_heartbeat(text, text, text, integer, text, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_get_live_status(p_instance_name text DEFAULT 'soi-main')
RETURNS TABLE (
  instance_name text, status text, is_alive boolean, phone_number text, battery_level int,
  qr_code_base64 text, seconds_since_heartbeat numeric, last_heartbeat timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.role() IS NOT NULL AND auth.role() <> 'service_role'
     AND NOT COALESCE(public.es_admin(), false) THEN
    RAISE EXCEPTION 'No autorizado para consultar el estado de WhatsApp';
  END IF;
  RETURN QUERY
  SELECT
    h.instance_name,
    CASE WHEN h.last_heartbeat < (now() - interval '60 seconds') THEN 'disconnected' ELSE h.status END,
    (h.last_heartbeat >= (now() - interval '60 seconds') AND h.status = 'connected'),
    h.phone_number, h.battery_level, NULL::text,
    EXTRACT(EPOCH FROM (now() - h.last_heartbeat)), h.last_heartbeat
  FROM public.hermes_gateway_health h
  WHERE h.instance_name = p_instance_name
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_hermes_gateway_get_live_status(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_get_live_status(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.fn_hermes_queue_whatsapp(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_hermes_queue_whatsapp(text, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fn_hermes_reintentar_mensaje(p_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND NOT COALESCE(public.es_admin(), false) THEN
    RAISE EXCEPTION 'No autorizado para reintentar mensajes de WhatsApp';
  END IF;
  UPDATE public.hermes_whatsapp_queue
  SET estado = 'pendiente', intentos = 0, error_msg = NULL
  WHERE id = p_id AND estado = 'fallido'
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_hermes_reintentar_mensaje(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_hermes_reintentar_mensaje(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_heartbeat(
  p_instance_name text DEFAULT 'soi-main', p_status text DEFAULT 'connected',
  p_phone text DEFAULT NULL, p_battery int DEFAULT NULL, p_qr text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.hermes_gateway_health (
    instance_name, status, phone_number, battery_level, qr_code_base64, last_heartbeat, metadata
  ) VALUES (
    p_instance_name, p_status, p_phone, p_battery, NULL, now(), p_metadata
  )
  ON CONFLICT (instance_name) DO UPDATE SET
    status = EXCLUDED.status,
    phone_number = COALESCE(EXCLUDED.phone_number, public.hermes_gateway_health.phone_number),
    battery_level = EXCLUDED.battery_level,
    qr_code_base64 = NULL,
    last_heartbeat = now(),
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_hermes_gateway_heartbeat(text, text, text, integer, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_heartbeat(text, text, text, integer, text, jsonb) TO service_role;