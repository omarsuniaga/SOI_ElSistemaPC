# Tasks: alumnos-audit-fixes

**Change**: alumnos-audit-fixes — 40-finding audit fix across data integrity, SPA safety, UX, performance, and architecture.
**Date**: 2026-06-20
**Version**: 1.0

---

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1 800 – 2 400 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR A → PR B → PR C → PR D → PR E (5 stacked PRs to main) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| A | Critical data integrity (8 reqs) | PR A → master | Safe; no behavior change for end users |
| B | SPA bugs (8 reqs) | PR B → master | Depends on A (schema names must be correct first) |
| C | UX consistency (7 reqs + spike) | PR C → master | Depends on B; spike must precede implementation |
| D | Performance (5 reqs) | PR D → master | Breaking change on obtenerAlumnos return shape; all callers in same commit |
| E | Architecture + reports (8 reqs) | PR E → master | Must come last; deletes files fixed in A/B |

---

## BATCH A — Critical Data Integrity

> Base branch: `master`. All tasks are independently committable within this PR.

---

- [x] TASK-A01-RED: Write failing test for CSV estado field
  Req: A-01
  Files: `src/modules/alumnos/__tests__/alumnosView.csv.test.js` (CREATE)
  TDD:
    RED: `describe('exportarCSV', () => { it('uses is_active=true → "Activo"', ...) it('uses is_active=false → "Inactivo"', ...) })`
    GREEN: Change `a.estado` → `a.is_active ? 'Activo' : 'Inactivo'` at line 1173 in `alumnosView.js`
    REFACTOR: Remove any remaining `.estado` references in the same function
  Depends: none
  PR: Batch A

- [x] TASK-A02-RED: Write failing test for CSV UTF-8 BOM
  Req: A-02
  Files: `src/modules/alumnos/__tests__/alumnosView.csv.test.js`
  TDD:
    RED: `it('Blob starts with UTF-8 BOM', async () => { expect(text.startsWith('﻿')).toBe(true) })`
    GREEN: Prefix CSV string with `'﻿'` in the Blob constructor at line 1182 of `alumnosView.js`
    REFACTOR: none
  Depends: TASK-A01-RED
  PR: Batch A

- [x] TASK-A03-RED: Write failing test for escapeHTML quote escaping
  Req: A-03
  Files: `src/modules/alumnos/__tests__/alumnosUtils.test.js` (CREATE)
  TDD:
    RED: `describe('escapeHTML', () => { it('escapes " and \' chars', ...) it('leaves safe string unchanged', ...) })`
    GREEN: Add `.replace(/"/g, '&quot;').replace(/'/g, '&#39;')` to `escapeHTML` in `alumnosUtils.js:38`
    REFACTOR: Use `String(str ?? '')` for null safety
  Depends: none
  PR: Batch A

- [x] TASK-A04-RED: Write failing test for alumnoCard schema fields
  Req: A-04
  Files: `src/modules/alumnos/__tests__/alumnoCard.test.js` (CREATE)
  TDD:
    RED: `describe('alumnoCard', () => { it('renders nombre not name', ...) it('active badge uses is_active', ...) it('getInitials returns 2 chars for any nombre', ...) })`
    GREEN: Replace `alumno.name` → `alumno.nombre`, `alumno.es_activo` → `alumno.is_active` in `alumnoCard.js`; fix `getInitials` for single-word names
    REFACTOR: Import `calcularEdad` from `domain/calcularEdad.js` (not utils)
  Depends: none
  PR: Batch A

- [x] TASK-A05-RED: Write failing test for useAlumnos.search() schema fields
  Req: A-05
  Files: `src/modules/alumnos/__tests__/useAlumnos.test.js` (CREATE)
  TDD:
    RED: `describe('useAlumnos.search', () => { it('matches on nombre', ...) it('matches on familiar_nombre', ...) it('returns empty for no match', ...) })`
    GREEN: Change `a.name` → `a.nombre`, `a.acudiente` → `a.familiar_nombre` in `useAlumnos.js:105`; also fix `a.es_activo` → `a.is_active` in filter methods
    REFACTOR: none
  Depends: none
  PR: Batch A

- [x] TASK-A06-RED: Write failing test for calcularCompletitud unification
  Req: A-06
  Files: `src/modules/alumnos/__tests__/completitudAlumno.test.js` (CREATE)
  TDD:
    RED: `it('reporte result matches domain result for same alumno', () => { expect(reporteResult).toStrictEqual(domainResult) })`
    GREEN: Delete local `calcularCompletitud`, `campoCompleto`, `CAMPOS_REQUERIDOS` from `reporteInscripcionesMes.js:71`; add `import { calcularCompletitud } from '../domain/completitudAlumno.js'`; adapt display code to `result.porcentaje`
    REFACTOR: Verify `obtenerAlumnosPorMes` returns normalized objects (if not, wrap mapping before calling domain fn)
  Depends: none
  PR: Batch A

- [x] TASK-A07-RED: Write failing tests for canonical calcularEdad
  Req: A-07
  Files: `src/modules/alumnos/__tests__/calcularEdad.test.js` (CREATE)
  TDD:
    RED: `describe('calcularEdad', () => { it('returns null when fechaNacimiento is null', ...) it('returns custom fallback', ...) it('returns correct age for known date', ...) })`
    GREEN: Add `{ fallback = null, today = new Date() } = {}` as second param to `calcularEdad.js`; guard `if (!fechaNacimiento) return fallback`; keep existing logic
    REFACTOR: Delete local `calcularEdad` from `alumnosUtils.js`; update all 6 callers to import from `domain/calcularEdad.js`; update callers that passed `today` as positional param 2 to use `{ today }` opts form
  Depends: none
  PR: Batch A

- [x] TASK-A08-RED: Write failing test for alumnosMock hoisting
  Req: A-08
  Files: `src/modules/alumnos/__tests__/alumnosMock.test.js` (CREATE)
  TDD:
    RED: `it('importing alumnosMock does not throw ReferenceError', () => { expect(() => require('../api/alumnosMock.js')).not.toThrow() })`
    GREEN: Move `const inscripciones = [...]` declaration before `normalizeAlumno` function definition in `alumnosMock.js`
    REFACTOR: none
  Depends: none
  PR: Batch A

---

## BATCH B — SPA Bugs

> Base branch: `master` (after Batch A merges). All tasks are independently committable within this PR.

---

- [ ] TASK-B01-RED: Write failing test for stale closure in openEditModal
  Req: B-01
  Files: `src/modules/alumnos/__tests__/alumnosView.modal.test.js` (CREATE)
  TDD:
    RED: `it('first onSave targets id=1 even after id=2 modal opened', () => { ... expect(capturedArg).toBe(1) })`
    GREEN: Add `const capturedId = id` at top of `openEditModal` in `alumnosView.js:664`; replace `state.editando` with `capturedId` inside the async `onSave` callback
    REFACTOR: none
  Depends: none
  PR: Batch B

- [ ] TASK-B02-RED: Write failing test for double empty-state render
  Req: B-02
  Files: `src/modules/alumnos/__tests__/alumnosView.table.test.js` (CREATE)
  TDD:
    RED: `it('renders exactly one empty-state when alumnos=[]', () => { expect(container.querySelectorAll('.empty-state').length).toBe(1) })`
    GREEN: Ensure `refreshTable()` clears `#alumnosTBody` before rendering empty state; make empty state appear in `#emptyContainer` only at `alumnosView.js:1141`
    REFACTOR: none
  Depends: none
  PR: Batch B

- [ ] TASK-B03-RED: Write failing test for container-scoped event listeners
  Req: B-03
  Files: `src/modules/alumnos/__tests__/eventScoping.test.js` (CREATE)
  TDD:
    RED: `it('handler in container1 does not fire for container2 click', () => { ... })`  — covers alumnoAdminView, postuladosView, postuladoCalendarioView
    GREEN: Replace `document.getElementById` / `document.querySelectorAll` with `container.querySelector` / `container.querySelectorAll` in `attachEvents` of: `alumnoAdminView.js:743`, `postuladosView.js:522`, `postuladoCalendarioView.js:215`
    REFACTOR: none
  Depends: none
  PR: Batch B

- [ ] TASK-B04-RED: Write failing test for actualizarAlumno null guard
  Req: B-04
  Files: `src/modules/alumnos/__tests__/alumnosSupabase.test.js` (CREATE)
  TDD:
    RED: `it('throws when data array is empty', async () => { await expect(actualizarAlumno(...)).rejects.toThrow('no encontrado') })`
    GREEN: After Supabase update, add `if (!data?.length) throw new Error('Alumno no encontrado tras actualizar')` in `alumnosSupabase.js:245`
    REFACTOR: none
  Depends: none
  PR: Batch B

- [ ] TASK-B05-RED: Write failing test for delete modal race condition
  Req: B-05
  Files: `src/modules/alumnos/__tests__/alumnosView.modal.test.js`
  TDD:
    RED: `it('delete modal shows data for id=5 not a stale id', async () => { ... })`
    GREEN: Remove `setTimeout(300ms)` from `openDeleteModal` in `alumnosView.js:1069`; capture modal DOM ref before async ops; use direct `async/await`
    REFACTOR: none
  Depends: none
  PR: Batch B

- [ ] TASK-B06-RED: Write failing tests for alumnoTimeline cleanup
  Req: B-06
  Files: `src/modules/alumnos/__tests__/alumnoTimeline.test.js` (CREATE)
  TDD:
    RED: `it('no Chinese chars in production mode output', ...) it('no Math.random events', ...) it('shows empty-state when isDemoMode=false and events=[]', ...)`
    GREEN: Remove corrupted text `'Completó练习'`; remove `Math.random()` event generation; wrap mock JSON load inside `if (isDemoMode)` guard; add empty-state HTML branch in `alumnoTimeline.js`
    REFACTOR: none
  Depends: none
  PR: Batch B

- [ ] TASK-B07-RED: Write failing test for editarAlumnoModal nombre field editable
  Req: B-07
  Files: `src/modules/alumnos/__tests__/editarAlumnoModal.test.js` (CREATE)
  TDD:
    RED: `it('nombre input does not have readonly attribute', () => { expect(input.hasAttribute('readonly')).toBe(false) })`
    GREEN: Remove `readonly` attribute from nombre input in `editarAlumnoModal.js:21`
    REFACTOR: none
  Depends: none
  PR: Batch B

- [ ] TASK-B08-RED: Write failing test for postuladosMock.buscarPostulante
  Req: B-08
  Files: `src/modules/alumnos/__tests__/postuladosMock.test.js` (CREATE)
  TDD:
    RED: `it('returns filtered results for query', ...) it('returns [] for no match', ...)`
    GREEN: Add `export async function buscarPostulante(query)` to `postuladosMock.js` filtering on `nombre_completo` and `email`
    REFACTOR: none
  Depends: none
  PR: Batch B

---

## BATCH C — UX Consistency

> Base branch: `master` (after Batch B merges). Spike MUST run before any implementation in this batch.

---

- [ ] TASK-C00 (SPIKE): Verify AppModal and AppToast API signatures
  Req: R-1 (risk mitigation)
  Files: `src/shared/components/AppModal.js` (READ), `src/shared/components/AppToast.js` (READ)
  TDD: n/a — this is a read-only spike; document exact `open/confirm` signature and `success/error` method names
  Depends: none
  PR: Batch C (must be done before TASK-C01)

- [ ] TASK-C01-RED: Write failing test for native dialog replacement
  Req: C-01
  Files: `src/modules/alumnos/__tests__/nativeDialogs.test.js` (CREATE)
  TDD:
    RED: `it('delete action calls AppModal not window.confirm', () => { ... expect(window.confirm).not.toHaveBeenCalled() })`
    GREEN: Replace `alert/confirm/prompt` in `alumnoAdminView.js:812`, `postuladosView.js:556,597`, `postuladoCalendarioView.js:257`, `postuladoPerfilView.js:820` with `AppToast.success/error` and `AppModal.open` (use confirmed API from C00 spike)
    REFACTOR: none
  Depends: TASK-C00
  PR: Batch C

- [ ] TASK-C02-RED: Write failing test for email and cedula in search filter
  Req: C-02
  Files: `src/modules/alumnos/__tests__/alumnosView.filter.test.js` (CREATE)
  TDD:
    RED: `it('search by email includes matching alumno', ...) it('search by cedula includes matching alumno', ...)`
    GREEN: Add `|| (a.email || '').toLowerCase().includes(term)` and `|| (a.cedula || '').includes(term)` to filter logic in `alumnosView.js:417`
    REFACTOR: none
  Depends: none
  PR: Batch C

- [ ] TASK-C03-RED: Write failing test for email validation in form
  Req: C-03
  Files: `src/modules/alumnos/__tests__/alumnosView.form.test.js` (CREATE)
  TDD:
    RED: `it('returns error when email is malformed', ...) it('passes when email is valid', ...)`
    GREEN: Add `isValidEmail` helper (simple RFC regex) to `alumnosUtils.js`; call it in `collectAndValidateAlumno` in `alumnosView.js:588`; push error to errors array if invalid
    REFACTOR: none
  Depends: none
  PR: Batch C

- [ ] TASK-C04-RED: Write failing test for phone-filter banner
  Req: C-04
  Files: `src/modules/alumnos/__tests__/postuladosView.test.js` (CREATE)
  TDD:
    RED: `it('shows banner with count of hidden postulantes', ...) it('shows no banner when all have phones', ...)`
    GREEN: After filtering postulantes in `postuladosView.js:155`, compute `hiddenCount`; render `<div class="info-banner">N postulantes sin número...</div>` if `hiddenCount > 0`
    REFACTOR: none
  Depends: TASK-B03-RED (container scoping required first)
  PR: Batch C

- [ ] TASK-C05-RED: Write failing test for name search in postulados view
  Req: C-05
  Files: `src/modules/alumnos/__tests__/postuladosView.test.js`
  TDD:
    RED: `it('text search filters postulantes by name', () => { ... expect(rendered.length).toBe(expectedCount) })`
    GREEN: Add `<input id="buscarPostulante">` above list in `postuladosView.js`; wire `input` event to client-side filter on `resolverNombre`, phone, municipio
    REFACTOR: none
  Depends: TASK-B03-RED
  PR: Batch C

- [ ] TASK-C06-RED: Write failing test for unsaved-changes warning
  Req: C-06
  Files: `src/modules/alumnos/__tests__/alumnosView.modal.test.js`
  TDD:
    RED: `it('shows confirm dialog when dirty close triggered', ...) it('no dialog on clean close', ...)`
    GREEN: In `editarAlumnoModal.js`, snapshot original values on open; compare on close attempt; if dirty call `AppModal.open` confirm variant; if clean close immediately
    REFACTOR: none
  Depends: TASK-C00, TASK-B07-RED
  PR: Batch C

- [ ] TASK-C07-RED: Write failing test for sortable columns
  Req: C-07
  Files: `src/modules/alumnos/__tests__/alumnosView.table.test.js`
  TDD:
    RED: `it('sorts by nombre ASC puts Ana before Zara', ...) it('clicking sorted header toggles to DESC', ...)`
    GREEN: Add sort-state object `{ field: 'nombre', dir: 'asc' }` to `alumnosView.js` state; add `data-sort` attribute to `<th>` headers at line 228; wire click to toggle + re-render
    REFACTOR: none
  Depends: none
  PR: Batch C

---

## BATCH D — Performance

> Base branch: `master` (after Batch C merges).
> WARNING: TASK-D01 is a breaking return-shape change — ALL callers must be in the same commit.

---

- [ ] TASK-D01-RED: Write failing tests for obtenerAlumnos pagination
  Req: D-01
  Files: `src/modules/alumnos/__tests__/alumnosSupabase.test.js`
  TDD:
    RED: `it('returns exactly pageSize records', ...) it('page 1 returns second batch', ...) it('returns { alumnos, total } shape', ...)`
    GREEN: Add `{ page = 0, pageSize = 50 } = {}` param + `.range()` + `{ count: 'exact' }` to `obtenerAlumnos` in `alumnosSupabase.js:78`; change return to `{ alumnos, total }`; update `alumnosMock.js` to simulate pagination (slice); update `alumnosApi.js` dispatcher to forward params and return shape; update `alumnosView.js` to destructure `{ alumnos, total }` and add pagination HTML controls; verify no other caller breaks
    REFACTOR: Remove pagination-unrelated workarounds in the same function
  Depends: none
  PR: Batch D

- [ ] TASK-D02-RED: Write failing test for memoized calcularCompletitud
  Req: D-02
  Files: `src/modules/alumnos/__tests__/alumnosView.filter.test.js`
  TDD:
    RED: `it('calcularCompletitud called exactly 100 times for 100 alumnos even after 2 filter calls', () => { expect(spy.callCount).toBe(100) })`
    GREEN: After loading alumnos in `renderAlumnosView`, map to `{ ...a, _completitud: calcularCompletitud(a) }` in `alumnosView.js:430`; replace all inline `calcularCompletitud(a)` calls in `applyFilters` and `renderTableRows` with `a._completitud`
    REFACTOR: none
  Depends: TASK-A06-RED (domain import must be in place)
  PR: Batch D

- [ ] TASK-D03-RED: Write failing test for AbortController cleanup
  Req: D-03
  Files: `src/modules/alumnos/__tests__/alumnosView.lifecycle.test.js` (CREATE)
  TDD:
    RED: `it('no handler fires after view teardown', () => { render(); teardown(); dispatch(); expect(handler).not.toHaveBeenCalled() })`
    GREEN: Add `let abortController = null` at module level in `alumnosView.js:40`; abort and recreate at render start; pass `{ signal: abortController.signal }` to all `addEventListener` calls; expose teardown function that calls `abortController.abort()`
    REFACTOR: Apply same pattern to `postuladosView.js` and `postuladoCalendarioView.js`
  Depends: TASK-B03-RED
  PR: Batch D

- [ ] TASK-D04-RED: Write failing test for parallel queries in alumnoAdminView
  Req: D-04
  Files: `src/modules/alumnos/__tests__/alumnoAdminView.test.js` (CREATE)
  TDD:
    RED: `it('total elapsed time < 150ms when each query takes 100ms', async () => { ... expect(elapsed).toBeLessThan(150) })`
    GREEN: Replace two consecutive `await` calls with `const [alumnoData, clasesData] = await Promise.all([...])` in `alumnoAdminView.js:301`
    REFACTOR: none
  Depends: none
  PR: Batch D

- [ ] TASK-D05-RED: Write failing test for URL.revokeObjectURL after download
  Req: D-05
  Files: `src/modules/alumnos/__tests__/alumnosView.csv.test.js`
  TDD:
    RED: `it('revokeObjectURL called after 100ms', async () => { await delay(200); expect(URL.revokeObjectURL).toHaveBeenCalled() })`
    GREEN: Add `setTimeout(() => URL.revokeObjectURL(link.href), 100)` after `link.click()` in `alumnosView.js:1183`
    REFACTOR: none
  Depends: TASK-A02-RED (same function block)
  PR: Batch D

---

## BATCH E — Architecture + Reports

> Base branch: `master` (after Batch D merges). Deletions must come last.

---

- [ ] TASK-E01-RED: Write failing test for alumno.model.js schema fields
  Req: E-01
  Files: `src/modules/alumnos/__tests__/alumnoModel.test.js` (CREATE)
  TDD:
    RED: `it('nombre field returns correct value', () => { expect(new Alumno({ nombre: 'Ana' }).nombre).toBe('Ana') })`
    GREEN: Update `alumno.model.js` — replace `name` → `nombre`, `es_activo` → `is_active`; remove `section`, `ensemble_id`, `acudiente` fields; OR delete file + remove export from `index.js`
    REFACTOR: Remove export of `Alumno` from `index.js`
  Depends: none
  PR: Batch E

- [ ] TASK-E02-RED: Write failing test for postuladosApi dispatcher
  Req: E-02
  Files: `src/modules/alumnos/__tests__/postuladosApi.test.js` (CREATE)
  TDD:
    RED: `it('demo mode routes to mock', ...) it('prod mode routes to supabase', ...)`
    GREEN: Confirm canonical dispatcher is `postulantesApi.js`; add `// @deprecated` comments to `postulantesSupabase.js` re-exports; ensure `postuladosMock.js` is routed when `isDemoMode=true`
    REFACTOR: none
  Depends: TASK-B08-RED (buscarPostulante must exist in mock first)
  PR: Batch E

- [ ] TASK-E03-RED: Write failing test for useAlumnos removal from public API
  Req: E-03
  Files: `src/modules/alumnos/__tests__/index.exports.test.js` (CREATE)
  TDD:
    RED: `it('index.js does not export useAlumnos or AlumnosHook', () => { expect(exports.useAlumnos).toBeUndefined() })`
    GREEN: Remove `export { useAlumnos }` and `export { AlumnosHook }` from `src/modules/alumnos/index.js`; file `useAlumnos.js` MAY remain on disk
    REFACTOR: none
  Depends: TASK-A05-RED (schema fixes must be in place before deletion of export)
  PR: Batch E

- [ ] TASK-E04-RED: Write failing tests for reporte mensual CSV export
  Req: E-04
  Files: `src/modules/alumnos/__tests__/reporteInscripcionesMes.test.js` (CREATE)
  TDD:
    RED: `it('CSV has 4 rows for 3 alumnos', ...) it('header contains all 7 required columns', ...)`
    GREEN: Add `<button id="btnExportarCSVReporte">` to `reporteInscripcionesMes.js` template; on click, map `alumnosActuales` to CSV rows (nombre, instrumento, municipio, fecha_inscripcion, completitud%, familiar_nombre, telefono); prefix Blob with BOM; use `escapeCSV` from `alumnosUtils.js` (add if missing: `str.replace(/"/g, '""')`)
    REFACTOR: none
  Depends: TASK-A06-RED (domain completitud import must be in place)
  PR: Batch E

- [ ] TASK-E05-RED: Write failing test for reporte mensual filters
  Req: E-05
  Files: `src/modules/alumnos/__tests__/reporteInscripcionesMes.test.js`
  TDD:
    RED: `it('instrument filter renders only matching alumnos', () => { ... expect(rows.length).toBe(2) })`
    GREEN: Add `<select id="filtroInstrumentoReporte">` (unique `instrumento_principal` values) and `<input id="filtroMunicipioReporte">` to `reporteInscripcionesMes.js`; wire both to client-side filter on `alumnosActuales`
    REFACTOR: Clarify gender filter derivation (cedula prefix vs explicit `genero` field) — check schema before implementing dropdown; document choice in comment
  Depends: TASK-A06-RED
  PR: Batch E

- [ ] TASK-E06-RED: Write failing tests for localStorage namespacing
  Req: E-06
  Files: `src/modules/alumnos/__tests__/postuladoPerfilView.test.js` (CREATE)
  TDD:
    RED: `it('uses soi_docs_{id} key for storage', ...) it('removes key on eliminarPostulante', ...)`
    GREEN: Add `const DOCS_KEY = (id) => \`soi_docs_\${id}\`` helper in `postuladoPerfilView.js:144`; replace all flat localStorage key strings with `DOCS_KEY(postulanteId)`; call `localStorage.removeItem(DOCS_KEY(id))` inside `eliminarPostulante`
    REFACTOR: none
  Depends: none
  PR: Batch E

- [ ] TASK-E07-RED: Write failing test for listarPostulantesPorRango date normalization
  Req: E-07
  Files: `src/modules/alumnos/__tests__/postuladosSupabase.test.js` (CREATE)
  TDD:
    RED: `it('normalizes hasta to end-of-day', () => { ...; expect(filterArg).toBe('2026-06-20T23:59:59.999Z') })`
    GREEN: In `postuladosSupabase.js:148`, replace `hasta` with `hasta.slice(0, 10) + 'T23:59:59.999Z'` before appending to query
    REFACTOR: none
  Depends: none
  PR: Batch E

- [ ] TASK-E08-RED: Write failing test for PDF postulados columns
  Req: E-08
  Files: `src/modules/alumnos/__tests__/generarPdfPostulados.test.js` (CREATE)
  TDD:
    RED: `it('PDF content includes municipio and instrumento values', () => { ... expect(content).toContain('Santo Domingo'); expect(content).toContain('Violin') })`
    GREEN: Add `Municipio` and `Instrumento` columns to the PDF table definition in `generarPdfPostulados.js:127`; adjust column widths so all columns fit within page margins
    REFACTOR: none
  Depends: none
  PR: Batch E

---

## Dependency Graph

```
TASK-A01 ──► TASK-A02 ──────────────────────────────────► TASK-D05
TASK-A03 (independent)
TASK-A04 (independent)
TASK-A05 ──────────────────────────────────────────────► TASK-E03
TASK-A06 ──────────────────────────────────────────────► TASK-D02, TASK-E04, TASK-E05
TASK-A07 (independent — all callers updated in GREEN step)
TASK-A08 (independent)

TASK-B01 (independent)
TASK-B02 (independent)
TASK-B03 ──► TASK-C04, TASK-C05, TASK-D03
TASK-B04 (independent)
TASK-B05 (independent)
TASK-B06 (independent)
TASK-B07 ──► TASK-C06
TASK-B08 ──► TASK-E02

TASK-C00 ──► TASK-C01, TASK-C06
TASK-C02 (independent)
TASK-C03 (independent)
TASK-C04 depends on TASK-B03
TASK-C05 depends on TASK-B03
TASK-C06 depends on TASK-C00, TASK-B07
TASK-C07 (independent)

TASK-D01 (independent — all callers updated in same GREEN step)
TASK-D02 depends on TASK-A06
TASK-D03 depends on TASK-B03
TASK-D04 (independent)
TASK-D05 depends on TASK-A02

TASK-E01 (independent)
TASK-E02 depends on TASK-B08
TASK-E03 depends on TASK-A05
TASK-E04 depends on TASK-A06
TASK-E05 depends on TASK-A06
TASK-E06 (independent)
TASK-E07 (independent)
TASK-E08 (independent)
```

**Critical blocking chains:**
- `A-06 → D-02, E-04, E-05` (domain completitud must land before performance memoization and report exports)
- `B-03 → C-04, C-05, D-03` (container scoping must land before banner, name search, and AbortController)
- `C-00 → C-01, C-06` (spike must land before any AppModal wiring)
- `A-02 → D-05` (BOM Blob function must exist before revoke test runs in same function)

---

## Test File Inventory

### Files to CREATE (do not exist yet)

| Test File | Batch | Covers Tasks |
|-----------|-------|--------------|
| `src/modules/alumnos/__tests__/alumnosView.csv.test.js` | A | A01, A02, D05 |
| `src/modules/alumnos/__tests__/alumnosUtils.test.js` | A | A03 |
| `src/modules/alumnos/__tests__/alumnoCard.test.js` | A | A04 |
| `src/modules/alumnos/__tests__/useAlumnos.test.js` | A | A05 |
| `src/modules/alumnos/__tests__/completitudAlumno.test.js` | A | A06 |
| `src/modules/alumnos/__tests__/calcularEdad.test.js` | A | A07 |
| `src/modules/alumnos/__tests__/alumnosMock.test.js` | A | A08 |
| `src/modules/alumnos/__tests__/alumnosView.modal.test.js` | B | B01, B05, C06 |
| `src/modules/alumnos/__tests__/alumnosView.table.test.js` | B | B02, C07 |
| `src/modules/alumnos/__tests__/eventScoping.test.js` | B | B03 |
| `src/modules/alumnos/__tests__/alumnosSupabase.test.js` | B | B04, D01 |
| `src/modules/alumnos/__tests__/alumnoTimeline.test.js` | B | B06 |
| `src/modules/alumnos/__tests__/editarAlumnoModal.test.js` | B | B07 |
| `src/modules/alumnos/__tests__/postuladosMock.test.js` | B | B08 |
| `src/modules/alumnos/__tests__/nativeDialogs.test.js` | C | C01 |
| `src/modules/alumnos/__tests__/alumnosView.filter.test.js` | C | C02, D02 |
| `src/modules/alumnos/__tests__/alumnosView.form.test.js` | C | C03 |
| `src/modules/alumnos/__tests__/postuladosView.test.js` | C | C04, C05 |
| `src/modules/alumnos/__tests__/alumnosView.lifecycle.test.js` | D | D03 |
| `src/modules/alumnos/__tests__/alumnoAdminView.test.js` | D | D04 |
| `src/modules/alumnos/__tests__/alumnoModel.test.js` | E | E01 |
| `src/modules/alumnos/__tests__/postuladosApi.test.js` | E | E02 |
| `src/modules/alumnos/__tests__/index.exports.test.js` | E | E03 |
| `src/modules/alumnos/__tests__/reporteInscripcionesMes.test.js` | E | E04, E05 |
| `src/modules/alumnos/__tests__/postuladoPerfilView.test.js` | E | E06 |
| `src/modules/alumnos/__tests__/postuladosSupabase.test.js` | E | E07 |
| `src/modules/alumnos/__tests__/generarPdfPostulados.test.js` | E | E08 |

**Total new test files: 27**

---

## Verification Checklist

Run after each batch merges. Run full list after Batch E.

```bash
# 1. All tests pass
npm run test:run

# 2. No lint errors
npm run lint

# 3. Manual: CSV in Excel
#    - Export CSV from alumnos list
#    - Open in Excel on Windows — no encoding prompt, accented chars display correctly
#    - Estado column shows "Activo" / "Inactivo" (not "true"/"false")

# 4. Manual: Confirm dialogs
#    - Trigger delete action — browser alert() must NOT appear
#    - AppModal confirm variant must appear instead

# 5. Manual: Search by cédula
#    - Enter a known cédula in search box
#    - Correct student appears in filtered results

# 6. Manual: Pagination (after Batch D)
#    - If > 50 alumnos exist, prev/next controls appear
#    - Navigation loads correct page slice

# 7. Manual: Monthly report filters (after Batch E)
#    - Select an instrument — list reduces to matching rows only
#    - Export CSV — file opens without encoding prompt, has BOM
```

---

## PR Sizing Estimate

| Batch | Files Changed | Est. Lines |
|-------|--------------|------------|
| A — Data integrity | 8 source + 8 test | ~350 |
| B — SPA bugs | 7 source + 8 test | ~420 |
| C — UX consistency | 6 source + 7 test | ~480 |
| D — Performance | 5 source + 5 test | ~320 |
| E — Architecture + reports | 7 source + 7 test | ~430 |
| **Total** | **33 source + 35 test** | **~2 000** |

Each batch is a standalone PR targeting `master`. No batch exceeds ~480 lines, which keeps all PRs within a reasonable review window when split. If Batch B or C runs over 400 lines during implementation, split at the midpoint (B01–B04 / B05–B08 or C01–C03 / C04–C07).
