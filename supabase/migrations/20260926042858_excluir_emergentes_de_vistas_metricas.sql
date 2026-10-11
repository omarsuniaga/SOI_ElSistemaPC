-- Auditoría de consumidores de sesiones_clase (pedida tras el bug de
-- "Feriado" contaminando obtenerEstadoCumplimientoMaestro): dos vistas SQL
-- también cuentan sesiones_clase.clase_id IS NULL (declaraciones de "clase
-- emergente" tipo feriado, no una clase real) como si fueran clases
-- dictadas, distorsionando índices comparativos entre maestros.

-- vw_indice_ensenanza_guiada: una fila emergente nunca puede tener un
-- evaluacion_indicador que la matchee (ei.clase_id = sc.clase_id con
-- sc.clase_id NULL nunca es verdadero en SQL), así que cada "Feriado"
-- penaliza el índice del maestro como si fuera una clase sin evaluar —
-- exactamente lo que el comentario original del archivo decía querer evitar
-- para sesiones sin dictar, pero sin cubrir este otro caso.
CREATE OR REPLACE VIEW vw_indice_ensenanza_guiada AS
SELECT
  sc.maestro_id,
  count(DISTINCT sc.id)::integer AS total_sesiones,
  count(DISTINCT sc.id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM evaluacion_indicador ei
      WHERE ei.clase_id = sc.clase_id
        AND ei.maestro_indicador_id IS NOT NULL
        AND ei.fecha_evaluacion::date = sc.fecha
    )
  )::integer AS sesiones_con_indicador,
  ROUND(
    count(DISTINCT sc.id) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM evaluacion_indicador ei
        WHERE ei.clase_id = sc.clase_id
          AND ei.maestro_indicador_id IS NOT NULL
          AND ei.fecha_evaluacion::date = sc.fecha
      )
    )::numeric / NULLIF(count(DISTINCT sc.id), 0),
    4
  ) AS indice
FROM sesiones_clase sc
WHERE sc.estado = 'registrada'
  AND sc.clase_id IS NOT NULL
GROUP BY sc.maestro_id;

-- teacher_class_fill_metrics(_aggregated): total_clases y el resto de
-- categorías de "orden de llenado" por maestro no deben incluir
-- declaraciones de clase emergente, que no son una clase real dictada.
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
  AND sc.clase_id IS NOT NULL
ORDER BY sc.fecha DESC, sc.hora_inicio DESC;

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
