# Tasks: Session Summary Grouped

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~420-550 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Registry + Groq pipeline → PR 2: Panel + Aggregator |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Section Registry + Groq pipeline + tests | PR 1 | Base: main. Registry (new), groqService (mod), seccionesOrquestales.test.js (new), groqService.test.js (mod) |
| 2 | Panel grouping + Aggregator + tests | PR 2 | Base: main. SessionSummaryPanel (mod), progressAggregatorService (mod). Depends on PR 1 logically but git-independent (no file conflicts) |

## Phase 1: Section Registry (TDD — RED first)

- [x] 1.1 RED: Write `seccionesOrquestales.test.js` — tests for SECCION_MAP, getAlumnosBySeccion (tutti, individual, unknown, filtering by instrument), NFD normalization, expandSeccionItems (items mixtos, unknown section), buildSeccionContext
- [x] 1.2 GREEN: Create `src/portal-maestros/data/seccionesOrquestales.js` — exports SECCION_MAP (10+ sections), getAlumnosBySeccion, expandSeccionItems, buildSeccionContext, `_normalizarInstrumento` reusing NFD pattern
- [x] 1.3 REFACTOR: Verify pure JS, zero dependencies, all tests green with `npx vitest run`

## Phase 2: Groq Service Enhancement (TDD)

- [x] 2.1 RED: Update `groqService.test.js` — test Guarda 5 skips `es_colectivo` on items with `seccion`, and expandSeccionItems runs in pipeline after guardas
- [x] 2.2 GREEN: Modify `groqService.js` — inject `buildSeccionContext()` into ANALYZE_OBSERVATION_PROMPT, adjust Guarda 5 (`&& !item.seccion`), add `expandSeccionItems()` step before `expandColectivos()`
- [x] 2.3 REFACTOR: Verify existing tests for groqService still pass

## Phase 3: SessionSummaryPanel v2 (TDD)

- [ ] 3.1 RED: Write tests for grouping logic — Map<contenido_dsl, group>, mixed state detection ("mixto"), WhatsApp text format grouped, empty content fallback
- [ ] 3.2 GREEN: Rewrite `SessionSummaryPanel.js` — `_normalizeRecords()` returns grouped structure, new render layout with content header + student list + badges, remove state cycle button
- [ ] 3.3 REFACTOR: Verify API ({ open, close }) unchanged, all existing consumers work

## Phase 4: ProgressAggregator Section Support (TDD)

- [ ] 4.1 RED: Write tests for `saveProgressFromEvaluaciones` — evaluation with `seccion` expands to N rows, no matching roster students = no-op
- [ ] 4.2 GREEN: Modify `progressAggregatorService.js` — accept `seccion` in evaluaciones, call `getAlumnosBySeccion()`, generate individual rows before upsert
- [ ] 4.3 REFACTOR: Verify existing tests pass, no regression on `alumno_id`-based evaluations

## Phase 5: Integration Verification

- [ ] 5.1 Run full test suite: `npx vitest run` — all tests pass (new + existing)
- [ ] 5.2 `npm run build` (or Vite build) — compiles without errors
- [ ] 5.3 Verify rollback plan: revert PRs cleanly, no schema migration needed
