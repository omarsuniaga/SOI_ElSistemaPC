# Tasks: Estandarización Módulo Métricas

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600 - 800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (API & Components) -> PR 2 (Hub Orchestration) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data & Visual Atoms | PR 1 | Metrics API and MetricCard component |
| 2 | Analytics Hub (Dashboard) | PR 1 | Unified dashboard and view consolidation |

## Phase 1: Infrastructure & UI Atoms

- [ ] 1.1 Refactor `src/modules/metricas/api/metricsApi.js`: Standardize error handling and normalizers for `vw_*` views.
- [ ] 1.2 Create `src/modules/metricas/components/MetricCard.js`: Functional component for KPIs with trend support.
- [ ] 1.3 Create `src/modules/metricas/__tests__/metricsApi.test.js`: Test data mapping from SQL views (RED).
- [ ] 1.4 Implement normalizers in API to pass tests (GREEN).

## Phase 2: Hub Orchestration (Dashboard)

- [ ] 2.1 Refactor `src/modules/metricas/views/dashboardMetricasView.js`: Implement tab-based navigation (Resumen, Alertas, Riesgo, IA).
- [ ] 2.2 Migrate logic from `alertasView.js` into a sub-component within the Hub.
- [ ] 2.3 Migrate logic from `riesgoAbandonoView.js` into a sub-component within the Hub.
- [ ] 2.4 Integrate `groqService` for narrative reports within the "IA Analysis" tab.

## Phase 3: Consolidation & Cleanup

- [ ] 3.1 Delete redundant view files: `alertasView.js`, `destacadosView.js`, `riesgoAbandonoView.js`, `iaAnalisisView.js`.
- [ ] 3.2 Update `metricas.router.js` to route all analytics requests to the central Hub.
- [ ] 3.3 Ensure the global "Modo Demo" (Mock) is fully supported in the new Hub.

## Phase 4: Verification & Final Polish

- [ ] 4.1 Create `src/modules/metricas/__tests__/metricsHub.integration.test.js`: Verify tab switching and data isolation.
- [ ] 4.2 Run `npm run test:run` for the entire project.
- [ ] 4.3 Manual check: Verify responsive behavior on mobile and tablet breakpoints.
