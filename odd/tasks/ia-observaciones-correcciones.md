# ia-observaciones-correcciones

Objective: fix four defects found while testing the "IA" flow of the observations editor (PR #148 preview).

TDD: enabled (project rule "Diagnosing Bugs"), runner `npx vitest run`. Route: inline (small, already-understood files).
Delivery strategy: ask-on-risk; forecast well under 400 changed lines.

## Tasks

- [x] T1 Structure/improve modals overflow: text modals must scroll internally and keep header close and footer buttons reachable (CSS).
- [x] T2 Duplicate text per student: the fallback review keeps the whole original as ONE block, so assigning N students writes the entire text N times. Split deterministically at explicit `#Name` / `#todos` mentions and preselect recipients.
- [x] T3 Align "Evaluar presentes" and "Guardar sesión" side by side in the floating action bar.
- [ ] T4 (no code) Product proposal for what the IA button should do, delivered in chat.

## Acceptance

- T1: modal height never exceeds the viewport; body scrolls; close/accept reachable without scrolling the page.
- T2: for the reported text, each student block holds only that student's sentence; `#todos` becomes the "presentes" scope.
- T3: both buttons share one row at mobile and desktop widths.

## Progress / evidence

(filled in as tasks close)
