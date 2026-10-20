-- ═════════════════════════════════════════════════════════════════════════════
-- SECURITY DEFINER hardening, group 1: functions that WRITE or NOTIFY and were executable by anon.
--
-- Problem: 131 SECURITY DEFINER functions in public were executable by `anon` (68 of them contain
-- INSERT/UPDATE/DELETE). They run as `postgres` and bypass every RLS policy, so a visitor holding only
-- the public anon key could call them through /rest/v1/rpc. Verified read-only on production
-- (zmhmdvmyeyswunurcyow) 2026-10-20. This migration closes the 31 write/notify functions without a valid
-- internal guard; the rest is planned in docs/security/secdef-anon/.
--
-- Three groups (consumers verified in src/, supabase/functions/, cron.job and pg_trigger):
--   A  internal only (pg_cron as postgres, service_role edge functions, trigger chains owned by postgres)
--        -> EXECUTE only for service_role (the owner postgres keeps it implicitly). anon/authenticated/PUBLIC lose it.
--   B  called by signed-in screens (authenticated) or by Hermes
--        -> EXECUTE for authenticated + service_role. anon/PUBLIC lose it.
--   C  backfill_alumnos_desde_postulantes(boolean): visible body has no identity check, writes alumnos/postulantes
--        and returns names. The original is renamed to *_impl (owner only) and replaced by a SECURITY DEFINER
--        wrapper that requires an active admin/superadmin or service_role.
--
-- Deliberately NOT touched: fn_actualizar_contacto, fn_actualizar_estado_postulante, fn_marcar_asistencia
-- (fail-closed shared-secret guard used by the Hermes bot with the anon key), function bodies, search_path
-- settings, default privileges, views, policies. Idempotent and atomic. Rollback:
-- supabase/rollback/20261020130000_revoke_anon_execute_secdef_group1.rollback.sql
-- ═════════════════════════════════════════════════════════════════════════════
BEGIN;

DO $$
DECLARE
  grp_a text[] := ARRAY[
    'public.fn_check_and_notify_pending_asistencias()',
    'public.fn_generate_class_start_reminders()',
    'public.generate_pending_class_notifications()',
    'public.fn_escalar_mora()',
    'public.fn_hermes_escalar_tareas_bloqueadas()',
    'public.fn_generar_ciclo_cuotas(integer, integer, bigint)',
    'public.fn_fin_acquire_service_refresh_lock(uuid, uuid, integer)',
    'public.fn_fin_complete_service_refresh(uuid, uuid, text, text, boolean, boolean)',
    'public.fn_actualizar_racha_alumno(uuid, date, uuid)',
    'public.fn_evaluar_logros_alumno(uuid)',
    'public.fn_calcular_score_representante(uuid, integer, integer)',
    'public.refresh_maestro_desempeno()',
    'public.fn_recalcular_bloqueos_familia(uuid)'
  ];
  grp_b text[] := ARRAY[
    'public.fn_calcular_pulso_score(boolean)',
    'public.fn_crear_evento_calendario(uuid, text, text, text, date, date, integer, text, uuid, jsonb, text)',
    'public.fn_actualizar_tarea(uuid, text, text)',
    'public.fn_generar_tareas_calendario(uuid)',
    'public.fn_generar_instancias_gastos_fijos(integer, integer)',
    'public.fn_lut_upsert_diagnostico(uuid, text, jsonb, text, text, text, text, text, text, numeric, numeric, boolean, text, uuid, text)',
    'public.justificar_alumno_por_dia(uuid, date, text, uuid)',
    'public.fn_repertoire_update_applicability(uuid, uuid, aplicabilidad_compas, uuid)',
    'public.fn_repertoire_update_preparation(uuid, uuid, estado_preparacion, uuid, text, text, uuid, uuid, uuid, uuid)',
    'public.fn_sincronizar_arbol_curricular(uuid, text, jsonb, uuid)',
    'public.fn_upsert_protocolo(text, text, text, jsonb)',
    'public.clonar_plantilla_a_clase(uuid, uuid, uuid[])',
    'public.ensure_session_and_save_evaluation(uuid, uuid, date, time with time zone, uuid, uuid, integer, text)',
    'public.fn_hermes_orquestar_protocolo(uuid, uuid)',
    'public.fn_hermes_register_response(uuid, text, text, text)',
    'public.fn_hermes_update_notif(uuid, text, text)',
    'public.fn_registrar_alerta_enviada(text, text, text, text)'
  ];
  f text;
BEGIN
  -- Fail closed on drift: a missing function means this plan was written against a different schema.
  FOREACH f IN ARRAY grp_a || grp_b LOOP
    IF to_regprocedure(f) IS NULL THEN
      RAISE EXCEPTION 'secdef-group1: function % not found; aborting without changes', f;
    END IF;
  END LOOP;

  FOREACH f IN ARRAY grp_a LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;

  FOREACH f IN ARRAY grp_b LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f);
  END LOOP;
END $$;

-- ── Group C: backfill_alumnos_desde_postulantes ─────────────────────────────
DO $$
BEGIN
  IF to_regprocedure('public.backfill_alumnos_desde_postulantes_impl(boolean)') IS NULL THEN
    IF to_regprocedure('public.backfill_alumnos_desde_postulantes(boolean)') IS NULL THEN
      RAISE EXCEPTION 'secdef-group1: backfill_alumnos_desde_postulantes(boolean) not found';
    END IF;
    ALTER FUNCTION public.backfill_alumnos_desde_postulantes(boolean) RENAME TO backfill_alumnos_desde_postulantes_impl;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.backfill_alumnos_desde_postulantes_impl(boolean) FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.backfill_alumnos_desde_postulantes(dry_run boolean)
 RETURNS TABLE(alumno_id uuid, alumno_nombre text, postulante_id uuid, postulante_nombre text,
               match_tipo text, campos_llenados integer, accion text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role'
          OR soi_security.has_role(ARRAY['admin', 'superadmin'])) THEN
    RAISE EXCEPTION 'backfill_alumnos_desde_postulantes: admin or service_role required'
      USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.backfill_alumnos_desde_postulantes_impl(dry_run);
END;
$function$;

REVOKE ALL ON FUNCTION public.backfill_alumnos_desde_postulantes(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.backfill_alumnos_desde_postulantes(boolean) TO authenticated, service_role;

-- ── Self-verification: any deviation aborts the whole transaction ───────────
DO $$
DECLARE
  a_fns text[] := ARRAY[
    'public.fn_check_and_notify_pending_asistencias()', 'public.fn_generate_class_start_reminders()',
    'public.generate_pending_class_notifications()', 'public.fn_escalar_mora()',
    'public.fn_hermes_escalar_tareas_bloqueadas()', 'public.fn_generar_ciclo_cuotas(integer, integer, bigint)',
    'public.fn_fin_acquire_service_refresh_lock(uuid, uuid, integer)',
    'public.fn_fin_complete_service_refresh(uuid, uuid, text, text, boolean, boolean)',
    'public.fn_actualizar_racha_alumno(uuid, date, uuid)', 'public.fn_evaluar_logros_alumno(uuid)',
    'public.fn_calcular_score_representante(uuid, integer, integer)', 'public.refresh_maestro_desempeno()',
    'public.fn_recalcular_bloqueos_familia(uuid)'];
  b_fns text[] := ARRAY[
    'public.fn_calcular_pulso_score(boolean)',
    'public.fn_crear_evento_calendario(uuid, text, text, text, date, date, integer, text, uuid, jsonb, text)',
    'public.fn_actualizar_tarea(uuid, text, text)', 'public.fn_generar_tareas_calendario(uuid)',
    'public.fn_generar_instancias_gastos_fijos(integer, integer)',
    'public.fn_lut_upsert_diagnostico(uuid, text, jsonb, text, text, text, text, text, text, numeric, numeric, boolean, text, uuid, text)',
    'public.justificar_alumno_por_dia(uuid, date, text, uuid)',
    'public.fn_repertoire_update_applicability(uuid, uuid, aplicabilidad_compas, uuid)',
    'public.fn_repertoire_update_preparation(uuid, uuid, estado_preparacion, uuid, text, text, uuid, uuid, uuid, uuid)',
    'public.fn_sincronizar_arbol_curricular(uuid, text, jsonb, uuid)', 'public.fn_upsert_protocolo(text, text, text, jsonb)',
    'public.clonar_plantilla_a_clase(uuid, uuid, uuid[])',
    'public.ensure_session_and_save_evaluation(uuid, uuid, date, time with time zone, uuid, uuid, integer, text)',
    'public.fn_hermes_orquestar_protocolo(uuid, uuid)', 'public.fn_hermes_register_response(uuid, text, text, text)',
    'public.fn_hermes_update_notif(uuid, text, text)', 'public.fn_registrar_alerta_enviada(text, text, text, text)',
    'public.backfill_alumnos_desde_postulantes(boolean)'];
  f text;
  oid_ oid;
BEGIN
  FOREACH f IN ARRAY a_fns LOOP
    oid_ := to_regprocedure(f)::oid;
    IF has_function_privilege('anon', oid_, 'EXECUTE') OR has_function_privilege('authenticated', oid_, 'EXECUTE')
       OR NOT has_function_privilege('service_role', oid_, 'EXECUTE') THEN
      RAISE EXCEPTION 'secdef-group1 verification: group A ACL wrong for %', f;
    END IF;
  END LOOP;
  FOREACH f IN ARRAY b_fns LOOP
    oid_ := to_regprocedure(f)::oid;
    IF has_function_privilege('anon', oid_, 'EXECUTE')
       OR NOT has_function_privilege('authenticated', oid_, 'EXECUTE')
       OR NOT has_function_privilege('service_role', oid_, 'EXECUTE') THEN
      RAISE EXCEPTION 'secdef-group1 verification: group B ACL wrong for %', f;
    END IF;
  END LOOP;
  oid_ := to_regprocedure('public.backfill_alumnos_desde_postulantes_impl(boolean)')::oid;
  IF has_function_privilege('anon', oid_, 'EXECUTE') OR has_function_privilege('authenticated', oid_, 'EXECUTE')
     OR has_function_privilege('service_role', oid_, 'EXECUTE') THEN
    RAISE EXCEPTION 'secdef-group1 verification: backfill impl must be owner-only';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid = to_regprocedure('public.backfill_alumnos_desde_postulantes(boolean)')::oid
                 AND prosecdef AND proconfig IS NOT NULL AND position('admin' IN prosrc) > 0) THEN
    RAISE EXCEPTION 'secdef-group1 verification: backfill wrapper is not a guarded SECURITY DEFINER';
  END IF;
  -- Nothing left in this group may be reachable through PUBLIC (anon inherits it).
  IF EXISTS (SELECT 1 FROM pg_proc p, LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
             WHERE p.oid = ANY (ARRAY(SELECT to_regprocedure(x)::oid FROM unnest(a_fns || b_fns) x))
               AND a.grantee = 0) THEN
    RAISE EXCEPTION 'secdef-group1 verification: a function still grants EXECUTE to PUBLIC';
  END IF;
END $$;

COMMIT;
