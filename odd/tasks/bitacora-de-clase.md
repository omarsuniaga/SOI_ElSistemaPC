# bitacora-de-clase

Objective: implement the class log ("Bitácora de clase") from `docs/planning/SPEC_BITACORA_DE_CLASE.md`, phase by phase.
This document tracks phase **F1 · Live record panel (no new writes)**. F0 (offline queue) is PR #152.

- TDD: enabled (CLAUDE.md "Strict TDD Mode: enabled" + AGENTS.md "Diagnosing Bugs"), runner `npx vitest run`.
- Delivery strategy: ask-on-risk. Forecast F1 ≈ 450 authored lines (parser + tests ≈ 250, panel + tests ≈ 200), so one PR, possibly two slices.
- Branch: `feat/bitacora-f1-live-panel` from `origin/master` (7338798c).

## Scope (authorized)

F1 only: a pure shared interpreter and a read-only live panel under the observations editor. No new tables, no new writes, saving behaves as today. Report consumers keep their own parsers until F4.

## Interpreter contract — `parseBitacora(text, { roster, attendance })`

File: `src/shared/utils/bitacoraParser.js` (pure, no DOM, deterministic).

Returns:

```
{
  registros: [{ id, tipo, alcance, alumnoIds, texto, evidencia: { inicio, fin, texto }, origen: 'escrito' }],
  sinAsignar: [{ texto, inicio, fin }],
  avisos: [{ tipo: 'ausente', alumnoId, nombre } | { tipo: 'ambiguo', nombre }],
  cobertura: { presentes, conRegistro, frasesSinAsignar }
}
```

Rules:

1. Segment the note at mention groups `#Nombre` / `#todos` (case/accent-insensitive, longest match, name must be unique in the roster, `#A y #B` = one group). Same behaviour as `splitByMentions` in `src/portal-maestros/utils/lessonReview.js`.
2. Inside a segment, `[..]` → `contenido`, `(..)` → `refuerzo`, `{..}` → `tarea`, remaining plain text with letters → `desempeno`. Each yields its own registro for the segment's recipients.
3. `#todos` → `alcance: 'grupo'`, `alumnoIds` = present students.
4. Text without a mention: `[..]` → `contenido` with `alcance: 'grupo'` (current usage; teacher confirms in F2). Plain text, `( )` and `{ }` without a mention → `sinAsignar` (BR-04: never assigned to an unmentioned student).
5. Present = attendance state in `P, T, presente, tarde, tardanza`. A mentioned student with an explicit non-present state (A, J, …) → aviso `ausente` and is excluded from `alumnoIds`; a registro left without recipients goes to `sinAsignar`. Unmarked attendance produces no aviso.
6. `#Name` matching two roster students → aviso `ambiguo`, not a mention.
7. Lossless: evidencias + `sinAsignar` cover every letter/number of the note.
8. `cobertura.conRegistro` = present students reached by at least one registro (group registros reach all present).
9. Registro `id` is stable for the same text (derived from offsets), so the panel can re-render without flicker.

## Tasks

- [ ] T1 Commit spec + this document. Route: inline (docs only).
- [ ] T2 `parseBitacora` + tests (RED → GREEN). Route: delegated writer (non-trivial new module + tests).
- [ ] T3 `BitacoraPanel` read-only component under the editor, live update (debounced), coverage counter, "Sin asignar", avisos; mounted in `asistenciaView`. Route: delegated writer (2+ non-trivial files).
- [ ] T4 `lessonReview.splitByMentions` reuses the shared mention logic (single interpreter in the portal); existing lessonReview tests stay green. Route: delegated writer.
- [ ] T5 Verify: full `npx vitest run src/portal-maestros tests/portal-maestros src/shared`, `npm run build`, diff review. Route: inline.

## Acceptance

- The 2026-10-20 incident note yields one registro per student sentence, `#Santa … y #Yereni …` shared, `#todos` as group; no sentence repeated across students.
- Panel shows "x/y presentes con registro", the "Sin asignar" block and absent/ambiguous warnings; it never writes.
- No change to what gets saved.

## Progress / evidence

(filled in as tasks close)
