-- Hace configurable la ventana anti-spam "un mensaje por número cada X horas"
-- (antes hardcodeada en 24h dentro de fn_whatsapp_reclamar_pendientes). Se
-- guarda en system_config.whatsapp_dedup_jid_horas (default 24), editable
-- desde el portal (Gateway WhatsApp) para permitir pruebas controladas sin
-- tocar el código ni desactivar la protección en producción.

INSERT INTO public.system_config (key, value, description) VALUES
  ('whatsapp_dedup_jid_horas', '24', 'Horas mínimas entre dos mensajes al mismo número (anti-ban). Bajar temporalmente solo para pruebas controladas; producción debe usar 24.')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_reclamar_pendientes(p_limite integer DEFAULT NULL)
RETURNS SETOF public.hermes_whatsapp_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cfg public.hermes_whatsapp_config;
  v_enable_whatsapp boolean;
  v_quiet_start time;
  v_quiet_end time;
  v_local_time time;
  v_cap_diario integer;
  v_cap_horario integer;
  v_enviados_hoy integer;
  v_enviados_hora integer;
  v_limite integer;
  v_dedup_horas numeric;
BEGIN
  SELECT * INTO v_cfg
  FROM public.hermes_whatsapp_config
  WHERE activo = true
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT coalesce((SELECT value FROM public.system_config WHERE key = 'whatsapp_ingest_enabled'), 'false') = 'true'
  INTO v_enable_whatsapp;
  IF v_enable_whatsapp IS NOT true THEN RETURN; END IF;

  SELECT nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_start'), '')::time,
         nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_end'), '')::time
  INTO v_quiet_start, v_quiet_end;

  v_local_time := (now() AT TIME ZONE 'America/Santo_Domingo')::time;
  IF v_quiet_start IS NOT NULL AND v_quiet_end IS NOT NULL AND (
    (v_quiet_start < v_quiet_end AND v_local_time BETWEEN v_quiet_start AND v_quiet_end)
    OR (v_quiet_start >= v_quiet_end AND (v_local_time >= v_quiet_start OR v_local_time <= v_quiet_end))
  ) THEN RETURN; END IF;

  v_cap_diario := public.fn_whatsapp_cap_hoy();
  v_cap_horario := coalesce(v_cfg.cap_horario, 0);
  v_enviados_hoy := public.fn_whatsapp_enviados_hoy();
  SELECT count(*) INTO v_enviados_hora
  FROM public.hermes_whatsapp_queue
  WHERE estado = 'enviado' AND procesado_at >= now() - interval '1 hour';

  v_limite := least(
    coalesce(nullif(p_limite, 0), v_cfg.batch_size, 10),
    coalesce(v_cfg.batch_size, 10),
    greatest(v_cap_diario - v_enviados_hoy, 0),
    greatest(v_cap_horario - v_enviados_hora, 0)
  );
  IF v_limite <= 0 THEN RETURN; END IF;

  v_dedup_horas := coalesce(nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_dedup_jid_horas'), '')::numeric, 24);

  RETURN QUERY
  WITH candidatas AS (
    SELECT q.id
    FROM public.hermes_whatsapp_queue q
    LEFT JOIN public.campania_envios ce ON ce.id = q.campania_envio_id
    WHERE q.estado = 'pendiente'
      AND coalesce(q.intentos, 0) < 3
      AND NOT EXISTS (SELECT 1 FROM public.whatsapp_optout o WHERE o.jid = q.jid)
      AND (
        q.campania_envio_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.whatsapp_consentimientos wc
          WHERE wc.jid = q.jid
            AND wc.campania_id = ce.campania_id
            AND wc.acepta_campania = true
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.hermes_whatsapp_queue sent
        WHERE sent.jid = q.jid
          AND sent.estado = 'enviado'
          AND sent.procesado_at >= now() - (v_dedup_horas || ' hours')::interval
      )
    ORDER BY q.created_at
    FOR UPDATE OF q SKIP LOCKED
    LIMIT v_limite
  )
  UPDATE public.hermes_whatsapp_queue q
  SET estado = 'procesando', intentos = coalesce(q.intentos, 0) + 1
  FROM candidatas c
  WHERE q.id = c.id
  RETURNING q.*;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_whatsapp_reclamar_pendientes(integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_reclamar_pendientes(integer) TO service_role;

COMMENT ON FUNCTION public.fn_whatsapp_reclamar_pendientes(integer) IS
  'Atomic outbox claim: applies runtime flag, quiet hours, opt-out, campaign consent, warm-up caps and configurable one-send-per-JID window (system_config.whatsapp_dedup_jid_horas, default 24h).';
