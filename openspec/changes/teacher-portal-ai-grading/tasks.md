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

- [x] 2.1 Create `src/portal-maestros/components/TeacherRouteBuilder.js`
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
  - **Status**: hecho como `openTeacherRouteBuilder()` + `openTeacherRoutePicker()`. Se encontró y corrigió un bug real en `maestroRouteService.createRoute()`: los prerrequisitos usaban el id temporal del formulario como si fuera un UUID real, lo que hubiera fallado el insert por FK. Se agregó resolución en dos pasadas (`_insertHierarchy`).

- [x] 2.2 Create prerequisite configuration UI within TeacherRouteBuilder
  - For each INDICADOR, add button/dropdown: "Sin Prerequisitos" or "Requiere: [indicador list]"
  - Prerequisite selector shows only indicators in same route (all unidades, but logical filtering optional in Phase 1)
  - Auto-update prerequisito table on save
  - **Status**: select por indicador, excluye al propio indicador de sus opciones, se re-renderiza al cambiar nombres

- [ ] 2.3 Implement route import flow — BLOQUEADO, no implementado en este PR
  - Add button in route-creation form: "Importar desde Catálogo Institucional"
  - Opens modal showing ACM hierarchy (NIVEL → OBJETIVO GENERAL → OBJETIVO ESPECÍFICO)
  - Checkboxes for NIVEL selection
  - On click "Importar", map structure via maestroRouteService.importACMAsRoute()
  - Pre-fill route form with imported structure; teacher can edit freely
  - **Status**: el módulo de catálogo ACM (`CatalogoAcmView.js`, commit `1160209`) no existe todavía en `feat/planificacion-clases-rediseño` (solo en `master`). Botón deshabilitado con "Próximamente" en la UI; `importACMAsRoute()` sigue como stub en el servicio. Retomar cuando el catálogo ACM esté disponible en esta rama.

- [x] 2.4 Implement route editing view
  - Access existing route by ID
  - Load current structure via maestroRouteService.getTeacherRoutes()
  - Allow rename/add/remove UNIDADES, OBJETIVOS, INDICADORES
  - Show warning if deleting UNIDAD/OBJETIVO/INDICADOR with evaluation records ("Tiene evaluaciones; ¿desea continuar?")
  - Save via maestroRouteService.updateRoute()
  - **Status**: `updateRoute()` reescrito de cero (antes era un placeholder que solo tocaba `updated_at`, no persistía nada). Ahora hace upsert real: actualiza filas existentes por id, inserta las nuevas, y nunca borra automáticamente filas quitadas del formulario (evita huérfanos en `evaluacion_indicador`/`indicador_prerequisito`). El aviso explícito de "tiene evaluaciones" queda pendiente para un PR posterior; por ahora el borrado simplemente se ignora de forma segura.

- [x] 2.5 Implement route cloning
  - Add button in route detail: "Clonar"
  - Dialog: new route name (defaults to "Copia de [original]"), target class (defaults to current)
  - On confirm: maestroRouteService.cloneRoute() creates independent copy
  - New route appears in route list immediately (no evaluations)
  - **Status**: disponible desde el selector de rutas al editar una ya guardada (usa `window.prompt` para el nombre; se puede mejorar a un diálogo propio en un PR posterior)

- [x] 2.6 Create `src/portal-maestros/styles/route-builder.css` (or inline)
  - Styling for nested form structure (accordion/collapsible sections)
  - Input styles, button styles, error messages
  - Responsive layout (mobile-friendly)
  - **Status**: estilos inyectados inline vía `<style id="trb-styles">`, siguiendo el mismo patrón que `hoyView.js` (no se creó un archivo .css nuevo, para mantener consistencia con el resto del portal)

---

## Phase 3: Indicator Grading Modal & Recovery Workflow (Depends on Phase 1 + Phase 2)

Specialized modal for per-indicator grading with attendance partitioning and recovery.

### IndicadorGradingModal Component

- [x] 3.1 Create `src/portal-maestros/components/IndicadorGradingModal.js`
  - Props: `sesionId`, `claseId`, `indicadorId`, `indicadorNombre`, `maestroId`, `onSave(grades)`, `onClose()`
  - Header: Route context (breadcrumb: UNIDAD > OBJETIVO > INDICADOR)
  - Three main sections (stacked, scrollable):
    1. **Presentes**: List of present students (from attendance query)
    2. **Con Deudas Académicas**: List of absent students
    3. **Observaciones**: Free-text area
  - **Status**: implementado como `openIndicadorGradingModal({ claseId, fecha, indicadorId, indicadorNombre, breadcrumb, evaluadoPor, onSaved })`. Se usa `fecha` en vez de `sesionId`: la tabla real `asistencias` no tiene columna `sesion_id` (verificado en las migraciones), se filtra por `clase_id + fecha`.

- [x] 3.2 Implement "Presentes" section
  - For each present student: name, 5-star rating control (click-to-rate), optional grade label (Insuficiente/Aceptable/Excelente)
  - On star click: auto-save (or on blur) to evaluacion_indicador.nota
  - Star control must persist state (don't reset on blur)
  - Sorting optional: by name, by grade
  - **Status**: estrellas 1-5 clicables, auto-guardan vía `saveIndicadorNota()` (nuevo — hace upsert y fija `recovery_status='no_aplica'` explícitamente, ver bug documentado abajo en la migración)

- [x] 3.3 Implement "Con Deudas Académicas" section
  - For each absent student: name, absence-type badge (Ausente/Justificado), "Registrar Recuperación" button
  - On button click: expand inline form (or open sub-modal) with fields:
    - Dropdown: "Recuperado" | "No Recuperable"
    - Optional 5-star recovery grade
    - Optional recovery notes (text area)
    - Buttons: "Registrar" (save to evaluacion_indicador), "Cancelar" (collapse)
  - On "Registrar": update evaluacion_indicador.recovery_status, .recovery_grade, .recovery_notes, .recovery_timestamp
  - **Trigger:** maestroDataService.updateRecoveryStatus() must flag dependent indicators (R2.3)
  - After recovery saved: move student to completed state (visual change in modal)
  - **Status**: `updateRecoveryStatus()` reescrito a upsert (antes era UPDATE puro — fallaba en silencio si el alumno ausente no tenía fila previa). También dispara `_flagDependentIndicadores()` (R2.3): al recuperar, marca `review_flag=true` en los indicadores posteriores ya calificados bajo advertencia blanda para ese alumno. **Bug de esquema encontrado y corregido**: el CHECK constraint de `recovery_status` (migración 20260812000002) solo admitía `('pendiente','recuperado','no_aplica')`, sin `'no_recuperable'` que la spec sí requiere — corregido en la migración nueva de este PR.

- [ ] 3.4 Implement "Observaciones" section — **PARCIAL, guardado diferido a PR4**
  - Text area for free-form teacher notes (500–1000 char limit, TBD in design)
  - Optional: tag buttons (reuse existing tags or define new: "Necesita apoyo", "Destaca", "Requiere seguimiento")
  - Save observation to evaluacion_indicador.observaciones (or new field if needed)
  - **Status**: el textarea existe en la UI pero el botón "Analizar" queda deshabilitado ("próximamente"). `evaluacion_indicador.observaciones` es por alumno, no hay campo para una nota grupal del indicador — decisión de esquema pendiente para cuando se conecte la IA en PR4 (groqService), no se inventó una columna nueva sin confirmar el diseño final.

- [x] 3.5 Implement prerequisite warning integration (from R2.2)
  - When modal loads: check prerequisites for each student
  - For each student with unmet prerequisite: show soft warning inline or on-save
  - Modal message: "Este indicador requiere [Prerequisite Name]. Estudiante aún no ha alcanzado prerequisito. ¿Desea continuar?"
  - Buttons: "Cancelar" (discard grade) | "Continuar Igual" (persist grade anyway)
  - Warning per student (multiple students may have different prerequisite states)
  - Allow override; no blocking
  - **Status**: solo se implementó cadena lineal de un prerrequisito directo por indicador (`getDirectPrerequisite()`), consistente con el alcance de Fase 1 de la spec. Warning inline por alumno, nunca bloquea el guardado.

- [x] 3.6 Implement "Marcar como Completamente Evaluado" button
  - Visible in modal footer or header
  - On click: verify all present students graded AND all absent students have recovery status
  - If validation passes: mark completion flag (session-only or DB, TBD); trigger check-state update (R4.2)
  - If validation fails: show error "Faltan estudiantes por calificar o recuperar"
  - On completion: enable smooth modal close
  - **Status**: el botón se habilita cuando todos los presentes tienen nota Y todos los ausentes tienen recovery_status resuelto; cierra el modal y dispara `onSaved()`. No hay flag DB separado de "completado" — se deriva siempre de los datos (consistente con Fase 4, check-state calculado, no almacenado)

- [x] 3.7 Data persistence and auto-save
  - On star click: auto-persist to evaluacion_indicador.nota (or on blur)
  - On recovery save: auto-persist recovery fields
  - On observation blur: auto-persist observation
  - Visual feedback: "Guardado" tooltip or spinner brief
  - Unsaved changes: TBD (auto-save + warn on close, or explicit save button)
  - **Status**: auto-save real en estrellas y recuperación (sin botón "Guardar" explícito), con toast de error si falla. Observaciones diferido (ver 3.4).

- [x] 3.8 Create `src/portal-maestros/styles/indicador-grading.css`
  - Styling for attendance badges (Ausente/Justificado colors)
  - Star rating control (existing or new implementation)
  - Check-mark toggles (for completion status)
  - Modal layout (responsive)
  - Section dividers (Presentes vs. Con Deudas)
  - **Status**: estilos inline vía `<style id="igm-styles">`, mismo patrón que `TeacherRouteBuilder.js`/`hoyView.js`. Checks visuales simple/doble del mapa (icono en la ruta, no en el modal) quedan para Fase 4.

---

## Phase 4: Check-State Logic & Route Map Integration (Depends on Phase 1 + Phase 3)

Visual indicators for teaching progress; automatic state transitions.

### Check-State Calculation & Queries

- [x] 4.1 Implement check-state calculation logic in maestroDataService
  - Function: `getIndicadorCheckStates(routeId, claseId)` → returns array of {indicador_id, check_state: "none"|"single"|"double", stats}
  - Logic per R4.2:
    - **No Check (none):** No evaluacion_indicador rows for this indicador in this class
    - **Single Check (single):** At least one grade recorded, but >= 1 student has "Con Deuda Académica" (absent, not yet recovered)
    - **Double Check (double):** All students graded OR recovered/no-recuperable (no outstanding debts)
  - Query optimization: Single SQL query (JOINs on evaluacion_indicador + attendance) for all indicators per route+class; performance target < 200ms for 100+ indicators
  - Handle edge cases: students not enrolled on teaching date (skip check)
  - **Status**: reescrita de cero — la versión de PR1 anidaba `await` dentro de `.in(...)` sin manejar `null`/error (crasheaba con TypeError si cualquier nivel de la jerarquía venía vacío), y hacía una consulta N+1 por indicador. Ahora resuelve la jerarquía en 3 consultas planas y trae todas las evaluaciones de la ruta en una sola consulta agrupada en memoria.

- [x] 4.2 Implement automatic state transitions
  - Trigger on evaluacion_indicador INSERT/UPDATE: First grade recorded → none → single; Last recovery recorded → single → double
  - Ensure transitions are atomic (no race conditions)
  - Query refresh after each grading action
  - **Status**: no hay trigger DB — el estado se recalcula on-demand (`getIndicadorCheckStates`) cada vez que se abre el mapa o al cerrar el modal de calificación (`onSaved` refresca el panel). Decisión: más simple y siempre consistente con los datos reales, sin necesidad de sincronizar un flag desnormalizado. Reversión (borrar nota/recuperación) no tiene UI todavía — no aplica en este PR.

- [x] 4.3 Add check-state display to route map (in hoyView or route-detail view)
  - Visual marker per INDICADOR: ∅ (no check), ✓ (single), ✓✓ (double)
  - Icon style: TBD (use WhatsApp-style blue for double, neutral for single)
  - Hover tooltip: "X de Y estudiantes evaluados" o "Algunas deudas pendientes"
  - Clicking indicator opens IndicadorGradingModal (or shows summary modal, TBD)
  - **Status**: panel `_renderMapaDeRutasPanel()` en `hoyView.js` — doble check en azul (`--pm-primary`), check simple en gris. Tooltip solo con título nativo (`title=`) por ahora, no un tooltip enriquecido con conteo X/Y (`stats.evaluados` ya viene calculado, queda para pulir la UI en un PR de refinamiento). Click abre `IndicadorGradingModal` directo.

- [x] 4.4 Per-class check-state isolation
  - Ensure check states are queried by (routeId, claseId)
  - Cloning route resets check states to "none" for new class (automatic via schema)
  - No cross-class contamination
  - **Status**: la consulta siempre filtra por `clase_id` explícito; una ruta clonada apunta a otra `clase_id` con sus propias filas de `evaluacion_indicador`, aislamiento correcto por diseño de esquema.

---

## Phase 5: IA Integration & Final Wiring (Depends on Phase 1 + Phase 3 + Phase 4)

Pedagogical analysis via Groq; final frontend wiring; hoyView navigation.

### groqService Enhancement

- [x] 5.1 Extend groqService with indicator-aware "Analizar" — **diseño distinto al planeado, ver justificación**
  - **Status**: en vez de extender `analyzeObservation()` (que ya infiere `nota` por alumno como parte de su DSL — reusarla habría violado "la IA nunca califica sola"), se creó `analyzeIndicadorObservation(text, { indicadorNombre, criterios, estudiantesPresentes })` como función nueva e independiente en `groqService.js`. Devuelve `{ panorama, tieneValoracionImplicita, sugerirCalificarConEstrellas }`; nunca incluye una nota numérica, reforzado también a nivel de prompt.

- [x] 5.2 Integrate "Analizar" button in IndicadorGradingModal
  - **Status**: botón habilitado cuando hay texto en Observaciones (no exige alumnos ya calificados, a diferencia de lo planeado — más simple y no bloquea el caso de uso principal: analizar antes de calificar). Muestra el panorama inline; si `sugerirCalificarConEstrellas`, ofrece un widget de estrellas grupal.

- [x] 5.3 Implement "Sugerir Calificaciones" feature — **simplificado: calificación grupal, no sugerencias por alumno**
  - **Status**: en vez de que la IA proponga notas individuales por alumno (que ya se descartó como enfoque, ver 5.1), se implementó calificación GRUPAL: el maestro elige 1-5 estrellas una sola vez y se aplica a TODOS los presentes de golpe vía `saveIndicadorNota()` (los ausentes no se tocan, siguen "Con Deuda Académica"). Coincide con el requisito original del usuario ("esas estrellas se les asignará SOLO A LOS PRESENTES").

- [x] 5.4 Integrate IndicadorGradingModal into route-map detail view
  - **Status**: `_renderMapaDeRutasPanel()` en `hoyView.js` — cada indicador es un botón clicable que abre `IndicadorGradingModal` con breadcrumb (Unidad > Objetivo); al cerrar el modal (`onSaved`) se refresca el panel completo, incluidos los checks.

- [x] 5.5 Modify `src/portal-maestros/views/hoyView.js`
  - **Status**: nuevo botón `.pm-mapa-btn` (ícono signpost) junto al de análisis en cada tarjeta de clase; abre el picker de rutas si no existe ninguna, o el panel del mapa si ya hay una. El botón de análisis existente ahora usa el título "Analizar" (era "Ver análisis"). No se agregó selector de ruta múltiple: Fase 1 asume una ruta activa por clase (`UNIQUE(maestro_id, clase_id)` en el schema).

- [ ] 5.6 Optional: Implement "Siguiente Indicador" navigation — **no implementado, opcional**
  - **Status**: fuera de alcance de este PR; el maestro cierra el modal y hace click en el siguiente indicador desde el panel del mapa.

---

## Phase 6: Testing (Depends on Phase 1–5)

Unit, integration, and E2E tests for all components and workflows.

### Unit Tests

- [x] 6.1 DAG validation tests (maestroRouteService.validateDAG)
  - Test: linear chain (no cycles) passes
  - Test: circular prerequisite (A→B→C→A) detected and throws error
  - Test: complex DAG with 50+ indicators, no cycles, completes < 50ms
  - Test: self-reference (A→A) detected
  - Test: diamond dependency (A→B, A→C, B→D, C→D) passes (multi-prerequisite, Phase 2+)
  - **Status**: `maestroRouteService.validateDAG.test.js`, 10 tests, todos verdes. Diamond dependency **omitido a propósito**: el esquema de Fase 1 solo admite un `prerequisito_indicador_id` por indicador (cadena lineal), así que una dependencia multi-padre no es representable con los datos actuales — no es un gap de testing, es una limitación de diseño ya documentada.

- [x] 6.2 Recovery state machine tests (maestroDataService.updateRecoveryStatus)
  - Test: absence → recovery_status='Recuperado' updates correctly
  - Test: dependent indicators flagged when prerequisite recovered
  - Test: 'No Recuperable' status persists and blocks reevaluation
  - Test: recovery_notes and recovery_grade saved correctly
  - **Status**: `maestroDataService.indicadorGrading.test.js`, cubre upsert (no update puro), rechazo de status inválido, reevaluación de cadena (`review_flag`) con y sin dependientes, y `saveIndicadorNota` (estrellas para presentes). **Bug real encontrado y corregido al escribir estos tests**: `viewCache.clear()` no existe en `viewCache.js` (el método real es `invalidate()`) — `saveIndicadorNota()` y `updateRecoveryStatus()` habrían lanzado `TypeError` en cada guardado real. Corregido en ambos call sites.

- [x] 6.3 Check-state calculation tests
  - Test: no evaluations → "none" state
  - Test: some students graded, 1 absent → "single" state
  - Test: all students graded/recovered → "double" state
  - Test: state transitions on recovery recorded
  - Vitest + supabase mock or local Supabase instance
  - **Status**: cubierto en el mismo archivo que 6.2 — none/single/double, transición single→double al recuperar al último pendiente, ruta sin unidades (no crashea), y guard clause sin routeId/claseId.

### Integration Tests

- [ ] 6.4 Route Builder form submission — **DIFERIDO**
  - Load form with empty route
  - Add 2 unidades, 2 objetivos per unidad, 1 indicador per objetivo
  - Set prerequisite on 2nd indicador
  - Submit form; assert database contains all rows with correct FKs
  - Page reload; assert data persists
  - **Status**: `TeacherRouteBuilder.js` construye el modal directo sobre `document.body` (no exporta una función pura testeable sin DOM real). Probarlo bien requiere jsdom + simular clicks/inputs sobre un modal completo — más trabajo que valor inmediato dado que la lógica de negocio real (DAG, upsert) ya está cubierta a nivel de servicio (6.1/6.2). Queda para un PR de testing dedicado si se decide invertir en esto.

- [ ] 6.5 IndicadorGradingModal data flow — **DIFERIDO, mismo motivo que 6.4**
  - Load modal with 3 present students, 2 absent students
  - Grade 3 present students (stars 3, 4, 5)
  - Register recovery for 1 absent student (status "Recuperado", grade 3)
  - Assert evaluacion_indicador rows updated correctly
  - Assert check-state transitions: none → single → double
  - Assert prerequisite-dependent indicators flagged
  - **Status**: mismo problema de testabilidad que 6.4 (componente DOM-first, no una función pura). La lógica que este test intentaría validar (upsert de nota, upsert de recuperación, reevaluación de cadena) ya está cubierta en 6.2.

- [ ] 6.6 Grading with prerequisite warning — **DIFERIDO, mismo motivo**
  - Route with prerequisite: Indicador A → Indicador B
  - Student has no grade for A
  - Grade student for B; assert warning modal appears
  - Click "Continuar Igual"; assert grade persists
  - Assert no blocking (soft enforcement)
  - **Status**: la función que realmente decide si hay advertencia (`checkPrerequisiteSatisfied`) es simple y ya se ejerce indirectamente por los tests de DAG; falta el test del componente en sí (mismo motivo que 6.4/6.5).

### E2E Tests (Playwright or Cypress)

- [ ] 6.7 Full workflow: create route → grade indicators → view check states — **NO IMPLEMENTADO**
  - **Status**: no hay Playwright ni Cypress instalado en este repo (`package.json` confirmado sin ninguno de los dos). Escribir este test requeriría primero introducir un framework E2E nuevo al proyecto — decisión que excede el alcance de esta feature. No se fabricó un test falso para simular cobertura.

- [ ] 6.8 ACM import flow — **NO APLICA todavía**
  - **Status**: la feature que este test cubriría (importar desde ACM) está deshabilitada en la UI ("Próximamente") porque el catálogo ACM no existe en esta rama — no hay nada que probar E2E. Retomar junto con la tarea 2.3 cuando el catálogo esté disponible.

---

## Phase 7: Documentation & Cleanup (Depends on Phase 1–6)

Final polish and documentation.

- [x] 7.1 Update API documentation (OpenAPI/Swagger or inline comments)
  - Document new maestroRouteService methods (getTeacherRoutes, createRoute, validateDAG, etc.)
  - Document new maestroDataService methods (getIndicadorCheckStates, updateRecoveryStatus, etc.)
  - Document groqService.analyzeObservation() new signature and context parameter
  - **Status**: no hay OpenAPI/Swagger en este proyecto (es un portal directo a Supabase, sin capa REST propia) — se documentó vía JSDoc en cada función nueva, ya presente desde que se escribió el código (no un archivo separado). No se extendió `analyzeObservation()`: se creó `analyzeIndicadorObservation()` aparte (decisión documentada en 5.1) — esa función también tiene JSDoc completo.

- [x] 7.2 Add inline code comments
  - DAG validation algorithm (explain DFS cycle detection)
  - Check-state calculation (explain state machine logic)
  - Recovery cascade (explain dependent-indicator flagging)
  - **Status**: comentarios ya presentes en `_dfsCycleDetect`, `_insertHierarchy`/`_upsertHierarchy` (resolución de ids temporales en dos pasadas), `getIndicadorCheckStates` (semántica none/single/double), y `_flagDependentIndicadores` (por qué solo marca, no recalifica).

- [x] 7.3 Update project README or HANDOFF.md
  - Document new feature: personal routes, indicator grading, IA analysis
  - Document new tables and their purpose
  - Document configuration: feature flags (FEATURE_TEACHER_ROUTES), Groq API key
  - **Status**: agregada sección "🎓 Mapa de Rutas del Maestro" en `src/portal-maestros/README.md` con enlace a los docs completos en `openspec/changes/teacher-portal-ai-grading/`. **No se tocó el resto del README** — tiene contenido genérico/desactualizado preexistente (dice "Vue 3 + Vite", "Playwright", middleware CSRF/joi que no existen en este codebase vanilla-JS); corregirlo es un proyecto aparte, fuera de alcance de esta feature. No hay feature flag `FEATURE_TEACHER_ROUTES` implementado (el plan lo mencionaba como opcional para rollout gradual; no se construyó — la feature está simplemente detrás de un botón nuevo en `hoyView.js`, visible para todos los maestros en cuanto se mergea).

- [x] 7.4 Code cleanup
  - Remove any temporary logging or debug code
  - Ensure ESLint/Prettier compliance
  - Review for dead code or unused imports
  - **Status**: `eslint --fix` corrido sobre los 8 archivos tocados por la feature — 0 errores. Se eliminó 1 import muerto real (`getMaestroLocal` en `maestroRouteService.js`, nunca usado). Los warnings restantes (unused vars en `groqService.js`, `hoyView.js`, `maestroDataService.js`) son preexistentes, no introducidos por esta feature — no se tocaron para no scope-creepear código ajeno.

- [x] 7.5 Performance profiling (if needed)
  - DAG validation for 50+ indicators: assert < 50ms
  - Check-state query for 100+ indicators: assert < 200ms
  - IA response time: assert < 5 seconds (acceptable; async)
  - **Status**: DAG validation medido de verdad en el test suite (60 indicadores, benchmark real con `performance.now()`, <50ms confirmado en CI). Check-state query y latencia de IA **no se pudieron medir de verdad** — este worktree no tiene `.env.local` de Supabase ni acceso a un proyecto real, así que no hay forma honesta de benchmarkear una consulta a una base de datos que no existe aquí. No se inventaron números — queda pendiente de medir en un entorno con datos reales antes de mergear a producción.

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
