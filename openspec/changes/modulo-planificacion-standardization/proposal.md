# Proposal: Estandarización Módulo Planificación (Fase 7)

## Intent
Unificar y profesionalizar el Módulo de Planificación Curricular. El objetivo es consolidar las múltiples vistas existentes en una experiencia coherente, blindar la API mediante el uso de instancias del modelo `Planificacion` y asegurar que la lógica de aprobación y ejecución de planes sea robusta y trazable.

## Scope

### In Scope
- Refactorizar `planificacionApi.js` para que todas las operaciones de escritura utilicen y validen instancias del modelo `Planificacion`.
- Consolidar las vistas de maestros y administradores bajo el patrón "Core Refinement" (tablas responsivas, estados visuales).
- Integrar el editor DSL (Domain Specific Language) de forma nativa en el flujo de creación de planes.
- Implementar suite de tests unitarios para la lógica de estados de planificación (`planificado` -> `ejecutado` -> `revisado`).
- Optimizar la exportación de planes a PDF con diseño institucional.

### Out of Scope
- Generación automática de planes mediante IA (se mantiene como servicio externo).
- Gestión de inventario de recursos físicos (solo se listan como texto).

## Capabilities

### New Capabilities
- `academic-curriculum-planning`: Gestión integral de planes de clase con estados de aprobación y soporte para lenguajes pedagógicos (DSL).

### Modified Capabilities
- None

## Approach
Adoptar el modelo `Planificacion` como el pivote central de todas las operaciones. Refactorizar la API para que actúe como un adaptador limpio hacia Supabase. Simplificar la interfaz de usuario eliminando redundancias entre las vistas de maestros y administradores, utilizando `AppModal` para el detalle y la edición. Seguir el protocolo Strict TDD para asegurar la integridad de la lógica de negocio.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/planificacion/api/` | Modified | Estandarización de retornos y validaciones. |
| `src/modules/planificacion/models/` | Modified | Refinamiento de reglas de validación y normalización. |
| `src/modules/planificacion/views/` | Modified | Consolidación y refactorización visual masiva. |
| `src/modules/planificacion/__tests__/` | New | Suite de pruebas de regresión y lógica. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Pérdida de datos en refactorización | Low | El esquema de BDD es estable; los cambios son puramente en la capa de aplicación. |
| Complejidad del editor DSL | Medium | Mantener el desacoplamiento entre el modelo y el editor mediante una interfaz de texto plana. |

## Rollback Plan
Revertir mediante Git. No hay cambios estructurales en las tablas de Supabase.

## Dependencies
- `modulo-clases-completion`: Ya completado (los planes dependen de clases activas).

## Success Criteria
- [ ] API normalizada retornando instancias del modelo `Planificacion`.
- [ ] Vistas consolidadas y 100% responsivas.
- [ ] Flujo de aprobación (estados) verificado mediante tests.
- [ ] Exportación PDF operativa con el nuevo formato.
