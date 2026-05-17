# Design: Integración de Ruta Gamificada

## Technical Approach

Sustituir la vista de ruta actual por la nueva vista gamificada (`rutaGameificadaView.js`), conectándola al router principal y habilitando el flujo de transferencia de temas (handoff) hacia la asistencia diaria mediante `sessionStorage`. La vista utilizará `loadRouteTree` de `rutaService.js` para renderizar una jerarquía de 4 niveles (Bloques, Niveles, Nodos e Indicadores) con semáforos de progreso.

## Architecture Decisions

### Decision: Mediador para Handoff de Temas

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Query Params | URL sucia, difícil de manejar con router complejo | Rechazado |
| Custom Events | Requiere que ambas vistas estén montadas | Rechazado |
| **sessionStorage** | Persistente entre recargas de página, simple | **Elegido** |

**Rationale**: `sessionStorage` permite una comunicación desacoplada entre la vista de Ruta y la vista de Asistencia (que pueden no coexistir en el DOM). El servicio `rutaTopicStore.js` encapsula esta lógica.

### Decision: Modelo de Datos del Árbol

**Choice**: Usar `loadRouteTree` de `rutaService.js`.
**Rationale**: Este servicio ya implementa la lógica de agregación de semáforos y el estado de bloqueo de niveles, centralizando la lógica de negocio pesada fuera de la vista.

## Data Flow

1. **Ruta View**: Maestro selecciona Clase → `rutaService.loadRouteTree(claseId)` → Renderiza árbol.
2. **Selección**: Maestro hace clic en Indicador → Muestra Panel de Acción.
3. **Handoff**: Clic en "Usar como tema" → `setRutaTema(tema)` → `router.navigate('asistencia')`.
4. **Asistencia View**: `renderAsistenciaView` llama a `consumeRutaTema()` → Si hay tema, lo inyecta en el editor DSL y muestra banner.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/main-maestros.js` | Modify | Actualizar imports: `renderRutaGameificadaView` en lugar de `renderRutaPlayerView`. |
| `src/portal-maestros/views/rutaGameificadaView.js` | Modify | Implementar renderizado completo de bloques, niveles e indicadores. |
| `src/portal-maestros/views/asistenciaView.js` | Modify | Asegurar que el banner de tema cargado tenga un botón "Cancelar" operativo. |
| `src/portal-maestros/views/rutaPlayerView.js` | Delete | Eliminar vista técnica obsoleta. |

## Interfaces / Contracts

### Tema Handoff Structure
```javascript
{
  indicatorId: "uuid",
  nombre: "Nombre del indicador",
  nodeNombre: "Nodo",
  levelNombre: "Nivel",
  blockNombre: "Bloque",
  claseId: "uuid"
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `rutaGameificadaView` | Verificar que renderiza el header y el selector de clases. |
| Unit | `rutaTopicStore` | Verificar persistencia y consumo de temas. |
| Integration | Flow Ruta -> Asistencia | Simular clic en "Usar como tema" y verificar navegación + inyección de texto. |

## Migration / Rollout

No requiere migración de datos (solo lectura de tablas existentes). El despliegue es inmediato al actualizar el router.

## Open Questions

- [ ] ¿Debemos implementar el scroll suave automático hacia el último nivel desbloqueado? (Sugerencia para Phase 2).
