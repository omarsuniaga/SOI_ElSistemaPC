# SOI Repertoire R1-B — Premium reference set

This directory contains the approved visual reference set and the audit artifacts for the Repertoire experience. The images define product hierarchy, interaction intent, and responsive targets; they do not replace the existing domain, authorization, or persistence contracts.

## Quick path

1. Review the desktop references 01–07 for the information architecture.
2. Review the mobile references 08–12 for the canonical Teacher Portal interaction model.
3. Use `GAP-MATRIX.md` to compare the references with the current implementation.
4. Use `IMPLEMENTATION-PLAN.md` to execute the slices in order.

## Reference inventory

| ID | View | Target |
|---:|---|---|
| 01 | Teacher repertoire home | Desktop |
| 02 | Teacher work detail | Desktop |
| 03 | Teacher create pedagogical work | Desktop |
| 04 | Teacher session/history | Desktop |
| 05 | Admin repertoire dashboard | Desktop |
| 06 | Admin create official work | Desktop |
| 07 | Admin orchestra overview | Desktop |
| 08 | Teacher multiselect evaluation | Mobile |
| 09 | Teacher repertoire home | Mobile |
| 10 | Teacher work detail | Mobile |
| 11 | Teacher student evaluation | Mobile |
| 12 | Teacher create work | Mobile |

The canonical files are the numbered PNGs in this directory. Desktop references are desktop-first for Admin/ACM and establish the shared visual language. Mobile references are mobile-first/PWA-first for Teacher Portal.

## Responsive acceptance rules

- Teacher Portal is implemented mobile-first, then tablet, then desktop.
- Admin/ACM is implemented desktop-first, with responsive drill-down behavior.
- Critical teacher workflows cannot require hover, right-click, Shift, or a physical keyboard.
- The measure grid must preserve the configured measures-per-line. If the preference is 8, each row contains exactly 8 numbered measure cells at 360px, 390px, and 430px widths.
- Mobile multiselect uses long press and a sticky bottom action sheet.
- Mobile detail uses horizontal fila tabs and bottom sheets/drawers instead of a permanently visible desktop sidebar.
- Existing manifest and service-worker behavior is preserved; unsupported offline mutations must be surfaced rather than simulated.

## Scope boundaries

- No production migration is applied by these references or documents.
- No Netlify/Vite production configuration is changed.
- Signals and Hermes remain OFF.
- ATRIL remains deferred.
- Phase 5 sectional aggregation is not implemented by this reference set.
