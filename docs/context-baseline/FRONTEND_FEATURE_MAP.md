# FRONTEND FEATURE MAP — Mapeo Integral de Portales, Rutas y Persistencia

> **Proyecto:** sistema-academico-pwa (SOI — El Sistema Punta Cana)
> **Fecha:** 10 sep 2026
> **Topología:** Multi-page SPA en Vite con Router Modular. Los portales actúan como *lentes departamentales* sobre un catálogo común de 96+ rutas y 47 módulos.

## 1. Topología de Portales y Entrypoints

| Portal | Entrypoint HTML | Script Principal | Shell | Departamento / Responsable | Rol Requerido | Enfoque Operativo |
|---|---|---|---|---|---|---|
| **Maestros** | index.html | src/main-maestros.js | Teacher Shell | ACM | maestro, dmin-maestro | Asistencia, bitácora diaria, planificación, perfiles de alumnos, mis clases |
| **Académico** | cm.html | src/portales/acm/acm.js | dminPortalShell | ACM | dmin, coordinacion_academica | Programas, clases, rutas pedagógicas, salones, semáforo ausentismo |
| **Administración** | dm.html / dmin.html | src/portales/adm/adm.js | dminPortalShell | ADM / DIR | dmin, superadmin | Alumnos, inscripciones, duplicados, ausencias docentes, notificaciones, usuarios |
| **Finanzas** | in.html | src/portales/fin/src/main.tsx | React 19 Shell | FIN | dmin, inanzas, director | Cuotas, cobros, caja, balance, aranceles, medidores CEPM |
| **Lutería** | luteria.html | src/portales/luteria/luteria.js | dminPortalShell | LUT / LOG | dmin, lutier, inventarista | Taller de lutería, diagnósticos, órdenes de reparación, insumos |
| **Inventario** | inventario.html | src/portales/inventario/inventario.js | dminPortalShell | LOG | dmin, inventarista | Stock de instrumentos, comodatos a alumnos, historial, bajas |
| **Dirección / Hermes** | dm.html (rutas dir) | src/main.js | dminPortalShell | DIR | dmin, director, superadmin | Casos Hermes, orquestador, pulso, reglas, eventos, radar, KPIs |
| **Comunicaciones** | com.html | src/portales/com/com.js | dminPortalShell | COM | dmin, comunicaciones | Campañas, seguimiento WhatsApp, consentimientos |
| **Calendario** | calendario.html | src/portales/calendario/src/main.tsx | React 19 Shell | Transversal | dmin, coordinacion | Calendario institucional unificado, eventos, citas |
| **Audiciones** | udiciones.html | src/portales/audiciones/audiciones.js | Cascarón / External | ACM | dmin, jurado | Gestión de audiciones de ingreso |
| **Simulador** | simulador.html | src/portales/simulador/simulador.js | dminPortalShell | DIR / DEV | dmin, superadmin | Sandbox de simulación de carga y recorridos |
| **Técnico** | 	ecnico.html | src/portales/tecnico/tecnico.js | dminPortalShell | TECNICO | dmin, soporte | Mantenimiento, health checks, jobs |

## 2. Mapeo Detallado de Rutas, Vistas, DataAdapters y Base de Datos

### PORTAL MAESTROS (index.html)

| Ruta | Vista (View) | Componentes Clave | API / DataAdapter | Tablas / RPC Supabase | Flujo de Usuario |
|---|---|---|---|---|---|
| hoy | hoyView.js | FeedHoy, ClassCard | asistenciasApi.js, clasesApi.js | clases, sesiones_clase, asistencias | Flujo diario de asistencia y estado de clases del día |
| asistencia | asistenciaView.js | ListaAsistencia, ModalJustificar | asistenciaAdapter.js, asistenciasApi.js | asistencias, sesiones_clase, justificaciones, fn_marcar_asistencia | Toma de asistencia (P/A/J), registro de justificaciones y contenidos |
| mis-clases | misClasesView.js | MisClasesGrid, HorarioList | clasesApi.js, horarioApi.js | clases, clase_horarios, salones | Consulta de horarios y alumnos asignados por clase |
| clase-emergente | claseEmergenteView.js | FormEmergente | clasesEmergentesApi.js | clases_emergentes, fn_estado_asistencia_maestro | Apertura de clase fuera de horario regular |
| alumno | alumnoPerfilView.js | FichaAlumno, HistorialAsistencia | alumnosApi.js, progresosApi.js | alumnos, fn_alumno_ficha_360, fn_alumno_evaluaciones_recientes | Consulta 360 del alumno: asistencias, notas, comodato |
| perfil | perfilView.js | FormPerfil, SolicitudAusencia | authApi.js, ausenciasApi.js | profiles, maestros, ausencias_maestros | Datos personales y solicitudes de permiso/ausencia docente |
| planificacion-disenador | DisenadorCurricularView.js | ArbolCurricular, EditorIndicador | planificacionApi.js | indicators, nodes, fn_sincronizar_arbol_curricular | Estructuración curricular por cátedra y nivel |
| ruta-semanal | weeklyPlanView.js | WeeklyGrid, IndicatorCheck | weeklyPlanApi.js | acm_weekly_plans, acm_weekly_plan_items | Seguimiento semanal del avance pedagógico |

### PORTAL ACADÉMICO (acm.html / ACM)

| Ruta | Vista (View) | Componentes Clave | API / DataAdapter | Tablas / RPC Supabase | Flujo de Usuario |
|---|---|---|---|---|---|
| programas | programasView.js | ProgramasList, ModalPrograma | programasApi.js | programas, programas_prerrequisitos | Gestión de programas orquestales, corales y semilleros |
| clases | clasesView.js | ClasesTable, AsignarMaestro | clasesApi.js, maestrosApi.js | clases, maestros, salones, clase_horarios | Alta, edición y configuración de cátedras y horarios |
| salones | salonesView.js | SalonesGrid, SalonCard | salonesApi.js | salones, fn_validate_salon_capacity_horario | Inventario de salones físicos, aforo y disponibilidad |
| pedagogico-dashboard | AusentismoDashboardView.js | AusentismoKpi, GraficoTendencia | pedagogicoApi.js | vw_alertas_activas, vw_destacados_y_riesgo_academico | Detección proactiva de alumnos en riesgo y ausentismo crónico |
| pedagogico-solicitudes | SolicitudesNecesidadesView.js | ListaSolicitudes, AprobadorModal | pedagogicoApi.js | solicitudes_necesidades, fn_solicitudes_necesidades_open_process_case | Aprobación de requerimientos de maestros e inyección a Hermes |
| periodos | periodosView.js | PeriodosList, ValidarCierre | periodosApi.js | periodos, fn_validar_cierre_periodo, fn_cerrar_periodo_academico | Apertura, auditoría de completitud y cierre de semestres |

### PORTAL ADMINISTRACIÓN (adm.html / ADM / DIR)

| Ruta | Vista (View) | Componentes Clave | API / DataAdapter | Tablas / RPC Supabase | Flujo de Usuario |
|---|---|---|---|---|---|
| alumnos | alumnosView.js | AlumnosTable, FiltrosInstrumento | alumnosApi.js | alumnos, familias, representantes | Padrón de estudiantes, altas, bajas, asignación familiar |
| alumnos-duplicados | duplicadosView.js | DedupeDiff, FusionModal | alumnosApi.js | fn_fusionar_alumnos_duplicados | Detección fonética/cédula y fusión atómica de alumnos |
| postulados | postuladosView.js | PostuladosKanban, GoogleSync | postulantesApi.js | postulantes, sync-postulantes (Edge Fn) | Admisiones desde Google Forms y canalización a audición |
| admin-aprobacion | adminAprobacionView.js | AprobacionList, DetalleSolicitud | adminAprobacionApi.js | ausencias_maestros, permisos_maestros | Visto bueno a justificaciones y suplencias docentes |
| gestion-usuarios | adminUsuariosView.js | UsuariosGrid, RolSelector | adminUsuariosApi.js | profiles, auth.users, approve_maestro_profile | Acreditación de cuentas y asignación de roles/departamentos |

### PORTAL FINANZAS (fin.html / FIN)

| Ruta | Vista (View) | Componentes Clave | API / DataAdapter | Tablas / RPC Supabase | Flujo de Usuario |
|---|---|---|---|---|---|
| finanzas-balance | BalanceOverview.tsx | KpiCards, CashFlowChart | FinanceContext.tsx | cuotas, pagos, aplicaciones_pago, vw_alumno_estado_pago | Tablero de cobranza, mora familiar y cuentas por cobrar |
| finanzas-registro | CobroAlumnoView.tsx | SelectorFamilia, FormPagoFIFO | cajaApi.ts | fn_registrar_pago_transaccional, cuotas, pagos | Recepción de pagos en efectivo/transferencia e imputación FIFO |
| finanzas-servicios | ServiceBalancesView.tsx | MedidoresCEPM, AlertaVencimiento | serviceApi.ts | fin_service_accounts, fn_fin_service_dashboard | Scraping y monitoreo de balances eléctricos CEPM |
| aranceles | ArancelesConfig.tsx | TablaCuotasBase | arancelesApi.ts | configuracion_aranceles, finanzas_politica_cobranza | Parámetros de mensualidades, becas y fechas de corte |

### PORTAL LUTERÍA E INVENTARIO (luteria.html / inventario.html / LUT / LOG)

| Ruta | Vista (View) | Componentes Clave | API / DataAdapter | Tablas / RPC Supabase | Flujo de Usuario |
|---|---|---|---|---|---|
| luteria-ordenes | luteriaOrdenesView.js | OrdenesTable, DiagnosticoModal | luteriaApi.js | lut_ordenes_reparacion, fn_lut_upsert_diagnostico | Recepción de instrumentos dañados, diagnóstico y costeo |
| inventario-stock | inventarioStockView.js | ActivosGrid, CodigoBarras | inventarioApi.js | inventario_activos, inventario_materiales | Control de instrumentos físicos, estado de conservación y seriales |
| inventario-comodatos | comodatosView.js | ComodatoList, ContratoPDF | comodatosApi.js | comodatos_activos, generar_contrato_pdf, vw_activos_ociosos | Préstamo de instrumentos a alumnos, vencimientos y retenciones |

### DIRECCIÓN Y MOTOR HERMES (Transversal / DIR)

| Ruta | Vista (View) | Componentes Clave | API / DataAdapter | Tablas / RPC Supabase | Flujo de Usuario |
|---|---|---|---|---|---|
| hermes-tareas | hermesTareasView.js | KanbanDepartamental, TaskCard | hermesApi.js | tareas_institucionales, fn_actualizar_tarea, fn_observar_tarea | Seguimiento de compromisos inter-departamentales |
| hermes-procedimientos | hermesProcedimientosView.js | CasosList, CaseAuditTrail | hermesApi.js | hermes_process_cases, fn_hermes_close_process_case | Casos multi-paso iniciados por contratos institucionales |
| hermes-kanban | hermesKanbanView.js | SyncStatus, KanbanCards | hermesApi.js | hermes_kanban_cards, hermes-kanban-ingest (Edge Fn) | Espejo bidireccional entre SQLite local y nube |
| gateway-config | gatewayConfigView.js | QRModal, HeartbeatMonitor | gatewayConfigApi.js | hermes_gateway_health, fn_hermes_gateway_get_live_status | Estado del socket Baileys WhatsApp y reconexión |

