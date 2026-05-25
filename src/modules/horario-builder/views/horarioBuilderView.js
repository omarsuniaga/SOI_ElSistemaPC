import { fetchSchedulingData, saveScheduleRun, getScheduleRuns } from '../api/horarioBuilderApi.js';
import { generateOptimizedSchedule } from '../engine/schedulingEngine.js';
import { detectConflicts } from '../engine/conflictDetector.js';
import { initDragDrop, showConflictMoveModal } from '../engine/DragDropManager.js';
import { createScheduleGrid, attachScheduleGridListeners } from '../components/ScheduleGrid.js';
import { createViewToggle, VIEWS } from '../components/ViewToggle.js';
import { createConflictPanel, attachConflictPanelListeners } from '../components/ConflictPanel.js';
import { PERIODOS } from '../models/scheduleConstraints.model.js';
import { renderPublishWizard } from '../components/PublishWizard.js';
import { getRunFeedback, addFeedback, updateScheduleRunEstado, getCurrentUserIsAdmin } from '../api/scheduleFeedbackApi.js';

// ─── STATE ──────────────────────────────────────────────────────

function initialState() {
  return {
    assignments: [],
    conflicts: [],
    activeView: 'grid',
    activePeriodo: PERIODOS[0].id,
    draggable: false,
    conflictPanelExpanded: false,
    scheduleRuns: [],
    loading: false,
    error: null,
    undoStack: [],
    redoStack: [],
    estado: 'borrador',
    runId: null,
    isAdmin: false,
    feedback: [],
    publishWizardOpen: false
  };
}

let state = initialState();

let _container = null;
let _ddInstance = null;

// ─── PUBLIC API ─────────────────────────────────────────────────

export function init(container) {
  _container = container;
  state = initialState();

  renderShell();
  wireListeners();

  // Load schedule runs history (non-blocking)
  getScheduleRuns()
    .then(runs => { state.scheduleRuns = runs || []; })
    .catch(err => console.warn('[horarioBuilderView] getScheduleRuns failed:', err));

  // Non-blocking admin detection
  getCurrentUserIsAdmin()
    .then(isAdmin => { state.isAdmin = isAdmin; })
    .catch(() => { /* non-critical */ });
}

// ─── RENDER HELPERS ─────────────────────────────────────────────

function renderShell() {
  const periodOptions = PERIODOS.map(p =>
    `<option value="${p.id}" ${p.id === state.activePeriodo ? 'selected' : ''}>${p.nombre}</option>`
  ).join('');

  const lockIcon = state.draggable ? 'bi-unlock-fill' : 'bi-lock-fill';
  const lockLabel = state.draggable ? 'Bloqueando' : 'Editar';

  _container.innerHTML = `
    <div class="hb-view">
      <!-- Toolbar -->
      <div class="hb-toolbar d-flex align-items-center gap-2 mb-3">
        <select class="form-select form-select-sm w-auto" id="hb-periodo-select">
          ${periodOptions}
        </select>
        <div id="hb-view-toggle-slot">
          ${createViewToggle(state.activeView)}
        </div>
        <div class="flex-grow-1"></div>
        <button class="btn btn-sm btn-outline-secondary" id="hb-drag-toggle" title="Activar modo edición drag &amp; drop">
          <i class="bi ${lockIcon}"></i> ${lockLabel}
        </button>
        <button class="btn btn-sm" id="hb-undo-btn" disabled title="Deshacer">
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
        <button class="btn btn-sm" id="hb-redo-btn" disabled title="Rehacer">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
        <button class="btn btn-sm btn-primary" id="hb-generate-btn">
          <i class="bi bi-lightning-fill"></i> Generar
        </button>
        <button class="btn btn-sm btn-success" id="hb-save-btn" disabled>
          <i class="bi bi-floppy-fill"></i> Guardar
        </button>
        <button class="btn btn-sm btn-outline-primary" id="hb-publish-btn" disabled>
          <i class="bi bi-globe"></i> Publicar
        </button>
      </div>

      <!-- Conflict panel -->
      <div id="hb-conflict-panel-wrapper"></div>

      <!-- Grid area -->
      <div id="hb-grid-wrapper" class="hb-grid-wrapper"></div>

      <!-- Publish wizard panel -->
      <div id="hb-publish-wrapper" class="mt-3" style="display:none"></div>

      <!-- Loading / error overlay -->
      <div id="hb-status"></div>
    </div>
  `;
}

function renderGrid() {
  const wrapper = _container.querySelector('#hb-grid-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = createScheduleGrid({
    assignments: state.assignments,
    activeView: state.activeView,
    draggable: state.draggable,
    periodoId: state.activePeriodo
  });
  attachScheduleGridListeners(wrapper);
}

function renderConflictPanel() {
  const wrapper = _container.querySelector('#hb-conflict-panel-wrapper');
  if (!wrapper) return;

  // Snapshot expanded state from DOM before re-render
  const cpBody = wrapper.querySelector('.cp-body');
  if (cpBody) {
    state.conflictPanelExpanded = cpBody.style.display === 'block';
  }

  wrapper.innerHTML = createConflictPanel(state.conflicts, state.conflictPanelExpanded);
  attachConflictPanelListeners(wrapper, state.conflicts, (conflict) => {
    const view = _container.querySelector('.hb-view');
    conflict.ids.forEach(id => {
      const block = view?.querySelector(`[data-clase-id="${id}"]`);
      if (block) {
        block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        block.classList.add('hb-highlight');
        setTimeout(() => block.classList.remove('hb-highlight'), 1500);
      }
    });
  });
}

function renderViewToggle() {
  const slot = _container.querySelector('#hb-view-toggle-slot');
  if (!slot) return;
  slot.innerHTML = createViewToggle(state.activeView);
}

function renderPublishPanel() {
  const wrapper = _container.querySelector('#hb-publish-wrapper');
  if (!wrapper) return;
  if (!state.publishWizardOpen || !state.runId) {
    wrapper.style.display = 'none';
    return;
  }
  wrapper.style.display = '';

  renderPublishWizard(wrapper, {
    runId: state.runId,
    estadoActual: state.estado,
    isAdmin: state.isAdmin,
    feedback: state.feedback,
    async onEstadoChange(newEstado) {
      try {
        await updateScheduleRunEstado(state.runId, newEstado);
        state.estado = newEstado;
        renderPublishPanel();
      } catch (err) {
        console.error('[horario-builder] estado update failed:', err);
      }
    },
    async onFeedbackAdd({ comentario, tipo }) {
      try {
        const newItem = await addFeedback({ runId: state.runId, comentario, tipo });
        state.feedback = [...state.feedback, newItem];
        renderPublishPanel();
      } catch (err) {
        console.error('[horario-builder] feedback add failed:', err);
      }
    }
  });
}

function setLoading(on) {
  state.loading = on;
  const el = _container.querySelector('#hb-status');
  if (!el) return;
  el.innerHTML = on
    ? `<div class="d-flex align-items-center gap-2 mt-2 text-muted" style="font-size:0.85rem;">
         <div class="spinner-border spinner-border-sm" role="status"></div>
         <span>Generando horario optimizado…</span>
       </div>`
    : '';
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'hb-toast';
  let icon = 'bi-check-circle-fill text-success';
  let border = '#10b981';
  if (type === 'danger') { icon = 'bi-exclamation-octagon-fill text-danger'; border = '#ef4444'; }
  else if (type === 'warning') { icon = 'bi-info-circle-fill text-warning'; border = '#f59e0b'; }
  toast.style.borderLeftColor = border;
  toast.innerHTML = `
    <i class="bi ${icon}"></i>
    <span style="font-size:0.85rem;font-weight:650;color:var(--hb-text);">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── HELPERS ─────────────────────────────────────────────────────

function minutesBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function updateUndoRedoButtons() {
  const undoBtn = _container?.querySelector('#hb-undo-btn');
  const redoBtn = _container?.querySelector('#hb-redo-btn');
  if (undoBtn) undoBtn.disabled = state.undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = state.redoStack.length === 0;
}

function initDD() {
  if (_ddInstance) _ddInstance.destroy();
  if (!state.draggable) return;

  const gridWrapper = _container.querySelector('#hb-grid-wrapper');
  _ddInstance = initDragDrop(gridWrapper, {
    assignments: state.assignments,
    onMove({ claseId, fromDay, fromHour, toDay, toHour }) {
      state.undoStack.push(JSON.parse(JSON.stringify(state.assignments)));
      state.redoStack = [];

      const idx = state.assignments.findIndex(a => a.clase_id === claseId);
      if (idx === -1) return;
      const moved = { ...state.assignments[idx] };
      const duration = minutesBetween(moved.hora_inicio, moved.hora_fin);
      moved.dia = toDay;
      moved.hora_inicio = toHour;
      moved.hora_fin = addMinutes(toHour, duration);
      state.assignments[idx] = moved;

      const { conflicts, assignments } = detectConflicts(state.assignments, { returnAnnotated: true });
      state.conflicts = conflicts;
      state.assignments = assignments;

      renderGrid();
      renderConflictPanel();
      updateUndoRedoButtons();
      initDD();
    },
    async onConflict({ assignment, targetDay, targetHour, conflicts }) {
      // Disable interactive controls while modal is open to prevent race conditions
      const dragToggle = _container.querySelector('#hb-drag-toggle');
      const undoBtn = _container.querySelector('#hb-undo-btn');
      const redoBtn = _container.querySelector('#hb-redo-btn');
      [dragToggle, undoBtn, redoBtn].forEach(b => { if (b) b.disabled = true; });

      try {
        const description = conflicts.map(c => c.description).join('\n');
        const confirmed = await showConflictMoveModal({ conflictDescription: description });
        if (!confirmed) return;

        state.undoStack.push(JSON.parse(JSON.stringify(state.assignments)));
        state.redoStack = [];
        const idx = state.assignments.findIndex(a => a.clase_id === assignment.clase_id);
        if (idx === -1) return;
        const moved = { ...state.assignments[idx] };
        const duration = minutesBetween(moved.hora_inicio, moved.hora_fin);
        moved.dia = targetDay;
        moved.hora_inicio = targetHour;
        moved.hora_fin = addMinutes(targetHour, duration);
        state.assignments[idx] = moved;

        const result = detectConflicts(state.assignments, { returnAnnotated: true });
        state.conflicts = result.conflicts;
        state.assignments = result.assignments;

        renderGrid();
        renderConflictPanel();
        updateUndoRedoButtons();
        initDD();
      } finally {
        // Re-enable controls (updateUndoRedoButtons will correct undo/redo state)
        if (dragToggle) dragToggle.disabled = false;
        updateUndoRedoButtons();
      }
    }
  });
}

// ─── EVENT WIRING ────────────────────────────────────────────────

function wireListeners() {
  _container.addEventListener('change', e => {
    if (e.target.id === 'hb-periodo-select') {
      state.activePeriodo = e.target.value;
      renderGrid();
    }
  });

  _container.addEventListener('click', async e => {
    // View toggle pill
    const pill = e.target.closest('.vt-pill[data-view]');
    if (pill) {
      const v = pill.dataset.view;
      if (VIEWS.includes(v) && v !== state.activeView) {
        state.activeView = v;
        renderViewToggle();
        renderGrid();
      }
      return;
    }

    // Drag toggle
    if (e.target.closest('#hb-drag-toggle')) {
      state.draggable = !state.draggable;
      const btn = _container.querySelector('#hb-drag-toggle');
      if (btn) {
        btn.innerHTML = state.draggable
          ? '<i class="bi bi-unlock-fill"></i> Bloqueando'
          : '<i class="bi bi-lock-fill"></i> Editar';
      }
      renderGrid();
      initDD();
      return;
    }

    // Undo
    if (e.target.closest('#hb-undo-btn')) {
      if (state.undoStack.length === 0) return;
      state.redoStack.push(JSON.parse(JSON.stringify(state.assignments)));
      state.assignments = state.undoStack.pop();
      const result = detectConflicts(state.assignments, { returnAnnotated: true });
      state.conflicts = result.conflicts;
      state.assignments = result.assignments;
      renderGrid();
      renderConflictPanel();
      updateUndoRedoButtons();
      initDD();
      return;
    }

    // Redo
    if (e.target.closest('#hb-redo-btn')) {
      if (state.redoStack.length === 0) return;
      state.undoStack.push(JSON.parse(JSON.stringify(state.assignments)));
      state.assignments = state.redoStack.pop();
      const result = detectConflicts(state.assignments, { returnAnnotated: true });
      state.conflicts = result.conflicts;
      state.assignments = result.assignments;
      renderGrid();
      renderConflictPanel();
      updateUndoRedoButtons();
      initDD();
      return;
    }

    // Generate button
    if (e.target.closest('#hb-generate-btn')) {
      handleGenerate();
      return;
    }

    // Save button
    if (e.target.closest('#hb-save-btn')) {
      handleSave();
      return;
    }

    // Publish button
    if (e.target.closest('#hb-publish-btn')) {
      state.publishWizardOpen = !state.publishWizardOpen;
      if (state.publishWizardOpen && state.runId) {
        try {
          state.feedback = await getRunFeedback(state.runId);
        } catch (e) {
          state.feedback = [];
        }
      }
      renderPublishPanel();
      return;
    }
  });
}

// ─── ACTIONS ─────────────────────────────────────────────────────

async function handleGenerate() {
  const btn = _container.querySelector('#hb-generate-btn');
  if (btn) { btn.disabled = true; }
  setLoading(true);

  try {
    const data = await fetchSchedulingData();

    const result = generateOptimizedSchedule({
      clasesConMaestro: (data.clases || []).map(c => ({
        id: c.id,
        nombre: c.nombre,
        maestro_principal_id: c.maestro_principal_id,
        total_alumnos: c.total_alumnos || 0,
        duracion: 60
      })),
      maestros: data.maestros || [],
      salones: data.salones || [],
      config: { gapMinimo: 15, duracionBloque: 60 }
    });

    const { conflicts, assignments } = detectConflicts(result.assignments, {
      returnAnnotated: true,
      gapMinutes: 15
    });

    state.assignments = assignments;
    state.conflicts = conflicts;

    renderGrid();
    renderConflictPanel();
    initDD();

    const saveBtn = _container.querySelector('#hb-save-btn');
    if (saveBtn) saveBtn.disabled = state.assignments.length === 0;

    const msg = conflicts.length > 0
      ? `Horario generado con ${conflicts.length} conflicto(s)`
      : 'Horario optimizado sin conflictos';
    showToast(msg, conflicts.length > 0 ? 'warning' : 'success');
  } catch (err) {
    console.error('[horarioBuilderView] handleGenerate error:', err);
    showToast('Error al generar: ' + err.message, 'danger');
  } finally {
    setLoading(false);
    if (btn) btn.disabled = false;
  }
}

async function handleSave() {
  const btn = _container.querySelector('#hb-save-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando…'; }

  try {
    const saved = await saveScheduleRun({
      assignments: state.assignments,
      periodo_id: state.activePeriodo,
      estado: 'borrador'
    });
    if (saved?.id) {
      state.runId = saved.id;
      state.estado = 'borrador';
      const publishBtn = _container.querySelector('#hb-publish-btn');
      if (publishBtn) publishBtn.disabled = false;
      showToast('Horario guardado como borrador', 'success');
    } else {
      showToast('Guardado incompleto: no se obtuvo ID del registro', 'warning');
    }
    state.error = null;
  } catch (err) {
    console.error('[horarioBuilderView] handleSave error:', err);
    state.error = err.message;
    showToast('Error al guardar: ' + err.message, 'danger');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-floppy-fill"></i> Guardar';
    }
  }
}
