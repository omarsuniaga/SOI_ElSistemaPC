-- Functions captured read-only from production on 2026-10-20 (pg_get_functiondef / proacl). Loaded after the
-- block-5 subset (instrumentos, departamentos, fn_email_departamento) and the anon-write-fix subset
-- (tareas_institucionales, soi_departamento enum).

CREATE OR REPLACE FUNCTION public._fn_crear_tarea_caso(p_corr uuid, p_titulo text, p_desc text, p_depto soi_departamento, p_prioridad text, p_entidad_tipo text, p_entidad_id uuid, p_entidad_label text, p_actor_id uuid, p_actor_nombre text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  INSERT INTO public.tareas_institucionales
    (titulo, descripcion, departamento, estado, prioridad, correlation_id,
     entidad_tipo, entidad_id, entidad_label, updated_by, updated_by_nombre)
  VALUES (p_titulo, p_desc, p_depto, 'pendiente', p_prioridad::tarea_institucional_prioridad, p_corr,
     p_entidad_tipo, p_entidad_id, p_entidad_label, p_actor_id, p_actor_nombre);
$function$;

CREATE OR REPLACE FUNCTION public.fn_reportar_instrumento_danado(p_instrumento_id uuid, p_descripcion text, p_actor_id uuid, p_actor_nombre text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_corr uuid := gen_random_uuid(); v_label text; v_alumno text;
BEGIN
  SELECT coalesce(nombre,'Instrumento') || coalesce(' ('||codigo||')',''), alumno_nombre
    INTO v_label, v_alumno FROM public.instrumentos WHERE id = p_instrumento_id;
  IF v_label IS NULL THEN RAISE EXCEPTION 'instrumento % no existe', p_instrumento_id; END IF;

  UPDATE public.instrumentos SET estado = 'danado', updated_at = now() WHERE id = p_instrumento_id;

  PERFORM public._fn_crear_tarea_caso(v_corr, 'LUT: Diagnosticar daño del instrumento',
    coalesce(p_descripcion,'') , 'LUT', 'alta', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'LOG: Actualizar estado en inventario y evaluar reemplazo temporal',
    'Instrumento marcado como dañado; evaluar disponibilidad de reemplazo.', 'LOG', 'alta', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'FIN: Evaluar si corresponde cargo al representante',
    coalesce('Alumno asociado: '||v_alumno, 'Revisar responsable del daño.'), 'FIN', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'ACM: Caso de daño asociado al alumno',
    'El alumno tiene un caso abierto por daño de instrumento; considerar impacto en continuidad.', 'ACM', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'COM: Evaluar comunicado al representante',
    'Coordinar mensaje al representante sobre el caso de instrumento dañado.', 'COM', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);

  RETURN v_corr;
END $function$;

-- production ACLs: helper and report {postgres, authenticated, service_role}; the email lookup keeps PUBLIC/anon
REVOKE ALL ON FUNCTION public._fn_crear_tarea_caso(uuid, text, text, soi_departamento, text, text, uuid, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public._fn_crear_tarea_caso(uuid, text, text, soi_departamento, text, text, uuid, text, uuid, text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_reportar_instrumento_danado(uuid, text, uuid, text) TO authenticated, service_role;

-- a SECURITY DEFINER caller of fn_email_departamento (stands for Hermes/trigger code that runs as owner)
CREATE OR REPLACE FUNCTION public.test_mail_caller() RETURNS text LANGUAGE sql SECURITY DEFINER AS
  $$ SELECT public.fn_email_departamento('ACM') $$;
