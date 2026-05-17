# Delta for Ruta de Contenidos — Player View

> **Change**: actualizacion-portales | **Domain**: ruta-player-view | **Type**: MODIFIED capability

## MODIFIED Requirements

### Requirement: RUTA-01 — Interactive Route Tree Display

The system SHALL display a Duolingo-style route tree with blocks → levels → nodes → indicators, where each level and node shows a traffic-light semaphore (green/yellow/gray) based on `indicator_attempts` data. Levels with < 80% green indicators in the previous level SHALL display as locked. (Previously: route tree showed a collapsed bar inside `routeTreeBar.js` with no indicator-level semaphore or interactive assignment)

#### Scenario: Tree loads with semaphore colors

- GIVEN the teacher selects a class on the Ruta view
- WHEN the route tree loads
- THEN each node SHALL display a semaphore icon (🟢 green when `attempts >= totalAlumnos AND every nota >= 4`; 🟡 yellow when at least one attempt exists; ⚫ gray when zero attempts)
- AND each level SHALL show a progress bar with percentage completed

#### Scenario: Locked level cannot expand

- GIVEN a level whose previous level has < 80% green indicators
- WHEN rendering that level
- THEN the level SHALL display with a 🔒 icon
- AND the level body SHALL remain hidden (nodes not visible)
- AND the tooltip SHALL read: "Completá el nivel anterior al 80% para desbloquear"

#### Scenario: Level toggles expand/collapse

- GIVEN a non-locked level is visible
- WHEN the teacher clicks the level header
- THEN the level body SHALL toggle between visible and hidden
- AND the chevron SHALL rotate 90 degrees when expanded

### Requirement: RUTA-02 — Indicator Selection and Classroom Assignment

The teacher SHALL be able to select any indicator and assign it as the day's lesson topic, which auto-injects into the `asistenciaView` DSL editor. (Previously: no indicator selection or topic handoff existed)

#### Scenario: Select indicator opens action panel

- GIVEN the tree is loaded with visible indicators
- WHEN the teacher clicks an indicator row
- THEN a sticky action panel SHALL appear at the bottom
- AND the panel SHALL show breadcrumb (Block › Level › Node), indicator name, and "📌 Usar como tema de hoy" button

#### Scenario: Assign topic navigates to asistencia with pre-filled text

- GIVEN the teacher has selected an indicator and clicked "Usar como tema de hoy"
- THEN `rutaTopicStore.setRutaTema()` SHALL persist the selection to `sessionStorage`
- AND the app SHALL navigate to `#/hoy`
- AND when the teacher opens a class session matching `claseId`
- THEN the DSL editor SHALL auto-insert `[Indicator Name] ` text
- AND a blue banner SHALL display: "Tema cargado desde Ruta: [indicator name]"

#### Scenario: Cancel pending topic

- GIVEN a topic is pending in `sessionStorage`
- WHEN the teacher clicks "Cancelar" on the pending banner
- THEN `sessionStorage` SHALL clear the entry
- AND the banner SHALL disappear

### Requirement: RUTA-03 — Class Selector

The system SHALL allow the teacher to switch between classes and reload the route tree accordingly.

#### Scenario: Switch class refreshes tree

- GIVEN the tree is visible for class A
- WHEN the teacher selects class B from the dropdown
- THEN the tree SHALL re-render with semaphore data for class B
- AND the action panel SHALL close (no indicator selected)

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | Tree renders with blocks > levels > nodes > indicators | Browser visual check |
| AC-02 | Every node has a semaphore color | `loadRouteTree()` response has non-null `semaphore` per node |
| AC-03 | Locked levels show 🔒 and disabled | Integration: check DOM for locked class |
| AC-04 | Action panel appears on indicator click | DOM: check `#ruta-action-panel` innerHTML |
| AC-05 | Topic handoff lands in DSL editor | `consumeRutaTema()` returns stored value in asistencia |
| AC-06 | Lazy-load for routes > 160 nodes | `rutaService` paginates levels beyond 160 nodes |

### Cross-reference: Accessibility

WCAG AA accessibility requirements for this view are defined in `openspec/specs/accessibility-audit/spec.md`:
- **Requirement 11** — Heading hierarchy (`<h1>`), ARIA tree semantics (`role="tree"`, `role="treeitem"`, `aria-expanded`), keyboard navigation, inline style extraction to CSS classes
