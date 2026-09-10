# TABLE USAGE GRAPH — Mapa de Uso de Tablas Reales

> **Proyecto:** `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`, us-east-2)
> **Fecha:** 10 sep 2026
> **Total tablas analizadas:** 216
> **Regla de oro:** Una tabla vacía (`rowCount = 0`) NO es automáticamente legacy.

## 1. Resumen de Clasificación

| Clasificación | Definición | Cantidad |
|---|---|---|
| `ACTIVE` | Tiene filas en BD (>0) y referencias activas en frontend/edge functions | 118 |
| `REFERENCED` | Tiene filas (>0) en BD; usada por views, triggers o procesos backend | 4 |
| `EMPTY_BUT_REFERENCED` | 0 filas actualmente, pero referenciada activamente en código/módulos | 74 |
| `EMPTY_AND_UNREFERENCED` | 0 filas y sin referencias directas en código (candidata a poda tras verificación) | 1 |
| `LEGACY_CONFIRMED` | Comentario explícito `-- DEPRECATED ... 2026-09` en la base de datos | 19 |
| `UNKNOWN` | Requiere verificación manual | 0 |

## 2. Grafo Detallado de Tablas

| Tabla | Estado | Filas Vivas | Archivos Referenciadores (Muestreo) | Portal / Feature Relacionada | Nota / Comentario BD |
|---|---|---|---|---|---|
| `academic_plans` | `EMPTY_BUT_REFERENCED` | 0 | `academicService.js`, `classEventService.js`, `gamificacionView.js` (+2 más) | Académico (ACM) | - |
| `accesorios` | `LEGACY_CONFIRMED` | 0 | `eventProjectManagerEngine.js`, `detalleInstrumentoView.js`, `inventarioApi.test.js` (+4 más) | Transversal / DB | -- DEPRECATED: conservada para rediseño de inventario lutería 2026-09 (Owner: LUT) |
| `acm_active_routes` | `EMPTY_BUT_REFERENCED` | 0 | `academicAdminApi.js`, `academicService.js`, `academicService.test.js` (+5 más) | Académico (ACM) | - |
| `acm_curriculum_sources` | `EMPTY_BUT_REFERENCED` | 0 | `academicAdminApi.js`, `database.types.ts` | Académico (ACM) | - |
| `acm_curriculum_versions` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `acm_evidence_files` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `acm_teacher_week_adjustments` | `EMPTY_BUT_REFERENCED` | 0 | `academicService.js`, `academicService.test.js`, `weeklyPlanSupabase.js` (+1 más) | Académico (ACM) | - |
| `acm_weekly_plan_items` | `EMPTY_BUT_REFERENCED` | 0 | `academicService.js`, `academicService.test.js`, `bitacoraSupabase.js` (+3 más) | Académico (ACM) | - |
| `acm_weekly_plans` | `EMPTY_BUT_REFERENCED` | 0 | `academicAdminApi.js`, `weeklyPlanMock.js`, `weeklyPlanSupabase.guiaHeredada.test.js` (+1 más) | Académico (ACM) | - |
| `alertas_log` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `alumno_escolaridad` | `LEGACY_CONFIRMED` | 0 | `studentDocumentDataService.js`, `database.types.ts` | Transversal / DB | -- DEPRECATED: datos escolares secundarios diferidos 2026-09 (Owner: DIR/ADM) |
| `alumno_plan_entradas` | `EMPTY_BUT_REFERENCED` | 0 | `planEstudiosApi.js`, `planEstudiosApi.test.js`, `database.types.ts` | Portal Maestros | - |
| `alumno_suspensiones` | `EMPTY_BUT_REFERENCED` | 0 | `seguimientoAusentesService.js`, `database.types.ts` | Transversal / DB | - |
| `alumnos` | `ACTIVE` | 282 | `scanner.js`, `accessControl.js`, `accessControl.test.js` (+319 más) | Transversal / DB | - |
| `alumnos_clases` | `ACTIVE` | 476 | `academicService.js`, `alumnosMock.js`, `alumnosSupabase.js` (+40 más) | Académico (ACM) | - |
| `alumnos_logros` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `alumnos_programas` | `ACTIVE` | 456 | `alumnosSupabase.js`, `studentDocumentDataService.js`, `database.types.ts` | Alumnos | - |
| `alumnos_reinscripciones` | `EMPTY_AND_UNREFERENCED` | 0 | *Sin refs en src* | Transversal / DB | - |
| `aplicaciones_pago` | `ACTIVE` | 6 | `FinanceContext.tsx`, `CanonicalManifest.ts`, `database.types.ts` (+1 más) | Finanzas (FIN) | - |
| `app_users` | `ACTIVE` | 1 | `database.types.ts` | Finanzas (FIN) | - |
| `applicant_events` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `index.ts` | Finanzas (FIN) | - |
| `applicants` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `index.ts`, `index.ts` | Finanzas (FIN) | - |
| `appointments` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `index.ts` | Finanzas (FIN) | - |
| `asistencia_maestros` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | Presencia del docente por sesion de clase. Complementa ausencias_maestros (que modela solicitudes de permiso, no presencia diaria). |
| `asistencias` | `ACTIVE` | 2812 | `moduleCatalog.js`, `CHANGELOG.js`, `main-maestros.js` (+98 más) | Transversal / DB | - |
| `ausencias` | `EMPTY_BUT_REFERENCED` | 0 | `accessControl.js`, `accessControl.test.js`, `moduleCatalog.js` (+65 más) | Transversal / DB | - |
| `ausencias_auditoria` | `EMPTY_BUT_REFERENCED` | 0 | `ausenciaAprobacionApi.js`, `observabilidadApi.js`, `observabilidadMock.js` (+5 más) | Administración (ADM) | - |
| `ausencias_maestros` | `ACTIVE` | 6 | `ausenciaAprobacionApi.js`, `adminNotifApi.js`, `adminNotifApi.test.js` (+12 más) | Administración (ADM) | Registro de ausencias y solicitudes de permisos de los docentes |
| `becas` | `ACTIVE` | 1 | `helpView.js`, `App.tsx`, `Sidebar.tsx` (+6 más) | Transversal / DB | - |
| `blocks` | `ACTIVE` | 8 | `rateLimit.test.js`, `academicAdminApi.js`, `academicService.js` (+26 más) | Transversal / DB | - |
| `calendario` | `EMPTY_BUT_REFERENCED` | 0 | `contract.js`, `portalAccessService.js`, `accessControl.test.js` (+58 más) | Transversal / DB | - |
| `calendario_institucional` | `ACTIVE` | 7 | `proyectoManagerView.js`, `calendarioUnificadoApi.js`, `wbsApi.js` (+14 más) | Administración (ADM) | - |
| `campania_envios` | `EMPTY_BUT_REFERENCED` | 0 | `campaniasApi.js`, `database.types.ts` | Transversal / DB | - |
| `campanias_periodo` | `EMPTY_BUT_REFERENCED` | 0 | `campaniasApi.js`, `database.types.ts` | Transversal / DB | - |
| `catalogo_niveles` | `ACTIVE` | 1 | `database.types.ts` | Finanzas (FIN) | - |
| `catalogo_objetivos_especificos` | `LEGACY_CONFIRMED` | 0 | `database.types.ts` | Finanzas (FIN) | -- DEPRECATED: plantilla curricular legacy en evaluación 2026-09 (Owner: ACM) |
| `catalogo_objetivos_generales` | `ACTIVE` | 1 | `database.types.ts` | Finanzas (FIN) | - |
| `catalogos` | `ACTIVE` | 131 | `maestrosView.js`, `catalogService.js`, `database.types.ts` | Transversal / DB | - |
| `clase_horarios` | `ACTIVE` | 68 | `alumnosMock.js`, `alumnosSupabase.js`, `DuplicadosModal.js` (+27 más) | Alumnos | - |
| `clase_mapa_indicadores` | `LEGACY_CONFIRMED` | 0 | `database.types.ts` | Finanzas (FIN) | -- DEPRECATED: jerarquía legacy en evaluación 2026-09 (Owner: ACM) |
| `clase_mapa_objetivos` | `LEGACY_CONFIRMED` | 0 | `database.types.ts` | Finanzas (FIN) | -- DEPRECATED: objetivos legacy en evaluación 2026-09 (Owner: ACM) |
| `clases` | `ACTIVE` | 41 | `scanner.js`, `accessControl.js`, `accessControl.test.js` (+308 más) | Transversal / DB | - |
| `clases_emergentes` | `EMPTY_BUT_REFERENCED` | 0 | `pdfCierreSemestre.test.js`, `maestroDataService.js`, `calendarioView.js` (+3 más) | Transversal / DB | - |
| `class_event_methodology` | `EMPTY_BUT_REFERENCED` | 0 | `classEventService.js`, `database.types.ts` | Portal Maestros | Structured methodology notes for a class event (warmup, focus areas, repertoire, etc). |
| `class_events` | `EMPTY_BUT_REFERENCED` | 0 | `classEventService.js`, `database.types.ts` | Portal Maestros | Explicit class event record per session+student, linking academic plan, level, and methodology. |
| `class_session_content_snapshots` | `EMPTY_BUT_REFERENCED` | 0 | `academicService.js`, `asistenciaView.js`, `database.types.ts` | Académico (ACM) | - |
| `cobertura_alumno_objetivo` | `EMPTY_BUT_REFERENCED` | 0 | `coberturaSupabase.js`, `rutasApi.js`, `database.types.ts` | Transversal / DB | - |
| `comodatos_activos` | `ACTIVE` | 30 | `alumnosSupabase.js`, `inventarioSupabase.js`, `pdfCierreSemestre.js` (+3 más) | Alumnos | Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso. |
| `compromisos_pago` | `EMPTY_BUT_REFERENCED` | 0 | `CanonicalManifest.ts`, `database.types.ts`, `supabaseManager.ts` | Finanzas (FIN) | - |
| `comunicaciones_seguimiento` | `ACTIVE` | 2 | `seguimientoSupabase.js`, `seguimientoAusentesService.js`, `database.types.ts` | Transversal / DB | Portal COM: registro de interacciones (llamadas/whatsapp/correo/reunion) con motor de proxima-accion (follow-up). Estandar CRM Activity model. |
| `configuracion_aranceles` | `REFERENCED` | 1 | *Sin refs en src* | Transversal / DB | - |
| `configuracion_recordatorios` | `ACTIVE` | 1 | `pushService.js`, `database.types.ts` | Portal Maestros | - |
| `contactos_alianzas` | `ACTIVE` | 36 | `alianzasApi.js`, `alianzasView.js`, `database.types.ts` | Transversal / DB | - |
| `contenidos_sesion` | `EMPTY_BUT_REFERENCED` | 0 | `contenidoAnalyticsApi.js`, `asistenciasSupabase.js`, `metricsApi.js` (+1 más) | Administración (ADM) | - |
| `conversaciones_whatsapp` | `ACTIVE` | 1 | `database.types.ts`, `index.ts`, `index.ts` | Finanzas (FIN) | - |
| `cuotas` | `ACTIVE` | 718 | `Ficha360Modal.js`, `alumnoAiAnalystService.js`, `ficha360AdminView.js` (+37 más) | Alumnos | - |
| `curriculo_objetivos` | `ACTIVE` | 6 | `coberturaSupabase.js`, `curriculoSupabase.js`, `groqService.js` (+10 más) | Transversal / DB | - |
| `curriculo_pilares` | `ACTIVE` | 3 | `coberturaSupabase.js`, `curriculoSupabase.js`, `groqService.js` (+7 más) | Transversal / DB | - |
| `curriculos` | `ACTIVE` | 2 | `curriculoSupabase.js`, `curriculoModal.js`, `database.types.ts` | Transversal / DB | - |
| `departamentos` | `ACTIVE` | 7 | `moduleCatalog.js`, `simuladorAgentContracts.test.js`, `main.js` (+27 más) | Transversal / DB | - |
| `document_batches` | `LEGACY_CONFIRMED` | 0 | `documentBatchService.js`, `database.types.ts` | Transversal / DB | -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM) |
| `document_templates` | `ACTIVE` | 11 | `comunicacionesSupabase.js`, `comunicacionesView.js`, `documentTemplateService.js` (+2 más) | Transversal / DB | - |
| `ejercicios` | `ACTIVE` | 2 | `NodeResourceEditor.js`, `groqService.js`, `mapaPedagogicoPanel.js` (+5 más) | Académico (ACM) | - |
| `evaluacion_indicador` | `ACTIVE` | 5 | `alumnosSupabase.js`, `offlineSyncAdapter.js`, `plantillasPlanificacionSupabase.js` (+18 más) | Alumnos | - |
| `evaluations` | `EMPTY_BUT_REFERENCED` | 0 | `academicService.js`, `obtenerResumenAcademico.test.js`, `audicionesSupabase.js` (+28 más) | Académico (ACM) | - |
| `facturas_reparacion` | `EMPTY_BUT_REFERENCED` | 0 | `inventarioSupabase.js`, `database.types.ts` | Transversal / DB | Facturas asociadas a reparaciones de instrumentos |
| `familias` | `ACTIVE` | 298 | `simuladorAgentContracts.js`, `crearAlumno.familia.test.js`, `comunicacionesApi.js` (+27 más) | Simulador | - |
| `fin_service_accounts` | `ACTIVE` | 1 | `database.types.ts`, `index.ts` | Finanzas (FIN) | Cuentas de servicios externos a refrescar (medidores CEPM, etc.). Solo service_role. |
| `fin_service_balance_snapshots` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `index.ts` | Finanzas (FIN) | Histórico de balances observados por cuenta (dedup por source_snapshot_key). Solo service_role. |
| `fin_service_providers` | `ACTIVE` | 1 | `database.types.ts`, `index.ts` | Finanzas (FIN) | Catálogo de conectores de proveedores de servicios externos (CEPM, etc.). Solo service_role. |
| `fin_service_refresh_runs` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `index.ts` | Finanzas (FIN) | Auditoría de cada intento de refresh (audit trail). Solo service_role. |
| `fin_service_refresh_state` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `index.ts` | Finanzas (FIN) | Estado de lock + última consulta por cuenta, para concurrencia segura. Solo service_role. |
| `finanzas_politica_cobranza` | `ACTIVE` | 1 | `finanzasSupabase.js`, `cobranza.js`, `balanceAlumnosView.js` (+2 más) | Finanzas (FIN) | - |
| `gastos_fijos` | `ACTIVE` | 1 | `App.tsx`, `Header.tsx`, `Sidebar.tsx` (+6 más) | Finanzas (FIN) | - |
| `gastos_fijos_pagos` | `EMPTY_BUT_REFERENCED` | 0 | `FinanceContext.tsx`, `CanonicalManifest.ts`, `database.types.ts` (+2 más) | Finanzas (FIN) | - |
| `generated_documents` | `LEGACY_CONFIRMED` | 0 | `documentBatchService.js`, `generatedDocumentsView.js`, `studentRiskDetectorService.js` (+2 más) | Transversal / DB | -- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM) |
| `hermes_gateway_health` | `REFERENCED` | 1 | *Sin refs en src* | Hermes (Transversal) | Registro de telemetria y latido en vivo (heartbeat) emitido por el contenedor Evolution API / Baileys. |
| `hermes_gateway_worker_lease` | `REFERENCED` | 1 | *Sin refs en src* | Hermes (Transversal) | - |
| `hermes_inbox` | `ACTIVE` | 1 | `database.types.ts`, `index.ts`, `index.ts` (+1 más) | Finanzas (FIN) | Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role. |
| `hermes_kanban_cards` | `ACTIVE` | 6 | `kanbanBridgeSupabase.js`, `kanbanBridgeView.js`, `database.types.ts` (+1 más) | Hermes / Casos | Espejo read-only de tarjetas del Kanban de Hermes (~/.hermes/kanban.db). Escrita por edge fn hermes-kanban-ingest via poller. Fase 1 puente Hermes<->SOI. |
| `hermes_process_cases` | `ACTIVE` | 11 | `ProtocolRunMapper.ts`, `SupabaseProtocolRunRepository.ts`, `database.types.ts` (+1 más) | Transversal / DB | Ejecucion concreta de un proceso SOI. Su id se usa como correlation_id para agrupar tareas institucionales. |
| `hermes_protocolos` | `ACTIVE` | 7 | `tareasMock.js`, `database.types.ts` | Hermes / Casos | - |
| `hermes_reactive_rules` | `ACTIVE` | 8 | `tareasSupabase.js`, `database.types.ts`, `r1-ausencia-acumulada.ts` (+6 más) | Hermes / Casos | - |
| `hermes_whatsapp_config` | `ACTIVE` | 4 | `gatewayApi.js`, `database.types.ts`, `index.ts` | Transversal / DB | - |
| `hermes_whatsapp_queue` | `ACTIVE` | 75 | `gatewayApi.js`, `tareasSupabase.js`, `database.types.ts` (+8 más) | Transversal / DB | - |
| `historial_estado_alumno` | `ACTIVE` | 16 | `metricsApi.js`, `database.types.ts` | Transversal / DB | Tracking de altas, bajas y reactivaciones de alumnos |
| `homework_assignments` | `EMPTY_BUT_REFERENCED` | 0 | `HomeworkPanel.js`, `classEventService.js`, `database.types.ts` | Portal Maestros | Formal homework assignments with optional node link and due date. |
| `horarios` | `EMPTY_BUT_REFERENCED` | 0 | `CHANGELOG.js`, `main.js`, `DuplicadosModal.js` (+58 más) | Transversal / DB | - |
| `indicador_prerequisito` | `ACTIVE` | 2 | `TeacherRouteBuilder.js`, `teacherRouteMapPanel.js`, `maestroDataService.js` (+3 más) | Portal Maestros | - |
| `indicator_attempts` | `ACTIVE` | 20 | `academicService.js`, `academicService.test.js`, `alumnosSupabase.js` (+22 más) | Académico (ACM) | - |
| `indicator_session_students` | `EMPTY_BUT_REFERENCED` | 0 | `bitacoraSupabase.js`, `HistorialObjetivoPanel.js`, `planningService.js` (+1 más) | Transversal / DB | - |
| `indicator_sessions` | `EMPTY_BUT_REFERENCED` | 0 | `bitacoraSupabase.js`, `historialService.js`, `planningService.js` (+1 más) | Transversal / DB | - |
| `indicators` | `ACTIVE` | 4163 | `curriculoTresPlanosStore.js`, `academicAdminApi.js`, `academicService.js` (+75 más) | Transversal / DB | - |
| `instrumentos` | `ACTIVE` | 3 | `main.js`, `aiReportingService.js`, `AlumnoDeleteModal.js` (+53 más) | Transversal / DB | - |
| `inventario_accesorios` | `ACTIVE` | 8 | `inventarioSupabase.js`, `database.types.ts` | Transversal / DB | Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.) |
| `inventario_activos` | `ACTIVE` | 324 | `inventarioMock.js`, `inventarioSupabase.js`, `alertasComodatosView.js` (+9 más) | Transversal / DB | Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso. |
| `inventario_historial` | `ACTIVE` | 476 | `inventarioSupabase.js`, `luteriaOrdenWizard.js`, `luteriaTallerSupabase.js` (+1 más) | Transversal / DB | Historial de eventos de instrumentos. Se inserta automáticamente via triggers. |
| `inventario_materiales` | `REFERENCED` | 30 | *Sin refs en src* | Transversal / DB | - |
| `inventario_reparaciones` | `EMPTY_BUT_REFERENCED` | 0 | `inventarioSupabase.js`, `pdfCierreSemestre.test.js`, `database.types.ts` | Transversal / DB | Reparaciones de instrumentos. estado controla el flujo: recibido → en_reparacion → finalizado → entregado |
| `justificaciones` | `ACTIVE` | 156 | `simuladorAgentContracts.js`, `academicReportsApi.js`, `reporteSemestralView.js` (+32 más) | Simulador | Registro de justificaciones de inasistencias de alumnos |
| `levels` | `ACTIVE` | 101 | `curriculoTresPlanosStore.js`, `academicAdminApi.js`, `academicService.js` (+50 más) | Transversal / DB | - |
| `logros` | `ACTIVE` | 3 | `reporteSemestralView.js`, `AchievementsSummaryModal.js`, `groqService.js` (+5 más) | Administración (ADM) | - |
| `lut_diagnosticos` | `EMPTY_BUT_REFERENCED` | 0 | `luteriaDiagnosticoWizard.js`, `luteriaTallerSupabase.js`, `database.types.ts` | Lutería (LUT) | - |
| `lut_evidencias` | `EMPTY_BUT_REFERENCED` | 0 | `luteriaTallerSupabase.js`, `database.types.ts` | Lutería (LUT) | - |
| `lut_insumos` | `EMPTY_BUT_REFERENCED` | 0 | `luteriaInsumosView.js`, `luteriaTallerSupabase.js`, `database.types.ts` | Lutería (LUT) | - |
| `lut_movimientos_insumos` | `EMPTY_BUT_REFERENCED` | 0 | `luteriaTallerSupabase.js`, `database.types.ts` | Lutería (LUT) | - |
| `lut_ordenes_reparacion` | `ACTIVE` | 1 | `luteriaDiagnosticoWizard.js`, `luteriaOrdenWizard.js`, `luteriaTallerSupabase.js` (+2 más) | Lutería (LUT) | - |
| `lut_presupuestos` | `EMPTY_BUT_REFERENCED` | 0 | `luteriaTallerSupabase.js`, `database.types.ts` | Lutería (LUT) | - |
| `lut_solicitudes_compra` | `EMPTY_BUT_REFERENCED` | 0 | `luteriaTallerSupabase.js`, `database.types.ts` | Lutería (LUT) | - |
| `maestro_access_credentials` | `EMPTY_BUT_REFERENCED` | 0 | `maestrosApi.js`, `database.types.ts`, `index.ts` | Transversal / DB | Encrypted vault for recoverable maestro portal passwords. Plaintext is only returned by the admin-only Edge Function. |
| `maestro_desempeno` | `ACTIVE` | 4 | `adminReportingApi.js`, `database.types.ts` | Administración (ADM) | - |
| `maestro_indicadores` | `ACTIVE` | 10 | `teacherRouteMapPanel.js`, `maestroDataService.js`, `maestroRouteService.js` (+3 más) | Portal Maestros | - |
| `maestro_objetivos` | `ACTIVE` | 4 | `teacherRouteMapPanel.js`, `maestroDataService.js`, `maestroRouteService.js` (+3 más) | Portal Maestros | - |
| `maestro_retiros` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `maestro_routes` | `ACTIVE` | 2 | `indiceEnsenanzaGuiadaWidget.js`, `PlanificationCard.js`, `TeacherRouteBuilder.js` (+4 más) | Administración (ADM) | - |
| `maestro_tareas` | `EMPTY_BUT_REFERENCED` | 0 | `loadJsonMock.js`, `tareasPanel.js`, `tareasPanel.js` (+1 más) | Transversal / DB | - |
| `maestro_unidades` | `ACTIVE` | 4 | `teacherRouteMapPanel.js`, `maestroDataService.js`, `maestroRouteService.js` (+3 más) | Portal Maestros | - |
| `maestros` | `ACTIVE` | 33 | `contract.js`, `scanner.js`, `curriculoTresPlanosStore.js` (+250 más) | Transversal / DB | - |
| `mapa_plantillas` | `LEGACY_CONFIRMED` | 0 | `database.types.ts` | Finanzas (FIN) | -- DEPRECATED: plantillas legacy en evaluación 2026-09 (Owner: ACM) |
| `minutas` | `LEGACY_CONFIRMED` | 0 | `tareasSupabase.js`, `soiProcessIndex.js`, `database.types.ts` | Hermes / Casos | -- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09 (Owner: DIR) |
| `modulos` | `ACTIVE` | 1 | `database.types.ts` | Finanzas (FIN) | - |
| `niveles` | `ACTIVE` | 3 | `curriculoTresPlanosStore.js`, `analisisContenidoView.js`, `duplicadosAlumnos.js` (+46 más) | Transversal / DB | - |
| `node_resources` | `EMPTY_BUT_REFERENCED` | 0 | `academicAdminApi.js`, `database.types.ts` | Académico (ACM) | - |
| `nodes` | `ACTIVE` | 1120 | `curriculoTresPlanosStore.js`, `academicAdminApi.js`, `TreeView.js` (+68 más) | Transversal / DB | - |
| `notificaciones` | `ACTIVE` | 179 | `accessControl.js`, `accessControl.test.js`, `moduleCatalog.js` (+45 más) | Transversal / DB | - |
| `notificaciones_asistencia` | `EMPTY_BUT_REFERENCED` | 0 | `attendanceNotificationService.js`, `attendanceNotificationService.test.js`, `database.types.ts` | Transversal / DB | - |
| `notificaciones_caja` | `EMPTY_BUT_REFERENCED` | 0 | `CanonicalManifest.ts`, `database.types.ts`, `supabaseManager.ts` | Finanzas (FIN) | - |
| `notification_trigger_logs` | `ACTIVE` | 326 | `database.types.ts` | Finanzas (FIN) | - |
| `objetivos` | `ACTIVE` | 480 | `curriculoTresPlanosStore.js`, `bitacoraMock.js`, `bitacoraSupabase.js` (+104 más) | Transversal / DB | Objetivos explícitos entre temas (nodes) e indicadores. |
| `observaciones_alumnos` | `EMPTY_BUT_REFERENCED` | 0 | `academicReportsApi.js`, `asistenciasSupabase.js`, `exportView.js` (+13 más) | Académico (ACM) | - |
| `observaciones_sesion` | `ACTIVE` | 89 | `contenidoAnalyticsApi.js`, `asistenciasView.js`, `observacionesApi.js` (+11 más) | Administración (ADM) | Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves. |
| `pagos` | `ACTIVE` | 3 | `simuladorAgentContracts.js`, `main.js`, `Ficha360Modal.js` (+37 más) | Simulador | - |
| `pagos_alumnos` | `ACTIVE` | 1 | `finanzasSupabase.js`, `database.types.ts` | Finanzas (FIN) | Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago. |
| `patrocinantes` | `EMPTY_BUT_REFERENCED` | 0 | `FinanceContext.tsx`, `database.types.ts`, `index.ts` | Finanzas (FIN) | - |
| `patrocinios` | `EMPTY_BUT_REFERENCED` | 0 | `FinanceContext.tsx`, `database.types.ts`, `index.ts` (+1 más) | Finanzas (FIN) | - |
| `periodo_excepciones` | `ACTIVE` | 1 | `calendarioLectivoApi.js`, `database.types.ts` | Transversal / DB | Dias no lectivos dentro de un periodo academico. periodo_id NULL = excepcion global (feriado nacional). |
| `periodos` | `ACTIVE` | 4 | `catalogAudit.store.test.js`, `catalogDiagnosticsView.test.js`, `moduleCatalog.js` (+50 más) | Transversal / DB | Períodos académicos del año (ej: Trimestre I 2025) |
| `periodos_cierre_auditoria` | `ACTIVE` | 2 | `metricsApi.js`, `reporteCierreApi.js`, `database.types.ts` | Transversal / DB | - |
| `permisos_maestros` | `ACTIVE` | 29 | `maestrosApi.js`, `permisosSupabase.js`, `portalEvents.js` (+1 más) | Transversal / DB | - |
| `plan_clases` | `LEGACY_CONFIRMED` | 2 | `routeMock.js`, `routeSupabase.js`, `routeSupabase.deprecatedReads.test.js` (+4 más) | Transversal / DB | DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators |
| `plan_indicadores` | `LEGACY_CONFIRMED` | 15 | `routeMock.js`, `routeSupabase.js`, `routeSupabase.deprecatedReads.test.js` (+5 más) | Transversal / DB | DEPRECATED: usar indicators |
| `plan_niveles` | `LEGACY_CONFIRMED` | 3 | `routeMock.js`, `routeSupabase.js`, `routeSupabase.deprecatedReads.test.js` (+4 más) | Transversal / DB | DEPRECATED: usar levels |
| `plan_objetivos` | `LEGACY_CONFIRMED` | 10 | `routeMock.js`, `routeSupabase.js`, `routeSupabase.deprecatedReads.test.js` (+8 más) | Transversal / DB | DEPRECATED: usar indicators |
| `plan_temas` | `LEGACY_CONFIRMED` | 7 | `routeMock.js`, `routeSupabase.js`, `routeSupabase.deprecatedReads.test.js` (+8 más) | Transversal / DB | DEPRECATED: usar nodes |
| `planificaciones` | `ACTIVE` | 3 | `asistenciasSupabase.js`, `dataSnapshot.js`, `viewRegistry.js` (+38 más) | Asistencias | - |
| `planned_content` | `EMPTY_BUT_REFERENCED` | 0 | `rutaGameificadaService.js`, `database.types.ts` | Portal Maestros | Teachers' daily planning of content to cover in each class session |
| `planning_documents` | `EMPTY_BUT_REFERENCED` | 0 | `planningDocService.js`, `database.types.ts` | Portal Maestros | - |
| `plantillas_planificacion` | `LEGACY_CONFIRMED` | 8 | `plantillasPlanificacionMock.js`, `plantillasPlanificacionSupabase.js`, `plantillasPlanificacionSupabase.test.js` (+1 más) | Transversal / DB | DEPRECATED: reemplazada por mapa_plantillas para el mapa gamificado |
| `portal_catalog` | `ACTIVE` | 11 | `portalAccessService.js`, `database.types.ts` | Transversal / DB | - |
| `postulantes` | `ACTIVE` | 404 | `alumnosSupabase.js`, `googleFormApi.js`, `postuladosMock.js` (+16 más) | Alumnos | - |
| `profiles` | `ACTIVE` | 34 | `portalAccessService.js`, `ausenciaAprobacionApi.js`, `aprobacionView.js` (+32 más) | Transversal / DB | - |
| `programas` | `ACTIVE` | 7 | `accessControl.js`, `accessControl.test.js`, `moduleCatalog.js` (+38 más) | Transversal / DB | - |
| `programas_prerrequisitos` | `ACTIVE` | 4 | `database.types.ts` | Finanzas (FIN) | Flujo académico: qué programa exige haber cursado otro (selección, audición o recomendación del maestro) |
| `progresos` | `ACTIVE` | 219 | `moduleCatalog.js`, `main.js`, `maestroClasesContenidoView.js` (+46 más) | Transversal / DB | - |
| `protocolos` | `LEGACY_CONFIRMED` | 0 | `ActionPermission.ts`, `CalendarItemDrawer.tsx`, `ProtocolRunsPage.tsx` (+2 más) | Transversal / DB | -- DEPRECATED: infraestructura base para Hermes en reserva 2026-09 (Owner: DIR/HERMES) |
| `pulso_score_history` | `ACTIVE` | 1 | `tareasSupabase.js`, `pulsoScore.test.js`, `database.types.ts` | Hermes / Casos | - |
| `push_subscriptions` | `ACTIVE` | 9 | `pushService.js`, `database.types.ts`, `index.ts` | Portal Maestros | - |
| `rachas` | `LEGACY_CONFIRMED` | 0 | `database.types.ts` | Finanzas (FIN) | -- DEPRECATED: gamificación pedagógica en pausa 2026-09 (Owner: ACM) |
| `registros_pendientes` | `ACTIVE` | 10 | `adminReportingApi.js`, `clasesHoyApi.js`, `database.types.ts` (+2 más) | Administración (ADM) | - |
| `repertoire_items` | `ACTIVE` | 14 | `audicionesSupabase.js`, `database.types.ts` | Transversal / DB | - |
| `representantes` | `ACTIVE` | 90 | `simuladorAgentContracts.js`, `aiReportingService.js`, `attendanceAlertsWidget.js` (+19 más) | Simulador | - |
| `retenciones_instrumento` | `EMPTY_BUT_REFERENCED` | 0 | `seguimientoAusentesService.js`, `database.types.ts` | Transversal / DB | Retención temporal del instrumento de un alumno por ausentismo acumulado (nivel 3). Independiente del inventario instrumentos: instrumento_texto sirve cuando no hay fila formal. fecha_reincorporacion reinicia el contador de ausencias del alumno para el período. |
| `route_versions` | `ACTIVE` | 9 | `curriculoTresPlanosStore.js`, `academicAdminApi.js`, `academicService.js` (+25 más) | Transversal / DB | - |
| `routes` | `ACTIVE` | 8 | `catalogAudit.store.test.js`, `catalogAudit.test.js`, `moduleCatalog.js` (+48 más) | Transversal / DB | - |
| `ruta_contenido_objetivos` | `EMPTY_BUT_REFERENCED` | 0 | `rutasApi.js`, `rutas.api.test.js`, `database.types.ts` | Transversal / DB | - |
| `rutas_contenido` | `EMPTY_BUT_REFERENCED` | 0 | `rutasApi.js`, `rutas.api.test.js`, `database.types.ts` | Transversal / DB | - |
| `salones` | `ACTIVE` | 11 | `moduleCatalog.js`, `main.js`, `calendarioUnificadoApi.js` (+61 más) | Transversal / DB | - |
| `schedule_run_feedback` | `LEGACY_CONFIRMED` | 0 | `scheduleFeedbackApi.js`, `scheduleFeedbackApi.test.js`, `database.types.ts` | Transversal / DB | -- DEPRECATED: telemetría de horarios pausada 2026-09 (Owner: ACM) |
| `schedule_runs` | `LEGACY_CONFIRMED` | 0 | `horarioBuilderApi.js`, `scheduleFeedbackApi.js`, `scheduleFeedbackApi.test.js` (+1 más) | Transversal / DB | -- DEPRECATED: motor algorítmico de horarios pausado 2026-09 (Owner: ACM) |
| `score_compromiso` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `sections` | `ACTIVE` | 15 | `catalogDiagnosticsView.js`, `portalModuleMatrixView.js`, `audicionesSupabase.js` (+22 más) | Transversal / DB | - |
| `seguimiento_ausencias_reinicio` | `ACTIVE` | 1 | `seguimientoAusentesService.js`, `database.types.ts` | Transversal / DB | - |
| `seguimiento_reglas` | `ACTIVE` | 5 | `seguimientoRulesService.js`, `seguimientoAusentesView.js`, `database.types.ts` | Transversal / DB | - |
| `service_account_observations` | `EMPTY_BUT_REFERENCED` | 0 | `CanonicalManifest.ts`, `database.types.ts` | Finanzas (FIN) | - |
| `service_accounts` | `EMPTY_BUT_REFERENCED` | 0 | `CanonicalManifest.ts`, `database.types.ts` | Finanzas (FIN) | - |
| `sesiones_clase` | `ACTIVE` | 290 | `main-maestros.js`, `academicService.js`, `academicService.test.js` (+47 más) | Transversal / DB | - |
| `signage_media` | `ACTIVE` | 3 | `signageAdminApi.js`, `signage-admin.router.js`, `signageStudioView.js` (+1 más) | Administración (ADM) | Playlist declarativa de la señalética (intención). El caché físico de YouTube y su estado de descarga viven en la Raspberry, no aquí. |
| `signage_pantallas` | `ACTIVE` | 1 | `signageAdminApi.js`, `signage-admin.router.js`, `signageStudioView.js` (+2 más) | Administración (ADM) | Registro de pantallas de señalética. layout = jsonb con proporciones y ajustes de zona. Escrita por el portal Admin (es_admin), leída por la SPA de la Raspberry. |
| `sim_actores` | `ACTIVE` | 10 | `simuladorApi.js`, `simuladorApi.test.js`, `simuladorCobranza.js` (+3 más) | Simulador | Datos 100% FICTICIOS para el sandbox del simulador (postulantes, alumnos, maestros, representantes). Nunca referencia entidades reales de producción. |
| `sim_calendario` | `ACTIVE` | 39 | `simuladorApi.js`, `simuladorApi.test.js`, `simuladorFormato.js` (+3 más) | Simulador | Espejo aislado de calendario_institucional para el sandbox del simulador. Nunca se referencia desde triggers de producción. |
| `sim_config` | `ACTIVE` | 2 | `simuladorApi.js`, `simuladorApi.test.js`, `simuladorSalidaSegura.js` (+3 más) | Simulador | Whitelist server-side inviolable de destinos de envío (spec: simulador-salida-segura / Whitelist server-side inviolable). Un registro por canal. |
| `sim_log` | `ACTIVE` | 125 | `simuladorAgentContracts.js`, `simuladorApi.js`, `simuladorApi.test.js` (+12 más) | Simulador | Auditoría append-only de cada acción de agente. Base para la animación en tiempo real vía Supabase Realtime (ver RLS: SELECT abierto a authenticated). |
| `sim_outbox` | `ACTIVE` | 12 | `simuladorAgentContracts.js`, `simuladorApi.js`, `simuladorApi.test.js` (+9 más) | Simulador | - |
| `sim_runs` | `ACTIVE` | 1 | `simuladorApi.js`, `simuladorApi.test.js`, `simuladorEngine.js` (+6 más) | Simulador | - |
| `sim_tareas` | `ACTIVE` | 15 | `simuladorAgentContracts.js`, `simuladorApi.js`, `simuladorApi.test.js` (+6 más) | Simulador | Espejo aislado de tareas_institucionales para el sandbox del simulador. |
| `soi_analisis_semanal` | `ACTIVE` | 1 | `tareasSupabase.js`, `patternAnalyzer.test.js`, `database.types.ts` (+1 más) | Hermes / Casos | - |
| `soi_event_bus` | `ACTIVE` | 1 | `database.types.ts` | Finanzas (FIN) | Bus de eventos interno. Solo service_role: sin politica para authenticated, el cliente no accede. |
| `soi_eventos` | `ACTIVE` | 2579 | `tareasSupabase.js`, `pulsoView.js`, `database.types.ts` (+10 más) | Hermes / Casos | - |
| `soi_process_contracts` | `ACTIVE` | 4 | `tareasSupabase.js`, `soiProcessIndex.js`, `processDomainAuditor.js` (+6 más) | Hermes / Casos | Contrato digital ejecutable de un proceso SOI documentado. No reemplaza la ficha canonica; la vuelve operable por Hermes. |
| `soi_rule_effectiveness` | `ACTIVE` | 6 | `tareasSupabase.js`, `rulesEffectiveness.test.js`, `database.types.ts` | Hermes / Casos | - |
| `solicitudes_ausencia` | `ACTIVE` | 1 | `database.types.ts` | Finanzas (FIN) | - |
| `solicitudes_necesidades` | `ACTIVE` | 2 | `solicitudesAdminView.js`, `perfilView.js`, `database.types.ts` (+1 más) | Transversal / DB | - |
| `solicitudes_permisos` | `ACTIVE` | 1 | `solicitudesPermisosView.js`, `permisosSupabase.js`, `permisosSupabase.solicitudes.test.js` (+3 más) | Administración (ADM) | - |
| `student_case_actions` | `EMPTY_BUT_REFERENCED` | 0 | `caseActionsService.js`, `studentCasesService.js`, `database.types.ts` | Transversal / DB | - |
| `student_case_alerts` | `ACTIVE` | 5 | `studentCasesService.js`, `studentRiskDetectorService.js`, `database.types.ts` | Transversal / DB | - |
| `student_case_events` | `ACTIVE` | 4 | `caseActionsService.js`, `studentCasesService.js`, `database.types.ts` | Transversal / DB | - |
| `student_cases` | `ACTIVE` | 2 | `caseActionsService.js`, `studentCasesService.js`, `database.types.ts` | Transversal / DB | - |
| `student_indicator_progress` | `EMPTY_BUT_REFERENCED` | 0 | `academicService.js`, `academicService.test.js`, `bitacoraSupabase.js` (+3 más) | Académico (ACM) | - |
| `system_config` | `ACTIVE` | 23 | `adminUsuariosApi.js`, `configApi.js`, `gatewayApi.js` (+13 más) | Administración (ADM) | Tabla de configuración del sistema - API keys, settings globales |
| `tarea_comentarios` | `ACTIVE` | 1 | `tareasMock.js`, `tareasSupabase.js`, `database.types.ts` | Hermes / Casos | - |
| `tarea_historial` | `ACTIVE` | 1 | `tareasMock.js`, `tareasSupabase.js`, `taskHistoryTimeline.js` (+1 más) | Hermes / Casos | - |
| `tarea_logs` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `tareas_caja` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `tareas_calendario` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `tareas_institucionales` | `ACTIVE` | 210 | `proyectoManagerView.js`, `wbsApi.js`, `eventProjectManagerModal.js` (+27 más) | Administración (ADM) | - |
| `teacher_class_sessions` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `teacher_session_indicators` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `telegram_allowed_users` | `ACTIVE` | 1 | `database.types.ts`, `crearTareas.ts`, `allowlist.ts` (+1 más) | Finanzas (FIN) | - |
| `telegram_messages_raw` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `index.ts`, `index.ts` | Finanzas (FIN) | - |
| `unidades` | `ACTIVE` | 1 | `luteriaInsumosView.js`, `luteriaTallerMock.js`, `plantillasPlanificacionMock.js` (+20 más) | Lutería (LUT) | - |
| `user_portal_access` | `ACTIVE` | 2 | `portalAccessService.js`, `adminUsuariosApi.js`, `adminUsuariosApi.test.js` (+1 más) | Transversal / DB | - |
| `usuario_departamentos` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `wallet_movimientos` | `EMPTY_BUT_REFERENCED` | 0 | `FinanceContext.tsx`, `database.types.ts`, `SupabaseRestClient.ts` | Finanzas (FIN) | - |
| `whatsapp_consentimientos` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts` | Finanzas (FIN) | - |
| `whatsapp_optout` | `EMPTY_BUT_REFERENCED` | 0 | `database.types.ts`, `r6-whatsapp-padres.ts`, `r7-whatsapp-maestros.ts` (+2 más) | Finanzas (FIN) | - |
| `whatsapp_webhook_log` | `ACTIVE` | 1 | `database.types.ts`, `index.ts` | Finanzas (FIN) | - |
