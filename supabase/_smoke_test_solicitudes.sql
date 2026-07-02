DO $$
DECLARE
  v_maestro_id uuid;
  v_solic_id   uuid;
  v_corr_id    uuid;
  v_dept       text;
  v_estado     text;
BEGIN
  SELECT id INTO v_maestro_id FROM public.maestros LIMIT 1;
  RAISE NOTICE 'Maestro ID: %', v_maestro_id;

  INSERT INTO public.solicitudes_necesidades (
    maestro_id, maestro_nombre, tipo_necesidad, categoria, titulo, descripcion, cantidad, prioridad, area, estado
  ) VALUES (
    v_maestro_id, 'TEST-VALIDACION', 'material', 'didactico',
    'TEST - verificacion flujo necesidades',
    'Generada por verify_solicitudes_necesidades_flow()',
    1, 'media', 'aula', 'pendiente'
  ) RETURNING id, correlation_id INTO v_solic_id, v_corr_id;

  RAISE NOTICE 'Solicitud ID: %, Correlation ID: %', v_solic_id, v_corr_id;

  SELECT departamento_actual, estado INTO v_dept, v_estado
  FROM public.solicitudes_necesidades WHERE id = v_solic_id;

  RAISE NOTICE 'departamento_actual: %, estado: %', v_dept, v_estado;

  IF v_corr_id IS NOT NULL THEN
    RAISE NOTICE 'SMOKE TEST: correlation_id asignado OK';
  ELSE
    RAISE NOTICE 'SMOKE TEST: correlation_id ES NULL';
  END IF;

  IF v_dept = 'ACM' THEN
    RAISE NOTICE 'SMOKE TEST: departamento_actual = ACM OK';
  ELSE
    RAISE NOTICE 'SMOKE TEST: departamento_actual = %', v_dept;
  END IF;

  IF v_estado = 'pendiente' THEN
    RAISE NOTICE 'SMOKE TEST: estado = pendiente OK';
  ELSE
    RAISE NOTICE 'SMOKE TEST: estado = %', v_estado;
  END IF;

  DELETE FROM public.solicitudes_necesidades WHERE id = v_solic_id;
  RAISE NOTICE 'SMOKE TEST: registro de prueba eliminado';
END;
$$;
