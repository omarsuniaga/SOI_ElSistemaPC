# 02 — Application Use Cases & UI Traceability Matrix

## 1. Overview & Application Architecture

Application Use Cases reside in `/src/application/*` and act as pure orchestrators:
- They accept typed Command/Query input DTOs.
- They invoke Domain Entities and Domain Policies.
- They interact with external resources strictly through Abstract Repository Ports (`/src/domain/*/repositories`).
- They enforce transactional consistency boundaries and return standardized result objects.
- They are completely agnostic of UI frameworks (React), CSS libraries, or transport layers.

---

## 2. Complete Use Case Catalog

### 2.1 Calendar Bounded Context

#### `GetCalendarItems`
- **Path:** `/src/application/calendar/useCases/GetCalendarItems.ts`
- **Responsibility:** Retrieves master calendar items filtered by search text, kind, department, category, status, and date range.
- **Input:** `params?: { search?: string; kind?: CalendarItemKind; department?: DepartmentCode; category?: CategoryFamily; status?: CalendarItemStatus; fromDate?: string; toDate?: string; }`
- **Output:** `Promise<CalendarItem[]>`
- **Preconditions:** None.
- **Postconditions:** Returns list sorted chronologically by `startAt`.

#### `GetCalendarItemDetails`
- **Path:** `/src/application/calendar/useCases/GetCalendarItemDetails.ts`
- **Responsibility:** Aggregates a single calendar item with all its temporal triggers, related protocol runs, and associated tasks.
- **Input:** `itemId: string`
- **Output:** `Promise<{ item: CalendarItem; triggers: TemporalTrigger[]; tasks: InstitutionalTask[]; protocolRuns: ProtocolRun[]; } | null>`
- **Preconditions:** `itemId` must be non-empty.
- **Postconditions:** Complete operational cascade loaded for detail drawer inspection.

#### `GetUpcomingTriggers`
- **Path:** `/src/application/calendar/useCases/GetUpcomingTriggers.ts`
- **Responsibility:** Returns pending triggers ordered by target firing timestamp within a specified time horizon.
- **Input:** `limit?: number; horizonDays?: number;`
- **Output:** `Promise<TemporalTrigger[]>`
- **Preconditions:** Valid positive numbers if passed.
- **Postconditions:** Triggers sorted with nearest `fireAt` first.

#### `GetTemporalRadar`
- **Path:** `/src/application/calendar/useCases/GetTemporalRadar.ts`
- **Responsibility:** Produces aggregated temporal risk metrics: upcoming triggers in 7/14/30 days, active protocol runs, critical blockers, and department load distribution.
- **Input:** `now?: Date`
- **Output:** `Promise<TemporalRadarSummary>`
- **Postconditions:** Supplies executive dashboard with real-time operational posture.

#### `GetSeasons`
- **Path:** `/src/application/calendar/useCases/GetSeasons.ts`
- **Responsibility:** Retrieves macro-cycles (`kind === 'SEASON' || kind === 'WINDOW'`).
- **Input:** None.
- **Output:** `Promise<CalendarItem[]>`

#### `SaveCalendarItem`
- **Path:** `/src/application/calendar/useCases/SaveCalendarItem.ts`
- **Responsibility:** Creates or updates a calendar event or milestone, revalidating invariants.
- **Input:** `itemProps: Partial<CalendarItemProps> & { title: string; kind: CalendarItemKind; category: CategoryFamily; departmentOwner: DepartmentCode; startAt: string; endAt: string; }`
- **Output:** `Promise<CalendarItem>`
- **Preconditions:** `startAt <= endAt`. Title non-empty.
- **Postconditions:** Persisted to repository; updated timestamps generated.

#### `DeleteCalendarItem`
- **Path:** `/src/application/calendar/useCases/DeleteCalendarItem.ts`
- **Responsibility:** Removes a calendar item after validating that no active running protocols or locked tasks depend on it.
- **Input:** `itemId: string`
- **Output:** `Promise<{ success: boolean; reason?: string }>`
- **Preconditions:** Caller must hold `DIR` role or executive override.

#### `ToggleTriggerStatus`
- **Path:** `/src/application/calendar/useCases/ToggleTriggerStatus.ts`
- **Responsibility:** Activates or deactivates a temporal trigger.
- **Input:** `{ triggerId: string; isActive: boolean; }`
- **Output:** `Promise<TemporalTrigger>`

---

### 2.2 Orchestration Bounded Context

#### `GetProtocolRuns`
- **Path:** `/src/application/orchestration/useCases/GetProtocolRuns.ts`
- **Responsibility:** Fetches protocol runs with optional status and department filters.
- **Input:** `filter?: { status?: ProtocolRunStatus; processCode?: string; }`
- **Output:** `Promise<ProtocolRun[]>`

#### `GetProtocolRunDetails`
- **Path:** `/src/application/orchestration/useCases/GetProtocolRunDetails.ts`
- **Responsibility:** Loads a protocol run with its full task tree, evidence files, and department breakdown.
- **Input:** `protocolRunId: string`
- **Output:** `Promise<{ run: ProtocolRun; tasks: InstitutionalTask[]; dependencies: TaskDependency[]; } | null>`

#### `ExecuteTrigger`
- **Path:** `/src/application/orchestration/useCases/ExecuteTrigger.ts`
- **Responsibility:** Evaluates conditions and executes the associated action (`SPAWN_PROTOCOL_RUN`, `CREATE_TASK`, `SEND_DISPATCH`, etc.). Generates idempotency token and updates trigger state.
- **Input:** `{ triggerId: string; executedByRole: string; force?: boolean; }`
- **Output:** `Promise<{ success: boolean; protocolRunId?: string; spawnedTaskId?: string; message: string; }>`
- **Preconditions:** Trigger must be active and not previously executed unless `force === true`.
- **Postconditions:** Trigger marked executed; `lastExecutedAt` stamped.

#### `GetHermesRecommendations`
- **Path:** `/src/application/orchestration/useCases/GetHermesRecommendations.ts`
- **Responsibility:** Queries active Hermes insights and proposals.
- **Input:** `department?: DepartmentCode; unreadOnly?: boolean;`
- **Output:** `Promise<HermesInsight[]>`

#### `GenerateProtocolPreview`
- **Path:** `/src/application/orchestration/useCases/GenerateProtocolPreview.ts`
- **Responsibility:** Simulates an SOP run for a given calendar item without persisting changes.
- **Input:** `{ calendarItemId: string; protocolCode: string; }`
- **Output:** `Promise<{ estimatedDurationDays: number; taskCount: number; affectedDepartments: DepartmentCode[]; previewTasks: Array<{ title: string; offsetDays: number; role: string }>; }>`

#### `GenerateWeeklySnapshot`
- **Path:** `/src/application/orchestration/useCases/GenerateWeeklySnapshot.ts`
- **Responsibility:** Produces an institutional executive briefing synthesizing weekly events, deadlines, pending approvals, and risks.
- **Input:** `{ weekStartDate: string; }`
- **Output:** `Promise<WeeklyInstitutionalSnapshot>`

#### `StartProtocolRun`
- **Path:** `/src/application/orchestration/useCases/StartProtocolRun.ts`
- **Responsibility:** Instantiates a new SOP run, creates child task records, establishes DAG dependencies, and assigns initial statuses.
- **Input:** `{ processCode: string; processName: string; calendarItemId: string; ownerRole: string; correlationId: string; initialContext?: Record<string, any>; }`
- **Output:** `Promise<ProtocolRun>`

#### `CancelProtocolRun`
- **Path:** `/src/application/orchestration/useCases/CancelProtocolRun.ts`
- **Responsibility:** Aborts an in-flight protocol run, cancelling all non-completed child tasks with audit trail.
- **Input:** `{ protocolRunId: string; reason: string; cancelledByRole: string; }`
- **Output:** `Promise<ProtocolRun>`
- **Preconditions:** Run must be in `PENDING`, `RUNNING`, `BLOCKED`, or `AT_RISK` state.

---

### 2.3 Tasks Bounded Context

#### `GetTasks`
- **Path:** `/src/application/tasks/useCases/GetTasks.ts`
- **Responsibility:** Queries tasks by status, department, correlationId, or protocolRunId.
- **Input:** `filter?: { status?: TaskStatus; department?: DepartmentCode; protocolRunId?: string; correlationId?: string; search?: string; }`
- **Output:** `Promise<InstitutionalTask[]>`

#### `UpdateTaskStatus`
- **Path:** `/src/application/tasks/useCases/UpdateTaskStatus.ts`
- **Responsibility:** Transitions a task between states (`BLOCKED`, `PENDING`, `IN_PROGRESS`, `WAITING_APPROVAL`, `COMPLETED`, `CANCELLED`). Evaluates DAG dependencies and triggers automatic unblocking of child tasks.
- **Input:** `{ taskId: string; newStatus: TaskStatus; userRole: string; evidenceData?: Partial<TaskEvidence>; }`
- **Output:** `Promise<{ task: InstitutionalTask; unblockedTaskIds: string[]; }>`
- **Preconditions:** 
  - Cannot complete if `evidenceRequired === true` and evidence is not verified.
  - Cannot start if blocking dependencies remain incomplete.
- **Postconditions:** Downstream tasks in DAG re-evaluated; parent `ProtocolRun` progress recalculated.

#### `CreateTask`
- **Path:** `/src/application/tasks/useCases/CreateTask.ts`
- **Responsibility:** Spawns a manual or ad-hoc task linked to an existing cycle.
- **Input:** `taskProps: Omit<InstitutionalTaskProps, 'id'>`
- **Output:** `Promise<InstitutionalTask>`

#### `EscalateTask`
- **Path:** `/src/application/tasks/useCases/EscalateTask.ts`
- **Responsibility:** Raises task priority to `CRITICAL`, alerts department head, and logs an urgent Hermes intervention flag.
- **Input:** `{ taskId: string; reason: string; escalatedByRole: string; }`
- **Output:** `Promise<InstitutionalTask>`

---

### 2.4 Venues & Academic Schedule Contexts

#### `GetVenues` & `ReserveVenue`
- **Paths:** `/src/application/venues/useCases/GetVenues.ts`, `ReserveVenue.ts`
- **Responsibility:** Queries venue assets and reserves them for calendar items without conflict.

#### `GetClassSchedules`, `SaveClassSchedule`, `PublishSchedule`
- **Paths:** `/src/application/schedule/useCases/*`
- **Responsibility:** Manages the recurring weekly academic timetable grid and commits it for student/teacher view.

---

## 3. UI-to-Use-Case Traceability Matrix

Every single interactive control in the presentation layer is mapped directly to an application use case and domain action below:

| Page / Component | UI Element / Trigger | Target Use Case | Domain Entity / Policy | State Mutation / Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **Top Navigation Bar** | Role Switcher (`DIR`, `ACM`, `ADM`, etc.) | `useUIStore.setActiveRole()` | `ActionPermissionService` | Switches active RBAC persona; re-evaluates all button authorizations immediately. |
| **Schedule Builder** | `+ Nuevo Bloque` Button | `SaveClassSchedule` | `ClassSchedule` | Creates new class draft in grid. |
| **Schedule Builder** | `Publicar Matriz` CTA | `PublishSchedule` | `ClassSchedule.status -> PUBLISHED` | Locks drafts into official institutional schedule; logs audit stamp. |
| **Schedule Builder** | Grid Slot Drag/Click | `SaveClassSchedule` | `ClassSchedule` | Updates day/time/venue for class. |
| **Venues Page** | Space Type Tabs (`Todos`, `Salas`, etc.) | `GetVenues` | `Venue` (filter) | Filters active venue roster by acoustic/capacity requirements. |
| **Venues Page** | `Reservar Espacio` CTA | `ReserveVenue` | `Venue` / `CalendarItem` | Blocks venue dates for rehearsals, concerts, or masterclasses. |
| **Hermes Tasks Page** | Kanban Column Drag & Drop | `UpdateTaskStatus` | `InstitutionalTask` & DAG Policy | Moves task between PENDING -> IN_PROGRESS -> COMPLETED; triggers DAG unblock cascade. |
| **Hermes Tasks Page** | `Escalar a Dirección` Action | `EscalateTask` | `InstitutionalTask.priority -> CRITICAL` | Flags critical bottleneck; raises Hermes insight. |
| **Hermes Tasks Page** | `Adjuntar Evidencia` Modal | `UpdateTaskStatus` | `TaskEvidence.verified = true` | Validates documentary proof required for task sign-off. |
| **Protocol Runs Page** | `Iniciar Protocolo` Modal CTA | `StartProtocolRun` | `ProtocolRun` + SOP Task Tree | Instantiates new SOP execution with multi-department tasks. |
| **Protocol Runs Page** | `Cancelar Ejecución` Button | `CancelProtocolRun` | `ProtocolRun.status -> CANCELLED` | Aborts SOP run; marks remaining tasks as CANCELLED with reason. |
| **Calendar Item Drawer** | `Ejecutar Disparador` (e.g. T-90) | `ExecuteTrigger` | `TemporalTrigger` + `ProtocolRun` | Fires trigger; spawns SOP run or tasks; records idempotency. |
| **Calendar Item Drawer** | Active Toggle Switch | `ToggleTriggerStatus` | `TemporalTrigger.isActive` | Enables or disables automated firing schedule. |
| **Calendar Item Drawer** | `Editar Partitura` Form Save | `SaveCalendarItem` | `CalendarItem` | Re-persists metadata, dates, and departmental ownership. |
| **Calendar Item Drawer** | `Eliminar Hito` Action | `DeleteCalendarItem` | `CalendarItem` | Deletes item if no active dependent SOP runs exist. |
| **Hermes Panel** | `Aprobar Propuesta` CTA | `ExecuteTrigger` / `UpdateTaskStatus` | `HermesInsight` + Target Entity | Executes proposed action; marks insight as resolved. |
| **Hermes Panel** | `Descartar Recomendación` Button | `useUIStore.dismissInsight()` | `HermesInsight.isDismissed = true` | Hides insight from active advisory feed. |
| **Temporal Radar** | Horizon Selector (`7d`, `14d`, `30d`) | `GetTemporalRadar` | `TemporalTrigger` | Recalculates risk radar and upcoming trigger density. |
| **Temporal Radar** | Snapshot Export CTA | `GenerateWeeklySnapshot` | Domain Summary Policy | Compiles printable executive briefing. |
