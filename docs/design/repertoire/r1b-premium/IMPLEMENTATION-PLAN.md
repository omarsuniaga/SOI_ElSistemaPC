# SOI Repertoire R1-B Premium UX/UI — Implementation Plan

This plan evolves the existing module. It does not create a second engine, replace domain semantics, or apply the R1-B migration.

## Slice A — Shared Repertoire design system (mobile-first)

- Define reusable Repertoire tokens on top of Portal Maestros `--pm-*` tokens.
- Establish mobile-first card, segmented-control, horizontal-tab, bottom-sheet, dialog, status, empty-state and responsive-grid primitives.
- Progressively enhance for tablet and desktop; do not shrink the desktop composition into mobile.
- Verify dark/light contrast, 360/390/430px, tablet, desktop and no page-level horizontal overflow.
- Add CSS/component tests before changing route composition.

## Slice B — Teacher Repertoire Home

- Extract `WorkCard`, `WorkList`, `RepertoireSearch`, and `RepertoireFilters`.
- Preserve real `listObras/listMontajes` data and PEDAGOGICO/INSTITUCIONAL distinction.
- Add card-level context menu only where an existing lifecycle operation is authorized.
- Use a real confirmation modal for destructive operations; do not invent archive semantics.

## Slice C — Teacher Work Detail shell

- Extract `WorkHeader`, `FilaTabs`, `StudentNavigator`, `PreparationSummary`, and inspector panels.
- Preserve the hierarchy Work → Version → Montage → Fila → Student → Measure.
- Add synopsis/reference link presentation only from persisted data.

## Slice D — MeasureGrid premium interaction

- Extract `MeasureGrid`, `MeasureRow`, `MeasureCell`, `RehearsalMark`, and passage indicators.
- Keep canonical measures and configured measures-per-line semantics.
- Preserve click, long-press, Shift-range, non-contiguous selection, rollback and linked scope dialog.
- On mobile, critical selection must not depend on right-click, hover or Shift; use long press and a sticky bottom action sheet.
- Test installed-PWA/standalone, 360/390/430px, tablet and desktop viewport behavior.

## Slice E — Student/Fila evaluation surfaces

- Separate Individual, Fila and Sectional-derived views in the UI.
- Route collective fila mutations through the R1-B fila RPC once production approval exists.
- Never persist derived states as collective teacher evaluation and never overwrite student overrides.

## Slice F — Pedagogical Work creation

- Replace the compact form with a stepper: metadata, structure, teaching scope, montage initialization and preview.
- Use only authorized real class scopes and the point-in-time student snapshot contract.
- Add rehearsal marks/passages/link fields when the adapter/backend contract supports them.

## Slice G — Session/history/trajectory

- Reuse `SessionRepertoirePanel.js` and existing session boundaries.
- Present session evidence, history, trajectory, priorities and regressions without mutating preparation state automatically.
- Compose the teacher session surface for mobile rehearsal use first: chips, quick selectors, range input and compact notes.

## Slice H — Admin Repertoire Dashboard

- Add an elevated admin/ACM route over the same Repertoire adapter and reporting projections.
- Show works, montages, events, publication state, responsible teachers, progress and risk.
- Enforce the authorization matrix; Finanzas must not gain Repertoire write access.

## Slice I — Institutional Work Builder

- Implement Work → Version → INSTITUTIONAL Montage → analysis → filas → teachers → event → publication.
- Keep publication explicit and auditable; do not conflate teacher-owned PEDAGOGICO work with institutional work.

## Slice J — Orchestra/Section/Fila analytics

- Add real elevated read projections using `sectionalAggregation.js` and `reporting.js`.
- Weight each fila equally, not by student headcount.
- Keep ATRIL deferred and preserve SIN_EVALUAR/SILENCIO/TACET/NO_APLICA semantics.

## Delivery and verification gates

1. Each slice starts with tests and a fresh route/data-contract inspection.
2. No production migration, production frontend promotion, Signals activation or Hermes activation is included.
3. Run Repertoire/domain/authorization/pilot/routing tests, relevant Portal Maestros regression, TypeScript, lint and Vite build after meaningful slices.
4. Capture authenticated desktop and mobile screenshots for each implemented reference when credentials are available.
5. Keep changes on `release/repertoire-r1b-stage1`; commit reviewable slices only.

## Responsive acceptance gates

- Teacher routes are mobile-first and PWA-first; Admin/ACM routes are desktop-first.
- Critical workflows work by touch at 360px, 390px and 430px.
- Measure-grid preference remains authoritative: if the user selects 8, eight numbered cells occupy each row; desktop may offer 10/12/16.
- No hover, right-click or keyboard shortcut is required for teacher critical paths.
- Existing manifest, service worker, installability and offline strategy are preserved; unsupported offline behavior is surfaced as a gap rather than simulated.
