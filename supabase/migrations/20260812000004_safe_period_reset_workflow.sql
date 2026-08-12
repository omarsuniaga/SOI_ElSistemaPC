-- Safe, reusable period-start reset. This migration defines the workflow only;
-- it never executes a reset by itself.
CREATE TABLE IF NOT EXISTS public.academic_period_reset_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  cutoff_date date NOT NULL,
  target_period_id uuid NOT NULL REFERENCES public.periodos(id),
  status text NOT NULL CHECK (status IN ('planned','backed_up','executing','completed','failed')),
  preview_hash text NOT NULL,
  preview_expires_at timestamptz NOT NULL,
  counts_before jsonb NOT NULL DEFAULT '{}'::jsonb,
  counts_after jsonb,
  blockers jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  backed_up_at timestamptz,
  executed_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.academic_period_reset_backups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.academic_period_reset_runs(id) ON DELETE RESTRICT,
  source_table text NOT NULL,
  source_id text NOT NULL,
  row_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, source_table, source_id)
);

ALTER TABLE public.academic_period_reset_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_period_reset_backups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.academic_period_reset_runs, public.academic_period_reset_backups FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public._period_reset_counts(p_cutoff date, p_target uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'asistencias_a_eliminar', (SELECT count(*) FROM asistencias WHERE fecha < p_cutoff),
    'asistencias_preservadas', (SELECT count(*) FROM asistencias WHERE fecha >= p_cutoff),
    'sesiones_preservadas', (SELECT count(*) FROM sesiones_clase),
    'progresos_a_eliminar', (SELECT count(*) FROM progresos WHERE fecha_evaluacion < p_cutoff),
    'progresos_preservados', (SELECT count(*) FROM progresos WHERE fecha_evaluacion >= p_cutoff),
    'intentos_a_eliminar', (SELECT count(*) FROM indicator_attempts WHERE covered_date < p_cutoff),
    'intentos_preservados', (SELECT count(*) FROM indicator_attempts WHERE covered_date >= p_cutoff),
    'progreso_indicadores_a_reiniciar', (SELECT count(*) FROM student_indicator_progress),
    'pendientes_a_eliminar', (SELECT count(*) FROM registros_pendientes rp LEFT JOIN sesiones_clase s ON s.id=rp.sesion_clase_id WHERE COALESCE(s.fecha, rp.created_at::date) < p_cutoff),
    'periodo_objetivo_existe', EXISTS(SELECT 1 FROM periodos WHERE id=p_target),
    'periodo_activo', (SELECT nombre FROM periodos WHERE activo LIMIT 1),
    'alumnos_preservados', (SELECT count(*) FROM alumnos),
    'clases_preservadas', (SELECT count(*) FROM clases),
    'matriculas_preservadas', (SELECT count(*) FROM alumnos_clases)
  )
$$;
REVOKE ALL ON FUNCTION public._period_reset_counts(date,uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public._period_reset_fingerprint(p_cutoff date, p_target uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT md5(concat_ws('|',
    (SELECT COALESCE(jsonb_agg(to_jsonb(a) ORDER BY a.id)::text,'[]') FROM asistencias a WHERE a.fecha<p_cutoff),
    (SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.id)::text,'[]') FROM progresos p WHERE p.fecha_evaluacion<p_cutoff),
    (SELECT COALESCE(jsonb_agg(to_jsonb(i) ORDER BY i.id)::text,'[]') FROM indicator_attempts i WHERE i.covered_date<p_cutoff),
    (SELECT COALESCE(jsonb_agg(to_jsonb(rp) ORDER BY rp.id)::text,'[]') FROM registros_pendientes rp LEFT JOIN sesiones_clase s ON s.id=rp.sesion_clase_id WHERE COALESCE(s.fecha,rp.created_at::date)<p_cutoff),
    (SELECT COALESCE(jsonb_agg(to_jsonb(sip) ORDER BY sip.id)::text,'[]') FROM student_indicator_progress sip),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('id',a.id,'promedio_notas',a.promedio_notas,'updated_at',a.updated_at) ORDER BY a.id)::text,'[]') FROM alumnos a),
    (SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.alumno_id)::text,'[]') FROM rachas r),
    (SELECT COALESCE(jsonb_agg(to_jsonb(md) ORDER BY md.maestro_id)::text,'[]') FROM maestro_desempeno md),
    (SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.id)::text,'[]') FROM periodos p),
    p_cutoff::text,p_target::text
  ))
$$;
REVOKE ALL ON FUNCTION public._period_reset_fingerprint(date,uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_preview_period_reset(p_cutoff date, p_target_period_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_counts jsonb; v_blockers jsonb := '[]'::jsonb; v_hash text; v_run uuid;
BEGIN
  IF NOT public.es_admin() THEN RAISE EXCEPTION 'Acceso restringido a administradores' USING ERRCODE='42501'; END IF;
  IF p_cutoff IS NULL OR p_cutoff > current_date THEN RAISE EXCEPTION 'La fecha de corte no es válida ni puede ser futura'; END IF;
  IF NOT EXISTS (SELECT 1 FROM periodos WHERE id=p_target_period_id) THEN RAISE EXCEPTION 'El período objetivo no existe'; END IF;
  IF (SELECT fecha_inicio FROM periodos WHERE id=p_target_period_id) <> p_cutoff THEN
    v_blockers := v_blockers || jsonb_build_array('La fecha de inicio del período no coincide con el corte');
  END IF;
  v_counts := public._period_reset_counts(p_cutoff,p_target_period_id);
  v_hash := public._period_reset_fingerprint(p_cutoff,p_target_period_id);
  INSERT INTO academic_period_reset_runs(actor_id,cutoff_date,target_period_id,status,preview_hash,preview_expires_at,counts_before,blockers)
  VALUES(auth.uid(),p_cutoff,p_target_period_id,'planned',v_hash,now()+interval '15 minutes',v_counts,v_blockers) RETURNING id INTO v_run;
  RETURN jsonb_build_object('run_id',v_run,'cutoff',p_cutoff,'counts',v_counts,'blockers',v_blockers,'expires_at',now()+interval '15 minutes');
END $$;

CREATE OR REPLACE FUNCTION public.admin_backup_period_reset(p_run_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r academic_period_reset_runs; v_now_counts jsonb;
BEGIN
  IF NOT public.es_admin() THEN RAISE EXCEPTION 'Acceso restringido a administradores' USING ERRCODE='42501'; END IF;
  SELECT * INTO r FROM academic_period_reset_runs WHERE id=p_run_id AND actor_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR r.status NOT IN ('planned','backed_up') THEN RAISE EXCEPTION 'Ejecución inexistente o no disponible'; END IF;
  IF r.preview_expires_at < now() THEN RAISE EXCEPTION 'La vista previa expiró; genere una nueva'; END IF;
  IF jsonb_array_length(r.blockers)>0 THEN RAISE EXCEPTION 'La vista previa contiene bloqueos'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('academic_period_reset'));
  LOCK TABLE asistencias, progresos, indicator_attempts, registros_pendientes, student_indicator_progress,
    alumnos, rachas, maestro_desempeno, periodos IN SHARE ROW EXCLUSIVE MODE;
  v_now_counts:=public._period_reset_counts(r.cutoff_date,r.target_period_id);
  IF public._period_reset_fingerprint(r.cutoff_date,r.target_period_id)<>r.preview_hash THEN RAISE EXCEPTION 'Los datos cambiaron; genere una nueva vista previa'; END IF;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'asistencias',a.id::text,to_jsonb(a) FROM asistencias a WHERE a.fecha<r.cutoff_date ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'progresos',p.id::text,to_jsonb(p) FROM progresos p WHERE p.fecha_evaluacion<r.cutoff_date ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'indicator_attempts',i.id::text,to_jsonb(i) FROM indicator_attempts i WHERE i.covered_date<r.cutoff_date ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'registros_pendientes',rp.id::text,to_jsonb(rp) FROM registros_pendientes rp LEFT JOIN sesiones_clase s ON s.id=rp.sesion_clase_id WHERE COALESCE(s.fecha,rp.created_at::date)<r.cutoff_date ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'maestro_desempeno',md.maestro_id::text,to_jsonb(md) FROM maestro_desempeno md ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'student_indicator_progress',sip.id::text,to_jsonb(sip) FROM student_indicator_progress sip ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'alumnos_derivados',a.id::text,jsonb_build_object('id',a.id,'promedio_notas',a.promedio_notas,'updated_at',a.updated_at) FROM alumnos a ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'rachas',a.alumno_id::text,to_jsonb(a) FROM rachas a ON CONFLICT DO NOTHING;
  INSERT INTO academic_period_reset_backups(run_id,source_table,source_id,row_data)
    SELECT r.id,'periodos',p.id::text,to_jsonb(p) FROM periodos p ON CONFLICT DO NOTHING;
  UPDATE academic_period_reset_runs SET status='backed_up',backed_up_at=now() WHERE id=r.id;
  RETURN jsonb_build_object('run_id',r.id,'status','backed_up','backup_rows',(SELECT count(*) FROM academic_period_reset_backups WHERE run_id=r.id));
END $$;

CREATE OR REPLACE FUNCTION public.admin_execute_period_reset(p_run_id uuid,p_confirmation text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r academic_period_reset_runs; v_now_counts jsonb; v_after jsonb;
BEGIN
  IF NOT public.es_admin() THEN RAISE EXCEPTION 'Acceso restringido a administradores' USING ERRCODE='42501'; END IF;
  SELECT * INTO r FROM academic_period_reset_runs WHERE id=p_run_id AND actor_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ejecución inexistente'; END IF;
  IF r.status='completed' THEN RETURN jsonb_build_object('run_id',r.id,'status','completed','already_completed',true,'counts',r.counts_after); END IF;
  IF r.status<>'backed_up' OR r.backed_up_at IS NULL THEN RAISE EXCEPTION 'Debe preparar el respaldo antes de ejecutar'; END IF;
  IF p_confirmation<>('RESETEAR PERIODO '||r.cutoff_date::text) THEN RAISE EXCEPTION 'Frase de confirmación incorrecta'; END IF;
  IF r.preview_expires_at<now() THEN RAISE EXCEPTION 'La vista previa expiró; genere una nueva'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('academic_period_reset'));
  LOCK TABLE asistencias, progresos, indicator_attempts, registros_pendientes, student_indicator_progress,
    alumnos, rachas, maestro_desempeno, periodos IN SHARE ROW EXCLUSIVE MODE;
  v_now_counts:=public._period_reset_counts(r.cutoff_date,r.target_period_id);
  IF public._period_reset_fingerprint(r.cutoff_date,r.target_period_id)<>r.preview_hash THEN RAISE EXCEPTION 'Los datos cambiaron después del respaldo; genere una nueva vista previa'; END IF;
  UPDATE academic_period_reset_runs SET status='executing',executed_at=now() WHERE id=r.id;
  BEGIN
    DELETE FROM progresos WHERE fecha_evaluacion<r.cutoff_date;
    DELETE FROM asistencias WHERE fecha<r.cutoff_date;
    DELETE FROM indicator_attempts WHERE covered_date<r.cutoff_date;
    DELETE FROM student_indicator_progress;
    DELETE FROM registros_pendientes rp
      WHERE COALESCE((SELECT s.fecha FROM sesiones_clase s WHERE s.id=rp.sesion_clase_id),rp.created_at::date)<r.cutoff_date;
    PERFORM public.refresh_maestro_desempeno();
    UPDATE alumnos a SET promedio_notas=(SELECT avg(p.calificacion) FROM progresos p WHERE p.alumno_id=a.id AND p.fecha_evaluacion>=r.cutoff_date),updated_at=now();
    UPDATE rachas a SET racha_actual=0,racha_maxima=0,ultima_fecha_activa=NULL,updated_at=now()
      WHERE NOT EXISTS(SELECT 1 FROM progresos p WHERE p.alumno_id=a.alumno_id AND p.fecha_evaluacion>=r.cutoff_date);
    UPDATE periodos SET activo=(id=r.target_period_id),updated_at=now() WHERE activo OR id=r.target_period_id;
    v_after:=public._period_reset_counts(r.cutoff_date,r.target_period_id);
    IF (v_after->>'asistencias_a_eliminar')::int<>0
      OR (v_after->>'progresos_a_eliminar')::int<>0
      OR (v_after->>'intentos_a_eliminar')::int<>0
      OR (v_after->>'pendientes_a_eliminar')::int<>0
      OR (v_after->>'progreso_indicadores_a_reiniciar')::int<>0
    THEN RAISE EXCEPTION 'La verificación posterior detectó datos que debían reiniciarse'; END IF;
    UPDATE academic_period_reset_runs SET status='completed',counts_after=v_after,completed_at=now() WHERE id=r.id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE academic_period_reset_runs SET status='failed',error_message=left(SQLERRM,500) WHERE id=r.id;
    RETURN jsonb_build_object('run_id',r.id,'status','failed','error',left(SQLERRM,500));
  END;
  RETURN jsonb_build_object('run_id',r.id,'status','completed','already_completed',false,'counts',v_after);
END $$;

CREATE OR REPLACE FUNCTION public.admin_get_period_reset_status(p_run_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r academic_period_reset_runs;
BEGIN
  IF NOT public.es_admin() THEN RAISE EXCEPTION 'Acceso restringido a administradores' USING ERRCODE='42501'; END IF;
  SELECT * INTO r FROM academic_period_reset_runs WHERE id=p_run_id AND actor_id=auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Ejecución inexistente'; END IF;
  RETURN jsonb_build_object(
    'run_id',r.id,'status',r.status,'cutoff',r.cutoff_date,'target_period_id',r.target_period_id,
    'counts_before',r.counts_before,'counts_after',r.counts_after,'error',r.error_message,
    'created_at',r.created_at,'backed_up_at',r.backed_up_at,'completed_at',r.completed_at
  );
END $$;

REVOKE ALL ON FUNCTION public.admin_preview_period_reset(date,uuid), public.admin_backup_period_reset(uuid), public.admin_execute_period_reset(uuid,text), public.admin_get_period_reset_status(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_preview_period_reset(date,uuid), public.admin_backup_period_reset(uuid), public.admin_execute_period_reset(uuid,text), public.admin_get_period_reset_status(uuid) TO authenticated;
