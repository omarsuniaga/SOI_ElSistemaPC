---
name: domain-modeling
description: Build, maintain, and respect the project's ubiquitous domain model. Use when discussing domain entities, modifying CONTEXT.md, designing database tables, naming models, or when terminology ambiguity arises.
---

# Domain Modeling & Ubiquitous Language

Apply the discipline of Domain-Driven Design (Eric Evans) to ensure clear, consistent, and unambiguous terminology across the entire codebase.

## Core Rules

1. **Consult CONTEXT.md First:** Before naming a database column, state property, component, function, or UI label, check `CONTEXT.md` at the root of the repository.
2. **Eliminate Synonymous Drift:**
   - Use `maestro` (never professor, instructor, trainer).
   - Use `alumno` (never client, student-user, child).
   - Use `clase` (never lesson, session, meeting).
   - Use `catedra` (never course, subject, syllabus).
   - Use `salon` (never room, classroom, aula).
   - Use `solapamiento` (never collision, overlap-crash).
3. **Evolve the Model Lazily but Decisively:** When a new business entity, metric, or concept emerges, update `CONTEXT.md` in the same work unit or PR so the shared understanding never decays.
4. **Consistency between Code and UI:**
   - Code (identifiers, variables, database schemas): English or Canonical Spanish according to `AGENTS.md` (e.g., `maestro_id`, `salon_id`, `hora_inicio`).
   - UI (labels, toasts, tooltips, placeholders): Spanish using the canonical domain terms defined in `CONTEXT.md`.
