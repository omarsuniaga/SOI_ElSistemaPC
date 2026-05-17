# academic-grading-management Specification

## Purpose
Gestionar el rendimiento académico de los alumnos mediante el registro de calificaciones, el cálculo automático de promedios y la detección de riesgos. El sistema debe asegurar que los boletines institucionales sean precisos, trazables y reflejen fielmente el avance pedagógico definido por el cuerpo docente.

## Requirements

### Requirement: Academic Performance Calculation
El sistema DEBE calcular automáticamente el promedio de cada alumno por clase y período, utilizando un esquema de redondeo a dos decimales.

#### Scenario: Calculate average for multiple evaluations
- GIVEN an alumno has 3 evaluations in a class: 4.0, 3.5, and 5.0
- WHEN the system calculates the average
- THEN the result SHALL be 4.17
- AND the student status SHALL be marked as "Satisfactorio".

#### Scenario: Detect student at academic risk
- GIVEN a student's average in a class falls below 3.0
- WHEN viewing the student in the list
- THEN the system SHALL display a "Riesgo Académico" alert badge (color red).

### Requirement: Standardized Grading Model (0-5)
El sistema DEBE validar que todas las calificaciones ingresadas se encuentren en el rango de 0.0 a 5.0 inclusive.

#### Scenario: Prevent invalid grade entry
- GIVEN a teacher is entering a new grade
- WHEN the input is 5.5 or -1
- THEN the `Progreso` model SHALL return a validation error
- AND persistences SHALL be blocked.

### Requirement: Institutional Report (Boletín PDF)
El sistema DEBE generar boletines académicos en formato PDF que incluyan el promedio acumulado, el desglose de evaluaciones y un indicador visual de rendimiento.

#### Scenario: Export institutional bulletin
- GIVEN an administrator selects an alumno
- WHEN the "Exportar Boletín" action is triggered
- THEN the system SHALL generate a PDF with the institutional header, a summary table of evaluations, and the calculated risk status.

### Requirement: Qualitative Progress States
Además de la nota numérica, el sistema DEBE permitir registrar un estado cualitativo para cada progreso.

| Estado | Significado | Visual Badge |
|--------|-------------|---------------|
| `en_progreso` | El alumno está trabajando en el objetivo | Azul (Primary) |
| `completado` | Objetivo alcanzado satisfactoriamente | Verde (Success) |
| `pendiente` | Evaluación aún no realizada | Gris (Secondary) |

## Acceptance Criteria
- [ ] Model `Progreso` implements strict range validation (0-5) and field mapping.
- [ ] `progresoDataService.js` calculates promedios and risk levels with unit tests.
- [ ] Progress list is fully responsive and uses institutional badges.
- [ ] PDF Bulletin matches institutional branding requirements.
- [ ] 100% of business logic covered by TDD.
