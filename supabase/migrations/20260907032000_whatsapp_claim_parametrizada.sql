-- ============================================================================
-- 20260907032000_whatsapp_claim_parametrizada.sql
-- SDD whatsapp-gateway-multidepto · F1 · Work Unit 2
--
-- El claim de la cola pasa a ser POR DEPARTAMENTO. Cada instancia del gateway
-- (una app Electron por departamento) reclama únicamente los mensajes de su
-- departamento, con los caps anti-ban, el warm-up y la ventana horaria de ESE
-- departamento.
--
--   fn_whatsapp_reclamar_pendientes(p_departamento text, p_limite int)  <- real
--   fn_whatsapp_reclamar_pendientes(p_limite int)                       <- wrapper compat
--
-- El wrapper compat mantiene vivos a los consumidores legacy (scripts/whatsapp-
-- runner, whatsapp-dispatcher, process-whatsapp-queue) hasta que se borran en
-- F9. Mientras haya un solo departamento activo resuelve solo; si hay más de
-- uno, RAISE (para entonces los callers legacy ya no existen).
--
-- Caps parametrizables: fn_whatsapp_cap_hoy(text) y fn_whatsapp_enviados_hoy(text).
-- Con argumento NULL ambos resuelven el ÚNICO departamento activo (ORDER BY
-- departamento LIMIT 1): determinista solo durante la transición a
-- multi-departamento. F9 retira los callers sin argumento.
--
-- Aislamiento: un claim de ADM nunca ve, bloquea ni cuenta filas de FIN, ni lee
-- la config de FIN. Verificado en supabase/tests/whatsapp_claim_multidepto.test.sql.
--
-- Idempotente (DROP FUNCTION IF EXISTS + CREATE OR REPLACE).
-- ============================================================================

BEGIN;

-- ── 1. Caps parametrizables por departamento ────────────────────────────────
-- Cambia la firma (agrega arg) -> hay que DROP + CREATE, no CREATE OR REPLACE.
DROP FUNCTION IF EXISTS public.fn_whatsapp_cap_hoy();
CREATE OR REPLACE FUNCTION public.fn_whatsapp_cap_hoy(p_departamento text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE cfg public.hermes_whatsapp_config; v_dias int;
BEGIN
  -- p_departamento NULL = "el gateway" (compat de la firma vieja). Solo es
  -- determinista mientras haya UN departamento activo; el ORDER BY fija un
  -- ganador estable si hubiera más de uno durante la transición. F9 retira los
  -- callers sin argumento.
  SELECT * INTO cfg FROM public.hermes_whatsapp_config
  WHERE activo = true
    AND (p_departamento IS NULL OR departamento = p_departamento)
  ORDER BY departamento
  LIMIT 1;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF cfg.warmup_desde IS NULL THEN RETURN cfg.cap_diario; END IF;
  v_dias := ((now() AT TIME ZONE 'America/Santo_Domingo')::date - cfg.warmup_desde);
  IF v_dias >= cfg.warmup_dias THEN RETURN cfg.cap_diario; END IF;
  IF v_dias < 0 THEN RETURN cfg.warmup_inicio; END IF;
  RETURN round(cfg.warmup_inicio + (cfg.cap_diario - cfg.warmup_inicio)::numeric * v_dias / cfg.warmup_dias);
END $$;

DROP FUNCTION IF EXISTS public.fn_whatsapp_enviados_hoy();
CREATE OR REPLACE FUNCTION public.fn_whatsapp_enviados_hoy(p_departamento text DEFAULT NULL)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  -- NULL -> el mismo departamento único que resuelve fn_whatsapp_cap_hoy(NULL),
  -- para que `cap - enviados` compare peras con peras durante la transición.
  SELECT count(*)::int FROM public.hermes_whatsapp_queue
  WHERE estado = 'enviado'
    AND origen <> 'test'   -- la consola de prueba no consume el cap anti-ban
    AND (procesado_at AT TIME ZONE 'America/Santo_Domingo')::date
        = (now() AT TIME ZONE 'America/Santo_Domingo')::date
    AND departamento = coalesce(
      p_departamento,
      (SELECT departamento FROM public.hermes_whatsapp_config WHERE activo = true ORDER BY departamento LIMIT 1)
    );
$$;

REVOKE ALL ON FUNCTION public.fn_whatsapp_cap_hoy(text) FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_whatsapp_enviados_hoy(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_cap_hoy(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_enviados_hoy(text) TO authenticated, service_role;

-- ── 2. Claim por departamento ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_whatsapp_reclamar_pendientes(
  p_departamento text,
  p_limite integer DEFAULT NULL
)
RETURNS SETOF public.hermes_whatsapp_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg public.hermes_whatsapp_config;
  v_enable_whatsapp boolean;
  v_local_ts timestamp;
  v_local_time time;
  v_dow int;
  v_quiet_start time;
  v_quiet_end time;
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

  -- Config del departamento (aislada: nunca cae en la de otro depto).
  SELECT * INTO v_cfg
  FROM public.hermes_whatsapp_config
  WHERE activo = true AND departamento = p_departamento
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  -- Kill switch global.
  SELECT coalesce((SELECT value FROM public.system_config WHERE key = 'whatsapp_ingest_enabled'), 'false') = 'true'
  INTO v_enable_whatsapp;
  IF v_enable_whatsapp IS NOT true THEN RETURN; END IF;

  v_local_ts := now() AT TIME ZONE 'America/Santo_Domingo';
  v_local_time := v_local_ts::time;
  v_dow := extract(isodow FROM v_local_ts);   -- 1 = lunes ... 7 = domingo

  -- Ventana horaria del departamento (fuente de verdad; Electron la re-chequea).
  IF v_cfg.solo_dias_habiles AND v_dow > 5 THEN RETURN; END IF;
  IF v_cfg.ventana_inicio IS NOT NULL AND v_cfg.ventana_fin IS NOT NULL THEN
    IF v_cfg.ventana_inicio <= v_cfg.ventana_fin THEN
      IF v_local_time < v_cfg.ventana_inicio OR v_local_time >= v_cfg.ventana_fin THEN RETURN; END IF;
    ELSE
      -- Ventana que cruza medianoche (no es el caso por defecto, pero se soporta).
      IF v_local_time < v_cfg.ventana_inicio AND v_local_time >= v_cfg.ventana_fin THEN RETURN; END IF;
    END IF;
  END IF;

  -- Quiet hours global: interruptor de apagado adicional. Si están definidas y
  -- el momento cae adentro, no se despacha aunque la ventana del depto lo permita.
  SELECT nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_start'), '')::time,
         nullif((SELECT value FROM public.system_config WHERE key = 'whatsapp_quiet_hours_end'), '')::time
  INTO v_quiet_start, v_quiet_end;
  IF v_quiet_start IS NOT NULL AND v_quiet_end IS NOT NULL AND (
    (v_quiet_start < v_quiet_end AND v_local_time BETWEEN v_quiet_start AND v_quiet_end)
    OR (v_quiet_start >= v_quiet_end AND (v_local_time >= v_quiet_start OR v_local_time <= v_quiet_end))
  ) THEN RETURN; END IF;

  -- Caps del departamento.
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
      -- Opt-out es GLOBAL por jid: una baja detiene todos los departamentos.
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
      -- Dedup "1 mensaje por número cada N horas" es POR PAR (jid, departamento):
      -- un aviso de ADM no bloquea un recordatorio de pago de FIN.
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
      procesado_at = now()   -- instante de la transición; el reaper lo usa
  FROM candidatas c
  WHERE q.id = c.id
  RETURNING q.*;
END;
$$;

-- ── 3. Wrapper de compatibilidad (firma vieja) ─────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_whatsapp_reclamar_pendientes(p_limite integer DEFAULT NULL)
RETURNS SETOF public.hermes_whatsapp_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_n int; v_depto text;
BEGIN
  SELECT count(*), min(departamento) INTO v_n, v_depto
  FROM public.hermes_whatsapp_config WHERE activo = true;
  IF coalesce(v_n, 0) = 0 THEN RETURN; END IF;
  IF v_n > 1 THEN
    RAISE EXCEPTION
      'fn_whatsapp_reclamar_pendientes(int): hay % departamentos activos; usá la firma (text, int)', v_n;
  END IF;
  RETURN QUERY SELECT * FROM public.fn_whatsapp_reclamar_pendientes(v_depto, p_limite);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text, integer) FROM anon, public, authenticated;
REVOKE ALL ON FUNCTION public.fn_whatsapp_reclamar_pendientes(integer) FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_reclamar_pendientes(integer) TO service_role;

COMMENT ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text, integer) IS
  'Claim atómico de la cola de WhatsApp POR DEPARTAMENTO: aplica kill switch, ventana horaria del depto (fn_whatsapp_ventana_abierta), caps diario/horario, warm-up, opt-out global, consentimiento de campaña, dedup por (jid, departamento) y FOR UPDATE SKIP LOCKED. Solo service_role (la edge function whatsapp-gateway).';
COMMENT ON FUNCTION public.fn_whatsapp_reclamar_pendientes(integer) IS
  'Wrapper de compatibilidad para los consumidores legacy (scripts/whatsapp-runner, whatsapp-dispatcher, process-whatsapp-queue). Resuelve el único departamento activo o RAISE si hay más de uno. Se retira en F9.';
COMMENT ON FUNCTION public.fn_whatsapp_cap_hoy(text) IS
  'Cap diario efectivo (con warm-up) del departamento. NULL = la única config activa (compat); determinista solo durante la transición a multi-departamento.';
COMMENT ON FUNCTION public.fn_whatsapp_enviados_hoy(text) IS
  'Mensajes enviados hoy por el departamento (zona America/Santo_Domingo), excluyendo origen=test.';

-- ── 4. Call site en lockstep: fn_encolar_campania ──────────────────────────
-- Las campañas de inscripción/reinscripción salen por el número de ADM (v1).
-- F6 hace esto dinámico leyendo campanias_periodo.departamento.
CREATE OR REPLACE FUNCTION public.fn_encolar_campania(p_campania_id uuid, p_limite integer DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cap int; v_enviados int; v_pendientes_cola int; v_restante int; v_encolados int;
BEGIN
  -- Encolar una campaña = envío masivo de WhatsApp (riesgo de ban/spam), mismo
  -- nivel de confianza que emitir un device token: admin/superadmin, NO
  -- es_admin() (que incluye inventarista).
  IF coalesce(public.get_user_role(), '') NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;

  v_cap := public.fn_whatsapp_cap_hoy('ADM');
  v_enviados := public.fn_whatsapp_enviados_hoy('ADM');
  SELECT count(*) INTO v_pendientes_cola
  FROM public.hermes_whatsapp_queue WHERE estado = 'pendiente' AND departamento = 'ADM';
  v_restante := GREATEST(v_cap - v_enviados - v_pendientes_cola, 0);
  IF p_limite IS NOT NULL THEN v_restante := LEAST(v_restante, p_limite); END IF;

  WITH a_encolar AS (
    SELECT ce.id, ce.jid, ce.mensaje
    FROM public.campania_envios ce
    WHERE ce.campania_id = p_campania_id
      AND ce.estado = 'pendiente_envio'
      AND NOT EXISTS (SELECT 1 FROM public.whatsapp_optout o WHERE o.jid = ce.jid)
    ORDER BY ce.created_at
    LIMIT v_restante
  ), ins AS (
    INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado, campania_envio_id, departamento, origen)
    SELECT jid, mensaje, 'pendiente', id, 'ADM', 'campania' FROM a_encolar
    RETURNING campania_envio_id
  )
  UPDATE public.campania_envios SET estado = 'encolado', updated_at = now()
    WHERE id IN (SELECT campania_envio_id FROM ins);
  GET DIAGNOSTICS v_encolados = ROW_COUNT;

  RETURN json_build_object('encolados', v_encolados, 'cap_hoy', v_cap,
                           'enviados_hoy', v_enviados, 'restante_tras_encolar', GREATEST(v_restante - v_encolados, 0));
END $$;

COMMIT;
