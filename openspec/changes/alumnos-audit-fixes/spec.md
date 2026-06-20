# Spec: alumnos-audit-fixes
**Date**: 2026-06-20
**Version**: 1.0
**Change**: `alumnos-audit-fixes` — 40-finding audit fix across data integrity, SPA safety, UX, performance, and architecture.

---

## Batch A — Critical Data Integrity

### A-01 CSV Estado Field

The system MUST use `alumno.is_active` (boolean) to render the Estado column in CSV export. The field `alumno.estado` MUST NOT be accessed.

**Files**: `src/modules/alumnos/views/alumnosView.js:1173`
**Test**: `src/modules/alumnos/__tests__/alumnosView.csv.test.js`

#### Scenario: Active alumno exported correctly

- GIVEN an alumno with `is_active = true`
- WHEN CSV is exported
- THEN the Estado column value is `"Activo"`

#### Scenario: Inactive alumno exported correctly

- GIVEN an alumno with `is_active = false`
- WHEN CSV is exported
- THEN the Estado column value is `"Inactivo"`

---

### A-02 CSV UTF-8 BOM

The CSV Blob MUST be prefixed with the UTF-8 BOM byte sequence (`﻿`) so Excel on Windows decodes accented characters correctly.

**Files**: `src/modules/alumnos/views/alumnosView.js:1182`
**Test**: `src/modules/alumnos/__tests__/alumnosView.csv.test.js`

#### Scenario: BOM present in Blob

- GIVEN CSV content containing `"Ñoño García"`
- WHEN the Blob is constructed
- THEN the first characters of Blob text content start with `﻿`

---

### A-03 escapeHTML XSS

`escapeHTML` MUST escape `"` → `&quot;` and `'` → `&#39;` in addition to `&`, `<`, `>`.

**Files**: `src/modules/alumnos/utils/alumnosUtils.js:38`
**Test**: `src/modules/alumnos/__tests__/alumnosUtils.test.js`

#### Scenario: All five characters escaped

- GIVEN input string `"><script>'alert'</script>`
- WHEN `escapeHTML` is called
- THEN result contains no unescaped `"`, `'`, `<`, `>`, or `&` characters
- AND result contains `&quot;`, `&#39;`, `&lt;`, `&gt;`

#### Scenario: Safe string unchanged

- GIVEN input string `Hello World`
- WHEN `escapeHTML` is called
- THEN result equals `Hello World`

---

### A-04 alumnoCard Schema Alignment

`alumnoCard` MUST read `alumno.nombre` (not `.name`) and `alumno.is_active` (not `.es_activo`). `getInitials` MUST return two initials (never `'?'`) for any non-null `nombre`.

**Files**: `src/modules/alumnos/components/alumnoCard.js`
**Test**: `src/modules/alumnos/__tests__/alumnoCard.test.js`

#### Scenario: Correct initials and badge

- GIVEN `alumno = { nombre: 'Juan Pérez', is_active: true }`
- WHEN `alumnoCard` renders
- THEN initials rendered are `JP`
- AND badge element class includes `success`

#### Scenario: Inactive badge

- GIVEN `alumno = { nombre: 'Ana López', is_active: false }`
- WHEN `alumnoCard` renders
- THEN badge element class includes `danger` or `secondary` (not `success`)

---

### A-05 useAlumnos Search Schema

`useAlumnos.search()` MUST search against `alumno.nombre` and `alumno.familiar_nombre`. The fields `alumno.name` and `alumno.acudiente` MUST NOT be referenced.

**Files**: `src/modules/alumnos/hooks/useAlumnos.js:105`
**Test**: `src/modules/alumnos/__tests__/useAlumnos.test.js`

#### Scenario: Search by nombre

- GIVEN `alumnos = [{ nombre: 'Ana López', familiar_nombre: 'María López' }]`
- WHEN `search('ana')` is called
- THEN returned array contains the alumno

#### Scenario: Search by familiar_nombre

- GIVEN `alumnos = [{ nombre: 'Carlos', familiar_nombre: 'Pedro Ruiz' }]`
- WHEN `search('pedro')` is called
- THEN returned array contains the alumno

#### Scenario: No match returns empty

- GIVEN `alumnos = [{ nombre: 'Juan', familiar_nombre: 'Luis' }]`
- WHEN `search('zzz')` is called
- THEN returned array is empty

---

### A-06 calcularCompletitud Unification

`reporteInscripcionesMes.js` MUST import and call `calcularCompletitud` from `domain/completitudAlumno.js`. Any local completitud implementation in that file MUST be removed.

**Files**: `src/modules/alumnos/views/reporteInscripcionesMes.js:71`, `src/modules/alumnos/domain/completitudAlumno.js`
**Test**: `src/modules/alumnos/__tests__/completitudAlumno.test.js`

#### Scenario: Identical result in list and report

- GIVEN the same alumno object `a`
- WHEN `calcularCompletitud(a)` is called from the domain module
- AND the same alumno is processed by `reporteInscripcionesMes`
- THEN both results are strictly equal

---

### A-07 calcularEdad Canonicalization

One canonical `calcularEdad(fechaNacimiento, { fallback = null } = {})` MUST be exported from `domain/calcularEdad.js`. When `fechaNacimiento` is falsy it MUST return `fallback` (never throw). All six callers MUST import from this path.

**Files**: `src/modules/alumnos/domain/calcularEdad.js`, `alumnosUtils.js`, `reporteInscripcionesMes.js`, `postuladoPerfilView.js`, `generarPdfInscripcion.js`, `generarReporteMensual.js`
**Test**: `src/modules/alumnos/__tests__/calcularEdad.test.js`

#### Scenario: Null input returns null (default fallback)

- GIVEN `fechaNacimiento = null`
- WHEN `calcularEdad(null)` is called
- THEN result is `null`

#### Scenario: Custom fallback returned

- GIVEN `fechaNacimiento = null`
- WHEN `calcularEdad(null, { fallback: 'Sin definir' })` is called
- THEN result is `'Sin definir'`

#### Scenario: Valid date returns correct age

- GIVEN `fechaNacimiento = '2010-01-01'` and today is 2026-06-20
- WHEN `calcularEdad('2010-01-01')` is called
- THEN result is `16`

---

### A-08 alumnosMock Hoisting Fix

The `inscripciones` array declaration MUST appear before the `normalizeAlumno` function definition in `alumnosMock.js` so no temporal dead zone occurs.

**Files**: `src/modules/alumnos/api/alumnosMock.js:8`
**Test**: `src/modules/alumnos/__tests__/alumnosMock.test.js`

#### Scenario: Import does not throw

- GIVEN the module is imported in a test
- WHEN the module is evaluated
- THEN no `ReferenceError` is thrown

---

## Batch B — SPA Bugs

### B-01 Stale Closure in Edit Modal

`openEditModal(id)` MUST capture the id in a `const capturedId = id` local variable and use it inside the async `onSave` callback. The callback MUST NOT read from `state.editando`.

**Files**: `src/modules/alumnos/views/alumnosView.js:664`
**Test**: `src/modules/alumnos/__tests__/alumnosView.modal.test.js`

#### Scenario: First modal saves to correct id

- GIVEN two modals opened sequentially for `id = 1` then `id = 2`
- WHEN the `onSave` callback of the first modal fires
- THEN the save operation targets `alumnoId = 1` (not 2)

---

### B-02 Single Empty State Render

When `alumnos.length === 0`, the empty state MUST appear exactly once in the DOM. `#alumnosTBody` MUST be empty. `#emptyContainer` MUST be visible.

**Files**: `src/modules/alumnos/views/alumnosView.js:1141`
**Test**: `src/modules/alumnos/__tests__/alumnosView.table.test.js`

#### Scenario: Exactly one empty state element

- GIVEN `alumnos = []`
- WHEN `refreshTable()` is called
- THEN `document.querySelectorAll('.empty-state').length === 1`
- AND `#alumnosTBody` is empty

---

### B-03 Container-Scoped Event Listeners

All `document.getElementById` and `document.querySelectorAll` calls used for event attachment MUST be replaced with `container.querySelector` / `container.querySelectorAll` inside `attachEvents(container)`.

**Files**: `alumnoAdminView.js:743`, `postuladosView.js:522`, `postuladoCalendarioView.js:215`
**Test**: `src/modules/alumnos/__tests__/eventScoping.test.js`

#### Scenario: Handler isolated to its container

- GIVEN two containers each with a button sharing the same id
- WHEN `attachEvents(container1)` is called
- AND a click is dispatched on the button inside `container2`
- THEN no handler from `container1` is invoked

---

### B-04 actualizarAlumno Null Guard

If the Supabase update returns an empty `data` array, `actualizarAlumno` MUST throw `new Error('Alumno no encontrado tras actualizar')`.

**Files**: `src/modules/alumnos/api/alumnosSupabase.js:245`
**Test**: `src/modules/alumnos/__tests__/alumnosSupabase.test.js`

#### Scenario: Empty data throws

- GIVEN Supabase returns `{ data: [], error: null }`
- WHEN `actualizarAlumno` is called
- THEN it throws an error whose message contains `'no encontrado'`

---

### B-05 Delete Modal Race Condition

The delete modal MUST use direct `async/await` inside `onShow`. The modal DOM reference MUST be captured before async operations begin. The `setTimeout(300ms)` MUST be removed.

**Files**: `src/modules/alumnos/views/alumnosView.js:1069`
**Test**: `src/modules/alumnos/__tests__/alumnosView.modal.test.js`

#### Scenario: Data displayed for correct alumno

- GIVEN delete modal opened for `id = 5`
- WHEN the inscripciones query resolves
- THEN the modal displays data belonging to `id = 5`

---

### B-06 alumnoTimeline Cleanup

`alumnoTimeline.js` MUST NOT contain corrupted text (`'Completó练习'`). MUST NOT call `Math.random()` for event generation. MUST NOT load mock JSON when `isDemoMode` is `false`. When no real data is available, MUST render an empty-state HTML block.

**Files**: `src/modules/alumnos/components/alumnoTimeline.js`
**Test**: `src/modules/alumnos/__tests__/alumnoTimeline.test.js`

#### Scenario: No demo events in production mode

- GIVEN `isDemoMode = false` and no real events
- WHEN timeline renders
- THEN output contains no Chinese characters
- AND output contains no `Math.random()`-generated event entries

#### Scenario: Empty state shown

- GIVEN `isDemoMode = false` and `events = []`
- WHEN timeline renders
- THEN output contains an empty-state element

---

### B-07 editarAlumnoModal nombre Editable

The `nombre` input in `editarAlumnoModal` MUST NOT have the `readonly` attribute. A user MUST be able to type into it.

**Files**: `src/modules/alumnos/domain/editarAlumnoModal.js:21`
**Test**: `src/modules/alumnos/__tests__/editarAlumnoModal.test.js`

#### Scenario: Input accepts typed value

- GIVEN the edit modal is rendered
- WHEN a user types into the `nombre` input
- THEN the input's value reflects the typed text

---

### B-08 postuladosMock buscarPostulante

`postuladosMock.js` MUST export `buscarPostulante(query)` that returns a filtered array from mock data based on the query string.

**Files**: `src/modules/alumnos/api/postuladosMock.js`
**Test**: `src/modules/alumnos/__tests__/postuladosMock.test.js`

#### Scenario: Returns filtered results

- GIVEN `isDemoMode = true`
- WHEN `buscarPostulante('Juan')` is called
- THEN result is an array (not a thrown `TypeError`)

#### Scenario: Returns empty array for no match

- GIVEN `isDemoMode = true`
- WHEN `buscarPostulante('zzzzzzz')` is called
- THEN result is `[]`

---

## Batch C — UX Consistency

### C-01 Replace Native Dialogs

All `alert(...)`, `confirm(...)`, and `prompt(...)` calls in the alumnos module MUST be replaced:
- `alert(msg)` → `AppToast.success(msg)` or `AppToast.error(msg)` based on context
- `confirm(msg)` → `AppModal.confirm({ title, body, onConfirm })`
- `prompt(msg)` → custom inline modal with textarea

**Files**: `alumnoAdminView.js:812`, `postuladosView.js:556,597`, `postuladoCalendarioView.js:257`, `postuladoPerfilView.js:820`
**Test**: `src/modules/alumnos/__tests__/nativeDialogs.test.js`

#### Scenario: Delete uses AppModal.confirm

- GIVEN a delete action is triggered
- WHEN the user clicks delete
- THEN `AppModal.confirm` is called
- AND `window.confirm` is NOT called

---

### C-02 Search Includes Email and Cedula

The text filter MUST match against `alumno.email` and `alumno.cedula` in addition to existing fields.

**Files**: `src/modules/alumnos/views/alumnosView.js:417`
**Test**: `src/modules/alumnos/__tests__/alumnosView.filter.test.js`

#### Scenario: Search by email

- GIVEN `alumno = { nombre: 'X', email: 'juan@test.com', cedula: '123' }`
- WHEN search term is `'juan@'`
- THEN alumno is included in the filtered results

#### Scenario: Search by cedula

- GIVEN `alumno = { nombre: 'Y', email: '', cedula: '456789' }`
- WHEN search term is `'4567'`
- THEN alumno is included in the filtered results

---

### C-03 Email Validation in Form

`collectAndValidateAlumno` MUST call `isValidEmail(email)` and return a validation error when email is present but malformed.

**Files**: `src/modules/alumnos/views/alumnosView.js:588`
**Test**: `src/modules/alumnos/__tests__/alumnosView.form.test.js`

#### Scenario: Invalid email returns error

- GIVEN `email = 'notanemail'`
- WHEN `collectAndValidateAlumno()` is called
- THEN result contains an error referencing `'email'`

#### Scenario: Valid email passes

- GIVEN `email = 'valid@domain.com'`
- WHEN `collectAndValidateAlumno()` is called
- THEN no email validation error is returned

---

### C-04 Postulados Phone Filter Warning

When postulantes are filtered out because they have no phone number, a visible info banner MUST appear: `"N postulantes sin número de contacto están ocultos"`.

**Files**: `src/modules/alumnos/views/postulados/postuladosView.js:155`
**Test**: `src/modules/alumnos/__tests__/postuladosView.test.js`

#### Scenario: Banner shows correct count

- GIVEN 10 postulantes where 3 have no phone number
- WHEN `cargarDatos()` is called with phone filter active
- THEN banner text contains `"3 postulantes sin número de contacto están ocultos"`

#### Scenario: No banner when all have phones

- GIVEN all postulantes have a phone number
- WHEN `cargarDatos()` is called
- THEN no phone-filter banner is visible

---

### C-05 Postulados Search by Name

A text search input MUST exist above the postulados list. It MUST filter by `resolverNombre`, phone, and municipio client-side.

**Files**: `src/modules/alumnos/views/postulados/postuladosView.js`
**Test**: `src/modules/alumnos/__tests__/postuladosView.test.js`

#### Scenario: Filter reduces visible postulantes

- GIVEN 5 postulantes and search input value is `'mar'`
- WHEN the input value changes
- THEN only postulantes whose name, phone, or municipio contains `'mar'` are rendered

---

### C-06 Unsaved Changes Warning

The edit modal MUST detect form changes before closing. If any field differs from the original alumno, a confirmation dialog MUST be shown before discarding.

**Files**: `src/modules/alumnos/views/alumnosView.js:626`
**Test**: `src/modules/alumnos/__tests__/alumnosView.modal.test.js`

#### Scenario: Confirmation on dirty close

- GIVEN the edit modal is open and `nombre` has been modified
- WHEN modal close is triggered without saving
- THEN a confirmation dialog (AppModal.confirm) is shown

#### Scenario: No confirmation on clean close

- GIVEN the edit modal is open and no fields have been changed
- WHEN modal close is triggered
- THEN no confirmation dialog is shown

---

### C-07 Sortable Columns in Student List

Table headers MUST include sort controls for `nombre` (default ASC), `instrumento_principal`, and completitud percentage. Clicking an already-sorted column MUST toggle ASC/DESC.

**Files**: `src/modules/alumnos/views/alumnosView.js:228`
**Test**: `src/modules/alumnos/__tests__/alumnosView.table.test.js`

#### Scenario: Sort by nombre ASC

- GIVEN `alumnos = [{ nombre: 'Zara' }, { nombre: 'Ana' }]`
- WHEN sort by `nombre` ASC is applied
- THEN rendered rows show Ana before Zara

#### Scenario: Toggle to DESC

- GIVEN table is sorted by `nombre` ASC
- WHEN the `nombre` header sort control is clicked
- THEN rendered rows show Zara before Ana

---

## Batch D — Performance

### D-01 Pagination for obtenerAlumnos

`obtenerAlumnos` MUST accept `{ page = 0, pageSize = 50 }` params and apply `.range(page * pageSize, (page + 1) * pageSize - 1)`. The UI MUST show pagination controls or a "Load more" button when `totalCount > pageSize`.

**Files**: `src/modules/alumnos/api/alumnosSupabase.js:78`
**Test**: `src/modules/alumnos/__tests__/alumnosSupabase.test.js`

#### Scenario: Returns exactly pageSize records

- GIVEN 5 alumnos exist in the data source and `pageSize = 2`
- WHEN `obtenerAlumnos({ page: 0, pageSize: 2 })` is called
- THEN exactly 2 alumnos are returned

#### Scenario: Second page returns next batch

- GIVEN 5 alumnos exist
- WHEN `obtenerAlumnos({ page: 1, pageSize: 2 })` is called
- THEN alumnos 3 and 4 are returned (0-indexed)

---

### D-02 Memoize calcularCompletitud

`calcularCompletitud` MUST be called once per alumno at data-load time, stored as `alumno._completitud`. `applyFilters` and `renderTableRows` MUST read `a._completitud` without re-invoking `calcularCompletitud`.

**Files**: `src/modules/alumnos/views/alumnosView.js:430`
**Test**: `src/modules/alumnos/__tests__/alumnosView.filter.test.js`

#### Scenario: Computed once on load, zero times on filter

- GIVEN 100 alumnos loaded
- WHEN `applyFilters` is called twice after initial load
- THEN `calcularCompletitud` spy call count is exactly 100 (not 300)

---

### D-03 Event Listener Cleanup via AbortController

`renderAlumnosView(container)` MUST create an `AbortController`. Its `signal` MUST be passed to all `addEventListener` calls. The signal MUST be aborted when the view is torn down.

**Files**: `src/modules/alumnos/views/alumnosView.js:40`
**Test**: `src/modules/alumnos/__tests__/alumnosView.lifecycle.test.js`

#### Scenario: No handler fires after teardown

- GIVEN the view is rendered then destroyed
- WHEN a click event is dispatched on an element from the old container
- THEN no handler executes

---

### D-04 Parallel Queries in alumnoAdminView

Queries for alumno data and clases data MUST be initiated concurrently via `Promise.all([...])`, not sequentially with consecutive `await`.

**Files**: `src/modules/alumnos/views/alumnoAdminView.js:301`
**Test**: `src/modules/alumnos/__tests__/alumnoAdminView.test.js`

#### Scenario: Total duration less than sum of individual durations

- GIVEN both queries each resolve after 100 ms
- WHEN `cargarDatos()` is called
- THEN total elapsed time is less than 150 ms

---

### D-05 URL.revokeObjectURL After Download

After `link.click()` triggers the CSV download, MUST call `setTimeout(() => URL.revokeObjectURL(link.href), 100)` to free the object URL.

**Files**: `src/modules/alumnos/views/alumnosView.js:1183`
**Test**: `src/modules/alumnos/__tests__/alumnosView.csv.test.js`

#### Scenario: URL revoked after download

- GIVEN a CSV download is triggered
- WHEN 200 ms have elapsed
- THEN `URL.revokeObjectURL` has been called with the object URL

---

## Batch E — Architecture + Reports

### E-01 alumno.model.js Deprecation

`alumno.model.js` MUST be updated to current schema: `name` → `nombre`, `es_activo` → `is_active`. Fields `section`, `ensemble_id`, and `acudiente` MUST be removed. Alternatively, the file is deprecated and its export removed from `index.js`.

**Files**: `src/modules/alumnos/models/alumno.model.js`, `src/modules/alumnos/index.js`
**Test**: `src/modules/alumnos/__tests__/alumnoModel.test.js`

#### Scenario: nombre field accessible

- GIVEN `new Alumno({ nombre: 'Ana' })`
- WHEN `.nombre` is accessed
- THEN result is `'Ana'` (not `undefined`)

---

### E-02 API Dispatcher Consolidation

A single `postuladosApi.js` MUST exist that dispatches to `postuladosSupabase.js` (production) or `postuladosMock.js` (demo). `postulantesApi.js` and `postulantesSupabase.js` MUST be deprecated.

**Files**: `src/modules/alumnos/api/postulantesApi.js`, `postulantesSupabase.js`, `postuladosSupabase.js`
**Test**: `src/modules/alumnos/__tests__/postuladosApi.test.js`

#### Scenario: Demo mode returns mock implementation

- GIVEN `isDemoMode = true`
- WHEN a function is imported from `postuladosApi.js`
- THEN the mock implementation is invoked (not Supabase)

#### Scenario: Production mode returns Supabase implementation

- GIVEN `isDemoMode = false`
- WHEN a function is imported from `postuladosApi.js`
- THEN the Supabase implementation is invoked

---

### E-03 Remove useAlumnos from Public API

`src/modules/alumnos/index.js` MUST NOT export `AlumnosHook` or `useAlumnos`. The hook file MAY remain on disk for future use.

**Files**: `src/modules/alumnos/hooks/useAlumnos.js`, `src/modules/alumnos/index.js`
**Test**: `src/modules/alumnos/__tests__/index.exports.test.js`

#### Scenario: Export not present

- GIVEN `src/modules/alumnos/index.js` is imported
- WHEN its exports are inspected
- THEN neither `AlumnosHook` nor `useAlumnos` is present in the export object

---

### E-04 Reporte Mensual CSV Export

An "Exportar CSV" button MUST appear next to the PDF button in the monthly report view. The CSV MUST include columns: `nombre`, `instrumento`, `municipio`, `fecha_inscripcion`, `completitud%`, `familiar_nombre`, `telefono`.

**Files**: `src/modules/alumnos/views/reporteInscripcionesMes.js`
**Test**: `src/modules/alumnos/__tests__/reporteInscripcionesMes.test.js`

#### Scenario: CSV has correct row count

- GIVEN 3 alumnos in the report
- WHEN CSV is exported
- THEN CSV contains 4 rows (1 header + 3 data rows)

#### Scenario: CSV has correct columns

- GIVEN 1 alumno with all fields populated
- WHEN CSV is exported
- THEN the header row contains all 7 required columns

---

### E-05 Reporte Mensual Filters

Filter controls MUST appear above the monthly report: a dropdown for `instrumento`, a dropdown for gender, and a text input for `municipio`. Filters MUST operate client-side.

**Files**: `src/modules/alumnos/views/reporteInscripcionesMes.js`
**Test**: `src/modules/alumnos/__tests__/reporteInscripcionesMes.test.js`

#### Scenario: Instrument filter reduces rows

- GIVEN alumnos with instruments `['Violin', 'Piano', 'Piano']`
- WHEN instrument filter is set to `'Piano'`
- THEN the report renders exactly 2 alumnos

---

### E-06 localStorage Namespacing and Cleanup

localStorage keys for postulante documents MUST use the format `soi_docs_${postulanteId}`. When `eliminarPostulante` is called, the corresponding localStorage entry MUST be removed.

**Files**: `src/modules/alumnos/views/postulados/postuladoPerfilView.js:144`
**Test**: `src/modules/alumnos/__tests__/postuladoPerfilView.test.js`

#### Scenario: Key removed on delete

- GIVEN `localStorage.setItem('soi_docs_42', '...')` exists
- WHEN `eliminarPostulante(42)` is called
- THEN `localStorage.getItem('soi_docs_42')` returns `null`

#### Scenario: Namespaced key used for storage

- GIVEN postulante with `id = 7`
- WHEN documents are saved
- THEN the key used is `'soi_docs_7'`

---

### E-07 listarPostulantesPorRango Date Normalization

The `hasta` parameter MUST be normalized to `YYYY-MM-DD` before the time suffix is appended: `hasta.slice(0, 10) + 'T23:59:59.999Z'`.

**Files**: `src/modules/alumnos/api/postuladosSupabase.js:148`
**Test**: `src/modules/alumnos/__tests__/postuladosSupabase.test.js`

#### Scenario: Time portion is normalized

- GIVEN `hasta = '2026-06-20T10:00:00Z'`
- WHEN `listarPostulantesPorRango` is called
- THEN the filter uses the string `'2026-06-20T23:59:59.999Z'`

---

### E-08 PDF Postulados — Municipio and Instrumento Columns

The postulados PDF table MUST include `Municipio` and `Instrumento` columns. Column widths MUST be adjusted so all columns fit within the page margins.

**Files**: `src/modules/alumnos/domain/generarPdfPostulados.js:127`
**Test**: `src/modules/alumnos/__tests__/generarPdfPostulados.test.js`

#### Scenario: Both values present in PDF output

- GIVEN a postulante with `municipio = 'Santo Domingo'` and `instrumento = 'Violin'`
- WHEN the PDF is generated
- THEN the PDF content includes `'Santo Domingo'`
- AND the PDF content includes `'Violin'`

---

## Summary

| Batch | Requirements | Scenarios |
|-------|-------------|-----------|
| A — Data Integrity | 8 (A-01 to A-08) | 16 |
| B — SPA Bugs | 8 (B-01 to B-08) | 14 |
| C — UX Consistency | 7 (C-01 to C-07) | 13 |
| D — Performance | 5 (D-01 to D-05) | 8 |
| E — Architecture + Reports | 8 (E-01 to E-08) | 13 |
| **Total** | **36** | **64** |

> Note: B-06 (alumnoTimeline env-aware mock) and D-03 (URL.revokeObjectURL) are captured under their primary batch. Findings #22 (single-roundtrip postulado update) and #30 (URL filter persistence) from the proposal are deferred to implementation tasks as they depend on a Supabase RPC not yet confirmed — they are marked as assumptions in the risks section below.

## Risks and Spec-Level Assumptions

| ID | Assumption | Basis |
|----|-----------|-------|
| R-1 | `AppModal` and `AppToast` components exist with `AppModal.confirm({title,body,onConfirm})` and `AppToast.success/error(msg)` APIs | Proposal lists them as a dependency; spec assumes API shape matches |
| R-2 | Finding #22 (single-roundtrip Supabase update) omitted from spec pending backend RPC confirmation | Proposal marks this as "may require new DB function" |
| R-3 | Finding #30 (URL filter persistence scoping) generalized into D-03 cleanup requirement | Proposal groups it under Batch D; no distinct file reference given |
| R-4 | Gender dropdown in E-05 derives from `cedula` prefix or an explicit `genero` field; implementation must clarify which | Proposal says "from cedula prefix or explicit field" — spec leaves derivation to design |
