# Tasks: Estandarización Módulo Progresos

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 400 - 550 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Academic Logic & Service | PR 1 | Model unification and promedios service |
| 2 | Institutional Reporting | PR 1 | Standardized PDF bulletins and responsive UI |

## Phase 1: Model & Logic Layer (TDD)

- [x] 1.1 Refactor `src/modules/progresos/models/progreso.model.js`: Sincronizar nombres con DB (`tipo_evaluacion`) y blindar validación 0-5.
- [x] 1.2 Create `src/modules/progresos/__tests__/progreso.model.test.js`: Unit tests for normalization and ranges (RED).
- [x] 1.3 Implement model logic to pass tests (GREEN).
- [x] 1.4 Create `src/modules/progresos/services/progresoDataService.js`: Implement `calcularPromedio` and `detectarRiesgo`.

## Phase 2: API & Data Processing

- [x] 2.1 Refactor `src/modules/progresos/api/progresosApi.js`: Clean up returns to use model instances.
- [x] 2.2 Create `src/modules/progresos/__tests__/progresoDataService.test.js`: Test promedios logic and risk thresholds.
- [x] 2.3 Implement `prepareBulletinData` in the service to decouple PDF generation from API.

## Phase 3: UI & UX Refinement (Core Style)

- [x] 3.1 Refactor `src/modules/progresos/views/progresosView.js`: Adopt `page-header`, `table-compact` and responsive badges.
- [x] 3.2 Implement "Alertas de Riesgo" visual feedback in the student list.
- [x] 3.3 Refactor "Boletín" download to use the new institutional PDF format.
- [x] 3.4 Integrate `AppModal` for creating and editing grades.

## Phase 4: Verification & Final Cierre

- [x] 4.1 Create `src/modules/progresos/__tests__/progresos.integration.test.js` for full CRUD and bulletin flow.
- [x] 4.2 Run `npm run test:run` for the whole project.
- [x] 4.3 Manual check: Verify rounding logic and PDF styles.
