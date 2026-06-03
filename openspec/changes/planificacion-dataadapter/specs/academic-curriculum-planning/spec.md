# Delta for academic-curriculum-planning

## MODIFIED Requirements

### Requirement: Centralized Multi-View Management

The system MUST unify plan management for teachers and administrators over the same data core with role-adapted views. Data access MUST be routed through `planificacionAdapter.js` which delegates to Supabase or localStorage-based mock depending on `config.isDemoMode`.
(Previously: Data access was direct via `planificacionApi.js` → Supabase)

#### Scenario: Admin bulk approval (unchanged)
- GIVEN a list of plans in `ejecutado` status
- WHEN the administrator selects multiple items and clicks "Aprobar"
- THEN the system SHALL perform a bulk update to `revisado`
- AND SHALL refresh the list with a success toast

#### Scenario: Mock mode bulk approval
- GIVEN `config.isDemoMode === true` and a list of plans in `ejecutado` status
- WHEN the administrator performs bulk approval
- THEN the adapter SHALL route to mock implementation
- AND plans SHALL be updated in localStorage
- AND the list SHALL refresh with seed + local changes

### Requirement: Academic Plan Validation (Model) — Updated

The model validation is unchanged. The adapter's `crearPlanificacion` and `actualizarPlanificacion` SHALL call `model.validate()` in both modes.
(Previously: Validation only in Supabase path)

#### Scenario: Validation in mock mode (unchanged behavior, new backend)
- GIVEN `config.isDemoMode === true`
- WHEN `crearPlanificacion({ tema: "ab" })` is called (1-char tema)
- THEN the adapter SHALL throw `"El tema debe tener mínimo 3 caracteres"`
- AND no data SHALL be written to localStorage

## MODIFIED Acceptance Criteria

- [ ] ~~`planificacionApi.js` returns instances of the model~~ → `planificacionAdapter.js` routes to the correct backend, returns `Planificacion` instances from both paths
- [ ] All other acceptance criteria unchanged
