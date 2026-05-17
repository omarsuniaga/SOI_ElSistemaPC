# Design: Finalización Módulo Programas

## Technical Approach
Refactorizar el módulo de Programas para alinearlo con la arquitectura core del proyecto (API -> Model -> View). Se introducirá una clase `Programa` para centralizar la lógica de validación y normalización, y se actualizará la vista para usar componentes compartidos (`AppModal`, `AppToast`) y estilos responsivos estandarizados.

## Architecture Decisions

### Decision: Modelo de Datos Formal
**Choice**: Clase ES6 `Programa` en `models/programa.model.js`.
**Rationale**: Permite desacoplar las reglas de validación de la interfaz de usuario, facilitando el testing unitario y asegurando que los datos enviados a la API sean siempre íntegros.

### Decision: Estado UI Centralizado
**Choice**: Objeto `state` local en `programasView.js` con soporte para filtrado en memoria.
**Rationale**: Mantiene la reactividad de la búsqueda sin realizar peticiones constantes a la base de datos, mejorando la experiencia de usuario percibida.

## Data Flow
1. **Carga**: `renderProgramasView` -> `obtenerProgramas()` -> Instancias de `Programa` -> `state.programas`.
2. **Filtrado**: Input Search -> `applyFilters()` -> Renderizado de filas basado en `state.programasOriginales`.
3. **Acción (Crear/Editar)**: Modal abre Form -> Input -> `new Programa(data).validate()` -> `programasApi.actualizar/crear`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/programas/models/programa.model.js` | Create | Nueva clase con constructor, `validate()` y `toJSON()`. |
| `src/modules/programas/views/programasView.js` | Modify | Refactorización para usar el modelo, tabla responsiva y botones compactos. |
| `src/modules/programas/api/programasApi.js` | Modify | Ajustar normalización para retornar instancias de `Programa`. |
| `src/modules/programas/__tests__/programa.model.test.js` | Create | Tests unitarios de validación. |
| `src/modules/programas/__tests__/programas.integration.test.js` | Create | Tests de flujo completo (Mock API). |

## Interfaces / Contracts

### Programa Object
```javascript
{
  id: "uuid",
  nombre: "string (max 100)",
  descripcion: "string (max 500)",
  nivel: "string (enum)",
  activo: "boolean",
  created_at: "iso-date"
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `programa.model.js` | Probar todas las reglas de validación (nombres vacíos, niveles inválidos). |
| Unit | `programasApi.js` | Verificar normalización y manejo de errores (Modo Mock). |
| Integration | `programasView.js` | Simular CRUD y verificar que el DOM se actualiza correctamente. |

## Migration / Rollout
No requiere migración de base de datos. La actualización es puramente a nivel de aplicación (Lógica y UI).

## Open Questions
- ¿Deseamos agregar un campo de 'Costo' o 'Categoría' a los programas en esta fase? (Postergado para Phase 2 si no se solicita).
