-- Evolución del PR158. Escritores: iniciacion_semestre RPC + semesterView/DataAdapter.
-- Primera fila: coordinación al crear su convocatoria del piloto (fecha pendiente de fijar;
-- no aplicar producción hasta fijarla y comprobar respaldo y ensayo equivalente).
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE public.iniciacion_convocatorias ADD COLUMN tipo text NOT NULL DEFAULT 'medio' CHECK(tipo IN ('medio','final')),
 ADD COLUMN periodo text NOT NULL DEFAULT '', ADD COLUMN clases_origen uuid[] NOT NULL DEFAULT '{}',
 ADD COLUMN responsables uuid[] NOT NULL DEFAULT '{}', ADD COLUMN publicada boolean NOT NULL DEFAULT false,
 ADD COLUMN version integer NOT NULL DEFAULT 0;
UPDATE public.iniciacion_convocatorias SET clases_origen=ARRAY[clase_origen_id];
ALTER TABLE public.iniciacion_convocatorias DROP CONSTRAINT iniciacion_convocatorias_estado_check;
ALTER TABLE public.iniciacion_convocatorias ADD CONSTRAINT iniciacion_convocatorias_estado_check CHECK(estado IN ('borrador','abierta','cerrada'));
ALTER TABLE public.iniciacion_candidatos ADD COLUMN resultado text NOT NULL DEFAULT 'pendiente' CHECK(resultado IN ('pendiente','preparado','continuar','evidencia','ausente')),
 ADD COLUMN conclusion_jurado text NOT NULL DEFAULT '', ADD COLUMN conclusion text NOT NULL DEFAULT '', ADD COLUMN fortalezas text NOT NULL DEFAULT '', ADD COLUMN apoyos text NOT NULL DEFAULT '',
 ADD COLUMN preferencia jsonb, ADD COLUMN regular_clase_id uuid REFERENCES public.clases(id), ADD COLUMN excepcion_regular jsonb;
ALTER TABLE public.iniciacion_decisiones ALTER COLUMN candidato_id DROP NOT NULL,
 ADD COLUMN convocatoria_id uuid REFERENCES public.iniciacion_convocatorias(id), ADD COLUMN invitacion_id uuid, ADD COLUMN operacion_id uuid UNIQUE;
ALTER TABLE public.iniciacion_decisiones DROP CONSTRAINT iniciacion_decisiones_accion_check;
DROP INDEX public.iniciacion_decision_version;
CREATE TABLE public.iniciacion_invitaciones (
 -- policy:exento-institucion_id razón: hereda núcleo alumnos/clases de institución única; ámbito y FKs compuestas antes de admitir otra institución.
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidato_id uuid NOT NULL REFERENCES public.iniciacion_candidatos(id),
 alumno_id uuid NOT NULL REFERENCES public.alumnos(id),
 clase_id uuid NOT NULL REFERENCES public.clases(id), estado text NOT NULL DEFAULT 'autorizada' CHECK(estado IN ('autorizada','invitado','fijo','finalizada','revocada')),
 objetivos text NOT NULL CHECK(length(btrim(objetivos))>0), inicio date NOT NULL, revision date NOT NULL,
 version integer NOT NULL DEFAULT 0, ronda integer NOT NULL DEFAULT 1,
 recurso_referencia text, recurso_comprobado_at timestamptz, recurso_comprobado_por uuid REFERENCES public.profiles(id),
 requiere_instrumento boolean NOT NULL, comprobacion text NOT NULL CHECK(length(btrim(comprobacion))>0),
 excepcion_horario text, dia text, hora_inicio time, hora_fin time,
 inscripcion_id uuid REFERENCES public.alumnos_clases(id), convocatoria_final_id uuid REFERENCES public.iniciacion_convocatorias(id),
 creado_por uuid NOT NULL REFERENCES public.profiles(id), creado_at timestamptz NOT NULL DEFAULT now(),
 CHECK(revision>inicio), CHECK(NOT requiere_instrumento OR coalesce(length(btrim(recurso_referencia)),0)>0)
);
CREATE UNIQUE INDEX iniciacion_destino_vigente ON public.iniciacion_invitaciones(alumno_id,clase_id) WHERE estado IN ('autorizada','invitado','fijo');
CREATE UNIQUE INDEX iniciacion_recurso_reservado ON public.iniciacion_invitaciones(lower(btrim(recurso_referencia))) WHERE requiere_instrumento AND estado IN ('autorizada','invitado','fijo');
CREATE INDEX ON public.iniciacion_invitaciones(clase_id);
CREATE INDEX ON public.iniciacion_invitaciones(convocatoria_final_id);
ALTER TABLE public.iniciacion_decisiones ADD CONSTRAINT iniciacion_evento_invitacion_fk FOREIGN KEY(invitacion_id) REFERENCES public.iniciacion_invitaciones(id);
ALTER TABLE public.iniciacion_valoraciones ADD COLUMN invitacion_id uuid REFERENCES public.iniciacion_invitaciones(id),
 ADD COLUMN recomendacion text NOT NULL DEFAULT '', ADD COLUMN fortalezas text NOT NULL DEFAULT '', ADD COLUMN apoyos text NOT NULL DEFAULT '';
ALTER TABLE public.iniciacion_valoraciones DROP CONSTRAINT iniciacion_valoraciones_candidato_id_ronda_jurado_id_key;
CREATE UNIQUE INDEX iniciacion_valoracion_destino ON public.iniciacion_valoraciones(candidato_id,ronda,jurado_id,coalesce(invitacion_id,'00000000-0000-0000-0000-000000000000'::uuid));
-- La v1 no queda como vía alternativa de inscripción ni de escritura.
REVOKE INSERT ON public.iniciacion_convocatorias,public.iniciacion_candidatos FROM authenticated;
REVOKE INSERT(nombre,clase_origen_id,cohorte_desde,cohorte_hasta,fecha_audicion,jurados,min_jurados,rubrica) ON public.iniciacion_convocatorias FROM authenticated;
REVOKE INSERT(convocatoria_id,alumno_id,motivo_excepcion) ON public.iniciacion_candidatos FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.iniciacion_decidir(uuid,integer,text,jsonb),soi_security.iniciacion_decidir(uuid,integer,text,jsonb),public.iniciacion_guardar_valoracion(uuid,integer,jsonb,text,uuid),soi_security.iniciacion_guardar_valoracion(uuid,integer,jsonb,text,uuid) FROM authenticated;
DROP TRIGGER iniciacion_validar_convocatoria ON public.iniciacion_convocatorias;
DROP TRIGGER iniciacion_validar_candidato ON public.iniciacion_candidatos;
DROP TRIGGER iniciacion_validar_valoracion ON public.iniciacion_valoraciones;

CREATE FUNCTION soi_security.semestre_activo() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT auth.uid() IS NOT NULL AND soi_security.has_role(ARRAY['admin','maestro','jurado','direccion','coordinacion_academica','superadmin']); $$;
CREATE FUNCTION soi_security.semestre_decide(cid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT soi_security.semestre_activo() AND EXISTS(SELECT 1 FROM public.iniciacion_convocatorias WHERE id=cid AND auth.uid()=ANY(responsables)); $$;
CREATE FUNCTION soi_security.semestre_gestiona(cid uuid DEFAULT NULL) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT soi_security.semestre_activo() AND (soi_security.iniciacion_admin() OR soi_security.semestre_decide(cid)); $$;
CREATE OR REPLACE FUNCTION soi_security.iniciacion_ver(p_conv uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT soi_security.semestre_gestiona(p_conv) OR (soi_security.semestre_activo() AND EXISTS(SELECT 1 FROM public.iniciacion_convocatorias WHERE id=p_conv AND auth.uid()=ANY(jurados))); $$;
CREATE OR REPLACE FUNCTION soi_security.iniciacion_candidato_ver(p_candidato uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT soi_security.semestre_activo() AND EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=p_candidato AND (soi_security.iniciacion_ver(a.convocatoria_id) OR EXISTS(SELECT 1 FROM public.iniciacion_invitaciones i WHERE i.candidato_id=a.id AND soi_security.assigned_maestro(i.clase_id)))); $$;
ALTER TABLE public.iniciacion_invitaciones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iniciacion_invitaciones FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.iniciacion_invitaciones TO authenticated;
CREATE POLICY iniciacion_invitacion_read ON public.iniciacion_invitaciones FOR SELECT TO authenticated USING(soi_security.semestre_activo() AND (soi_security.assigned_maestro(clase_id) OR EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=candidato_id AND soi_security.semestre_gestiona(a.convocatoria_id))));
DROP POLICY iniciacion_decision_read ON public.iniciacion_decisiones;
CREATE POLICY iniciacion_decision_read ON public.iniciacion_decisiones FOR SELECT TO authenticated USING(soi_security.semestre_gestiona(convocatoria_id));
DROP POLICY iniciacion_valoracion_read ON public.iniciacion_valoraciones;
CREATE POLICY iniciacion_valoracion_read ON public.iniciacion_valoraciones FOR SELECT TO authenticated USING(soi_security.semestre_activo() AND EXISTS(SELECT 1 FROM public.iniciacion_candidatos a WHERE a.id=candidato_id AND (soi_security.semestre_gestiona(a.convocatoria_id) OR (jurado_id=auth.uid() AND soi_security.iniciacion_ver(a.convocatoria_id)))));

CREATE FUNCTION soi_security.semestre_evento(cid uuid,aid uuid,iid uuid,action text,note text,details jsonb,before_state jsonb,after_state jsonb) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 INSERT INTO public.iniciacion_decisiones(convocatoria_id,candidato_id,invitacion_id,accion,observacion,datos,antes,despues,actor_id,operacion_id)
 VALUES(cid,aid,iid,action,coalesce(nullif(btrim(note),''),'Registro operativo'),coalesce(details,'{}'),coalesce(before_state,'{}'),coalesce(after_state,'{}'),auth.uid(),nullif(details->>'operacion_id','')::uuid); $$;
-- Solo el despachador autorizado utiliza este escritor interno.
REVOKE ALL ON FUNCTION soi_security.semestre_evento(uuid,uuid,uuid,text,text,jsonb,jsonb,jsonb) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION soi_security.semestre_cupo(i public.iniciacion_invitaciones, alumno uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE t public.clases; n integer;
BEGIN
 -- Comparte candado con TODOS los INSERT/UPDATE ordinarios de alumnos_clases (trigger v1).
 PERFORM pg_advisory_xact_lock(hashtextextended('iniciacion-clase:'||i.clase_id::text,0));
 SELECT * INTO STRICT t FROM public.clases WHERE id=i.clase_id AND activo IS TRUE FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM public.alumnos WHERE id=alumno AND activo IS TRUE) THEN RAISE EXCEPTION 'Alumno inactivo'; END IF;
 SELECT count(*) INTO n FROM public.alumnos_clases WHERE clase_id=t.id AND activo IS TRUE;
 IF t.capacidad_maxima IS NULL OR n>=t.capacidad_maxima THEN RAISE EXCEPTION 'Clase sin cupo disponible o capacidad definida'; END IF;
 IF t.tipo_clase='rotativa' AND (i.dia IS NULL OR i.hora_inicio IS NULL OR i.hora_fin<=i.hora_inicio OR NOT EXISTS(SELECT 1 FROM public.clase_horarios WHERE clase_id=t.id AND dia=i.dia AND hora_inicio<=i.hora_inicio AND hora_fin>=i.hora_fin)) THEN RAISE EXCEPTION 'Defina un turno válido para la clase rotativa'; END IF;
 IF t.tipo_clase='rotativa' AND EXISTS(SELECT 1 FROM public.alumnos_clases ac WHERE ac.clase_id=t.id AND ac.activo IS TRUE AND ac.dia=i.dia AND ac.hora_inicio<i.hora_fin AND i.hora_inicio<ac.hora_fin AND (ac.hora_inicio,ac.hora_fin) IS DISTINCT FROM(i.hora_inicio,i.hora_fin)) THEN RAISE EXCEPTION 'El turno se cruza parcialmente con otro turno'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.clase_horarios WHERE clase_id=t.id) THEN RAISE EXCEPTION 'Defina el horario de destino antes de incorporar'; END IF;
 IF EXISTS(SELECT 1 FROM public.clase_horarios h JOIN public.alumnos_clases ac ON ac.alumno_id=alumno AND ac.activo IS TRUE JOIN public.clase_horarios other ON other.clase_id=ac.clase_id
 WHERE h.clase_id=t.id AND coalesce(i.dia,h.dia)=coalesce(ac.dia,other.dia) AND coalesce(i.hora_inicio,h.hora_inicio)<coalesce(ac.hora_fin,other.hora_fin) AND coalesce(ac.hora_inicio,other.hora_inicio)<coalesce(i.hora_fin,h.hora_fin)) AND coalesce(length(btrim(i.excepcion_horario)),0)=0 THEN RAISE EXCEPTION 'Hay solapamiento; coordinación debe documentar el acuerdo'; END IF;
END; $$;
REVOKE ALL ON FUNCTION soi_security.semestre_cupo(public.iniciacion_invitaciones,uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION soi_security.semestre_reporte(cid uuid,aid uuid DEFAULT NULL) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('convocatoria',c.nombre,'periodo',c.periodo,'tipo',c.tipo,'fecha',c.fecha_audicion,'emitido',now(),
 'totales',(SELECT jsonb_build_object('convocados',count(*),'preparados',count(*) FILTER(WHERE resultado='preparado'),'continuar',count(*) FILTER(WHERE resultado='continuar'),'ausentes',count(*) FILTER(WHERE resultado='ausente'),'pendientes',count(*) FILTER(WHERE resultado IN ('pendiente','evidencia')),'evaluados',(SELECT count(DISTINCT v.candidato_id) FROM public.iniciacion_valoraciones v JOIN public.iniciacion_candidatos va ON va.id=v.candidato_id WHERE va.convocatoria_id=c.id AND (aid IS NULL OR va.id=aid) AND v.jurado_id=ANY(c.jurados))) FROM public.iniciacion_candidatos WHERE convocatoria_id=c.id AND (aid IS NULL OR id=aid)),
 'alumnos',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'nombre',a.alumno_nombre,'resultado',a.resultado,'conclusion',a.conclusion,'fortalezas',a.fortalezas,'apoyos',a.apoyos,
 'criterios',c.rubrica,'valoraciones',(SELECT coalesce(jsonb_agg(jsonb_build_object('notas',v.notas,'fortalezas',v.fortalezas,'apoyos',v.apoyos,'destino',v.invitacion_id)),'[]') FROM public.iniciacion_valoraciones v WHERE v.candidato_id=a.id AND v.jurado_id=ANY(c.jurados)),
 'destinos',(SELECT coalesce(jsonb_agg(jsonb_build_object('clase',cl.nombre,'instrumento',cl.instrumento,'estado',i.estado,'inicio',i.inicio,'revision',i.revision,'objetivos',i.objetivos,'horarios',(SELECT coalesce(jsonb_agg(jsonb_build_object('dia',h.dia,'inicio',h.hora_inicio,'fin',h.hora_fin)),'[]') FROM public.clase_horarios h WHERE h.clase_id=cl.id))),'[]') FROM public.iniciacion_invitaciones i JOIN public.clases cl ON cl.id=i.clase_id WHERE (i.candidato_id=a.id OR EXISTS(SELECT 1 FROM public.iniciacion_valoraciones rv WHERE rv.candidato_id=a.id AND rv.invitacion_id=i.id)) AND i.estado<>'revocada'))) FROM public.iniciacion_candidatos a WHERE a.convocatoria_id=c.id AND (aid IS NULL OR a.id=aid)),'[]')) FROM public.iniciacion_convocatorias c WHERE c.id=cid; $$;
REVOKE ALL ON FUNCTION soi_security.semestre_reporte(uuid,uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION soi_security.iniciacion_semestre(p_accion text,p_datos jsonb DEFAULT '{}') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.iniciacion_convocatorias; a public.iniciacion_candidatos; i public.iniciacion_invitaciones; cl public.clases; en public.alumnos_clases; ev public.iniciacion_decisiones;
 cid uuid; aid uuid; iid uuid; ids uuid[]; owners uuid[]; sources uuid[]; j uuid; criterion jsonb; score jsonb; complete boolean; observed integer; minscore integer; maxscore integer; n integer;
 before_state jsonb; report jsonb; details jsonb; result jsonb; today date := (now() AT TIME ZONE 'America/Santo_Domingo')::date;
BEGIN
 IF NOT soi_security.semestre_activo() THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Se requiere un perfil académico activo'; END IF;
 -- Serializa mutaciones del módulo entre convocatorias inicial/final; cupos además usan candado por clase.
 IF p_accion NOT IN ('contexto','detalle','alumnos_origen','expediente') THEN PERFORM pg_advisory_xact_lock(hashtextextended('iniciacion-semestre-mutacion',0)); END IF;
 IF p_accion='contexto' THEN
  RETURN jsonb_build_object('user',(SELECT jsonb_build_object('id',id,'nombre',nombre_completo,'canManage',soi_security.semestre_gestiona()) FROM public.profiles WHERE id=auth.uid()),
   'jurados',CASE WHEN soi_security.semestre_gestiona() OR EXISTS(SELECT 1 FROM public.iniciacion_convocatorias WHERE auth.uid()=ANY(responsables)) THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'nombre',nombre_completo)),'[]') FROM public.profiles WHERE activo IS TRUE AND estado='activo' AND rol IN ('admin','maestro','jurado','direccion','coordinacion_academica','superadmin')) ELSE '[]'::jsonb END,
   'clases',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'nombre',nombre,'instrumento',instrumento,'tipo_clase',tipo_clase,'es_clase_iniciacion',es_clase_iniciacion,'receptor',soi_security.assigned_maestro(id))),'[]') FROM public.clases WHERE activo IS TRUE),
   'convocatorias',(SELECT coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('canDecide',soi_security.semestre_decide(x.id),'canManage',soi_security.semestre_gestiona(x.id)) ORDER BY creado_at DESC),'[]') FROM public.iniciacion_convocatorias x WHERE soi_security.iniciacion_ver(x.id)),
   'invitaciones',(SELECT coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('convocatoria_id',ca.convocatoria_id,'alumno_nombre',ca.alumno_nombre,'clase_nombre',target.nombre)),'[]') FROM public.iniciacion_invitaciones x JOIN public.iniciacion_candidatos ca ON ca.id=x.candidato_id JOIN public.clases target ON target.id=x.clase_id WHERE soi_security.semestre_gestiona(ca.convocatoria_id) OR soi_security.assigned_maestro(x.clase_id)));
 END IF;
 IF p_accion='matriculas_alumno' THEN
  RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('clase',cl.nombre,'condicion',x.estado,'objetivos',x.objetivos,'invitacion_revision',x.revision)),'[]') FROM public.iniciacion_invitaciones x JOIN public.iniciacion_candidatos ca ON ca.id=x.candidato_id JOIN public.clases cl ON cl.id=x.clase_id WHERE x.alumno_id=(p_datos->>'alumno_id')::uuid AND x.estado IN ('invitado','fijo') AND (soi_security.assigned_maestro(x.clase_id) OR soi_security.semestre_gestiona(ca.convocatoria_id)));
 END IF;
 IF p_accion='crear' THEN
  IF NOT soi_security.semestre_gestiona() THEN RAISE EXCEPTION 'Solo administración crea convocatorias'; END IF;
  SELECT array_agg(DISTINCT value::uuid) INTO ids FROM jsonb_array_elements_text(p_datos->'jurados');
  SELECT array_agg(DISTINCT value::uuid) INTO owners FROM jsonb_array_elements_text(p_datos->'responsables');
  SELECT array_agg(DISTINCT value::uuid) INTO sources FROM jsonb_array_elements_text(p_datos->'clases_origen');
  IF coalesce(cardinality(ids),0)=0 OR coalesce(cardinality(owners),0)=0 OR coalesce(cardinality(sources),0)=0 THEN RAISE EXCEPTION 'Seleccione grupos, jurados y responsables académicos'; END IF;
  IF EXISTS(SELECT 1 FROM unnest(ids||owners) x WHERE NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=x AND activo IS TRUE AND estado='activo' AND rol IN ('admin','maestro','jurado','direccion','coordinacion_academica','superadmin'))) THEN RAISE EXCEPTION 'Perfil no activo'; END IF;
  IF EXISTS(SELECT 1 FROM unnest(sources) x WHERE NOT EXISTS(SELECT 1 FROM public.clases WHERE id=x AND activo IS TRUE AND es_clase_iniciacion IS TRUE)) THEN RAISE EXCEPTION 'Seleccione grupos de Iniciación activos'; END IF;
  IF jsonb_typeof(p_datos->'rubrica') IS DISTINCT FROM 'array' OR jsonb_array_length(p_datos->'rubrica')=0 THEN RAISE EXCEPTION 'Defina una rúbrica'; END IF;
  FOR criterion IN SELECT * FROM jsonb_array_elements(p_datos->'rubrica') LOOP
   IF coalesce(criterion->>'key','') !~ '^[a-z][a-z0-9_]{0,39}$' OR coalesce(length(btrim(criterion->>'label')),0)=0 OR jsonb_typeof(criterion->'required') IS DISTINCT FROM 'boolean' OR jsonb_typeof(criterion->'levels') IS DISTINCT FROM 'array' OR jsonb_array_length(criterion->'levels') NOT BETWEEN 2 AND 5 THEN RAISE EXCEPTION 'Criterios y descriptores inválidos'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(criterion->'levels') l WHERE length(btrim(l))=0) THEN RAISE EXCEPTION 'Describa cada nivel'; END IF;
  END LOOP;
  IF (SELECT count(*) FROM jsonb_array_elements(p_datos->'rubrica'))<>(SELECT count(DISTINCT x->>'key') FROM jsonb_array_elements(p_datos->'rubrica') x) THEN RAISE EXCEPTION 'Criterios duplicados'; END IF;
  INSERT INTO public.iniciacion_convocatorias(nombre,clase_origen_id,clases_origen,cohorte_desde,cohorte_hasta,fecha_audicion,jurados,min_jurados,rubrica,tipo,periodo,responsables,estado)
  VALUES(p_datos->>'nombre',sources[1],sources,coalesce((p_datos->>'cohorte_desde')::date,today),coalesce((p_datos->>'cohorte_hasta')::date,today),(p_datos->>'fecha_audicion')::date,ids,(p_datos->>'min_jurados')::integer,p_datos->'rubrica',p_datos->>'tipo',p_datos->>'periodo',owners,'borrador') RETURNING * INTO c;
  IF length(btrim(c.periodo))=0 THEN RAISE EXCEPTION 'Indique el período académico'; END IF;
  PERFORM soi_security.semestre_evento(c.id,NULL,NULL,'crear','Convocatoria y responsables designados',p_datos,'{}',to_jsonb(c)); RETURN to_jsonb(c);
 END IF;
 iid:=nullif(p_datos->>'invitacion_id','')::uuid; aid:=nullif(p_datos->>'candidato_id','')::uuid; cid:=nullif(p_datos->>'convocatoria_id','')::uuid;
 -- Orden fijo: convocatoria → candidato → invitación → recurso → clase → matrícula.
 IF iid IS NOT NULL THEN SELECT candidato_id INTO aid FROM public.iniciacion_invitaciones WHERE id=iid; END IF;
 IF aid IS NOT NULL THEN SELECT convocatoria_id INTO cid FROM public.iniciacion_candidatos WHERE id=aid; END IF;
 SELECT * INTO STRICT c FROM public.iniciacion_convocatorias WHERE id=cid FOR UPDATE;
 IF aid IS NOT NULL THEN SELECT * INTO STRICT a FROM public.iniciacion_candidatos WHERE id=aid AND convocatoria_id=c.id FOR UPDATE; END IF;
 IF iid IS NOT NULL THEN SELECT * INTO STRICT i FROM public.iniciacion_invitaciones WHERE id=iid AND candidato_id=a.id FOR UPDATE; END IF;
 IF p_accion='detalle' THEN
  IF NOT soi_security.iniciacion_ver(c.id) THEN RAISE EXCEPTION 'No autorizado para esta convocatoria'; END IF;
  RETURN jsonb_build_object('candidatos',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY alumno_nombre),'[]') FROM public.iniciacion_candidatos x WHERE convocatoria_id=c.id),
   'valoraciones',(SELECT coalesce(jsonb_agg(to_jsonb(v)),'[]') FROM public.iniciacion_valoraciones v JOIN public.iniciacion_candidatos x ON x.id=v.candidato_id WHERE x.convocatoria_id=c.id AND (soi_security.semestre_gestiona(c.id) OR v.jurado_id=auth.uid())),
   'invitaciones',CASE WHEN soi_security.semestre_gestiona(c.id) THEN (SELECT coalesce(jsonb_agg(to_jsonb(v)),'[]') FROM public.iniciacion_invitaciones v JOIN public.iniciacion_candidatos x ON x.id=v.candidato_id WHERE x.convocatoria_id=c.id) ELSE '[]'::jsonb END,
   'revision_invitaciones',(SELECT coalesce(jsonb_agg(to_jsonb(v)||jsonb_build_object('alumno_id',x.alumno_id,'alumno_nombre',x.alumno_nombre)),'[]') FROM public.iniciacion_invitaciones v JOIN public.iniciacion_candidatos x ON x.id=v.candidato_id WHERE v.convocatoria_final_id=c.id),
   'historial',CASE WHEN soi_security.semestre_gestiona(c.id) THEN (SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY creado_at),'[]') FROM public.iniciacion_decisiones e WHERE convocatoria_id=c.id) ELSE '[]'::jsonb END);
 END IF;
 IF p_accion='comparar' THEN
  IF NOT soi_security.iniciacion_ver(c.id) THEN RAISE EXCEPTION 'No autorizado para revisión final'; END IF;
  SELECT * INTO STRICT i FROM public.iniciacion_invitaciones WHERE id=(p_datos->>'revision_id')::uuid AND convocatoria_final_id=c.id;
  SELECT * INTO STRICT a FROM public.iniciacion_candidatos WHERE id=i.candidato_id;
  RETURN jsonb_build_object('invitacion',to_jsonb(i),'diagnostico',jsonb_build_object('conclusion',a.conclusion,'fortalezas',a.fortalezas,'apoyos',a.apoyos),
   'seguimientos',(SELECT coalesce(jsonb_agg(jsonb_build_object('fecha',creado_at,'datos',datos,'ronda',despues->'ronda') ORDER BY creado_at),'[]') FROM public.iniciacion_decisiones WHERE invitacion_id=i.id AND accion='seguimiento'));
 END IF;
 IF p_accion='alumnos_origen' THEN
  IF NOT soi_security.semestre_gestiona(c.id) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN (SELECT coalesce(jsonb_agg(to_jsonb(x)),'[]') FROM (SELECT DISTINCT al.id,al.nombre_completo,al.fecha_ingreso_iniciacion FROM public.alumnos al JOIN public.alumnos_clases ac ON al.id=ac.alumno_id WHERE al.activo IS TRUE AND ac.activo IS TRUE AND ac.clase_id=ANY(c.clases_origen)) x);
 END IF;
 IF p_accion IN ('abrir','cerrar','jurados','agregar','vincular_final','reabrir') THEN
  IF NOT soi_security.semestre_gestiona(c.id) THEN RAISE EXCEPTION 'Solo gestión de la convocatoria'; END IF;
  IF p_accion<>'reabrir' AND c.publicada THEN RAISE EXCEPTION 'Resultados publicados; requiere reapertura'; END IF;
  IF p_accion='agregar' THEN
   IF c.estado='cerrada' THEN RAISE EXCEPTION 'Convocatoria cerrada'; END IF;
   IF NOT EXISTS(SELECT 1 FROM public.alumnos_clases ac JOIN public.alumnos al ON al.id=ac.alumno_id WHERE al.id=(p_datos->>'alumno_id')::uuid AND al.activo IS TRUE AND ac.activo IS TRUE AND ac.clase_id=ANY(c.clases_origen)) THEN RAISE EXCEPTION 'Sin matrícula activa de origen'; END IF;
   INSERT INTO public.iniciacion_candidatos(convocatoria_id,alumno_id,alumno_nombre,regular_clase_id) SELECT c.id,id,nombre_completo,nullif(p_datos->>'regular_clase_id','')::uuid FROM public.alumnos WHERE id=(p_datos->>'alumno_id')::uuid ON CONFLICT(convocatoria_id,alumno_id) DO NOTHING;
  ELSIF p_accion='vincular_final' THEN
   IF c.tipo<>'final' THEN RAISE EXCEPTION 'Se requiere audición final'; END IF;
   SELECT * INTO STRICT i FROM public.iniciacion_invitaciones WHERE id=(p_datos->>'revision_id')::uuid AND estado='invitado' FOR UPDATE;
   SELECT * INTO STRICT a FROM public.iniciacion_candidatos WHERE id=i.candidato_id;
   IF i.convocatoria_final_id IS NOT NULL THEN RAISE EXCEPTION 'Invitación ya vinculada a revisión'; END IF;
   INSERT INTO public.iniciacion_candidatos(convocatoria_id,alumno_id,alumno_nombre,regular_clase_id) VALUES(c.id,a.alumno_id,a.alumno_nombre,a.regular_clase_id) ON CONFLICT(convocatoria_id,alumno_id) DO NOTHING;
   UPDATE public.iniciacion_invitaciones SET convocatoria_final_id=c.id WHERE id=i.id;
  ELSIF p_accion='jurados' THEN
   IF c.estado='cerrada' THEN RAISE EXCEPTION 'Reabra la convocatoria'; END IF;
   SELECT array_agg(DISTINCT value::uuid) INTO ids FROM jsonb_array_elements_text(p_datos->'jurados');
   IF coalesce(cardinality(ids),0)<c.min_jurados OR EXISTS(SELECT 1 FROM unnest(ids) x WHERE NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=x AND activo IS TRUE AND estado='activo' AND rol IN ('admin','maestro','jurado','direccion','coordinacion_academica','superadmin'))) THEN RAISE EXCEPTION 'Jurados activos insuficientes'; END IF;
   UPDATE public.iniciacion_convocatorias SET jurados=ids,version=version+1 WHERE id=c.id;
   -- Notas retiradas se conservan; NO cuentan en un resultado pendiente. Invalidar resoluciones pendientes.
   UPDATE public.iniciacion_candidatos SET resultado='evidencia',version=version+1 WHERE convocatoria_id=c.id AND resultado NOT IN ('pendiente','ausente');
  ELSIF p_accion='reabrir' THEN
   IF NOT soi_security.semestre_decide(c.id) OR length(btrim(coalesce(p_datos->>'observacion','')))=0 THEN RAISE EXCEPTION 'Reapertura exige autoridad académica y motivo'; END IF;
   UPDATE public.iniciacion_convocatorias SET publicada=false,estado='abierta',version=version+1 WHERE id=c.id;
   UPDATE public.iniciacion_candidatos SET resultado='evidencia',preferencia=NULL,version=version+1 WHERE convocatoria_id=c.id AND resultado<>'ausente';
   UPDATE public.iniciacion_invitaciones SET estado='revocada',version=version+1 WHERE candidato_id IN (SELECT id FROM public.iniciacion_candidatos WHERE convocatoria_id=c.id) AND estado='autorizada';
  ELSE UPDATE public.iniciacion_convocatorias SET estado=CASE WHEN p_accion='abrir' THEN 'abierta' ELSE 'cerrada' END,version=version+1 WHERE id=c.id;
  END IF;
  PERFORM soi_security.semestre_evento(c.id,NULL,NULL,p_accion,p_datos->>'observacion',p_datos,to_jsonb(c),(SELECT to_jsonb(x) FROM public.iniciacion_convocatorias x WHERE id=c.id)); RETURN jsonb_build_object('ok',true);
 END IF;
 IF p_accion='valorar' THEN
  IF NOT auth.uid()=ANY(c.jurados) OR c.estado<>'abierta' OR c.publicada THEN RAISE EXCEPTION 'No está autorizado como jurado activo de esta convocatoria'; END IF;
  iid:=nullif(p_datos->>'destino_revision_id','')::uuid;
  IF c.tipo='final' THEN
   IF iid IS NULL OR NOT EXISTS(SELECT 1 FROM public.iniciacion_invitaciones x JOIN public.iniciacion_candidatos y ON y.id=x.candidato_id WHERE x.id=iid AND x.convocatoria_final_id=c.id AND x.estado='invitado' AND y.alumno_id=a.alumno_id) THEN RAISE EXCEPTION 'Seleccione la invitación que evalúa'; END IF;
  ELSIF iid IS NOT NULL THEN RAISE EXCEPTION 'Diagnóstico sin destino preasignado'; END IF;
  complete:=true; observed:=0;
  IF jsonb_typeof(p_datos->'notas') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Notas inválidas'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(p_datos->'notas') k WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(c.rubrica) x WHERE x->>'key'=k)) THEN RAISE EXCEPTION 'Criterio desconocido'; END IF;
  FOR criterion IN SELECT * FROM jsonb_array_elements(c.rubrica) LOOP
   score:=p_datos->'notas'->(criterion->>'key'); maxscore:=jsonb_array_length(criterion->'levels');
   IF score IS NULL OR score='null'::jsonb THEN IF (criterion->>'required')::boolean THEN complete:=false; END IF;
   ELSIF jsonb_typeof(score)<>'number' OR score::text !~ '^[1-5]$' OR score::integer>maxscore THEN RAISE EXCEPTION 'Nota fuera de la escala configurada'; ELSE observed:=observed+1; END IF;
  END LOOP;
  IF length(btrim(coalesce(p_datos->>'observacion','')))=0 OR coalesce(p_datos->>'recomendacion','') NOT IN ('preparado','continuar','evidencia') THEN RAISE EXCEPTION 'Registre evidencia y recomendación'; END IF;
  INSERT INTO public.iniciacion_valoraciones(candidato_id,ronda,jurado_id,notas,observacion,completa,invitacion_id,recomendacion,fortalezas,apoyos)
  VALUES(a.id,coalesce((SELECT ronda FROM public.iniciacion_invitaciones WHERE id=iid),0),auth.uid(),p_datos->'notas',p_datos->>'observacion',complete AND observed>0,iid,p_datos->>'recomendacion',coalesce(p_datos->>'fortalezas',''),coalesce(p_datos->>'apoyos',''))
  ON CONFLICT(candidato_id,ronda,jurado_id,(coalesce(invitacion_id,'00000000-0000-0000-0000-000000000000'::uuid))) DO UPDATE SET notas=excluded.notas,observacion=excluded.observacion,completa=excluded.completa,recomendacion=excluded.recomendacion,fortalezas=excluded.fortalezas,apoyos=excluded.apoyos,actualizado_at=now();
  UPDATE public.iniciacion_candidatos SET resultado=CASE WHEN resultado='pendiente' THEN resultado ELSE 'evidencia' END,version=version+1 WHERE id=a.id;
  PERFORM soi_security.semestre_evento(c.id,a.id,iid,'valorar',p_datos->>'observacion',p_datos,'{}','{}'); RETURN jsonb_build_object('ok',true);
 END IF;
 IF p_accion IN ('preferencia','resolver','publicar','autorizar','excepcion_regular','regularizar','revocar','resolver_invitacion','informe','comunicacion','entrega') THEN
  IF NOT soi_security.semestre_decide(c.id) THEN RAISE EXCEPTION 'Solo el responsable académico designado puede decidir'; END IF;
 END IF;
 IF p_accion IN ('resolver','preferencia','autorizar','excepcion_regular','regularizar') AND a.version IS DISTINCT FROM (p_datos->>'version')::integer THEN RAISE EXCEPTION 'El expediente cambió; recargue'; END IF;
 IF p_accion='resolver' THEN
  IF c.estado<>'abierta' OR c.publicada THEN RAISE EXCEPTION 'Reabra los resultados'; END IF;
  IF p_datos->>'resultado' NOT IN ('preparado','continuar','evidencia','ausente') OR length(btrim(coalesce(p_datos->>'conclusion','')))=0 OR length(btrim(coalesce(p_datos->>'conclusion_jurado','')))=0 THEN RAISE EXCEPTION 'Registre conclusión del jurado y resolución académica'; END IF;
  IF p_datos->>'resultado' IN ('preparado','continuar') THEN
   IF c.tipo='medio' AND (SELECT count(*) FROM public.iniciacion_valoraciones WHERE candidato_id=a.id AND invitacion_id IS NULL AND completa AND jurado_id=ANY(c.jurados))<c.min_jurados THEN RAISE EXCEPTION 'Faltan valoraciones completas'; END IF;
   IF c.tipo='final' AND (NOT EXISTS(SELECT 1 FROM public.iniciacion_invitaciones WHERE convocatoria_final_id=c.id AND candidato_id IN(SELECT id FROM public.iniciacion_candidatos WHERE alumno_id=a.alumno_id)) OR EXISTS(SELECT 1 FROM public.iniciacion_invitaciones x JOIN public.iniciacion_candidatos y ON y.id=x.candidato_id WHERE x.convocatoria_final_id=c.id AND y.alumno_id=a.alumno_id AND (SELECT count(*) FROM public.iniciacion_valoraciones WHERE candidato_id=a.id AND invitacion_id=x.id AND ronda=x.ronda AND completa AND jurado_id=ANY(c.jurados))<c.min_jurados)) THEN RAISE EXCEPTION 'Faltan valoraciones finales por destino'; END IF;
  END IF;
  before_state:=to_jsonb(a);
  UPDATE public.iniciacion_candidatos SET resultado=p_datos->>'resultado',conclusion_jurado=p_datos->>'conclusion_jurado',conclusion=p_datos->>'conclusion',fortalezas=coalesce(p_datos->>'fortalezas',''),apoyos=coalesce(p_datos->>'apoyos',''),version=version+1 WHERE id=a.id RETURNING * INTO a;
  PERFORM soi_security.semestre_evento(c.id,a.id,NULL,'resolver',a.conclusion,p_datos,before_state,to_jsonb(a)); RETURN to_jsonb(a);
 ELSIF p_accion='publicar' THEN
  IF c.publicada THEN RETURN to_jsonb(c); END IF;
  IF EXISTS(SELECT 1 FROM public.iniciacion_candidatos WHERE convocatoria_id=c.id AND resultado='pendiente') OR NOT EXISTS(SELECT 1 FROM public.iniciacion_candidatos WHERE convocatoria_id=c.id) THEN RAISE EXCEPTION 'Resuelva los candidatos; puede indicar pendiente de evidencia o ausente'; END IF;
  UPDATE public.iniciacion_convocatorias SET publicada=true,estado='cerrada',version=version+1 WHERE id=c.id RETURNING * INTO c;
  PERFORM soi_security.semestre_evento(c.id,NULL,NULL,'publicar','Resultados revisados y publicados',p_datos,'{}',to_jsonb(c)); RETURN to_jsonb(c);
 ELSIF p_accion='preferencia' THEN
  IF a.resultado<>'preparado' OR NOT c.publicada OR c.tipo<>'medio' THEN RAISE EXCEPTION 'La consulta de preferencia sigue a la aprobación publicada'; END IF;
  IF length(btrim(coalesce(p_datos->>'preferencia','')))=0 THEN RAISE EXCEPTION 'Registre la preferencia consultada'; END IF;
  UPDATE public.iniciacion_candidatos SET preferencia=jsonb_build_object('texto',p_datos->>'preferencia','consultado_at',now(),'actor',auth.uid()),version=version+1 WHERE id=a.id RETURNING * INTO a;
  PERFORM soi_security.semestre_evento(c.id,a.id,NULL,'preferencia','Preferencia consultada después de aprobar',p_datos,'{}',to_jsonb(a)); RETURN to_jsonb(a);
 ELSIF p_accion IN ('regularizar','excepcion_regular') THEN
  IF p_accion='regularizar' THEN
   IF NOT EXISTS(SELECT 1 FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=(p_datos->>'regular_clase_id')::uuid AND activo IS TRUE) THEN RAISE EXCEPTION 'Seleccione una matrícula regular activa'; END IF;
   UPDATE public.iniciacion_candidatos SET regular_clase_id=(p_datos->>'regular_clase_id')::uuid,excepcion_regular=NULL,version=version+1 WHERE id=a.id;
  ELSE
   IF length(btrim(coalesce(p_datos->>'observacion','')))=0 OR (p_datos->>'revision')::date IS NULL OR (p_datos->>'revision')::date<=today THEN RAISE EXCEPTION 'Excepción exige motivo y revisión futura'; END IF;
   UPDATE public.iniciacion_candidatos SET excepcion_regular=jsonb_build_object('motivo',p_datos->>'observacion','revision',p_datos->>'revision','actor',auth.uid(),'fecha',now()),version=version+1 WHERE id=a.id;
  END IF;
  PERFORM soi_security.semestre_evento(c.id,a.id,NULL,p_accion,p_datos->>'observacion',p_datos,to_jsonb(a),(SELECT to_jsonb(x) FROM public.iniciacion_candidatos x WHERE id=a.id)); RETURN jsonb_build_object('ok',true);
 ELSIF p_accion='autorizar' THEN
  IF NOT c.publicada OR c.tipo<>'medio' OR a.resultado<>'preparado' OR a.preferencia IS NULL THEN RAISE EXCEPTION 'Faltan aprobación publicada y preferencia posterior'; END IF;
  SELECT * INTO STRICT cl FROM public.clases WHERE id=(p_datos->>'clase_id')::uuid AND activo IS TRUE;
  IF cl.id=ANY(c.clases_origen) THEN RAISE EXCEPTION 'Destino y origen deben ser distintos'; END IF;
  IF length(btrim(coalesce(p_datos->>'observacion','')))=0 OR length(btrim(coalesce(p_datos->>'comprobacion','')))=0 THEN RAISE EXCEPTION 'Justifique asignación, disponibilidad y comunicación con la familia'; END IF;
  i.clase_id:=cl.id; i.dia:=nullif(p_datos->>'dia',''); i.hora_inicio:=nullif(p_datos->>'hora_inicio','')::time; i.hora_fin:=nullif(p_datos->>'hora_fin','')::time; i.excepcion_horario:=p_datos->>'excepcion_horario';
  IF EXISTS(SELECT 1 FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=cl.id AND activo IS TRUE) THEN RAISE EXCEPTION 'Ya inscrito en destino; no se convierte matrícula fija'; END IF;
  PERFORM soi_security.semestre_cupo(i,a.alumno_id);
  IF (p_datos->>'inicio')::date IS NULL OR (p_datos->>'revision')::date IS NULL OR (p_datos->>'revision')::date<=greatest(today,(p_datos->>'inicio')::date) THEN RAISE EXCEPTION 'Defina inicio y revisión futura'; END IF;
  IF (p_datos->>'requiere_instrumento')::boolean AND EXISTS(SELECT 1 FROM public.instrumentos WHERE lower(btrim(codigo))=lower(btrim(p_datos->>'recurso_referencia')) AND (estado IS DISTINCT FROM 'disponible' OR (alumno_id IS NOT NULL AND alumno_id<>a.alumno_id))) THEN RAISE EXCEPTION 'El inventario indica que el recurso no está disponible'; END IF;
  INSERT INTO public.iniciacion_invitaciones(candidato_id,alumno_id,clase_id,objetivos,inicio,revision,requiere_instrumento,recurso_referencia,recurso_comprobado_at,recurso_comprobado_por,comprobacion,excepcion_horario,dia,hora_inicio,hora_fin,creado_por)
  VALUES(a.id,a.alumno_id,cl.id,p_datos->>'objetivos',(p_datos->>'inicio')::date,(p_datos->>'revision')::date,(p_datos->>'requiere_instrumento')::boolean,nullif(btrim(p_datos->>'recurso_referencia'),''),now(),auth.uid(),p_datos->>'comprobacion',i.excepcion_horario,i.dia,i.hora_inicio,i.hora_fin,auth.uid()) RETURNING * INTO i;
  PERFORM soi_security.semestre_evento(c.id,a.id,i.id,'autorizar',p_datos->>'observacion',p_datos,'{}',to_jsonb(i)); RETURN to_jsonb(i);
 ELSIF p_accion='incorporar' THEN
  IF NOT soi_security.assigned_maestro(i.clase_id) OR NOT EXISTS(SELECT 1 FROM public.maestros m JOIN public.permisos_maestros pm ON pm.maestro_id=m.id WHERE (m.user_id=auth.uid() OR (m.user_id IS NULL AND m.id=auth.uid())) AND m.activo IS DISTINCT FROM false AND pm.puede_inscribir_clases IS TRUE AND (pm.fecha_inicio IS NULL OR pm.fecha_inicio<=today) AND (pm.fecha_fin IS NULL OR pm.fecha_fin>=today)) THEN RAISE EXCEPTION 'Se requiere receptor asignado con permiso de inscripción vigente'; END IF;
  IF i.estado='invitado' THEN
   SELECT * INTO en FROM public.alumnos_clases WHERE id=i.inscripcion_id AND activo IS TRUE AND condicion='invitado' AND audicion_candidato_id=a.id;
   IF FOUND THEN RETURN to_jsonb(i); END IF; RAISE EXCEPTION 'La matrícula cambió';
  END IF;
  IF i.version IS DISTINCT FROM(p_datos->>'version')::integer OR i.estado<>'autorizada' OR NOT c.publicada OR a.resultado<>'preparado' OR i.revision<=today THEN RAISE EXCEPTION 'Autorización no vigente; recargue'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=a.regular_clase_id AND activo IS TRUE) AND NOT coalesce((a.excepcion_regular->>'revision')::date>=today,false) THEN RAISE EXCEPTION 'Regularice teoría y solfeo o solicite excepción académica'; END IF;
  IF i.requiere_instrumento AND (p_datos->>'recurso_referencia' IS DISTINCT FROM i.recurso_referencia OR p_datos->>'disponibilidad_confirmada' IS DISTINCT FROM 'true') THEN RAISE EXCEPTION 'Confirme nuevamente la disponibilidad del recurso autorizado'; END IF;
  IF i.requiere_instrumento AND EXISTS(SELECT 1 FROM public.instrumentos WHERE lower(btrim(codigo))=lower(btrim(i.recurso_referencia)) AND (estado IS DISTINCT FROM 'disponible' OR (alumno_id IS NOT NULL AND alumno_id<>a.alumno_id))) THEN RAISE EXCEPTION 'El inventario indica que el recurso no está disponible; solicite revisión académica'; END IF;
  -- La comprobación operativa identificada NO es préstamo ni entrega física de inventario.
  PERFORM soi_security.semestre_cupo(i,a.alumno_id);
  SELECT * INTO en FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=i.clase_id FOR UPDATE;
  IF FOUND AND en.activo IS TRUE THEN RAISE EXCEPTION 'Ya existe matrícula activa'; END IF;
  INSERT INTO public.alumnos_clases(alumno_id,clase_id,activo,condicion,invitacion_revision,audicion_candidato_id,fecha_inscripcion,dia,hora_inicio,hora_fin)
  VALUES(a.alumno_id,i.clase_id,true,'invitado',i.revision,a.id,today,i.dia,i.hora_inicio,i.hora_fin)
  ON CONFLICT(alumno_id,clase_id) DO UPDATE SET activo=true,condicion='invitado',invitacion_revision=i.revision,audicion_candidato_id=a.id,fecha_inscripcion=today,dia=i.dia,hora_inicio=i.hora_inicio,hora_fin=i.hora_fin RETURNING * INTO en;
  UPDATE public.iniciacion_invitaciones SET estado='invitado',inscripcion_id=en.id,version=version+1,recurso_comprobado_at=now(),recurso_comprobado_por=auth.uid() WHERE id=i.id RETURNING * INTO i;
  PERFORM soi_security.semestre_evento(c.id,a.id,i.id,'incorporar','Incorporado como invitado; recurso revalidado',p_datos,'{}',to_jsonb(i)); RETURN to_jsonb(i);
 ELSIF p_accion='seguimiento' THEN
  IF i.estado<>'invitado' OR NOT (soi_security.assigned_maestro(i.clase_id) OR soi_security.semestre_decide(c.id)) THEN RAISE EXCEPTION 'Seguimiento reservado al receptor o responsable académico'; END IF;
  IF length(btrim(coalesce(p_datos->>'avances','')))=0 OR length(btrim(coalesce(p_datos->>'apoyos','')))=0 OR length(btrim(coalesce(p_datos->>'recomendacion','')))=0 THEN RAISE EXCEPTION 'Registre avances, dificultades/apoyos y recomendación'; END IF;
  PERFORM soi_security.semestre_evento(c.id,a.id,i.id,'seguimiento',p_datos->>'avances',p_datos,'{}',jsonb_build_object('ronda',i.ronda)); RETURN jsonb_build_object('ok',true);
 ELSIF p_accion='expediente' THEN
  IF NOT (soi_security.assigned_maestro(i.clase_id) OR soi_security.semestre_gestiona(c.id)) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN jsonb_build_object('invitacion',to_jsonb(i),'alumno_nombre',a.alumno_nombre,'diagnostico',jsonb_build_object('conclusion',a.conclusion,'fortalezas',a.fortalezas,'apoyos',a.apoyos),
   'seguimientos',(SELECT coalesce(jsonb_agg(jsonb_build_object('fecha',creado_at,'datos',datos,'ronda',despues->'ronda') ORDER BY creado_at),'[]') FROM public.iniciacion_decisiones WHERE invitacion_id=i.id AND accion='seguimiento'),
   'canDecide',soi_security.semestre_decide(c.id),'regular_activa',EXISTS(SELECT 1 FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=a.regular_clase_id AND activo IS TRUE));
 ELSIF p_accion='revocar' THEN
  IF i.estado<>'autorizada' OR i.version IS DISTINCT FROM(p_datos->>'version')::integer OR length(btrim(coalesce(p_datos->>'observacion','')))=0 THEN RAISE EXCEPTION 'Revocación no válida'; END IF;
  UPDATE public.iniciacion_invitaciones SET estado='revocada',version=version+1 WHERE id=i.id;
  PERFORM soi_security.semestre_evento(c.id,a.id,i.id,'revocar',p_datos->>'observacion',p_datos,to_jsonb(i),'{}'); RETURN jsonb_build_object('ok',true);
 ELSIF p_accion='resolver_invitacion' THEN
  IF i.estado<>'invitado' OR i.version IS DISTINCT FROM(p_datos->>'version')::integer THEN RAISE EXCEPTION 'La invitación cambió; recargue'; END IF;
  IF length(btrim(coalesce(p_datos->>'observacion','')))=0 OR length(btrim(coalesce(p_datos->>'plan','')))=0 THEN RAISE EXCEPTION 'Registre decisión explicada y plan de continuidad'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.iniciacion_decisiones WHERE invitacion_id=i.id AND accion='seguimiento' AND (despues->>'ronda')::integer=i.ronda) THEN RAISE EXCEPTION 'Falta seguimiento de esta ronda'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.iniciacion_convocatorias fc JOIN public.iniciacion_candidatos fa ON fa.convocatoria_id=fc.id WHERE fc.id=i.convocatoria_final_id AND fc.publicada AND fa.alumno_id=a.alumno_id AND fa.resultado IN ('preparado','continuar') AND (SELECT count(*) FROM public.iniciacion_valoraciones v WHERE v.candidato_id=fa.id AND v.invitacion_id=i.id AND v.ronda=i.ronda AND v.completa AND v.jurado_id=ANY(fc.jurados))>=fc.min_jurados) THEN RAISE EXCEPTION 'Falta audición final publicada con evidencia actual'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.alumnos_clases WHERE alumno_id=a.alumno_id AND clase_id=a.regular_clase_id AND activo IS TRUE) AND NOT coalesce((a.excepcion_regular->>'revision')::date>=today,false) THEN RAISE EXCEPTION 'Regularice teoría y solfeo o documente excepción'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('iniciacion-clase:'||i.clase_id::text,0));
  SELECT * INTO STRICT en FROM public.alumnos_clases WHERE id=i.inscripcion_id AND activo IS TRUE AND condicion='invitado' AND audicion_candidato_id=a.id FOR UPDATE;
  before_state:=to_jsonb(i);
  IF p_datos->>'accion'='prorrogar' THEN
   IF (p_datos->>'revision')::date IS NULL OR (p_datos->>'revision')::date<=greatest(today,i.revision) OR length(btrim(coalesce(p_datos->>'objetivos','')))=0 THEN RAISE EXCEPTION 'Prórroga exige nueva revisión y objetivos'; END IF;
   UPDATE public.iniciacion_invitaciones SET revision=(p_datos->>'revision')::date,objetivos=p_datos->>'objetivos',ronda=ronda+1,version=version+1,convocatoria_final_id=NULL WHERE id=i.id RETURNING * INTO i;
   UPDATE public.alumnos_clases SET invitacion_revision=i.revision WHERE id=en.id;
  ELSIF p_datos->>'accion' IN ('confirmar','finalizar') THEN
   UPDATE public.iniciacion_invitaciones SET estado=CASE WHEN p_datos->>'accion'='confirmar' THEN 'fijo' ELSE 'finalizada' END,version=version+1 WHERE id=i.id RETURNING * INTO i;
   UPDATE public.alumnos_clases SET condicion=CASE WHEN i.estado='fijo' THEN 'fijo' ELSE 'invitado' END,activo=(i.estado='fijo'),invitacion_revision=NULL WHERE id=en.id;
  ELSE RAISE EXCEPTION 'Decisión desconocida'; END IF;
  PERFORM soi_security.semestre_evento(c.id,a.id,i.id,'resolver_invitacion',p_datos->>'observacion',p_datos,before_state,to_jsonb(i)); RETURN to_jsonb(i);
 ELSIF p_accion='informe' THEN
  IF NOT c.publicada THEN RAISE EXCEPTION 'Publique los resultados antes de emitir informe'; END IF;
  report:=soi_security.semestre_reporte(c.id,aid);
  SELECT count(*)+1 INTO n FROM public.iniciacion_decisiones WHERE convocatoria_id=c.id AND accion='informe' AND candidato_id IS NOT DISTINCT FROM aid;
  report:=report||jsonb_build_object('version',n,'revisado_por',auth.uid());
  PERFORM soi_security.semestre_evento(c.id,aid,NULL,'informe','Informe revisado para entrega',report,'{}','{}'); RETURN report;
 ELSIF p_accion='comunicacion' THEN
  IF NOT c.publicada OR a.id IS NULL OR length(btrim(coalesce(p_datos->>'destinatario','')))=0 OR length(btrim(coalesce(p_datos->>'contacto','')))=0 OR length(btrim(coalesce(p_datos->>'consentimiento','')))=0 OR p_datos->>'revision_confirmada' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Revise resultado, destinatario, contacto y consentimiento'; END IF;
  SELECT * INTO ev FROM public.iniciacion_decisiones WHERE operacion_id=nullif(p_datos->>'operacion_id','')::uuid;
  IF FOUND THEN
   IF ev.accion<>'comunicacion' OR ev.candidato_id<>a.id OR ev.actor_id<>auth.uid() OR ev.datos->>'destinatario' IS DISTINCT FROM p_datos->>'destinatario' OR ev.datos->>'contacto' IS DISTINCT FROM p_datos->>'contacto' THEN RAISE EXCEPTION 'Identificador de operación reutilizado con datos diferentes'; END IF;
   RETURN ev.datos;
  END IF;
  report:=soi_security.semestre_reporte(c.id,a.id);
  details:=jsonb_build_object('operacion_id',p_datos->>'operacion_id','destinatario',p_datos->>'destinatario','contacto',p_datos->>'contacto','canal','manual','consentimiento',p_datos->>'consentimiento','estado','borrador_manual','informe',report);
  PERFORM soi_security.semestre_evento(c.id,a.id,NULL,'comunicacion','Borrador revisado; NO enviado',details,'{}','{}'); RETURN details;
 ELSIF p_accion='entrega' THEN
  SELECT * INTO STRICT ev FROM public.iniciacion_decisiones WHERE id=(p_datos->>'comunicacion_id')::uuid AND convocatoria_id=c.id AND accion='comunicacion';
  IF EXISTS(SELECT 1 FROM public.iniciacion_decisiones WHERE accion='entrega' AND datos->>'comunicacion_id'=ev.id::text) THEN RETURN jsonb_build_object('estado','entrega_confirmada'); END IF;
  IF p_datos->>'entrega_confirmada' IS DISTINCT FROM 'true' OR length(btrim(coalesce(p_datos->>'observacion','')))=0 THEN RAISE EXCEPTION 'Confirme la entrega manual realizada'; END IF;
  PERFORM soi_security.semestre_evento(c.id,ev.candidato_id,NULL,'entrega',p_datos->>'observacion',p_datos,'{}','{}'); RETURN jsonb_build_object('estado','entrega_confirmada');
 END IF;
 RAISE EXCEPTION 'Operación no reconocida';
END; $$;
CREATE FUNCTION public.iniciacion_semestre(p_accion text,p_datos jsonb DEFAULT '{}') RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT soi_security.iniciacion_semestre(p_accion,p_datos); $$;
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE (n.nspname='soi_security' AND p.proname IN ('semestre_activo','semestre_decide','semestre_gestiona','iniciacion_semestre')) OR (n.nspname='public' AND p.proname='iniciacion_semestre') LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon',f.signature); EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f.signature);
 END LOOP;
END $$;
COMMIT;
