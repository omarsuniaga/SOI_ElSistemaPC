# attendance-tracking-refinement Specification

## Purpose
Estandarizar el registro y seguimiento de la asistencia de los alumnos en las sesiones académicas. El sistema debe garantizar que los estados de asistencia sean consistentes entre el cliente y el servidor, facilitar la toma de asistencia masiva y proporcionar un historial claro para los maestros y administradores.

## Requirements

### Requirement: Standardized Attendance States
El sistema DEBE utilizar exclusivamente los estados oficiales definidos en la base de datos para todas las operaciones de asistencia.

| Estado | Significado | Valor (DB/Model) | Legacy Map (Mapeo automático) |
|--------|-------------|-------------------|-------------------------------|
| **Presente** | El alumno asistió a la clase | `presente` | `P` |
| **Ausente** | El alumno no asistió | `ausente` | `A` |
| **Justificado** | Inasistencia con motivo válido | `justificado` | `J` |

#### Scenario: Normalize legacy states
- GIVEN a data object from a legacy API or local cache using `P`
- WHEN instantiating a new `Asistencia` model
- THEN the model SHALL automatically normalize the state to `presente`.

### Requirement: Bulk Attendance Registration
El sistema DEBE permitir el registro simultáneo de la asistencia para todos los alumnos de una sesión, garantizando la atomicidad de la operación.

#### Scenario: Successful bulk save
- GIVEN a session with 10 students
- WHEN the teacher marks 8 as `presente` and 2 as `ausente` and clicks "Guardar"
- THEN the system SHALL send a single `upsert` request to the database
- AND SHALL update the local state only after a successful response.

### Requirement: Daily Session Timeline
El sistema DEBE mostrar un resumen cronológico de las sesiones pasadas, agrupadas por fecha, con conteos rápidos de asistencia.

#### Scenario: View session summary
- GIVEN the teacher is on the Attendance view
- WHEN the view loads
- THEN the system SHALL display a timeline of sessions
- AND EACH session card SHALL show the number of students marked as Presente, Ausente and Justificado.

### Requirement: Topic Handoff Integration
El sistema DEBE permitir la inyección automática del "Tema del día" si este ha sido seleccionado previamente desde la Ruta Gamificada.

#### Scenario: Auto-populate topic from Route
- GIVEN a topic has been selected in the Ruta Gamificada
- WHEN the teacher opens the Attendance view for the corresponding class
- THEN the system SHALL auto-fill the `tema_principal` field
- AND SHALL display an informative banner allowing the teacher to "Consumir" or "Cancelar" the topic.

## Acceptance Criteria
- [ ] Model `Asistencia` implements normalization for states (P/A/J -> full names).
- [ ] `asistenciasApi.js` uses `registrarAsistenciaBulk` for all multi-student updates.
- [ ] The view correctly displays the grouped timeline (asynchronous loading).
- [ ] Topic handoff is verified with integration tests (No data loss between views).
- [ ] 100% of attendance logic covered by TDD.
