-- 20260726_reporte_cierre_semestre.sql
-- Motor de datos del Informe Ejecutivo de Cierre de Semestre.
--
-- CONTEXTO / POR QUÉ ESTA MIGRACIÓN EXISTE
-- ----------------------------------------
-- El módulo de Períodos calculaba su auditoría agrupando por `sesiones_clase.maestro_id`.
-- Ese campo guarda al AUTOR del registro, no al docente de la clase: en producción las 52
-- sesiones quedaban atribuidas a una sola persona, mientras `clases.maestro_principal_id`
-- las reparte correctamente entre 7 maestros.
--
-- Esta RPC deriva la atribución docente por el camino correcto:
--     sesiones_clase.clase_id -> clases.maestro_principal_id
--
-- NO se reescribe `sesiones_clase.maestro_id`: ese dato es traza de auditoría legítima
-- (quién creó el registro) y pisarlo destruiría información. Se corrige la LECTURA.
--
-- REGLA DE DISEÑO: donde no hay evidencia, se devuelve el marcador 'SIN_DATOS' y el motivo.
-- Nunca 0 % ni 100 % por defecto. Un indicador que rellena huecos con un número redondo
-- es peor que un indicador ausente, porque se lee como un hecho.

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_reporte_cierre_semestre(
  p_periodo_id             uuid,
  -- Escala de `progresos.calificacion`. En producción los valores observados son 2..5,
  -- correlacionados con estado_cualitativo (INICIADO=2, LOGRADO=4): es una rúbrica 1-5,
  -- NO una nota sobre 10. Aplicar criterios_promocion.promedio_minimo (=7) directamente
  -- reprobaría al 100 % del alumnado. Por eso la escala es explícita y parametrizable.
  p_escala_calificacion    numeric DEFAULT 5,
  -- Umbral de aprobación expresado en % de la escala (70 % de 5 = 3.5).
  p_umbral_nota_pct        numeric DEFAULT 70,
  -- Umbral de asistencia. Coincide con niveles.criterios_promocion.asistencia_minima (75).
  p_umbral_asistencia_pct  numeric DEFAULT 75,
  -- Días de gracia para considerar "a tiempo" el registro de una asistencia.
  p_dias_gracia_registro   integer DEFAULT 2
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_periodo        record;
  v_fi             date;
  v_ff             date;
  v_resumen        jsonb;
  v_docentes       jsonb;
  v_clases         jsonb;
  v_asistencia     jsonb;
  v_riesgo         jsonb;
  v_promocion      jsonb;
  v_instrumentos   jsonb;
  v_brechas        jsonb;
  v_calidad        jsonb;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Período no encontrado: %', p_periodo_id;
  END IF;

  v_fi := v_periodo.fecha_inicio;
  v_ff := v_periodo.fecha_fin;

  -- ══════════════════════════════════════════════════════════════════════════
  -- Base común: sesiones del período CON atribución docente correcta.
  -- ══════════════════════════════════════════════════════════════════════════
  CREATE TEMP TABLE _ses ON COMMIT DROP AS
  SELECT
    s.id,
    s.fecha,
    s.clase_id,
    s.borrador,
    s.estado,
    s.emergente_id,
    s.contenido,
    s.observaciones_generales,
    c.nombre                 AS clase_nombre,
    c.instrumento,
    c.maestro_principal_id   AS maestro_id,   -- <- atribución correcta
    s.maestro_id             AS registrado_por_maestro_id
  FROM public.sesiones_clase s
  LEFT JOIN public.clases c ON c.id = s.clase_id
  WHERE s.fecha BETWEEN v_fi AND v_ff;

  -- Marcas de asistencia del período (fuente normalizada: tabla `asistencias`).
  CREATE TEMP TABLE _asis ON COMMIT DROP AS
  SELECT
    a.id,
    a.alumno_id,
    a.clase_id,
    a.sesion_clase_id,
    a.fecha,
    a.estado,
    a.marked_at,
    CASE
      WHEN a.marked_at IS NULL THEN NULL
      ELSE (a.marked_at AT TIME ZONE 'UTC')::date - a.fecha
    END AS dias_atraso_registro
  FROM public.asistencias a
  WHERE a.fecha BETWEEN v_fi AND v_ff;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 1. RESUMEN EJECUTIVO
  -- ══════════════════════════════════════════════════════════════════════════
  SELECT jsonb_build_object(
    'periodo', jsonb_build_object(
      'id', v_periodo.id,
      'nombre', v_periodo.nombre,
      'fecha_inicio', v_fi,
      'fecha_fin', v_ff,
      'activo', v_periodo.activo,
      'cerrado', v_periodo.cerrado,
      'cerrado_at', v_periodo.cerrado_at
    ),
    'clases_activas',        (SELECT count(*) FROM public.clases WHERE activo),
    'alumnos_activos',       (SELECT count(*) FROM public.alumnos WHERE activo),
    'maestros_activos',      (SELECT count(*) FROM public.maestros WHERE activo),
    'sesiones_periodo',      (SELECT count(*) FROM _ses),
    'sesiones_registradas',  (SELECT count(*) FROM _ses WHERE estado = 'registrada'),
    'sesiones_borrador',     (SELECT count(*) FROM _ses WHERE borrador IS TRUE),
    'sesiones_pendientes',   (SELECT count(*) FROM _ses WHERE estado = 'pendiente'),
    'sesiones_sin_clase',    (SELECT count(*) FROM _ses WHERE clase_id IS NULL),
    'marcas_asistencia',     (SELECT count(*) FROM _asis),
    'pct_cumplimiento_registro',
      CASE WHEN (SELECT count(*) FROM _ses) = 0 THEN NULL
           ELSE round(((SELECT count(*) FROM _ses WHERE estado = 'registrada')::numeric
                       / (SELECT count(*) FROM _ses)::numeric) * 100, 1)
      END
  ) INTO v_resumen;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 2. DESEMPEÑO DOCENTE  (atribución vía clases.maestro_principal_id)
  -- ══════════════════════════════════════════════════════════════════════════
  WITH por_maestro AS (
    SELECT
      m.id                                                             AS maestro_id,
      m.nombre_completo,
      m.especialidad,
      (SELECT count(*) FROM public.clases c
        WHERE c.maestro_principal_id = m.id AND c.activo)              AS clases_a_cargo,
      count(s.id)                                                      AS sesiones,
      count(s.id) FILTER (WHERE s.estado = 'registrada')               AS registradas,
      count(s.id) FILTER (WHERE s.borrador IS TRUE)                    AS borradores,
      count(s.id) FILTER (WHERE s.estado = 'pendiente')                AS pendientes,
      (SELECT count(*) FROM _asis a
        JOIN public.clases c2 ON c2.id = a.clase_id
        WHERE c2.maestro_principal_id = m.id)                          AS marcas_registradas,
      (SELECT count(*) FROM _asis a
        JOIN public.clases c2 ON c2.id = a.clase_id
        WHERE c2.maestro_principal_id = m.id
          AND a.dias_atraso_registro > p_dias_gracia_registro)         AS marcas_tardias,
      (SELECT round(avg(a.dias_atraso_registro), 1) FROM _asis a
        JOIN public.clases c2 ON c2.id = a.clase_id
        WHERE c2.maestro_principal_id = m.id
          AND a.dias_atraso_registro IS NOT NULL)                      AS dias_atraso_promedio
    FROM public.maestros m
    LEFT JOIN _ses s ON s.maestro_id = m.id
    WHERE m.activo
    GROUP BY m.id, m.nombre_completo, m.especialidad
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'maestro_id', maestro_id,
      'nombre', nombre_completo,
      'especialidad', especialidad,
      'clases_a_cargo', clases_a_cargo,
      'sesiones', sesiones,
      'registradas', registradas,
      'borradores', borradores,
      'pendientes', pendientes,
      'marcas_registradas', marcas_registradas,
      'marcas_tardias', marcas_tardias,
      'dias_atraso_promedio', dias_atraso_promedio,
      'pct_cumplimiento',
        CASE WHEN sesiones = 0 THEN NULL
             ELSE round((registradas::numeric / sesiones::numeric) * 100, 1) END,
      'pct_puntualidad',
        CASE WHEN marcas_registradas = 0 THEN NULL
             ELSE round(((marcas_registradas - marcas_tardias)::numeric
                         / marcas_registradas::numeric) * 100, 1) END,
      -- Un docente sin sesiones NO es un docente incumplidor: es un docente sin
      -- actividad registrada. Distinguirlo es la diferencia entre un diagnóstico
      -- y una acusación infundada.
      'estado_evaluacion',
        CASE WHEN clases_a_cargo = 0 AND sesiones = 0 THEN 'SIN_CLASES_ASIGNADAS'
             WHEN sesiones = 0                        THEN 'SIN_DATOS'
             ELSE 'EVALUABLE' END
    ) ORDER BY sesiones DESC, nombre_completo
  ), '[]'::jsonb) INTO v_docentes FROM por_maestro;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 3. CLASES
  -- ══════════════════════════════════════════════════════════════════════════
  WITH por_clase AS (
    SELECT
      c.id, c.nombre, c.instrumento, c.modalidad,
      m.nombre_completo AS maestro,
      (SELECT count(*) FROM public.alumnos_clases ac
        WHERE ac.clase_id = c.id AND ac.activo)          AS inscritos,
      (SELECT count(*) FROM _ses s WHERE s.clase_id = c.id) AS sesiones,
      (SELECT count(*) FROM _asis a WHERE a.clase_id = c.id) AS marcas,
      (SELECT count(*) FROM _asis a
        WHERE a.clase_id = c.id AND a.estado IN ('presente','justificado')) AS asistidas
    FROM public.clases c
    LEFT JOIN public.maestros m ON m.id = c.maestro_principal_id
    WHERE c.activo
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'clase_id', id, 'nombre', nombre, 'instrumento', instrumento,
      'modalidad', modalidad, 'maestro', maestro,
      'inscritos', inscritos, 'sesiones', sesiones, 'marcas', marcas,
      'tasa_asistencia',
        CASE WHEN marcas = 0 THEN NULL
             ELSE round((asistidas::numeric / marcas::numeric) * 100, 1) END,
      -- Señal de integridad: marcas que no cuadran con la matrícula.
      'alerta_reconciliacion',
        CASE WHEN inscritos = 0 AND marcas > 0 THEN 'MARCAS_SIN_MATRICULA'
             WHEN sesiones > 0 AND inscritos > 0
                  AND marcas > (sesiones * inscritos) THEN 'MARCAS_EXCEDEN_MATRICULA'
             WHEN sesiones > 0 AND marcas = 0        THEN 'SESIONES_SIN_ASISTENCIA'
             ELSE NULL END,
      'estado_evaluacion',
        CASE WHEN sesiones = 0 THEN 'SIN_DATOS' ELSE 'EVALUABLE' END
    ) ORDER BY sesiones DESC, inscritos DESC
  ), '[]'::jsonb) INTO v_clases FROM por_clase;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 4. ASISTENCIA ESTUDIANTIL
  -- ══════════════════════════════════════════════════════════════════════════
  SELECT jsonb_build_object(
    'total_marcas',   (SELECT count(*) FROM _asis),
    'presentes',      (SELECT count(*) FROM _asis WHERE estado = 'presente'),
    'ausentes',       (SELECT count(*) FROM _asis WHERE estado = 'ausente'),
    'justificados',   (SELECT count(*) FROM _asis WHERE estado = 'justificado'),
    'tasa_global',
      CASE WHEN (SELECT count(*) FROM _asis) = 0 THEN NULL
           ELSE round(((SELECT count(*) FROM _asis WHERE estado IN ('presente','justificado'))::numeric
                       / (SELECT count(*) FROM _asis)::numeric) * 100, 1) END,
    'marcas_tardias', (SELECT count(*) FROM _asis WHERE dias_atraso_registro > p_dias_gracia_registro),
    'pct_registro_puntual',
      CASE WHEN (SELECT count(*) FROM _asis WHERE dias_atraso_registro IS NOT NULL) = 0 THEN NULL
           ELSE round((((SELECT count(*) FROM _asis WHERE dias_atraso_registro IS NOT NULL)
                        - (SELECT count(*) FROM _asis WHERE dias_atraso_registro > p_dias_gracia_registro))::numeric
                       / (SELECT count(*) FROM _asis WHERE dias_atraso_registro IS NOT NULL)::numeric) * 100, 1) END,
    'por_dia_semana', (
      SELECT coalesce(jsonb_object_agg(dia, ausencias), '{}'::jsonb) FROM (
        SELECT to_char(fecha, 'ID') AS dia_num,
               CASE to_char(fecha, 'ID')
                 WHEN '1' THEN 'Lunes'   WHEN '2' THEN 'Martes'  WHEN '3' THEN 'Miércoles'
                 WHEN '4' THEN 'Jueves'  WHEN '5' THEN 'Viernes' WHEN '6' THEN 'Sábado'
                 ELSE 'Domingo' END AS dia,
               count(*) FILTER (WHERE estado = 'ausente') AS ausencias
        FROM _asis GROUP BY 1, 2
      ) d
    )
  ) INTO v_asistencia;

  -- Alumnos en riesgo por inasistencia (>25 % de ausencias, mínimo 3 marcas).
  WITH por_alumno AS (
    SELECT a.alumno_id, al.nombre_completo,
           count(*) AS total,
           count(*) FILTER (WHERE a.estado = 'ausente') AS ausencias
    FROM _asis a JOIN public.alumnos al ON al.id = a.alumno_id
    GROUP BY a.alumno_id, al.nombre_completo
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'alumno_id', alumno_id, 'nombre', nombre_completo,
      'total_marcas', total, 'ausencias', ausencias,
      'pct_ausencias', round((ausencias::numeric / total::numeric) * 100, 1)
    ) ORDER BY (ausencias::numeric / total::numeric) DESC
  ), '[]'::jsonb) INTO v_riesgo
  FROM por_alumno
  WHERE total >= 3 AND (ausencias::numeric / total::numeric) >= 0.25;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 5. PROMOCIÓN / REPITENCIA
  --
  -- ADVERTENCIA DE ESCALA: `progresos.calificacion` observado en 2..5 (rúbrica),
  -- mientras `niveles.criterios_promocion.promedio_minimo` vale 7 (escala 0-10).
  -- Se normaliza a porcentaje de la escala (p_escala_calificacion) para que ambos
  -- criterios sean comparables. El veredicto se emite como NO_PROMUEVE, nunca
  -- como "reprobado": la cobertura de datos no alcanza para una decisión final.
  -- ══════════════════════════════════════════════════════════════════════════
  WITH notas AS (
    SELECT p.alumno_id, round(avg(p.calificacion), 2) AS promedio, count(*) AS n_evals
    FROM public.progresos p
    WHERE p.calificacion IS NOT NULL
      AND p.fecha_evaluacion BETWEEN v_fi AND v_ff
    GROUP BY p.alumno_id
  ),
  asist AS (
    SELECT alumno_id, count(*) AS total,
           count(*) FILTER (WHERE estado IN ('presente','justificado')) AS asistidas
    FROM _asis GROUP BY alumno_id
  ),
  eval AS (
    SELECT
      al.id, al.nombre_completo, al.instrumento_principal, al.nivel,
      n.promedio, n.n_evals,
      a.total AS marcas, a.asistidas,
      CASE WHEN n.promedio IS NULL THEN NULL
           ELSE round((n.promedio / p_escala_calificacion) * 100, 1) END AS pct_nota,
      CASE WHEN a.total IS NULL OR a.total = 0 THEN NULL
           ELSE round((a.asistidas::numeric / a.total::numeric) * 100, 1) END AS pct_asistencia
    FROM public.alumnos al
    LEFT JOIN notas n ON n.alumno_id = al.id
    LEFT JOIN asist a ON a.alumno_id = al.id
    WHERE al.activo
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'alumno_id', id, 'nombre', nombre_completo,
      'instrumento', instrumento_principal, 'nivel', nivel,
      'promedio', promedio, 'n_evaluaciones', coalesce(n_evals, 0),
      'pct_nota', pct_nota,
      'marcas_asistencia', coalesce(marcas, 0), 'pct_asistencia', pct_asistencia,
      'veredicto',
        CASE
          WHEN promedio IS NULL AND pct_asistencia IS NULL THEN 'SIN_DATOS'
          WHEN promedio IS NULL                            THEN 'SIN_EVALUACION'
          WHEN pct_asistencia IS NULL                      THEN 'SIN_ASISTENCIA'
          WHEN pct_nota >= p_umbral_nota_pct
           AND pct_asistencia >= p_umbral_asistencia_pct    THEN 'PROMUEVE'
          ELSE 'NO_PROMUEVE'
        END,
      'motivo',
        CASE
          WHEN promedio IS NULL AND pct_asistencia IS NULL
            THEN 'Sin evaluaciones ni marcas de asistencia en el período'
          WHEN promedio IS NULL
            THEN 'Sin evaluaciones registradas en el período'
          WHEN pct_asistencia IS NULL
            THEN 'Sin marcas de asistencia en el período'
          WHEN pct_nota < p_umbral_nota_pct
           AND pct_asistencia < p_umbral_asistencia_pct
            THEN 'Rendimiento y asistencia por debajo del umbral'
          WHEN pct_nota < p_umbral_nota_pct
            THEN 'Rendimiento por debajo del umbral'
          WHEN pct_asistencia < p_umbral_asistencia_pct
            THEN 'Asistencia por debajo del umbral'
          ELSE 'Cumple ambos criterios'
        END
    ) ORDER BY
      CASE WHEN promedio IS NULL AND pct_asistencia IS NULL THEN 2 ELSE 1 END,
      pct_nota NULLS LAST
  ), '[]'::jsonb) INTO v_promocion FROM eval;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 6. INSTRUMENTOS
  -- ══════════════════════════════════════════════════════════════════════════
  SELECT jsonb_build_object(
    'total_activos', (SELECT count(*) FROM public.inventario_activos WHERE activo),
    'por_conservacion', (
      SELECT coalesce(jsonb_object_agg(coalesce(estado_conservacion,'sin_dato'), n), '{}'::jsonb)
      FROM (SELECT estado_conservacion, count(*) n FROM public.inventario_activos
            WHERE activo GROUP BY 1) x
    ),
    'por_uso', (
      SELECT coalesce(jsonb_object_agg(coalesce(estado_uso,'sin_dato'), n), '{}'::jsonb)
      FROM (SELECT estado_uso, count(*) n FROM public.inventario_activos
            WHERE activo GROUP BY 1) x
    ),
    'requieren_mantenimiento', (
      SELECT count(*) FROM public.inventario_activos
      WHERE activo AND (estado_conservacion IN ('mantenimiento','regular')
                        OR requiere_mantenimiento IS TRUE)),
    'dados_de_baja', (
      SELECT count(*) FROM public.inventario_activos WHERE estado_conservacion = 'de_baja'),
    'en_reparacion', (
      SELECT count(*) FROM public.inventario_activos WHERE estado_uso = 'en_reparacion'),
    'comodatos_activos', (
      SELECT count(*) FROM public.comodatos_activos WHERE estado = 'activo'),
    'alumnos_con_instrumento', (
      SELECT count(DISTINCT alumno_id) FROM public.comodatos_activos WHERE estado = 'activo'),
    'comodatos_vencidos', (
      SELECT count(*) FROM public.comodatos_activos
      WHERE estado = 'activo' AND fecha_vencimiento IS NOT NULL
        AND fecha_vencimiento < CURRENT_DATE),
    'comodatos_sin_contrato', (
      SELECT count(*) FROM public.comodatos_activos
      WHERE estado = 'activo'
        AND (contrato_firmado_url IS NULL OR contrato_firmado_url = '')),
    'detalle_mantenimiento', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'codigo', codigo_inventario, 'tipo', tipo_instrumento,
        'marca', marca, 'estado', estado_conservacion, 'ubicacion', ubicacion
      ) ORDER BY tipo_instrumento), '[]'::jsonb)
      FROM public.inventario_activos
      WHERE activo AND estado_conservacion IN ('mantenimiento','regular')),
    -- Historial de reparación: la tabla existe pero está vacía en producción.
    'historial_reparaciones',
      CASE WHEN (SELECT count(*) FROM public.inventario_reparaciones) = 0
           THEN jsonb_build_object('estado','SIN_DATOS',
                  'motivo','La tabla inventario_reparaciones no tiene registros: no hay trazabilidad de reparaciones, costos ni tiempos de taller')
           ELSE jsonb_build_object('estado','EVALUABLE',
                  'total',(SELECT count(*) FROM public.inventario_reparaciones))
      END
  ) INTO v_instrumentos;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 7. BRECHAS DE DATOS  (lo que el reporte NO puede afirmar, y por qué)
  -- ══════════════════════════════════════════════════════════════════════════
  SELECT jsonb_build_array(
    jsonb_build_object(
      'dimension','Asistencia del personal docente',
      'estado', CASE WHEN (SELECT count(*) FROM public.ausencias_maestros) = 0
                      AND (SELECT count(*) FROM public.ausencias) = 0
                     THEN 'SIN_DATOS' ELSE 'PARCIAL' END,
      'motivo','Las tablas ausencias_maestros y ausencias no tienen registros. No existe captura de presencia docente en el período.',
      'accion','Instrumentar el registro de asistencia del maestro para que el próximo cierre disponga del dato.'
    ),
    jsonb_build_object(
      'dimension','Criterio de promoción por nivel',
      'estado','PARCIAL',
      'motivo', format('clases.nivel_id está vacío en las %s clases activas, por lo que no puede resolverse el criterio de niveles.criterios_promocion por alumno. Se aplicó el umbral global de %s%% de la escala.',
                       (SELECT count(*) FROM public.clases WHERE activo), p_umbral_nota_pct),
      'accion','Poblar clases.nivel_id para que cada alumno se evalúe con el criterio de su nivel.'
    ),
    jsonb_build_object(
      'dimension','Escala de calificación',
      'estado','REQUIERE_VALIDACION',
      'motivo', format('progresos.calificacion se observa en el rango %s..%s (rúbrica), mientras niveles.criterios_promocion.promedio_minimo vale 7 sobre escala 0-10. El reporte normalizó sobre escala %s.',
                       (SELECT min(calificacion) FROM public.progresos WHERE calificacion IS NOT NULL),
                       (SELECT max(calificacion) FROM public.progresos WHERE calificacion IS NOT NULL),
                       p_escala_calificacion),
      'accion','Confirmar la escala institucional antes de emitir veredictos de promoción como definitivos.'
    ),
    jsonb_build_object(
      'dimension','Cobertura del alumnado',
      'estado','PARCIAL',
      'motivo', format('De %s alumnos activos, %s tienen marcas de asistencia y %s tienen evaluaciones en el período.',
                       (SELECT count(*) FROM public.alumnos WHERE activo),
                       (SELECT count(DISTINCT alumno_id) FROM _asis),
                       (SELECT count(DISTINCT alumno_id) FROM public.progresos
                         WHERE fecha_evaluacion BETWEEN v_fi AND v_ff)),
      'accion','El reporte solo describe a la fracción del alumnado con evidencia registrada.'
    ),
    jsonb_build_object(
      'dimension','Atribución docente de sesiones',
      'estado','CORREGIDA_EN_LECTURA',
      'motivo', format('sesiones_clase.maestro_id atribuye %s de %s sesiones del período a un único usuario (el creador del registro). Este informe atribuye por clases.maestro_principal_id.',
                       (SELECT count(*) FROM _ses s
                         WHERE s.registrado_por_maestro_id = (
                           SELECT registrado_por_maestro_id FROM _ses
                           GROUP BY registrado_por_maestro_id ORDER BY count(*) DESC LIMIT 1)),
                       (SELECT count(*) FROM _ses)),
      'accion','Corregir el guardado de sesiones para registrar al docente de la clase, además del autor.'
    )
  ) INTO v_brechas;

  -- Divergencia entre las dos fuentes de asistencia (tabla vs jsonb en sesiones_clase).
  SELECT jsonb_build_object(
    'marcas_tabla_asistencias', (SELECT count(*) FROM _asis),
    'marcas_jsonb_sesiones', (
      SELECT coalesce(sum(jsonb_array_length(s.asistencia)), 0)
      FROM public.sesiones_clase s
      WHERE s.fecha BETWEEN v_fi AND v_ff
        AND s.asistencia IS NOT NULL
        AND jsonb_typeof(s.asistencia) = 'array'),
    'nota','sesiones_clase.asistencia mezcla códigos P/A/J con etiquetas largas y nulos; la tabla asistencias usa presente/ausente/justificado. El informe usa la tabla como fuente única.'
  ) INTO v_calidad;

  RETURN jsonb_build_object(
    'meta', jsonb_build_object(
      'generado_en', now(),
      'version', '1.0',
      'parametros', jsonb_build_object(
        'escala_calificacion', p_escala_calificacion,
        'umbral_nota_pct', p_umbral_nota_pct,
        'umbral_asistencia_pct', p_umbral_asistencia_pct,
        'dias_gracia_registro', p_dias_gracia_registro
      )
    ),
    'resumen', v_resumen,
    'docentes', v_docentes,
    'clases', v_clases,
    'asistencia', v_asistencia,
    'alumnos_riesgo', v_riesgo,
    'promocion', v_promocion,
    'promocion_totales', (
      SELECT jsonb_object_agg(veredicto, n) FROM (
        SELECT e->>'veredicto' AS veredicto, count(*) AS n
        FROM jsonb_array_elements(v_promocion) e GROUP BY 1
      ) t
    ),
    'instrumentos', v_instrumentos,
    'brechas', v_brechas,
    'calidad_datos', v_calidad
  );
END;
$function$;

COMMENT ON FUNCTION public.fn_reporte_cierre_semestre IS
  'Informe ejecutivo de cierre de semestre. Atribuye sesiones por clases.maestro_principal_id (no por sesiones_clase.maestro_id, que guarda al autor del registro). Devuelve SIN_DATOS explícito donde no hay evidencia, nunca 0 % ni 100 % por defecto.';

REVOKE ALL ON FUNCTION public.fn_reporte_cierre_semestre FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_reporte_cierre_semestre TO authenticated, service_role;

COMMIT;
