# Tasks: Cierre de Período Académico

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250 - 400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Delivery strategy | ask-on-risk |
| Chain strategy | none |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB Schema & Migrations | PR 1 | Table periodos, keys and RLS rules |
| 2 | Data Layer & Adapter | PR 1 | API endpoints and mock seed adjustments |
| 3 | Admin Interface | PR 1 | View for Exec. Director to close/open periods |

---

## Phase 1: Database Foundation

- [ ] 1.1 Create migration SQL `supabase/migrations/20260716_cierre_periodo.sql`: Define `periodos` table, RLS, and add `periodo_id` to key tables.
- [ ] 1.2 Implement trigger/policy to block updates on records referring to a closed period.
- [ ] 1.3 Validate migration locally against the schema.

## Phase 2: Data & Adapter Integration (TDD)

- [ ] 2.1 Refactor DataAdapter/Mocks to support `obtenerPeriodoActivo` and `crearPeriodoYAplicaCorte`.
- [ ] 2.2 Write unit tests in `src/modules/admin/__tests__/periodos.test.js` verifying isolation of data when active period changes (RED).
- [ ] 2.3 Implement the adapter and mock logic to pass tests (GREEN).
- [ ] 2.4 Refactor `obtenerClases` and `obtenerProgresoGrupo` in `weeklyPlanSupabase.js` to filter by active period.

## Phase 3: Administrative UI (Corte)

- [ ] 3.1 Create view `src/modules/admin/views/cierrePeriodoView.js` for Dirección Ejecutiva role.
- [ ] 3.2 Add form to create new period and trigger the close of the current active period.
- [ ] 3.3 Add safety modal with confirmation warnings before executing the corte.
- [ ] 3.4 Point the router `admin.router.js` to the new view route.

## Phase 4: Verification & Cierre

- [ ] 4.1 Write integration test simulating the entire workflow: period 1 active -> record grades -> execute close -> period 2 active -> verify new records are empty -> verify old records are read-only.
- [ ] 4.2 Run `npm run test:run` to confirm all tests pass without regressions.
- [ ] 4.3 Sincronizar tasks and update roadmap state to 100%.
