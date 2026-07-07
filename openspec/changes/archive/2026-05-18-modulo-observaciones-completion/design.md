# Design: Finalización Módulo Observaciones

## Technical Approach
Refactorizar el módulo de Observaciones para consolidar la arquitectura institucional (API -> Model -> View). Se reforzará el modelo `Observacion` para actuar como el validador central, se simplificará la API eliminando lógica de agrupamiento cruda, y se reconstruirá la vista utilizando el patrón de "Refinamiento Core" con componentes compartidos.

## Architecture Decisions

### Decision: Centralización de Lógica de Estados
**Choice**: El modelo `Observacion` gestionará el estado `abierta` -> `seguimiento` -> `resuelta`.
**Rationale**: Garantiza que las reglas de transición de estados se apliquen uniformemente tanto en la creación como en la actualización desde cualquier parte de la app.

### Decision: Integración de `AppModal` y `AppToast`
**Choice**: Sustituir el uso de `Toast` de Bootstrap por `AppToast` y el modal inline por `AppModal`.
**Rationale**: Elimina la dependencia directa de archivos JS de Bootstrap, mejora el rendimiento y asegura consistencia visual con los módulos de Clases y Progresos.

## Data Flow
1. **Vista**: `renderObservacionesView` -> solicita datos a `observacionesApi`.
2. **API**: Consulta Supabase -> recibe objetos -> genera instancias de `Observacion` -> retorna array al estado local.
3. **Filtros**: Search/Select -> `applyFilters()` -> Renderiza filas basándose en propiedades del modelo.
4. **Seguimiento**: Clic "Seguimiento" -> Abre `AppModal` -> Envía `seguimiento_observacion` -> API actualiza estado atómicamente.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/observaciones/models/observacion.model.js` | Modify | Añadir validaciones estrictas y normalización legacy. |
| `src/modules/observaciones/api/observacionesApi.js` | Modify | Estandarizar retornos y simplificar lógica de estados. |
| `src/modules/observaciones/views/observacionesView.js` | Modify | Refactorización completa: patrón responsivo y delegación a modales compartidos. |
| `src/modules/observaciones/__tests__/observacion.model.test.js` | Create | Suite de tests unitarios TDD. |
| `src/modules/observaciones/__tests__/observaciones.integration.test.js` | Create | Tests de flujo completo (Mock API). |

## Interfaces / Contracts

### Observacion Object
```javascript
{
  id: "uuid",
  alumno_id: "uuid",
  maestro_id: "uuid",
  tipo: "comportamiento" | "academico" | "social" | "disciplina",
  titulo: "string (5-100)",
  descripcion: "string (20-1000)",
  prioridad: "baja" | "media" | "alta",
  estado: "abierta" | "resuelta" | "seguimiento"
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `Observacion.model` | Validar límites de caracteres y tipos permitidos. |
| Unit | `observacionesApi` | Verificar normalización y cálculo de estadísticas en memoria. |
| Integration | Flow Seguimiento | Simular adición de nota de seguimiento y verificar cambio de estado. |

## Migration / Rollout
No requiere migración de datos. Actualización puramente de lógica y UI.

## Open Questions
- ¿Deseamos añadir un sistema de etiquetas (Tags) personalizadas? (Postergado).
