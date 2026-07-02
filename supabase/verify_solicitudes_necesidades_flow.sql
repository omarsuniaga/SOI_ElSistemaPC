-- ============================================================
-- verify_solicitudes_necesidades_flow.sql
-- Validación post-migración: devuelve tabla CHECK | STATUS | DETAIL
-- Ejecutar en el SQL Editor de Supabase (producción)
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_solicitudes_necesidades_flow()
RETURNS TABLE(check_id text, status text, detail text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_col record;
  v_count int;
  v_constraint_def text;
  v_tgtype int;
  v_maestro_id uuid;
  v_solic_id   uuid;
  v_corr_id uuid;
  v_dept text;
  v_policy record;
  v_policies text[];
BEGIN
  -- ==========================================================
  -- A. Columnas nuevas
  -- ==========================================================
  check_id := 'A01'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='correlation_id' AND data_type='uuid';
  IF v_count=1 THEN status:='PASS'; detail:='correlation_id (uuid)'; END IF;
  RETURN NEXT;

  check_id := 'A02'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='link_tienda';
  IF v_count=1 THEN status:='PASS'; detail:='link_tienda'; END IF;
  RETURN NEXT;

  check_id := 'A03'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='costo_estimado' AND data_type='numeric';
  IF v_count=1 THEN status:='PASS'; detail:='costo_estimado (numeric)'; END IF;
  RETURN NEXT;

  check_id := 'A04'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='presupuesto' AND data_type='numeric';
  IF v_count=1 THEN status:='PASS'; detail:='presupuesto (numeric)'; END IF;
  RETURN NEXT;

  check_id := 'A05'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='departamento_actual';
  IF v_count=1 THEN status:='PASS'; detail:='departamento_actual'; END IF;
  RETURN NEXT;

  check_id := 'A06'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='pre_aprobada_por' AND data_type='uuid';
  IF v_count=1 THEN status:='PASS'; detail:='pre_aprobada_por (uuid)'; END IF;
  RETURN NEXT;

  check_id := 'A07'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='presupuestado_por' AND data_type='uuid';
  IF v_count=1 THEN status:='PASS'; detail:='presupuestado_por (uuid)'; END IF;
  RETURN NEXT;

  check_id := 'A08'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='solicitudes_necesidades'
      AND column_name='correlation_id';
  IF v_count=1 THEN
    SELECT pg_catalog.pg_get_constraintdef(oid) INTO v_constraint_def
    FROM pg_catalog.pg_constraint
    WHERE conrelid='public.solicitudes_necesidades'::regclass AND contype='c'
      AND conname='solicitudes_necesidades_estado_check';
    IF v_constraint_def LIKE '%pendiente%' AND v_constraint_def LIKE '%pre_aprobada_acm%'
       AND v_constraint_def LIKE '%rechazada_acm%' AND v_constraint_def LIKE '%en_presupuesto%'
       AND v_constraint_def LIKE '%presupuestada%' AND v_constraint_def LIKE '%aprobada%'
       AND v_constraint_def LIKE '%rechazada%' AND v_constraint_def LIKE '%comprada%'
       AND v_constraint_def LIKE '%entregada%' AND v_constraint_def LIKE '%cancelada%'
    THEN status:='PASS'; detail:='CHECK cubre 10 estados requeridos';
    ELSE status:='FAIL'; detail:='CHECK existe pero no cubre todos los estados: ' || coalesce(v_constraint_def, 'NULL');
    END IF;
  END IF;
  RETURN NEXT;

  -- ==========================================================
  -- B. Contrato Hermes
  -- ==========================================================
  check_id := 'B01'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM public.soi_process_contracts WHERE process_code='ACM-NEC';
  IF v_count=1 THEN status:='PASS'; detail:='process_code ACM-NEC existe'; END IF;
  RETURN NEXT;

  check_id := 'B02'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM public.soi_process_contracts
    WHERE process_code='ACM-NEC' AND department_owner='ACM';
  IF v_count=1 THEN status:='PASS'; detail:='department_owner=ACM'; END IF;
  RETURN NEXT;

  check_id := 'B03'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM public.soi_process_contracts
    WHERE process_code='ACM-NEC' AND automation_status='semi_auto';
  IF v_count=1 THEN status:='PASS'; detail:='automation_status=semi_auto'; END IF;
  RETURN NEXT;

  -- ==========================================================
  -- C. Función Hermes base (debe existir de migración previa)
  -- ==========================================================
  check_id := 'C01'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_proc
    WHERE proname='fn_hermes_start_process_case' AND pronamespace='public'::regnamespace;
  IF v_count=1 THEN status:='PASS'; detail:='fn_hermes_start_process_case existe (base)'; END IF;
  RETURN NEXT;

  -- ==========================================================
  -- D. Función new del flujo
  -- ==========================================================
  check_id := 'D01'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_proc
    WHERE proname='fn_solicitudes_necesidades_open_process_case' AND pronamespace='public'::regnamespace;
  IF v_count=1 THEN status:='PASS'; detail:='función existe'; END IF;
  RETURN NEXT;

  check_id := 'D02'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_proc
    WHERE proname='fn_solicitudes_necesidades_open_process_case'
      AND prosecdef=true AND pronamespace='public'::regnamespace;
  IF v_count=1 THEN status:='PASS'; detail:='SECURITY DEFINER'; END IF;
  RETURN NEXT;

  -- ==========================================================
  -- E. Trigger
  -- ==========================================================
  check_id := 'E01'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_trigger
    WHERE tgrelid='public.solicitudes_necesidades'::regclass AND tgname='trg_solicitudes_necesidades_open_case';
  IF v_count=1 THEN status:='PASS'; detail:='trigger existe'; END IF;
  RETURN NEXT;

  check_id := 'E02'; status := 'FAIL'; detail := '';
  SELECT tgtype INTO v_tgtype FROM pg_trigger
    WHERE tgrelid='public.solicitudes_necesidades'::regclass AND tgname='trg_solicitudes_necesidades_open_case';
  IF v_tgtype = 22 THEN status:='PASS'; detail:='AFTER INSERT FOR EACH ROW (tgtype=22)';
  ELSE status:='FAIL'; detail:='tgtype=' || coalesce(v_tgtype::text, 'NULL') || ', esperado 22';
  END IF;
  RETURN NEXT;

  check_id := 'E03'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_trigger t
    WHERE t.tgrelid='public.solicitudes_necesidades'::regclass
      AND t.tgname='trg_solicitudes_necesidades_open_case'
      AND t.tgfoid = (SELECT oid FROM pg_proc WHERE proname='fn_solicitudes_necesidades_open_process_case' LIMIT 1);
  IF v_count=1 THEN status:='PASS'; detail:='ejecuta función correcta'; END IF;
  RETURN NEXT;

  -- ==========================================================
  -- F. RLS
  -- ==========================================================
  check_id := 'F01'; status := 'FAIL'; detail := '';
  SELECT relrowsecurity::int INTO v_count FROM pg_class WHERE oid='public.solicitudes_necesidades'::regclass;
  IF v_count=1 THEN status:='PASS'; detail:='RLS habilitado'; END IF;
  RETURN NEXT;

  -- Checks individuales por policy
  check_id := 'F02'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_policies
    WHERE tablename='solicitudes_necesidades' AND schemaname='public'
      AND policyname='solic_select_owner_acm_fin_admin';
  IF v_count=1 THEN status:='PASS'; detail:='solic_select_owner_acm_fin_admin'; END IF;
  RETURN NEXT;

  check_id := 'F03'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_policies
    WHERE tablename='solicitudes_necesidades' AND schemaname='public'
      AND policyname='solic_insert_own';
  IF v_count=1 THEN status:='PASS'; detail:='solic_insert_own'; END IF;
  RETURN NEXT;

  check_id := 'F04'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_policies
    WHERE tablename='solicitudes_necesidades' AND schemaname='public'
      AND policyname='solic_update_owner_cancel';
  IF v_count=1 THEN status:='PASS'; detail:='solic_update_owner_cancel'; END IF;
  RETURN NEXT;

  check_id := 'F05'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_policies
    WHERE tablename='solicitudes_necesidades' AND schemaname='public'
      AND policyname='solic_update_acm_admin_stage';
  IF v_count=1 THEN status:='PASS'; detail:='solic_update_acm_admin_stage'; ELSE detail:='ausente (puede estar en hardening file pendiente)';
  END IF;
  RETURN NEXT;

  check_id := 'F06'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_policies
    WHERE tablename='solicitudes_necesidades' AND schemaname='public'
      AND policyname='solic_update_fin_admin_cajero_stage';
  IF v_count=1 THEN status:='PASS'; detail:='solic_update_fin_admin_cajero_stage'; ELSE detail:='ausente (puede estar en hardening file pendiente)';
  END IF;
  RETURN NEXT;

  check_id := 'F07'; status := 'FAIL'; detail := '';
  SELECT count(*) INTO v_count FROM pg_policies
    WHERE tablename='solicitudes_necesidades' AND schemaname='public'
      AND policyname='solic_update_admin_override';
  IF v_count=1 THEN status:='PASS'; detail:='solic_update_admin_override'; ELSE detail:='ausente';
  END IF;
  RETURN NEXT;

  -- ==========================================================
  -- G. Smoke test E2E (solo si hay maestro)
  -- ==========================================================
  check_id := 'G01'; status := 'FAIL'; detail := '';
  SELECT id INTO v_maestro_id FROM public.maestros LIMIT 1;
  IF v_maestro_id IS NULL THEN detail:='No hay maestros - saltando smoke test';
  ELSE
    INSERT INTO public.solicitudes_necesidades (
      maestro_id, maestro_nombre, tipo_necesidad, categoria, titulo, descripcion, cantidad, prioridad, area, estado
    ) VALUES (
      v_maestro_id, 'TEST-VALIDACION', 'material', 'didactico',
      'TEST - verificación flujo necesidades',
      'Generada por verify_solicitudes_necesidades_flow()',
      1, 'media', 'aula', 'pendiente'
    ) RETURNING id, correlation_id INTO v_solic_id, v_corr_id;

    IF v_corr_id IS NOT NULL THEN
      status:='PASS'; detail:='correlation_id=' || v_corr_id || ' asignado por trigger';

      check_id := 'G02'; status := 'FAIL'; detail := '';
      SELECT departamento_actual INTO v_dept FROM public.solicitudes_necesidades WHERE id=v_solic_id;
      IF v_dept = 'ACM' THEN status:='PASS'; detail:='departamento_actual=ACM';
      ELSE status:='FAIL'; detail:='departamento_actual=' || coalesce(v_dept, 'NULL');
      END IF;
      RETURN NEXT;

      check_id := 'G03'; status := 'FAIL'; detail := '';
      SELECT estado INTO v_dept FROM public.solicitudes_necesidades WHERE id=v_solic_id;
      IF v_dept = 'pendiente' THEN status:='PASS'; detail:='estado=pendiente';
      ELSE status:='FAIL'; detail:='estado=' || coalesce(v_dept, 'NULL');
      END IF;
      RETURN NEXT;

      -- Limpiar registro de prueba
      DELETE FROM public.solicitudes_necesidades WHERE id=v_solic_id;
    ELSE
      detail:='correlation_id NULL - trigger no ejecutó fn_hermes_start_process_case';
    END IF;
  END IF;
  RETURN NEXT;

  -- ==========================================================
  -- H. Resumen
  -- ==========================================================
  check_id := 'ZZZ'; status := 'OK'; detail := 'Verificación completada. Revisar checks arriba.';
  RETURN NEXT;
END;
$$;

-- Ejecutar validación
SELECT check_id, status, detail FROM public.verify_solicitudes_necesidades_flow();

-- Limpiar función de validación (opcional - comentar si se quiere conservar)
-- DROP FUNCTION IF EXISTS public.verify_solicitudes_necesidades_flow();
