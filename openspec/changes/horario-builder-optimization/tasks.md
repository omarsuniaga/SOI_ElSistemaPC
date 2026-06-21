# Tasks: Horario Builder Optimization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 700–950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR-1 (foundation) → PR-2 (engine surgery) → PR-3 (multi-proposal + UI integration) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Save fix + config UI + partitioner | PR-1 | Base: master; targets master; no engine changes |
| 2 | Multi-session engine refactor | PR-2 | Base: PR-1 merge; engine surgery isolated |
| 3 | Multi-proposal + UI integration | PR-3 | Base: PR-2 merge; ties all features together |

---

## PR-1: Foundation (F5 save fix · F1 config panel · F2 partitioner)

- [x] TASK-HB-F5A: Fix saveScheduleRun payload mismatch in handleSave()
  Req: F5 — schedule-persistence-fix
  Files: `src/modules/horario-builder/views/horarioBuilderView.js`
  TDD:
    RED:  `src/modules/horario-builder/__tests__/scheduleRun.persistence.test.js` — describe "handleSave payload" → it "sends {periodo, config, resultado, metricas} not {assignments, periodo_id}"
    GREEN: fix handleSave() payload keys; store `state.lastConfig` after generate call
    REFACTOR: extract payload builder into named const for readability
  Depends: none
  PR: Batch 1

- [x] TASK-HB-F5B: Add duracion_minutos to horarioBuilderApi with null fallback
  Req: F5 — per-class duration / R-3
  Files: `src/modules/horario-builder/api/horarioBuilderApi.js`
  TDD:
    RED:  `src/modules/horario-builder/__tests__/horarioBuilderApi.test.js` — describe "getClasesReal" → it "returns null for duracion_minutos when column absent" (mock supabase returning row without column)
    GREEN: wrap duracion_minutos in conditional select; map absent column to null
    REFACTOR: none
  Depends: none
  PR: Batch 1

- [x] TASK-HB-F1A: Create buildJornada() utility in constraintUtils.js
  Req: F1 — schedule-constraint-config
  Files: `src/modules/horario-builder/utils/constraintUtils.js` (CREATE)
  TDD:
    RED:  `src/modules/horario-builder/__tests__/constraintUtils.test.js` (CREATE) — describe "buildJornada" → it "sets {inicio,fin} for selected days and 00:00/00:00 for unselected"
    GREEN: implement pure buildJornada(startTime, endTime, selectedDays): JornadaObject
    REFACTOR: none
  Depends: none
  PR: Batch 1

- [x] TASK-HB-F1B: Add getConstraintPanelValues() + new controls to constraintPanel.js
  Req: F1 — schedule-constraint-config
  Files: `src/modules/horario-builder/components/constraintPanel.js`
  TDD:
    RED:  `src/modules/horario-builder/__tests__/constraintConfig.test.js` (CREATE) — describe "getConstraintPanelValues" → it "reads time inputs, day checkboxes, and sesionesPerSemana from DOM"
    GREEN: add time-range inputs, day checkboxes, sesiones-por-semana number input to panel HTML; export getConstraintPanelValues(container)
    REFACTOR: none
  Depends: TASK-HB-F1A
  PR: Batch 1

- [x] TASK-HB-F1C: Import and wire constraintPanel into horarioBuilderView
  Req: F1 — schedule-constraint-config
  Files: `src/modules/horario-builder/views/horarioBuilderView.js`
  TDD:
    RED:  add to constraintConfig.test.js — it "calls engine with jornada built from panel values on generate click"
    GREEN: render #hb-constraint-panel-slot in renderShell(); call getConstraintPanelValues() + buildJornada() inside handleGenerate()
    REFACTOR: none
  Depends: TASK-HB-F1B
  PR: Batch 1

- [x] TASK-HB-F2A: Implement groupPartitioner.js — pure partitioning logic
  Req: F2 — schedule-group-partitioner
  Files: `src/modules/horario-builder/domain/groupPartitioner.js` (CREATE)
  TDD:
    RED:  `src/modules/horario-builder/__tests__/groupPartitioner.test.js` (CREATE)
      - it "returns 3 subgroups [14,13,13] for 40 students / cap 15"
      - it "returns 1 group when students <= capacity"
      - it "returns 1 group when total_alumnos is 0"
      - it "sets _originalClaseId matching parent id"
      - it "generates synthetic ids like ${originalId}_grupo_A"
      - it "appends '— Grupo A/B/C' to nombre"
    GREEN: implement partitionClase(clase, salones) and partitionClases(clases, salones)
    REFACTOR: none
  Depends: none
  PR: Batch 1

- [x] TASK-HB-F2B: Integrate partitionClases into handleGenerate()
  Req: F2 — schedule-group-partitioner
  Files: `src/modules/horario-builder/views/horarioBuilderView.js`
  TDD:
    RED:  add to constraintConfig.test.js — it "passes 3 clases to engine when 1 clase has 40 students and salon cap is 15"
    GREEN: call partitionClases(data.clases, data.salones) in handleGenerate() before engine invocation; pass expanded array
    REFACTOR: none
  Depends: TASK-HB-F2A, TASK-HB-F1C
  PR: Batch 1

- [x] TASK-HB-F2C: Resolve _originalClaseId before applyScheduleRun (R-1 fix)
  Req: F2 — R-1 subgroup FK safety
  Files: `src/modules/horario-builder/views/horarioBuilderView.js`
  TDD:
    RED:  add to scheduleRun.persistence.test.js — it "replaces clase_id 'abc_grupo_A' with _originalClaseId 'abc' before DB insert"
    GREEN: before calling applyScheduleRun, map assignments replacing synthetic id with _originalClaseId where _isSubgroup === true
    REFACTOR: none
  Depends: TASK-HB-F2A, TASK-HB-F5A
  PR: Batch 1

---

## PR-2: Engine Surgery (F3 multi-session)

- [x] TASK-HB-F3A: Establish regression baseline for schedulingEngine (R-2 guard)
  Req: F3 — schedule-multi-session
  Files: `src/modules/horario-builder/__tests__/schedulingEngine.multiSession.test.js` (CREATE)
  TDD:
    RED:  describe "existing engine behavior" → it "assigns a slot for each clase in happy-path fixture" (calls current engine, snapshot result shape — all existing engine tests must pass before touching implementation)
    GREEN: no implementation change — baseline tests must pass green as-is
    REFACTOR: none
  Depends: none
  PR: Batch 2

- [x] TASK-HB-F3B: Extract _findCandidates() from schedulingEngine — test-first refactor
  Req: F3 — schedule-multi-session / R-2
  Files: `src/modules/horario-builder/engine/schedulingEngine.js`
  TDD:
    RED:  add to schedulingEngine.multiSession.test.js — describe "_findCandidates" → it "returns empty array when teacher is fully booked"; it "accepts excludeDays Set and skips those slots"
    GREEN: extract candidate-finding block into _findCandidates(clase, config, teacherSchedules, salonSchedules, opts: {excludeDays, requireSalonId}); wire back into existing forEach; all prior tests still green
    REFACTOR: ensure _findCandidates signature is stable (opts ignored initially is OK)
  Depends: TASK-HB-F3A
  PR: Batch 2

- [x] TASK-HB-F3C: Add excludeDays support to _findCandidates
  Req: F3 — schedule-multi-session
  Files: `src/modules/horario-builder/engine/schedulingEngine.js`
  TDD:
    RED:  add to schedulingEngine.multiSession.test.js — it "does not assign session 2 on same day as session 1 when excludeDays contains that day"
    GREEN: inside _findCandidates filter out slots where slot.dia is in opts.excludeDays
    REFACTOR: none
  Depends: TASK-HB-F3B
  PR: Batch 2

- [x] TASK-HB-F3D: Add sesiones_por_semana outer loop to engine
  Req: F3 — schedule-multi-session
  Files: `src/modules/horario-builder/engine/schedulingEngine.js`
  TDD:
    RED:  add to schedulingEngine.multiSession.test.js — it "returns 2 assignments for clase with sesiones_por_semana=2 on distinct days"; it "adds state.salonForClase lock so session 2 uses same salon"
    GREEN: wrap single-slot assignment in outer loop for s=0..sesiones_por_semana; track assignedDays per clase; pass excludeDays and requireSalonId to _findCandidates; add state.salonForClase Map
    REFACTOR: none
  Depends: TASK-HB-F3C
  PR: Batch 2

- [x] TASK-HB-F3E: Extend metricas with horasSemanalesPorGrupo
  Req: F3 — schedule-multi-session
  Files: `src/modules/horario-builder/engine/schedulingEngine.js`
  TDD:
    RED:  add to schedulingEngine.multiSession.test.js — it "computes horasSemanalesPorGrupo[claseId] === 1.5 for 2 sessions of 45 min"
    GREEN: after all assignments, compute horasSemanalesPorGrupo = (sessionCount * duracion) / 60 per clase; merge into returned metricas object
    REFACTOR: none
  Depends: TASK-HB-F3D
  PR: Batch 2

---

## PR-3: Multi-Proposal + UI Integration (F4)

- [x] TASK-HB-F4A: Implement multiProposalGenerator.js
  Req: F4 — schedule-multi-proposal
  Files: `src/modules/horario-builder/domain/multiProposalGenerator.js` (CREATE)
  TDD:
    RED:  `src/modules/horario-builder/__tests__/multiProposalGenerator.test.js` (CREATE)
      - it "returns exactly N proposals"
      - it "assigns sequential id 1,2,3 to proposals"
      - it "marks duplicate proposals with _duplicate: true" (R-4)
      - it "shuffleWithSeed produces different orderings for different seeds"
    GREEN: implement shuffleWithSeed(arr, seed) (Fisher-Yates); implement generateMultipleProposals(data, config, n=3) calling engine N times with shuffled input; fingerprint each result; mark duplicates
    REFACTOR: none
  Depends: none (engine imported via module)
  PR: Batch 3

- [x] TASK-HB-F4B: Add proposal tabs to horarioBuilderView
  Req: F4 — schedule-multi-proposal
  Files: `src/modules/horario-builder/views/horarioBuilderView.js`
  TDD:
    RED:  `src/modules/horario-builder/__tests__/horarioBuilderView.proposals.test.js` (CREATE)
      - it "renders 3 proposal tabs after generate"
      - it "changes active proposal on tab 2 click"
      - it "active tab shows % assigned and conflict count badge"
    GREEN: add state.proposals + state.activeProposalIndex to initialState(); add renderProposalTabs() function; attach tab click handlers; render grid from proposals[activeProposalIndex]
    REFACTOR: none
  Depends: TASK-HB-F4A
  PR: Batch 3

- [x] TASK-HB-F4C: Replace single-generate call with generateMultipleProposals
  Req: F4 — schedule-multi-proposal
  Files: `src/modules/horario-builder/views/horarioBuilderView.js`
  TDD:
    RED:  add to horarioBuilderView.proposals.test.js — it "calls generateMultipleProposals not generateOptimizedSchedule directly"
    GREEN: in handleGenerate() replace generateOptimizedSchedule() call with generateMultipleProposals(data, config, 3); store result in state.proposals; call renderProposalTabs()
    REFACTOR: remove direct engine import if no longer used by other handlers
  Depends: TASK-HB-F4B, TASK-HB-F4A
  PR: Batch 3

- [x] TASK-HB-F4D: Wire export buttons to horarioExporter
  Req: F4 — UI completeness
  Files: `src/modules/horario-builder/views/horarioBuilderView.js`
  TDD:
    RED:  add to horarioBuilderView.proposals.test.js — it "renders #btn-export-excel and #btn-export-pdf in toolbar"
    GREEN: add export buttons to renderShell() toolbar; import exportToExcel() and exportToPDF() from horarioExporter.js; wire click handlers passing active proposal assignments
    REFACTOR: none
  Depends: TASK-HB-F4B
  PR: Batch 3

---

## Test File Inventory

Files to CREATE (do not exist yet):

| File | Created by task |
|------|----------------|
| `src/modules/horario-builder/__tests__/scheduleRun.persistence.test.js` | TASK-HB-F5A, extended by F2C |
| `src/modules/horario-builder/__tests__/horarioBuilderApi.test.js` | TASK-HB-F5B |
| `src/modules/horario-builder/__tests__/constraintUtils.test.js` | TASK-HB-F1A |
| `src/modules/horario-builder/__tests__/constraintConfig.test.js` | TASK-HB-F1B, extended by F1C, F2B |
| `src/modules/horario-builder/__tests__/groupPartitioner.test.js` | TASK-HB-F2A |
| `src/modules/horario-builder/__tests__/schedulingEngine.multiSession.test.js` | TASK-HB-F3A, extended by F3B–F3E |
| `src/modules/horario-builder/__tests__/multiProposalGenerator.test.js` | TASK-HB-F4A |
| `src/modules/horario-builder/__tests__/horarioBuilderView.proposals.test.js` | TASK-HB-F4B, extended by F4C, F4D |
| `src/modules/horario-builder/domain/groupPartitioner.js` | TASK-HB-F2A |
| `src/modules/horario-builder/domain/multiProposalGenerator.js` | TASK-HB-F4A |
| `src/modules/horario-builder/utils/constraintUtils.js` | TASK-HB-F1A |

---

## Verification Checklist

### Automated
- `npx vitest run "src/modules/horario-builder"` — all tests pass (new + existing)

### Manual — PR-1
- Set 15:30–18:30, select Mon/Wed/Fri, click Generate → grid shows only Mon/Wed/Fri columns within that time band
- Add clase with 40 alumnos, salones with max capacity 15 → 3 subgroup rows appear in grid (Grupo A, B, C)
- Trigger save → check Supabase `schedule_runs` table has `resultado` field populated (not null / not `assignments`)

### Manual — PR-2
- Set clase sesiones_por_semana = 2, available days Mon+Wed → engine assigns 2 distinct slots on different days for that clase
- Verify same salon is locked for both sessions

### Manual — PR-3
- After generate: 3 proposal tabs render above the grid
- Click tab 2 → grid updates to proposal 2; metrics badge (% assigned, conflicts) updates
- Duplicate proposals (if any) show `_duplicate` badge or are flagged in tab label
- Export buttons (Excel / PDF) appear in toolbar and trigger download without errors

---

## PR Sizing Estimate

| PR | New tasks | Files touched | Estimated lines |
|----|-----------|---------------|-----------------|
| PR-1 | F5A, F5B, F1A, F1B, F1C, F2A, F2B, F2C | 8 files (4 create, 4 modify) + 5 test files | ~320–380 |
| PR-2 | F3A, F3B, F3C, F3D, F3E | 1 engine file + 1 test file | ~180–240 |
| PR-3 | F4A, F4B, F4C, F4D | 2 new domain + 1 view + 2 test files | ~250–330 |
| **Total** | **14 tasks** | **~15 files** | **~750–950** |

Each PR is independently deployable. PR-2 requires PR-1 merged. PR-3 requires PR-2 merged.
