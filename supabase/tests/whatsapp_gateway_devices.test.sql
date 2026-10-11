-- ============================================================================
-- whatsapp_gateway_devices.test.sql
-- SDD whatsapp-gateway-multidepto · F2 · Work Unit 3
--
-- Verifica 20260907040000_whatsapp_gateway_devices.sql:
--   - issue: genera token hex, guarda solo el hash, devuelve el token una vez
--   - validate: match por hash + activo + no revocado; setea last_seen_at
--   - revoke: baja inmediata (validate deja de matchear)
--   - token inválido / vacío -> 0 filas
--   - issue/revoke exigen es_admin()
--
-- SEGURIDAD: BEGIN; ... ROLLBACK; — no persiste nada (incluye el set del claim
-- JWT, que es LOCAL a la transacción). Seguro contra producción.
--   psql "$DATABASE_URL" -f supabase/tests/whatsapp_gateway_devices.test.sql
-- ============================================================================

BEGIN;

-- Simular sesión de un admin real para que es_admin() devuelva true.
SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', (SELECT id FROM public.profiles WHERE rol = 'admin' LIMIT 1))::text,
  true
);

-- ── E1: issue genera token hex y guarda solo el hash ──────────────────────
DO $t$
DECLARE v_token text; v_row public.whatsapp_gateway_devices;
BEGIN
  v_token := public.fn_whatsapp_device_issue('ADM', 'PC-ADM-01');

  IF v_token !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'E1 FALLA: el token no es 64 hex: %', left(v_token, 12);
  END IF;

  SELECT * INTO v_row FROM public.whatsapp_gateway_devices
  WHERE nombre_equipo = 'PC-ADM-01' ORDER BY created_at DESC LIMIT 1;

  IF v_row.id IS NULL THEN RAISE EXCEPTION 'E1 FALLA: no se creó la fila del device'; END IF;
  IF v_row.token_hash = v_token THEN RAISE EXCEPTION 'E1 FALLA: se guardó el token en claro'; END IF;
  IF v_row.token_hash <> encode(extensions.digest(v_token, 'sha256'), 'hex') THEN
    RAISE EXCEPTION 'E1 FALLA: token_hash no es el sha256 del token';
  END IF;
  IF v_row.departamento <> 'ADM' OR v_row.activo <> true OR v_row.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'E1 FALLA: estado inicial del device incorrecto';
  END IF;

  RAISE NOTICE 'E1 OK: issue guarda hash, no el token';
END $t$;

-- ── E2: validate matchea y setea last_seen_at ────────────────────────────
DO $t$
DECLARE v_token text; v_id uuid; v_depto text; v_seen timestamptz;
BEGIN
  v_token := public.fn_whatsapp_device_issue('FIN', 'PC-FIN-01');

  SELECT device_id, departamento INTO v_id, v_depto
  FROM public.fn_whatsapp_device_validate(v_token);

  IF v_id IS NULL THEN RAISE EXCEPTION 'E2 FALLA: validate no matcheó un token válido'; END IF;
  IF v_depto <> 'FIN' THEN RAISE EXCEPTION 'E2 FALLA: departamento esperado FIN, dio %', v_depto; END IF;

  SELECT last_seen_at INTO v_seen FROM public.whatsapp_gateway_devices WHERE id = v_id;
  IF v_seen IS NULL THEN RAISE EXCEPTION 'E2 FALLA: validate no seteó last_seen_at'; END IF;

  RAISE NOTICE 'E2 OK: validate + last_seen_at';
END $t$;

-- ── E3: revoke corta el acceso de inmediato ──────────────────────────────
DO $t$
DECLARE v_token text; v_id uuid; v_n int;
BEGIN
  v_token := public.fn_whatsapp_device_issue('ADM', 'PC-ADM-REVOCAR');
  SELECT device_id INTO v_id FROM public.fn_whatsapp_device_validate(v_token);

  PERFORM public.fn_whatsapp_device_revoke(v_id);

  SELECT count(*) INTO v_n FROM public.fn_whatsapp_device_validate(v_token);
  IF v_n <> 0 THEN RAISE EXCEPTION 'E3 FALLA: validate matcheó un device revocado'; END IF;

  RAISE NOTICE 'E3 OK: revocación inmediata';
END $t$;

-- ── E4: token inválido o vacío -> 0 filas, sin error ─────────────────────
DO $t$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM public.fn_whatsapp_device_validate('no-es-un-token');
  IF v_n <> 0 THEN RAISE EXCEPTION 'E4 FALLA: validate matcheó basura'; END IF;
  SELECT count(*) INTO v_n FROM public.fn_whatsapp_device_validate('');
  IF v_n <> 0 THEN RAISE EXCEPTION 'E4 FALLA: validate matcheó string vacío'; END IF;
  SELECT count(*) INTO v_n FROM public.fn_whatsapp_device_validate(NULL);
  IF v_n <> 0 THEN RAISE EXCEPTION 'E4 FALLA: validate matcheó NULL'; END IF;
  RAISE NOTICE 'E4 OK: token inválido -> 0 filas';
END $t$;

-- ── E5: issue Y revoke exigen admin/superadmin (NO inventarista) ───────────
DO $t$
DECLARE v_token text; v_id uuid; v_msg text;
BEGIN
  -- Emitir con un admin para tener un device que revocar.
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', (SELECT id FROM public.profiles WHERE rol = 'admin' LIMIT 1))::text, true);
  v_token := public.fn_whatsapp_device_issue('ADM', 'PC-PARA-REVOCAR-NOADMIN');
  SELECT device_id INTO v_id FROM public.fn_whatsapp_device_validate(v_token);

  -- Cambiar a un no-admin (uuid random -> get_user_role() = NULL).
  PERFORM set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid())::text, true);

  v_msg := NULL;
  BEGIN PERFORM public.fn_whatsapp_device_issue('ADM', 'PC-INTRUSO');
  EXCEPTION WHEN others THEN v_msg := SQLERRM; END;
  IF v_msg IS NULL OR v_msg NOT LIKE '%no autorizado%' THEN
    RAISE EXCEPTION 'E5 FALLA: un no-admin pudo (o falló mal en) emitir un token: %', v_msg;
  END IF;

  v_msg := NULL;
  BEGIN PERFORM public.fn_whatsapp_device_revoke(v_id);
  EXCEPTION WHEN others THEN v_msg := SQLERRM; END;
  IF v_msg IS NULL OR v_msg NOT LIKE '%no autorizado%' THEN
    RAISE EXCEPTION 'E5 FALLA: un no-admin pudo (o falló mal en) revocar: %', v_msg;
  END IF;

  RAISE NOTICE 'E5 OK: issue/revoke exigen admin/superadmin';
END $t$;

-- ── E6: fn_whatsapp_device_validate NO es ejecutable por anon/authenticated ─
DO $t$
DECLARE v_ok boolean;
BEGIN
  SELECT has_function_privilege('anon', 'public.fn_whatsapp_device_validate(text)', 'EXECUTE') INTO v_ok;
  IF v_ok THEN RAISE EXCEPTION 'E6 FALLA: anon puede ejecutar fn_whatsapp_device_validate'; END IF;
  SELECT has_function_privilege('authenticated', 'public.fn_whatsapp_device_validate(text)', 'EXECUTE') INTO v_ok;
  IF v_ok THEN RAISE EXCEPTION 'E6 FALLA: authenticated puede ejecutar fn_whatsapp_device_validate'; END IF;
  RAISE NOTICE 'E6 OK: validate solo service_role';
END $t$;

DO $t$ BEGIN RAISE NOTICE 'TODOS LOS ESCENARIOS OK (whatsapp_gateway_devices)'; END $t$;

ROLLBACK;
