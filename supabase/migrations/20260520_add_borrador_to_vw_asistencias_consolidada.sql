-- Migration: Add borrador field to vw_asistencias_consolidada view
-- Purpose: Include borrador status to filter out incomplete/abandoned draft sessions
-- Date: 2026-05-20

-- Drop the old view
DROP VIEW IF EXISTS vw_asistencias_consolidada CASCADE;

-- Recreate with borrador field
CREATE OR REPLACE VIEW vw_asistencias_consolidada AS
SELECT
  sc.id as sesion_clase_id,
  sc.fecha,
  sc.clase_id,
  c.nombre as nombre_clase,
  sc.hora_inicio,
  sc.hora_fin,
  sc.borrador,
  m1.nombre as maestro_principal,
  m2.nombre as maestro_auxiliar,
  -- Observations from observaciones_sesion (most recent)
  (
    SELECT contenido_raw
    FROM observaciones_sesion os
    WHERE os.sesion_id = sc.id
    ORDER BY os.created_at DESC
    LIMIT 1
  ) as observacion_sesion,
  -- Legacy observation (from sesiones_clase)
  sc.contenido_dsl as observacion_clase,
  -- Attendance counts using FILTER
  COUNT(*) FILTER (WHERE a.estado = 'presente') as presentes,
  COUNT(*) FILTER (WHERE a.estado = 'ausente') as ausentes,
  COUNT(*) FILTER (WHERE a.estado = 'justificado') as justificados,
  COUNT(DISTINCT a.alumno_id) as total_registros,
  -- JSON aggregation of attendance details
  COALESCE(
    json_agg(
      json_build_object(
        'alumno_id', a.alumno_id,
        'alumno_nombre', al.nombre,
        'estado', a.estado,
        'observacion', a.observacion
      ) ORDER BY al.nombre
    ) FILTER (WHERE a.alumno_id IS NOT NULL),
    '[]'::json
  ) as asistencias_detalle,
  -- JSON aggregation of justifications
  COALESCE(
    json_agg(
      json_build_object(
        'alumno_id', j.alumno_id,
        'alumno_nombre', al2.nombre,
        'razon', j.razon,
        'fecha_razon', j.fecha_razon
      ) ORDER BY al2.nombre
    ) FILTER (WHERE j.alumno_id IS NOT NULL),
    '[]'::json
  ) as justificaciones_detalle
FROM
  sesiones_clase sc
  LEFT JOIN clases c ON c.id = sc.clase_id
  LEFT JOIN maestros m1 ON m1.id = c.maestro_principal_id
  LEFT JOIN maestros m2 ON m2.id = c.maestro_auxiliar_id
  LEFT JOIN asistencias a ON a.sesion_clase_id = sc.id
  LEFT JOIN alumnos al ON al.id = a.alumno_id
  LEFT JOIN justificaciones j ON j.sesion_clase_id = sc.id
  LEFT JOIN alumnos al2 ON al2.id = j.alumno_id
GROUP BY
  sc.id,
  sc.fecha,
  sc.clase_id,
  c.nombre,
  sc.hora_inicio,
  sc.hora_fin,
  sc.borrador,
  m1.nombre,
  m2.nombre,
  sc.contenido_dsl;
