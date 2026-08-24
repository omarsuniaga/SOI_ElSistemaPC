-- vw_asistencias_consolidada mostraba "maestro_auxiliar" haciendo JOIN
-- contra clases.maestro_auxiliar_id, columna que en producción está SIEMPRE
-- vacía (0/36 clases, confirmado por consulta directa) — así que ningún
-- reporte de asistencia mostró jamás al suplente real de una clase, aunque
-- clases.maestro_suplente_id sí tiene datos (2 clases hoy).
--
-- El frontend ya trata maestro_auxiliar_id como alias/fallback de
-- maestro_suplente_id (src/modules/clases/models/clase.model.js), así que
-- repuntar el JOIN a la columna real y activa es el fix mínimo: no cambia
-- el nombre de columna que exponen la vista ni los consumidores
-- (asistenciasSupabase.js lee row.maestro_auxiliar → maestro_auxiliar_nombre),
-- solo corrige de dónde sale ese dato.
CREATE OR REPLACE VIEW public.vw_asistencias_consolidada AS
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
    COALESCE(NULLIF(TRIM(BOTH FROM sc.contenido), ''::text), sc.contenido_dsl) AS observacion_clase,
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
     LEFT JOIN maestros m2 ON m2.id = c.maestro_suplente_id
     LEFT JOIN asistencias a ON a.sesion_clase_id = sc.id
     LEFT JOIN alumnos al ON al.id = a.alumno_id
     LEFT JOIN justificaciones j ON j.sesion_id = sc.id
     LEFT JOIN alumnos al2 ON al2.id = j.alumno_id
  GROUP BY sc.id, sc.fecha, sc.clase_id, c.nombre, sc.hora_inicio, sc.hora_fin, sc.borrador, m1.nombre_completo, m2.nombre_completo, sc.contenido, sc.contenido_dsl, sc.salon_id;
