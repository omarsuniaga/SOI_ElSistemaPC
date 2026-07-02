---
doc_id: PORTAL-012
doc_type: manual
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\UI_THEME_IMPLEMENTATION_STANDARD_V9.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-012
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# UI / Theme Implementation Standard (V9)

## Mandatory Rule

Every new view, component, modal, toolbar, card, button, and table must:

- be responsive
- support `data-bs-theme="light"` and `data-bs-theme="dark"`
- use shared theme tokens instead of hardcoded colors
- preserve readable contrast in both themes

## Layout Standard

- Use `.page-container` as the main wrapper
- Mobile-first spacing
- Avoid fixed-width layouts unless wrapped in responsive containers
- Tables must be inside `.table-responsive`

## Color Standard

Use shared tokens:

- `--pm-surface`
- `--pm-surface-2`
- `--pm-text`
- `--pm-border`
- `--pm-backdrop`
- modal tokens:
  - `--pm-modal-bg`
  - `--pm-modal-border`
  - `--pm-modal-header-bg`
  - `--pm-modal-header-text`
  - `--pm-modal-footer-bg`
  - `--pm-modal-close-bg`
  - `--pm-modal-close-hover-bg`

Do not introduce raw `#fff`, `#000`, or one-theme-only backgrounds in reusable UI.

## Modal Standard

All modals must:

- use solid themed surfaces
- avoid transparent modal bodies
- keep header/body/footer readable in both themes
- fit on mobile with scrollable body when content is long

`AppModal` is the canonical modal surface and should be reused by default.

## Button Standard

- Buttons must remain readable in both themes
- Icon + label spacing must be preserved
- Primary actions should not rely on color alone; labels must stay explicit

## Responsive Standard

At minimum verify:

- mobile (`<= 576px`)
- tablet (`<= 768px`)
- desktop

Avoid:

- overflowing toolbars
- clipped dialog content
- horizontal scroll outside tables/code blocks

## Current Enforcement

This standard is now partially enforced in the shared layer:

- `bootstrap-support.css` defines shared PM theme tokens
- `AppModal.js` uses solid light/dark modal surfaces and responsive height behavior
- `planificacion.css` now applies the shared tokens to the teacher faro, toolbar, and glass/table surfaces

## Next Enforcement Step

Continue removing one-off inline visual styling from Maestro and ACM planning surfaces before adding more custom UI.
