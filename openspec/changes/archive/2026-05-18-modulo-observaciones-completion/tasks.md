# Tasks: Finalización Módulo Observaciones

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250 - 400 |
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
| 1 | Model & Logic (TDD) | PR 1 | Base model and unit tests |
| 2 | View Refactoring | PR 1 | Integration with UI and compact styles |

## Phase 1: Infrastructure & Model (TDD)

- [x] 1.1 Refactor `src/modules/observaciones/models/observacion.model.js` with rich validation and state guards.
- [x] 1.2 Create `src/modules/observaciones/__tests__/observacion.model.test.js` with validation scenarios (RED).
- [x] 1.3 Implement model logic to pass tests (GREEN).
- [x] 1.4 Refactor `src/modules/observaciones/api/observacionesApi.js` to return `Observacion` instances.

## Phase 2: View Refactoring (UI & UX)

- [x] 2.1 Refactor `src/modules/observaciones/views/observacionesView.js` header and stats cards (Core Style).
- [x] 2.2 Implement `renderTable` with `table-compact` and responsive columns.
- [x] 2.3 Refactor "Nueva Observación" and "Editar" to use `AppModal` and model validation.
- [x] 2.4 Refactor "Seguimiento" modal to use `AppModal` and trigger state transition automatically.
- [x] 2.5 Port the `quick-actions` pattern to the observations table rows.

## Phase 3: Integration & Verification

- [x] 3.1 Create `src/modules/observaciones/__tests__/observaciones.integration.test.js` for CRUD and follow-up flow.
- [x] 3.2 Update `vitest.config.js` to include the observations module.
- [x] 3.3 Run `npm run test:run` and verify 0 failures.
- [x] 3.4 Manual check: Verify state transitions from "abierta" to "seguimiento".
