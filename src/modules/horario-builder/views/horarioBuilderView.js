import { fetchSchedulingData, saveScheduleRun, getScheduleRuns } from '../api/horarioBuilderApi.js';
import { generateOptimizedSchedule } from '../engine/schedulingEngine.js';
import { detectConflicts } from '../engine/conflictDetector.js';
import { createScheduleGrid, attachScheduleGridListeners } from '../components/ScheduleGrid.js';
import { createViewToggle, VIEWS } from '../components/ViewToggle.js';
import { createConflictPanel, attachConflictPanelListeners } from '../components/ConflictPanel.js';
import { PERIODOS } from '../models/scheduleConstraints.model.js';

// ─── STATE ──────────────────────────────────────────────────────

let state = {
  assignments: [],
  conflicts: [],
  activeView: 'grid',
  activePeriodo: PERIODOS[0].id,
  draggable: false,
  conflictPanelExpanded: false,
  scheduleRuns: [],
  loading: false,
  error: null
};

let _container = null;

// ─── PUBLIC API ─────────────────────────────────────────────────

export function init(container) {
  _container = container;
  state = {
    assignments: [],
    conflicts: [],
    activeView: 'grid',
    activePeriodo: PERIODOS[0].id,
    draggable: false,
    conflictPanelExpanded: false,
    scheduleRuns: [],
    loading: false,
    error: null
  };

  renderShell();
  wireListeners();

  // Load schedule runs history (non-blocking)
  getScheduleRuns()
    .then(runs => { state.scheduleRuns = runs || []; })
    .catch(err => console.warn('[horarioBuilderView] getScheduleRuns failed:', err));
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
        <button class="btn btn-sm btn-primary" id="hb-generate-btn">
          <i class="bi bi-lightning-fill"></i> Generar
        </button>
        <button class="btn btn-sm btn-success" id="hb-save-btn" disabled>
          <i class="bi bi-floppy-fill"></i> Guardar
        </button>
      </div>

      <!-- Conflict panel -->
      <div id="hb-conflict-panel-wrapper"></div>

      <!-- Grid area -->
      <div id="hb-grid-wrapper" class="hb-grid-wrapper"></div>

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

// ─── EVENT WIRING ────────────────────────────────────────────────

function wireListeners() {
  _container.addEventListener('change', e => {
    if (e.target.id === 'hb-periodo-select') {
      state.activePeriodo = e.target.value;
      renderGrid();
    }
  });

  _container.addEventListener('click', e => {
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
    await saveScheduleRun({
      assignments: state.assignments,
      periodo_id: state.activePeriodo,
      estado: 'borrador'
    });
    showToast('Horario guardado como borrador', 'success');
  } catch (err) {
    console.error('[horarioBuilderView] handleSave error:', err);
    showToast('Error al guardar: ' + err.message, 'danger');
    if (btn) btn.disabled = false;
  } finally {
    if (btn) btn.innerHTML = '<i class="bi bi-floppy-fill"></i> Guardar';
  }
}
