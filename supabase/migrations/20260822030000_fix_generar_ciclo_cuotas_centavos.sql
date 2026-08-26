-- Fix: fn_generar_ciclo_cuotas quedo rota por la migracion de dinero a
-- centavos (20260822000000_caja_dinero_centavos.sql) — seguia insertando
-- en columnas viejas (monto_base, monto_final, que ya no existen tras el
-- rename a *_centavos) y con monto 0 hardcodeado, sin valor real.
--
-- Se corrige para usar las columnas *_centavos y se agrega un parametro
-- p_monto_centavos (default 60000 = RD$600, la mensualidad vigente) en
-- vez de dejarlo en cero.

CREATE OR REPLACE FUNCTION public.fn_generar_ciclo_cuotas(p_mes integer, p_anio integer, p_monto_centavos bigint DEFAULT 60000)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_count       int := 0;
  v_familia     RECORD;
  v_alumno      RECORD;
  v_vencimiento date;
BEGIN
  IF p_mes < 1 OR p_mes > 12 THEN
    RAISE EXCEPTION 'p_mes must be between 1 and 12, got %', p_mes;
  END IF;

  v_vencimiento := make_date(p_anio, p_mes, 5);

  FOR v_familia IN
    SELECT id FROM public.familias WHERE activa = true
  LOOP
    FOR v_alumno IN
      SELECT id FROM public.alumnos
      WHERE familia_id = v_familia.id AND activo = true
    LOOP
      INSERT INTO public.cuotas (
        familia_id, alumno_id, concepto,
        monto_base_centavos, monto_final_centavos,
        fecha_generacion, fecha_vencimiento,
        ciclo_mes, ciclo_anio, estado
      )
      VALUES (
        v_familia.id, v_alumno.id, 'mensualidad',
        p_monto_centavos, p_monto_centavos,
        CURRENT_DATE, v_vencimiento,
        p_mes, p_anio, 'pendiente'
      )
      ON CONFLICT (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto)
      DO NOTHING;

      IF FOUND THEN
        v_count := v_count + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$function$;
