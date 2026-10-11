-- ============================================================================
-- whatsapp_backbone_fixes.test.sql
-- SDD whatsapp-gateway-multidepto · Ronda 1 de review
--
-- Verifica 20260907042000_whatsapp_backbone_fixes.sql:
--   - fn_hermes_gateway_reclamar_instancia: claim atómico (gana / standby)
--   - fn_whatsapp_reaper_procesando: recupera filas colgadas
--
-- BEGIN; ... ROLLBACK; — no persiste nada. Seguro contra producción.
-- ============================================================================

BEGIN;

-- ── E1: primera PC gana; segunda PC (nombre distinto, latido fresco) va a standby
DO $t$
DECLARE r record;
BEGIN
  DELETE FROM public.hermes_gateway_health WHERE instance_name = 'test-gateway';

  SELECT * INTO r FROM public.fn_hermes_gateway_reclamar_instancia('test-gateway', 'PC-A', 'connected');
  IF r.gano IS NOT true THEN RAISE EXCEPTION 'E1: PC-A debería ganar la instancia libre'; END IF;

  SELECT * INTO r FROM public.fn_hermes_gateway_reclamar_instancia('test-gateway', 'PC-B', 'connected');
  IF r.gano IS NOT false THEN RAISE EXCEPTION 'E1: PC-B debería ir a standby (PC-A latió recién)'; END IF;
  IF r.owner_equipo <> 'PC-A' THEN RAISE EXCEPTION 'E1: owner esperado PC-A, dio %', r.owner_equipo; END IF;

  -- PC-A renueva su propio latido: gana.
  SELECT * INTO r FROM public.fn_hermes_gateway_reclamar_instancia('test-gateway', 'PC-A', 'connected');
  IF r.gano IS NOT true THEN RAISE EXCEPTION 'E1: PC-A debería poder renovar su latido'; END IF;

  RAISE NOTICE 'E1 OK: claim atómico de instancia (gana / standby / renovar)';
END $t$;

-- ── E2: latido viejo -> otra PC toma el relevo
DO $t$
DECLARE r record;
BEGIN
  UPDATE public.hermes_gateway_health
    SET last_heartbeat = now() - interval '5 minutes'
    WHERE instance_name = 'test-gateway';

  SELECT * INTO r FROM public.fn_hermes_gateway_reclamar_instancia('test-gateway', 'PC-B', 'connected');
  IF r.gano IS NOT true THEN RAISE EXCEPTION 'E2: PC-B debería tomar el relevo de un latido viejo'; END IF;

  RAISE NOTICE 'E2 OK: relevo tras latido viejo';
END $t$;

-- ── E3: nombre_equipo vacío -> error
DO $t$
DECLARE v_msg text := NULL;
BEGIN
  BEGIN PERFORM public.fn_hermes_gateway_reclamar_instancia('test-gateway', '  ', 'connected');
  EXCEPTION WHEN others THEN v_msg := SQLERRM; END;
  IF v_msg IS NULL OR v_msg NOT LIKE '%nombre_equipo%' THEN
    RAISE EXCEPTION 'E3: no rechazó nombre_equipo vacío: %', v_msg;
  END IF;
  RAISE NOTICE 'E3 OK: nombre_equipo obligatorio';
END $t$;

-- ── E4: status inválido -> se clampa a 'connected' (no viola el CHECK)
DO $t$
DECLARE r record; v_status text;
BEGIN
  DELETE FROM public.hermes_gateway_health WHERE instance_name = 'test-gateway-2';
  SELECT * INTO r FROM public.fn_hermes_gateway_reclamar_instancia('test-gateway-2', 'PC-X', 'basura-invalida');
  SELECT status INTO v_status FROM public.hermes_gateway_health WHERE instance_name = 'test-gateway-2';
  IF v_status <> 'connected' THEN RAISE EXCEPTION 'E4: status no se clampó (%)', v_status; END IF;
  RAISE NOTICE 'E4 OK: status inválido -> connected';
END $t$;

-- ── E5: el reaper recupera filas 'procesando' viejas, respeta las frescas
DO $t$
DECLARE v_id_vieja uuid; v_id_fresca uuid; v_id_agotada uuid;
DECLARE v_estado_vieja text; v_estado_fresca text; v_estado_agotada text; v_n int;
BEGIN
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen, estado, intentos, procesado_at)
    VALUES ('reap-1@s.whatsapp.net', 'x', 'ADM', 'manual', 'procesando', 1, now() - interval '30 min')
    RETURNING id INTO v_id_vieja;
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen, estado, intentos, procesado_at)
    VALUES ('reap-2@s.whatsapp.net', 'x', 'ADM', 'manual', 'procesando', 1, now() - interval '2 min')
    RETURNING id INTO v_id_fresca;
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen, estado, intentos, procesado_at)
    VALUES ('reap-3@s.whatsapp.net', 'x', 'ADM', 'manual', 'procesando', 3, now() - interval '30 min')
    RETURNING id INTO v_id_agotada;

  SELECT public.fn_whatsapp_reaper_procesando(15) INTO v_n;

  SELECT estado INTO v_estado_vieja   FROM public.hermes_whatsapp_queue WHERE id = v_id_vieja;
  SELECT estado INTO v_estado_fresca  FROM public.hermes_whatsapp_queue WHERE id = v_id_fresca;
  SELECT estado INTO v_estado_agotada FROM public.hermes_whatsapp_queue WHERE id = v_id_agotada;

  IF v_estado_vieja <> 'pendiente' THEN RAISE EXCEPTION 'E5: la fila vieja (intentos<3) debería volver a pendiente, es %', v_estado_vieja; END IF;
  IF v_estado_fresca <> 'procesando' THEN RAISE EXCEPTION 'E5: la fila fresca no debería tocarse, es %', v_estado_fresca; END IF;
  IF v_estado_agotada <> 'fallido' THEN RAISE EXCEPTION 'E5: la fila vieja con intentos>=3 debería quedar fallido, es %', v_estado_agotada; END IF;

  RAISE NOTICE 'E5 OK: reaper (% filas recuperadas)', v_n;
END $t$;

DO $t$ BEGIN RAISE NOTICE 'TODOS LOS ESCENARIOS OK (whatsapp_backbone_fixes)'; END $t$;

ROLLBACK;
