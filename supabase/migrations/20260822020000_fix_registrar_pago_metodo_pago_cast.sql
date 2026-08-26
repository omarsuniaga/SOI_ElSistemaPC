-- Fix: fn_registrar_pago_transaccional (20260822010000) fallaba en produccion
-- con "column metodo_pago is of type metodo_pago but expression is of type
-- text" al registrar el primer pago real desde el Portal FIN. p_metodo_pago
-- llega tipado explicitamente como `text` (parametro plpgsql), y Postgres
-- no lo castea automaticamente al enum de la columna en ese contexto —
-- a diferencia de un literal de texto sin tipo, que si se casteaba solo.
-- Se agrega el cast explicito ::metodo_pago.

CREATE OR REPLACE FUNCTION fn_registrar_pago_transaccional(
  p_familia_id uuid,
  p_monto_centavos bigint,
  p_metodo_pago text,
  p_referencia text,
  p_notas text,
  p_cuota_ids uuid[]
) RETURNS pagos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol text;
  v_cajero_id uuid := auth.uid();
  v_pago pagos;
  v_cuota RECORD;
  v_restante bigint := p_monto_centavos;
  v_saldo_cuota bigint;
  v_monto_aplicado bigint;
  v_dias_atraso integer;
  v_saldo_wallet_anterior bigint;
  v_cuotas_aplicadas uuid[] := '{}';
BEGIN
  SELECT rol INTO v_rol FROM profiles WHERE id = v_cajero_id;
  IF v_rol IS NULL OR v_rol NOT IN ('admin','cajero') THEN
    RAISE EXCEPTION 'No autorizado para registrar pagos';
  END IF;

  IF p_monto_centavos <= 0 THEN
    RAISE EXCEPTION 'El monto del pago debe ser mayor a cero';
  END IF;

  PERFORM 1 FROM familias WHERE id = p_familia_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Familia % no encontrada', p_familia_id;
  END IF;

  INSERT INTO pagos (familia_id, cuota_ids, monto_centavos, metodo_pago, referencia, cajero_id, notas)
  VALUES (p_familia_id, '{}', p_monto_centavos, p_metodo_pago::metodo_pago, p_referencia, v_cajero_id, p_notas)
  RETURNING * INTO v_pago;

  FOR v_cuota IN
    SELECT * FROM cuotas
    WHERE id = ANY(p_cuota_ids)
      AND familia_id = p_familia_id
      AND estado IN ('pendiente','vencida','en_mora')
    ORDER BY fecha_vencimiento ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_restante <= 0;

    v_saldo_cuota := v_cuota.monto_final_centavos - v_cuota.monto_pagado_centavos;
    IF v_saldo_cuota <= 0 THEN CONTINUE; END IF;

    v_monto_aplicado := LEAST(v_restante, v_saldo_cuota);
    v_dias_atraso := GREATEST(0, CURRENT_DATE - v_cuota.fecha_vencimiento);

    UPDATE cuotas
      SET monto_pagado_centavos = monto_pagado_centavos + v_monto_aplicado,
          estado = CASE WHEN monto_pagado_centavos + v_monto_aplicado >= monto_final_centavos THEN 'pagada' ELSE estado END
      WHERE id = v_cuota.id;

    INSERT INTO aplicaciones_pago (pago_id, cuota_id, monto_aplicado_centavos, dias_atraso_al_aplicar)
    VALUES (v_pago.id, v_cuota.id, v_monto_aplicado, v_dias_atraso);

    v_cuotas_aplicadas := array_append(v_cuotas_aplicadas, v_cuota.id);
    v_restante := v_restante - v_monto_aplicado;
  END LOOP;

  UPDATE pagos SET cuota_ids = v_cuotas_aplicadas WHERE id = v_pago.id;
  v_pago.cuota_ids := v_cuotas_aplicadas;

  IF v_restante > 0 THEN
    SELECT saldo_resultante_centavos INTO v_saldo_wallet_anterior
    FROM wallet_movimientos
    WHERE familia_id = p_familia_id
    ORDER BY created_at DESC
    LIMIT 1;
    v_saldo_wallet_anterior := COALESCE(v_saldo_wallet_anterior, 0);

    INSERT INTO wallet_movimientos (familia_id, tipo, monto_centavos, origen, referencia_id, descripcion, saldo_resultante_centavos)
    VALUES (p_familia_id, 'credito', v_restante, 'pago', v_pago.id, 'Saldo a favor del pago', v_saldo_wallet_anterior + v_restante);
  END IF;

  RETURN v_pago;
END;
$$;
