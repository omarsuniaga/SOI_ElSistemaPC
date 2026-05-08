# Academic Route — Class Content Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable teachers to select, modify, and confirm academic content for each class session based on their planning, with structured methodology notes and homework assignment. The module is instrument/area-agnostic — works for violin, viola, theory, ensemble, or any discipline that uses a route-based academic plan.

**Architecture:** Extends existing academic module with 3 new DB tables, content selection UI in asistenciaView, methodology form component, and homework assignment flow. Routes are resolved dynamically per student's active academic plan, not hardcoded to any instrument.

**Tech Stack:** Vanilla JS + Supabase + Vitest

---

## Task 1: DB Migration — class_events + class_event_methodology + homework_assignments

**File:** `supabase/migrations/20260507_class_events_schema.sql`

> **NOTE:** Use the Supabase MCP tool `execute_sql` to apply migrations, project ref is `oblfrylhfgibbejrtoqd`.

### Steps

- [ ] **1.1** Create migration file `supabase/migrations/20260507_class_events_schema.sql` with the following SQL:

```sql
-- ============================================================
-- Migration: class_events + class_event_methodology + homework_assignments
-- Date: 2026-05-07
-- ============================================================

-- 1. class_events — explicit event record per session+student
CREATE TABLE IF NOT EXISTS public.class_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  academic_plan_id uuid REFERENCES public.academic_plans(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.sesiones_clase(id) ON DELETE SET NULL,
  level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_class_events_teacher ON public.class_events(teacher_id);
CREATE INDEX idx_class_events_student ON public.class_events(student_id);
CREATE INDEX idx_class_events_session ON public.class_events(session_id);
CREATE INDEX idx_class_events_date ON public.class_events(event_date);
CREATE UNIQUE INDEX idx_class_events_session_student ON public.class_events(session_id, student_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_class_events_updated_at
  BEFORE UPDATE ON public.class_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.class_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own class events"
  ON public.class_events FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own class events"
  ON public.class_events FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own class events"
  ON public.class_events FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own class events"
  ON public.class_events FOR DELETE
  USING (teacher_id = auth.uid());

-- 2. class_event_methodology — structured methodology form
CREATE TABLE IF NOT EXISTS public.class_event_methodology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_event_id uuid NOT NULL REFERENCES public.class_events(id) ON DELETE CASCADE,
  warmup text,
  sound_focus text,
  intonation_focus text,
  main_node_id uuid REFERENCES public.nodes(id) ON DELETE SET NULL,
  technical_focus text,
  study_used text,
  repertoire_used text,
  sight_reading_work text,
  ear_training_work text,
  closing_observation text,
  homework_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_methodology_event ON public.class_event_methodology(class_event_id);

ALTER TABLE public.class_event_methodology ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage methodology via class_events"
  ON public.class_event_methodology FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.class_events ce
      WHERE ce.id = class_event_id AND ce.teacher_id = auth.uid()
    )
  );

-- 3. homework_assignments — formal homework with due date
CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_event_id uuid NOT NULL REFERENCES public.class_events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  node_id uuid REFERENCES public.nodes(id) ON DELETE SET NULL,
  description text NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed', 'overdue')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_homework_student ON public.homework_assignments(student_id);
CREATE INDEX idx_homework_teacher ON public.homework_assignments(teacher_id);
CREATE INDEX idx_homework_event ON public.homework_assignments(class_event_id);
CREATE INDEX idx_homework_due_date ON public.homework_assignments(due_date);

ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own homework"
  ON public.homework_assignments FOR ALL
  USING (teacher_id = auth.uid());
```

- [ ] **1.2** Apply migration via Supabase MCP `execute_sql` with project ref `oblfrylhfgibbejrtoqd`.

- [ ] **1.3** Verify tables exist by running `SELECT table_name FROM information_schema.tables WHERE table_name IN ('class_events', 'class_event_methodology', 'homework_assignments');` via `execute_sql`.

- [ ] **1.4** Commit: `feat(db): add class_events, methodology, and homework tables`

---

## Task 2: classEventService.js — Service layer for class events

**File:** `src/portal-maestros/services/classEventService.js`
**Test:** `tests/portal-maestros/classEventService.test.js`

### Steps

- [ ] **2.1** Write failing tests in `tests/portal-maestros/classEventService.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

import {
  generateClassEvent,
  getClassEvent,
  saveMethodology,
  updateClassEventStatus,
  assignHomework,
} from '../../src/portal-maestros/services/classEventService.js'

describe('classEventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateClassEvent', () => {
    it('should be a function', () => {
      expect(typeof generateClassEvent).toBe('function')
    })

    it('should require studentId, teacherId, sessionId', async () => {
      await expect(generateClassEvent({})).rejects.toThrow()
    })
  })

  describe('getClassEvent', () => {
    it('should be a function', () => {
      expect(typeof getClassEvent).toBe('function')
    })
  })

  describe('saveMethodology', () => {
    it('should be a function', () => {
      expect(typeof saveMethodology).toBe('function')
    })
  })

  describe('updateClassEventStatus', () => {
    it('should be a function', () => {
      expect(typeof updateClassEventStatus).toBe('function')
    })
  })

  describe('assignHomework', () => {
    it('should be a function', () => {
      expect(typeof assignHomework).toBe('function')
    })

    it('should require description', async () => {
      await expect(
        assignHomework({ classEventId: '1', studentId: '2', teacherId: '3' })
      ).rejects.toThrow()
    })
  })
})
```

- [ ] **2.2** Run tests to confirm they fail: `npx vitest run tests/portal-maestros/classEventService.test.js`

- [ ] **2.3** Create `src/portal-maestros/services/classEventService.js`:

```js
/**
 * classEventService — CRUD for class events, methodology, and homework.
 *
 * Follows DataAdapter pattern: all Supabase calls here, UI never touches DB directly.
 */
import { supabase } from '../../lib/supabaseClient.js'

/**
 * Generate a class event for a student in a session.
 * Finds active plan → current level → pending/in_process nodes → last homework.
 *
 * @param {{ studentId: string, teacherId: string, sessionId: string, academicPlanId?: string }} params
 * @returns {Promise<{ classEventId: string, level: object|null, activeNodes: object[], suggestedNodes: object[], lastHomework: object|null }>}
 */
export async function generateClassEvent({ studentId, teacherId, sessionId, academicPlanId }) {
  if (!studentId || !teacherId || !sessionId) {
    throw new Error('studentId, teacherId, and sessionId are required')
  }

  // 1. Find active academic plan if not provided
  let planId = academicPlanId
  if (!planId) {
    const { data: plan } = await supabase
      .from('academic_plans')
      .select('id')
      .eq('student_id', studentId)
      .eq('teacher_id', teacherId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    planId = plan?.id || null
  }

  // 2. Find current level (first non-approved)
  let level = null
  let activeNodes = []
  let suggestedNodes = []

  if (planId) {
    const { data: progress } = await supabase
      .from('student_level_progress')
      .select('*, levels(*)')
      .eq('student_id', studentId)
      .in('status', ['pending', 'in_process'])
      .order('levels(position)', { ascending: true })
      .limit(1)
      .maybeSingle()

    level = progress?.levels || null
    const levelId = level?.id

    if (levelId) {
      // 3. Get pending/in_process nodes for this level
      const { data: nodeProgress } = await supabase
        .from('student_node_progress')
        .select('*, nodes(*, indicators(*))')
        .eq('student_id', studentId)
        .eq('nodes.level_id', levelId)
        .in('status', ['pending', 'in_process'])

      activeNodes = (nodeProgress || []).map(np => ({
        ...np.nodes,
        progressStatus: np.status,
      }))
      suggestedNodes = activeNodes.slice(0, 3) // suggest first 3
    }
  }

  // 4. Get last homework
  const { data: lastHw } = await supabase
    .from('homework_assignments')
    .select('*')
    .eq('student_id', studentId)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 5. Check for existing class event for this session+student
  const { data: existing } = await supabase
    .from('class_events')
    .select('id')
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle()

  let classEventId = existing?.id

  if (!classEventId) {
    // 6. Create class_events record as draft
    const { data: created, error } = await supabase
      .from('class_events')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        session_id: sessionId,
        academic_plan_id: planId,
        level_id: level?.id || null,
        status: 'draft',
      })
      .select('id')
      .single()

    if (error) throw error
    classEventId = created.id
  }

  return {
    classEventId,
    level,
    activeNodes,
    suggestedNodes,
    lastHomework: lastHw || null,
  }
}

/**
 * Get an existing class event for a session+student.
 * @param {string} sessionId
 * @param {string} studentId
 * @returns {Promise<object|null>}
 */
export async function getClassEvent(sessionId, studentId) {
  const { data } = await supabase
    .from('class_events')
    .select('*, class_event_methodology(*), homework_assignments(*)')
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle()

  return data
}

/**
 * Save or update methodology for a class event (upsert on class_event_id).
 * @param {string} classEventId
 * @param {object} methodologyData
 * @returns {Promise<{ data: object, error: object }>}
 */
export async function saveMethodology(classEventId, methodologyData) {
  if (!classEventId) throw new Error('classEventId is required')

  const { data: existing } = await supabase
    .from('class_event_methodology')
    .select('id')
    .eq('class_event_id', classEventId)
    .maybeSingle()

  if (existing) {
    return supabase
      .from('class_event_methodology')
      .update(methodologyData)
      .eq('class_event_id', classEventId)
      .select()
      .single()
  }

  return supabase
    .from('class_event_methodology')
    .insert({ class_event_id: classEventId, ...methodologyData })
    .select()
    .single()
}

/**
 * Update class event status.
 * @param {string} classEventId
 * @param {'draft'|'completed'|'cancelled'} status
 */
export async function updateClassEventStatus(classEventId, status) {
  if (!classEventId) throw new Error('classEventId is required')

  const { data, error } = await supabase
    .from('class_events')
    .update({ status })
    .eq('id', classEventId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Assign homework from a class event.
 * @param {{ classEventId: string, studentId: string, teacherId: string, description: string, dueDate?: string, nodeId?: string }} params
 */
export async function assignHomework({ classEventId, studentId, teacherId, description, dueDate, nodeId }) {
  if (!description) throw new Error('description is required')
  if (!classEventId || !studentId || !teacherId) {
    throw new Error('classEventId, studentId, and teacherId are required')
  }

  const { data, error } = await supabase
    .from('homework_assignments')
    .insert({
      class_event_id: classEventId,
      student_id: studentId,
      teacher_id: teacherId,
      description,
      due_date: dueDate || null,
      node_id: nodeId || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

- [ ] **2.4** Run tests to confirm they pass: `npx vitest run tests/portal-maestros/classEventService.test.js`

- [ ] **2.5** Commit: `feat(services): add classEventService for class events CRUD`

---

## Task 3: ContentSelectionPanel — Teacher picks session content

**File:** `src/portal-maestros/components/ContentSelectionPanel.js`

### Steps

- [ ] **3.1** Create `src/portal-maestros/components/ContentSelectionPanel.js`:

```js
/**
 * ContentSelectionPanel — Teacher selects/modifies academic content for a class session.
 *
 * Shows suggested nodes from the academic plan with checkboxes.
 * Teacher can toggle nodes on/off and confirm selection.
 */
import { escHTML } from '../utils/portalUtils.js'
import { generateClassEvent } from '../services/classEventService.js'

/**
 * @param {{ sessionId: string, studentId: string, teacherId: string, onConfirm: (selected) => void }} opts
 * @returns {{ el: HTMLElement, refresh: () => Promise<void>, destroy: () => void, getSelectedNodes: () => object[] }}
 */
export function createContentSelectionPanel({ sessionId, studentId, teacherId, onConfirm }) {
  const el = document.createElement('div')
  el.className = 'pm-content-panel'

  let classEventData = null
  let selectedNodeIds = new Set()
  let allNodes = []

  async function load() {
    el.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

    try {
      classEventData = await generateClassEvent({ studentId, teacherId, sessionId })
      allNodes = classEventData.activeNodes || []
      const suggested = classEventData.suggestedNodes || []
      selectedNodeIds = new Set(suggested.map(n => n.id))

      render()
    } catch (err) {
      el.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error: ${escHTML(err.message)}</p>`
    }
  }

  function render() {
    const levelName = classEventData?.level?.name || 'Sin nivel activo'
    const lastHw = classEventData?.lastHomework

    el.innerHTML = `
      <div class="pm-content-panel-header">
        <h4 class="pm-content-panel-title">
          <i class="bi bi-journal-check"></i> Contenido de Clase
        </h4>
        <span class="pm-content-panel-level">${escHTML(levelName)}</span>
      </div>

      ${lastHw ? `
        <div class="pm-content-panel-homework-reminder">
          <i class="bi bi-arrow-return-right"></i>
          <span>Tarea anterior: ${escHTML(lastHw.description)}</span>
          <span class="pm-badge pm-badge-${lastHw.status === 'completed' ? 'success' : 'warning'}">${lastHw.status}</span>
        </div>
      ` : ''}

      <div class="pm-content-panel-nodes" id="pm-content-nodes">
        ${allNodes.length === 0
          ? `<p class="pm-empty">No hay nodos pendientes en el nivel actual.</p>`
          : allNodes.map(node => `
            <label class="pm-content-panel-node ${selectedNodeIds.has(node.id) ? 'selected' : ''}" data-node-id="${node.id}">
              <input type="checkbox" ${selectedNodeIds.has(node.id) ? 'checked' : ''} />
              <div class="pm-content-panel-node-info">
                <span class="pm-content-panel-node-name">${escHTML(node.name)}</span>
                <span class="pm-content-panel-node-status pm-badge pm-badge-${node.progressStatus === 'in_process' ? 'warning' : 'muted'}">
                  ${node.progressStatus === 'in_process' ? 'En proceso' : 'Pendiente'}
                </span>
              </div>
              ${(node.indicators || []).length > 0 ? `
                <details class="pm-content-panel-indicators">
                  <summary>${node.indicators.length} indicadores</summary>
                  <ul>
                    ${node.indicators.map(ind => `<li>${escHTML(ind.name)}</li>`).join('')}
                  </ul>
                </details>
              ` : ''}
            </label>
          `).join('')}
      </div>

      <button class="pm-btn pm-btn-primary pm-btn-block" id="pm-content-confirm" ${allNodes.length === 0 ? 'disabled' : ''}>
        Confirmar Contenido (${selectedNodeIds.size})
      </button>
    `

    // Wire checkbox events
    el.querySelectorAll('.pm-content-panel-node input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const nodeId = e.target.closest('[data-node-id]').dataset.nodeId
        if (e.target.checked) {
          selectedNodeIds.add(nodeId)
        } else {
          selectedNodeIds.delete(nodeId)
        }
        // Update label styling
        e.target.closest('.pm-content-panel-node').classList.toggle('selected', e.target.checked)
        // Update button count
        const btn = el.querySelector('#pm-content-confirm')
        if (btn) btn.textContent = `Confirmar Contenido (${selectedNodeIds.size})`
      })
    })

    // Wire confirm button
    const confirmBtn = el.querySelector('#pm-content-confirm')
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const selected = allNodes.filter(n => selectedNodeIds.has(n.id))
        if (onConfirm) onConfirm({
          classEventId: classEventData.classEventId,
          level: classEventData.level,
          selectedNodes: selected,
        })
      })
    }
  }

  // Initial load
  load()

  return {
    el,
    refresh: load,
    destroy: () => { el.remove() },
    getSelectedNodes: () => allNodes.filter(n => selectedNodeIds.has(n.id)),
  }
}
```

- [ ] **3.2** Verify no syntax errors: `npx vitest run --passWithNoTests tests/portal-maestros/contentSelectionPanel.test.js` (stub test or import check)

- [ ] **3.3** Commit: `feat(components): add ContentSelectionPanel for class content selection`

---

## Task 4: MethodologyForm — Structured class notes

**File:** `src/portal-maestros/components/MethodologyForm.js`

### Steps

- [ ] **4.1** Create `src/portal-maestros/components/MethodologyForm.js`:

```js
/**
 * MethodologyForm — Collapsible structured methodology card for class events.
 *
 * Fields: warmup, sound_focus, intonation_focus, technical_focus,
 *         study_used, repertoire_used, closing_observation.
 * Auto-saves with 30s debounce.
 */
import { saveMethodology } from '../services/classEventService.js'

const FIELDS = [
  { key: 'warmup', label: 'Calentamiento', type: 'text', placeholder: 'Ej: ejercicios preparatorios, técnica básica' },
  { key: 'sound_focus', label: 'Enfoque de Sonido', type: 'text', placeholder: 'Ej: calidad sonora, proyección, articulación' },
  { key: 'intonation_focus', label: 'Enfoque de Afinación', type: 'text', placeholder: 'Ej: intervalos, escalas, posiciones' },
  { key: 'technical_focus', label: 'Enfoque Técnico', type: 'text', placeholder: 'Ej: técnica específica del área' },
  { key: 'study_used', label: 'Estudio/Método Utilizado', type: 'text', placeholder: 'Ej: nombre del método o estudio' },
  { key: 'repertoire_used', label: 'Repertorio / Material', type: 'text', placeholder: 'Ej: obra, pieza, o material trabajado' },
  { key: 'sight_reading_work', label: 'Lectura a Primera Vista', type: 'text', placeholder: 'Descripción opcional' },
  { key: 'ear_training_work', label: 'Entrenamiento Auditivo', type: 'text', placeholder: 'Descripción opcional' },
  { key: 'closing_observation', label: 'Observación de Cierre', type: 'textarea', placeholder: 'Notas finales de la clase...' },
]

/**
 * @param {{ classEventId: string, onSave?: (data) => void, initialData?: object }} opts
 * @returns {{ el: HTMLElement, getData: () => object, destroy: () => void }}
 */
export function createMethodologyForm({ classEventId, onSave, initialData }) {
  const el = document.createElement('div')
  el.className = 'pm-methodology-form'

  let _timer = null
  let _collapsed = true
  const _data = { ...initialData }

  function render() {
    el.innerHTML = `
      <div class="pm-methodology-form-header" id="pm-meth-toggle">
        <h4 class="pm-methodology-form-title">
          <i class="bi bi-music-note-list"></i> Metodología de Clase
        </h4>
        <i class="bi bi-chevron-${_collapsed ? 'down' : 'up'} pm-methodology-form-chevron"></i>
      </div>
      <div class="pm-methodology-form-body" style="display:${_collapsed ? 'none' : 'block'}">
        ${FIELDS.map(f => `
          <div class="pm-methodology-form-field">
            <label class="pm-methodology-form-label" for="pm-meth-${f.key}">${f.label}</label>
            ${f.type === 'textarea'
              ? `<textarea class="pm-input pm-methodology-form-input" id="pm-meth-${f.key}" data-field="${f.key}" placeholder="${f.placeholder}" rows="3">${_data[f.key] || ''}</textarea>`
              : `<input class="pm-input pm-methodology-form-input" id="pm-meth-${f.key}" data-field="${f.key}" type="text" placeholder="${f.placeholder}" value="${_data[f.key] || ''}" />`
            }
          </div>
        `).join('')}
        <div class="pm-methodology-form-status" id="pm-meth-status"></div>
      </div>
    `

    // Toggle collapse
    el.querySelector('#pm-meth-toggle').addEventListener('click', () => {
      _collapsed = !_collapsed
      render()
    })

    // Auto-save debounce on input
    el.querySelectorAll('.pm-methodology-form-input').forEach(input => {
      input.addEventListener('input', (e) => {
        _data[e.target.dataset.field] = e.target.value
        _scheduleAutoSave()
      })
    })
  }

  function _scheduleAutoSave() {
    if (_timer) clearTimeout(_timer)
    _timer = setTimeout(async () => {
      try {
        const statusEl = el.querySelector('#pm-meth-status')
        if (statusEl) statusEl.textContent = 'Guardando...'

        await saveMethodology(classEventId, _data)

        if (statusEl) {
          const now = new Date()
          statusEl.textContent = `Guardado ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        }
        if (onSave) onSave(_data)
      } catch (err) {
        const statusEl = el.querySelector('#pm-meth-status')
        if (statusEl) statusEl.textContent = 'Error al guardar'
        console.error('[MethodologyForm] Auto-save error:', err)
      }
    }, 30000)
  }

  render()

  return {
    el,
    getData: () => ({ ..._data }),
    destroy: () => {
      if (_timer) clearTimeout(_timer)
      el.remove()
    },
  }
}
```

- [ ] **4.2** Commit: `feat(components): add MethodologyForm with 30s auto-save`

---

## Task 5: HomeworkPanel — Assign homework from class

**File:** `src/portal-maestros/components/HomeworkPanel.js`

### Steps

- [ ] **5.1** Create `src/portal-maestros/components/HomeworkPanel.js`:

```js
/**
 * HomeworkPanel — Teacher assigns homework linked to a class event.
 *
 * Shows existing homework for the event and allows adding new assignments.
 */
import { escHTML } from '../utils/portalUtils.js'
import { assignHomework } from '../services/classEventService.js'
import { supabase } from '../../lib/supabaseClient.js'

/**
 * @param {{ classEventId: string, studentId: string, teacherId: string, nodes?: object[] }} opts
 * @returns {{ el: HTMLElement, refresh: () => Promise<void>, destroy: () => void }}
 */
export function createHomeworkPanel({ classEventId, studentId, teacherId, nodes = [] }) {
  const el = document.createElement('div')
  el.className = 'pm-homework-panel'

  let homeworkList = []

  async function load() {
    const { data } = await supabase
      .from('homework_assignments')
      .select('*, nodes(name)')
      .eq('class_event_id', classEventId)
      .order('created_at', { ascending: false })

    homeworkList = data || []
    render()
  }

  function render() {
    el.innerHTML = `
      <div class="pm-homework-panel-header">
        <h4 class="pm-homework-panel-title">
          <i class="bi bi-pencil-square"></i> Tareas
        </h4>
      </div>

      <div class="pm-homework-panel-list">
        ${homeworkList.length === 0
          ? `<p class="pm-empty" style="font-size:0.85rem;">Sin tareas asignadas.</p>`
          : homeworkList.map(hw => `
            <div class="pm-homework-panel-item">
              <span class="pm-homework-panel-desc">${escHTML(hw.description)}</span>
              ${hw.nodes?.name ? `<span class="pm-badge pm-badge-muted">${escHTML(hw.nodes.name)}</span>` : ''}
              ${hw.due_date ? `<span class="pm-homework-panel-due">Entrega: ${hw.due_date}</span>` : ''}
            </div>
          `).join('')}
      </div>

      <div class="pm-homework-panel-form">
        <textarea class="pm-input" id="pm-hw-desc" placeholder="Descripción de la tarea..." rows="2"></textarea>
        <div class="pm-homework-panel-row">
          <select class="pm-input pm-homework-panel-select" id="pm-hw-node">
            <option value="">Nodo (opcional)</option>
            ${nodes.map(n => `<option value="${n.id}">${escHTML(n.name)}</option>`).join('')}
          </select>
          <input class="pm-input" id="pm-hw-due" type="date" />
        </div>
        <button class="pm-btn pm-btn-secondary pm-btn-block" id="pm-hw-assign">
          <i class="bi bi-plus-circle"></i> Asignar Tarea
        </button>
      </div>
    `

    const assignBtn = el.querySelector('#pm-hw-assign')
    if (assignBtn) {
      assignBtn.addEventListener('click', async () => {
        const desc = el.querySelector('#pm-hw-desc').value.trim()
        if (!desc) {
          alert('Escribe una descripción para la tarea.')
          return
        }

        assignBtn.disabled = true
        assignBtn.textContent = 'Asignando...'

        try {
          const nodeId = el.querySelector('#pm-hw-node').value || undefined
          const dueDate = el.querySelector('#pm-hw-due').value || undefined

          await assignHomework({
            classEventId,
            studentId,
            teacherId,
            description: desc,
            dueDate,
            nodeId,
          })

          await load() // refresh list
        } catch (err) {
          console.error('[HomeworkPanel] Error:', err)
          alert('Error al asignar tarea: ' + (err.message || err))
          assignBtn.disabled = false
          assignBtn.textContent = 'Asignar Tarea'
        }
      })
    }
  }

  load()

  return {
    el,
    refresh: load,
    destroy: () => { el.remove() },
  }
}
```

- [ ] **5.2** Commit: `feat(components): add HomeworkPanel for homework assignment`

---

## Task 6: LevelCompletionModal — Boss Level confirmation

**File:** `src/portal-maestros/components/LevelCompletionModal.js`

### Steps

- [ ] **6.1** Create `src/portal-maestros/components/LevelCompletionModal.js`:

```js
/**
 * LevelCompletionModal — "Boss Level" confirmation when all nodes in a level are approved.
 *
 * Shows all nodes with their status, teacher writes final notes, and confirms level completion.
 */
import { escHTML } from '../utils/portalUtils.js'
import { supabase } from '../../lib/supabaseClient.js'

/**
 * @param {{ studentId: string, levelId: string, onConfirm?: () => void }} opts
 * @returns {{ open: () => Promise<void>, close: () => void, destroy: () => void }}
 */
export function createLevelCompletionModal({ studentId, levelId, onConfirm }) {
  let overlay = null

  async function open() {
    // Fetch level + nodes + progress
    const [levelRes, nodesRes] = await Promise.all([
      supabase.from('levels').select('*').eq('id', levelId).single(),
      supabase
        .from('student_node_progress')
        .select('*, nodes(name, position)')
        .eq('student_id', studentId)
        .eq('nodes.level_id', levelId)
        .order('nodes(position)', { ascending: true }),
    ])

    const level = levelRes.data
    const nodeProgress = nodesRes.data || []
    const allApproved = nodeProgress.length > 0 && nodeProgress.every(np => np.status === 'approved')

    overlay = document.createElement('div')
    overlay.className = 'pm-level-modal-overlay'
    overlay.innerHTML = `
      <div class="pm-level-modal">
        <div class="pm-level-modal-header">
          <div class="pm-level-modal-boss-icon">
            <i class="bi bi-trophy-fill"></i>
          </div>
          <h3 class="pm-level-modal-title">Completar Nivel</h3>
          <p class="pm-level-modal-subtitle">${escHTML(level?.name || 'Nivel')}</p>
        </div>

        <div class="pm-level-modal-body">
          <div class="pm-level-modal-nodes">
            ${nodeProgress.map(np => `
              <div class="pm-level-modal-node">
                <i class="bi bi-${np.status === 'approved' ? 'check-circle-fill' : 'circle'}" 
                   style="color:${np.status === 'approved' ? 'var(--pm-success)' : 'var(--pm-text-muted)'}"></i>
                <span>${escHTML(np.nodes?.name || 'Nodo')}</span>
                <span class="pm-badge pm-badge-${np.status === 'approved' ? 'success' : 'warning'}">
                  ${np.status === 'approved' ? 'Aprobado' : np.status}
                </span>
              </div>
            `).join('')}
          </div>

          ${allApproved ? `
            <div class="pm-level-modal-confirm-section">
              <label class="pm-methodology-form-label">Notas finales del nivel</label>
              <textarea class="pm-input" id="pm-level-notes" rows="3" placeholder="Observaciones sobre el desempeño del alumno en este nivel..."></textarea>
              <button class="pm-btn pm-btn-primary pm-btn-block" id="pm-level-confirm" style="margin-top:1rem;">
                <i class="bi bi-trophy"></i> Confirmar Nivel Completado
              </button>
            </div>
          ` : `
            <div class="pm-empty" style="text-align:center; padding:1rem;">
              <p>Aún faltan nodos por aprobar para completar este nivel.</p>
            </div>
          `}
        </div>

        <button class="pm-level-modal-close" id="pm-level-modal-close">&times;</button>
      </div>
    `

    document.body.appendChild(overlay)

    // Close button
    overlay.querySelector('#pm-level-modal-close')?.addEventListener('click', close)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close()
    })

    // Confirm button
    const confirmBtn = overlay.querySelector('#pm-level-confirm')
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true
        confirmBtn.textContent = 'Guardando...'

        try {
          const notes = overlay.querySelector('#pm-level-notes')?.value || ''

          await supabase
            .from('student_level_progress')
            .update({
              status: 'approved',
              completed_at: new Date().toISOString(),
              teacher_notes: notes,
            })
            .eq('student_id', studentId)
            .eq('level_id', levelId)

          if (onConfirm) onConfirm()
          close()
        } catch (err) {
          console.error('[LevelCompletionModal] Error:', err)
          alert('Error al completar nivel: ' + (err.message || err))
          confirmBtn.disabled = false
          confirmBtn.textContent = 'Confirmar Nivel Completado'
        }
      })
    }
  }

  function close() {
    if (overlay) {
      overlay.remove()
      overlay = null
    }
  }

  return { open, close, destroy: close }
}
```

- [ ] **6.2** Commit: `feat(components): add LevelCompletionModal with boss level confirmation`

---

## Task 7: Integration into asistenciaView.js

**File:** `src/portal-maestros/views/asistenciaView.js`

### Steps

- [ ] **7.1** Add imports at the top of `asistenciaView.js`:

```js
import { createContentSelectionPanel } from '../components/ContentSelectionPanel.js'
import { createMethodologyForm } from '../components/MethodologyForm.js'
import { createHomeworkPanel } from '../components/HomeworkPanel.js'
import { createLevelCompletionModal } from '../components/LevelCompletionModal.js'
import { getClassEvent, updateClassEventStatus } from '../services/classEventService.js'
```

- [ ] **7.2** In `_renderVista`, add container divs after `#pm-route-tree-container` in the HTML template:

```html
<div id="pm-content-selection-container" style="margin-top:1.5rem;"></div>
<div id="pm-methodology-container" style="margin-top:1rem;"></div>
<div id="pm-homework-container" style="margin-top:1rem;"></div>
```

- [ ] **7.3** In the student name click handler (where `nameLabel` is detected), after the `if (rutaId)` block that opens the progress panel, add content selection flow:

```js
// After opening progress panel, also initialize content selection for this student
const contentContainer = container.querySelector('#pm-content-selection-container')
if (contentContainer && sesionId) {
  contentContainer.innerHTML = '' // clear previous
  const contentPanel = createContentSelectionPanel({
    sessionId: sesionId,
    studentId: student.id,
    teacherId: maestro.id,
    onConfirm: ({ classEventId, selectedNodes }) => {
      // Show methodology form after content confirmed
      const methContainer = container.querySelector('#pm-methodology-container')
      if (methContainer) {
        methContainer.innerHTML = ''
        const methForm = createMethodologyForm({ classEventId })
        methContainer.appendChild(methForm.el)
        _cleanups.push(() => methForm.destroy())
      }

      // Show homework panel
      const hwContainer = container.querySelector('#pm-homework-container')
      if (hwContainer) {
        hwContainer.innerHTML = ''
        const hwPanel = createHomeworkPanel({
          classEventId,
          studentId: student.id,
          teacherId: maestro.id,
          nodes: selectedNodes,
        })
        hwContainer.appendChild(hwPanel.el)
        _cleanups.push(() => hwPanel.destroy())
      }
    },
  })
  contentContainer.appendChild(contentPanel.el)
  _cleanups.push(() => contentPanel.destroy())
}
```

- [ ] **7.4** In the `#btn-guardar` click handler, after the session is saved successfully, add level completion check:

```js
// After processSessionClosure or save, check level completion
if (rutaId && sesionId) {
  try {
    const { academicService } = await import('../../modules/academic-routes/services/academicService.js')
    // Get the active class event for the selected student
    const contentContainer = container.querySelector('#pm-content-selection-container')
    const activeStudentId = contentContainer?.dataset?.activeStudentId
    if (activeStudentId) {
      const classEvent = await getClassEvent(sesionId, activeStudentId)
      if (classEvent?.level_id) {
        const isComplete = await academicService.checkLevelCompletion(activeStudentId, classEvent.level_id)
        if (isComplete) {
          const modal = createLevelCompletionModal({
            studentId: activeStudentId,
            levelId: classEvent.level_id,
            onConfirm: () => {
              // Show toast
              const toast = document.createElement('div')
              toast.textContent = '¡Nivel completado!'
              toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--pm-success);color:#fff;padding:12px 24px;border-radius:8px;z-index:10000;font-size:16px;font-weight:700;'
              document.body.appendChild(toast)
              setTimeout(() => toast.remove(), 4000)
            },
          })
          modal.open()
          _cleanups.push(() => modal.destroy())
        }
      }

      // Update class event status to completed
      if (classEvent?.id) {
        await updateClassEventStatus(classEvent.id, 'completed')
      }
    }
  } catch (err) {
    console.warn('[asistencia] Level completion check error:', err)
  }
}
```

- [ ] **7.5** Commit: `feat(views): integrate content selection, methodology, homework, and level completion into asistenciaView`

---

## Task 8: CSS styles for new components

**File:** `src/portal-maestros/styles/portal.css`

### Steps

- [ ] **8.1** Append the following styles to the end of `src/portal-maestros/styles/portal.css`:

```css
/* ============================================================
   Content Selection Panel
   ============================================================ */
.pm-content-panel {
  background: var(--pm-surface);
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius, 12px);
  overflow: hidden;
}

.pm-content-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--pm-border);
}

.pm-content-panel-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--pm-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pm-content-panel-level {
  font-size: 0.8rem;
  color: var(--pm-primary);
  font-weight: 600;
  background: rgba(var(--pm-primary-rgb, 59, 130, 246), 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.pm-content-panel-homework-reminder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(var(--pm-warning-rgb, 245, 158, 11), 0.08);
  border-bottom: 1px solid var(--pm-border);
  font-size: 0.85rem;
  color: var(--pm-text-muted);
}

.pm-content-panel-nodes {
  padding: 0.5rem;
}

.pm-content-panel-node {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;
}

.pm-content-panel-node:hover {
  background: var(--pm-hover, rgba(0, 0, 0, 0.03));
}

.pm-content-panel-node.selected {
  background: rgba(var(--pm-primary-rgb, 59, 130, 246), 0.06);
  border-color: var(--pm-primary);
}

.pm-content-panel-node input[type="checkbox"] {
  margin-top: 0.2rem;
  accent-color: var(--pm-primary);
}

.pm-content-panel-node-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pm-content-panel-node-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--pm-text);
}

.pm-content-panel-indicators {
  width: 100%;
  margin-top: 0.5rem;
}

.pm-content-panel-indicators summary {
  font-size: 0.8rem;
  color: var(--pm-text-muted);
  cursor: pointer;
}

.pm-content-panel-indicators ul {
  margin: 0.25rem 0 0;
  padding-left: 1.25rem;
  font-size: 0.8rem;
  color: var(--pm-text-muted);
}

/* ============================================================
   Methodology Form
   ============================================================ */
.pm-methodology-form {
  background: var(--pm-surface);
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius, 12px);
  overflow: hidden;
}

.pm-methodology-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
}

.pm-methodology-form-header:hover {
  background: var(--pm-hover, rgba(0, 0, 0, 0.03));
}

.pm-methodology-form-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--pm-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pm-methodology-form-chevron {
  color: var(--pm-text-muted);
  font-size: 0.9rem;
}

.pm-methodology-form-body {
  padding: 0.75rem 1.25rem 1.25rem;
}

.pm-methodology-form-field {
  margin-bottom: 1rem;
}

.pm-methodology-form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--pm-text-muted);
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pm-methodology-form-input {
  width: 100%;
  font-size: 0.9rem;
}

.pm-methodology-form-status {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  text-align: right;
  padding-top: 0.25rem;
}

/* ============================================================
   Homework Panel
   ============================================================ */
.pm-homework-panel {
  background: var(--pm-surface);
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius, 12px);
  overflow: hidden;
}

.pm-homework-panel-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--pm-border);
}

.pm-homework-panel-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--pm-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pm-homework-panel-list {
  padding: 0.75rem 1.25rem;
}

.pm-homework-panel-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--pm-border);
  font-size: 0.9rem;
}

.pm-homework-panel-item:last-child {
  border-bottom: none;
}

.pm-homework-panel-desc {
  flex: 1;
  color: var(--pm-text);
}

.pm-homework-panel-due {
  font-size: 0.8rem;
  color: var(--pm-text-muted);
}

.pm-homework-panel-form {
  padding: 0.75rem 1.25rem 1.25rem;
  border-top: 1px solid var(--pm-border);
}

.pm-homework-panel-row {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.pm-homework-panel-select {
  flex: 1;
}

/* ============================================================
   Level Completion Modal (Boss Level)
   ============================================================ */
.pm-level-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: pm-fade-in 0.2s ease;
}

.pm-level-modal {
  background: var(--pm-surface);
  border-radius: var(--pm-radius, 16px);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: pm-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pm-level-modal-header {
  text-align: center;
  padding: 2rem 1.5rem 1rem;
}

.pm-level-modal-boss-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--pm-warning, #f59e0b), var(--pm-primary, #3b82f6));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.75rem;
  color: #fff;
}

.pm-level-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--pm-text);
}

.pm-level-modal-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--pm-text-muted);
}

.pm-level-modal-body {
  padding: 0 1.5rem 1.5rem;
}

.pm-level-modal-nodes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.pm-level-modal-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--pm-hover, rgba(0, 0, 0, 0.03));
  border-radius: 8px;
  font-size: 0.9rem;
}

.pm-level-modal-node span:first-of-type {
  flex: 1;
}

.pm-level-modal-confirm-section {
  padding-top: 0.5rem;
}

.pm-level-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--pm-text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
}

.pm-level-modal-close:hover {
  color: var(--pm-text);
}

/* Animations */
@keyframes pm-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pm-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ============================================================
   Shared badges (extend existing if needed)
   ============================================================ */
.pm-badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: var(--pm-success, #22c55e);
}

.pm-badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--pm-warning, #f59e0b);
}

.pm-badge-muted {
  background: rgba(100, 116, 139, 0.1);
  color: var(--pm-text-muted, #64748b);
}

.pm-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
```

- [ ] **8.2** Commit: `feat(styles): add CSS for content panel, methodology form, homework panel, and level modal`

---

## Dependency Graph

```
Task 1 (DB)
  └─► Task 2 (Service) ──► Task 3 (ContentSelectionPanel)
                        ──► Task 4 (MethodologyForm)
                        ──► Task 5 (HomeworkPanel)
                        ──► Task 6 (LevelCompletionModal)
                              │
                              ▼
                        Task 7 (Integration) ◄── Task 8 (CSS)
```

**Execution order:** 1 → 2 → (3, 4, 5, 6, 8 in parallel) → 7

## Test Commands

```bash
# Task 2 tests
npx vitest run tests/portal-maestros/classEventService.test.js

# Full test suite
npx vitest run
```
