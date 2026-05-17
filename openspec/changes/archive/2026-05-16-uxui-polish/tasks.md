# Tasks: UX/UI Polish — Portal Maestros

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~160-180 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

All 3 work units are independent (no file overlap). Can be done in any order.

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| A | Focus trap — create utility + wire 6 modals | Single PR | ~80 lines |
| B | Fade transitions — CSS + router hook | Single PR | ~30 lines |
| C | Toast replacement — 3 `alert()` → `AppToast.error()` | Single PR | ~15 lines |

## Phase 1: Focus Trap Utility & Modal Wiring

- [x] 1.1 Create `src/portal-maestros/utils/focusTrap.js` exporting `createFocusTrap(container, triggerEl?)` — Tab/Shift+Tab cycle, auto-focus first element, store trigger, return focus on close, Escape to close
- [x] 1.2 Wire focus trap in `ausenciaModal.js` — call `createFocusTrap()` in `attachEvents()` / `open()`
- [x] 1.3 Wire focus trap in `JustificacionModal.js`
- [x] 1.4 Wire focus trap in `studentProgressPanel.js`
- [x] 1.5 Wire focus trap in `notificacionesPanel.js`
- [x] 1.6 Wire focus trap in `pushDiagnostic.js`
- [x] 1.7 Wire focus trap in `toolbarHelpModal.js`

## Phase 2: View Transitions

- [x] 2.1 Add `.pm-view-enter` (opacity:0, translateY(8px)) and `.pm-view-enter-active` (opacity:1, translateY(0), transition 200ms) to `src/portal-maestros/styles/05-views.css`
- [x] 2.2 Hook `portalRouter.js` `_dispatch` — apply `.pm-view-enter` after handler sets content, rAF-swap to `.pm-view-enter-active`

## Phase 3: Toast Replacement

- [x] 3.1 Add `import { AppToast }` to `src/portal-maestros/views/asistenciaView.js`
- [x] 3.2 Replace 3 `alert()` calls with `AppToast.error()` using consistent icon + message format (error-path alerts: error al generar informe, error al estructurar con IA, error al guardar planificación)

## Phase 4: Testing

- [x] 4.1 Focus trap test: verify Tab cycles within modal contents, Shift+Tab reverses, Escape closes, focus returns to trigger
- [x] 4.2 View transition test: verify `.pm-view-enter` + `.pm-view-enter-active` classes appear/disappear on route change
- [x] 4.3 Toast replacement test: verify `AppToast.error()` called instead of `alert()` on each of the 3 error paths
- [x] 4.4 Run full test suite: `npm run test:run`
