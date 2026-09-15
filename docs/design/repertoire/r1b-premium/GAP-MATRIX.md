# SOI Repertoire R1-B Premium UX/UI — Gap Matrix

Audit date: 2026-09-15  
Baseline: `release/repertoire-r1b-stage1` at `5c75e5ce`  
Scope: current implementation versus the seven supplied reference images. Reference 08 was not supplied.

## Responsive priority correction

Teacher Repertoire is **mobile-first / PWA-first**. The desktop screenshots define hierarchy and visual language; they are not a desktop-first implementation mandate. Admin/ACM remains desktop-first, with tablet drawers and mobile drill-down review.

| Teacher reference | Mobile target | Tablet target | Desktop target | Current responsive status |
|---|---|---|---|---|
| 01 Home | Header + `+`, segmented Mis obras/Oficiales, search/filter, vertical cards | Two-column cards where space permits | Dense three-column cards and filters | `MOBILE_PARTIAL` |
| 02 Work detail | Header, collapsed synopsis, horizontal fila tabs, Fila/Alumnos switch, grid, bottom sheet/drawer | Grid plus collapsible inspector | Multi-column inspector and roster | `MOBILE_PARTIAL` |
| 03 Create pedagogical | Four progressive steps with one column | Stepper with two-column fields | Full builder workspace | `NEEDS_RESPONSIVE_REDESIGN` |
| 04 Session/history | Chips, selectors, measure range, bottom sheets, compact notes | Split form where safe | Form + history/trajectory panels | `MOBILE_PARTIAL` |
| 08 Multiselect (pending) | Long press + sticky bottom action sheet | Bottom sheet or compact toolbar | Shift/range + toolbar | `REFERENCE_08_PENDING` |

Admin/ACM references 05–07 are `DESKTOP_FIRST`, with responsive drill-down rather than compressed wide tables/heatmaps. The current teacher grid is structurally mobile-capable for configured columns, but the surrounding shell still needs mobile composition work.

## Reference inventory

| Reference | Supplied image | Interpretation |
|---|---|---|
| 01 | `C:/Users/omare/Downloads/ChatGPT Image 15 sept 2026, 10_28_52 a.m. (1).png` | Teacher repertoire home |
| 02 | `C:/Users/omare/Downloads/ChatGPT Image 15 sept 2026, 10_28_53 a.m. (4).png` | Teacher work detail |
| 03 | `C:/Users/omare/Downloads/ChatGPT Image 15 sept 2026, 10_28_53 a.m. (3).png` | Teacher pedagogical-work builder |
| 04 | `C:/Users/omare/Downloads/ChatGPT Image 15 sept 2026, 10_28_54 a.m. (5).png` | Teacher session/history |
| 05 | `C:/Users/omare/Downloads/ChatGPT Image 15 sept 2026, 10_28_52 a.m. (2).png` | Admin/ACM dashboard |
| 06 | `C:/Users/omare/Downloads/ChatGPT Image 15 sept 2026, 10_28_55 a.m. (6).png` | Institutional-work builder |
| 07 | `C:/Users/omare/Downloads/ChatGPT Image 15 sept 2026, 10_28_56 a.m. (7).png` | Orchestra overview |
| 08 | Not supplied | `REFERENCE_08_PENDING` — teacher multiselect evaluation |

## Detailed matrix

| Capability | Current route | Current component | Current data source | Current status | Target behavior | Required change | Backend dependency | Risk | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Teacher repertoire home | `#/repertorio` | `src/portal-maestros/views/repertorioView.js` (`repertoireHomeMarkup`) | `createRepertoireAdapter().listObras/listMontajes` | `PARTIAL` | Searchable/filterable tabs, dense work cards, card-level contextual menu | Extract `WorkList`, `WorkCard`, search/filter state, confirmation modal; remove redundant open button | Existing R1-A/R1-B reads; delete/archive lifecycle must be confirmed | Medium | P0 |
| Work identity and scope distinction | `#/repertorio` | `workMarkup`, `cardMarkup` | `obras`, `obra_versiones`, `montajes` | `EXISTS_NEEDS_RESTYLE` | Clear PEDAGOGICO versus institutional presentation | Add semantic scope badges and metadata mapping without fake values | `montajes.scope_type` after R1-B migration | Low | P0 |
| Teacher work detail shell | `#/repertorio` → map | `mapMarkup` in `repertorioView.js` | `montajes`, filas, alumnos, compases | `PARTIAL` | Header synopsis, source link, roster inspector, tabs | Extract `WorkHeader`, `FilaTabs`, `StudentRoster`, summary panels | Existing adapter; synopsis/reference fields are not fully projected | Medium | P0 |
| Canonical measure grid | `#/repertorio` | `gridMarkup` | `obra_compases` + montage/fila state | `EXISTS_NEEDS_RESTYLE` | Dense numbered cells, rehearsal marks, passages, configured columns | Extract `MeasureGrid/MeasureRow/MeasureCell`; preserve `gridSemantics.js` and long-press behavior | R1-B fila table for real fila state | Medium | P0 |
| Fila and student evaluation | `#/repertorio` | inline picker, student buttons, fila summary | fila RPCs, student overrides, derived domain functions | `PARTIAL` | Explicit Individual/Fila/Derived modes with no semantic conflation | Extract evaluation panels and make scope visible in controls | R1-B migration is not applied to production | High | P0 |
| Multiselect evaluation | `#/repertorio` | inline selection handlers in `repertorioView.js` | adapter mutation boundary | `EXISTS_NEEDS_RESTYLE` | Desktop Shift range, touch long press, bulk and linked choice | Extract `MultiSelectToolbar`; add reference-08 acceptance once supplied | Existing RPCs; fila RPC required for real fila writes | Medium | P0 |
| Pedagogical work creation | `#/repertorio` | `repertoireHomeMarkup` form | `fn_repertoire_create_pedagogical_montage` in pending R1-B migration | `PARTIAL` | Stepper for metadata, structure, scopes, preview | Extract builder steps; add version/marks/passages/link fields; retain authorized class snapshot | Blocked by unapplied R1-B creation RPC | High | P1 |
| Research assistant | No dedicated route | None in Repertoire | Groq service exists elsewhere; no Repertoire research boundary | `MISSING_FRONTEND` | Reviewable candidate sources and explicit accept/insert | Create `WorkResearchPanel` and adapter contract; never auto-overwrite | Provider/service contract and audit logging needed | High | P2 |
| Session/history | `#/asistencia` and session panel | `src/portal-maestros/components/SessionRepertoirePanel.js` | Existing session repertoire tables/RPCs | `EXISTS_NEEDS_RESTYLE` | Session evidence, trajectory, priorities, regression history | Reuse panel; add detail deep-link and consistent cards | Existing session integration | Medium | P1 |
| Admin repertoire dashboard | `/admin` | No Repertoire dashboard found | Reporting domain projections exist in `src/modules/repertoire/domain/reporting.js` | `MISSING_FRONTEND` | Institutional works, montages, events, risks, responsible teachers | Add admin route/view using the same adapter/reporting engine | Institutional R1-B data and admin authorization | High | P2 |
| Institutional work builder | `/admin` | No dedicated builder found | No institutional creation UI; schema supports canonical works/montages | `MISSING_FRONTEND` | Work → version → institutional montage → sections → teachers → publish | Add admin builder with explicit publication workflow | R1-B scope/ownership columns; publication authorization | High | P2 |
| Orchestra overview | `#/seccional` | `src/portal-maestros/views/seccionalView.js` | `createSectionalDemoAdapter` only when injected; real route renders empty state | `PARTIAL` | Elevated-only orchestra/section/fila drilldown with weighted filas | Add real read adapter and elevated route/view; reuse `sectionalAggregation.js` | Production Repertoire data and elevated RLS | High | P2 |
| Dark/light visual system | All Repertoire views | `src/portal-maestros/styles/repertoire.css`, shared tokens | `src/portal-maestros/styles/01-tokens.css` | `EXISTS_NEEDS_RESTYLE` | Premium dark quality without breaking light mode | Keep semantic `--pm-*` tokens; remove page hardcoded colors; verify contrast | None | Medium | P0 |
| Responsive hierarchy | `#/repertorio`, `#/seccional` | Repertoire/sectional CSS | Browser viewport | `EXISTS_NEEDS_RESTYLE` | Single-column mobile, horizontal fila tabs, usable fixed-column grid, drawer/sheet inspectors | Add breakpoints and viewport tests; preserve configured measures-per-line | None | Medium | P0 |
| Accessibility | Repertoire views | Native buttons/labels in `repertorioView.js` | DOM semantics | `PARTIAL` | Keyboard, focus, names, modal semantics, status announcements | Extract dialogs, focus management, roving/tab behavior, contrast audit | None | Medium | P1 |

## Authorization and migration blockers

- Ordinary teacher access is pilot-gated by `src/portal-maestros/shell/portalRoutes.js` and `repertoirePilotAccess.js`.
- R1-B fila-specific applicability, collective preparation and creation RPCs are **`BLOCKED_BY_R1B_MIGRATION`** in production because the migration remains unapplied.
- `src/modules/repertoire/domain/authorizationMatrix.js` and existing RLS/RPC contracts remain canonical.
- Signals and Hermes remain OFF and are outside this visual implementation.
- ATRIL remains DEFERRED.

## PWA and connectivity audit

`public/manifest.json`, `public/sw.js`, `src/main-maestros.js` and `src/services/swCaching.js` provide the existing installable PWA/service-worker foundation. Repertoire currently has controlled saving/error feedback, but does not yet expose a complete offline/pending-sync state machine. This is `PARTIAL`, not a reason to invent a second offline architecture.

## Evidence basis

The matrix is based on the actual route map, Repertoire adapter, view, shared token files, session panel, sectional view, domain aggregation/reporting modules, and the R1-A/R1-B migration contracts. Percentages are enumerated capability estimates, not visual-quality claims.
