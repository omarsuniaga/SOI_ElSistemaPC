# CAPABILITY TRACEABILITY MATRIX — Matriz de Trazabilidad de Capacidades SOI 2.0

> **Propósito:** Comparar sistemáticamente cada capacidad funcional entre el SOI Actual y el Master SPEC v2.0.
> **Estados:** `IMPLEMENTED` · `PARTIAL` · `DESIGNED` · `NEW` · `LEGACY`

| CAP_ID | DESCRIPCIÓN | SECCIÓN SPEC | ESTADO ACTUAL | PORTAL | DB TABLES | BACKEND / RPC | UI VIEW | TESTS | UX DECISION | FASE OBJETIVO | ACCIÓN MIGRACIÓN |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `CAP-MAE-001` | Registro diario de asistencia docente (P/A/J) | `§11` | `IMPLEMENTED` | Maestros | `asistencias, sesiones_clase` | `asistenciasApi.js, fn_marcar_asistencia` | `asistenciaView.js` | Vitest unit & integration | `PRESERVE` | Fase 0 | `PRESERVE_AS_IS` |
| `CAP-MAE-002` | Justificación de inasistencias con motivo/evidencia | `§11` | `IMPLEMENTED` | Maestros | `justificaciones` | `asistenciaAdapter.js` | `ModalJustificar` | Unit test | `PRESERVE` | Fase 0 | `PRESERVE_AS_IS` |
| `CAP-MAE-003` | Registro de contenido y bitácora pedagógica | `§12` | `IMPLEMENTED` | Maestros | `observaciones_sesion` | `bitacoraSupabase.js` | `hoyView.js, asistenciaView.js` | Unit test | `PRESERVE` | Fase 0 | `PRESERVE_AS_IS` |
| `CAP-ACA-001` | Estructuración curricular por cátedra y nivel | `§13` | `IMPLEMENTED` | ACM | `indicators, nodes, levels` | `planificacionApi.js, fn_sincronizar_arbol_curricular` | `DisenadorCurricularView.js` | Vitest planificacion | `PRESERVE_AND_IMPROVE` | Fase 1 | `PRESERVE_AS_IS` |
| `CAP-ACA-002` | Semáforo de ausentismo y alumnos en riesgo | `§10` | `IMPLEMENTED` | ACM | `vw_alertas_activas, asistencias` | `pedagogicoApi.js` | `AusentismoDashboardView.js` | Vitest AUS1d | `PRESERVE` | Fase 0 | `PRESERVE_AS_IS` |
| `CAP-ADM-001` | Padrón de alumnos y fichas integrales | `§10` | `IMPLEMENTED` | ADM | `alumnos, familias, representantes` | `alumnosApi.js, fn_alumno_ficha_360` | `alumnosView.js, alumnoPerfilView.js` | Vitest alumnos | `PRESERVE_AND_IMPROVE` | Fase 1 | `TRANSFORM` |
| `CAP-ADM-002` | Detección fonética y fusión atómica de duplicados | `§10.1` | `IMPLEMENTED` | ADM | `alumnos` | `fn_fusionar_alumnos_duplicados` | `duplicadosView.js` | SQL transaction test | `PRESERVE` | Fase 0 | `PRESERVE_AS_IS` |
| `CAP-FIN-001` | Generación y facturación de cuotas mensuales | `§17` | `IMPLEMENTED` | FIN | `cuotas` | `fn_generar_ciclo_cuotas` | `BalanceOverview.tsx` | Vitest finanzas | `PRESERVE_AND_IMPROVE` | Fase 1 | `PRESERVE_AS_IS` |
| `CAP-FIN-002` | Cobro de cuotas con imputación FIFO y Wallet | `§17` | `PARTIAL` | FIN | `pagos, cuotas, wallet_movimientos` | `fn_registrar_pago_transaccional` | `CobroAlumnoView.tsx` | Vitest caja | `PRESERVE_AND_IMPROVE` | Fase 1 | `REBUILD_STRUCTURE_KEEP_DATA` |
| `CAP-LUT-001` | Control de inventario físico y comodatos | `§18` | `IMPLEMENTED` | LUT / LOG | `inventario_activos, comodatos_activos` | `inventarioApi.js, comodatosApi.js` | `inventarioStockView.js, comodatosView.js` | Vitest inventario | `PRESERVE_AND_IMPROVE` | Fase 1 | `PRESERVE_AS_IS` |
| `CAP-LUT-002` | Diagnóstico técnico y costeo en taller de lutería | `§18` | `PARTIAL` | LUT | `lut_ordenes_reparacion, lut_diagnosticos` | `fn_lut_upsert_diagnostico` | `luteriaOrdenesView.js` | Manual | `PRESERVE_AND_IMPROVE` | Fase 2 | `REBUILD_STRUCTURE_KEEP_DATA` |
| `CAP-HER-001` | Bus de telemetría y eventos en tiempo real | `§6` | `IMPLEMENTED` | DIR | `soi_eventos, soi_event_bus` | `event-spine-logger (Edge Fn)` | `hermesConsultaView.js` | Integration | `PRESERVE` | Fase 0 | `PRESERVE_AS_IS` |
| `CAP-HER-002` | Gestión de casos multi-paso y contratos SOI | `§7` | `PARTIAL` | DIR | `hermes_process_cases, tareas_institucionales` | `fn_hermes_start_process_case, fn_hermes_close_process_case` | `hermesProcedimientosView.js` | SQL RPC test | `PRESERVE_AND_IMPROVE` | Fase 1 | `TRANSFORM` |
| `CAP-CRM-001` | Radar exterior de oportunidades y convocatorias | `§20` | `NEW` | DIR | `opportunities, radar_items (Objetivo)` | `Por implementar` | `Por implementar` | Pendiente | `REDESIGN` | Fase 3 | `REBUILD_STRUCTURE_KEEP_DATA` |
| `CAP-INT-001` | Despachador WhatsApp Baileys sin LLM | `§19` | `IMPLEMENTED` | COM / DIR | `hermes_whatsapp_queue, hermes_gateway_health` | `whatsapp-dispatcher, whatsapp-runner` | `gatewayConfigView.js` | Judgment Day test suite | `PRESERVE` | Fase 0 | `PRESERVE_AS_IS` |
