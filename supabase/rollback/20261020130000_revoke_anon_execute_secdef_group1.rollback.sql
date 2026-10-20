-- Rollback of 20261020130000_revoke_anon_execute_secdef_group1.sql.
-- Restores the exact pre-migration ACLs captured read-only from production on 2026-10-20:
--   most functions:  {=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres}
--   without PUBLIC:  backfill_alumnos_desde_postulantes, fn_fin_acquire_service_refresh_lock,
--                    fn_fin_complete_service_refresh, fn_repertoire_update_applicability, fn_repertoire_update_preparation
-- WARNING: this reopens the anon-callable SECURITY DEFINER write surface. Use only if a verified consumer broke.
BEGIN;

-- Group C: remove the guarded wrapper and put the original function back under its name.
DO $$
BEGIN
  IF to_regprocedure('public.backfill_alumnos_desde_postulantes_impl(boolean)') IS NOT NULL THEN
    DROP FUNCTION IF EXISTS public.backfill_alumnos_desde_postulantes(boolean);
    ALTER FUNCTION public.backfill_alumnos_desde_postulantes_impl(boolean) RENAME TO backfill_alumnos_desde_postulantes;
  END IF;
END $$;

DO $$
DECLARE
  with_public text[] := ARRAY[
    'public.fn_check_and_notify_pending_asistencias()', 'public.fn_generate_class_start_reminders()',
    'public.generate_pending_class_notifications()', 'public.fn_escalar_mora()',
    'public.fn_hermes_escalar_tareas_bloqueadas()', 'public.fn_generar_ciclo_cuotas(integer, integer, bigint)',
    'public.fn_actualizar_racha_alumno(uuid, date, uuid)', 'public.fn_evaluar_logros_alumno(uuid)',
    'public.fn_calcular_score_representante(uuid, integer, integer)', 'public.refresh_maestro_desempeno()',
    'public.fn_recalcular_bloqueos_familia(uuid)', 'public.fn_calcular_pulso_score(boolean)',
    'public.fn_crear_evento_calendario(uuid, text, text, text, date, date, integer, text, uuid, jsonb, text)',
    'public.fn_actualizar_tarea(uuid, text, text)', 'public.fn_generar_tareas_calendario(uuid)',
    'public.fn_generar_instancias_gastos_fijos(integer, integer)',
    'public.fn_lut_upsert_diagnostico(uuid, text, jsonb, text, text, text, text, text, text, numeric, numeric, boolean, text, uuid, text)',
    'public.justificar_alumno_por_dia(uuid, date, text, uuid)',
    'public.fn_sincronizar_arbol_curricular(uuid, text, jsonb, uuid)', 'public.fn_upsert_protocolo(text, text, text, jsonb)',
    'public.clonar_plantilla_a_clase(uuid, uuid, uuid[])',
    'public.ensure_session_and_save_evaluation(uuid, uuid, date, time with time zone, uuid, uuid, integer, text)',
    'public.fn_hermes_orquestar_protocolo(uuid, uuid)', 'public.fn_hermes_register_response(uuid, text, text, text)',
    'public.fn_hermes_update_notif(uuid, text, text)', 'public.fn_registrar_alerta_enviada(text, text, text, text)'];
  without_public text[] := ARRAY[
    'public.backfill_alumnos_desde_postulantes(boolean)',
    'public.fn_fin_acquire_service_refresh_lock(uuid, uuid, integer)',
    'public.fn_fin_complete_service_refresh(uuid, uuid, text, text, boolean, boolean)',
    'public.fn_repertoire_update_applicability(uuid, uuid, aplicabilidad_compas, uuid)',
    'public.fn_repertoire_update_preparation(uuid, uuid, estado_preparacion, uuid, text, text, uuid, uuid, uuid, uuid)'];
  f text;
BEGIN
  FOREACH f IN ARRAY with_public || without_public LOOP
    IF to_regprocedure(f) IS NULL THEN RAISE EXCEPTION 'rollback secdef-group1: function % not found', f; END IF;
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated, service_role', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated, service_role', f);
  END LOOP;
  FOREACH f IN ARRAY with_public LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO PUBLIC', f);
  END LOOP;
END $$;

COMMIT;
