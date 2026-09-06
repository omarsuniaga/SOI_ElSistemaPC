-- ==============================================================================
-- Migración: 20260906020000_finanzas_fase0_alumnos_exento_mensualidad.sql
-- Módulo 1: Cobro de Mensualidades — Fase 0
-- Propósito: flag exento_mensualidad + fn_generar_ciclo_cuotas consciente de
--            exentos y de becas (parciales y totales).
--
-- Revisión 2026-09-06: la columna exento_mensualidad ya existe en producción
-- (ADD COLUMN IF NOT EXISTS = no-op). La función en prod NO tenía lógica de
-- becas; acá se agrega el descuento por `becas.porcentaje` (tabla real en prod,
-- distinta del `alumnos_beneficios` que quedó sin aplicar). Rollback: restaurar
-- la definición anterior de fn_generar_ciclo_cuotas.
-- ==============================================================================

ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS exento_mensualidad boolean DEFAULT false;

COMMENT ON COLUMN public.alumnos.exento_mensualidad IS
  'Si es true, el alumno no genera cuota mensual ni aparece como moroso.';

CREATE OR REPLACE FUNCTION public.fn_generar_ciclo_cuotas(
  p_mes integer,
  p_anio integer,
  p_monto_centavos bigint DEFAULT 60000
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_count        int := 0;
  v_alumno       RECORD;
  v_vencimiento  date;
  v_porcentaje   integer;
  v_descuento    bigint;
  v_monto_final  bigint;
  v_estado       text;
BEGIN
  IF p_mes < 1 OR p_mes > 12 THEN
    RAISE EXCEPTION 'p_mes debe estar entre 1 y 12, recibido: %', p_mes;
  END IF;

  v_vencimiento := make_date(p_anio, p_mes, 5);

  FOR v_alumno IN
    SELECT a.id AS alumno_id, a.familia_id
    FROM public.alumnos a
    JOIN public.familias f ON f.id = a.familia_id AND f.activa = true
    WHERE a.activo = true
      AND COALESCE(a.exento_mensualidad, false) = false
  LOOP
    -- Beca activa vigente al vencimiento (la de mayor cobertura si hay varias)
    SELECT b.porcentaje
      INTO v_porcentaje
      FROM public.becas b
     WHERE b.alumno_id = v_alumno.alumno_id
       AND b.activa = true
       AND b.fecha_inicio <= v_vencimiento
       AND (b.fecha_fin IS NULL OR b.fecha_fin >= v_vencimiento)
     ORDER BY b.porcentaje DESC
     LIMIT 1;

    v_porcentaje  := LEAST(GREATEST(COALESCE(v_porcentaje, 0), 0), 100);
    v_descuento   := (p_monto_centavos * v_porcentaje) / 100;
    v_monto_final := p_monto_centavos - v_descuento;
    v_estado      := CASE WHEN v_monto_final <= 0 THEN 'becada' ELSE 'pendiente' END;

    INSERT INTO public.cuotas (
      familia_id, alumno_id, concepto,
      monto_base_centavos, monto_final_centavos, descuento_centavos,
      fecha_generacion, fecha_vencimiento,
      ciclo_mes, ciclo_anio, estado
    )
    VALUES (
      v_alumno.familia_id, v_alumno.alumno_id, 'mensualidad',
      p_monto_centavos, v_monto_final, v_descuento,
      CURRENT_DATE, v_vencimiento,
      p_mes, p_anio, v_estado
    )
    ON CONFLICT (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto)
    DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$function$;

COMMENT ON FUNCTION public.fn_generar_ciclo_cuotas(integer, integer, bigint) IS
  'Genera cuotas mensuales; omite inactivos y exentos; aplica descuento por becas.porcentaje.';
