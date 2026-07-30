# Proposal: transicion-semestre

## Intent

The ACM portal has no semester transition workflow. When a new academic period begins, administrators must manually recreate every class and re-enroll every student — a tedious, error-prone process that wastes hours each cycle. We need a guided wizard that clones classes from the old period into a new one, re-enrolls students (bulk or selective), and lets administrators preview all changes before executing. This closes the biggest operational gap in the portal.

## Scope

### In Scope
- Semester transition wizard (multi-step: source period → target period → preview → execute)
- Clone classes from Period N to N+1 with metadata (teacher, room, schedule, capacity)
- Bulk re-enroll all students from old classes into new classes (selective opt-out)
- Selective enrollment: pick specific students per class
- Preview diff before execution (classes to create, enrollments to create)
- Student fuzzy search (Levenshtein via existing `lib/fuzzyMatch.js`) in transition UI
- Filter students by specific instrument (not just boolean has/doesn't-have)
- Historical period selector to browse past period data
- Add Periodos group to ACM sidebar nav
- Unit tests (Vitest) for API and component logic

### Out of Scope
- DB schema migration (no `periodo_id` on `alumnos_clases` — out of scope; transition copies enrollments without linking to source)
- Period CRUD changes (already works)
- Attendance data migration
- Grade/history carryover
- Automated scheduling or conflict resolution for new period
- Rollback of executed transitions (admin undo)

## Capabilities

### New Capabilities
- `semester-transition`: Clone classes and enrollments across periods via wizard with preview, selective enrollment, fuzzy student search, and instrument filtering
- `period-history-browsing`: View historical period data (classes, enrollments) from a period selector

### Modified Capabilities
- `academic-class-management`: Transition wizard adds bulk class cloning; nav group "Periodos" added to ACM sidebar

## Approach

**Phase 1 — API layer**: `semesterTransition.js` (fetch source classes, clone to target, bulk enroll) + `studentClassifier.js` (fuzzy search + instrument filter). All via existing Supabase DataAdapter pattern with mock-first.

**Phase 2 — UI components**: `TransitionWizard.js` (stepper), `ClassEditor.js` (post-clone review), `StudentClassifier.js` (search panel), `PeriodSelector.js` (dropdown).

**Phase 3 — View + routing**: `transicionView.js` entry point, route registration in `allRegistrars.js`, nav group in `acm.js`.

**Phase 4 — Tests**: Unit tests for API functions and component rendering.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/transicion-semestre/` | New | Entire module (API, components, views, tests) |
| `src/portales/acm/acm.js` | Modified | Add "Periodos" nav group with transition route |
| `src/modules/_shared/allRegistrars.js` | Modified | Register transition routes |
| `src/modules/clases/api/clasesApi.js` | Read-only | Reference for clone pattern (no changes) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `alumnos_clases` lacks `periodo_id` — enrollments are not period-scoped | High | Transition copies enrollments without source linking; defer schema change |
| Clone fails mid-batch (partial transition) | Med | Use Supabase transactions; show preview before execute; atomic batch |
| Fuzzy search performance on large student lists | Low | Client-side, Levenshtein is O(n*m) with small n per query |
| Admin accidentally transitions to wrong period | Low | Two-step confirmation (preview + explicit execute) |

## Rollback Plan

- Deleted classes from wrong period: query `clases` WHERE `periodo_id = target` and delete
- Created enrollments: query `alumnos_clases` WHERE enrollment timestamp > transition start and delete
- No schema changes to revert (no migration)
- Document rollback queries in `scripts/` for admin use

## Dependencies

- Existing `clasesApi.js` clone patterns (read-only reference)
- `lib/fuzzyMatch.js` Levenshtein implementation
- `core/modalManager.js` for wizard modals
- Supabase real-time not required (batch operation)

## Success Criteria

- [ ] Admin can select source period → target period → preview diff → execute transition
- [ ] All classes cloned with correct teacher, room, schedule, capacity
- [ ] Bulk enrollment re-creates all student-class links in new period
- [ ] Selective enrollment allows opting out specific students
- [ ] Fuzzy search finds students by partial name/cedula match
- [ ] Instrument filter works (not just boolean)
- [ ] Historical period selector shows past period data
- [ ] "Periodos" group visible in ACM sidebar nav
- [ ] All API functions have Vitest unit tests
- [ ] Full flow works in Demo Mode (mock data)
