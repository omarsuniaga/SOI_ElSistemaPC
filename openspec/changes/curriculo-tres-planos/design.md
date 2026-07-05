# Design: Curriculo Tres Planos

## Technical Approach

Implement the change in small slices using the existing canonical spine. First, add the missing objective tier and proposal metadata in Supabase, then redirect reads away from phantom ACM tables toward `route_versions`, then enable parser-to-draft flow and ACM review UI. The first slice must be schema-only and read-compatible so current behavior does not break.

## Architecture Decisions

### Decision: Add an explicit objectives tier
**Choice**: Create `objetivos` as a first-class table between `nodes` and `indicators`.
**Alternatives considered**: Keep a single `nodes.objective` text field; encode objectives inside JSON.
**Rationale**: The current model cannot represent multiple objectives per theme cleanly.

### Decision: Keep ACM as sole publisher
**Choice**: Teachers may propose content, but ACM alone can publish it.
**Alternatives considered**: Let teachers publish directly.
**Rationale**: Preserves the institutional authority model already used by the portal.

### Decision: Replace phantom-table reads with canonical derivation
**Choice**: `weeklyPlanSupabase.js` must derive content from published `route_versions`.
**Alternatives considered**: Recreate `acm_*` tables.
**Rationale**: The phantom tables are absent in production and hide failures.

### Decision: Parser output is draft-only
**Choice**: `planningParserService.js` produces a reviewable draft, never auto-saves.
**Alternatives considered**: Auto-create proposals on parse success.
**Rationale**: Prevents silent corruption from parser mistakes.

## Data Flow

Teacher upload -> parser draft -> teacher review -> proposal -> ACM review -> published route version -> ACM weekly plan reads published version.

    Upload
      ↓
  Parser draft
      ↓
  Maestro review
      ↓
   propuesta
      ↓
   ACM review
    ↙     ↘
publicada  devuelta

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/*_create_objetivos_tier.sql` | Create | New objectives table and indexes |
| `supabase/migrations/*_migrate_nodes_objective.sql` | Create | Move legacy objective text into objectives |
| `supabase/migrations/*_extend_route_status_enum.sql` | Create | Add proposal/returned route states |
| `supabase/migrations/*_add_route_authorship_columns.sql` | Create | Add authorship and class scope metadata |
| `src/modules/planificacion/api/weeklyPlanSupabase.js` | Modify | Read from published canonical versions |
| `src/modules/planificacion/api/routeSupabase.js` | Modify | Remove deprecated plan_* reads |
| `src/portal-maestros/services/planningParserService.js` | Modify | Chunking, draft mode, schema validation |
| `src/modules/progresos/api/` | Create/Modify | Sequential progression function/API |
| `src/modules/planificacion/views/` | Create/Modify | ACM proposal review UI |
| `src/portal-maestros/views/` | Create/Modify | Upload and draft review UI |

## Interfaces / Contracts

```ts
type ProposalRouteVersion = {
  origen: 'acm' | 'maestro'
  propuesta_por?: string
  clase_id?: string
  feedback?: string
  route_status: 'borrador' | 'propuesta' | 'publicada' | 'devuelta'
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Parser draft output and chunking | Mock long documents and invalid JSON |
| Integration | Weekly plan derivation and proposal persistence | Supabase-backed service tests |
| E2E | Upload -> review -> propose -> publish | Pilot happy path in portal flows |

## Migration / Rollout

Roll out in slices:
1. Schema foundation
2. Route status/authorship
3. Read path fixes
4. Parser draft flow
5. Progression engine
6. UI review flows

No destructive rollout is required in this slice.

## Open Questions

- [ ] Should historical `planificaciones` be migrated or kept as archive only?
- [ ] Should progression be materialized or computed on demand?

