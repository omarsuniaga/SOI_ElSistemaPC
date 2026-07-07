-- Migration 007: Update teacher_class_fill_metrics_aggregated to show incomplete categories
-- Adds: incompleto_falta_asistencia, incompleto_falta_observaciones, incompleto_falta_ambos

DROP VIEW IF EXISTS teacher_class_fill_metrics_aggregated;
DROP VIEW IF EXISTS teacher_class_fill_metrics;

-- Detailed view: one row per session with fill behavior classification
CREATE OR REPLACE VIEW teacher_class_fill_metrics AS
SELECT
    sc.id AS sesion_id,
    sc.clase_id,
    sc.maestro_id,
    sc.fecha,
    sc.hora_inicio,
    sc.hora_fin,
    (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) AS asistencia_marked_at,
    os.first_note_at AS observaciones_first_at,
    os.last_note_at AS observaciones_last_at,
    os.ai_fill_at,
    CASE
        WHEN (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) IS NULL
             AND os.first_note_at IS NULL THEN 'falta_ambos'
        WHEN (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) IS NULL
             THEN 'falta_asistencia'
        WHEN os.first_note_at IS NULL THEN 'falta_observaciones'
        WHEN (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) < (os.first_note_at - interval '5 minutes') THEN 'asistencia_primero'
        WHEN os.first_note_at < ((SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) - interval '5 minutes') THEN 'observaciones_primero'
        ELSE 'casi_simultaneo'
    END AS orden_llenado,
    EXTRACT(epoch FROM (os.last_note_at - os.first_note_at)) AS duracion_observaciones_segundos,
    CASE
        WHEN (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) IS NULL THEN 'no_marcada'
        WHEN (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) < ((sc.fecha)::timestamp with time zone + (sc.hora_inicio)::interval) THEN 'antes_de_empezar'
        WHEN (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id) > ((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) THEN 'despues_de_terminar'
        ELSE 'durante_clase'
    END AS momento_asistencia,
    CASE
        WHEN os.first_note_at IS NULL THEN 'no_llena'
        WHEN os.last_note_at < ((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) THEN 'antes_de_terminar'
        WHEN os.last_note_at >= ((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval)
             AND os.last_note_at <= (((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) + interval '30 minutes') THEN 'inmediatamente_despues'
        WHEN os.last_note_at >= (((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) + interval '30 minutes')
             AND os.last_note_at <= (((sc.fecha)::timestamp with time zone + (sc.hora_fin)::interval) + interval '2 hours') THEN 'dentro_2_horas'
        ELSE 'mucho_despues'
    END AS momento_observaciones,
    CASE WHEN os.ai_fill_at IS NOT NULL THEN 'si' ELSE 'no' END AS uso_ai_fill,
    round(EXTRACT(epoch FROM (os.first_note_at - (SELECT max(a.marked_at) FROM asistencias a WHERE a.sesion_clase_id = sc.id))) / 60, 2) AS minutos_entre_asistencia_observaciones
FROM sesiones_clase sc
LEFT JOIN observaciones_sesion os ON os.sesion_id = sc.id
WHERE sc.estado <> 'borrador'
ORDER BY sc.fecha DESC, sc.hora_inicio DESC;

-- Aggregated view: one row per maestro with counts and averages
CREATE OR REPLACE VIEW teacher_class_fill_metrics_aggregated AS
SELECT
    m.id AS maestro_id,
    m.nombre_completo AS maestro_nombre,
    count(DISTINCT tcfm.sesion_id) AS total_clases,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE tcfm.orden_llenado = 'asistencia_primero') AS orden_asistencia_primero,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE tcfm.orden_llenado = 'observaciones_primero') AS orden_observaciones_primero,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE tcfm.orden_llenado = 'casi_simultaneo') AS orden_simultaneo,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE tcfm.orden_llenado = 'falta_asistencia') AS incompleto_falta_asistencia,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE tcfm.orden_llenado = 'falta_observaciones') AS incompleto_falta_observaciones,
    count(DISTINCT tcfm.sesion_id) FILTER (WHERE tcfm.orden_llenado = 'falta_ambos') AS incompleto_falta_ambos,
    round(avg(COALESCE(tcfm.duracion_observaciones_segundos, 0)), 1) AS promedio_duracion_observaciones,
    CASE
        WHEN count(DISTINCT tcfm.sesion_id) > 0
        THEN round((count(DISTINCT tcfm.sesion_id) FILTER (WHERE tcfm.ai_fill_at IS NOT NULL))::numeric / count(DISTINCT tcfm.sesion_id)::numeric * 100, 1)
        ELSE 0
    END AS uso_ai_fill_percent,
    max(tcfm.fecha) AS fecha_ultima_clase
FROM teacher_class_fill_metrics tcfm
LEFT JOIN maestros m ON m.id = tcfm.maestro_id
GROUP BY m.id, m.nombre_completo;
