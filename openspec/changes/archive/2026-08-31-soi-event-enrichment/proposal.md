# Proposal: SOI Event Enrichment Phase 2

## Intent

**Problem:** Phase 1 deployed an immutable event log (`soi_eventos`) with 15 event types across 5 domains, but no consumer processes these events. Reactive tasks (absence escalation, task escalation, period closure) remain hardcoded in separate edge functions with no unified event flow. This creates maintenance burden and blocks new reactive rules.

**Why now:** Event-spine-logger skeleton exists but is not deployed; groq-proxy and hermes-crear-tarea are production-ready; pg_cron patterns proven. Phase 2 completes the event loop by routing events to handlers and implementing 5 core reactive rules (hardcoded, not configurable).

**Success means:** Events are processed within 5–10 minutes of insertion; 5 reactive rules produce appropriate tasks in `tareas_institucionales` with correct department and priority; zero manual intervention required for absence escalation, task escalation, or period closure workflows.

## Scope

### In Scope

1. **event-spine-logger consumer** — Route event types to handler functions; mark events processed
2. **5 reactive rule handlers (hardcoded):**
   - `asistencia.falta_injustificada` × 3 consecutive days → ACM task "Seguimiento alumno"
   - `tarea.creada` with `estado='vencida'` → HERMES escalation to DIR
   - `periodo.cerrado` → ACM task "Generar informes de cierre"
   - `sesion.creada` without asistencia registration in 24h → maestro reminder task
   - `justificacion.rechazada` → notification to teacher (via existing notificaciones flow)
3. **pg_cron job** — Schedule event-spine-logger every 10 minutes (horario académico, weekdays 07:00–20:00)
4. **groq integration** — Classify ambiguous events and enrich task descriptions (optional, defer if overhead)

### Out of Scope

- Configurable rules table (`hermes_reglas` / `hermes_condiciones`) — deferred to Phase 3
- Supabase Realtime (WebSocket) consumers — polling + cron sufficient for phase 2
- Backfill historical events before Aug 18
- Dashboard or UI for event monitoring (future phase)

## Capabilities

### New Capabilities
- `event-enrichment-consumer`: Route and process typed events from `soi_eventos` log; enforce idempotency via `correlation_id`
- `reactive-task-generation`: Create tasks in `tareas_institucionales` with department, priority, and context from event payload

### Modified Capabilities
- `escalation-state-machine`: Current hardcoded VERDE→AMARILLO→NARANJA→ROJO logic remains; Phase 2 unifies with event flow (no requirement changes, implementation shift only)

## Approach

**Polling + pg_cron (recommended from exploration):**

1. **Event-spine-logger consumer** (`supabase/functions/event-spine-logger/index.ts`):
   - Fetch batches of 100 unprocessed events (index on `procesado=false`)
   - Switch on `event.tipo`; route to typed handler
   - Handlers: check conditions, call hermes-crear-tarea or notificaciones as needed
   - Mark event `procesado=true` on success; log errors for manual review

2. **Handler implementations:**
   - All handlers idempotent via `event.correlation_id` (dedup key in tareas_institucionales)
   - Use groq-proxy for intelligent summarization (optional optimization if overhead acceptable)
   - Handlers must complete within 30s per event (batch of 100 events ≈ 50s total)

3. **Scheduling via pg_cron:**
   - Job: invoke `event-spine-logger` every 10 min on weekdays 07:00–20:00
   - Auth: `x-internal-key` header (existing pattern)
   - Idempotent: guard against double processing with `procesado` flag

4. **Architecture diagram (text):**
   ```
   Event Triggers (9 existing)
        ↓
   soi_eventos table (append-only log)
        ↓
   pg_cron job (10-min heartbeat)
        ↓
   event-spine-logger consumer
        ├─→ handleFaltaInjustificada() → [check 3+ consecutive] → hermes-crear-tarea (ACM)
        ├─→ handleTareaVencida() → hermes-crear-tarea (DIR, escalation)
        ├─→ handlePeriodoCerrado() → hermes-crear-tarea (ACM, closure)
        ├─→ handleSesionCreada() → [check 24h asistencia gap] → hermes-crear-tarea (maestro)
        └─→ handleJustificacionRechazada() → notificaciones (teacher alert)
        ↓
   tareas_institucionales (task queue)
        ↓
   HERMES dispatch → departments
   ```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/functions/event-spine-logger/index.ts` | New | Implement consumer: route events, call handlers, mark processed |
| `supabase/functions/event-spine-logger/handlers/` | New | 5 handler modules (falta, tarea-vencida, periodo-cerrado, sesion-creada, justificacion-rechazada) |
| `supabase/migrations/{date}_event_enrichment_cron.sql` | New | pg_cron job for 10-minute polling schedule |
| `tareas_institucionales` table | Modified | Add `correlation_id` (nullable) for idempotency; unique constraint on `(event_id, correlation_id)` |
| `soi_eventos` table | Modified | Verify `procesado` index exists; extend `payload` schema documentation |
| `supabase/functions/groq-proxy/` | Optional | Already deployed; Phase 2 can call for event enrichment |
| `supabase/functions/hermes-crear-tarea/` | Already in use | Handlers invoke directly; no changes needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Database load from 10-min polling | Medium | Partial index on `procesado=false` + batch size 100 keeps scans <100ms; monitor query execution time |
| Event ordering violations (B should trigger before A) | Low | Use `correlation_id` + `created_at` ordering; test concurrent event scenarios |
| Idempotency failures (duplicate tasks created) | Medium | Unique constraint on `(event_id, correlation_id)` + handler guards; test retry scenarios |
| groq-proxy latency blocks batch | Medium | groq calls are optional (Phase 2.1); make async offload in Phase 2.2 if needed |
| TDD coverage gaps | Medium | Require >80% branch coverage for all handlers before merge; test escalation state transitions |
| Revert during production rollback | Low | event-spine-logger is stateless; disable pg_cron job, soi_eventos remains untouched, events replayable |

## Rollback Plan

1. **Disable pg_cron job:** `SELECT cron.unschedule('event_enrichment_consumer');`
2. **Freeze event-spine-logger:** Mark function as read-only or delete from production edge functions
3. **Revert migration:** Schema changes minimal (only `correlation_id` + index); can be rolled back by DROP columns and removing constraints
4. **Replay events:** If needed, reset `procesado=false` on all events and re-run consumer after fixes
5. **Fallback to Phase 1:** Existing escalate-asistencias-notifications continues independently (not dependent on Phase 2)

## Dependencies

- Phase 1 artifacts (soi_eventos table, 9 trigger definitions) — already deployed
- groq-proxy edge function — already deployed
- hermes-crear-tarea edge function — already deployed
- pg_cron extension — already active in production
- pg_net extension — already active in production
- Supabase JWT auth for internal functions — already in use

## Success Criteria

- [ ] event-spine-logger deployed and processing all unprocessed events from soi_eventos
- [ ] 5 reactive handlers implemented and tested; zero missing event types
- [ ] pg_cron job runs on schedule; zero failed invocations in 7 days
- [ ] Absence escalation logic unified: events→handlers→tasks, no duplicate escalations
- [ ] Task creation idempotency verified: replaying same event does not create duplicate task
- [ ] TDD coverage: >80% branch coverage for all handlers; tests pass in strict mode
- [ ] Production pilot (1 week): tasks generated per reactive rules; no unintended task spam
- [ ] Rollback executed and verified: can disable consumer without data loss or orphaned state
