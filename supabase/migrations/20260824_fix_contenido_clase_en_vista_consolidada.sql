-- Migration: corregir la fuente del contenido de clase en vw_asistencias_consolidada
-- Fecha: 2026-08-24
--
-- PROBLEMA
-- La vista exponía `observacion_clase` desde `sc.contenido_dsl`, columna que nunca se
-- escribió: 0 de 142 sesiones tienen valor. El maestro escribe realmente en
-- `sc.contenido` (95 de 142 sesiones). Resultado: el contenido pedagógico registrado
-- por los maestros era invisible en todos los reportes de asistencia.
--
-- SOLUCIÓN
-- `observacion_clase` pasa a leer `sc.contenido`, con fallback a `sc.contenido_dsl`
-- para cualquier fila histórica que la tuviera. Se agrega `salon_id` al final para
-- que la planilla pueda mostrar el lugar de la clase.
--
-- Efecto medido tras aplicar: sesiones no-borrador con contenido visible 0 -> 86 (de 103).
--
-- NOTA IMPORTANTE SOBRE LA MIGRACIÓN ANTERIOR
-- `20260520_add_borrador_to_vw_asistencias_consolidada.sql` NO refleja la vista real en
-- producción: referencia columnas inexistentes (`justificaciones.sesion_clase_id`,
-- `j.razon`, `j.fecha_razon`, `maestros.nombre`, `alumnos.nombre`, `asistencias.observacion`).
-- Ese archivo falla si se ejecuta. La definición de abajo se obtuvo con pg_get_viewdef()
-- sobre la base real y usa los nombres correctos (`sesion_id`, `motivo`, `created_at`,
-- `nombre_completo`, `observaciones`).
--
-- Se usa CREATE OR REPLACE (sin DROP CASCADE) para preservar permisos y RLS.
-- `salon_id` va al final porque CREATE OR REPLACE solo admite columnas nuevas al final.

CREATE OR REPLACE VIEW vw_asistencias_consolidada AS
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
          WHERE os.sesion_id = sc.id
          ORDER BY os.created_at DESC
         LIMIT 1) AS observacion_sesion,
    -- FIX: antes era `sc.contenido_dsl` (siempre NULL)
    COALESCE(NULLIF(TRIM(sc.contenido), ''::text), sc.contenido_dsl) AS observacion_clase,
    count(*) FILTER (WHERE a.estado = 'presente'::text) AS presentes,
    count(*) FILTER (WHERE a.estado = 'ausente'::text) AS ausentes,
    count(*) FILTER (WHERE a.estado = 'justificado'::text) AS justificados,
    count(DISTINCT a.alumno_id) AS total_registros,
    COALESCE(json_agg(json_build_object('alumno_id', a.alumno_id, 'alumno_nombre', al.nombre_completo, 'estado', a.estado, 'observacion', a.observaciones) ORDER BY al.nombre_completo) FILTER (WHERE a.alumno_id IS NOT NULL), '[]'::json) AS asistencias_detalle,
    COALESCE(json_agg(json_build_object('alumno_id', j.alumno_id, 'alumno_nombre', al2.nombre_completo, 'razon', j.motivo, 'fecha_razon', j.created_at) ORDER BY al2.nombre_completo) FILTER (WHERE j.alumno_id IS NOT NULL), '[]'::json) AS justificaciones_detalle,
    sc.salon_id
   FROM sesiones_clase sc
     LEFT JOIN clases c ON c.id = sc.clase_id
     LEFT JOIN maestros m1 ON m1.id = c.maestro_principal_id
     LEFT JOIN maestros m2 ON m2.id = c.maestro_auxiliar_id
     LEFT JOIN asistencias a ON a.sesion_clase_id = sc.id
     LEFT JOIN alumnos al ON al.id = a.alumno_id
     LEFT JOIN justificaciones j ON j.sesion_id = sc.id
     LEFT JOIN alumnos al2 ON al2.id = j.alumno_id
  GROUP BY sc.id, sc.fecha, sc.clase_id, c.nombre, sc.hora_inicio, sc.hora_fin,
           sc.borrador, m1.nombre_completo, m2.nombre_completo,
           sc.contenido, sc.contenido_dsl, sc.salon_id;
