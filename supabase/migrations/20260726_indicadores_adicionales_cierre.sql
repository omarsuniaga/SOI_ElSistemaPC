-- 20260726_indicadores_adicionales_cierre.sql
--
-- Los cuatro indicadores propuestos para enriquecer el informe ejecutivo:
--   1. Índice de retención / cohesión estudiantil
--   2. Distribución del avance pedagógico
--   3. Registro de contingencias y suplencias
--   4. Justificaciones por causal
--
-- Se implementan como función SEPARADA del reporte principal, por dos razones:
--   · El reporte núcleo describe lo ocurrido; esto describe la CAPACIDAD de medirlo.
--     Mezclarlos haría que un hueco de instrumentación se lea como un resultado.
--   · Ninguno de los cuatro tiene hoy datos suficientes. Cada bloque devuelve su
--     propio `estado` (SIN_DATOS / PARCIAL / EVALUABLE) con el motivo y la acción
--     pendiente, y empieza a reportar solo cuando la institución registra.
--
-- Ninguno requiere tablas nuevas: historial_estado_alumno, clases_emergentes e
-- indicator_attempts ya existen. Están vacíos por falta de adopción, no de código.

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_reporte_indicadores_adicionales(
  p_periodo_id uuid,
  -- Cobertura mínima (% del alumnado con evidencia) para considerar un indicador
  -- representativo. Por debajo se marca PARCIAL: el número existe pero no describe
  -- al conjunto, y presentarlo como institucional sería una extrapolación indebida.
  p_cobertura_minima_pct numeric DEFAULT 30
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
  v_alumnos_tot    integer;
  v_retencion      jsonb;
  v_avance         jsonb;
  v_contingencias  jsonb;
  v_justif         jsonb;
  v_asis_docente   jsonb;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Periodo no encontrado: %', p_periodo_id;
  END IF;

  v_fi := v_periodo.fecha_inicio;
  v_ff := v_periodo.fecha_fin;
  SELECT count(*) INTO v_alumnos_tot FROM public.alumnos;

  -- ════════════════════════════════════════════════════════════════════════
  -- 1. RETENCIÓN / COHESIÓN ESTUDIANTIL
  --
  -- Una tasa de retención exige conocer las BAJAS. `historial_estado_alumno`
  -- registra los cambios de `alumnos.activo` mediante trg_historial_estado_alumno,
  -- que ya existe. Si esa tabla está vacía y no hay ningún alumno inactivo, no hay
  -- retención que calcular: el cociente daría 100 % de forma permanente, en todo
  -- período y para siempre. Eso no es una métrica, es una constante disfrazada.
  -- ════════════════════════════════════════════════════════════════════════
  WITH mov AS (
    SELECT count(*) FILTER (WHERE fecha BETWEEN v_fi AND v_ff) AS eventos_periodo,
           count(*)                                            AS eventos_total
    FROM public.historial_estado_alumno
  ),
  base AS (
    SELECT
      count(*) FILTER (WHERE fecha_ingreso IS NOT NULL AND fecha_ingreso <= v_ff) AS ingresados_hasta_cierre,
      count(*) FILTER (WHERE fecha_ingreso BETWEEN v_fi AND v_ff)                 AS ingresos_en_periodo,
      count(*) FILTER (WHERE activo IS TRUE)                                      AS activos,
      count(*) FILTER (WHERE activo IS NOT TRUE)                                  AS inactivos
    FROM public.alumnos
  )
  SELECT CASE
    WHEN (SELECT eventos_total FROM mov) = 0 AND (SELECT inactivos FROM base) = 0 THEN
      jsonb_build_object(
        'estado','SIN_DATOS',
        'motivo', format('No hay bajas registradas: los %s alumnos figuran como activos y historial_estado_alumno no tiene eventos. Una tasa de retencion sobre estos datos daria 100 %% de forma permanente.', v_alumnos_tot),
        'accion','Registrar las bajas marcando alumnos.activo = false. El trigger trg_historial_estado_alumno ya existe y captura el evento automaticamente.',
        'matricula_activa', (SELECT activos FROM base))
    ELSE
      jsonb_build_object(
        'estado', CASE WHEN (SELECT eventos_periodo FROM mov) = 0 THEN 'PARCIAL' ELSE 'EVALUABLE' END,
        'matricula_inicial', (SELECT ingresados_hasta_cierre FROM base),
        'ingresos_en_periodo', (SELECT ingresos_en_periodo FROM base),
        'activos_al_cierre', (SELECT activos FROM base),
        'bajas_acumuladas', (SELECT inactivos FROM base),
        'eventos_en_periodo', (SELECT eventos_periodo FROM mov),
        'tasa_retencion_pct',
          CASE WHEN (SELECT ingresados_hasta_cierre FROM base) = 0 THEN NULL
               ELSE round(((SELECT activos FROM base)::numeric
                           / (SELECT ingresados_hasta_cierre FROM base)::numeric) * 100, 1) END)
  END INTO v_retencion;

  -- ════════════════════════════════════════════════════════════════════════
  -- 2. DISTRIBUCIÓN DEL AVANCE PEDAGÓGICO
  -- ════════════════════════════════════════════════════════════════════════
  WITH att AS (
    SELECT ia.student_id, ia.status, ia.nota, al.instrumento_principal
    FROM public.indicator_attempts ia
    JOIN public.alumnos al ON al.id = ia.student_id
    WHERE ia.covered_date BETWEEN v_fi AND v_ff
  ),
  cob AS (
    SELECT count(DISTINCT student_id) AS alumnos_cubiertos, count(*) AS intentos,
           min(1) AS dummy FROM att
  )
  SELECT CASE
    WHEN (SELECT intentos FROM cob) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','No hay registros en indicator_attempts dentro del periodo.',
        'accion','Promover el uso del mapa de indicadores en el Portal de Maestros.')
    WHEN (SELECT alumnos_cubiertos FROM cob)::numeric / nullif(v_alumnos_tot,0) * 100 < p_cobertura_minima_pct THEN
      jsonb_build_object('estado','PARCIAL',
        'motivo', format('Solo %s de %s alumnos (%s %%) tienen indicadores evaluados en el periodo. Por debajo del %s %% de cobertura el dato no describe al conjunto.',
          (SELECT alumnos_cubiertos FROM cob), v_alumnos_tot,
          round((SELECT alumnos_cubiertos FROM cob)::numeric / nullif(v_alumnos_tot,0) * 100, 1),
          p_cobertura_minima_pct),
        'accion','Ampliar la evaluacion por indicadores antes de reportar avance curricular institucional.',
        'alumnos_cubiertos', (SELECT alumnos_cubiertos FROM cob),
        'intentos', (SELECT intentos FROM cob),
        'por_instrumento', (SELECT coalesce(jsonb_object_agg(coalesce(instrumento_principal,'sin_dato'), n), '{}'::jsonb)
                            FROM (SELECT instrumento_principal, count(*) n FROM att GROUP BY 1) x))
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'alumnos_cubiertos', (SELECT alumnos_cubiertos FROM cob),
        'intentos', (SELECT intentos FROM cob),
        'por_instrumento', (SELECT coalesce(jsonb_object_agg(coalesce(instrumento_principal,'sin_dato'), n), '{}'::jsonb)
                            FROM (SELECT instrumento_principal, count(*) n FROM att GROUP BY 1) x),
        'por_status', (SELECT coalesce(jsonb_object_agg(coalesce(status,'sin_dato'), n), '{}'::jsonb)
                       FROM (SELECT status, count(*) n FROM att GROUP BY 1) x))
  END INTO v_avance;

  -- ════════════════════════════════════════════════════════════════════════
  -- 3. CONTINGENCIAS Y SUPLENCIAS
  -- ════════════════════════════════════════════════════════════════════════
  WITH em AS (
    SELECT count(*) n FROM public.clases_emergentes WHERE fecha BETWEEN v_fi AND v_ff),
  sup AS (
    SELECT count(*) n FROM public.asistencia_maestros
     WHERE fecha BETWEEN v_fi AND v_ff AND estado = 'suplencia'),
  ses_em AS (
    SELECT count(*) n FROM public.sesiones_clase
     WHERE fecha BETWEEN v_fi AND v_ff AND emergente_id IS NOT NULL)
  SELECT CASE
    WHEN (SELECT n FROM em) = 0 AND (SELECT n FROM sup) = 0 AND (SELECT n FROM ses_em) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','clases_emergentes no tiene registros en el periodo y no hay suplencias cargadas en asistencia_maestros.',
        'accion','Registrar clases emergentes y suplencias docentes para dimensionar la contingencia operativa.')
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'clases_emergentes', (SELECT n FROM em),
        'sesiones_marcadas_emergentes', (SELECT n FROM ses_em),
        'suplencias_docentes', (SELECT n FROM sup))
  END INTO v_contingencias;

  -- ════════════════════════════════════════════════════════════════════════
  -- 4. JUSTIFICACIONES POR CAUSAL
  --
  -- `motivo` es texto libre y no admite agregación. La columna `categoria`
  -- (vocabulario controlado) se agregó para esto. Mientras esté sin poblar,
  -- las filas se reportan como SIN_CLASIFICAR: nunca se infiere la causal
  -- a partir del texto.
  -- ════════════════════════════════════════════════════════════════════════
  WITH j AS (
    SELECT categoria, estado FROM public.justificaciones
     WHERE fecha BETWEEN v_fi AND v_ff)
  SELECT CASE
    WHEN (SELECT count(*) FROM j) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','No hay justificaciones registradas en el periodo.',
        'accion','Sin accion: la ausencia de justificaciones puede ser correcta.')
    WHEN (SELECT count(*) FROM j WHERE categoria IS NOT NULL) = 0 THEN
      jsonb_build_object('estado','PARCIAL',
        'total', (SELECT count(*) FROM j),
        'sin_clasificar', (SELECT count(*) FROM j),
        'motivo','Ninguna justificacion tiene causal normalizada. El campo motivo es texto libre y no se infiere la categoria a partir de el.',
        'accion','Clasificar las justificaciones con el campo categoria para habilitar el desglose por causal.',
        'por_estado_revision', (SELECT coalesce(jsonb_object_agg(coalesce(estado,'sin_dato'), n), '{}'::jsonb)
                                FROM (SELECT estado, count(*) n FROM j GROUP BY 1) x))
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'total', (SELECT count(*) FROM j),
        'sin_clasificar', (SELECT count(*) FROM j WHERE categoria IS NULL),
        'por_causal', (SELECT coalesce(jsonb_object_agg(coalesce(categoria,'SIN_CLASIFICAR'), n), '{}'::jsonb)
                       FROM (SELECT categoria, count(*) n FROM j GROUP BY 1) x),
        'por_estado_revision', (SELECT coalesce(jsonb_object_agg(coalesce(estado,'sin_dato'), n), '{}'::jsonb)
                                FROM (SELECT estado, count(*) n FROM j GROUP BY 1) x))
  END INTO v_justif;

  -- ════════════════════════════════════════════════════════════════════════
  -- 5. ASISTENCIA DEL PERSONAL DOCENTE
  -- ════════════════════════════════════════════════════════════════════════
  WITH am AS (
    SELECT am.maestro_id, m.nombre_completo, am.estado
    FROM public.asistencia_maestros am
    JOIN public.maestros m ON m.id = am.maestro_id
    WHERE am.fecha BETWEEN v_fi AND v_ff)
  SELECT CASE
    WHEN (SELECT count(*) FROM am) = 0 THEN
      jsonb_build_object('estado','SIN_DATOS',
        'motivo','La tabla asistencia_maestros no tiene registros en el periodo. La captura de presencia docente fue habilitada en esta version y comienza a acumular desde ahora.',
        'accion','Registrar la presencia docente por sesion para que el proximo cierre disponga del indicador.')
    ELSE
      jsonb_build_object('estado','EVALUABLE',
        'total_registros', (SELECT count(*) FROM am),
        'por_estado', (SELECT coalesce(jsonb_object_agg(estado, n), '{}'::jsonb)
                       FROM (SELECT estado, count(*) n FROM am GROUP BY 1) x),
        'por_maestro', (SELECT coalesce(jsonb_agg(jsonb_build_object(
              'maestro', nombre_completo, 'registros', n, 'presentes', p,
              'pct_presencia', CASE WHEN n = 0 THEN NULL ELSE round((p::numeric/n::numeric)*100,1) END)
            ORDER BY nombre_completo), '[]'::jsonb)
          FROM (SELECT nombre_completo, count(*) n,
                       count(*) FILTER (WHERE estado IN ('presente','tardanza')) p
                FROM am GROUP BY 1) y))
  END INTO v_asis_docente;

  RETURN jsonb_build_object(
    'meta', jsonb_build_object(
      'generado_en', now(), 'version','1.0',
      'periodo_id', p_periodo_id,
      'cobertura_minima_pct', p_cobertura_minima_pct),
    'retencion', v_retencion,
    'avance_pedagogico', v_avance,
    'contingencias', v_contingencias,
    'justificaciones', v_justif,
    'asistencia_docente', v_asis_docente
  );
END;
$function$;

COMMENT ON FUNCTION public.fn_reporte_indicadores_adicionales IS
  'Indicadores complementarios del informe de cierre. Cada bloque declara su propio estado (SIN_DATOS / PARCIAL / EVALUABLE) con motivo y accion pendiente, y comienza a reportar cuando la institucion registra el dato. Nunca infiere ni rellena.';

REVOKE ALL ON FUNCTION public.fn_reporte_indicadores_adicionales FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_reporte_indicadores_adicionales TO authenticated, service_role;

COMMIT;
