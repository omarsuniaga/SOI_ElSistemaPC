# student-registration Specification

## Purpose

Authorized teachers register students and optionally enroll them in a class via a validated form. Creates `alumno` + `alumnos_clases` records. Only accessible when `puede_registrar_alumnos` is true.

## Requirements

### Requirement: Registration Form with Class Enrollment

Teachers MUST see a registration form with student fields (nombre, cedula, email, telefono, instrumento, representante info) and a dropdown of their assigned classes.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Form renders | authorized teacher navigates to registration | the view loads | form fields display with class selector and submit button |
| No assigned classes | authorized teacher has zero assigned classes | the view loads | message "No tienes clases asignadas" shows; submit disabled |
| Class at capacity | selected class is full | teacher selects it | warning "Esta clase está al máximo de capacidad" shows |

### Requirement: Field Validation

The system MUST validate required fields before submission: nombre, cedula, email, instrumento, and at least one representante contact method.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Missing required fields | teacher submits with empty required fields | form validates | inline validation errors appear next to each empty field; form not submitted |

### Requirement: Duplicate Detection

The system MUST check for duplicate cedula and duplicate email against existing `alumno` records before creating a new entry. Checks SHALL run server-side on submission.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Duplicate cedula | teacher submits a cedula that exists | system checks duplicates | inline error "Esta cédula ya está registrada"; form data preserved |
| Duplicate email | teacher submits an email that exists | system checks duplicates | inline error "Este email ya está registrado"; form data preserved |
| No duplicates | all fields are unique | system checks | validation passes; creation proceeds |

### Requirement: Student Creation

Successful submission MUST create one `alumno` record and one `alumnos_clases` record (if a class was selected). The system SHALL generate a UUID for the new student.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Registration with enrollment | valid form with class selected | teacher submits | `alumno` created with generated ID; `alumnos_clases` created; success toast; redirect to class roster |
| Registration without enrollment | valid form, no class selected | teacher submits | `alumno` created with generated ID; no `alumnos_clases` record; success toast; redirect to students list |
| Network failure | valid form submitted | persistence call fails | error "Error al registrar alumno" shown; all form data preserved |
| No permission | teacher lacks `puede_registrar_alumnos` | they access the route | "no autorizado" view renders; form never shown |

## Acceptance Criteria

- [ ] All required fields validated before submit
- [ ] Duplicate cedula detected with inline error message
- [ ] Duplicate email detected with inline error message
- [ ] Teacher with no assigned classes sees message and disabled submit button
- [ ] Capacity warning shown when selected class is full
- [ ] `alumno` record created on success
- [ ] `alumnos_clases` record created when class selected
- [ ] Created student visible in admin panel immediately
- [ ] Registration UI hidden when teacher lacks permission
- [ ] Full flow works in Demo mode (mock data)
