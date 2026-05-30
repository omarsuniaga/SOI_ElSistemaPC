# Delta for student-observation-tracking

## ADDED Requirements

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
