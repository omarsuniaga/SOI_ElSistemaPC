# Spec: route-indicator-checks

Visual check-mark status display for indicators in the personal route map. Three states reflect teaching/grading progress and student presence/recovery status.

## ADDED Requirements

### R4.1: Three Check States per Indicator
- Each INDICADOR in the route map displays one of three states:
  1. **No Check (∅)**: Indicator not yet taught/graded. Default state for new route.
  2. **Single Check (✓)**: Indicator has been taught/graded BUT at least one student is "Ausente" without recovery.
     - Meaning: Teaching started, but some gaps remain (attendance debt unresolved).
  3. **Double Check (✓✓)**: All students graded or recovered (no outstanding debts).
     - Meaning: Indicator is complete for this class.

**Acceptance Criteria:**
- Check states are displayed as visual markers (icon, badge, or color) in route map UI
- States are queryable from database (not just UI-level logic)
- State transitions are automatic based on underlying data (no manual toggling)

---

### R4.2: Automatic State Transitions
- System calculates check state for each indicator based on student evaluation records:
  1. No Check → Single Check:
     - Trigger: First grade is recorded for any student on this indicator
  2. Single Check → Double Check:
     - Trigger: Last student with "Con Deuda Académica" status is marked "Recuperado" or "No Recuperable"
     - Condition: ALL students must be in one of:
       - Has passing grade (≥3 stars, or grade assigned during recovery)
       - Status "Recuperado" with optional grade
       - Status "No Recuperable" (absence not recoverable for this student)
       - Was not enrolled in class on indicator teaching date (skip check)
  3. Double Check → Single Check (edge case):
     - Trigger: Teacher reverses/deletes a recovery or grade (uncommon, but possible)
     - Condition: At least one student returns to "Con Deuda" or ungraded state
  4. Any state → No Check:
     - Trigger: All grades/recoveries for indicator are deleted (rare; TBD in design if even allowed)

**Acceptance Criteria:**
- Transitions occur immediately when recovery or grade is recorded
- No manual intervention required to update check state
- State persists correctly across page reload
- Edge case reversals handled consistently

---

### R4.3: Visual Indicator in Route Map
- Route map displays check state for each indicator in hierarchy view (UNIDAD > OBJETIVO > INDICADOR)
- Visual options (design TBD):
  - Icon: ∅ (empty circle), ✓ (single check), ✓✓ (double check, possibly styled as WhatsApp-style blue double check)
  - Color: Gray (no check), Yellow/Orange (single), Green/Blue (double)
  - Badge: Numeric (e.g., "0 of 10 graded", "5 recovered", etc.)
- Clicking on indicator preview shows:
  - Current check state
  - Tooltip/hover: "X de Y estudiantes evaluados" or "Algunas deudas pendientes"

**Acceptance Criteria:**
- Check state is clearly visible in route map
- Visual style is consistent with existing Portal Maestros UI
- Tooltip provides context for single-check state (which students have debt)

---

### R4.4: Check State Scope per Class
- Check states are calculated and stored PER CLASS (not global for route)
- Same route used in multiple classes has independent check states per class
  - Example: Route "Algebra 2026" used in classes "7A" and "7B"
  - Class 7A may have all indicators double-checked, 7B may have singles
  - Each class view shows its own states

**Acceptance Criteria:**
- Check state queries filter by class_id and route_id
- Cloning a route resets check states to "no check" for new class
- No cross-class contamination of states

---

## MODIFIED Requirements

### M4.1: evaluacion_indicador Query Optimization
- Add database view or query helper to compute check state efficiently:
  - `GET /maestro/route/:routeId/class/:classId/indicator-states`
  - Returns: `{ indicador_id, check_state: "none"|"single"|"double", student_count, graded_count, recovered_count, debt_count }`
- Ensure query performance < 200ms for 100+ indicators per class

---

## Open Questions / Design Decisions Needed

1. **Visual Design:** Should check marks use WhatsApp-style blue (from proposal) or existing Portal Maestros palette?
   - **Recommendation:** Use WhatsApp blue for double-check to match proposal tone; single-check neutral color.
2. **Tooltip Detail:** Should tooltip show names of students with debt, or just counts?
   - **Recommendation:** Show counts and summary; full list available via grading modal.
3. **Icon Placement:** Should check marks appear next to indicator name, or as a badge in a separate column?
   - **Recommendation:** Next to name for compact view; TBD in design phase.
4. **Clickable Checks:** Should clicking a check state navigate to grading modal, or just display info?
   - **Recommendation:** Clicking double-check shows summary; clicking single-check opens grading modal.
5. **"No Recuperable" Effect on Double-Check:** If student has "No Recuperable" status, does indicator still reach double-check?
   - **Proposal:** Yes (only presence/recovery matters, not whether it's recoverable or not).
   - **Alternative:** Flag as "Incomplete" if any "No Recuperable" exists.
   - **Recommendation:** Double-check if all students are graded OR recovered/no-recuperable (proposal behavior).

---

## Scenario: Automatic Check Progression

**Given** teacher created route with INDICADOR "Resuelve ecuaciones" for class "7A"
  - Initial state: No Check (∅)
  - Class has 20 students: 18 present, 2 absent on teaching date

**When** teacher grades the 18 present students (2-5 stars each) via grading modal

**Then** check state transitions to Single Check (✓):
  - 18 graded, 2 "Con Deuda Académica"
  - Route map displays: "Resuelve ecuaciones ✓ (2 deudas)"

**When** teacher later registers recovery for 1 absent student (mark as "Recuperado" + 4 stars)

**Then** check state remains Single Check (1 debt remains)

**When** teacher registers recovery for 2nd absent student (mark as "No Recuperable")

**Then** check state transitions to Double Check (✓✓):
  - All students graded or recovered/non-recoverable
  - Route map displays: "Resuelve ecuaciones ✓✓"
  - Indicator is complete for class 7A

---

## Scenario: Check State per Class (Route Reuse)

**Given** teacher cloned route "Algebra 2026" from class 7A to class 7B

**When** viewing route in class 7A:
  - INDICADOR "Factorización": ✓✓ (all graded)
  - INDICADOR "Polinomios": ✓ (some debts)

**When** viewing same route in class 7B:
  - INDICADOR "Factorización": ∅ (not yet graded)
  - INDICADOR "Polinomios": ∅ (not yet graded)

**Then** check states are independent per class
  - No data confusion
  - Teacher can see progress per class at a glance

---

## Success Criteria (from Proposal)

- Visual check markers: no check (untaught), single check (taught + some absent), double check (all present/recovered) ✓
- Transition automatic simple→double on resolving last debt ✓

---

## Notes

- Check states are computed (not stored) or cached for performance
- Edge cases (mass grade deletion, attendance reversals) should be handled gracefully
- UI design details (icon style, color, placement) deferred to design phase
