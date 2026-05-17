# Proposal: Finalización Módulo Observaciones (Fase 10)

## Intent
Completar y profesionalizar el Módulo de Observaciones y Seguimiento. El objetivo es estandarizar el flujo de registro de incidencias pedagógicas, asegurar la coherencia entre el modelo y la base de datos, y refactorizar la vista principal para adoptar el patrón de "Refinamiento Core", facilitando el seguimiento proactivo de los alumnos.

## Scope

### In Scope
- Refactorizar `Observacion.model.js` para sincronizar campos y reglas de validación (título, descripción, prioridad).
- Refactorizar `observacionesApi.js` para retornar instancias del modelo y simplificar el manejo de estadísticas.
- Actualizar `observacionesView.js` para usar `AppModal`, `AppToast` y tablas responsivas con el patrón de `quick-actions`.
- Implementar suite de tests unitarios para las reglas de validación y estados de seguimiento.
- Mejorar la visualización del historial de seguimiento dentro del detalle de la observación.

### Out of Scope
- Sistema de envío de correos electrónicos a padres (se mantiene como registro interno).
- Adjuntar archivos multimedia a las observaciones.

## Capabilities

### New Capabilities
- `student-observation-tracking`: Gestión estandarizada de incidencias, prioridades y seguimiento continuo de alumnos.

### Modified Capabilities
- None

## Approach
Consolidar el modelo `Observacion` como el motor de validación. Refactorizar la vista principal para eliminar la duplicidad de lógica de modales, extrayéndola a componentes compartidos. Asegurar que las estadísticas de observaciones (Abiertas vs Resueltas) se carguen de forma asíncrona y eficiente. Seguir el flujo Strict TDD.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/observaciones/models/` | Modified | Refinamiento de validaciones y normalización. |
| `src/modules/observaciones/api/` | Modified | Estandarización de retornos (Model instances). |
| `src/modules/observaciones/views/` | Modified | Refactorización masiva hacia patrón "Core Refinement". |
| `src/modules/observaciones/__tests__/` | New | Suite de pruebas unitarias e integración. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistencia en prioridades históricas | Low | Implementar un normalizador en el modelo que mapee valores previos. |

## Rollback Plan
Revertir mediante Git. No hay cambios de esquema en Supabase.

## Dependencies
- `modulo-alumnos-completion`: Ya completado (las observaciones dependen de alumnos).

## Success Criteria
- [ ] Modelo `Observacion` validando título (mín 5) y descripción (mín 20).
- [ ] Vista 100% responsiva con filtros funcionales por tipo y prioridad.
- [ ] Flujo de seguimiento operativo a través de `AppModal`.
- [ ] 100% de la lógica de negocio cubierta por tests.
