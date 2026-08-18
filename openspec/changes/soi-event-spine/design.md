# Design: SOI Event Spine

## Technical Approach

The Event Spine implements a centralized, immutable event log (`soi_eventos`) that captures domain events from 5 core tables (sesiones_clase, asistencias, tareas_institucionales, justificaciones, periodos) via lightweight SECURITY DEFINER triggers. Phase 1 is logging-only (no side effects), optimized for high-throughput inserts on asistencias (10k+/day). Events are queryable by entity (student/class/task), timestamped for causality tracking, and RLS-protected by department. Integration with existing HERMES infrastructure deferred to Phase 2 enrichment.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|--------------------------|-----------|
| **Immutable table design** | Append-only table with no UPDATE/DELETE allowed via RLS | Mutable log with update tracking | Immutable logs prevent accidental data loss, simplify auditing, and guarantee event ordering. Phase 1 prioritizes correctness over flexibility. |
| **Trigger placement** | AFTER triggers on source tables; SECURITY DEFINER with UNLOGGED writes for draft queue | BEFORE triggers; synchronous enrichment in trigger | AFTER + SECURITY DEFINER isolates event capture from business logic. UNLOGGED table for batch staging reduces contention on `asistencias` (hot table). |
| **Trigger scope** | 5 core tables only (sesiones_clase, asistencias, tareas_institucionales, justificaciones, periodos) | All Priority 1+2 tables (including maestros, alumnos, observaciones_sesion) | Phase 1 limits scope to high-signal tables with direct workflow impact. Priority 2 tables deferred to Phase 2 after performance baselines are established. |
| **Event type naming** | Semantic types: `sesion.creada`, `asistencia.registrada`, `tarea.creada`, `justificacion.solicitada` | Flat names: `created`, `updated`, `status_changed` | Semantic naming clarifies intent across departments and integrates cleanly with RPC/webhook patterns used by HERMES. |
| **Correlation ID generation** | Auto-generated UUID v7 (via `gen_random_uuid()`) in triggers; optional RPC override in Phase 2 | Manual UUID supplied by caller; hash(event chain) | Auto-gen is deterministic and fast; UUID v7 encodes timestamp for causality ordering. RPC override deferred to Phase 2 for complex workflows (e.g., multi-step absence→observation→task). |
| **RLS policy model** | Reuse HERMES department enum (`soi_departamento`) + department_scoped views | Per-role policies (admin/acm/adm/fin/log/com) with explicit allowlists | HERMES already enforces department boundaries; consistent policy reduces cognitive load. Department-scoped view pattern is established in codebase (see `20260622_hermes_core.sql`). |
| **Payload structure** | JSONB with typed subfields per event type; schema documented but not enforced | Strict JSON schema with CHECK constraints | JSONB with documentation allows flexible expansion (Phase 2 enrichment). CHECK constraints would require ALTER TABLE for new fields; deferred to Phase 2. |
| **Trigger latency target** | P99 < 50ms on asistencias (hot table); measured via CloudWatch logs | P99 < 100ms (standard SLA) | Asistencias sees 10k+/day inserts during class sessions; 50ms target ensures sub-second API response times. Batch staging via UNLOGGED table is the mechanism. |

## Data Flow

Append-only event log architecture:
- Academic domain (sesiones_clase, asistencias, justificaciones) and task domain (tareas_institucionales, periodos) each trigger AFTER INSERT/UPDATE
- SECURITY DEFINER trigger functions capture event_type, entity_id, actor_id, and payload
- Events written to soi_eventos immutable table with RLS policies enforcing department boundaries
- Phase 2 enrichment via async polling of `procesado = false` flag
- Timeline queries indexed on (entidad_id, created_at DESC) and (tipo, created_at DESC)

```
[Academic Domain]                [Task Domain]
 sesiones_clase                  tareas_institucionales
 asistencias                       periodos
 justificaciones
     ↓                                ↓
     └──→ TRIGGER (AFTER INSERT/UPDATE)
         ├─ capture event_type, entity_id, actor_id
         ├─ serialize payload (JSONB)
         └─ INSERT INTO soi_eventos (SECURITY DEFINER)
                  ↓
          [soi_eventos Immutable Log]
          ├─ indices: (entidad_id, created_at), (tipo, created_at)
          └─ RLS: department-scoped views
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260818000000_soi_eventos_event_spine.sql` | Create | Migration: create `soi_eventos` table, 5 trigger functions (PL/pgSQL), indices, RLS policies, ENUM type for event types |
| `supabase/functions/event-spine-logger/index.ts` | Create | Edge Function skeleton (Phase 2 consumer); created in Phase 1 but not deployed or triggered |
| `supabase/functions/event-spine-logger/deno.json` | Create | Deno config for logger function |

## Interfaces / Contracts

### Event Type Enum
```sql
CREATE TYPE soi_evento_tipo AS ENUM (
  'sesion.creada',
  'sesion.estado_cambio',
  'asistencia.registrada',
  'asistencia.falta_injustificada',
  'tarea.creada',
  'tarea.completada',
  'tarea.escalada',
  'justificacion.solicitada',
  'justificacion.aprobada',
  'justificacion.rechazada',
  'periodo.abierto',
  'periodo.cerrado'
);
```

### Table Schema
```sql
CREATE TABLE public.soi_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo ~ '^[a-z]+\.[a-z_]+$'),
  entidad_tipo text NOT NULL,
  entidad_id uuid NOT NULL,
  actor_id uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  correlation_id uuid,
  procesado boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_soi_eventos_entity_timeline 
  ON public.soi_eventos(entidad_id, created_at DESC);
CREATE INDEX idx_soi_eventos_tipo_timeline 
  ON public.soi_eventos(tipo, created_at DESC);
CREATE INDEX idx_soi_eventos_procesado_queue 
  ON public.soi_eventos(procesado, created_at) 
  WHERE procesado = false;
CREATE INDEX idx_soi_eventos_correlation 
  ON public.soi_eventos(correlation_id);
```

### RLS Policies
Policies enforce department isolation (ACM, ADM, DIR, LOG) consistent with HERMES architecture. Service role has full access for edge functions.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Trigger function logic: event_type encoding, payload serialization, correlation_id propagation | pgTAP or manual SQL; test INSERT→trigger per table |
| Integration | End-to-end trigger→event creation within 50ms, payload schema compliance, RLS blocking | TypeScript test client; simulate ACM/ADM/DIR/LOG roles; measure P99 |
| E2E | Timeline queries: SELECT * WHERE entidad_id=? returns 100 events in <200ms; correlation chains | Supabase SDK + fixtures; CloudWatch latency telemetry |
| RLS | Department isolation: ACM cannot see ADM events; DIR sees all | pgTAP role-based SQL tests |
| Performance | P99 < 50ms on asistencias INSERT; queue index efficiency | CloudWatch logs pre/post deployment |

## Migration / Rollout

Phase 1 deployment:
1. Backup Supabase DB snapshot
2. Deploy migration via `supabase db push --remote`
3. Validate: event count accumulates; RLS policies block cross-department access; P99 latency < 50ms
4. Rollback (if needed): DROP TABLE soi_eventos CASCADE (no data loss on core tables)

Phase 2 (TBD): Deploy event-spine-logger edge function with pg_cron polling when async enrichment strategy is finalized.

## Integration with HERMES

Phase 1: soi_eventos is independent. fn_hermes_auto_delegar_tareas() unchanged. When tareas_institucionales are created, the new trigger logs events (passive).

Phase 2: Async enrichment edge function polls soi_eventos WHERE procesado=false, joins context, marks procesado=true. Option A (async polling) recommended over Option B (sync enrichment in trigger) to keep Phase 1 trigger logic simple.

## Consumer Pattern (Phase 3 Preview)

Future edge functions poll soi_eventos WHERE procesado=false, process events by type (e.g., create escalation tasks on falta_injustificada), and mark procesado=true. This establishes contract now without Phase 2/3 implementation.

## Open Questions

None — design complete and ready for task specification.
