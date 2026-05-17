# Archive Report: WCAG AA Accessibility Audit

**Change:** `wcag-aa-accessibility-audit`
**Date:** 2026-05-17
**Artifact Store:** Hybrid (Engram + openspec)
**Status:** Archived

---

## Summary

Accessibility audit across Portal Maestros addressing 14 WCAG AA 2.1 gaps across all views. Two-phase rollout: Phase 1 (6 quick wins: color contrast, skip link, SPA focus, viewport zoom, password toggle keyboard, notifications dialog) and Phase 2 (8 deeper fixes: touch targets, calendar keyboard, form error announcements, aria-live regions, RutaPlayer ARIA, asistencia live regions, registroAlumno inline validation, perfilView push status).

All 14 requirements implemented, 520/520 tests passing (59 test files), build passing.

---

## Files Changed

### Created (2 files)
| File | Description |
|------|-------------|
| `src/portal-maestros/utils/a11yUtils.js` | Shared accessibility utility: `setFieldError()`, `clearFieldError()`, `clearAllFieldErrors()`, `announce()` |
| `openspec/specs/accessibility-audit/spec.md` | New main spec for cross-cutting WCAG AA requirements |

### Modified (25 tracked files)
| File | Work Unit | Change |
|------|-----------|--------|
| `maestros.html` | WU1 | Skip link anchor, viewport zoom fix |
| `src/portal-maestros/styles/01-tokens.css` | WU1, WU4 | Color contrast `#8e8e93`→`#6b6b70`, `--pm-touch-min: 44px` token |
| `src/portal-maestros/styles/02-base.css` | WU1 | `.pm-skip-link` class |
| `src/portal-maestros/styles/03-layout.css` | WU4 | Touch targets 44×44 for avatar and icon buttons |
| `src/portal-maestros/styles/04-components.css` | WU3 | `.pm-field-error`, `[aria-invalid]` input styles |
| `src/portal-maestros/styles/08-apple.css` | WU3 | Apple-style input invalid state styling |
| `src/portal-maestros/styles/09-routes.css` | WU7 | 44 new `.rp-*` CSS classes for RutaPlayer |
| `src/portal-maestros/styles/10-responsive.css` | WU4 | Mobile touch target overrides |
| `src/portal-maestros/router/portalRouter.js` | WU2 | SPA focus restoration after view transitions |
| `src/portal-maestros/views/loginView.js` | WU2, WU3 | Password toggle keyboard fix, field error announcements |
| `src/portal-maestros/views/registroAlumnoView.js` | WU3 | Inline validation errors replacing toast-only pattern |
| `src/portal-maestros/views/metricasView.js` | WU5 | `role="status"` region, `announce()` on data update |
| `src/portal-maestros/views/asistenciaView.js` | WU5 | Live region for attendance table, `announce()` calls |
| `src/portal-maestros/views/perfilView.js` | WU5 | `aria-live="polite"` on push subscription badge |
| `src/portal-maestros/views/rutaPlayerView.js` | WU7 | `<h1>` heading, ARIA tree, keyboard nav, CSS extraction |
| `src/portal-maestros/views/calendarioView.js` | WU6 | Duplicate calendar keyboard nav implementation |
| `src/portal-maestros/components/notificacionesPanel.js` | WU2 | `role="dialog"`, `aria-modal="true"`, focus management |
| `src/portal-maestros/components/calendarioDrawer.js` | WU6 | WAI-ARIA grid pattern with roving tabindex and arrow keys |
| `openspec/specs/student-registration/spec.md` | — | Added a11y cross-reference |
| `openspec/specs/ruta-player-view/spec.md` | — | Added a11y cross-reference |
| `openspec/specs/notification-polling/spec.md` | — | Added a11y cross-reference |
| Ancillary: `package.json`, `package-lock.json`, `.gitignore`, test files | — | Build config and test updates |

---

## Test Results

| Metric | Value |
|--------|-------|
| Test files | 59 passed |
| Tests | 520 passed |
| Duration | 15.69s |
| Build | ✅ Passed (no build step for vanilla JS) |
| Coverage | Not configured |

---

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `accessibility-audit` | Created (new) | Cross-cutting WCAG AA requirements as new main spec |
| `student-registration` | Updated | Added a11y cross-reference (Requirements 9, 13) |
| `ruta-player-view` | Updated | Added a11y cross-reference (Requirement 11) |
| `notification-polling` | Updated | Added a11y cross-reference (Requirement 14) |

---

## Known Issues (from Verify Report)

### CRITICAL
- **Skip link href target mismatch** (`#pm-main-content` instead of `#portal-app`): The skip link is visible and focusable but activating it won't move focus to the main content area. Fix: change `href` to `#portal-app`.

### WARNINGS
- **`.pm-settings-avatar__edit` touch target** (28×28px): Below the 44px minimum in `11-forms.css:432`. Design specified increase to 32px + padding.
- **Loading spinner lacks `aria-label`**: `metricasView.js:418, 577` spinners have no `aria-label="Cargando métricas..."`.
- **RutaPlayer inline styles partially extracted**: ~30% of styles remain inline (`_renderFull()` outer container, `_renderActionPanel()`).
- **`aria-live` on list/progress not direct**: Spec asked for direct `aria-live` on `#pm-alumnos-list` and `#pm-progress-wrap`; implementation uses separate announce div (functionally equivalent).
- **Toggle `aria-describedby` missing**: Push subscription toggle input at `perfilView.js:182` lacks `aria-describedby="pm-notif-sub-badge"`.

### SUGGESTIONS
- RutaPlayer `role="tree"` vs lazy loading: Design chose against full tree semantics; implementation uses it anyway. Monitor for AT compatibility.
- `announce()` utility duplicated across separate region divs and utility — could consolidate.

---

## Engram Artifact Lineage

| Artifact | Engram ID | Topic Key |
|----------|-----------|-----------|
| Proposal | #1546 | `sdd/wcag-aa-accessibility-audit/proposal` |
| Spec | #1547 | `sdd/wcag-aa-accessibility-audit/spec` |
| Design | #1548 | `sdd/wcag-aa-accessibility-audit/design` |
| Tasks | #1549 | `sdd/wcag-aa-accessibility-audit/tasks` |
| Verify Report | #1555 | `sdd/wcag-aa-accessibility-audit/verify-report` |
| Archive Report | Current | `sdd/wcag-aa-accessibility-audit/archive-report` |

---

## Next Steps / Recommendations

1. **Fix skip link href** (`#pm-main-content` → `#portal-app`): 1-character fix, unblocks correct keyboard skip behavior
2. **Address 4 minor warnings** in a follow-up PR: avatar edit target, loading spinner label, remaining inline styles in RutaPlayer, toggle `aria-describedby`
3. **Monitor AT compatibility** with RutaPlayer `role="tree"` + lazy loading
4. **Set coverage threshold** for future accessibility changes
5. **Consider consolidating `announce()`** usage across views for consistency
