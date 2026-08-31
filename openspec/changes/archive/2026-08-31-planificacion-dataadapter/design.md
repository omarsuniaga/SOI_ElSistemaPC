# Design: Planificación DataAdapter Refactor

## Technical Approach

Triple-file adapter following the proven `alumnos` pattern: dispatcher routes between Supabase and Mock implementations via `config.isDemoMode`. Consumers change one import path; zero behavioral changes.

### Architecture Overview

```
src/modules/planificacion/api/
├── planificacionSupabase.js  ← git mv from planificacionApi.js (Supabase impl only)
├── planificacionAdapter.js   ← NEW dispatcher (replaces exports)
└── planificacionMock.js      ← NEW localStorage + seed impl

Consumers (import path change only):
├── hooks/usePlanificacion.js         ← reads (3 fns)
├── views/planificacionView.js        ← writes (4 fns) + 4 direct supabase calls
├── components/aprobacionPlanificacionesModal.js ← marcarRevisada/Ejecutada
├── ../../portal-maestros/views/asistenciaView.js ← crearPlanificacion
└── index.js                          ← re-export path

Data flow:
    View/Hook/Component ──import──→ planificacionAdapter.js ──delegate──→ supabase|mock
                                         │
                                    config.isDemoMode? ──→ true? → mockImpl
                                                         ──→ false? → supabaseImpl
```

## Architecture Decisions

### Decision: Dispatcher Pattern (via `alumnosApi.js` precedent)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Dispatcher** (adapter = re-export map) | Zero runtime overhead after init; dead-simple testability; aligns with `alumnosApi.js` pattern; easy rollback | **Adopt** |
| Class-based Strategy pattern | Over-engineered for 9 symmetric fns; adds `new` ceremony | Reject |
| Decorator per function | Unnecessary abstraction layer | Reject |

**Rationale**: The dispatcher pattern maps exactly to the 9 functions' identical signatures. No view logic changes. The `alumnos` module already proves this works — same team, same conventions.

### Decision: Mock Storage — localStorage with seed + overlay

**Choice**: Seed loaded from JSON at init; mutations persisted to `localStorage` key `planificaciones_demo`. On read, merge seed + localStorage overlay by ID. Writes go to overlay only.

**Rationale**: Seed survives page reload. Mutations survive session. Clearable via `localStorage.removeItem('planificaciones_demo')`. No migration needed — seed is always fresh.

### Decision: JOIN in Mock Mode

**Choice**: In-memory map join using existing `clases.json`. Create minimal `maestros.json` mock for `obtenerPlanificacionesConDetalles`.

**Rationale**: `clases.json` exists and has `id` + `nombre` fields. `maestros-disponibilidad.json` exists but has different ID schema — simpler to create a dedicated `maestros.json` with `id` + `nombre_completo` for the JOIN.

## Adapter Routing Logic

```js
// planificacionAdapter.js — exact pseudocode
import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './planificacionSupabase.js'
import * as mockImpl from './planificacionMock.js'

const getApi = () => config.isDemoMode ? mockImpl : supabaseImpl

export const obtenerPlanificaciones        = (...a) => getApi().obtenerPlanificaciones(...a)
export const obtenerPlanificacion          = (...a) => getApi().obtenerPlanificacion(...a)
export const obtenerPlanificacionesConDetalles = (...a) => getApi().obtenerPlanificacionesConDetalles(...a)
export const crearPlanificacion            = (...a) => getApi().crearPlanificacion(...a)
export const actualizarPlanificacion       = (...a) => getApi().actualizarPlanificacion(...a)
export const eliminarPlanificacion         = (...a) => getApi().eliminarPlanificacion(...a)
export const marcarRevisadasMasivo         = (...a) => getApi().marcarRevisadasMasivo(...a)
export const marcarRevisada                = (...a) => getApi().marcarRevisada(...a)
export const marcarEjecutada               = (...a) => getApi().marcarEjecutada(...a)
```

## Mock Implementation Design

### Storage Schema

```
localStorage key: "planificaciones_demo"
Value shape: {
  version: 1,
  records: { [id]: PlanificacionRow, ... },
  created_at: "ISO"
}
```

### Seed Data

New file: `src/assets/data/mocks/planificaciones.json`
- 6-8 varied rows (mix of estados: planificado, ejecutado, revisado)
- Diverse instrumento values (Piano, Violín, Flauta, Canto)
- Realistic `clase_id` values matching `clases.json`
- `maestro_id` values matching new `maestros.json` mock
- IDs prefixed `demo-` to avoid collision with real data

### Seeding Flow

1. Module init: check localStorage for `planificaciones_demo`
2. If absent: write seed JSON to localStorage
3. If present with `version !== 1`: re-seed (wipe + write)
4. All reads: return merged view of seed + overlay

### CRUD Operations (Mock)

| Op | Implementation |
|----|---------------|
| `obtenerPlanificaciones(maestroId?)` | Load from localStorage, filter by maestroId if given, wrap in `Planificacion` |
| `obtenerPlanificacion(id)` | Find by id in localStorage, throw if not found |
| `crearPlanificacion(data)` | Generate `id` (crypto.randomUUID), validate via `Planificacion.validate()`, persist to localStorage |
| `actualizarPlanificacion(id, data)` | Read current from localStorage, merge, validate, persist |
| `eliminarPlanificacion(id)` | Remove from localStorage |
| `marcarRevisadasMasivo(ids)` | Batch-update `estado: 'revisado'` in records |
| `marcarRevisada(id)` | Delegates to marcarRevisadasMasivo([id]) |
| `marcarEjecutada(id)` | Single update `estado: 'ejecutado'` |

All mock ops simulate 200-500ms delay via `setTimeout` wrapper.

### In-Memory JOIN Logic

```js
// For obtenerPlanificacionesConDetalles in mock mode:
import clasesData from '../../../assets/data/mocks/clases.json'
import maestrosData from '../../../assets/data/mocks/maestros.json'

// Build lookup maps once:
const claseMap = new Map(clasesData.clases.map(c => [c.id, c]))
const maestroMap = new Map(maestrosData.map(m => [m.id, m]))

// After loading planificaciones from localStorage:
return planificaciones.map(p => new Planificacion({
  ...p,
  clase_nombre: claseMap.get(p.clase_id)?.nombre || 'Sin asignar',
  maestro_nombre: maestroMap.get(p.maestro_id)?.nombre_completo || 'Sin asignar'
}))
```

## Error Handling Strategy

| Scenario | Supabase Mode | Mock Mode |
|----------|--------------|-----------|
| Supabase down / network error | Throws as-is; error propagated to UI (already handled by consumers) | N/A — no network |
| localStorage corrupt (invalid JSON) | N/A | `try/catch` on parse; re-seed from JSON; log warning |
| Seed file missing (404) | N/A | Log error; return empty array; UI shows empty state |
| localStorage quota exceeded | N/A | `try/catch` on `setItem`; log warning; operation fails silently |

**Fail-degraded principle**: If mock storage is corrupt, re-seed automatically and log. Never crash the view.

## State Consistency

No runtime mode switching supported — `config.isDemoMode` is read at bootstrap. To switch modes:
1. Refresh page (re-reads `VITE_DEMO_MODE`)
2. Clear localStorage if transitioning from mock → real (optional but recommended)

If the same browser tab somehow toggled mode mid-session, the adapter would pick it up on next import. This is acceptable since `config.isDemoMode` includes `localStorage.getItem('demo_mode')` which could change. No stale data risk because each mode uses separate storage.

## Migration Strategy

1. `git mv src/modules/planificacion/api/planificacionApi.js src/modules/planificacion/api/planificacionSupabase.js`
2. Create `planificacionAdapter.js` with dispatcher (same 9 exports)
3. Create `planificacionMock.js` with localStorage-backed impl
4. Create seed data at `src/assets/data/mocks/planificaciones.json`
5. Create `src/assets/data/mocks/maestros.json` for JOIN support
6. Update `index.js`: `export * from './api/planificacionAdapter.js'`
7. Update 4 consumer import paths

**Git mv preserves history** — `git log --follow` works on the renamed file.

## View Refactor — 4 Direct Supabase Calls

The view has 4 raw `supabase` calls in 3 locations:

| Location | Lines | What it does | Solution |
|----------|-------|-------------|----------|
| `_openTemplateModal` onOpen | 466-469 | Fetch clases dropdown | Extract to `obtenerClases()` helper → route through adapter (or add to adapter) |
| `openEditModal` onOpen | 673-676 | Fetch clases dropdown (DUPLICATE) | Same helper; deduplicate |
| `_ejecutarPlan` | 799-803 | Fetch clase instrumento + plan_estudio | Extract to `obtenerClaseDetalle(claseId)` on adapter |
| `_ejecutarPlan` | 810-815 | Get current user → lookup maestro | Extract to `obtenerMaestroActual()` on adapter |

**Plan**: Add these 3 new functions to the adapter interface (and both implementations):
- `obtenerClases()` → `[{id, nombre}]`
- `obtenerClaseDetalle(id)` → `{instrumento, plan_estudio}`
- `obtenerMaestroActual()` → `{id}`

This keeps the view clean: replace `supabase.from(X)` with adapter calls. The mock implementations read from `clases.json` + `maestros.json` + fake `auth.getUser()`.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Adapter routing | Mock `config.isDemoMode` true/false; assert correct delegation |
| Unit | Mock CRUD | Create/read/update/delete cycle in mock; assert localStorage state |
| Unit | Mock JOIN | Verify `obtenerPlanificacionesConDetalles` populates `clase_nombre` |
| Unit | Model `toJSON` | Verify `instrumento` survives round-trip create → toJSON → parse |
| Integration | Existing model tests | Should pass unchanged (no model changes) |

No existing API tests (`planificacionApi*.test.js` doesn't exist). The rename won't break any tests. Existing `rutas.integration.test.js` and `planificacion.model.test.js` are unaffected.

## Rollback Plan

Per PR (3 chained PRs per proposal):

| PR | Content | Rollback |
|----|---------|----------|
| #1 | Rename + adapter + mock + seed + fix toJSON + index.js | `git revert <sha>` — adapter is not wired to consumers yet; safe |
| #2 | Consumer import changes + view refactor | `git revert <sha>` — import paths revert; view falls back to direct calls |
| #3 | Unit tests for mock | `git revert <sha>` — tests only, no prod code |

## Performance Considerations

- **localStorage limit**: ~5MB. Estimated planificacion record: ~2KB. Max ~2500 records before pressure. At ~50 planificaciones/month typical, this is safe for 4+ years.
- **In-memory JOIN maps**: `Map<id, row>` for clases (~30 rows) and maestros (~50 rows) — negligible memory (~50KB).
- **No pagination needed**: Mock mode is for demo/preview, not production scale.

## toJSON Bug Assessment

The model's `toJSON()` at `planificacion.model.js:114` already includes `instrumento` (line 126). **Fix is already in place**. The bug exists only if consumers use raw `Planificacion.toJSON()` which now works. Verified: `instrumento` survives `crearPlanificacion → toJSON → insert`. No code change needed.

## Re-Export Path

`index.js` currently does `export * from './api/planificacionApi.js'`. Change to `export * from './api/planificacionAdapter.js'`. Since the adapter re-exports all 9 function names, zero consumers break. No other modules import from `planificacionApi.js` directly except through `index.js` or the 4 consumers listed above.
