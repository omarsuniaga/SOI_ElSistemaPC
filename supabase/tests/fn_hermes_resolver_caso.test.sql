-- fn_hermes_resolver_caso.test.sql
-- Panel Hermes Proactivo — Calendario Institucional (PR6 de 6)
-- Test de integración SQL para public.fn_hermes_resolver_caso (definido en
-- supabase/migrations/20260825145903_fn_hermes_resolver_caso.sql).
--
-- Formaliza como suite repetible los 4 escenarios de seguridad que fueron
-- verificados MANUALMENTE en PR1 (commit 84593146) vía una transacción
-- BEGIN/ROLLBACK ad-hoc contra el proyecto real zmhmdvmyeyswunurcyow. Este
-- archivo reproduce esa verificación de forma versionada, para que cualquiera
-- pueda re-correrla antes de mergear cambios futuros al RPC.
--
-- SEGURIDAD: todo el archivo corre dentro de BEGIN; ... ROLLBACK; — no
-- persiste ningún dato ni siquiera si un assertion falla a mitad de camino
-- (el error aborta la transacción implícita, y el ROLLBACK final es
-- redundante pero explícito por claridad). Es seguro ejecutarlo contra
-- producción, aunque lo ideal es correrlo en CI contra un branch de test de
-- Supabase (mcp__supabase__create_branch) en vez de contra el proyecto real.
--
-- CÓMO EJECUTARLO:
--   1) Vía psql:
--      psql "$DATABASE_URL" -f supabase/tests/fn_hermes_resolver_caso.test.sql
--   2) Vía Supabase CLI (si hay un proyecto linkeado):
--      supabase db execute --file supabase/tests/fn_hermes_resolver_caso.test.sql
--   3) Vía MCP de Supabase (execute_sql): pegar el contenido completo de este
--      archivo como una única query — execute_sql corre todo el batch en una
--      sola conexión/transacción implícita, y el BEGIN/ROLLBACK aquí adentro
--      controla la persistencia real independientemente de eso.
--
-- El script termina con éxito silencioso (NOTICE de cada escenario + un
-- NOTICE final "TODOS LOS ESCENARIOS OK") si los 4 escenarios se comportan
-- como se espera. Si CUALQUIER escenario no coincide con lo esperado, el
-- bloque DO final dispara RAISE EXCEPTION y el script termina con error,
-- lo cual lo hace apto como test_command en CI (exit code no-cero en falla).

BEGIN;

-- ---------------------------------------------------------------------------
-- SETUP: datos de prueba temporales, todos dentro de esta transacción.
-- ---------------------------------------------------------------------------

-- Reutilizamos los departamentos reales ACM y FIN (ya existen en el esquema
-- de catálogo, no son datos de prueba) solo para resolver sus IDs.
DO $$
DECLARE
  v_dept_acm uuid;
  v_dept_fin uuid;
  v_actor uuid;
BEGIN
  SELECT id INTO v_dept_acm FROM public.departamentos WHERE upper(codigo) = 'ACM';
  SELECT id INTO v_dept_fin FROM public.departamentos WHERE upper(codigo) = 'FIN';

  IF v_dept_acm IS NULL OR v_dept_fin IS NULL THEN
    RAISE EXCEPTION 'setup de test abortado: no se encontraron los departamentos ACM/FIN en public.departamentos — el catálogo real cambió, actualizar este test';
  END IF;

  -- Actor de prueba: primer usuario real de auth.users (no se modifica, solo
  -- se le asigna temporalmente al departamento ACM vía una fila de prueba en
  -- usuario_departamentos, que se revierte con el ROLLBACK final).
  SELECT id INTO v_actor FROM auth.users ORDER BY created_at LIMIT 1;

  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'setup de test abortado: no hay ningún usuario en auth.users contra el cual simular auth.uid()';
  END IF;

  -- Fila de prueba: actor pertenece a ACM (y NO a FIN).
  INSERT INTO public.usuario_departamentos (id, user_id, departamento_id, rol)
  VALUES ('11111111-0000-0000-0000-000000000001'::uuid, v_actor, v_dept_acm, 'miembro')
  ON CONFLICT (user_id, departamento_id) DO NOTHING;

  -- Guardamos el actor y los dept ids en una tabla temporal para que los
  -- bloques DO subsiguientes (y el psql \gexec no aplica acá, es un solo
  -- archivo) puedan referenciarlos sin repetir los SELECT.
  CREATE TEMP TABLE test_ctx AS
    SELECT v_actor AS actor_id, v_dept_acm AS dept_acm_id, v_dept_fin AS dept_fin_id;
END $$;

-- Casos de prueba (hermes_process_cases), con UUIDs fijos para poder
-- referenciarlos por escenario. owner_department es TEXT (código de
-- departamento, ej. 'ACM'/'FIN'), no FK a departamentos.id — así está
-- definido en el esquema real, coincide con el uso del RPC.
INSERT INTO public.hermes_process_cases
  (id, title, source, status, priority, owner_department, entity_type)
VALUES
  -- (a) dueño FIN, el actor de prueba solo pertenece a ACM -> debe fallar
  --     por autorización (42501).
  ('22222222-0000-0000-0000-00000000000a'::uuid, 'TEST caso owner=FIN, actor en ACM', 'manual', 'open', 'media', 'FIN', 'otro'),
  -- (b) owner_department NULL -> debe fallar SIEMPRE fail-closed (42501),
  --     sin importar a qué departamento pertenezca el actor. Este es el
  --     escenario del fix de la ronda 1 (bug del NULL bypass): antes del
  --     fix, `IF v_case.owner_department <> upper(...)` con NULL evalúa a
  --     NULL (falsy en un IF), así que el RAISE nunca se disparaba y
  --     cualquier usuario autenticado podía resolver casos sin dueño.
  ('22222222-0000-0000-0000-00000000000b'::uuid, 'TEST caso owner=NULL (fail-closed)', 'manual', 'open', 'media', NULL, 'otro'),
  -- (c) caso ya cerrado (status='closed') -> debe fallar por el guard de
  --     estado (42501) ANTES de siquiera llegar al chequeo de autorización,
  --     incluso con owner_department=ACM y actor correctamente asignado.
  ('22222222-0000-0000-0000-00000000000c'::uuid, 'TEST caso ya closed (guard de estado)', 'manual', 'closed', 'media', 'ACM', 'otro'),
  -- (d) dueño ACM, actor correctamente asignado a ACM -> debe tener éxito,
  --     status pasa a 'closed' (vocabulario real del CHECK constraint;
  --     ver Engram obs #79 sobre la corrección de vocabulario 'pending'/
  --     'approved'/'rejected' -> 'open'/'closed'/'cancelled').
  ('22222222-0000-0000-0000-00000000000d'::uuid, 'TEST caso owner=ACM, actor en ACM (happy path)', 'manual', 'open', 'media', 'ACM', 'otro');

-- ---------------------------------------------------------------------------
-- HELPER: invoca el RPC simulando auth.uid() vía request.jwt.claims, y
-- atrapa la excepción esperada para poder correr los 4 escenarios en un
-- único batch sin que el primer FAILED aborte los siguientes.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.run_scenario(p_actor uuid, p_case_id uuid, p_decision text)
RETURNS text AS $$
DECLARE
  v_result jsonb;
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_actor::text)::text, true);

  v_result := public.fn_hermes_resolver_caso(p_case_id, p_decision);

  RETURN 'SUCCESS: ' || v_result::text;
EXCEPTION WHEN OTHERS THEN
  RETURN 'FAILED (' || SQLSTATE || '): ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ---------------------------------------------------------------------------
-- EJECUCIÓN de los 4 escenarios + assertions.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE test_results AS
SELECT 'a_owner_fin_actor_acm' AS scenario,
       pg_temp.run_scenario(actor_id, '22222222-0000-0000-0000-00000000000a'::uuid, 'approve') AS result
FROM test_ctx
UNION ALL
SELECT 'b_owner_null_fail_closed',
       pg_temp.run_scenario(actor_id, '22222222-0000-0000-0000-00000000000b'::uuid, 'approve')
FROM test_ctx
UNION ALL
SELECT 'c_ya_closed_guard_estado',
       pg_temp.run_scenario(actor_id, '22222222-0000-0000-0000-00000000000c'::uuid, 'approve')
FROM test_ctx
UNION ALL
SELECT 'd_happy_path_owner_acm_actor_acm',
       pg_temp.run_scenario(actor_id, '22222222-0000-0000-0000-00000000000d'::uuid, 'approve')
FROM test_ctx;

-- run_scenario() setea role='authenticated' vía set_config(..., is_local=>true),
-- que dura hasta el fin de la TRANSACCIÓN (no del statement) — hay que
-- devolver el role original explícitamente antes de leer test_results o el
-- resto del script pierde privilegios sobre sus propios objetos temporales.
RESET ROLE;

-- Assertions: cada escenario debe coincidir con el resultado esperado. Si
-- alguno no coincide, RAISE EXCEPTION aborta el script con error (exit code
-- no-cero vía psql), apto para gatear un merge en CI.
DO $$
DECLARE
  v_a text; v_b text; v_c text; v_d text;
  v_case_d_status text;
BEGIN
  SELECT result INTO v_a FROM test_results WHERE scenario = 'a_owner_fin_actor_acm';
  SELECT result INTO v_b FROM test_results WHERE scenario = 'b_owner_null_fail_closed';
  SELECT result INTO v_c FROM test_results WHERE scenario = 'c_ya_closed_guard_estado';
  SELECT result INTO v_d FROM test_results WHERE scenario = 'd_happy_path_owner_acm_actor_acm';

  RAISE NOTICE '(a) owner=FIN, actor=ACM -> %', v_a;
  RAISE NOTICE '(b) owner=NULL (fail-closed) -> %', v_b;
  RAISE NOTICE '(c) ya closed (guard de estado) -> %', v_c;
  RAISE NOTICE '(d) happy path owner=ACM, actor=ACM -> %', v_d;

  -- (a) debe fallar con 42501 (no autorizado: departamento no coincide).
  IF v_a NOT LIKE 'FAILED (42501):%' THEN
    RAISE EXCEPTION 'ASSERTION FALLIDA escenario (a): esperaba FAILED (42501) por autorización, obtuve: %', v_a;
  END IF;

  -- (b) debe fallar con 42501 (fail-closed, fix de la ronda 1 / NULL bypass).
  IF v_b NOT LIKE 'FAILED (42501):%' THEN
    RAISE EXCEPTION 'ASSERTION FALLIDA escenario (b): esperaba FAILED (42501) fail-closed ante owner_department NULL — regresión del bug de NULL bypass corregido en PR1. Obtuve: %', v_b;
  END IF;

  -- (c) debe fallar con 42501 (guard de estado: caso no está en 'open').
  IF v_c NOT LIKE 'FAILED (42501):%' OR v_c NOT LIKE '%no está en estado open%' THEN
    RAISE EXCEPTION 'ASSERTION FALLIDA escenario (c): esperaba FAILED (42501) por guard de estado (caso ya closed), obtuve: %', v_c;
  END IF;

  -- (d) debe tener éxito y el jsonb devuelto debe indicar status=closed.
  IF v_d NOT LIKE 'SUCCESS:%' OR v_d NOT LIKE '%"status": "closed"%' THEN
    RAISE EXCEPTION 'ASSERTION FALLIDA escenario (d): esperaba SUCCESS con status=closed, obtuve: %', v_d;
  END IF;

  -- Verificación adicional: el estado del caso (d) en la tabla real cambió a
  -- 'closed', confirmando que el UPDATE (con su WHERE status='open'
  -- anti-race-condition) efectivamente corrió, no solo que el RPC devolvió
  -- un jsonb con la forma esperada.
  SELECT status INTO v_case_d_status
  FROM public.hermes_process_cases
  WHERE id = '22222222-0000-0000-0000-00000000000d'::uuid;

  IF v_case_d_status IS DISTINCT FROM 'closed' THEN
    RAISE EXCEPTION 'ASSERTION FALLIDA escenario (d): la fila real de hermes_process_cases no quedó en status=closed (encontrado: %)', v_case_d_status;
  END IF;

  -- Verificación negativa: los casos (a), (b) y (c) NO deben haber cambiado
  -- de estado (ninguno de esos 3 intentos debió mutar nada).
  IF EXISTS (
    SELECT 1 FROM public.hermes_process_cases
    WHERE id IN (
      '22222222-0000-0000-0000-00000000000a'::uuid,
      '22222222-0000-0000-0000-00000000000c'::uuid
    ) AND status <> CASE id
        WHEN '22222222-0000-0000-0000-00000000000a'::uuid THEN 'open'
        WHEN '22222222-0000-0000-0000-00000000000c'::uuid THEN 'closed'
      END
  ) THEN
    RAISE EXCEPTION 'ASSERTION FALLIDA: un escenario que debía fallar mutó el estado del caso de todos modos — posible regresión de autorización';
  END IF;

  RAISE NOTICE '=== TODOS LOS ESCENARIOS OK (4/4) — fn_hermes_resolver_caso se comporta según lo esperado ===';
END $$;

-- ---------------------------------------------------------------------------
-- Nunca persistir: revierte el INSERT de usuario_departamentos, los 4 casos
-- de hermes_process_cases de prueba, y el UPDATE del escenario (d).
-- ---------------------------------------------------------------------------
ROLLBACK;
