# academic-program-management Specification

## Purpose
Gestionar la oferta académica de la institución (Programas), permitiendo a los administradores definir nombres, niveles, descripciones y duraciones estimadas. Asegura la integridad de los datos mediante validaciones estrictas y proporciona herramientas de exportación para auditoría.

## Requirements

### Requirement: Program List Management
El sistema DEBE mostrar una lista de todos los programas registrados con soporte para filtrado por nombre y estado (activo/inactivo).

#### Scenario: List displays all active programs
- GIVEN an authenticated administrator is on the Programs view
- WHEN the view loads
- THEN a responsive table SHALL display all active programs
- AND EACH row SHALL show the initials of the program, name, level, and current status.

#### Scenario: Filter programs by name
- GIVEN a list of programs exists
- WHEN the administrator types "Cuerdas" in the search box
- THEN the table SHALL display only programs whose name contains "Cuerdas".

### Requirement: Academic Program Validation (Model)
El sistema DEBE validar los datos de un programa antes de permitir su persistencia.

- **Nombre**: Requerido, máximo 100 caracteres.
- **Nivel**: Requerido, debe pertenecer al catálogo de niveles permitidos.
- **Descripción**: Opcional, máximo 500 caracteres.
- **Duración**: Opcional, debe ser un número positivo si se proporciona.

#### Scenario: Prevent saving with empty name
- GIVEN a new Program instance
- WHEN the name is empty or only whitespace
- THEN the `validate()` method SHALL return a "Nombre es obligatorio" error.

#### Scenario: Validate predefined levels
- GIVEN a program being edited
- WHEN the user selects a level not in the `NIVELES` constant
- THEN the system SHALL return a validation error.

### Requirement: CRUD Operations and Modal Interface
El sistema DEBE proporcionar una interfaz basada en modales para crear, editar y eliminar programas sin recargar la página.

#### Scenario: Successful program creation
- GIVEN the "Nuevo Programa" modal is open
- WHEN the administrator fills valid data and clicks "Guardar"
- THEN the system SHALL persist the data via `programasApi`
- AND SHALL close the modal and refresh the list automatically
- AND SHALL show a success toast notification.

#### Scenario: Delete confirmation
- GIVEN an existing program
- WHEN the administrator clicks the delete button
- THEN the system SHALL show a confirmation modal before proceeding
- AND SHALL NOT delete the record until the user confirms.

### Requirement: Standardized PDF Export
El sistema DEBE permitir la descarga de la lista actual de programas en formato PDF, siguiendo el diseño institucional.

#### Scenario: Export current view
- GIVEN a filtered list of programs
- WHEN the administrator clicks "PDF"
- THEN the system SHALL generate and download a PDF document
- AND the document SHALL include only the programs currently visible in the UI table.

## Acceptance Criteria
- [ ] Model `Programa` implements all validation rules.
- [ ] Modal-based CRUD works in Demo Mode (Mock) and Supabase Mode.
- [ ] List view is fully responsive (hides columns on mobile/tablet).
- [ ] 100% of validation logic covered by unit tests.
- [ ] PDF export includes institutional header and timestamp.
