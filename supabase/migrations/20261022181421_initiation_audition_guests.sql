-- Iniciación: convocatoria → valoración → invitación → revisión humana.
-- Primera fila real: coordinación, al abrir el piloto con cohorte y jurados aprobados.
-- No aplicar automáticamente en producción; validar primero contra copia del esquema real.
BEGIN;
SET LOCAL lock_timeout = '5s';
CREATE SCHEMA IF NOT EXISTS soi_security;
REVOKE ALL ON SCHEMA soi_security FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA soi_security TO authenticated;
-- policy:exento-institucion_id razón: despliegue académico de una sola institución, sin catálogo ni membresía institucional canónica; migrar con el núcleo académico antes de habilitar otra institución.
CREATE TABLE public.iniciacion_convocatorias (
 -- policy:exento-institucion_id razón: núcleo académico de institución única; migración conjunta de ámbito antes de multitenencia, documentada en SPEC.md.
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nombre text NOT NULL CHECK(length(btrim(nombre)) BETWEEN 3 AND 160),
 clase_origen_id uuid NOT NULL REFERENCES public.clases(id) ON DELETE RESTRICT,
 cohorte_desde date NOT NULL, cohorte_hasta date NOT NULL, fecha_audicion date NOT NULL,
 jurados uuid[] NOT NULL CHECK(cardinality(jurados)>0), min_jurados integer NOT NULL DEFAULT 1,
 rubrica jsonb NOT NULL CHECK(jsonb_typeof(rubrica)='array' AND jsonb_array_length(rubrica)>0),
 estado text NOT NULL DEFAULT 'abierta' CHECK(estado IN ('abierta','cerrada')),
 creado_por uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id), creado_at timestamptz NOT NULL DEFAULT now(),
 CHECK(cohorte_hasta>=cohorte_desde), CHECK(min_jurados BETWEEN 1 AND cardinality(jurados)), CHECK(fecha_audicion>=cohorte_desde)
);
-- policy:exento-institucion_id razón: hereda el despliegue de la convocatoria; incorporar ámbito junto con alumnos/clases antes de otra institución.
CREATE TABLE public.iniciacion_candidatos (
 -- policy:exento-institucion_id razón: núcleo académico de institución única; migración conjunta de ámbito antes de multitenencia, documentada en SPEC.md.
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), convocatoria_id uuid NOT NULL REFERENCES public.iniciacion_convocatorias(id) ON DELETE RESTRICT,
 alumno_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT, alumno_nombre text NOT NULL,
 motivo_excepcion text, estado text NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','invitado','fijo','continua_iniciacion')),
 ronda integer NOT NULL DEFAULT 0 CHECK(ronda>=0), version integer NOT NULL DEFAULT 0,
 clase_destino_id uuid REFERENCES public.clases(id) ON DELETE RESTRICT,
 inscripcion_id uuid REFERENCES public.alumnos_clases(id) ON DELETE SET NULL,
 revision_fecha date, objetivos text, creado_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(convocatoria_id,alumno_id)
);
-- policy:exento-institucion_id razón: hereda el despliegue del candidato; sin identidad multiinstitucional artificial.
CREATE TABLE public.iniciacion_valoraciones (
 -- policy:exento-institucion_id razón: núcleo académico de institución única; migración conjunta de ámbito antes de multitenencia, documentada en SPEC.md.
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidato_id uuid NOT NULL REFERENCES public.iniciacion_candidatos(id) ON DELETE RESTRICT,
 ronda integer NOT NULL CHECK(ronda>=0), jurado_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
 notas jsonb NOT NULL, observacion text NOT NULL DEFAULT '', completa boolean NOT NULL DEFAULT false,
 clase_propuesta_id uuid REFERENCES public.clases(id), actualizado_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(candidato_id,ronda,jurado_id)
);
-- policy:exento-institucion_id razón: historial dependiente del candidato del despliegue único; migración institucional conjunta obligatoria antes de multitenencia.
CREATE TABLE public.iniciacion_decisiones (
 -- policy:exento-institucion_id razón: núcleo académico de institución única; migración conjunta de ámbito antes de multitenencia, documentada en SPEC.md.
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidato_id uuid NOT NULL REFERENCES public.iniciacion_candidatos(id) ON DELETE RESTRICT,
 accion text NOT NULL CHECK(accion IN ('invitar','confirmar','continuar','prorrogar')),
 observacion text NOT NULL CHECK(length(btrim(observacion))>0), datos jsonb NOT NULL,
 antes jsonb NOT NULL, despues jsonb NOT NULL, actor_id uuid NOT NULL REFERENCES public.profiles(id),
 creado_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX iniciacion_decision_version ON public.iniciacion_decisiones(candidato_id, ((despues->>'version')::integer));
CREATE INDEX ON public.iniciacion_candidatos(convocatoria_id);
CREATE INDEX ON public.iniciacion_candidatos(alumno_id);
CREATE INDEX ON public.iniciacion_valoraciones(jurado_id);
CREATE INDEX ON public.iniciacion_decisiones(candidato_id);
ALTER TABLE public.alumnos_clases ADD COLUMN condicion text NOT NULL DEFAULT 'fijo' CHECK(condicion IN ('fijo','invitado')),
 ADD COLUMN invitacion_revision date, ADD COLUMN audicion_candidato_id uuid REFERENCES public.iniciacion_candidatos(id);

CREATE FUNCTION soi_security.iniciacion_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$ SELECT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica']); $$;
CREATE FUNCTION soi_security.iniciacion_ver(p_conv uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$ SELECT auth.uid() IS NOT NULL AND (
 soi_security.iniciacion_admin() OR (soi_security.has_role(ARRAY['maestro','jurado']) AND EXISTS (
 SELECT 1 FROM public.iniciacion_convocatorias c WHERE c.id=p_conv AND (
 auth.uid()=ANY(c.jurados) OR EXISTS (SELECT 1 FROM public.iniciacion_candidatos a
 WHERE a.convocatoria_id=c.id AND soi_security.assigned_maestro(a.clase_destino_id)))))); $$;
CREATE FUNCTION soi_security.iniciacion_candidato_ver(p_candidato uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT auth.uid() IS NOT NULL AND (soi_security.iniciacion_admin() OR (soi_security.has_role(ARRAY['maestro','jurado']) AND EXISTS(
 SELECT 1 FROM public.iniciacion_candidatos a JOIN public.iniciacion_convocatorias c ON c.id=a.convocatoria_id
 WHERE a.id=p_candidato AND (auth.uid()=ANY(c.jurados) OR soi_security.assigned_maestro(a.clase_destino_id))))); $$;
CREATE FUNCTION soi_security.iniciacion_evaluar(p_candidato uuid, p_ronda integer) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$ SELECT auth.uid() IS NOT NULL AND soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica','maestro','jurado']) AND EXISTS (
 SELECT 1 FROM public.iniciacion_candidatos a JOIN public.iniciacion_convocatorias c ON c.id=a.convocatoria_id
 WHERE a.id=p_candidato AND a.ronda=p_ronda AND c.estado='abierta' AND a.estado IN ('pendiente','invitado')
 AND (auth.uid()=ANY(c.jurados) OR (a.estado='invitado' AND soi_security.assigned_maestro(a.clase_destino_id)))); $$;

CREATE FUNCTION soi_security.iniciacion_validar_convocatoria() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE criterion jsonb; keys text[] := '{}';
BEGIN
 IF NOT soi_security.iniciacion_admin() THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Solo coordinación crea convocatorias'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.clases WHERE id=NEW.clase_origen_id AND es_clase_iniciacion IS TRUE AND activo IS TRUE) THEN
  RAISE EXCEPTION 'La clase de origen debe ser Iniciación activa'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(NEW.jurados) j WHERE NOT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=j AND p.activo IS TRUE AND p.estado='activo' AND p.rol IN ('maestro','jurado','admin','superadmin','direccion','coordinacion_academica'))) THEN
  RAISE EXCEPTION 'Jurado no activo o no autorizado'; END IF;
 IF cardinality(NEW.jurados)<>(SELECT count(DISTINCT j) FROM unnest(NEW.jurados) j) THEN RAISE EXCEPTION 'Jurado duplicado'; END IF;
 FOR criterion IN SELECT * FROM jsonb_array_elements(NEW.rubrica) LOOP
  IF coalesce(criterion->>'key','') !~ '^[a-z][a-z0-9_]{0,39}$' OR coalesce(btrim(criterion->>'label'),'')='' OR jsonb_typeof(criterion->'required') IS DISTINCT FROM 'boolean' OR (criterion->>'key')=ANY(keys) THEN
   RAISE EXCEPTION 'Rúbrica inválida'; END IF;
  keys:=array_append(keys,criterion->>'key');
 END LOOP;
 RETURN NEW;
END; $$;
CREATE TRIGGER iniciacion_validar_convocatoria BEFORE INSERT ON public.iniciacion_convocatorias FOR EACH ROW EXECUTE FUNCTION soi_security.iniciacion_validar_convocatoria();

CREATE FUNCTION soi_security.iniciacion_validar_candidato() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE c public.iniciacion_convocatorias; a public.alumnos;
BEGIN
 SELECT * INTO STRICT c FROM public.iniciacion_convocatorias WHERE id=NEW.convocatoria_id AND estado='abierta';
 SELECT * INTO STRICT a FROM public.alumnos WHERE id=NEW.alumno_id AND activo IS TRUE;
 IF NOT EXISTS(SELECT 1 FROM public.alumnos_clases WHERE alumno_id=a.id AND clase_id=c.clase_origen_id AND activo IS TRUE) THEN RAISE EXCEPTION 'El alumno no tiene matrícula activa en la clase de origen'; END IF;
 IF (a.fecha_ingreso_iniciacion IS NULL OR a.fecha_ingreso_iniciacion NOT BETWEEN c.cohorte_desde AND c.cohorte_hasta OR (a.fecha_ingreso_iniciacion + interval '3 months')::date>c.fecha_audicion)
 AND coalesce(length(btrim(NEW.motivo_excepcion)),0)=0 THEN RAISE EXCEPTION 'Se requiere justificar la excepción de cohorte o preparación'; END IF;
 NEW.alumno_nombre:=a.nombre_completo;
 RETURN NEW;
END; $$;
CREATE TRIGGER iniciacion_validar_candidato BEFORE INSERT ON public.iniciacion_candidatos FOR EACH ROW EXECUTE FUNCTION soi_security.iniciacion_validar_candidato();

CREATE FUNCTION soi_security.iniciacion_validar_valoracion() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE rubric jsonb; criterion jsonb; score jsonb; observed integer:=0;
BEGIN
 IF NEW.jurado_id IS DISTINCT FROM auth.uid() OR NOT soi_security.iniciacion_evaluar(NEW.candidato_id,NEW.ronda) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='No autorizado para evaluar esta ronda'; END IF;
 IF jsonb_typeof(NEW.notas) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Notas inválidas'; END IF;
 SELECT c.rubrica INTO rubric FROM public.iniciacion_candidatos a JOIN public.iniciacion_convocatorias c ON c.id=a.convocatoria_id WHERE a.id=NEW.candidato_id;
 IF EXISTS(SELECT 1 FROM jsonb_object_keys(NEW.notas) k WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(rubric) x WHERE x->>'key'=k)) THEN RAISE EXCEPTION 'Criterio desconocido'; END IF;
 NEW.completa:=true;
 FOR criterion IN SELECT * FROM jsonb_array_elements(rubric) LOOP
  score:=NEW.notas->(criterion->>'key');
  IF score IS NULL OR score='null'::jsonb THEN
   IF (criterion->>'required')::boolean THEN NEW.completa:=false; END IF;
  ELSIF jsonb_typeof(score)<>'number' OR score::text NOT IN ('1','2','3','4') THEN RAISE EXCEPTION 'Las notas deben ser enteros de 1 a 4 o no observado';
  ELSE observed:=observed+1; END IF;
 END LOOP;
 NEW.completa:=NEW.completa AND observed>0;
 NEW.actualizado_at:=now();
 RETURN NEW;
END; $$;
CREATE TRIGGER iniciacion_validar_valoracion BEFORE INSERT OR UPDATE ON public.iniciacion_valoraciones FOR EACH ROW EXECUTE FUNCTION soi_security.iniciacion_validar_valoracion();

-- Guard de metadatos de matrícula: solo la operación de decisión puede mutarlos.
CREATE FUNCTION soi_security.iniciacion_guard_matricula() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP<>'DELETE' THEN PERFORM pg_advisory_xact_lock(hashtextextended('iniciacion-clase:'||NEW.clase_id::text,0)); END IF;
 IF current_user IN ('authenticated','anon') THEN
  IF TG_OP='DELETE' THEN
   IF OLD.condicion='invitado' THEN RAISE EXCEPTION 'Finalice la invitación desde Audiciones'; END IF;
   RETURN OLD;
  END IF;
  IF (TG_OP='INSERT' AND (NEW.condicion<>'fijo' OR NEW.invitacion_revision IS NOT NULL OR NEW.audicion_candidato_id IS NOT NULL))
   OR (TG_OP='UPDATE' AND (NEW.condicion,NEW.invitacion_revision,NEW.audicion_candidato_id) IS DISTINCT FROM (OLD.condicion,OLD.invitacion_revision,OLD.audicion_candidato_id))
   OR (TG_OP='UPDATE' AND OLD.condicion='invitado' AND (NEW.activo,NEW.clase_id,NEW.alumno_id) IS DISTINCT FROM (OLD.activo,OLD.clase_id,OLD.alumno_id)) THEN
    RAISE EXCEPTION 'La condición de invitado se gestiona desde Audiciones'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER iniciacion_guard_matricula BEFORE INSERT OR UPDATE OR DELETE ON public.alumnos_clases FOR EACH ROW EXECUTE FUNCTION soi_security.iniciacion_guard_matricula();

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['iniciacion_convocatorias','iniciacion_candidatos','iniciacion_valoraciones','iniciacion_decisiones'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',t);
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
 END LOOP;
END $$;
CREATE POLICY iniciacion_conv_read ON public.iniciacion_convocatorias FOR SELECT TO authenticated USING(soi_security.iniciacion_ver(id));
CREATE POLICY iniciacion_conv_create ON public.iniciacion_convocatorias FOR INSERT TO authenticated WITH CHECK(soi_security.iniciacion_admin());
GRANT INSERT(nombre,clase_origen_id,cohorte_desde,cohorte_hasta,fecha_audicion,jurados,min_jurados,rubrica) ON public.iniciacion_convocatorias TO authenticated;
CREATE POLICY iniciacion_candidato_read ON public.iniciacion_candidatos FOR SELECT TO authenticated USING(soi_security.iniciacion_candidato_ver(id));
CREATE POLICY iniciacion_candidato_create ON public.iniciacion_candidatos FOR INSERT TO authenticated WITH CHECK(soi_security.iniciacion_admin());
GRANT INSERT(convocatoria_id,alumno_id,motivo_excepcion) ON public.iniciacion_candidatos TO authenticated;
CREATE POLICY iniciacion_valoracion_read ON public.iniciacion_valoraciones FOR SELECT TO authenticated USING(soi_security.iniciacion_admin() OR (jurado_id=auth.uid() AND EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=candidato_id AND soi_security.iniciacion_ver(a.convocatoria_id))));
CREATE POLICY iniciacion_valoracion_create ON public.iniciacion_valoraciones FOR INSERT TO authenticated WITH CHECK(jurado_id=auth.uid() AND EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=candidato_id AND soi_security.iniciacion_ver(a.convocatoria_id)));
CREATE POLICY iniciacion_valoracion_edit ON public.iniciacion_valoraciones FOR UPDATE TO authenticated USING(jurado_id=auth.uid() AND EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=candidato_id AND soi_security.iniciacion_ver(a.convocatoria_id))) WITH CHECK(jurado_id=auth.uid() AND EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=candidato_id AND soi_security.iniciacion_ver(a.convocatoria_id)));
GRANT INSERT(candidato_id,ronda,notas,observacion,clase_propuesta_id), UPDATE(notas,observacion,clase_propuesta_id) ON public.iniciacion_valoraciones TO authenticated;
CREATE POLICY iniciacion_decision_read ON public.iniciacion_decisiones FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=candidato_id AND soi_security.iniciacion_ver(a.convocatoria_id)));

CREATE FUNCTION soi_security.iniciacion_contexto() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica','maestro','jurado']) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Se requiere un perfil académico activo'; END IF;
 SELECT jsonb_build_object('user',jsonb_build_object('id',p.id,'nombre',p.nombre_completo,'canManage',soi_security.iniciacion_admin()),
 'jurados',CASE WHEN soi_security.iniciacion_admin() THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',j.id,'nombre',j.nombre_completo)),'[]') FROM public.profiles j WHERE j.activo IS TRUE AND j.estado='activo' AND j.rol IN ('maestro','jurado','admin','superadmin','direccion','coordinacion_academica')) ELSE '[]'::jsonb END,
 'clases',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',c.id,'nombre',c.nombre,'es_clase_iniciacion',c.es_clase_iniciacion,'tipo_clase',c.tipo_clase,'puede_evaluar_revision',soi_security.assigned_maestro(c.id))),'[]') FROM public.clases c WHERE c.activo IS TRUE)) INTO result FROM public.profiles p WHERE p.id=auth.uid();
 RETURN result;
END; $$;
CREATE FUNCTION public.iniciacion_contexto() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT soi_security.iniciacion_contexto(); $$;
-- Escritura de valoración con identidad de sesión y bloqueo compartido con decisiones.
REVOKE INSERT, UPDATE ON public.iniciacion_valoraciones FROM authenticated;
REVOKE INSERT(candidato_id,ronda,notas,observacion,clase_propuesta_id), UPDATE(notas,observacion,clase_propuesta_id) ON public.iniciacion_valoraciones FROM authenticated;
CREATE FUNCTION soi_security.iniciacion_guardar_valoracion(p_candidato uuid,p_ronda integer,p_notas jsonb,p_observacion text,p_clase uuid DEFAULT NULL)
RETURNS public.iniciacion_valoraciones LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result public.iniciacion_valoraciones;
BEGIN
 PERFORM 1 FROM public.iniciacion_candidatos WHERE id=p_candidato FOR UPDATE;
 IF NOT soi_security.iniciacion_evaluar(p_candidato,p_ronda) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='No autorizado para esta valoración'; END IF;
 INSERT INTO public.iniciacion_valoraciones(candidato_id,ronda,jurado_id,notas,observacion,clase_propuesta_id)
 VALUES(p_candidato,p_ronda,auth.uid(),p_notas,coalesce(p_observacion,''),p_clase)
 ON CONFLICT(candidato_id,ronda,jurado_id) DO UPDATE SET notas=excluded.notas,observacion=excluded.observacion,clase_propuesta_id=excluded.clase_propuesta_id
 RETURNING * INTO result;
 RETURN result;
END; $$;
CREATE FUNCTION public.iniciacion_guardar_valoracion(p_candidato uuid,p_ronda integer,p_notas jsonb,p_observacion text,p_clase uuid DEFAULT NULL)
RETURNS public.iniciacion_valoraciones LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT soi_security.iniciacion_guardar_valoracion(p_candidato,p_ronda,p_notas,p_observacion,p_clase); $$;

CREATE FUNCTION soi_security.iniciacion_decidir(p_candidato uuid,p_version integer,p_accion text,p_datos jsonb)
RETURNS public.iniciacion_candidatos LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.iniciacion_candidatos; c public.iniciacion_convocatorias; target public.clases; enrollment public.alumnos_clases;
 previous jsonb; review date; note text:=btrim(p_datos->>'observacion'); jury_count integer; today date:=(now() AT TIME ZONE 'America/Santo_Domingo')::date;
 slot_day text:=nullif(p_datos->>'dia',''); slot_start time:=nullif(p_datos->>'hora_inicio','')::time; slot_end time:=nullif(p_datos->>'hora_fin','')::time;
BEGIN
 IF auth.uid() IS NULL OR NOT soi_security.iniciacion_admin() THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Solo coordinación puede decidir'; END IF;
 SELECT * INTO STRICT a FROM public.iniciacion_candidatos WHERE id=p_candidato FOR UPDATE;
 IF a.version IS DISTINCT FROM p_version THEN RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='La candidatura cambió; recargue antes de decidir'; END IF;
 IF note IS NULL OR note='' THEN RAISE EXCEPTION 'La decisión requiere observación'; END IF;
 SELECT * INTO STRICT c FROM public.iniciacion_convocatorias WHERE id=a.convocatoria_id AND estado='abierta';
 IF a.estado NOT IN ('pendiente','invitado') THEN RAISE EXCEPTION 'Esta candidatura ya está finalizada'; END IF;
 SELECT count(*) INTO jury_count FROM public.iniciacion_valoraciones WHERE candidato_id=a.id AND ronda=a.ronda AND completa;
 IF jury_count < (CASE WHEN a.ronda=0 THEN c.min_jurados ELSE 1 END) THEN RAISE EXCEPTION 'Faltan valoraciones completas para decidir'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=c.clase_origen_id AND activo IS TRUE) THEN RAISE EXCEPTION 'Revise la matrícula de Iniciación antes de decidir'; END IF;
 previous:=to_jsonb(a);
 IF p_accion='invitar' THEN
  IF a.estado<>'pendiente' THEN RAISE EXCEPTION 'El alumno ya tiene invitación'; END IF;
  IF coalesce(length(btrim(p_datos->>'objetivos')),0)=0 THEN RAISE EXCEPTION 'Defina los objetivos de la invitación'; END IF;
  review:=(p_datos->>'revision_fecha')::date;
  IF review IS NULL OR review<=today THEN RAISE EXCEPTION 'La revisión debe ser futura'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('iniciacion-clase:'||(p_datos->>'clase_destino_id'),0));
  SELECT * INTO STRICT target FROM public.clases WHERE id=(p_datos->>'clase_destino_id')::uuid AND activo IS TRUE FOR UPDATE;
  IF target.id=c.clase_origen_id THEN RAISE EXCEPTION 'Destino y origen deben ser distintos'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.alumnos WHERE id=a.alumno_id AND activo IS TRUE) THEN RAISE EXCEPTION 'Alumno inactivo'; END IF;
  SELECT * INTO enrollment FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=target.id FOR UPDATE;
  IF FOUND AND enrollment.activo IS TRUE THEN RAISE EXCEPTION 'El alumno ya está inscrito en destino'; END IF;
  IF target.capacidad_maxima IS NULL OR (SELECT count(*) FROM public.alumnos_clases WHERE clase_id=target.id AND activo IS TRUE)>=target.capacidad_maxima THEN RAISE EXCEPTION 'Clase sin cupo disponible o capacidad definida'; END IF;
  IF target.tipo_clase='rotativa' THEN
   IF slot_day IS NULL OR slot_start IS NULL OR slot_end IS NULL OR slot_end<=slot_start OR NOT EXISTS(SELECT 1 FROM public.clase_horarios h WHERE h.clase_id=target.id AND h.dia=slot_day AND h.hora_inicio<=slot_start AND h.hora_fin>=slot_end) THEN RAISE EXCEPTION 'Defina un turno válido para la clase rotativa'; END IF;
   IF EXISTS(SELECT 1 FROM public.alumnos_clases ac WHERE ac.clase_id=target.id AND ac.activo IS TRUE AND ac.dia=slot_day
    AND ac.hora_inicio<slot_end AND slot_start<ac.hora_fin AND (ac.hora_inicio,ac.hora_fin) IS DISTINCT FROM (slot_start,slot_end)) THEN
     RAISE EXCEPTION 'El turno se cruza parcialmente con otro turno de la clase'; END IF;
  ELSE slot_day:=NULL; slot_start:=NULL; slot_end:=NULL; END IF;
  IF EXISTS(SELECT 1 FROM public.clase_horarios h JOIN public.alumnos_clases ac ON ac.alumno_id=a.alumno_id AND ac.activo IS TRUE JOIN public.clase_horarios other ON other.clase_id=ac.clase_id
   WHERE h.clase_id=target.id AND coalesce(slot_day,h.dia)=coalesce(ac.dia,other.dia)
   AND coalesce(slot_start,h.hora_inicio)<coalesce(ac.hora_fin,other.hora_fin) AND coalesce(ac.hora_inicio,other.hora_inicio)<coalesce(slot_end,h.hora_fin))
   AND coalesce(length(btrim(p_datos->>'motivo_solapamiento')),0)=0 THEN RAISE EXCEPTION 'Hay solapamiento; coordinación debe justificar el acuerdo'; END IF;
  INSERT INTO public.alumnos_clases(alumno_id,clase_id,activo,condicion,invitacion_revision,audicion_candidato_id,fecha_inscripcion,dia,hora_inicio,hora_fin)
   VALUES(a.alumno_id,target.id,true,'invitado',review,a.id,today,slot_day,slot_start,slot_end)
   ON CONFLICT(alumno_id,clase_id) DO UPDATE SET activo=true,condicion='invitado',invitacion_revision=review,audicion_candidato_id=a.id,fecha_inscripcion=today,dia=slot_day,hora_inicio=slot_start,hora_fin=slot_end
   RETURNING * INTO enrollment;
  UPDATE public.iniciacion_candidatos SET estado='invitado',ronda=1,version=version+1,clase_destino_id=target.id,inscripcion_id=enrollment.id,revision_fecha=review,objetivos=p_datos->>'objetivos' WHERE id=a.id RETURNING * INTO a;
 ELSIF p_accion IN ('confirmar','prorrogar','continuar') THEN
  IF p_accion<>'continuar' AND a.estado<>'invitado' THEN RAISE EXCEPTION 'Se requiere una invitación vigente'; END IF;
  IF a.estado='invitado' THEN
   PERFORM 1 FROM public.alumnos_clases WHERE id=a.inscripcion_id AND activo IS TRUE AND audicion_candidato_id=a.id AND condicion='invitado' FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'La matrícula de invitado cambió; revise el expediente'; END IF;
  END IF;
  IF p_accion='prorrogar' THEN
   review:=(p_datos->>'revision_fecha')::date;
   IF review IS NULL OR review<=today OR review<=a.revision_fecha THEN RAISE EXCEPTION 'La prórroga requiere una revisión futura posterior'; END IF;
   UPDATE public.alumnos_clases SET invitacion_revision=review WHERE id=a.inscripcion_id;
   UPDATE public.iniciacion_candidatos SET ronda=ronda+1,revision_fecha=review,version=version+1 WHERE id=a.id RETURNING * INTO a;
  ELSE
   IF a.estado='invitado' THEN UPDATE public.alumnos_clases SET condicion='fijo',invitacion_revision=NULL,activo=(p_accion='confirmar') WHERE id=a.inscripcion_id; END IF;
   UPDATE public.iniciacion_candidatos SET estado=CASE WHEN p_accion='confirmar' THEN 'fijo' ELSE 'continua_iniciacion' END,revision_fecha=NULL,version=version+1 WHERE id=a.id RETURNING * INTO a;
  END IF;
 ELSE RAISE EXCEPTION 'Decisión desconocida'; END IF;
 INSERT INTO public.iniciacion_decisiones(candidato_id,accion,observacion,datos,antes,despues,actor_id) VALUES(a.id,p_accion,note,p_datos,previous,to_jsonb(a),auth.uid());
 RETURN a;
END; $$;
CREATE FUNCTION public.iniciacion_decidir(p_candidato uuid,p_version integer,p_accion text,p_datos jsonb)
RETURNS public.iniciacion_candidatos LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT soi_security.iniciacion_decidir(p_candidato,p_version,p_accion,p_datos); $$;
-- Todas las funciones nuevas pierden EXECUTE PUBLIC/anon. Helpers privilegiados solo en esquema privado.
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','soi_security') AND p.proname LIKE 'iniciacion_%' LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon',f.signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f.signature);
 END LOOP;
END $$;
COMMIT;
