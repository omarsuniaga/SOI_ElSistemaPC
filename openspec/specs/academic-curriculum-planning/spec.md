# academic-curriculum-planning Specification

## Purpose
Gestionar el ciclo de vida de la planificación pedagógica institucional. El sistema debe permitir a los maestros diseñar sus lecciones usando lenguajes estandarizados (DSL), gestionar los estados de ejecución y permitir a la administración supervisar y aprobar los contenidos, asegurando la trazabilidad desde el diseño hasta el aula.

## Requirements

### Requirement: Standardized Planning States
El sistema DEBE gestionar rigurosamente el estado de cada plan según su ciclo de vida.

| Estado | Significado | Permisos de Edición |
|--------|-------------|----------------------|
| **Planificado** | En borrador o diseño inicial | Maestro y Admin |
| **Ejecutado** | El contenido ya se impartió en clase | Solo Admin |
| **Revisado** | Aprobado oficialmente por la administración | Bloqueado para todos |

#### Scenario: Transition from Planificado to Ejecutado
- GIVEN a class session is being registered
- WHEN the teacher selects a pre-existing plan
- THEN the system SHALL automatically transition the plan state to `ejecutado`.

### Requirement: DSL Editor Integration
El sistema DEBE permitir la creación de contenidos y objetivos utilizando un editor de texto enriquecido que soporte la inyección de etiquetas DSL (ej. `[Indicador]`, `{Actividad}`).

#### Scenario: Inject DSL tags into plan
- GIVEN the Planning form is open
- WHEN the user clicks a DSL shortcut (e.g., "Insertar Indicador")
- THEN the editor SHALL insert the corresponding tag at the cursor position
- AND the `Planificacion` model SHALL preserve these tags during JSON normalization.

### Requirement: Centralized Multi-View Management
El sistema DEBE unificar la gestión de planes para que tanto maestros como administradores operen sobre el mismo núcleo de datos con vistas adaptadas a su rol.

#### Scenario: Admin bulk approval
- GIVEN a list of plans in `ejecutado` status
- WHEN the administrator selects multiple items and clicks "Aprobar"
- THEN the system SHALL perform a bulk update to `revisado`
- AND SHALL refresh the list with a success toast.

### Requirement: Academic Plan Validation (Model)
El sistema DEBE validar atómicamente cada plan antes de permitir su persistencia.

- **Tema**: Requerido, máx 200 caracteres, mín 3 caracteres.
- **Clase**: Requerida (referencia válida).
- **Contenido**: Máx 2000 caracteres.
- **Objetivos**: Máx 1000 caracteres.

#### Scenario: Prevent saving invalid plan
- GIVEN a new Plan instance with a 1-character topic
- WHEN `validate()` is called
- THEN the system SHALL return a "El tema debe tener mínimo 3 caracteres" error.

## Acceptance Criteria
- [ ] Model `Planificacion` implements all validation and normalization rules.
- [ ] `planificacionApi.js` returns instances of the model for all fetch operations.
- [ ] UI is 100% responsive and uses `table-compact` pattern.
- [ ] Bulk approval flow is verified via unit tests.
- [ ] PDF Export follows institutional branding and includes DSL-formatted content.
