# Proposal: Finalización Módulo Clases (Fase 5)

## Intent
Completar, modularizar y estandarizar el Módulo de Clases Académicas. El objetivo es reducir la complejidad de la vista principal (extrayendo componentes), unificar la lógica de validación en el modelo `Clase` y asegurar que la gestión de horarios y alumnos sea robusta y consistente con el resto de los módulos core.

## Scope

### In Scope
- Extraer la lógica del formulario de clase a un componente dedicado: `src/modules/clases/components/claseModal.js`.
- Refactorizar `clasesApi.js` para usar el modelo `Clase` en las operaciones de creación y actualización.
- Estandarizar las validaciones de solapamiento de horarios (maestro y salón) centralizándolas en el flujo del modelo.
- Refinar la interfaz de usuario: pulir la alternancia entre vista de Tabla y vista de Calendario.
- Mejorar la integración con el módulo de Alumnos para la inscripción (`alumnoInscripcionModal.js`).
- Implementar suite de tests completa para el modelo, API y componentes extraídos.

### Out of Scope
- Gestión de asistencias (Fase 6).
- Planificación curricular detallada (Fase 7).

## Capabilities

### New Capabilities
- `academic-class-management`: Gestión integral de clases, horarios y asignación de recursos (salones/maestros) con detección de conflictos.

### Modified Capabilities
- None

## Approach
Aplicar una refactorización agresiva de la vista `clasesView.js` para mover la lógica de UI pesada (modales) a componentes especializados. Unificar el motor de validación en la clase `Clase`, permitiendo que tanto la vista como la API compartan las mismas reglas de negocio. Utilizar `AppModal` como base para toda la interacción.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/clases/components/` | New | Creación de `claseModal.js`. |
| `src/modules/clases/views/` | Modified | Refactorización masiva de `clasesView.js` (reducción de tamaño y modularidad). |
| `src/modules/clases/api/` | Modified | Integración con el modelo `Clase`. |
| `src/modules/clases/__tests__/` | New/Modified | Suite de tests robustecida. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regresión en lógica de conflictos | Medium | Pruebas unitarias exhaustivas para `validarHorario` y `Clase.validate()`. |
| Complejidad en vista calendario | Low | Mantener la implementación actual de FullCalendar/Custom-Grid pero desacoplada. |

## Rollback Plan
Revertir mediante Git. Al ser una refactorización arquitectónica, el esquema de la base de datos se mantiene intacto.

## Dependencies
- `modulo-programas-completion`: Ya completado (las clases dependen de programas).
- `rls-permisos-maestros`: Ya completado (asegura la visibilidad de clases por maestro).

## Success Criteria
- [ ] Lógica de modales extraída exitosamente a `claseModal.js`.
- [ ] `clasesView.js` reducido significativamente en tamaño y complejidad.
- [ ] Detección de conflictos verificada mediante tests automáticos.
- [ ] Flujo de inscripción de alumnos operando sin errores con el nuevo patrón.
- [ ] 100% de tests de la fase pasando en verde.
