# Proposal: Integración de Ruta Gamificada

## Intent

Finalizar la integración de la nueva vista de Ruta Gamificada en el Portal de Maestros, sustituyendo la vista técnica anterior por una experiencia interactiva ("estilo Duolingo") que incluya semáforos de progreso y la capacidad de transferir temas directamente a la asistencia diaria.

## Scope

### In Scope
- Cablear `rutaGameificadaView.js` en el router de maestros (`src/main-maestros.js`).
- Implementar el sistema de "Handoff" de indicadores seleccionados a la vista de asistencia.
- Integrar el selector de clases con la recarga dinámica del árbol de ruta y sus semáforos.
- Eliminar la vista anterior `rutaPlayerView.js` y limpiar sus referencias (Deuda técnica).
- Soportar el "Modo Demo" con datos mock de semáforos.

### Out of Scope
- Edición de la estructura de la ruta desde el portal del maestro (es solo lectura para ellos).
- Notificaciones push al completar niveles.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `ruta-player-view`: Evolucionar de una barra de progreso colapsable a un árbol interactivo con semáforos y handoff de temas.

## Approach

Sustituir el renderizado del caso 'ruta' en el router principal para usar `renderRutaGameificadaView`. Implementar un `store` simple en `sessionStorage` para el intercambio de datos entre la ruta y la asistencia (patrón Mediador). Usar los helpers de RLS recientemente creados para asegurar que el maestro solo vea semáforos de sus alumnos.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/main-maestros.js` | Modified | Cableado del router y limpieza de imports. |
| `src/portal-maestros/views/rutaGameificadaView.js` | Modified | Integración con el selector de clase y persistencia de handoff. |
| `src/portal-maestros/views/asistenciaView.js` | Modified | Lógica para consumir temas inyectados desde la ruta. |
| `src/portal-maestros/views/rutaPlayerView.js` | Removed | Eliminación definitiva. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Pérdida de performance en rutas grandes (>160 nodos) | Medium | Implementar lazy-loading por niveles si se detecta lentitud. |
| Confusión del usuario con el nuevo flujo | Low | Mantener el banner azul informativo en la asistencia cuando hay un tema inyectado. |

## Rollback Plan

Revertir los cambios en `src/main-maestros.js` para apuntar de nuevo a la vista anterior (si no ha sido borrada) o restaurar desde Git.

## Dependencies

- `rls-permisos-maestros`: Ya completado (provee seguridad para las consultas de semáforos).

## Success Criteria

- [ ] La vista de Ruta muestra el árbol con colores de semáforo correctos por clase.
- [ ] Al seleccionar un indicador y pulsar "Usar como tema", la app navega a Asistencia y el tema aparece precargado.
- [ ] La vista vieja ha sido eliminada y no hay errores de consola por referencias muertas.
- [ ] 100% de tests unitarios de la nueva vista pasando.
