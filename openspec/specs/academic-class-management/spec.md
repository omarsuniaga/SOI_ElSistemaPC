# academic-class-management Specification

## Purpose
Gestionar la oferta de clases académicas, permitiendo la asignación de maestros, salones, programas e instrumentos. El sistema debe garantizar que no existan conflictos de horario para los recursos compartidos y proporcionar una visión clara tanto en formato lista como en calendario institucional.

## Requirements

### Requirement: Class Conflict Detection (Resource Management)
El sistema DEBE impedir la creación o actualización de una clase si alguno de sus horarios genera un solapamiento para el maestro principal o para el salón asignado.

#### Scenario: Prevent teacher schedule overlap
- GIVEN a teacher is already assigned to "Clase A" on Monday from 08:00 to 10:00
- WHEN an administrator attempts to create "Clase B" for the same teacher on Monday from 09:00 to 11:00
- THEN the system SHALL return a "Conflicto de maestro" error
- AND SHALL NOT persist the change.

#### Scenario: Prevent room (salon) schedule overlap
- GIVEN "Salón 101" is occupied by "Clase A" on Tuesday from 14:00 to 15:00
- WHEN an administrator assigns "Salón 101" to "Clase C" on Tuesday from 14:30 to 16:00
- THEN the system SHALL return a "Conflicto de salón" error.

### Requirement: Multi-Schedule Support
Una clase PUEDE tener múltiples horarios asignados (ej. Lunes 8-10 y Miércoles 8-10).

#### Scenario: Manage multiple slots
- GIVEN the "Clase Modal" is open
- WHEN the user adds two different time slots with their respective days and rooms
- THEN the system SHALL validate ALL slots for conflicts before saving.

### Requirement: Class-Student Enrollment Integration
El sistema DEBE permitir inscribir y desinscribir alumnos de una clase, respetando el límite de capacidad máxima definido.

#### Scenario: Enroll student within capacity
- GIVEN a class with `max_alumnos = 10` and 5 students already enrolled
- WHEN the teacher adds a new student via `alumnoInscripcionModal`
- THEN the system SHALL successfully register the enrollment
- AND increment the current count.

#### Scenario: Prevent enrollment exceeding capacity
- GIVEN a class at full capacity (`max_alumnos` reached)
- WHEN attempting to add another student
- THEN the system SHOULD show a warning or prevent the action.

### Requirement: Dual-View Interface (Table & Calendar)
La vista de clases DEBE permitir alternar entre una tabla responsiva y una cuadrícula de calendario.

#### Scenario: Switch view persistence
- GIVEN the user is on the Clases view
- WHEN the user clicks the "Calendario" icon
- THEN the table SHALL be hidden
- AND the schedule SHALL be rendered in a weekly grid format
- AND the preference SHOULD be remembered during the session.

## Acceptance Criteria
- [ ] Clase `Clase` (Model) implements 100% of internal validation rules.
- [ ] `clasesApi.js` performs server-side conflict checks before any UPSERT.
- [ ] `claseModal.js` handles dynamic addition/removal of schedule rows.
- [ ] Responsive table uses `table-compact` and hides non-essential columns on mobile.
- [ ] UI reflects changes immediately after modal save (No full page reload).
