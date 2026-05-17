# Delta for Ruta de Contenidos — Player View

> **Change**: ruta-gamificada-integration | **Domain**: ruta-player-view | **Type**: MODIFIED capability

## MODIFIED Requirements

### Requirement: RUTA-01 — Interactive Route Tree Display

The system SHALL display a Duolingo-style route tree with blocks → levels → nodes → indicators using the `rutaGameificadaView` component, replacing the technical view of `rutaPlayerView`. Each level and node shows a traffic-light semaphore (green/yellow/gray) based on `indicator_attempts` data. 
(Previously: the system used a technical view with less interactivity and was wired to a different component in the router)

#### Scenario: Tree loads with semaphore colors
- GIVEN the teacher selects a class on the Ruta view
- WHEN the route tree loads
- THEN each node SHALL display a semaphore icon (🟢 green, 🟡 yellow, ⚫ gray)
- AND each level SHALL show a progress bar with percentage completed

#### Scenario: Locked level cannot expand
- GIVEN a level whose previous level has < 80% green indicators
- WHEN rendering that level
- THEN the level SHALL display with a 🔒 icon
- AND the level body SHALL remain hidden

### Requirement: RUTA-02 — Indicator Selection and Topic Handoff

The system SHALL allow selecting an indicator to use as the "Topic of the Day", persisting it across views until consumed or cancelled.
(Previously: no automated handoff between Route and Asistencia existed)

#### Scenario: Assign topic persists and redirects
- GIVEN a selected indicator
- WHEN the teacher clicks "Usar como tema de hoy"
- THEN the system SHALL save the indicator name and class ID to `sessionStorage`
- AND SHALL redirect the teacher to the Asistencia view
- AND the Asistencia view SHALL auto-populate the topic input with the selected indicator name

#### Scenario: Cancel pending topic
- GIVEN a topic has been handed off from the Route
- WHEN the teacher clicks "Cancelar" on the information banner in Asistencia
- THEN the topic SHALL be removed from `sessionStorage`
- AND the banner SHALL disappear

## REMOVED Requirements

### Requirement: Technical Route Bar
(Reason: Replaced by the Duolingo-style tree for better teacher UX)
