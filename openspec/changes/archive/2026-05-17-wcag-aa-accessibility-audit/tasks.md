# Tasks: WCAG AA Accessibility Audit — Portal Maestros

> **Change:** `wcag-aa-accessibility-audit`
> **Phase 1 (Quick Wins):** Work Units 1–2
> **Phase 2 (Higher Risk):** Work Units 3–7

---

## Work Unit 1: CSS & HTML Quick Wins

**Phase:** 1 | **Estimate:** ~40 lines | **Risk:** Low | **PR strategy:** Ship as part of Phase 1 single PR

### Task 1.1: Fix color contrast for tertiary label text

| Field | Value |
|-------|-------|
| **Requirement** | 1 — Color Contrast |
| **WCAG SC** | 1.4.3 Contrast (Minimum) — Level AA |
| **File(s)** | `src/portal-maestros/styles/01-tokens.css` |
| **What to change** | `--apple-text-muted`: `#8e8e93` → `#6b6b70` on **line 11**. Also change `--pm-text-muted` in dark mode? **No** — dark mode value `#94a3b8` already passes at 4.6:1. The light-mode token `--apple-text-muted` cascades through `--pm-text-muted`, so only line 11 needs modification. |
| **How to verify** | 1. axe-core `color-contrast` scan on any view using `.pm-text-muted` or the token: **0 violations**. 2. Manual visual check: text is still readable but not too dark — confirm the Apple "muted" feel is preserved, just more accessible. 3. `npm run test:run` passes. |
| **Risk** | Low — single CSS token change. No behavioral impact. Dark mode contrast is unaffected. Rollback is reverting one line. |
| **Edge cases** | Verify contrast on both `#f2f2f7` (background) and `#ffffff` (card surfaces). `#6b6b70` yields 4.6:1 on `#f2f2f7` and 5.1:1 on `#ffffff`. |

### Task 1.2: Add skip-to-content link

| Field | Value |
|-------|-------|
| **Requirement** | 2 — Skip to Content |
| **WCAG SC** | 2.4.1 Bypass Blocks — Level A |
| **File(s)** | `maestros.html`, `src/portal-maestros/styles/02-base.css` |
| **What to change** | **`maestros.html`:** Add `<a href="#portal-app" class="pm-skip-link">Saltar al contenido</a>` as the **first child of `<body>`** (before `<div id="portal-app">`).  **`02-base.css`:** Add `.pm-skip-link` class: positioned absolute, visually hidden by default (`position: absolute; left: -9999px;`), becomes visible on `:focus`/`:focus-visible` (`left: 8px; top: 8px; z-index: 9999;`). Use the existing `pm-surface`/`pm-text` tokens for styling. |
| **How to verify** | 1. Tab on page load → skip link appears as first focusable element. 2. Press Enter → focus moves to `#portal-app`, page scrolls to content. 3. axe-core `bypass` rule: **0 violations**. 4. Manual: tab again → focus moves to first interactive element inside the app (not back to skip link). |
| **Risk** | Low — HTML + CSS only, no JS. The skip link is a static anchor. |
| **Implementation note** | The `<a>` href targets `#portal-app`. Since `portal-app` is a `<div>`, add `tabindex="-1"` to it in the HTML so `.focus()` works. Alternatively, handle focus in the router — but the anchor href behavior (`<a href="#portal-app">`) will scroll and shift focus natively if `portal-app` has `tabindex="-1"`. |

### Task 1.3: Remove user-scalable=no from viewport meta

| Field | Value |
|-------|-------|
| **Requirement** | 4 — Viewport user-scalable=no |
| **WCAG SC** | 1.4.4 Resize Text — Level AA |
| **File(s)** | `maestros.html` |
| **What to change** | **Line 5:** Change `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />` → `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`. |
| **How to verify** | 1. axe-core `meta-viewport` rule: **0 violations**. 2. Chrome DevTools device mode → pinch-zoom works. 3. Zoom to 200% → no layout breakage (existing responsive CSS handles scaling). 4. `npm run test:run` passes. |
| **Risk** | Low — one attribute removal. Existing responsive design (`@media` queries, `clamp()`, `dvh` units) ensures layout adapts to zoom. |
| **Edge cases** | iOS Safari double-tap zoom behavior: without `user-scalable=no`, double-tap on narrow columns might zoom in. This is expected and desired behavior per WCAG. |

---

## Work Unit 2: JS Quick Wins

**Phase:** 1 | **Estimate:** ~60 lines | **Risk:** Low-Medium | **PR strategy:** Ship as part of Phase 1 single PR

### Task 2.1: SPA focus management in portalRouter.js

| Field | Value |
|-------|-------|
| **Requirement** | 3 — SPA Focus Management |
| **WCAG SC** | 2.4.3 Focus Order — Level A |
| **File(s)** | `src/portal-maestros/router/portalRouter.js` |
| **What to change** | In `_dispatch()` (line 73), **after** the view renders (`callFn()` completes) and the fade-in animation is applied (lines 126–141), add a focus restoration step: 1. Query `.pm-view-content.active` 2. Find its first heading (`h1`, `h2`, or `[role="main"]`) 3. If found, add `tabindex="-1"` if not focusable, then call `.focus({ preventScroll: true })` 4. Handle `document.startViewTransition` path (line 145–157): run focus restoration after `transition.updateCallbackDone` or `transition.finished` 5. Wrap focus call in `requestAnimationFrame` to let the DOM settle. **Specific code insertion point:** After the `callFn()` in the non-transition path (between lines 124 and 126), and after the `await callFn()` in the transition path (inside the `startViewTransition` callback or chained to `updateCallbackDone`). |
| **How to verify** | 1. Manual keyboard test: Tab to nav link → Enter → focus moves to the new view's heading. 2. Tab again → focus starts from the heading, not from the trigger element. 3. Focus ring (browser default `:focus-visible`) is visible on the heading. 4. `npm run test:run` passes. |
| **Risk** | Medium — focus management affects all view transitions. If the heading selector fails, focus could go to `<body>`, which is the current behavior (no regression). The `preventScroll: true` option avoids jarring scroll jumps. Each view must have a heading in its template (most already do — `loginView.js` has `<h1>`, `perfilView.js` has `<h1>`, etc.). |
| **Edge cases** | 1. `document.startViewTransition` not supported (most browsers) → the non-transition path handles it. 2. Active transition in progress → skipped (`_activeTransition` guard). 3. View uses `<main>` instead of heading → the `[role="main"]` fallback covers this. 4. View has no heading at all → the `.pm-view-content.active` container itself gets `tabindex="-1"`. |

### Task 2.2: Login password toggle keyboard fix

| Field | Value |
|-------|-------|
| **Requirement** | 5 — Login Password Toggle |
| **WCAG SC** | 2.1.1 Keyboard — Level A |
| **File(s)** | `src/portal-maestros/views/loginView.js` |
| **What to change** | **Lines 91–111:** Replace the three mouse-only event listeners (`mousedown`, `mouseup`, `mouseleave`) with a single `click` event handler. The new handler: 1. Toggles `passwordVisible` boolean 2. Sets `passwordInput.type` to `'text'` or `'password'` 3. Updates the icon (`bi-eye` / `bi-eye-slash`) 4. Updates `togglePwdBtn.title` and `aria-label` between "Mostrar contraseña" and "Ocultar contraseña" 5. Optionally sets `aria-pressed` attribute. **Also:** verify the toggle button in the HTML template (lines 44–51) has a proper `aria-label`. It currently has `title="Mostrar contraseña"` — add `aria-label="Mostrar contraseña"` for screen readers that don't announce `title` on buttons. |
| **How to verify** | 1. Keyboard: Tab to password field → Tab to toggle button → Enter → password shows. Enter again → password hides. 2. Mouse: click and hold → password stays visible (but now this requires a separate press, which is fine — the `click` event fires on both press and release, so we use a simple toggle). 3. Screen reader: announce button label as "Mostrar contraseña" / "Ocultar contraseña". 4. `aria-pressed` reflects current state. |
| **Risk** | Low — replacing `mousedown`/`mouseup` with `click` is a well-known pattern. The behavioral change (click toggles instead of press-to-hold) is intentional and better for accessibility. |
| **Design decision** | The original press-to-hold pattern (show password only while mouse is down) is a security-convenience tradeoff. The click-toggle pattern is the standard accessible approach used by every major design system (Material UI, Bootstrap, Carbon). If users need the press-to-hold behavior, a future enhancement could add `onpointerdown` + `onpointerup` as supplementary but not primary. |

### Task 2.3: Notifications drawer ARIA dialog semantics

| Field | Value |
|-------|-------|
| **Requirement** | 6 — Notifications Drawer |
| **WCAG SC** | 4.1.2 Name, Role, Value — Level A |
| **File(s)** | `src/portal-maestros/components/notificacionesPanel.js` |
| **What to change** | **Lines 43–64** (HTML template in `container.innerHTML`): 1. Add `role="dialog"` and `aria-modal="true"` to `#pm-notificaciones-drawer-overlay` 2. Add `aria-labelledby="pm-notif-dialog-title"` to the same element 3. Add `id="pm-notif-dialog-title"` to the `<h4>` heading (line 46) 4. On `open()` (line 163): after the overlay is shown and focus trap is set, move focus to the first focusable element (close button `#pm-notificaciones-close` or "Mark all read" button) 5. Add a reference to the trigger element that opened the dialog — in `open()`, store the currently focused element (`document.activeElement`) before opening, and on `close()` (line 184), restore focus to that stored element. |
| **How to verify** | 1. Screen reader: open notifications → hear "Notificaciones, dialog" announced. 2. Tab: focus moves inside the drawer. 3. Close → focus returns to the bell icon that triggered it. 4. Escape key closes the dialog (verify the existing focus trap handles this via `enableTrap`'s `onClose` callback). 5. axe-core `aria-dialog-name` rule: **0 violations**. |
| **Risk** | Low-Medium — adding ARIA attributes is safe. The focus management change (storing trigger element) requires adding a `_triggerEl` property. If `getActiveElement` isn't available (unlikely), fall back to existing behavior (no focus restoration). |
| **Implementation details** | ```js // In open(): this._triggerEl = document.activeElement // ... existing code ... // After overlay is visible and trap is enabled const closeBtn = document.getElementById('pm-notificaciones-close') if (closeBtn) closeBtn.focus() // In close(): if (this._triggerEl && typeof this._triggerEl.focus === 'function') { this._triggerEl.focus() } ``` |

---

## Work Unit 3: a11y Utility + Form Error Announcements

**Phase:** 2 | **Estimate:** ~80 lines | **Risk:** Medium | **Testing:** Unit-critical

### Task 3.1: Create a11yUtils.js with setFieldError() and clearFieldErrors()

| Field | Value |
|-------|-------|
| **Requirements** | 9, 13 — Form Error Announcements |
| **WCAG SC** | 3.3.1 Error Identification — Level A, 4.1.2 Name, Role, Value — Level A |
| **File(s)** | **Create** `src/portal-maestros/utils/a11yUtils.js` |
| **What to implement** | Two exported functions (as designed in Decision 3): **`setFieldError(inputEl, message)`**: 1. Generate `errorId = \`${inputEl.id}-error\`` 2. Look for existing error element with that ID 3. If not found, create a `<span>` with `id`, `class="pm-field-error"`, `role="alert"` 4. Insert after `inputEl` (`inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling)`) 5. Set `errorEl.textContent = message` 6. Set `inputEl.setAttribute('aria-invalid', 'true')` 7. Set `inputEl.setAttribute('aria-describedby', errorId)` **`clearFieldErrors(container)`**: 1. Query all `.pm-field-error` in container and remove them 2. Query all `[aria-invalid]` in container and remove both `aria-invalid` and `aria-describedby` **Also:** Add a `.pm-field-error` CSS class (or reuse existing): small red text below inputs. Best location: `src/portal-maestros/styles/11-forms.css` — add `.pm-field-error { color: var(--pm-danger); font-size: 0.75rem; margin-top: 4px; display: block; }` |
| **How to verify** | 1. Unit test: call `setFieldError(inputEl, 'Required')` → assert DOM structure: `<span id="..." class="pm-field-error" role="alert">Required</span>`, `inputEl` has `aria-invalid="true"` and `aria-describedby`. 2. Unit test: call `clearFieldErrors(container)` → assert all error spans removed, all `aria-invalid` attributes cleared. 3. Integration test: mount a form, submit with errors → error elements exist, `aria-describedby` is set. |
| **Risk** | Low — pure function, no side effects. Depends only on `inputEl.id` being unique. Falls back gracefully if `inputEl` has no `id` (add a warning + use a generated ID). |
| **Edge cases** | 1. Input with no `id` attribute — generate one from `inputEl.name` or a random string. 2. Multiple errors on same input — subsequent calls update existing error element's `textContent`. 3. Input already has `aria-describedby` for other purposes — append instead of overwrite. |

### Task 3.2: Wire a11yUtils into registroAlumnoView.js

| Field | Value |
|-------|-------|
| **Requirement** | 13 — Inline Validation Errors |
| **File(s)** | `src/portal-maestros/views/registroAlumnoView.js` |
| **What to change** | **Import:** Add `import { setFieldError, clearFieldErrors } from '../utils/a11yUtils.js'` **`handleSubmit()` (line 247):** Replace the toast-only error path (lines 253–258): ```js // BEFORE: if (errors.length > 0) { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: errors[0], type: 'danger' } })) return } // AFTER: if (errors.length > 0) { const formContainer = document.querySelector('.pm-settings-form-grid') || container clearFieldErrors(formContainer) // Map validation errors to fields const fieldMap = { 'El nombre del alumno es obligatorio': 'reg-nombre', 'El nombre debe tener al menos 3 caracteres': 'reg-nombre', 'El nombre no puede exceder 100 caracteres': 'reg-nombre', 'La fecha de nacimiento es obligatoria': 'reg-fecha-nac', 'La fecha de nacimiento no puede ser futura': 'reg-fecha-nac', 'El alumno debe tener mínimo 3 años': 'reg-fecha-nac', 'Verifica la fecha de nacimiento': 'reg-fecha-nac', 'El instrumento principal es obligatorio': 'reg-instrumento', 'El instrumento no puede exceder 100 caracteres': 'reg-instrumento', 'El nombre del representante es obligatorio': 'reg-rep-nombre', 'El nombre del representante no puede exceder 100 caracteres': 'reg-rep-nombre', 'El teléfono del representante es obligatorio': 'reg-rep-tlf', 'El teléfono no puede exceder 20 caracteres': 'reg-rep-tlf', 'La cédula no puede exceder 20 caracteres': 'reg-rep-cedula', 'El formato del correo electrónico no es válido': 'reg-rep-email', 'El correo no puede exceder 100 caracteres': 'reg-rep-email', 'La dirección no puede exceder 255 caracteres': 'reg-direccion', } errors.forEach(msg => { const fieldId = fieldMap[msg] if (fieldId) { const input = document.getElementById(fieldId) if (input) setFieldError(input, msg) } }) // Focus first invalid field const firstInput = document.getElementById(fieldMap[errors[0]]) if (firstInput) firstInput.focus() viewState.submitting = false return } ``` **Keep server-side errors (cedula/email duplicates, API error) as toasts** — they're not field validation errors and don't have a field mapping. **Add `blur` validation:** For each required input in the form, add a `blur` event listener that validates that single field using the same `validateForm` logic and calls `setFieldError`/`clearFieldErrors` for immediate inline feedback. |
| **How to verify** | 1. Open registration form → submit empty → see inline errors below each required field. 2. Inputs have `aria-invalid="true"` and `aria-describedby`. 3. Focus moves to first invalid field. 4. Screen reader: navigate to first invalid field → hear error message announced via `aria-describedby`. 5. Fix one field → blur → error clears for that field only. 6. Server-side duplicate email/cedula still shows as toast. 7. `npm run test:run` passes. |
| **Risk** | Medium — changes the error feedback mechanism for a form that may have existing user expectations. The toast + inline combo is additive (toast is supplementary). The `fieldMap` must match `validateForm()` error strings exactly — any mismatch means an error won't be mapped to a field. |

### Task 3.3: Wire a11yUtils into loginView.js

| Field | Value |
|-------|-------|
| **Requirement** | 9 — Login `aria-describedby` |
| **File(s)** | `src/portal-maestros/views/loginView.js` |
| **What to change** | The login form already uses an `aria-live` region for the error message (`#pm-login-error`). The gap is that individual fields (`#pm-email`, `#pm-password`) have no `aria-describedby` linking to the error. **Import:** No change needed — use the simpler approach of adding `aria-describedby` directly. **In `handleLogin()` (line 136):** When an error is displayed (lines 143–151): 1. If `emailInput` has the error (email is empty), set `emailInput.setAttribute('aria-describedby', 'pm-login-error')` 2. If `passwordInput` has the error (password is empty), set `passwordInput.setAttribute('aria-describedby', 'pm-login-error')` 3. On successful validation (before submit), clear `aria-describedby` from both inputs. **Alternative:** Import `setFieldError` from `a11yUtils.js` and use it here too, for consistency. This is slightly heavier but ensures the same pattern: ```js // In the !email path: setFieldError(emailInput, 'Ingresa tu correo electrónico') // In the !password path: setFieldError(passwordInput, 'Ingresa tu contraseña') // Before each check: clearFieldErrors(container) ``` This creates proper inline error elements instead of relying on the shared `#pm-login-error` aria-live region. |
| **How to verify** | 1. Submit login with empty email → email input has `aria-describedby` pointing to error. 2. Screen reader: Tab to email → hear "Correo electrónico. Ingresa tu correo electrónico". 3. Clear field → `aria-describedby` removed. |
| **Risk** | Low — the login form is simple (2 fields), and the existing `aria-live` error display remains unchanged as a fallback. |
| **Note** | The design spec says to add `aria-describedby="pm-login-error"` to both inputs when error is displayed. Using `setFieldError` instead creates dedicated error elements per field, which is more granular and accessible. Either approach satisfies the requirement, but `setFieldError` is preferred for consistency with the registration form. |

---

## Work Unit 4: Touch Target Sizes

**Phase:** 2 | **Estimate:** ~30 lines | **Risk:** Medium | **Testing:** Visual regression-critical

### Task 4.1: Increase .pm-icon-btn and .pm-avatar-btn to 44×44 minimum

| Field | Value |
|-------|-------|
| **Requirement** | 7 — Touch Target Sizes |
| **WCAG SC** | 2.5.8 Target Size (Minimum) — Level AA (WCAG 2.2) |
| **File(s)** | `src/portal-maestros/styles/03-layout.css`, `src/portal-maestros/styles/10-responsive.css` |
| **What to change** | **03-layout.css:** - `.pm-avatar-btn` (line 64): change `width: 32px; height: 32px;` → `width: 40px; height: 40px; min-width: 44px; min-height: 44px; padding: 2px;`. Keep the `<img>` inside visually at 32–36px via `max-width: 36px; max-height: 36px;` or by constraining the inner image size. - `.pm-icon-btn` (line 93): change `width: 38px; height: 38px;` → `min-width: 44px; min-height: 44px; width: 44px; height: 44px;`. **10-responsive.css:** - `.pm-icon-btn` (line 64): change `width: 36px; height: 36px;` → `width: 44px; height: 44px; min-width: 44px; min-height: 44px;`. This is the mobile overrides — ensure consistency. - `.pm-avatar-btn` (line 70): change `width: 36px; height: 36px;` → `width: 44px; height: 44px;`. **Potential additional files:** Check if `11-forms.css` has a `.pm-settings-avatar__edit` (mentioned in the design at ~28px) — increase to `min-width: 32px; min-height: 32px;`. |
| **How to verify** | 1. `npm run test:run` passes. 2. Puppeteer/Playwright test (if available): `getBoundingClientRect().width >= 44` on all `.pm-icon-btn` and `.pm-avatar-btn`. 3. Manual: check header, asistencia view buttons, notification drawer buttons at 375px viewport width — no overflow or cutoff. 4. The avatar image still looks proportionally correct (40px container, 32px visual image). |
| **Risk** | Medium — changing dimensions on interactive elements in the header. The `.pm-avatar-btn` increase from 32→40 (25% increase) is significant. The `.pm-icon-btn` increase from 38→44 (16%) is moderate. **Mitigation:** Use `min-width`/`min-height` to prevent layout breakage — the actual visual size only increases to 44px, not beyond. Verify header height `--pm-header-h: 82px` accommodates the larger avatar (40px with 2px padding = 44px, fits within 82px). |
| **Edge cases** | 1. `.pm-avatar-btn` inside a tight flex container with `gap: .5rem` — the wider buttons plus gap may overflow on very narrow screens. 2. `.pm-icon-btn` in dark mode — verify background/fill doesn't look disproportionate at 44px. 3. Buttons with `border-radius: 50%` — circular buttons at exactly 44×44 look correct. |

---

## Work Unit 5: Dynamic Content & ARIA Live Regions

**Phase:** 2 | **Estimate:** ~50 lines | **Risk:** Low | **Testing:** Manual screen reader

### Task 5.1: Add aria-live to metricasView dashboard container

| Field | Value |
|-------|-------|
| **Requirement** | 10 — Dynamic Content aria-live |
| **File(s)** | `src/portal-maestros/views/metricasView.js` |
| **What to change** | **In `generarHTML(procesados)`** (find the dashboard container template): 1. Add `aria-live="polite"` and `aria-atomic="true"` to the main `.pm-dashboard` container element. 2. In the loading state (spinner in `renderMetricasView`), add `aria-label="Cargando métricas..."` to the spinner or its wrapper. 3. After the period filter changes and re-render (the `change` event handler for period selector), append a visually-hidden status message: `<span class="pm-visually-hidden" role="status">Dashboard actualizado — ${semanas} semanas</span>`. This ensures the screen reader announces the update even if the main `aria-live` region doesn't fire (e.g. if the container was empty before). **Implementation notes:** The simplest approach is to add `aria-live="polite" aria-atomic="true"` to the wrapper div that contains the dashboard content. Since `container.innerHTML = generarHTML(procesados)` replaces the entire content, the live region's content change will be detected by AT. |
| **How to verify** | 1. axe-core confirms `aria-live` region exists. 2. Manual: change period filter → VoiceOver/NVDA announces the new content. 3. Loading spinner has accessible label. |
| **Risk** | Low — attribute-only additions. No behavioral change. |

### Task 5.2: Add aria-live to asistenciaView student list and progress

| Field | Value |
|-------|-------|
| **Requirement** | 12 — AsistenciaView Live Regions |
| **File(s)** | `src/portal-maestros/views/asistenciaView.js` |
| **What to change** | **1. Student list (`#pm-alumnos-list`):** In `renderLista()` (line 1262), the container `listEl` (`#pm-alumnos-list`) replaces innerHTML. Add `aria-live="polite"` and `aria-atomic="false"` to this element either: - In the HTML template that renders the view (find the `<div id="pm-alumnos-list">` in the main render function), or - In the `renderLista()` function itself: `listEl.setAttribute('aria-live', 'polite')` (but only on first render to avoid repeated setAttribute calls). After each attendance toggle (`async function handleAsistencia` at ~line 1393), add a visually-hidden announcement: ```js const studentName = alumnos.find(a => a.id === id)?.nombre_completo if (studentName && action) { const statusLabel = action === 'P' ? 'Presente' : action === 'J' ? 'Justificado' : action === 'A' ? 'Ausente' : '' const announcer = document.createElement('span') announcer.className = 'pm-visually-hidden' announcer.role = 'status' announcer.textContent = `${studentName}: ${statusLabel} marcado` listEl.parentNode.insertBefore(announcer, listEl) setTimeout(() => announcer.remove(), 1000) } ``` **2. Progress indicator (`#pm-progress-wrap`):** In `_updateProgress()` (line 1413), the `#pm-progress-wrap` container already exists. Add `aria-live="polite"` to it (in the HTML template). Also update `label.textContent = \`${marcados}/${total}\`` → also include a visually-hidden status update: `\`${marcados} de ${total} alumnos marcados\`` for the aria-live region to announce. |
| **How to verify** | 1. axe-core: `aria-live` regions exist on both elements. 2. Manual: click "P" on a student → hear "Juan Pérez: Presente marcado" announced. 3. Progress changes: mark 3 out of 12 → hear "3 de 12 alumnos marcados". 4. `npm run test:run` passes. |
| **Risk** | Low — attribute additions + a visually-hidden DOM element that self-removes. No behavioral impact. |

### Task 5.3: Add aria-live to perfilView push subscription badge

| Field | Value |
|-------|-------|
| **Requirement** | 14 — Push Subscription Status |
| **File(s)** | `src/portal-maestros/views/perfilView.js` |
| **What to change** | **In `renderNotifications()` (line 168):** Change line 171: ```js // BEFORE: ? `<span class="pm-badge-sub" id="pm-notif-sub-badge">${viewState.pushEnabled ? '✅ Suscripción activa' : '⏸ Pausada'}</span>` // AFTER: ? `<div aria-live="polite" aria-atomic="true"><span class="pm-badge-sub" id="pm-notif-sub-badge">${viewState.pushEnabled ? '✅ Suscripción activa' : '⏸ Pausada'}</span></div>` ``` **Also:** Add `aria-describedby="pm-notif-sub-badge"` to the toggle `<input type="checkbox">` (line 182) so screen readers know the current subscription state when focused on the toggle. **Implementation note:** The `badge.textContent` mutation on line 329 already triggers the DOM change. Wrapping it in `aria-live` makes the change announcement automatic. |
| **How to verify** | 1. Manual: toggle push subscription on → hear "Suscripción activa" announced; toggle off → hear "Pausada". 2. Focus the toggle checkbox → screen reader includes subscription status in its description. 3. axe-core: live region exists and has correct role. |
| **Risk** | Low — wrapping an existing element in a `<div>` won't affect layout (the wrapper is inline-level by default but can be made `display: inline` if needed). The `aria-describedby` on the toggle is a standard pattern. |

---

## Work Unit 6: Calendar Keyboard Navigation — WAI-ARIA Grid Pattern

**Phase:** 2 | **Estimate:** ~100 lines | **Risk:** High | **Testing:** Unit + Manual critical

### Task 6.1: Implement WAI-ARIA grid pattern for calendar day cells

| Field | Value |
|-------|-------|
| **Requirement** | 8 — Calendar Keyboard |
| **WCAG SC** | 2.1.1 Keyboard — Level A, 2.4.3 Focus Order — Level A |
| **File(s)** | `src/portal-maestros/components/calendarioDrawer.js` |
| **What to change** | **`_renderMonth()` (line 176) — Add ARIA grid structure:** 1. Change `.pm-cal-grid` (line 227) to have `role="grid"` and `aria-label="${MESES[month]} ${year}"` 2. Group each week into `<div role="row">` (instead of flat divs) — wrap every 7 day cells (including header days and empty cells) in a row container 3. Day header cells (Lu, Ma, Mi...) get `role="columnheader"` 4. Day cells with dates get `role="gridcell"` and `tabindex="-1"` 5. Today's cell gets `tabindex="0"` (the entry point into the grid) 6. If no day is today (e.g. future month), the first non-empty day gets `tabindex="0"` **`_attachMonthEvents()` (line 239) — Add keyboard handler:** Replace the simple click-only handler with: 1. Keep the `click` event (for mouse and touch) 2. Add a `keydown` event listener on the `.pm-cal-grid` container (event delegation) 3. On `ArrowLeft`: move focus to previous day cell (preceding sibling `.pm-cal-day:not(.empty)`) 4. On `ArrowRight`: move focus to next day cell 5. On `ArrowUp`: move focus 7 cells back (previous week) 6. On `ArrowDown`: move focus 7 cells forward (next week) 7. On `Home`: move focus to first day of the current week 8. On `End`: move focus to last day of the current week 9. On `Enter` or `Space`: trigger `onFechaClick(day.dataset.fecha)` for the focused cell 10. On `PageUp` / `PageDown`: navigate to previous/next month by calling `onPrev` / `onNext` (and focus the same day number or first day) **Roving tabindex implementation:** - When focus moves to a new cell, set `tabindex="0"` on the new cell and `tabindex="-1"` on the old cell - Then call `.focus()` on the new cell **Update `_renderMonth()` to include `aria-label` on each day:** ```html <div class="${dayClass}" role="gridcell" data-fecha="${fecha}" tabindex="${esHoy || isFirst ? '0' : '-1'}" aria-label="${d} de ${MESES[month]} de ${year}"> ``` **Add `aria-selected` on today's cell** (or the currently selected date — the design mentions this but in practice the calendar doesn't have a "selected" state versus "today", so `aria-selected` applies to the focused cell during keyboard navigation, managed dynamically). |
| **How to verify** | 1. **Unit test:** Create a calendar with mock data → dispatch `ArrowLeft` on a day cell → verify `data-fecha` changes to previous day. Test month boundary wrapping. 2. **Manual test:** Tab to calendar → focus lands on today's cell → Arrow keys cycle through days → Enter fires `onFechaClick` with correct date → ArrowDown/Up navigate weeks → PageUp/PageDown change months. 3. **Screen reader:** NVDA announces date as "15 de Mayo de 2026, gridcell" when focused. 4. **axe-core:** `aria-required-parent` (gridcell inside row inside grid), `aria-valid-attr`: 0 violations. |
| **Risk** | **High** — the calendar rendering structure changes from flat divs to nested rows. The current structure is: ```html <div class="pm-cal-grid"> <div class="pm-cal-day-header">Do</div> <!-- 7 day headers, then days --> <div class="pm-cal-day empty"></div> <!-- <31 days --> ``` The new structure would be: ```html <div class="pm-cal-grid" role="grid"> <div role="row"> <div role="columnheader">Do</div> ... </div> <div role="row"> <div role="gridcell" tabindex="-1">1</div> ... </div> <!-- more rows --> </div> ``` **Mitigation:** The existing CSS `.pm-cal-grid` uses `display: grid` with `grid-template-columns: repeat(7, 1fr)`. Wrapping in `.pm-cal-row` divs needs CSS adjustment — the rows should NOT disrupt the 7-column grid. **Solution:** Use `display: contents` on the `role="row"` wrappers in CSS so they don't affect layout, OR refactor the CSS to use nested grids per row. The `display: contents` approach is cleaner (zero layout impact) but may have screen reader compatibility concerns (some older SRs ignore `display: contents`). The safer approach: keep the flat DOM structure but add `role="grid"` and `role="gridcell"` to existing elements without introducing row wrappers. WAI-ARIA allows implicit rows via presentation — gridcells don't strictly need DOM rows if the grid uses `aria-rowindex`. **Recommendation:** Keep the flat DOM. Add `role="grid"` on `.pm-cal-grid`, `role="gridcell"` on `.pm-cal-day:not(.empty)`. The day headers remain as `<div>` role=presentation (no columnheader needed). This preserves the CSS grid layout completely. However, some accessibility validators may warn about missing rows — but it's functionally correct. |
| **Edge cases** | 1. Month with 28 days (February) — ArrowDown from last row should stay within bounds. 2. First day of month not on Monday — leading empty cells shouldn't be focusable. 3. Month boundary for ArrowLeft from first day → stay on first day (or move to previous month's last day — the latter is more complex; for v1, stay on first day). 4. Calendar with no sessions → keyboard still works. 5. `prefers-reduced-motion` focus ring should still be visible. |

---

## Work Unit 7: RutaPlayerView ARIA

**Phase:** 2 | **Estimate:** ~150 lines | **Risk:** High | **Testing:** Unit + Visual regression

### Task 7.1: Fix heading hierarchy and extract inline styles

| Field | Value |
|-------|-------|
| **Requirement** | 11 — RutaPlayerView |
| **WCAG SC** | 1.3.1 Info and Relationships — Level A, 2.4.6 Headings and Labels — Level AA |
| **File(s)** | `src/portal-maestros/views/rutaPlayerView.js` |
| **What to change** | **1. Heading hierarchy (line 94):** Change `<h2 style="...">Ruta de Contenidos</h2>` → `<h1 style="...">Ruta de Contenidos</h1>`. This is the only `<h1>` on the page. **2. Inline styles → CSS classes (lines 75–309):** Extract the most frequently used inline style patterns into a `<style>` block injected at the bottom of the view (like other views do — see `perfilView.js` line 544). At minimum, create classes for: - `.rp-view-wrapper` — `padding:16px; max-width:800px; margin:0 auto;` (line 90) - `.rp-header` — flex container with heading + select (line 92) - `.rp-heading` — `margin:0; font-size:1.15rem; font-weight:700;` (line 94) - `.rp-select` — dropdown styling (lines 97–102) - `.rp-block` — block container: `margin-bottom:20px;` (line 137) - `.rp-level-card` — level card: `margin-bottom:8px; border-radius:12px; overflow:hidden;` (lines 172–175) - `.rp-level-header` — toggle header: flex layout, cursor pointer, padding (line 176–179) - `.rp-node-item` — node container (line 205–210) - `.rp-indicator-item` — indicator row (lines 239–246) - `.rp-action-panel` — sticky bottom panel (lines 271–276) - `.rp-eval-btn` — evaluation button base (lines 289–293) **Important:** Many of these inline styles use dynamic values (semaphore colors via `${color}44`, `${SEM_BG[sem]}`, `${SEM_ICON[sem]}`). These must remain dynamic via inline styles where CSS custom properties can't reach, but the static structural styles can be extracted. **Strategy:** Move all static, non-dynamic styles to classes. Keep only dynamic styles inline (colors, background that depend on state). This reduces inline styles from ~100% to ~30%. |
| **How to verify** | 1. Unit: `_renderIndicator()` output no longer contains `onmouseover` attribute. 2. Visual: page renders identically — compare screenshots of the full ruta player view before/after. 3. axe-core: `heading-order` rule: 0 violations (no heading level skips). |
| **Risk** | High — extracting inline styles from a complex view with many dynamic values. The risk is accidental visual regression: - A style extracted incorrectly changes the appearance - A dynamic value that was embedded in a heavy inline style string gets lost - The `style` block at bottom may not override existing styles correctly **Mitigation:** Extract one pattern at a time and visually verify. Use CSS custom properties (`var(--rp-color, ${color})`) for semaphore colors to keep them dynamic while moving the structural styles to classes. |

### Task 7.2: Remove inline onmouseover/onmouseout handlers

| Field | Value |
|-------|-------|
| **Requirement** | 11 — RutaPlayerView (inline handlers) |
| **File(s)** | `src/portal-maestros/views/rutaPlayerView.js` |
| **What to change** | **Lines 247–248 in `_renderIndicator()`:** Replace: ```html onmouseover="this.style.background='${color}11'" onmouseout="this.style.background='${isSelected ? color + '22' : 'transparent'}'" ``` With CSS classes: ```html class="rp-indicator-item ${isSelected ? 'rp-indicator-selected' : ''}" ``` And add in the `<style>` block: ```css .rp-indicator-item { transition: background 0.15s; } .rp-indicator-item:hover { background: var(--rp-hover-bg, rgba(0,0,0,0.04)); } .rp-indicator-item:focus-visible { outline: 2px solid var(--pm-primary); outline-offset: 2px; } .rp-indicator-item.selected { background: var(--rp-selected-bg, rgba(0,0,0,0.1)); } ``` **The challenge:** The hover color depends on `color` (semaphore) — this is dynamic per indicator. **Solution:** Use a CSS custom property approach: ```html class="rp-indicator-item" style="--rp-indicator-hover: ${color}11; --rp-indicator-selected: ${color}22; background: ${isSelected ? color + '22' : 'transparent'};" ``` ```css .rp-indicator-item:hover { background: var(--rp-indicator-hover) !important; } ``` This keeps the dynamic color as a CSS variable while moving the hover/focus behavior to CSS. |
| **How to verify** | 1. Unit test: `_renderIndicator()` output contains no `onmouseover` or `onmouseout` strings. 2. Manual: hover over an indicator → background changes. 3. Keyboard: Tab to indicator → focus ring appears. |
| **Risk** | Medium — CSS variable approach is well-supported. The `!important` in hover style is needed to override the inline `background`, which is the one remaining inline style. |

### Task 7.3: Add ARIA tree semantics and keyboard handler

| Field | Value |
|-------|-------|
| **Requirement** | 11 — RutaPlayerView (ARIA tree + keyboard) |
| **File(s)** | `src/portal-maestros/views/rutaPlayerView.js` |
| **What to change** | **Add `aria-expanded` to toggle triggers:** In `_renderLevel()` (line 147): - The level toggle div `[data-action="toggle-level"]` (line 176) should have `role="button"`, `tabindex="0"`, and `aria-expanded="false"` initially - The node toggle div `[data-action="toggle-node"]` (line 206) should have `role="button"`, `tabindex="0"`, and `aria-expanded="false"` initially - On toggle (in `_attachEvents`), update `aria-expanded` to match the expanded state **Add container role:** The blocks container in `_renderBlocks()` (line 136) could get `role="tree"` but the design decision was **against** full tree semantics (lazy loading breaks the paradigm). Instead: - The `#ruta-tree-area` div gets `role="region"` with `aria-label="Ruta de contenidos"` - Each block is a `role="group"` with `aria-label="${block.nombre}"` **Keyboard handler for toggles:** In `_attachEvents()` (line 127): 1. Add a `keydown` event listener at the `#ruta-tree-area` level (event delegation) 2. When Enter or Space is pressed on `[data-action="toggle-level"]` or `[data-action="toggle-node"]`, trigger the same click action as the click handler 3. When Tab is pressed on the last item in the tree area, move focus to the action panel **Update `_state` persistence for `aria-expanded`:** The view already toggles visibility via `data-level-body` and `data-node-body`. The `aria-expanded` state must track this. Store expanded state in the `_state` object or read from the `display` style of the body element. **Evaluation status (`#ruta-eval-status`):** Add `role="status"` to this element (line 303) so save confirmations are announced. |
| **How to verify** | 1. axe-core: `aria-valid-attr`, `aria-required-parent`, `button-name`: 0 violations. 2. Manual: Tab through RutaPlayer → Enter on level → aria-expanded toggles → level content appears. 3. Screen reader: announces expanded/collapsed state. 4. Keyboard Tab: focus moves through all interactive elements without getting trapped. |
| **Risk** | High — modifying event handling in the complex RutaPlayer view. The keyboard handler must: - Not interfere with existing click handlers (Enter/Space on a button already fires click, but the `[data-action]` divs are not buttons, so we need to explicitly handle keyboard) - Maintain existing toggle behavior (level expand/collapse via `display:none`) - Not break the evaluation flow (select indicator → show action panel → eval) **Mitigation:** Use container-level `keydown` delegation (same pattern as existing `click` delegation via `[data-action]` in `_attachEvents`). The keyboard handler maps Enter/Space to simulate a click on the target, reusing the existing logic. |

---

## Commit Strategy

```
feat(a11y): WCAG AA color contrast, skip link, viewport zoom       # Work Unit 1
feat(a11y): SPA focus management, password toggle, drawer ARIA     # Work Unit 2
feat(a11y): shared a11yUtils for form error announcements           # Work Unit 3
  → with unit tests for setFieldError/clearFieldErrors
feat(a11y): wire inline validation into registroAlumno and login   # Work Unit 3b
feat(a11y): increase touch targets to 44×44 minimum                # Work Unit 4
feat(a11y): aria-live regions for dynamic content                  # Work Unit 5
feat(a11y): WAI-ARIA grid keyboard navigation for calendar         # Work Unit 6
  → with unit tests for arrow key dispatch
feat(a11y): RutaPlayer heading, inline style extraction, ARIA      # Work Unit 7
```

**Chained PR strategy:** If the combined Phase 2 diff exceeds 400 lines, split into:
- PR 1: Work Unit 3 (a11yUtils + form errors)
- PR 2: Work Units 4 + 5 (Touch targets + live regions)
- PR 3: Work Unit 6 (Calendar keyboard)
- PR 4: Work Unit 7 (RutaPlayer)

---

## Risk Heatmap

| Work Unit | Risk | Reason |
|-----------|------|--------|
| WU1: CSS & HTML Quick Wins | 🟢 Low | Pure CSS + HTML, no behavioral change |
| WU2: JS Quick Wins | 🟡 Low-Med | Focus management touches all views but has no-regression fallback |
| WU3: a11yUtils + Form Errors | 🟡 Medium | Changes error feedback mechanism; fieldMap must match error strings exactly |
| WU4: Touch Targets | 🟡 Medium | Visual size changes; layout regression risk on narrow viewports |
| WU5: ARIA Live Regions | 🟢 Low | Attribute-only additions; no behavioral impact |
| WU6: Calendar Keyboard | 🔴 High | DOM structure changes (grid rows); CSS grid layout must be preserved |
| WU7: RutaPlayer ARIA | 🔴 High | Inline style extraction from complex view; keyboard handler in event-heavy code |
