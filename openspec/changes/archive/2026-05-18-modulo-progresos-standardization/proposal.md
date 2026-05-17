# Proposal: Estandarización Módulo Progresos (Fase 8)

## Intent
Completar y profesionalizar el Módulo de Progresos y Calificaciones. El objetivo es eliminar la discrepancia de nombres de campos entre el modelo y la base de datos, centralizar el cálculo de rendimiento académico y asegurar que la generación de boletines PDF siga los estándares institucionales, todo bajo una arquitectura modular y testeable.

## Scope

### In Scope
- Refactorizar `Progreso.model.js` para sincronizar campos (ej. `tipo_evaluacion`) con la base de datos de Supabase.
- Crear `src/modules/progresos/services/progresoDataService.js` para cálculos de promedio, detección de alumnos en riesgo y preparación de datos para boletines.
- Refactorizar `progresosApi.js` para retornar instancias del modelo y simplificar operaciones de escritura.
- Actualizar `progresosView.js` para adoptar el patrón "Core Refinement" (tablas responsivas, badges de estado cualitativo).
- Implementar suite de tests unitarios para la lógica de promedios y validaciones de rango de notas (0-5).

### Out of Scope
- Gestión de becas basadas en promedios (Fase posterior).
- Integración con pasarelas de pago de matrículas.

## Capabilities

### New Capabilities
- `academic-grading-management`: Gestión estandarizada de calificaciones, promedios y alertas académicas con soporte para exportación institucional.

### Modified Capabilities
- None

## Approach
Consolidar el modelo `Progreso` como el validador central de notas y estados académios. Refactorizar la capa de datos para que la vista consuma promedios ya calculados por un servicio de negocio, en lugar de realizar cálculos en el renderizado. Aplicar `AppModal` y `AppToast` para una interacción fluida.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/progresos/models/` | Modified | Sincronización de esquema y normalización. |
| `src/modules/progresos/api/` | Modified | Estandarización de retornos y limpieza de lógica PDF. |
| `src/modules/progresos/services/` | New | Creación de `progresoDataService.js`. |
| `src/modules/progresos/views/` | Modified | Refactorización visual y delegación al servicio. |
| `src/modules/progresos/__tests__/` | New | Suite de pruebas de lógica académica. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistencia en promedios históricos | Low | Implementar redondeo estandarizado a 2 decimales en el nuevo servicio. |
| Complejidad en el boletín PDF | Medium | Usar `jspdf-autotable` con una plantilla de estilos única para la institución. |

## Rollback Plan
Revertir mediante Git. Los datos en Supabase permanecen inalterados (los cambios son en la capa de lógica de aplicación).

## Dependencies
- `modulo-clases-completion`: Ya completado (los progresos dependen de clases y alumnos).

## Success Criteria
- [ ] Modelo `Progreso` sincronizado y validado (notas 0.0 - 5.0).
- [ ] Vista de progresos responsiva y con alertas de "En Riesgo" visuales.
- [ ] Servicio de datos calculando promedios correctamente (verificado con tests).
- [ ] Boletín PDF generado con formato institucional y resumen de rendimiento.
