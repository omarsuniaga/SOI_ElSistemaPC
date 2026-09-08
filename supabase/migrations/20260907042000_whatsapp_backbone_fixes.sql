-- ============================================================================
-- 20260907042000_whatsapp_backbone_fixes.sql
-- SDD whatsapp-gateway-multidepto · Ronda 1 de review del backbone F1-F3
--
-- 1. fn_hermes_gateway_reclamar_instancia — claim ATÓMICO de la titularidad del
--    gateway de un departamento (reemplaza el read-then-write TOCTOU que hacía
--    la Edge Function). Dos PCs arrancando juntas no pueden quedar ambas
--    activas.
-- 2. fn_whatsapp_reaper_procesando + cron — recupera filas que quedaron en
--    'procesando' sin /report (Electron caído, partición de red, ACK perdido).
--    Sin esto, esas filas nunca se reintentan y su presupuesto de intentos ya
--    se gastó.
--
-- Idempotente.
-- ============================================================================

BEGIN;

-- ── 1. Claim atómico de la instancia del gateway ──────────────────────────
CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_reclamar_instancia(
  p_instance_name text,
  p_nombre_equipo text,
  p_status  text DEFAULT 'connected',
  p_phone   text DEFAULT NULL,
  p_battery int  DEFAULT NULL,
  p_qr      text DEFAULT NULL
)
RETURNS TABLE (gano boolean, owner_equipo text, seconds_since_heartbeat numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status text := CASE WHEN p_status IN ('connected','connecting','disconnected','qr_ready')
                        THEN p_status ELSE 'connected' END;
  v_upserted uuid;
BEGIN
  IF coalesce(trim(p_nombre_equipo), '') = '' THEN
    RAISE EXCEPTION 'nombre_equipo es obligatorio';
  END IF;

  -- INSERT si no existe; si existe, solo se actualiza (= esta PC toma la
  -- titularidad) cuando el latido actual está viejo (>90s) o ya es de esta PC.
  INSERT INTO public.hermes_gateway_health AS h
    (instance_name, status, phone_number, battery_level, qr_code_base64, last_heartbeat, metadata)
  VALUES (p_instance_name, v_status, p_phone, p_battery, p_qr, now(),
          jsonb_build_object('nombre_equipo', p_nombre_equipo))
  ON CONFLICT (instance_name) DO UPDATE
    SET status         = EXCLUDED.status,
        phone_number   = COALESCE(EXCLUDED.phone_number, h.phone_number),
        battery_level  = EXCLUDED.battery_level,
        qr_code_base64 = EXCLUDED.qr_code_base64,
        last_heartbeat = now(),
        metadata       = EXCLUDED.metadata
    WHERE h.last_heartbeat < now() - interval '90 seconds'
       OR coalesce(h.metadata->>'nombre_equipo', p_nombre_equipo) = p_nombre_equipo
  RETURNING h.id INTO v_upserted;

  IF v_upserted IS NOT NULL THEN
    RETURN QUERY SELECT true, p_nombre_equipo, 0::numeric;
  ELSE
    RETURN QUERY
      SELECT false,
             h.metadata->>'nombre_equipo',
             round(EXTRACT(EPOCH FROM (now() - h.last_heartbeat))::numeric, 1)
      FROM public.hermes_gateway_health h
      WHERE h.instance_name = p_instance_name;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.fn_hermes_gateway_reclamar_instancia(text, text, text, text, int, text)
  FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_reclamar_instancia(text, text, text, text, int, text)
  TO service_role;

COMMENT ON FUNCTION public.fn_hermes_gateway_reclamar_instancia(text, text, text, text, int, text) IS
  'Latido + claim atómico de la titularidad del gateway de un departamento. Devuelve gano=false (y el owner actual) si otra PC latió hace <90s. Solo service_role (edge fn whatsapp-gateway /heartbeat).';

-- ── 2. Reaper de filas 'procesando' colgadas ──────────────────────────────
-- Umbral CONSERVADOR (45 min): solo captura filas de un proceso que crasheó.
-- Un corte transitorio de /report lo cubre el reintento del runner (buffer en
-- memoria que reintenta cada ~6s). Si el reaper devolviera a
-- 'pendiente' una fila que el runner sí entregó pero no pudo reportar, se
-- re-enviaría (doble mensaje). El runner además tolera que la fila haya sido
-- movida: /report marca 'enviado' aunque la encuentre en 'pendiente'.
CREATE OR REPLACE FUNCTION public.fn_whatsapp_reaper_procesando(p_min integer DEFAULT 45)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_n integer;
BEGIN
  WITH viejas AS (
    SELECT id, coalesce(intentos, 0) AS intentos
    FROM public.hermes_whatsapp_queue
    WHERE estado = 'procesando'
      -- El claim setea procesado_at=now(); el fallback a created_at es por si
      -- alguna fila quedó en procesando por una vía vieja.
      AND coalesce(procesado_at, created_at) < now() - make_interval(mins => greatest(p_min, 1))
    ORDER BY coalesce(procesado_at, created_at)
    LIMIT 500
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.hermes_whatsapp_queue q
  SET estado = CASE WHEN v.intentos >= 3 THEN 'fallido' ELSE 'pendiente' END,
      error_msg = 'reaper: quedó en procesando sin reporte (>' || greatest(p_min, 1) || ' min)'
  FROM viejas v
  WHERE q.id = v.id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END $$;

REVOKE ALL ON FUNCTION public.fn_whatsapp_reaper_procesando(integer) FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_reaper_procesando(integer) TO service_role;

COMMENT ON FUNCTION public.fn_whatsapp_reaper_procesando(integer) IS
  'Recupera filas de hermes_whatsapp_queue que quedaron en procesando sin /report: vuelven a pendiente (o fallido si intentos>=3). F7 (watchdog) lo puede reemplazar por una versión más completa.';

-- Cron cada 10 minutos (patrón de class-start-reminders-cron).
SELECT cron.unschedule('whatsapp-reaper-procesando')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'whatsapp-reaper-procesando');

SELECT cron.schedule(
  'whatsapp-reaper-procesando',
  '*/10 * * * *',
  $$SELECT public.fn_whatsapp_reaper_procesando(45);$$
);

COMMIT;
