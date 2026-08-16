# Spec: indicator-grading-modal

Specialized modal for per-indicator grading with attendance-aware UI, free-text observations, IA pedagogical analysis, and recovery workflow.

## ADDED Requirements

### R5.1: Modal Layout and Structure
- Modal triggered from route map (click indicator or "Calificar" button)
- Header: Route context (UNIDAD > OBJETIVO > INDICADOR name)
- Three sections (stacked vertically, scrollable if needed):

#### Section 1: "Presentes" (Present Students)
- List of students who were present during indicator teaching date
- For each student:
  - Student name (clickable to see detail profile, optional)
  - **Star rating control (1-5 stars)** with visual feedback
    - No stars (untouched)
    - Clicking star sets rating and persists immediately (or via save button, TBD)
    - Hover effect shows rating scale
  - Optional: grade label (e.g., "Insuficiente", "Aceptable", "Excelente") based on stars
- Sorting/filtering (optional): by name, by grade, filter ungraded

#### Section 2: "Con Deudas Académicas" (Absent Students)
- List of students who were absent during indicator teaching date
- For each student:
  - Student name
  - Absence type badge: "Ausente" (red) or "Justificado" (yellow) or similar
  - **"Registrar Recuperación" button** (TBD: inline or expandable form)
- Clicking button opens recovery sub-form:
  - Dropdown: "Recuperado" | "No Recuperable"
  - Optional grade (1-5 stars, same as "Presentes")
  - Text field: Recovery notes (e.g., "Completó tareas extras")
  - Buttons: "Registrar" | "Cancelar"
- After recovery recorded, student moves to completed section (or remains in "Con Deudas" with recovery status displayed)

#### Section 3: "Observaciones" (Free-Text Observations)
- Text area for teacher to enter free-form observations about indicator mastery, class performance, etc.
- Character limit: TBD (recommend 500-1000)
- Optional: **Tag buttons** (reuse existing tagging UI if available)
  - Pre-defined tags (e.g., "Necesita apoyo", "Destaca", "Requiere seguimiento")
  - Teacher can add/select tags inline
- Tools (from existing calificacionModal if available):
  - Bold, italics, bullet points (optional rich text, or plain text only)

---

### R5.2: IA Pedagogical Analysis Button
- Button labeled "Analizar" (not "Analizar con IA", to be less prominent)
- Location: Bottom of modal or in Section 3 header
- Behavior:
  - Disabled if NO free-text observation entered (teacher must provide context)
  - **Requires:** At least one observation character and at least one student graded or recovered
  - On click:
    1. **Preparation:** Gather context:
       - Indicator name and criteria
       - List of present students (names only, no grades)
       - List of absent/recovered students (names only, recovery status)
       - Teacher's free-text observation
    2. **IA Call:** Call existing `analyzeObservation()` from groqService with indicator-enriched prompt:
       - Prompt includes indicator objectives/description
       - Prompt includes student attendance context
       - Prompt asks for pedagogical analysis (improvements, next steps), NOT grades
    3. **Display Analysis:** Show IA response in expandable panel or modal:
       - Analysis text (read-only)
       - **Optional:** "Sugerir Calificaciones" button (only shown if analysis detects lack of explicit grades in observation)
         - If clicked: IA suggests "Consider 4 stars for Juan" based on analysis (no auto-assignment)
         - Teacher MUST manually accept each suggestion (click to assign, or ignore)
       - Close button to dismiss analysis

**Acceptance Criteria:**
- "Analizar" button is disabled until observation is entered
- IA response is generated within 5 seconds (performance TBD in design)
- No grades are auto-assigned by IA (teacher always in control)
- Teacher can ignore IA suggestions entirely
- Analysis is logged (optional, for audit trail)

---

### R5.3: Prerequisite Warning Integration
- When teacher starts grading for indicator with prerequisite:
  - For each student, system checks prerequisite status (from R2.2)
  - If prerequisite NOT met: soft warning shown inline or on-save (design TBD)
  - Message: "Este indicador requiere [Prerequisite]. Estudiante aún no ha alcanzado prerequisito. ¿Desea continuar?"
  - Buttons: "Cancelar" | "Continuar Igual"
  - If override chosen: grade is recorded as normal (no blocking)

**Acceptance Criteria:**
- Warning appears only for students who failed prerequisite
- Override is allowed and persisted
- Multiple students can have different prerequisite statuses (warning per student)

---

### R5.4: Mark as Completely Evaluated
- Modal includes button/checkbox: "Marcar como Completamente Evaluado" or "Finalizar Evaluación"
- Clicking indicates:
  - All present students have been graded (or explicitly skipped)
  - All absent students have recovery status recorded (or explicitly marked "No Recuperable")
  - Teacher has optionally entered observations
- On click:
  - System marks indicator as "evaluated" in session state (TBD: stored in DB or session-only)
  - Modal can close with confirmation
  - Route map reflects completion (trigger check-state update per R4.2)
- If teacher exits modal without marking complete:
  - Partial data is saved (grades/observations)
  - Indicator remains in-progress (can re-open to continue)

**Acceptance Criteria:**
- "Mark as complete" button is visible and functional
- Completion is noted for audit/tracking purposes
- Route map check-state updates on completion
- Re-opening modal allows further edits (completion is not "locked")

---

### R5.5: Data Persistence and Navigation
- **Auto-save:** Grades, observations, recovery status are persisted:
  - On blur (after leaving star rating or text field), or
  - On explicit "Guardar" button click, or
  - On modal close (TBD in design)
- **Navigation:**
  - Close button returns to route map
  - "Siguiente Indicador" button (optional, for streamlined flow) navigates to next ungr aded indicator
  - Unsaved changes: TBD (warn or auto-save before navigation)

**Acceptance Criteria:**
- All data is persisted to database (not lost on close)
- Navigation is smooth without data loss
- Teacher can open modal again to see previous entries

---

## MODIFIED Requirements

### M5.1: calificacionModal.js Extension
- Extend existing calificacionModal component (or create IndicadorGradingModal subclass)
- Reuse existing styles, tag UI, and tagging tools if available
- Ensure visual consistency with rest of Portal Maestros

### M5.2: groqService.js Enhancement
- Extend `analyzeObservation()` to accept indicator context:
  - Signature: `analyzeObservation(observation, indicatorCriteria, studentNames, attendanceContext)`
  - Prompt engineering: Inject indicator objectives, student list, attendance status into prompt
  - Response: Pedagogical analysis (improvements, misconceptions, next steps), NOT grades
  - Log calls for audit (optional)

### M5.3: Database Queries
- Query attendance_records to partition students (presentes vs. ausentes) per class + indicator teaching date
- Query evaluacion_indicador to retrieve existing grades, observations, recovery status for re-opening modal

---

## Open Questions / Design Decisions Needed

1. **Observation Visibility:** Should observations be visible to students or parents, or teacher-only?
   - **Recommendation:** Teacher-only for Phase 1; deferred to Phase 2.
2. **Tag Library:** What pre-defined tags should be available? Should teacher create custom tags?
   - **Recommendation:** Small fixed set ("Necesita apoyo", "Destaca", etc.); custom tags in Phase 2.
3. **IA Suggestion UX:** If IA suggests grades ("Consider 4 stars for Juan"), should teacher click to apply, or should UI auto-select with undo?
   - **Recommendation:** Click to apply (explicit control).
4. **Auto-Save vs. Explicit Save:** Should modal auto-save on blur, or require explicit "Guardar" button?
   - **Proposal Implication:** Auto-save for better UX (no risk of loss).
   - **Alternative:** Explicit save to prevent accidental modifications.
   - **Recommendation:** Auto-save with visual feedback (e.g., "Guardado" tooltip).
5. **Recovery as Part of Grading:** Should recovery registration happen in this modal, or separate workflow?
   - **Proposal Implication:** Integrated into modal (R5.1, Section 2).
6. **Navigation Between Indicators:** Should there be "Anterior/Siguiente Indicador" buttons for batch grading?
   - **Recommendation:** Optional, include in Phase 1 if time permits; useful for streamlined workflow.

---

## Scenario: Grade Present Students + Record Recovery + Analyze

**Given** teacher opens grading modal for INDICADOR "Resuelve ecuaciones lineales" in class 7A

**When** Section 1 ("Presentes") shows:
  - Juan (no stars yet)
  - María (no stars yet)
  - Carlos (no stars yet)

**And** Section 2 ("Con Deudas Académicas") shows:
  - Ana (Ausente, "Registrar Recuperación" button)

**When** teacher clicks 4 stars for Juan (accepted, auto-saved)

**And** clicks 5 stars for María

**And** clicks 2 stars for Carlos (low performance)

**Then** grades are persisted to database
  - Route map check-state updates to Single Check (Ana still has debt)

**When** teacher clicks "Registrar Recuperación" for Ana

**And** selects "Recuperado"

**And** assigns 3 stars (accepted recovery work)

**Then** Ana is moved to recovered section
  - Route map check-state updates to Double Check (all graded/recovered)

**When** teacher enters observation: "Grupo muestra buena comprensión. Juan y María muy aplicados. Carlos requiere seguimiento personalizado."

**And** clicks "Analizar"

**Then** IA analysis appears:
  - "Análisis: Grupo heterogéneo con fortaleza en conceptos básicos. Recomendación: Trabajar con Carlos en factorización. Juan y María listos para problemas más complejos."
  - **Optional:** "Sugerir Calificaciones" button (only if IA detects lack of grades in observation; in this case, grades already assigned, so button not shown)

**When** teacher clicks "Marcar como Completamente Evaluado"

**Then** modal closes with confirmation
  - Indicator is marked complete in session
  - Route map shows INDICADOR with double-check and "100% evaluado" label (optional)

---

## Scenario: IA Suggests Grades Without Teacher Override

**Given** teacher enters observation: "Juan y María entienden bien, Carlos lucha."

**When** teacher clicks "Analizar" (with NO star ratings assigned yet)

**Then** IA analysis appears:
  - "Según observación: Juan probablemente 4-5 estrellas. María similar. Carlos necesita refuerzo, 2-3 estrellas."
  - **"Sugerir Calificaciones" button is shown** (because observation lacks explicit grades)

**When** teacher clicks button

**Then** UI shows suggestions:
  - Juan: (empty stars) → "Sugerencia: 4 estrellas. [Aceptar] [Ignorar]"
  - María: (empty stars) → "Sugerencia: 4 estrellas. [Aceptar] [Ignorar]"
  - Carlos: (empty stars) → "Sugerencia: 2 estrellas. [Aceptar] [Ignorar]"

**When** teacher clicks "Aceptar" for Juan and María, then "Ignorar" for Carlos (decides to grade Carlos manually at 3)

**Then** Juan and María get 4 stars (auto-assigned from suggestion)
  - Carlos remains unrated (teacher will assign manually)

**When** teacher clicks 3 stars for Carlos

**Then** all students graded
  - Modal is ready to close

---

## Success Criteria (from Proposal)

- Teacher grades students by indicator via specialized modal (estrellas for present, deuda for absent) ✓
- IA analyzes free-text observation without auto-assigning grades ✓
- Free-text observation input + "Analizar" button → IA pedagogical analysis ✓
- Modal with list of presentes (estrellas 1-5) + list of ausentes ("Con Deudas Académicas" clicable → flujo de recuperación) ✓
- Marks indicator as completely evaluated when all (presentes calificados + ausentes recuperados) are resueltos ✓

---

## Notes

- IA "Sugerir Calificaciones" feature is optional/smart: only shown if observation lacks explicit grades
- All star ratings and recovery actions auto-persist to avoid data loss
- Observation + tags are indexed for future search/filtering (Phase 2)
- Performance target: Modal loads in <1 second, IA response in <5 seconds
