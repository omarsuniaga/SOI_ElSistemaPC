# Tasks: Estandarización Módulo Asistencias

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 350 - 450 |
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
| 1 | Model & Data Service | PR 1 | Unified states and timeline processing |
| 2 | View Refactoring | PR 1 | Standardized UI and handoff integration |

## Phase 1: Model & Data Foundation (TDD)

- [x] 1.1 Refactor `src/modules/asistencias/models/asistencia.model.js`: Sincronizar estados con DB y añadir normalizador legacy.
- [x] 1.2 Create `src/modules/asistencias/__tests__/asistencia.model.test.js` with state mapping scenarios (RED).
- [x] 1.3 Implement mapping logic in the model to pass tests (GREEN).
- [x] 1.4 Create `src/modules/asistencias/services/asistenciaDataService.js` to process timeline and counts.

## Phase 2: API & Service Integration

- [x] 2.1 Update `src/modules/asistencias/api/asistenciasApi.js`: Clean up grouping logic and ensure instances of `Asistencia` model.
- [x] 2.2 Refactor `registrarAsistenciaBulk` to validate models before upsert.
- [x] 2.3 Verify timeline aggregation in `asistenciaDataService.js` with unit tests.

## Phase 3: View Refactoring (UI & UX)

- [x] 3.1 Refactor `src/modules/asistencias/views/asistenciasView.js`: Use `page-header`, `table-compact` and delegate to data service.
- [x] 3.2 Update session cards in timeline to show P/A/J badges with new styles.
- [x] 3.3 Implement "Confirmación de Handoff" banner in the attendance taking flow.
- [x] 3.4 Integrate `AppModal` for viewing session details and justifications.

## Phase 4: Verification & Final Cierre

- [x] 4.1 Update `asistenciaReporteView.js` to consume standardized model data.
- [x] 4.2 Run `npm run test:run` and verify zero regressions in the 560+ test suite.
- [x] 4.3 Manual check: Verify P/A/J mapping from legacy records in the timeline.
