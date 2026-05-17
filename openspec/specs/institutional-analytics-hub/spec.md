# institutional-analytics-hub Specification

## Purpose
Proporcionar una visión estratégica y operativa del rendimiento institucional. El sistema debe transformar los datos crudos de asistencia y calificaciones en información accionable (KPIs), identificar proactivamente a los alumnos en riesgo y permitir la generación de reportes inteligentes asistidos por IA, facilitando la toma de decisiones basada en evidencia para maestros y directivos.

## Requirements

### Requirement: Unified Dashboard Orchestration
El sistema DEBE presentar un Dashboard centralizado que orqueste las diferentes dimensiones de análisis institucional.

| Dimensión | Fuente de Datos | Visualización |
|-----------|------------------|---------------|
| **Resumen General** | `vw_estadisticas_periodo` | KPI Cards (Alumnos, Clases, Promedio Global) |
| **Alertas Críticas** | `vw_alertas_activas` | Lista de prioridad (Rojo, Naranja, Amarillo) |
| **Riesgo de Abandono** | `vw_riesgo_abandono` | Gráfico de distribución y lista detallada |
| **Análisis IA** | GROQ Service | Generador de reportes narrativos |

#### Scenario: Role-based data visibility
- GIVEN a teacher is viewing the Dashboard
- WHEN the view loads
- THEN the system SHALL only display metrics related to the classes and students assigned to that teacher (verified via RLS security_invoker).

### Requirement: Standardized Metric Cards (KPI)
El sistema DEBE utilizar un componente visual estandarizado para mostrar métricas clave, incluyendo valor actual, tendencia (opcional) y etiqueta descriptiva.

#### Scenario: Render KPI card with alerts
- GIVEN there are 5 active red alerts
- WHEN the Dashboard summary renders
- THEN a card SHALL display "5" in red color with the label "Alertas Rojas".

### Requirement: Intelligent Risk Identification
El sistema DEBE listar proactivamente a los alumnos con puntajes de riesgo elevados, permitiendo al usuario profundizar en las causas (asistencia vs calificaciones).

#### Scenario: Drilling down into student risk
- GIVEN a student marked with "Riesgo Alto" in the dashboard
- WHEN the user clicks on the student row
- THEN a modal SHALL open showing the breakdown of absence streaks and low grades.

### Requirement: AI-Assisted Narrative Reporting
El sistema DEBE permitir generar un resumen narrativo del estado de una clase o alumno utilizando modelos de lenguaje (LLM), basándose en los datos estadísticos actuales.

#### Scenario: Generate class summary
- GIVEN a class with its statistics loaded
- WHEN the user clicks "Generar Análisis IA"
- THEN the system SHALL send the structured data to the `iaAnalisisService`
- AND SHALL display a natural language report describing strengths and weaknesses.

## Acceptance Criteria
- [ ] Dashboard unificado con navegación por pestañas funcional.
- [ ] Todas las visualizaciones respetan el RLS de maestro (Zero data leak).
- [ ] Diseño 100% responsivo (Cards se apilan en móvil).
- [ ] Generador de reportes IA incluye botón de "Copiar al portapapeles".
- [ ] 100% de la lógica de normalización de la API cubierta por tests.
