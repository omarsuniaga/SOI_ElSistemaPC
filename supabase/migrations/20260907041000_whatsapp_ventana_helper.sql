-- ============================================================================
-- 20260907041000_whatsapp_ventana_helper.sql
-- SDD whatsapp-gateway-multidepto · F2 · Work Unit 4
--
-- Extrae la lógica de "¿se puede despachar AHORA para este departamento?" a una
-- función reutilizable: la usa la claim fn (fuente de verdad) y la Edge Function
-- `whatsapp-gateway` para poblar `ventana_ok` en la respuesta de `/claim` (la app
-- Electron lo muestra en el tray: "Fuera de horario, próximo envío 10:00").
--
-- Reemplaza el bloque inline de ventana horaria dentro de
-- fn_whatsapp_reclamar_pendientes(text, int) por una llamada a este helper, para
-- que la regla viva en un solo lugar.
--
-- Idempotente.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_ventana_abierta(p_departamento text)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg public.hermes_whatsapp_config;
  v_local_ts timestamp;
  v_local_time time;
  v_dow int;
  v_quiet_start time;
  v_quiet_end time;
BEGIN
  SELECT * INTO v_cfg
  FROM public.hermes_whatsapp_config
  WHERE activo = true AND departamento = p_departamento
  LIMIT 1;
  IF NOT FOUND THEN RETURN false; END IF;

  v_local_ts := now() AT TIME ZONE 'America/Santo_Domingo';
  v_local_time := v_local_ts::time;
  v_dow := extract(isodow FROM v_local_ts);   -- 1 = lunes ... 7 = domingo

  -- Días hábiles.
  IF v_cfg.solo_dias_habiles AND v_dow > 5 THEN RETURN false; END IF;

  -- Ventana horaria del departamento.
  IF v_cfg.ventana_inicio IS NOT NULL AND v_cfg.ventana_fin IS NOT NULL THEN
    IF v_cfg.ventana_inicio <= v_cfg.ventana_fin THEN
      IF v_local_time < v_cfg.ventana_inicio OR v_local_time >= v_cfg.ventana_fin THEN RETURN false; END IF;
    ELSE
      -- Ventana que cruza medianoche.
      IF v_local_time < v_cfg.ventana_inicio AND v_local_time >= v_cfg.ventana_fin THEN RETURN false; END IF;
    END IF;
  END IF;

  -- Quiet hours global: interruptor de apagado adicional. Si start == end se
  -- ignora (una config así bloquearía el envío para siempre, casi seguro un
  -- error de tipeo).
  SELECT nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_start'), '')::time,
         nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_end'), '')::time
  INTO v_quiet_start, v_quiet_end;
  IF v_quiet_start IS NOT NULL AND v_quiet_end IS NOT NULL AND v_quiet_start <> v_quiet_end AND (
    (v_quiet_start < v_quiet_end AND v_local_time >= v_quiet_start AND v_local_time < v_quiet_end)
    OR (v_quiet_start > v_quiet_end AND (v_local_time >= v_quiet_start OR v_local_time < v_quiet_end))
  ) THEN RETURN false; END IF;

  RETURN true;
END $$;

COMMENT ON FUNCTION public.fn_whatsapp_ventana_abierta(text) IS
  'true si el departamento puede despachar AHORA: dentro de ventana_inicio/ventana_fin, día hábil si solo_dias_habiles, y fuera de las quiet hours globales. Zona America/Santo_Domingo. Fuente de verdad de la ventana; el runner tiene un chequeo cliente aproximado.';

REVOKE ALL ON FUNCTION public.fn_whatsapp_ventana_abierta(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_ventana_abierta(text) TO authenticated, service_role;

-- ── Reemplazar el bloque inline de ventana en la claim fn por el helper ────
CREATE OR REPLACE FUNCTION public.fn_whatsapp_reclamar_pendientes(
  p_departamento text,
  p_limite integer DEFAULT NULL
)
RETURNS SETOF public.hermes_whatsapp_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg public.hermes_whatsapp_config;
  v_enable_whatsapp boolean;
  v_cap_diario integer;
  v_cap_horario integer;
  v_enviados_hoy integer;
  v_enviados_hora integer;
  v_limite integer;
  v_dedup_horas numeric;
BEGIN
  IF p_departamento IS NULL THEN
    RAISE EXCEPTION 'fn_whatsapp_reclamar_pendientes: p_departamento es obligatorio';
  END IF;

  SELECT * INTO v_cfg
  FROM public.hermes_whatsapp_config
  WHERE activo = true AND departamento = p_departamento
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  -- Kill switch global.
  SELECT coalesce((SELECT value FROM public.system_config WHERE key = 'whatsapp_ingest_enabled'), 'false') = 'true'
  INTO v_enable_whatsapp;
  IF v_enable_whatsapp IS NOT true THEN RETURN; END IF;

  -- Ventana horaria del departamento (helper: única fuente de verdad).
  IF NOT public.fn_whatsapp_ventana_abierta(p_departamento) THEN RETURN; END IF;

  v_cap_diario := public.fn_whatsapp_cap_hoy(p_departamento);
  v_cap_horario := coalesce(v_cfg.cap_horario, 0);
  v_enviados_hoy := public.fn_whatsapp_enviados_hoy(p_departamento);
  SELECT count(*) INTO v_enviados_hora
  FROM public.hermes_whatsapp_queue
  WHERE estado = 'enviado'
    AND departamento = p_departamento
    AND origen <> 'test'
    AND procesado_at >= now() - interval '1 hour';

  v_limite := least(
    coalesce(nullif(p_limite, 0), v_cfg.batch_size, 10),
    coalesce(v_cfg.batch_size, 10),
    greatest(v_cap_diario - v_enviados_hoy, 0),
    greatest(v_cap_horario - v_enviados_hora, 0)
  );
  IF v_limite <= 0 THEN RETURN; END IF;

  -- Cast defensivo: un valor no numérico en system_config no debe tumbar el
  -- claim de todos los departamentos.
  BEGIN
    v_dedup_horas := coalesce(
      nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_dedup_jid_horas'), '')::numeric,
      24
    );
  EXCEPTION WHEN others THEN
    v_dedup_horas := 24;
  END;

  RETURN QUERY
  WITH candidatas AS (
    SELECT q.id
    FROM public.hermes_whatsapp_queue q
    LEFT JOIN public.campania_envios ce ON ce.id = q.campania_envio_id
    WHERE q.estado = 'pendiente'
      AND q.departamento = p_departamento
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
          AND sent.departamento = q.departamento
          AND sent.estado = 'enviado'
          AND sent.origen <> 'test'
          AND sent.procesado_at >= now() - (v_dedup_horas * interval '1 hour')
      )
    ORDER BY q.created_at
    FOR UPDATE OF q SKIP LOCKED
    LIMIT v_limite
  )
  UPDATE public.hermes_whatsapp_queue q
  SET estado = 'procesando',
      intentos = coalesce(q.intentos, 0) + 1,
      -- procesado_at marca el instante de la última transición de estado. En
      -- 'procesando' equivale a "reclamado en"; el reaper (fn_whatsapp_reaper_
      -- procesando) lo usa para detectar filas colgadas. En 'enviado' lo pisa
      -- /report con la hora real de envío. Ninguna cuenta anti-ban lee filas
      -- 'procesando', así que es seguro.
      procesado_at = now()
  FROM candidatas c
  WHERE q.id = c.id
  RETURNING q.*;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text, integer) FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text, integer) TO service_role;

COMMENT ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text, integer) IS
  'Claim atómico de la cola de WhatsApp POR DEPARTAMENTO: kill switch, ventana horaria (fn_whatsapp_ventana_abierta), caps diario/horario, warm-up, opt-out global, consentimiento de campaña, dedup por (jid, departamento) excluyendo origen=test, FOR UPDATE SKIP LOCKED. Solo service_role.';

COMMIT;
