-- Migration: 20260915100001_fix_vw_asistencias_emergente.sql
-- Date: 2026-09-15
-- Purpose: Extend vw_asistencias_consolidada to include emergente_id classification
--
-- IMPORTANT: This migration extends the existing view WITHOUT breaking downstream consumers.
-- It adds three new columns:
--   - emergente_id: references to the institutional activity (if any)
--   - es_justificada_por_emergente: boolean flag indicating justification by activity
--   - tiene_confirmacion_si: boolean flag indicating maestro confirmation = 'si'
--
-- The original columns remain unchanged. All existing reports/views that reference
-- the old columns will continue to work.

CREATE OR REPLACE VIEW public."vw_asistencias_consolidada" AS
SELECT sc.id AS sesion_clase_id,
    sc.fecha,
    sc.clase_id,
    c.nombre AS nombre_clase,
    sc.hora_inicio,
    sc.hora_fin,
    sc.borrador,
    m1.nombre_completo AS maestro_principal,
    m2.nombre_completo AS maestro_auxiliar,
    ( SELECT os.contenido_raw
           FROM observaciones_sesion os
          WHERE (os.sesion_id = sc.id)
          ORDER BY os.created_at DESC
         LIMIT 1) AS observacion_sesion,
    COALESCE(NULLIF(TRIM(BOTH FROM sc.contenido), ''::text), sc.contenido_dsl) AS observacion_clase,
    count(*) FILTER (WHERE (a.estado = 'presente'::text)) AS presentes,
    count(*) FILTER (WHERE (a.estado = 'ausente'::text)) AS ausentes,
    count(*) FILTER (WHERE (a.estado = 'justificado'::text)) AS justificados,
    count(DISTINCT a.alumno_id) AS total_registros,
    COALESCE(json_agg(json_build_object('alumno_id', a.alumno_id, 'alumno_nombre', al.nombre_completo, 'estado', a.estado, 'observacion', a.observaciones) ORDER BY al.nombre_completo) FILTER (WHERE (a.alumno_id IS NOT NULL)), '[]'::json) AS asistencias_detalle,
    COALESCE(json_agg(json_build_object('alumno_id', j.alumno_id, 'alumno_nombre', al2.nombre_completo, 'razon', j.motivo, 'fecha_razon', j.created_at) ORDER BY al2.nombre_completo) FILTER (WHERE (j.alumno_id IS NOT NULL)), '[]'::json) AS justificaciones_detalle,
    sc.salon_id,
    -- FASE 2 NEW COLUMNS: Emergente ID Classification
    sc.emergente_id,
    CASE
        WHEN sc.emergente_id IS NOT NULL THEN true
        ELSE false
    END AS es_justificada_por_emergente,
    CASE
        WHEN sc.emergente_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM confirmaciones_emergentes ce
                WHERE ce.actividad_id = sc.emergente_id
                    AND ce.maestro_id = c.maestro_principal_id
                    AND ce.respuesta = 'si'
                    AND ce.estado_validacion = 'validado'
            )
        THEN true
        ELSE false
    END AS tiene_confirmacion_si
   FROM (((((((sesiones_clase sc
     LEFT JOIN clases c ON ((c.id = sc.clase_id)))
     LEFT JOIN maestros m1 ON ((m1.id = c.maestro_principal_id)))
     LEFT JOIN maestros m2 ON ((m2.id = c.maestro_suplente_id)))
     LEFT JOIN asistencias a ON ((a.sesion_clase_id = sc.id)))
     LEFT JOIN alumnos al ON ((al.id = a.alumno_id)))
     LEFT JOIN justificaciones j ON ((j.sesion_id = sc.id)))
     LEFT JOIN alumnos al2 ON ((al2.id = j.alumno_id)))
  GROUP BY sc.id, sc.fecha, sc.clase_id, c.nombre, sc.hora_inicio, sc.hora_fin, sc.borrador,
           m1.nombre_completo, m2.nombre_completo, sc.contenido, sc.contenido_dsl, sc.salon_id, sc.emergente_id;
