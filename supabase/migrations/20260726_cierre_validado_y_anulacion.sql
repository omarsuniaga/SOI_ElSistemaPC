-- 20260726_cierre_validado_y_anulacion.sql
--
-- 1. Semáforo de completitud previo al cierre formal del período.
-- 2. Cierre con bloqueo por defecto y excepción justificada.
-- 3. Anulación retroactiva de sesiones generadas en días no lectivos.
--
-- CRITERIO DE "EN VERDE" (definido con la coordinación)
-- -----------------------------------------------------
-- Una sesión está completa si tiene marcas de asistencia y no quedó en borrador.
-- Es el mínimo verificable y el único con datos confiables hoy: exigir además
-- observaciones o indicadores evaluados bloquearía el cierre casi siempre, porque
-- la cobertura de indicadores ronda el 4,5 % del alumnado.
--
-- Sólo se evalúan las sesiones en días lectivos. Una sesión creada durante un
-- receso no es deuda del maestro y no puede impedir un cierre.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. SEMÁFORO DE CIERRE
-- ══════════════════════════════════════════════════════════════════════════════
-- Implementada en SQL puro con CTEs, no en plpgsql con tablas temporales: una
-- validación de solo lectura no necesita materializar nada, y declararla STABLE
-- permite al planificador reutilizar el resultado dentro de una misma consulta.
-- (Un primer intento con CREATE TEMP TABLE falló: PostgreSQL no admite DDL en
-- funciones no volátiles, y marcarla VOLATILE sólo habría escondido el exceso.)
CREATE OR REPLACE FUNCTION public.fn_validar_cierre_periodo(p_periodo_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH periodo AS (
    SELECT * FROM public.periodos WHERE id = p_periodo_id
  ),
  ses AS (
    SELECT
      s.id, s.fecha, s.borrador, s.estado,
      c.nombre AS clase_nombre,
      c.maestro_principal_id AS maestro_id,
      m.nombre_completo AS maestro_nombre,
      EXISTS (SELECT 1 FROM public.asistencias a WHERE a.sesion_clase_id = s.id) AS tiene_asistencia
    FROM public.sesiones_clase s
    CROSS JOIN periodo p
    LEFT JOIN public.clases   c ON c.id = s.clase_id
    LEFT JOIN public.maestros m ON m.id = c.maestro_principal_id
    WHERE s.fecha BETWEEN p.fecha_inicio AND p.fecha_fin
      AND s.estado <> 'cancelada'
      AND public.fn_es_dia_lectivo(s.fecha)
  ),
  tot AS (
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE tiene_asistencia AND borrador IS NOT TRUE)::int AS completas
    FROM ses
  )
  SELECT jsonb_build_object(
    'periodo', jsonb_build_object(
      'id', p.id, 'nombre', p.nombre,
      'fecha_inicio', p.fecha_inicio, 'fecha_fin', p.fecha_fin,
      'cerrado', p.cerrado),
    'criterio', 'Sesion completa = tiene marcas de asistencia y no esta en borrador. Solo se evaluan dias lectivos.',
    'total_sesiones', t.total,
    'completas', t.completas,
    'incompletas', t.total - t.completas,
    'pct_completitud',
      CASE WHEN t.total = 0 THEN NULL
           ELSE round((t.completas::numeric / t.total::numeric) * 100, 1) END,
    -- Un período sin sesiones lectivas no está "en verde": está vacío. Distinguirlo
    -- evita cerrar por descuido un período que nunca se operó.
    'puede_cerrar', (t.total > 0 AND t.completas = t.total),
    'semaforo',
      CASE WHEN t.total = 0 THEN 'SIN_SESIONES'
           WHEN t.completas = t.total THEN 'VERDE'
           WHEN t.completas::numeric / t.total::numeric >= 0.9 THEN 'AMARILLO'
           ELSE 'ROJO' END,
    'por_maestro', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'maestro_id', maestro_id,
          'maestro', coalesce(maestro_nombre, 'Sin docente asignado'),
          'total', n, 'completas', ok, 'incompletas', n - ok,
          'pct', CASE WHEN n = 0 THEN NULL ELSE round((ok::numeric/n::numeric)*100,1) END
        ) ORDER BY (n - ok) DESC, maestro_nombre), '[]'::jsonb)
      FROM (SELECT maestro_id, maestro_nombre, count(*)::int n,
                   count(*) FILTER (WHERE tiene_asistencia AND borrador IS NOT TRUE)::int ok
            FROM ses GROUP BY 1,2) x),
    'sesiones_incompletas', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'sesion_id', id, 'fecha', fecha, 'clase', clase_nombre,
          'maestro', coalesce(maestro_nombre, 'Sin docente asignado'),
          'estado', estado, 'borrador', borrador,
          'falta', CASE WHEN NOT tiene_asistencia THEN 'asistencia'
                        WHEN borrador IS TRUE THEN 'confirmacion'
                        ELSE 'otro' END
        ) ORDER BY fecha), '[]'::jsonb)
      FROM ses
      WHERE NOT (tiene_asistencia AND borrador IS NOT TRUE))
  )
  FROM periodo p CROSS JOIN tot t;
$function$;

COMMENT ON FUNCTION public.fn_validar_cierre_periodo IS
  'Semaforo de completitud previo al cierre. Solo evalua sesiones en dias lectivos: una sesion en receso no bloquea el cierre. Implementada con CTEs: una validacion de solo lectura no necesita tablas temporales.';

REVOKE ALL ON FUNCTION public.fn_validar_cierre_periodo(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_validar_cierre_periodo(uuid) TO authenticated, service_role;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. CIERRE CON VALIDACIÓN Y EXCEPCIÓN JUSTIFICADA
--
-- Se reemplaza la función existente en vez de crear una segunda: dos rutas de
-- cierre conviviendo garantizan que tarde o temprano alguien use la que no valida.
-- La firma anterior se conserva y sólo se agrega p_forzar con valor por defecto,
-- de modo que las llamadas con parámetros nombrados siguen funcionando.
-- ══════════════════════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.fn_cerrar_periodo_academico(uuid, date, date, uuid, text);

CREATE OR REPLACE FUNCTION public.fn_cerrar_periodo_academico(
  p_periodo_id     uuid,
  p_fecha_inicio   date DEFAULT NULL,
  p_fecha_fin      date DEFAULT NULL,
  p_cerrado_por    uuid DEFAULT NULL,
  p_observaciones  text DEFAULT NULL,
  p_forzar         boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_periodo      record;
  v_fecha_inicio date;
  v_fecha_fin    date;
  v_validacion   jsonb;
  v_snapshot     jsonb;
  v_resumen      jsonb;
  v_result       jsonb;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Periodo no encontrado';
  END IF;

  IF v_periodo.cerrado THEN
    RAISE EXCEPTION 'El periodo ya esta cerrado';
  END IF;

  v_fecha_inicio := coalesce(p_fecha_inicio, v_periodo.fecha_inicio);
  v_fecha_fin    := coalesce(p_fecha_fin,    v_periodo.fecha_fin);

  -- Puerta de completitud. Bloquea por defecto; sólo cede ante una justificación
  -- escrita, que queda archivada en la auditoría junto al detalle de lo que faltaba.
  v_validacion := public.fn_validar_cierre_periodo(p_periodo_id);

  IF NOT (v_validacion->>'puede_cerrar')::boolean THEN
    IF NOT p_forzar THEN
      RAISE EXCEPTION 'No se puede cerrar: % de % sesiones sin registro completo (semaforo %). Corrija los registros o cierre con justificacion.',
        v_validacion->>'incompletas', v_validacion->>'total_sesiones', v_validacion->>'semaforo';
    END IF;

    IF p_observaciones IS NULL OR btrim(p_observaciones) = '' THEN
      RAISE EXCEPTION 'El cierre forzado requiere una justificacion escrita.';
    END IF;
  END IF;

  SELECT jsonb_build_object(
    'totalClases', count(distinct sc.clase_id),
    'totalSesiones', count(*),
    'totalAsistencias', count(a.id),
    'totalPresentes', count(a.id) filter (where a.estado = 'presente'),
    'totalAusentes', count(a.id) filter (where a.estado = 'ausente'),
    'totalJustificados', count(a.id) filter (where a.estado = 'justificado'),
    'tasaGlobalAsistencia',
      case when count(a.id) > 0 then
        round(((count(a.id) filter (where a.estado in ('presente','justificado')))::numeric
               / count(a.id)::numeric) * 100, 2)
      else null end
  )
  INTO v_resumen
  FROM public.sesiones_clase sc
  LEFT JOIN public.asistencias a ON a.sesion_clase_id = sc.id
  WHERE sc.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND sc.estado <> 'cancelada';

  SELECT jsonb_build_object(
    'resumen', v_resumen,
    'validacion', v_validacion,
    'cierre_forzado', NOT (v_validacion->>'puede_cerrar')::boolean,
    'clases', coalesce(jsonb_agg(distinct jsonb_build_object(
      'clase_id', sc.clase_id, 'sesion_id', sc.id,
      'fecha', sc.fecha, 'estado', sc.estado)), '[]'::jsonb)
  )
  INTO v_snapshot
  FROM public.sesiones_clase sc
  WHERE sc.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND sc.estado <> 'cancelada';

  UPDATE public.periodos
     SET cerrado = true,
         cerrado_at = now(),
         cerrado_por = p_cerrado_por,
         observaciones_cierre = p_observaciones,
         updated_at = now()
   WHERE id = p_periodo_id;

  INSERT INTO public.periodos_cierre_auditoria (
    periodo_id, fecha_inicio, fecha_fin, cerrado_por, observaciones, resumen, snapshot
  ) VALUES (
    p_periodo_id, v_fecha_inicio, v_fecha_fin, p_cerrado_por, p_observaciones,
    v_resumen, v_snapshot
  )
  RETURNING jsonb_build_object(
    'ok', true,
    'periodo_id', periodo_id,
    'snapshot_id', id,
    'fecha_inicio', fecha_inicio,
    'fecha_fin', fecha_fin,
    'forzado', NOT (v_validacion->>'puede_cerrar')::boolean,
    'validacion', v_validacion
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

COMMENT ON FUNCTION public.fn_cerrar_periodo_academico IS
  'Cierra un periodo tras validar completitud. Bloquea por defecto; p_forzar exige justificacion escrita, que se archiva junto al detalle de lo faltante.';

REVOKE ALL ON FUNCTION public.fn_cerrar_periodo_academico(uuid, date, date, uuid, text, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_cerrar_periodo_academico(uuid, date, date, uuid, text, boolean) TO authenticated, service_role;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. ANULACIÓN DE SESIONES EN DÍAS NO LECTIVOS
--
-- Reutiliza el estado 'cancelada', que ya existe en el CHECK de sesiones_clase, en
-- lugar de introducir un vocabulario nuevo. El registro no se borra: queda la traza
-- de que la sesión existió y el motivo por el que se anuló.
--
-- SALVAGUARDA: nunca anula una sesión que tenga marcas de asistencia. Si alguien
-- registró asistencia, la clase ocurrió de verdad y el calendario es lo que está
-- mal, no el dato. Borrar evidencia para que cuadre un calendario es exactamente
-- al revés.
--
-- Modo simulación por defecto: informa qué haría sin tocar nada.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_anular_sesiones_no_lectivas(
  p_dry_run boolean DEFAULT true,
  p_desde   date DEFAULT NULL,
  p_hasta   date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_candidatas jsonb;
  v_total      integer;
  v_protegidas integer;
  v_afectadas  integer := 0;
BEGIN
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Operacion no autorizada: se requiere rol administrador';
  END IF;

  DROP TABLE IF EXISTS _anul;
  CREATE TEMP TABLE _anul ON COMMIT DROP AS
  SELECT s.id, s.fecha, s.estado, s.clase_id,
         EXISTS (SELECT 1 FROM public.asistencias a WHERE a.sesion_clase_id = s.id) AS tiene_asistencia,
         public.fn_estado_calendario(s.fecha)->>'motivo'  AS motivo_calendario,
         public.fn_estado_calendario(s.fecha)->>'detalle' AS detalle_calendario
  FROM public.sesiones_clase s
  WHERE NOT public.fn_es_dia_lectivo(s.fecha)
    AND s.estado <> 'cancelada'
    AND (p_desde IS NULL OR s.fecha >= p_desde)
    AND (p_hasta IS NULL OR s.fecha <= p_hasta);

  SELECT count(*), count(*) FILTER (WHERE tiene_asistencia)
    INTO v_total, v_protegidas FROM _anul;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'sesion_id', id, 'fecha', fecha, 'estado_actual', estado,
      'motivo_calendario', motivo_calendario, 'detalle', detalle_calendario,
      'accion', CASE WHEN tiene_asistencia THEN 'PROTEGIDA_TIENE_ASISTENCIA'
                     ELSE 'SE_ANULA' END
    ) ORDER BY fecha), '[]'::jsonb)
  INTO v_candidatas FROM _anul;

  IF NOT p_dry_run THEN
    UPDATE public.sesiones_clase s
       SET estado = 'cancelada',
           motivo = coalesce(s.motivo || ' | ', '')
                    || 'Anulada: dia no lectivo (' || a.detalle_calendario || ')',
           updated_at = now()
      FROM _anul a
     WHERE s.id = a.id
       AND NOT a.tiene_asistencia;
    GET DIAGNOSTICS v_afectadas = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'dry_run', p_dry_run,
    'candidatas', v_total,
    'protegidas_con_asistencia', v_protegidas,
    'anulables', v_total - v_protegidas,
    'anuladas', v_afectadas,
    'detalle', v_candidatas
  );
END;
$function$;

COMMENT ON FUNCTION public.fn_anular_sesiones_no_lectivas IS
  'Marca cancelada las sesiones en dias no lectivos. Nunca toca sesiones con asistencia registrada: si hubo asistencia la clase ocurrio y el calendario es lo que esta mal. Simulacion por defecto.';

REVOKE ALL ON FUNCTION public.fn_anular_sesiones_no_lectivas(boolean, date, date) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_anular_sesiones_no_lectivas(boolean, date, date) TO authenticated, service_role;

COMMIT;
