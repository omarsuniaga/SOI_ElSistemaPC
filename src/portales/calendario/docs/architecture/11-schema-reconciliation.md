# 11 — Schema Reconciliation Report: Domain Model vs. Production Supabase

**Architecture Status:**
```text
ARCHITECTURE FREEZE v1.0
DOMAIN/APPLICATION RECONCILED
PHYSICAL DATABASE RECONCILIATION PENDING FINAL TABLE VERIFICATION
```

## 1. Executive Summary & Audit Mandate

This report documents the updated **Schema Reconciliation Audit** between the frozen SOI (Sistema de Orquestación Institucional) Domain Architecture and the production Supabase/PostgreSQL database.

### Core Principles & Guidance
1. **Domain & Application Freeze Preserved:** The frozen Domain Model (`CalendarItem`, `TemporalTrigger`, `TriggerExecution`, `ProtocolRun`, `InstitutionalTask`, `TaskDependency`, `OrchestrationJob`, `HermesInsight`, `AcademicPeriod`, `ClassSchedule`), Value Objects, State Machines, Application Ports, and Use Cases remain strictly sovereign and frozen.
2. **Incomplete SQL Dump Notice:** Absence of a table from an incomplete SQL dump does NOT imply absence from production. Key institutional tables are confirmed to exist in production and must NOT be created afresh.
3. **Classification Standard:**
   - **`REUSE`**: Existing physical table directly satisfies domain requirements as-is.
   - **`EXTEND`**: Existing physical table is the correct semantic home but requires additive fields (to be determined once full DDL is inspected).
   - **`MAP`**: Physical table is adapted via Infrastructure Data Mappers or unified read-only Domain projections.
   - **`CREATE`**: Strictly new concepts with no existing counterpart in production.
   - **`REVIEW — EXISTING TABLE`**: Confirmed to exist in production; awaiting full physical DDL inspection before authorizing final mapping/extension.
   - **`DEPRECATE — NO DROP AUTHORIZED`**: Legacy or duplicate object; do NOT introduce new dependencies, but strictly NO DROP / physical deletion authorized.

---

## 2. Global Reconciliation Summary

| Domain Concept | Production Table(s) | Status / Decision | Architectural Rationale & Strategy |
| :--- | :--- | :--- | :--- |
| **Calendar Item (Direct Anchors)** | `public.calendario_institucional` | **`REVIEW — EXISTING TABLE`** | Confirmed to exist in production. Leading candidate for Canonical Calendar SSOT. Do not design replacement table until full DDL is inspected. |
| **Legacy Calendar** | `public.calendario` | **`DEPRECATE — NO DROP`** | Confirmed to exist. Do not introduce new dependencies. No drop authorized until usage audited. |
| **Calendar Item (Projections)** | `periodos`, `horarios`, `sesiones_clase`, `gastos_fijos`, `cuotas`, `comodatos_activos`, `ausencias_maestros` | **`MAP` (Unified Projection)** | Domain `CalendarItem` acts as a unified projection across autonomous operational tables (Academics, Finance, Logistics, HR). No duplicate records copied into calendar. |
| **Academic Period** | `public.periodos` | **`REUSE`** | Existing SSOT for academic semesters and terms (`id, nombre, fecha_inicio, fecha_fin, activo, cerrado`). Mapped 1:1 to `AcademicPeriod`. |
| **Venues / Spaces** | `public.salones` | **`REUSE / MAP`** | Existing table for space capacity, physical condition, and equipment (`id, nombre, capacidad, equipamiento`). Mapped to `Venue`. |
| **Faculty & Staff Profiles** | `public.profiles`, `public.maestros` | **`REUSE`** | Existing tables for user identity, roles, specialties, and contact directories. |
| **Class Timetable Grid** | `public.horarios`, `public.clase_horarios` | **`REUSE / MAP (Provisional)`** | `horarios` is current primary candidate (integer `dia_semana: 1-7`, strict FKs); `clase_horarios` is MAP / compatibility source. No deprecation or migration until usage audited. |
| **Class Sessions / Events** | `public.sesiones_clase`, `public.class_events` | **`REUSE / MAP`** | Existing operational session tables projected dynamically into weekly/daily calendar views. |
| **Institutional Task SSOT** | `public.tareas_institucionales` | **`REVIEW — EXISTING TABLE`** | Confirmed to exist in production. Leading candidate for Canonical InstitutionalTask SSOT. Do not create duplicate task tables. |
| **Legacy Task Tables** | `tareas_calendario`, `tareas_portales`, `tarea_historial`, `tarea_comentarios` | **`REVIEW — EXISTING TABLE`** | Confirmed to exist. `tareas_calendario` candidate for eventual deprecation; `tareas_portales` projection; `tarea_historial`/`tarea_comentarios` audit/notes. |
| **Pedagogical Tasks** | `public.maestro_tareas`, `public.homework_assignments` | **`REUSE` (Pedagogical Domain)** | Preserved strictly for teacher-to-student pedagogical homework. |
| **Task Dependencies (DAG)** | `public.task_dependencies` | **`CREATE`** | True multi-predecessor Directed Acyclic Graph (DAG) edge model (`task_id`, `depends_on_task_id`, `dependency_type`). |
| **Task Evidence** | `public.task_evidence` | **`REVIEW`** | Verification proof model; review if existing audit structures can satisfy requirement before creating. |
| **Process / SOP Contracts** | `public.soi_process_contracts` | **`REVIEW — EXISTING TABLE`** | Confirmed to exist in production. Leading candidate for Process Definition SSOT (e.g. `ADM-P01`, `EVT-P02`). |
| **Protocol Runs (Executions)** | `public.hermes_process_cases` | **`REVIEW — EXISTING TABLE`** | Confirmed to exist in production. Leading candidate for `ProtocolRun` execution SSOT. |
| **Legacy Process Tables** | `protocolos`, `hermes_protocolos` | **`DEPRECATE — NO DROP`** | Confirmed to exist. Review definitions before consolidating into `soi_process_contracts`. No drop authorized. |
| **Schedule Optimizer Runs** | `public.schedule_runs`, `public.schedule_run_feedback` | **`REUSE`** | Preserved as specialized academic timetable optimizer execution history and user feedback. |
| **Temporal Trigger Engine** | `public.calendar_triggers` | **`CREATE`** | Temporal trigger rules (`T-90`, `T-7`, `T+3`, relative/absolute offsets) attached to calendar anchors. |
| **Trigger Execution Log** | `public.trigger_executions` | **`CREATE`** | Immutable execution log and idempotency guard for temporal trigger firings. (Distinct from `notification_trigger_logs`). |
| **Hermes Inbound Intake** | `public.hermes_inbox` | **`REUSE`** | Multi-channel communication intake gateway (`canal, categoria, summary, raw_ref, telegram_user_id`). |
| **Hermes Durable Job Queue** | `public.orchestration_jobs` | **`CREATE`** | Durable asynchronous worker queue (worker leases, retries, exponential backoff, dead-letter semantics). Decoupled from `hermes_inbox`. |
| **Hermes Rule Telemetry** | `hermes_acciones`, `hermes_evaluaciones`, `hermes_notificaciones`, `hermes_reactive_rules` | **`REVIEW — EXISTING TABLE`** | Confirmed to exist in production. Telemetry and recommendation logs. |
| **Institutional Event Bus** | `public.soi_event_bus`, `public.soi_eventos` | **`REVIEW — EXISTING TABLE`** | Confirmed to exist in production. Full structure to be inspected to determine event bus vs. immutable audit history relationship. |
| **Notifications & Escalations** | `public.notificaciones`, `public.registros_pendientes`, `public.notification_trigger_logs` | **`REUSE`** | Existing notification infrastructure (`escalation_level`, `dedup_key`, `scheduled_for`, `notification_state: VERDE/AMARILLO/NARANJA/ROJO`). |
| **Correlation Strategy** | `public.solicitudes_necesidades.correlation_id` | **`REUSE` (Pattern)** | Validates existing pattern: UUID `correlation_id` combined with textual `correlation_key`. |

---

## 3. Deep-Dive Context Reconciliations

### 3.1 Calendar Context: Unified Projection Architecture

The architecture maintains a **Domain Projection Engine** across autonomous bounded contexts:

```
                                [ PROJECTION ARCHITECTURE ]
                                
  Direct Institutional Events/Galas ──>  calendario_institucional (REVIEW - EXISTING) ──┐
  Academic Semesters & Terms        ──>  periodos (REUSE)                             ──┼──> [ CalendarItem Data Mapper ]
  Weekly Timetable Classes          ──>  horarios / sesiones_clase (REUSE)            ──┤             │
  Financial Fixed/Tuition Due Dates ──>  gastos_fijos / cuotas / compromisos (MAP)    ──┤             ▼
  Instrument Loan Expirations       ──>  comodatos_activos (MAP)                      ──┤      Domain CalendarItem
  Faculty Approved Leaves           ──>  ausencias_maestros (MAP)                     ──┤  (Unified In-Memory Aggregate)
  Operational Procurement Requests  ──>  solicitudes_necesidades (MAP)                ──┘
```

1. **`calendario_institucional` (REVIEW — EXISTING TABLE):** Confirmed to exist. Leading candidate for canonical anchor table for direct master events, gala concerts, academic milestones, institutional windows, and governance blockouts.
2. **Financial Projections Correction:** `pagos_alumnos` represents historical payments that already occurred. For financial due-date CalendarItems (`kind: 'DEADLINE'`, `category: 'FINANCE'`), inspect `gastos_fijos`, `cuotas`, `service_accounts`, and `compromisos_pago`. Finance remains the SSOT; Calendar only projects the temporal obligation.

---

### 3.2 Schedule Source of Truth: `horarios` vs. `clase_horarios`

- **`horarios`**: Current primary candidate for canonical timetable structure (integer `dia_semana: 1-7`, strict FKs).
- **`clase_horarios`**: Mapped as compatibility source.
- **Rule:** Provisional decision. Neither table is deprecated or migrated until live application usage and data population are audited.

---

### 3.3 Task Management: Institutional Task SSOT

- **`tareas_institucionales` (REVIEW — EXISTING TABLE):** Confirmed to exist in production. Designated as the primary candidate for Canonical InstitutionalTask SSOT. Do NOT create another institutional task table.
- **`maestro_tareas` & `homework_assignments` (REUSE):** Preserved for teacher-student pedagogical homework.
- **`task_dependencies` (CREATE):** Multi-predecessor Directed Acyclic Graph (DAG) edge model.

---

### 3.4 Process Blueprints & Execution Instances

- **`soi_process_contracts` (REVIEW — EXISTING TABLE):** Confirmed to exist in production. Leading candidate for Process Definition SSOT (SOP blueprints like `ADM-P01`, `EVT-P02`).
- **`hermes_process_cases` (REVIEW — EXISTING TABLE):** Confirmed to exist in production. Leading candidate for `ProtocolRun` / process execution instances.
- **`schedule_runs` (REUSE):** Reused for academic timetable optimization engine telemetry.

---

### 3.5 Hermes Queue & Inbound Intake

- **`hermes_inbox` (REUSE):** Inbound communication intake channel (Telegram, webhooks, voice transcripts).
- **`orchestration_jobs` (CREATE):** Durable asynchronous background worker queue (leases, retries, exponential backoff, dead-letter queue). `hermes_inbox` must NOT be overloaded with worker queue responsibilities.

---

### 3.6 Trigger Execution Log

- **`trigger_executions` (CREATE):** Immutable execution log and idempotency guard for temporal triggers.
- **`notification_trigger_logs` (REUSE):** Kept strictly for notification subsystem telemetry.

---

# 4. PHYSICAL TABLE DEFINITIONS STILL REQUIRED

The following tables are confirmed to exist in production, but their complete physical DDL (columns, constraints, triggers, indexes, and RLS policies) must be inspected before authorizing migrations:

```text
================================================================================
EXISTS IN PRODUCTION | FULL STRUCTURE NOT YET VERIFIED | NO MIGRATION AUTHORIZED
================================================================================
1.  calendario_institucional
2.  calendario
3.  tareas_institucionales
4.  tareas_calendario
5.  tareas_portales
6.  tarea_historial
7.  tarea_comentarios
8.  soi_process_contracts
9.  hermes_process_cases
10. protocolos
11. hermes_protocolos
12. hermes_acciones
13. hermes_evaluaciones
14. hermes_notificaciones
15. hermes_reactive_rules
16. soi_event_bus
17. soi_eventos
================================================================================
```


