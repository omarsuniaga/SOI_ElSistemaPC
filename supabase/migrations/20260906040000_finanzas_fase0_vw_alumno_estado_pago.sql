-- ==============================================================================
-- Migración: 20260905040000_finanzas_fase0_vw_alumno_estado_pago.sql
-- Módulo 1: Cobro de Mensualidades — Fase 0
-- Propósito: Vista de lectura unificada para búsqueda en ventanilla (#/cobro).
--            Resuelve contacto con fallback y calcula saldo/mora consolidado.
--
-- Revisión 2026-09-06: `security_invoker = true` — sin esto la vista corre con
-- privilegios del owner y saltea el RLS de representantes/cuotas/pagos, dejando
-- que cualquier usuario autenticado (maestros incluidos) lea cédulas de
-- representantes y el estado financiero de todos los alumnos. Con invoker, un
-- maestro ve los alumnos (alumnos_read_all) pero sin contacto ni saldos; solo
-- admin/finanzas ven la vista completa (políticas *_select_cajero_admin ya existen).
-- ==============================================================================

CREATE OR REPLACE VIEW public.vw_alumno_estado_pago
WITH (security_invoker = true) AS
WITH cuotas_resumen AS (
  SELECT
    c.alumno_id,
    c.familia_id,
    COUNT(*) FILTER (
      WHERE c.estado IN ('pendiente', 'vencida', 'en_mora')
    ) AS cuotas_pendientes_count,
    COUNT(*) FILTER (
      WHERE c.estado IN ('pendiente', 'vencida', 'en_mora') 
        AND c.fecha_vencimiento < CURRENT_DATE
    ) AS cuotas_vencidas_count,
    COALESCE(
      SUM(c.monto_final_centavos - c.monto_pagado_centavos) FILTER (
        WHERE c.estado IN ('pendiente', 'vencida', 'en_mora')
      ), 
      0
    ) AS saldo_pendiente_centavos,
    MIN(c.fecha_vencimiento) FILTER (
      WHERE c.estado IN ('pendiente', 'vencida', 'en_mora')
    ) AS fecha_mas_antigua_vencida
  FROM public.cuotas c
  GROUP BY c.alumno_id, c.familia_id
),
representante_pagador AS (
  -- Obtener el representante principal por familia, priorizando los marcados como es_pagador
  SELECT DISTINCT ON (r.familia_id)
    r.familia_id,
    r.nombre,
    r.cedula,
    r.telefono_whatsapp,
    r.email
  FROM public.representantes r
  WHERE r.activo = true
  ORDER BY r.familia_id, r.es_pagador DESC NULLS LAST, r.created_at ASC
)
SELECT
  a.id AS alumno_id,
  a.nombre_completo AS alumno_nombre,
  a.instrumento_principal,
  COALESCE(a.activo, false) AS alumno_activo,
  COALESCE(a.exento_mensualidad, false) AS exento_mensualidad,
  f.id AS familia_id,
  COALESCE(f.nombre_familia, 'Sin Familia') AS nombre_familia,
  
  -- Fallback en cascada de contacto:
  -- 1) Tabla representantes (si está registrado)
  -- 2) Campos directos de representante en alumnos
  -- 3) Datos de la madre
  -- 4) Datos del padre
  COALESCE(
    NULLIF(TRIM(rp.nombre), ''),
    NULLIF(TRIM(a.representante_nombre), ''),
    NULLIF(TRIM(a.madre_nombre), ''),
    NULLIF(TRIM(a.padre_nombre), ''),
    'Representante no registrado'
  ) AS contacto_nombre,
  
  COALESCE(
    NULLIF(TRIM(rp.cedula), ''),
    NULLIF(TRIM(a.representante_cedula), ''),
    NULLIF(TRIM(a.madre_cedula), ''),
    NULLIF(TRIM(a.padre_cedula), ''),
    ''
  ) AS contacto_cedula,
  
  COALESCE(
    NULLIF(TRIM(rp.telefono_whatsapp), ''),
    NULLIF(TRIM(a.representante_tlf), ''),
    NULLIF(TRIM(a.madre_tlf_whatsapp), ''),
    NULLIF(TRIM(a.padre_tlf_whatsapp), ''),
    NULLIF(TRIM(a.tlf_alumno), ''),
    ''
  ) AS contacto_telefono,
  
  COALESCE(
    NULLIF(TRIM(rp.email), ''),
    NULLIF(TRIM(a.correo_representante), ''),
    ''
  ) AS contacto_email,

  COALESCE(cr.cuotas_pendientes_count, 0) AS cuotas_pendientes_count,
  COALESCE(cr.cuotas_vencidas_count, 0) AS cuotas_vencidas_count,
  COALESCE(cr.saldo_pendiente_centavos, 0) AS saldo_pendiente_centavos,
  cr.fecha_mas_antigua_vencida,

  -- Badge semafórico del estado financiero del alumno
  CASE
    WHEN COALESCE(a.exento_mensualidad, false) = true THEN 'exento'
    WHEN COALESCE(cr.cuotas_vencidas_count, 0) > 0 THEN 'mora'
    WHEN COALESCE(cr.cuotas_pendientes_count, 0) > 0 THEN 'debe'
    ELSE 'al_dia'
  END AS estado_pago

FROM public.alumnos a
LEFT JOIN public.familias f ON f.id = a.familia_id
LEFT JOIN representante_pagador rp ON rp.familia_id = a.familia_id
LEFT JOIN cuotas_resumen cr ON cr.alumno_id = a.id;

COMMENT ON VIEW public.vw_alumno_estado_pago IS 'Modelo de lectura consolidado para cobro en ventanilla con fallback de representante y cálculo de saldos/mora';

GRANT SELECT ON public.vw_alumno_estado_pago TO authenticated;
