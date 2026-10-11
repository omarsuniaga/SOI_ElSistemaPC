-- ============================================================================
-- whatsapp_multidepto_foundation.test.sql
-- SDD whatsapp-gateway-multidepto · F1 · Work Unit 1 (columnas queue + config)
--
-- Verifica las migraciones:
--   20260907030000_whatsapp_multidepto_queue.sql
--   20260907031000_whatsapp_multidepto_config.sql
--
-- SEGURIDAD: todo corre dentro de BEGIN; ... ROLLBACK; — no persiste nada, ni
-- datos ni DDL. Seguro contra producción (mismo patrón que
-- fn_hermes_resolver_caso.test.sql).
--
-- CÓMO EJECUTARLO:
--   psql "$DATABASE_URL" -f supabase/tests/whatsapp_multidepto_foundation.test.sql
--   supabase db execute --file supabase/tests/whatsapp_multidepto_foundation.test.sql
--   MCP execute_sql: pegar el archivo completo.
--
-- Éxito = NOTICE por escenario + "TODOS LOS ESCENARIOS OK". Falla = RAISE
-- EXCEPTION y exit code != 0.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Escenario 1: la cola tiene `departamento` NOT NULL DEFAULT 'ADM'
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_nullable text;
  v_default  text;
BEGIN
  SELECT is_nullable, column_default INTO v_nullable, v_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'hermes_whatsapp_queue'
    AND column_name = 'departamento';

  IF v_nullable IS NULL THEN
    RAISE EXCEPTION 'E1 FALLA: hermes_whatsapp_queue.departamento no existe';
  END IF;
  IF v_nullable <> 'NO' THEN
    RAISE EXCEPTION 'E1 FALLA: departamento debería ser NOT NULL, es %', v_nullable;
  END IF;
  IF v_default NOT LIKE '%ADM%' THEN
    RAISE EXCEPTION 'E1 FALLA: default de departamento debería ser ADM, es %', v_default;
  END IF;

  RAISE NOTICE 'E1 OK: hermes_whatsapp_queue.departamento NOT NULL DEFAULT ADM';
END $$;

-- ---------------------------------------------------------------------------
-- Escenario 2: ninguna fila histórica de la cola quedó con departamento NULL
--              y `origen` existe con su CHECK
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_nulos int;
  v_origen_existe int;
BEGIN
  SELECT count(*) INTO v_nulos
  FROM public.hermes_whatsapp_queue WHERE departamento IS NULL;
  IF v_nulos > 0 THEN
    RAISE EXCEPTION 'E2 FALLA: % filas de la cola con departamento NULL tras el backfill', v_nulos;
  END IF;

  SELECT count(*) INTO v_origen_existe
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'hermes_whatsapp_queue' AND column_name = 'origen';
  IF v_origen_existe <> 1 THEN
    RAISE EXCEPTION 'E2 FALLA: columna origen no existe';
  END IF;

  -- El CHECK de origen debe rechazar un valor fuera de la lista.
  BEGIN
    INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, departamento, origen)
    VALUES ('18090000000@s.whatsapp.net', 'x', 'ADM', 'valor_invalido');
    RAISE EXCEPTION 'E2 FALLA: el CHECK de origen aceptó un valor inválido';
  EXCEPTION WHEN check_violation THEN
    NULL; -- esperado
  END;

  RAISE NOTICE 'E2 OK: backfill sin NULLs + CHECK de origen activo';
END $$;

-- ---------------------------------------------------------------------------
-- Escenario 3: índice de claim reconstruido por (departamento, created_at)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_def text;
BEGIN
  SELECT indexdef INTO v_def
  FROM pg_indexes
  WHERE schemaname = 'public' AND indexname = 'idx_hermes_whatsapp_queue_claim';

  IF v_def IS NULL THEN
    RAISE EXCEPTION 'E3 FALLA: idx_hermes_whatsapp_queue_claim no existe';
  END IF;
  IF v_def NOT LIKE '%departamento%' OR v_def NOT LIKE '%created_at%' THEN
    RAISE EXCEPTION 'E3 FALLA: el índice de claim no arranca por departamento: %', v_def;
  END IF;
  IF v_def NOT LIKE '%pendiente%' THEN
    RAISE EXCEPTION 'E3 FALLA: el índice de claim perdió el WHERE estado=pendiente: %', v_def;
  END IF;

  RAISE NOTICE 'E3 OK: idx_hermes_whatsapp_queue_claim por (departamento, created_at)';
END $$;

-- ---------------------------------------------------------------------------
-- Escenario 4: solo una config activa por departamento (índice único parcial)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_adm_id uuid;
BEGIN
  SELECT id INTO v_adm_id
  FROM public.hermes_whatsapp_config WHERE departamento = 'ADM' AND activo LIMIT 1;
  IF v_adm_id IS NULL THEN
    RAISE EXCEPTION 'E4 FALLA: no hay config activa para ADM tras la migración';
  END IF;

  -- Segunda fila ADM activa -> debe reventar por el índice único parcial.
  BEGIN
    INSERT INTO public.hermes_whatsapp_config (gateway_url, instance_name, departamento, activo)
    VALUES ('baileys-local', 'adm-gateway-2', 'ADM', true);
    RAISE EXCEPTION 'E4 FALLA: se permitió una segunda config ADM activa';
  EXCEPTION WHEN unique_violation THEN
    NULL; -- esperado
  END;

  -- Fila ADM inactiva -> permitida.
  INSERT INTO public.hermes_whatsapp_config (gateway_url, instance_name, departamento, activo)
  VALUES ('baileys-local', 'adm-gateway-old', 'ADM', false);

  RAISE NOTICE 'E4 OK: índice único parcial (departamento) WHERE activo';
END $$;

-- ---------------------------------------------------------------------------
-- Escenario 4b: la dedup se quedó con la config REAL, no con la de demo
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_wid text; v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM public.hermes_whatsapp_config WHERE activo;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'E4b FALLA: hay % filas activas tras el colapso (esperaba 1)', v_n;
  END IF;

  SELECT numero_wid INTO v_wid
  FROM public.hermes_whatsapp_config WHERE activo AND departamento = 'ADM' LIMIT 1;

  -- La fila de demo tiene numero_wid con formato de teléfono legible
  -- ('+1 (829) 555-0188'); la real tiene un jid ('...@s.whatsapp.net') o NULL
  -- si la migración tuvo que crear una nueva.
  IF v_wid IS NOT NULL AND v_wid NOT LIKE '%@s.whatsapp.net' THEN
    RAISE EXCEPTION 'E4b FALLA: sobrevivió una config sin jid real: %', v_wid;
  END IF;

  RAISE NOTICE 'E4b OK: la config activa es la real (o una nueva sin número)';
END $$;

-- ---------------------------------------------------------------------------
-- Escenario 5: FIN nace exactamente una vez y como inactivo
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_fin_total int;
  v_fin_activos int;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE activo)
  INTO v_fin_total, v_fin_activos
  FROM public.hermes_whatsapp_config WHERE departamento = 'FIN';

  IF v_fin_total <> 1 THEN
    RAISE EXCEPTION 'E5 FALLA: esperaba 1 fila FIN, hay %', v_fin_total;
  END IF;
  IF v_fin_activos <> 0 THEN
    RAISE EXCEPTION 'E5 FALLA: la fila FIN debería nacer inactiva';
  END IF;

  RAISE NOTICE 'E5 OK: FIN nace inactivo (1 fila, activo=false)';
END $$;

-- ---------------------------------------------------------------------------
-- Escenario 6: ventana horaria por defecto 10:00-19:00 + solo_dias_habiles
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_ini time;
  v_fin time;
  v_habiles boolean;
BEGIN
  SELECT ventana_inicio, ventana_fin, solo_dias_habiles
  INTO v_ini, v_fin, v_habiles
  FROM public.hermes_whatsapp_config WHERE departamento = 'ADM' AND activo LIMIT 1;

  IF v_ini <> '10:00'::time OR v_fin <> '19:00'::time THEN
    RAISE EXCEPTION 'E6 FALLA: ventana ADM esperaba 10:00-19:00, es %-%', v_ini, v_fin;
  END IF;
  IF v_habiles IS NOT true THEN
    RAISE EXCEPTION 'E6 FALLA: solo_dias_habiles debería ser true por defecto';
  END IF;

  RAISE NOTICE 'E6 OK: ventana 10:00-19:00 + solo_dias_habiles';
END $$;

DO $$ BEGIN RAISE NOTICE 'TODOS LOS ESCENARIOS OK (whatsapp_multidepto_foundation)'; END $$;

ROLLBACK;
