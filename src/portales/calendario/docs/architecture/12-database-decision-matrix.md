# 12 — Database Decision Matrix: Table-by-Table Technical Audit

**Architecture Status:**
```text
ARCHITECTURE FREEZE v1.0
DOMAIN/APPLICATION RECONCILED
PHYSICAL DATABASE RECONCILIATION PENDING FINAL TABLE VERIFICATION
```

## 1. Matrix Overview & Authoritative Audit

This technical decision matrix reconciles the frozen SOI Domain Architecture with the production Supabase/PostgreSQL database.

### Decision Taxonomy
- **`REUSE`**: Existing physical table satisfies the requirement without structural modification.
- **`EXTEND`**: Existing physical table is semantically correct but requires additive columns, foreign keys, or indexes (pending physical DDL verification).
- **`MAP`**: Physical table is adapted via Infrastructure Data Mappers / unified Domain projections.
- **`CREATE`**: New physical table required (no adequate existing structure in production).
- **`REVIEW — EXISTING TABLE`**: Table confirmed to exist in production; awaiting full physical DDL inspection before final classification.
- **`DEPRECATE — NO DROP AUTHORIZED`**: Legacy or duplicate object; do NOT introduce new dependencies, but strictly NO DROP / physical deletion authorized.

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

## 3. Table-by-Table Technical Decision Log

### 3.1 Calendar & Temporal Engine

```text
TABLE: calendario_institucional
CURRENT PURPOSE: Confirmed to exist in production database.
FROZEN DOMAIN RELATIONSHIP: Primary physical candidate for CalendarItem entity (Direct master institutional events, galas, seasons, institutional windows, and governance blockouts).
DECISION: REVIEW — EXISTING TABLE
STATUS: Full physical definition required (inspect actual columns, constraints, triggers, RLS).
ACTION: Do not design replacement table or CREATE DDL. Determine later whether REUSE, EXTEND, or MAP.
NOTES: Leading candidate for Canonical Calendar Anchor SSOT.
```

```text
TABLE: calendario
CURRENT PURPOSE: Confirmed to exist in production database (legacy calendar).
FROZEN DOMAIN RELATIONSHIP: Legacy calendar representation.
DECISION: DEPRECATE — NO DROP AUTHORIZED
STATUS: Do not introduce new dependencies. No physical deletion or DROP is authorized.
NOTES: Preserved until usage and data migration are fully audited.
```

```text
TABLE: calendar_triggers
CURRENT PURPOSE: Not present in physical schema.
FROZEN DOMAIN RELATIONSHIP: Backing store for TemporalTrigger entity (T-90, T-7, T0, relative/absolute temporal offsets).
DECISION: CREATE
FIELDS REUSED: N/A
FIELDS TO CREATE: id (varchar), calendar_item_id (varchar/uuid), type (varchar), offset_value (integer), offset_unit (varchar), label (varchar), fire_at (timestamptz), condition (jsonb), protocol_code (varchar), action_type (varchar), requires_approval (boolean), automation_level (varchar), department (varchar), owner_role (varchar), description (text), is_active (boolean), last_executed_at (timestamptz), is_executed (boolean), created_at (timestamptz)
MIGRATION RISK: NONE (Purely additive table).
NOTES: Critical foundation for proactive institutional orchestration.
```

```text
TABLE: trigger_executions
CURRENT PURPOSE: Not present in physical schema.
FROZEN DOMAIN RELATIONSHIP: Immutable execution log and idempotency guard for TemporalTrigger firings.
DECISION: CREATE
FIELDS REUSED: N/A (Distinct from notification_trigger_logs which is specific to notification delivery).
FIELDS TO CREATE: id (varchar), trigger_id (varchar), scheduled_for (timestamptz), executed_at (timestamptz), status (varchar), protocol_run_id (varchar), spawned_task_id (varchar), idempotency_key (varchar UNIQUE), retry_count (integer), error_message (text), executed_by_role (varchar)
MIGRATION RISK: NONE (Purely additive table).
NOTES: Guarantees at-most-once execution across distributed background workers.
```

---

### 3.2 Academic, Venues & Timetable Context

```text
TABLE: periodos
CURRENT PURPOSE: Master academic periods and semesters in real DB.
FROZEN DOMAIN RELATIONSHIP: Backing store for AcademicPeriod entity and macro SEASON projections in Calendar.
DECISION: REUSE
FIELDS REUSED: id (uuid), nombre (text), fecha_inicio (date), fecha_fin (date), activo (boolean), cerrado (boolean), cerrado_at (timestamptz), cerrado_por (uuid), observaciones_cierre (text)
FIELDS MISSING: None for core domain; mapped 1:1 to AcademicPeriod.
FIELDS TO AVOID: Duplicating periods as manual rows in calendario_institucional.
MIGRATION RISK: LOW.
NOTES: Domain Calendar mapper projects periodos as macro SEASON items in the calendar view.
```

```text
TABLE: salones
CURRENT PURPOSE: Physical classrooms, rehearsal halls, and performance spaces in real DB.
FROZEN DOMAIN RELATIONSHIP: Backing store for Venue aggregate.
DECISION: REUSE / MAP
FIELDS REUSED: id (uuid), nombre (text), ubicacion (text), descripcion (text), capacidad (integer), codigo_salon (text), piso (integer), condicion_fisica (text), equipamiento (jsonb), responsable_id (uuid FK to maestros), activo (boolean), is_active (boolean)
FIELDS MISSING: None (rich metadata already exists in equipamiento jsonb and condicion_fisica).
FIELDS TO AVOID: Creating a duplicate venues table.
MIGRATION RISK: LOW.
NOTES: Mapped directly to Venue domain entity.
```

```text
TABLE: horarios
CURRENT PURPOSE: Structural class schedule allocations with integer dia_semana (1-7) and strict FKs.
FROZEN DOMAIN RELATIONSHIP: Primary physical candidate for ClassSchedule aggregate.
DECISION: REUSE / MAP (Provisional Primary Candidate)
FIELDS REUSED: id (uuid), clase_id (uuid FK to clases), maestro_id (uuid FK to maestros), salon_id (uuid FK to salones), dia_semana (integer 1-7), hora_inicio (time), hora_fin (time), activo (boolean)
FIELDS MISSING: Joined dynamically with clases, salones, and maestros for domain hydration.
MIGRATION RISK: LOW.
NOTES: Provisional decision. Do not deprecate or migrate until actual application usage is audited.
```

```text
TABLE: clase_horarios
CURRENT PURPOSE: Secondary class schedule table using text dia ('lunes'..'domingo').
FROZEN DOMAIN RELATIONSHIP: Compatibility schedule source.
DECISION: MAP (Compatibility Source)
FIELDS REUSED: id, clase_id, dia, hora_inicio, hora_fin, salon_id, maestro_id
MIGRATION RISK: LOW.
NOTES: Mapped seamlessly via adapter. No deprecation or migration until usage audited.
```

```text
TABLE: sesiones_clase & class_events
CURRENT PURPOSE: Specific dated class session instances with attendance, contents, and teacher notes.
FROZEN DOMAIN RELATIONSHIP: Projected into Calendar as real-time daily academic events.
DECISION: REUSE / MAP
FIELDS REUSED: id, clase_id, horario_id, maestro_id, salon_id, fecha, hora_inicio, hora_fin, tema_principal, estado, observacion_generales
FIELDS MISSING: None.
FIELDS TO AVOID: Duplicating individual class occurrences into central calendar.
MIGRATION RISK: LOW.
NOTES: Projected dynamically when querying Calendar for a specific week/day.
```

```text
TABLE: maestros & profiles
CURRENT PURPOSE: Faculty records and institutional user authentication profiles.
FROZEN DOMAIN RELATIONSHIP: Human actor directory and assignment references for tasks and events.
DECISION: REUSE
FIELDS REUSED: profiles.id, profiles.email, profiles.nombre_completo, profiles.rol, profiles.activo, maestros.id, maestros.user_id, maestros.especialidad, maestros.disponibilidad
FIELDS MISSING: N/A.
FIELDS TO AVOID: Hardcoding user IDs into domain business logic.
MIGRATION RISK: LOW.
NOTES: Integrated via Identity and Role adapters.
```

---

### 3.3 Tasks, Dependencies & Evidence Context

```text
TABLE: tareas_institucionales
CURRENT PURPOSE: Confirmed to exist in production database.
FROZEN DOMAIN RELATIONSHIP: Leading physical candidate for InstitutionalTask entity.
DECISION: REVIEW — EXISTING TABLE
STATUS: Full physical definition required. Compare real fields against (protocol_run_id, calendar_item_id, correlation_id, due_at, started_at, completed_at, evidence_required, automation_level).
ACTION: Do NOT create another institutional task table.
NOTES: Designated as Canonical Task SSOT.
```

```text
TABLE: tareas_calendario, tareas_portales, tarea_historial, tarea_comentarios
CURRENT PURPOSE: Confirmed to exist in production database.
FROZEN DOMAIN RELATIONSHIP: Supporting task views, portal views, audit history, and collaboration comments.
DECISION: REVIEW — EXISTING TABLE
STATUS: Full physical definition required. (tareas_calendario candidate for DEPRECATE — NO DROP; tareas_portales candidate for MAP; tarea_historial/comentarios candidate for REUSE).
```

```text
TABLE: maestro_tareas & homework_assignments
CURRENT PURPOSE: Specialized teacher-to-student pedagogical homework assignments.
FROZEN DOMAIN RELATIONSHIP: Specialized pedagogical sub-task.
DECISION: REUSE (Pedagogical Domain)
FIELDS REUSED: id, maestro_id, alumno_id, sesion_id, tarea, fecha_recordatorio, completada
FIELDS MISSING: N/A.
FIELDS TO AVOID: Overloading with cross-department institutional tasks.
MIGRATION RISK: NONE.
NOTES: Preserved strictly for teacher-student homework workflows.
```

```text
TABLE: task_dependencies
CURRENT PURPOSE: Not present in physical schema.
FROZEN DOMAIN RELATIONSHIP: Directed Acyclic Graph (DAG) edge model for InstitutionalTask prerequisites.
DECISION: CREATE
FIELDS REUSED: N/A
FIELDS TO CREATE: id (varchar), task_id (varchar), depends_on_task_id (varchar), dependency_type (varchar), description (text), created_at (timestamptz)
MIGRATION RISK: NONE.
NOTES: Enables cross-department workflow cascades and automatic unblocking.
```

```text
TABLE: task_evidence
CURRENT PURPOSE: Proof verification model for institutional task sign-off.
FROZEN DOMAIN RELATIONSHIP: Documentary and verification proof records.
DECISION: REVIEW
STATUS: Review if existing audit or attachment structures can satisfy requirement before creating new table.
```

---

### 3.4 SOP Processes & Hermes Context

```text
TABLE: soi_process_contracts
CURRENT PURPOSE: Confirmed to exist in production database.
FROZEN DOMAIN RELATIONSHIP: Leading physical candidate for Process Definitions (SOP blueprints like ADM-P01, EVT-P02).
DECISION: REVIEW — EXISTING TABLE
STATUS: Full physical definition required.
ACTION: Do not create duplicate process-definition table.
NOTES: Process Definition SSOT.
```

```text
TABLE: hermes_process_cases
CURRENT PURPOSE: Confirmed to exist in production database.
FROZEN DOMAIN RELATIONSHIP: Leading physical candidate for ProtocolRun entity (instantiated SOP execution).
DECISION: REVIEW — EXISTING TABLE
STATUS: Full physical definition required.
ACTION: Do not create duplicate protocol_runs table.
NOTES: ProtocolRun Execution SSOT.
```

```text
TABLE: protocolos & hermes_protocolos
CURRENT PURPOSE: Confirmed to exist in production database (legacy protocol definitions).
FROZEN DOMAIN RELATIONSHIP: Legacy protocol blueprints.
DECISION: DEPRECATE — NO DROP AUTHORIZED
STATUS: Review live definitions to confirm full migration into soi_process_contracts. No drop authorized.
```

```text
TABLE: hermes_acciones, hermes_evaluaciones, hermes_notificaciones, hermes_reactive_rules
CURRENT PURPOSE: Confirmed to exist in production database.
FROZEN DOMAIN RELATIONSHIP: Hermes rule execution, evaluation, and action telemetry.
DECISION: REVIEW — EXISTING TABLE
STATUS: Full physical definition required.
```

```text
TABLE: schedule_runs & schedule_run_feedback
CURRENT PURPOSE: Academic schedule optimization engine execution history and user feedback logs in real DB.
FROZEN DOMAIN RELATIONSHIP: Specialized execution history for academic timetable generation algorithms.
DECISION: REUSE
FIELDS REUSED: id (uuid), periodo (text), config (jsonb), resultado (jsonb), metricas (jsonb), estado (text), applied_at (timestamptz), created_at (timestamptz)
FIELDS MISSING: None.
MIGRATION RISK: LOW.
NOTES: Reused as-is for schedule optimization engine telemetry.
```

```text
TABLE: hermes_inbox
CURRENT PURPOSE: Inbound machine/human communication intake queue (Telegram messages, webhooks, voice notes).
FROZEN DOMAIN RELATIONSHIP: Inbound Communication Gateway.
DECISION: REUSE
FIELDS REUSED: id (bigint), canal (varchar), categoria (varchar), summary (text), raw_ref (uuid), processed (boolean), created_at (timestamptz), telegram_user_id (bigint)
FIELDS MISSING: N/A for raw intake.
FIELDS TO AVOID: Overloading with worker queue semantics (leases, retries, exponential backoff).
MIGRATION RISK: LOW.
NOTES: Serves as raw ingestion port; worker jobs dispatched to orchestration_jobs.
```

```text
TABLE: orchestration_jobs
CURRENT PURPOSE: Not present in physical schema.
FROZEN DOMAIN RELATIONSHIP: Durable background worker queue for Hermes autonomous operations and temporal trigger evaluation.
DECISION: CREATE
FIELDS REUSED: N/A
FIELDS TO CREATE: id (varchar), job_type (varchar), target_aggregate_id (varchar), correlation_id (varchar), status (varchar), priority (integer), claimed_by (varchar), lease_expires_at (timestamptz), attempt_count (integer), max_attempts (integer), input_payload (jsonb), output_result (jsonb), last_error (text), scheduled_for (timestamptz), created_at (timestamptz), updated_at (timestamptz)
MIGRATION RISK: NONE.
NOTES: Production-grade worker queue.
```

---

### 3.5 Notifications, Events & External Projections

```text
TABLE: notificaciones & registros_pendientes & notification_trigger_logs
CURRENT PURPOSE: Existing notifications, pending operational obligations, and trigger execution logs in real DB.
FROZEN DOMAIN RELATIONSHIP: Delivery channel for task reminders, trigger alerts, and Hermes proposals.
DECISION: REUSE
FIELDS REUSED: notificaciones (id, profile_id, registro_pendiente_id, tipo, titulo, mensaje, deep_link, estado, enviada_en, leida_en, escalation_level, scheduled_for, dedup_key, clase_id), registros_pendientes (id, maestro_id, sesion_clase_id, tipo, prioridad, estado, fecha_limite, mensaje, deep_link, resuelto_at, last_notified_at, notif_count, notification_state), notification_trigger_logs (id, execution_time, status, maestros_processed, notifications_created, errors_count, error_message, context)
MIGRATION RISK: LOW.
NOTES: Reused directly by the temporal trigger and task escalation engines.
```

```text
TABLE: solicitudes_necesidades
CURRENT PURPOSE: Operational procurement and material requests in real DB.
FROZEN DOMAIN RELATIONSHIP: External Bounded Context projected into Calendar as OPERATIONS milestones / correlation validation.
DECISION: REUSE / MAP
FIELDS REUSED: id (uuid), maestro_id (uuid), tipo_necesidad (text), categoria (text), titulo (text), descripcion (text), prioridad (text), estado (text), correlation_id (uuid), departamento_actual (text), costo_estimado (numeric), presupuesto (numeric)
MIGRATION RISK: LOW.
NOTES: Confirms existing correlation_id architectural pattern.
```

```text
TABLE: gastos_fijos & cuotas & compromisos_pago
CURRENT PURPOSE: Financial obligations, tuition fees, and fixed expenses with due dates in real DB.
FROZEN DOMAIN RELATIONSHIP: External Bounded Context projected into Calendar as FINANCE deadlines.
DECISION: MAP (Domain Projection)
MIGRATION RISK: NONE (Read-only projection).
NOTES: Preserves financial SSOT. (pagos_alumnos represents historical payments; due dates originate in obligations/cuotas/gastos_fijos).
```

```text
TABLE: comodatos_activos & inventario_activos
CURRENT PURPOSE: Instrument inventory and student loan contracts with expiration dates (fecha_vencimiento).
FROZEN DOMAIN RELATIONSHIP: External Bounded Context projected into Calendar as LOGISTICS deadlines.
DECISION: MAP (Domain Projection)
FIELDS REUSED: comodatos_activos (id, activo_id, alumno_id, fecha_entrega, fecha_vencimiento, estado, tipo_comodato), inventario_activos (id, codigo_inventario, tipo_instrumento, estado_conservacion)
MIGRATION RISK: NONE (Read-only projection).
NOTES: Preserves logistics/inventory SSOT.
```

```text
TABLE: ausencias_maestros & ausencias
CURRENT PURPOSE: Faculty absence requests and approvals with date ranges (fecha_inicio, fecha_fin).
FROZEN DOMAIN RELATIONSHIP: External Bounded Context projected into Calendar as HR / FACULTY BLOCKOUTS.
DECISION: MAP (Domain Projection)
FIELDS REUSED: id, maestro_id, tipo_ausencia, fecha_inicio, fecha_fin, motivo, estado, maestro_suplente_id
MIGRATION RISK: NONE (Read-only projection).
NOTES: Preserves faculty absence SSOT.
```

```text
TABLE: soi_event_bus & soi_eventos
CURRENT PURPOSE: Confirmed to exist in production database.
FROZEN DOMAIN RELATIONSHIP: Backing store for Domain Events, Integration Events, and Audit Log.
DECISION: REVIEW — EXISTING TABLE
STATUS: Full physical definition required to determine relationship between event transport and immutable audit history.
ACTION: Do not create duplicate event bus.
```

