# Proposal: SOI Event Spine

## Intent

The SOI currently has HERMES (task-driven automation) but lacks a unified event ledger across academic, administrative, and workflow domains. This creates observability gaps: we cannot easily query "all events related to a student," correlate student attendance events to institutional tasks, or add new event subscribers without modifying core tables.

The Event Spine solves this by creating a centralized, immutable event log (`soi_eventos`) instrumented on 5 core tables (sesiones_clase, asistencias, tareas_institucionales, justificaciones, periodos), enabling cross-domain queries, causality tracking, and event-driven workflows.

## Scope

### In Scope
- Create `soi_eventos` immutable event table with fields: event_type, entity_type, entity_id, actor_id, payload (JSONB), correlation_id, timestamp
- Add triggers on Priority 1 tables: sesiones_clase (3 events: created, estado changed, asistencias updated), asistencias (2 events: inserted, estado changed), tareas_institucionales (1 event: estado changed), periodos (2 events: created, cerrado→true)
- Create indices on (entity_id, entity_type, timestamp) for efficient timeline queries
- Phase 1 triggers INSERT to soi_eventos only (no side effects); verified via integration tests
- Document trigger schema, event types, and RLS policy for soi_eventos

### Out of Scope
- Phase 2 enrichment (foreign key joins in triggers) — deferred to spec phase for async design decision
- Event-driven subscriptions replacing pg_cron — deferred; Phase 1 is logging-only
- UI dashboards or reporting views — separate change
- Backfilling historical events — Phase 1 instruments forward from deployment only
- Priority 2 tables (maestros, alumnos, justificaciones, observaciones_sesion, solicitudes_permisos) — included in Phase 2 roadmap

## Capabilities

### New Capabilities
- `event-spine-core`: Unified immutable event log across academic and workflow domains (soi_eventos table + 4 core triggers)
- `event-causality-tracking`: Correlation ID linking related events (e.g., "all events caused by this absence workflow")

### Modified Capabilities
None — this change is purely additive (new table, new triggers, no behavior changes to existing tables).

## Approach

**Hybrid 3-phase implementation:**

**Phase 1 (LOW RISK — 500 lines)**
- Create `soi_eventos` table: immutable, SECURITY DEFINER triggers on 5 core tables
- Triggers fire on INSERT/UPDATE, log event to soi_eventos with actor_id + payload
- Indices on entity lookups for timeline queries
- RLS policy: restrict to user's department/role (HERMES rules reused)
- No side effects; logging only

**Phase 2 (MEDIUM RISK — 300 lines)**
- Add async enrichment: separate Edge Function polls soi_eventos for unprocessed events
- Fetch foreign key context (alumno_nombre, maestro_nombre, etc.) asynchronously
- Optional: pg_cron job replaces pg_cron notifications with event-queue pull
- Delay decision (sync vs async) until spec phase

**Phase 3 (MEDIUM RISK — 200 lines)**
- Subscribe existing edge functions to event queue (hermes-crear-tarea, escalate-asistencias-notifications, etc.)
- Add new event rules without modifying core tables (e.g., "on high-priority obs → escalate to DIR")
- Event-driven UI subscriptions (web sockets or polling)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/` | New | Migration to create soi_eventos table + 4 triggers |
| `supabase/functions/event-spine-logger/` | New | Edge Function skeleton for Phase 2 async enrichment (created but not called in Phase 1) |
| `supabase/migrations/*asistencias*` | Modified | Add lightweight trigger to log asistencia INSERT/UPDATE events |
| `supabase/migrations/*sesiones_clase*` | Modified | Add triggers for class session lifecycle events |
| `supabase/migrations/*tareas_institucionales*` | Modified | Add trigger for task status changes (reuse existing HERMES logic) |
| `supabase/migrations/*periodos*` | Modified | Add trigger for period closure events |
| RLS policies | Modified | Add strict soi_eventos RLS; reuse HERMES department-based rules |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Trigger explosion on asistencias (10k+/day inserts) → performance degradation | High | Batch inserts in trigger via pg_batch_insert; use UNLOGGED table for draft writes; async enrichment in Phase 2 pulls from queue instead of polling soi_eventos |
| RLS complexity exposes data across departments | Medium | Strict row-level security on soi_eventos; only expose via department-specific views; audit access logs quarterly |
| Correlation ID design unclear (auto-generated vs explicit via RPC) | Medium | Decide in spec phase; recommend auto-gen (UUID v7 for causality ordering) but allow RPC override for complex workflows |
| Phase 1 and Phase 2 async enrichment mismatch (unenriched events pile up) | Medium | Phase 1 is logging-only; Phase 2 specifies SLA for enrichment; acceptable for MVP if queried within 5min |
| Trigger count per table hits Postgres limit (rare, but monitor) | Low | Document per-table trigger count; alert if >10 triggers on any table |

## Rollback Plan

1. **Phase 1**: Drop `soi_eventos` table + associated triggers via migration rollback (Supabase handles via `supabase migration down` or manual `DROP TABLE soi_eventos CASCADE`). No data loss on core tables (triggers are write-only to soi_eventos).
2. **Phase 2**: Disable async enrichment Edge Function; events remain unprocessed but logged (safe).
3. **Phase 3**: Unsubscribe edge functions from event queue; restart native HERMES pg_cron jobs (maintain parallel until Phase 3 is stable).

## Dependencies

- Supabase project with Edge Functions enabled (zmhmdvmyeyswunurcyow)
- PostgreSQL 15+ (Supabase default; required for correlation_id UUID v7)
- Existing HERMES infrastructure (tareas_institucionales, pg_cron, edge functions)
- No external dependencies (SQLAlchemy, ORMs, etc.)

## Success Criteria

- [ ] `soi_eventos` table created with all 7 columns (event_type, entity_type, entity_id, actor_id, payload, correlation_id, created_at)
- [ ] 4 core triggers (sesiones_clase, asistencias, tareas_institucionales, periodos) fire and log events with <50ms latency (P99)
- [ ] Timeline query "SELECT * FROM soi_eventos WHERE entity_type='alumno' AND entity_id=? ORDER BY created_at" returns 100 events in <200ms
- [ ] RLS policy correctly restricts access: users see only events within their department
- [ ] Correlation ID groups related events (absence → observation → task) in single UUID chain
- [ ] Migration rollback restores clean state (no orphaned triggers, no data loss)
- [ ] Integration tests cover: trigger fire on INSERT/UPDATE, payload structure, RLS access, correlation chaining
