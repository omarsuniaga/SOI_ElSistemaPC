# Design: Teacher Portal — AI-Assisted Grading & Personal Route Maps

## Technical Approach

This design enables teachers to create personal lesson-planning routes (UNIDADES → OBJETIVOS → INDICADORES), grade students per indicator with attendance awareness, and leverage AI for pedagogical analysis without auto-grading. The system models three layers: **(1) Route scaffolding** (teacher-defined hierarchies), **(2) Attendance-driven grading** (presence/absence/recovery state), and **(3) Prerequisite chains** (soft enforcement with reevaluation on recovery).

The architecture reuses existing infrastructure (IA service via Groq, `evaluacion_indicador` table, attendance tracking) and introduces five new tables to normalize the route-and-recovery model. Frontend components are form-based (no drag-drop in Phase 1) with tight coupling to indicator-aware attendance state.

---

## Architecture Decisions

### Decision 1: Normalized Tables vs. JSON Payload for Route Structure

| Aspect | Normalized Tables | JSON Payload (single `maestro_routes.estructura`) |
|---|---|---|
| Schema clarity | Each hierarchy level (UNIDADES, OBJETIVOS, INDICADORES) has its own table with FKs | Single JSONB column; structure inferred at runtime |
| Query complexity | Simple `JOIN`s; prerequisite validation straightforward | Complex JSON traversal; aggregations harder |
| Extensibility | Adding fields per level (e.g., competency tags) is natural | Requires schema migration or dynamic key naming |
| Indexing | Can index on (maestro_id, unidad_id, etc.) | Limited; only top-level keys |
| Performance | 4-table `JOIN` for full route retrieval (~5ms per route) | 1 table scan + JS parsing (~2ms); scales worse with complexity |

**Choice**: Normalized tables (maestro_unidades, maestro_objetivos, maestro_indicadores).

**Rationale**: Teachers may add rich metadata per level (competency standards, learning modes, assessment rubrics) over time. Normalized schema is extensible and plays well with Supabase's RLS and indexing. Phase 1 renders via simple `JOIN` queries; no performance penalty for typical class sizes (30–50 students, 10–20 indicators per class).

**Rejected**: JSON payload is simpler for MVP but locks us into single-column semantics. If teacher wants to clone a route or filter by objective name, JSON becomes awkward.

---

### Decision 2: DAG Prerequisite Validation — In-Memory Cache vs. Database Views

| Aspect | In-Memory JS Cache | Stored Procedure / DB View |
|---|---|---|
| Cycle detection | Build graph in JS; iterate for cycles on save | SQL recursive CTE; runs on every check |
| Bulk prerequisite checks | Cache once at session load; O(n) lookups | Query per grade; N+1 risk |
| Invalidation | Clear cache on route edit; requires explicit coordination | Always fresh; no stale reads |
| Teachability | Clear imperative code; easy to debug | Complex PL/pgSQL; harder to extend |

**Choice**: In-memory JS cache (load once per session, invalidate on route change).

**Rationale**: Teachers grade 10–20 indicators per session; prerequisite checks are performed O(n) times per grading workflow. Caching at session start and validating in JS is fast (< 10ms for 50 indicators) and keeps grading modal responsive. Cycle detection happens at route-save time (rare operation), so DB overhead is acceptable there. Simple JS DAG validator (adjacency list, DFS) is maintainable.

**Rejected**: DB-only validation introduces latency (round-trip per grade) and creates N+1 patterns in the grading modal.

---

### Decision 3: Absence-to-Recovery Mapping — Enum Field vs. Separate Session Table

| Aspect | Add `recovery_status` enum to `evaluacion_indicador` | Separate `indicador_recovery_sessions` table |
|---|---|---|
| Indicator state semantics | Single row per (student, indicator, class); recovery_status ∈ {pendiente, recuperado, no_aplica} | Separate join; historical recovery events tracked |
| Query complexity | Direct filter on enum; simple aggregations | LEFT JOIN + filter; more complex but clearer audit trail |
| Recovery metadata | Limited to status; no timestamp/notes | Full session with notes, recovery date, assessor |
| Rollback safety | Atomic update to one table | Cascading delete from two tables; higher risk |

**Choice**: Add `recovery_status` enum field to `evaluacion_indicador` table.

**Rationale**: Phase 1 recovery is binary (pending → recuperado). The `evaluacion_indicador` row already captures the student-indicator-class context. Adding `recovery_status` keeps the modal response time flat (no extra joins). RLS policies follow existing pattern (teachers only update own evaluations). If Phase 2 requires full recovery session history, migrate to separate table then.

**Rejected**: Separate table is "more correct" but introduces unnecessary join complexity for Phase 1 MVP.

---

### Decision 4: Grading Modal Architecture — Extend vs. Specialize

| Aspect | Extend `calificacionModal.js` with indicator-aware logic | Create `IndicadorGradingModal.js` (new component) |
|---|---|---|
| Code reuse | Small additions; toggle attendance display | Duplication; ~300 lines each |
| Component cohesion | Mixing class-level + indicator-level logic | Clean separation: each modal handles one model |
| Testing | Single test suite; harder to isolate indicator-specific tests | Two test suites; easier E2E for each case |
| UX consistency | Single modal style; consistent with existing portal | Risk of style drift; need shared CSS variables |

**Choice**: Create new `IndicadorGradingModal.js`.

**Rationale**: Indicator grading has distinct UX requirements (partition by attendance state, recovery button, check-mark toggle, IA suggestion flow). Mixing this into a generic modal couples concerns. New component is clearer intent and easier to test. Reuse groqService and styling infrastructure, but logic is separate.

**Rejected**: Extending the existing modal would require deeply nested conditionals and makes the component harder to maintain.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Teacher Portal — Grading Workflow                               │
└─────────────────────────────────────────────────────────────────┘

1. ROUTE CONSTRUCTION (TeacherRouteBuilder)
   ─────────────────────────────────────────
   Form input (add/remove UNIDADES/OBJETIVOS/INDICADORES)
        │
        └──→ Validate DAG (no cycles)
             │
             └──→ INSERT into maestro_unidades, maestro_objetivos,
                 maestro_indicadores, indicador_prerequisito


2. GRADING SESSION (IndicadorGradingModal)
   ──────────────────────────────────────
   SELECT attendance_records WHERE session_id = ? AND clase_id = ?
   │
   └──→ Partition students:
        ├─ Presentes (status = 'present' | 'late' | 'justified')
        └─ Ausentes (status = 'absent')

   For each student partition:
   SELECT evaluacion_indicador WHERE (alumno_id, indicator_id, clase_id)
   │
   └──→ Check prerequisite satisfaction (in-memory DAG)
        ├─ If not met → show soft alert (allow override)
        └─ If met → enable grading

   Teacher enters observation text
   │
   └──→ Click "Analizar" → POST to groq-proxy via analyzeObservation()
        │
        └──→ AI returns pedagogical analysis (no auto-grades)
             │
             └──→ Render suggestions in modal

   Teacher clicks "Aplicar Calificación"
   │
   └──→ UPDATEs evaluacion_indicador {nota, estado, observaciones, recovery_status}


3. RECOVERY WORKFLOW (for Ausentes)
   ────────────────────────────────
   Teacher clicks "Registrar Recuperación" for a student
   │
   └──→ Creates recovery event:
        - INSERT into class_sessions (recovery session) → linked to original absence
        - UPDATE evaluacion_indicador.recovery_status = 'recuperado'
        - Trigger: scan dependent indicators
          └──→ For each (student, dependent_indicator):
               UPDATE evaluacion_indicador SET recovery_status = 'pendiente' (flag for reevaluation)


4. PREREQUISITE REEVALUATION (on recovery)
   ───────────────────────────────────────
   When marking indicator as recovered, system flags dependent indicators
   Teacher re-grades dependent indicator in next session
   │
   └──→ Modal pre-populates with "Prerequisite now satisfied" message
        (encouraging teacher to re-evaluate)
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260812000001_maestro_routes_schema.sql` | Create | New tables: maestro_routes, maestro_unidades, maestro_objetivos, maestro_indicadores, indicador_prerequisito |
| `supabase/migrations/20260812000002_evaluacion_indicador_recovery_status.sql` | Create | Alter evaluacion_indicador to add recovery_status enum; add indices |
| `src/portal-maestros/components/TeacherRouteBuilder.js` | Create | Form-based route editor (UNIDADES/OBJETIVOS/INDICADORES add/remove rows) |
| `src/portal-maestros/components/IndicadorGradingModal.js` | Create | Specialized grading modal with attendance partitioning, IA analysis, recovery UI |
| `src/portal-maestros/services/maestroRouteService.js` | Create | CRUD + DAG validation for routes (getTeacherRoutes, createRoute, validateDAG) |
| `src/portal-maestros/services/maestroDataService.js` | Modify | Add getTeacherRoutes(), getRoutePrerequisites(), getRecoverySessions() |
| `src/portal-maestros/services/groqService.js` | Modify | Extend analyzeObservation() to accept optional indicador_id and criteria context (injected into prompt) |
| `src/portal-maestros/views/hoyView.js` | Modify | Rename button "Ver análisis" → "Analizar"; add data-routa-id attribute for route navigation |
| `src/portal-maestros/styles/indicador-grading.css` | Create | Styling for IndicadorGradingModal (attendance badges, stars, check-mark toggles) |

---

## Interfaces / Contracts

### 1. maestro_routes Table

```sql
CREATE TABLE maestro_routes (
  id UUID PRIMARY KEY,
  maestro_id UUID NOT NULL REFERENCES maestros(id),
  clase_id UUID NOT NULL REFERENCES clases(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(maestro_id, clase_id)
);
```

### 2. maestro_unidades Table

```sql
CREATE TABLE maestro_unidades (
  id UUID PRIMARY KEY,
  ruta_id UUID NOT NULL REFERENCES maestro_routes(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_unidades_ruta ON maestro_unidades(ruta_id, orden);
```

### 3. maestro_objetivos Table

```sql
CREATE TABLE maestro_objetivos (
  id UUID PRIMARY KEY,
  unidad_id UUID NOT NULL REFERENCES maestro_unidades(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_objetivos_unidad ON maestro_objetivos(unidad_id, orden);
```

### 4. maestro_indicadores Table

```sql
CREATE TABLE maestro_indicadores (
  id UUID PRIMARY KEY,
  objetivo_id UUID NOT NULL REFERENCES maestro_objetivos(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  nombre TEXT NOT NULL,
  criterios_json JSONB, -- { "escala": "1-5", "competencias": [...] }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_indicadores_objetivo ON maestro_indicadores(objetivo_id, orden);
```

### 5. indicador_prerequisito Table

```sql
CREATE TABLE indicador_prerequisito (
  id UUID PRIMARY KEY,
  indicador_id UUID NOT NULL REFERENCES maestro_indicadores(id) ON DELETE CASCADE,
  prerequisito_indicador_id UUID NOT NULL REFERENCES maestro_indicadores(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(indicador_id, prerequisito_indicador_id)
);
-- Prevents self-reference: (indicador_id != prerequisito_indicador_id) check via trigger
```

### 6. evaluacion_indicador — Altered

```sql
ALTER TABLE evaluacion_indicador
ADD COLUMN recovery_status TEXT DEFAULT 'pendiente' CHECK (
  recovery_status IN ('pendiente', 'recuperado', 'no_aplica')
);
-- 'pendiente': awaiting recovery or first assessment
-- 'recuperado': student participated in recovery session
-- 'no_aplica': student was present originally; no recovery needed
```

### 7. Frontend: TeacherRouteBuilder Props

```typescript
interface TeacherRouteBuilderProps {
  maestroId: string;
  claseId: string;
  onSave: (ruta: MaestroRoute) => Promise<void>;
  onClose: () => void;
}

interface MaestroRoute {
  id: string;
  unidades: Unidad[];
}

interface Unidad {
  id: string;
  orden: number;
  nombre: string;
  objetivos: Objetivo[];
}

interface Objetivo {
  id: string;
  orden: number;
  nombre: string;
  indicadores: Indicador[];
}

interface Indicador {
  id: string;
  orden: number;
  nombre: string;
  criterios: { [key: string]: any };
  prerequisitos: string[]; // prerequisito_indicador_ids
}
```

### 8. Frontend: IndicadorGradingModal Props

```typescript
interface IndicadorGradingModalProps {
  sesionId: string;
  claseId: string;
  indicadorId: string;
  indicadorNombre: string;
  maestroId: string;
  onSave: (grades: EvaluacionIndicador[]) => Promise<void>;
  onClose: () => void;
}

interface EstudianteGradingRow {
  alumno_id: string;
  alumno_nombre: string;
  attendance_status: 'present' | 'absent' | 'late' | 'justified';
  current_nota: 1 | 2 | 3 | 4 | 5 | null;
  current_estado: IndicadorEstado;
  recovery_status: 'pendiente' | 'recuperado' | 'no_aplica';
  prerequisito_satisfecho: boolean; // read-only; gates grading
  prerequisito_mensaje?: string; // alert text if not satisfied
}
```

### 9. Backend API: groqService.analyzeObservation (signature change)

```typescript
// BEFORE (class-level):
export async function analyzeObservation(observation: string): Promise<AnalysisResult>

// AFTER (indicator-aware):
export async function analyzeObservation(
  observation: string,
  context?: {
    indicadorId?: string;
    indicadorNombre?: string;
    criterios?: string;
    estudiantesNombres?: string[]; // students in session for name suggestions
  }
): Promise<AnalysisResult>
```

The Groq prompt injects optional indicator context:

```
Tu tarea es analizar una observación de clase para el indicador "{indicadorNombre}".
Criterios: {criterios}
Estudiantes presentes: {estudiantesNombres}

Proporciona retroalimentación pedagógica, SIN asignar calificaciones automáticas.
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit: DAG Validation** | Cycle detection, prerequisite satisfaction, graph traversal | Vitest; mock route with 10+ indicators + dependencies; assert no false positives on cycles |
| **Unit: Recovery Logic** | recovery_status state machine (pendiente → recuperado), dependent indicator flagging | SQL-level tests via Vitest + pg_mock or local Supabase |
| **Integration: Grading Modal** | Load attendance + evaluacion_indicador, partition students, check prerequisite alert, POST to groq-proxy mock | Vitest with supabase mock; assert modal renders correct UI state |
| **Integration: Route Builder** | CRUD on maestro_routes/unidades/objetivos/indicadores; DAG validation on save; RLS enforcement (teacher sees only own routes) | E2E via Vitest with test DB; verify schema + FKs + indices |
| **E2E: Full Grading Workflow** | Teacher creates route → opens grading modal → marks stars for present students → reviews IA suggestions → marks recovery for absent student → dependent indicator is flagged | Cypress/Playwright; seed test classe/students/attendance; verify DB state post-grading |
| **E2E: Prerequisite Enforcement** | Grade indicator X → try to grade dependent Y without X satisfied → soft alert shown → allow override → verify both grades saved | Cypress; assert alert text and form state |
| **Performance** | DAG validation for 50 indicators with 20 dependencies < 50ms | Vitest benchmark; profile JS graph construction |

---

## Migration / Rollout

### Phase 1: Create New Tables (No Downtime)

1. **Migration 1** (`20260812000001_maestro_routes_schema.sql`):
   - Create maestro_routes, maestro_unidades, maestro_objetivos, maestro_indicadores, indicador_prerequisito
   - All tables default to EMPTY (no data yet)
   - Enable RLS: teachers read/write own routes only (same pattern as evaluacion_indicador)

2. **Migration 2** (`20260812000002_evaluacion_indicador_recovery_status.sql`):
   - ALTER TABLE evaluacion_indicador ADD COLUMN recovery_status TEXT DEFAULT 'pendiente'
   - All existing rows default to 'pendiente' (safe; teachers will mark 'no_aplica' or 'recuperado' as needed)
   - Add UNIQUE index on (maestro_id, clase_id) for maestro_routes to prevent duplication

### Phase 2: Rollout Features

1. **Deploy frontend** components in feature flag: `FEATURE_TEACHER_ROUTES=true`
   - TeacherRouteBuilder + IndicadorGradingModal hidden behind flag
   - hoyView "Analizar" button unchanged until flag enabled
   
2. **Gradual enablement**:
   - Week 1: Pilot with 2–3 teachers; gather UX feedback
   - Week 2: Expand to all maestros; monitor IA API usage
   - Week 3: Enable by default; retire feature flag

### Rollback Plan

1. **If IA analysis is broken**: 
   - Disable "Analizar" button in IndicadorGradingModal
   - Teachers grade manually (stars/status still work)
   - No data loss; no schema revert needed

2. **If route builder has bugs**:
   - Set `FEATURE_TEACHER_ROUTES=false` in frontend config
   - Grading still works for default ACM routes or existing custom routes
   - Delete corrupt route data via admin script if needed

3. **Full schema rollback** (emergency):
   - Run reverse migrations (drop maestro_routes, indicador_prerequisito, etc.)
   - Drop recovery_status from evaluacion_indicador via migration
   - Existing evaluation data is preserved (recovery_status is nullable)

---

## Open Questions

- [ ] **Prerequisite enforcement level**: Is "soft alert, allow override" correct, or should the system _block_ grading if prerequisite is not satisfied? (Affects form validation logic in modal)
- [ ] **IA suggestion granularity**: When analyzing free-text for an indicator with multiple students, should IA suggest per-student star ratings (e.g., "#Juan: 4/5, #Maria: 3/5"), or only pedagogical feedback without per-student grades? (Affects analyzeObservation prompt design)
- [ ] **Recovery session metadata**: Should recovery sessions be linked to specific recovery dates/times in calendar, or just tracked as state changes on evaluacion_indicador? (Affects `indicador_recovery_sessions` table design; Phase 2 consideration)
- [ ] **Clone/Reuse routes**: Should teachers be able to clone a route across classes or semesters? (Affects UI in TeacherRouteBuilder; not Phase 1 but good to confirm intent)
- [ ] **Default route for existing classes**: If teacher has no personal route for a clase, should the system fall back to institutional ACM route for grading, or require route creation first? (Affects grading modal logic; current design assumes teacher creates route upfront)

