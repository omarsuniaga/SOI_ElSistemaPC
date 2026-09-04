-- ============================================================================
-- vw_seguimiento_ausentes v3:
--  - el contador se cuenta por MES CALENDARIO en curso (se renueva cada mes).
--  - se elimina sesiones_ausente; se agrega dias_clase (dias con clase del mes)
--    y mes_nombre. La relacion es dias_ausente / dias_clase (ej. 4/6).
--  - seguimiento_reglas.config.periodo pasa a 'mensual'.
-- DROP + CREATE porque cambia la lista de columnas. Aplicado a zmhmdvmyeyswunurcyow.
-- ============================================================================

DROP VIEW IF EXISTS public.vw_seguimiento_ausentes;

CREATE VIEW public.vw_seguimiento_ausentes
WITH (security_invoker = false) AS
WITH periodo_activo AS (
  SELECT id, nombre FROM public.periodos WHERE activo = true ORDER BY fecha_inicio DESC LIMIT 1
),
regla AS (
  SELECT
    COALESCE((config->>'nivel1')::int, 1) AS n1,
    COALESCE((config->>'nivel2')::int, 2) AS n2,
    COALESCE((config->>'nivel3')::int, 3) AS n3
  FROM public.seguimiento_reglas
  WHERE tipo = 'ausentismo_acumulado' AND activo
  LIMIT 1
),
corte AS (
  SELECT alumno_id, MAX(f) AS fr FROM (
    SELECT alumno_id, fecha_reincorporacion AS f
      FROM public.retenciones_instrumento WHERE fecha_reincorporacion IS NOT NULL
    UNION ALL
    SELECT alumno_id, fecha_corte FROM public.seguimiento_ausencias_reinicio
  ) x
  GROUP BY alumno_id
),
dias AS (
  SELECT
    ast.alumno_id,
    COUNT(DISTINCT ast.fecha) FILTER (
      WHERE ast.estado = 'ausente'
        AND NOT EXISTS (
          SELECT 1 FROM public.asistencias p
          WHERE p.alumno_id = ast.alumno_id AND p.fecha = ast.fecha AND p.estado = 'presente'
        )
    ) AS dias_ausente,
    COUNT(DISTINCT ast.fecha) AS dias_clase,
    MAX(ast.fecha) FILTER (WHERE ast.estado = 'ausente') AS ultima_ausencia_fecha
  FROM public.asistencias ast
  LEFT JOIN corte r ON r.alumno_id = ast.alumno_id
  WHERE date_trunc('month', ast.fecha) = date_trunc('month', CURRENT_DATE)
    AND (r.fr IS NULL OR ast.fecha > r.fr::date)
  GROUP BY ast.alumno_id
)
SELECT
  a.id                       AS alumno_id,
  a.nombre_completo          AS alumno_nombre,
  a.instrumento_principal,
  cls.clase_nombres,
  cls.maestro_id,
  cls.maestro_nombre,
  d.dias_ausente,
  d.dias_clase,
  d.ultima_ausencia_fecha,
  CASE
    WHEN d.dias_ausente >= (SELECT n3 FROM regla) THEN 3
    WHEN d.dias_ausente >= (SELECT n2 FROM regla) THEN 2
    WHEN d.dias_ausente >= (SELECT n1 FROM regla) THEN 1
    ELSE 0
  END                        AS nivel,
  ctc.contacto_nombre,
  ctc.contacto_telefono,
  ctc.contacto_origen,
  seg.ultimo_seguimiento_nivel,
  seg.ultimo_seguimiento_fecha,
  seg.ultimo_seguimiento_resultado,
  COALESCE(ret.retencion_activa, false) AS retencion_activa,
  (SELECT id FROM periodo_activo)       AS periodo_id,
  (SELECT nombre FROM periodo_activo)   AS periodo_nombre,
  to_char(CURRENT_DATE, 'FMMonth YYYY') AS mes_nombre
FROM public.alumnos a
JOIN dias d ON d.alumno_id = a.id AND d.dias_ausente >= 1
LEFT JOIN LATERAL (
  SELECT
    string_agg(DISTINCT c.nombre, ', ') AS clase_nombres,
    (array_agg(COALESCE(c.maestro_principal_id, c.maestro_id) ORDER BY c.nombre))[1] AS maestro_id,
    (array_agg(m.nombre_completo ORDER BY c.nombre))[1] AS maestro_nombre
  FROM public.alumnos_clases ac
  JOIN public.clases c ON c.id = ac.clase_id
  LEFT JOIN public.maestros m ON m.id = COALESCE(c.maestro_principal_id, c.maestro_id)
  WHERE ac.alumno_id = a.id AND COALESCE(ac.activo, true)
) cls ON true
LEFT JOIN LATERAL (
  SELECT
    s.contacto_nombre,
    public.normalizar_tel_rd(s.contacto_telefono) AS contacto_telefono,
    s.contacto_origen
  FROM (
    SELECT r.nombre AS contacto_nombre, r.telefono_whatsapp AS contacto_telefono, 'representante_alumno'::text AS contacto_origen, 1 AS ord
      FROM public.representantes r WHERE r.alumno_id = a.id
    UNION ALL SELECT r.nombre, r.telefono_whatsapp, 'representante_familia', 2
      FROM public.representantes r WHERE r.familia_id = a.familia_id
    UNION ALL SELECT a.representante_nombre, a.representante_tlf, 'alumnos_representante_tlf', 3
    UNION ALL SELECT a.madre_nombre, a.madre_tlf_whatsapp, 'alumnos_madre_tlf_whatsapp', 4
    UNION ALL SELECT a.padre_nombre, a.padre_tlf_whatsapp, 'alumnos_padre_tlf_whatsapp', 5
    UNION ALL SELECT a.familiar_nombre, a.familiar_telefono, 'alumnos_familiar_telefono', 6
    UNION ALL SELECT a.contacto_emergencia_nombre, a.contacto_emergencia_telefono, 'alumnos_contacto_emergencia_telefono', 7
  ) s
  WHERE public.normalizar_tel_rd(s.contacto_telefono) IS NOT NULL
  ORDER BY s.ord
  LIMIT 1
) ctc ON true
LEFT JOIN LATERAL (
  SELECT cs.nivel AS ultimo_seguimiento_nivel, cs.fecha AS ultimo_seguimiento_fecha, cs.resultado AS ultimo_seguimiento_resultado
  FROM public.comunicaciones_seguimiento cs
  WHERE cs.alumno_id = a.id AND cs.origen = 'ausentismo'
  ORDER BY cs.fecha DESC
  LIMIT 1
) seg ON true
LEFT JOIN LATERAL (
  SELECT true AS retencion_activa
  FROM public.retenciones_instrumento ri
  WHERE ri.alumno_id = a.id AND ri.estado = 'retenido'
  LIMIT 1
) ret ON true
WHERE a.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM public.alumno_suspensiones sp
    WHERE sp.alumno_id = a.id
      AND sp.estado = 'activa'
      AND CURRENT_DATE >= sp.desde
      AND (sp.hasta IS NULL OR CURRENT_DATE <= sp.hasta)
  );

COMMENT ON VIEW public.vw_seguimiento_ausentes IS
  'Una fila por alumno activo con >=1 dia de ausencia injustificada en el MES CALENDARIO en curso (el contador se renueva cada mes). dias_ausente / dias_clase = faltas sobre dias con clase del mes. security_invoker=false.';

GRANT SELECT ON public.vw_seguimiento_ausentes TO authenticated;

UPDATE public.seguimiento_reglas
SET config = config || '{"periodo":"mensual"}'::jsonb, updated_at = now()
WHERE tipo = 'ausentismo_acumulado';

-- ROLLBACK: restaurar 20260904120500_seguimiento_ausentes_view_v2.sql y
--   UPDATE seguimiento_reglas SET config = config || '{"periodo":"academico"}'::jsonb WHERE tipo='ausentismo_acumulado';
