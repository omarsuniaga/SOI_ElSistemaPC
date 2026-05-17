# Spec: WCAG AA Accessibility Audit — Portal Maestros

> **Change:** `wcag-aa-accessibility-audit`
> **Phase 1 (Quick Wins):** Requirements 1–6
> **Phase 2 (Needs Design):** Requirements 7–14
> **Baseline:** Existing good patterns (focus trap, `prefers-reduced-motion`, `:focus-visible`, `.pm-visually-hidden`, dark mode contrast, AppToast `role="alert"`, AppModal `role="dialog"`) are confirmed working and NOT modified by this spec.

---

## Requirement 1: Color Contrast — Tertiary Label Text

### WCAG SC reference
**1.4.3 Contrast (Minimum) — Level AA**  
Normal text (< 18px / < 14px bold) must have contrast ratio ≥ 4.5:1 against its background.

### Current state
```css
--apple-text-muted: #8e8e93;
--pm-text-muted: var(--apple-text-muted);
```
On the default light background `#f2f2f7`, `#8e8e93` yields a contrast ratio of approximately **2.8:1**, which fails WCAG AA. This value is used for secondary labels, hints, timestamps, and captions throughout the entire Portal Maestros.

The dark mode value (`#94a3b8` on `#1c1c1e`) passes at approximately 4.6:1 — no change needed there.

### Required state
The `--apple-text-muted` token must be darkened to a value that passes ≥ 4.5:1 on `#f2f2f7` (light surface) AND on `#ffffff` (white card surfaces). Target: `#6b6b70` (calculated contrast: 4.6:1 on `#f2f2f7`, 5.1:1 on `#ffffff`).

### Acceptance criteria
1. `--apple-text-muted` value changed from `#8e8e93` to `#6b6b70` in `01-tokens.css`
2. Automated color contrast check (axe-core `color-contrast`) on any view using `.pm-text-muted` or the token: 0 violations
3. Dark mode value `#94a3b8` remains unchanged and continues to pass

### Affected files
- `src/portal-maestros/styles/01-tokens.css` — change token value on line 11

---

## Requirement 2: Skip to Content Link

### WCAG SC reference
**2.4.1 Bypass Blocks — Level A**  
A mechanism must be available to skip to the main content.

### Current state
`maestros.html` has no skip link. The page loads into `<div id="portal-app">` and the SPA renders views inside it. Keyboard and screen reader users must tab through the entire header (avatar, notifications bell, navigation, etc.) before reaching the main view content.

### Required state
A "Saltar al contenido" link is the first focusable element in `<body>`, hidden until focused. When activated, it moves focus to `#portal-app` main content area (or the first `role="main"` element rendered by the active view).

### Acceptance criteria
1. A `<a href="#portal-app" class="pm-skip-link">Saltar al contenido</a>` exists as the first child of `<body>` in `maestros.html`
2. The skip link is visually hidden by default, becomes fully visible on `:focus` / `:focus-visible` (e.g. absolute positioned, top 8px, left 8px, z-index above everything)
3. Activating the link sets `tabindex="-1"` on `#portal-app` and calls `.focus()` to move keyboard focus
4. axe-core `bypass` rule: 0 violations

### Affected files
- `maestros.html` — add skip-link anchor + inline or linked CSS
- `src/portal-maestros/styles/02-base.css` — add `.pm-skip-link` class styles

---

## Requirement 3: SPA Focus Management

### WCAG SC reference
**2.4.3 Focus Order — Level A**  
**4.1.2 Name, Role, Value — Level A**  
When content changes without a full page load, focus must move to the new content.

### Current state
`portalRouter.js` `_dispatch()` calls the route handler which replaces `container.innerHTML`, but never explicitly moves focus. After a view transition, keyboard focus remains on the triggering element (or is lost to `<body>`). The view transition animation (`pm-animate-fade-in`) provides no focus management.

### Required state
After every route dispatch, the router (or each view's render function) must move focus to the newly rendered view's `<h1>` (or first heading / `role="main"` container). This must happen after the DOM update and any view transition.

### Acceptance criteria
1. In `portalRouter.js`, after `callFn()` completes in `_dispatch()`, find `.pm-view-content.active` and focus its first heading (`h1`, `h2`, or `[role="main"]`), adding `tabindex="-1"` if needed
2. If `document.startViewTransition` is used, focus restoration happens in `updateCallbackDone` or `finished` promise
3. Focus is visually indicated (browser default `:focus-visible` outline or custom ring) on the focused heading
4. Manual keyboard test: Tab to a nav link → Enter → focus moves to the new view's heading, not back to the trigger

### Affected files
- `src/portal-maestros/router/portalRouter.js` — add focus management in `_dispatch()` after view rendering
- Each view's render function (per proposal): ensure the view container has a focusable heading target

---

## Requirement 4: Viewport user-scalable=no

### WCAG SC reference
**1.4.4 Resize Text — Level AA**  
Text must be resizable up to 200% without loss of content or functionality. `user-scalable=no` blocks this.

### Current state
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```
`user-scalable=no` and `maximum-scale=1.0` prevent pinch-zoom on mobile, violating WCAG AA.

### Required state
Remove `user-scalable=no` and `maximum-scale=1.0` from the viewport meta tag. The viewport must allow zoom.

### Acceptance criteria
1. Viewport meta tag reads: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
2. Pinch-zoom works on mobile devices / Chrome DevTools device mode
3. No layout breakage at 200% zoom (existing responsive design handles this)
4. axe-core `meta-viewport` rule: 0 violations

### Affected files
- `maestros.html` — line 5, remove `maximum-scale=1.0, user-scalable=no`

---

## Requirement 5: Login Password Toggle Keyboard Accessibility

### WCAG SC reference
**2.1.1 Keyboard — Level A**  
All functionality must be operable through a keyboard interface.

### Current state
`loginView.js` lines 93–111: The password visibility toggle (`#pm-toggle-password`) uses only `mousedown`, `mouseup`, and `mouseleave` events. A keyboard user can focus the button (it's a `<button>`) but pressing Enter/Space does nothing — the handlers never fire.

### Required state
Replace or augment mouse-only events with a single `click` handler that toggles password visibility. (`click` fires for both mouse and keyboard activation on `<button>` elements.)

### Acceptance criteria
1. `mousedown`/`mouseup`/`mouseleave` handlers are replaced with a single `click` event that toggles `passwordInput.type` between `'text'` and `'password'`
2. Focus the password field, Tab to the toggle button, press Enter/Space → password visibility toggles
3. The toggle button's `aria-label` or `title` updates dynamically (e.g. "Mostrar contraseña" ↔ "Ocultar contraseña")
4. The toggle button has `aria-pressed` attribute reflecting the current state (optional but recommended)

### Affected files
- `src/portal-maestros/views/loginView.js` — replace mousedown/mouseup/mouseleave with click handler

---

## Requirement 6: Notifications Drawer — Dialog Semantics

### WCAG SC reference
**4.1.2 Name, Role, Value — Level A**  
**1.3.1 Info and Relationships — Level A**  
Interactive dialogs must communicate their role and modal state to assistive technology.

### Current state
`notificacionesPanel.js` renders the drawer overlay with:
```html
<div id="pm-notificaciones-drawer-overlay" class="pm-drawer-overlay">
  <div class="pm-drawer">
    <!-- ... -->
  </div>
</div>
```
No `role="dialog"`, no `aria-modal`, no `aria-label` or `aria-labelledby`. The focus trap exists (`enableTrap`) but the dialog semantics are missing, so screen readers don't announce it as a dialog.

### Required state
The drawer overlay must have `role="dialog"` and `aria-modal="true"`. The drawer heading should be referenced via `aria-labelledby`. Opening the dialog announces it as a dialog.

### Acceptance criteria
1. `#pm-notificaciones-drawer-overlay` has `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="pm-notif-dialog-title"`
2. The heading `<h4>` inside the drawer has `id="pm-notif-dialog-title"`
3. Opening the panel via `notificacionesPanel.open()` sets focus to the first focusable element inside the drawer (close button or "Mark all read" button)
4. Closing the panel returns focus to the trigger element that opened it (bell icon in header)
5. Focus trap still works correctly within the dialog

### Affected files
- `src/portal-maestros/components/notificacionesPanel.js` — add ARIA attributes to drawer overlay and heading; manage focus on open/close

---

## Requirement 7: Touch Target Sizes

### WCAG SC reference
**2.5.8 Target Size (Minimum) — Level AA** (WCAG 2.2)  
Pointer targets must be at least 24×24 CSS pixels. (The spec uses 44×44 as a de facto standard for mobile, which is the iOS HIG minimum — targets below this are hard for users with motor impairments.)

### Current state
```css
/* 03-layout.css line 64–78 */
.pm-avatar-btn {
  width: 32px;
  height: 32px;   /* ← 32×32: FAIL */
}
/* 03-layout.css line 93–106 */
.pm-icon-btn {
  width: 38px;
  height: 38px;   /* ← 38×38: FAIL */
}
/* 10-responsive.css line 64–68 (mobile) */
.pm-icon-btn {
  width: 36px;
  height: 36px;   /* ← even smaller on mobile: FAIL */
}
```
Avatar buttons (header user menu) at 32×32 and icon buttons (back, actions) at 36-38px are below the 44×44 minimum. These are used in `asistenciaView.js`, the app header, notifications drawer, and other views.

### Required state
Increase `.pm-avatar-btn` and `.pm-icon-btn` to minimum 44×44px. For the avatar, maintain the visual appearance by keeping the image at 32px inside a 44px hit area.

### Acceptance criteria
1. `.pm-avatar-btn` has `min-width: 44px; min-height: 44px;` (or explicit `width: 44px; height: 44px;`)
2. `.pm-icon-btn` has `min-width: 44px; min-height: 44px;` (or explicit `width: 44px; height: 44px;`)
3. Inside `.pm-avatar-btn`, the `<img>` remains 32px (or proportionally scaled) for visual appearance, but the button hit area is 44px
4. No layout breakage in header, asistencia view, or notification drawer at various viewport sizes
5. axe-core `target-size` rule: 0 violations (if using WCAG 2.2)

### Affected files
- `src/portal-maestros/styles/03-layout.css` — increase `.pm-avatar-btn` and `.pm-icon-btn` dimensions
- `src/portal-maestros/styles/10-responsive.css` — increase mobile `.pm-icon-btn` dimensions

---

## Requirement 8: Calendar Day Cell Keyboard Navigation

### WCAG SC reference
**2.1.1 Keyboard — Level A**  
**2.4.3 Focus Order — Level A**  
Interactive elements must be keyboard accessible.

### Current state
`calendarioDrawer.js` `_attachMonthEvents()` (line 239–250) adds `click` handlers only to `.pm-cal-day:not(.empty)`:
```javascript
container.querySelectorAll('.pm-cal-day:not(.empty)').forEach(day => {
  day.addEventListener('click', () => { ... })
})
```
Day cells are `<div>` elements with no `tabindex`, no `role`, and no keyboard event handlers. They cannot receive focus via Tab, and pressing Enter/Space does nothing.

### Required state
Each `.pm-cal-day:not(.empty)` must:
- Have `tabindex="0"` (or `-1` with Arrow key roving tabindex)
- Respond to Enter and Space keys to fire the same action as click
- Be visually focusable (`:focus-visible` outline)
- Navigation month buttons (`#pm-cal-prev`, `#pm-cal-next`) are already `<button>` elements — verify they are accessible

### Acceptance criteria
1. All non-empty day cells have `tabindex="0"` on render
2. Pressing Enter or Space on a focused day cell triggers `onFechaClick` (same as click)
3. Arrow keys optionally navigate between day cells (roving tabindex — nice to have for Phase 2, not blocking)
4. Focus order in the calendar: prev month button → title → next month button → day cells (grid)
5. Month navigation buttons already work with keyboard

### Affected files
- `src/portal-maestros/components/calendarioDrawer.js` — add `tabindex` to day cells, add keyboard event handler for Enter/Space

---

## Requirement 9: Form Error Announcements — aria-describedby

### WCAG SC reference
**3.3.1 Error Identification — Level A**  
**4.1.2 Name, Role, Value — Level A**  
Errors must be identified and described to the user, including assistive technology.

### Current state
- **Login form** (`loginView.js`): Errors are shown in `#pm-login-error` with `aria-live="polite"`, which is good. But the individual input fields have no `aria-describedby` pointing to the error message. After an error, screen readers may hear the announcement but won't know which field has the error when re-focusing it.
- **Student registration** (`registroAlumnoView.js`): Lines 253–258 — errors are dispatched as a custom `showToast` event (toast notification) only. No inline error message, no `aria-describedby`, no `aria-invalid`. Screen reader users hear a toast but have no association with the specific input.

### Required state
- For login: Add `aria-describedby="pm-login-error"` to both email and password inputs when an error is displayed.
- For student registration: Add inline error messages below each invalid field, linked via `aria-describedby`. Show errors immediately on blur or on submit, not only as toast. The toast can remain as a supplementary notification.

### Acceptance criteria
1. Login `emailInput` and `passwordInput` get `aria-describedby="pm-login-error"` when `errorMsg.textContent` is non-empty
2. Registration form: each input with a validation error gets `aria-invalid="true"` and `aria-describedby` pointing to an error message element
3. Registration form: error messages are rendered inline (below or next to the field), visually visible, not just in a toast
4. Screen reader test: fill form, submit with errors → focus moves to first invalid field → error is announced
5. Registration form: individual field errors (not just first error) are shown simultaneously

### Affected files
- `src/portal-maestros/views/loginView.js` — add `aria-describedby` to email and password inputs in error state
- `src/portal-maestros/views/registroAlumnoView.js` — add inline error rendering, `aria-invalid`, `aria-describedby` to form fields

---

## Requirement 10: Dynamic Content aria-live — metricasView

### WCAG SC reference
**4.1.3 Status Messages — Level AA (WCAG 2.1)**  
**3.3.1 Error Identification — Level A**  
Status messages that don't take focus must be announced by assistive technology.

### Current state
`metricasView.js` replaces the entire `container.innerHTML` when:
- Period filter changes (line 424): `container.innerHTML = generarHTML(procesados)`
- Initial load (line 591): `container.innerHTML = generarHTML(procesados)`
- Error state (line 595): renders fallback with `role="alert"` (good for the error case)

The container has no `aria-live` region. When data updates (e.g. changing period from "4 semanas" to "8 semanas"), screen readers receive no announcement that the content has changed, unless a form element steals focus.

### Required state
The dashboard container element must have `aria-live="polite"` and `aria-atomic="true"` (or `false` depending on AT behavior). Or, wrap the dynamic data sections in separate `aria-live` regions. The period selector change should result in an announcement like "Dashboard actualizado — 8 semanas".

### Acceptance criteria
1. The `.pm-dashboard` container (or a wrapper) has `aria-live="polite"` and `aria-atomic="true"`
2. After period change and re-render, a screen reader announces the new content (test with NVDA/VoiceOver)
3. Alternatively, render a `.pm-visually-hidden` status message that says the data was updated
4. Error state already has `role="alert"` — keep as-is
5. Loading state (spinner) should have `aria-label="Cargando métricas..."` (currently it doesn't)

### Affected files
- `src/portal-maestros/views/metricasView.js` — add `aria-live` to dashboard container, add loading announcement, consider a visually-hidden status message

---

## Requirement 11: RutaPlayerView — Heading Hierarchy, ARIA Tree, Remove Inline Styles

### WCAG SC reference
**1.3.1 Info and Relationships — Level A**  
**2.4.6 Headings and Labels — Level AA**  
**4.1.2 Name, Role, Value — Level A**  
Semantic structure must be conveyed programmatically.

### Current state
`rutaPlayerView.js` has multiple issues:
1. **No `<h1>`**: The view title is an `<h2>` (line 94). Each page should have exactly one `<h1>`.
2. **Extensive inline styles**: Every element uses `style="..."` attributes instead of CSS classes (lines 75–86, 89–125, 130–145, 147–198, 200–252, 261–321). This makes it impossible for users to override styles and creates a maintenance burden.
3. **No ARIA tree semantics**: The level/nodes structure is a collapsible tree (`[data-action="toggle-level"]`, `[data-action="toggle-node"]`) but has no `role="tree"`, `role="treeitem"`, or `aria-expanded`. Screen readers see divs with click handlers.
4. **Inline `onmouseover`/`onmouseout`**: Line 247–248 uses `onmouseover` and `onmouseout` attributes, which are not keyboard accessible and create hover-only visual changes with no focus equivalent.
5. **Pending banner**: The banner (line 75–86) uses inline styles but is otherwise functional.

### Required state
1. Change the main view heading from `<h2>` to `<h1>` (or add a `<h1 class="pm-visually-hidden">` and keep `<h2>` as visual title — but a visible `<h1>` is preferred).
2. Refactor inline styles into CSS classes in a `<style>` block or the component's injected stylesheet. At minimum, move all shared/repeated styles to classes.
3. Add ARIA tree semantics: `role="tree"` on the blocks container, `role="treeitem"` on expandable level/node items, `aria-expanded` on toggle triggers. Indicators can be `role="treeitem"` without expand/collapse.
4. Replace `onmouseover`/`onmouseout` with CSS `:hover` and a focus class managed via `:focus-visible` or JavaScript focus/blur events.
5. Evaluation buttons in the action panel already have `cursor:pointer` and are `<button>` elements — confirm they have accessible names.

### Acceptance criteria
1. The view has exactly one `<h1>` element visible on screen
2. Inline `style="..."` attributes are removed in favor of CSS classes (at minimum for structural elements like containers, cards, banners)
3. Tree structure has `role="tree"`, items have `role="treeitem"`, toggle triggers have `aria-expanded` (true/false)
4. Hover effects on indicators have keyboard equivalents via `:focus-visible`
5. axe-core run on RutaPlayerView: 0 violations for `heading-order`, `aria-tree`, `aria-required-parent`, `role`
6. Keyboard test: Tab through tree items, Enter/Space to expand/collapse levels and nodes

### Affected files
- `src/portal-maestros/views/rutaPlayerView.js` — heading hierarchy, CSS extraction, ARIA tree, keyboard hover, inline style removal

---

## Requirement 12: AsistenciaView — aria-live for Dynamic Attendance Table

### WCAG SC reference
**4.1.3 Status Messages — Level AA**  
Dynamic content updates must be announced to assistive technology.

### Current state
`asistenciaView.js` `renderLista()` (line 1262–1287) completely replaces `listEl.innerHTML` whenever an attendance state changes (P/J/A clicks). The list element `#pm-alumnos-list` has no `aria-live` region. Screen reader users don't hear when a student's attendance state changes or when the list re-renders.

The progress section (`_updateProgress()` at line 1413) updates `#pm-progress-fill` width and `#pm-progress-label` text but also has no `aria-live`.

### Required state
Add `aria-live="polite"` to the student list container. When a student's attendance is toggled, announce the student's name and new status (e.g. "María García — Presente"). The progress indicator should also have `aria-live="polite"` with a status announcement.

### Acceptance criteria
1. `#pm-alumnos-list` has `aria-live="polite"` and `aria-atomic="false"` (so individual mutations are announced)
2. After clicking P/A/J for a student, the list re-render includes a visually-hidden announcement: `<span class="pm-visually-hidden">${nombre}: ${estadoLabel} marcado</span>`
3. Progress display has `aria-live="polite"` and announces e.g. "3 de 12 alumnos marcados" on change
4. Screen reader test: Click "P" on a student → hear "Juan Pérez: Presente marcado"

### Affected files
- `src/portal-maestros/views/asistenciaView.js` — add `aria-live` to student list and progress; add visually-hidden status announcements in `renderLista` and `_updateProgress`

---

## Requirement 13: registroAlumnoView — Inline Validation Errors

### WCAG SC reference
**3.3.1 Error Identification — Level A**  
**3.3.2 Labels or Instructions — Level A**  
Validation errors must be identifiable and associated with their input fields.

### Current state
`registroAlumnoView.js` `handleSubmit()` (lines 247–350) calls `validateForm()` which returns an array of error strings. If there are errors, only the first error is shown as a toast:
```javascript
window.dispatchEvent(new CustomEvent('showToast', {
  detail: { message: errors[0], type: 'danger' }
}))
```
No inline error messages appear next to fields. No `aria-invalid` or `aria-describedby` is set. The user must fix errors blindly and resubmit.

### Required state
- Show all validation errors inline, each next to its corresponding field
- Set `aria-invalid="true"` on invalid fields
- Set `aria-describedby` on each invalid field pointing to the error message element
- The first invalid field should receive focus on submit
- Toast remains as supplementary notification but is no longer the sole error channel

### Acceptance criteria
1. Each field group renders an error container (e.g. `<p class="pm-field-error" id="reg-nombre-error" role="alert">...</p>`) below the input
2. Invalid inputs have `aria-invalid="true"` and `aria-describedby` pointing to their error element
3. On submit with errors: all invalid fields show their specific error messages (not just the first)
4. Focus moves to the first invalid field
5. Toast-only error pattern is removed (toast can still show summary but inline errors are primary)
6. screen reader test: Tab through form → submit with empty required fields → hear "Nombre Completo: El nombre del alumno es obligatorio"

### Affected files
- `src/portal-maestros/views/registroAlumnoView.js` — refactor error display from toast-only to inline per-field errors with `aria-invalid` and `aria-describedby`

---

## Requirement 14: perfilView — Push Subscription Status Announcement

### WCAG SC reference
**4.1.3 Status Messages — Level AA**  
Status changes that don't take focus must be announced.

### Current state
`perfilView.js` lines 308–330: The push notification toggle's `change` event handler:
1. Calls `subscribeToPush()` or `unsubscribeFromPush()`
2. Updates `viewState.pushEnabled`
3. Updates a badge element (`#pm-notif-sub-badge`) text content
4. Shows a toast notification

The badge text changes from "✅ Suscripción activa" to "⏸ Pausada" and vice versa, but the badge has no `aria-live` region. Screen reader users may not hear the status change unless they happen to be focused on the badge. The toast provides some notification but is dismissed and may be missed.

### Required state
The subscription status badge must have `aria-live="polite"` so changes are announced. Additionally, the toggle's `<input type="checkbox">` should have an `aria-describedby` pointing to the badge for context.

### Acceptance criteria
1. `#pm-notif-sub-badge` has `aria-live="polite"` and `aria-atomic="true"`
2. Toggling push subscription updates the badge text, which triggers an AT announcement
3. The toggle checkbox has `aria-describedby="pm-notif-sub-badge"` so screen readers know the current subscription state
4. Manual screen reader test: toggle push on → hear "Suscripción activa" announced; toggle off → hear "Pausada" announced
5. Toast notification remains as supplementary feedback

### Affected files
- `src/portal-maestros/views/perfilView.js` — add `aria-live="polite"` and `aria-atomic="true"` to subscription badge; add `aria-describedby` to toggle input

---

## Implementation Notes

### Cross-cutting patterns
- All visual changes affecting `.pm-visually-hidden` must use the existing class in `02-base.css`
- Focus rings must use `:focus-visible` (not `:focus`) to avoid showing focus rings on mouse clicks
- All new ARIA attributes must be set in JavaScript template literals, not added dynamically post-render (to avoid FOUC of ARIA)
- Touch target sizing must use `min-width`/`min-height` where possible to avoid breaking existing layouts

### Testing
Each requirement's acceptance criteria must pass before moving to the next phase. Phase 1 (Quick Wins) should ship as a single PR. Phase 2 may be split into chained PRs if the combined diff exceeds 400 lines.

### Regression prevention
- `npm run test:run` must pass after each change
- Manual smoke test: login → navigate to each view → verify no visual regressions
- Color contrast: re-scan all views with axe-core after Requirement 1
