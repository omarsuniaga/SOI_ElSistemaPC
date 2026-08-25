# 10 — Backend Handoff & Architecture Freeze Status

**Architecture Status:**
```text
ARCHITECTURE FREEZE v1.0
DOMAIN/APPLICATION RECONCILED
PHYSICAL DATABASE RECONCILIATION PENDING FINAL TABLE VERIFICATION
```

## 1. Architecture Freeze & Hold Declaration

This document certifies that the **SOI (Sistema de Orquestación Institucional) Calendar Portal** frontend architecture, domain specifications, use case contracts, repository ports, and state machines are formally **frozen**.

> **CRITICAL DIRECTIVE — IMPLEMENTATION ON HOLD:**  
> Backend implementation is **NOT** authorized to start. Do **NOT** create migrations, do **NOT** connect Supabase, and do **NOT** generate CREATE TABLE statements for existing institutional tables until their complete physical DDL is inspected.

- **Domain Model:** Frozen and sovereign. Zero database or vendor imports in `/src/domain`.
- **Infrastructure Strategy:** Reconciled against production Supabase capabilities.
- **Next Milestone:** Physical schema inspection of existing production tables to finalize table extension/mapping definitions.

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

## 3. Preliminary Database Decision Directives

### 3.1 What Must Be REUSED As-Is
- **`periodos`**: Reused directly as the canonical academic period SSOT.
- **`salones`**: Reused for physical space, hall, and classroom capacity/equipment data (maps to `Venue`).
- **`horarios`**: Primary candidate for master structural timetable definitions (integer weekday values 1-7, strict FKs).
- **`maestros` & `profiles`**: Reused for faculty, staff, and user identity/role lookups.
- **`notificaciones` & `registros_pendientes`**: Reused for notification dispatch, deep links, deduplication, and escalations.
- **`notification_trigger_logs`**: Reused for notification execution history.
- **`schedule_runs` & `schedule_run_feedback`**: Reused for timetable optimizer run history and user feedback.
- **`hermes_inbox`**: Reused for inbound multi-channel communication ingestion (Telegram, webhooks, voice transcripts).
- **`maestro_tareas` & `homework_assignments`**: Preserved for specialized teacher-to-student pedagogical homework.

### 3.2 What Must Be MAPPED (Domain Projections)
- **`clase_horarios`**: Mapped as timetable compatibility source. (No deprecation/migration until usage audited).
- **`sesiones_clase` & `class_events`**: Projected dynamically into the Calendar view as daily/weekly class occurrences.
- **`gastos_fijos` & `cuotas` & `compromisos_pago`**: Projected read-only to `CalendarItem` (`FINANCE` deadlines) preserving financial SSOT. (`pagos_alumnos` represents historical payments).
- **`comodatos_activos` & `inventario_activos`**: Projected read-only to `CalendarItem` (`OPERATIONS / LOGISTICS` loan expirations).
- **`ausencias_maestros` & `ausencias`**: Projected read-only to `CalendarItem` (`HR / FACULTY` blockouts).
- **`solicitudes_necesidades`**: Projected read-only to `CalendarItem` (`OPERATIONS` milestones, validating `correlation_id` usage).

### 3.3 What Are Candidate New Tables (CREATE)
- **`calendar_triggers`**: Temporal trigger engine rules linked to calendar items (`offset_value`, `offset_unit`, `fire_at`, `action_type`, `automation_level`).
- **`trigger_executions`**: Trigger execution audit log with unique `idempotency_key` guarantees.
- **`task_dependencies`**: True many-to-many Directed Acyclic Graph (DAG) edges (`task_id`, `depends_on_task_id`, `dependency_type`).
- **`orchestration_jobs`**: Durable asynchronous worker queue for Hermes and temporal workers (leases, retries, exponential backoff, dead-letter queue).

### 3.4 What Are Pending Review (REVIEW — EXISTING TABLE)
- **`calendario_institucional`**: Confirmed to exist in production. Leading candidate for Canonical Calendar Anchor SSOT.
- **`tareas_institucionales`**: Confirmed to exist in production. Leading candidate for Canonical InstitutionalTask SSOT.
- **`soi_process_contracts`**: Confirmed to exist in production. Leading candidate for Process Definition SSOT.
- **`hermes_process_cases`**: Confirmed to exist in production. Leading candidate for ProtocolRun SSOT.
- **`soi_event_bus` / `soi_eventos`**: Confirmed to exist in production. Candidate for Institutional Event Bus & Audit Log.
- **`task_evidence`**: Proof verification model (evaluate existing audit structures first).

### 3.5 What Are Deprecated (DEPRECATE — NO DROP AUTHORIZED)
- **`calendario`**: Preserved; do not introduce new dependencies. No drop authorized.
- **`tareas_calendario`**: Preserved; do not introduce new dependencies. No drop authorized.
- **`protocolos` / `hermes_protocolos`**: Preserved; do not introduce new dependencies. No drop authorized.

---

## 4. Reconciled Architecture Decision Records (ADRs)

### ADR-001: Hexagonal Architecture with Strict Inward Ports
- **Decision:** All UI and use cases interface exclusively with `/src/domain/*/repositories`. In-memory adapters in `/src/infrastructure/repositories/mock` will swap to Supabase adapters at the Composition Root (`/src/container.ts`) once backend is ready.

### ADR-002: Unified Domain Calendar Projection
- **Decision:** Rather than duplicating finance, academic, logistics, and HR records into `calendario_institucional`, `CalendarItem` serves as an in-memory unified projection across multiple bounded context tables (`periodos`, `horarios`, `gastos_fijos`, `comodatos_activos`, `ausencias_maestros`, `solicitudes_necesidades`).

### ADR-003: Single Canonical Institutional Task Model
- **Decision:** Leverage `tareas_institucionales` as the single cross-department task SSOT with relational links to process cases and calendar anchors, keeping pedagogical student tasks strictly inside `maestro_tareas`.

### ADR-004: Decoupled Durable Worker Queue (`orchestration_jobs`)
- **Decision:** Preserve `hermes_inbox` for raw multi-channel intake while candidate `orchestration_jobs` handles high-reliability background processing with concurrency leases.

### ADR-005: Correlation Strategy
- **Decision:** Persist technical `correlation_id` (UUID) matching existing patterns in `solicitudes_necesidades` alongside human-readable `correlation_key` (e.g. `SOI-2026-S2-REENROLLMENT`) for user tracking.

---

## 5. Verification & Freeze Certification

- [x] Domain Model and Application Layer fully frozen and decoupled.
- [x] Schema reconciliation audit corrected to account for confirmed existing production tables.
- [x] All decisions categorized (`REUSE`, `MAP`, `CREATE`, `REVIEW — EXISTING`, `DEPRECATE — NO DROP AUTHORIZED`).
- [x] Zero duplicate domain storage models introduced.
- [x] Strict Hexagonal layering preserved.
- [x] TypeScript codebase verified and compiles cleanly.
- [x] **Status:** `READY FOR FINAL PHYSICAL SCHEMA VERIFICATION`.

