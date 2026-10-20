// Production signatures (captured read-only from pg_catalog 2026-10-20) of the SECURITY DEFINER functions
// closed by migration 20261020130000, with a SQL expression that calls each one and a stub body.
// Group A = internal (service_role only after the fix), B = signed-in screens (authenticated + service_role).
// Stub bodies model the privilege layer only: each one records a row in secdef_probe (and notifiers also
// insert into notificaciones, which fires the push trigger of the harness).
const U = '00000000-0000-4000-8000-000000000001';
export const FUNCTIONS = [
  { name: 'fn_check_and_notify_pending_asistencias', args: '', ret: 'TABLE(notification_count integer)', call: '', rows: 'SELECT 1', g: 'A', notifier: true, cfg: 'public' },
  { name: 'fn_generate_class_start_reminders', args: '', ret: 'TABLE(notifications_created integer)', call: '', rows: 'SELECT 1', g: 'A', notifier: true, cfg: 'public' },
  { name: 'generate_pending_class_notifications', args: '', ret: 'TABLE(maestros_processed integer, notifications_created integer, errors_logged integer)', call: '', rows: 'SELECT 1, 1, 0', g: 'A', invoker: true, notifier: true },
  { name: 'fn_escalar_mora', args: '', ret: 'void', call: '', g: 'A' },
  { name: 'fn_hermes_escalar_tareas_bloqueadas', args: '', ret: 'void', call: '', g: 'A' },
  { name: 'fn_generar_ciclo_cuotas', args: 'p_mes integer, p_anio integer, p_monto_centavos bigint', ret: 'integer', call: '1, 2026, 100', value: '1', g: 'A', cfg: 'public' },
  { name: 'fn_fin_acquire_service_refresh_lock', args: 'p_service_account_id uuid, p_refresh_run_id uuid, p_lease_seconds integer', ret: 'boolean', call: `'${U}', '${U}', 60`, value: 'true', g: 'A', cfg: 'public', noPublic: true },
  { name: 'fn_fin_complete_service_refresh', args: 'p_service_account_id uuid, p_refresh_run_id uuid, p_status text, p_error_code text, p_record_query boolean, p_success boolean', ret: 'boolean', call: `'${U}', '${U}', 'ok', NULL, true, true`, value: 'true', g: 'A', cfg: 'public', noPublic: true },
  { name: 'fn_actualizar_racha_alumno', args: 'p_alumno_id uuid, p_fecha date, p_clase_id uuid', ret: 'void', call: `'${U}', current_date, '${U}'`, g: 'A', cfg: 'public' },
  { name: 'fn_evaluar_logros_alumno', args: 'p_alumno_id uuid', ret: 'void', call: `'${U}'`, g: 'A', cfg: 'public' },
  { name: 'fn_calcular_score_representante', args: 'p_representante_id uuid, p_mes integer, p_anio integer', ret: 'void', call: `'${U}', 1, 2026`, g: 'A' },
  { name: 'refresh_maestro_desempeno', args: '', ret: 'void', call: '', g: 'A', cfg: 'public' },
  { name: 'fn_recalcular_bloqueos_familia', args: 'p_familia_id uuid', ret: 'jsonb', call: `'${U}'`, value: `'{}'::jsonb`, g: 'A', cfg: 'public' },
  { name: 'fn_calcular_pulso_score', args: 'p_persistir boolean', ret: 'jsonb', call: 'false', value: `'{}'::jsonb`, g: 'B' },
  { name: 'fn_crear_evento_calendario', args: 'p_departamento_id uuid, p_titulo text, p_descripcion text, p_tipo text, p_fecha_inicio date, p_fecha_fin date, p_fecha_alerta integer, p_prioridad text, p_responsable_id uuid, p_protocolo_json jsonb, p_notas text', ret: 'json', call: `'${U}', 't', 'd', 'x', current_date, current_date, 1, 'alta', '${U}', NULL, NULL`, value: `'{}'::json`, g: 'B' },
  { name: 'fn_actualizar_tarea', args: 'p_tarea_id uuid, p_nuevo_estado text, p_notas text', ret: 'json', call: `'${U}', 'x', NULL`, value: `'{}'::json`, g: 'B' },
  { name: 'fn_generar_tareas_calendario', args: 'p_evento_id uuid', ret: 'json', call: `'${U}'`, value: `'{}'::json`, g: 'B' },
  { name: 'fn_generar_instancias_gastos_fijos', args: 'p_mes integer, p_anio integer', ret: 'integer', call: '1, 2026', value: '1', g: 'B' },
  { name: 'fn_lut_upsert_diagnostico', args: 'p_orden_id uuid, p_diagnostico_tecnico text, p_items jsonb, p_causa_probable text, p_tipo_dano text, p_gravedad text, p_zona_afectada text, p_reparacion_recomendada text, p_materiales_requeridos text, p_tiempo_estimado_horas numeric, p_costo_materiales numeric, p_requiere_servicio_externo boolean, p_observaciones text, p_diagnosticado_por uuid, p_diagnosticado_por_nombre text', ret: 'uuid', call: `'${U}', 'x', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL`, value: 'gen_random_uuid()', g: 'B', cfg: 'public' },
  { name: 'justificar_alumno_por_dia', args: 'p_alumno_id uuid, p_fecha date, p_motivo text, p_creado_por uuid', ret: 'TABLE(justificaciones_count integer, asistencias_updated integer, affected_clases_ids uuid[], success boolean, message text)', call: `'${U}', current_date, 'm', NULL`, rows: `SELECT 1, 1, ARRAY[]::uuid[], true, 'ok'::text`, g: 'B', cfg: 'public' },
  { name: 'fn_repertoire_update_applicability', args: 'p_montage_id uuid, p_measure_id uuid, p_applicability aplicabilidad_compas, p_fila_id uuid', ret: 'aplicabilidad_compas', call: `'${U}', '${U}', 'aplica', NULL`, value: `'aplica'::aplicabilidad_compas`, g: 'B', cfg: 'public, pg_temp', noPublic: true },
  { name: 'fn_repertoire_update_preparation', args: 'p_montage_id uuid, p_measure_id uuid, p_new_state estado_preparacion, p_actor_id uuid, p_scope text, p_source text, p_fila_id uuid, p_student_id uuid, p_session_id uuid, p_bulk_operation_id uuid', ret: 'jsonb', call: `'${U}', '${U}', 'listo', NULL, 's', 'src', NULL, NULL, NULL, NULL`, value: `'{}'::jsonb`, g: 'B', cfg: 'public, pg_temp', noPublic: true },
  { name: 'fn_sincronizar_arbol_curricular', args: 'p_clase_id uuid, p_nombre text, p_objetivos jsonb, p_plantilla_id uuid', ret: 'uuid', call: `'${U}', 'n', NULL, NULL`, value: 'gen_random_uuid()', g: 'B', cfg: 'public' },
  { name: 'fn_upsert_protocolo', args: 'p_nombre text, p_tipo text, p_descripcion text, p_tareas jsonb', ret: 'json', call: `'n', 't', NULL, NULL`, value: `'{}'::json`, g: 'B' },
  { name: 'clonar_plantilla_a_clase', args: 'p_clase_id uuid, p_plantilla_id uuid, p_node_ids uuid[]', ret: 'TABLE(objetivo_id uuid, origen_objetivo_id uuid, indicador_id uuid, origen_indicator_id uuid)', call: `'${U}', '${U}', ARRAY[]::uuid[]`, rows: `SELECT gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()`, g: 'B', cfg: 'public, pg_temp' },
  { name: 'ensure_session_and_save_evaluation', args: 'p_clase_id uuid, p_maestro_id uuid, p_fecha date, p_hora_inicio time with time zone, p_indicator_id uuid, p_student_id uuid, p_nota integer, p_observations text', ret: 'uuid', call: `'${U}', '${U}', current_date, now()::timetz, '${U}', '${U}', 5, NULL`, value: 'gen_random_uuid()', g: 'B' },
  { name: 'fn_hermes_orquestar_protocolo', args: 'p_evento_id uuid, p_protocolo_id uuid', ret: 'TABLE(paso integer, tarea_id uuid, titulo text, departamento text, fecha_vencimiento date, dependencia_tarea_id uuid)', call: `'${U}', '${U}'`, rows: `SELECT 1, gen_random_uuid(), 't'::text, 'd'::text, current_date, NULL::uuid`, g: 'B', cfg: 'public' },
  { name: 'fn_hermes_register_response', args: 'p_notif_id uuid, p_response_text text, p_sender_whatsapp text, p_sender_name text', ret: 'json', call: `'${U}', 'r', 's', 'n'`, value: `'{}'::json`, g: 'B' },
  { name: 'fn_hermes_update_notif', args: 'p_id uuid, p_estado_wa text, p_respuesta text', ret: 'void', call: `'${U}', 'x', NULL`, g: 'B' },
  { name: 'fn_registrar_alerta_enviada', args: 'p_tipo text, p_canal text, p_destinatario text, p_contenido text', ret: 'json', call: `'t', 'c', 'd', 'x'`, value: `'{}'::json`, g: 'B' },
];
export const BACKFILL = { name: 'backfill_alumnos_desde_postulantes', args: 'dry_run boolean', call: 'true' };

export const identity = (f) => {
  const types = f.args.split(',').map((a) => a.trim()).filter(Boolean).map((a) => a.replace(/^\S+\s+/, ''));
  return `public.${f.name}(${types.join(', ')})`;
};

/** SQL that models the production function (owner postgres, SECURITY DEFINER unless invoker, default ACL). */
export const stubSql = (f) => {
  const body = f.ret.startsWith('TABLE') ? `RETURN QUERY ${f.rows};` : f.ret === 'void' ? '' : `RETURN ${f.value};`;
  const notify = f.notifier
    ? `INSERT INTO public.notificaciones (profile_id, tipo, titulo, mensaje) VALUES (NULL, 'sistema', '${f.name}', 'm');` : '';
  return `CREATE FUNCTION public.${f.name}(${f.args}) RETURNS ${f.ret} LANGUAGE plpgsql ${f.invoker ? '' : 'SECURITY DEFINER'}
  ${f.cfg ? `SET search_path TO ${f.cfg}` : ''} AS $stub$
BEGIN
  INSERT INTO public.secdef_probe (fn) VALUES ('${f.name}');
  ${notify}
  ${body}
END; $stub$;
${f.noPublic ? `REVOKE ALL ON FUNCTION ${identity(f)} FROM PUBLIC;` : ''}`;
};
