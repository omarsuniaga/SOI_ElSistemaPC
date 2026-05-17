# Tasks: Teacher-Authorized Student Registration (registro-alumnos)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~920 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Single PR (size exception) |
| Delivery strategy | exception-ok |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

## Phase 1: Infrastructure

- [ ] 1.1 Create `supabase/migrations/20260516_permisos_maestros.sql` — UUID PK, boolean flags, concedido_por, timestamps
- [ ] 1.2 Create `src/assets/data/mocks/permisos.json` — sample permission entries per teacher

## Phase 2: Backend Module (permisos)

- [ ] 2.1 Create `src/modules/permisos/models/permiso.model.js` — Permiso class with validate() returning string[] errors
- [ ] 2.2 Create `src/modules/permisos/api/permisosSupabase.js` — SELECT all, SELECT by maestro, UPSERT with concedido_por
- [ ] 2.3 Create `src/modules/permisos/api/permisosMock.js` — in-memory array, delay(), upsert, fail-closed defaults
- [ ] 2.4 Create `src/modules/permisos/api/permisosApi.js` — dispatcher via config.isDemoMode (mock/supabase)
- [ ] 2.5 Create `src/modules/permisos/hooks/usePermisos.js` — singleton hook, subscribe/fetch/reset pattern
- [ ] 2.6 Create `src/modules/permisos/permisos.router.js` — register route via router.register()
- [ ] 2.7 Create `src/modules/permisos/index.js` — export api, Permiso, usePermisos, registerRoutesPermisos

## Phase 3: Admin UI

- [ ] 3.1 Create `src/modules/permisos/views/permisosView.js` — Bootstrap table, toggle switches, optimistic UI with error rollback, empty/loading/error states
- [ ] 3.2 Modify `src/main.js` — add permisos to MODULES_REGISTRY and NAV_GROUPS (Sistema group)

## Phase 4: Portal Service

- [ ] 4.1 Create `src/portal-maestros/services/permisoService.js` — getPermisos(maestroId), fail-closed {false,false}, DataAdapter dispatch

## Phase 5: Portal Registration View

- [ ] 5.1 Create `src/portal-maestros/views/registroAlumnoView.js` — Apple card form, student fields, class selector, client-side validation, duplicate detection, submit via alumnosApi
- [ ] 5.2 Modify `src/main-maestros.js` — add `registrar-alumno` view container, route handler, conditional nav item
- [ ] 5.3 Update `src/assets/data/mocks/alumnos.json` — add fields expected by registration form

## Phase 6: Tests

- [ ] 6.1 Unit: permisoModel.validate() — valid/missing/invalid field permutations
- [ ] 6.2 Unit: permisosMock CRUD — create, read, update, upsert semantics
- [ ] 6.3 Unit: permisoService.getPermisos() fail-closed — mock API throws, assert {false,false}
- [ ] 6.4 Integration: admin toggle → actualizarPermiso called with correct role payload
- [ ] 6.5 Verify: `npm run test:run` passes with zero regressions
