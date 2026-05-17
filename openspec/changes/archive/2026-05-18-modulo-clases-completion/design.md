# Design: Finalización Módulo Clases

## Technical Approach
Modularizar el módulo de Clases mediante la extracción de la lógica de formularios y la centralización de validaciones. Se migrará la lógica CRUD pesada desde `clasesView.js` hacia un nuevo componente `claseModal.js` y se reforzará el modelo `Clase.js` para manejar la validación de solapamientos de horarios de forma atómica.

## Architecture Decisions

### Decision: Extracción de Formulario a Componente
**Choice**: Crear `src/modules/clases/components/claseModal.js`.
**Rationale**: `clasesView.js` ha excedido el tamaño mantenible (60KB). Mover la lógica de creación/edición, gestión de múltiples slots de horario y selección de recursos (maestros/salones) a un componente dedicado mejora la legibilidad y permite el testeo aislado del formulario.

### Decision: Motor de Conflictos en el Modelo y API
**Choice**: Combinar `Clase.validate()` (lógica interna) con `clasesApi.verificarSolapamiento()` (lógica de servidor).
**Rationale**: El solapamiento depende del estado global de la base de datos (ocupación de salones y otros maestros), por lo que la validación debe ser asíncrona y ejecutarse tanto en el modal (pre-vuelo) como en la API (seguridad final).

## Data Flow
1. **Vista**: `clasesView.js` renderiza lista/calendario.
2. **Acción**: Clic en "Nuevo/Editar" -> llama a `claseModal.open({ onSuccess: refresh })`.
3. **Modal**: Gestiona inputs dinámicos de horario -> Al Guardar -> `new Clase(data).validate()` -> `clasesApi.crearClase(clase)`.
4. **Validación**: La API consulta `clase_horarios` para detectar solapamientos antes de realizar el `INSERT/UPDATE`.
5. **Cierre**: Éxito -> Cierra modal -> Toast -> `clasesView` refresca el `state` local y re-renderiza.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/clases/components/claseModal.js` | Create | Nuevo componente para el formulario dinámico de clases. |
| `src/modules/clases/views/clasesView.js` | Modify | Reducción masiva de código. Delegación de CRUD a modales. |
| `src/modules/clases/models/clase.model.js` | Modify | Ajustar para soportar el nuevo flujo de validación multi-horario. |
| `src/modules/clases/api/clasesApi.js` | Modify | Refactorizar `crearClase` y `actualizarClase` para usar el modelo y el motor de conflictos. |
| `src/modules/clases/__tests__/clase.model.test.js` | Modify | Añadir casos de prueba para solapamientos lógicos. |

## Interfaces / Contracts

### Clase Object (Hierarchical)
```javascript
{
  id: "uuid",
  nombre: "string",
  maestro_id: "uuid",
  programa_id: "uuid",
  instrumento: "string",
  horarios: [
    { dia: "string", hora_inicio: "time", hora_fin: "time", salon_id: "uuid" }
  ],
  max_alumnos: number,
  estado: "activa" | "suspendida" | "finalizada"
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `Clase.model` | Validar lógica de horas (inicio < fin) y campos requeridos. |
| Integration | `clasesApi` | Mock de Supabase para simular solapamientos de salón y maestro. |
| Component | `claseModal` | Verificar que se pueden añadir/quitar filas de horario dinámicamente. |

## Migration / Rollout
No requiere migración de datos. Es una refactorización de código para mejorar mantenibilidad y seguridad de datos.

## Open Questions
- ¿Deseamos implementar la asignación de múltiples maestros (co-enseñanza) en esta fase? (Postergado si no se solicita).
