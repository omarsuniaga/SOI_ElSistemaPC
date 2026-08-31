# Design: Curriculo Tres Planos (Capa de Servicios)

## Technical Approach
Implementar una fachada compatible en `weeklyPlanSupabase.js` que intercepte y reemplace las consultas dirigidas a las tablas de planificación fantasma (`acm_*`) redirigiéndolas a la tabla canónica de producción `route_versions` (para la guía curricular) y a la tabla de progreso real `indicator_attempts` (para calificaciones).

---

## Architecture Decisions

### Decision: Redireccionar consultas de planificación a route_versions

| Opción | Tradeoff | Decisión |
| :--- | :--- | :--- |
| Crear tablas `acm_*` en prod | Requiere migración masiva; duplica datos del spine | Rechazar |
| **Adaptar capa de servicio** | Mapeo intermedio en JS; mantiene UI intacta y compatible | **Adoptar** |

**Rationale**: `route_versions` ya almacena el árbol curricular de forma completa. Adaptar el servicio evita alterar la UI y previene regresiones en la SPA en producción.

### Decision: Usar indicator_attempts para la persistencia del progreso

| Opción | Tradeoff | Decisión |
| :--- | :--- | :--- |
| Crear `student_indicator_progress` | Tabla vacía adicional; rompe sincronización central | Rechazar |
| **Adaptar a indicator_attempts** | Requiere resolver maestro en sesión; usa la tabla canónica de producción | **Adoptar** |

**Rationale**: `indicator_attempts` ya se utiliza para calificar en el portal. Enlazar la guía con esta tabla permite consolidar los semáforos de avance de forma unificada.

---

## Data Flow

```
Visualización:
Vista/UI ──> weeklyPlanAdapter ──> weeklyPlanSupabase ──> Query route_versions (status='published') ──> Retorna Plan Semanal

Calificación:
Vista/UI ──> registrarProgresoIndicador ──> Resolver maestro en sesión ──> Upsert a indicator_attempts (status, covered_by_clase_id)
```

---

## File Changes

| File | Action | Description |
| :--- | :--- | :--- |
| `weeklyPlanSupabase.js` | Modify | Redirigir consultas a `route_versions` e `indicator_attempts`. |
| `weeklyPlanMock.js` | Modify | Adaptar mocks para mantener la consistencia en Modo Demo. |

---

## Interfaces / Contracts

```js
// weeklyPlanSupabase.js — Helper de resolución de maestro
async function _obtenerMaestroIdActual() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')
  const { data: maestro } = await supabase
    .from('maestros')
    .select('id')
    .eq('email', user.email)
    .single()
  return maestro?.id || null
}
```

---

## Testing Strategy

| Layer | What to Test | Approach |
| :--- | :--- | :--- |
| Unit | Mapeo de `route_versions` a plan semanal | Mockear respuesta de Supabase y validar estructura resultante. |
| Integration | Inserción en `indicator_attempts` | Ejecutar upsert con sesión activa y validar claves únicas. |

---

## Migration / Rollout
No requiere migraciones de base de datos adicionales (las tablas e índices requeridos en `indicator_attempts` y `route_versions` ya existen). La subida de los archivos de servicio refactorizados activa el flujo de forma transparente.
