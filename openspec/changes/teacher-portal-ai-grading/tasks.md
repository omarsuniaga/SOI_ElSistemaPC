# Tasks: Teacher Portal — AI-Assisted Grading & Personal Route Maps

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3500–4200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (schema + services) → PR 2 (route builder) → PR 3 (grading modal) → PR 4 (IA integration + tests) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

**Decision needed before apply: Yes**

**Chained PRs recommended: Yes**

**Chain strategy: pending** (awaiting user choice: stacked-to-main vs feature-branch-chain)

**400-line budget risk: High**

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Database schema (5 migrations) + base services | PR 1 | Foundation; no UI yet. Safe to merge early. Base: master |
| 2 | TeacherRouteBuilder component + maestroRouteService full implementation | PR 2 | Route CRUD + DAG validation. Depends on PR 1. Base: PR 1 or master+PR1 |
| 3 | IndicadorGradingModal + recovery workflow + check-state logic | PR 3 | Core grading UX. Depends on PR 1 + PR 2. Base: PR 2 or feature branch |
| 4 | groqService extension + hoyView wiring + tests + CSS | PR 4 | IA integration, final wiring, comprehensive testing. Depends on PR 1–3. Base: PR 3 or feature branch |

---

## Phase 1: Foundation — Database & Core Services (Sequential)

Core data layer for route scaffolding, recovery tracking, and DAG validation. All downstream tasks depend on this.

### Migrations

- [x] 1.1 Create migration `supabase/migrations/20260812000001_maestro_routes_schema.sql`
  - Tables: `maestro_routes` (id, maestro_id, clase_id, nombre, descripcion, timestamps), `maestro_unidades` (id, ruta_id, orden, nombre, descripcion), `maestro_objetivos` (id, unidad_id, orden, nombre, descripcion), `maestro_indicadores` (id, objetivo_id, orden, nombre, criterios_json), `indicador_prerequisito` (id, indicador_id, prerequisito_indicador_id, timestamp)
  - Indices: (ruta_id, orden), (unidad_id, orden), (objetivo_id, orden), (maestro_id, clase_id)
  - RLS policies: teachers read/write own routes only
  - No data loss on rollback (empty tables)
  - **Status**: ✓ Created with full hierarchy, RLS policies, cascade delete, timestamps

- [x] 1.2 Create migration `supabase/migrations/20260812000002_evaluacion_indicador_recovery_status.sql`
  - Alter `evaluacion_indicador` table
  - Add columns: `recovery_status` (enum: 'pendiente'|'recuperado'|'no_aplica', default 'pendiente'), `recovery_notes` (text, optional), `recovery_timestamp` (timestamptz, optional), `recovery_grade` (int 1-5, optional)
  - Add CHECK constraint: recovery_status IN ('pendiente', 'recuperado', 'no_aplica')
  - Index: (maestro_id, clase_id) for maestro_routes uniqueness
  - Safe: All existing rows default to 'pendiente'; no evaluation data affected
  - **Status**: ✓ Created with safe ALTER TABLE, non-destructive defaults, indices

### Core Services

- [x] 1.3 Create `src/portal-maestros/services/maestroRouteService.js`
  - CRUD operations: `getTeacherRoutes(maestroId, claseId)`, `createRoute(maestroId, claseId, nombre, unidades)`, `updateRoute(routeId, unidades)`, `deleteRoute(routeId)`, `cloneRoute(routeId, newNombre, targetClaseId)`
  - DAG validation: `validateDAG(unidades)` — cycle detection via DFS in JS; throw error if cycle found
  - Prerequisite fetching: `getRoutePrerequisites(routeId)` — returns full prerequisite graph as adjacency list
  - Prerequisite satisfaction: `checkPrerequisiteSatisfied(indicadorId, alumnoId, claseId)` — queries evaluacion_indicador for prerequisite grades
  - Import ACM: `importACMAsRoute(maestroId, claseId, nivelesSeleccionados)` — maps NIVEL→UNIDAD, OBJETIVO GENERAL→OBJETIVO, OBJETIVO ESPECÍFICO→INDICADOR
  - All methods return Promises; handle Supabase errors
  - **Status**: ✓ Created with full CRUD, DAG DFS validation, prerequisite checks, ACM import stub (Phase 2)

- [x] 1.4 Create `src/portal-maestros/services/maestroDataService.js` extension (or new file for indicator-specific queries)
  - Add methods: `getTeacherRoutes(maestroId, claseId)`, `getRoutePrerequisites(routeId)`, `getRecoverySessions(claseId)`, `getIndicadorCheckStates(routeId, claseId)` (query helper for R4.1–R4.4)
  - Attendance queries: `getAttendanceForClass(claseId, sesionId)` — partitions students (present vs absent)
  - Evaluation queries: `getIndicadorEvaluations(indicadorId, claseId)` — returns all evaluacion_indicador rows; used for check-state calculation
  - Recovery state machine: `updateRecoveryStatus(alumnoId, indicadorId, claseId, status, notes, grade)` — atomic update; triggers dependent-indicator flagging
  - **Status**: ✓ Extended with 7 new methods (getPersonalRoutes, getRoutePrerequisites, getRecoverySessions, getIndicadorCheckStates, updateRecoveryStatus, getAttendanceForClass, getIndicadorEvaluations)

- [x] 1.5 Implement DAG validation function in maestroRouteService
  - Reference: Design decision R2.2 (in-memory JS cache)
  - Function: `validateDAG(unidades)` — build adjacency list from indicador_prerequisito data; run DFS to detect cycles
  - Performance target: < 50ms for 50+ indicators
  - Error handling: throw descriptive error if cycle detected ("Prerequisito circular detectado entre indicadores X e Y")
  - **Status**: ✓ Implemented as `validateDAG()` with DFS cycle detection and descriptive error messages

---

## Phase 2: Route Builder & Route Management (Depends on Phase 1)

Form-based CRUD for routes; UI to create/edit/clone and import ACM templates.

### TeacherRouteBuilder Component

- [ ] 2.1 Create `src/portal-maestros/components/TeacherRouteBuilder.js`
  - Props: `maestroId`, `claseId`, `onSave(ruta)`, `onClose()`
  - Form structure:
    - Route name input (text)
    - Accordion/expandable for each UNIDAD (rows, add/remove)
    - For each UNIDAD: nested accordion for OBJETIVOS (rows, add/remove)
    - For each OBJETIVO: nested section for INDICADORES (rows, add/remove)
  - Row inputs: name (required), description (optional), order (auto-assigned or manual)
  - Prerequisite dropdown per INDICADOR: selector for another INDICADOR in same route (optional)
  - Action buttons: "Guardar" (validates DAG, calls maestroRouteService.createRoute), "Cancelar" (close without save)
  - Error display: if DAG validation fails, show error modal and block save

- [ ] 2.2 Create prerequisite configuration UI within TeacherRouteBuilder
  - For each INDICADOR, add button/dropdown: "Sin Prerequisitos" or "Requiere: [indicador list]"
  - Prerequisite selector shows only indicators in same route (all unidades, but logical filtering optional in Phase 1)
  - Auto-update prerequisito table on save

- [ ] 2.3 Implement route import flow
  - Add button in route-creation form: "Importar desde Catálogo Institucional"
  - Opens modal showing ACM hierarchy (NIVEL → OBJETIVO GENERAL → OBJETIVO ESPECÍFICO)
  - Checkboxes for NIVEL selection
  - On click "Importar", map structure via maestroRouteService.importACMAsRoute()
  - Pre-fill route form with imported structure; teacher can edit freely

- [ ] 2.4 Implement route editing view
  - Access existing route by ID
  - Load current structure via maestroRouteService.getTeacherRoutes()
  - Allow rename/add/remove UNIDADES, OBJETIVOS, INDICADORES
  - Show warning if deleting UNIDAD/OBJETIVO/INDICADOR with evaluation records ("Tiene evaluaciones; ¿desea continuar?")
  - Save via maestroRouteService.updateRoute()

- [ ] 2.5 Implement route cloning
  - Add button in route detail: "Clonar"
  - Dialog: new route name (defaults to "Copia de [original]"), target class (defaults to current)
  - On confirm: maestroRouteService.cloneRoute() creates independent copy
  - New route appears in route list immediately (no evaluations)

- [ ] 2.6 Create `src/portal-maestros/styles/route-builder.css` (or inline)
  - Styling for nested form structure (accordion/collapsible sections)
  - Input styles, button styles, error messages
  - Responsive layout (mobile-friendly)

---

## Phase 3: Indicator Grading Modal & Recovery Workflow (Depends on Phase 1 + Phase 2)

Specialized modal for per-indicator grading with attendance partitioning and recovery.

### IndicadorGradingModal Component

- [ ] 3.1 Create `src/portal-maestros/components/IndicadorGradingModal.js`
  - Props: `sesionId`, `claseId`, `indicadorId`, `indicadorNombre`, `maestroId`, `onSave(grades)`, `onClose()`
  - Header: Route context (breadcrumb: UNIDAD > OBJETIVO > INDICADOR)
  - Three main sections (stacked, scrollable):
    1. **Presentes**: List of present students (from attendance query)
    2. **Con Deudas Académicas**: List of absent students
    3. **Observaciones**: Free-text area

- [ ] 3.2 Implement "Presentes" section
  - For each present student: name, 5-star rating control (click-to-rate), optional grade label (Insuficiente/Aceptable/Excelente)
  - On star click: auto-save (or on blur) to evaluacion_indicador.nota
  - Star control must persist state (don't reset on blur)
  - Sorting optional: by name, by grade

- [ ] 3.3 Implement "Con Deudas Académicas" section
  - For each absent student: name, absence-type badge (Ausente/Justificado), "Registrar Recuperación" button
  - On button click: expand inline form (or open sub-modal) with fields:
    - Dropdown: "Recuperado" | "No Recuperable"
    - Optional 5-star recovery grade
    - Optional recovery notes (text area)
    - Buttons: "Registrar" (save to evaluacion_indicador), "Cancelar" (collapse)
  - On "Registrar": update evaluacion_indicador.recovery_status, .recovery_grade, .recovery_notes, .recovery_timestamp
  - **Trigger:** maestroDataService.updateRecoveryStatus() must flag dependent indicators (R2.3)
  - After recovery saved: move student to completed state (visual change in modal)

- [ ] 3.4 Implement "Observaciones" section
  - Text area for free-form teacher notes (500–1000 char limit, TBD in design)
  - Optional: tag buttons (reuse existing tags or define new: "Necesita apoyo", "Destaca", "Requiere seguimiento")
  - Save observation to evaluacion_indicador.observaciones (or new field if needed)

- [ ] 3.5 Implement prerequisite warning integration (from R2.2)
  - When modal loads: check prerequisites for each student
  - For each student with unmet prerequisite: show soft warning inline or on-save
  - Modal message: "Este indicador requiere [Prerequisite Name]. Estudiante aún no ha alcanzado prerequisito. ¿Desea continuar?"
  - Buttons: "Cancelar" (discard grade) | "Continuar Igual" (persist grade anyway)
  - Warning per student (multiple students may have different prerequisite states)
  - Allow override; no blocking

- [ ] 3.6 Implement "Marcar como Completamente Evaluado" button
  - Visible in modal footer or header
  - On click: verify all present students graded AND all absent students have recovery status
  - If validation passes: mark completion flag (session-only or DB, TBD); trigger check-state update (R4.2)
  - If validation fails: show error "Faltan estudiantes por calificar o recuperar"
  - On completion: enable smooth modal close

- [ ] 3.7 Data persistence and auto-save
  - On star click: auto-persist to evaluacion_indicador.nota (or on blur)
  - On recovery save: auto-persist recovery fields
  - On observation blur: auto-persist observation
  - Visual feedback: "Guardado" tooltip or spinner brief
  - Unsaved changes: TBD (auto-save + warn on close, or explicit save button)

- [ ] 3.8 Create `src/portal-maestros/styles/indicador-grading.css`
  - Styling for attendance badges (Ausente/Justificado colors)
  - Star rating control (existing or new implementation)
  - Check-mark toggles (for completion status)
  - Modal layout (responsive)
  - Section dividers (Presentes vs. Con Deudas)

---

## Phase 4: Check-State Logic & Route Map Integration (Depends on Phase 1 + Phase 3)

Visual indicators for teaching progress; automatic state transitions.

### Check-State Calculation & Queries

- [ ] 4.1 Implement check-state calculation logic in maestroDataService
  - Function: `getIndicadorCheckStates(routeId, claseId)` → returns array of {indicador_id, check_state: "none"|"single"|"double", stats}
  - Logic per R4.2:
    - **No Check (none):** No evaluacion_indicador rows for this indicador in this class
    - **Single Check (single):** At least one grade recorded, but >= 1 student has "Con Deuda Académica" (absent, not yet recovered)
    - **Double Check (double):** All students graded OR recovered/no-recuperable (no outstanding debts)
  - Query optimization: Single SQL query (JOINs on evaluacion_indicador + attendance) for all indicators per route+class; performance target < 200ms for 100+ indicators
  - Handle edge cases: students not enrolled on teaching date (skip check)

- [ ] 4.2 Implement automatic state transitions
  - Trigger on evaluacion_indicador INSERT/UPDATE:
    - First grade recorded → none → single
    - Last recovery recorded → single → double (if all debts resolved)
    - Grade/recovery deleted → reverse transitions (edge case, TBD if allowed)
  - Ensure transitions are atomic (no race conditions)
  - Query refresh after each grading action

- [ ] 4.3 Add check-state display to route map (in hoyView or route-detail view)
  - Visual marker per INDICADOR: ∅ (no check), ✓ (single), ✓✓ (double)
  - Icon style: TBD (use WhatsApp-style blue for double, neutral for single)
  - Hover tooltip: "X de Y estudiantes evaluados" or "Algunas deudas pendientes"
  - Clicking indicator opens IndicadorGradingModal (or shows summary modal, TBD)

- [ ] 4.4 Per-class check-state isolation
  - Ensure check states are queried by (routeId, claseId)
  - Cloning route resets check states to "none" for new class (automatic via schema)
  - No cross-class contamination

---

## Phase 5: IA Integration & Final Wiring (Depends on Phase 1 + Phase 3 + Phase 4)

Pedagogical analysis via Groq; final frontend wiring; hoyView navigation.

### groqService Enhancement

- [ ] 5.1 Extend groqService.analyzeObservation() signature
  - Before: `analyzeObservation(observation: string) → AnalysisResult`
  - After: `analyzeObservation(observation: string, context?: {indicadorId, indicadorNombre, criterios, estudiantesNombres}) → AnalysisResult`
  - Default behavior (no context): existing behavior
  - With context: inject indicator info into Groq prompt:
    ```
    "Tu tarea es analizar una observación de clase para el indicador '{indicadorNombre}'.
     Criterios: {criterios}
     Estudiantes presentes: {estudiantesNombres}
     
     Proporciona retroalimentación pedagógica, SIN asignar calificaciones automáticas."
    ```
  - Response: pedagogical analysis (improvements, misconceptions, next steps), NOT auto-grades
  - Optional: detect if observation lacks explicit grades; if so, include "Sugerir Calificaciones" flag in response

- [ ] 5.2 Integrate "Analizar" button in IndicadorGradingModal
  - Button location: bottom of modal or in Observaciones section
  - Enabled only when: observation text entered (>0 chars) AND at least 1 student graded/recovered
  - On click: gather context (indicator name, criteria, student names, attendance) and call analyzeObservation()
  - Display response in expandable panel (read-only analysis text)
  - Optional: show "Sugerir Calificaciones" button if IA flags lack of grades
  - Performance target: IA response < 5 seconds
  - Error handling: show error toast if Groq call fails; "Analizar" button remains available to retry

- [ ] 5.3 Implement "Sugerir Calificaciones" feature
  - Only shown if IA analysis detects observation lacks explicit per-student grades
  - On click: parse IA suggestions (e.g., "Juan: 4 estrellas", "María: 5 estrellas")
  - Display suggestions inline: "Juan: (empty stars) Sugerencia: 4 estrellas [Aceptar] [Ignorar]"
  - Teacher clicks [Aceptar] to apply suggestion, [Ignorar] to skip
  - No auto-assignment; teacher always in control
  - Visual feedback: applied suggestions highlight with checkmark

- [ ] 5.4 Integrate IndicadorGradingModal into route-map detail view
  - Add "Calificar" or "Grading" button next to each indicator in route map
  - On click: open IndicadorGradingModal with indicator context
  - Pass correct props: sesionId (from route context), claseId, indicadorId, indicadorNombre, maestroId
  - On modal close: refresh route map (re-fetch check states)

- [ ] 5.5 Modify `src/portal-maestros/views/hoyView.js`
  - Rename button/action "Ver análisis" → "Analizar" (if exists)
  - Add data attribute: data-ruta-id (to link indicator grades to specific route)
  - Integrate with TeacherRouteBuilder (if not a separate view)
  - Ensure route selector/dropdown visible for teacher to choose which route to grade

- [ ] 5.6 Optional: Implement "Siguiente Indicador" navigation
  - Add button in IndicadorGradingModal: "Siguiente Indicador" (or arrow button)
  - On click: find next ungraded indicator in same route and open modal for it
  - Enable batch grading workflow (streamlined for fast grading sessions)

---

## Phase 6: Testing (Depends on Phase 1–5)

Unit, integration, and E2E tests for all components and workflows.

### Unit Tests

- [ ] 6.1 DAG validation tests (maestroRouteService.validateDAG)
  - Test: linear chain (no cycles) passes
  - Test: circular prerequisite (A→B→C→A) detected and throws error
  - Test: complex DAG with 50+ indicators, no cycles, completes < 50ms
  - Test: self-reference (A→A) detected
  - Test: diamond dependency (A→B, A→C, B→D, C→D) passes (multi-prerequisite, Phase 2+)

- [ ] 6.2 Recovery state machine tests (maestroDataService.updateRecoveryStatus)
  - Test: absence → recovery_status='Recuperado' updates correctly
  - Test: dependent indicators flagged when prerequisite recovered
  - Test: 'No Recuperable' status persists and blocks reevaluation
  - Test: recovery_notes and recovery_grade saved correctly

- [ ] 6.3 Check-state calculation tests
  - Test: no evaluations → "none" state
  - Test: some students graded, 1 absent → "single" state
  - Test: all students graded/recovered → "double" state
  - Test: state transitions on recovery recorded
  - Vitest + supabase mock or local Supabase instance

### Integration Tests

- [ ] 6.4 Route Builder form submission
  - Load form with empty route
  - Add 2 unidades, 2 objetivos per unidad, 1 indicador per objetivo
  - Set prerequisite on 2nd indicador
  - Submit form; assert database contains all rows with correct FKs
  - Page reload; assert data persists

- [ ] 6.5 IndicadorGradingModal data flow
  - Load modal with 3 present students, 2 absent students
  - Grade 3 present students (stars 3, 4, 5)
  - Register recovery for 1 absent student (status "Recuperado", grade 3)
  - Assert evaluacion_indicador rows updated correctly
  - Assert check-state transitions: none → single → double
  - Assert prerequisite-dependent indicators flagged

- [ ] 6.6 Grading with prerequisite warning
  - Route with prerequisite: Indicador A → Indicador B
  - Student has no grade for A
  - Grade student for B; assert warning modal appears
  - Click "Continuar Igual"; assert grade persists
  - Assert no blocking (soft enforcement)

### E2E Tests (Playwright or Cypress)

- [ ] 6.7 Full workflow: create route → grade indicators → view check states
  - Teacher logs in
  - Creates route "Algebra 2026" with 2 unidades, 3 objetivos, 5 indicadores
  - Sets prerequisite: Indicador E requires C
  - Opens grading modal for Indicador A (present students)
  - Grades 3 students (stars 4, 3, 5)
  - Registers recovery for 1 absent student
  - Asserts route map shows ✓ (single check) for Indicador A
  - Grades Indicador C
  - Grades Indicador E; prerequisite warning appears; clicks "Continuar Igual"
  - Marks Indicador C as recovered for student
  - Asserts Indicador E flagged for reevaluation (visual indicator TBD)
  - Re-grades Indicador E for that student
  - Asserts check-state progression (∅ → ✓ → ✓✓)

- [ ] 6.8 ACM import flow
  - Navigate to "Nueva Ruta"
  - Click "Importar desde Catálogo Institucional"
  - Select NIVEL "Comprensión Lectora"
  - Click "Importar"
  - Asserts route populated with OBJETIVO GENERAL and OBJETIVO ESPECÍFICO hierarchies
  - Edit route (rename one indicador)
  - Save and reload
  - Asserts edit persists; no sync back to ACM

---

## Phase 7: Documentation & Cleanup (Depends on Phase 1–6)

Final polish and documentation.

- [ ] 7.1 Update API documentation (OpenAPI/Swagger or inline comments)
  - Document new maestroRouteService methods (getTeacherRoutes, createRoute, validateDAG, etc.)
  - Document new maestroDataService methods (getIndicadorCheckStates, updateRecoveryStatus, etc.)
  - Document groqService.analyzeObservation() new signature and context parameter

- [ ] 7.2 Add inline code comments
  - DAG validation algorithm (explain DFS cycle detection)
  - Check-state calculation (explain state machine logic)
  - Recovery cascade (explain dependent-indicator flagging)

- [ ] 7.3 Update project README or HANDOFF.md
  - Document new feature: personal routes, indicator grading, IA analysis
  - Document new tables and their purpose
  - Document configuration: feature flags (FEATURE_TEACHER_ROUTES), Groq API key

- [ ] 7.4 Code cleanup
  - Remove any temporary logging or debug code
  - Ensure ESLint/Prettier compliance
  - Review for dead code or unused imports

- [ ] 7.5 Performance profiling (if needed)
  - DAG validation for 50+ indicators: assert < 50ms
  - Check-state query for 100+ indicators: assert < 200ms
  - IA response time: assert < 5 seconds (acceptable; async)

---

## Notes on Dependency Order

**Sequential Critical Path:**
1. Phase 1 (Migrations + Services) — **must complete first**; blocks all subsequent phases
2. Phase 2 (TeacherRouteBuilder) — depends on Phase 1 (maestroRouteService, DAG validation)
3. Phase 3 (IndicadorGradingModal) — depends on Phase 1 (recovery_status schema) + Phase 2 (route structure)
4. Phase 4 (Check-State Logic) — depends on Phase 1 (queries) + Phase 3 (grading updates)
5. Phase 5 (IA Integration) — depends on Phase 3 (modal) + groqService modifications
6. Phase 6 (Testing) — can run in parallel with Phase 5 (writing tests as features complete)
7. Phase 7 (Documentation) — final; after all features complete

**Parallelizable Tasks (within phases):**
- Phase 1: All migrations can run in sequence (no parallelism due to SQL ordering)
- Phase 1: maestroRouteService and maestroDataService can be written in parallel (no dependency)
- Phase 2: Route editing and cloning UIs can be written in parallel (both depend only on maestroRouteService)
- Phase 6: Unit and integration tests can run in parallel (different test files)

**PR Slicing Strategy (for ask-on-risk / chained PRs):**
- **PR 1 (Schema + Services):** All migrations + maestroRouteService + maestroDataService. ~1000 lines. Safe standalone (no UI). Base: master
- **PR 2 (Route Builder):** TeacherRouteBuilder component + route CSS + integration with hoyView selector. ~700 lines. Depends on PR 1. Base: master+PR1
- **PR 3 (Grading Modal):** IndicadorGradingModal + recovery workflow + check-state display + CSS. ~900 lines. Depends on PR 1+2. Base: master+PR1+PR2 or feature branch
- **PR 4 (IA + Tests):** groqService enhancement + "Analizar" button integration + full test suite + documentation. ~1200 lines. Depends on PR 1–3. Base: master+PR1+PR2+PR3 or feature branch
