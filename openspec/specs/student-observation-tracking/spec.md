# student-observation-tracking Specification

## Purpose
Registrar y gestionar incidencias, logros y notas de seguimiento sobre el desarrollo pedagógico y conductual de los alumnos. El sistema debe permitir una categorización clara por tipo y prioridad, facilitando la intervención oportuna de los docentes y la administración institucional.

## Requirements

### Requirement: Standardized Observation Model
El sistema DEBE validar rigurosamente la integridad de cada observación antes de permitir su guardado.

- **Título**: Requerido, entre 5 y 100 caracteres.
- **Descripción**: Requerida, entre 20 y 1000 caracteres.
- **Tipo**: Debe pertenecer al catálogo (comportamiento, académico, social, disciplina).
- **Prioridad**: Debe ser baja, media o alta.

#### Scenario: Prevent short descriptions
- GIVEN a teacher is writing an observation
- WHEN the description is less than 20 characters
- THEN the system SHALL return a validation error "La descripción debe tener mínimo 20 caracteres".

### Requirement: Multi-State Tracking Flow
El sistema DEBE gestionar el ciclo de vida de una observación desde su apertura hasta su resolución.

| Estado | Significado | Visual |
|--------|-------------|--------|
| `abierta` | Incidencia registrada sin acción tomada | Badge Gris |
| `seguimiento` | Se ha iniciado un proceso de atención | Badge Naranja |
| `resuelta` | El caso ha sido cerrado satisfactoriamente | Badge Verde |

#### Scenario: Add follow-up to observation
- GIVEN an existing "abierta" observation
- WHEN the user adds a follow-up note
- THEN the system SHALL transition the state to `seguimiento`.

### Requirement: Priority-Based Visualization
La lista de observaciones DEBE destacar visualmente los casos de alta prioridad para asegurar una atención prioritaria.

#### Scenario: Sort by priority
- GIVEN a list of observations with different priorities
- WHEN the view loads
- THEN the system SHALL provide filters and visual indicators (icons/colors) to distinguish High from Low priority.

### Requirement: Quantitative Analytics (Stats)
El sistema DEBE mostrar un resumen numérico del estado global de las observaciones.

#### Scenario: View stats summary
- GIVEN the administrator is on the observations dashboard
- WHEN the page renders
- THEN the system SHALL display total observations, pending cases, and distribution by priority.

### Requirement: Groq Analysis with Section Context

El sistema DEBE inyectar contexto de secciones orquestales con nombres de alumnos en el prompt de Groq (`ANALYZE_OBSERVATION_PROMPT`). El contexto DEBE construirse usando `buildSeccionContext()` del registro orquestal.

#### Scenario: Groq receives section context

- GIVEN a teacher writes "maderas trabajó c.23-49" and the roster has flauta/oboe/clarinete students present
- WHEN `analyzeObservation` sends the prompt to Groq
- THEN the prompt SHALL include a `ALUMNOS_POR_SECCION` block listing present students grouped by section.

### Requirement: Post-Groq Section Expansion

Después de recibir los items de Groq y antes de aplicar guardas finales, el sistema DEBE ejecutar `expandSeccionItems()` para convertir items con `seccion` en items con `alumnos` individuales.

La Guarda 5 (es_colectivo) DEBE omitir el marcado como colectivo cuando el item tiene `seccion` pero no `alumnos` — la expansión ocurre post-guardas.

#### Scenario: Section item expanded after Groq

- GIVEN Groq returns `{ contenido: "Escalas", seccion: "cuerdas", alumnos: [] }`
- WHEN post-processing runs expandSeccionItems
- THEN the item SHALL have `alumnos` populated with individual student IDs from the roster.

#### Scenario: Guard does not mark section-only items as collective

- GIVEN an item with `seccion: "maderas"` and no `alumnos`
- WHEN Guarda 5 evaluates the item
- THEN the item SHALL NOT be marked as `es_colectivo: true` (expansion is pending).

### Requirement: SessionSummaryPanel Grouped Display

El `SessionSummaryPanel` DEBE agrupar registros de `progresos` por `contenido_dsl` (trim + lowercase como key). Cada grupo muestra:

- Contenido como título
- Lista de alumnos con estado (colores según `estado_cualitativo`)
- Estado común del grupo o "mixto" si difieren
- Observaciones (si existen)
- Tarea (si existe)
- Etiqueta de sección orquestal si aplica
- Badge con cantidad de alumnos

El layout DEBE tener header (clase + fecha), secciones de contenido agrupadas, y footer con Compartir WhatsApp y Cerrar.

El botón de ciclo individual de estado DEBE eliminarse. Los estados se muestran como badge informativo.

#### Scenario: Group identical content

- GIVEN 5 progreso records with `contenido_dsl = "Danzón maderas c.23-49"`
- WHEN the panel renders
- THEN it SHALL show ONE card with 5 students listed, not 5 separate cards.

#### Scenario: Mixed states in group

- GIVEN 3 records share `contenido_dsl` but have different `estado_cualitativo` values (LOGRADO, EN_PROGRESO, LOGRADO)
- WHEN the panel renders
- THEN the group SHALL display "Mixto" as the state badge.

#### Scenario: WhatsApp text reflects grouping

- GIVEN the panel shows grouped records
- WHEN the user clicks "Compartir WhatsApp"
- THEN the generated text SHALL format as grouped: `🔹 Danzón maderas c.23-49 (LOGRADO)\nAlumnos: Ana, Pedro, Luis`

### Requirement: SaveProgress with Section Expansion

`saveProgressFromEvaluaciones()` DEBE aceptar evaluaciones con `seccion` en lugar de `alumno_id`. Antes de upsert, DEBE expandir la sección usando `getAlumnosBySeccion()` del registro orquestal. Cada alumno expandido genera un row individual.

#### Scenario: Save evaluation with section

- GIVEN a call to `saveProgressFromEvaluaciones` with an evaluation containing `{ seccion: "violines", contenido: "Escalas Sol M", estado: "LOGRADO" }`
- WHEN the function processes the evaluation
- THEN it SHALL create one progress record per student whose instrument matches "violín".

#### Scenario: Section with no matching roster students

- GIVEN a call with `{ seccion: "oboes", ... }` but no students in the roster play oboe
- WHEN the function expands the section
- THEN it SHALL skip creating records for that evaluation (no-op, no error).

## Acceptance Criteria
- [ ] Model `Observacion` implements all validation and state transition rules.
- [ ] `observacionesApi.js` returns model instances for all list and detail fetches.
- [ ] UI uses `table-compact` and `quick-actions` following Core standards.
- [ ] 100% of business logic verified with unit tests.
