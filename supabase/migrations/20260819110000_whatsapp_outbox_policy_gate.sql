-- Centralized WhatsApp outbox eligibility and atomic claiming.
-- Every dispatcher must obtain messages through this function before delivery.

ALTER TABLE public.hermes_whatsapp_queue
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_queue_estado_check;

ALTER TABLE public.hermes_whatsapp_queue
  ADD CONSTRAINT hermes_whatsapp_queue_estado_check
  CHECK (estado IN ('pendiente', 'procesando', 'enviado', 'fallido', 'cancelado'));

CREATE INDEX IF NOT EXISTS idx_hermes_whatsapp_queue_claim
  ON public.hermes_whatsapp_queue (estado, created_at)
  WHERE estado = 'pendiente';

CREATE INDEX IF NOT EXISTS idx_hermes_whatsapp_queue_jid_sent
  ON public.hermes_whatsapp_queue (jid, procesado_at DESC)
  WHERE estado = 'enviado';

-- Claves de system_config usadas por este gate (reutiliza la tabla existente,
-- ya usada para el kill switch whatsapp_ingest_enabled, en vez de crear una
-- tabla hermes_config nueva).
INSERT INTO public.system_config (key, value, description) VALUES
  ('whatsapp_quiet_hours_start', '20:00', 'Hora de inicio de la ventana silenciosa (HH:MM, America/Santo_Domingo). No se despachan mensajes entre esta hora y whatsapp_quiet_hours_end.'),
  ('whatsapp_quiet_hours_end', '08:00', 'Hora de fin de la ventana silenciosa (HH:MM, America/Santo_Domingo).')
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
          AND sent.procesado_at >= now() - interval '24 hours'
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
  'Atomic outbox claim: applies runtime flag, quiet hours, opt-out, campaign consent, warm-up caps and one-send-per-JID-per-24h.';
