-- Reuse people and institutional calendar. No new domain tables.
ALTER TABLE public.maestros ADD COLUMN IF NOT EXISTS fecha_nacimiento date;
COMMENT ON COLUMN public.maestros.fecha_nacimiento IS 'Fecha de nacimiento; captura administrativa. Cumpleañeros muestra únicamente día y mes.';

CREATE OR REPLACE FUNCTION public.fn_birthdays_assert_staff() RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT soi_security.has_role(ARRAY['admin','superadmin','coordinacion_academica']) THEN
    RAISE EXCEPTION 'Solo administración y coordinación pueden gestionar cumpleaños' USING ERRCODE='42501';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fn_birthdays_overview(p_year integer, p_include_inactive boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE result jsonb; today date := (now() AT TIME ZONE 'America/Santo_Domingo')::date;
BEGIN
  PERFORM public.fn_birthdays_assert_staff();
  IF p_year IS NULL OR p_year < 1900 OR p_year > 2099 THEN RAISE EXCEPTION 'Año inválido'; END IF;
  WITH people AS (
    SELECT a.id, 'alumno'::text AS kind, a.nombre_completo AS name, a.activo AS active, a.fecha_nacimiento AS dob,
      coalesce((SELECT string_agg(DISTINCT c.nombre, ', ' ORDER BY c.nombre) FROM public.alumnos_clases ac JOIN public.clases c ON c.id=ac.clase_id WHERE ac.alumno_id=a.id AND ac.activo), 'Sin clase activa') AS context
    FROM public.alumnos a WHERE a.activo IS TRUE OR p_include_inactive
    UNION ALL
    SELECT m.id, 'maestro', m.nombre_completo, m.activo, m.fecha_nacimiento, coalesce(m.especialidad, 'Sin especialidad')
    FROM public.maestros m WHERE m.activo IS TRUE OR p_include_inactive
  ) SELECT jsonb_build_object(
    'people', coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'kind',kind,'name',name,'active',active,'context',context,
      'day',CASE WHEN dob <= today THEN extract(day FROM dob)::integer END,
      'month',CASE WHEN dob <= today THEN extract(month FROM dob)::integer END,
      'needsReview',dob > today) ORDER BY kind,name,id) FROM people), '[]'::jsonb),
    'celebrations',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'version',version,'period',metadata->>'cumpleanos_periodo',
      'date',to_char(fecha_inicio AT TIME ZONE 'America/Santo_Domingo','YYYY-MM-DD'),
      'start',to_char(fecha_inicio AT TIME ZONE 'America/Santo_Domingo','HH24:MI'),
      'end',to_char(fecha_fin AT TIME ZONE 'America/Santo_Domingo','HH24:MI'),
      'location',coalesce(ubicacion,''),'responsible',metadata->>'responsable','notes',coalesce(descripcion,''),'status',estado) ORDER BY fecha_inicio)
      FROM public.calendario_institucional WHERE metadata->>'tipo'='cumpleanos_mes' AND metadata->>'cumpleanos_periodo' LIKE p_year::text || '-%'), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.fn_birthdays_save_date(p_kind text, p_id uuid, p_date date)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM public.fn_birthdays_assert_staff();
  IF p_date > (now() AT TIME ZONE 'America/Santo_Domingo')::date THEN RAISE EXCEPTION 'La fecha de nacimiento no puede ser futura'; END IF;
  IF p_kind='alumno' THEN
    UPDATE public.alumnos SET fecha_nacimiento=p_date WHERE id=p_id;
  ELSIF p_kind='maestro' THEN
    UPDATE public.maestros SET fecha_nacimiento=p_date WHERE id=p_id;
  ELSE RAISE EXCEPTION 'Tipo de persona inválido';
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'Persona no encontrada o sin permiso'; END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS calendario_cumpleanos_periodo_unique
ON public.calendario_institucional ((metadata->>'cumpleanos_periodo'))
WHERE metadata->>'tipo'='cumpleanos_mes';

-- Scope the new staff operation to celebrations only; preserve existing policies.
CREATE POLICY birthdays_staff_calendar ON public.calendario_institucional FOR ALL TO authenticated
USING (metadata->>'tipo'='cumpleanos_mes' AND soi_security.has_role(ARRAY['admin','superadmin','coordinacion_academica']))
WITH CHECK (metadata->>'tipo'='cumpleanos_mes' AND categoria='otro' AND NOT requiere_aprobacion
  AND cardinality(programas_convocados)=0 AND cardinality(clases_convocadas)=0
  AND soi_security.has_role(ARRAY['admin','superadmin','coordinacion_academica']));

CREATE OR REPLACE FUNCTION public.fn_birthdays_save_celebration(
  p_period text, p_date date, p_start time, p_end time, p_location text, p_responsible text,
  p_status text, p_notes text DEFAULT '', p_id uuid DEFAULT NULL, p_version integer DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE saved uuid; starts_at timestamptz; ends_at timestamptz;
BEGIN
  PERFORM public.fn_birthdays_assert_staff();
  IF p_period IS NULL OR p_period !~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$' OR p_date IS NULL OR to_char(p_date,'YYYY-MM')<>p_period THEN RAISE EXCEPTION 'La fecha debe pertenecer al mes seleccionado'; END IF;
  IF p_start IS NULL OR p_end IS NULL OR p_end <= p_start OR extract(hour FROM p_end)>=24 THEN RAISE EXCEPTION 'La hora final debe ser posterior a la inicial'; END IF;
  IF coalesce(length(trim(p_location)),0)=0 OR coalesce(length(trim(p_responsible)),0)=0 THEN RAISE EXCEPTION 'Lugar y responsable son obligatorios'; END IF;
  IF length(p_location)>300 OR length(p_responsible)>200 OR length(p_notes)>4000 THEN RAISE EXCEPTION 'Texto demasiado largo'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('borrador','programado','completado','cancelado') THEN RAISE EXCEPTION 'Estado inválido'; END IF;
  starts_at := (p_date + p_start) AT TIME ZONE 'America/Santo_Domingo';
  ends_at := (p_date + p_end) AT TIME ZONE 'America/Santo_Domingo';
  IF p_id IS NULL THEN
    INSERT INTO public.calendario_institucional(titulo,descripcion,categoria,fecha_inicio,fecha_fin,ubicacion,departamento_responsable,metadata,estado,alcance,programas_convocados,clases_convocadas,requiere_aprobacion,creado_por)
    VALUES ('Compartir de cumpleaños · '||p_period,coalesce(p_notes,''),'otro',starts_at,ends_at,trim(p_location),'ADM',
      jsonb_build_object('tipo','cumpleanos_mes','cumpleanos_periodo',p_period,'responsable',trim(p_responsible)),p_status,'institucional','{}','{}',false,auth.uid())
    ON CONFLICT ((metadata->>'cumpleanos_periodo')) WHERE metadata->>'tipo'='cumpleanos_mes' DO NOTHING RETURNING id INTO saved;
    IF saved IS NULL THEN RAISE EXCEPTION 'Ya existe un compartir para ese mes; recarga antes de editar'; END IF;
  ELSE
    UPDATE public.calendario_institucional SET descripcion=coalesce(p_notes,''),fecha_inicio=starts_at,fecha_fin=ends_at,ubicacion=trim(p_location),estado=p_status,
      metadata=metadata||jsonb_build_object('responsable',trim(p_responsible)),version=version+1,updated_at=now()
    WHERE id=p_id AND metadata->>'tipo'='cumpleanos_mes' AND metadata->>'cumpleanos_periodo'=p_period AND version=p_version
    RETURNING id INTO saved;
    IF saved IS NULL THEN RAISE EXCEPTION 'El compartir cambió o no tienes permiso; recarga antes de editar'; END IF;
  END IF;
  RETURN saved;
END $$;

-- Birthday planning must not emit tasks, messages or academic effects, even if
-- an institution later configures a generic protocol for category "otro".
DROP TRIGGER IF EXISTS trg_hermes_event_inserted ON public.calendario_institucional;
CREATE TRIGGER trg_hermes_event_inserted AFTER INSERT ON public.calendario_institucional
FOR EACH ROW WHEN (NEW.metadata->>'tipo' IS DISTINCT FROM 'cumpleanos_mes')
EXECUTE FUNCTION public.fn_hermes_auto_delegar_tareas();

REVOKE ALL ON FUNCTION public.fn_birthdays_assert_staff() FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.fn_birthdays_overview(integer,boolean) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.fn_birthdays_save_date(text,uuid,date) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.fn_birthdays_save_celebration(text,date,time,time,text,text,text,text,uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fn_birthdays_assert_staff(),public.fn_birthdays_overview(integer,boolean),public.fn_birthdays_save_date(text,uuid,date),public.fn_birthdays_save_celebration(text,date,time,time,text,text,text,text,uuid,integer) TO authenticated;

-- Self-service is limited to the authenticated maestro's own birth date.
-- Keep SECURITY INVOKER and protect direct authenticated updates of other columns.
-- Existing trusted definer RPCs retain their own guards and permissions (e.g. availability).
CREATE OR REPLACE FUNCTION public.fn_birthdays_guard_maestro_update() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE allowed_fields text[] := ARRAY['fecha_nacimiento','updated_at'];
BEGIN
  -- Preserve the fields already edited by the existing maestro Profile UI.
  -- Other staff (without existing admin privileges) can only correct the date.
  IF OLD.user_id=auth.uid() THEN
    allowed_fields := allowed_fields || ARRAY['nombre_completo','tlf','especialidad','disponibilidad'];
  END IF;
  IF current_user='authenticated' AND auth.uid() IS NOT NULL AND NOT public.es_admin()
    AND NOT soi_security.has_role(ARRAY['superadmin'])
    AND (to_jsonb(NEW)-allowed_fields) IS DISTINCT FROM (to_jsonb(OLD)-allowed_fields) THEN
    RAISE EXCEPTION 'Este permiso solo permite actualizar los datos personales autorizados' USING ERRCODE='42501';
  END IF;
  IF NEW.fecha_nacimiento IS DISTINCT FROM OLD.fecha_nacimiento AND NEW.fecha_nacimiento > (now() AT TIME ZONE 'America/Santo_Domingo')::date THEN
    RAISE EXCEPTION 'La fecha de nacimiento no puede ser futura';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER birthdays_guard_maestro_update BEFORE UPDATE ON public.maestros
FOR EACH ROW EXECUTE FUNCTION public.fn_birthdays_guard_maestro_update();
CREATE POLICY birthdays_maestro_update_self ON public.maestros FOR UPDATE TO authenticated
USING (user_id=auth.uid() AND activo IS TRUE AND soi_security.has_role(ARRAY['maestro','monitor']))
WITH CHECK (user_id=auth.uid() AND activo IS TRUE AND soi_security.has_role(ARRAY['maestro','monitor']));
CREATE POLICY birthdays_staff_update_maestro ON public.maestros FOR UPDATE TO authenticated
USING (soi_security.has_role(ARRAY['admin','superadmin','coordinacion_academica']))
WITH CHECK (soi_security.has_role(ARRAY['admin','superadmin','coordinacion_academica']));
CREATE POLICY birthdays_staff_read_maestro ON public.maestros FOR SELECT TO authenticated
USING (soi_security.has_role(ARRAY['admin','superadmin','coordinacion_academica']));
GRANT UPDATE(fecha_nacimiento) ON public.maestros TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_birthdays_my_date() RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT soi_security.has_role(ARRAY['maestro','monitor','admin','superadmin','coordinacion_academica']) THEN RAISE EXCEPTION 'Debes iniciar sesión con un perfil activo' USING ERRCODE='42501'; END IF;
  SELECT jsonb_build_object('available',true,'date',fecha_nacimiento) INTO result FROM public.maestros WHERE user_id=auth.uid() AND activo IS TRUE;
  RETURN coalesce(result,jsonb_build_object('available',false));
END $$;
CREATE OR REPLACE FUNCTION public.fn_birthdays_save_my_date(p_date date) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT soi_security.has_role(ARRAY['maestro','monitor','admin','superadmin','coordinacion_academica']) THEN RAISE EXCEPTION 'Debes iniciar sesión con un perfil activo' USING ERRCODE='42501'; END IF;
  IF p_date > (now() AT TIME ZONE 'America/Santo_Domingo')::date THEN RAISE EXCEPTION 'La fecha de nacimiento no puede ser futura'; END IF;
  UPDATE public.maestros SET fecha_nacimiento=p_date WHERE user_id=auth.uid() AND activo IS TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No hay una ficha de maestro propia disponible' USING ERRCODE='42501'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.fn_birthdays_guard_maestro_update(),public.fn_birthdays_my_date(),public.fn_birthdays_save_my_date(date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fn_birthdays_guard_maestro_update(),public.fn_birthdays_my_date(),public.fn_birthdays_save_my_date(date) TO authenticated;
