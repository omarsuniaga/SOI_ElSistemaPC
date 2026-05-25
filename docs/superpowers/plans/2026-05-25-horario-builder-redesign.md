# Horario Builder Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monolithic `horarioBuilderView.js` with a fully visual, multi-view schedule builder featuring drag & drop editing, real-time conflict detection, and a 3-stage publication workflow.

**Architecture:** Decompose the existing 610-line monolith into focused single-responsibility components. The scheduling engine (`schedulingEngine.js`) and API layer (`horarioBuilderApi.js`) are NOT modified in Sprints 1–2. Each sprint ships independently usable functionality: Sprint 1 = visual grid, Sprint 2 = drag & drop editor, Sprint 3 = audience views + publication.

**Tech Stack:** Vanilla JS ES Modules, Bootstrap 5 icons, HTML5 Drag & Drop API, Vitest for unit tests, existing Supabase JS v2 client.

---

## File Map

### Sprint 1 — New files
- `src/modules/horario-builder/utils/colorMap.js` — instrument color palette + teacher color helper
- `src/modules/horario-builder/engine/conflictDetector.js` — detects teacher/room overlaps, returns structured conflict objects
- `src/modules/horario-builder/components/ScheduleBlock.js` — renders one class block with double-layer colors + conflict state
- `src/modules/horario-builder/components/ViewToggle.js` — pill toggle bar (Grilla / Por Maestro / Por Salón / Por Alumno)
- `src/modules/horario-builder/components/ScheduleGrid.js` — main grid renderer, supports all 4 views
- `src/modules/horario-builder/components/ConflictPanel.js` — collapsible panel listing active conflicts
- `src/modules/horario-builder/views/horarioBuilderView.js` — REWRITE as slim orchestrator
- `src/modules/horario-builder/__tests__/colorMap.test.js`
- `src/modules/horario-builder/__tests__/conflictDetector.test.js`

### Sprint 2 — New files
- `src/modules/horario-builder/components/DragDropManager.js` — HTML5 D&D logic with conflict modal
- `src/modules/horario-builder/__tests__/dragDropManager.test.js`
- Modifies: `src/modules/horario-builder/views/horarioBuilderView.js` (undo/redo, lock, inline editor)

### Sprint 3 — New files
- `src/modules/horario-builder/components/PublishWizard.js` — 3-stage publication UI
- `src/modules/horario-builder/api/scheduleFeedbackApi.js` — feedback CRUD
- DB migration SQL (run manually via Supabase dashboard)
- Modifies: `src/modules/horario-builder/views/horarioBuilderView.js` (audience views, publish action)

---

## ═══════════════════════════════════════
## SPRINT 1 — Visual Grid + Conflict Panel
## ═══════════════════════════════════════

---

### Task 1: colorMap.js — Instrument color palette

**Files:**
- Create: `src/modules/horario-builder/utils/colorMap.js`
- Create: `src/modules/horario-builder/__tests__/colorMap.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/modules/horario-builder/__tests__/colorMap.test.js
import { describe, it, expect } from 'vitest';
import { INSTRUMENT_COLORS, getInstrumentColor, getTeacherColor } from '../utils/colorMap.js';

describe('colorMap', () => {
  it('returns a color for known instruments', () => {
    expect(getInstrumentColor('Piano')).toBe('#818cf8');
    expect(getInstrumentColor('Violín')).toBe('#34d399');
    expect(getInstrumentColor('Guitarra')).toBe('#f472b6');
  });

  it('returns fallback color for unknown instrument', () => {
    expect(getInstrumentColor('Theremin')).toBe('#94a3b8');
  });

  it('returns consistent HSL string for teacher IDs', () => {
    const c1 = getTeacherColor('t-001');
    const c2 = getTeacherColor('t-001');
    expect(c1).toBe(c2);
    expect(c1).toMatch(/^hsl\(\d+, 70%, 88%\)$/);
  });

  it('INSTRUMENT_COLORS keys are lowercase', () => {
    Object.keys(INSTRUMENT_COLORS).forEach(k => {
      expect(k).toBe(k.toLowerCase());
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/horario-builder/__tests__/colorMap.test.js
```
Expected: FAIL — `Cannot find module '../utils/colorMap.js'`

- [ ] **Step 3: Create colorMap.js**

```js
// src/modules/horario-builder/utils/colorMap.js

export const INSTRUMENT_COLORS = {
  'piano':      '#818cf8',
  'violín':     '#34d399',
  'violin':     '#34d399',
  'guitarra':   '#f472b6',
  'canto':      '#fb923c',
  'voz':        '#ec4899',
  'percusión':  '#a78bfa',
  'percusion':  '#a78bfa',
  'solfeo':     '#38bdf8',
  'cello':      '#f59e0b',
  'flauta':     '#06b6d4',
  'trompeta':   '#84cc16',
  'general':    '#94a3b8'
};

/**
 * Returns the display color for a given instrument name.
 * Case-insensitive. Falls back to #94a3b8 (slate) for unknown instruments.
 */
export function getInstrumentColor(instrument = '') {
  return INSTRUMENT_COLORS[instrument.toLowerCase()] ?? '#94a3b8';
}

/**
 * Returns a consistent pastel HSL color for a teacher ID.
 * Same algorithm as the original hashStringToColor in horarioBuilderView.js.
 */
export function getTeacherColor(teacherId = '') {
  let hash = 0;
  for (let i = 0; i < teacherId.length; i++) {
    hash = teacherId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 88%)`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/modules/horario-builder/__tests__/colorMap.test.js
```
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/horario-builder/utils/colorMap.js src/modules/horario-builder/__tests__/colorMap.test.js
git commit -m "feat(horario-builder): add colorMap utility with instrument/teacher color helpers"
```

---

### Task 2: conflictDetector.js — Structured conflict detection

**Files:**
- Create: `src/modules/horario-builder/engine/conflictDetector.js`
- Create: `src/modules/horario-builder/__tests__/conflictDetector.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/modules/horario-builder/__tests__/conflictDetector.test.js
import { describe, it, expect } from 'vitest';
import { detectConflicts } from '../engine/conflictDetector.js';

const base = {
  clase_id: 'c-1', clase_nombre: 'Piano I',
  maestro_id: 't-1', maestro_nombre: 'Omar',
  salon_id: 's-1', salon_nombre: 'Sala A',
  dia: 'lunes', hora_inicio: '10:00', hora_fin: '11:00'
};

describe('detectConflicts', () => {
  it('returns empty array when no assignments', () => {
    expect(detectConflicts([])).toEqual([]);
  });

  it('returns empty array when no overlaps', () => {
    const a = { ...base, clase_id: 'c-1', hora_inicio: '10:00', hora_fin: '11:00' };
    const b = { ...base, clase_id: 'c-2', maestro_id: 't-2', salon_id: 's-2', hora_inicio: '12:00', hora_fin: '13:00' };
    expect(detectConflicts([a, b])).toEqual([]);
  });

  it('detects teacher conflict on same day and overlapping slot', () => {
    const a = { ...base, clase_id: 'c-1', hora_inicio: '10:00', hora_fin: '11:00' };
    const b = { ...base, clase_id: 'c-2', salon_id: 's-2', hora_inicio: '10:30', hora_fin: '11:30' };
    const conflicts = detectConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe('teacher');
    expect(conflicts[0].ids).toContain('c-1');
    expect(conflicts[0].ids).toContain('c-2');
  });

  it('detects room conflict on same day and overlapping slot', () => {
    const a = { ...base, clase_id: 'c-1', maestro_id: 't-1', hora_inicio: '10:00', hora_fin: '11:00' };
    const b = { ...base, clase_id: 'c-2', maestro_id: 't-2', hora_inicio: '10:00', hora_fin: '11:00' };
    const conflicts = detectConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe('room');
  });

  it('does not flag conflicts on different days', () => {
    const a = { ...base, clase_id: 'c-1', dia: 'lunes' };
    const b = { ...base, clase_id: 'c-2', salon_id: 's-2', dia: 'martes' };
    expect(detectConflicts([a, b])).toEqual([]);
  });

  it('marks conflicting assignment IDs in the returned assignments', () => {
    const a = { ...base, clase_id: 'c-1' };
    const b = { ...base, clase_id: 'c-2', salon_id: 's-2' };
    const { assignments } = detectConflicts([a, b], { returnAnnotated: true });
    expect(assignments.find(x => x.clase_id === 'c-1').hasConflict).toBe(true);
    expect(assignments.find(x => x.clase_id === 'c-2').hasConflict).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/horario-builder/__tests__/conflictDetector.test.js
```
Expected: FAIL — `Cannot find module '../engine/conflictDetector.js'`

- [ ] **Step 3: Create conflictDetector.js**

```js
// src/modules/horario-builder/engine/conflictDetector.js

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(a, b, gap = 0) {
  const aStart = timeToMinutes(a.hora_inicio);
  const aEnd   = timeToMinutes(a.hora_fin);
  const bStart = timeToMinutes(b.hora_inicio);
  const bEnd   = timeToMinutes(b.hora_fin);
  return aStart < (bEnd + gap) && (bStart - gap) < aEnd;
}

/**
 * Detects teacher and room conflicts in a list of schedule assignments.
 *
 * @param {Array} assignments - Array of assignment objects with shape:
 *   { clase_id, clase_nombre, maestro_id, maestro_nombre, salon_id, salon_nombre,
 *     dia, hora_inicio, hora_fin }
 * @param {Object} options
 * @param {boolean} options.returnAnnotated - If true, also returns assignments
 *   array with `hasConflict` flag set on each item.
 * @param {number} options.gapMinutes - Minimum gap between classes (default 0).
 * @returns {Array|Object} Array of conflict objects, or { conflicts, assignments }
 *   if returnAnnotated is true.
 *
 * Each conflict object:
 *   { type: 'teacher'|'room', ids: [clase_id, clase_id], day, hora_inicio,
 *     description: string }
 */
export function detectConflicts(assignments, { returnAnnotated = false, gapMinutes = 0 } = {}) {
  const conflicts = [];
  const conflictingIds = new Set();

  for (let i = 0; i < assignments.length; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const a = assignments[i];
      const b = assignments[j];

      if (a.dia !== b.dia) continue;
      if (!overlaps(a, b, gapMinutes)) continue;

      if (a.maestro_id && a.maestro_id === b.maestro_id) {
        conflicts.push({
          type: 'teacher',
          ids: [a.clase_id, b.clase_id],
          day: a.dia,
          hora_inicio: a.hora_inicio,
          description: `${a.maestro_nombre} tiene dos clases al mismo tiempo: "${a.clase_nombre}" y "${b.clase_nombre}"`
        });
        conflictingIds.add(a.clase_id);
        conflictingIds.add(b.clase_id);
      }

      if (a.salon_id && a.salon_id === b.salon_id) {
        conflicts.push({
          type: 'room',
          ids: [a.clase_id, b.clase_id],
          day: a.dia,
          hora_inicio: a.hora_inicio,
          description: `${a.salon_nombre} está ocupado por "${a.clase_nombre}" y "${b.clase_nombre}" al mismo tiempo`
        });
        conflictingIds.add(a.clase_id);
        conflictingIds.add(b.clase_id);
      }
    }
  }

  if (!returnAnnotated) return conflicts;

  const annotated = assignments.map(a => ({
    ...a,
    hasConflict: conflictingIds.has(a.clase_id)
  }));

  return { conflicts, assignments: annotated };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/modules/horario-builder/__tests__/conflictDetector.test.js
```
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/horario-builder/engine/conflictDetector.js src/modules/horario-builder/__tests__/conflictDetector.test.js
git commit -m "feat(horario-builder): add conflictDetector with teacher/room overlap detection"
```

---

### Task 3: ScheduleBlock.js — Individual class block component

**Files:**
- Create: `src/modules/horario-builder/components/ScheduleBlock.js`

- [ ] **Step 1: Create ScheduleBlock.js**

```js
// src/modules/horario-builder/components/ScheduleBlock.js
import { getInstrumentColor, getTeacherColor } from '../utils/colorMap.js';

/**
 * Returns the HTML string for one schedule block in the grid.
 *
 * @param {Object} assignment - Shape:
 *   { clase_id, clase_nombre, instrumento, maestro_id, maestro_nombre,
 *     salon_nombre, hora_inicio, hora_fin, locked, hasConflict }
 * @param {Object} options
 * @param {boolean} options.draggable - Whether block is draggable (default false)
 * @returns {string} HTML string
 */
export function createScheduleBlock(assignment, { draggable = false } = {}) {
  const {
    clase_id, clase_nombre, instrumento = 'General',
    maestro_id, maestro_nombre = '',
    salon_nombre = '', hora_inicio, hora_fin,
    locked = false, hasConflict = false
  } = assignment;

  const instrColor  = getInstrumentColor(instrumento);
  const teachColor  = getTeacherColor(maestro_id || '');
  const isActuallyDraggable = draggable && !locked;

  // Initials for teacher dot
  const initials = maestro_nombre
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();

  const conflictStyle  = hasConflict  ? 'border: 2px solid #ef4444;' : 'border: 2px solid transparent;';
  const conflictBadge  = hasConflict  ? '<span class="sb-conflict-icon" title="Conflicto detectado">⚠</span>' : '';
  const lockIcon       = locked       ? '<span class="sb-lock-icon" title="Clase bloqueada">🔒</span>' : '';
  const draggablAttr   = isActuallyDraggable ? 'draggable="true"' : '';

  return `
    <div class="schedule-block"
         data-clase-id="${clase_id}"
         data-locked="${locked}"
         ${draggablAttr}
         style="border-radius:0.4rem;overflow:hidden;${conflictStyle}cursor:${isActuallyDraggable ? 'grab' : 'default'};user-select:none;margin-bottom:2px;">
      <!-- Instrument header bar -->
      <div class="sb-header" style="background:${instrColor};padding:3px 6px;display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span style="font-size:0.65rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${clase_nombre}</span>
        <span style="display:flex;gap:2px;flex-shrink:0;">${conflictBadge}${lockIcon}</span>
      </div>
      <!-- Teacher / room body -->
      <div class="sb-body" style="background:#f8fafc;padding:3px 6px;display:flex;align-items:center;gap:5px;">
        <span class="sb-teacher-dot" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${teachColor};font-size:0.45rem;font-weight:700;color:#1e293b;flex-shrink:0;">${initials}</span>
        <span style="font-size:0.58rem;color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${maestro_nombre}</span>
      </div>
      ${salon_nombre ? `<div style="background:#f1f5f9;padding:2px 6px;font-size:0.55rem;color:#64748b;border-top:1px solid #e2e8f0;">${salon_nombre} · ${hora_inicio}–${hora_fin}</div>` : ''}
    </div>
  `;
}
```

- [ ] **Step 2: Verify the file is syntactically valid**

```bash
node --input-type=module < src/modules/horario-builder/components/ScheduleBlock.js 2>&1 || true
```
Expected: no syntax errors (exits cleanly or prints nothing)

- [ ] **Step 3: Commit**

```bash
git add src/modules/horario-builder/components/ScheduleBlock.js
git commit -m "feat(horario-builder): add ScheduleBlock component with double-layer instrument/teacher colors"
```

---

### Task 4: ViewToggle.js — View switcher component

**Files:**
- Create: `src/modules/horario-builder/components/ViewToggle.js`

- [ ] **Step 1: Create ViewToggle.js**

```js
// src/modules/horario-builder/components/ViewToggle.js

export const VIEWS = ['grid', 'teacher', 'room', 'student'];

const VIEW_LABELS = {
  grid:    { label: 'Grilla',      icon: 'bi-grid-3x3' },
  teacher: { label: 'Por Maestro', icon: 'bi-person-lines-fill' },
  room:    { label: 'Por Salón',   icon: 'bi-door-open' },
  student: { label: 'Por Alumno',  icon: 'bi-mortarboard' }
};

/**
 * Returns HTML for the pill-style view toggle bar.
 * @param {string} activeView - One of VIEWS
 * @returns {string} HTML string
 */
export function createViewToggle(activeView = 'grid') {
  const pills = VIEWS.map(v => {
    const { label, icon } = VIEW_LABELS[v];
    const isActive = v === activeView;
    return `
      <button class="vt-pill ${isActive ? 'vt-pill--active' : ''}"
              data-view="${v}"
              style="
                display:inline-flex;align-items:center;gap:5px;
                padding:0.35rem 0.85rem;border-radius:999px;
                border:1.5px solid ${isActive ? '#6366f1' : '#e2e8f0'};
                background:${isActive ? '#6366f1' : 'transparent'};
                color:${isActive ? '#fff' : '#64748b'};
                font-size:0.78rem;font-weight:600;cursor:pointer;
                transition:all 0.15s ease;
              ">
        <i class="bi ${icon}"></i>${label}
      </button>
    `;
  }).join('');

  return `
    <div class="view-toggle" style="display:flex;gap:0.4rem;flex-wrap:wrap;" role="tablist" aria-label="Modo de visualización">
      ${pills}
    </div>
  `;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/horario-builder/components/ViewToggle.js
git commit -m "feat(horario-builder): add ViewToggle pill component for grid/teacher/room/student views"
```

---

### Task 5: ConflictPanel.js — Collapsible conflict list

**Files:**
- Create: `src/modules/horario-builder/components/ConflictPanel.js`

- [ ] **Step 1: Create ConflictPanel.js**

```js
// src/modules/horario-builder/components/ConflictPanel.js

const DAY_LABELS = {
  lunes: 'Lun', martes: 'Mar', 'miércoles': 'Mié',
  jueves: 'Jue', viernes: 'Vie', 'sábado': 'Sáb'
};

/**
 * Returns HTML for the collapsible conflict panel.
 * Renders nothing (empty string) when conflicts array is empty.
 *
 * @param {Array} conflicts - Output of detectConflicts()
 * @param {boolean} expanded - Initial expanded state (default false)
 * @returns {string} HTML string
 */
export function createConflictPanel(conflicts = [], expanded = false) {
  if (conflicts.length === 0) return '';

  const count = conflicts.length;
  const rows = conflicts.map((c, i) => {
    const typeLabel = c.type === 'teacher' ? '👤 Maestro' : '🏫 Salón';
    const day = DAY_LABELS[c.day] ?? c.day;
    return `
      <div class="cp-row"
           data-conflict-ids="${c.ids.join(',')}"
           style="
             display:flex;align-items:flex-start;gap:0.5rem;
             padding:0.5rem 0.75rem;
             border-bottom:1px solid #fee2e2;
             cursor:pointer;
             transition:background 0.1s;
           "
           onmouseenter="this.style.background='#fff1f2'"
           onmouseleave="this.style.background='transparent'">
        <span style="background:#fecaca;color:#991b1b;border-radius:4px;padding:1px 5px;font-size:0.6rem;font-weight:700;flex-shrink:0;margin-top:1px;">${typeLabel}</span>
        <span style="font-size:0.72rem;color:#7f1d1d;line-height:1.4;">${day} ${c.hora_inicio} — ${c.description}</span>
      </div>
    `;
  }).join('');

  return `
    <div id="conflict-panel" style="border:1.5px solid #fca5a5;border-radius:0.75rem;overflow:hidden;margin-top:1rem;">
      <!-- Header (click to toggle) -->
      <div id="cp-header"
           style="
             display:flex;align-items:center;justify-content:space-between;
             padding:0.6rem 0.9rem;
             background:#fef2f2;
             cursor:pointer;
           ">
        <span style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;font-weight:700;color:#991b1b;">
          <i class="bi bi-exclamation-triangle-fill"></i>
          ${count} conflicto${count !== 1 ? 's' : ''} detectado${count !== 1 ? 's' : ''}
        </span>
        <i class="bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}" id="cp-chevron" style="color:#991b1b;font-size:0.8rem;"></i>
      </div>
      <!-- Body -->
      <div id="cp-body" style="background:#fff5f5;display:${expanded ? 'block' : 'none'};">
        ${rows}
      </div>
    </div>
  `;
}

/**
 * Attaches the toggle click listener to the conflict panel in the DOM.
 * Call after injecting createConflictPanel() HTML into the page.
 * @param {HTMLElement} container - Parent element containing the panel
 * @param {Function} onRowClick - Called with conflict ids array when a row is clicked
 */
export function attachConflictPanelListeners(container, onRowClick) {
  const header = container.querySelector('#cp-header');
  const body   = container.querySelector('#cp-body');
  const chev   = container.querySelector('#cp-chevron');

  header?.addEventListener('click', () => {
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    chev.className = `bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-up'}`;
  });

  container.querySelectorAll('.cp-row').forEach(row => {
    row.addEventListener('click', () => {
      const ids = row.dataset.conflictIds.split(',');
      onRowClick?.(ids);
    });
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/horario-builder/components/ConflictPanel.js
git commit -m "feat(horario-builder): add ConflictPanel collapsible conflict list component"
```

---

### Task 6: ScheduleGrid.js — Multi-view grid renderer

**Files:**
- Create: `src/modules/horario-builder/components/ScheduleGrid.js`

- [ ] **Step 1: Create ScheduleGrid.js**

```js
// src/modules/horario-builder/components/ScheduleGrid.js
import { createScheduleBlock } from './ScheduleBlock.js';
import { JORNADA, DIAS_SEMANA } from '../models/scheduleConstraints.model.js';

const TIME_SLOT_MINUTES = 30;

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Generates all 30-min slot labels for the institutional jornada */
function buildTimeSlots() {
  // Use the earliest start across all days
  let earliest = Infinity, latest = 0;
  Object.values(JORNADA).forEach(({ inicio, fin }) => {
    if (inicio === '00:00' && fin === '00:00') return;
    earliest = Math.min(earliest, timeToMinutes(inicio));
    latest   = Math.max(latest,   timeToMinutes(fin));
  });
  const slots = [];
  for (let m = earliest; m < latest; m += TIME_SLOT_MINUTES) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

// ─── GRID VIEW (rows = times, cols = days) ──────────────────────

function renderGridView(assignments, { draggable = false } = {}) {
  const slots = buildTimeSlots();
  const days  = DIAS_SEMANA;

  // Index assignments by day+startSlot for O(1) lookup
  const byDaySlot = {};
  assignments.forEach(a => {
    const key = `${a.dia}__${a.hora_inicio}`;
    if (!byDaySlot[key]) byDaySlot[key] = [];
    byDaySlot[key].push(a);
  });

  const headerCells = days.map(d => `
    <th style="text-align:center;font-size:0.7rem;font-weight:700;color:#6366f1;padding:4px;min-width:110px;">${d.label}</th>
  `).join('');

  const bodyRows = slots.map(slot => {
    const cells = days.map(d => {
      const blocks = (byDaySlot[`${d.key}__${slot}`] || [])
        .map(a => createScheduleBlock(a, { draggable }))
        .join('');
      return `<td data-day="${d.key}" data-slot="${slot}" class="sg-cell" style="vertical-align:top;padding:2px;min-height:36px;">${blocks}</td>`;
    }).join('');

    return `
      <tr>
        <td style="font-size:0.62rem;color:#94a3b8;white-space:nowrap;padding:4px 6px;vertical-align:top;">${slot}</td>
        ${cells}
      </tr>
    `;
  }).join('');

  return `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="width:42px;"></th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `;
}

// ─── SWIMLANE VIEW (rows = entity, cols = days) ─────────────────

function renderSwimlanesView(assignments, groupByKey, groupNames, { draggable = false } = {}) {
  const days = DIAS_SEMANA;

  const grouped = {};
  assignments.forEach(a => {
    const k = a[groupByKey] || 'unknown';
    if (!grouped[k]) grouped[k] = {};
    days.forEach(d => { if (!grouped[k][d.key]) grouped[k][d.key] = []; });
    grouped[k][a.dia]?.push(a);
  });

  const headerCells = days.map(d =>
    `<th style="text-align:center;font-size:0.7rem;font-weight:700;color:#6366f1;padding:4px;min-width:110px;">${d.label}</th>`
  ).join('');

  const rows = Object.entries(grouped).map(([entityId, byDay]) => {
    const name = groupNames[entityId] || entityId;
    const cells = days.map(d => {
      const blocks = (byDay[d.key] || [])
        .map(a => createScheduleBlock(a, { draggable }))
        .join('');
      return `<td data-day="${d.key}" class="sg-cell" style="vertical-align:top;padding:2px;min-height:36px;">${blocks}</td>`;
    }).join('');

    return `
      <tr>
        <td style="font-size:0.72rem;font-weight:600;color:#374151;padding:6px 8px;white-space:nowrap;max-width:130px;overflow:hidden;text-overflow:ellipsis;vertical-align:top;border-right:2px solid #e2e8f0;">${name}</td>
        ${cells}
      </tr>
    `;
  }).join('');

  if (!rows) return '<p style="color:#94a3b8;padding:1rem;text-align:center;">Sin asignaciones.</p>';

  return `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="min-width:130px;"></th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ─── STUDENT VIEW ────────────────────────────────────────────────

function renderStudentView(assignments, students, filterQuery = '') {
  const q = filterQuery.toLowerCase().trim();

  const studentOptions = students.map(s =>
    `<option value="${s.id}">${s.nombre}</option>`
  ).join('');

  const filtered = q
    ? assignments.filter(a =>
        a.clase_nombre?.toLowerCase().includes(q) ||
        a.maestro_nombre?.toLowerCase().includes(q)
      )
    : [];

  const blocks = filtered.map(a => createScheduleBlock(a)).join('');

  return `
    <div style="margin-bottom:1rem;">
      <input id="sg-student-search"
             type="text"
             placeholder="Buscar alumno o clase..."
             value="${filterQuery}"
             style="width:100%;max-width:320px;padding:0.4rem 0.75rem;border:1.5px solid #e2e8f0;border-radius:0.5rem;font-size:0.8rem;outline:none;"
      />
    </div>
    <div id="sg-student-results" style="display:flex;flex-wrap:wrap;gap:0.5rem;">
      ${filtered.length ? blocks : '<p style="color:#94a3b8;font-size:0.8rem;">Escribí un nombre o clase para filtrar.</p>'}
    </div>
  `;
}

// ─── PUBLIC API ──────────────────────────────────────────────────

/**
 * Renders the schedule grid for the given view mode.
 *
 * @param {Object} params
 * @param {string}   params.view        - 'grid' | 'teacher' | 'room' | 'student'
 * @param {Array}    params.assignments  - Annotated assignments (with hasConflict, locked, instrumento)
 * @param {Array}    params.teachers     - Array of { id, nombre }
 * @param {Array}    params.rooms        - Array of { id, nombre }
 * @param {Array}    params.students     - Array of { id, nombre } (for student view)
 * @param {boolean}  params.draggable    - Whether blocks are draggable
 * @param {string}   params.studentQuery - Current search string for student view
 * @returns {string} HTML string
 */
export function createScheduleGrid({
  view = 'grid',
  assignments = [],
  teachers = [],
  rooms = [],
  students = [],
  draggable = false,
  studentQuery = ''
}) {
  if (view === 'grid') {
    return renderGridView(assignments, { draggable });
  }

  if (view === 'teacher') {
    const names = Object.fromEntries(teachers.map(t => [t.id, t.nombre]));
    return renderSwimlanesView(assignments, 'maestro_id', names, { draggable });
  }

  if (view === 'room') {
    const names = Object.fromEntries(rooms.map(r => [r.id, r.nombre]));
    return renderSwimlanesView(assignments, 'salon_id', names, { draggable: false });
  }

  if (view === 'student') {
    return renderStudentView(assignments, students, studentQuery);
  }

  return '';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/horario-builder/components/ScheduleGrid.js
git commit -m "feat(horario-builder): add ScheduleGrid multi-view renderer (grid/teacher/room/student)"
```

---

### Task 7: Rewrite horarioBuilderView.js as slim orchestrator

**Files:**
- Modify: `src/modules/horario-builder/views/horarioBuilderView.js` (full rewrite)
- Modify: `src/modules/horario-builder/styles/horario-builder.css` (add new utility classes)

- [ ] **Step 1: Add new CSS classes to horario-builder.css**

Open `src/modules/horario-builder/styles/horario-builder.css` and append at the end:

```css
/* ── Sprint 1 additions ─────────────────────────── */

.sg-cell { min-height: 36px; }

.vt-pill:hover:not(.vt-pill--active) {
  background: #f1f5f9 !important;
  border-color: #6366f1 !important;
  color: #6366f1 !important;
}

.sb-conflict-icon { font-size: 0.65rem; }
.sb-lock-icon     { font-size: 0.65rem; }

.cp-row:focus { outline: 2px solid #6366f1; }

/* Highlight a block when conflict panel row is clicked */
.schedule-block.sb--highlighted {
  outline: 3px solid #f59e0b;
  outline-offset: 1px;
}

/* Config panel collapsible */
.hb-config-body { transition: max-height 0.25s ease; overflow: hidden; }
```

- [ ] **Step 2: Rewrite horarioBuilderView.js**

Replace the entire content of `src/modules/horario-builder/views/horarioBuilderView.js` with:

```js
// src/modules/horario-builder/views/horarioBuilderView.js
import { fetchSchedulingData, saveScheduleRun, applyScheduleRun } from '../api/horarioBuilderApi.js';
import { generateOptimizedSchedule } from '../engine/schedulingEngine.js';
import { detectConflicts } from '../engine/conflictDetector.js';
import { createViewToggle, VIEWS } from '../components/ViewToggle.js';
import { createScheduleGrid } from '../components/ScheduleGrid.js';
import { createConflictPanel, attachConflictPanelListeners } from '../components/ConflictPanel.js';
import { exportToExcel, exportToPDF } from '../utils/horarioExporter.js';
import { PERIODOS } from '../models/scheduleConstraints.model.js';

// ─── STATE ──────────────────────────────────────────────────────
let S = {
  teachers: [],
  rooms: [],
  classes: [],
  assignments: [],      // current working set (annotated with hasConflict, locked, instrumento)
  conflicts: [],
  estado: 'borrador',   // 'borrador' | 'revision' | 'publicado'
  activeView: 'grid',
  studentQuery: '',
  config: { periodo: 'S1-2026', duracionBloque: 60, gapMinimo: 15 },
  loading: false,
  runId: null           // saved schedule_run id
};

let _container = null;

// ─── PUBLIC ENTRY ────────────────────────────────────────────────

export async function renderHorarioBuilderView(container) {
  _container = container;
  _showSpinner();

  try {
    const data = await fetchSchedulingData();
    S.teachers = data.maestros || [];
    S.rooms    = data.salones  || [];
    S.classes  = data.clases   || [];

    // Build initial assignments from classes that already have horarios in DB
    S.assignments = _buildAssignmentsFromClases(S.classes, S.teachers, S.rooms);
    _recomputeConflicts();

    _render();
  } catch (err) {
    _showError(err.message, () => renderHorarioBuilderView(container));
  }
}

// ─── RENDER ──────────────────────────────────────────────────────

function _render() {
  const hasAssignments = S.assignments.length > 0;
  const estadoBadge = _renderEstadoBadge();

  _container.innerHTML = `
    <div class="hb-container">
      <!-- Top bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1.25rem;">
        <div>
          <h1 style="font-size:1.3rem;font-weight:800;margin:0;color:var(--hb-text);">Constructor de Horarios</h1>
          <p style="margin:0;font-size:0.8rem;color:var(--hb-text-muted);">SOI Academia — Planificación visual de horarios institucionales</p>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          ${hasAssignments ? `
            <button id="hb-btn-export-pdf" class="btn btn-outline-danger btn-sm" style="font-weight:700;border-radius:8px;">
              <i class="bi bi-file-pdf"></i> PDF
            </button>
            <button id="hb-btn-export-excel" class="btn btn-outline-success btn-sm" style="font-weight:700;border-radius:8px;">
              <i class="bi bi-file-spreadsheet"></i> Excel
            </button>
          ` : ''}
          ${estadoBadge}
        </div>
      </div>

      <!-- Config row -->
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-end;margin-bottom:1rem;padding:0.75rem;background:var(--hb-card-bg);border:1px solid var(--hb-border);border-radius:0.75rem;">
        <div>
          <label style="font-size:0.7rem;font-weight:700;color:var(--hb-text-muted);">Período</label>
          <select id="hb-input-periodo" style="display:block;font-size:0.8rem;border:1px solid var(--hb-border);border-radius:6px;padding:4px 8px;background:var(--hb-card-bg);color:var(--hb-text);">
            ${PERIODOS.map(p => `<option value="${p.id}" ${S.config.periodo === p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:0.7rem;font-weight:700;color:var(--hb-text-muted);">Duración bloque (min)</label>
          <input id="hb-input-duracion" type="number" min="30" max="180" step="30" value="${S.config.duracionBloque}"
                 style="display:block;width:90px;font-size:0.8rem;border:1px solid var(--hb-border);border-radius:6px;padding:4px 8px;background:var(--hb-card-bg);color:var(--hb-text);">
        </div>
        <div>
          <label style="font-size:0.7rem;font-weight:700;color:var(--hb-text-muted);">Gap mínimo (min)</label>
          <input id="hb-input-gap" type="number" min="0" max="60" step="5" value="${S.config.gapMinimo}"
                 style="display:block;width:80px;font-size:0.8rem;border:1px solid var(--hb-border);border-radius:6px;padding:4px 8px;background:var(--hb-card-bg);color:var(--hb-text);">
        </div>
        <button id="hb-btn-generate" class="btn btn-primary btn-sm" style="font-weight:700;border-radius:8px;align-self:flex-end;">
          <i class="bi bi-cpu-fill"></i> Generar horario
        </button>
        ${hasAssignments ? `
          <button id="hb-btn-save-draft" class="btn btn-outline-secondary btn-sm" style="font-weight:700;border-radius:8px;align-self:flex-end;">
            <i class="bi bi-floppy"></i> Guardar borrador
          </button>
        ` : ''}
      </div>

      <!-- View toggle -->
      <div style="margin-bottom:0.75rem;">
        ${createViewToggle(S.activeView)}
      </div>

      <!-- Grid area -->
      <div id="hb-grid-area" style="background:var(--hb-card-bg);border:1px solid var(--hb-border);border-radius:0.75rem;padding:1rem;min-height:200px;">
        ${S.activeView === 'student' ? '' : _renderGridTitle()}
        ${createScheduleGrid({
          view:         S.activeView,
          assignments:  S.assignments,
          teachers:     S.teachers,
          rooms:        S.rooms,
          students:     [],
          draggable:    false,
          studentQuery: S.studentQuery
        })}
      </div>

      <!-- Conflict panel (below grid) -->
      <div id="hb-conflict-panel-wrapper">
        ${createConflictPanel(S.conflicts)}
      </div>

      <!-- Publish wizard placeholder (Sprint 3) -->
      <div id="hb-publish-area"></div>
    </div>
  `;

  _attachListeners();
}

function _renderEstadoBadge() {
  const map = {
    borrador:  { bg: '#fef9c3', color: '#92400e', icon: '📋', label: 'Borrador' },
    revision:  { bg: '#dbeafe', color: '#1e40af', icon: '🔍', label: 'En revisión' },
    publicado: { bg: '#dcfce7', color: '#15803d', icon: '✅', label: 'Publicado'  }
  };
  const { bg, color, icon, label } = map[S.estado] ?? map.borrador;
  return `<span style="background:${bg};color:${color};border-radius:999px;padding:0.3rem 0.75rem;font-size:0.78rem;font-weight:700;">${icon} ${label}</span>`;
}

function _renderGridTitle() {
  const titles = {
    grid:    'Grilla semanal institucional',
    teacher: 'Carga por maestro',
    room:    'Ocupación por salón',
    student: 'Horario por alumno'
  };
  return `<h2 style="font-size:1rem;font-weight:700;margin:0 0 0.75rem;color:var(--hb-text);">${titles[S.activeView] ?? ''}</h2>`;
}

// ─── LISTENERS ───────────────────────────────────────────────────

function _attachListeners() {
  // View toggle
  _container.querySelectorAll('.vt-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      S.activeView = btn.dataset.view;
      _render();
    });
  });

  // Student search
  const searchInput = _container.querySelector('#sg-student-search');
  searchInput?.addEventListener('input', e => {
    S.studentQuery = e.target.value;
    _refreshGridArea();
  });

  // Generate button
  _container.querySelector('#hb-btn-generate')?.addEventListener('click', _handleGenerate);

  // Save draft
  _container.querySelector('#hb-btn-save-draft')?.addEventListener('click', _handleSaveDraft);

  // Export buttons
  _container.querySelector('#hb-btn-export-pdf')?.addEventListener('click', async () => {
    await _withBtnSpinner('#hb-btn-export-pdf', async () => {
      await exportToPDF(S.assignments, S.config.periodo);
    });
  });
  _container.querySelector('#hb-btn-export-excel')?.addEventListener('click', async () => {
    await _withBtnSpinner('#hb-btn-export-excel', async () => {
      await exportToExcel(S.assignments, S.config.periodo);
    });
  });

  // Conflict panel
  attachConflictPanelListeners(
    _container.querySelector('#hb-conflict-panel-wrapper') ?? _container,
    (ids) => _highlightBlocks(ids)
  );
}

// ─── HANDLERS ────────────────────────────────────────────────────

async function _handleGenerate() {
  const btn = _container.querySelector('#hb-btn-generate');
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Optimizando...`;

  S.config.periodo       = _container.querySelector('#hb-input-periodo')?.value  ?? S.config.periodo;
  S.config.duracionBloque = parseInt(_container.querySelector('#hb-input-duracion')?.value ?? 60);
  S.config.gapMinimo      = parseInt(_container.querySelector('#hb-input-gap')?.value     ?? 15);

  // Run in next tick so spinner renders
  setTimeout(() => {
    try {
      const result = generateOptimizedSchedule({
        clasesConMaestro: S.classes.map(c => ({
          id:                  c.id,
          nombre:              c.nombre,
          instrumento:         c.instrumento || 'General',
          maestro_principal_id: c.maestro_principal_id,
          total_alumnos:       c.total_alumnos || 0,
          duracion:            S.config.duracionBloque
        })),
        maestros: S.teachers,
        salones:  S.rooms,
        config:   S.config
      });

      // Annotate with instrumento from classes map
      const clasesMap = Object.fromEntries(S.classes.map(c => [c.id, c]));
      S.assignments = result.assignments.map(a => ({
        ...a,
        instrumento: clasesMap[a.clase_id]?.instrumento || 'General',
        locked: false,
        hasConflict: false
      }));

      _recomputeConflicts();
      S.estado = 'borrador';
      _showToast(`Horario generado — ${result.assignments.length} clases asignadas`, 'success');
      _render();
    } catch (err) {
      _showToast('Error al generar: ' + err.message, 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  }, 50);
}

async function _handleSaveDraft() {
  await _withBtnSpinner('#hb-btn-save-draft', async () => {
    const run = await saveScheduleRun({
      periodo:   S.config.periodo,
      config:    S.config,
      resultado: S.assignments,
      metricas:  {},
      estado:    'borrador'
    });
    S.runId = run.id;
    _showToast('Borrador guardado', 'success');
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────

function _recomputeConflicts() {
  const { conflicts, assignments } = detectConflicts(S.assignments, {
    returnAnnotated: true,
    gapMinutes: S.config.gapMinimo
  });
  S.conflicts  = conflicts;
  S.assignments = assignments;
}

function _buildAssignmentsFromClases(clases, teachers, rooms) {
  const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));
  const roomMap    = Object.fromEntries(rooms.map(r => [r.id, r]));
  const result = [];

  clases.forEach(cl => {
    if (!cl.horarios?.length) return;
    const teacher = teacherMap[cl.maestro_principal_id];
    cl.horarios.forEach(h => {
      const room = roomMap[h.salon_id];
      result.push({
        clase_id:      cl.id,
        clase_nombre:  cl.nombre,
        instrumento:   cl.instrumento || 'General',
        maestro_id:    cl.maestro_principal_id,
        maestro_nombre: teacher?.nombre ?? 'Maestro',
        salon_id:      h.salon_id,
        salon_nombre:  room?.nombre ?? 'Salón',
        dia:           h.dia,
        hora_inicio:   h.hora_inicio,
        hora_fin:      h.hora_fin,
        locked:        false,
        hasConflict:   false
      });
    });
  });

  return result;
}

function _refreshGridArea() {
  const area = _container.querySelector('#hb-grid-area');
  if (!area) return;
  area.innerHTML = `
    ${S.activeView !== 'student' ? _renderGridTitle() : ''}
    ${createScheduleGrid({
      view:         S.activeView,
      assignments:  S.assignments,
      teachers:     S.teachers,
      rooms:        S.rooms,
      students:     [],
      draggable:    false,
      studentQuery: S.studentQuery
    })}
  `;

  // Re-attach student search listener
  area.querySelector('#sg-student-search')?.addEventListener('input', e => {
    S.studentQuery = e.target.value;
    _refreshGridArea();
  });
}

function _highlightBlocks(ids) {
  _container.querySelectorAll('.schedule-block.sb--highlighted')
    .forEach(el => el.classList.remove('sb--highlighted'));
  ids.forEach(id => {
    _container.querySelector(`.schedule-block[data-clase-id="${id}"]`)
      ?.classList.add('sb--highlighted');
  });
}

async function _withBtnSpinner(selector, fn) {
  const btn = _container.querySelector(selector);
  if (!btn) { await fn(); return; }
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;
  try { await fn(); } catch (err) { _showToast(err.message, 'danger'); }
  finally { btn.disabled = false; btn.innerHTML = orig; }
}

function _showSpinner() {
  _container.innerHTML = `
    <div style="text-align:center;padding:3rem;">
      <div class="spinner-border text-primary" style="width:3rem;height:3rem;"></div>
      <p style="margin-top:1rem;font-weight:600;color:var(--hb-text-muted);">Cargando...</p>
    </div>
  `;
}

function _showError(msg, onRetry) {
  _container.innerHTML = `
    <div class="alert alert-danger" style="margin:2rem;border-radius:1rem;">
      <h4>Error</h4><p>${msg}</p>
      <button class="btn btn-primary" id="hb-retry">Reintentar</button>
    </div>
  `;
  _container.querySelector('#hb-retry')?.addEventListener('click', onRetry);
}

function _showToast(msg, type = 'success') {
  const colors = { success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };
  const toast = Object.assign(document.createElement('div'), { className: 'hb-toast' });
  toast.style.borderLeftColor = colors[type] ?? colors.success;
  toast.innerHTML = `<span style="font-size:0.85rem;font-weight:600;color:var(--hb-text);">${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
```

- [ ] **Step 3: Run the existing tests to make sure nothing breaks**

```bash
npx vitest run src/modules/horario-builder/__tests__/
```
Expected: all tests PASS (schedulingEngine + colorMap + conflictDetector)

- [ ] **Step 4: Open the app in the browser and verify Sprint 1**

```bash
npm run dev
```
Navigate to the horario-builder view. Verify:
- View toggle pills appear (Grilla / Por Maestro / Por Salón / Por Alumno)
- Clicking "Generar horario" runs the engine and renders colored blocks
- Blocks show instrument-colored header + teacher dot
- If conflicts exist, the red panel appears below the grid
- Toggling views switches the grid layout

- [ ] **Step 5: Commit**

```bash
git add src/modules/horario-builder/views/horarioBuilderView.js src/modules/horario-builder/styles/horario-builder.css
git commit -m "feat(horario-builder): rewrite view as slim orchestrator with multi-view grid and conflict panel (Sprint 1 complete)"
```

---

## ═══════════════════════════════════════
## SPRINT 2 — Drag & Drop Editor
## ═══════════════════════════════════════

---

### Task 8: DragDropManager.js — HTML5 D&D with conflict modal

**Files:**
- Create: `src/modules/horario-builder/components/DragDropManager.js`
- Create: `src/modules/horario-builder/__tests__/dragDropManager.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/modules/horario-builder/__tests__/dragDropManager.test.js
import { describe, it, expect } from 'vitest';
import { applyMove, buildUndoSnapshot } from '../components/DragDropManager.js';

const base = {
  clase_id: 'c-1', clase_nombre: 'Piano I',
  maestro_id: 't-1', maestro_nombre: 'Omar',
  salon_id: 's-1', salon_nombre: 'Sala A',
  dia: 'lunes', hora_inicio: '10:00', hora_fin: '11:00',
  locked: false, hasConflict: false, instrumento: 'Piano'
};

describe('applyMove', () => {
  it('moves an unlocked assignment to a new day/time', () => {
    const assignments = [{ ...base }];
    const result = applyMove(assignments, 'c-1', 'martes', '14:00');
    const moved = result.find(a => a.clase_id === 'c-1');
    expect(moved.dia).toBe('martes');
    expect(moved.hora_inicio).toBe('14:00');
    expect(moved.hora_fin).toBe('15:00');   // duration preserved (60 min)
  });

  it('does not move a locked assignment', () => {
    const assignments = [{ ...base, locked: true }];
    const result = applyMove(assignments, 'c-1', 'martes', '14:00');
    expect(result[0].dia).toBe('lunes');    // unchanged
  });

  it('returns a new array (immutable)', () => {
    const assignments = [{ ...base }];
    const result = applyMove(assignments, 'c-1', 'martes', '14:00');
    expect(result).not.toBe(assignments);
  });
});

describe('buildUndoSnapshot', () => {
  it('returns a deep copy of assignments', () => {
    const assignments = [{ ...base }];
    const snap = buildUndoSnapshot(assignments);
    snap[0].dia = 'viernes';
    expect(assignments[0].dia).toBe('lunes'); // original unchanged
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run src/modules/horario-builder/__tests__/dragDropManager.test.js
```
Expected: FAIL — `Cannot find module '../components/DragDropManager.js'`

- [ ] **Step 3: Create DragDropManager.js**

```js
// src/modules/horario-builder/components/DragDropManager.js

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Returns a deep copy of assignments array — used for undo snapshots.
 */
export function buildUndoSnapshot(assignments) {
  return assignments.map(a => ({ ...a }));
}

/**
 * Applies a drag-drop move to the assignments array.
 * Preserves class duration. Ignores locked assignments.
 * Returns a NEW array (does not mutate the input).
 *
 * @param {Array}  assignments  - Current assignments
 * @param {string} claseId      - ID of the assignment being moved
 * @param {string} newDay       - Target day key (e.g. 'martes')
 * @param {string} newStartTime - Target start time (e.g. '14:00')
 * @returns {Array} New assignments array
 */
export function applyMove(assignments, claseId, newDay, newStartTime) {
  return assignments.map(a => {
    if (a.clase_id !== claseId || a.locked) return { ...a };
    const duration = timeToMinutes(a.hora_fin) - timeToMinutes(a.hora_inicio);
    const newStart = timeToMinutes(newStartTime);
    return {
      ...a,
      dia:        newDay,
      hora_inicio: newStartTime,
      hora_fin:   minutesToTime(newStart + duration)
    };
  });
}

/**
 * Attaches HTML5 Drag & Drop event listeners to the grid container.
 *
 * @param {HTMLElement} container - Element containing the grid
 * @param {Object} options
 * @param {Function} options.onDropAccepted  - Called with (claseId, newDay, newStartTime)
 *   when drop lands on a valid cell. Caller decides whether to show conflict modal.
 * @param {Function} options.onDragStart     - Called when drag starts (optional)
 * @param {Function} options.onDragEnd       - Called when drag ends (optional)
 */
export function attachDragDropListeners(container, { onDropAccepted, onDragStart, onDragEnd } = {}) {
  let draggingId = null;

  container.addEventListener('dragstart', e => {
    const block = e.target.closest('.schedule-block[draggable="true"]');
    if (!block) return;
    draggingId = block.dataset.claseId;
    block.style.opacity = '0.5';
    e.dataTransfer.setData('text/plain', draggingId);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(draggingId);
  });

  container.addEventListener('dragend', e => {
    const block = e.target.closest('.schedule-block');
    if (block) block.style.opacity = '';
    draggingId = null;
    // Clear all drop highlights
    container.querySelectorAll('.sg-cell.dd-over').forEach(c => c.classList.remove('dd-over'));
    onDragEnd?.();
  });

  container.addEventListener('dragover', e => {
    const cell = e.target.closest('.sg-cell');
    if (!cell || !draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    container.querySelectorAll('.sg-cell.dd-over').forEach(c => c.classList.remove('dd-over'));
    cell.classList.add('dd-over');
  });

  container.addEventListener('dragleave', e => {
    const cell = e.target.closest('.sg-cell');
    if (cell) cell.classList.remove('dd-over');
  });

  container.addEventListener('drop', e => {
    const cell = e.target.closest('.sg-cell');
    if (!cell || !draggingId) return;
    e.preventDefault();
    cell.classList.remove('dd-over');

    const claseId = e.dataTransfer.getData('text/plain');
    const newDay  = cell.dataset.day;
    const newSlot = cell.dataset.slot; // e.g. '10:00' — set by ScheduleGrid

    if (claseId && newDay && newSlot) {
      onDropAccepted?.(claseId, newDay, newSlot);
    }
  });
}

/**
 * Shows a conflict confirmation modal in the container.
 * Returns a Promise<boolean> — true if confirmed, false if cancelled.
 *
 * @param {HTMLElement} container
 * @param {Array} conflicts - Conflicts involving the dragged block
 * @returns {Promise<boolean>}
 */
export function showConflictModal(container, conflicts) {
  return new Promise(resolve => {
    const existing = document.getElementById('dd-conflict-modal');
    existing?.remove();

    const descriptions = conflicts.map(c =>
      `<li style="font-size:0.8rem;color:#374151;margin-bottom:0.25rem;">${c.description}</li>`
    ).join('');

    const modal = document.createElement('div');
    modal.id = 'dd-conflict-modal';
    modal.innerHTML = `
      <div style="
        position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9999;
        display:flex;align-items:center;justify-content:center;padding:1rem;
      ">
        <div style="
          background:#fff;border-radius:1rem;padding:1.5rem;max-width:420px;width:100%;
          box-shadow:0 20px 60px rgba(0,0,0,0.2);
        ">
          <h3 style="margin:0 0 0.5rem;font-size:1rem;font-weight:700;color:#dc2626;">
            <i class="bi bi-exclamation-triangle-fill"></i> Conflicto detectado
          </h3>
          <p style="font-size:0.8rem;color:#64748b;margin-bottom:0.75rem;">
            Este movimiento genera los siguientes conflictos:
          </p>
          <ul style="padding-left:1.25rem;margin-bottom:1rem;">${descriptions}</ul>
          <p style="font-size:0.8rem;color:#64748b;margin-bottom:1rem;">
            ¿Confirmar de todas formas? El bloque quedará marcado con conflicto.
          </p>
          <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
            <button id="dd-modal-cancel" class="btn btn-outline-secondary btn-sm" style="font-weight:700;">Cancelar</button>
            <button id="dd-modal-confirm" class="btn btn-danger btn-sm" style="font-weight:700;">Confirmar de todas formas</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#dd-modal-confirm').addEventListener('click', () => {
      modal.remove();
      resolve(true);
    });
    modal.querySelector('#dd-modal-cancel').addEventListener('click', () => {
      modal.remove();
      resolve(false);
    });
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/modules/horario-builder/__tests__/dragDropManager.test.js
```
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/horario-builder/components/DragDropManager.js src/modules/horario-builder/__tests__/dragDropManager.test.js
git commit -m "feat(horario-builder): add DragDropManager with applyMove, undo snapshot, conflict modal"
```

---

### Task 9: Wire drag & drop + undo/redo into the view

**Files:**
- Modify: `src/modules/horario-builder/views/horarioBuilderView.js`
- Modify: `src/modules/horario-builder/styles/horario-builder.css`

- [ ] **Step 1: Add drag & drop CSS to horario-builder.css**

Append to `src/modules/horario-builder/styles/horario-builder.css`:

```css
/* ── Sprint 2 additions ─────────────────────────── */

.sg-cell.dd-over {
  background: #dcfce7 !important;
  outline: 2px dashed #22c55e;
  outline-offset: -2px;
}

.schedule-block[draggable="true"] { cursor: grab; }
.schedule-block[draggable="true"]:active { cursor: grabbing; }

.hb-undo-bar {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}
```

- [ ] **Step 2: Add imports and undo stack to horarioBuilderView.js**

At the top of `src/modules/horario-builder/views/horarioBuilderView.js`, add after the existing imports:

```js
import { attachDragDropListeners, applyMove, buildUndoSnapshot, showConflictModal } from '../components/DragDropManager.js';
```

In the state object `S`, add two new fields after `runId: null`:

```js
  undoStack: [],   // array of assignment snapshots (max 20)
  redoStack: []    // array of assignment snapshots for redo
```

- [ ] **Step 3: Add undo/redo buttons to the top bar in _render()**

In `_render()`, find the config row div and add inside it (after the `hb-btn-save-draft` button):

```js
${S.assignments.length > 0 ? `
  <div class="hb-undo-bar" style="align-self:flex-end;">
    <button id="hb-btn-undo" class="btn btn-outline-secondary btn-sm" ${S.undoStack.length === 0 ? 'disabled' : ''} style="font-weight:700;border-radius:8px;" title="Deshacer (Ctrl+Z)">
      <i class="bi bi-arrow-counterclockwise"></i>
    </button>
    <button id="hb-btn-redo" class="btn btn-outline-secondary btn-sm" ${S.redoStack.length === 0 ? 'disabled' : ''} style="font-weight:700;border-radius:8px;" title="Rehacer (Ctrl+Y)">
      <i class="bi bi-arrow-clockwise"></i>
    </button>
  </div>
` : ''}
```

Also update the `createScheduleGrid` call in `_render()` to pass `draggable: S.estado !== 'publicado'`.

- [ ] **Step 4: Add lock button to ScheduleBlock**

In `src/modules/horario-builder/components/ScheduleBlock.js`, update the header bar HTML inside `createScheduleBlock` to add a lock toggle button when `draggable` is true:

```js
// Replace the lockIcon span line with:
const lockBtn = draggable
  ? `<button class="sb-lock-btn" data-clase-id="${clase_id}" data-locked="${locked}"
              style="background:none;border:none;cursor:pointer;padding:0;font-size:0.65rem;line-height:1;"
              title="${locked ? 'Desbloquear' : 'Bloquear'}">
       ${locked ? '🔒' : '🔓'}
     </button>`
  : (locked ? '<span class="sb-lock-icon">🔒</span>' : '');
```

Replace `${lockIcon}` in the template with `${lockBtn}`.

- [ ] **Step 5: Add event handlers in _attachListeners()**

Append to the `_attachListeners()` function body in `horarioBuilderView.js`:

```js
  // Undo / Redo buttons
  _container.querySelector('#hb-btn-undo')?.addEventListener('click', _handleUndo);
  _container.querySelector('#hb-btn-redo')?.addEventListener('click', _handleRedo);

  // Keyboard undo/redo
  const keyHandler = (e) => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); _handleUndo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); _handleRedo(); }
  };
  document.addEventListener('keydown', keyHandler);
  // Store for cleanup on next render
  _container._keyHandler = keyHandler;

  // Lock toggle
  _container.addEventListener('click', e => {
    const btn = e.target.closest('.sb-lock-btn');
    if (!btn) return;
    const id = btn.dataset.claseId;
    const isLocked = btn.dataset.locked === 'true';
    _saveUndo();
    S.assignments = S.assignments.map(a =>
      a.clase_id === id ? { ...a, locked: !isLocked } : a
    );
    _render();
  });

  // Drag & Drop (only on grid view, not room/student)
  if (S.activeView === 'grid' || S.activeView === 'teacher') {
    const gridArea = _container.querySelector('#hb-grid-area');
    if (gridArea) {
      attachDragDropListeners(gridArea, {
        onDropAccepted: async (claseId, newDay, newSlot) => {
          const proposed = applyMove(S.assignments, claseId, newDay, newSlot);
          const { conflicts } = detectConflicts(proposed, {
            returnAnnotated: false,
            gapMinutes: S.config.gapMinimo
          });
          const movingConflicts = conflicts.filter(c => c.ids.includes(claseId));

          if (movingConflicts.length > 0) {
            const confirmed = await showConflictModal(_container, movingConflicts);
            if (!confirmed) return;
          }

          _saveUndo();
          S.assignments = proposed;
          _recomputeConflicts();
          _showToast('Clase movida', 'warning');
          _refreshGridArea();
          _refreshConflictPanel();
        }
      });
    }
  }
```

- [ ] **Step 6: Add _handleUndo, _handleRedo, _saveUndo, _refreshConflictPanel helpers**

Add these functions to `horarioBuilderView.js` (in the HELPERS section):

```js
function _saveUndo() {
  S.undoStack.push(buildUndoSnapshot(S.assignments));
  if (S.undoStack.length > 20) S.undoStack.shift();
  S.redoStack = []; // clear redo on new action
}

function _handleUndo() {
  if (S.undoStack.length === 0) return;
  S.redoStack.push(buildUndoSnapshot(S.assignments));
  S.assignments = S.undoStack.pop();
  _recomputeConflicts();
  _render();
}

function _handleRedo() {
  if (S.redoStack.length === 0) return;
  S.undoStack.push(buildUndoSnapshot(S.assignments));
  S.assignments = S.redoStack.pop();
  _recomputeConflicts();
  _render();
}

function _refreshConflictPanel() {
  const wrapper = _container.querySelector('#hb-conflict-panel-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = createConflictPanel(S.conflicts);
  attachConflictPanelListeners(wrapper, ids => _highlightBlocks(ids));
}
```

- [ ] **Step 7: Run all tests**

```bash
npx vitest run src/modules/horario-builder/__tests__/
```
Expected: all tests PASS

- [ ] **Step 8: Manual verification in browser**

```bash
npm run dev
```
Verify:
- Generate a schedule, then drag a block to a different slot → it moves
- Dragging to a conflicting slot shows the modal; Cancel reverts, Confirm moves with red border
- Ctrl+Z undoes the last move; Ctrl+Y redoes it
- Lock icon on block prevents dragging; unlock restores it

- [ ] **Step 9: Commit**

```bash
git add src/modules/horario-builder/views/horarioBuilderView.js src/modules/horario-builder/components/ScheduleBlock.js src/modules/horario-builder/styles/horario-builder.css
git commit -m "feat(horario-builder): wire drag & drop, undo/redo stack, and block locking (Sprint 2 complete)"
```

---

## ═══════════════════════════════════════
## SPRINT 3 — Audience Views + Publication
## ═══════════════════════════════════════

---

### Task 10: DB migration for Sprint 3

**Files:**
- No code files — manual SQL migration

- [ ] **Step 1: Run this SQL in the Supabase SQL Editor for project `zmhmdvmyeyswunurcyow`**

```sql
-- Feedback from teachers on a schedule in 'revision' state
CREATE TABLE IF NOT EXISTS schedule_run_feedback (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id     uuid NOT NULL REFERENCES schedule_runs(id) ON DELETE CASCADE,
  maestro_id uuid REFERENCES maestros(id),
  comentario text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Timestamps for state transitions
ALTER TABLE schedule_runs
  ADD COLUMN IF NOT EXISTS revision_at  timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- RLS: teachers can insert feedback for runs in 'revision'
ALTER TABLE schedule_run_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can insert feedback" ON schedule_run_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM schedule_runs sr
      WHERE sr.id = run_id AND sr.estado = 'revision'
    )
  );

CREATE POLICY "Admin can read all feedback" ON schedule_run_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM maestros m WHERE m.id = auth.uid() AND m.es_admin = true
    )
  );
```

- [ ] **Step 2: Verify migration by checking the table exists**

In Supabase SQL Editor:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'schedule_run_feedback';
```
Expected: rows for `id`, `run_id`, `maestro_id`, `comentario`, `created_at`

- [ ] **Step 3: Commit a migration record file**

```bash
cat > src/modules/horario-builder/migrations/2026-05-25-schedule-feedback.sql << 'EOF'
-- Sprint 3: schedule_run_feedback table + estado transition timestamps
-- Applied to Supabase project zmhmdvmyeyswunurcyow on 2026-05-25

CREATE TABLE IF NOT EXISTS schedule_run_feedback (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id     uuid NOT NULL REFERENCES schedule_runs(id) ON DELETE CASCADE,
  maestro_id uuid REFERENCES maestros(id),
  comentario text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedule_runs
  ADD COLUMN IF NOT EXISTS revision_at  timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE schedule_run_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can insert feedback" ON schedule_run_feedback
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM schedule_runs sr WHERE sr.id = run_id AND sr.estado = 'revision')
  );

CREATE POLICY "Admin can read all feedback" ON schedule_run_feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM maestros m WHERE m.id = auth.uid() AND m.es_admin = true)
  );
EOF
git add src/modules/horario-builder/migrations/
git commit -m "chore(horario-builder): add Sprint 3 DB migration record for schedule_run_feedback"
```

---

### Task 11: scheduleFeedbackApi.js — Feedback CRUD

**Files:**
- Create: `src/modules/horario-builder/api/scheduleFeedbackApi.js`

- [ ] **Step 1: Create scheduleFeedbackApi.js**

```js
// src/modules/horario-builder/api/scheduleFeedbackApi.js
import { supabase } from '../../../lib/supabaseClient.js';
import { config } from '../../../core/config/config.js';

let mockFeedback = [];

/**
 * Saves teacher feedback for a schedule run in 'revision' state.
 * @param {string} runId
 * @param {string} maestroId
 * @param {string} comentario
 */
export async function saveFeedback(runId, maestroId, comentario) {
  if (config.isDemoMode) {
    const entry = { id: `fb-${Date.now()}`, run_id: runId, maestro_id: maestroId, comentario, created_at: new Date().toISOString() };
    mockFeedback.push(entry);
    return entry;
  }

  const { data, error } = await supabase
    .from('schedule_run_feedback')
    .insert([{ run_id: runId, maestro_id: maestroId, comentario }])
    .select()
    .single();

  if (error) throw new Error('No se pudo guardar el feedback: ' + error.message);
  return data;
}

/**
 * Fetches all feedback for a given run.
 * @param {string} runId
 * @returns {Array} feedback rows
 */
export async function getFeedbackForRun(runId) {
  if (config.isDemoMode) {
    return mockFeedback.filter(f => f.run_id === runId);
  }

  const { data, error } = await supabase
    .from('schedule_run_feedback')
    .select('*, maestros(nombre)')
    .eq('run_id', runId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudo cargar el feedback: ' + error.message);
  return data ?? [];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/horario-builder/api/scheduleFeedbackApi.js
git commit -m "feat(horario-builder): add scheduleFeedbackApi for Sprint 3 teacher feedback"
```

---

### Task 12: PublishWizard.js — 3-stage publication UI

**Files:**
- Create: `src/modules/horario-builder/components/PublishWizard.js`

- [ ] **Step 1: Create PublishWizard.js**

```js
// src/modules/horario-builder/components/PublishWizard.js

const ESTADO_CONFIG = {
  borrador:  { icon: '📋', label: 'Borrador',     color: '#92400e', bg: '#fef9c3', border: '#f59e0b' },
  revision:  { icon: '🔍', label: 'En revisión',  color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' },
  publicado: { icon: '✅', label: 'Publicado',    color: '#15803d', bg: '#dcfce7', border: '#22c55e' }
};

/**
 * Returns HTML for the publish wizard bar.
 * Shows the current state and the available next action.
 *
 * @param {Object} params
 * @param {string}   params.estado      - 'borrador' | 'revision' | 'publicado'
 * @param {string}   params.runId       - Current schedule_run id (null if not saved yet)
 * @param {Array}    params.feedback    - Array of feedback objects (for 'revision' state)
 * @param {number}   params.conflictCount - Number of active conflicts
 * @returns {string} HTML string
 */
export function createPublishWizard({ estado = 'borrador', runId, feedback = [], conflictCount = 0 }) {
  const stages = ['borrador', 'revision', 'publicado'];

  const stageIndicator = stages.map((s, i) => {
    const cfg = ESTADO_CONFIG[s];
    const isActive  = s === estado;
    const isPast    = stages.indexOf(estado) > i;
    return `
      <div style="display:flex;align-items:center;gap:0.4rem;">
        <span style="
          display:inline-flex;align-items:center;justify-content:center;
          width:28px;height:28px;border-radius:50%;font-size:0.8rem;
          background:${isActive ? cfg.bg : isPast ? '#dcfce7' : '#f1f5f9'};
          border:2px solid ${isActive ? cfg.border : isPast ? '#22c55e' : '#e2e8f0'};
        ">${isPast ? '✓' : cfg.icon}</span>
        <span style="font-size:0.75rem;font-weight:${isActive ? 700 : 500};color:${isActive ? cfg.color : '#94a3b8'};">${cfg.label}</span>
        ${i < stages.length - 1 ? '<span style="color:#e2e8f0;margin:0 0.25rem;">→</span>' : ''}
      </div>
    `;
  }).join('');

  let actionArea = '';

  if (estado === 'borrador') {
    const blockedByConflicts = conflictCount > 0;
    actionArea = `
      <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
        ${blockedByConflicts ? `<span style="font-size:0.75rem;color:#dc2626;font-weight:600;">⚠ Hay ${conflictCount} conflicto${conflictCount !== 1 ? 's' : ''}. Resuélvelos antes de enviar a revisión.</span>` : ''}
        <button id="pw-btn-to-revision"
                class="btn btn-primary btn-sm"
                ${!runId || blockedByConflicts ? 'disabled' : ''}
                style="font-weight:700;border-radius:8px;"
                title="${!runId ? 'Guardá el borrador primero' : blockedByConflicts ? 'Resolvé los conflictos primero' : ''}">
          <i class="bi bi-send"></i> Enviar a revisión
        </button>
      </div>
    `;
  }

  if (estado === 'revision') {
    const feedbackRows = feedback.length
      ? feedback.map(f => `
          <div style="padding:0.4rem 0;border-bottom:1px solid #e2e8f0;font-size:0.75rem;color:#374151;">
            <strong>${f.maestros?.nombre ?? 'Maestro'}</strong>: ${f.comentario}
            <span style="font-size:0.65rem;color:#94a3b8;margin-left:0.5rem;">${new Date(f.created_at).toLocaleDateString()}</span>
          </div>`).join('')
      : `<p style="font-size:0.75rem;color:#94a3b8;margin:0;">Sin comentarios todavía.</p>`;

    actionArea = `
      <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.75rem;max-height:160px;overflow-y:auto;">
          <div style="font-size:0.72rem;font-weight:700;color:#374151;margin-bottom:0.35rem;">
            💬 Feedback de maestros (${feedback.length})
          </div>
          ${feedbackRows}
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button id="pw-btn-back-to-draft" class="btn btn-outline-secondary btn-sm" style="font-weight:700;border-radius:8px;">
            <i class="bi bi-arrow-left"></i> Volver a borrador
          </button>
          <button id="pw-btn-publish" class="btn btn-success btn-sm" style="font-weight:700;border-radius:8px;">
            <i class="bi bi-check2-circle"></i> Publicar y notificar maestros
          </button>
        </div>
      </div>
    `;
  }

  if (estado === 'publicado') {
    actionArea = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:0.8rem;color:#15803d;font-weight:700;">
          ✅ Horario publicado. Los maestros ya fueron notificados.
        </span>
        <button id="pw-btn-new-period" class="btn btn-outline-primary btn-sm" style="font-weight:700;border-radius:8px;">
          <i class="bi bi-plus-circle"></i> Nuevo período
        </button>
      </div>
    `;
  }

  return `
    <div id="publish-wizard" style="
      margin-top:1rem;padding:1rem;
      border:1.5px solid ${ESTADO_CONFIG[estado].border};
      border-radius:0.75rem;
      background:${ESTADO_CONFIG[estado].bg};
    ">
      <!-- Stage indicator -->
      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem;">
        ${stageIndicator}
      </div>
      <!-- Action area -->
      ${actionArea}
    </div>
  `;
}

/**
 * Attaches event listeners to the PublishWizard DOM element.
 *
 * @param {HTMLElement} container - Parent element containing the wizard
 * @param {Object} callbacks
 * @param {Function} callbacks.onSendToReview  - () => Promise<void>
 * @param {Function} callbacks.onBackToDraft   - () => Promise<void>
 * @param {Function} callbacks.onPublish       - () => Promise<void>
 * @param {Function} callbacks.onNewPeriod     - () => void
 */
export function attachPublishWizardListeners(container, { onSendToReview, onBackToDraft, onPublish, onNewPeriod }) {
  container.querySelector('#pw-btn-to-revision')?.addEventListener('click', async () => {
    const btn = container.querySelector('#pw-btn-to-revision');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    try { await onSendToReview?.(); } finally { btn.disabled = false; }
  });

  container.querySelector('#pw-btn-back-to-draft')?.addEventListener('click', async () => {
    await onBackToDraft?.();
  });

  container.querySelector('#pw-btn-publish')?.addEventListener('click', async () => {
    const btn = container.querySelector('#pw-btn-publish');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Publicando...';
    try { await onPublish?.(); } finally { btn.disabled = false; }
  });

  container.querySelector('#pw-btn-new-period')?.addEventListener('click', () => {
    onNewPeriod?.();
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/horario-builder/components/PublishWizard.js
git commit -m "feat(horario-builder): add PublishWizard 3-stage publication component"
```

---

### Task 13: Wire PublishWizard into horarioBuilderView.js

**Files:**
- Modify: `src/modules/horario-builder/views/horarioBuilderView.js`
- Modify: `src/modules/horario-builder/api/horarioBuilderApi.js`

- [ ] **Step 1: Add saveScheduleRun estado transitions to horarioBuilderApi.js**

Open `src/modules/horario-builder/api/horarioBuilderApi.js` and add this function after `getScheduleRuns`:

```js
/**
 * Transitions a schedule run to a new estado.
 * @param {string} runId
 * @param {'revision'|'publicado'|'borrador'} newEstado
 */
export async function updateScheduleRunEstado(runId, newEstado) {
  const timestampField = newEstado === 'revision' ? 'revision_at'
    : newEstado === 'publicado' ? 'published_at'
    : null;

  if (config.isDemoMode) {
    const run = mockRuns.find(r => r.id === runId);
    if (run) {
      run.estado = newEstado;
      if (timestampField) run[timestampField] = new Date().toISOString();
    }
    return run ?? { id: runId, estado: newEstado };
  }

  const updates = { estado: newEstado };
  if (timestampField) updates[timestampField] = new Date().toISOString();

  const { data, error } = await supabase
    .from('schedule_runs')
    .update(updates)
    .eq('id', runId)
    .select()
    .single();

  if (error) throw new Error('Error al actualizar estado del horario: ' + error.message);
  return data;
}
```

- [ ] **Step 2: Add wizard imports and integration to horarioBuilderView.js**

Add imports at top of `horarioBuilderView.js`:

```js
import { createPublishWizard, attachPublishWizardListeners } from '../components/PublishWizard.js';
import { getFeedbackForRun, saveFeedback } from '../api/scheduleFeedbackApi.js';
import { updateScheduleRunEstado } from '../api/horarioBuilderApi.js';
```

Add `feedback: []` to state `S`.

- [ ] **Step 3: Replace the publish area placeholder in _render()**

Replace the `<div id="hb-publish-area"></div>` line in `_render()` with:

```js
<!-- Publish Wizard (only when there's a saved run) -->
${S.runId ? createPublishWizard({
  estado:        S.estado,
  runId:         S.runId,
  feedback:      S.feedback,
  conflictCount: S.conflicts.length
}) : ''}
```

- [ ] **Step 4: Add _attachPublishListeners() call in _attachListeners()**

Append at end of `_attachListeners()`:

```js
  // Publish Wizard
  const publishArea = _container.querySelector('#publish-wizard');
  if (publishArea) {
    attachPublishWizardListeners(_container, {
      onSendToReview:  _handleSendToReview,
      onBackToDraft:   _handleBackToDraft,
      onPublish:       _handlePublish,
      onNewPeriod:     _handleNewPeriod
    });
  }
```

- [ ] **Step 5: Add the handler functions to horarioBuilderView.js**

```js
async function _handleSendToReview() {
  try {
    await updateScheduleRunEstado(S.runId, 'revision');
    S.estado = 'revision';
    S.feedback = [];
    _showToast('Horario enviado a revisión. Los maestros ya pueden verlo.', 'success');
    _render();
  } catch (err) {
    _showToast(err.message, 'danger');
  }
}

async function _handleBackToDraft() {
  try {
    await updateScheduleRunEstado(S.runId, 'borrador');
    S.estado = 'borrador';
    _showToast('Volviste a modo borrador.', 'warning');
    _render();
  } catch (err) {
    _showToast(err.message, 'danger');
  }
}

async function _handlePublish() {
  try {
    // 1. Apply assignments to clase_horarios
    await applyScheduleRun(S.runId, S.assignments);
    // 2. Transition to 'publicado'
    await updateScheduleRunEstado(S.runId, 'publicado');
    S.estado = 'publicado';
    _showToast('¡Horario publicado! Los maestros han sido notificados.', 'success');
    _render();
  } catch (err) {
    _showToast(err.message, 'danger');
  }
}

function _handleNewPeriod() {
  // Reset state for a new scheduling run
  S.assignments = [];
  S.conflicts   = [];
  S.estado      = 'borrador';
  S.runId       = null;
  S.feedback    = [];
  S.undoStack   = [];
  S.redoStack   = [];
  _showToast('Listo para un nuevo período.', 'success');
  _render();
}
```

Also update `_handleSaveDraft` to load feedback when the run already has a `revision` state:

```js
// At the end of _handleSaveDraft, after S.runId = run.id:
if (S.estado === 'revision') {
  S.feedback = await getFeedbackForRun(S.runId).catch(() => []);
}
```

- [ ] **Step 6: Run all tests**

```bash
npx vitest run src/modules/horario-builder/__tests__/
```
Expected: all tests PASS

- [ ] **Step 7: Manual verification in browser**

```bash
npm run dev
```
Verify Sprint 3:
- Generate schedule → save draft → button "Enviar a revisión" appears
- Conflicts block the send button with an explanatory message
- After sending to revision, wizard shows feedback section
- "Publicar" button applies and transitions to published state
- Published state is read-only (no drag handles)
- "Nuevo período" resets everything

- [ ] **Step 8: Final commit**

```bash
git add src/modules/horario-builder/views/horarioBuilderView.js \
        src/modules/horario-builder/api/horarioBuilderApi.js \
        src/modules/horario-builder/api/scheduleFeedbackApi.js
git commit -m "feat(horario-builder): wire PublishWizard with 3-stage publication flow (Sprint 3 complete)"
```

---

## Final verification checklist

- [ ] `npx vitest run src/modules/horario-builder/__tests__/` — all tests green
- [ ] No references to the old `hashStringToColor` in `horarioBuilderView.js` (now in `colorMap.js`)
- [ ] No references to old `reevaluateConflicts` in `horarioBuilderView.js` (now in `conflictDetector.js`)
- [ ] View toggle switches between all 4 modes without errors
- [ ] Drag & drop works on grid and teacher swimlane views
- [ ] Conflict modal appears on conflicting drops; cancel reverts, confirm applies with red border
- [ ] Ctrl+Z / Ctrl+Y undo/redo work
- [ ] Lock button prevents drag
- [ ] Publish wizard blocked by conflicts; works when clean
- [ ] Export PDF and Excel still work in all views
