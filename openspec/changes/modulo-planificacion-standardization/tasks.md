# Tasks: Estandarización Módulo Planificación

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500 - 700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Model/API) -> PR 2 (View Consolidation) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Logic & Data Layer | PR 1 | Model refinement and API standardization |
| 2 | View Consolidation | PR 1 | Merge 3 views into 1 responsive interface |

## Phase 1: Model & API Foundation (TDD)

- [ ] 1.1 Update `src/modules/planificacion/models/planificacion.model.js`: Add state guards and rich validation.
- [ ] 1.2 Create `src/modules/planificacion/__tests__/planificacion.model.test.js`: Test validation and status logic (RED).
- [ ] 1.3 Implement model logic to pass tests (GREEN).
- [ ] 1.4 Refactor `src/modules/planificacion/api/planificacionApi.js`: Normalize all returns as `Planificacion` instances.

## Phase 2: View Consolidation (Core Refinement)

- [ ] 2.1 Refactor `src/modules/planificacion/views/planificacionView.js`: Adopt `page-header` and `table-compact`.
- [ ] 2.2 Implement role-based tabs/filters (Mis Planes vs Todos) within the main view.
- [ ] 2.3 Integrate `DSLEditor` in the planning form modal.
- [ ] 2.4 Implement bulk approval UI for administrator role.
- [ ] 2.5 Port `quick-actions` for plan management (View, Edit, Delete, Run).

## Phase 3: Cleanup & Integration

- [ ] 3.1 Delete redundant views: `planificacionesMaestrosView.js` and `plantillasAdminView.js`.
- [ ] 3.2 Update `planificacion.router.js` to point all planning routes to the consolidated view.
- [ ] 3.3 Ensure PDF export consumes the new normalized model data.

## Phase 4: Verification & Final Cierre

- [ ] 4.1 Create `src/modules/planificacion/__tests__/planificacion.integration.test.js` for approval flow.
- [ ] 4.2 Run `npm run test:run` for the entire project.
- [ ] 4.3 Manual check: Verify role-based visibility in the consolidated view.
