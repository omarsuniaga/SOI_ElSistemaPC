# Proposal: Alumnos Module — Audit Bug Fix & Improvement

## Intent

A full audit of `src/modules/alumnos/` uncovered 40 issues across data integrity, SPA safety, UX, performance, and architecture. These bugs cause real data corruption (CSV export always marks students as active, accented characters break in Excel, search always returns empty, card renders '?' initials), XSS exposure via unescaped HTML attributes, memory leaks across navigations, and broken demo mode. The module is in daily use; these are not theoretical risks.

## Scope

### In Scope
- Fix all 40 findings grouped into 5 batches (A–E) in `src/modules/alumnos/` and related files under `src/modules/alumnos/views/postulados/`
- Write or update Vitest unit tests for every fix
- Replace all native `alert/confirm/prompt` calls with `AppToast/AppModal`
- Consolidate duplicate domain logic (`calcularEdad`, `calcularCompletitud`)
- Remove dead code (`alumno.model.js`, `useAlumnos.js`, triple re-export chain)

### Out of Scope
- No new features beyond what restores correct existing behavior
- No DB schema changes — fixes are app-layer only
- No changes outside `src/modules/alumnos/` (no shared components unless already touched by fixes)
- No i18n / no new views / no routing changes

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `student-registration`: email validation gap closed (finding #25); `nombre` field must be editable in edit modal (#15); schema field names corrected (`nombre`, `is_active`) across all components; `calcularCompletitud` unified to 22-field domain version

## Approach

Five batches deliver value incrementally and keep each PR under the 400-line review budget.

**Batch A — Critical data integrity** (deliver first, unblocks trust in exports):
Fix CSV `a.estado` → `a.is_active` (#1), add UTF-8 BOM (#2), escape `"` and `'` in `escapeHTML` (#3), fix `alumnoCard.js` schema (#4), fix `useAlumnos.search()` field names (#5), unify `calcularCompletitud` to 22 fields (#6), designate `domain/calcularEdad.js` as canonical and remove other implementations (#7), fix `alumnosMock.js` hoisting (#8).

**Batch B — SPA correctness** (isolates the module from SPA pollution):
Scope `document.querySelectorAll` → `container.querySelectorAll` (#11, #12), fix stale-closure `state.editando` with local scope (#9), fix double render of empty state (#10), add null guard in `actualizarAlumno` (#13), fix `alumnoTimeline.js` corrupted text / mock-always-loads (#14), unlock `nombre` field in edit modal (#15), implement `buscarPostulante` in `postuladosMock.js` (#16), fix delete-modal race condition with scoped query and no-setTimeout (#17), revoke `URL.createObjectURL` after use (#35).

**Batch C — UX consistency** (user-visible improvements):
Replace all `alert/confirm/prompt` with `AppToast/AppModal` (#23), extend search to include email + cédula (#24), wire `isValidEmail` into `collectAndValidateAlumno` (#25), notify when postulados entries are filtered out (#26), add name search in postulados view (#27), warn on unsaved changes before closing modal (#28), add sortable columns to student list (#29).

**Batch D — Performance** (scale safety):
Add pagination / `.limit()` to `obtenerAlumnos` (#18), memoize `calcularCompletitud` in `applyFilters` (#19), implement cleanup in SPA navigation hooks (#20), parallelize alumno+clases queries with `Promise.all` (#21), merge `actualizarEstadoPostulante` SELECT+UPDATE into single RPC or conditional upsert (#22), fix `listarPostulantesPorRango` date normalization (#40), scope URL filters persistence (#30).

**Batch E — Architecture + reports** (dead code and report gaps):
Delete `alumno.model.js` and `useAlumnos.js` (#31, #33), flatten triple re-export chain (#32), disable mock JSON load in `alumnoTimeline.js` based on env (#34), add CSV export to monthly report (#36), add instrument/gender/municipality/age-range filters to report (#37), add municipality and instrument columns to postulados PDF (#38), namespace + clean up localStorage keys (#39).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/alumnos/views/alumnosView.js` | Modified | CSV fix, search extend, modal scoping, empty-state dedup, stale closure, cleanup |
| `src/modules/alumnos/components/alumnoCard.js` | Modified | Schema field names corrected |
| `src/modules/alumnos/utils/alumnosUtils.js` | Modified | `escapeHTML` quote escaping |
| `src/modules/alumnos/hooks/useAlumnos.js` | Removed | Dead hook deleted |
| `src/modules/alumnos/models/alumno.model.js` | Removed | Dead model with old schema deleted |
| `src/modules/alumnos/domain/calcularEdad.js` | Modified | Canonical implementation; others removed |
| `src/modules/alumnos/domain/completitudAlumno.js` | Modified | Single 22-field source of truth |
| `src/modules/alumnos/domain/editarAlumnoModal.js` | Modified | `nombre` unlocked, unsaved-changes guard added |
| `src/modules/alumnos/components/alumnoTimeline.js` | Modified | Corrupted text fixed, env-aware mock flag |
| `src/modules/alumnos/api/alumnosSupabase.js` | Modified | Pagination, null guard, parallel queries |
| `src/modules/alumnos/api/postuladosSupabase.js` | Modified | Single-roundtrip update, date normalization |
| `src/modules/alumnos/api/postulantesApi.js` | Modified | Re-export chain collapsed |
| `src/modules/alumnos/api/postuladosMock.js` | Modified | `buscarPostulante` implemented |
| `src/modules/alumnos/views/reporteInscripcionesMes.js` | Modified | CSV export added, filters added |
| `src/modules/alumnos/domain/generarPdfPostulados.js` | Modified | Municipality + instrument columns added |
| `src/modules/alumnos/views/postulados/postuladosView.js` | Modified | Scoped queries, search added, filter notification |
| `src/modules/alumnos/views/postulados/postuladoCalendarioView.js` | Modified | Scoped queries |
| `src/modules/alumnos/views/postulados/postuladoPerfilView.js` | Modified | localStorage namespaced |
| `src/modules/alumnos/views/alumnoAdminView.js` | Modified | Scoped container queries, parallel fetch |
| `src/modules/alumnos/api/alumnosMock.js` | Modified | Hoisting bug fixed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Removing `useAlumnos.js` breaks an undiscovered caller | Low | `rg` search for all imports before deletion; add to verify checklist |
| Paginating `obtenerAlumnos` changes behavior in admin views that expect all records | Med | Use cursor-based pagination; audit all callers; make page size configurable |
| Collapsing re-export chain breaks external consumers | Low | Search all imports of `postulantesApi`; verify in Batch E before merge |
| AppModal API differences across existing usages | Low | Confirm AppModal/AppToast API before Batch C; spike first if needed |

## Rollback Plan

Each batch is a separate PR targeting `master`. Revert is `git revert <pr-merge-commit>` per batch. Batches A and B are pure bug fixes with no behavior change — safest to revert individually. CSV BOM change (#2) is the highest-visibility user-facing change; can be feature-flagged behind a `?bom=1` query param if rollback needed without full revert.

## Dependencies

- `AppToast` and `AppModal` components must exist and be importable before Batch C lands
- Supabase RPC for single-roundtrip postulado update (Batch D, #22) — may require a new DB function; confirm with backend team before Batch D

## Success Criteria

- [ ] CSV export shows correct `is_active` value per student
- [ ] CSV export opens without character corruption in Excel (UTF-8 BOM present)
- [ ] `escapeHTML` escapes `"` and `'` — verified by unit test with attribute injection
- [ ] `alumnoCard.js` renders correct name and active/inactive badge
- [ ] Search returns results when matching nombre, email, or cédula
- [ ] `calcularCompletitud` returns identical result in list view and monthly report
- [ ] `calcularEdad` has one implementation; all 6 call sites use it
- [ ] No `alert/confirm/prompt` calls remain in `src/modules/alumnos/`
- [ ] All SPA navigations clean up their event listeners
- [ ] `obtenerAlumnos` fetches paginated; no full-table download
- [ ] `useAlumnos.js` and `alumno.model.js` deleted; no broken imports
- [ ] All new and modified paths covered by Vitest unit tests
- [ ] `npm run test:run` passes with zero failures after each batch
