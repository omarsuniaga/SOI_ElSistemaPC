# Proposal: Planificación DataAdapter Refactor

## Intent

`planificacionApi.js` calls Supabase directly in all 7 functions — zero mock/demo support. The model's `toJSON()` silently drops `instrumento` (data-loss bug). The view has 4 direct `supabase` calls bypassing the API layer. This blocks Demo mode and the target DataAdapter architecture (AGENTS.md).

## Scope

**In:**
- Triple-file adapter: `planificacionSupabase.js` (rename), `planificacionAdapter.js` (router), `planificacionMock.js` (localStorage + seed)
- `src/assets/data/mocks/planificaciones.json` — seed data
- Fix `toJSON()` — include `instrumento`
- Route 4 direct `supabase` calls in view through adapter/helpers
- Update consumers: `usePlanificacion.js`, `planificacionView.js`, `aprobacionPlanificacionesModal.js`, `asistenciaView.js`, `index.js`

**Out:**
- DataAdapter for sesiones / curriculo / rutas / cobertura / DSL APIs
- `planificacionModal.js` (uses callback `onSave`, no direct api import)
- Integration tests

## Interface

Adapter exposes exact same 8 signatures as current API:

| Function | Returns |
|----------|---------|
| `obtenerPlanificaciones(maestroId?)` | `Planificacion[]` |
| `obtenerPlanificacion(id)` | `Planificacion` |
| `obtenerPlanificacionesConDetalles(maestroId?)` | `Planificacion[]` (enriched) |
| `crearPlanificacion(planData)` | `Planificacion` |
| `actualizarPlanificacion(id, updates)` | `Planificacion` |
| `eliminarPlanificacion(id)` | `void` |
| `marcarRevisadasMasivo(ids)` | `Planificacion[]` |
| `marcarRevisada(id)` | `Planificacion[]` |
| `marcarEjecutada(id)` | `Planificacion` |

## Approach

Triple-file pattern following `dslApi.js` `config.isDemoMode` (cleaner than `sesionesApi.js` URL-detection). Adapter checks `config.isDemoMode` once and delegates to supabase or mock. Consumers change one import line.

## Mock Strategy

- **Seed**: `planificaciones.json` loaded at module init — rich sample plans with varied estados/instrumentos
- **Writes**: localStorage key `planificaciones_mock` — merges with seed on read
- **JOIN**: `obtenerPlanificacionesConDetalles` joins with existing `clases.json` mock by `clase_id`
- **Persistence**: seed always available fresh; localStorage mutations ephemeral

## Migration

| File | Change |
|------|--------|
| `usePlanificacion.js` | `planificacionApi.js` → `planificacionAdapter.js` |
| `planificacionView.js` | Same + remove `supabase` import, route 4 calls |
| `aprobacionPlanificacionesModal.js` | Same import swap |
| `asistenciaView.js` | Same import swap |
| `index.js` | Same export path |

## Release Boundaries (auto-chain: 3 PRs)

| PR | Content | Est. Δ |
|----|---------|--------|
| #1 | Rename api file, create adapter/mock/seed, fix `toJSON` bug, update `index.js` | ~150 |
| #2 | Migrate all consumers, route 4 direct `supabase` calls in view | ~200 |
| #3 | Unit tests for mock functions | ~100 |

Each PR independently revertible. No DB changes.

## Risk Treatment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `instrumento` silently lost on create/update | HIGH | Fix `toJSON()` in PR #1 — before any consumer migration |
| 4 direct `supabase` calls in view won't work in Demo | MEDIUM | Extract `getClaseAndUser()` helper, route through adapter |
| JOIN mock has no local equivalent | MEDIUM | In-memory join via existing `clases.json` |
| No tests for API layer | LOW | Add mock tests in PR #3; not a blocker |

## Capabilities

### New
- `planificacion-data-persistence`: CRUD + enriched queries with dual backend (supabase/mock)

### Modified
- `academic-curriculum-planning`: Re-routed through adapter — same behavior, zero spec changes

## Rollback

Git revert per PR. No schema or DB changes.

## Success

- [ ] Demo mode (`VITE_DEMO_MODE=true`) shows seed data, zero Supabase errors
- [ ] `instrumento` survives create → edit → read cycle (both modes)
- [ ] `obtenerPlanificacionesConDetalles` returns `clase_nombre` in mock mode
- [ ] All existing tests pass (`npm run test:run`)
