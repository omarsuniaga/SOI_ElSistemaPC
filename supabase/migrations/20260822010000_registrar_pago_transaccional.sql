-- Diagnostico Portal FIN (2026-08-22), continuacion: blinda registrarPago
-- contra condiciones de carrera (G-01 del SDD-SOI-FINANZAS-v1.0) y agrega
-- el soporte de pagos parciales que el schema no tenia.
--
-- Antes: registrarPago hacia 3 llamadas HTTP independientes desde el
-- cliente (insert pago, update cuotas, insert wallet_movimientos) sin lock
-- ni transaccion — dos cajeros cobrando a la misma familia en paralelo
-- podian pisarse el saldo del wallet. Ademas, cuotas no tenia forma de
-- registrar un pago parcial: cualquier cuota seleccionada se marcaba
-- 'pagada' completa sin importar cuanto se hubiera cubierto realmente.
--
-- Ahora: fn_registrar_pago_transaccional hace todo dentro de una sola
-- transaccion, con SELECT ... FOR UPDATE sobre la familia (serializa
-- las operaciones de esa cuenta) y FOR UPDATE sobre las cuotas
-- seleccionadas mientras las recorre oldest-first, exactamente como
-- describe distribuirPago() en el dominio (caja/domain/pago.js), pero
-- con el resultado persistido de forma atomica y auditable por cuota.
--
-- De paso se cierra una brecha de permisos severa detectada al revisar
-- estas tablas: `anon` tenia INSERT/UPDATE/DELETE/TRUNCATE completos
-- sobre pagos, cuotas, wallet_movimientos y el resto de las tablas
-- financieras de caja/ (RLS no cubre TRUNCATE). Se revoca todo a anon,
-- y se cierra tambien el bypass de escritura directa para `authenticated`
-- sobre pagos/wallet_movimientos: de ahora en adelante solo el RPC puede
-- escribir ahi.

BEGIN;

-- Soporte de pagos parciales (no existia forma de registrar esto)
ALTER TABLE cuotas ADD COLUMN monto_pagado_centavos bigint NOT NULL DEFAULT 0;
ALTER TABLE cuotas ADD CONSTRAINT chk_cuotas_monto_pagado
  CHECK (monto_pagado_centavos >= 0 AND monto_pagado_centavos <= monto_final_centavos);

-- Auditoria de imputacion: cuanto se aplico a cada cuota, con dias de
-- atraso congelados al momento de aplicar (mismo criterio que G-09 del SDD)
CREATE TABLE aplicaciones_pago (
  id uuid primary key default gen_random_uuid(),
  pago_id uuid not null references pagos(id),
  cuota_id uuid not null references cuotas(id),
  monto_aplicado_centavos bigint not null check (monto_aplicado_centavos > 0),
  dias_atraso_al_aplicar integer not null default 0,
  created_at timestamptz not null default now(),
  constraint uq_aplicacion unique (pago_id, cuota_id)
);
ALTER TABLE aplicaciones_pago ENABLE ROW LEVEL SECURITY;
CREATE POLICY aplicaciones_pago_select_cajero_admin ON aplicaciones_pago FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin','cajero'))
);
REVOKE ALL ON aplicaciones_pago FROM anon;

-- RPC transaccional: unico punto de entrada para registrar un pago
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

  -- Bloqueo pesimista sobre la familia: serializa todas las operaciones
  -- de pago de esta cuenta (G-01).
  PERFORM 1 FROM familias WHERE id = p_familia_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Familia % no encontrada', p_familia_id;
  END IF;

  INSERT INTO pagos (familia_id, cuota_ids, monto_centavos, metodo_pago, referencia, cajero_id, notas)
  VALUES (p_familia_id, '{}', p_monto_centavos, p_metodo_pago, p_referencia, v_cajero_id, p_notas)
  RETURNING * INTO v_pago;

  -- Distribucion oldest-first, con lock por cuota mientras se recorre
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

  -- Sobrante -> credito a wallet, en la misma transaccion (sin lectura
  -- suelta previa: ya tenemos la familia bloqueada)
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

REVOKE ALL ON FUNCTION fn_registrar_pago_transaccional(uuid,bigint,text,text,text,uuid[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION fn_registrar_pago_transaccional(uuid,bigint,text,text,text,uuid[]) TO authenticated;

-- Cierra el bypass: solo el RPC puede escribir pagos/wallet_movimientos.
-- cuotas sigue permitiendo UPDATE a authenticated (correcciones manuales
-- de admin via RLS existente) pero ya no DELETE/TRUNCATE.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON pagos FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON wallet_movimientos FROM authenticated;
REVOKE DELETE, TRUNCATE ON cuotas FROM authenticated;

-- Brecha de permisos encontrada al revisar: anon no tenia ningun negocio
-- en las tablas financieras y tenia CRUD+TRUNCATE completo.
REVOKE ALL ON pagos FROM anon;
REVOKE ALL ON cuotas FROM anon;
REVOKE ALL ON wallet_movimientos FROM anon;
REVOKE ALL ON wallet_config FROM anon;
REVOKE ALL ON becas FROM anon;
REVOKE ALL ON exoneraciones FROM anon;
REVOKE ALL ON compromisos_pago FROM anon;
REVOKE ALL ON score_compromiso FROM anon;
REVOKE ALL ON campana_participaciones FROM anon;
REVOKE ALL ON cierres_caja FROM anon;
REVOKE ALL ON representantes FROM anon;
REVOKE ALL ON familias FROM anon;
REVOKE ALL ON patrocinantes FROM anon;
REVOKE ALL ON patrocinios FROM anon;
REVOKE ALL ON notificaciones_caja FROM anon;
REVOKE ALL ON tareas_caja FROM anon;

-- Vistas: saldo_pendiente/saldo debe restar lo ya pagado (INV-03: saldo = neto - pagado)
DROP VIEW IF EXISTS vw_estado_familiar;
DROP VIEW IF EXISTS vw_mora_activa;

CREATE VIEW vw_mora_activa AS
SELECT c.id AS cuota_id,
    c.familia_id,
    c.alumno_id,
    c.concepto,
    (c.monto_final_centavos - c.monto_pagado_centavos) AS saldo_centavos,
    c.fecha_vencimiento,
    c.estado,
    CURRENT_DATE - c.fecha_vencimiento AS dias_mora,
    f.nombre_familia,
    r.nombre AS rep_nombre,
    r.telefono_whatsapp,
    r.email AS rep_email,
    sc.nivel AS score_nivel
FROM cuotas c
    JOIN familias f ON f.id = c.familia_id
    LEFT JOIN representantes r ON r.familia_id = c.familia_id AND r.es_pagador = true
    LEFT JOIN LATERAL ( SELECT sc2.nivel
        FROM score_compromiso sc2
        WHERE sc2.representante_id = r.id
        ORDER BY sc2.ciclo_anio DESC, sc2.ciclo_mes DESC
        LIMIT 1) sc ON true
WHERE c.estado = ANY (ARRAY['vencida'::cuota_estado, 'en_mora'::cuota_estado]);

CREATE VIEW vw_estado_familiar AS
SELECT f.id,
    f.nombre_familia,
    f.activa,
    r.id AS rep_id,
    r.nombre AS rep_nombre,
    r.telefono_whatsapp,
    r.es_pagador,
    sc.score,
    sc.nivel,
    count(c.id) FILTER (WHERE c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado])) AS cuotas_pendientes,
    sum(c.monto_final_centavos - c.monto_pagado_centavos) FILTER (WHERE c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado])) AS saldo_pendiente_centavos,
    wm.saldo_resultante_centavos AS saldo_wallet_centavos
FROM familias f
    LEFT JOIN representantes r ON r.familia_id = f.id AND r.es_pagador = true
    LEFT JOIN LATERAL ( SELECT sc2.score, sc2.nivel
        FROM score_compromiso sc2
        WHERE sc2.representante_id = r.id
        ORDER BY sc2.ciclo_anio DESC, sc2.ciclo_mes DESC
        LIMIT 1) sc ON true
    LEFT JOIN cuotas c ON c.familia_id = f.id
    LEFT JOIN LATERAL ( SELECT wm2.saldo_resultante_centavos
        FROM wallet_movimientos wm2
        WHERE wm2.familia_id = f.id
        ORDER BY wm2.created_at DESC
        LIMIT 1) wm ON true
GROUP BY f.id, f.nombre_familia, f.activa, r.id, r.nombre, r.telefono_whatsapp, r.es_pagador, sc.score, sc.nivel, wm.saldo_resultante_centavos;

COMMIT;
