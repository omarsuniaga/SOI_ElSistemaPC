/**
 * horarioBuilderView.js — Editor visual de horarios del SOI
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  FLUJO COMPLETO DEL EDITOR                                      │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                 │
 * │  1. GENERAR  → El botón "Generar" llama a fetchSchedulingData() │
 * │     para cargar clases, maestros y salones desde Supabase.     │
 * │     Luego generateOptimizedSchedule() asigna horarios usando    │
 * │     el schedulingEngine, que distribuye clases evitando         │
 * │     solapamientos básicos.                                      │
 * │                                                                 │
 * │  2. REVISAR CONFLICTOS  → detectConflicts() analiza maestro-    │
 * │     conflicto (mismo maestro, mismo día/hora) y sala-conflicto  │
 * │     (mismo salón, mismo bloque). Los conflictos se muestran en  │
 * │     el ConflictPanel y los bloques afectados se marcan en rojo. │
 * │     Clic en un conflicto hace scroll + highlight del bloque.    │
 * │                                                                 │
 * │  3. EDITAR (Drag & Drop)  → El botón "Editar" desbloquea el    │
 * │     modo drag. DragDropManager gestiona dragstart/dragover/drop │
 * │     con delegación de eventos. Al soltar un bloque:             │
 * │       a) Si no hay conflicto → onMove() actualiza state y       │
 * │          re-renderiza grid + conflictPanel.                     │
 * │       b) Si hay conflicto → onConflict() abre un modal de       │
 * │          confirmación. El usuario puede forzar el movimiento.   │
 * │     Cada movimiento empuja un snapshot a undoStack.             │
 * │     Undo/Redo restauran snapshots de la pila.                   │
 * │     Los bloques individuales pueden "bloquearse" (🔒) para      │
 * │     protegerlos del drag accidental.                            │
 * │                                                                 │
 * │  4. VISTAS  → ViewToggle permite cambiar entre:                 │
 * │     · grid     → tabla hora × día (vista por defecto)           │
 * │     · teacher  → agrupado por maestro                           │
 * │     · room     → agrupado por salón                             │
 * │     · student  → agrupado por clase                             │
 * │                                                                 │
 * │  5. GUARDAR  → saveScheduleRun() persiste el horario en         │
 * │     Supabase como estado "borrador". Devuelve un runId.         │
 * │                                                                 │
 * │  6. PUBLICAR  → El botón "Publicar" abre el PublishWizard,      │
 * │     que permite cambiar el estado del run                       │
 * │     (borrador → en_revision → publicado → archivado) y agregar  │
 * │     comentarios de feedback entre administradores.              │
 * │                                                                 │
 * │  ESTADO LOCAL (state object):                                   │
 * │    assignments[]   → bloques actuales del horario               │
 * │    conflicts[]     → conflictos detectados                      │
 * │    undoStack[]     → snapshots para deshacer                    │
 * │    redoStack[]     → snapshots para rehacer                     │
 * │    runId           → ID del último guardado en Supabase         │
 * │    estado          → estado del run (borrador/publicado/etc.)   │
 * │    draggable       → si el modo drag está activo                │
 * │    publishWizardOpen → si el panel de publicación está abierto  │
 * └─────────────────────────────────────────────────────────────────┘
 */

import { fetchSchedulingData, saveScheduleRun, getScheduleRuns } from '../api/horarioBuilderApi.js';
import { AppToast } from '../../../shared/components/AppToast.js';
import { minutesBetween, addMinutes } from '../utils/timeUtils.js';
import { generateMultipleProposals } from '../domain/multiProposalGenerator.js';
import { detectConflicts } from '../engine/conflictDetector.js';
import { initDragDrop, showConflictMoveModal } from '../engine/DragDropManager.js';
import { createScheduleGrid, attachScheduleGridListeners } from '../components/ScheduleGrid.js';
import { createViewToggle, VIEWS } from '../components/ViewToggle.js';
import { createConflictPanel, attachConflictPanelListeners } from '../components/ConflictPanel.js';
import { PERIODOS } from '../models/scheduleConstraints.model.js';
import { renderPublishWizard } from '../components/PublishWizard.js';
import { getRunFeedback, addFeedback, updateScheduleRunEstado, getCurrentUserIsAdmin } from '../api/scheduleFeedbackApi.js';
import { createConstraintPanel, getConstraintPanelValues } from '../components/constraintPanel.js';
import { buildJornada } from '../utils/constraintUtils.js';
import { partitionClases } from '../domain/groupPartitioner.js';

// ─── STATE ──────────────────────────────────────────────────────

function initialState() {
  return {
    assignments: [],
    conflicts: [],
    activeView: 'grid',
    activePeriodo: PERIODOS[0].id,
    periodoId: PERIODOS[0].id,
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
    publishWizardOpen: false,
    // F5A: config/metricas/noAsignadas for save payload
    lastConfig: null,
    noAsignadas: [],
    metricas: null,
    runEstado: 'borrador',
    // F4: multi-proposal
    proposals: [],
    activeProposalIndex: 0,
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

function _estadoBadge() {
  const map = {
    borrador:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: 'bi-pencil-fill',       label: 'Borrador'    },
    en_revision: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'bi-eye-fill',           label: 'En revisión' },
    publicado:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'bi-check-circle-fill',  label: 'Publicado'   },
    archivado:   { color: '#6b7280', bg: 'rgba(107,114,128,0.12)',icon: 'bi-archive-fill',        label: 'Archivado'   },
  }
  const m = map[state.estado] ?? map.borrador
  return `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.72rem;font-weight:600;background:${m.bg};color:${m.color};">
    <i class="bi ${m.icon}" style="font-size:0.65rem;"></i>${m.label}
  </span>`
}

function _statsBar() {
  const total     = state.assignments.length
  const conflicts = state.conflicts.length
  const locked    = state.assignments.filter(a => a.locked).length
  const canUndo   = state.undoStack.length
  return `
    <div class="hb-stats-bar">
      <span class="hb-stat"><i class="bi bi-calendar3"></i> <strong>${total}</strong> bloque${total !== 1 ? 's' : ''}</span>
      <span class="hb-stat ${conflicts > 0 ? 'hb-stat--danger' : 'hb-stat--ok'}">
        <i class="bi ${conflicts > 0 ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}"></i>
        <strong>${conflicts}</strong> conflicto${conflicts !== 1 ? 's' : ''}
      </span>
      <span class="hb-stat"><i class="bi bi-lock-fill"></i> <strong>${locked}</strong> bloqueado${locked !== 1 ? 's' : ''}</span>
      ${canUndo > 0 ? `<span class="hb-stat hb-stat--muted"><i class="bi bi-clock-history"></i> ${canUndo} en historial</span>` : ''}
      ${state.runId ? _estadoBadge() : ''}
    </div>
  `
}

function renderShell() {
  const periodOptions = PERIODOS.map(p =>
    `<option value="${p.id}" ${p.id === state.activePeriodo ? 'selected' : ''}>${p.nombre}</option>`
  ).join('');

  const isEditing  = state.draggable
  const hasContent = state.assignments.length > 0

  _container.innerHTML = `
    <div class="hb-view">

      <!-- Page header -->
      <div class="hb-page-header">
        <div class="hb-page-header__left">
          <div class="hb-page-header__icon"><i class="bi bi-calendar-week-fill"></i></div>
          <div>
            <h2 class="hb-page-header__title">Constructor de Horarios</h2>
            <p class="hb-page-header__sub">Genera, edita y publica el horario académico del período</p>
          </div>
        </div>
        <select class="hb-periodo-select" id="hb-periodo-select" title="Seleccionar período">
          ${periodOptions}
        </select>
      </div>

      <!-- Constraint panel (config: jornada, days, duration, sessions) -->
      <div id="hb-constraint-panel-slot">
        ${createConstraintPanel({ classes: [] })}
      </div>

      <!-- Proposal tabs (F4B) -->
      <div id="hb-proposal-tabs-wrapper" style="${state.proposals.length ? '' : 'display:none'}"></div>

      <!-- Stats bar -->
      <div id="hb-stats-wrapper">${hasContent ? _statsBar() : ''}</div>

      <!-- Toolbar principal -->
      <div class="hb-toolbar-main">
        <div class="hb-toolbar-group">
          <button class="hb-btn hb-btn--primary hb-btn--lg" id="hb-generate-btn">
            <i class="bi bi-lightning-fill"></i><span>Generar horario</span>
          </button>
        </div>
        <div class="hb-toolbar-divider"></div>
        <div class="hb-toolbar-group hb-toolbar-group--views">
          <span class="hb-toolbar-label">Vista</span>
          <div id="hb-view-toggle-slot">${createViewToggle(state.activeView)}</div>
        </div>
        <div class="hb-toolbar-divider"></div>
        <div class="hb-toolbar-group">
          <button class="hb-btn ${isEditing ? 'hb-btn--editing' : 'hb-btn--ghost'}" id="hb-drag-toggle"
                  title="${isEditing ? 'Desactivar edición' : 'Activar drag & drop'}">
            <i class="bi ${isEditing ? 'bi-unlock-fill' : 'bi-lock-fill'}"></i>
            <span>${isEditing ? 'Editando' : 'Editar'}</span>
          </button>
          <button class="hb-btn hb-btn--icon" id="hb-undo-btn" disabled title="Deshacer">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="hb-btn hb-btn--icon" id="hb-redo-btn" disabled title="Rehacer">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <div style="flex:1;"></div>
        <div class="hb-toolbar-group">
          <button class="hb-btn hb-btn--ghost" id="btn-export-excel" disabled title="Exportar a Excel">
            <i class="bi bi-file-earmark-spreadsheet"></i><span>Excel</span>
          </button>
          <button class="hb-btn hb-btn--ghost" id="btn-export-pdf" disabled title="Exportar a PDF">
            <i class="bi bi-filetype-pdf"></i><span>PDF</span>
          </button>
          <button class="hb-btn hb-btn--success" id="hb-save-btn" disabled>
            <i class="bi bi-floppy-fill"></i><span>Guardar</span>
          </button>
          <button class="hb-btn hb-btn--outline" id="hb-publish-btn" disabled>
            <i class="bi bi-globe"></i><span>Publicar</span>
          </button>
        </div>
      </div>

      <!-- Conflict panel -->
      <div id="hb-conflict-panel-wrapper"></div>

      <!-- Grid / empty state -->
      <div id="hb-grid-wrapper" class="hb-grid-wrapper">
        ${!hasContent ? _emptyState() : ''}
      </div>

      <!-- Publish wizard -->
      <div id="hb-publish-wrapper" class="mt-3" style="display:none"></div>

      <!-- Loading overlay -->
      <div id="hb-status"></div>
    </div>
  `;

  _injectHBStyles()
}

function _emptyState() {
  return `
    <div class="hb-empty">
      <div class="hb-empty__icon"><i class="bi bi-calendar-plus"></i></div>
      <h3 class="hb-empty__title">Sin horario generado</h3>
      <p class="hb-empty__desc">
        Presioná <strong>Generar horario</strong> para que el sistema distribuya automáticamente
        las clases según los maestros y salones disponibles.
      </p>
      <div class="hb-empty__steps">
        <div class="hb-empty__step"><span class="hb-empty__step-num">1</span><span>Selecciona el período</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">2</span><span>Genera el horario</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">3</span><span>Ajusta con drag & drop</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">4</span><span>Guarda y publica</span></div>
      </div>
    </div>
  `
}

function _injectHBStyles() {
  if (document.getElementById('hb-shell-styles')) return
  const s = document.createElement('style')
  s.id = 'hb-shell-styles'
  s.textContent = `
  .hb-view { padding: 1rem 1rem 2rem; max-width: 1400px; }
  .hb-page-header {
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:1rem;margin-bottom:1.1rem;
  }
  .hb-page-header__left { display:flex;align-items:center;gap:0.75rem; }
  .hb-page-header__icon {
    width:44px;height:44px;border-radius:12px;
    background:var(--hb-primary-light);color:var(--hb-primary);
    display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;
  }
  .hb-page-header__title { font-size:1.1rem;font-weight:700;margin:0;color:var(--hb-text); }
  .hb-page-header__sub   { font-size:0.75rem;color:var(--hb-text-muted);margin:0; }
  .hb-periodo-select {
    padding:0.4rem 0.75rem;border-radius:10px;border:1.5px solid var(--hb-border);
    background:var(--hb-card-bg);color:var(--hb-text);font-size:0.85rem;cursor:pointer;outline:none;
  }
  .hb-periodo-select:focus { border-color:var(--hb-primary); }
  .hb-stats-bar {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.75rem;
    padding:0.55rem 0.875rem;background:var(--hb-card-bg);
    border:1px solid var(--hb-border);border-radius:10px;margin-bottom:0.875rem;font-size:0.8rem;
  }
  .hb-stat { display:flex;align-items:center;gap:0.3rem;color:var(--hb-text-muted); }
  .hb-stat strong { color:var(--hb-text); }
  .hb-stat--ok .bi     { color:var(--hb-success); }
  .hb-stat--danger .bi,
  .hb-stat--danger strong { color:var(--hb-danger); }
  .hb-stat--muted { opacity:0.6; }
  .hb-toolbar-main {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.5rem;
    background:var(--hb-card-bg);border:1px solid var(--hb-border);
    border-radius:12px;padding:0.55rem 0.875rem;margin-bottom:0.875rem;
  }
  .hb-toolbar-group { display:flex;align-items:center;gap:0.375rem; }
  .hb-toolbar-group--views { gap:0.5rem; }
  .hb-toolbar-label { font-size:0.72rem;color:var(--hb-text-muted);font-weight:600;white-space:nowrap; }
  .hb-toolbar-divider { width:1px;height:22px;background:var(--hb-border);flex-shrink:0; }
  .hb-btn {
    display:inline-flex;align-items:center;gap:0.35rem;
    padding:0.38rem 0.875rem;border-radius:8px;border:1.5px solid transparent;
    font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.15s;
    white-space:nowrap;line-height:1;background:none;
  }
  .hb-btn:disabled { opacity:0.38;cursor:not-allowed;pointer-events:none; }
  .hb-btn--lg   { padding:0.48rem 1.1rem;font-size:0.875rem; }
  .hb-btn--icon { padding:0.38rem 0.5rem; }
  .hb-btn--primary { background:var(--hb-primary);color:#fff;border-color:var(--hb-primary); }
  .hb-btn--primary:hover { background:var(--hb-primary-hover);border-color:var(--hb-primary-hover); }
  .hb-btn--success { background:var(--hb-success);color:#fff;border-color:var(--hb-success); }
  .hb-btn--success:hover { filter:brightness(1.08); }
  .hb-btn--outline { border-color:var(--hb-primary);color:var(--hb-primary); }
  .hb-btn--outline:hover { background:var(--hb-primary-light); }
  .hb-btn--ghost { border-color:var(--hb-border);color:var(--hb-text-muted); }
  .hb-btn--ghost:hover { border-color:var(--hb-primary);color:var(--hb-primary); }
  .hb-btn--editing {
    border-color:var(--hb-warning);color:var(--hb-warning);background:var(--hb-warning-light);
    animation:hb-pulse-border 1.5s ease-in-out infinite;
  }
  @keyframes hb-pulse-border {
    0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0);}
    50%{box-shadow:0 0 0 3px rgba(245,158,11,0.2);}
  }
  .hb-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;padding:3rem 1.5rem;min-height:320px;
    border:2px dashed var(--hb-border);border-radius:16px;background:var(--hb-grid-bg);
  }
  .hb-empty__icon {
    width:68px;height:68px;border-radius:50%;background:var(--hb-primary-light);
    color:var(--hb-primary);display:flex;align-items:center;justify-content:center;
    font-size:1.875rem;margin-bottom:1rem;
  }
  .hb-empty__title { font-size:1.05rem;font-weight:700;margin:0 0 0.5rem;color:var(--hb-text); }
  .hb-empty__desc  { font-size:0.85rem;color:var(--hb-text-muted);max-width:360px;margin:0 auto 1.25rem;line-height:1.6; }
  .hb-empty__steps { display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;max-width:460px; }
  .hb-empty__step  {
    display:flex;align-items:center;gap:0.45rem;background:var(--hb-card-bg);
    border:1px solid var(--hb-border);border-radius:8px;padding:0.35rem 0.7rem;
    font-size:0.76rem;color:var(--hb-text-muted);
  }
  .hb-empty__step-num {
    width:18px;height:18px;border-radius:50%;background:var(--hb-primary);color:#fff;
    display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:700;flex-shrink:0;
  }
  `
  document.head.appendChild(s)
}

function _updateStatsBar() {
  const wrapper = _container?.querySelector('#hb-stats-wrapper')
  if (!wrapper) return
  wrapper.innerHTML = state.assignments.length > 0 ? _statsBar() : ''
}

function renderProposalTabs() {
  const wrapper = _container?.querySelector('#hb-proposal-tabs-wrapper')
  if (!wrapper) return
  if (!state.proposals.length) { wrapper.style.display = 'none'; return }

  wrapper.style.display = ''
  const tabs = state.proposals.map((p, i) => {
    const score = p.metricas?.score ?? 0
    const conflicts = (p.conflicts ?? []).length
    const isActive = i === state.activeProposalIndex
    const isDupe = p._duplicate ? ' hb-proposal-tab--duplicate' : ''
    const activeCls = isActive ? ' hb-proposal-tab--active' : ''
    const badge = `${score}% · ${conflicts} conflicto${conflicts !== 1 ? 's' : ''}`
    const dupeLabel = p._duplicate ? ' ⚠️' : ''
    return `<button class="hb-proposal-tab${activeCls}${isDupe}" data-proposal-index="${i}" title="${p._duplicate ? 'Propuesta duplicada' : ''}">
      <span class="hb-proposal-tab__label">Propuesta ${p.id}${dupeLabel}</span>
      <span class="hb-proposal-tab__badge">${badge}</span>
    </button>`
  }).join('')

  wrapper.innerHTML = `<div class="hb-proposal-tabs-bar">
    <span class="hb-toolbar-label" style="margin-right:0.5rem">Propuestas</span>
    ${tabs}
  </div>`
}

function renderGrid() {
  const wrapper = _container.querySelector('#hb-grid-wrapper');
  if (!wrapper) return;
  _updateStatsBar();
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
  if (type === 'danger') { AppToast.error(message); return; }
  if (type === 'warning') { AppToast.show(message, 'warning'); return; }
  AppToast.success(message);
}

// ─── HELPERS ─────────────────────────────────────────────────────

/** Deep-clones the assignments array for undo/redo snapshots. */
function cloneAssignments(assignments) {
  return JSON.parse(JSON.stringify(assignments));
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
      state.undoStack.push(cloneAssignments(state.assignments));
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

        state.undoStack.push(cloneAssignments(state.assignments));
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
      state.redoStack.push(cloneAssignments(state.assignments));
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
      state.undoStack.push(cloneAssignments(state.assignments));
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

    // Proposal tab click (F4B)
    const tabEl = e.target.closest('.hb-proposal-tab[data-proposal-index]')
    if (tabEl) {
      const idx = parseInt(tabEl.dataset.proposalIndex, 10)
      if (idx !== state.activeProposalIndex && state.proposals[idx]) {
        state.activeProposalIndex = idx
        const p = state.proposals[idx]
        state.assignments = p.assignments
        state.conflicts = p.conflicts ?? []
        state.noAsignadas = p.noAsignadas ?? []
        state.metricas = p.metricas ?? {}
        renderProposalTabs()
        renderGrid()
        renderConflictPanel()
        updateUndoRedoButtons()
      }
      return
    }

    // Export Excel (F4D)
    if (e.target.closest('#btn-export-excel')) {
      if (!state.assignments.length) return
      import('../utils/horarioExporter.js').then(({ exportToExcel }) => {
        exportToExcel(state.assignments).catch(err => showToast(err.message, 'danger'))
      })
      return
    }

    // Export PDF (F4D)
    if (e.target.closest('#btn-export-pdf')) {
      if (!state.assignments.length) return
      import('../utils/horarioExporter.js').then(({ exportToPDF }) => {
        exportToPDF(state.assignments).catch(err => showToast(err.message, 'danger'))
      })
      return
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

    // F1C: Read constraint panel values for jornada / duration / sessions config
    const panelSlot = _container.querySelector('#hb-constraint-panel-slot');
    const panelValues = panelSlot
      ? getConstraintPanelValues(panelSlot)
      : { startTime: '10:00', endTime: '19:00', selectedDays: ['lunes','martes','miércoles','jueves','viernes'], duracion: 60, gap: 15, sesionesPerSemana: 1 };

    const jornada = buildJornada(panelValues.startTime, panelValues.endTime, panelValues.selectedDays);

    // F5A + F5B: Map classes with per-class duration fallback and sessions
    const clasesConMaestro = (data.clases || []).map(c => ({
      id: c.id,
      nombre: c.nombre,
      maestro_principal_id: c.maestro_principal_id,
      total_alumnos: c.total_alumnos || 0,
      duracion: c.duracion_minutos ?? panelValues.duracion,
      sesiones_por_semana: panelValues.sesionesPerSemana
    }));

    // F2B: Partition classes into subgroups if they exceed salon capacity
    const clasesPartitioned = partitionClases(clasesConMaestro, data.salones || []);

    const config = {
      jornada,
      gapMinimo: panelValues.gap,
      duracionBloque: panelValues.duracion,
      sesionesPerSemana: panelValues.sesionesPerSemana
    };

    // F5A: Store config for save payload
    state.lastConfig = config;
    state.periodoId = state.activePeriodo;

    // F4C: Generate multiple proposals instead of a single schedule
    const rawProposals = generateMultipleProposals(
      { clasesConMaestro: clasesPartitioned, maestros: data.maestros || [], salones: data.salones || [] },
      config,
      3
    );

    // Detect conflicts per proposal and annotate assignments
    state.proposals = rawProposals.map(p => {
      const { conflicts, assignments } = detectConflicts(p.assignments, {
        returnAnnotated: true,
        gapMinutes: panelValues.gap,
      });
      return { ...p, assignments, conflicts };
    });

    state.activeProposalIndex = 0;
    const active = state.proposals[0];
    state.assignments = active.assignments;
    state.conflicts = active.conflicts;
    state.noAsignadas = active.noAsignadas ?? [];
    state.metricas = active.metricas ?? {};

    renderProposalTabs();
    renderGrid();
    renderConflictPanel();
    initDD();

    const saveBtn = _container.querySelector('#hb-save-btn');
    if (saveBtn) saveBtn.disabled = state.assignments.length === 0;

    const exportExcelBtn = _container.querySelector('#btn-export-excel');
    const exportPdfBtn = _container.querySelector('#btn-export-pdf');
    if (exportExcelBtn) exportExcelBtn.disabled = state.assignments.length === 0;
    if (exportPdfBtn) exportPdfBtn.disabled = state.assignments.length === 0;

    const { conflicts } = active;
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
    // F2C: Resolve subgroup synthetic IDs back to original clase_id before DB write
    const resolvedAssignments = state.assignments.map(a => ({
      ...a,
      clase_id: a._originalClaseId ?? a.clase_id
    }));

    // F5A: Send correct payload shape
    const payload = {
      periodo: state.periodoId ?? state.activePeriodo,
      config: state.lastConfig,
      resultado: {
        assignments: resolvedAssignments,
        noAsignadas: state.noAsignadas ?? []
      },
      metricas: state.metricas ?? {},
      estado: state.runEstado ?? 'borrador'
    };

    const saved = await saveScheduleRun(payload);
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
