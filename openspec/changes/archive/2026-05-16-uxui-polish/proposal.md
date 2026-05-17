# Proposal: UX/UI Polish — Portal Maestros

## Intent

The app currently has three rough edges that degrade the professional feel: (1) native `alert()` dialogs interrupt the teacher's workflow instead of using the existing toast system, (2) modals/panels don't trap keyboard focus, creating a confusing Tab order, and (3) view transitions are instant with no visual feedback, making navigation feel abrupt. These are small fixes that collectively signal quality — no new features, just polish.

## Scope

### In Scope
- Focus trap (Tab/Shift+Tab cycle) in 6 modals/panels: `ausenciaModal`, `JustificacionModal`, `studentProgressPanel`, `notificacionesPanel`, `pushDiagnostic`, `toolbarHelpModal`
- Auto-focus first focusable element on open; return focus to trigger element on close
- Fade transition between views: `.pm-view-enter` + `.pm-view-enter-active` classes, 200ms opacity + translateY(8px)
- Replace 3 native `alert()` calls in `asistenciaView.js` with `AppToast.show()` from existing shared component

### Out of Scope
- WCAG AA full audit (deferred to dedicated accessibility change)
- Responsive tablet fixes (separate effort)
- Empty state redesign (cosmetic only, no behavioral change)
- Other `alert()` calls outside `asistenciaView.js`

## Capabilities

### New Capabilities
None — purely additive CSS/JS, no new spec-level behavior.

### Modified Capabilities
None — existing capabilities unchanged at the requirements level.

## Approach

Three independent work units, each with its own test file:

1. **Focus management** (~80 lines): Add a `createFocusTrap(container, triggerEl?)` utility in `src/portal-maestros/utils/focusTrap.js`. Each of the 6 modals/panels calls it on open. Utility handles first-element focus, Tab cycling, and return focus on close. Pure vanilla JS, no dependencies.

2. **View transitions** (~40 lines, pure CSS): Add `.pm-view-enter` (opacity:0, translateY(8px)) and `.pm-view-enter-active` (opacity:1, translateY(0), transition 200ms) to `05-views.css`. In `router.js`, add a `requestAnimationFrame` two-step class toggle inside `_navigateTo` after setting `innerHTML`.

3. **Toast replacement** (~30 lines changed in `asistenciaView.js`): Import `AppToast` (already used elsewhere in the same file via `ausenciaModal`), replace 3 `alert()` calls with `AppToast.error()`. Add test for each replacement. Already a `ToastManager.success()` call pattern exists in the file — consistent with it.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/portal-maestros/utils/focusTrap.js` | **New** | `createFocusTrap()` utility |
| `src/portal-maestros/components/ausenciaModal.js` | Modified | Wire focus trap on open |
| `src/portal-maestros/components/JustificacionModal.js` | Modified | Wire focus trap on open |
| `src/portal-maestros/components/studentProgressPanel.js` | Modified | Wire focus trap on open |
| `src/portal-maestros/components/notificacionesPanel.js` | Modified | Wire focus trap on open |
| `src/portal-maestros/components/pushDiagnostic.js` | Modified | Wire focus trap on open |
| `src/portal-maestros/components/toolbarHelpModal.js` | Modified | Wire focus trap on open |
| `src/portal-maestros/styles/05-views.css` | Modified | Add `.pm-view-enter*` classes |
| `src/core/router/router.js` | Modified | Two-step class toggle on navigate |
| `src/portal-maestros/views/asistenciaView.js` | Modified | 3 `alert()` → `AppToast.error()` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Focus trap breaks existing modal scroll | Low | Test scroll behavior on each modal; `focusTrap` does NOT touch overflow |
| Transition flickers on slow devices | Low | 200ms is fast; `will-change: transform, opacity` on enter class |
| `alert()` replacements miss UX intent (blocking vs non-blocking) | Low | `alert()` was already non-blocking (single OK button); toast is equivalent |

## Rollback Plan

Single `git revert` of the merge commit. All changes are additive — no data migration, no schema changes.

## Dependencies

None.

## Success Criteria

- [ ] Tab order cycles within each of the 6 modals/panels (verified via keyboard test)
- [ ] Focus returns to trigger element after modal close
- [ ] View transitions show a visible 200ms fade on route change
- [ ] All 3 `alert()` calls in `asistenciaView.js` replaced; no native dialogs fire on error paths
- [ ] All existing tests pass (`npm run test:run`)
