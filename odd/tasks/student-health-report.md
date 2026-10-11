# Student Health Report (monthly PDF)

Engram mirror: `odd/student-health-report/tasks` · File: `odd/tasks/student-health-report.md`
Sibling: `odd/tasks/class-health-report.md` (first delivery, done).

## Objective

One institutional PDF with an analysis of every student: absences in the
period and in the visible month, the class content the student actually
received, attendance trend and projection, and recommendations for a human to
decide on (guardian meeting, plan review, exploring another instrument).

## Problem / why

Session content is stored per session and nothing crosses it with each
student's attendance, so a student marked absent still "has" that class.
Risk and health indexes exist but are not month-bounded and give no
projection.

## Scope

- In: pure data builder, PDF renderer, one button in the ADM attendance view,
  fail-soft read of existing progress aggregates.
- Out: DB/migration changes, recording the decision taken on a recommendation
  (see POLICY note), sending anything to guardians, AI text generation.

## Constraints

- Attendance and content come from the timeline already loaded by
  `asistenciasView` (`getReporteConsolidado`). No new attendance query.
- Progress comes from the existing `getStudentProgressBatch`
  (`src/modules/progresos/api/progresosApi.js`), injected and fail-soft:
  without it the report still renders and progress-based rules do not fire.
- Thresholds reuse `THRESHOLDS` from `src/modules/progresos/services/riskRules.js`
  (`attendance_min_rate` 0.70, `grade_min_avg` 6.0, `indicator_min_pass_rate` 0.50).
- No student data is sent to an external AI service in this report.
- R5: every figure lists its evidence (dates, counts).
- R6 (binding): the system recommends, a person decides. No label is put on a
  student. Every recommendation carries six fields: what happened, evidence,
  why it matters, suggested action, who decides, when to review.
- Code in English; PDF/UI copy in neutral Spanish. Conventional Commits in
  English, no AI attribution.
- TDD strict (source: user global instructions). Runner: `npx vitest run <file>`.

## Design decisions

- Student key: `alumno_id` (fallback `alumno_nombre`). A student appears if
  they have at least one attendance record in the period up to the end of the
  target month. Sessions after the target month are ignored.
- States: `presente`, `tarde` → attended (`tarde` also counted as late);
  `justificado`; `ausente` → unjustified. Rate = attended / convoked.
- `period` = from the first timeline date to the end of the target month;
  `month` = the target month.
- Monthly series: one point per month with convocations, chronological.
- Trend: least-squares slope of the monthly rate (points per month, 1
  decimal) over the series; requires 3+ months, else `null`.
  Projection for the next month = fitted value at the next index, clamped to
  0–100; `null` without trend.
- Content received (month): sessions with content where the student attended.
  Content not received (month): sessions with content where the student was
  `ausente` or `justificado`. Exposure (period) = received / delivered.
- Recommendations (each with the six R6 fields; `reviewBy` = generation date
  + 30 days):
  - `guardian_meeting`: period unjustified absences >= 3, or month rate
    < 70% with 2+ convocations in the month. Action: convene the guardian for
    academic feedback. Decides: academic coordination.
  - `plan_review`: period rate >= 80% and (3+ grades with average < 6.0, or
    4+ indicator attempts with pass rate < 50%). Action: review the study plan
    with the teacher and consider alternatives, including exploring another
    instrument, together with the guardian. Decides: teacher and academic
    coordination. Never fires when attendance is below 80%: progress cannot
    be judged fairly on low attendance, and the text says so.
  - `preventive_followup`: no `guardian_meeting`, trend <= -10 points per
    month and projection < 70%. Action: teacher follow-up. Decides: teacher.

## Tasks

- [x] S1 — Attendance per student: period, month, monthly series, trend and
  projection. `src/modules/asistencias/services/studentHealthService.js` +
  test. Route: delegated writer.
- [x] S2 — Content received / not received, exposure, progress merge and
  recommendations with the six R6 fields. Same module.
- [x] S3 — `studentHealthPdfService.js` (summary, student table,
  recommendations, per-student detail, methodology), fail-soft progress
  loader, and the "Salud de los estudiantes" button in `asistenciasView.js`.

## Acceptance criteria

- A session where the student was absent or justified never appears in their
  received content.
- Absences are shown for the period and for the month, split into justified
  and unjustified.
- Every recommendation prints its six fields; a student without signals
  prints "Sin señales en el período".
- The report renders without progress data and in an empty month.

## POLICY note

R2 (close the loop): this report emits recommendations but does not record
the action taken or its result. That receiving half is not built here.
`POLICY-EXCEPTION R2: student health recommendations are printed, not
tracked — first delivery validates the report content with Omar — pay by
routing accepted recommendations into the existing Hermes case flow once the
report is approved.`

## Checks

- `npx vitest run src/modules/asistencias/`
- `npx eslint src/modules/asistencias/services/ src/modules/asistencias/views/asistenciasView.js`

## Progress

| Task | Status | Commit | Route |
|------|--------|--------|-------|
| S1 | done | c520aa4c | delegated writer |
| S2 | done | 9848038d, fix by parent (grade trigger removed) | delegated writer |
| S3 | done | 00bcacd8 | delegated writer |

TDD: RED/GREEN observed per task. S1 and S3 RED were import failures. In S2
the writer wrote the implementation before observing RED (process
deviation, RED confirmed afterwards). Parent fix followed RED then GREEN.
Review: receipt-driven development is off (clone-local); no native review.

## Verification evidence (2026-10-11)

- `npx vitest run src/modules/asistencias/`: 11 files, 115 tests passed
  (parent re-run after the fix).
- `npx eslint` on the student health service and PDF service: clean.
- Pending: the PDF has not been opened in the running app; the progress
  loader has not run against real data.

## Accepted changes

- `plan_review` no longer triggers on grades. `progresos.calificacion` allows
  0-10 in the database and `THRESHOLDS.grade_min_avg` is 6.0, but the grading
  form (`progresos/components/calificacionModal.js`) captures 0-5. With 0-5
  data every student with good attendance and 3 grades would have received
  the recommendation. Grades are displayed only; the rule uses indicator
  pass rate. The same mismatch exists in `progresos/services/riskRules.js`
  (not changed here).
- Progress line prints "Evaluaciones no disponibles" when the load failed and
  "Sin evaluaciones registradas" when there are none.

## Open decisions for Omar

- Which grade scale is the real one (0-5 or 0-10).
- Recommendation wording and thresholds (3 unjustified absences, 80% floor).
- Where accepted recommendations get recorded (POLICY-EXCEPTION R2 above).

## Next step

Omar opens both PDFs from Control de Asistencia in real mode and validates
content and wording.
