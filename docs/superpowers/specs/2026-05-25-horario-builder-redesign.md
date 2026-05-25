# Horario Builder — Redesign Spec

**Date:** 2026-05-25  
**Project:** SOI Sistema Académico PWA  
**Author:** Design session with Omar (osuniagarivera@gmail.com)  
**Status:** Approved

---

## Overview

Complete redesign of the `horario-builder` module. The existing module has a functional scheduling engine (`schedulingEngine.js`) and API layer (`horarioBuilderApi.js`) but lacks a proper visual interface. This spec covers the full UI/UX layer split into 3 independent sprints, each delivering usable functionality on its own.

**Goal:** Give the director a professional, interactive tool to visualize, adjust, and publish the institutional weekly schedule.

---

## Decisions Made

| Topic | Decision | Rationale |
|---|---|---|
| Grid layout | Multi-view with toggle | One screen covering all perspectives (grid / by teacher / by room / by student) |
| Block colors | Double layer | Header color = instrument, dot = teacher. Both dimensions visible without switching view |
| Conflict visualization | Border + collapsible panel | Red border on the block + a panel below the grid that only appears when conflicts exist |
| Drag & drop conflict | Warning + confirmation modal | Director can override conflicts intentionally; system warns but does not block |
| Publication flow | 3-stage: draft → review → published | Teachers see tentative schedule and can report issues before it becomes official |

---

## Sprint 1 — Visual Grid + Real-Time Conflicts

### Scope

Replace the current `horarioBuilderView.js` with a fully visual schedule builder. The scheduling engine already exists and must not be changed.

### Components

#### `ViewToggle.js`
- Pill-style toggle bar at the top: **Grilla | Por Maestro | Por Salón | Por Alumno**
- Active view persists in component state (not URL)
- On toggle: re-renders the grid area without reloading data

#### `ScheduleGrid.js`
- **Default view (Grilla):** rows = time slots (every 30 min, 08:00–20:00), columns = Mon–Fri
- **By teacher view:** one swimlane row per teacher, columns = days
- **By room view:** one swimlane row per room, columns = days
- **By student view:** filter input → shows only classes for that student
- Renders `ScheduleBlock` components into the appropriate cell

#### `ScheduleBlock.js`
- Visual structure:
  - Header bar: instrument color (from `colorMap.js`) + class name
  - Body: colored dot (teacher color from `hashStringToColor`) + teacher name + room
  - If `locked: true`: shows a lock icon; block is not draggable
  - If conflict: red border (2px solid `#ef4444`) + warning icon `⚠`
- Props: `assignment`, `locked`, `hasConflict`, `onDragStart`, `onClick`

#### `ConflictPanel.js`
- Collapsed by default; only renders when `conflicts.length > 0`
- Sticky position below the grid
- Header: `⚠ N conflictos` (red badge count)
- Expandable list: each entry shows day, time, and conflict reason (teacher duplicate / room duplicate)
- Click on entry → scrolls grid to the conflicting block

#### `colorMap.js`
- Exports `INSTRUMENT_COLORS`: fixed map of instrument name → HSL color
  - Piano: `#818cf8`, Violín: `#34d399`, Guitarra: `#f472b6`, Canto: `#fb923c`, Percusión: `#a78bfa`, Solfeo: `#38bdf8`, Cello: `#f59e0b`, Voz: `#ec4899`, General: `#94a3b8`
- Exports `getTeacherColor(teacherId)` — wraps existing `hashStringToColor`

#### `conflictDetector.js`
- `detectConflicts(assignments)` → returns array of conflict objects
- Detects: same teacher in overlapping slots on same day, same room in overlapping slots on same day
- Returns: `{ type: 'teacher'|'room', ids: [assignmentId, assignmentId], day, time, description }`

### Data Flow

```
horarioBuilderApi.fetchSchedulingData()
  → schedulingEngine.generateOptimizedSchedule()
    → assignments[]
      → conflictDetector.detectConflicts(assignments)
        → conflicts[]
          → ScheduleGrid renders assignments
          → ConflictPanel renders conflicts
```

### Actions

- **Guardar borrador:** calls `horarioBuilderApi.saveScheduleRun()` with `estado: 'borrador'`
- **Regenerar:** re-runs the engine with current config; resets undo history
- **Config panel:** collapsible section for `duracionBloque`, `gapMinimo`, `jornada` overrides

---

## Sprint 2 — Drag & Drop Editor

### Scope

Add interactive editing on top of Sprint 1's grid. The engine-generated schedule is the starting point; the director adjusts manually.

### Components

#### `DragDropManager.js`
- Uses HTML5 Drag & Drop API (no external library)
- On `dragstart`: marks the source block, records `sourceAssignmentId`
- On `dragover` each cell: checks availability
  - Free slot → highlight green (`#dcfce7` border)
  - Occupied by a different class → no highlight (grey)
- On `drop`:
  - Calls `conflictDetector.detectConflicts()` with the proposed move
  - If no conflict: applies move directly, adds to undo stack
  - If conflict: shows confirmation modal (see below)

#### Conflict confirmation modal
- Triggered when a drop would create a conflict
- Shows: conflict description, involved teacher/room, source and target slots
- Buttons: **Confirmar de todas formas** (applies move, marks block with conflict) | **Cancelar** (reverts drag)
- On confirm: move is applied; `ConflictPanel` updates

#### Undo / Redo
- Stack of assignment snapshots (max 20 entries)
- Keyboard: `Ctrl+Z` / `Ctrl+Y`
- Toolbar buttons: `↩ Deshacer` / `↪ Rehacer`
- After Regenerar: stack is cleared

#### Block lock
- Lock icon button on each block (appears on hover)
- Locked blocks: `draggable="false"`, lock icon visible always, `locked: true` in assignment data
- Locked blocks survive Regenerar (engine skips them)

#### Inline block editor
- Click on block → side panel slides in
- Editable fields: duration (30/60/90/120 min), alternate teacher (dropdown from available teachers)
- Save → re-validates conflicts, updates undo stack

#### Auto-save
- After every drop or edit: debounced save to `schedule_runs` (2s delay), `estado: 'borrador'`

---

## Sprint 3 — Audience Views + Publication

### Audience Views

All views are read-only renderings of the same `assignments[]` data, filtered/grouped differently. They share the `ViewToggle` from Sprint 1.

**By teacher (`maestro`):**
- One swimlane per teacher
- Shows total weekly hours per teacher (e.g. `8.5 hs`)
- Color-coded by instrument (double-layer same as main grid)

**By room (`salón`):**
- One swimlane per room
- Shows occupancy percentage for the week
- Empty slots show room capacity

**By student (`alumno`):**
- Search input → autocomplete from enrolled students
- Shows only classes that student is enrolled in
- Read-only, printable layout

**Export:**
- `horarioExporter.js` already implements `exportToExcel()` and `exportToPDF()`
- Export button visible in all views; exports current view's data

### Publication Flow

Three states stored in `schedule_runs.estado`: `borrador` → `revision` → `publicado`

#### State: `borrador`
- Only visible to admin
- Full edit mode (drag & drop active)
- Action button: **"Enviar a revisión"** → transitions to `revision`

#### State: `revision`
- Teachers can see their personal tentative schedule in the teacher portal
  - New section in teacher portal: "Horario tentativo" (only shows when a run is in `revision`)
  - Teacher sees only their own classes
- Teachers can submit feedback: free-text comment attached to the run
- Admin can read all feedback in the builder view
- Admin can go back to `borrador` (edit) or advance to `publicado`
- Action buttons: **"Volver a borrador"** | **"Publicar"**

#### State: `publicado`
- `horarioBuilderApi.applyScheduleRun()` writes assignments to `clase_horarios`
- In-app notification sent to each affected teacher
  - Notification shows teacher's personal schedule summary
  - Appears as a new entry in the Centro de Actividad feed
- Grid switches to read-only mode; edit mode locked
- Action: **"Crear nuevo período"** → starts fresh run

### DB changes needed for Sprint 3

```sql
-- Feedback from teachers on a revision run
CREATE TABLE IF NOT EXISTS schedule_run_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid REFERENCES schedule_runs(id) ON DELETE CASCADE,
  maestro_id uuid REFERENCES maestros(id),
  comentario text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add revision timestamps to schedule_runs
ALTER TABLE schedule_runs
  ADD COLUMN IF NOT EXISTS revision_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;
```

---

## Architecture — File Map

```
src/modules/horario-builder/
  components/
    ScheduleGrid.js          NEW — main grid renderer, all 4 views
    ScheduleBlock.js         NEW — individual class block
    ConflictPanel.js         NEW — collapsible conflict list
    ViewToggle.js            NEW — pill toggle bar
    DragDropManager.js       NEW — HTML5 D&D logic
    PublishWizard.js         NEW — 3-stage publication flow
  views/
    horarioBuilderView.js    REWRITE — orchestrates all components
  engine/
    schedulingEngine.js      EXISTS — do not modify
    conflictDetector.js      NEW — detects teacher/room overlaps
  api/
    horarioBuilderApi.js     EXISTS — minor additions for feedback
  utils/
    horarioExporter.js       EXISTS — already functional
    colorMap.js              NEW — instrument color constants
  models/
    scheduleConstraints.model.js  EXISTS
```

---

## Out of Scope

- Real-time multi-user collaboration (two admins editing simultaneously)
- AI-suggested schedule improvements
- SMS or email notifications (in-app only)
- Student-facing schedule view in student portal (teacher portal only for Sprint 3)
- Mobile drag & drop (desktop browser only)

---

## Success Criteria

- Sprint 1: Director can generate a schedule, see it in grid form, and identify all conflicts at a glance
- Sprint 2: Director can move any block by dragging, with conflict warnings and full undo support
- Sprint 3: Teachers see their tentative schedule before it's official; director publishes with one action and teachers are notified
