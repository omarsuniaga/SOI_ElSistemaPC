-- Vigencia explícita sin backfill destructivo; created_at es el límite por defecto.
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS fecha_inicio date;
ALTER TABLE public.clase_horarios ADD COLUMN IF NOT EXISTS vigente_desde date;
ALTER TABLE public.clase_horarios ADD COLUMN IF NOT EXISTS vigente_hasta date;
ALTER TABLE public.clase_horarios ADD CONSTRAINT clase_horarios_validity_check
  CHECK (vigente_hasta IS NULL OR vigente_desde IS NULL OR vigente_hasta >= vigente_desde);

-- policy:exento-institucion_id razón: tabla hija de clases/maestros; hereda el alcance institucional del modelo legado, sin inventar un tenant.
-- Primera fila: administrador académico al resolver el primer caso tras publicar la UI.
CREATE TABLE public.registro_exoneraciones (
  -- policy:exento-institucion_id razón: hija de clases/maestros, hereda el alcance legado.
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id uuid NOT NULL REFERENCES public.clases(id),
  maestro_id uuid NOT NULL REFERENCES public.maestros(id),
  fecha date NOT NULL,
  alcance text NOT NULL CHECK (alcance IN ('asistencia','contenido','ambos')),
  motivo text NOT NULL CHECK (length(trim(motivo)) BETWEEN 10 AND 2000),
  creado_por uuid NOT NULL REFERENCES auth.users(id),
  creado_en timestamptz NOT NULL DEFAULT now(),
  revocado_por uuid REFERENCES auth.users(id),
  revocado_en timestamptz,
  motivo_revocacion text,
  CHECK ((revocado_en IS NULL AND revocado_por IS NULL AND motivo_revocacion IS NULL)
    OR (revocado_en IS NOT NULL AND revocado_por IS NOT NULL AND length(trim(motivo_revocacion)) BETWEEN 10 AND 2000))
);
CREATE UNIQUE INDEX registro_exoneraciones_active_key ON public.registro_exoneraciones(clase_id, maestro_id, fecha, alcance) WHERE revocado_en IS NULL;
CREATE INDEX registro_exoneraciones_lookup ON public.registro_exoneraciones(maestro_id, fecha);
ALTER TABLE public.registro_exoneraciones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.registro_exoneraciones FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.registro_exoneraciones TO authenticated;
GRANT ALL ON public.registro_exoneraciones TO service_role;
CREATE POLICY record_exemptions_read ON public.registro_exoneraciones FOR SELECT TO authenticated
 USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.maestros m WHERE m.id=maestro_id AND m.user_id=auth.uid()));
CREATE POLICY record_exemptions_insert ON public.registro_exoneraciones FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY record_exemptions_update ON public.registro_exoneraciones FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE FUNCTION public.guard_record_exemption() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(),false) THEN
    RAISE EXCEPTION 'Solo un administrador puede exonerar o revocar registros' USING ERRCODE='42501';
  END IF;
  IF TG_OP='INSERT' THEN
    IF NEW.fecha > (now() AT TIME ZONE 'America/Santo_Domingo')::date THEN RAISE EXCEPTION 'No se pueden exonerar fechas futuras'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.clases c LEFT JOIN public.clase_horarios h ON h.clase_id=c.id
      WHERE c.id=NEW.clase_id AND NEW.maestro_id IN (c.maestro_principal_id,c.maestro_suplente_id,c.maestro_id,h.maestro_id)) THEN
      RAISE EXCEPTION 'La clase no está asignada al maestro';
    END IF;
    NEW.creado_por:=auth.uid(); NEW.creado_en:=now();
    NEW.revocado_por:=NULL; NEW.revocado_en:=NULL; NEW.motivo_revocacion:=NULL;
  ELSE
    IF OLD.revocado_en IS NOT NULL OR NEW.motivo_revocacion IS NULL THEN RAISE EXCEPTION 'La exoneración solo admite una revocación con motivo'; END IF;
    IF (to_jsonb(NEW)-ARRAY['revocado_por','revocado_en','motivo_revocacion']) IS DISTINCT FROM
       (to_jsonb(OLD)-ARRAY['revocado_por','revocado_en','motivo_revocacion']) THEN RAISE EXCEPTION 'No se puede modificar la evidencia original'; END IF;
    NEW.revocado_por:=auth.uid(); NEW.revocado_en:=now();
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_record_exemption() FROM PUBLIC;
CREATE TRIGGER guard_record_exemption BEFORE INSERT OR UPDATE ON public.registro_exoneraciones FOR EACH ROW EXECUTE FUNCTION public.guard_record_exemption();

CREATE FUNCTION public.guard_class_validity() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE changed boolean;
BEGIN
  IF TG_TABLE_NAME='clases' THEN
    changed := CASE WHEN TG_OP='INSERT' THEN NEW.fecha_inicio IS NOT NULL ELSE NEW.fecha_inicio IS DISTINCT FROM OLD.fecha_inicio OR NEW.created_at IS DISTINCT FROM OLD.created_at END;
  ELSE
    changed := CASE WHEN TG_OP='INSERT' THEN NEW.vigente_desde IS NOT NULL OR NEW.vigente_hasta IS NOT NULL ELSE
      NEW.vigente_desde IS DISTINCT FROM OLD.vigente_desde OR NEW.vigente_hasta IS DISTINCT FROM OLD.vigente_hasta OR NEW.created_at IS DISTINCT FROM OLD.created_at END;
  END IF;
  IF changed AND NOT COALESCE(public.is_admin(),false) AND COALESCE(auth.jwt()->>'role','') <> 'service_role' THEN
    RAISE EXCEPTION 'Solo administración puede ajustar la vigencia' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_class_validity() FROM PUBLIC;
CREATE TRIGGER guard_class_validity BEFORE INSERT OR UPDATE ON public.clases FOR EACH ROW EXECUTE FUNCTION public.guard_class_validity();
CREATE TRIGGER guard_schedule_validity BEFORE INSERT OR UPDATE ON public.clase_horarios FOR EACH ROW EXECUTE FUNCTION public.guard_class_validity();

CREATE FUNCTION public.save_class_validity(p_clase_id uuid,p_fecha_inicio date,p_horarios jsonb) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE item jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(),false) THEN RAISE EXCEPTION 'Solo administración puede ajustar la vigencia' USING ERRCODE='42501'; END IF;
  UPDATE public.clases SET fecha_inicio=p_fecha_inicio WHERE id=p_clase_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Clase no encontrada'; END IF;
  FOR item IN SELECT * FROM jsonb_array_elements(p_horarios) LOOP
    UPDATE public.clase_horarios SET vigente_desde=nullif(item->>'vigente_desde','')::date,
      vigente_hasta=nullif(item->>'vigente_hasta','')::date WHERE id=(item->>'id')::uuid AND clase_id=p_clase_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Horario ajeno a la clase'; END IF;
  END LOOP;
END; $$;
REVOKE ALL ON FUNCTION public.save_class_validity(uuid,date,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_class_validity(uuid,date,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_estado_asistencia_maestro(p_maestro_id uuid, p_desde date, p_hasta date)
 RETURNS TABLE(fecha date, clase_id uuid, clase_nombre text, maestro_id uuid, hora_inicio time without time zone, hora_fin time without time zone, sesion_id uuid, estado text, dias_atraso integer, asistencia_completa boolean, cubierta_emergente boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor_maestro_id uuid;
  v_es_admin boolean := COALESCE(public.is_admin(), false) OR COALESCE(auth.jwt()->>'role','') = 'service_role';
  v_periodo record;
  v_desde date;
  v_hasta date;
  v_now_local timestamp := now() AT TIME ZONE 'America/Santo_Domingo';
  v_hoy date := v_now_local::date;
  v_ahora time := v_now_local::time;
BEGIN
  IF p_maestro_id IS NULL OR p_desde IS NULL OR p_hasta IS NULL OR p_desde > p_hasta THEN
    RAISE EXCEPTION 'Maestro y rango de fechas válidos son requeridos';
  END IF;

  IF p_hasta - p_desde > 93 THEN
    RAISE EXCEPTION 'El rango máximo de consulta es 93 días';
  END IF;

  SELECT m.id INTO v_actor_maestro_id
  FROM public.maestros m
  WHERE m.user_id = auth.uid()
  LIMIT 1;

  IF NOT v_es_admin AND v_actor_maestro_id IS DISTINCT FROM p_maestro_id THEN
    RAISE EXCEPTION 'No tiene permiso para consultar este maestro';
  END IF;

  SELECT p.fecha_inicio, p.fecha_fin INTO v_periodo
  FROM public.periodos p
  WHERE p.activo = true AND COALESCE(p.cerrado, false) = false
  ORDER BY p.fecha_inicio DESC
  LIMIT 1;

  v_desde := p_desde;
  v_hasta := p_hasta;
  IF FOUND THEN
    v_desde := GREATEST(v_desde, v_periodo.fecha_inicio);
    v_hasta := LEAST(v_hasta, v_periodo.fecha_fin);
  END IF;
  IF v_desde > v_hasta THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH fechas AS (
    SELECT d::date AS fecha
    FROM generate_series(v_desde, v_hasta, interval '1 day') AS d
    WHERE public.fn_es_dia_lectivo(d::date)
  ), programadas AS (
    SELECT
      f.fecha,
      c.id AS clase_id,
      c.nombre AS clase_nombre,
      p_maestro_id AS maestro_id,
      h.hora_inicio,
      h.hora_fin
    FROM fechas f
    JOIN public.clase_horarios h
      ON lower(trim(h.dia)) = CASE extract(dow FROM f.fecha)
        WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes'
        WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes'
        WHEN 6 THEN 'sábado'
      END
    JOIN public.clases c ON c.id = h.clase_id
    WHERE COALESCE(c.activo, true)
      AND (
        (f.fecha >= COALESCE(c.fecha_inicio,(c.created_at AT TIME ZONE 'America/Santo_Domingo')::date,'-infinity'::date)
         AND f.fecha >= COALESCE(h.vigente_desde,(h.created_at AT TIME ZONE 'America/Santo_Domingo')::date,'-infinity'::date)
         AND (h.vigente_hasta IS NULL OR f.fecha <= h.vigente_hasta))
        OR EXISTS (SELECT 1 FROM public.sesiones_clase actual WHERE actual.clase_id=c.id AND actual.maestro_id=p_maestro_id
          AND actual.fecha=f.fecha AND actual.borrador=false AND actual.estado IN ('registrada','cerrada'))
      )
      AND (
        c.maestro_principal_id = p_maestro_id
        OR c.maestro_suplente_id = p_maestro_id
        OR c.maestro_id = p_maestro_id
        OR h.maestro_id = p_maestro_id
      )
  ), evaluadas AS (
    SELECT
      p.*,
      s.id AS sesion_id,
      s.estado AS sesion_estado,
      s.borrador,
      s.emergente_id,
      s.asistencia AS asistencia_json,
      COALESCE(a.total, 0) AS total_marcas,
      (inst.id IS NOT NULL) AS cubierta_institucional
    FROM programadas p
    LEFT JOIN LATERAL (
      SELECT sc.*
      FROM public.sesiones_clase sc
      WHERE sc.maestro_id = p.maestro_id
        AND sc.clase_id = p.clase_id
        AND sc.fecha = p.fecha
      ORDER BY
        CASE WHEN sc.estado IN ('registrada', 'cerrada') AND NOT COALESCE(sc.borrador, false) THEN 0 ELSE 1 END,
        sc.updated_at DESC NULLS LAST,
        sc.created_at DESC NULLS LAST
      LIMIT 1
    ) s ON true
    LEFT JOIN LATERAL (
      SELECT count(*)::integer AS total
      FROM public.asistencias a
      WHERE a.sesion_clase_id = s.id
    ) a ON true
    -- Actividad especial institucional ese día (clase_id NULL, cualquier
    -- maestro creador): cubre a TODAS las clases regulares programadas,
    -- no solo a las del maestro que la creó.
    LEFT JOIN LATERAL (
      SELECT sc2.id
      FROM public.sesiones_clase sc2
      WHERE sc2.clase_id IS NULL
        AND sc2.alcance_tipo = 'institucion'
        AND sc2.fecha = p.fecha
        AND sc2.estado IN ('registrada', 'cerrada')
        AND NOT COALESCE(sc2.borrador, false)
      LIMIT 1
    ) inst ON true
  )
  SELECT
    e.fecha,
    e.clase_id,
    e.clase_nombre,
    e.maestro_id,
    e.hora_inicio,
    e.hora_fin,
    e.sesion_id,
    CASE
      WHEN EXISTS (SELECT 1 FROM public.registro_exoneraciones x WHERE x.clase_id=e.clase_id AND x.maestro_id=e.maestro_id
        AND x.fecha=e.fecha AND x.revocado_en IS NULL AND x.alcance IN ('asistencia','ambos')) THEN 'exonerada'
      WHEN e.emergente_id IS NOT NULL OR e.cubierta_institucional THEN 'cubierta_emergente'
      WHEN e.sesion_id IS NOT NULL
        AND NOT COALESCE(e.borrador, false)
        AND (
          e.sesion_estado IN ('registrada', 'cerrada')
          OR e.total_marcas > 0
          OR (jsonb_typeof(e.asistencia_json) = 'array' AND jsonb_array_length(e.asistencia_json) > 0)
        ) THEN 'registrada'
      WHEN e.fecha > v_hoy
        OR (e.fecha = v_hoy AND v_ahora < e.hora_fin) THEN 'futura'
      WHEN e.fecha >= v_hoy - 7 THEN 'pendiente'
      ELSE 'vencida'
    END AS estado,
    GREATEST(v_hoy - e.fecha, 0)::integer AS dias_atraso,
    e.sesion_id IS NOT NULL
      AND NOT COALESCE(e.borrador, false)
      AND (
        e.sesion_estado IN ('registrada', 'cerrada')
        OR e.total_marcas > 0
        OR (jsonb_typeof(e.asistencia_json) = 'array' AND jsonb_array_length(e.asistencia_json) > 0)
      ) AS asistencia_completa,
    (e.emergente_id IS NOT NULL OR e.cubierta_institucional) AS cubierta_emergente
  FROM evaluadas e
  ORDER BY e.fecha, e.hora_inicio, e.clase_nombre;
END;
$function$;

-- El indicador conserva solo obligaciones exigibles; exonerada nunca suma como registrada.
DO $migration$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.fn_resumen_cumplimiento_asistencia(date,date,uuid)'::regprocedure) INTO definition;
 definition:=replace(definition,'count(*)::bigint,','count(*) FILTER (WHERE e.estado <> ''exonerada'')::bigint,');
 EXECUTE definition;
END; $migration$;

-- Impide que evaluadores existentes reabran alertas exoneradas. No crea evaluadores ni cron nuevos.
ALTER TABLE public.registros_pendientes ADD COLUMN exoneracion_id uuid REFERENCES public.registro_exoneraciones(id);

CREATE FUNCTION public.guard_exempt_pending_record() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF NEW.estado IN ('pendiente','visto') AND EXISTS (
    SELECT 1 FROM public.registro_exoneraciones x JOIN public.sesiones_clase s ON s.clase_id=x.clase_id AND s.maestro_id=x.maestro_id AND s.fecha=x.fecha
    WHERE s.id=NEW.sesion_clase_id AND x.revocado_en IS NULL AND
      (x.alcance='ambos' AND NEW.tipo IN ('asistencia_pendiente','contenido_pendiente','sesion_sin_cerrar')
       OR x.alcance='asistencia' AND NEW.tipo='asistencia_pendiente'
       OR x.alcance='contenido' AND NEW.tipo='contenido_pendiente')
  ) THEN
    SELECT x.id INTO NEW.exoneracion_id FROM public.registro_exoneraciones x
      JOIN public.sesiones_clase s ON s.clase_id=x.clase_id AND s.maestro_id=x.maestro_id AND s.fecha=x.fecha
      WHERE s.id=NEW.sesion_clase_id AND x.revocado_en IS NULL AND
        (x.alcance='ambos' AND NEW.tipo IN ('asistencia_pendiente','contenido_pendiente','sesion_sin_cerrar')
         OR x.alcance='asistencia' AND NEW.tipo='asistencia_pendiente' OR x.alcance='contenido' AND NEW.tipo='contenido_pendiente') LIMIT 1;
    NEW.estado:='cancelado';
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_exempt_pending_record() FROM PUBLIC;
CREATE TRIGGER guard_exempt_pending_record BEFORE INSERT OR UPDATE ON public.registros_pendientes FOR EACH ROW EXECUTE FUNCTION public.guard_exempt_pending_record();

-- La sincronización se ejecuta con los permisos de administración existentes.
CREATE FUNCTION public.sync_exempt_pending_records() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE public.registros_pendientes r SET estado='cancelado',exoneracion_id=NEW.id,updated_at=now()
      FROM public.sesiones_clase s WHERE r.sesion_clase_id=s.id AND s.clase_id=NEW.clase_id AND s.maestro_id=NEW.maestro_id AND s.fecha=NEW.fecha
      AND r.estado IN ('pendiente','visto') AND
      (NEW.alcance='ambos' AND r.tipo IN ('asistencia_pendiente','contenido_pendiente','sesion_sin_cerrar')
       OR NEW.alcance='asistencia' AND r.tipo='asistencia_pendiente'
       OR NEW.alcance='contenido' AND r.tipo='contenido_pendiente');
  ELSE
    -- Solo restaura alertas canceladas por esta decisión; nunca toca las resueltas por el maestro.
    UPDATE public.registros_pendientes r SET estado='pendiente',exoneracion_id=NULL,updated_at=now()
      FROM public.sesiones_clase s WHERE r.sesion_clase_id=s.id AND r.exoneracion_id=NEW.id AND r.estado='cancelado'
      AND ((r.tipo='contenido_pendiente' AND nullif(trim(s.contenido),'') IS NULL)
        OR (r.tipo='asistencia_pendiente' AND NOT EXISTS (SELECT 1 FROM public.asistencias a WHERE a.sesion_clase_id=s.id)
          AND NOT COALESCE((jsonb_typeof(s.asistencia)='array' AND jsonb_array_length(s.asistencia)>0),false))
        OR (r.tipo='sesion_sin_cerrar' AND s.borrador));
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.sync_exempt_pending_records() FROM PUBLIC;
CREATE TRIGGER sync_exempt_pending_records AFTER INSERT OR UPDATE ON public.registro_exoneraciones FOR EACH ROW EXECUTE FUNCTION public.sync_exempt_pending_records();

-- El recordatorio diario legado no debe pedir lista de una fecha exonerada.
DO $migration$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.fn_check_and_notify_pending_asistencias()'::regprocedure) INTO definition;
 definition:=replace(definition,'AND h.activo = TRUE' || chr(10) || '          AND NOT EXISTS (',
 'AND h.activo = TRUE
          AND NOT EXISTS (SELECT 1 FROM public.registro_exoneraciones x WHERE x.clase_id=c.id AND x.maestro_id=v_maestro_id AND x.fecha=v_hoy AND x.revocado_en IS NULL AND x.alcance IN (''asistencia'',''ambos''))
          AND NOT EXISTS (');
 EXECUTE definition;
END; $migration$;
NOTIFY pgrst, 'reload schema';

-- Los motores legados conservan su frecuencia y deduplicación; solo filtran obligaciones exoneradas.
DO $migration$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.generate_pending_class_notifications()'::regprocedure) INTO definition;
 definition:=replace(definition,'FROM teacher_class_fill_metrics' || chr(10),'FROM teacher_class_fill_metrics tcfm' || chr(10));
 definition:=replace(definition,'AND public.fn_es_dia_lectivo(tcfm.fecha)',
 'AND public.fn_es_dia_lectivo(tcfm.fecha)
      AND NOT EXISTS (SELECT 1 FROM public.registro_exoneraciones x WHERE x.clase_id=tcfm.clase_id AND x.maestro_id=tcfm.maestro_id AND x.fecha=tcfm.fecha AND x.revocado_en IS NULL AND x.alcance IN (''asistencia'',''ambos''))');
 definition:=replace(definition,'AND public.fn_es_dia_lectivo(fecha);',
 'AND public.fn_es_dia_lectivo(fecha)
        AND NOT EXISTS (SELECT 1 FROM public.registro_exoneraciones x WHERE x.clase_id=tcfm.clase_id AND x.maestro_id=tcfm.maestro_id AND x.fecha=tcfm.fecha AND x.revocado_en IS NULL AND x.alcance IN (''asistencia'',''ambos''));');
 EXECUTE definition;
 SELECT pg_get_functiondef('public.fn_maestros_asistencia_pendiente(text)'::regprocedure) INTO definition;
 definition:=replace(definition,'where sc.cerrada_en is null',
 'where sc.cerrada_en is null
    and not exists (select 1 from public.registro_exoneraciones x where x.clase_id=sc.clase_id and x.maestro_id=sc.maestro_id and x.fecha=sc.fecha and x.revocado_en is null and x.alcance in (''asistencia'',''ambos''))');
 EXECUTE definition;
END; $migration$;

REVOKE ALL ON FUNCTION public.fn_estado_asistencia_maestro(uuid,date,date) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.fn_resumen_cumplimiento_asistencia(date,date,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fn_estado_asistencia_maestro(uuid,date,date) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.fn_resumen_cumplimiento_asistencia(date,date,uuid) TO authenticated,service_role;
