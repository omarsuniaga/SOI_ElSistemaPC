# Design: Cierre de Período Académico

## Technical Approach
El sistema adoptará un modelo de "Aislamiento Lógico por Scope" (Soft Partitioning). Todas las entidades operacionales de la base de datos se asociarán a la tabla maestra `periodos`. Un único periodo estará marcado como `'active'` en la base de datos.
El cliente de la PWA mantendrá en sesión o a través de la API el `periodo_activo_id` correspondiente. Todas las consultas a base de datos del DataAdapter añadirán dinámicamente este filtro para garantizar que las analíticas y listados muestren únicamente los datos del ciclo actual, manteniendo aislados los datos históricos.

---

## Architecture Decisions

### Decision: Tabla periodos y Claves Foráneas
**Choice**: Crear la tabla `periodos` y añadir `periodo_id` como clave foránea con valores por defecto en las tablas existentes.
**Rationale**: Evita la duplicación de tablas y el borrado destructivo. Al añadir `periodo_id` a `clases`, `indicator_attempts` y `asistencias`, podemos agrupar todos los datos operacionales de un año escolar y aislarlos en cascada al cambiar de período.

### Decision: Regla de Bloqueo de Períodos Cerrados
**Choice**: Trigger de base de datos o política RLS en Supabase que rechace `INSERT`, `UPDATE` o `DELETE` si el `periodo_id` del registro referencia a un período con estado `'closed'`.
**Rationale**: Garantiza la inmutabilidad de los datos históricos en el nivel más bajo (servidor), impidiendo que cambios accidentales del personal en la UI muten registros del año anterior.

---

## Data Flow

### 1. Cambio de Período Académico (Corte)
```
[Dirección: Ejecutar Cierre] ➔ [API / Adapter] ➔ [Transacción en Supabase]
                                                  ├── Actualizar periodo actual a 'closed'
                                                  └── Insertar nuevo periodo como 'active'
```

### 2. Flujo de Lectura Filtrado
```
[UI: Vista de Asistencia / Notas] ➔ [Adapter: obtenerProgresoGrupo]
                                      └── [Supabase] ➔ select * from indicator_attempts
                                                        where covered_by_clase_id = ?
                                                        and periodo_id = (select id from periodos where status = 'active')
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260716_cierre_periodo.sql` | Create | DDL de la tabla `periodos`, triggers de inmutabilidad y migración de llaves foráneas. |
| `src/modules/planificacion/api/weeklyPlanSupabase.js` | Modify | Filtrar guías y progresos por período activo. |
| `src/modules/clases/api/clasesSupabase.js` | Modify | Filtrar clases por período activo. |
| `src/modules/admin/views/cierrePeriodoView.js` | Create | UI de Dirección Ejecutiva para ejecutar cortes de periodo. |

---

## Interfaces / Contracts

### Periodos Schema
```sql
CREATE TABLE public.periodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(100) NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  status varchar(20) CHECK (status IN ('active', 'closed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
```

### Periodos API / Adapter
```javascript
// src/modules/admin/api/periodosAdapter.js
export async function obtenerPeriodos() { ... }
export async function obtenerPeriodoActivo() { ... }
export async function crearPeriodoYAplicaCorte(nombre, fechaInicio, fechaFin) { ... }
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (Model) | Reglas de inmutabilidad | Intentar mutar registros de un periodo cerrado en modo demo y esperar excepción. |
| Integration | Aislamiento de analítica | Crear registros en periodo 1, cambiar a periodo 2, verificar que las consultas devuelven arreglos vacíos de forma segura. |
