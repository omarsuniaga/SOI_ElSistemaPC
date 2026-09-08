# FASE 0 · Tarea 0.1 — Inventario de tablas vacías

**Proyecto Supabase:** `SOI_DDBB_EL_SISTEMAPC` (ref `zmhmdvmyeyswunurcyow`)
**Fecha del corte:** 2026-09-08 (conteo exacto `select count(*)`, no estimación de `pg_stat`)
**Universo:** 247 tablas en `public` · **122 con 0 filas** (49.4%)

> Nota: el brief citaba 123 tablas vacías al 2026-09-07. Al 2026-09-08 el conteo exacto da **122** (una tabla recibió su primera fila en el intervalo, o la cifra previa venía de `pg_stat` que redondea). La diferencia no cambia el trabajo.

## Cómo leer las columnas

| Columna | Significado |
|---|---|
| `Cols / FK→ / FK← / Pol / Trg` | nº de columnas · FKs salientes · FKs entrantes (otras tablas la referencian) · políticas RLS · triggers |
| `Migración origen` | archivo de `supabase/migrations/` con el `CREATE TABLE` fechado. **"— (sin migración fechada)"** = la tabla existe en la BD pero ningún archivo de migración versionado la crea → creada por dashboard o en archivo base no rastreable. Relevante para Tarea 0.5. |
| `Uso en código` | `referenciada` = hay `.from('tabla')` o mención en un archivo de servicio/vista real (se listan hasta 2); `solo autogen` = únicamente aparece en `schema_dump.json` / `database.types.ts`; `sin referencia` = nadie la nombra |
| `Capacidad (visión)` | heurística por nombre/módulo — **verificar** |
| `Decisión` / `Dueño` | **vacías a propósito — las llena Omar** (Terminar / Archivar / Eliminar) |

## Resumen por capacidad

| Capacidad | Tablas vacías | Con `.from()` real | Solo autogen | Sin referencia | Sin migración fechada |
|---|--:|--:|--:|--:|--:|
| académico | 32 | 20 | 12 | 0 | 5 |
| académico/operaciones | 7 | 5 | 2 | 0 | 2 |
| alumno/admisiones | 9 | 7 | 1 | 1 | 1 |
| protección/seguimiento | 18 | 9 | 9 | 0 | 3 |
| finanzas | 13 | 9 | 4 | 0 | 9 |
| inventario/lutería | 5 | 2 | 3 | 0 | 5 |
| lutería | 6 | 6 | 0 | 0 | 0 |
| alianzas/comunicaciones | 11 | 2 | 9 | 0 | 5 |
| gateway/hermes | 7 | 2 | 5 | 0 | 4 |
| operaciones/reportes | 12 | 5 | 5 | 2 | 5 |
| ninguna identificada | 2 | 1 | 1 | 0 | 1 |
| **TOTAL** | **122** | **68** | **51** | **3** | **40** |

## Inventario completo (122 filas)

### académico (32)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `acm_active_routes` | 16/4/1/1/0 | 20260629_acm_curriculum_governance.sql | referenciada: modules/academic-admin/api/academicAdminApi.js, modules/academic-routes/services/academicService.js |  | | |
| 2 | `acm_curriculum_sources` | 15/2/1/2/0 | 20260629_acm_curriculum_governance.sql | referenciada: modules/academic-admin/api/academicAdminApi.js |  | | |
| 3 | `acm_curriculum_versions` | 11/3/2/2/0 | 20260629_acm_curriculum_governance.sql | solo autogen |  | | |
| 4 | `acm_evidence_files` | 10/5/0/1/0 | 20260629_acm_curriculum_governance.sql | solo autogen |  | | |
| 5 | `acm_teacher_week_adjustments` | 12/3/0/1/0 | 20260629_acm_teacher_week_adjustments.sql | referenciada: modules/academic-routes/services/academicService.js, modules/planificacion/api/weeklyPlanSupabase.js |  | | |
| 6 | `acm_weekly_plan_items` | 17/2/0/2/0 | 20260629_acm_curriculum_governance.sql | referenciada: modules/academic-routes/services/academicService.js, modules/bitacora/api/bitacoraSupabase.js |  | | |
| 7 | `acm_weekly_plans` | 16/2/4/2/0 | 20260629_acm_curriculum_governance.sql | referenciada: modules/academic-admin/api/academicAdminApi.js |  | | |
| 8 | `alumnos_rutas` | 12/3/0/2/1 | schema_reference.sql (sin fecha) | solo autogen |  | | |
| 9 | `catalogo_objetivos_especificos` | 7/1/1/2/1 | — (sin migración fechada) | solo autogen |  | | |
| 10 | `clase_mapa_indicadores` | 12/3/1/1/3 | — (sin migración fechada) | solo autogen |  | | |
| 11 | `clase_mapa_objetivos` | 14/4/1/1/2 | — (sin migración fechada) | solo autogen |  | | |
| 12 | `class_event_methodology` | 14/2/0/5/0 | 20260507_class_events_schema.sql | referenciada: portal-maestros/services/classEventService.js | Notas de metodologia estructurada por evento de clase. | | |
| 13 | `class_events` | 10/5/2/5/1 | 20260507_class_events_schema.sql | referenciada: portal-maestros/services/classEventService.js | Registro explicito de evento de clase por sesion+alumno. | | |
| 14 | `class_session_content_snapshots` | 8/0/0/3/0 | 006_academic_route_schema.sql | referenciada: modules/academic-routes/services/academicService.js, portal-maestros/views/asistenciaView.js |  | | |
| 15 | `cobertura_alumno_objetivo` | 9/4/0/3/0 | 20260523_curriculos.sql | referenciada: modules/planificacion/api/coberturaSupabase.js, modules/planificacion/api/rutasApi.js |  | | |
| 16 | `contenidos_sesion` | 9/5/0/7/0 | schema_reference.sql (sin fecha) | referenciada: modules/admin-dashboard/api/contenidoAnalyticsApi.js, modules/asistencias/api/asistenciasSupabase.js |  | | |
| 17 | `homework_assignments` | 9/4/0/5/0 | 20260507_class_events_schema.sql | referenciada: portal-maestros/components/HomeworkPanel.js, portal-maestros/services/classEventService.js | Tareas formales con link opcional a nodo y fecha limite. | | |
| 18 | `indicator_session_students` | 6/2/0/2/0 | 20260604000002_indicator_session_students.sql | referenciada: modules/planning/services/planningService.js |  | | |
| 19 | `indicator_sessions` | 8/3/1/3/0 | 20260604000001_indicator_sessions.sql | referenciada: modules/bitacora/api/bitacoraSupabase.js, modules/planning/services/historialService.js |  | | |
| 20 | `mapa_plantillas` | 10/3/0/2/1 | — (sin migración fechada) | solo autogen |  | | |
| 21 | `node_resources` | 10/1/0/2/0 | 010_node_resources_schema.sql | referenciada: modules/academic-admin/api/academicAdminApi.js |  | | |
| 22 | `planificacion` | 14/0/0/3/0 | schema_reference.sql (sin fecha) | referenciada: core/moduleCatalog.js, main-maestros.js |  | | |
| 23 | `planificacion_nodos` | 12/1/1/1/0 | portal-maestros-tables.sql (sin fecha) | solo autogen | DEPRECATED: usar routes hierarchy | | |
| 24 | `planned_content` | 8/3/0/5/0 | 20260510_create_planned_content.sql | referenciada: portal-maestros/services/rutaGameificadaService.js | Planificacion diaria de contenido por sesion de clase. | | |
| 25 | `planning_documents` | 10/2/0/5/0 | 012_planning_documents.sql | referenciada: portal-maestros/services/planningDocService.js |  | | |
| 26 | `repertoire_fragments` | 7/1/0/2/0 | 20260622_audiciones_integration_fixes.sql | solo autogen |  | | |
| 27 | `ruta_contenido_objetivos` | 8/2/1/3/0 | 20260530_create_rutas_contenido.sql | referenciada: modules/planificacion/api/rutasApi.js |  | | |
| 28 | `rutas_contenido` | 14/3/3/3/0 | 20260530_create_rutas_contenido.sql | referenciada: modules/planificacion/api/rutasApi.js |  | | |
| 29 | `sesion_bitacora` | 14/3/0/2/1 | — (sin migración fechada) | solo autogen |  | | |
| 30 | `student_indicator_progress` | 10/3/0/1/0 | 20260629_acm_curriculum_governance.sql | referenciada: modules/academic-routes/services/academicService.js, modules/bitacora/api/bitacoraSupabase.js |  | | |
| 31 | `teacher_class_sessions` | 11/4/3/1/0 | 20260629_acm_curriculum_governance.sql | solo autogen |  | | |
| 32 | `teacher_session_indicators` | 9/2/0/1/0 | 20260629_acm_curriculum_governance.sql | solo autogen |  | | |

### académico/operaciones (7)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `calendario` | 16/3/1/4/0 | — (sin migración fechada) | referenciada: core/moduleCatalog.js, modules/clases/views/clasesView.js |  | | |
| 2 | `clase_acceso_temporal` | 7/1/0/5/0 | portal-maestros-tables.sql (sin fecha) | solo autogen |  | | |
| 3 | `clases_emergentes` | 16/0/1/5/0 | portal-maestros-tables.sql (sin fecha) | referenciada: portal-maestros/services/maestroDataService.js, portal-maestros/views/calendarioView.js |  | | |
| 4 | `horarios` | 10/3/1/5/1 | schema_reference.sql (sin fecha) | referenciada: assets/data/mocks/clases.json, portal-maestros/api/ausenciasApi.js |  | | |
| 5 | `schedule_run_feedback` | 6/2/0/3/0 | 20260525_horario_schedule_run_feedback.sql | referenciada: modules/horario-builder/api/scheduleFeedbackApi.js |  | | |
| 6 | `schedule_runs` | 8/0/1/1/0 | 20260524_schedule_runs.sql | referenciada: scripts/check-schedule-runs.js, modules/horario-builder/api/horarioBuilderApi.js |  | | |
| 7 | `tareas_calendario` | 12/3/1/3/0 | — (sin migración fechada) | solo autogen |  | | |

### alumno/admisiones (9)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `alumno_escolaridad` | 14/1/0/1/0 | 20260607_documentos_institucionales.sql | referenciada: modules/config/services/studentDocumentDataService.js |  | | |
| 2 | `alumno_plan_entradas` | 10/4/0/4/0 | 20260527_create_alumno_plan_entradas.sql | referenciada: portal-maestros/api/planEstudiosApi.js |  | | |
| 3 | `alumnos_modulos` | 10/2/0/2/1 | schema_reference.sql (sin fecha) | solo autogen |  | | |
| 4 | `alumnos_reinscripciones` | 9/2/0/1/0 | — (sin migración fechada) | sin referencia |  | | |
| 5 | `applicant_events` | 5/1/0/3/0 | 20260827200000_soi_enrollment_funnel_m1.sql | referenciada: scripts/google-apps-script-enrollment.js, supabase/functions/enrollment-scheduler/index.ts |  | | |
| 6 | `applicants` | 9/0/2/3/1 | 20260827200000_soi_enrollment_funnel_m1.sql | referenciada: scripts/google-apps-script-enrollment.js, supabase/functions/enrollment-scheduler/index.ts |  | | |
| 7 | `appointments` | 8/1/0/4/1 | 20260827200000_soi_enrollment_funnel_m1.sql | referenciada: supabase/functions/enrollment-scheduler/index.ts |  | | |
| 8 | `audiciones` | 22/1/0/2/0 | 20260714203000_acm_rubrica_evaluacion.sql | referenciada: scripts/patch-main-portal-hub.js, core/moduleCatalog.js | Evaluaciones de audiciones de nivel y diagnóstico segun canon ACM-RUB-001 V8. | | |
| 9 | `evaluations` | 19/1/0/4/1 | 20260622_audiciones_integration_fixes.sql | referenciada: modules/audiciones/api/audicionesSupabase.js, modules/audiciones/domain/EvaluacionMapper.js |  | | |

### protección/seguimiento (18)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `alumno_suspensiones` | 11/3/0/2/1 | 20260904120000_seguimiento_ausentes_reinicio_y_suspension.sql | referenciada: modules/pedagogico/services/seguimientoAusentesService.js |  | | |
| 2 | `alumnos_ejercicios` | 11/2/0/2/1 | schema_reference.sql (sin fecha) | solo autogen |  | | |
| 3 | `alumnos_logros` | 3/2/0/2/0 | schema_reference.sql (sin fecha) | solo autogen |  | | |
| 4 | `asistencia_maestros` | 15/7/0/2/1 | 20260726_asistencia_docente_y_rls_periodos.sql | solo autogen | Presencia del docente por sesion de clase. Complementa ausencias_maestros. | | |
| 5 | `asistencias_emergentes` | 10/1/0/3/0 | 20260606_emergentes_columns_and_asistencias.sql | solo autogen |  | | |
| 6 | `ausencias` | 10/0/1/4/1 | schema_reference.sql (sin fecha) | referenciada: modules/auth/components/ausenciaForm.js, modules/auth/components/ausenciaHistorial.js |  | | |
| 7 | `ausencias_auditoria` | 6/2/0/2/0 | 20260520_create_ausencias_auditoria.sql | referenciada: modules/admin-aprobacion/api/ausenciaAprobacionApi.js, modules/metricas/api/observabilidadSupabase.js |  | | |
| 8 | `ausencias_clases_afectadas` | 5/2/0/3/0 | — (sin migración fechada) | solo autogen | Junction: clases afectadas por una ausencia y actividades de reemplazo. | | |
| 9 | `ausencias_notificaciones` | 8/2/0/3/0 | — (sin migración fechada) | solo autogen | Notificaciones a directores sobre solicitudes de ausencia. | | |
| 10 | `intentos_ejercicios` | 13/5/0/2/0 | schema_reference.sql (sin fecha) | solo autogen |  | | |
| 11 | `notificaciones_asistencia` | 21/0/0/3/1 | 020_notificaciones_asistencia.sql | referenciada: modules/metricas/services/attendanceNotificationService.js |  | | |
| 12 | `observaciones_alumnos` | 18/4/0/8/2 | schema_reference.sql (sin fecha) | referenciada: modules/admin-dashboard/api/academicReportsApi.js, modules/asistencias/api/asistenciasSupabase.js |  | | |
| 13 | `rachas` | 5/1/0/2/0 | schema_reference.sql (sin fecha) | referenciada: scripts/reset_produccion_periodo_20260810.js |  | | |
| 14 | `retenciones_instrumento` | 17/4/0/2/2 | 20260904023143_seguimiento_ausentes_foundation.sql | referenciada: modules/pedagogico/services/seguimientoAusentesService.js | Retencion temporal del instrumento de un alumno por ausentismo (nivel 3). | | |
| 15 | `score_compromiso` | 13/2/0/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 16 | `seguimiento_ausencias_reinicio` | 6/2/0/2/0 | 20260904120000_seguimiento_ausentes_reinicio_y_suspension.sql | referenciada: modules/pedagogico/services/seguimientoAusentesService.js |  | | |
| 17 | `student_case_actions` | 13/2/0/1/0 | 20260608_seguimiento_institucional.sql | referenciada: modules/pedagogico/services/caseActionsService.js, modules/pedagogico/services/studentCasesService.js |  | | |
| 18 | `xp_log` | 7/1/0/2/0 | schema_reference.sql (sin fecha) | solo autogen |  | | |

### finanzas (13)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `campanas_pago` | 9/1/1/2/0 | — (sin migración fechada) | solo autogen |  | | |
| 2 | `cierres_caja` | 9/1/0/3/0 | — (sin migración fechada) | referenciada: portales/fin/src/lib/supabaseManager.ts |  | | |
| 3 | `compromisos_pago` | 9/2/0/2/0 | — (sin migración fechada) | referenciada: portales/fin/src/lib/supabaseManager.ts |  | | |
| 4 | `exoneraciones` | 12/3/0/2/0 | — (sin migración fechada) | solo autogen |  | | |
| 5 | `facturas_reparacion` | 13/2/0/4/0 | — (sin migración fechada) | referenciada: modules/inventario/api/inventarioSupabase.js | Facturas asociadas a reparaciones de instrumentos. | | |
| 6 | `fin_service_balance_snapshots` | 11/2/0/0/0 | 20260823000000_fin_service_balances.sql | referenciada: supabase/functions/refresh-service-balances/index.ts | Historico de balances por cuenta. Solo service_role. | | |
| 7 | `fin_service_refresh_runs` | 9/1/2/0/0 | 20260823000000_fin_service_balances.sql | referenciada: supabase/functions/refresh-service-balances/index.ts | Auditoria de cada intento de refresh. Solo service_role. | | |
| 8 | `fin_service_refresh_state` | 8/2/0/0/0 | 20260823000000_fin_service_balances.sql | referenciada: supabase/functions/refresh-service-balances/index.ts | Lock + ultima consulta por cuenta. Solo service_role. | | |
| 9 | `gastos_fijos_pagos` | 11/1/0/3/0 | 20260823220000_gastos_fijos_mensuales.sql | referenciada: portales/fin/src/context/FinanceContext.tsx, portales/fin/src/lib/supabaseManager.ts |  | | |
| 10 | `notificaciones_caja` | 17/3/0/5/0 | — (sin migración fechada) | referenciada: portales/fin/src/lib/supabaseManager.ts |  | | |
| 11 | `tareas_caja` | 15/3/0/4/0 | — (sin migración fechada) | solo autogen |  | | |
| 12 | `wallet_config` | 8/1/0/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 13 | `wallet_movimientos` | 9/1/0/2/0 | — (sin migración fechada) | referenciada: portales/fin/src/context/FinanceContext.tsx |  | | |

### inventario/lutería (5)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `accesorio_asignaciones` | 11/3/0/3/0 | — (sin migración fechada) | solo autogen |  | | |
| 2 | `accesorios` | 11/0/1/3/1 | — (sin migración fechada) | referenciada: modules/luteria-taller/api/luteriaTallerMock.js |  | | |
| 3 | `autorizaciones_accesorio` | 7/2/0/2/0 | — (sin migración fechada) | solo autogen |  | | |
| 4 | `inventario_import_staging` | 33/0/0/0/0 | — (sin migración fechada) | solo autogen | Tabla temporal para importar inventario_supabase_import.csv. | | |
| 5 | `inventario_reparaciones` | 13/1/1/4/2 | — (sin migración fechada) | referenciada: modules/inventario/api/inventarioSupabase.js | Reparaciones de instrumentos. estado: recibido->en_reparacion->finalizado->entre | | |

### lutería (6)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `lut_diagnosticos` | 18/1/0/1/1 | 20260627_luteria_taller_schema.sql | referenciada: modules/luteria-taller/api/luteriaTallerSupabase.js, modules/luteria/components/luteriaDiagnosticoWizard.js |  | | |
| 2 | `lut_evidencias` | 10/1/0/1/0 | 20260627_luteria_taller_schema.sql | referenciada: modules/luteria-taller/api/luteriaTallerSupabase.js |  | | |
| 3 | `lut_insumos` | 11/0/2/1/0 | 20260627_luteria_taller_schema.sql | referenciada: modules/luteria-taller/api/luteriaTallerSupabase.js, modules/luteria/views/luteriaInsumosView.js |  | | |
| 4 | `lut_movimientos_insumos` | 8/2/0/1/0 | 20260627_luteria_taller_schema.sql | referenciada: modules/luteria-taller/api/luteriaTallerSupabase.js |  | | |
| 5 | `lut_presupuestos` | 15/1/0/1/0 | 20260627_luteria_taller_schema.sql | referenciada: modules/luteria-taller/api/luteriaTallerSupabase.js |  | | |
| 6 | `lut_solicitudes_compra` | 14/2/0/1/0 | 20260627_luteria_taller_schema.sql | referenciada: modules/luteria-taller/api/luteriaTallerSupabase.js |  | | |

### alianzas/comunicaciones (11)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `campania_envios` | 12/1/1/1/0 | 20260626_campanias_periodo_segmentacion.sql | solo autogen |  | | |
| 2 | `campanias_destinatarios` | 9/2/0/4/0 | 20260626_campanias_marketing.sql | solo autogen |  | | |
| 3 | `campanias_marketing` | 15/1/1/4/1 | 20260626_campanias_marketing.sql | solo autogen |  | | |
| 4 | `campanias_periodo` | 12/1/2/1/0 | 20260626_campanias_periodo_segmentacion.sql | referenciada: modules/campanias/api/campaniasApi.js |  | | |
| 5 | `hilos_mensajes` | 8/1/1/3/0 | — (sin migración fechada) | solo autogen |  | | |
| 6 | `instituciones` | 16/0/1/4/1 | 20260626_campanias_marketing.sql | solo autogen |  | | |
| 7 | `mensajes_internos` | 10/2/0/2/0 | — (sin migración fechada) | solo autogen |  | | |
| 8 | `minutas` | 12/1/1/4/0 | — (sin migración fechada) | solo autogen |  | | |
| 9 | `patrocinantes` | 9/0/1/2/0 | — (sin migración fechada) | solo autogen |  | | |
| 10 | `patrocinios` | 10/3/0/2/0 | — (sin migración fechada) | referenciada: portales/fin/src/views/BecasView.tsx |  | | |
| 11 | `prospeccion_log` | 10/0/0/2/0 | 20260626_campanias_marketing.sql | solo autogen |  | | |

### gateway/hermes (7)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `hermes_acciones` | 9/1/2/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 2 | `hermes_evaluaciones` | 5/0/0/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 3 | `hermes_feedback` | 11/2/0/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 4 | `hermes_notificaciones` | 9/1/0/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 5 | `telegram_messages_raw` | 7/0/0/3/0 | 20260630_003_create_telegram_messages_raw.sql | referenciada: supabase/functions/telegram-classifier-cron/index.ts, supabase/functions/telegram-webhook/index.ts |  | | |
| 6 | `whatsapp_consentimientos` | 11/1/0/1/0 | 20260626_gateway_subsistema4_numero_consentimiento.sql | solo autogen |  | | |
| 7 | `whatsapp_optout` | 3/0/0/1/0 | 20260626_whatsapp_antiban_layer.sql | referenciada: supabase/functions/event-spine-logger/handlers/r6-whatsapp-padres.ts, supabase/functions/event-spine-logger/handlers/r7-whatsapp-maestros.ts |  | | |

### operaciones/reportes (12)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `alertas_log` | 6/0/0/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 2 | `document_batches` | 17/0/1/1/0 | 20260607_documentos_institucionales.sql | referenciada: modules/config/services/documentBatchService.js |  | | |
| 3 | `generated_documents` | 18/3/0/1/0 | 20260607_documentos_institucionales.sql | referenciada: modules/config/services/documentBatchService.js, modules/config/views/generatedDocumentsView.js |  | | |
| 4 | `maestro_access_credentials` | 9/2/0/1/1 | 20260804000005_maestro_access_credentials.sql | referenciada: modules/maestros/api/maestrosApi.js, supabase/functions/maestro-credentials/index.ts | Vault cifrado de contrasenas recuperables del portal maestro. | | |
| 5 | `maestro_retiros` | 7/3/0/1/0 | 20260822000001_safe_teacher_retirement.sql | sin referencia |  | | |
| 6 | `maestro_tareas` | 8/2/0/2/0 | portal-maestros-tables.sql (sin fecha) | referenciada: portal-maestros/components/tareasPanel.js |  | | |
| 7 | `protocolos` | 8/0/0/2/0 | — (sin migración fechada) | referenciada: portales/calendario/src/presentation/components/calendar/CalendarItemDrawer.tsx |  | | |
| 8 | `service_account_observations` | 12/1/0/2/0 | 20260823230000_service_accounts_dashboard.sql | sin referencia |  | | |
| 9 | `service_accounts` | 12/0/1/3/0 | 20260823230000_service_accounts_dashboard.sql | solo autogen |  | | |
| 10 | `tarea_logs` | 6/2/0/2/0 | — (sin migración fechada) | solo autogen |  | | |
| 11 | `tareas_portales` | 26/0/0/1/0 | — (sin migración fechada) | solo autogen |  | | |
| 12 | `usuario_departamentos` | 5/2/0/2/0 | — (sin migración fechada) | solo autogen |  | | |

### ninguna identificada (2)

| # | Tabla | Cols / FK→ / FK← / Pol / Trg | Migración origen | Uso en código | Comentario en BD | Decisión | Dueño |
|--:|---|---|---|---|---|---|---|
| 1 | `academic_plans` | 8/2/1/3/0 | 006_academic_route_schema.sql | referenciada: modules/academic-routes/services/academicService.js, portal-maestros/services/classEventService.js |  | | |
| 2 | `campana_participaciones` | 6/2/0/3/0 | — (sin migración fechada) | solo autogen |  | | |

