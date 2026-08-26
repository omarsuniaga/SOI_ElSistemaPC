# 06 — Domain & Integration Event Contracts

## 1. Event-Driven Architecture Overview

State mutations within the SOI engine produce deterministic, strongly-typed **Domain Events**. These events serve three vital functions:
1. Triggering downstream asynchronous reactions across bounded contexts.
2. Auditing institutional actions for regulatory compliance and board reporting.
3. Supplying telemetry feeds to the Hermes AI agent for anomaly and risk detection.

```
+------------------------------------------------------------------------------------+
|                                DOMAIN EVENT ENVELOPE                               |
| {                                                                                  |
|   "eventId": "evt_01J7K9...",                                                      |
|   "eventType": "TaskCompleted",                                                    |
|   "aggregateId": "task-reenroll-1",                                                |
|   "aggregateType": "InstitutionalTask",                                            |
|   "correlationId": "SOI-2026-S2-REENROLLMENT",                                     |
|   "causationId": "cmd_update_task_status_88",                                      |
|   "idempotencyKey": "TASK:task-reenroll-1:STATUS:COMPLETED",                       |
|   "occurredAt": "2026-08-23T14:30:00.000Z",                                        |
|   "actorRole": "DIR",                                                              |
|   "payload": { ... }                                                               |
| }                                                                                  |
+------------------------------------------------------------------------------------+
                                      |
       +------------------------------+------------------------------+
       |                              |                              |
       v                              v                              v
[ Temporal Trigger Engine ]   [ DAG Dependency Resolver ]   [ Hermes Intelligence Feed ]
```

---

## 2. Event Catalog Specification

### 2.1 Calendar Context Events

#### `CalendarItemConfirmed`
- **Trigger:** An event or milestone transitions to `CONFIRMED`.
- **Payload:**
  ```json
  {
    "calendarItemId": "item-xmas-2026",
    "title": "Gran Concierto de Gala Navideña 2026",
    "startAt": "2026-12-15T19:00:00Z",
    "departmentOwner": "EVT",
    "activeTriggersCount": 12
  }
  ```
- **Reaction:** Arms all associated temporal triggers (`T-90`, `T-60`, `T-7`, etc.) in the temporal scheduler queue.

#### `CalendarItemRescheduled`
- **Trigger:** `startAt` or `endAt` is modified.
- **Reaction:** Recalculates `fireAt` for all relative triggers (`fireAt = newStartAt + offset`).

#### `CalendarItemCancelled`
- **Trigger:** Item cancelled by `DIR`.
- **Reaction:** Cancels all active pending triggers and aborts any active `ProtocolRun`.

---

### 2.2 Orchestration Context Events

#### `TemporalTriggerFired`
- **Payload:**
  ```json
  {
    "triggerId": "trig-xmas-t90",
    "calendarItemId": "item-xmas-2026",
    "label": "T-90",
    "actionType": "SPAWN_PROTOCOL_RUN",
    "protocolCode": "ACM-PXX",
    "automationLevel": "AUTO"
  }
  ```
- **Reaction:** Initiates target protocol run or creates linked institutional task.

#### `ProtocolRunInitiated`
- **Payload:**
  ```json
  {
    "protocolRunId": "run-adm-p01-2026-s2",
    "processCode": "ADM-P01",
    "correlationId": "SOI-2026-S2-REENROLLMENT",
    "ownerRole": "Registrador General",
    "initialTasksCount": 8
  }
  ```

#### `ProtocolRunProgressUpdated`
- **Payload:**
  ```json
  {
    "protocolRunId": "run-adm-p01-2026-s2",
    "previousProgress": 75,
    "newProgress": 88,
    "remainingBlockedTasks": 1
  }
  ```

---

### 2.3 Task Context Events

#### `TaskStatusChanged`
- **Payload:**
  ```json
  {
    "taskId": "task-reenroll-2",
    "protocolRunId": "run-adm-p01-2026-s2",
    "previousStatus": "IN_PROGRESS",
    "newStatus": "COMPLETED",
    "evidenceFulfilled": true
  }
  ```
- **Reaction:** Invokes DAG unblocking engine (`onTaskCompleted`) and recalculates parent run progress.

#### `TaskUnblocked`
- **Payload:**
  ```json
  {
    "taskId": "task-reenroll-3",
    "prerequisiteTaskId": "task-reenroll-2",
    "newStatus": "PENDING"
  }
  ```
- **Reaction:** Dispatches operational notification to the assigned department owner.

#### `TaskEscalated`
- **Payload:**
  ```json
  {
    "taskId": "task-xmas-transport",
    "priority": "CRITICAL",
    "reason": "Proveedor de transporte requiere confirmación de ruta en 24h",
    "escalatedByRole": "EVT"
  }
  ```
- **Reaction:** Spawns urgent `HermesInsight` alert for `DIR`.

---

## 3. Idempotency Key Specification

To guarantee at-most-once execution in distributed worker and trigger environments:

| Event / Action Type | Idempotency Key Format | Example |
| :--- | :--- | :--- |
| **Relative Trigger Firing** | `TRIG:{triggerId}:ANCHOR:{startAtISO}` | `TRIG:trig-xmas-t90:ANCHOR:2026-12-15T19:00:00Z` |
| **Protocol Instantiation** | `PROTO:{processCode}:CAL:{calendarItemId}` | `PROTO:ADM-P01:CAL:item-reenrollment-aug-2026` |
| **Task Status Change** | `TASK:{taskId}:STATUS:{targetStatus}:REV:{version}` | `TASK:task-reenroll-1:STATUS:COMPLETED:REV:2` |
| **Hermes Action Execution** | `HERMES:{insightId}:ACT:{actionType}` | `HERMES:ins-002:ACT:TRIGGER_WORKFLOW` |

---

## 4. Delivery Semantics & Event Store Table
```sql
CREATE TABLE domain_events (
  id VARCHAR(64) PRIMARY KEY,
  event_type VARCHAR(128) NOT NULL,
  aggregate_id VARCHAR(64) NOT NULL,
  aggregate_type VARCHAR(64) NOT NULL,
  correlation_id VARCHAR(128) NOT NULL,
  causation_id VARCHAR(64),
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  actor_role VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_correlation ON domain_events(correlation_id);
CREATE INDEX idx_events_occurred_at ON domain_events(occurred_at);
```
