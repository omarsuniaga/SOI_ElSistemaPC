/**
 * luteriaOrdenesView.js — Tablero Kanban y Gestión de Órdenes de Reparación del Taller de Lutería.
 * Formateado bajo la Plantilla V2:
 * - Header & Toolbar Unificada V2 con KPI badges en tiempo real.
 * - Buscador permanente exterior y panel colapsable de filtros ('Filtros' + 'Limpiar').
 * - Ficha artesanal de alumno e instrumento limpia (sin UUIDs técnicos).
 * - Micro-stepper visual y botones direccionales ergonómicos.
 * - Soporte Dark / Light mode con tokens de Bootstrap 5.
 */

import { getOrdenes, updateOrdenEstado } from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { openLuteriaOrdenWizard } from '../components/luteriaOrdenWizard.js'
import { openDiagnosticoWizard } from '../components/luteriaDiagnosticoWizard.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import '../styles/luteria.css'

const ESTADOS_FLOW = [
  'reportado',
  'recibido',
  'pendiente_diagnostico',
  'diagnosticado',
  'presupuesto_pendiente',
  'esperando_aprobacion',
  'esperando_insumos',
  'en_reparacion',
  'en_prueba',
  'listo_entrega',
  'entregado',
  'cerrado',
]

const ESTADOS_LABELS = {
  reportado: 'Reportado',
  recibido: 'Recibido en taller',
  pendiente_diagnostico: 'Pendiente diagnóstico',
  diagnosticado: 'Diagnosticado',
  presupuesto_pendiente: 'Presupuesto pendiente',
  esperando_aprobacion: 'Esperando aprobación',
  esperando_insumos: 'Esperando insumos / repuesto',
  en_reparacion: 'En reparación activa',
  en_prueba: 'En prueba / calibración',
  listo_entrega: 'Listo para entrega',
  entregado: 'Entregado a alumno',
  cerrado: 'Orden cerrada',
  cancelado: 'Cancelado',
}

const KANBAN_COLUMNS = [
  {
    id: 'recepcion',
    step: '01',
    title: 'Recepción & Triaje',
    icon: 'bi-inbox-fill',
    color: 'text-primary',
    stageIndex: 1,
    states: ['reportado', 'recibido', 'pendiente_diagnostico', 'diagnosticado'],
  },
  {
    id: 'aprobacion',
    step: '02',
    title: 'Presupuesto & Insumos',
    icon: 'bi-hourglass-split',
    color: 'text-warning-emphasis',
    stageIndex: 2,
    states: ['presupuesto_pendiente', 'esperando_aprobacion', 'esperando_insumos'],
  },
  {
    id: 'banco',
    step: '03',
    title: 'En Banco de Trabajo',
    icon: 'bi-wrench-adjustable-circle-fill',
    color: 'text-info-emphasis',
    stageIndex: 3,
    states: ['en_reparacion', 'en_prueba'],
  },
  {
    id: 'entrega',
    step: '04',
    title: 'Control & Entrega',
    icon: 'bi-check-circle-fill',
    color: 'text-success',
    stageIndex: 4,
    states: ['listo_entrega', 'entregado', 'cerrado'],
  },
]

let _abortController = null
let _vistaModo = 'kanban' // 'kanban' | 'lista'

const state = {
  filtrosAbiertos: false,
  filtroPrioridad: '',
  filtroEstado: '',
  busqueda: '',
}

export async function renderLuteriaOrdenesView(container, params = {}) {
  if (!container) return

  _abortController?.abort()
  _abortController = new AbortController()

  container.innerHTML = _renderSkeleton()

  try {
    const ordenes = await getOrdenes()
    _renderUI(container, ordenes)
    _attachEvents(container, ordenes)
    attachViewInfoEvents(container)
  } catch (err) {
    console.error('[LuteriaOrdenes] Error:', err)
    container.innerHTML = `
      <div class="container-fluid p-4">
        <div class="alert alert-danger shadow-sm rounded-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar órdenes de reparación: ${escapeHTML(err.message)}
        </div>
      </div>
    `
  }
}

function _renderSkeleton() {
  return `
    <div class="container-fluid p-3 p-md-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="spinner-border spinner-border-sm text-primary me-2"></div>
          <span class="text-muted fw-semibold">Cargando tablero de órdenes de lutería...</span>
        </div>
      </div>
    </div>
  `
}

function _renderUI(container, ordenes) {
  const activasCount = ordenes.filter(o => !['entregado', 'cerrado', 'cancelado'].includes(o.estado)).length
  const criticasCount = ordenes.filter(o => o.prioridad === 'critica' && !['entregado', 'cerrado'].includes(o.estado)).length
  const enBancoCount = ordenes.filter(o => ['en_reparacion', 'en_prueba'].includes(o.estado)).length
  const listasCount = ordenes.filter(o => o.estado === 'listo_entrega').length

  const activosFiltrosCount = [
    state.filtroPrioridad !== '',
    state.filtroEstado !== '',
  ].filter(Boolean).length

  container.innerHTML = `
    <div class="page-container" style="max-width: 1300px;">
      
      <!-- Header & Toolbar Unificada V2 -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center">
              <i class="bi bi-kanban fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Tablero de Órdenes de Reparación</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Control del flujo técnico de reparación, diagnóstico de averías y entrega</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-gear-wide-connected me-1"></i><span>${activasCount}</span> Activas
              </span>
              ${criticasCount > 0 ? `
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                  <i class="bi bi-exclamation-octagon-fill me-1"></i><span>${criticasCount}</span> Críticas
                </span>
              ` : ''}
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-wrench-adjustable me-1"></i><span>${enBancoCount}</span> En Banco
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-check2-circle me-1"></i><span>${listasCount}</span> Listas para Entrega
              </span>
            </div>
          </div>

          <!-- Toolbar de Botones -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            ${renderViewInfoButton('luteria-ordenes')}
            <div class="btn-group btn-group-sm shadow-xs rounded-3 overflow-hidden" id="btn-group-vista">
              <button class="btn btn-outline-secondary ${(_vistaModo === 'kanban') ? 'active' : ''}" data-modo="kanban" title="Vista Tablero Kanban" style="font-size:0.78rem;">
                <i class="bi bi-kanban me-1"></i>Kanban
              </button>
              <button class="btn btn-outline-secondary ${(_vistaModo === 'lista') ? 'active' : ''}" data-modo="lista" title="Vista Lista" style="font-size:0.78rem;">
                <i class="bi bi-list-task me-1"></i>Lista
              </button>
            </div>
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-refresh-ordenes" title="Refrescar">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="btn btn-sm btn-warning d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-bold shadow-xs text-dark" id="btn-nueva-orden-taller" style="font-size:0.78rem;">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Nueva Orden</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Búsqueda Exterior Permanente y Botón Toggle Filtros -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
          <div class="flex-grow-1" style="min-width: 260px;">
            <div class="input-group input-group-sm rounded-3 overflow-hidden shadow-xs border border-body-tertiary">
              <span class="input-group-text bg-body-tertiary border-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control border-0 py-1.5 bg-body text-body" id="filtro-buscar-orden" placeholder="Buscar por alumno, instrumento o diagnóstico..." value="${escapeHTML(state.busqueda || '')}" autocomplete="off" style="font-size:0.8rem;">
              ${state.busqueda ? `<button class="btn btn-sm bg-body text-muted border-0" id="btnLimpiarBuscarOrden"><i class="bi bi-x"></i></button>` : ''}
            </div>
          </div>

          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            <!-- Botón Desplegable de Filtros -->
            <button class="btn btn-sm ${state.filtrosAbiertos || activosFiltrosCount > 0 ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosOrdenes" type="button" style="font-size:0.78rem;">
              <i class="bi bi-funnel"></i>
              <span>Filtros</span>
              ${activosFiltrosCount > 0 ? `<span class="badge bg-white text-primary rounded-pill px-1.5 ms-1" style="font-size:0.68rem;">${activosFiltrosCount}</span>` : ''}
            </button>

            <!-- Botón Limpiar Filtros -->
            <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosOrdenes" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        <!-- Fila 3: Panel Colapsable de Filtros -->
        <div class="collapse ${state.filtrosAbiertos ? 'show' : ''} pt-2.5" id="panelFiltrosOrdenes">
          <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
            <div class="row g-2 align-items-center">
              
              <div class="col-12 col-sm-6 col-lg-6">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Nivel de Prioridad</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtro-prioridad-orden" style="font-size:0.8rem;">
                  <option value="" ${state.filtroPrioridad === '' ? 'selected' : ''}>Todas las prioridades</option>
                  <option value="critica" ${state.filtroPrioridad === 'critica' ? 'selected' : ''}>🔴 Prioridad Crítica</option>
                  <option value="alta" ${state.filtroPrioridad === 'alta' ? 'selected' : ''}>🟠 Prioridad Alta</option>
                  <option value="media" ${state.filtroPrioridad === 'media' ? 'selected' : ''}>🔵 Prioridad Media</option>
                  <option value="baja" ${state.filtroPrioridad === 'baja' ? 'selected' : ''}>⚪ Prioridad Baja</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-6">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado Específico de Flujo</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtro-estado-especifico" style="font-size:0.8rem;">
                  <option value="" ${state.filtroEstado === '' ? 'selected' : ''}>Cualquier estado</option>
                  ${ESTADOS_FLOW.map(st => `
                    <option value="${st}" ${state.filtroEstado === st ? 'selected' : ''}>${ESTADOS_LABELS[st] || st}</option>
                  `).join('')}
                </select>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- CONTENEDOR KANBAN O LISTA -->
      <div id="contenedor-vista-ordenes">
        ${(_vistaModo === 'kanban') ? _renderKanban(ordenes) : _renderLista(ordenes)}
      </div>

    </div>
  `
}

function _renderKanban(ordenes) {
  return `
    <div class="row g-3">
      ${KANBAN_COLUMNS.map(col => {
        const colOrdenes = ordenes.filter(o => col.states.includes(o.estado))
        return `
          <div class="col-12 col-md-6 col-xl-3">
            <div class="lut-kanban-column h-100">
              <!-- Encabezado de Columna -->
              <div class="lut-kanban-col-header">
                <div class="d-flex align-items-center gap-2">
                  <span class="lut-kanban-col-step">${col.step}</span>
                  <div class="d-flex align-items-center gap-1.5">
                    <i class="bi ${col.icon} ${col.color}"></i>
                    <span class="fw-bold" style="font-size:0.82rem;">${col.title}</span>
                  </div>
                </div>
                <span class="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-0.5 fw-bold" style="font-size:0.72rem;">${colOrdenes.length}</span>
              </div>

              <!-- Lista de Tarjetas de la Columna -->
              <div class="p-2.5 d-flex flex-column gap-2.5" style="min-height:480px;">
                ${colOrdenes.length > 0 ? colOrdenes.map(o => _renderKanbanCard(o, col.stageIndex)).join('') : `
                  <div class="text-center py-5 text-muted small">
                    <i class="bi bi-inbox text-secondary display-6 d-block mb-1 opacity-50"></i>
                    Sin órdenes en esta etapa
                  </div>
                `}
              </div>
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

function _formatoInstrumento(instrumentoId) {
  if (!instrumentoId) return 'Instrumento Institucional'
  const str = String(instrumentoId).trim()
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return 'Instrumento Institucional'
  }
  return str
}

function _obtenerIniciales(nombre) {
  if (!nombre) return 'IN'
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

function _getStageIndex(estado) {
  for (let i = 0; i < KANBAN_COLUMNS.length; i++) {
    if (KANBAN_COLUMNS[i].states.includes(estado)) return i + 1
  }
  return 1
}

function _renderKanbanCard(o, stageIndex) {
  const sig = _siguienteEstado(o.estado)
  const prev = _anteriorEstado(o.estado)

  const alumnoNombre = o.alumno_nombre ? o.alumno_nombre.trim() : 'Instrumento Institucional'
  const iniciales = _obtenerIniciales(alumnoNombre)
  const instrumentoLabel = _formatoInstrumento(o.instrumento_id)
  const diagnosticoTexto = o.tipo_dano || o.descripcion_inicial || 'Mantenimiento / Calibración'
  const prioridad = o.prioridad || 'media'
  const curStage = _getStageIndex(o.estado)

  return `
    <div class="lut-kanban-card prio-${prioridad} kanban-card d-flex flex-column" 
         data-id="${o.id}" 
         data-search="${escapeHTML([alumnoNombre, instrumentoLabel, diagnosticoTexto].filter(Boolean).join(' ').toLowerCase())}" 
         data-prioridad="${escapeHTML(prioridad)}"
         data-estado="${escapeHTML(o.estado)}">
      
      <!-- FILA 1: FICHA ALUMNO & PRIORIDAD -->
      <div class="d-flex align-items-center justify-content-between gap-2 mb-2 pb-1.5 border-bottom">
        <div class="d-flex align-items-center gap-2 min-w-0">
          <div class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style="width:30px;height:30px;font-size:0.72rem;">
            ${iniciales}
          </div>
          <div class="min-w-0">
            <div class="fw-bold text-body text-truncate" style="font-size:0.84rem;" title="${escapeHTML(alumnoNombre)}">
              ${escapeHTML(alumnoNombre)}
            </div>
          </div>
        </div>
        <div>
          ${_prioridadBadge(prioridad)}
        </div>
      </div>

      <!-- FILA 2: INSTRUMENTO ASOCIADO -->
      <div class="d-flex align-items-center justify-content-between mb-1">
        <span class="badge bg-body-secondary text-body border" style="font-size:0.72rem;">
          <i class="bi bi-music-note-beamed text-primary me-1"></i>${escapeHTML(instrumentoLabel)}
        </span>
        <span class="text-muted small" style="font-size:0.68rem;">
          ${new Date(o.fecha_recepcion || o.created_at).toLocaleDateString()}
        </span>
      </div>

      <!-- FILA 3: CAJA DE DIAGNÓSTICO TÉCNICO -->
      <div class="lut-diag-box">
        <div class="lut-diag-label">
          <i class="bi bi-wrench-adjustable text-warning"></i>
          <span>${escapeHTML(o.tipo_dano || 'Diagnóstico preliminar')}</span>
        </div>
        ${o.descripcion_inicial && o.descripcion_inicial !== o.tipo_dano ? `
          <div class="lut-diag-desc text-truncate">
            ${escapeHTML(o.descripcion_inicial)}
          </div>
        ` : ''}
      </div>

      <!-- FILA 4: ESTADO ACTUAL & MICRO-STEPPER -->
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="badge bg-secondary-subtle text-secondary fw-semibold" style="font-size:0.7rem;">
          ${escapeHTML(ESTADOS_LABELS[o.estado] || o.estado)}
        </span>
        <div class="lut-pipeline-stepper mb-0" style="width: 80px;" title="Etapa ${curStage} de 4">
          <div class="lut-pipeline-dot ${curStage >= 1 ? (curStage > 1 ? 'is-done' : 'is-active') : ''}"></div>
          <div class="lut-pipeline-dot ${curStage >= 2 ? (curStage > 2 ? 'is-done' : 'is-active') : ''}"></div>
          <div class="lut-pipeline-dot ${curStage >= 3 ? (curStage > 3 ? 'is-done' : 'is-active') : ''}"></div>
          <div class="lut-pipeline-dot ${curStage >= 4 ? 'is-done' : ''}"></div>
        </div>
      </div>

      <!-- FILA 5: BOTONES DE ACCIÓN ERGONÓMICOS -->
      <div class="mt-auto pt-2 border-top d-flex align-items-center justify-content-between gap-2">
        <button class="btn btn-sm btn-outline-secondary py-1 px-2.5 rounded-3 btn-diagnostico-wizard d-inline-flex align-items-center gap-1 shadow-2xs" 
                data-id="${o.id}" 
                data-serie="${escapeHTML(o.instrumento_id || '')}" 
                title="Abrir Ficha de Cotización y Diagnóstico">
          <i class="bi bi-clipboard2-pulse"></i>
          <span style="font-size:0.75rem;">Ficha</span>
        </button>

        <div class="d-inline-flex align-items-center gap-1">
          ${prev ? `
            <button class="btn btn-sm btn-light border py-1 px-2.5 rounded-3 btn-retroceder shadow-2xs" 
                    data-id="${o.id}" 
                    data-estado="${prev}" 
                    title="Retroceder a: ${ESTADOS_LABELS[prev]}">
              <i class="bi bi-arrow-left"></i>
            </button>
          ` : ''}
          ${sig ? `
            <button class="btn btn-sm btn-primary py-1 px-3 rounded-3 fw-semibold btn-avanzar d-inline-flex align-items-center gap-1 shadow-xs" 
                    data-id="${o.id}" 
                    data-estado="${sig}" 
                    title="Avanzar a: ${ESTADOS_LABELS[sig]}" 
                    style="font-size:0.75rem;">
              <span>Avanzar</span>
              <i class="bi bi-arrow-right"></i>
            </button>
          ` : `
            <span class="badge bg-success-subtle text-success py-1 px-2.5 rounded-3 fw-bold" style="font-size:0.72rem;"><i class="bi bi-check2-all me-1"></i>Lista</span>
          `}
        </div>
      </div>

    </div>
  `
}

function _renderLista(ordenes) {
  return `
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size:0.85rem;">
          <thead class="table-light">
            <tr>
              <th>Alumno / Estudiante</th>
              <th>Instrumento</th>
              <th>Prioridad</th>
              <th>Etapa Actual</th>
              <th>Diagnóstico / Daño</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${ordenes.map(o => {
              const sig = _siguienteEstado(o.estado)
              const prev = _anteriorEstado(o.estado)
              const alumnoNombre = o.alumno_nombre ? o.alumno_nombre.trim() : 'Instrumento Institucional'
              const iniciales = _obtenerIniciales(alumnoNombre)
              const instrumentoLabel = _formatoInstrumento(o.instrumento_id)
              const diagnosticoTexto = o.tipo_dano || o.descripcion_inicial || 'Mantenimiento preventivo'

              return `
                <tr class="lista-row" data-search="${escapeHTML([alumnoNombre, instrumentoLabel, diagnosticoTexto].filter(Boolean).join(' ').toLowerCase())}" data-prioridad="${escapeHTML(o.prioridad || '')}" data-estado="${escapeHTML(o.estado)}">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style="width:30px;height:30px;font-size:0.72rem;">
                        ${iniciales}
                      </div>
                      <div>
                        <div class="fw-bold text-body">${escapeHTML(alumnoNombre)}</div>
                        <div class="text-muted small" style="font-size:0.72rem;">${new Date(o.fecha_recepcion || o.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-body-secondary text-body border" style="font-size:0.75rem;">
                      <i class="bi bi-music-note me-1 text-primary"></i>${escapeHTML(instrumentoLabel)}
                    </span>
                  </td>
                  <td>${_prioridadBadge(o.prioridad)}</td>
                  <td><span class="badge bg-secondary-subtle text-secondary" style="font-size:0.72rem;">${escapeHTML(ESTADOS_LABELS[o.estado] || o.estado)}</span></td>
                  <td>
                    <div class="text-body fw-medium small text-truncate" style="max-width:240px;" title="${escapeHTML(diagnosticoTexto)}">
                      ${escapeHTML(diagnosticoTexto)}
                    </div>
                  </td>
                  <td class="text-end">
                    <div class="d-inline-flex align-items-center gap-1.5">
                      <button class="btn btn-sm btn-outline-secondary py-1 px-2 rounded-3 btn-diagnostico-wizard shadow-2xs" data-id="${o.id}" data-serie="${escapeHTML(o.instrumento_id || '')}" title="Ver Ficha y Cotización">
                        <i class="bi bi-clipboard2-pulse"></i>
                      </button>
                      ${prev ? `
                        <button class="btn btn-sm btn-light border py-1 px-2 rounded-3 btn-retroceder" data-id="${o.id}" data-estado="${prev}" title="Retroceder">
                          <i class="bi bi-arrow-left"></i>
                        </button>
                      ` : ''}
                      ${sig ? `
                        <button class="btn btn-sm btn-primary py-1 px-2.5 rounded-3 fw-semibold btn-avanzar shadow-xs" data-id="${o.id}" data-estado="${sig}" title="Avanzar a ${ESTADOS_LABELS[sig]}">
                          <span>Avanzar</span> <i class="bi bi-arrow-right ms-0.5"></i>
                        </button>
                      ` : `
                        <span class="badge bg-success-subtle text-success py-1 px-2">Completada</span>
                      `}
                    </div>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function _siguienteEstado(estadoActual) {
  const idx = ESTADOS_FLOW.indexOf(estadoActual)
  if (idx === -1 || idx === ESTADOS_FLOW.length - 1) return null
  return ESTADOS_FLOW[idx + 1]
}

function _anteriorEstado(estadoActual) {
  const idx = ESTADOS_FLOW.indexOf(estadoActual)
  if (idx <= 0) return null
  return ESTADOS_FLOW[idx - 1]
}

function _prioridadBadge(p) {
  const map = {
    critica: { label: 'CRÍTICA', bg: 'bg-danger-subtle text-danger border border-danger-subtle', dot: 'dot-critica' },
    alta: { label: 'ALTA', bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle', dot: 'dot-alta' },
    media: { label: 'MEDIA', bg: 'bg-info-subtle text-info-emphasis border border-info-subtle', dot: 'dot-media' },
    baja: { label: 'BAJA', bg: 'bg-secondary-subtle text-secondary border border-secondary-subtle', dot: 'dot-baja' },
  }
  const meta = map[p] || map.baja
  return `<span class="badge ${meta.bg} rounded-pill px-2 py-0.5 fw-bold d-inline-flex align-items-center" style="font-size:0.65rem;">
    <span class="lut-prio-dot ${meta.dot}"></span>${meta.label}
  </span>`
}

function _attachEvents(container, ordenes) {
  const signal = _abortController.signal

  container.querySelector('#btn-refresh-ordenes')?.addEventListener('click', () => {
    renderLuteriaOrdenesView(container)
  }, { signal })

  container.querySelector('#btn-nueva-orden-taller')?.addEventListener('click', async () => {
    await openLuteriaOrdenWizard({
      onSuccess: () => renderLuteriaOrdenesView(container)
    })
  }, { signal })

  // Toggle de Vista Kanban vs Lista
  container.querySelectorAll('#btn-group-vista button').forEach(btn => {
    btn.addEventListener('click', () => {
      _vistaModo = btn.dataset.modo
      renderLuteriaOrdenesView(container)
    }, { signal })
  })

  // Toggle Panel Filtros
  container.querySelector('#btnToggleFiltrosOrdenes')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    const panel = container.querySelector('#panelFiltrosOrdenes')
    panel?.classList.toggle('show', state.filtrosAbiertos)
    container.querySelector('#btnToggleFiltrosOrdenes')?.classList.toggle('btn-primary', state.filtrosAbiertos)
    container.querySelector('#btnToggleFiltrosOrdenes')?.classList.toggle('btn-outline-secondary', !state.filtrosAbiertos)
  }, { signal })

  // Limpiar Filtros
  container.querySelector('#btnLimpiarFiltrosOrdenes')?.addEventListener('click', () => {
    state.busqueda = ''
    state.filtroPrioridad = ''
    state.filtroEstado = ''
    renderLuteriaOrdenesView(container)
  }, { signal })

  // Filtros dinámicos
  const searchInput = container.querySelector('#filtro-buscar-orden')
  const prioridadSelect = container.querySelector('#filtro-prioridad-orden')
  const estadoSelect = container.querySelector('#filtro-estado-especifico')

  const aplicarFiltros = () => {
    const q = (searchInput?.value || '').trim().toLowerCase()
    const prio = prioridadSelect?.value || ''
    const est = estadoSelect?.value || ''

    state.busqueda = searchInput?.value || ''
    state.filtroPrioridad = prio
    state.filtroEstado = est

    const cards = container.querySelectorAll('.kanban-card, .lista-row')
    cards.forEach(c => {
      const matchSearch = !q || c.dataset.search.includes(q)
      const matchPrio = !prio || c.dataset.prioridad === prio
      const matchEst = !est || c.dataset.estado === est
      c.style.display = (matchSearch && matchPrio && matchEst) ? '' : 'none'
    })
  }

  aplicarFiltros()

  searchInput?.addEventListener('input', aplicarFiltros, { signal })
  container.querySelector('#btnLimpiarBuscarOrden')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = ''
    aplicarFiltros()
  }, { signal })

  prioridadSelect?.addEventListener('change', aplicarFiltros, { signal })
  estadoSelect?.addEventListener('change', aplicarFiltros, { signal })

  // Manejador de Avance de Estado con Botón Directo
  container.querySelectorAll('.btn-avanzar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      const nuevoEstado = btn.dataset.estado
      btn.disabled = true
      try {
        await updateOrdenEstado(id, nuevoEstado)
        AppToast.show(`Orden avanzada a ${ESTADOS_LABELS[nuevoEstado] || nuevoEstado}`, 'success')
        renderLuteriaOrdenesView(container)
      } catch (err) {
        btn.disabled = false
        AppToast.error(`Error al avanzar: ${err.message}`)
      }
    }, { signal })
  })

  // Manejador de Retroceso de Estado con Botón Directo
  container.querySelectorAll('.btn-retroceder').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      const nuevoEstado = btn.dataset.estado
      btn.disabled = true
      try {
        await updateOrdenEstado(id, nuevoEstado)
        AppToast.show(`Orden movida a ${ESTADOS_LABELS[nuevoEstado] || nuevoEstado}`, 'info')
        renderLuteriaOrdenesView(container)
      } catch (err) {
        btn.disabled = false
        AppToast.error(`Error al retroceder: ${err.message}`)
      }
    }, { signal })
  })

  // Abrir Ficha / Diagnóstico Wizard
  container.querySelectorAll('.btn-diagnostico-wizard').forEach(btn => {
    btn.addEventListener('click', async () => {
      await openDiagnosticoWizard({
        ordenId: btn.dataset.id,
        instrumentoId: btn.dataset.serie,
        onSuccess: () => renderLuteriaOrdenesView(container),
      })
    }, { signal })
  })
}