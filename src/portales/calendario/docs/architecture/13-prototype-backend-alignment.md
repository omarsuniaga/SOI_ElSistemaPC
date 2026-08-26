# 13. Prototype-to-Backend Contract Alignment & SSOT Mapping

**Fecha de Alineación:** 24 de Agosto de 2026  
**Fase:** Prototype-to-Backend Contract Alignment Pass (Hexagonal Architecture)  
**Estado:** V8 Canonical Alignment Documented & Verified  

---

## 1. Executive Summary & SSOT Principles

Este documento formaliza la sincronización y alineación canónica entre el prototipo interactivo frontend del Calendario Institucional SOI V8 y la arquitectura física/relacional verificada de backend.

El prototipo frontend preserva estrictamente el desacoplamiento mediante **Arquitectura Hexagonal**:
- **Capa de Presentación (React):** Consume exclusivamente casos de uso y modelos de dominio; desconoce por completo nombres de tablas SQL, llamadas directas a Supabase o limitaciones de esquema transitorio.
- **Capa de Dominio:** Modela agregados de negocio limpios (`CalendarItem`, `TemporalTrigger`, `TriggerExecution`, `ProtocolRun`, `InstitutionalTask`, `TaskDependency`, `TaskEvidence`).
- **Capa de Aplicación:** Orquesta los casos de uso a través de puertos de repositorio.
- **Capa de Infraestructura (Adaptadores):** Implementa los puertos hacia repositorios simulados (`Mock*`) y proyecta los mapeos hacia las fuentes de datos físicas canónicas.

---

## 2. Canonical Physical SSOT Responsibilities

| Dominio Funcional | Concepto de Dominio (Frontend) | Tabla Canónica SSOT (Backend) | Rol y Límite Canónico |
| :--- | :--- | :--- | :--- |
| **Calendario / Hitos** | `CalendarItem` | `calendario_institucional` | Ancla institucional principal y proyección unificada. |
| **Tareas Operativas** | `InstitutionalTask` | `tareas_institucionales` | SSOT de tareas ejecutivas y técnicas. |
| **Contratos de Proceso** | `ProcessDefinition` | `soi_process_contracts` | Definición de procesos y especificación formal SOP. |
| **Ejecución de Procesos** | `ProtocolRun` | `hermes_process_cases` | Instancia de ejecución de proceso / caso Hermes. |
| **Bitácora de Eventos** | `Event` / `AuditEvent` | `soi_eventos` | Registro inmutable de eventos institucionales. |
| **Auditoría de Tareas** | `TaskAuditEntry` | `tarea_historial` | Historial cronológico de cambios de estado y notas. |
| **Comentarios / Discusión**| `TaskComment` | `tarea_comentarios` | Discusión, aclaraciones y notas de equipo (no evidencia). |
| **Buzón de Entrada Hermes**| `HermesInboxItem` | `hermes_inbox` | Ingesta de solicitudes entrantes (NO cola de orquestación). |
| **Disparadores Temporales** | `TemporalTrigger` | *(target: `calendar_triggers`)* | Reglas de activación por offset temporal (T-X, T0, T+X). |
| **Ejecución de Triggers** | `TriggerExecution` | *(target: `trigger_executions`)* | Registro de disparos temporales evaluados y ejecutados. |
| **Cola de Orquestación** | `OrchestrationJob` | *(target: `orchestration_jobs`)* | Trabajos durables de orquestación asíncrona. |
| **Grafo de Dependencias** | `TaskDependency` | *(target: `task_dependencies`)* | Relaciones N:M de bloqueo y precedencia entre tareas. |
| **Evidencia Estructurada** | `TaskEvidence` | *(target: `task_evidence`)* | Anexos y evidencias formales requeridas para cierre. |

---

## 3. Matriz de Auditoría y Alineación por Pantalla / Componente

| UI Screen / Component | Domain Concept | Canonical Physical Mapping | Current Adapter | Future Adapter | Status | Required Change |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Radar Temporal** (`TemporalRadarPage`) | `CalendarItem` + `TemporalTrigger` + `TriggerExecution` | `calendario_institucional` + `calendar_triggers` + `trigger_executions` | `MockCalendarRepository`, `MockTriggerRepository` | `SupabaseCalendarRepository`, `SupabaseTriggerRepository` | **ALIGNED** | Ninguno. Muestra offsets T-X y dispara ejecuciones de protocolo correctamente. |
| **Calendario Global** (`CalendarPage`) | `CalendarItem` (Proyección Unificada) | `calendario_institucional` (+ proyecciones de periodos/horarios) | `MockCalendarRepository` | `SupabaseCalendarRepository` | **ALIGNED** | Proyección unificada sin acoplar tablas satélites al SSOT. |
| **Partitura Anual** (`SeasonsPage`) | `CalendarItem` (Kind: `SEASON`, `WINDOW`) | `calendario_institucional` | `MockCalendarRepository` | `SupabaseCalendarRepository` | **ALIGNED** | Agrupación visual por ciclos académicos y temporadas operativas. |
| **Matriz Semanal / Horarios** (`ScheduleBuilderPage`) | `ClassSchedule` + `CalendarItem` | `horarios` / `bloques_horarios` (+ `calendario_institucional`) | `MockScheduleRepository`, `MockCalendarRepository` | `SupabaseScheduleRepository` | **ALIGNED** | Separación entre cátedras recurrentes e hitos institucionales. |
| **Ejecuciones de Protocolo** (`ProtocolRunsPage`) | `ProtocolRun` | `hermes_process_cases` | `MockProtocolRunRepository` | `SupabaseProtocolRunRepository` | **ALIGNED** | Etiquetado en español "Ejecuciones de Protocolo" verificado. |
| **Tablero Hermes (Tareas)** (`HermesTasksPage`) | `InstitutionalTask` + `TaskDependency` | `tareas_institucionales` (+ target `task_dependencies`) | `MockTaskRepository` | `SupabaseTaskRepository` | **ALIGNED** | Soporte para DAG de dependencias y visualización Kanban. |
| **Expediente de Hito (Drawer)** (`CalendarItemDrawer`) | `CalendarItem` + `TemporalTrigger` + `InstitutionalTask` + `TaskEvidence` | `calendario_institucional` + `calendar_triggers` + `tareas_institucionales` + `task_evidence` | `MockCalendarRepository`, `MockTaskRepository`, `MockTriggerRepository` | Compuesto por adaptadores de dominio | **ALIGNED** | Pestañas independientes: General, Línea de Tiempo, Protocolos, Tareas, Dependencias, Equipo, Sede, Evidencia, Historial. |
| **Previsualización SOP** (`ProtocolPreviewModal`) | `ProcessDefinition` | `soi_process_contracts` | `GenerateProtocolPreview` use case | `SupabaseProcessDefinitionRepository` | **ALIGNED** | Muestra estructura de fases, tareas hijas y reglas de evidencia. |
| **Modal Crear Hito** (`CreateCalendarItemModal`) | `CalendarItem` | `calendario_institucional` | `MockCalendarRepository` | `SupabaseCalendarRepository` | **ALIGNED** | Formulario con validación de categorías SOI y roles responsables. |
| **Modal Asignar Tarea** (`CreateTaskModal`) | `InstitutionalTask` | `tareas_institucionales` | `MockTaskRepository` | `SupabaseTaskRepository` | **ALIGNED** | Asignación directa con prioridad, plazo y vínculo a hito/proceso. |
| **Exportación Radar** (`RadarExportModal`) | `ExportSnapshot` | N/A (Proyección de cliente) | Client-side exporter | Client-side exporter | **ALIGNED** | Exportación en formato JSON e iCal estándar. |
| **Instantánea Semanal** (`WeeklySnapshotModal`) | `WeeklySnapshot` | N/A (Agregado de lectura) | `GenerateWeeklySnapshot` use case | `GenerateWeeklySnapshot` con repositorios SQL | **ALIGNED** | Diagnóstico operacional y síntesis semanal de salud. |
| **Sedes y Espacios** (`VenuesPage`, `VenueDetailModal`) | `Venue` | `sedes_espacios` | `MockVenueRepository` | `SupabaseVenueRepository` | **ALIGNED** | Control de disponibilidad y aforos. |

---

## 4. Legacy Compatibility Mapping

Los siguientes objetos físicos heredados (legacy) persisten temporalmente en bases de datos anteriores pero **NO** forman parte del modelo canónico futuro de SOI V8. La capa de presentación no expone estos nombres a los usuarios finales:

| Objeto Físico Legacy | Destino Canónico V8 | Regla de Compatibilidad en Adaptadores |
| :--- | :--- | :--- |
| `calendario` | `calendario_institucional` | Los adaptadores mapearán solo hacia `calendario_institucional`. |
| `tareas_calendario` | `tareas_institucionales` | Migración de datos en backend; frontend utiliza exclusivamente `InstitutionalTask`. |
| `hermes_protocolos` | `soi_process_contracts` | `hermes_protocolos` queda como catálogo de transición; definiciones canónicas residen en `soi_process_contracts`. |
| `hermes_acciones` | `soi_eventos` / `orchestration_jobs` | Acciones directas se registran como eventos o trabajos en cola. |
| `soi_event_bus` | `soi_eventos` | El log inmutable y auditoría canónica es `soi_eventos`. |
| Departamento `TECNICO` | `AGT` (Hermes AI / Automatización) | Traducido en el adaptador de infraestructura si proviene de registros históricos. |
| Departamento `LUT` | `LOG` (Logística y Luthería) | Consolidado en `LOG` como taxonomía departamental SOI V8. |

---

## 5. Backend Blockers Not To Encode In UI

El frontend respeta el modelo objetivo canónico y **NO codifica de forma permanente las limitaciones transitorias** del backend:

1. **Restricción `UNIQUE(correlation_id, departamento)`:**
   - *Limitación física:* Bloquea la creación de múltiples tareas para un mismo departamento bajo el mismo correlation ID.
   - *Postura UI:* La interfaz permite modelar múltiples tareas departamentales en el DAG. El adaptador resolverá o esperará el levantamiento de esta restricción en base de datos.
2. **Modelo de Dependencia de Predecesor Único (`depende_de_tarea_id`):**
   - *Limitación física:* La tabla actual solo contiene una columna para un único padre.
   - *Postura UI:* La UI soporta grafos N:M (`TaskDependency`). El adaptador mock gestiona el DAG completo, y la persistencia relacional futura mapeará a la tabla asociativa `task_dependencies`.
3. **Bug `NEW.texto` en `fn_hermes_tarea_completada_feedback`:**
   - *Limitación física:* Trigger de base de datos con referencia inválida a columna de comentarios.
   - *Postura UI:* No se altera el flujo de cierre de tareas ni se envía payload incorrecto.
4. **Diferenciación Estricta entre Comentarios y Evidencia:**
   - `tarea_comentarios` almacena exclusivamente discusiones/mensajes.
   - `task_evidence` (modelo futuro) almacena referencias y URLs de auditoría documental formal.
5. **Hermes Inbox vs. Cola de Orquestación:**
   - `hermes_inbox` es estrictamente para ingesta de mensajes y solicitudes entrantes.
   - Los trabajos de ejecución de procesos (`OrchestrationJob`) no se confunden con filas del inbox.

---

## 6. Mock-to-Production Adapter Checklist

| Puerto de Repositorio de Dominio | Implementación Mock Actual | Estado de Adaptador de Producción | Checklist de Verificación |
| :--- | :--- | :--- | :--- |
| `CalendarRepository` | `MockCalendarRepository` (`IMPLEMENTED MOCK`) | `SupabaseCalendarRepository` (`BACKEND PENDING`) | [x] Puerto definido<br>[x] Mock funcional<br>[ ] Mapeo a `calendario_institucional` |
| `TriggerRepository` | `MockTriggerRepository` (`IMPLEMENTED MOCK`) | `SupabaseTriggerRepository` (`BACKEND PENDING`) | [x] Puerto definido<br>[x] Offsets T-X implementados<br>[ ] Mapeo a `calendar_triggers` |
| `ProtocolRunRepository` | `MockProtocolRunRepository` (`IMPLEMENTED MOCK`) | `SupabaseProtocolRunRepository` (`BACKEND PENDING`) | [x] Puerto definido<br>[x] Desglose por departamento<br>[ ] Mapeo a `hermes_process_cases` |
| `TaskRepository` | `MockTaskRepository` (`IMPLEMENTED MOCK`) | `SupabaseTaskRepository` (`BACKEND PENDING`) | [x] Puerto definido<br>[x] Soporte DAG y estados<br>[ ] Mapeo a `tareas_institucionales` |
| `ScheduleRepository` | `MockScheduleRepository` (`IMPLEMENTED MOCK`) | `SupabaseScheduleRepository` (`BACKEND PENDING`) | [x] Puerto definido<br>[x] Matriz de horarios<br>[ ] Mapeo a `horarios` |
| `VenueRepository` | `MockVenueRepository` (`IMPLEMENTED MOCK`) | `SupabaseVenueRepository` (`BACKEND PENDING`) | [x] Puerto definido<br>[x] Aforos y salas<br>[ ] Mapeo a `sedes_espacios` |
| `TaskEvidenceRepository` | `MockTaskRepository` (sub-colección) (`IMPLEMENTED MOCK`) | `SupabaseTaskEvidenceRepository` (`BACKEND PENDING`) | [x] Modelo de dominio aislado<br>[ ] Mapeo a `task_evidence` |
| `OrchestrationJobRepository` | En memoria (`IMPLEMENTED MOCK`) | `SupabaseOrchestrationJobRepository` (`BACKEND PENDING`) | [x] Modelo conceptual<br>[ ] Mapeo a `orchestration_jobs` |

---

## 7. Taxonomía Departamental Canónica SOI V8

La interfaz de usuario utiliza exclusivamente los 8 departamentos canónicos de SOI V8:
1. **`DIR`** — Dirección Ejecutiva
2. **`ACM`** — Académico / Musical
3. **`ADM`** — Administración
4. **`FIN`** — Finanzas
5. **`LOG`** — Logística y Luthería
6. **`EVT`** — Eventos y Producción
7. **`COM`** — Comunicaciones
8. **`AGT`** — Hermes AI / Orquestación

---

## 8. Niveles de Automatización y Gobernanza

- **`AUTO`**: Ejecución 100% autónoma por reglas del sistema.
- **`PROPUESTA`**: Recomendación generada por Hermes sujeta a confirmación por el operador.
- **`REQUIERE APROBACIÓN HUMANA`**: Bloqueo de seguridad institucional que exige firma de rol con autoridad.

---

## 9. Conclusión y Veredicto de Alineación

El prototipo frontend del Calendario Institucional SOI V8 se encuentra **100% alineado conceptual y contractualmente** con la arquitectura física de base de datos canónica. La separación hexagonal garantiza una transición fluida a los adaptadores de Supabase en la fase de backend sin provocar regresiones visuales ni de experiencia de usuario.
