# Spec: indicator-prerequisites

Configurable soft enforcement of indicator prerequisites (linear chains only in Phase 1). Prerequisites trigger reevaluation of dependent indicators when recovery is recorded.

## ADDED Requirements

### R2.1: Configure Prerequisites per Indicator
- Teacher edits route and selects an INDICADOR
- Dialog allows:
  - "Sin Prerrequisitos" (default, no dependency)
  - "Requiere: [dropdown of previous INDICADORES in same UNIDAD/OBJETIVO hierarchy]" (one prerequisite per indicator in Phase 1)
- Teacher can specify a prerequisite or leave blank
- Prerequisite is stored in `indicador_prerequisito` table (foreign key relationship)

**Acceptance Criteria:**
- Prerequisite configuration UI is accessible during route edit
- Can set prerequisite to any other indicator in same route
- Can clear prerequisite (reset to "Sin Prerrequisitos")
- Prerequisite persists across page reload

---

### R2.2: Soft Validation on Grading
- When teacher enters grade for an INDICADOR that has a prerequisite:
  - System checks if prerequisite indicator has a passing grade (≥3 stars or "Recuperado" status)
  - If prerequisite NOT met: show soft warning modal
    - Message: "Este indicador requiere [Prerequisite Name]. Estudiante aún no ha alcanzado prerequisito. ¿Desea continuar?"
    - Buttons: "Cancelar" (discard entry) | "Continuar Igual" (allow override)
  - If prerequisite IS met OR "Continuar Igual" clicked: grade is recorded as normal
  - Warning does NOT block entry (soft enforcement)

**Acceptance Criteria:**
- Warning appears only when prerequisite is unmet
- Teacher can override without restriction
- Grade is recorded regardless of override choice
- No warning if prerequisite already met

---

### R2.3: Reevaluation Chain on Recovery
- When teacher records a recovery session for a student (via "Registrar Recuperación" in grading modal):
  - System marks indicator as "Recuperado" in `evaluacion_indicador` table
  - **Chain trigger:** Query all indicators that depend on this indicator (have this as prerequisite)
  - For each dependent indicator where student has NOT YET PASSED:
    - Mark dependent indicator as "Pendiente Revisión" (new status or implicit via recovery_status update)
    - Add note/tooltip: "[Prerequisite] was recovered. Please re-evaluate this indicator if student now qualifies."
  - Teacher sees these flagged indicators highlighted in route map (visual indicator TBD in design)
  - Teacher can then re-grade dependent indicators, with prerequisite now satisfied

**Acceptance Criteria:**
- Recovery of prerequisite marks dependent indicators for review
- Dependent indicators are re-gradable without prerequisite warning
- Flag persists until teacher re-grades dependent indicator
- No automatic recalculation (teacher retains control)

---

## MODIFIED Requirements

None (new feature).

---

## Open Questions / Design Decisions Needed

1. **Prerequisite Complexity:** Should Phase 1 support AND/OR logic (multiple prerequisites), or strictly linear chains (one prerequisite per indicator)?
   - **Decision in Proposal:** Linear chains only.
2. **Circular Detection:** Should system detect and prevent circular prerequisites at save time?
   - **Decision in Proposal:** Yes, caught at save-time with error only; no UI visualization of cycle.
3. **Cross-Unidad Prerequisites:** Can an indicator in UNIDAD 2 depend on an indicator in UNIDAD 1, or only within same UNIDAD?
   - **Needs Decision:** Recommend allow cross-unidad for flexibility.
4. **Prerequisite Hierarchy Definition:** Should prerequisite be "must be graded" or "must be graded AND passed (≥3 stars)"?
   - **Needs Decision:** Assume "must be passed (≥3 stars or Recuperado)" based on proposal language.

---

## Scenario: Set Prerequisite and Grade with Warning

**Given** teacher is editing route for class 7A
  - INDICADOR A: "Identifica números primos"
  - INDICADOR B: "Factoriza números primos"

**When** teacher sets INDICADOR B prerequisite to INDICADOR A

**And** later teacher grades student "Juan" for INDICADOR B (without grading INDICADOR A first)

**Then** warning modal appears:
  - "Este indicador requiere [Identifica números primos]. Estudiante aún no ha alcanzado prerequisito."
  - Buttons: "Cancelar" | "Continuar Igual"

**When** teacher clicks "Continuar Igual"

**Then** Juan's grade for INDICADOR B is recorded
  - Grade is saved regardless of prerequisite status
  - Warning disappears

---

## Scenario: Recovery Triggers Reevaluation

**Given** student "María" has:
  - INDICADOR A (Prerequisite): "Presentes" (no grade yet) → later marked as "Ausente"
  - INDICADOR B (requires A): Graded as 2 stars (low, due to prerequisite not met)

**When** teacher registers María's recovery session for absence affecting INDICADOR A

**And** marks INDICADOR A as "Recuperado"

**Then** INDICADOR B is flagged for review:
  - Tooltip: "[Identifica números primos] was recovered. Please re-evaluate this indicator if student now qualifies."
  - Highlighted in route map (visual TBD)
  - Teacher can click to re-grade INDICADOR B without prerequisite warning

**When** teacher re-grades INDICADOR B as 4 stars

**Then** new grade is saved
  - Flag is cleared
  - Route map shows both indicators as completed

---

## Success Criteria (from Proposal)

- Prerequisite soft alert blocks OR allows override; recovery reevaluates dependent indicators ✓
- Prerequisite DAG validation < 50ms for 50+ indicators ✓ (Phase 1 linear chains only; deferred complex validation)

---

## Notes

- Phase 2 expansion should support AND/OR logic and visual DAG editor
- Circular detection error message to be designed in detail phase
- Performance: Cache DAG at session load per proposal
