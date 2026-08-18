# Delta Spec: SOI Event Spine

## ADDED Requirements

### Requirement: Immutable Event Ledger Table

The system MUST create a new `soi_eventos` table with exactly 7 columns:
- `id` (UUID, PRIMARY KEY)
- `tipo` (TEXT, enum of event types)
- `entidad_tipo` (TEXT, source table name: sesiones_clase | asistencias | tareas_institucionales | justificaciones | periodos)
- `entidad_id` (UUID, foreign key to entity)
- `payload` (JSONB, event-specific data)
- `correlation_id` (UUID, nullable, for causality chains)
- `procesado` (BOOLEAN, DEFAULT false, for Phase 2 enrichment)
- `created_at` (TIMESTAMPTZ, DEFAULT now())

Table MUST be immutable: no UPDATE or DELETE allowed via row-level security. All mutations are INSERT-only.

#### Scenario: Table schema created with all columns

- GIVEN the migration script runs
- WHEN soi_eventos table is created
- THEN all 7 columns exist with correct types and constraints
- AND id is UUID PRIMARY KEY
- AND created_at defaults to current timestamp

#### Scenario: Immutability enforced

- GIVEN soi_eventos table exists
- WHEN a user attempts UPDATE or DELETE on any row
- THEN the operation fails with RLS violation
- AND the row remains unchanged

### Requirement: Event Type Taxonomy

The system MUST support the following event types in the `tipo` enum:

**Sesiones Clase (3 types):**
- `sesion.creada` — when a new session is inserted
- `sesion.completada` — when session status changes to "completada"
- `sesion.cancelada` — when session status changes to "cancelada"

**Asistencias (3 types):**
- `asistencia.registrada` — when attendance record is inserted
- `asistencia.falta_injustificada` — when asistencia estado changes to "falta_injustificada"
- `asistencia.falta_justificada` — when asistencia estado changes to "falta_justificada" (correlation_id links to justificacion event)

**Tareas Institucionales (4 types):**
- `tarea.creada` — when new task is inserted
- `tarea.completada` — when tarea estado changes to "completada"
- `tarea.escalada` — when tarea estado changes to "escalada"
- `tarea.vencida` — when tarea estado changes to "vencida"

**Justificaciones (3 types):**
- `justificacion.solicitada` — when new justificacion record is inserted
- `justificacion.aprobada` — when justificacion estado changes to "aprobada"
- `justificacion.rechazada` — when justificacion estado changes to "rechazada"

**Periodos (2 types):**
- `periodo.abierto` — when periodo is created
- `periodo.cerrado` — when periodo cerrado changes from false to true

#### Scenario: All event types are recognized

- GIVEN a trigger fires for any of the 15 event types
- WHEN the event is logged
- THEN tipo column matches one of the defined 15 types
- AND no invalid tipos are stored

### Requirement: Automated Trigger Instrumentation

The system MUST fire triggers on INSERT or UPDATE to the following 5 core tables:

| Table | Triggers | Action |
|-------|----------|--------|
| sesiones_clase | 3 (creada, completada, cancelada) | Log to soi_eventos on INSERT (creada) and on status changes (completada/cancelada) |
| asistencias | 3 (registrada, falta_injustificada, falta_justificada) | Log on INSERT (registrada) and on estado changes |
| tareas_institucionales | 4 (creada, completada, escalada, vencida) | Log on INSERT (creada) and on estado changes |
| justificaciones | 3 (solicitada, aprobada, rechazada) | Log on INSERT (solicitada) and on estado changes |
| periodos | 2 (abierto, cerrado) | Log on INSERT (abierto) and when cerrado changes from false to true |

Each trigger MUST:
1. Fire synchronously within the same transaction as the source DML
2. Capture actor_id from current_user_id (or auth context)
3. Populate payload with all relevant fields from the source row
4. Set entidad_tipo to the source table name
5. Set entidad_id to the primary key of the source entity
6. Log exactly one row per event to soi_eventos
7. NOT block or fail the source transaction if logging fails (logging is fire-and-forget)

#### Scenario: New session fires sesion.creada

- GIVEN a new row is inserted into sesiones_clase
- WHEN the insert trigger executes
- THEN exactly one row is logged to soi_eventos with tipo='sesion.creada'
- AND entidad_id matches the session's id
- AND payload contains session metadata (maestro_id, salon_id, etc.)

#### Scenario: Session status change fires appropriate event

- GIVEN an existing session with estado='activa'
- WHEN estado is updated to 'completada'
- THEN the update trigger executes
- AND exactly one row is logged with tipo='sesion.completada'
- AND no duplicate sesion.creada event is fired

#### Scenario: Batch attendance inserts all logged

- GIVEN 50 asistencia rows are inserted in a single batch operation
- WHEN the batch completes
- THEN exactly 50 asistencia.registrada events are logged to soi_eventos
- AND all events have the same created_at timestamp (within 100ms)
- AND no events are lost or duplicated

#### Scenario: Task escalation captures metadata

- GIVEN a task with estado='pendiente'
- WHEN estado is updated to 'escalada' with urgencia='alta'
- THEN tarea.escalada event is logged
- AND payload includes urgencia, escalada_a (department), escalada_razon
- AND entidad_id points to the task

### Requirement: Correlation ID for Event Causality

The system MUST populate correlation_id to link related events. The correlation_id:

- MUST be a UUID (v7 preferred for causality ordering)
- MUST be NULL by default
- MUST be populated when Phase 1 logic detects causality (e.g., justificacion event linked to prior asistencia)
- MUST be user-settable via RPC override for complex workflows (Phase 2)
- MUST NOT be updated after insertion (immutability via RLS)

#### Scenario: Justified absence chains to original absence event

- GIVEN an asistencia record with estado='falta_injustificada' and existing evento_id=UUID_A
- WHEN a justificacion is created referencing this asistencia
- WHEN the justificacion.aprobada event is logged
- THEN correlation_id is set to UUID_A
- AND both asistencia.falta_injustificada and justificacion.aprobada share the same correlation_id
- AND querying "SELECT * FROM soi_eventos WHERE correlation_id=UUID_A" returns both events in causality order

### Requirement: Row-Level Security (RLS) on soi_eventos

The system MUST enforce strict department-scoped RLS:

| Role/Department | Can Read | Cannot Read |
|---|---|---|
| ACM (Academic) | Events from sesiones_clase, asistencias, periodos | Events from tareas_institucionales (unless they assigned the task), justificaciones |
| ADM (Admin) | All administrative events (justificaciones, periodo closures) | Academic events (unless escalated to them) |
| FIN (Finance) | No events (logging only, Phase 2 decides finance events) | All events |
| DIR (Executive) | All events across all departments | (none) |
| TECNICO (IT) | No access | All events |

- MUST NOT allow cross-department visibility without explicit escalation
- MUST NOT allow users to update their own department visibility filter
- MUST log RLS policy enforcement for audit

#### Scenario: ACM user queries timeline for a student

- GIVEN a user with role='ACM'
- WHEN they query "SELECT * FROM soi_eventos WHERE entity_id=<student_id>"
- THEN only events with entidad_tipo IN ('asistencias', 'sesiones_clase', 'periodos') are returned
- AND events with entidad_tipo='tareas_institucionales' or 'justificaciones' are hidden
- AND no errors are raised

#### Scenario: DIR user queries all events

- GIVEN a user with role='DIR'
- WHEN they query "SELECT * FROM soi_eventos WHERE entidad_tipo='asistencias'"
- THEN all asistencia events are returned regardless of department assignment
- AND no RLS filtering is applied

#### Scenario: Unauthorized access attempt blocked

- GIVEN a user with role='TECNICO'
- WHEN they attempt SELECT on soi_eventos
- THEN zero rows are returned (not an error, but empty result set)

### Requirement: Timeline Query Performance

The system MUST support efficient timeline queries:

**Index Strategy:**
- Create composite index on (entidad_tipo, entidad_id, created_at DESC)
- Create index on (correlation_id) for causality chains
- Create index on (procesado, created_at) for Phase 2 enrichment polling

**Performance SLA:**
- MUST return 100 events for a single entity (entidad_id) in < 200ms (P99)
- MUST return all events with a given correlation_id in < 150ms (P99)
- MUST support paginated queries (LIMIT 50 OFFSET) with no performance regression

#### Scenario: Timeline query under SLA

- GIVEN a student with 500 events logged over a semester
- WHEN querying "SELECT * FROM soi_eventos WHERE entidad_id=<student_id> ORDER BY created_at DESC LIMIT 100"
- THEN results return in < 200ms
- AND results are in reverse-chronological order
- AND no sequential table scan is used

#### Scenario: Correlation chain query

- GIVEN 15 events with correlation_id=UUID_A
- WHEN querying "SELECT * FROM soi_eventos WHERE correlation_id=UUID_A ORDER BY created_at"
- THEN all 15 events are returned in < 150ms
- AND causality order is preserved (timestamp ascending)

### Requirement: Trigger Performance and Reliability

The system MUST ensure triggers are performant and non-blocking:

- MUST add < 50ms P99 latency to the source transaction (sesion insert, asistencia update, etc.)
- MUST NOT cause deadlocks on soi_eventos
- MUST be SECURITY DEFINER (execute with table owner privileges, not user role)
- MUST implement batch write optimization for high-volume tables (asistencias: 10k+/day)
- MUST log trigger errors asynchronously (not fail the source transaction)

#### Scenario: Session insert under P99 latency budget

- GIVEN 100 concurrent session inserts
- WHEN triggers execute
- THEN P99 latency for a single insert is < 50ms (measured end-to-end from BEGIN to COMMIT)
- AND no transactions are rolled back due to trigger errors
- AND all 100 events are logged

#### Scenario: High-volume asistencia batch without deadlock

- GIVEN 500 asistencia records inserted in a single batch
- WHEN the trigger executes for each row
- THEN no deadlock occurs on soi_eventos
- AND all 500 events are logged atomically
- AND batch latency is < 2 seconds total

### Requirement: Phase 1 Logging-Only Behavior

The system MUST NOT perform any side effects during Phase 1:

- Triggers MUST log to soi_eventos only
- Triggers MUST NOT trigger additional updates to other tables (e.g., no auto-escalation)
- Triggers MUST NOT send notifications, emails, or webhooks
- Triggers MUST NOT call Edge Functions
- The `procesado` field MUST remain false; enrichment is deferred to Phase 2

#### Scenario: Event is logged but no side effects occur

- GIVEN an asistencia is marked falta_injustificada
- WHEN the trigger fires
- THEN asistencia.falta_injustificada is logged to soi_eventos
- AND no notification email is sent (Phase 2 handles notifications)
- AND no task is auto-created (Phase 2 handles task generation)
- AND procesado remains false

### Requirement: Payload Structure by Event Type

The system MUST store event-specific metadata in payload (JSONB):

| Event Type | Required Payload Fields |
|---|---|
| sesion.creada | maestro_id, salon_id, fecha, hora_inicio, hora_fin, cantidad_alumnos |
| sesion.completada | anterior_estado, nuevo_estado, timestamp_cambio |
| asistencia.registrada | alumno_id, sesion_id, presente, retraso_minutos |
| asistencia.falta_injustificada | alumno_id, sesion_id, maestro_id, razon_ausencia |
| tarea.creada | titulo, asignado_a (department), prioridad, fecha_vencimiento |
| tarea.escalada | anterior_estado, nuevo_estado, escalada_a, urgencia, razon |
| justificacion.solicitada | alumno_id, asistencia_id, razon_solicitada, documentos_url |
| justificacion.aprobada | alumno_id, asistencia_id, aprobado_por (actor_id), notas_aprobacion |

#### Scenario: Payload is complete and parseable

- GIVEN a sesion.creada event is logged
- WHEN the payload is extracted
- THEN JSON.parse(payload) succeeds
- AND all required fields are present
- AND data types match the source table (e.g., maestro_id is UUID)

### Requirement: Integration Test Coverage

The system MUST include integration tests verifying:

- [ ] AC-01: Table schema created with correct columns and constraints
- [ ] AC-02: All 4 triggers fire on correct source tables and events
- [ ] AC-03: Payload JSONB contains all required fields per event type
- [ ] AC-04: RLS policy enforces department boundaries
- [ ] AC-05: correlation_id is populated for linked events
- [ ] AC-06: Trigger adds < 50ms P99 latency
- [ ] AC-07: Timeline query returns 100 events in < 200ms
- [ ] AC-08: Integration tests pass (1 per trigger minimum, 15 total scenarios)
- [ ] AC-09: `procesado` defaults to false, immutable
- [ ] AC-10: Events are immutable (no UPDATE/DELETE allowed)

#### Scenario: Test suite runs and passes

- GIVEN the integration test suite is executed
- WHEN all 15 test scenarios run
- THEN all tests pass (0 failures)
- AND coverage includes happy path, edge cases, and error conditions
- AND each trigger is tested independently
- AND no data corruption is detected in soi_eventos

---

## Out of Scope

The following are explicitly NOT included in Phase 1:

- **Event Enrichment (Phase 2)**: Foreign key joins, async context fetching, denormalized user/department names in events
- **Event-Driven Workflows (Phase 3)**: Edge Function subscriptions, pg_cron replacement, reactive task generation
- **UI Dashboards**: Event timeline UI, filtering, searching, export (separate change)
- **Historical Backfill**: Backfilling events for data created before deployment (Phase 3 only)
- **Priority 2 Tables**: maestros, alumnos, observaciones_sesion, solicitudes_permisos (Phase 2 roadmap)
- **Notification Generation**: Email, SMS, in-app notifications (Phase 2/3)
- **Performance Optimization**: Event archival, time-based partitioning, compression (post-MVP)

---

## Acceptance Criteria Summary

| ID | Criteria | Status |
|---|---|---|
| AC-01 | Table schema with 7 columns, correct types, constraints | Required |
| AC-02 | All 4 triggers fire on INSERT/UPDATE to correct tables | Required |
| AC-03 | Payload JSONB contains required fields per event type | Required |
| AC-04 | RLS enforces department boundaries (ACM, ADM, DIR visibility) | Required |
| AC-05 | correlation_id populated for linked events (e.g., absence → justification) | Required |
| AC-06 | Trigger P99 latency < 50ms (per transaction) | Required |
| AC-07 | Timeline query (100 events) < 200ms P99 | Required |
| AC-08 | Integration test suite passes (15 scenarios, all triggers) | Required |
| AC-09 | procesado defaults false, immutable | Required |
| AC-10 | Events immutable (no UPDATE/DELETE via RLS) | Required |

