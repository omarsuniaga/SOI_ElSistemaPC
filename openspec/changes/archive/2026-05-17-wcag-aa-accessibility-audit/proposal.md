# Proposal: WCAG AA Accessibility Audit

## Intent

Educational software serving all ages (students, parents, teachers) must meet WCAG AA 2.1 — beyond ethics, it's a legal exposure risk and a blocker for institutional adoption. 14 accessibility gaps identified across Portal Maestros — 6 quick wins + 8 deeper fixes. Existing good patterns (focus trap, `prefers-reduced-motion`, `:focus-visible`, `.visually-hidden`, dark mode contrast, AppToast `role="alert"`, AppModal `role="dialog"`) form a strong foundation to build on.

## Scope

### In Scope
- Portal Maestros only: 11 views + shared components (tokens, router, form patterns)
- WCAG AA 2.1 criteria: color contrast, keyboard navigation, focus management, screen reader announcements, touch targets, form error announcements, live region semantics

### Out of Scope
- Admin panel (Bootstrap 5.3 has baseline a11y)
- Third-party components (date pickers, chart libs)
- PDF exports, printed documents
- Full audit of pre-existing `role="alert"` / `role="dialog"` components (already compliant)

## Capabilities

### New Capabilities
- `accessibility-audit`: Cross-cutting WCAG AA requirements — color tokens, skip links, focus mgmt, aria-live regions, keyboard nav, touch targets. Applies to all Portal Maestros views.

### Modified Capabilities
- `student-registration`: Add `aria-describedby` for inline form errors + keyboard validation flow
- `ruta-player-view`: Add `<h1>`, ARIA tree role, keyboard nav, remove inline styles conflicting with ARIA
- `notification-polling`: Add `aria-live` region for push subscription status transitions

## Approach

**Phase 1 — Quick Wins** (single PR, ~150 lines):

| # | Fix | Area |
|---|-----|------|
| 1 | Color contrast `#8e8e93` → `#6b6b70` | `01-tokens.css` |
| 2 | Remove `user-scalable=no` from viewport meta | `maestros.html` |
| 3 | Add skip-link anchor + CSS | `maestros.html` |
| 4 | Make password toggle focusable + keyboard-activatable | `loginView.js` |
| 5 | `role="dialog"` + `aria-modal` on notifications drawer | `notificacionesPanel.js` |
| 6 | Restore focus to trigger element after SPA transitions | `portalRouter.js` |

**Phase 2 — Higher Risk** (chained PRs if >400 lines): Touch targets (avatar 32→44px, icon buttons 36→44px), calendar day cell keyboard nav, inline form errors via `aria-describedby`, aria-live regions on dynamic tables/lists, Ruta Player heading hierarchy + ARIA tree, asistencia live regions, registroAlumno inline validation, perfilView push status announcements.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/portal-maestros/styles/01-tokens.css` | Modified | Tertiary label color token |
| `src/portal-maestros/styles/03-components.css` | Modified | Touch target sizes (`.avatar`, `.icon-button`) |
| `maestros.html` | Modified | Viewport meta, skip-link |
| `src/portal-maestros/router/portalRouter.js` | Modified | Focus restoration |
| `src/portal-maestros/views/loginView.js` | Modified | Password toggle a11y |
| `src/portal-maestros/components/notificacionesPanel.js` | Modified | Dialog role + modal |
| `src/portal-maestros/components/calendar.js` | Modified | Day cell keyboard nav |
| `src/portal-maestros/views/asistenciaView.js` | Modified | aria-live for table updates |
| `src/portal-maestros/views/configView.js` | Modified | aria-live for push status |
| `src/portal-maestros/views/perfilView.js` | Modified | aria-live for subscription |
| `src/portal-maestros/views/rutaPlayerView.js` | Modified | Heading, ARIA tree, inline styles |
| `src/portal-maestros/views/registroAlumnoView.js` | Modified | aria-describedby + inline validation |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Contrast change alters Apple design feel | Low | Change only tertiary label, keep palette family |
| Touch target growth breaks layout | Med | Use min-width/height, not fixed; test all viewports |
| Form validation regression | Med | Unit tests on aria-describedby wiring; keyboard flow QA |

## Rollback Plan

Revert per-phase PR. Phase 1: trivial revert of 6 isolated files. Phase 2: revert per-view commits — each is self-contained with no schema changes. Color token is single CSS line — immediate no-data-loss rollback.

## Dependencies

- axe-core or Lighthouse for automated scanning (dev dependency only)
- Screen reader manual testing (NVDA on Windows or VoiceOver on macOS)

## Success Criteria

- [ ] axe-core automated scan: 0 critical/serious violations on Portal Maestros entry point
- [ ] Full keyboard flow: login → views → calendar → student registration → logout (no focus traps)
- [ ] Screen reader hears form validation errors without switching to toast
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text (axe-core color-contrast)
- [ ] All interactive touch targets ≥ 44×44 CSS pixels
- [ ] No regression on `npm run test:run`
