# Design: Alumnos Module — Audit Bug Fix & Improvement

**Change**: alumnos-audit-fixes
**Date**: 2026-06-20
**Version**: 1.0

---

## Technical Approach

Replace every in-place workaround in `src/modules/alumnos/` with a single consistent pattern per concern: one canonical domain function per computation, one AbortController per view, one field-name set (the real DB schema), and one API dispatcher per subsystem. The five delivery batches (A–E) are independent; each can be reverted without affecting the others.

---

## Architecture Decisions

### Decision 1: calcularEdad — canonical domain with { fallback } option

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep `domain/calcularEdad.js` throw-on-null contract, wrap at call sites | Safest; no logic change | **Chosen** |
| Add `{ fallback }` option to domain version | Allows callers to pass `null` directly | Chosen (extension, not replacement) |
| Delete `utils/alumnosUtils.js::calcularEdad` | Caller changes required | Required as part of this decision |

**Chosen**: Extend `domain/calcularEdad.js` with a second parameter `{ fallback = null } = {}` that short-circuits before the null-throw. The existing `today` injectable parameter stays. Remove the duplicate in `alumnosUtils.js`. All 6 callers (`alumnoCard.js`, `alumnosView.js`, `alumnoAdminView.js`, `reporteInscripcionesMes.js`, and any remaining callers found by `rg`) import from `domain/calcularEdad.js`.

**Rationale**: Keeps one file with testable injectable `today`. Callers that need null-safety pass `{ fallback: null }`, callers that want a throw keep calling as-is.

---

### Decision 2: calcularCompletitud — delete local version in reporteInscripcionesMes

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep local 14-field version | Diverges from 22-field domain; wrong completitud% in monthly report | Rejected |
| Import domain version; delete local function | Single source of truth | **Chosen** |

**Chosen**: Delete the local `calcularCompletitud` and `campoCompleto` helpers and the `CAMPOS_REQUERIDOS` constant from `reporteInscripcionesMes.js`. Add `import { calcularCompletitud } from '../domain/completitudAlumno.js'`. The display code adapts: use `result.porcentaje` and `result.camposFaltantes.length`.

**Risk**: The domain version uses different field keys (`nombre_completo`, `fecha_nacimiento`, etc.) which `normalizeAlumno` maps correctly. Verify that `obtenerAlumnosPorMes` returns normalized rows before this lands.

---

### Decision 3: Schema field-name migration — alumnoCard and useAlumnos

**Chosen mapping** (old → current DB schema as normalized by `normalizeAlumno`):

| Old field | Correct field |
|-----------|--------------|
| `alumno.name` | `alumno.nombre` |
| `alumno.es_activo` | `alumno.is_active` |
| `alumno.section` | `alumno.instrumento_principal` |
| `alumno.acudiente` | `alumno.familiar_nombre` |

`alumnoCard.js` — update template literals and the two `calcularEdad` calls (which already use `alumno.fecha_nacimiento` — no change there). Also update `createAlumnoListItem` which has the same old field names.

`useAlumnos.js::search()` — update `a.name` → `a.nombre`, `a.acudiente` → `a.familiar_nombre`. All other methods (`filterByEstado`, `getActivos`) that reference `a.es_activo` must change to `a.is_active` as well.

**Note**: `useAlumnos.js` is scheduled for deletion in Batch E. These schema fixes go in Batch A so the class is correct for any existing caller; deletion in Batch E removes the whole file once all callers are confirmed gone.

---

### Decision 4: escapeHTML — add " and ' escaping

`alumnosUtils.js::escapeHTML` currently escapes only `& < >`. HTML attributes can be broken with unescaped `"` or `'`. Replacement uses `String(str ?? '')` to handle null without a separate null guard.

**Chosen implementation** (in-place replacement, no new file):
```js
export function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

---

### Decision 5: AbortController pattern for SPA event-listener cleanup

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Manual `removeEventListener` per listener | Fragile; must track references | Rejected |
| AbortController with `{ signal }` on every `addEventListener` | One `abort()` cleans all | **Chosen** |
| Weak references | Non-standard; overkill | Rejected |

**Chosen**: Each view module declares a module-level `let abortController = null`. At the start of the render function, call `abortController?.abort()` then `abortController = new AbortController()`. All `addEventListener` calls inside that function receive `{ signal: abortController.signal }`.

Additionally, `postuladosView.js` and `postuladoCalendarioView.js` currently use `document.getElementById(...)` instead of `container.querySelector(...)`. Both must be updated to scope to `container`. This prevents stale references to elements from a previous navigation.

---

### Decision 6: Stale-closure fix for edit/delete modals

**Problem identified**: `openEditModal(id)` sets `state.editando = id` then the `onSave` async callback reads `state.editando`. If the user opens another modal before save completes, `state.editando` has changed.

**Chosen**: Capture `const capturedId = id` at the top of each modal opener. Use `capturedId` inside all async callbacks. `state.editando` can still be set for backward-compat rendering, but async operations must never read it back.

Same pattern for `openDeleteModal`: capture id immediately, use in the async confirm callback. Remove the `setTimeout` anti-pattern in delete if present — use `async/await` directly.

---

### Decision 7: CSV export — BOM + is_active fix + URL cleanup

Three independent fixes bundled in one function:

1. `a.estado` → `a.is_active ? 'Activo' : 'Inactivo'`
2. Blob prefix `'﻿'` (UTF-8 BOM) so Excel opens without encoding prompt
3. `setTimeout(() => URL.revokeObjectURL(url), 100)` after `link.click()`

No new abstraction needed — all changes are inside the existing `exportarCSV` function in `alumnosView.js`.

---

### Decision 8: Replace native dialogs

| Native call | Location | Replacement |
|-------------|----------|-------------|
| `alert(msg)` success | alumnosView, alumnoAdminView | `AppToast.success(msg)` |
| `alert(msg)` error | alumnosView, postuladosView | `AppToast.error(msg)` |
| `confirm(msg)` destructive | alumnosView delete | `AppModal.open({ ... })` confirm variant |
| `prompt(msg)` discard reason | editarAlumnoModal | Inline textarea inside AppModal |

`AppModal` already exists (`shared/components/AppModal.js`) and is imported by `alumnosView.js`. A dedicated `confirmModal.js` is NOT needed — use `AppModal.open` with a custom body string. If `AppModal` does not expose a confirm shorthand, use `AppModal.open({ title, body, onSave, onClose })` with a single "Confirm" button label.

**Risk**: Must verify `AppModal.open` API signature before Batch C. The existing `alumnosView.js` already imports and uses it; the API is known.

---

### Decision 9: Pagination — obtenerAlumnos

**Chosen**: Add `{ page = 0, pageSize = 50 } = {}` to `alumnosSupabase.js::obtenerAlumnos`. Add `.range(from, to)` and `{ count: 'exact' }` to the select. Return `{ alumnos, total }` (breaking change on return shape).

**Callers to update**: `alumnosApi.js` dispatcher must forward params and return the new shape. `alumnosView.js::renderAlumnosView` must destructure `{ alumnos, total }` and store `total` in state. Add pagination controls to the HTML: `<button id="btnPrevPage">`, `<button id="btnNextPage">`, `<span id="paginationInfo">Mostrando X–Y de Z</span>`.

`obtenerAlumnosMock.js::obtenerAlumnos` must also simulate pagination (slice the array) so tests pass in demo mode.

**Risk**: `obtenerAlumnosFiltradosYOrdenados` is a separate function that still returns all — leave it out of scope for this change (it's used for filtered views, not the main list).

---

### Decision 10: Memoize calcularCompletitud on load

**Chosen**: After loading alumnos in `renderAlumnosView`, map to attach `_completitud`:
```js
state.alumnosOriginales = rawAlumnos.map(a => ({
  ...a,
  _completitud: calcularCompletitud(a)
}));
```
`applyFilters` and `renderTableRows` read `a._completitud` (never call `calcularCompletitud(a)` inline). Underscore prefix signals internal computed property; not persisted or sent to API.

---

### Decision 11: Architecture cleanup

**alumno.model.js** — DELETE. The `Alumno` class uses old field names (`name`, `section`, `es_activo`, `acudiente`) that diverge completely from the real schema. No current caller passes data through it (verified: `index.js` re-exports it, but `rg 'new Alumno'` finds zero usages). Remove export from `index.js`.

**useAlumnos.js** — DELETE after Batch A schema fixes. `index.js` re-exports it but zero callers use `useAlumnos()` in the views (they use module-level `state` objects directly). Remove export from `index.js`.

**postulantesApi.js → postuladosMock.js** — Note: the existing API dispatcher is already `postulantesApi.js` (wraps `postulantesSupabase.js` + `postulantesMock.js`). The proposal refers to creating `postuladosApi.js`. Decision: do NOT create a new file. Instead, mark `postulantesApi.js` as the canonical dispatcher and add `// @deprecated alias` comments to any redundant re-export files. Rename is out of scope (would require all callers to update imports).

**buscarPostulante** — `postuladosMock.js` currently has no `buscarPostulante`. Add:
```js
export async function buscarPostulante(query) {
  await delay();
  const q = query.toLowerCase();
  return data.filter(p =>
    (p.nombre_completo || '').toLowerCase().includes(q) ||
    (p.email || '').toLowerCase().includes(q)
  );
}
```

---

### Decision 12: Reporte mensual — CSV + filters

**CSV**: Add `<button id="btnExportarCSVReporte">` to `reporteInscripcionesMes.js` HTML. On click, map `alumnosActuales` to rows with BOM-prefixed Blob. Columns: nombre, instrumento, municipio, fecha_inscripcion, completitud%, familiar_nombre, telefono. Reuse `escapeCSV` from `alumnosUtils.js` (add function if not present; simple `str.replace(/"/g, '""')`).

**Filters**: Add `<select id="filtroInstrumentoReporte">` (populated by deriving unique `instrumento_principal` values from `alumnosActuales`) and `<input id="filtroMunicipioReporte">` free-text. Both filter in-memory on `alumnosActuales`.

---

### Decision 13: localStorage namespace

All `postuladoPerfilView.js` localStorage accesses must use a keyed helper:
```js
const DOCS_KEY = (id) => `soi_docs_${id}`;
```
Replace raw string keys (`'docs'`, `'documentos'`, or any flat key) with `DOCS_KEY(alumnoId)`. On view unmount (AbortController abort), do NOT clear storage — it must survive navigation.

---

## Data Flow

```
DB (Supabase)
    │
    ▼
alumnosSupabase.js::obtenerAlumnos({ page, pageSize })
    │  returns { alumnos: NormalizedAlumno[], total: number }
    ▼
alumnosApi.js (dispatcher — demo → mock, prod → supabase)
    │
    ▼
alumnosView.js::renderAlumnosView(container)
    │  state.alumnosOriginales = alumnos.map(a => ({ ...a, _completitud: calcularCompletitud(a) }))
    │
    ├─→ applyFilters() → reads a._completitud (O(1))
    ├─→ renderTableRows() → reads a._completitud, a.nombre, a.is_active
    └─→ exportarCSV() → reads a.is_active (not a.estado), prepends BOM

domain/calcularEdad.js  ←─  imported by: alumnoCard, alumnosView, alumnoAdminView, reporteInscripcionesMes
domain/completitudAlumno.js  ←─  imported by: alumnosView, reporteInscripcionesMes (local version deleted)
utils/alumnosUtils.js::escapeHTML  ←─  all views (quote-safe after fix)
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/alumnos/domain/calcularEdad.js` | Modify | Add `{ fallback }` option; keep `today` injectable |
| `src/modules/alumnos/utils/alumnosUtils.js` | Modify | Remove local `calcularEdad`; fix `escapeHTML` to escape `"` and `'`; add `escapeCSV` |
| `src/modules/alumnos/components/alumnoCard.js` | Modify | `name`→`nombre`, `es_activo`→`is_active`, `section`→`instrumento_principal`, `acudiente`→`familiar_nombre`; import `calcularEdad` from domain |
| `src/modules/alumnos/hooks/useAlumnos.js` | Modify then Delete | Batch A: fix schema fields in `search()`. Batch E: delete file |
| `src/modules/alumnos/models/alumno.model.js` | Delete (Batch E) | Old schema; zero usages |
| `src/modules/alumnos/index.js` | Modify | Remove exports of `Alumno` and `useAlumnos` after deletions |
| `src/modules/alumnos/api/alumnosSupabase.js` | Modify | Add `{ page, pageSize }` to `obtenerAlumnos`; return `{ alumnos, total }` |
| `src/modules/alumnos/api/alumnosMock.js` | Modify | Fix hoisting bug; simulate pagination in `obtenerAlumnos` |
| `src/modules/alumnos/api/alumnosApi.js` | Modify | Forward pagination params; expose `total` from return |
| `src/modules/alumnos/views/alumnosView.js` | Modify | AbortController; container-scoped queries; stale-closure fix; CSV BOM+field fix; pagination controls; AppToast/AppModal replaces alert/confirm; memoize completitud |
| `src/modules/alumnos/views/alumnoAdminView.js` | Modify | Container-scoped queries; parallel fetch with Promise.all; unlock nombre field |
| `src/modules/alumnos/views/reporteInscripcionesMes.js` | Modify | Delete local `calcularCompletitud`; import from domain; add CSV export button; add instrument/municipality filters |
| `src/modules/alumnos/views/postulados/postuladosView.js` | Modify | `document.getElementById` → `container.querySelector`; AbortController; add name search; filter notification |
| `src/modules/alumnos/views/postulados/postuladoCalendarioView.js` | Modify | `document.getElementById` → `container.querySelector`; AbortController |
| `src/modules/alumnos/views/postulados/postuladoPerfilView.js` | Modify | localStorage keys namespaced with `soi_docs_{id}` |
| `src/modules/alumnos/domain/editarAlumnoModal.js` | Modify | Unlock `nombre` field; unsaved-changes guard |
| `src/modules/alumnos/api/postuladosMock.js` | Modify | Add `buscarPostulante` |
| `src/modules/alumnos/api/postuladosSupabase.js` | Modify | Single-roundtrip status update; date normalization in `listarPostulantesPorRango` |
| `src/modules/alumnos/domain/generarPdfPostulados.js` | Modify | Add municipio and instrumento columns |
| `src/modules/alumnos/components/alumnoTimeline.js` | Modify | Fix corrupted text; env-aware mock flag |
| `src/modules/alumnos/__tests__/` | Create | 16 test files (see Testing Strategy) |

---

## Interfaces / Contracts

### obtenerAlumnos — new return shape
```js
// Before
obtenerAlumnos(): Promise<NormalizedAlumno[]>

// After
obtenerAlumnos({ page?: number, pageSize?: number }?): Promise<{
  alumnos: NormalizedAlumno[],
  total: number
}>
```

### calcularEdad — extended signature
```js
// Before
calcularEdad(fechaNacimiento: string, today?: Date): number  // throws on null

// After
calcularEdad(fechaNacimiento: string | null, opts?: { fallback?: any }, today?: Date): number | any
// If fechaNacimiento is falsy, returns opts.fallback (default null). Otherwise same behavior.
```

**Note**: The existing `today` parameter is positional. Adding `opts` as second parameter requires callers who pass a custom `today` to update the call. Audit all callers before implementing.

### NormalizedAlumno — field reference (current schema, post-fix)
```js
{
  id: string,
  nombre: string,           // was: name
  is_active: boolean,       // was: es_activo
  instrumento_principal: string,  // was: section
  familiar_nombre: string,  // was: acudiente
  email: string,
  cedula: string,
  fecha_nacimiento: string | null,
  _completitud: { porcentaje, nivel, camposFaltantes, camposCompletos, porGrupo }  // memoized
}
```

---

## Testing Strategy

### Test file locations

| File | Batch | Key assertions |
|------|-------|----------------|
| `src/modules/alumnos/__tests__/calcularEdad.test.js` | A | null returns fallback; valid date; future date throws; injectable today |
| `src/modules/alumnos/__tests__/escapeHTML.test.js` | A | escapes `"` and `'`; null input → empty string |
| `src/modules/alumnos/__tests__/alumnoCard.test.js` | A | renders `alumno.nombre`; badge uses `alumno.is_active`; instrument from `instrumento_principal` |
| `src/modules/alumnos/__tests__/useAlumnos.test.js` | A | `search()` matches on `nombre`, not `name`; `familiar_nombre` not `acudiente` |
| `src/modules/alumnos/__tests__/completitudAlumno.test.js` | A | 22-field weighted score; reporte mensual uses same result |
| `src/modules/alumnos/__tests__/alumnosMock.test.js` | A | hoisting: `data` array accessible before first call |
| `src/modules/alumnos/__tests__/alumnosView.test.js` | A+B+C+D | CSV has BOM; CSV uses `is_active`; pagination prev/next; empty-state renders once; stale closure: capturedId != state.editando after mutation |
| `src/modules/alumnos/__tests__/postuladosView.test.js` | B+C | queries scoped to container; search input filters list |
| `src/modules/alumnos/__tests__/postuladoCalendario.test.js` | B | queries scoped to container |
| `src/modules/alumnos/__tests__/alumnosSupabase.test.js` | B+D | null guard in `actualizarAlumno`; pagination returns `{ alumnos, total }` |
| `src/modules/alumnos/__tests__/alumnoAdminView.test.js` | B+D | nombre field editable; parallel queries fired simultaneously |
| `src/modules/alumnos/__tests__/postuladosMock.test.js` | B | `buscarPostulante` returns matches; empty query returns all |
| `src/modules/alumnos/__tests__/reporteInscripcionesMes.test.js` | A+E | CSV button exists; domain completitud used; instrument filter works |
| `src/modules/alumnos/__tests__/postuladosApi.test.js` | E | dispatcher routes to mock in demo mode, supabase otherwise |
| `src/modules/alumnos/__tests__/generarPdfPostulados.test.js` | E | PDF includes municipio and instrumento columns |
| `src/modules/alumnos/__tests__/postuladoPerfilView.test.js` | E | localStorage key is `soi_docs_{id}`, not a flat key |

### Test setup pattern (matching `salonesView.test.js`)

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), /* chain */ }
}));

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}));

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() }
}));

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});
```

DOM-interacting tests use `document.createElement('div')` as container and call `renderXxxView(container)` directly — no JSDOM import needed (Vitest with jsdom environment handles it).

---

## Migration / Rollout

Each batch is an independent PR to `master`:

- **Batch A** (Critical data integrity) — safest; no behavior change for end user except correct search results and card rendering. CSV BOM is user-visible; can be guarded with `?bom=1` if rollback is needed.
- **Batch B** (SPA correctness) — memory leak fixes; invisible to users; safe to revert per-PR.
- **Batch C** (UX consistency) — replaces native dialogs; must confirm `AppModal` API before landing.
- **Batch D** (Performance) — pagination changes `obtenerAlumnos` return shape; all callers must be updated in the same PR.
- **Batch E** (Architecture) — deletions (`alumno.model.js`, `useAlumnos.js`) must go last after all Batch A–D callers no longer reference them.

No DB migrations. No feature flags beyond the optional CSV BOM flag.

---

## Open Questions

- [ ] `calcularEdad` second parameter conflict: adding `opts` as positional param 2 collides with existing `today` param 2 used in tests. Resolution candidates: (a) make `today` third param, update test calls; (b) make `opts` the injectable via `{ fallback, today }` merged into a single options object. Confirm before Batch A starts.
- [ ] `AppModal.open` confirm pattern: does it support an `onSave`/`onCancel` pair, or only `onClose`? Verify against `shared/components/AppModal.js` before wiring Batch C confirm dialogs.
- [ ] Supabase RPC for single-roundtrip `actualizarEstadoPostulante` (Batch D, #22): requires a new DB function. Confirm with backend team — if not ready, the SELECT+UPDATE two-step stays and the Batch D scope excludes #22.
- [ ] `listarPostulantesPorRango` date normalization (#40): the mock correctly appends `T23:59:59.999Z` to `hasta`; confirm whether the Supabase implementation does the same.
