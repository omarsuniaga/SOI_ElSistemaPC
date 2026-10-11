
-- Fusion segura de las 2 clases activas "Catedra de Oboe" en una con 2 horarios.
-- Canonica : 1d910f03-2063-4965-a0c5-baaefb8c07d1 (adopta programa Orquestal, instrumento normalizado a 'Oboe')
-- Duplicado: 809a8602-42bc-4fc6-8e98-74f4d64f569b (se desactiva, reversible)
-- Respaldo : esquema backup_merge_oboe_20260902 (refrescado aqui bajo lock)
-- Atomico  : todo dentro de un bloque DO; cualquier EXCEPTION => ROLLBACK total.
DO $$
DECLARE
  v_canon uuid := '1d910f03-2063-4965-a0c5-baaefb8c07d1';
  v_dup   uuid := '809a8602-42bc-4fc6-8e98-74f4d64f569b';
  v_prog  uuid := 'f07ddbb0-bcba-452f-bf61-9bdea44246dd';
  n int;
BEGIN
  LOCK TABLE public.clases, public.alumnos_clases, public.sesiones_clase,
             public.asistencias, public.clase_horarios, public.observaciones_sesion
        IN SHARE ROW EXCLUSIVE MODE;

  TRUNCATE backup_merge_oboe_20260902.clases,
           backup_merge_oboe_20260902.alumnos_clases,
           backup_merge_oboe_20260902.clase_horarios,
           backup_merge_oboe_20260902.sesiones_clase,
           backup_merge_oboe_20260902.asistencias,
           backup_merge_oboe_20260902.observaciones_sesion;
  INSERT INTO backup_merge_oboe_20260902.clases
    SELECT * FROM public.clases WHERE id IN (v_dup, v_canon);
  INSERT INTO backup_merge_oboe_20260902.alumnos_clases
    SELECT * FROM public.alumnos_clases WHERE clase_id IN (v_dup, v_canon);
  INSERT INTO backup_merge_oboe_20260902.clase_horarios
    SELECT * FROM public.clase_horarios WHERE clase_id IN (v_dup, v_canon);
  INSERT INTO backup_merge_oboe_20260902.sesiones_clase
    SELECT * FROM public.sesiones_clase WHERE clase_id IN (v_dup, v_canon);
  INSERT INTO backup_merge_oboe_20260902.asistencias
    SELECT * FROM public.asistencias
     WHERE clase_id IN (v_dup, v_canon)
        OR sesion_clase_id IN (SELECT id FROM public.sesiones_clase WHERE clase_id IN (v_dup, v_canon));
  INSERT INTO backup_merge_oboe_20260902.observaciones_sesion
    SELECT * FROM public.observaciones_sesion
     WHERE sesion_id IN (SELECT id FROM public.sesiones_clase WHERE clase_id IN (v_dup, v_canon));

  UPDATE public.clase_horarios SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.sesiones_clase SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.asistencias    SET clase_id = v_canon WHERE clase_id = v_dup;
  DELETE FROM public.alumnos_clases WHERE clase_id = v_dup;

  UPDATE public.asistencia_maestros          SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.ausencias_clases_afectadas   SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.clase_acceso_temporal        SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.clase_mapa_indicadores       SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.clase_mapa_objetivos         SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.evaluacion_indicador         SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.horarios                     SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.indicator_attempts           SET covered_by_clase_id = v_canon WHERE covered_by_clase_id = v_dup;
  UPDATE public.indicator_sessions           SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.intentos_ejercicios          SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.maestro_routes               SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.notificaciones               SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.observaciones_alumnos        SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.plan_clases                  SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.planificaciones              SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.planned_content              SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.planning_documents           SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.plantillas_planificacion     SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.progresos                    SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.sesion_bitacora              SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.acm_active_routes            SET group_id = v_canon WHERE group_id = v_dup;
  UPDATE public.acm_evidence_files           SET group_id = v_canon WHERE group_id = v_dup;
  UPDATE public.acm_teacher_week_adjustments SET group_id = v_canon WHERE group_id = v_dup;
  UPDATE public.teacher_class_sessions       SET group_id = v_canon WHERE group_id = v_dup;
  UPDATE public.clases_emergentes            SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.document_batches             SET grupo_id = v_canon WHERE grupo_id = v_dup;
  UPDATE public.justificaciones              SET clase_id = v_canon WHERE clase_id = v_dup;
  UPDATE public.plan_niveles                 SET clase_id = v_canon WHERE clase_id = v_dup;

  UPDATE public.clases
     SET programa_id = v_prog, instrumento = 'Oboe', updated_at = now()
   WHERE id = v_canon;

  UPDATE public.clases
     SET activo = false, estado = 'suspendida',
         nombre = 'Cátedra de Oboe [FUSIONADA -> ' || v_canon::text || ']',
         updated_at = now()
   WHERE id = v_dup;

  SELECT count(*) INTO n FROM public.alumnos_clases  WHERE clase_id = v_dup;   IF n<>0  THEN RAISE EXCEPTION 'FAIL alumnos_clases dup=%',n; END IF;
  SELECT count(*) INTO n FROM public.sesiones_clase  WHERE clase_id = v_dup;   IF n<>0  THEN RAISE EXCEPTION 'FAIL sesiones dup=%',n; END IF;
  SELECT count(*) INTO n FROM public.asistencias     WHERE clase_id = v_dup;   IF n<>0  THEN RAISE EXCEPTION 'FAIL asistencias dup=%',n; END IF;
  SELECT count(*) INTO n FROM public.clase_horarios  WHERE clase_id = v_dup;   IF n<>0  THEN RAISE EXCEPTION 'FAIL horarios dup=%',n; END IF;
  SELECT count(*) INTO n FROM public.alumnos_clases  WHERE clase_id = v_canon; IF n<>4  THEN RAISE EXCEPTION 'FAIL canon alumnos=% (esp 4)',n; END IF;
  SELECT count(*) INTO n FROM public.sesiones_clase  WHERE clase_id = v_canon; IF n<>7  THEN RAISE EXCEPTION 'FAIL canon sesiones=% (esp 7)',n; END IF;
  SELECT count(*) INTO n FROM public.asistencias     WHERE clase_id = v_canon; IF n<>28 THEN RAISE EXCEPTION 'FAIL canon asistencias=% (esp 28)',n; END IF;
  SELECT count(distinct dia) INTO n FROM public.clase_horarios WHERE clase_id = v_canon; IF n<>2 THEN RAISE EXCEPTION 'FAIL canon dias=% (esp 2)',n; END IF;
  SELECT count(*) INTO n FROM public.clases WHERE id=v_canon AND activo AND estado='activa'; IF n<>1 THEN RAISE EXCEPTION 'FAIL canonica inactiva'; END IF;
  SELECT count(*) INTO n FROM public.clases WHERE nombre='Cátedra de Oboe' AND activo; IF n<>1 THEN RAISE EXCEPTION 'FAIL no exactamente 1 activa: %',n; END IF;

  RAISE NOTICE 'MERGE OK';
END $$;
