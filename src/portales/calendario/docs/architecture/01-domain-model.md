# 01 — Domain Model Specification

## 1. Architectural Philosophy & Bounded Contexts

The **SOI (Sistema de Orquestación Institucional) Calendar Portal** is designed under strict **Domain-Driven Design (DDD)** and **Hexagonal Architecture (Ports and Adapters)** principles. 

The domain layer is the sovereign core of the application:
- It contains **zero dependencies** on React, Tailwind, Supabase, HTTP frameworks, or browser APIs.
- Domain Entities and Value Objects enforce invariants upon instantiation and state transitions.
- All entities expose immutable getters and safe snapshot serializers (`toJSON()`).
- Rich domain policies govern state transitions, temporal offsets, and dependency resolution.

```
+-----------------------------------------------------------------------------------+
|                                  PRESENTATION                                     |
|           React 18 Pages (Schedule, Venues, Tasks, Protocols, Radar)              |
|           Zustand UI Store, Drawers, Modals, Kanban Boards, Hermes Panels         |
+----------------------------------------+------------------------------------------+
                                         | (calls use cases)
+----------------------------------------v------------------------------------------+
|                                  APPLICATION                                      |
|   Use Cases (Command/Query Orchestration) | ActionPermissionService (RBAC/Policy) |
+----------------------------------------+------------------------------------------+
                    | (reads/writes entities)   | (calls ports)
+-------------------v---------------------------------------------------------------+
|                                    DOMAIN                                         |
|   Entities: CalendarItem, TemporalTrigger, ProtocolRun, InstitutionalTask,        |
|             TaskDependency, AcademicPeriod, ClassSchedule, Venue, HermesInsight   |
|   Value Objects: CalendarItemKind, CalendarItemStatus, CategoryFamily,            |
|                  DepartmentCode, PriorityLevel, AutomationLevel                   |
|   Ports: ICalendarRepository, ITriggerRepository, IProtocolRunRepository,        |
|          ITaskRepository, IVenueRepository, IScheduleRepository                   |
+----------------------------------------^------------------------------------------+
                                         | (implements ports)
+----------------------------------------+------------------------------------------+
|                                INFRASTRUCTURE                                     |
|   Mock In-Memory Repositories (current) / Supabase Postgres Client + RPC (target) |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Entities & Invariants

### 2.1 CalendarItem
The central operational anchor of the institutional master calendar (the "partitura").

- **Path:** `/src/domain/calendar/entities/CalendarItem.ts`
- **Fields:**
  - `id: string` — Unique identifier (e.g., `item-xmas-2026`).
  - `title: string` — Descriptive name of the event, window, or deadline.
  - `description: string` — Full operational narrative.
  - `kind: CalendarItemKind` — Enum: `'EVENT' | 'SEASON' | 'WINDOW' | 'DEADLINE' | 'BLOCKOUT' | 'MILESTONE' | 'RECURRENCE'`.
  - `category: CategoryFamily` — Enum: `'ACADEMIC' | 'ARTISTIC' | 'ADMISSIONS' | 'ADMINISTRATIVE' | 'FISCAL' | 'GOVERNANCE' | 'OPERATIONS' | 'COMMUNICATIONS' | 'FINANCE' | 'HR' | 'HOLIDAYS' | 'PARTNERSHIPS' | 'INSTITUTIONAL'`.
  - `departmentOwner: DepartmentCode` — Primary responsible department (`DIR | ACM | ADM | FIN | LOG | COM | EVT | PRD | AGT`).
  - `secondaryDepartments: DepartmentCode[]` — Co-responsible departments participating in the event.
  - `ownerRole: string` — Human role with primary execution authority.
  - `startAt: string` — ISO 8601 UTC timestamp of initiation.
  - `endAt: string` — ISO 8601 UTC timestamp of termination (`endAt >= startAt`).
  - `allDay: boolean` — Flag for day-long or date-only milestones.
  - `status: CalendarItemStatus` — Lifecycle state: `'DRAFT' | 'PLANNED' | 'CONFIRMED' | 'ACTIVE' | 'CLOSING' | 'CLOSED' | 'CANCELLED'`.
  - `priority: PriorityLevel` — `'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'`.
  - `location?: string` — Physical or digital site.
  - `venueId?: string` — Foreign key link to internal `Venue` entity.
  - `parentCycleId?: string` — Identifier of overarching academic period or season.
  - `metadata: CalendarItemMetadata` — Extensible JSON payload (e.g., `expectedAttendance`, `repertoire`, `budgetRequired`, `academicTerm`).
  - `createdAt: string`, `updatedAt: string`.
- **Invariants:**
  - `startAt <= endAt`.
  - `durationInHours = max(0, (endAt - startAt) in hours)`.
  - `allowsOperationalTriggers = status IN ('CONFIRMED', 'ACTIVE', 'CLOSING')`. Triggers must never execute automatically if status is `DRAFT`, `PLANNED`, or `CANCELLED`.
  - `daysUntilStart(now) = round((startAt - now) in days)`.

---

### 2.2 TemporalTrigger
Defines calculated trigger points relative to or absolute with respect to a `CalendarItem`.

- **Path:** `/src/domain/calendar/entities/TemporalTrigger.ts`
- **Fields:**
  - `id: string` — Unique identifier (e.g., `trig-xmas-t90`).
  - `calendarItemId: string` — Reference to the target `CalendarItem`.
  - `type: TriggerType` — `'ABSOLUTE' | 'RELATIVE' | 'RECURRENT' | 'CONDITIONAL'`.
  - `offsetValue: number` — Offset integer (e.g., `-90` for T-90, `0` for T0, `+7` for T+7).
  - `offsetUnit: TriggerOffsetUnit` — `'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS'`.
  - `label: string` — Human-readable marker (`'T-90'`, `'T-7'`, `'T0'`, `'T+3'`).
  - `fireAt: string` — Evaluated ISO 8601 timestamp when trigger conditions should be checked.
  - `condition?: TriggerCondition` — Optional structured predicate evaluated by Hermes/Engine.
  - `protocolCode?: string` — Target SOP process code (e.g., `'ADM-P01'`, `'EVT-P02'`, `'ACM-PXX'`).
  - `actionType: TriggerActionType` — `'SPAWN_PROTOCOL_RUN' | 'CREATE_TASK' | 'SEND_DISPATCH' | 'EVALUATE_CONDITIONS' | 'ESCALATE_ALERT'`.
  - `requiresApproval: boolean` — Whether manual human consent is mandatory.
  - `automationLevel: AutomationLevel` — `'AUTO' | 'PROPOSAL' | 'HUMAN_REQUIRED'`.
  - `department: DepartmentCode` — Executing department.
  - `ownerRole: string` — Execution role.
  - `description: string` — Operational objective.
  - `isActive: boolean` — Enablement toggle.
  - `lastExecutedAt?: string` — ISO timestamp of previous execution.
  - `isExecuted: boolean` — Execution state flag.
- **Invariants:**
  - If `type === 'RELATIVE'`, `fireAt = calendarItem.startAt + (offsetValue * offsetUnit)`.
  - If `type === 'ABSOLUTE'`, `fireAt` is fixed.
  - `isOverdue = (!isExecuted && new Date(fireAt) < new Date())`.
  - A trigger with `requiresApproval === true` OR `automationLevel === 'HUMAN_REQUIRED'` cannot auto-execute without human user signature.

---

### 2.3 ProtocolRun
An instantiated instance of a standard operating procedure (SOP) process bound to an anchor calendar item.

- **Path:** `/src/domain/orchestration/entities/ProtocolRun.ts`
- **Fields:**
  - `id: string` — Unique run identifier (e.g., `run-adm-p01-2026-s2`).
  - `processCode: string` — Canonical SOP code (e.g., `ADM-P01`, `EVT-PXX`).
  - `processName: string` — Full descriptive name.
  - `calendarItemId: string` — Originating calendar item.
  - `triggerId?: string` — Firing trigger that spawned this run (if automated).
  - `correlationId: string` — Correlation scope across tasks and triggers (e.g., `SOI-2026-S2-REENROLLMENT`).
  - `status: ProtocolRunStatus` — `'PENDING' | 'RUNNING' | 'BLOCKED' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED' | 'FAILED'`.
  - `startedAt: string` — ISO timestamp.
  - `completedAt?: string` — ISO timestamp when all tasks completed or run cancelled.
  - `ownerRole: string` — Lead orchestrator.
  - `snapshotContext: Record<string, string | number | boolean | null>` — Contextual audit state snapshot.
  - `resultSummary?: string` — Executive summary of outcome.
  - `overallProgress: number` — Percentage 0–100 computed from child tasks.
  - `departmentBreakdown: DepartmentProgress[]` — Per-department task progress matrix (`{ department, totalTasks, completedTasks, percentage }`).
- **Invariants:**
  - `overallProgress = round((completedTasks / totalTasks) * 100)`.
  - Status becomes `'COMPLETED'` only when `completedTasks === totalTasks` and all mandatory evidence is verified.
  - Status becomes `'BLOCKED'` if any critical path task is `BLOCKED`.
  - Status becomes `'AT_RISK'` if any unresolved task is overdue (`isOverdue === true`).

---

### 2.4 InstitutionalTask
An individual unit of work assigned to an institutional role within a protocol run or calendar cycle.

- **Path:** `/src/domain/tasks/entities/InstitutionalTask.ts`
- **Fields:**
  - `id: string` — Unique identifier (e.g., `task-reenroll-1`).
  - `protocolRunId?: string` — Parent protocol run reference.
  - `calendarItemId?: string` — Associated calendar item.
  - `correlationId: string` — Common correlation tag.
  - `title: string` — Task title.
  - `description: string` — Operational instructions and acceptance criteria.
  - `department: DepartmentCode` — Assigned department.
  - `ownerRole: string` — Designated role.
  - `status: TaskStatus` — `'BLOCKED' | 'PENDING' | 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'COMPLETED' | 'CANCELLED'`.
  - `priority: PriorityLevel` — `'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'`.
  - `dueAt: string` — Target deadline ISO timestamp.
  - `startedAt?: string` — Initiation timestamp.
  - `completedAt?: string` — Sign-off timestamp.
  - `evidenceRequired: boolean` — True if completion requires verified documentary or system proof.
  - `evidenceItems: TaskEvidence[]` — Array of `{ id, type, label, url?, verified, uploadedAt? }`.
  - `triggerLabel?: string` — Associated milestone tag (`'T-14'`, `'T-7'`, `'T0'`).
  - `progressPercentage: number` — 0 to 100.
- **Invariants:**
  - `isOverdue = (status !== 'COMPLETED' && status !== 'CANCELLED' && new Date(dueAt) < new Date())`.
  - `isEvidenceFulfilled = (!evidenceRequired || (evidenceItems.length > 0 && evidenceItems.every(e => e.verified)))`.
  - Transition to `'COMPLETED'` is **rejected** if `evidenceRequired === true` and `isEvidenceFulfilled === false`.
  - A task with active `BLOCKING` dependencies cannot transition to `'IN_PROGRESS'` or `'COMPLETED'` while any predecessor task is not `'COMPLETED'`.

---

### 2.5 TaskDependency
Models the directed acyclic graph (DAG) of prerequisites between tasks.

- **Path:** `/src/domain/tasks/entities/TaskDependency.ts`
- **Fields:**
  - `id: string` — Dependency identifier.
  - `taskId: string` — The downstream dependent task (child).
  - `dependsOnTaskId: string` — The upstream prerequisite task (parent).
  - `dependencyType: TaskDependencyType` — `'BLOCKING' | 'INFORMATIONAL'`.
  - `description?: string` — Reason for dependency.
- **Invariants:**
  - Self-referencing dependencies (`taskId === dependsOnTaskId`) are strictly prohibited.
  - Graph cycles are invalid (enforced by DAG cycle detection algorithms).
  - When `dependencyType === 'BLOCKING'`, child task status must remain `'BLOCKED'` until `dependsOnTaskId.status === 'COMPLETED'`.

---

### 2.6 Venue & AcademicSchedule Entities
- **Venue:** `/src/domain/venues/entities/Venue.ts`
  - Encapsulates physical assets: `id, name, type, capacity, address, acousticProfile, indoorOutdoor, features, notes`.
  - Invariant: Capacity must be positive; collisions in booking windows are resolved by the schedule repository.
- **AcademicPeriod:** `/src/domain/schedule/entities/AcademicPeriod.ts`
  - Encapsulates academic semesters: `id, code, name, startDate, endDate, isActive, enrollmentDeadline, regularClassesStart, evaluationWeek`.
- **ClassSchedule:** `/src/domain/schedule/entities/ClassSchedule.ts`
  - Encapsulates weekly academic grid items: `id, academicPeriodId, subjectName, professorName, venueId, dayOfWeek (1-7), startTime ('HH:MM'), endTime ('HH:MM'), enrolledCount, maxCapacity, status ('DRAFT' | 'CONFIRMED' | 'PUBLISHED')`.

---

### 2.7 HermesInsight
Autonomous intelligence artifact generated by the Hermes analysis engine.

- **Path:** `/src/domain/orchestration/entities/HermesInsight.ts`
- **Fields:**
  - `id: string` — Unique insight identifier.
  - `type: InsightType` — `'RISK' | 'DETECTION' | 'RECOMMENDATION' | 'OPPORTUNITY'`.
  - `title: string` — High-level title.
  - `summary: string` — Concisely stated finding.
  - `detailedAnalysis?: string` — Full reasoning trace.
  - `department: DepartmentCode` — Target department.
  - `automationLevel: AutomationLevel` — `'AUTO' | 'PROPOSAL' | 'HUMAN_REQUIRED'`.
  - `calendarItemId?: string`, `protocolRunId?: string`, `correlationId?: string`.
  - `metrics: Array<{ label: string; value: string | number; badge?: string }>`.
  - `proposedActions: ProposedAction[]` — Executable action payloads (`TRIGGER_WORKFLOW`, `ESCALATE_TASK`, `SEND_REMINDER`, `DISMISS`, `OPEN_DRAWER`).
  - `createdAt: string`, `isDismissed: boolean`.

---

## 3. Value Objects Catalog

| Value Object | Type Definition | Allowed Values / Semantics |
| :--- | :--- | :--- |
| **DepartmentCode** | `enum / union` | `'DIR'` (Dirección General), `'ACM'` (Académica), `'ADM'` (Admisiones y Registro), `'FIN'` (Finanzas y Tesorería), `'LOG'` (Logística y Luthería), `'COM'` (Comunicaciones y Prensa), `'EVT'` (Eventos y Producción), `'PRD'` (Producción Técnica), `'AGT'` (Hermes AI Agent) |
| **CalendarItemKind** | `enum / union` | `'EVENT'`, `'SEASON'`, `'WINDOW'`, `'DEADLINE'`, `'BLOCKOUT'`, `'MILESTONE'`, `'RECURRENCE'` |
| **CalendarItemStatus** | `enum / union` | `'DRAFT'`, `'PLANNED'`, `'CONFIRMED'`, `'ACTIVE'`, `'CLOSING'`, `'CLOSED'`, `'CANCELLED'` |
| **CategoryFamily** | `enum / union` | `'ACADEMIC'`, `'ARTISTIC'`, `'ADMISSIONS'`, `'ADMINISTRATIVE'`, `'FISCAL'`, `'GOVERNANCE'`, `'OPERATIONS'`, `'COMMUNICATIONS'`, `'FINANCE'`, `'HR'`, `'HOLIDAYS'`, `'PARTNERSHIPS'`, `'INSTITUTIONAL'` |
| **PriorityLevel** | `enum / union` | `'LOW'`, `'NORMAL'`, `'HIGH'`, `'CRITICAL'` |
| **AutomationLevel** | `enum / union` | `'AUTO'` (Autonomous execution), `'PROPOSAL'` (Hermes proposes, human approves), `'HUMAN_REQUIRED'` (Mandatory manual execution) |
| **TaskStatus** | `enum / union` | `'BLOCKED'`, `'PENDING'`, `'IN_PROGRESS'`, `'WAITING_APPROVAL'`, `'COMPLETED'`, `'CANCELLED'` |
| **ProtocolRunStatus** | `enum / union` | `'PENDING'`, `'RUNNING'`, `'BLOCKED'`, `'AT_RISK'`, `'COMPLETED'`, `'CANCELLED'`, `'FAILED'` |

---

## 4. Aggregate Root Boundaries

```
[ CalendarItem Aggregate Root ]
  ├── CalendarItem (Root)
  └── TemporalTrigger (Child Entities)
      └── Firing Rules & Offset Evaluator

[ ProtocolRun Aggregate Root ]
  ├── ProtocolRun (Root)
  ├── InstitutionalTask (Child Entities)
  │   └── TaskEvidence (Value Objects)
  └── TaskDependency (Graph Edges)

[ AcademicSchedule Aggregate Root ]
  ├── AcademicPeriod (Root)
  └── ClassSchedule (Child Entities)

[ Venue Aggregate Root ]
  └── Venue (Root)

[ HermesInsight Aggregate Root ]
  ├── HermesInsight (Root)
  └── ProposedAction (Child Value Objects)
```
