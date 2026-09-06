-- ==============================================================================
-- Migración: 20260906030000_finanzas_fase0_pagos_fecha_pago_rpc.sql
-- Módulo 1: Cobro de Mensualidades — Fase 0
-- Propósito: pagos.fecha_pago (pagos retroactivos) + reescritura de
--            fn_registrar_pago_transaccional.
--
-- Revisión 2026-09-06 sobre el borrador original:
--   * DROP explícito de la firma de 6 args: CREATE OR REPLACE con firma distinta
--     (7 args) NO reemplaza — crearía un overload y las llamadas de pago
--     quedarían ambiguas ("function is not unique"). Sin este DROP se rompen
--     todos los cobros.
--   * Roles autorizados = ('admin','finanzas'); se quita 'cajero' (no existe en profiles.rol).
--   * Días de mora contra la fecha contable del pago (permite asentar
--     transferencias retroactivas sin castigar con mora).
--   * D7 — excedente: primero se imputa a las cuotas seleccionadas; si sobra,
--     se imputa a las demás cuotas abiertas de la familia (más viejas primero);
--     si AÚN sobra, se rechaza el pago (no hay excedentes huérfanos, no se toca
--     wallet). Cambiar aquí si Omar decide acreditar a wallet.
-- Rollback: restaurar la definición de 6 args que existía en prod (acredita el
-- excedente a wallet_movimientos).
-- ==============================================================================

ALTER TABLE public.pagos
  ADD COLUMN IF NOT EXISTS fecha_pago date DEFAULT CURRENT_DATE;

COMMENT ON COLUMN public.pagos.fecha_pago IS
  'Fecha contable/bancaria real de la transacción; puede diferir de created_at.';

DROP FUNCTION IF EXISTS public.fn_registrar_pago_transaccional(uuid, bigint, text, text, text, uuid[]);

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
  v_rol              text;
  v_cajero_id        uuid := auth.uid();
  v_pago             pagos;
  v_cuota            RECORD;
  v_restante         bigint := p_monto_centavos;
  v_saldo_cuota      bigint;
  v_monto_aplicado   bigint;
  v_dias_atraso      integer;
  v_fecha_efectiva   date := COALESCE(p_fecha_pago, CURRENT_DATE);
  v_cuotas_aplicadas uuid[] := '{}';
BEGIN
  SELECT rol INTO v_rol FROM public.profiles WHERE id = v_cajero_id;
  IF v_rol IS NULL OR v_rol NOT IN ('admin', 'finanzas') THEN
    RAISE EXCEPTION 'No autorizado para registrar pagos en ventanilla';
  END IF;

  IF p_monto_centavos <= 0 THEN
    RAISE EXCEPTION 'El monto del pago debe ser mayor a cero';
  END IF;

  -- Bloqueo pesimista contra cobros concurrentes sobre la misma familia
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

  -- Imputación FIFO: primero las cuotas seleccionadas, luego el resto de las
  -- cuotas abiertas de la familia (más viejas primero) para absorber el excedente.
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

  -- D7: sin cuota que absorba el excedente, se rechaza (rollback de todo).
  IF v_restante > 0 THEN
    RAISE EXCEPTION 'El monto recibido supera en RD$ % el saldo total de la familia. Ajustá el monto o generá la cuota correspondiente antes de cobrar.',
      ROUND(v_restante / 100.0, 2);
  END IF;

  RETURN v_pago;
END;
$$;

COMMENT ON FUNCTION public.fn_registrar_pago_transaccional(uuid, bigint, text, text, text, uuid[], date) IS
  'Registra un pago atómico; imputa FIFO (cuotas seleccionadas y luego el resto de la familia) con fecha contable; rechaza excedente sin cuota.';
