# planificacion-data-persistence Specification

## Purpose

Provee persistencia CRUD para planificaciones con backend dual (Supabase/localStorage). El adapter rutea según `config.isDemoMode` — sin cambios en consumidores.

## Requirements

### Requirement: Dual-Backend Routing

The system MUST expose 9 functions from a single adapter entry point (`planificacionAdapter.js`). The adapter MUST check `config.isDemoMode` once and delegate all calls to either the Supabase or the Mock implementation.

| Function | Input | Returns |
|----------|-------|---------|
| `obtenerPlanificaciones` | `maestroId?` | `Planificacion[]` |
| `obtenerPlanificacion` | `id` | `Planificacion` |
| `obtenerPlanificacionesConDetalles` | `maestroId?` | `Planificacion[]` (enriched) |
| `crearPlanificacion` | `planData: object` | `Planificacion` |
| `actualizarPlanificacion` | `id, updates: object` | `Planificacion` |
| `eliminarPlanificacion` | `id` | `void` |
| `marcarRevisadasMasivo` | `ids: string[]` | `Planificacion[]` |
| `marcarRevisada` | `id` | `Planificacion[]` |
| `marcarEjecutada` | `id` | `Planificacion` |

#### Scenario: Demo mode routes to mock
- GIVEN `config.isDemoMode === true`
- WHEN `crearPlanificacion(data)` is called
- THEN the adapter SHALL delegate to `planificacionMock.js`
- AND no network request to Supabase SHALL be made

#### Scenario: Production mode routes to Supabase
- GIVEN `config.isDemoMode === false`
- WHEN `obtenerPlanificaciones()` is called
- THEN the adapter SHALL delegate to `planificacionSupabase.js`

### Requirement: Mock CRUD with Seed

The mock implementation SHALL store data in localStorage under key `planificaciones_mock`. On first load (empty localStorage), it SHALL seed from `src/assets/data/mocks/planificaciones.json`. All mutations SHALL persist to localStorage. Every returned object SHALL be a `Planificacion` instance.

#### Scenario: Read with seed data
- GIVEN localStorage `planificaciones_mock` is empty
- WHEN `obtenerPlanificaciones()` is called in mock mode
- THEN it SHALL load seed from `planificaciones.json`
- AND SHALL return `Planificacion[]` with all seed records

#### Scenario: Create and persist
- GIVEN mock mode with seed loaded
- WHEN `crearPlanificacion({ tema: "Escala de Do", clase_id: "clase_001" })` is called
- THEN the new plan SHALL be stored in localStorage
- AND SHALL appear in a subsequent `obtenerPlanificaciones()` call

#### Scenario: Empty localStorage on first load without seed file
- GIVEN `planificaciones.json` is missing or unparseable
- WHEN `obtenerPlanificaciones()` is called in mock mode
- THEN it SHALL return `[]` without throwing
- AND SHALL log a warning to console

#### Scenario: Corrupted localStorage data
- GIVEN `planificaciones_mock` contains invalid JSON
- WHEN `obtenerPlanificaciones()` is called in mock mode
- THEN the system SHALL clear the corrupted entry
- AND SHALL fall back to seed data
- AND SHALL log a warning

### Requirement: Mock Enriched Queries

`obtenerPlanificacionesConDetalles` SHALL enrich each plan with `clase_nombre` and `maestro_nombre` by joining in-memory with existing mock data from `clases.json` and `maestros-disponibilidad.json`. Missing references SHALL default to `"Sin asignar"`.

#### Scenario: Join with mock clases
- GIVEN mock seed plan references `clase_id: "clase_001"`
- WHEN `obtenerPlanificacionesConDetalles()` is called
- THEN the result SHALL include `clase_nombre: "Violín Principiantes A"`
- AND `maestro_nombre` SHALL be populated from the mock

#### Scenario: Plan references non-existent clase
- GIVEN seed plan has `clase_id: "clase_999"` (not in mock)
- WHEN `obtenerPlanificacionesConDetalles()` is called
- THEN `clase_nombre` SHALL be `"Sin asignar"`

### Requirement: Mock Write Constraints

The mock SHALL enforce the same business rules as Supabase mode. Editing a `revisado` plan SHALL raise an error. Estado transitions SHALL follow the model's `canEdit()` and `canApprove()` rules.

#### Scenario: Cannot edit revisado plan
- GIVEN a plan with `estado: "revisado"`
- WHEN `actualizarPlanificacion(id, { tema: "new" })` is called in mock mode
- THEN it SHALL throw `"No se puede modificar un plan revisado"`

#### Scenario: Bulk approve empty selection
- GIVEN an empty array
- WHEN `marcarRevisadasMasivo([])` is called
- THEN it SHALL return `[]` without error

### Requirement: Model Serialization Completeness

`Planificacion.toJSON()` MUST include all fields persisted to the backend. `notas_dsl` is currently missing from `toJSON()` — MUST be added.

#### Scenario: toJSON includes notas_dsl
- GIVEN a Planificacion with `notas_dsl: "[Indicador] Test"`
- WHEN `model.toJSON()` is called
- THEN the output SHALL contain `notas_dsl: "[Indicador] Test"`

### Requirement: Consumer Import Migration

All consumers MUST import from `planificacionAdapter.js` instead of `planificacionApi.js`. Direct `supabase` calls in `planificacionView.js` (lines 673, 799–804, 810–816) MUST be routed through a helper or the adapter.

| File | Current Import | New Import |
|------|---------------|------------|
| `hooks/usePlanificacion.js` | `../api/planificacionApi.js` | `../api/planificacionAdapter.js` |
| `views/planificacionView.js` | `../api/planificacionApi.js` + `supabase` | `../api/planificacionAdapter.js` + helper |
| `components/aprobacionPlanificacionesModal.js` | `../api/planificacionApi.js` | `../api/planificacionAdapter.js` |
| `portal-maestros/views/asistenciaView.js` | `../../modules/planificacion/api/planificacionApi.js` | `../../modules/planificacion/api/planificacionAdapter.js` |
| `index.js` | `./api/planificacionApi.js` | `./api/planificacionAdapter.js` |

#### Scenario: View loads classes via helper in mock mode
- GIVEN `config.isDemoMode === true`
- WHEN `planificacionView` opens the edit modal
- THEN the clase dropdown SHALL populate from mock data via a helper
- AND no Supabase call SHALL be made

## Acceptance Criteria

- [ ] Demo mode (`VITE_DEMO_MODE=true`) shows seed data, zero Supabase errors
- [ ] `notas_dsl` survives create → edit → read cycle (both modes)
- [ ] `obtenerPlanificacionesConDetalles` returns `clase_nombre`, `maestro_nombre` in mock mode
- [ ] Editing a `revisado` plan throws in both modes
- [ ] Empty/corrupted localStorage degrades gracefully
- [ ] All 4 direct `supabase` calls in view are routed through adapter or helpers
- [ ] `index.js` exports from adapter path
- [ ] All existing tests pass
