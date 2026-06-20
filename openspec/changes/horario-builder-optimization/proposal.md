# Proposal: Horario Builder Optimization

## Intent

The horario-builder module has a functional greedy scheduling engine that cannot be used in production because:
- Work hours and available days are hardcoded — the user cannot configure them before generating.
- All classes default to 60-minute blocks with no per-class override.
- Classes whose enrollment exceeds salon capacity are silently dropped (`noAsignadas`), instead of being split into groups.
- The engine is deterministic — it always produces the same schedule, giving the user nothing to choose from.
- A data-persistence bug means generated schedules are never saved to the database.
- There is no concept of multiple weekly sessions per class group.

Fixing these gaps transforms the module from a demo into a real scheduling tool.

## Scope

### In Scope

- **F1 — Configuration panel wiring**: connect `constraintPanel.js` to the view; add time-range inputs (start/end time per day) and day checkboxes; pass dynamic `jornada` to engine.
- **F2 — Group partitioner**: new `groupPartitioner.js`; rule: `grupos = ceil(total_alumnos / best_salon_capacity)`; creates virtual subgroups (Grupo A, B, C…) each treated as an independent class by the engine.
- **F3 — Multi-session engine extension**: add `sesiones_por_semana` field (default 1) to class config; engine schedules N slots per class/subgroup, each on a different day.
- **F4 — Multi-proposal generator**: new `generateMultipleProposals(data, config, n=3)` wrapper that shuffles input order per run and returns an array of N proposals; UI adds proposal tabs to navigate.
- **F5 — Save bug fix + per-class duration**: fix `saveScheduleRun` field mismatch (`assignments` → `resultado`); surface `duracion_minutos` from clases API (app-layer default: 45/60/90 based on existing class field or config).

### Out of Scope

- Genetic / evolutionary algorithm optimization.
- Real-time conflict resolution (drag-and-drop live validation).
- Student-level scheduling (only class-level grouping).
- Integration with external calendars (Google Calendar, iCal).
- DB schema migrations — prefer app-layer solution; only add column if strictly required.
- Changes outside `src/modules/horario-builder/` and `src/modules/clases/` (model + API only).

## Capabilities

### New Capabilities

- `schedule-constraint-config`: UI panel for configuring work hours, available days, block duration, and sessions-per-week before generation.
- `schedule-group-partitioner`: automatic subgroup creation when enrollment exceeds salon capacity.
- `schedule-multi-session`: engine support for scheduling multiple weekly sessions per class/subgroup on distinct days.
- `schedule-multi-proposal`: wrapper that generates N distinct schedule proposals and UI to compare them.
- `schedule-persistence-fix`: corrects the save payload mismatch so assignments reach the database.

### Modified Capabilities

- None (no existing horario-builder spec in `openspec/specs/`).

## Approach

Feature areas are independent after F2 (group partitioner) — F1 and F5 can ship in parallel with F2. F3 depends on F2 (subgroups must exist before multi-session). F4 wraps F3 and can be layered on last.

1. **F1**: Import and render `constraintPanel.js` inside `horarioBuilderView.js`. Read panel state in `handleGenerate()` to build the `jornada` config object instead of using the hardcoded default.
2. **F2**: `groupPartitioner.js` pre-processes the classes array before passing it to the engine. For each class where `total_alumnos > best_available_salon_capacity`, it emits N virtual class objects with proportional `total_alumnos` and a `grupo_label` suffix.
3. **F3**: Engine change — `scheduleClass()` loops `sesiones_por_semana` times, selecting a different day each iteration. Rejects same-day assignments for the same class/subgroup.
4. **F4**: `generateMultipleProposals()` uses `Array.from({length: n})` with Fisher-Yates shuffle on the input array per iteration. UI renders proposal tabs above the grid.
5. **F5**: Align `handleSave()` payload keys with `saveScheduleRun()` expected fields. Add `duracion_minutos` read to `horarioBuilderApi.js`; default 60 if DB column absent.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/horario-builder/horarioBuilderView.js` | Modified | Import constraintPanel, wire handleGenerate, add proposal tabs, fix handleSave |
| `src/modules/horario-builder/constraintPanel.js` | Modified | Expose time-range/day/duration/sesiones controls; emit change event |
| `src/modules/horario-builder/schedulingEngine.js` | Modified | Add sesiones_por_semana loop; enforce distinct-day constraint per group |
| `src/modules/horario-builder/groupPartitioner.js` | New | Subgroup creation logic |
| `src/modules/horario-builder/generateMultipleProposals.js` | New | N-proposal wrapper with shuffle |
| `src/modules/horario-builder/horarioBuilderApi.js` | Modified | Read duracion_minutos; fix saveScheduleRun payload |
| `src/modules/clases/` (model + API) | Modified | Surface duracion_minutos from DB or apply app-layer default |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Greedy engine cannot fill N sessions for all subgroups within available slots | Med | Track `noAsignadas` per session attempt; report unfilled sessions in metrics |
| Shuffling input for multi-proposal does not produce meaningfully different schedules | Med | Add per-run tie-breaker weight randomisation in scoring; validate diversity in tests |
| `duracion_minutos` absent from DB — requires migration | Low | Default to 60 in API layer; migration deferred unless user confirms column exists |
| F3 (multi-session) increases engine complexity, breaking existing conflict detection | Med | Add unit tests for multi-session paths before modifying engine |

## Rollback Plan

All changes are isolated to `src/modules/horario-builder/` and `src/modules/clases/`. Git revert of the feature branch restores the prior state. The save-bug fix (`F5`) is the only change that touches persisted data; rollback removes the corrected payload, reverting to the silent-failure state (no data loss, just no new saves).

## Dependencies

- `constraintPanel.js` already exists but is unconnected — no new UI library needed.
- Engine and API are pure JS — no new runtime dependencies.
- `duracion_minutos` column on `clases` table: optional. Feature degrades gracefully to default 60 min.

## Success Criteria

- [ ] User can set start/end time (e.g., 15:30–18:30) and select days before generating.
- [ ] A class with 40 students and best salon capacity 15 produces 3 subgroups (14, 13, 13) that are independently scheduled.
- [ ] Each subgroup with `sesiones_por_semana = 2` receives 2 slots on distinct days.
- [ ] Generator returns 3 distinct proposals the user can compare via tabs.
- [ ] Saving a schedule correctly persists assignments to Supabase (verified by DB read-back in test).
- [ ] All new modules covered by Vitest unit tests (`npm run test:run` passes).
