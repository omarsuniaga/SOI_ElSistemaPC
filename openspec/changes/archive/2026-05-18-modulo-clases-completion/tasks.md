# Tasks: Finalización Módulo Clases

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600 - 800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Model/API) -> PR 2 (Component/View) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Model & API Refactor | PR 1 | Strict validation and conflict detection logic |
| 2 | Component Extraction & View Cleanup | PR 1 | Create `claseModal.js` and shrink `clasesView.js` |

## Phase 1: Model & Foundation (TDD)

- [x] 1.1 Refactor `src/modules/clases/models/clase.model.js` to improve `validate()` for multi-schedule logic.
- [x] 1.2 Update `src/modules/clases/models/clase.model.test.js` with complex overlap scenarios (RED).
- [x] 1.3 Implement atomic validation in the model to pass tests (GREEN).

## Phase 2: Core API Implementation

- [x] 2.1 Refactor `crearClase` in `clasesApi.js` to use the `Clase` model and perform server-side conflict checks.
- [x] 2.2 Refactor `actualizarClase` to handle schedule updates by replacing existing slots atomically.
- [x] 2.3 Create `src/modules/clases/__tests__/clasesApi.test.js` to verify conflict detection via Supabase mocks.

## Phase 3: Component Extraction (claseModal)

- [x] 3.1 Create `src/modules/clases/components/claseModal.js` with the form skeleton.
- [x] 3.2 Move schedule slot management logic (add/remove rows) to the new component.
- [x] 3.3 Implement `open()` and `close()` methods using `AppModal`.
- [x] 3.4 Integrate resource selectors (Maestros, Salones, Programas) within the modal.

## Phase 4: View Refactoring (Cleanup)

- [x] 4.1 Refactor `src/modules/clases/views/clasesView.js` to remove inline form and modal code.
- [x] 4.2 Update `attachGlobalEvents` to call `claseModal.open()` for create/edit actions.
- [x] 4.3 Standardize the table and calendar toggle logic and ensure state persistence.
- [x] 4.4 Port the `quick-actions` pattern to the classes table.

## Phase 5: Verification & Polish

- [x] 5.1 Refine `alumnoInscripcionModal.js` to match the new component pattern.
- [x] 5.2 Update `clasesView.helpers.test.js` for the simplified view logic.
- [x] 5.3 Run `npm run test:run` for the whole project.
