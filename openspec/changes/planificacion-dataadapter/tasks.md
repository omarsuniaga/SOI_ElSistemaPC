# Tasks: Planificación DataAdapter Refactor

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600 (330+120+150) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR #1 (core) → PR #2 (migration) → PR #3 (tests) |
| Delivery strategy | auto-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Core adapter + mock + model fix + re-export | PR #1 | Stacked to main; ~330 lines |
| 2 | Consumer import migration + view refactor + 3 new fns | PR #2 | Depends on PR #1; ~120 lines |
| 3 | Full test coverage + edge cases | PR #3 | Depends on PR #1+#2; ~150 lines |

## Phase 1: Core Adapter + Mock + Model Fix (PR #1)

- [ ] 1.1 `git mv src/modules/planificacion/api/planificacionApi.js` → `planificacionSupabase.js` (no content changes)
- [ ] 1.2 Create `planificacionAdapter.js` — dispatcher: `config.isDemoMode ? mockImpl : supabaseImpl`, re-export all 9 existing function signatures
- [ ] 1.3 Create `planificacionMock.js` — localStorage-backed CRUD (9 fns): seed/overlay merge pattern, 200-500ms delay, in-memory JOIN via `clases.json` + `maestros.json`, fail-degraded re-seed on corrupt data
- [ ] 1.4 Create `src/assets/data/mocks/planificaciones.json` — 6-8 seed rows with varied `estado`, `instrumento`, `clase_id`, `maestro_id`; IDs prefixed `demo-`
- [ ] 1.5 Create `src/assets/data/mocks/maestros.json` — 4-6 rows with `id` + `nombre_completo` for mock JOIN
- [ ] 1.6 Fix `planificacion.model.js`: add `notas_dsl: this.notas_dsl || null` to `toJSON()` (currently drops it)
- [ ] 1.7 Update `index.js`: `export * from './api/planificacionAdapter.js'` (replaces `planificacionApi.js`)

**Verification**: Adapter returns Planificacion instances from both paths. Mock CRUD cycle works (create → read → update → delete). `toJSON()` includes `notas_dsl`. Existing model tests pass. Rollback: `git revert <sha>`.

## Phase 2: Consumer Migration + View Refactor (PR #2)

- [ ] 2.1 Update `usePlanificacion.js` — change import from `../api/planificacionApi.js` to `../api/planificacionAdapter.js`
- [ ] 2.2 Add `obtenerClases()` to all 3 layers (adapter dispatcher, supabase impl, mock impl) — fetches `{id, nombre}` from clases
- [ ] 2.3 Add `obtenerMaestro(id)` to all 3 layers — fetches maestro by id
- [ ] 2.4 Add `obtenerSesiones(maestroId, fechaInicio, fechaFin)` to all 3 layers
- [ ] 2.5 Update `planificacionView.js` — change imports from `planificacionApi.js` to adapter; replace 4 direct `supabase` calls (lines 466, 673, 799-806, 810-816) with 3 new adapter functions
- [ ] 2.6 Update `aprobacionPlanificacionesModal.js` — change import from `../api/planificacionApi.js` to adapter
- [ ] 2.7 Update `asistenciaView.js` (portal-maestros) — change import from `../../modules/planificacion/api/planificacionApi.js` to adapter

**Verification**: All 4 consumers import from adapter. Zero direct `supabase` calls remain in `planificacionView.js`. Mock mode: dropdowns populate, plan execution works. Rollback: `git revert <sha>`.

## Phase 3: Full Test Coverage + Edge Cases (PR #3)

- [ ] 3.1 Write model test: `toJSON()` includes `notas_dsl` (RED: fix exists in 1.6)
- [ ] 3.2 Write adapter routing test: mock `config.isDemoMode` true/false, assert correct delegation for 2+ functions
- [ ] 3.3 Write mock CRUD lifecycle test: seed loaded → create → read → update → delete cycle
- [ ] 3.4 Write mock JOIN test: `obtenerPlanificacionesConDetalles` populates `clase_nombre` + `maestro_nombre`
- [ ] 3.5 Write edge case test: corrupt localStorage triggers re-seed (mock returns valid data)
- [ ] 3.6 Write edge case test: empty maestroId filter returns all planificaciones
- [ ] 3.7 Run full suite: `npm run test:run` — verify 0 regressions

**Verification**: All tests pass. Coverage includes model fix, adapter routing, mock lifecycle, JOIN, and 2 edge cases. Rollback: `git revert <sha>` (tests only, no prod code).

## Test Inventory

| Existing | Status | Notes |
|----------|--------|-------|
| `planificacion.model.test.js` | 4 tests, passes | Unaffected — verify after all PRs |
| `ruta.model.test.js` | Independent | Unaffected |
| `rutas.api.test.js` | Independent | Unaffected |
| `rutas.integration.test.js` | Independent | Unaffected |
| `dslParser.test.js` | Independent | Unaffected |

| To Create | PR | What |
|-----------|----|------|
| model fix test (toJSON includes notas_dsl) | #3 | 1 test |
| adapter routing test | #3 | 2+ test cases |
| mock CRUD lifecycle | #3 | 1 integration-style test |
| mock JOIN test | #3 | 1 test |
| edge case: corrupt localStorage | #3 | 1 test |
| edge case: empty filter | #3 | 1 test |

## Stack Recommendations

No new dependencies. All tools in use: Vitest (existing), jsdom (existing), `crypto.randomUUID` or `Math.random().toString(36)` for ID generation (browser-native).

## Rollback Notes

| PR | Rollback |
|----|----------|
| #1 | `git revert <sha>` — adapter not wired to consumers yet; safe |
| #2 | `git revert <sha>` — imports revert; view falls back to direct supabase calls |
| #3 | `git revert <sha>` — tests only, no prod code |
