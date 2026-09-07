-- ==============================================================================
-- Migración: 20260907010000_finanzas_d7_wallet_y_beca_retroactiva.sql
-- Decisiones de Omar (2026-09-07):
--   D7: el excedente de un pago se acredita al wallet de la familia (no se rechaza).
--   Becas: si una beca se registra DESPUÉS de terminado el mes, el cobro
--          antiguo/pendiente de ese alumno queda anulado (cuotas abiertas -> 'becada',
--          se perdona el saldo, lo pagado queda como está).
-- ==============================================================================

-- ---------------------------------------------------------------------------
-- 1. D7 — fn_registrar_pago_transaccional: excedente -> wallet
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_registrar_pago_transaccional(
  p_familia_id     uuid,
  p_monto_centavos bigint,
  p_metodo_pago    text,
  p_referencia     text,
  p_notas          text,
  p_cuota_ids      uuid[],
  p_fecha_pago     date DEFAULT CURRENT_DATE
)
RETURNS pagos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol                   text;
  v_cajero_id             uuid := auth.uid();
  v_pago                  pagos;
  v_cuota                 RECORD;
  v_restante              bigint := p_monto_centavos;
  v_saldo_cuota           bigint;
  v_monto_aplicado        bigint;
  v_dias_atraso           integer;
  v_fecha_efectiva        date := COALESCE(p_fecha_pago, CURRENT_DATE);
  v_cuotas_aplicadas      uuid[] := '{}';
  v_saldo_wallet_anterior bigint;
BEGIN
  SELECT rol INTO v_rol FROM public.profiles WHERE id = v_cajero_id;
  IF v_rol IS NULL OR v_rol NOT IN ('admin', 'finanzas') THEN
    RAISE EXCEPTION 'No autorizado para registrar pagos en ventanilla';
  END IF;

  IF p_monto_centavos <= 0 THEN
    RAISE EXCEPTION 'El monto del pago debe ser mayor a cero';
  END IF;

  PERFORM 1 FROM public.familias WHERE id = p_familia_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Familia con ID % no encontrada', p_familia_id;
  END IF;

  INSERT INTO public.pagos (
    familia_id, cuota_ids, monto_centavos, metodo_pago, referencia, cajero_id, notas, fecha_pago
  )
  VALUES (
    p_familia_id, '{}', p_monto_centavos, p_metodo_pago::metodo_pago, p_referencia, v_cajero_id, p_notas, v_fecha_efectiva
  )
  RETURNING * INTO v_pago;

  FOR v_cuota IN
    SELECT c.*
    FROM public.cuotas c
    WHERE c.familia_id = p_familia_id
      AND c.estado IN ('pendiente', 'vencida', 'en_mora')
    ORDER BY (c.id = ANY(p_cuota_ids)) DESC, c.fecha_vencimiento ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_restante <= 0;

    v_saldo_cuota := v_cuota.monto_final_centavos - v_cuota.monto_pagado_centavos;
    IF v_saldo_cuota <= 0 THEN
      CONTINUE;
    END IF;

    v_monto_aplicado := LEAST(v_restante, v_saldo_cuota);
    v_dias_atraso := GREATEST(0, v_fecha_efectiva - v_cuota.fecha_vencimiento);

    UPDATE public.cuotas
      SET monto_pagado_centavos = monto_pagado_centavos + v_monto_aplicado,
          estado = CASE
                     WHEN monto_pagado_centavos + v_monto_aplicado >= monto_final_centavos THEN 'pagada'
                     ELSE estado
                   END
      WHERE id = v_cuota.id;

    INSERT INTO public.aplicaciones_pago (
      pago_id, cuota_id, monto_aplicado_centavos, dias_atraso_al_aplicar
    )
    VALUES (v_pago.id, v_cuota.id, v_monto_aplicado, v_dias_atraso);

    v_cuotas_aplicadas := array_append(v_cuotas_aplicadas, v_cuota.id);
    v_restante := v_restante - v_monto_aplicado;
  END LOOP;

  UPDATE public.pagos SET cuota_ids = v_cuotas_aplicadas WHERE id = v_pago.id;
  v_pago.cuota_ids := v_cuotas_aplicadas;

  -- D7: el excedente (sin cuota que lo absorba) se acredita al wallet de la familia.
  IF v_restante > 0 THEN
    SELECT saldo_resultante_centavos INTO v_saldo_wallet_anterior
    FROM public.wallet_movimientos
    WHERE familia_id = p_familia_id
    ORDER BY created_at DESC
    LIMIT 1;
    v_saldo_wallet_anterior := COALESCE(v_saldo_wallet_anterior, 0);

    INSERT INTO public.wallet_movimientos (
      familia_id, tipo, monto_centavos, origen, referencia_id, descripcion, saldo_resultante_centavos
    )
    VALUES (
      p_familia_id, 'credito', v_restante, 'pago', v_pago.id,
      'Saldo a favor del pago', v_saldo_wallet_anterior + v_restante
    );
  END IF;

  RETURN v_pago;
END;
$$;

COMMENT ON FUNCTION public.fn_registrar_pago_transaccional(uuid, bigint, text, text, text, uuid[], date) IS
  'Pago atómico; imputa FIFO (cuotas seleccionadas y luego el resto de la familia) con fecha contable; el excedente se acredita al wallet.';

-- ---------------------------------------------------------------------------
-- 2. Beca registrada tarde -> anula el cobro pendiente del alumno
-- ---------------------------------------------------------------------------

-- fn_aplicar_becas_ciclo(int,int) estaba rota (referenciaba columnas monto_base /
-- monto_final que no existen) y nadie la llamaba. La reemplaza el trigger de abajo.
DROP FUNCTION IF EXISTS public.fn_aplicar_becas_ciclo(integer, integer);

CREATE OR REPLACE FUNCTION public.fn_beca_anula_cuotas_abiertas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.activa IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- Cuotas de mensualidad todavía abiertas del alumno, dentro de la vigencia de
  -- la beca: se perdona el saldo pendiente (lo ya pagado queda como está) y se
  -- marcan 'becada'.
  UPDATE public.cuotas c
  SET
    descuento_centavos   = GREATEST(0, c.monto_base_centavos - c.monto_pagado_centavos),
    monto_final_centavos  = c.monto_pagado_centavos,
    estado                = 'becada',
    updated_at            = now()
  WHERE c.alumno_id = NEW.alumno_id
    AND c.concepto  = 'mensualidad'
    AND c.estado    IN ('pendiente', 'vencida', 'en_mora')
    AND c.fecha_vencimiento >= NEW.fecha_inicio
    AND (NEW.fecha_fin IS NULL OR c.fecha_vencimiento <= NEW.fecha_fin);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_beca_anula_cuotas_abiertas ON public.becas;
CREATE TRIGGER trg_beca_anula_cuotas_abiertas
  AFTER INSERT OR UPDATE ON public.becas
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_beca_anula_cuotas_abiertas();

COMMENT ON FUNCTION public.fn_beca_anula_cuotas_abiertas() IS
  'Trigger: al registrar/activar una beca, anula (marca becada, perdona el saldo) las cuotas de mensualidad todavía abiertas del alumno dentro de la vigencia de la beca.';
