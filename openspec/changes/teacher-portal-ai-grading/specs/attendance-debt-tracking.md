# Spec: attendance-debt-tracking

Track and resolve absence-based academic deficits. Absent students are flagged with "Con Deuda Académica" status until recovery session is recorded.

## ADDED Requirements

### R3.1: Derive Academic Debt from Absence
- Teacher records student absence (existing attendance module) with status "Ausente" or "Justificado"
- When indicator is graded for that class period/session and student was absent:
  - Student does NOT receive a grade for that indicator (no auto-grading)
  - Instead, student is marked with status "Con Deuda Académica" in `evaluacion_indicador` table (via `recovery_status` field)
  - Student appears in grading modal as "Con Deudas Académicas" in separate section from "Presentes"
- Student remains "Con Deuda Académica" until recovery session is explicitly recorded

**Acceptance Criteria:**
- Absence record (any type) automatically generates debt status for indicators taught during that absence
- Debt status is queryable and filterable (for route-map visualization)
- Absence in one session does not affect grades for other sessions where student was present

---

### R3.2: Register Recovery Session
- Teacher opens grading modal for an indicator and scrolls to "Con Deudas Académicas" section
- For each absent student, teacher can click "Registrar Recuperación"
- Recovery flow:
  1. Dialog appears: "¿Qué indica la recuperación?" with options:
     - "Recuperado" (student completed the missing work/learning)
     - "No Recuperable" (student's absence led to permanent inability to meet indicator)
  2. Teacher enters optional notes (e.g., "Completó ejercicio extra en tutoría")
  3. Teacher optionally assigns grade (stars 1-5) based on recovery work (optional)
  4. Clicks "Registrar Recuperación"
- System:
  - Updates `evaluacion_indicador.recovery_status` to "Recuperado" or "No Recuperable"
  - Records recovery session timestamp and notes
  - Updates check-mark status in route map (trigger reevaluation chain if prerequisite exists)
  - Moves student from "Con Deudas" section to completed section in modal

**Acceptance Criteria:**
- Recovery is recordable from grading modal with optional notes and grade
- Recovery status is persisted and visible in route map
- Recovery updates prerequisite chains (see R2.3)
- Student no longer appears in "Con Deudas" section after recovery is recorded

---

### R3.3: Distinguish Absence Types
- Recovery workflow respects absence type (Ausente vs. Justificado):
  - "Ausente" (unjustified): Teacher must explicitly record recovery before student can be marked as passing indicator
  - "Justificado" (justified): System may allow lenient flow (e.g., auto-mark as "Recuperado" with teacher override option, or require same explicit recovery as unjustified)
  - **Detail TBD in design:** Should justified absences require explicit recovery, or default to recovery with override?

**Acceptance Criteria:**
- Absence type is recorded and queryable
- Recovery workflow acknowledges absence type (at minimum in UI labels)
- No data loss or confusion between justified and unjustified absences

---

## MODIFIED Requirements

### M3.1: evaluacion_indicador Table Schema
- Add field `recovery_status` enum: (null/"pendiente", "recuperado", "no_recuperable")
- Add field `recovery_notes` text (optional, for teacher notes during recovery)
- Add field `recovery_timestamp` timestamp (when recovery was recorded)
- Add field `recovery_grade` int (optional, 1-5, grade assigned during recovery)

---

## Open Questions / Design Decisions Needed

1. **Auto-Recovery for Justified Absences:** Should "Justificado" absences automatically convert to "Recuperado" without teacher action, or require explicit recovery like "Ausente"?
   - **Proposal:** Explicit recovery for all absence types (safer, more transparent).
2. **Retroactive Recovery:** If teacher records attendance change (absence → present) after grading, should debt status be cleared automatically?
   - **Needs Decision:** Likely yes, but requires attendance system integration details.
3. **Multiple Recovery Attempts:** Should teacher be able to record multiple recovery attempts for same student+indicator, or only one?
   - **Needs Decision:** Recommend one final recovery record; multiple attempts would be new attempt via re-grading.
4. **Recovery Cascade:** If indicator has students with "No Recuperable" status, should dependent indicators (with this as prerequisite) be locked or warned?
   - **Needs Decision:** Likely warning with override, similar to R2.2.

---

## Scenario: Absence Triggers Debt, Recovery Resolves It

**Given** class "7A-Matemáticas" has student "Carlos"

**When** attendance record shows "Carlos" as "Ausente" on 2026-08-05

**And** teacher grades INDICADOR "Resuelve ecuaciones lineales" on 2026-08-05

**Then** Carlos is marked "Con Deuda Académica" for that indicator
  - Does NOT appear in "Presentes" section of grading modal
  - Appears in "Con Deudas Académicas" section with "Registrar Recuperación" button

**When** teacher later clicks "Registrar Recuperación" for Carlos on that indicator

**And** selects "Recuperado"

**And** optionally assigns grade 4 stars with note "Completó ejercicios en horario de consulta"

**And** clicks "Registrar"

**Then** Carlos's debt is resolved:
  - `recovery_status` = "Recuperado"
  - Grade is updated to 4 (if assigned), or remains null if no grade given
  - Check-mark status in route map updates (single→double if all students now present/recovered)
  - Carlos no longer appears in "Con Deudas" section

---

## Scenario: No Recuperable Status

**Given** student "Ana" has "Ausente" on date when INDICADOR "Toma de decisiones ética" was taught

**When** teacher registers recovery and selects "No Recuperable"

**And** notes: "Ana cambió de clase; no puede recuperar"

**And** clicks "Registrar"

**Then** Ana's status for that indicator is "No Recuperable":
  - Indicator does NOT require re-grading
  - Check-mark may reflect partial completion (TBD in design)
  - Dependent indicators (if any) are flagged for teacher review (prerequisite cannot be met)

---

## Success Criteria (from Proposal)

- Academic debt resolution updates student progress and check marks ✓
- Absence-based deficits tracked and resolved via recovery workflow ✓

---

## Notes

- Justified vs. unjustified absences need detailed design discussion
- Recovery cascade into prerequisites implemented via R2.3
- Performance: No explicit optimization needed for Phase 1 (assume <100 students per class)
