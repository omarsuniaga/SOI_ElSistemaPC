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

import { fetchSchedulingData, saveScheduleRun, getScheduleRuns, fetchRegisteredScheduleData } from '../api/horarioBuilderApi.js';
import { exportToPDF, exportToExcel } from '../utils/horarioExporter.js';
import { AppToast } from '../../../shared/components/AppToast.js';
import { minutesBetween, addMinutes } from '../utils/timeUtils.js';
import { generateOptimizedSchedule } from '../engine/schedulingEngine.js';
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
    registeredAssignments: [],
    alumnos: [],
    maestros: [],
    salones: [],
    clases: [],
    selectedAlumnoId: '',
    selectedClaseId: '',
    selectedMaestroId: '',
    selectedSalonId: '',
    conflicts: [],
    activeView: 'grid',
    activePeriodo: PERIODOS[0].id,
    periodoId: PERIODOS[0].id,
    draggable: false,
    conflictPanelExpanded: false,
    constraintsExpanded: false,
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
    lastConfig: null,
    noAsignadas: [],
    metricas: null,
    runEstado: 'borrador'
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
  loadRegisteredSchedule();

  // Load schedule runs history (non-blocking)
  getScheduleRuns()
    .then(runs => { state.scheduleRuns = runs || []; })
    .catch(err => console.warn('[horarioBuilderView] getScheduleRuns failed:', err));

  // Non-blocking admin detection
  getCurrentUserIsAdmin()
    .then(isAdmin => { state.isAdmin = isAdmin; })
    .catch(() => { /* non-critical */ });
}

async function loadRegisteredSchedule() {
  setLoading(true);
  try {
    let data;
    try {
      data = await fetchRegisteredScheduleData();
    } catch (e) {
      data = await fetchSchedulingData();
    }
    state.registeredAssignments = data?.assignments || [];
    state.assignments = [...state.registeredAssignments];
    state.alumnos = data?.alumnos || [];
    state.maestros = data?.maestros || [];
    state.salones = data?.salones || [];
    state.clases = data?.clases || [];

    const { conflicts, assignments } = detectConflicts(state.assignments, { returnAnnotated: true });
    state.conflicts = conflicts;
    state.assignments = assignments;

    renderShell();
    renderGrid();
    renderConflictPanel();
  } catch (err) {
    console.error('[horarioBuilderView] loadRegisteredSchedule error:', err);
    showToast('Error al cargar horarios registrados: ' + err.message, 'danger');
  } finally {
    setLoading(false);
  }
}

function getFilteredAssignments() {
  let list = state.assignments;

  if (state.activeView === 'student' && state.selectedAlumnoId) {
    list = list.filter(a => (a.alumnos_ids || []).includes(state.selectedAlumnoId));
  } else if (state.activeView === 'class' && state.selectedClaseId) {
    list = list.filter(a => a.clase_id === state.selectedClaseId);
  } else if (state.activeView === 'teacher' && state.selectedMaestroId) {
    list = list.filter(a => a.maestro_id === state.selectedMaestroId);
  } else if (state.activeView === 'room' && state.selectedSalonId) {
    list = list.filter(a => a.salon_id === state.selectedSalonId);
  }

  return list;
}

function getActiveEntityInfo() {
  if (state.activeView === 'student' && state.selectedAlumnoId) {
    const al = state.alumnos.find(a => a.id === state.selectedAlumnoId);
    return al ? { name: `Alumno: ${al.nombre_completo}`, detail: al.instrumento_principal ? `Instrumento: ${al.instrumento_principal}` : '' } : null;
  }
  if (state.activeView === 'class' && state.selectedClaseId) {
    const cl = state.clases.find(c => c.id === state.selectedClaseId);
    return cl ? { name: `Clase: ${cl.nombre}`, detail: cl.instrumento ? `Cátedra: ${cl.instrumento}` : '' } : null;
  }
  if (state.activeView === 'teacher' && state.selectedMaestroId) {
    const m = state.maestros.find(x => x.id === state.selectedMaestroId);
    return m ? { name: `Maestro: ${m.nombre_completo || m.nombre}`, detail: 'Docente Titular' } : null;
  }
  if (state.activeView === 'room' && state.selectedSalonId) {
    const s = state.salones.find(x => x.id === state.selectedSalonId);
    return s ? { name: `Salón: ${s.nombre}`, detail: s.capacidad ? `Capacidad: ${s.capacidad} alumnos` : '' } : null;
  }
  return { name: 'Horario General Institucional', detail: 'Todas las clases registradas' };
}

// ─── RENDER HELPERS ─────────────────────────────────────────────

function _estadoBadge() {
  const map = {
    borrador:    { color: 'var(--soi-color-warning)', bg: 'var(--soi-color-warning-light)', icon: 'bi-pencil-fill',       label: 'Borrador'    },
    en_revision: { color: 'var(--soi-color-primary)', bg: 'var(--soi-color-primary-light)', icon: 'bi-eye-fill',           label: 'En revisión' },
    publicado:   { color: 'var(--soi-color-success)', bg: 'var(--soi-color-success-light)', icon: 'bi-check-circle-fill',  label: 'Publicado'   },
    archivado:   { color: 'var(--soi-text-muted)',    bg: 'var(--soi-bg-muted)',            icon: 'bi-archive-fill',        label: 'Archivado'   },
  }
  const m = map[state.estado] ?? map.borrador
  return `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.72rem;font-weight:600;background:${m.bg};color:${m.color};">
    <i class="bi ${m.icon}" style="font-size:0.65rem;"></i>${m.label}
  </span>`
}

function _statsBar() {
  const filtered  = getFilteredAssignments();
  const total     = filtered.length;
  const conflicts = state.conflicts.length;
  const locked    = state.assignments.filter(a => a.locked).length;
  const canUndo   = state.undoStack.length;
  const info      = getActiveEntityInfo();

  return `
    <div class="hb-stats-bar">
      <span class="hb-stat me-2"><i class="bi bi-info-circle-fill text-primary"></i> <strong>${info?.name || 'Vista General'}</strong> ${info?.detail ? `(${info.detail})` : ''}</span>
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

function renderEntitySelector() {
  if (state.activeView === 'grid') return '';

  let label = '';
  let id = '';
  let optionsHtml = '';

  if (state.activeView === 'student') {
    label = 'Seleccionar Alumno:';
    id = 'hb-alumno-select';
    optionsHtml = `<option value="">-- Todos los Alumnos (${state.alumnos.length}) --</option>` +
      state.alumnos.map(a => `<option value="${a.id}" ${a.id === state.selectedAlumnoId ? 'selected' : ''}>${a.nombre_completo} ${a.instrumento_principal ? `(${a.instrumento_principal})` : ''}</option>`).join('');
  } else if (state.activeView === 'class') {
    label = 'Seleccionar Clase:';
    id = 'hb-clase-select';
    optionsHtml = `<option value="">-- Todas las Clases (${state.clases.length}) --</option>` +
      state.clases.map(c => `<option value="${c.id}" ${c.id === state.selectedClaseId ? 'selected' : ''}>${c.nombre} ${c.instrumento ? `[${c.instrumento}]` : ''}</option>`).join('');
  } else if (state.activeView === 'teacher') {
    label = 'Seleccionar Maestro:';
    id = 'hb-maestro-select';
    optionsHtml = `<option value="">-- Todos los Maestros (${state.maestros.length}) --</option>` +
      state.maestros.map(m => `<option value="${m.id}" ${m.id === state.selectedMaestroId ? 'selected' : ''}>${m.nombre_completo || m.nombre}</option>`).join('');
  } else if (state.activeView === 'room') {
    label = 'Seleccionar Salón:';
    id = 'hb-salon-select';
    optionsHtml = `<option value="">-- Todos los Salones (${state.salones.length}) --</option>` +
      state.salones.map(s => `<option value="${s.id}" ${s.id === state.selectedSalonId ? 'selected' : ''}>${s.nombre}</option>`).join('');
  }

  return `
    <div class="hb-entity-selector-bar d-flex align-items-center gap-2 p-2 mb-2 bg-body-tertiary rounded border">
      <i class="bi bi-funnel-fill text-primary"></i>
      <label for="${id}" class="form-label mb-0 small fw-bold text-nowrap">${label}</label>
      <select class="form-select form-select-sm" id="${id}" style="max-width:320px;">
        ${optionsHtml}
      </select>
    </div>
  `;
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
            <h2 class="hb-page-header__title">Horarios Institucionales</h2>
            <p class="hb-page-header__sub">Consulta, edita y exporta el horario por Alumno, Maestro, Salón o General</p>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <select class="hb-periodo-select" id="hb-periodo-select" title="Seleccionar período">
            ${periodOptions}
          </select>
          <button class="btn btn-outline-secondary btn-sm d-print-none" id="hb-refresh-btn" title="Recargar del servidor">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <!-- Constraint panel (advanced / collapsible) -->
      <div class="hb-collapse-panel hb-collapse-panel--constraints d-print-none">
        <button class="hb-collapse-toggle" id="hb-toggle-constraints" type="button" aria-expanded="${state.constraintsExpanded ? 'true' : 'false'}">
          <span class="d-flex align-items-center gap-2">
            <i class="bi bi-sliders"></i>
            <strong>Configuración avanzada y Generador IA</strong>
          </span>
          <span class="hb-collapse-toggle__meta">
            ${state.constraintsExpanded ? 'Ocultar' : 'Mostrar'}
            <i class="bi ${state.constraintsExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
          </span>
        </button>
        <div class="hb-collapse-panel__body ${state.constraintsExpanded ? 'is-open' : 'is-collapsed'}" id="hb-constraint-panel-shell">
          <div id="hb-constraint-panel-slot">
            ${createConstraintPanel({ classes: [] })}
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      <div id="hb-stats-wrapper">${hasContent ? _statsBar() : ''}</div>

      <!-- Entity Filter Bar (Alumno/Clase/Maestro/Salón) -->
      <div id="hb-entity-selector-slot" class="d-print-none">${renderEntitySelector()}</div>

      <!-- Toolbar principal -->
      <div class="hb-toolbar-main d-print-none">
        <div class="hb-toolbar-group">
          <button class="hb-btn hb-btn--primary hb-btn--lg" id="hb-generate-btn" title="Generar nuevo esquema optimizado">
            <i class="bi bi-lightning-fill"></i><span>Generar IA</span>
          </button>
        </div>
        <div class="hb-toolbar-divider"></div>
        <div class="hb-toolbar-group hb-toolbar-group--views">
          <span class="hb-toolbar-label">Vista:</span>
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
          <!-- Botones de Exportación e Impresión -->
          <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" id="hb-export-pdf-btn" title="Exportar reporte PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="btn btn-outline-success btn-sm d-flex align-items-center gap-1" id="hb-export-excel-btn" title="Exportar Excel">
            <i class="bi bi-file-earmark-excel"></i> Excel
          </button>
          <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" id="hb-print-btn" title="Imprimir horario">
            <i class="bi bi-printer"></i> Imprimir
          </button>
          <div class="hb-toolbar-divider"></div>
          <button class="hb-btn hb-btn--success" id="hb-save-btn">
            <i class="bi bi-floppy-fill"></i><span>Guardar</span>
          </button>
          <button class="hb-btn hb-btn--outline" id="hb-publish-btn" disabled>
            <i class="bi bi-globe"></i><span>Publicar</span>
          </button>
        </div>
      </div>

      <!-- Conflict panel (collapsible) -->
      <div class="hb-collapse-panel hb-collapse-panel--conflicts d-print-none">
        <button class="hb-collapse-toggle" id="hb-toggle-conflicts" type="button" aria-expanded="${state.conflictPanelExpanded ? 'true' : 'false'}" ${state.conflicts.length === 0 ? 'disabled' : ''}>
          <span class="d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle"></i>
            <strong>Conflictos</strong>
            <span id="hb-conflict-count" class="hb-collapse-count">${state.conflicts.length > 0 ? `(${state.conflicts.length})` : ''}</span>
          </span>
          <span class="hb-collapse-toggle__meta">
            ${state.conflictPanelExpanded ? 'Ocultar' : 'Mostrar'}
            <i class="bi ${state.conflictPanelExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
          </span>
        </button>
        <div class="hb-collapse-panel__body ${state.conflictPanelExpanded && state.conflicts.length > 0 ? 'is-open' : 'is-collapsed'}" id="hb-conflict-panel-shell">
          <div id="hb-conflict-panel-wrapper"></div>
        </div>
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
    background:var(--soi-color-primary-light);color:var(--soi-color-primary);
    display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;
  }
  .hb-page-header__title { font-size:1.1rem;font-weight:700;margin:0;color:var(--soi-text); }
  .hb-page-header__sub   { font-size:0.75rem;color:var(--soi-text-muted);margin:0; }
  .hb-periodo-select {
    padding:0.4rem 0.75rem;border-radius:10px;border:1.5px solid var(--soi-border);
    background:var(--soi-surface);color:var(--soi-text);font-size:0.85rem;cursor:pointer;outline:none;
  }
  .hb-periodo-select:focus { border-color:var(--soi-color-primary); }
  .hb-stats-bar {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.75rem;
    padding:0.55rem 0.875rem;background:var(--soi-surface);
    border:1px solid var(--soi-border);border-radius:10px;margin-bottom:0.875rem;font-size:0.8rem;
  }
  .hb-stat { display:flex;align-items:center;gap:0.3rem;color:var(--soi-text-muted); }
  .hb-stat strong { color:var(--soi-text); }
  .hb-stat--ok .bi     { color:var(--soi-color-success); }
  .hb-stat--danger .bi,
  .hb-stat--danger strong { color:var(--soi-color-danger); }
  .hb-stat--muted { opacity:0.6; }
  .hb-toolbar-main {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.5rem;
    background:var(--soi-surface);border:1px solid var(--soi-border);
    border-radius:12px;padding:0.55rem 0.875rem;margin-bottom:0.875rem;
  }
  .hb-toolbar-group { display:flex;align-items:center;gap:0.375rem; }
  .hb-toolbar-group--views { gap:0.5rem; }
  .hb-toolbar-label { font-size:0.72rem;color:var(--soi-text-muted);font-weight:600;white-space:nowrap; }
  .hb-toolbar-divider { width:1px;height:22px;background:var(--soi-border);flex-shrink:0; }
  .hb-btn {
    display:inline-flex;align-items:center;gap:0.35rem;
    padding:0.38rem 0.875rem;border-radius:8px;border:1.5px solid transparent;
    font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.15s;
    white-space:nowrap;line-height:1;background:none;
  }
  .hb-btn:disabled { opacity:0.38;cursor:not-allowed;pointer-events:none; }
  .hb-btn--lg   { padding:0.48rem 1.1rem;font-size:0.875rem; }
  .hb-btn--icon { padding:0.38rem 0.5rem; }
  .hb-btn--primary { background:var(--soi-color-primary);color:var(--soi-text-on-primary);border-color:var(--soi-color-primary); }
  .hb-btn--primary:hover { background:var(--soi-color-primary-hover);border-color:var(--soi-color-primary-hover); }
  .hb-btn--success { background:var(--soi-color-success);color:var(--soi-text-on-primary);border-color:var(--soi-color-success); }
  .hb-btn--success:hover { filter:brightness(1.08); }
  .hb-btn--outline { border-color:var(--soi-color-primary);color:var(--soi-color-primary); }
  .hb-btn--outline:hover { background:var(--soi-color-primary-light); }
  .hb-btn--ghost { border-color:var(--soi-border);color:var(--soi-text-muted); }
  .hb-btn--ghost:hover { border-color:var(--soi-color-primary);color:var(--soi-color-primary); }
  .hb-btn--editing {
    border-color:var(--soi-color-warning);color:var(--soi-color-warning);background:var(--soi-color-warning-light);
    animation:hb-pulse-border 1.5s ease-in-out infinite;
  }
  .hb-collapse-panel {
    background:var(--soi-surface);
    border:1px solid var(--soi-border);
    border-radius:12px;
    overflow:hidden;
    margin-bottom:0.875rem;
  }
  .hb-collapse-toggle {
    width:100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:0.75rem;
    padding:0.7rem 0.875rem;
    border:none;
    background:linear-gradient(180deg, rgba(99,102,241,0.06), rgba(99,102,241,0.02));
    color:var(--soi-text);
    font-size:0.84rem;
    font-weight:700;
    cursor:pointer;
  }
  .hb-collapse-toggle:disabled { cursor:not-allowed; opacity:0.55; }
  .hb-collapse-toggle__meta {
    display:inline-flex;
    align-items:center;
    gap:0.35rem;
    color:var(--soi-text-muted);
    font-size:0.75rem;
    font-weight:600;
    white-space:nowrap;
  }
  .hb-collapse-count {
    color:var(--soi-color-danger);
    font-size:0.75rem;
    font-weight:700;
  }
  .hb-collapse-panel__body {
    border-top:1px solid var(--soi-border);
    padding:0.75rem;
    background:var(--soi-bg-subtle);
  }
  .hb-collapse-panel__body.is-collapsed { display:none; }
  .hb-collapse-panel--constraints .hb-collapse-toggle {
    background:linear-gradient(180deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03));
  }
  .hb-collapse-panel--conflicts .hb-collapse-toggle {
    background:linear-gradient(180deg, rgba(245,158,11,0.10), rgba(245,158,11,0.04));
  }
  @keyframes hb-pulse-border {
    0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0);}
    50%{box-shadow:0 0 0 3px rgba(245,158,11,0.2);}
  }
  .hb-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;padding:3rem 1.5rem;min-height:320px;
    border:2px dashed var(--soi-border);border-radius:16px;background:var(--soi-bg-subtle);
  }
  .hb-empty__icon {
    width:68px;height:68px;border-radius:50%;background:var(--soi-color-primary-light);
    color:var(--soi-color-primary);display:flex;align-items:center;justify-content:center;
    font-size:1.875rem;margin-bottom:1rem;
  }
  .hb-empty__title { font-size:1.05rem;font-weight:700;margin:0 0 0.5rem;color:var(--soi-text); }
  .hb-empty__desc  { font-size:0.85rem;color:var(--soi-text-muted);max-width:360px;margin:0 auto 1.25rem;line-height:1.6; }
  .hb-empty__steps { display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;max-width:460px; }
  .hb-empty__step  {
    display:flex;align-items:center;gap:0.45rem;background:var(--soi-surface);
    border:1px solid var(--soi-border);border-radius:8px;padding:0.35rem 0.7rem;
    font-size:0.76rem;color:var(--soi-text-muted);
  }
  .hb-empty__step-num {
    width:18px;height:18px;border-radius:50%;background:var(--soi-color-primary);color:var(--soi-text-on-primary);
    display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:700;flex-shrink:0;
  }

  @media (max-width: 768px) {
    .hb-toolbar-main {
      padding:0.6rem;
      gap:0.6rem;
    }

    .hb-toolbar-divider {
      display:none;
    }

    .hb-toolbar-group {
      flex-wrap:wrap;
    }

    .hb-toolbar-group--views {
      width:100%;
      justify-content:space-between;
    }

    .hb-toolbar-main .hb-btn span,
    .hb-toolbar-main .hb-toolbar-label {
      font-size:0.8rem;
    }
  }
  `
  document.head.appendChild(s)
}

function _updateStatsBar() {
  const wrapper = _container?.querySelector('#hb-stats-wrapper')
  if (!wrapper) return
  wrapper.innerHTML = state.assignments.length > 0 ? _statsBar() : ''
}

function syncCollapsePanels() {
  const constraintsBtn = _container?.querySelector('#hb-toggle-constraints')
  const constraintsBody = _container?.querySelector('#hb-constraint-panel-shell')
  if (constraintsBtn && constraintsBody) {
    constraintsBtn.setAttribute('aria-expanded', state.constraintsExpanded ? 'true' : 'false')
    const meta = constraintsBtn.querySelector('.hb-collapse-toggle__meta')
    if (meta) {
      meta.innerHTML = `${state.constraintsExpanded ? 'Ocultar' : 'Mostrar'} <i class="bi ${state.constraintsExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>`
    }
    constraintsBody.classList.toggle('is-open', state.constraintsExpanded)
    constraintsBody.classList.toggle('is-collapsed', !state.constraintsExpanded)
  }

  const conflictsBtn = _container?.querySelector('#hb-toggle-conflicts')
  const conflictsBody = _container?.querySelector('#hb-conflict-panel-shell')
  if (conflictsBtn && conflictsBody) {
    conflictsBtn.disabled = state.conflicts.length === 0
    conflictsBtn.setAttribute('aria-expanded', state.conflictPanelExpanded ? 'true' : 'false')
    const count = conflictsBtn.querySelector('#hb-conflict-count')
    if (count) count.textContent = state.conflicts.length > 0 ? `(${state.conflicts.length})` : ''
    const meta = conflictsBtn.querySelector('.hb-collapse-toggle__meta')
    if (meta) {
      meta.innerHTML = `${state.conflictPanelExpanded ? 'Ocultar' : 'Mostrar'} <i class="bi ${state.conflictPanelExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>`
    }
    conflictsBody.classList.toggle('is-open', state.conflictPanelExpanded && state.conflicts.length > 0)
    conflictsBody.classList.toggle('is-collapsed', !(state.conflictPanelExpanded && state.conflicts.length > 0))
  }
}

function setLoading(on) {
  state.loading = on;
  const el = _container?.querySelector('#hb-status');
  if (!el) return;
  el.innerHTML = on
    ? `<div class="d-flex align-items-center gap-2 mt-2 text-muted" style="font-size:0.85rem;">
         <div class="spinner-border spinner-border-sm" role="status"></div>
         <span>Procesando...</span>
       </div>`
    : '';
}

function showToast(message, type = 'success') {
  if (type === 'danger') { AppToast.error(message); return; }
  if (type === 'warning') { AppToast.show(message, 'warning'); return; }
  AppToast.success(message);
}

function renderGrid() {
  const wrapper = _container.querySelector('#hb-grid-wrapper');
  if (!wrapper) return;
  _updateStatsBar();

  const entitySlot = _container.querySelector('#hb-entity-selector-slot');
  if (entitySlot) entitySlot.innerHTML = renderEntitySelector();

  const filtered = getFilteredAssignments();

  wrapper.innerHTML = createScheduleGrid({
    assignments: filtered,
    activeView: state.activeView,
    draggable: state.draggable,
    periodoId: state.activePeriodo
  });
  attachScheduleGridListeners(wrapper);
}

function renderConflictPanel() {
  const wrapper = _container.querySelector('#hb-conflict-panel-wrapper');
  if (!wrapper) return;

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
  syncCollapsePanels();
}

// ─── HELPERS ─────────────────────────────────────────────────────

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
    if (e.target.closest('#hb-toggle-constraints')) {
      state.constraintsExpanded = !state.constraintsExpanded;
      renderShell();
      return;
    }

    if (e.target.closest('#hb-toggle-conflicts')) {
      if (state.conflicts.length === 0) return;
      state.conflictPanelExpanded = !state.conflictPanelExpanded;
      renderShell();
      return;
    }

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

    const result = generateOptimizedSchedule({
      clasesConMaestro: clasesPartitioned,
      maestros: data.maestros || [],
      salones: data.salones || [],
      config
    });

    // F5A: Store noAsignadas and metricas for save payload
    state.noAsignadas = result.noAsignadas ?? [];
    state.metricas = result.metricas ?? {};

    const { conflicts, assignments } = detectConflicts(result.assignments, {
      returnAnnotated: true,
      gapMinutes: panelValues.gap
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
