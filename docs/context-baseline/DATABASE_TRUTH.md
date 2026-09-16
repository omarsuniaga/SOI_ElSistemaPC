# DATABASE TRUTH — Snapshot Real de Supabase / PostgreSQL

> **Proyecto:** `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`, us-east-2)
> **Motor:** PostgreSQL 17.6
> **Fecha de captura:** 10 sep 2026
> **Archivo SQL completo asociado:** `database/schema_reference_2026-09-10.sql` (686 KB)
> **Aviso:** Snapshot generado a partir de introspección directa. NO contiene datos sensibles ni credenciales.

## 1. Resumen Ejecutivo del Esquema

| Componente | Cantidad Medida | Fuente |
|---|---|---|
| Tablas Base (`public`) | 216 | `columns.json` |
| Columnas Totales | 2532 | `columns.json` |
| Constraints (PK, FK, UNIQUE, CHECK) | 883 | `constraints_indexes.json` |
| Índices | 701 | `constraints_indexes.json` |
| Funciones / Stored Procedures / RPC | 263 | `functions_triggers.json` |
| Triggers Activos | 95 | `functions_triggers.json` |
| Políticas RLS (Row Level Security) | 591 | `policies.json` |
| Tablas con RLS Deshabilitada | 0 | `policies.json` |
| Vistas (`views`) | 43 | `views_cron_realtime_buckets_comments.json` |
| Vistas Materializadas | 0 | `views_cron_realtime_buckets_comments.json` |
| Tipos ENUM Personalizados | 35 | `types_sequences_extensions.json` |
| Secuencias (`sequences`) | 4 | `types_sequences_extensions.json` |
| Extensiones PostgreSQL | 9 | `types_sequences_extensions.json` |
| Cron Jobs (`pg_cron`) | 11 | `views_cron_realtime_buckets_comments.json` |
| Buckets de Storage (`storage.buckets`) | 3 | `views_cron_realtime_buckets_comments.json` |
| Comentarios Explícitos en BD | 61 | `views_cron_realtime_buckets_comments.json` |

## 2. Extensiones y Tipos ENUM

### 2.1 Extensiones
- `pg_cron` (v1.6.4)
- `pg_net` (v0.20.0)
- `pg_stat_statements` (v1.11)
- `pg_trgm` (v1.6)
- `pgcrypto` (v1.3)
- `plpgsql` (v1.0)
- `supabase_vault` (v0.3.1)
- `unaccent` (v1.1)
- `uuid-ossp` (v1.1)

### 2.2 Tipos ENUM (35)

- **`asignacion_estado`**: `pendiente` | `aprobado` | `rechazado` | `cobrado`
- **`attempt_result`**: `in_process` | `approved` | `failed`
- **`cierre_caja_estado`**: `borrador` | `cerrado` | `auditado`
- **`cuota_estado`**: `pendiente` | `pagada` | `vencida` | `en_mora` | `exonerada` | `becada` | `pre_pagada`
- **`event_categoria`**: `concierto` | `ensayo` | `reunion` | `patrocinio` | `pago` | `corte` | `inscripcion` | `auditoria` | `otro` | `aniversario` | `audicion_trimestral` | `ensayo_intensivo`
- **`exoneracion_tipo`**: `total` | `parcial`
- **`mensaje_tipo`**: `general` | `urgente` | `consulta` | `aprobacion_requerida`
- **`metodo_pago`**: `efectivo` | `transferencia` | `pago_movil` | `tarjeta` | `mixto` | `tercero` | `link_externo`
- **`minuta_visibilidad`**: `cajero` | `admin` | `todos`
- **`nivel_estudiante`**: `Nivel 1` | `Nivel 2` | `Nivel 3` | `Nivel 4` | `Nivel 5`
- **`notif_canal`**: `whatsapp` | `portal` | `ambos`
- **`notif_estado_portal`**: `no_leida` | `leida` | `archivada`
- **`notif_estado_wa`**: `pendiente` | `enviada` | `leida` | `respondida` | `fallida` | `no_aplica`
- **`notif_prioridad`**: `baja` | `media` | `alta` | `critica`
- **`notif_tipo`**: `mora_recordatorio` | `mora_compromiso` | `mora_escalada` | `accesorio_asignado` | `accesorio_aprobacion` | `stock_bajo` | `comodato_riesgo` | `campana_pago` | `mensaje_interno` | `tarea_asignada` | `minuta_nueva`
- **`patrocinante_tipo`**: `persona` | `empresa`
- **`patrocinio_cubre`**: `cuotas` | `wallet` | `accesorios` | `todo`
- **`progress_status`**: `pending` | `in_process` | `approved` | `failed`
- **`resultado_audicion`**: `PROMOVIDO` | `PERMANECE` | `NO_PROMOVIDO`
- **`route_status`**: `draft` | `published` | `archived`
- **`sim_actor_tipo`**: `postulante` | `alumno` | `maestro` | `representante`
- **`sim_canal`**: `whatsapp` | `email`
- **`sim_estado_pago`**: `solvente` | `moroso` | `no_aplica`
- **`sim_outbox_estado`**: `pendiente` | `enviado` | `fallido`
- **`sim_run_estado`**: `creado` | `corriendo` | `pausado` | `finalizado` | `error`
- **`soi_departamento`**: `DIR` | `ACM` | `ADM` | `FIN` | `LOG` | `COM` | `TECNICO` | `LUT`
- **`tarea_estado`**: `pendiente` | `en_progreso` | `completada` | `cancelada` | `vencida`
- **`tarea_institucional_estado`**: `pendiente` | `en_progreso` | `completada` | `bloqueada` | `cancelada` | `observada` | `bloqueada_por_dependencia`
- **`tarea_institucional_prioridad`**: `baja` | `media` | `alta` | `critica`
- **`tarea_prioridad`**: `baja` | `media` | `alta` | `critica`
- **`tarea_tipo`**: `seguimiento_pago` | `revision_instrumento` | `reposicion_stock` | `recordatorio_compromiso` | `otro`
- **`wallet_modo`**: `solo_accesorios` | `solo_cuotas` | `mixto`
- **`wallet_origen`**: `pago` | `patrocinio` | `beca` | `accesorio` | `ajuste`
- **`wallet_status`**: `operativa` | `congelada` | `devuelta`
- **`wallet_tipo`**: `credito` | `debito`

## 3. Inventario de Tablas Base (`public`)

| Tabla | Columnas | Filas Vivas (aprox) | Comentario / Estado en BD |
|---|---|---|---|
| `academic_plans` | 8 | 0 | - |
| `accesorios` | 11 | 0 | -- DEPRECATED: conservada para rediseño de inventario lutería 2026-09 (Owner: LUT) |
| `acm_active_routes` | 16 | 0 | - |
| `acm_curriculum_sources` | 15 | 0 | - |
| `acm_curriculum_versions` | 11 | 0 | - |
| `acm_evidence_files` | 10 | 0 | - |
| `acm_teacher_week_adjustments` | 12 | 0 | - |
| `acm_weekly_plan_items` | 17 | 0 | - |
| `acm_weekly_plans` | 16 | 0 | - |
| `alertas_log` | 6 | 0 | - |
| `alumno_escolaridad` | 14 | 0 | -- DEPRECATED: datos escolares secundarios diferidos 2026-09 (Owner: DIR/ADM) |
| `alumno_plan_entradas` | 10 | 0 | - |
| `alumno_suspensiones` | 11 | 0 | - |
| `alumnos` | 96 | 282 | - |
| `alumnos_clases` | 9 | 476 | - |
| `alumnos_logros` | 3 | 0 | - |
| `alumnos_programas` | 11 | 456 | - |
| `alumnos_reinscripciones` | 9 | 0 | - |
| `aplicaciones_pago` | 6 | 6 | - |
| `app_users` | 6 | 1 | - |
| `applicant_events` | 5 | 0 | - |
| `applicants` | 9 | 0 | - |
| `appointments` | 8 | 0 | - |
| `asistencia_maestros` | 15 | 0 | Presencia del docente por sesion de clase. Complementa ausencias_maestros (que modela solicitudes de permiso, no presencia diaria). |
| `asistencias` | 13 | 2812 | - |
| `ausencias` | 10 | 0 | - |
| `ausencias_auditoria` | 6 | 0 | - |
| `ausencias_maestros` | 30 | 6 | Registro de ausencias y solicitudes de permisos de los docentes |
| `becas` | 11 | 1 | - |
| `blocks` | 8 | 8 | - |
| `calendario` | 16 | 0 | - |
| `calendario_institucional` | 17 | 7 | - |
| `campania_envios` | 12 | 0 | - |
| `campanias_periodo` | 12 | 0 | - |
| `catalogo_niveles` | 8 | 1 | - |
| `catalogo_objetivos_especificos` | 7 | 0 | -- DEPRECATED: plantilla curricular legacy en evaluación 2026-09 (Owner: ACM) |
| `catalogo_objetivos_generales` | 8 | 1 | - |
| `catalogos` | 11 | 131 | - |
| `clase_horarios` | 8 | 68 | - |
| `clase_mapa_indicadores` | 12 | 0 | -- DEPRECATED: jerarquía legacy en evaluación 2026-09 (Owner: ACM) |
| `clase_mapa_objetivos` | 14 | 0 | -- DEPRECATED: objetivos legacy en evaluación 2026-09 (Owner: ACM) |
| `clases` | 25 | 41 | - |
| `clases_emergentes` | 16 | 0 | - |
| `class_event_methodology` | 14 | 0 | Structured methodology notes for a class event (warmup, focus areas, repertoire, etc). |
| `class_events` | 10 | 0 | Explicit class event record per session+student, linking academic plan, level, and methodology. |
| `class_session_content_snapshots` | 8 | 0 | - |
| `cobertura_alumno_objetivo` | 9 | 0 | - |
| `comodatos_activos` | 16 | 30 | Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso. |
| `compromisos_pago` | 9 | 0 | - |
| `comunicaciones_seguimiento` | 18 | 2 | Portal COM: registro de interacciones (llamadas/whatsapp/correo/reunion) con motor de proxima-accion (follow-up). Estandar CRM Activity model. |
| `configuracion_aranceles` | 11 | 1 | - |
| `configuracion_recordatorios` | 17 | 1 | - |
| `contactos_alianzas` | 18 | 36 | - |
| `contenidos_sesion` | 9 | 0 | - |
| `conversaciones_whatsapp` | 11 | 1 | - |
| `cuotas` | 16 | 718 | - |
| `curriculo_objetivos` | 4 | 6 | - |
| `curriculo_pilares` | 4 | 3 | - |
| `curriculos` | 8 | 2 | - |
| `departamentos` | 11 | 7 | - |
| `document_batches` | 17 | 0 | -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM) |
| `document_templates` | 11 | 11 | - |
| `ejercicios` | 17 | 2 | - |
| `evaluacion_indicador` | 18 | 5 | - |
| `evaluations` | 19 | 0 | - |
| `facturas_reparacion` | 13 | 0 | Facturas asociadas a reparaciones de instrumentos |
| `familias` | 7 | 298 | - |
| `fin_service_accounts` | 11 | 1 | Cuentas de servicios externos a refrescar (medidores CEPM, etc.). Solo service_role. |
| `fin_service_balance_snapshots` | 11 | 0 | Histórico de balances observados por cuenta (dedup por source_snapshot_key). Solo service_role. |
| `fin_service_providers` | 5 | 1 | Catálogo de conectores de proveedores de servicios externos (CEPM, etc.). Solo service_role. |
| `fin_service_refresh_runs` | 9 | 0 | Auditoría de cada intento de refresh (audit trail). Solo service_role. |
| `fin_service_refresh_state` | 8 | 0 | Estado de lock + última consulta por cuenta, para concurrencia segura. Solo service_role. |
| `finanzas_politica_cobranza` | 7 | 1 | - |
| `gastos_fijos` | 13 | 1 | - |
| `gastos_fijos_pagos` | 11 | 0 | - |
| `generated_documents` | 18 | 0 | -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM) |
| `hermes_gateway_health` | 9 | 1 | Registro de telemetria y latido en vivo (heartbeat) emitido por el contenedor Evolution API / Baileys. |
| `hermes_gateway_worker_lease` | 4 | 1 | - |
| `hermes_inbox` | 8 | 1 | Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role. |
| `hermes_kanban_cards` | 10 | 6 | Espejo read-only de tarjetas del Kanban de Hermes (~/.hermes/kanban.db). Escrita por edge fn hermes-kanban-ingest via poller. Fase 1 puente Hermes<->SOI. |
| `hermes_process_cases` | 20 | 11 | Ejecucion concreta de un proceso SOI. Su id se usa como correlation_id para agrupar tareas institucionales. |
| `hermes_protocolos` | 8 | 7 | - |
| `hermes_reactive_rules` | 9 | 8 | - |
| `hermes_whatsapp_config` | 20 | 4 | - |
| `hermes_whatsapp_queue` | 9 | 75 | - |
| `historial_estado_alumno` | 7 | 16 | Tracking de altas, bajas y reactivaciones de alumnos |
| `homework_assignments` | 9 | 0 | Formal homework assignments with optional node link and due date. |
| `horarios` | 10 | 0 | - |
| `indicador_prerequisito` | 4 | 2 | - |
| `indicator_attempts` | 15 | 20 | - |
| `indicator_session_students` | 6 | 0 | - |
| `indicator_sessions` | 8 | 0 | - |
| `indicators` | 9 | 4163 | - |
| `instrumentos` | 12 | 3 | - |
| `inventario_accesorios` | 10 | 8 | Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.) |
| `inventario_activos` | 40 | 324 | Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso. |
| `inventario_historial` | 8 | 476 | Historial de eventos de instrumentos. Se inserta automáticamente via triggers. |
| `inventario_materiales` | 14 | 30 | - |
| `inventario_reparaciones` | 13 | 0 | Reparaciones de instrumentos. estado controla el flujo: recibido → en_reparacion → finalizado → entregado |
| `justificaciones` | 15 | 156 | Registro de justificaciones de inasistencias de alumnos |
| `levels` | 12 | 101 | - |
| `logros` | 8 | 3 | - |
| `lut_diagnosticos` | 18 | 0 | - |
| `lut_evidencias` | 10 | 0 | - |
| `lut_insumos` | 11 | 0 | - |
| `lut_movimientos_insumos` | 8 | 0 | - |
| `lut_ordenes_reparacion` | 30 | 1 | - |
| `lut_presupuestos` | 15 | 0 | - |
| `lut_solicitudes_compra` | 14 | 0 | - |
| `maestro_access_credentials` | 9 | 0 | Encrypted vault for recoverable maestro portal passwords. Plaintext is only returned by the admin-only Edge Function. |
| `maestro_desempeno` | 13 | 4 | - |
| `maestro_indicadores` | 6 | 10 | - |
| `maestro_objetivos` | 6 | 4 | - |
| `maestro_retiros` | 7 | 0 | - |
| `maestro_routes` | 7 | 2 | - |
| `maestro_tareas` | 8 | 0 | - |
| `maestro_unidades` | 6 | 4 | - |
| `maestros` | 19 | 33 | - |
| `mapa_plantillas` | 10 | 0 | -- DEPRECATED: plantillas legacy en evaluación 2026-09 (Owner: ACM) |
| `minutas` | 12 | 0 | -- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09 (Owner: DIR) |
| `modulos` | 12 | 1 | - |
| `niveles` | 10 | 3 | - |
| `node_resources` | 10 | 0 | - |
| `nodes` | 10 | 1120 | - |
| `notificaciones` | 16 | 179 | - |
| `notificaciones_asistencia` | 21 | 0 | - |
| `notificaciones_caja` | 17 | 0 | - |
| `notification_trigger_logs` | 9 | 326 | - |
| `objetivos` | 8 | 480 | Objetivos explícitos entre temas (nodes) e indicadores. |
| `observaciones_alumnos` | 18 | 0 | - |
| `observaciones_sesion` | 12 | 89 | Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves. |
| `pagos` | 11 | 3 | - |
| `pagos_alumnos` | 10 | 1 | Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago. |
| `patrocinantes` | 9 | 0 | - |
| `patrocinios` | 10 | 0 | - |
| `periodo_excepciones` | 9 | 1 | Dias no lectivos dentro de un periodo academico. periodo_id NULL = excepcion global (feriado nacional). |
| `periodos` | 11 | 4 | Períodos académicos del año (ej: Trimestre I 2025) |
| `periodos_cierre_auditoria` | 9 | 2 | - |
| `permisos_maestros` | 14 | 29 | - |
| `plan_clases` | 7 | 2 | DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators |
| `plan_indicadores` | 5 | 15 | DEPRECATED: usar indicators |
| `plan_niveles` | 6 | 3 | DEPRECATED: usar levels |
| `plan_objetivos` | 4 | 10 | DEPRECATED: usar indicators |
| `plan_temas` | 6 | 7 | DEPRECATED: usar nodes |
| `planificaciones` | 24 | 3 | - |
| `planned_content` | 8 | 0 | Teachers' daily planning of content to cover in each class session |
| `planning_documents` | 10 | 0 | - |
| `plantillas_planificacion` | 10 | 8 | DEPRECATED: reemplazada por mapa_plantillas para el mapa gamificado |
| `portal_catalog` | 11 | 11 | - |
| `postulantes` | 29 | 404 | - |
| `profiles` | 11 | 34 | - |
| `programas` | 9 | 7 | - |
| `programas_prerrequisitos` | 7 | 4 | Flujo académico: qué programa exige haber cursado otro (selección, audición o recomendación del maestro) |
| `progresos` | 18 | 219 | - |
| `protocolos` | 8 | 0 | -- DEPRECATED: infraestructura base para Hermes en reserva 2026-09 (Owner: DIR/HERMES) |
| `pulso_score_history` | 9 | 1 | - |
| `push_subscriptions` | 9 | 9 | - |
| `rachas` | 5 | 0 | -- DEPRECATED: gamificación pedagógica en pausa 2026-09 (Owner: ACM) |
| `registros_pendientes` | 15 | 10 | - |
| `repertoire_items` | 9 | 14 | - |
| `representantes` | 15 | 90 | - |
| `retenciones_instrumento` | 17 | 0 | Retención temporal del instrumento de un alumno por ausentismo acumulado (nivel 3). Independiente del inventario instrumentos: instrumento_texto sirve cuando no hay fila formal. fecha_reincorporacion reinicia el contador de ausencias del alumno para el período. |
| `route_versions` | 8 | 9 | - |
| `routes` | 8 | 8 | - |
| `ruta_contenido_objetivos` | 8 | 0 | - |
| `rutas_contenido` | 14 | 0 | - |
| `salones` | 14 | 11 | - |
| `schedule_run_feedback` | 6 | 0 | -- DEPRECATED: telemetría de horarios pausada 2026-09 (Owner: ACM) |
| `schedule_runs` | 8 | 0 | -- DEPRECATED: motor algorítmico de horarios pausado 2026-09 (Owner: ACM) |
| `score_compromiso` | 13 | 0 | - |
| `sections` | 6 | 15 | - |
| `seguimiento_ausencias_reinicio` | 6 | 1 | - |
| `seguimiento_reglas` | 10 | 5 | - |
| `service_account_observations` | 12 | 0 | - |
| `service_accounts` | 12 | 0 | - |
| `sesiones_clase` | 27 | 290 | - |
| `signage_media` | 17 | 3 | Playlist declarativa de la señalética (intención). El caché físico de YouTube y su estado de descarga viven en la Raspberry, no aquí. |
| `signage_pantallas` | 16 | 1 | Registro de pantallas de señalética. layout = jsonb con proporciones y ajustes de zona. Escrita por el portal Admin (es_admin), leída por la SPA de la Raspberry. |
| `sim_actores` | 8 | 10 | Datos 100% FICTICIOS para el sandbox del simulador (postulantes, alumnos, maestros, representantes). Nunca referencia entidades reales de producción. |
| `sim_calendario` | 13 | 39 | Espejo aislado de calendario_institucional para el sandbox del simulador. Nunca se referencia desde triggers de producción. |
| `sim_config` | 7 | 2 | Whitelist server-side inviolable de destinos de envío (spec: simulador-salida-segura / Whitelist server-side inviolable). Un registro por canal. |
| `sim_log` | 9 | 125 | Auditoría append-only de cada acción de agente. Base para la animación en tiempo real vía Supabase Realtime (ver RLS: SELECT abierto a authenticated). |
| `sim_outbox` | 11 | 12 | - |
| `sim_runs` | 11 | 1 | - |
| `sim_tareas` | 14 | 15 | Espejo aislado de tareas_institucionales para el sandbox del simulador. |
| `soi_analisis_semanal` | 11 | 1 | - |
| `soi_event_bus` | 6 | 1 | Bus de eventos interno. Solo service_role: sin politica para authenticated, el cliente no accede. |
| `soi_eventos` | 9 | 2579 | - |
| `soi_process_contracts` | 16 | 4 | Contrato digital ejecutable de un proceso SOI documentado. No reemplaza la ficha canonica; la vuelve operable por Hermes. |
| `soi_rule_effectiveness` | 8 | 6 | - |
| `solicitudes_ausencia` | 9 | 1 | - |
| `solicitudes_necesidades` | 23 | 2 | - |
| `solicitudes_permisos` | 10 | 1 | - |
| `student_case_actions` | 13 | 0 | - |
| `student_case_alerts` | 14 | 5 | - |
| `student_case_events` | 8 | 4 | - |
| `student_cases` | 19 | 2 | - |
| `student_indicator_progress` | 10 | 0 | - |
| `system_config` | 5 | 23 | Tabla de configuración del sistema - API keys, settings globales |
| `tarea_comentarios` | 6 | 1 | - |
| `tarea_historial` | 10 | 1 | - |
| `tarea_logs` | 6 | 0 | - |
| `tareas_caja` | 15 | 0 | - |
| `tareas_calendario` | 12 | 0 | - |
| `tareas_institucionales` | 26 | 210 | - |
| `teacher_class_sessions` | 11 | 0 | - |
| `teacher_session_indicators` | 9 | 0 | - |
| `telegram_allowed_users` | 7 | 1 | - |
| `telegram_messages_raw` | 7 | 0 | - |
| `unidades` | 8 | 1 | - |
| `user_portal_access` | 5 | 2 | - |
| `usuario_departamentos` | 5 | 0 | - |
| `wallet_movimientos` | 9 | 0 | - |
| `whatsapp_consentimientos` | 11 | 0 | - |
| `whatsapp_optout` | 3 | 0 | - |
| `whatsapp_webhook_log` | 13 | 1 | - |

## 4. Vistas (`public`)

| Vista | Definición Resumida |
|---|---|
| `alumno_clases` | ` SELECT id, alumno_id, clase_id, fecha_inscripcion, activo, created_at FROM alumnos_clases;...` |
| `node_student_coverage` | ` SELECT i.node_id, a.id AS student_id, a.nombre_completo, max(ia.created_at) AS last_attempt_date, count(*) AS attempt_c...` |
| `signage_v_calendario_mes` | ` SELECT id, titulo, descripcion, (categoria)::text AS categoria, ubicacion, fecha_inicio, fecha_fin, COALESCE(es_macro_e...` |
| `signage_v_horario_hoy` | ` SELECT id, clase_id, hora_inicio, hora_fin, clase_nombre, instrumento, salon_nombre, maestro_nombre, origen FROM ( SELE...` |
| `signage_v_horario_manana` | ` SELECT id, clase_id, hora_inicio, hora_fin, clase_nombre, instrumento, salon_nombre, maestro_nombre, origen FROM ( SELE...` |
| `signage_v_horario_semana` | ` SELECT ch.id, ch.clase_id, CASE lower(ch.dia) WHEN 'lunes'::text THEN 1 WHEN 'martes'::text THEN 2 WHEN 'miércoles'::te...` |
| `student_results` | ` SELECT s.id, s.nombre_completo AS name, CASE WHEN ((lower(COALESCE(s.instrumento_principal, s.instrumento_interes)) ~~ ...` |
| `teacher_class_fill_metrics` | ` SELECT sc.id AS sesion_id, sc.clase_id, sc.maestro_id, sc.fecha, sc.hora_inicio, sc.hora_fin, ( SELECT max(a.marked_at)...` |
| `teacher_class_fill_metrics_aggregated` | ` SELECT m.id AS maestro_id, m.nombre_completo AS maestro_nombre, count(DISTINCT tcfm.sesion_id) AS total_clases, count(D...` |
| `v_semaforo_contenidos` | ` SELECT iss.alumno_id, s.clase_id, s.objetivo_id, count(iss.id) AS total_registros, count(iss.id) FILTER (WHERE ((iss.no...` |
| `view_evaluaciones_pedagogicas` | ` SELECT ia.id AS attempt_id, ia.student_id, a.nombre_completo AS student_name, ia.indicator_id, i.description AS indicat...` |
| `view_node_difficulty` | ` SELECT n.name AS node_name, count(ia.id) AS total_attempts, (((sum( CASE WHEN (ia.result = 'failed'::text) THEN 1 ELSE ...` |
| `vw_activos_ociosos` | ` SELECT c.id AS comodato_id, c.activo_id, ia.codigo_inventario, ia.tipo_instrumento, ia.marca, ia.modelo, c.alumno_id, a...` |
| `vw_admin_enrollment_calendar` | ` SELECT apt.id AS appointment_id, apt.scheduled_datetime, apt.status AS appointment_status, apt.notes, app.id AS applica...` |
| `vw_alertas_activas` | ` SELECT 'ausencias_consecutivas'::text AS tipo_alerta, 'rojo'::text AS color, a.id AS alumno_id, a.nombre_completo AS al...` |
| `vw_alumno_estado_pago` | ` WITH cuotas_resumen AS ( SELECT c.alumno_id, c.familia_id, count(*) FILTER (WHERE (c.estado = ANY (ARRAY['pendiente'::c...` |
| `vw_asistencias_clases_formato` | ` WITH base AS ( SELECT a.sesion_clase_id, a.clase_id, s.fecha AS fecha_sesion, s.hora_inicio, s.hora_fin, c_1.nombre AS ...` |
| `vw_asistencias_consolidada` | ` SELECT sc.id AS sesion_clase_id, sc.fecha, sc.clase_id, c.nombre AS nombre_clase, sc.hora_inicio, sc.hora_fin, sc.borra...` |
| `vw_clase_objetivo_estrellas` | ` WITH indicadores_req AS ( SELECT cmi.id AS indicador_id, cmi.objetivo_id, cmi.clase_id FROM clase_mapa_indicadores cmi ...` |
| `vw_comodatos_en_riesgo` | ` SELECT representante_id, familia_id, rep_nombre, nombre_familia, score, nivel FROM vw_score_representantes vsr WHERE (n...` |
| `vw_cupos_iniciacion` | ` SELECT id AS clase_id, nombre, capacidad_maxima, ( SELECT count(*) AS count FROM alumnos_clases ac WHERE (ac.clase_id =...` |
| `vw_destacados_y_riesgo_academico` | ` SELECT id, nombre_completo, instrumento_principal, nivel, tasa_asistencia, promedio_calificacion, alertas_alta, CASE WH...` |
| `vw_estadisticas_periodo` | ` SELECT id AS periodo_id, nombre AS periodo_nombre, fecha_inicio, fecha_fin, activo, ( SELECT count(*) AS count FROM alu...` |
| `vw_estado_familiar` | ` SELECT f.id, f.nombre_familia, f.activa, r.id AS rep_id, r.nombre AS rep_nombre, r.telefono_whatsapp, r.es_pagador, sc....` |
| `vw_evaluacion_indicador_global` | ` SELECT ei.id, ei.alumno_id, ei.clase_id, ei.indicator_id, ei.clase_indicador_id, COALESCE(ei.indicator_id, cmi.origen_i...` |
| `vw_ia_alumnos` | ` SELECT id, nombre_completo AS nombre, instrumento_principal, nivel_actual FROM alumnos WHERE (activo = true);...` |
| `vw_ia_asistencias_resumen` | ` SELECT alumno_id, count(*) AS total, sum( CASE WHEN (estado = 'presente'::text) THEN 1 ELSE 0 END) AS presentes FROM as...` |
| `vw_ia_inventario` | ` SELECT tipo_instrumento, count(*) AS total, sum( CASE WHEN ((estado_uso)::text = 'disponible'::text) THEN 1 ELSE 0 END)...` |
| `vw_ia_maestros` | ` SELECT id, nombre_completo AS nombre, especialidad FROM maestros WHERE (activo = true);...` |
| `vw_indice_ensenanza_guiada` | ` SELECT maestro_id, (count(DISTINCT id))::integer AS total_sesiones, (count(DISTINCT id) FILTER (WHERE (EXISTS ( SELECT ...` |
| `vw_ingresos_diarios` | ` SELECT metodo_pago, count(id) AS cantidad_pagos, sum(monto_centavos) AS total_centavos, min(created_at) AS primer_pago,...` |
| `vw_instrumentos_disponibles` | ` SELECT ia.id, ia.codigo_inventario, ia.tipo_instrumento, ia.marca, ia.modelo, ia.estado_conservacion, ia.ubicacion, ia....` |
| `vw_kpi_inventario` | ` SELECT count(*) FILTER (WHERE (activo = true)) AS total_activos, count(*) FILTER (WHERE (((estado_uso)::text = 'disponi...` |
| `vw_mora_activa` | ` SELECT c.id AS cuota_id, c.familia_id, c.alumno_id, c.concepto, (c.monto_final_centavos - c.monto_pagado_centavos) AS s...` |
| `vw_patron_asistencia` | ` SELECT (EXTRACT(dow FROM ast.fecha))::integer AS dia_semana_num, to_char((ast.fecha)::timestamp with time zone, 'Day'::...` |
| `vw_prediccion_abandono` | ` SELECT a.id AS alumno_id, a.nombre_completo, a.familia_id, f.nombre_familia, COALESCE(vsr.score, (50)::numeric) AS scor...` |
| `vw_rendimiento_maestro` | ` WITH asistencia_m AS ( SELECT c.maestro_principal_id AS maestro_id, count(*) AS total_registros, round((((count(*) FILT...` |
| `vw_reparaciones_pendientes` | ` SELECT ir.id, ir.activo_id, ia.codigo_inventario, ia.tipo_instrumento, ia.marca, ia.modelo, ir.tipo_tallerista, ir.tall...` |
| `vw_resumen_alumno` | ` WITH asistencia_total AS ( SELECT asistencias.alumno_id, count(*) AS total_clases, count(*) FILTER (WHERE (asistencias....` |
| `vw_riesgo_abandono` | ` WITH tendencia AS ( SELECT progresos.alumno_id, ((array_agg(progresos.calificacion ORDER BY progresos.fecha_evaluacion ...` |
| `vw_score_representantes` | ` SELECT DISTINCT ON (sc.representante_id) sc.representante_id, sc.familia_id, sc.score, sc.nivel, sc.puntualidad_pct, sc...` |
| `vw_seguimiento_ausentes` | ` WITH periodo_activo AS ( SELECT periodos.id, periodos.nombre, periodos.fecha_inicio, periodos.fecha_fin FROM periodos W...` |
| `vw_stock_bajo` | ` SELECT id, nombre, categoria, descripcion, stock_actual, stock_minimo, (stock_minimo - stock_actual) AS unidades_faltan...` |

## 5. Cron Jobs (`pg_cron`)

| Job ID | Nombre | Cron Schedule | Activo | Comando |
|---|---|---|---|---|
| 2 | `generate-pending-notifs-9am` | `0 9 * * *` | true | `SELECT generate_pending_class_notifications()` |
| 3 | `generate-pending-notifs-3:15pm` | `15 15 * * *` | true | `SELECT generate_pending_class_notifications()` |
| 4 | `generate-pending-notifs-8:45pm` | `45 20 * * *` | true | `SELECT generate_pending_class_notifications()` |
| 5 | `notify_pending_asistencias_weekdays` | `0 19 * * 1-5` | true | `SELECT fn_check_and_notify_pending_asistencias();` |
| 6 | `notify_pending_asistencias_saturday` | `0 13 * * 6` | true | `SELECT fn_check_and_notify_pending_asistencias();` |
| 7 | `recordar-citas-diario` | `0 11 * * *` | true | `
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/recordar-citas',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'
    )::json,
    body := '{}'::json,
    timeout_milliseconds := 60000
  );
  ` |
| 14 | `class-start-reminders-cron` | `*/2 * * * *` | true | `SELECT fn_generate_class_start_reminders();` |
| 15 | `hermes-escalar-tareas-bloqueadas` | `0 */4 * * *` | true | `SELECT public.fn_hermes_escalar_tareas_bloqueadas()` |
| 17 | `hermes-event-completion-monitor` | `5 * * * *` | true | `
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/hermes-event-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaG1kdm15ZXlzd3VudXJjeW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzI3MjEsImV4cCI6MjA5MjkwODcyMX0.ZEPI2FuJ-apwZYR20PAjAOLRUNIpfknG1LHDCUUwMRs'
    ),
    body := '{"check_all": true}'::jsonb,
    timeout_milliseconds := 30000
  );
  ` |
| 18 | `soi-event-enrichment` | `*/10 7-21 * * 1-5` | true | `
  SELECT net.http_post(
    url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/event-spine-logger',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' \|\| (SELECT value FROM system_config WHERE key = 'supabase_anon_key'),
      'x-internal-key', (SELECT value FROM system_config WHERE key = 'internal_api_key')
    ),
    body := '{"source":"cron"}'::jsonb,
    timeout_milliseconds := 60000
  );
  ` |
| 21 | `finanzas_generar_ciclo_cuotas_mensual` | `0 6 1 * *` | true | `SELECT public.fn_generar_ciclo_cuotas(EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer)` |

## 6. Funciones y Procedimientos RPC Destacados

| Función | Args | Retorno | Security Definer | Volatilidad | Comentario |
|---|---|---|---|---|---|
| `_fn_crear_tarea_caso` | `p_corr uuid, p_titulo text, p_desc text, p_depto s` | `void` | SÍ | volatile | - |
| `actualizar_timestamp_permisos` | `` | `trigger` | NO | volatile | - |
| `actualizar_timestamp_solicitudes` | `` | `trigger` | NO | volatile | - |
| `analizar_seguimiento_alumnos` | `p_desde date, p_hasta date, p_limit integer, p_off` | `TABLE(alumno_id uuid, nombre_c` | NO | stable | - |
| `approve_maestro_profile` | `p_profile_id uuid, p_new_rol text, p_new_estado te` | `jsonb` | SÍ | volatile | Atomic approval of pending maestro profiles by admin. Confirms email, syncs metadata role, creates/updates maestros with registration instrument and reseña, and grants default permissions. |
| `aprobar_usuario` | `p_user_id uuid` | `void` | SÍ | volatile | - |
| `backfill_alumnos_desde_postulantes` | `dry_run boolean` | `TABLE(alumno_id uuid, alumno_n` | SÍ | volatile | - |
| `cambiar_estado_activo` | `p_id uuid, p_nuevo_estado text` | `jsonb` | SÍ | volatile | - |
| `cambiar_estado_reparacion` | `p_id uuid, p_nuevo_estado text` | `jsonb` | SÍ | volatile | - |
| `cambiar_rol_usuario` | `p_user_id uuid, p_nuevo_rol text` | `void` | SÍ | volatile | - |
| `capture_asistencia_marked_at` | `` | `trigger` | NO | volatile | - |
| `capture_observaciones_timestamps` | `` | `trigger` | NO | volatile | - |
| `check_permisos_maestros_integrity` | `` | `trigger` | SÍ | volatile | - |
| `clonar_catalogo_a_clase` | `p_clase_id uuid, p_nivel_id uuid, p_objetivo_gener` | `TABLE(objetivo_id uuid, origen` | SÍ | volatile | - |
| `clonar_plantilla_a_clase` | `p_clase_id uuid, p_plantilla_id uuid, p_node_ids u` | `TABLE(objetivo_id uuid, origen` | SÍ | volatile | - |
| `clone_route_version_as_draft` | `p_source_version_id uuid` | `uuid` | SÍ | volatile | - |
| `count_alumnos_activos` | `` | `bigint` | SÍ | stable | Loop 14: retorna count de alumnos activos. Reemplaza SELECT count sobre alumnos. |
| `crear_reparacion` | `p_activo_id uuid, p_tipo_tallerista text, p_taller` | `jsonb` | SÍ | volatile | - |
| `create_profile_for_maestro` | `` | `trigger` | SÍ | volatile | - |
| `diagnose_profiles_schema` | `` | `jsonb` | SÍ | volatile | - |
| `eliminar_maestro_limpio` | `p_maestro_id uuid` | `jsonb` | SÍ | volatile | - |
| `ensure_session_and_save_evaluation` | `p_clase_id uuid, p_maestro_id uuid, p_fecha date, ` | `uuid` | SÍ | volatile | - |
| `es_admin` | `` | `boolean` | SÍ | volatile | Retorna true si el usuario autenticado tiene rol admin o inventarista en profiles |
| `es_coordinador_acm` | `` | `boolean` | SÍ | volatile | - |
| `es_maestro_de_clase` | `p_clase_id uuid` | `boolean` | SÍ | stable | - |
| `es_maestro_titular_de_clase` | `p_clase_id uuid` | `boolean` | SÍ | stable | - |
| `fn_activar_campania` | `p_id uuid` | `json` | SÍ | volatile | - |
| `fn_activar_periodo` | `p_periodo_id uuid` | `jsonb` | SÍ | volatile | Activa un periodo desactivando el anterior en una sola transaccion. Reemplaza el par de updates del cliente, que dejaba el sistema sin periodo activo si el segundo fallaba. |
| `fn_actualizar_contacto` | `p_tipo text, p_nombre text, p_campo text, p_valor ` | `TABLE(persona_nombre text, tip` | SÍ | volatile | - |
| `fn_actualizar_estado_postulante` | `p_nombre text, p_nuevo_estado text, p_secret text` | `TABLE(postulante_nombre text, ` | SÍ | volatile | - |
| `fn_actualizar_racha_alumno` | `p_alumno_id uuid, p_fecha date, p_clase_id uuid` | `void` | SÍ | volatile | - |
| `fn_actualizar_tarea` | `p_tarea_id uuid, p_nuevo_estado text, p_notas text` | `json` | SÍ | volatile | - |
| `fn_alumno_evaluaciones_recientes` | `p_alumno_id uuid` | `TABLE(evaluacion_id uuid, fech` | SÍ | stable | - |
| `fn_alumno_ficha_360` | `p_alumno_id uuid` | `TABLE(total_sesiones integer, ` | SÍ | stable | - |
| `fn_alumno_instrumentos_comodato` | `p_alumno_id uuid` | `TABLE(comodato_id uuid, tipo_c` | SÍ | stable | - |
| `fn_alumnos_inasistencias_pendiente` | `p_secret text` | `TABLE(alumno_nombre text, inas` | SÍ | volatile | - |
| `fn_anular_sesiones_no_lectivas` | `p_dry_run boolean, p_desde date, p_hasta date` | `jsonb` | SÍ | volatile | Marca cancelada las sesiones en dias no lectivos. Nunca toca sesiones con asistencia registrada: si hubo asistencia la clase ocurrio y el calendario es lo que esta mal. Simulacion por defecto. |
| `fn_asignar_id_jerarquico` | `` | `trigger` | NO | volatile | - |
| `fn_asistencia_maestro_completar` | `` | `trigger` | SÍ | volatile | - |
| `fn_beca_anula_cuotas_abiertas` | `` | `trigger` | SÍ | volatile | Trigger: al registrar/activar una beca, anula (marca becada, perdona el saldo) las cuotas de mensualidad todavia abiertas del alumno dentro de la vigencia de la beca. |
| `fn_bloquear_id_jerarquico` | `` | `trigger` | NO | volatile | - |
| `fn_bloquear_objetivo_jerarquico` | `` | `trigger` | NO | volatile | - |
| `fn_calcular_pulso_score` | `p_persistir boolean` | `jsonb` | SÍ | volatile | - |
| `fn_calcular_score_representante` | `p_representante_id uuid, p_mes integer, p_anio int` | `void` | SÍ | volatile | - |
| `fn_camp_touch_updated_at` | `` | `trigger` | NO | volatile | - |
| `fn_cerrar_periodo_academico` | `p_periodo_id uuid, p_fecha_inicio date, p_fecha_fi` | `jsonb` | SÍ | volatile | Cierra un periodo tras validar completitud. Bloquea por defecto; p_forzar exige justificacion escrita, que se archiva junto al detalle de lo faltante. |
| `fn_check_and_notify_pending_asistencias` | `` | `TABLE(notification_count integ` | SÍ | volatile | Notifica asistencias pendientes del dia. Aborta en dias no lectivos segun fn_es_dia_lectivo. |
| `fn_cobertura_curricular` | `p_periodo_id uuid` | `jsonb` | SÍ | stable | Cobertura curricular del periodo agrupada por categoria de trabajo (node_codigo). Reemplaza el SIN_DATOS del informe de cierre. |
| `fn_com_seg_touch_updated_at` | `` | `trigger` | NO | volatile | - |
| `fn_correlacion_asistencia_rendimiento` | `` | `numeric` | NO | stable | - |
| `fn_crear_evento_calendario` | `p_departamento_id uuid, p_titulo text, p_descripci` | `json` | SÍ | volatile | - |
| `fn_crear_familia_para_alumno` | `p_nombre text` | `uuid` | SÍ | volatile | Crea la familia requerida para dar de alta un alumno, aplicando la misma autorizacion que alumnos_insert_authenticated. Evita que un maestro pueda crear el alumno pero no su familia. |
| `fn_dar_de_baja_alumno` | `p_alumno_id uuid, p_motivo text, p_observaciones t` | `jsonb` | SÍ | volatile | - |
| `fn_datos_jerarquicos_de_objetivo` | `p_objetivo_id uuid` | `TABLE(clase_id uuid, level_num` | NO | stable | - |
| `fn_desplazar_cronograma_evento` | `p_event_id uuid, p_delta_dias integer` | `integer` | NO | volatile | - |
| `fn_deuda_viva` | `p_alumno_id uuid, p_familia_id uuid` | `bigint` | SÍ | stable | - |
| `fn_dispatch_enrollment_reminders` | `` | `integer` | SÍ | volatile | - |
| `fn_eliminar_familia_huerfana` | `p_familia_id uuid` | `boolean` | SÍ | volatile | Revierte la familia creada cuando el alta del alumno falla despues. Solo borra si ningun alumno la referencia. |
| `fn_email_departamento` | `p_codigo text` | `text` | SÍ | stable | - |
| `fn_emit_mora_event` | `` | `trigger` | SÍ | volatile | - |
| `fn_encolar_campania` | `p_campania_id uuid, p_limite integer` | `json` | SÍ | volatile | - |
| `fn_enrollment_funnel_set_updated_at` | `` | `trigger` | NO | volatile | - |
| `fn_es_dia_lectivo` | `p_fecha date` | `boolean` | SÍ | stable | TRUE si la fecha cae dentro de un periodo academico y no esta cubierta por una excepcion. Fuente unica para decidir si se exige registro de asistencia. |
| `fn_escalar_mora` | `` | `void` | SÍ | volatile | - |
| `fn_estado_asistencia_maestro` | `p_maestro_id uuid, p_desde date, p_hasta date` | `TABLE(fecha date, clase_id uui` | SÍ | stable | - |
| `fn_estado_calendario` | `p_fecha date` | `jsonb` | SÍ | stable | Estado del calendario para una fecha, con el motivo legible. Permite que la interfaz explique por que no se pide registro. |
| `fn_evaluacion_cobertura` | `p_clase_id uuid` | `json` | SÍ | stable | - |
| `fn_evaluar_logros_alumno` | `p_alumno_id uuid` | `void` | SÍ | volatile | - |
| `fn_evaluar_reinscripcion` | `p_representante_cedula text, p_alumno_nombre text,` | `jsonb` | SÍ | stable | - |
| `fn_fin_acquire_service_refresh_lock` | `p_service_account_id uuid, p_refresh_run_id uuid, ` | `boolean` | SÍ | volatile | - |
| `fn_fin_complete_service_refresh` | `p_service_account_id uuid, p_refresh_run_id uuid, ` | `boolean` | SÍ | volatile | - |
| `fn_fin_service_dashboard` | `` | `TABLE(service_account_id uuid,` | SÍ | stable | - |
| `fn_fusionar_alumnos_duplicados` | `p_principal_id uuid, p_obsoleto_id uuid, p_datos_f` | `json` | SÍ | volatile | Fusiona dos alumnos duplicados: actualiza el principal con los datos resueltos, migra todos sus datos hijos y elimina el registro obsoleto. Atómico: si cualquier paso falla se revierte todo. |
| `fn_generar_ciclo_cuotas` | `p_mes integer, p_anio integer, p_monto_centavos bi` | `integer` | SÍ | volatile | Genera cuotas mensuales; omite inactivos y exentos; aplica descuento por becas.porcentaje. |
| `fn_generar_instancias_gastos_fijos` | `p_mes integer, p_anio integer` | `integer` | SÍ | volatile | - |
| `fn_generar_tareas_calendario` | `p_evento_id uuid` | `json` | SÍ | volatile | - |
| `fn_generate_class_start_reminders` | `` | `TABLE(notifications_created in` | SÍ | volatile | - |
| `fn_get_indice_ensenanza_guiada` | `` | `SETOF vw_indice_ensenanza_guia` | SÍ | volatile | - |
| `fn_hermes_aprobar_whatsapp` | `p_queue_id uuid` | `void` | SÍ | volatile | - |
| `fn_hermes_auto_delegar_tareas` | `` | `trigger` | SÍ | volatile | - |
| `fn_hermes_close_process_case` | `p_case_id uuid, p_closure_summary text, p_actor_id` | `jsonb` | SÍ | volatile | Cierra un caso/procedimiento Hermes. Verifica tareas completas y evidencias requeridas a menos que force=true. |
| `fn_hermes_consulta_estado` | `` | `json` | SÍ | stable | - |
| `fn_hermes_escalar_tareas_bloqueadas` | `` | `void` | SÍ | volatile | - |
| `fn_hermes_force_close_process_case` | `p_case_id uuid, p_closure_summary text, p_actor_id` | `jsonb` | SÍ | volatile | Fuerza el cierre de un caso Hermes sin verificar tareas pendientes ni evidencias. |
| `fn_hermes_gateway_acquire_lease` | `p_instance_name text, p_owner_id text, p_duration_` | `boolean` | SÍ | volatile | - |
| `fn_hermes_gateway_get_live_status` | `p_instance_name text` | `TABLE(instance_name text, stat` | SÍ | stable | - |
| `fn_hermes_gateway_heartbeat` | `p_instance_name text, p_status text, p_phone text,` | `uuid` | SÍ | volatile | - |
| `fn_hermes_gateway_release_lease` | `p_instance_name text, p_owner_id text` | `boolean` | SÍ | volatile | - |
| `fn_hermes_orquestar_protocolo` | `p_evento_id uuid, p_protocolo_id uuid` | `TABLE(paso integer, tarea_id u` | SÍ | volatile | Loop C: crea tareas en secuencia con dependencias. A diferencia de fn_hermes_auto_delegar_tareas (paralelo), esta función respeta orden y dependencias. |
| `fn_hermes_outreach_gate_status` | `p_secret text` | `TABLE(whatsapp_ingest_enabled ` | SÍ | volatile | - |
| `fn_hermes_queue_whatsapp` | `p_jid text, p_mensaje text` | `uuid` | SÍ | volatile | - |
| `fn_hermes_rechazar_whatsapp` | `p_queue_id uuid, p_motivo text` | `void` | SÍ | volatile | - |
| `fn_hermes_register_response` | `p_notif_id uuid, p_response_text text, p_sender_wh` | `json` | SÍ | volatile | - |
| `fn_hermes_reintentar_mensaje` | `p_id uuid` | `uuid` | SÍ | volatile | - |
| `fn_hermes_resolver_caso` | `p_case_id uuid, p_decision text` | `jsonb` | SÍ | volatile | Aprueba (approve->status=closed) o rechaza (reject->status=cancelled) un hermes_process_case. Autorización server-side scoped por owner_department vs. departamentos del usuario autenticado (N:M via usuario_departamentos). Fail-closed si owner_department es NULL o el usuario no pertenece al departamento dueño. Precondición: status=open. |
| `fn_hermes_rules_update_updated_at` | `` | `trigger` | NO | volatile | - |
| `fn_hermes_start_process_case` | `p_process_code text, p_title text, p_description t` | `uuid` | SÍ | volatile | Abre un caso/procedimiento Hermes desde un contrato SOI y genera tareas departamentales con correlation_id compartido. |
| `fn_hermes_tarea_completada_feedback` | `` | `trigger` | SÍ | volatile | - |
| `fn_hermes_update_notif` | `p_id uuid, p_estado_wa text, p_respuesta text` | `void` | SÍ | volatile | - |
| `fn_historial_activo` | `` | `trigger` | SÍ | volatile | - |
| `fn_historial_comodato` | `` | `trigger` | SÍ | volatile | - |
| `fn_historial_reparacion` | `` | `trigger` | SÍ | volatile | - |
| `fn_listar_protocolos` | `` | `json` | SÍ | volatile | - |
| `fn_lookup_maestro_contacto` | `p_nombre text, p_secret text` | `TABLE(maestro_nombre text, jid` | SÍ | volatile | - |
| `fn_lookup_representante_contacto` | `p_nombre text, p_secret text` | `TABLE(alumno_nombre text, repr` | SÍ | volatile | - |
| `fn_lut_diagnosticos_recalc_costo` | `` | `trigger` | NO | volatile | - |
| `fn_lut_upsert_diagnostico` | `p_orden_id uuid, p_diagnostico_tecnico text, p_ite` | `uuid` | SÍ | volatile | Loop 19: upsert diagnóstico con items. Calcula costo_mano_obra automáticamente y actualiza costo_estimado de la orden. |
| `fn_maestros_asistencia_pendiente` | `p_secret text` | `TABLE(maestro_nombre text, cla` | SÍ | volatile | - |
| `fn_marcar_asistencia` | `p_alumno text, p_clase text, p_fecha date, p_nuevo` | `TABLE(alumno_nombre text, clas` | SÍ | volatile | - |
| `fn_morning_admissions_briefing` | `` | `text` | SÍ | volatile | - |
| `fn_notify_maestro_ausencia` | `` | `trigger` | NO | volatile | - |
| `fn_observar_tarea` | `p_tarea_id uuid, p_comentario text, p_actor_id uui` | `void` | SÍ | volatile | - |
| `fn_obtener_eventos_proximos` | `p_dias_desde integer, p_dias_hasta integer` | `json` | SÍ | volatile | - |
| `fn_obtener_protocolo` | `p_tipo text` | `json` | SÍ | volatile | - |
| `fn_obtener_tareas_departamento` | `p_departamento_id uuid, p_estado text` | `json` | SÍ | volatile | - |
| `fn_periodo_vigente` | `p_fecha date` | `uuid` | SÍ | stable | Periodo academico que contiene la fecha dada. NULL si la fecha cae fuera de todo periodo. |
| `fn_portal_maestro_bloqueado` | `` | `boolean` | SÍ | stable | TRUE cuando hoy no es dia lectivo. Deriva de fn_es_dia_lectivo; ya no depende de que el titulo del evento contenga la palabra RECESO. |
| `fn_prevent_periodo_reopen` | `` | `trigger` | SÍ | volatile | - |
| `fn_preview_campania` | `p_id uuid` | `json` | SÍ | volatile | - |
| `fn_procedimientos_resumen` | `` | `TABLE(correlation_id uuid, tit` | SÍ | stable | - |
| `fn_racha_ausencias` | `p_alumno_id uuid` | `integer` | NO | stable | - |
| `fn_reactivar_alumno` | `p_alumno_id uuid, p_usuario_id uuid, p_nueva_famil` | `jsonb` | SÍ | volatile | - |
| `fn_recalcular_bloqueos_familia` | `p_familia_id uuid` | `jsonb` | SÍ | volatile | - |
| `fn_registrar_alerta_enviada` | `p_tipo text, p_canal text, p_destinatario text, p_` | `json` | SÍ | volatile | - |
| `fn_registrar_pago_transaccional` | `p_familia_id uuid, p_monto_centavos bigint, p_meto` | `pagos` | SÍ | volatile | Pago atómico; imputa FIFO (cuotas seleccionadas y luego el resto de la familia) con fecha contable; el excedente se acredita al wallet. |
| `fn_reinscripcion_rol_autorizado` | `` | `boolean` | SÍ | stable | - |
| `fn_reportar_alumno_riesgo` | `p_alumno_id uuid, p_alumno_nombre text, p_motivo t` | `uuid` | SÍ | volatile | - |
| `fn_reportar_instrumento_danado` | `p_instrumento_id uuid, p_descripcion text, p_actor` | `uuid` | SÍ | volatile | - |
| `fn_reporte_cierre_semestre` | `p_periodo_id uuid, p_escala_calificacion numeric, ` | `jsonb` | SÍ | volatile | Informe ejecutivo de cierre de semestre. Atribuye sesiones por clases.maestro_principal_id (no por sesiones_clase.maestro_id, que guarda al autor del registro). Devuelve SIN_DATOS explicito donde no hay evidencia, nunca 0 % ni 100 % por defecto. |
| `fn_reporte_indicadores_adicionales` | `p_periodo_id uuid, p_cobertura_minima_pct numeric` | `jsonb` | SÍ | volatile | Indicadores complementarios del informe de cierre. Cada bloque declara su propio estado (SIN_DATOS / PARCIAL / EVALUABLE) con motivo y accion pendiente, y comienza a reportar cuando la institucion registra el dato. Nunca infiere ni rellena. |
| `fn_resumen_academico_integrado` | `p_alumno_id uuid, p_limite integer` | `jsonb` | SÍ | volatile | - |
| `fn_resumen_cumplimiento_asistencia` | `p_desde date, p_hasta date, p_maestro_id uuid` | `TABLE(maestro_id uuid, maestro` | SÍ | stable | - |
| `fn_resumen_diario_director` | `` | `json` | SÍ | volatile | - |
| `fn_servicio_publico_activo` | `` | `boolean` | SÍ | stable | - |
| `fn_set_updated_at` | `` | `trigger` | NO | volatile | - |
| `fn_set_updated_at_alianzas` | `` | `trigger` | NO | volatile | - |
| `fn_signage_set_updated_at` | `` | `trigger` | NO | volatile | - |
| `fn_sim_set_updated_at` | `` | `trigger` | NO | volatile | - |
| `fn_sincronizar_arbol_curricular` | `p_clase_id uuid, p_nombre text, p_objetivos jsonb,` | `uuid` | SÍ | volatile | Persiste el árbol curricular del Diseñador (unidad → objetivo → indicador) para una clase: valida autorización real (admin o maestro de la clase), upserta la plantilla y sincroniza los indicadores con UUID real a public.indicators. |
| `fn_soi_evento_asistencia_falta` | `` | `trigger` | SÍ | volatile | - |
| `fn_soi_evento_asistencia_registrada` | `` | `trigger` | SÍ | volatile | - |
| `fn_soi_evento_justificacion` | `` | `trigger` | SÍ | volatile | - |
| `fn_soi_evento_periodo` | `` | `trigger` | SÍ | volatile | - |
| `fn_soi_evento_periodo_abierto` | `` | `trigger` | SÍ | volatile | - |
| `fn_soi_evento_sesion_creada` | `` | `trigger` | SÍ | volatile | - |
| `fn_soi_evento_tarea` | `` | `trigger` | SÍ | volatile | - |
| `fn_solicitudes_necesidades_open_process_case` | `` | `trigger` | SÍ | volatile | Abre el caso Hermes ACM-NEC para cada solicitud de necesidades e inyecta el correlation_id. |
| `fn_sugerir_nodo_por_texto` | `p_texto text` | `TABLE(codigo text, nombre text` | NO | immutable | Propone categorias de nodo a partir del texto libre del maestro. Devuelve candidatos ordenados por aciertos; no decide por si sola. |
| `fn_sync_campania_envio_estado` | `` | `trigger` | SÍ | volatile | - |
| `fn_sync_estado_reparacion` | `` | `trigger` | SÍ | volatile | - |
| `fn_sync_estado_uso_activo` | `` | `trigger` | NO | volatile | - |
| `fn_tarea_log_historial` | `` | `trigger` | SÍ | volatile | - |
| `fn_tasa_asistencia_periodo` | `p_alumno_id uuid, p_desde date, p_hasta date` | `numeric` | NO | stable | - |
| `fn_trigger_desbloqueo_tareas_dependientes` | `` | `trigger` | NO | volatile | - |
| `fn_trigger_evaluacion_gamificacion` | `` | `trigger` | SÍ | volatile | - |
| `fn_trigger_hermes_task_wa_alert` | `` | `trigger` | SÍ | volatile | - |
| `fn_trigger_historial_estado_alumno` | `` | `trigger` | SÍ | volatile | - |
| `fn_update_notif_asistencia_timestamp` | `` | `trigger` | NO | volatile | - |
| `fn_update_notifications_on_attendance_change` | `` | `trigger` | SÍ | volatile | - |
| `fn_upsert_protocolo` | `p_nombre text, p_tipo text, p_descripcion text, p_` | `json` | SÍ | volatile | - |
| `fn_validar_checklist_tarea` | `` | `trigger` | SÍ | volatile | - |
| `fn_validar_cierre_periodo` | `p_periodo_id uuid` | `jsonb` | SÍ | stable | Semaforo de completitud previo al cierre. Solo evalua sesiones en dias lectivos: una sesion en receso no bloquea el cierre. Implementada con CTEs: una validacion de solo lectura no necesita tablas temporales. |
| `fn_validar_reinscripcion_alumno` | `p_alumno_id uuid` | `jsonb` | SÍ | stable | - |
| `fn_validate_maestro_disponibilidad_horario` | `` | `trigger` | NO | volatile | - |
| `fn_validate_salon_capacity_horario` | `` | `trigger` | NO | volatile | - |
| `fn_validate_salon_no_overlap` | `` | `trigger` | NO | volatile | - |
| `fn_verificar_conflicto_cita` | `p_fecha_inicio timestamp with time zone, p_fecha_f` | `TABLE(hay_conflicto boolean, e` | SÍ | stable | Loop D: retorna eventos que se solapan con el rango dado. Sin overbooking. |
| `fn_verificar_stock_minimo` | `` | `trigger` | SÍ | volatile | - |
| `fn_whatsapp_cap_hoy` | `` | `integer` | SÍ | stable | - |
| `fn_whatsapp_enviados_hoy` | `` | `integer` | SÍ | stable | - |
| `fn_whatsapp_optout` | `p_jid text, p_motivo text` | `void` | SÍ | volatile | - |
| `fn_whatsapp_rate_excedido` | `p_jid text` | `boolean` | SÍ | stable | - |
| `fn_whatsapp_reclamar_pendientes` | `p_limite integer` | `SETOF hermes_whatsapp_queue` | SÍ | volatile | Atomic outbox claim: applies runtime flag, quiet hours, opt-out, campaign consent, warm-up caps and configurable one-send-per-JID window (system_config.whatsapp_dedup_jid_horas, default 24h). |
| `generar_contrato_pdf` | `p_comodato_id uuid` | `jsonb` | SÍ | volatile | - |
| `generar_numero_factura` | `` | `character varying` | NO | volatile | Genera número de factura secuencial: FACT-2026-00001 |
| `generar_reporte_inventario` | `p_tipo text, p_filtros jsonb` | `jsonb` | SÍ | volatile | - |
| `generate_pending_class_notifications` | `` | `TABLE(maestros_processed integ` | NO | volatile | Escala clases vencidas/pendientes. Excluye los dias no lectivos del conteo: una sesion en receso no es deuda del maestro. |
| `generate_salon_code` | `` | `trigger` | NO | volatile | - |
| `get_alumnos_disponibles_para_inscripcion` | `` | `TABLE(id uuid, nombre_completo` | SÍ | stable | - |
| `get_app_user_role` | `` | `text` | SÍ | stable | - |
| `get_informe_academico_semestral` | `p_periodo_id uuid` | `jsonb` | SÍ | volatile | - |
| `get_my_rol` | `` | `text` | SÍ | stable | - |
| `get_resumen_academico_mensual` | `p_periodo_id uuid, p_mes integer, p_anio integer` | `jsonb` | SÍ | volatile | - |
| `get_user_department` | `` | `text` | SÍ | stable | - |
| `get_user_familia_id` | `` | `uuid` | SÍ | stable | - |
| `get_user_portales` | `p_user_id uuid` | `TABLE(portal_id text, nombre t` | SÍ | volatile | - |
| `get_user_role` | `` | `text` | SÍ | stable | - |
| `gin_extract_query_trgm` | `text, internal, smallint, internal, internal, inte` | `internal` | NO | immutable | - |
| `gin_extract_value_trgm` | `text, internal` | `internal` | NO | immutable | - |
| `gin_trgm_consistent` | `internal, smallint, text, integer, internal, inter` | `boolean` | NO | immutable | - |
| `gin_trgm_triconsistent` | `internal, smallint, text, integer, internal, inter` | `"char"` | NO | immutable | - |
| `gtrgm_compress` | `internal` | `internal` | NO | immutable | - |
| `gtrgm_consistent` | `internal, text, smallint, oid, internal` | `boolean` | NO | immutable | - |
| `gtrgm_decompress` | `internal` | `internal` | NO | immutable | - |
| `gtrgm_distance` | `internal, text, smallint, oid, internal` | `double precision` | NO | immutable | - |
| `gtrgm_in` | `cstring` | `gtrgm` | NO | immutable | - |
| `gtrgm_options` | `internal` | `void` | NO | immutable | - |
| `gtrgm_out` | `gtrgm` | `cstring` | NO | immutable | - |
| `gtrgm_penalty` | `internal, internal, internal` | `internal` | NO | immutable | - |
| `gtrgm_picksplit` | `internal, internal` | `internal` | NO | immutable | - |
| `gtrgm_same` | `gtrgm, gtrgm, internal` | `internal` | NO | immutable | - |
| `gtrgm_union` | `internal, internal` | `gtrgm` | NO | immutable | - |
| `handle_new_auth_user` | `` | `trigger` | SÍ | volatile | - |
| `handle_new_user` | `` | `trigger` | SÍ | volatile | Creates profile on auth.users INSERT. Auto-confirms email for maestros. |
| `handle_profile_insert_maestro` | `` | `trigger` | SÍ | volatile | Creates maestros row when profile with rol=maestro is inserted. Tolerant to column mismatches. |
| `has_portal_access` | `p_portal_id text, p_user_id uuid` | `boolean` | SÍ | volatile | - |
| `intercambiar_instrumentos` | `p_comodato_origen_id uuid, p_activo_destino_id uui` | `jsonb` | SÍ | volatile | - |
| `is_admin` | `` | `boolean` | SÍ | stable | - |
| `is_app_admin` | `` | `boolean` | SÍ | stable | - |
| `is_super_admin` | `` | `boolean` | SÍ | stable | - |
| `is_teacher` | `` | `boolean` | SÍ | stable | - |
| `maestro_actual` | `` | `uuid` | SÍ | volatile | - |
| `maestro_en_clase` | `p_clase_id uuid` | `boolean` | NO | stable | - |
| `norm_cedula` | `p text` | `text` | NO | immutable | - |
| `normalizar_tel_rd` | `raw text` | `text` | NO | immutable | Normaliza un teléfono a formato E.164 dominicano (+1809/829/849 + 7 dígitos). NULL si no es un número RD plausible. Espejo de normalizarTelefonoRD() en seguimientoAusentesService.js. |
| `normalize_phone` | `raw text` | `text` | NO | immutable | - |
| `obtener_kpi_inventario` | `` | `jsonb` | SÍ | volatile | - |
| `on_notification_inserted` | `` | `trigger` | SÍ | volatile | Automatically sends a Web Push notification via send-push Edge Function on insert |
| `preview_retiro_maestro` | `p_maestro_id uuid` | `jsonb` | SÍ | volatile | - |
| `profile_is_active` | `` | `boolean` | SÍ | stable | - |
| `reactivar_maestro_seguro` | `p_maestro_id uuid` | `void` | SÍ | volatile | - |
| `rechazar_usuario` | `p_user_id uuid` | `void` | SÍ | volatile | - |
| `refresh_maestro_desempeno` | `` | `void` | SÍ | volatile | - |
| `registrar_justificacion_asistencia` | `p_clase_id uuid, p_alumno_id uuid, p_fecha date, p` | `uuid` | NO | volatile | - |
| `registrar_sesion_bitacora` | `p_clase_id uuid, p_objetivo_id uuid, p_fecha date,` | `uuid` | NO | volatile | - |
| `renovar_comodato` | `p_comodato_id uuid, p_nueva_fecha_vencimiento date` | `jsonb` | SÍ | volatile | - |
| `retirar_maestro_seguro` | `p_maestro_id uuid, p_reemplazo_maestro_id uuid, p_` | `jsonb` | SÍ | volatile | - |
| `set_evaluations_updated_at` | `` | `trigger` | NO | volatile | - |
| `set_limit` | `real` | `real` | NO | volatile | - |
| `set_updated_at` | `` | `trigger` | NO | volatile | - |
| `set_user_portales` | `p_user_id uuid, p_portal_ids text[]` | `jsonb` | SÍ | volatile | - |
| `show_limit` | `` | `real` | NO | stable | - |
| `show_trgm` | `text` | `text[]` | NO | immutable | - |
| `similarity` | `text, text` | `real` | NO | immutable | - |
| `similarity_dist` | `text, text` | `real` | NO | immutable | - |
| `similarity_op` | `text, text` | `boolean` | NO | stable | - |
| `strict_word_similarity` | `text, text` | `real` | NO | immutable | - |
| `strict_word_similarity_commutator_op` | `text, text` | `boolean` | NO | stable | - |
| `strict_word_similarity_dist_commutator_op` | `text, text` | `real` | NO | immutable | - |
| `strict_word_similarity_dist_op` | `text, text` | `real` | NO | immutable | - |
| `strict_word_similarity_op` | `text, text` | `boolean` | NO | stable | - |
| `teacher_can_create_students` | `` | `boolean` | SÍ | stable | Returns true when the authenticated maestro is active and has alumnos:create permission. |
| `tg_alumno_suspensiones_touch` | `` | `trigger` | NO | volatile | - |
| `tg_retenciones_levantar` | `` | `trigger` | NO | volatile | - |
| `tg_retenciones_touch` | `` | `trigger` | NO | volatile | - |
| `tiene_permiso` | `p_permiso text` | `boolean` | NO | stable | - |
| `touch_maestro_access_credentials_updated_at` | `` | `trigger` | NO | volatile | - |
| `update_catalogo_timestamp` | `` | `trigger` | NO | volatile | - |
| `update_cmi_timestamp` | `` | `trigger` | NO | volatile | - |
| `update_cmo_timestamp` | `` | `trigger` | NO | volatile | - |
| `update_ei_timestamp` | `` | `trigger` | NO | volatile | - |
| `update_mp_timestamp` | `` | `trigger` | NO | volatile | - |
| `update_profile` | `p_id uuid, p_nombre_completo text, p_avatar_url te` | `void` | SÍ | volatile | - |
| `update_sb_timestamp` | `` | `trigger` | NO | volatile | - |
| `update_updated_at` | `` | `trigger` | NO | volatile | - |
| `update_updated_at_column` | `` | `trigger` | NO | volatile | - |
| `validate_admin_invite_code` | `p_code text` | `boolean` | SÍ | volatile | - |
| `validate_disponibilidad_json` | `p_json jsonb` | `boolean` | NO | immutable | - |
| `word_similarity` | `text, text` | `real` | NO | immutable | - |
| `word_similarity_commutator_op` | `text, text` | `boolean` | NO | stable | - |
| `word_similarity_dist_commutator_op` | `text, text` | `real` | NO | immutable | - |
| `word_similarity_dist_op` | `text, text` | `real` | NO | immutable | - |
| `word_similarity_op` | `text, text` | `boolean` | NO | stable | - |
