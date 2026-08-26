# 03 — Repository Port Contracts & Interfaces

## 1. Hexagonal Port Architecture

In our Hexagonal Architecture, repository interfaces define the **Inward Ports** required by Domain and Application layers. The domain declares *what* data operations it requires; the infrastructure layer provides *how* those operations are realized.

```
                    +-----------------------------+
                    |      Domain Core Entities   |
                    +--------------+--------------+
                                   |
                    +--------------v--------------+
                    |   Repository Port Interfaces|  <-- Inward Ports
                    +--------------+--------------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
+--------v-------------------------+       +-----------------v-------------------------+
| Mock In-Memory Repositories      |       | Supabase / Postgres Adapters              |
| (/src/infrastructure/.../mock)   |       | (/src/infrastructure/.../supabase)        |
+----------------------------------+       +-------------------------------------------+
```

---

## 2. Port Interface Specifications

### 2.1 `ICalendarRepository`
- **Location:** `/src/domain/calendar/repositories/CalendarRepository.ts`

```typescript
export interface CalendarFilterParams {
  search?: string;
  kind?: CalendarItemKind;
  department?: DepartmentCode;
  category?: CategoryFamily;
  status?: CalendarItemStatus;
  fromDate?: string;
  toDate?: string;
  parentCycleId?: string;
}

export interface ICalendarRepository {
  findAll(filter?: CalendarFilterParams): Promise<CalendarItem[]>;
  findById(id: string): Promise<CalendarItem | null>;
  findUpcoming(limit?: number, fromDate?: string): Promise<CalendarItem[]>;
  findSeasonsAndWindows(): Promise<CalendarItem[]>;
  save(item: CalendarItem): Promise<CalendarItem>;
  saveBatch(items: CalendarItem[]): Promise<CalendarItem[]>;
  delete(id: string): Promise<boolean>;
  countByDepartment(status?: CalendarItemStatus): Promise<Record<DepartmentCode, number>>;
}
```

#### Guarantees & Invariants:
- `findAll` returns records ordered ascending by `startAt`.
- `save` operates as an upsert (insert if not existing, update if present).
- `delete` must throw or return `false` if active protocol runs are bound to the item.

---

### 2.2 `ITriggerRepository`
- **Location:** `/src/domain/calendar/repositories/TriggerRepository.ts`

```typescript
export interface TriggerFilterParams {
  calendarItemId?: string;
  department?: DepartmentCode;
  isActive?: boolean;
  isExecuted?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  automationLevel?: AutomationLevel;
}

export interface ITriggerRepository {
  findAll(filter?: TriggerFilterParams): Promise<TemporalTrigger[]>;
  findById(id: string): Promise<TemporalTrigger | null>;
  findByCalendarItemId(calendarItemId: string): Promise<TemporalTrigger[]>;
  findPendingUpcoming(limit?: number, horizonDays?: number): Promise<TemporalTrigger[]>;
  save(trigger: TemporalTrigger): Promise<TemporalTrigger>;
  saveBatch(triggers: TemporalTrigger[]): Promise<TemporalTrigger[]>;
  markExecuted(id: string, executedAt: string): Promise<TemporalTrigger>;
  toggleActive(id: string, isActive: boolean): Promise<TemporalTrigger>;
  deleteByCalendarItemId(calendarItemId: string): Promise<number>;
}
```

#### Guarantees & Invariants:
- `findPendingUpcoming` filters where `isExecuted === false` and `isActive === true`, ordered by `fireAt ASC`.
- `markExecuted` atomically sets `isExecuted = true` and updates `lastExecutedAt`.

---

### 2.3 `IProtocolRunRepository`
- **Location:** `/src/domain/orchestration/repositories/ProtocolRunRepository.ts`

```typescript
export interface ProtocolRunFilterParams {
  status?: ProtocolRunStatus;
  processCode?: string;
  calendarItemId?: string;
  correlationId?: string;
  department?: DepartmentCode;
}

export interface IProtocolRunRepository {
  findAll(filter?: ProtocolRunFilterParams): Promise<ProtocolRun[]>;
  findById(id: string): Promise<ProtocolRun | null>;
  findByCalendarItemId(calendarItemId: string): Promise<ProtocolRun[]>;
  findByCorrelationId(correlationId: string): Promise<ProtocolRun[]>;
  findActiveRuns(): Promise<ProtocolRun[]>;
  save(run: ProtocolRun): Promise<ProtocolRun>;
  updateStatus(id: string, status: ProtocolRunStatus, resultSummary?: string): Promise<ProtocolRun>;
  updateProgress(id: string, overallProgress: number, breakdown: DepartmentProgress[]): Promise<ProtocolRun>;
  getRecommendations(department?: DepartmentCode): Promise<HermesInsight[]>;
  dismissRecommendation(insightId: string): Promise<boolean>;
}
```

#### Guarantees & Invariants:
- `findActiveRuns` returns runs with status in `('PENDING', 'RUNNING', 'BLOCKED', 'AT_RISK')`.
- State transitions must adhere to the ProtocolRun state machine.

---

### 2.4 `ITaskRepository`
- **Location:** `/src/domain/tasks/repositories/TaskRepository.ts`

```typescript
export interface TaskFilterParams {
  status?: TaskStatus;
  department?: DepartmentCode;
  protocolRunId?: string;
  calendarItemId?: string;
  correlationId?: string;
  priority?: PriorityLevel;
  dueBefore?: string;
  search?: string;
}

export interface ITaskRepository {
  findAll(filter?: TaskFilterParams): Promise<InstitutionalTask[]>;
  findById(id: string): Promise<InstitutionalTask | null>;
  findByProtocolRunId(protocolRunId: string): Promise<InstitutionalTask[]>;
  findByCalendarItemId(calendarItemId: string): Promise<InstitutionalTask[]>;
  findDependencies(taskId: string): Promise<TaskDependency[]>;
  findDependents(prerequisiteTaskId: string): Promise<TaskDependency[]>;
  save(task: InstitutionalTask): Promise<InstitutionalTask>;
  saveBatch(tasks: InstitutionalTask[]): Promise<InstitutionalTask[]>;
  saveDependency(dependency: TaskDependency): Promise<TaskDependency>;
  updateStatus(id: string, status: TaskStatus, completedAt?: string): Promise<InstitutionalTask>;
  verifyEvidence(taskId: string, evidenceId: string): Promise<InstitutionalTask>;
  delete(id: string): Promise<boolean>;
}
```

#### Guarantees & Invariants:
- `findDependencies(taskId)` returns all upstream prerequisite tasks.
- `findDependents(prerequisiteTaskId)` returns all downstream tasks waiting on this task.
- `updateStatus` triggers progress recalculation on the parent `ProtocolRun`.

---

### 2.5 `IVenueRepository` & `IScheduleRepository`

```typescript
export interface IVenueRepository {
  findAll(): Promise<Venue[]>;
  findById(id: string): Promise<Venue | null>;
  save(venue: Venue): Promise<Venue>;
}

export interface IScheduleRepository {
  findAllPeriods(): Promise<AcademicPeriod[]>;
  findActivePeriod(): Promise<AcademicPeriod | null>;
  findSchedulesByPeriod(periodId: string): Promise<ClassSchedule[]>;
  saveSchedule(schedule: ClassSchedule): Promise<ClassSchedule>;
  saveScheduleBatch(schedules: ClassSchedule[]): Promise<ClassSchedule[]>;
  publishPeriodSchedules(periodId: string): Promise<number>;
}
```

---

## 3. Mock vs. Supabase Adapter Parity

Both the current in-memory mock adapters and the future Supabase adapters adhere to this strict equivalence:

1. **Pure Entity In/Out:** Repositories always accept and return Domain Entities, never raw database rows.
2. **Deterministic Error Handling:** Non-existent entity lookups return `null`; constraint violations throw domain errors.
3. **Deep Copy Isolation:** Mock repositories return cloned instances to prevent accidental mutations of repository state outside of use cases.
