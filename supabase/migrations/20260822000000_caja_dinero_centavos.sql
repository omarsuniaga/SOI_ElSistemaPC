-- Diagnostico Portal FIN (2026-08-22): congela el modelo de dinero del modulo
-- caja/ a centavos enteros (bigint) en vez de numeric flotante, siguiendo
-- ADR-002 del SDD-SOI-FINANZAS-v1.0 ("Dinero como bigint de centavos +
-- Value Object Dinero; elimina errores de punto flotante").
--
-- Se hizo ahora porque todas las tablas afectadas estaban en 0 filas en
-- produccion (cuotas, pagos, wallet_movimientos, wallet_config,
-- campana_participaciones, compromisos_pago, patrocinios, cierres_caja):
-- es la unica ventana en que esta conversion es gratis. Los USING de las
-- ALTER COLUMN de abajo son formalmente correctos (multiplican por 100)
-- pero no tuvieron datos reales que convertir.
--
-- No se tocan becas.porcentaje ni exoneraciones.porcentaje: son porcentajes,
-- no dinero.
--
-- cierres_caja.por_metodo (jsonb) queda pendiente: contiene montos dentro
-- del JSON, requiere manejo a nivel de aplicacion, no un simple cambio de
-- tipo de columna.
--
-- Se dropean y recrean 3 vistas que dependian de las columnas renombradas
-- (vw_estado_familiar, vw_ingresos_diarios, vw_mora_activa), expuestas ahora
-- con sufijo _centavos tambien en sus columnas calculadas.
--
-- Pendiente de seguimiento inmediato (fuera del alcance de esta migracion):
-- actualizar caja/api/cajaSupabase.js y caja/domain/*.js, que todavia leen/
-- escriben los nombres de columna viejos (monto, monto_final, saldo_resultante,
-- etc.) y van a fallar contra este esquema hasta que se actualicen.

BEGIN;

DROP VIEW IF EXISTS vw_estado_familiar;
DROP VIEW IF EXISTS vw_ingresos_diarios;
DROP VIEW IF EXISTS vw_mora_activa;

-- cuotas
ALTER TABLE cuotas ALTER COLUMN monto_base TYPE bigint USING ROUND(monto_base * 100)::bigint;
ALTER TABLE cuotas RENAME COLUMN monto_base TO monto_base_centavos;
ALTER TABLE cuotas ALTER COLUMN monto_final TYPE bigint USING ROUND(monto_final * 100)::bigint;
ALTER TABLE cuotas RENAME COLUMN monto_final TO monto_final_centavos;
ALTER TABLE cuotas ALTER COLUMN descuento TYPE bigint USING ROUND(descuento * 100)::bigint;
ALTER TABLE cuotas RENAME COLUMN descuento TO descuento_centavos;
ALTER TABLE cuotas ALTER COLUMN descuento_centavos SET DEFAULT 0;
ALTER TABLE cuotas ADD CONSTRAINT chk_cuotas_montos_no_negativos CHECK (
  monto_base_centavos >= 0 AND monto_final_centavos >= 0 AND descuento_centavos >= 0
);

-- pagos (el CHECK pagos_monto_check sigue el rename/retype automaticamente)
ALTER TABLE pagos ALTER COLUMN monto TYPE bigint USING ROUND(monto * 100)::bigint;
ALTER TABLE pagos RENAME COLUMN monto TO monto_centavos;

-- wallet_movimientos (el CHECK wallet_movimientos_monto_check idem)
ALTER TABLE wallet_movimientos ALTER COLUMN monto TYPE bigint USING ROUND(monto * 100)::bigint;
ALTER TABLE wallet_movimientos RENAME COLUMN monto TO monto_centavos;
ALTER TABLE wallet_movimientos ALTER COLUMN saldo_resultante TYPE bigint USING ROUND(saldo_resultante * 100)::bigint;
ALTER TABLE wallet_movimientos RENAME COLUMN saldo_resultante TO saldo_resultante_centavos;

-- wallet_config
ALTER TABLE wallet_config ALTER COLUMN saldo_minimo_alerta TYPE bigint USING ROUND(saldo_minimo_alerta * 100)::bigint;
ALTER TABLE wallet_config RENAME COLUMN saldo_minimo_alerta TO saldo_minimo_alerta_centavos;
ALTER TABLE wallet_config ALTER COLUMN saldo_minimo_alerta_centavos SET DEFAULT 0;

-- campana_participaciones
ALTER TABLE campana_participaciones ALTER COLUMN monto_recuperado TYPE bigint USING ROUND(monto_recuperado * 100)::bigint;
ALTER TABLE campana_participaciones RENAME COLUMN monto_recuperado TO monto_recuperado_centavos;
ALTER TABLE campana_participaciones ALTER COLUMN monto_recuperado_centavos SET DEFAULT 0;

-- compromisos_pago
ALTER TABLE compromisos_pago ALTER COLUMN monto_comprometido TYPE bigint USING ROUND(monto_comprometido * 100)::bigint;
ALTER TABLE compromisos_pago RENAME COLUMN monto_comprometido TO monto_comprometido_centavos;
ALTER TABLE compromisos_pago ADD CONSTRAINT chk_compromisos_monto_positivo CHECK (monto_comprometido_centavos > 0);

-- patrocinios
ALTER TABLE patrocinios ALTER COLUMN monto_mensual TYPE bigint USING ROUND(monto_mensual * 100)::bigint;
ALTER TABLE patrocinios RENAME COLUMN monto_mensual TO monto_mensual_centavos;

-- cierres_caja (total_general; por_metodo jsonb queda pendiente, ver nota arriba)
ALTER TABLE cierres_caja ALTER COLUMN total_general TYPE bigint USING ROUND(total_general * 100)::bigint;
ALTER TABLE cierres_caja RENAME COLUMN total_general TO total_general_centavos;
ALTER TABLE cierres_caja ALTER COLUMN total_general_centavos SET DEFAULT 0;

-- Vistas recreadas con las columnas nuevas
CREATE VIEW vw_ingresos_diarios AS
SELECT metodo_pago,
    count(id) AS cantidad_pagos,
    sum(monto_centavos) AS total_centavos,
    min(created_at) AS primer_pago,
    max(created_at) AS ultimo_pago
FROM pagos p
WHERE created_at::date = CURRENT_DATE
GROUP BY metodo_pago;

CREATE VIEW vw_mora_activa AS
SELECT c.id AS cuota_id,
    c.familia_id,
    c.alumno_id,
    c.concepto,
    c.monto_final_centavos,
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
    sum(c.monto_final_centavos) FILTER (WHERE c.estado = ANY (ARRAY['pendiente'::cuota_estado, 'vencida'::cuota_estado, 'en_mora'::cuota_estado])) AS saldo_pendiente_centavos,
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
