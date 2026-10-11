-- New isolated v2 operation; existing v1 callers are not altered.
CREATE TABLE IF NOT EXISTS soi_security.enrollment_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 enrollment_id uuid NOT NULL,
 actor_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 action text NOT NULL CHECK (action='enrolled')
);
REVOKE ALL ON soi_security.enrollment_events FROM PUBLIC, anon, authenticated;
ALTER TABLE soi_security.enrollment_events ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION soi_security.enroll_student(p_student uuid,p_class uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' SET lock_timeout='3s' AS $$
DECLARE v_class public.clases; v_student public.alumnos; v_id uuid; v_active boolean;
BEGIN
 IF NOT soi_security.has_role(ARRAY['admin','superadmin']) THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Solo administración puede inscribir desde este portal.';
 END IF;
 -- Serialize the count/insert with legacy enrollment writes and timetable changes.
 LOCK TABLE public.alumnos_clases,public.clase_horarios IN SHARE ROW EXCLUSIVE MODE;
 SELECT * INTO v_student FROM public.alumnos WHERE id=p_student FOR UPDATE;
 IF NOT FOUND OR v_student.activo IS NOT TRUE THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='El alumno debe estar activo.';
 END IF;
 SELECT * INTO v_class FROM public.clases WHERE id=p_class FOR UPDATE;
 IF NOT FOUND OR v_class.activo IS NOT TRUE THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='La clase debe estar activa.';
 END IF;
 SELECT id,activo INTO v_id,v_active FROM public.alumnos_clases WHERE alumno_id=p_student AND clase_id=p_class;
 IF FOUND THEN
  IF v_active IS TRUE THEN RETURN v_id; END IF;
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Existe una inscripción anterior. Requiere revisión para reactivarla.';
 END IF;
 IF v_class.capacidad_maxima IS NULL OR v_class.capacidad_maxima<=0 THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Define el cupo de la clase antes de inscribir.';
 END IF;
 IF (SELECT count(*) FROM public.alumnos_clases WHERE clase_id=p_class AND activo IS TRUE)>=v_class.capacidad_maxima THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='La clase no tiene cupos disponibles.';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.clase_horarios WHERE clase_id=p_class) OR EXISTS(
  SELECT 1 FROM public.clase_horarios WHERE clase_id=p_class AND (dia IS NULL OR hora_inicio IS NULL OR hora_fin IS NULL OR hora_fin<=hora_inicio)
 ) THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Completa un horario válido para la clase.'; END IF;
 IF EXISTS(SELECT 1 FROM public.alumnos_clases ac JOIN public.clases c ON c.id=ac.clase_id
  WHERE ac.alumno_id=p_student AND ac.activo IS TRUE AND c.activo IS TRUE AND
  (NOT EXISTS(SELECT 1 FROM public.clase_horarios h WHERE h.clase_id=c.id) OR EXISTS(SELECT 1 FROM public.clase_horarios h WHERE h.clase_id=c.id AND (h.dia IS NULL OR h.hora_inicio IS NULL OR h.hora_fin IS NULL OR h.hora_fin<=h.hora_inicio)) OR ac.hora_inicio IS NOT NULL OR ac.hora_fin IS NOT NULL OR ac.dia IS NOT NULL)) THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Hay horarios individuales o incompletos. Revisa la compatibilidad antes de inscribir.';
 END IF;
 IF EXISTS(SELECT 1 FROM public.clase_horarios target
  JOIN public.alumnos_clases ac ON ac.alumno_id=p_student AND ac.activo IS TRUE
  JOIN public.clases c ON c.id=ac.clase_id AND c.activo IS TRUE
  JOIN public.clase_horarios other ON other.clase_id=ac.clase_id
  WHERE target.clase_id=p_class AND target.dia=other.dia
    AND target.hora_inicio<other.hora_fin AND other.hora_inicio<target.hora_fin) THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='El alumno ya tiene otra clase en ese horario.';
 END IF;
 INSERT INTO public.alumnos_clases(alumno_id,clase_id,activo) VALUES(p_student,p_class,true) RETURNING id INTO v_id;
 INSERT INTO soi_security.enrollment_events(enrollment_id,actor_id,action) VALUES(v_id,auth.uid(),'enrolled');
 RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION soi_security.enroll_student(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION soi_security.enroll_student(uuid,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.soi_v2_enroll_student(p_student uuid,p_class uuid)
RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 SELECT soi_security.enroll_student(p_student,p_class);
$$;
REVOKE ALL ON FUNCTION public.soi_v2_enroll_student(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.soi_v2_enroll_student(uuid,uuid) TO authenticated;
