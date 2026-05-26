# Reliability Sprint Design

**Goal:** Elevar el proyecto de 7.5 → 8.5/9 agregando cobertura de tests, aplicando la migración DB pendiente y consolidando la capa de manejo de errores.

**Architecture:** Tres fases ejecutadas en orden B (Tests → Migración → Reliability). Los tests validan la lógica del parser antes de que más datos entren a la DB; la migración protege la integridad de datos con el índice UNIQUE parcial; el reliability layer cierra los huecos de robustez operacional.

**Tech Stack:** Vitest + jsdom, Supabase CLI (`supabase db push`), Vanilla JS ES Modules.

---

## Fase 1 — Tests

### Alcance

Expandir `src/portal-maestros/utils/__tests__/observationParser.test.js` con 5 nuevos bloques.

Las funciones privadas (`_isMetaCommentary`, `_attachImplicitSubject`, `_splitDualAlerts`) se testean **indirectamente** a través de `segmentObservation` — correcto para Vanilla JS sin bundler que no expone internals.

### Bloques a agregar

#### 1. Meta-commentary filter (`_isMetaCommentary` via `segmentObservation`)

| # | Input | Expected |
|---|-------|----------|
| 1 | `"Es fundamental que continuemos trabajando en la práctica para asegurarnos de que todos progresen."` | `groups.length === 0` — la oración es comentario institucional, no observación |
| 2 | `"Matias continuó trabajando en la escala de Sol."` | `groups.length === 1` — "continuó trabajando" en contexto de alumno NO es meta-commentary |

#### 2. Implicit subject inheritance (`_attachImplicitSubject` via `segmentObservation`)

Roster: `[Evans Rodriguez, Matias Carmen]`

| # | Input | Expected |
|---|-------|----------|
| 1 | `"Evans logró ubicar el primer dedo. El alumno además demostró buena postura."` | 2 groups, ambos con `alumnos[0].id === '1'` (Evans) |
| 2 | `"Toda la clase trabajó bien. El alumno mostró avances."` | group[1] NO hereda — "toda la clase" es colectivo, no individual; `alumnos` vacío o grupo |

#### 3. Implicit collective (`isImplicitColectivo` via `segmentObservation`)

Roster: `[Evans Rodriguez, Matias Carmen]`, presentes: ambos

| # | Input | Expected |
|---|-------|----------|
| 1 | `"Hoy revisamos la lección 11 de CrickBoom y practicamos los compases 33 al 40."` | `groups[0].scope === 'grupo'`, `groups[0].alumnos` contiene ambos alumnos presentes |

#### 4. Dual alert split (`_splitDualAlerts` via `segmentObservation`)

Roster: `[Evans Rodriguez]`

| # | Input | Expected |
|---|-------|----------|
| 1 | `"Evans no logró sostener el arco correctamente y además mostró dificultad para concentrarse durante los ejercicios."` | 2 groups: uno con `alertDetails.type === 'RIESGO_PEDAGOGICO'`, otro con `alertDetails.type === 'ATENCION'` |

#### 5. Integration — texto CrickBoom completo

Roster: `[Evans Rodriguez, Matias Carmen, Alfred Smith]`, presentes: los 3.

Input (texto original de la sesión):
```
Hoy en clase, revisamos la lección n° 11 de CrickBoom y practicamos los compases 33 al 40.
Matias dominó muy bien la pieza y tocó con seguridad todos los compases.
Evans sigue mostrando dificultad para colocar correctamente la mano izquierda.
Algunos alumnos ya están tocando Estrellita con ambas manos.
Es fundamental que continuemos trabajando en la práctica y la repetición para asegurarnos de que todos los alumnos estén progresando de manera equilibrada.
```

Expected:
- `groups.length === 4` (no 5 — la oración meta es filtrada)
- `groups[0].scope === 'grupo'` — lección colectiva
- `groups[1].alumnos[0].id === 'matias'`, `groups[1].estado.value === 'LOGRADO'`
- `groups[2].alumnos[0].id === 'evans'`, `groups[2].alerta === true`, `groups[2].alertDetails.type === 'RIESGO_PEDAGOGICO'`
- `groups[3].scope === 'subgrupo_indeterminado'`, `groups[3].requires_confirmation === true`

### Comando de ejecución
```bash
npx vitest run src/portal-maestros/utils/__tests__/observationParser.test.js
```

Expected output: **9 tests passing** (5 existentes + 4 nuevos casos base + integration = ~9 `it()` blocks).

---

## Fase 2 — Migración DB

### Archivo
`supabase/migrations/20260525_progresos_unique_constraint.sql`

### Contenido (ya existe, no se modifica)
```sql
CREATE UNIQUE INDEX IF NOT EXISTS progresos_upsert_idx
  ON public.progresos (alumno_id, clase_id, sesion_clase_id, contenido_dsl)
  WHERE contenido_dsl IS NOT NULL;
```

### Comando
```bash
supabase db push
```

### Verificación
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'progresos'
  AND indexname = 'progresos_upsert_idx';
```

Expected: 1 fila devuelta con el `indexdef` correcto.

---

## Fase 3 — Reliability Layer

### Fix 1: CHANNEL_ERROR (Supabase Realtime)

**Archivo:** `src/portal-maestros/views/asistenciaView.js`

**Root cause probable:** `supabase.channel()` o `supabase.auth.onAuthStateChange()` se llama múltiples veces cuando la vista se re-renderiza sin limpiar la suscripción anterior.

**Fix:** Guardar referencia al subscription en una variable de módulo y llamar `.unsubscribe()` antes de crear uno nuevo. Patrón:

```js
let _authListener = null

function _setupRealtimeListener(supabase) {
  if (_authListener) {
    _authListener.subscription?.unsubscribe()
  }
  _authListener = supabase.auth.onAuthStateChange((event, session) => {
    // handler
  })
}
```

### Fix 2: Paginación en `_renderProgresos`

**Archivo:** `src/portal-maestros/views/alumnoPerfilView.js`

**Cambio:** La query actual carga todos los registros. Agregar `limit(20)` y un botón "Cargar más" con offset incremental.

```js
// Query paginada
const { data } = await supabase
  .from('progresos')
  .select('...')
  .eq('alumno_id', alumnoId)
  .order('fecha_evaluacion', { ascending: false })
  .range(offset, offset + 19)   // 20 registros por página
```

El botón "Cargar más" llama `_renderProgresos(container, alumnoId, offset + 20)` y **appends** — no reemplaza — las nuevas entradas al DOM existente.

### Fix 3: `safeAsync` wrapper

**Archivos:** `src/portal-maestros/views/asistenciaView.js`, `src/portal-maestros/views/alumnoPerfilView.js`

Reemplazar los `try/catch` sueltos con un wrapper consistente:

```js
async function safeAsync(fn, { onError } = {}) {
  try {
    return await fn()
  } catch (err) {
    console.error('[safeAsync]', err)
    if (onError) onError(err)
    else AppToast.error('Error inesperado: ' + err.message)
    return null
  }
}
```

Cada operación async que hoy tiene su propio `try/catch` pasa a usar `safeAsync(() => ..., { onError: ... })`.

---

## Criterios de éxito

| Criterio | Cómo verificar |
|----------|---------------|
| Todos los tests pasan | `npx vitest run` → 0 failures |
| Índice DB aplicado | Query `pg_indexes` devuelve `progresos_upsert_idx` |
| Sin CHANNEL_ERROR en consola | Abrir asistenciaView, navegar 3 veces, revisar consola |
| _renderProgresos no carga más de 20 | Alumno con >20 registros → aparece botón "Cargar más" |
| Error handling consistente | Simular error de red → AppToast con mensaje claro |

---

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `src/portal-maestros/utils/__tests__/observationParser.test.js` | Modificar — agregar tests |
| `src/portal-maestros/views/asistenciaView.js` | Modificar — CHANNEL_ERROR fix + safeAsync |
| `src/portal-maestros/views/alumnoPerfilView.js` | Modificar — paginación + safeAsync |
| `supabase/migrations/20260525_progresos_unique_constraint.sql` | Aplicar vía CLI (no modificar) |
