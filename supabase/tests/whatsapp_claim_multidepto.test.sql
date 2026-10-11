-- ============================================================================
-- whatsapp_claim_multidepto.test.sql
-- SDD whatsapp-gateway-multidepto · F1 · Work Unit 2
--
-- Verifica 20260907032000_whatsapp_claim_parametrizada.sql:
--   - aislamiento estricto entre departamentos (F1.10)
--   - dedup por par (jid, departamento)
--   - ventana horaria del departamento
--   - overload de compatibilidad (int) == (text, int) con 1 depto activo
--   - caps por departamento
--
-- SEGURIDAD: BEGIN; ... ROLLBACK; — no persiste nada. Seguro contra producción.
--   psql "$DATABASE_URL" -f supabase/tests/whatsapp_claim_multidepto.test.sql
-- ============================================================================

BEGIN;

-- ── SETUP (revertido por el ROLLBACK) ──────────────────────────────────────
INSERT INTO public.system_config (key, value) VALUES ('whatsapp_ingest_enabled', 'true')
  ON CONFLICT (key) DO UPDATE SET value = 'true';
DELETE FROM public.system_config WHERE key IN ('whatsapp_quiet_hours_start', 'whatsapp_quiet_hours_end');

-- Cancela lo que haya pendiente/procesando para tener un tablero limpio.
UPDATE public.hermes_whatsapp_queue SET estado = 'cancelado'
  WHERE estado IN ('pendiente', 'procesando');

-- ADM: ventana abierta 24/7 para que el test no dependa de la hora de corrida.
UPDATE public.hermes_whatsapp_config
  SET ventana_inicio = '00:00', ventana_fin = '23:59', solo_dias_habiles = false,
      cap_diario = 1000, cap_horario = 1000, batch_size = 100, warmup_desde = NULL
  WHERE departamento = 'ADM' AND activo;

-- FIN: activo solo durante el test, también con ventana abierta.
UPDATE public.hermes_whatsapp_config
  SET activo = true, ventana_inicio = '00:00', ventana_fin = '23:59', solo_dias_habiles = false,
      cap_diario = 1000, cap_horario = 1000, batch_size = 100, warmup_desde = NULL,
      numero_wid = 'fin-test@s.whatsapp.net'
  WHERE departamento = 'FIN';

INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen, estado, created_at) VALUES
  ('wa-test-1@s.whatsapp.net', 'a1', 'ADM', 'manual', 'pendiente', now() - interval '5 min'),
  ('wa-test-2@s.whatsapp.net', 'a2', 'ADM', 'manual', 'pendiente', now() - interval '4 min'),
  ('wa-test-3@s.whatsapp.net', 'a3', 'ADM', 'manual', 'pendiente', now() - interval '3 min'),
  ('wa-test-4@s.whatsapp.net', 'f1', 'FIN', 'manual', 'pendiente', now() - interval '5 min'),
  ('wa-test-5@s.whatsapp.net', 'f2', 'FIN', 'manual', 'pendiente', now() - interval '4 min');

-- ── E1: aislamiento — el claim de ADM devuelve SOLO filas de ADM ────────────
DO $$
DECLARE v_ids text; v_fin_tocadas int;
BEGIN
  SELECT string_agg(mensaje, ',' ORDER BY mensaje) INTO v_ids
  FROM public.fn_whatsapp_reclamar_pendientes('ADM', 10);

  IF v_ids IS DISTINCT FROM 'a1,a2,a3' THEN
    RAISE EXCEPTION 'E1 FALLA: claim ADM devolvió [%], esperaba a1,a2,a3', v_ids;
  END IF;

  SELECT count(*) INTO v_fin_tocadas
  FROM public.hermes_whatsapp_queue
  WHERE jid IN ('wa-test-4@s.whatsapp.net', 'wa-test-5@s.whatsapp.net') AND estado <> 'pendiente';
  IF v_fin_tocadas <> 0 THEN
    RAISE EXCEPTION 'E1 FALLA: el claim de ADM tocó % filas de FIN', v_fin_tocadas;
  END IF;

  RAISE NOTICE 'E1 OK: aislamiento ADM/FIN en el claim';
END $$;

-- ── E2: aislamiento de config y CAPS entre departamentos ───────────────────
DO $$
DECLARE v_n int;
BEGIN
  -- ADM: batch_size chico (2). FIN: batch_size grande + ventana cerrada.
  UPDATE public.hermes_whatsapp_config
    SET batch_size = 2, cap_diario = 1000, cap_horario = 1000
    WHERE departamento = 'ADM' AND activo;
  UPDATE public.hermes_whatsapp_config
    SET batch_size = 100, ventana_inicio = '00:00', ventana_fin = '00:00'
    WHERE departamento = 'FIN';

  UPDATE public.hermes_whatsapp_queue SET estado = 'pendiente', intentos = 0
    WHERE jid LIKE 'wa-test-%' AND departamento = 'ADM';

  -- El claim de ADM respeta el batch_size de ADM (2), NO el de FIN (100),
  -- y funciona aunque la ventana de FIN esté cerrada (no lee su config).
  SELECT count(*) INTO v_n FROM public.fn_whatsapp_reclamar_pendientes('ADM', 100);
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'E2 FALLA: el claim de ADM devolvió % (esperaba 2 = batch_size de ADM)', v_n;
  END IF;

  -- Restaurar para los escenarios siguientes.
  UPDATE public.hermes_whatsapp_config SET batch_size = 100, ventana_fin = '23:59'
    WHERE departamento IN ('ADM', 'FIN');
  RAISE NOTICE 'E2 OK: el claim de ADM usa la config y los caps de ADM, no los de FIN';
END $$;

-- ── E2b: opt-out es GLOBAL — una baja detiene TODOS los departamentos ──────
DO $$
DECLARE v_adm int; v_fin int;
BEGIN
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen, estado) VALUES
    ('wa-baja@s.whatsapp.net', 'adm', 'ADM', 'manual', 'pendiente'),
    ('wa-baja@s.whatsapp.net', 'fin', 'FIN', 'manual', 'pendiente');
  INSERT INTO public.whatsapp_optout (jid, motivo) VALUES ('wa-baja@s.whatsapp.net', 'test');

  UPDATE public.hermes_whatsapp_queue SET estado = 'pendiente', intentos = 0
    WHERE jid LIKE 'wa-test-%' AND departamento = 'ADM';

  SELECT count(*) INTO v_adm FROM public.fn_whatsapp_reclamar_pendientes('ADM', 100) WHERE jid = 'wa-baja@s.whatsapp.net';
  SELECT count(*) INTO v_fin FROM public.fn_whatsapp_reclamar_pendientes('FIN', 100) WHERE jid = 'wa-baja@s.whatsapp.net';
  IF v_adm <> 0 OR v_fin <> 0 THEN
    RAISE EXCEPTION 'E2b FALLA: opt-out no bloqueó en ambos deptos (adm=%, fin=%)', v_adm, v_fin;
  END IF;
  RAISE NOTICE 'E2b OK: opt-out global cruza departamentos';
END $$;

-- ── E3: dedup por par (jid, departamento) ──────────────────────────────────
DO $$
DECLARE v_adm int; v_fin int;
BEGIN
  -- Un envío reciente al mismo jid en ADM.
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen, estado, procesado_at)
  VALUES ('wa-dup@s.whatsapp.net', 'previo', 'ADM', 'manual', 'enviado', now() - interval '1 hour');
  -- Pendientes al mismo jid: uno en ADM (debe quedar diferido), uno en FIN (debe salir).
  INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen, estado, created_at) VALUES
    ('wa-dup@s.whatsapp.net', 'adm-nuevo', 'ADM', 'manual', 'pendiente', now()),
    ('wa-dup@s.whatsapp.net', 'fin-nuevo', 'FIN', 'manual', 'pendiente', now());

  UPDATE public.hermes_whatsapp_config SET ventana_fin = '23:59' WHERE departamento = 'FIN';

  SELECT count(*) INTO v_adm FROM public.fn_whatsapp_reclamar_pendientes('ADM', 10)
    WHERE jid = 'wa-dup@s.whatsapp.net';
  SELECT count(*) INTO v_fin FROM public.fn_whatsapp_reclamar_pendientes('FIN', 10)
    WHERE jid = 'wa-dup@s.whatsapp.net';

  IF v_adm <> 0 THEN RAISE EXCEPTION 'E3 FALLA: ADM entregó al jid con envío reciente en ADM'; END IF;
  IF v_fin <> 1 THEN RAISE EXCEPTION 'E3 FALLA: FIN NO entregó al jid (dedup debería ser por depto), devolvió %', v_fin; END IF;
  RAISE NOTICE 'E3 OK: dedup por (jid, departamento)';
END $$;

-- ── E4: ventana horaria — fuera de ventana no devuelve nada ni sube intentos ─
DO $$
DECLARE v_n int; v_intentos_antes int; v_intentos_despues int;
BEGIN
  UPDATE public.hermes_whatsapp_queue SET estado = 'pendiente', intentos = 0
    WHERE jid IN ('wa-test-1@s.whatsapp.net') AND departamento = 'ADM';
  SELECT intentos INTO v_intentos_antes FROM public.hermes_whatsapp_queue
    WHERE jid = 'wa-test-1@s.whatsapp.net' AND departamento = 'ADM';

  -- Cerrar la ventana de ADM.
  UPDATE public.hermes_whatsapp_config
    SET ventana_inicio = '03:00', ventana_fin = '03:01'
    WHERE departamento = 'ADM' AND activo;

  SELECT count(*) INTO v_n FROM public.fn_whatsapp_reclamar_pendientes('ADM', 10);
  IF v_n <> 0 THEN RAISE EXCEPTION 'E4 FALLA: fuera de ventana el claim devolvió %', v_n; END IF;

  SELECT intentos INTO v_intentos_despues FROM public.hermes_whatsapp_queue
    WHERE jid = 'wa-test-1@s.whatsapp.net' AND departamento = 'ADM';
  IF v_intentos_despues <> v_intentos_antes THEN
    RAISE EXCEPTION 'E4 FALLA: fuera de ventana se incrementó intentos (% -> %)', v_intentos_antes, v_intentos_despues;
  END IF;

  UPDATE public.hermes_whatsapp_config SET ventana_inicio = '00:00', ventana_fin = '23:59'
    WHERE departamento = 'ADM' AND activo;
  RAISE NOTICE 'E4 OK: ventana horaria del departamento';
END $$;

-- ── E5: overload de compat — (int) == (text, int) con 1 solo depto activo ───
DO $$
DECLARE v_wrapper int; v_directo int;
BEGIN
  UPDATE public.hermes_whatsapp_config SET activo = false WHERE departamento = 'FIN';
  UPDATE public.hermes_whatsapp_queue SET estado = 'pendiente', intentos = 0
    WHERE jid LIKE 'wa-test-%' AND departamento = 'ADM';

  SELECT count(*) INTO v_wrapper FROM public.fn_whatsapp_reclamar_pendientes(100);

  UPDATE public.hermes_whatsapp_queue SET estado = 'pendiente', intentos = 0
    WHERE jid LIKE 'wa-test-%' AND departamento = 'ADM';
  SELECT count(*) INTO v_directo FROM public.fn_whatsapp_reclamar_pendientes('ADM', 100);

  IF v_wrapper <> v_directo THEN
    RAISE EXCEPTION 'E5 FALLA: wrapper(int)=% != directo(text,int)=%', v_wrapper, v_directo;
  END IF;
  IF v_wrapper < 3 THEN
    RAISE EXCEPTION 'E5 FALLA: el wrapper no reclamó las filas de ADM (%)', v_wrapper;
  END IF;
  RAISE NOTICE 'E5 OK: overload de compatibilidad';
END $$;

-- ── E6: el wrapper (int) RAISE si hay >1 departamento activo ────────────────
DO $$
DECLARE v_msg text := NULL;
BEGIN
  UPDATE public.hermes_whatsapp_config SET activo = true WHERE departamento = 'FIN';
  BEGIN
    PERFORM public.fn_whatsapp_reclamar_pendientes(10);
  EXCEPTION WHEN others THEN
    v_msg := SQLERRM;
  END;
  IF v_msg IS NULL THEN
    RAISE EXCEPTION 'E6 FALLA: el wrapper (int) no falló con 2 departamentos activos';
  END IF;
  IF v_msg NOT LIKE '%departamentos activos%' THEN
    RAISE EXCEPTION 'E6 FALLA: falló por otra razón: %', v_msg;
  END IF;
  RAISE NOTICE 'E6 OK: wrapper (int) exige la firma (text, int) con multi depto';
END $$;

DO $$ BEGIN RAISE NOTICE 'TODOS LOS ESCENARIOS OK (whatsapp_claim_multidepto)'; END $$;

ROLLBACK;
