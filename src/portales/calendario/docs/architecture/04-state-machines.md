# 04 — State Machines & DAG Dependency Engine

## 1. Overview of Core State Machines

Every entity with lifecycle states is governed by a deterministic finite state machine (FSM). Direct arbitrary state mutations are prohibited; all transitions must pass domain guard predicates.

```
                    +------------------------------------------+
                    |           CALENDAR ITEM LIFECYCLE        |
                    +--------------------+---------------------+
                                         |
                       [ DRAFT ] --------+ (Approve Planning)
                          |
                          v
                      [ PLANNED ] -------+ (Lock logistics/date)
                          |
                          v
                     [ CONFIRMED ] <-----+ (Triggers Active & Armable)
                          |
                          v (startAt reached)
                      [ ACTIVE ]
                          |
                          v (endAt reached)
                      [ CLOSING ] -------+ (T+ offset tasks active)
                          |
                          v (All post-event tasks verified)
                      [ CLOSED ]

              (From any pre-CLOSED state via DIR authority -> [ CANCELLED ])
```

---

## 2. State Machine Definitions

### 2.1 `CalendarItem` State Machine

| From State | Allowed To State | Trigger / Action | Guard Condition |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `PLANNED` | Submit for cycle planning | Title, Kind, Category, and preliminary dates provided. |
| `DRAFT` | `CANCELLED` | Discard draft | Caller has department or DIR authority. |
| `PLANNED` | `CONFIRMED` | Executive confirmation | Venue verified, department owner assigned, dates locked. |
| `PLANNED` | `CANCELLED` | Cancel planned item | Caller has DIR authority. |
| `CONFIRMED` | `ACTIVE` | Start time reached (`now >= startAt`) | `startAt <= now < endAt`. Operational triggers active. |
| `CONFIRMED` | `CANCELLED` | Executive cancellation | Requires explicit confirmation and reason log. |
| `ACTIVE` | `CLOSING` | End time reached (`now >= endAt`) | Event duration elapsed; post-event wrap-up begins. |
| `CLOSING` | `CLOSED` | Archive & finalize | All associated post-event triggers and tasks `COMPLETED`. |
| `CLOSED` | *None* | Terminal state | Immutable history archive. |

---

### 2.2 `InstitutionalTask` State Machine & Evidence Guards

```
   [ BLOCKED ] ──(All dependencies COMPLETED)──> [ PENDING ]
                                                     │
                                                     ▼ (Claim / Start)
   [ WAITING_APPROVAL ] <──(Submit Evidence)── [ IN_PROGRESS ]
           │
           ├──(Evidence Approved)──> [ COMPLETED ] (Terminal Success)
           └──(Evidence Rejected)──> [ IN_PROGRESS ]

   (From any active state via Cancellation -> [ CANCELLED ])
```

| From State | Allowed To State | Required Authority | Guard Predicates |
| :--- | :--- | :--- | :--- |
| `BLOCKED` | `PENDING` | System / Engine | Evaluated automatically when all `BLOCKING` prerequisite tasks enter `COMPLETED`. |
| `PENDING` | `IN_PROGRESS` | Assigned Role / Jefatura | No unresolved blocking dependencies. |
| `IN_PROGRESS` | `WAITING_APPROVAL` | Assigned Role | If `evidenceRequired === true`, at least 1 evidence item uploaded. |
| `IN_PROGRESS` | `COMPLETED` | Assigned Role / Jefatura | Allowed only if `evidenceRequired === false`. |
| `WAITING_APPROVAL` | `COMPLETED` | Department Head / `DIR` | `isEvidenceFulfilled === true` (all required evidence verified). |
| `WAITING_APPROVAL` | `IN_PROGRESS` | Department Head | Evidence rejected with correction feedback notes. |
| `*` (any) | `CANCELLED` | Protocol Owner / `DIR` | Associated `ProtocolRun` cancelled or manual cancellation. |

---

### 2.3 `ProtocolRun` State Machine

| From State | Allowed To State | Guard Condition |
| :--- | :--- | :--- |
| `PENDING` | `RUNNING` | Initiation trigger fired or manual `StartProtocolRun` executed. Initial tasks created. |
| `RUNNING` | `BLOCKED` | One or more critical-path tasks are blocked or awaiting external prerequisite. |
| `RUNNING` | `AT_RISK` | One or more active tasks have passed `dueAt` (`isOverdue === true`). |
| `BLOCKED` | `RUNNING` | Prerequisite unblocked; active tasks resume progress. |
| `AT_RISK` | `RUNNING` | Overdue task completed or timeline formally extended. |
| `RUNNING` | `COMPLETED` | 100% of child tasks are `COMPLETED` and evidence verified. |
| `*` (non-terminal)| `CANCELLED` | Explicit cancellation command (`CancelProtocolRun`). Non-completed child tasks cascade to `CANCELLED`. |
| `*` (non-terminal)| `FAILED` | Unrecoverable deadline miss or regulatory failure. |

---

## 3. Task Directed Acyclic Graph (DAG) Resolution

### 3.1 Graph Representation
Tasks inside a `ProtocolRun` are nodes in a DAG. Edges represent dependencies:

$$ParentTask \xrightarrow{BLOCKING} ChildTask$$

### 3.2 Unblocking Algorithm

When a task $T_{parent}$ transitions to `COMPLETED`:

```typescript
async function onTaskCompleted(completedTaskId: string, taskRepo: ITaskRepository): Promise<string[]> {
  const unblockedTaskIds: string[] = [];
  
  // 1. Find all downstream dependencies where completedTaskId is the prerequisite
  const dependentEdges = await taskRepo.findDependents(completedTaskId);
  
  for (const edge of dependentEdges) {
    if (edge.dependencyType !== 'BLOCKING') continue;
    
    const childTask = await taskRepo.findById(edge.taskId);
    if (!childTask || childTask.status !== 'BLOCKED') continue;
    
    // 2. Check all prerequisites of childTask
    const allPrereqEdges = await taskRepo.findDependencies(childTask.id);
    const blockingPrereqEdges = allPrereqEdges.filter(e => e.dependencyType === 'BLOCKING');
    
    let allPrereqsCompleted = true;
    for (const prereq of blockingPrereqEdges) {
      const prereqTask = await taskRepo.findById(prereq.dependsOnTaskId);
      if (!prereqTask || prereqTask.status !== 'COMPLETED') {
        allPrereqsCompleted = false;
        break;
      }
    }
    
    // 3. If every blocking parent is COMPLETED, promote child to PENDING
    if (allPrereqsCompleted) {
      await taskRepo.updateStatus(childTask.id, 'PENDING');
      unblockedTaskIds.push(childTask.id);
    }
  }
  
  return unblockedTaskIds;
}
```

### 3.3 Cycle Prevention Guard
Before saving any `TaskDependency`, a Depth-First Search (DFS) cycle check is executed:
- If a path exists from `taskId` to `dependsOnTaskId`, adding the edge would introduce a directed cycle.
- The operation is immediately aborted with a `CyclicDependencyException`.
