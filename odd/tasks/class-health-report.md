# Class Health Report (monthly PDF)

Engram mirror: `odd/class-health-report/tasks` · File: `odd/tasks/class-health-report.md`

## Objective

One institutional PDF covering every class of the visible month: attendance
analysis, comparison with the previous month, and an analysis of the content
recorded per session ("salud de la clase").

## Problem / why

Pieces exist but are scattered: the attendance control PDF has per-class
averages without month-over-month comparison; the pedagogical report compares
months but one class at a time and with a hardcoded content approximation.
Nothing counts how often a topic repeats in a class.

## Scope

- In: pure data builder, PDF renderer, one button in the ADM attendance view.
- Out: student health report (second delivery), AI narrative summary, any DB
  or migration change, changes to the existing attendance control PDF.

## Constraints

- Single source of truth: the timeline already loaded by `asistenciasView`
  (`getReporteConsolidado`, works in Supabase and Demo mode). No new queries.
- Code in English, UI/PDF copy in Spanish. Conventional Commits in English,
  no AI attribution lines.
- R5: every number traceable — topics keep the session dates they came from;
  the score formula is printed in the PDF.
- R6: this report scores classes, never students.
- TDD: strict, enabled (source: user global instructions). Runner:
  `npx vitest run <test file>`.

## Design decisions

- Attendance per class session is counted from `clase.asistencias[].estado`
  when present (`presente`, `tarde`, `ausente`, `justificado`), falling back
  to the `presentes/justificados/ausentes` counters. `tarde` counts as
  attended. Rate = attended / (attended + justified + absent).
- Previous month is taken from the same period timeline. If it has no
  sessions for that class, the delta is `null` and renders as "Sin datos".
- Session content text = `observacion_sesion` + `observacion_clase` (non-empty).
- Topics are deterministic: normalize (lowercase, strip accents/punctuation),
  drop Spanish stopwords and tokens shorter than 4 chars, then count in how
  many sessions each bigram/unigram appears. A topic needs 2+ sessions.
  Unigrams contained in a kept bigram are dropped. Top 8 per class.
  `attentionPct` = sessions with topic / sessions with content.
- Health score (0–100, `null` without sessions):
  `0.5 * attendanceRate + 0.3 * contentCoveragePct + 0.2 * varietyPct`
  - `contentCoveragePct` = sessions with content / sessions
  - `varietyPct` = distinct normalized contents / sessions with content
  - Levels: >= 80 "Saludable", 60–79 "En observación", < 60 "Requiere atención".

## Tasks

- [x] T1 — Attendance per class with month-over-month comparison.
  `src/modules/asistencias/services/classHealthService.js` +
  `__tests__/classHealthService.test.js`. Route: delegated writer
  (2+ non-trivial files across the feature).
- [x] T2 — Content analysis (coverage, topics with repetition counts and
  dates, repeated-content sessions) and health score, same module.
- [x] T3 — PDF renderer `classHealthPdfService.js` (summary, comparison table,
  per-class content section, methodology note) and the
  "Salud de las clases" button in `views/asistenciasView.js`, honoring the
  active filters and visible month.

## Acceptance criteria

- Every class with a session in the month appears once, with sessions,
  attended/justified/absent, rate, previous-month rate and delta in points.
- Topics list shows session count, attention % and the dates as evidence.
- Sessions without recorded content lower coverage and are counted explicitly.
- Empty month produces a valid PDF with an explicit "sin registros" row.
- Works in Demo mode.

## Checks

- `npx vitest run src/modules/asistencias/services/__tests__/`
- `npx eslint src/modules/asistencias/`
- `npm run policy:check`

## Progress

| Task | Status | Commit | Route |
|------|--------|--------|-------|
| T1 | done | 5b891c87 | delegated writer |
| T2 | done | 63b1080b, fix 63734554 (parent, inline) | delegated writer |
| T3 | done | 57a23f51 | delegated writer |

TDD: RED and GREEN observed for every task (writer report) and for the fix
(parent). Review: receipt-driven development is off (clone-local), so no
native review ran.

## Verification evidence (2026-10-11)

- `npx vitest run src/modules/asistencias/`: 8 files, 49 tests passed.
- `npx eslint` on the four new files: clean.
- `npm run policy:check`: exit 1. Every violation listed is in a migration
  file; this feature changes no migration. Not re-run on the base commit.
- Pure builder run on a realistic sample: rates, delta and score matched
  hand computation.
- Pending: the PDF has not been opened in the running app (jsPDF is mocked
  in tests).

## Accepted changes

- Topics are built per phrase (split on punctuation and between the two
  observation fields). The sample run produced "mayor posicion" from
  "Re mayor, posición del arco".
- Score is `null` when a class has no convocations.
- Summary previous rate and delta use only classes present in both months.

## Known limits

- Tokens shorter than 4 letters are dropped, so note names (do, re, mi, sol)
  do not appear in topic labels.
- No domain stoplist: words such as "clase" can surface as topics.

## Notes

- Lane `bd-api` (`src/**/services/**`) is listed for another Claude-Code
  session in the 2026-09-09 batch (advisory, no expiry recorded). This work
  only adds new files there plus one button in the view.

## Next step

Omar opens the PDF from Control de Asistencia and validates it; then the
student health report (second delivery).
