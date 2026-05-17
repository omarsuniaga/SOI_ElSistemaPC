# Design: WCAG AA Accessibility Audit

## Technical Approach

Two-phase rollout preserving existing a11y patterns (`:focus-visible`, `.visually-hidden`, `focusTrap.js`, `AppToast role="alert"`, `AppModal role="dialog"`). Phase 1 is direct CSS/HTML fixes with no behavioral changes. Phase 2 introduces shared a11y utilities and keyboard navigation into existing views — each change is self-contained per view with zero schema impact.

---

## Architecture Decisions

### Decision 1: Touch Targets (gap 7)

| Option | Tradeoff |
|--------|----------|
| **A: `min-width`/`min-height: 44px`** | Overrides explicit `width` when 44px > current. Layout-safe because existing containers (`gap`, `padding`) already accommodate 38px+. Won't affect `.pm-avatar-btn` 32px → 44px which is a 37% jump. |
| **B: Increase fixed `width`/`height` to 44px** | Simpler CSS, but risks breaking tight layouts (header, button groups). |
| **C: Add `padding` to reach 44px hit area** | Keeps visual size unchanged, but `padding` shifts icon positioning and breaks circular buttons. |

**Choice**: Option **A+B hybrid** — use `min-width`/`min-height: 44px` for `.pm-icon-btn` (shifts from 38px→44px, +6px), and increase `.pm-avatar-btn` from 32px to 40px with `min-height: 44px` + `padding: 2px` to reach 44px without making the avatar look oversized. For `.pm-settings-avatar__edit` (28px), increase to 32px + `padding`.

**Rationale**: 44px is WCAG AA minimum. The 6px increase for icon buttons is absorbed by existing flex gaps (8px). Avatar from 32→40px fits within `--pm-header-h: 82px`. The edit button (28px→32px) sits at the avatar corner — 32px is still compact.

**Test strategy**: Component snapshot height check ≥ 44px. Puppeteer `element.getBoundingClientRect()` on all interactive elements in portal. Manually verify no overflow in header/footer on mobile (375px width viewport).

---

### Decision 2: Calendar Keyboard Navigation (gap 8)

| Option | Tradeoff |
|--------|----------|
| **A: Replace `.pm-cal-day` divs with `<button>` elements** | Auto-focusable via Tab. Simplest implementation. Day cells become Tab stops — 31+ tab stops in a month is excessive for keyboard users. |
| **B: `tabindex="0"` on day divs + arrow key handler** | Single Tab stop enters the calendar grid, arrow keys navigate days. WAI-ARIA grid pattern. More code but better UX. |
| **C: Keep divs, add `tabindex="0"` + Enter/Space handlers** | Simpler than full grid. Days are individually focusable (Tab to each). Still 31+ Tab stops. |

**Choice**: Option **B** — single `tabindex="0"` on the grid container, implement `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown` for day navigation, `Home`/`End` for week boundaries. Add `aria-label="${fecha}"` on each day and `aria-selected="true"` on the focused day. Focus starts on "today" or first day of month.

**Rationale**: Option B follows the WAI-ARIA grid navigation pattern that screen reader users expect. A single Tab stop into the calendar is far more usable than 31+. The implementation reuses the existing `onFechaClick` callback via simulated click.

**Implementation notes**: Add `role="grid"` to `.pm-cal-grid`, `role="row"` to each week row, `role="gridcell"` to each day. Wrap the month/year header as a `role="toolbar"` with `aria-controls` on the prev/next buttons. Keep the existing rendering structure — add data attributes only.

**Test strategy**: Unit test keyboard handler dispatch (arrow keys produce correct date selection). Manual test: Tab to calendar → Arrow keys cycle days → Enter selects → Screen reader announces date. Test month boundary wrapping.

---

### Decision 3: Form Error Announcements (gaps 9, 13)

| Option | Tradeoff |
|--------|----------|
| **A: Per-view error logic** | Each view duplicates pattern. Hard to audit. |
| **B: Shared `setFieldError(inputEl, message)` utility** | Single source of truth. Easy to test. Couples utility to DOM patterns. |
| **C: Reactive field wrapper component** | Too heavy for a vanilla JS project with no framework. |

**Choice**: Option **B** — create `src/portal-maestros/utils/a11yUtils.js` with `setFieldError(inputEl, message)` and `clearFieldErrors(container)`:

```js
export function setFieldError(inputEl, message) {
  const errorId = `${inputEl.id}-error`
  let errorEl = document.getElementById(errorId)
  if (!errorEl) {
    errorEl = document.createElement('span')
    errorEl.id = errorId
    errorEl.className = 'pm-field-error'
    errorEl.role = 'alert'
    inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling)
  }
  errorEl.textContent = message
  inputEl.setAttribute('aria-invalid', 'true')
  inputEl.setAttribute('aria-describedby', errorId)
}

export function clearFieldErrors(container) {
  container.querySelectorAll('.pm-field-error').forEach(el => el.remove())
  container.querySelectorAll('[aria-invalid]').forEach(el => {
    el.removeAttribute('aria-invalid')
    el.removeAttribute('aria-describedby')
  })
}
```

**Rationale**: Reusable across `registroAlumnoView.js` and future forms. Replaces the current toast-only error pattern with inline errors that screen readers announce via `role="alert"`. The `aria-describedby` association means SR announces the error when the field receives focus.

**Implementation notes**: Integrate into `registroAlumnoView.js` — replace the final `showToast` call in `handleSubmit` (line 254) with `clearFieldErrors` + `setFieldError` for each validation error. Keep server-side errors (email/cedula duplicates) as toasts since they're API responses, not field validation.

**Test strategy**: Unit test `setFieldError` creates correct DOM structure. Integration test: submit empty form → verify `aria-describedby` on first invalid input. Screen reader test: navigate to invalid field → hear error message read aloud.

---

### Decision 4: Dynamic Content aria-live Regions (gaps 10, 12)

| Option | Tradeoff |
|--------|----------|
| **A: `aria-live="polite"` on containers** | Screen reader announces content changes after finishing current speech. Works for all dynamic content. |
| **B: `role="status"` on status messages** | Implicit `aria-live="polite"` but reserved for status messages specifically. More semantic. |
| **C: `aria-live="assertive"` for critical updates** | Interrupts immediately — too aggressive for progress bars and evaluation status. |

**Choice**: Option **A+B hybrid**:

| Area | Region | Chosen |
|------|--------|--------|
| Asistencia progress bar (`#pm-progress-wrap`) | `aria-live="polite"` | Progress updates, not critical |
| Asistencia student list (`#pm-alumnos-list`) | `aria-live="polite"` | Table rows re-render on filter/sort |
| RutaPlayer evaluation status (`#ruta-eval-status`) | `role="status"` | Status message after save operation |
| Asistencia DSL editor feedback | `aria-live="polite"` | AI processing status messages |

**Rationale**: `aria-live="polite"` is the safe default — it doesn't interrupt. `role="status"` is more semantically precise for evaluation save confirmations. None of these regions need assertive interruptions.

**Implementation notes**: These are attribute-only changes in existing templates, not behavioral. The textContent updates already happen — screen readers will now announce them. Use a single `aria-live="polite"` wrapper `#pm-asist-status-region` rather than scattering attributes for easier management.

**Test strategy**: Use axe-core to verify live regions exist and have correct roles. Manual: trigger status update → VoiceOver/NVDA announces without interaction.

---

### Decision 5: RutaPlayer ARIA (gap 11)

| Option | Tradeoff |
|--------|----------|
| **A: `<h1>` + semantic landmarks + `aria-expanded`** | Minimal structural change. Fixes heading hierarchy. Removes inline `onmouseover`. Medium effort (~80 lines). |
| **B: Full `role="tree"` with `role="treeitem"`** | Most semantic for nested content tree. Complex keyboard handling (40+ lines). Requires rewriting click handlers. High regression risk. |
| **C: Section `role="region"` + `aria-label` only** | Low effort but doesn't solve inline style or `onmouseover` problems. |

**Choice**: Option **A** — three focused changes:

1. **Heading hierarchy**: Replace `<h2>` with `<h1>` in `_renderFull` (line 94). The view has no other `<h1>`, so this fixes the heading gap.
2. **Inline event handlers**: Replace `onmouseover`/`onmouseout` in `_renderIndicator` (line 248) with CSS classes and `:hover` in a `<style>` block. Add `:focus-visible` for keyboard users.
3. **Interactive elements**: Add `role="button"`, `tabindex="0"`, `aria-expanded` to toggle elements (`[data-action="toggle-level"]`, `[data-action="toggle-node"]`). Keyboard handler for `Enter`/`Space` clicks via `keydown` on the container.

**Rationale**: Full `role="tree"` would be ideal but the RutaPlayer has lazy loading (levels load nodes, nodes load indicators) which breaks the tree paradigm — you can't navigate to items that don't exist in DOM. Option A gives the biggest accessibility win with the least risk. The `onmouseover`→CSS migration fixes a real screen reader issue (inline handlers create confusing focus behavior).

**Implementation notes**: The view's event delegation in `_attachEvents` already handles `[data-action]` clicks. Extend it with a `keydown` listener at container level that dispatches the same `[data-action]` click path on `Enter`/`Space`. The CSS migration: extract hover background color to a CSS custom property in the `<style>` block instead of `onmouseover="this.style.background=..."`.

**Test strategy**: Unit test: `_renderIndicator` output no longer contains `onmouseover`. Integration: Tab through RutaPlayer → `Enter` expands level → `Tab` to node → `Space` expands → screen reader announces `aria-expanded` state. Keyboard eval flow: Tab to indicator → Enter to select → Tab to eval button → Enter.

---

### Decision 6: Push Status Announcements (gap 14)

| Option | Tradeoff |
|--------|----------|
| **A: Add `aria-live="polite"` to `#pm-notif-sub-badge` parent** | Simplest — one attribute change. Text updates via `textContent` will be announced. |
| **B: Create a dedicated `role="status"` region** | More semantic but requires rendering a new wrapper element in `renderNotifications`. |

**Choice**: Option **A** — wrap `#pm-notif-sub-badge` in a `<div aria-live="polite" aria-atomic="true">`. When the badge text changes from "⏸ Pausada" to "✅ Suscripción activa" (line 329 of `perfilView.js`), the screen reader announces the full text.

**Rationale**: Mutating `textContent` inside an `aria-live="polite"` element triggers automatic announcement. `aria-atomic="true"` ensures the full text is spoken, not just the diff. This requires zero behavioral changes — the existing `badge.textContent = ...` line 329 already fires the DOM mutation that triggers the live region.

**Implementation notes**: Change `renderNotifications` template: wrap the existing `<span id="pm-notif-sub-badge">` in a `<div aria-live="polite" aria-atomic="true">`. The `isPushSubscribed()` async result (line 47) sets `viewState.pushEnabled` before render, so the initial state is correct.

**Test strategy**: Manual: toggle push subscription → VoiceOver/NVDA announces "Suscripción activa" or "Pausada". No automated test needed — it's a standard `aria-live` behavior.

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/portal-maestros/styles/01-tokens.css` | Modify | `--apple-text-muted`: `#8e8e93` → `#6b6b70` (4.5:1 contrast) |
| `src/portal-maestros/styles/03-layout.css` | Modify | `.pm-icon-btn`: `min-width/height: 44px`; `.pm-avatar-btn`: `width/height: 40px` + `padding` |
| `src/portal-maestros/styles/10-responsive.css` | Modify | Mobile `.pm-icon-btn`: 36px→44px; `.pm-avatar-btn`: 36px→44px |
| `src/portal-maestros/styles/11-forms.css` | Modify | `.pm-settings-avatar__edit`: 28px→32px |
| `maestros.html` | Modify | Remove `user-scalable=no`; add skip-link anchor |
| `src/portal-maestros/utils/a11yUtils.js` | **Create** | `setFieldError()`, `clearFieldErrors()` |
| `src/portal-maestros/utils/portalUtils.js` | Modify | Add `setFieldError` export or keep separate |
| `src/portal-maestros/router/portalRouter.js` | Modify | Restore focus to trigger element after SPA transitions |
| `src/portal-maestros/views/loginView.js` | Modify | Add `keyboard` event on password toggle; `aria-label` |
| `src/portal-maestros/components/notificacionesPanel.js` | Modify | Add `role="dialog"` + `aria-modal` on drawer overlay |
| `src/portal-maestros/components/calendarioDrawer.js` | Modify | Keyboard nav on `.pm-cal-day` cells (grid pattern) |
| `src/portal-maestros/views/asistenciaView.js` | Modify | Add `aria-live="polite"` on progress + student list containers |
| `src/portal-maestros/views/rutaPlayerView.js` | Modify | `<h1>`, remove `onmouseover`, add `aria-expanded`, keyboard handler |
| `src/portal-maestros/views/registroAlumnoView.js` | Modify | Replace toast errors with `setFieldError()` + `aria-describedby` |
| `src/portal-maestros/views/perfilView.js` | Modify | Wrap `#pm-notif-sub-badge` in `aria-live` region |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `a11yUtils.setFieldError()` | DOM structure assertion (`aria-describedby`, `role="alert"`, error span) |
| Unit | Keyboard calendar nav | Dispatch ArrowLeft events, assert data-fecha changes |
| Unit | RutaPlayer `_renderIndicator` output | No `onmouseover` attribute present |
| Integration | axe-core automated scan | 0 critical/serious violations on portal entry |
| E2E | Keyboard flow | Tab through login → calendar → ruta → registro → logout, no focus traps |
| E2E | Touch targets | `getBoundingClientRect().width >= 44` on all interactive elements |
| Manual | Screen reader | NVDA: form errors announced via `aria-describedby`; push toggle announces status |
| Manual | RutaPlayer eval | `aria-expanded` toggles correctly; keyboard eval flow works |

## Open Questions

- [ ] Avatar 32px→44px: should we create a dedicated touch-target CSS token (e.g., `--pm-touch-min: 44px`) to keep consistency?
- [ ] Calendar keyboard: do we need month/year QuickNav (e.g., "G" to jump to date picker) or is arrow-based enough for v1?
- [ ] RutaPlayer: should we add a "skip to content" link within the view for keyboard users who don't want to Tab through every expandable level?
