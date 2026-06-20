# Design: Horario Builder Optimization

## Technical Approach

Extend the existing greedy scheduling pipeline in three layers: (1) pre-processing (group partitioner, config wiring), (2) engine extension (multi-session loop), (3) post-processing wrapper (multi-proposal generator). The save bug is an isolated payload fix with no architectural impact. All new domain logic lives in `src/modules/horario-builder/domain/` — a new subfolder that keeps pure functions separate from the existing `engine/`, `components/`, and `api/` subfolders, matching the module's existing layering.

## Architecture Decisions

### Decision: New `domain/` subfolder for pure business logic

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add files directly to module root | Flat, but root already has 4 subdirs; mixing presentational and domain code | Rejected |
| Add to `engine/` | Closer to engine but `engine/` is already coupled to DOM-free scheduling; partitioner and multi-proposal are separate concerns | Rejected |
| New `domain/` subfolder | Matches screaming architecture intent; pure functions, zero DOM, trivial to test | **Chosen** |

### Decision: `constraintPanel.js` — extend existing component, add `getValues()` API

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Replace `createConstraintPanel()` with a stateful class | Breaks existing callers; heavier refactor | Rejected |
| Add new controls inside `createConstraintPanel()` and a sibling `getConstraintPanelValues(container)` reader | Panel stays a pure HTML renderer; reader queries DOM — simple, consistent with how other components work | **Chosen** |
| Emit custom events on change | Reactive but over-engineered for a single consumer (the view) | Rejected |

**Rationale**: `createConstraintPanel()` already follows the project pattern of returning HTML strings (see `ScheduleGrid.js`, `ConflictPanel.js`). A DOM-querying reader in the view matches `attachScheduleGridListeners()` and `attachConflictPanelListeners()` precedents.

### Decision: `constraintPanel.js` placement inside `horarioBuilderView.js`

The panel will render ABOVE the toolbar (between page header and stats bar). The view calls `createConstraintPanel({ classes: [] })` in `renderShell()` and inserts it in a new `#hb-constraint-panel-slot` div. Re-rendering is NOT needed on every generate — only on explicit DOM reads.

### Decision: Multi-session — wrap the existing `forEach` loop, keep `findCandidates` inline

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Extract `findCandidates()` as a named function, call it N times | Cleaner but requires extracting and re-testing the candidate logic | **Chosen** — extraction is prerequisite for testability |
| Duplicate the loop body N times | Never acceptable | Rejected |

The `classesToSchedule.forEach` body in `schedulingEngine.js` is already 60+ lines. F3 requires extracting the candidate-finding block into `_findCandidates(clase, config, teacherSchedules, salonSchedules, excludeDays, requireSalonId)` so the outer session loop remains readable and the inner function can be unit-tested.

### Decision: Multi-proposal diversity via input shuffle, not score randomisation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Randomise scoring weights per run | Hard to reproduce; not deterministic per seed | Rejected |
| Shuffle input order (Fisher-Yates with seed) | Deterministic per seed → reproducible tests; different orderings change which class "wins" scarce slots | **Chosen** |
| Genetic/evolutionary algorithm | Out of scope per proposal | Rejected |

### Decision: `state.lastConfig` and `state.proposals` additions to view state

`initialState()` in `horarioBuilderView.js` will grow with:
- `proposals: []` — array of N engine results
- `activeProposalIndex: 0` — which tab is shown
- `lastConfig: null` — config used in last generate (needed for save payload)
- `noAsignadas: []` — needed for save payload (`resultado`)
- `metricas: null` — needed for save payload

These are additions only; existing state keys are untouched.

## Data Flow

```
handleGenerate()
  │
  ├─ fetchSchedulingData()          → { clases, maestros, salones }
  │
  ├─ getConstraintPanelValues()     → { startTime, endTime, selectedDays,
  │                                     duracion, gap, sesionesPerSemana }
  │
  ├─ buildJornada()                 → jornada config object
  │
  ├─ partitionClases()              → expanded clasesConMaestro (subgroups)
  │
  ├─ generateMultipleProposals()    → proposals[0..2]
  │     └─ generateOptimizedSchedule() × N  (each with shuffled order)
  │           └─ _findCandidates() × sesiones_por_semana × class
  │
  ├─ detectConflicts()              → annotated assignments
  │
  └─ state update → renderGrid() + renderConflictPanel() + renderProposalTabs()


handleSave()
  │
  ├─ state.lastConfig, state.proposals[activeProposalIndex]
  │
  └─ saveScheduleRun({
       periodo:   state.activePeriodo,
       config:    state.lastConfig,
       resultado: { assignments, noAsignadas },
       metricas:  state.metricas,
       estado:    'borrador'
     })
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/horario-builder/domain/groupPartitioner.js` | Create | `partitionClase(clase, salones)` and `partitionClases(clases, salones)` — pure, no imports |
| `src/modules/horario-builder/domain/multiProposalGenerator.js` | Create | `generateMultipleProposals(data, config, n=3)` wrapping the engine with per-seed shuffle |
| `src/modules/horario-builder/engine/schedulingEngine.js` | Modify | Extract `_findCandidates()`; add `sesiones_por_semana` outer loop; add `state.salonForClase` Map; extend metricas |
| `src/modules/horario-builder/components/constraintPanel.js` | Modify | Add time-range inputs, day checkboxes, sesiones select; export `getConstraintPanelValues(container)` |
| `src/modules/horario-builder/views/horarioBuilderView.js` | Modify | Import constraintPanel, buildJornada, partitionClases, generateMultipleProposals; update state; fix handleSave; add proposal tabs |
| `src/modules/horario-builder/api/horarioBuilderApi.js` | Modify | Add `duracion_minutos` to `getClasesReal()` select with null fallback |
| `src/modules/horario-builder/__tests__/groupPartitioner.test.js` | Create | Pure unit tests — partition logic, edge cases (0 students, exact capacity, overflow) |
| `src/modules/horario-builder/__tests__/multiProposalGenerator.test.js` | Create | Mock engine; test shuffle determinism, dedup fingerprinting, padding |
| `src/modules/horario-builder/__tests__/schedulingEngine.multiSession.test.js` | Create | Extend engine tests: sesiones_por_semana=2 on distinct days, same-salon lock |
| `src/modules/horario-builder/__tests__/constraintConfig.test.js` | Create | Test buildJornada() output shape; test getConstraintPanelValues() with jsdom |
| `src/modules/horario-builder/__tests__/scheduleRun.persistence.test.js` | Create | Mock supabase; assert saveScheduleRun receives correct fields from handleSave |

## Interfaces / Contracts

```js
// groupPartitioner.js
export function partitionClase(clase, salones): ClaseObject[]
export function partitionClases(clases, salones): ClaseObject[]

// Subgroup shape (extends clase):
// { ...clase, id: `${clase.id}_grupo_A`, nombre: `${clase.nombre} — Grupo A`,
//   total_alumnos: N, _originalClaseId: string, _isSubgroup: boolean, _groupLabel: string }

// multiProposalGenerator.js
export function generateMultipleProposals(
  data: { clasesConMaestro, maestros, salones },
  config: { jornada, gapMinimo, duracionBloque },
  n?: number   // default 3
): Array<{ id: number, assignments[], noAsignadas[], metricas{}, _duplicate?: boolean }>

// constraintPanel.js — new export
export function getConstraintPanelValues(container: Element): {
  startTime: string,   // 'HH:MM'
  endTime: string,     // 'HH:MM'
  selectedDays: string[],
  duracion: number,
  gap: number,
  sesionesPerSemana: number
}

// horarioBuilderView.js — local helper (not exported)
function buildJornada(startTime, endTime, selectedDays): JornadaObject

// schedulingEngine.js — internal extraction (not exported)
function _findCandidates(clase, config, teacherSchedules, salonSchedules, excludeDays: Set, requireSalonId: string|null): CandidateSlot[]
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `partitionClase` — 0 students, exact capacity, overflow (3 groups), large remainder | Vitest, no DOM, pure assertions |
| Unit | `buildJornada` — selected vs unselected days emit correct `{ inicio, fin }` | Vitest, no DOM |
| Unit | `_findCandidates` extraction — returns empty when teacher fully booked | Vitest, mock schedule maps |
| Unit | Multi-session engine — 2 sessions land on different days; same salon locked after session 1 | Extend `schedulingEngine.test.js` |
| Unit | `generateMultipleProposals` — 3 distinct fingerprints when input is diverse; pad when only 1 unique schedule possible | Vitest, `vi.mock` the engine |
| Unit | `getConstraintPanelValues` — reads DOM values correctly | Vitest + jsdom, `document.createElement` |
| Integration | `handleSave` sends correct keys to `saveScheduleRun` | Vitest, `vi.mock` supabase + api |

Mock pattern for supabase (consistent with existing `scheduleFeedbackApi.test.js`):
```js
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn(() => ({ insert: vi.fn(), select: vi.fn(), single: vi.fn() })) }
}))
```

## Migration / Rollout

No DB migration required. `duracion_minutos` reads from the `clases` table with a null default — if the column is absent, Supabase returns null and the app defaults to `panelValues.duracion`. No schema changes are needed for `schedule_runs` — the fields (`periodo`, `config`, `resultado`, `metricas`, `estado`) already exist in the table as confirmed by the existing `saveScheduleRun` implementation.

F5 (save fix) can be merged independently without F1–F4. Deployment order: F5 → F1 → F2 → F3 → F4.

## Open Questions

- [ ] Confirm whether `duracion_minutos` column exists in `clases` table in production Supabase — if yes, include in select; if not, rely on app-layer default and defer migration.
- [ ] Clarify whether subgroup assignments (`_isSubgroup: true`) should appear in `applyScheduleRun` — currently it inserts `clase_id` into `clase_horarios`; synthetic subgroup IDs would create orphan rows. May need to resolve back to `_originalClaseId` before apply.
