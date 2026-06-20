# Proposal: Componentizar Vista Asistencia

## Intent

`asistenciaView.js` (2986 lines, single `_renderVista` function) mixes state, DOM, events, and data logic with zero separation. 28 event listeners have no cleanup — leaking on every navigation. Component extraction solves the memory leak, eliminates synchronous re-render bugs, and makes each section independently testable.

## Scope

### In Scope
- Extract 10 components + 1 utils file following existing `createXxx(container, opts) → { destroy() }` pattern
- Fix: event listener cleanup via component lifecycle
- Fix: synchronous DOM mutation after state update → component-local rendering
- Fix: autofocus modal keyboard-trigger bug on mobile
- `_renderVista` becomes a thin orchestrator calling components and returning combined cleanup

### Out of Scope
- Data layer changes (DataAdapter migration)
- New features or UX changes
- CSS reorganization or design tokens
- Test suite (deferred to verification phase)

## Approach

Extract one component at a time, least-coupled first. Each component receives explicit state (no shared mutable references) and emits typed callbacks. Parent holds canonical state; on user action → component callback fires → parent mutates state → parent calls `.update(state)` or destroys/re-creates affected components.

State flow:
```
User Event → Component Callback → Parent Handler → State Mut → Component.update(newState)
```

## Component Contracts

| Component | Signature | State In | Callbacks Out | DOM Owns | Cleanup |
|---|---|---|---|---|---|
| AttendanceHeader | `createHeader(ct, { clase, fecha })` | `clase`, `fecha` | none | Title bar, class info | none (no listeners) |
| BackButtonAndBulk | `createBulkActions(ct, { onBack, onBulkMark })` | none | `onBack()`, `onBulkMark('P'|'A')` | Back btn, bulk circles | remove `onclick` |
| AutoDraftManager | `createAutoDraft(ct, { editor, claseId, maestroId })` | editor ref | `onDraftRecovered(dsl)` | Invisible draft UI | `discardDraft()`, interval |
| JustifModalMgr | `createJustifMgr(ct, { onSave, onDelete })` | alumnoId | `onSave(id, motivo)`, `onDelete(id)` | Modal overlay | `modal.close()` |
| StudentList | `createStudentList(ct, { alumnos, estado, justifs, onToggle, onNameClick, onJustificar })` | `alumnos[]`, `estado{}`, `justifs{}` | `onToggle(id, val)`, `onNameClick(id)`, `onJustificar(id)` | Cards + P/J/A buttons | `removeEventListener('click', ...)` |
| PlanificationCard | `createPlanifCard(ct, { claseId, rutaId, onIndicadorSelect })` | `claseId`, `rutaId` | `onIndicadorSelect(indicador)` | Route selector, tabs, routeTreeBar | `routeTreeBar.destroy()` × N |
| DslSection | `createDslSection(ct, { editor, toolbar, onInsert, onIaProposal })` | editor/toolbar refs | `onInsert(dsl)`, `onIaProposal(text)` | Editor + toolbar container | `editor.destroy()`, `toolbar.destroy()` |
| ObservationSaveBtn | `createObsSaveBtn(ct, { estado, dslContent, rutaId, snapshots })` | full snapshot | `onSaveComplete(results)` | Save button, progress | remove `onclick` |
| SaveBtnAndOverlay | `createSaveOverlay(ct, { onSave, onFinalize })` | session state | `onSave()`, `onFinalize()` | Overlay + 9 action btns | remove all `onclick` |

## Migration Plan

| Order | Component | Coupling | Risk | Strategy |
|---|---|---|---|---|
| 1 | `asistenciaHelpers.js` | None — pure utils | None | Extract lines 2698-2782 + 2978-2986, import in view |
| 2 | `AttendanceHeader` | Zero | Low | Presentational, just move markup |
| 3 | `BackButtonAndBulkActions` | Depends on `onBack` ref | Low | No shared state, just move + cleanup onclick |
| 4 | `AutoDraftManager` | Editor ref + state read | Low | Already nearly isolated (lines 1690-1745) |
| 5 | `RouteTopicAutoInjector` | Stateless | Low | Extract + test |
| 6 | `JustificacionModalManager` | `createJustificacionModal` | Low | Wrapper with callbacks |
| 7 | `StudentList` | Reads `estado`, `alumnos`, `justifs` | **High** | Must get state right — test each callback |
| 8 | `PlanificationCard` | routeTreeBar lifecycle | Med | routeTreeBar create/destroy × 3 currently, unify |
| 9 | `ObservationSaveButton` | Reads estado, DSL, snapshots | Med | Extract evaluation pipeline as pure fn first |
| 10 | `DslSection` | Deeply coupled to toolbar + 6 AI modals | **High** | Extract after PlanificationCard |
| 11 | `SaveButtonAndOverlay` | Depends on everything | **High** | Extract last or keep inline in parent |

## File Structure

```
src/portal-maestros/
├── components/
│   └── attendance/
│       ├── AttendanceHeader.js
│       ├── StudentList.js
│       ├── PlanificationCard.js
│       ├── DslSection.js
│       ├── ObservationSaveButton.js
│       ├── SaveButtonAndOverlay.js
│       └── BackButtonAndBulkActions.js
└── utils/
    └── asistenciaHelpers.js
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| State drift on StudentList extraction | Med | High | Extract with integration test — compare render output before/after |
| RouteTreeBar lifecycle (3 create/destroy cycles) | Med | Med | Unify to single instance before extraction |
| Evaluation pipeline breaks silently | Low | High | Extract pure `processarEvaluacion()` as isolated fn first, test |
| Event cleanup misses a listener | Low | Med | Audit all `onclick=` and `addEventListener` in original, map to component |

## Rollback Plan

Per-component: extract in a single commit per component (1 commit = 1 extraction revertable via `git revert <hash>`). The original `_renderVista` stays intact until all components extract; the final commit deletes the extracted lines and wires imports.

## Success Criteria

- [ ] `_renderVista` < 300 lines (down from 2986)
- [ ] Zero inline event listeners in `_renderVista` — all delegated to components
- [ ] Each component returns `{ destroy() }` that removes its listeners
- [ ] View cleanup calls exactly 1 function per component (no `_cleanups` array)
- [ ] Existing attendance flow works identically in demo + Supabase modes
