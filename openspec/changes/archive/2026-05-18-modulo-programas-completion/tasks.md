# Tasks: Finalización Módulo Programas

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200 - 300 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Model & Validation (TDD) | PR 1 | Base model and unit tests |
| 2 | View Refactoring & CRUD | PR 1 | Integration with UI and compact styles |

## Phase 1: Infrastructure & Foundation (TDD)

- [x] 1.1 Create `src/modules/programas/models/programa.model.js` with basic class structure.
- [x] 1.2 Create `src/modules/programas/__tests__/programa.model.test.js` with validation scenarios (RED).
- [x] 1.3 Implement validation logic in `programa.model.js` to pass tests (GREEN).
- [x] 1.4 Add `toJSON()` method to the model for API consistency.

## Phase 2: Core Implementation (API)

- [x] 2.1 Update `src/modules/programas/api/programasApi.js` to return `Programa` instances in `obtenerProgramas`.
- [x] 2.2 Update `obtenerPrograma` (single) to return a `Programa` instance.
- [x] 2.3 Verify API normalization with mock data.

## Phase 3: View Refactoring (UI & UX)

- [x] 3.1 Refactor `src/modules/programas/views/programasView.js` header to use `page-header` and `btn-sm-compact`.
- [x] 3.2 Implement `renderTable` with `table-compact` and responsive classes (`d-none d-md-table-cell`).
- [x] 3.3 Refactor "Nuevo/Editar" modal to use `AppModal` and model validation.
- [x] 3.4 Refactor "Eliminar" to use a confirmation `AppModal`.
- [x] 3.5 Port the `quick-actions` pattern to the programs table rows.

## Phase 4: Integration & Verification

- [x] 4.1 Update `exportarProgramasPDF` to use model data.
- [x] 4.2 Create `src/modules/programas/__tests__/programas.integration.test.js` for CRUD flow.
- [x] 4.3 Run `npm run test:run` for the entire project and verify 0 failures.
