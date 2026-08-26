# 05 — Data Contract: Domain Logical Model & Physical Supabase Mapping

**Architecture Status:**
```text
ARCHITECTURE FREEZE v1.0
DOMAIN/APPLICATION RECONCILED
PHYSICAL DATABASE RECONCILIATION PENDING FINAL TABLE VERIFICATION
```

## 1. Architectural Distinction: Logical vs. Physical

This specification explicitly separates the **Domain Logical Model** (authoritative for business invariants, entity encapsulation, and application use cases) from the **Physical Supabase Mapping** (reconciled against production Supabase/PostgreSQL schema).

```
+-----------------------------------------------------------------------------------+
|                            DOMAIN LOGICAL MODEL (FROZEN)                          |
|  Aggregates: CalendarItem, TemporalTrigger, ProtocolRun, InstitutionalTask,       |
|              TaskDependency, AcademicPeriod, ClassSchedule, Venue, HermesInsight  |
+----------------------------------------+------------------------------------------+
                                         │
                         [ INFRASTRUCTURE DATA MAPPERS ]
                                         │
+----------------------------------------v------------------------------------------+
|                       PHYSICAL SUPABASE RECONCILED TABLES                         |
|  - periodos (REUSE)                        - notificaciones (REUSE)               |
|  - salones (REUSE/MAP)                     - registros_pendientes (REUSE)         |
|  - horarios (REUSE/MAP)                    - schedule_runs (REUSE)                |
|  - sesiones_clase (REUSE/MAP)              - hermes_inbox (REUSE)                 |
|  - gastos_fijos / cuotas (MAP Proj)        - solicitudes_necesidades (MAP Proj)   |
|  - comodatos_activos (MAP Proj)            - ausencias_maestros (MAP Proj)        |
|  - calendario_institucional (REVIEW-EXIST) - tareas_institucionales (REVIEW-EXIST)|
|  - soi_process_contracts (REVIEW-EXIST)    - hermes_process_cases (REVIEW-EXIST)  |
|  - soi_event_bus (REVIEW-EXIST)            - task_evidence (REVIEW)               |
|  - calendar_triggers (CREATE)              - task_dependencies (CREATE)           |
|  - trigger_executions (CREATE)             - orchestration_jobs (CREATE)          |
+-----------------------------------------------------------------------------------+
```

---

# 2. PHYSICAL TABLE DEFINITIONS STILL REQUIRED

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

---

## 3. Domain Logical Model (Conceptual Entity Contracts — FROZEN)

### 3.1 `CalendarItem` (Logical Model)
- `id: string`
- `title: string`
- `description: string`
- `kind: 'EVENT' | 'SEASON' | 'WINDOW' | 'DEADLINE' | 'BLOCKOUT' | 'MILESTONE' | 'RECURRENCE'`
- `category: 'ACADEMIC' | 'ARTISTIC' | 'ADMISSIONS' | 'ADMINISTRATIVE' | 'FISCAL' | 'GOVERNANCE' | 'OPERATIONS' | 'COMMUNICATIONS' | 'FINANCE' | 'HR' | 'HOLIDAYS' | 'PARTNERSHIPS' | 'INSTITUTIONAL'`
- `departmentOwner: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'COM' | 'EVT' | 'PRD' | 'AGT'`
- `secondaryDepartments: DepartmentCode[]`
- `ownerRole: string`
- `startAt: string` (ISO 8601 UTC)
- `endAt: string` (ISO 8601 UTC)
- `allDay: boolean`
- `status: 'DRAFT' | 'PLANNED' | 'CONFIRMED' | 'ACTIVE' | 'CLOSING' | 'CLOSED' | 'CANCELLED'`
- `priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'`
- `location?: string`
- `venueId?: string`
- `parentCycleId?: string`
- `metadata: Record<string, any>`

### 3.2 `TemporalTrigger` (Logical Model)
- `id: string`
- `calendarItemId: string`
- `type: 'ABSOLUTE' | 'RELATIVE' | 'RECURRENT' | 'CONDITIONAL'`
- `offsetValue: number`
- `offsetUnit: 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS'`
- `label: string` (e.g. `'T-90'`, `'T-7'`, `'T0'`)
- `fireAt: string` (ISO 8601 UTC)
- `condition?: TriggerCondition`
- `protocolCode?: string`
- `actionType: 'SPAWN_PROTOCOL_RUN' | 'CREATE_TASK' | 'SEND_DISPATCH' | 'EVALUATE_CONDITIONS' | 'ESCALATE_ALERT'`
- `requiresApproval: boolean`
- `automationLevel: 'AUTO' | 'PROPOSAL' | 'HUMAN_REQUIRED'`
- `department: DepartmentCode`
- `ownerRole: string`
- `description: string`
- `isActive: boolean`
- `lastExecutedAt?: string`
- `isExecuted: boolean`

### 3.3 `ProtocolRun` (Logical Model)
- `id: string`
- `processCode: string` (e.g. `ADM-P01`)
- `processName: string`
- `calendarItemId: string`
- `triggerId?: string`
- `correlationId: string`
- `status: 'PENDING' | 'RUNNING' | 'BLOCKED' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED' | 'FAILED'`
- `startedAt: string`
- `completedAt?: string`
- `ownerRole: string`
- `snapshotContext: Record<string, any>`
- `resultSummary?: string`
- `overallProgress: number` (0 to 100)
- `departmentBreakdown: DepartmentProgress[]`

### 3.4 `InstitutionalTask` (Logical Model)
- `id: string`
- `protocolRunId?: string`
- `calendarItemId?: string`
- `correlationId: string`
- `title: string`
- `description: string`
- `department: DepartmentCode`
- `ownerRole: string`
- `status: 'BLOCKED' | 'PENDING' | 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'COMPLETED' | 'CANCELLED'`
- `priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'`
- `dueAt: string`
- `startedAt?: string`
- `completedAt?: string`
- `evidenceRequired: boolean`
- `evidenceItems: TaskEvidence[]`
- `triggerLabel?: string`
- `progressPercentage: number`

### 3.5 `TaskDependency` (Logical Model)
- `id: string`
- `taskId: string`
- `dependsOnTaskId: string`
- `dependencyType: 'BLOCKING' | 'INFORMATIONAL'`
- `description?: string`

---

## 4. Target Physical Specifications & Candidate Models

> **IMPORTANT NOTICE:** Do NOT execute CREATE TABLE or migration statements on objects marked `REVIEW — EXISTING TABLE` (`calendario_institucional`, `tareas_institucionales`, `soi_process_contracts`, `hermes_process_cases`, `soi_event_bus`). These schemas serve as target logical specifications to compare against the real production table definitions once provided.

### 4.1 Target Specification: `calendar_triggers` (Candidate: CREATE)
```sql
CREATE TABLE IF NOT EXISTS public.calendar_triggers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calendar_item_id uuid NOT NULL,
  type character varying(32) NOT NULL DEFAULT 'RELATIVE',
  offset_value integer NOT NULL DEFAULT 0,
  offset_unit character varying(16) NOT NULL DEFAULT 'DAYS',
  label character varying(32) NOT NULL,
  fire_at timestamp with time zone NOT NULL,
  condition jsonb,
  protocol_code character varying(64),
  action_type character varying(32) NOT NULL DEFAULT 'SPAWN_PROTOCOL_RUN',
  requires_approval boolean NOT NULL DEFAULT false,
  automation_level character varying(16) NOT NULL DEFAULT 'AUTO',
  department character varying(16) NOT NULL,
  owner_role character varying(128) NOT NULL,
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_executed_at timestamp with time zone,
  is_executed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT calendar_triggers_pkey PRIMARY KEY (id)
);
```

### 4.2 Target Specification: `trigger_executions` (Candidate: CREATE)
```sql
CREATE TABLE IF NOT EXISTS public.trigger_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trigger_id uuid NOT NULL,
  scheduled_for timestamp with time zone NOT NULL,
  executed_at timestamp with time zone NOT NULL DEFAULT now(),
  status character varying(32) NOT NULL DEFAULT 'SUCCESS',
  protocol_run_id text,
  spawned_task_id text,
  idempotency_key character varying(255) UNIQUE NOT NULL,
  retry_count integer NOT NULL DEFAULT 0,
  error_message text,
  executed_by_role character varying(64) NOT NULL,
  CONSTRAINT trigger_executions_pkey PRIMARY KEY (id)
);
```

### 4.3 Target Specification: `task_dependencies` (Candidate: CREATE)
```sql
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  depends_on_task_id uuid NOT NULL,
  dependency_type character varying(32) NOT NULL DEFAULT 'BLOCKING',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT task_dependencies_pkey PRIMARY KEY (id),
  CONSTRAINT uq_task_dep UNIQUE(task_id, depends_on_task_id),
  CONSTRAINT chk_no_self_task_dep CHECK (task_id != depends_on_task_id)
);
```

### 4.4 Target Specification: `orchestration_jobs` (Candidate: CREATE)
```sql
CREATE TABLE IF NOT EXISTS public.orchestration_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_type character varying(64) NOT NULL,
  target_aggregate_id character varying(64) NOT NULL,
  correlation_id character varying(128) NOT NULL,
  status character varying(32) NOT NULL DEFAULT 'READY',
  priority integer NOT NULL DEFAULT 5,
  claimed_by character varying(64),
  lease_expires_at timestamp with time zone,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_result jsonb,
  last_error text,
  scheduled_for timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orchestration_jobs_pkey PRIMARY KEY (id)
);
```

---

## 5. Infrastructure Mapping Matrix (Domain Properties to Physical Persistence)

| Domain Property | Physical Target Table | Strategy |
| :--- | :--- | :--- |
| `CalendarItem (Master Anchors)` | `calendario_institucional` | REVIEW — EXISTING TABLE (SSOT candidate) |
| `CalendarItem (Academic Season)` | `periodos` | Read-only Projection Mapper (`kind: SEASON`) |
| `CalendarItem (Class Timetable)` | `horarios` / `sesiones_clase` | Read-only Projection Mapper (`kind: RECURRENCE`) |
| `CalendarItem (Finance Due Dates)` | `gastos_fijos` / `cuotas` / `compromisos_pago` | Read-only Projection Mapper (`kind: DEADLINE`) |
| `CalendarItem (Logistics Loans)` | `comodatos_activos` | Read-only Projection Mapper (`fecha_vencimiento`) |
| `CalendarItem (Faculty Leave)` | `ausencias_maestros` | Read-only Projection Mapper (`kind: BLOCKOUT`) |
| `CalendarItem (Procurement)` | `solicitudes_necesidades` | Read-only Projection Mapper (`kind: MILESTONE`) |
| `ClassSchedule` | `horarios` (joined with `clases`, `salones`, `maestros`) | Composite Schedule Mapper |
| `AcademicPeriod` | `periodos` | 1:1 Direct Field Mapping |
| `Venue` | `salones` | `salones.nombre`, `salones.capacidad`, `salones.equipamiento` |
| `InstitutionalTask` | `tareas_institucionales` | REVIEW — EXISTING TABLE (SSOT candidate) |
| `ProtocolRun` | `hermes_process_cases` | REVIEW — EXISTING TABLE (SSOT candidate) |
| `ProcessContract (SOP)` | `soi_process_contracts` | REVIEW — EXISTING TABLE (SSOT candidate) |
| `TemporalTrigger` | `calendar_triggers` | Direct Storage Mapper (CREATE candidate) |
| `TriggerExecution` | `trigger_executions` | Direct Storage Mapper (CREATE candidate) |
| `TaskDependency` | `task_dependencies` | Direct Storage Mapper (CREATE candidate) |
| `HermesInbound` | `hermes_inbox` | Inbound Communication Gateway (REUSE) |
| `HermesWorkerQueue` | `orchestration_jobs` | Durable Background Job Queue (CREATE candidate) |
| `DomainEvent` | `soi_event_bus` / `soi_eventos` | REVIEW — EXISTING TABLE |

