# ia-observaciones-correcciones

Objective: fix four defects found while testing the "IA" flow of the observations editor (PR #148 preview).

TDD: enabled (project rule "Diagnosing Bugs"), runner `npx vitest run`. Route: inline (small, already-understood files).
Delivery strategy: ask-on-risk; forecast well under 400 changed lines.

## Tasks

- [x] T1 Structure/improve modals overflow: text modals must scroll internally and keep header close and footer buttons reachable (CSS).
- [x] T2 Duplicate text per student: the fallback review keeps the whole original as ONE block, so assigning N students writes the entire text N times. Split deterministically at explicit `#Name` / `#todos` mentions and preselect recipients.
- [x] T3 Align "Evaluar presentes" and "Guardar sesión" side by side in the floating action bar.
- [x] T4 (no code) Product proposal for what the IA button should do, delivered in chat.
- [x] T5 Step 1 of the proposal: merge the 🚀 structure action into ✨ IA (remove button, modal, help entry).
- [x] T6 Popup hover contrast in dark theme (translucent tint instead of light fallback).
- [ ] T7 Step 2: per-student review cards with "Sin asignar" bin and AI suggestions marked as "sugerido".
- [ ] T8 Step 3: open "Evaluar presentes" only for students that received content; move 📋 informe into a menu.

## Acceptance

- T1: modal height never exceeds the viewport; body scrolls; close/accept reachable without scrolling the page.
- T2: for the reported text, each student block holds only that student's sentence; `#todos` becomes the "presentes" scope.
- T3: both buttons share one row at mobile and desktop widths.

## Progress / evidence

- T1–T3: commits ddec52fb, 20e7b840. Tests: lessonReview (5 new, RED then GREEN), full portal suite green. Visual check pending (no local login).
- T5–T6: see next commit. Full portal suite 137 files / 1109 tests green; build OK.
- Related fix on PR #148 branch (setContext merge): local commit 5d3d38e4 in worktree pr148-mention-chips, not pushed.
- `npm run policy:check` fails on a pre-existing migration (20260910180000_hermes_resultados_accion_v1_lts.sql), unrelated.
