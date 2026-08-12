/**
 * procedimientosView.js — Vista consolidada de Procedimientos (Portal Director, SP-3).
 *
 * Agrupa las tareas institucionales por correlation_id (el CASO/procedimiento) y muestra
 * el avance global, el desglose por estado, los departamentos involucrados y la prioridad
 * máxima. Lee de tareasApi.getProcedimientos() (RPC fn_procedimientos_resumen en real,
 * agrupación en memoria en mock).
 *
 * @param {HTMLElement} container
 */

import '../styles/tareas.css'
import '../styles/procedimientos.css'
import * as tareasApi from '../api/tareasApi.js'
import { openIniciarCasoModal } from '../components/iniciarCasoModal.js'
import { openAlumnoRiesgoModal } from '../components/alumnoRiesgoModal.js'
import { openProcedimientosHelpModal } from '../components/procedimientosHelpModal.js'
import { router } from '../../../core/router/router.js'

const DEPARTAMENTOS = {
  DIR: 'Dirección', ACM: 'Académica', ADM: 'Administración', FIN: 'Financiero',
  LOG: 'Logística', COM: 'Comunicaciones', TECNICO: 'Técnico', LUT: 'Lutería', OPR: 'Operaciones',
}
const PRIORIDAD_COLOR = { critica: 'danger', alta: 'warning', media: 'info', baja: 'secondary' }

const state = {
  procedimientos: [],
  processContracts: [],
  cargando: false,
  filtroEstado: 'todos',
  filtroDepto: 'todos',
  filtroBusqueda: '',
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function norm(s) {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export async function renderProcedimientosView(container) {
  const ac = new AbortController()
  await cargar(container)

  const onClick = async (e) => {
    if (e.target.closest('#btn-refrescar-proc')) return cargar(container)

    // Open detail
    const detailBtn = e.target.closest('[data-open-case-detail]')
    if (detailBtn) {
      router.navigate('hermes-caso', {
        processCode: detailBtn.dataset.processCode || null,
        correlationId: detailBtn.dataset.correlationId || null,
      })
      return
    }

    // Start process contract modal
    const contractBtn = e.target.closest('[data-start-process-code]')
    if (contractBtn) {
      const processCode = contractBtn.dataset.startProcessCode
      openIniciarCasoModal({
        processCode,
        contracts: state.processContracts,
        onOpened: () => cargar(container),
      })
      return
    }

    // General start case button
    if (e.target.closest('#btn-abrir-caso-general')) {
      openIniciarCasoModal({
        contracts: state.processContracts,
        onOpened: () => cargar(container),
      })
      return
    }

    // Report student risk modal
    if (e.target.closest('#btn-caso-alumno')) {
      openAlumnoRiesgoModal({
        onReported: () => cargar(container),
      })
      return
    }

    // Help guide modal
    if (e.target.closest('#btn-guia-procedimientos')) {
      openProcedimientosHelpModal()
      return
    }

    // Filter chips click
    const filterChip = e.target.closest('[data-filter-estado]')
    if (filterChip) {
      state.filtroEstado = filterChip.dataset.filterEstado
      render(container)
      return
    }
  }

  const onInput = (e) => {
    if (e.target.id === 'proc-search') {
      state.filtroBusqueda = e.target.value
      _renderFilteredGrid(container)
    }
  }

  const onChange = (e) => {
    if (e.target.id === 'proc-filter-depto') {
      state.filtroDepto = e.target.value
      _renderFilteredGrid(container)
    }
  }

  container.addEventListener('click', onClick, { signal: ac.signal })
  container.addEventListener('input', onInput, { signal: ac.signal })
  container.addEventListener('change', onChange, { signal: ac.signal })

  return { teardown: () => ac.abort() }
}

async function cargar(container) {
  try {
    state.cargando = true
    render(container)
    const [procedimientos, processContracts] = await Promise.all([
      tareasApi.getProcedimientos(),
      tareasApi.getProcessContracts(),
    ])
    state.procedimientos = Array.isArray(procedimientos) ? procedimientos : []
    state.processContracts = Array.isArray(processContracts) ? processContracts : []
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-3">Error cargando procedimientos: ${esc(err.message)}</div>`
    return
  } finally {
    state.cargando = false
  }
  render(container)
}

function kpisGlobales(procs) {
  const totalProc = procs.length
  const enCurso = procs.filter((p) => p.pct_avance < 100 && p.total > p.canceladas).length
  const bloqueados = procs.filter((p) => p.bloqueadas > 0).length
  const observados = procs.filter((p) => p.observadas > 0).length
  const criticos = procs.filter((p) => p.prioridad_max === 'critica').length
  return { totalProc, enCurso, bloqueados, observados, criticos }
}

function _filtrarProcedimientos(procs) {
  let res = procs

  // Filtro por Estado
  if (state.filtroEstado === 'en_curso') {
    res = res.filter((p) => p.pct_avance < 100)
  } else if (state.filtroEstado === 'bloqueados') {
    res = res.filter((p) => p.bloqueadas > 0)
  } else if (state.filtroEstado === 'observados') {
    res = res.filter((p) => p.observadas > 0)
  } else if (state.filtroEstado === 'criticos') {
    res = res.filter((p) => p.prioridad_max === 'critica')
  } else if (state.filtroEstado === 'completados') {
    res = res.filter((p) => p.pct_avance === 100)
  }

  // Filtro por Departamento
  if (state.filtroDepto !== 'todos') {
    res = res.filter((p) => Array.isArray(p.departamentos) && p.departamentos.includes(state.filtroDepto))
  }

  // Filtro por Búsqueda textual
  const q = norm(state.filtroBusqueda.trim())
  if (q) {
    res = res.filter((p) => {
      const title = norm(p.titulo_muestra || '')
      const code = norm(p.process_code || '')
      const corr = norm(p.correlation_id || '')
      return title.includes(q) || code.includes(q) || corr.includes(q)
    })
  }

  return res
}

function render(container) {
  if (state.cargando && state.procedimientos.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Cargando procedimientos institucionales…</p>
      </div>`
    return
  }

  const procs = state.procedimientos
  const k = kpisGlobales(procs)

  const kpiCard = (label, valor, color, icon, estadoKey) => `
    <div class="col" style="cursor: pointer;" data-filter-estado="${estadoKey}">
      <div class="proc-kpi-card h-100 ${state.filtroEstado === estadoKey ? 'active-filter' : ''}">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="kpi-num text-${color}">${valor}</div>
            <div class="kpi-label">${label}</div>
          </div>
          <i class="bi ${icon} fs-4 text-${color} opacity-75"></i>
        </div>
      </div>
    </div>`

  const contractCards = state.processContracts.length === 0
    ? `<div class="text-muted small py-2">No hay contratos SOI activos registrados.</div>`
    : state.processContracts.map(renderProcessContractCard).join('')

  const deptoOptions = Object.entries(DEPARTAMENTOS).map(([code, name]) => `
    <option value="${code}" ${state.filtroDepto === code ? 'selected' : ''}>${name} (${code})</option>
  `).join('')

  container.innerHTML = `
    <div class="proc-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 class="mb-0 fw-bold"><i class="bi bi-diagram-3 text-primary me-2"></i>Procedimientos Institucionales</h3>
          <p class="text-muted mb-0 small">Orquestador de Casos y Contratos SOI (Process Backbone)</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button id="btn-guia-procedimientos" class="btn btn-outline-info btn-sm">
            <i class="bi bi-question-circle me-1"></i> Guía Rápida
          </button>
          <button id="btn-abrir-caso-general" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-circle me-1"></i> Abrir Caso
          </button>
          <button id="btn-caso-alumno" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-person-exclamation me-1"></i> Alumno en Riesgo
          </button>
          <button id="btn-refrescar-proc" class="btn btn-outline-secondary btn-sm" ${state.cargando ? 'disabled' : ''}>
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <!-- Ribbon de KPIs Interactivos -->
      <div class="row row-cols-2 row-cols-md-5 g-2 mb-4 proc-kpis-grid">
        ${kpiCard('Todos', k.totalProc, 'primary', 'bi-diagram-3', 'todos')}
        ${kpiCard('En curso', k.enCurso, 'info', 'bi-hourglass-split', 'en_curso')}
        ${kpiCard('Con bloqueos', k.bloqueados, 'danger', 'bi-slash-circle', 'bloqueados')}
        ${kpiCard('Con observadas', k.observados, 'warning', 'bi-eye', 'observados')}
        ${kpiCard('Críticos', k.criticos, 'danger', 'bi-exclamation-octagon', 'criticos')}
      </div>

      <!-- Contratos SOI Ejecutables -->
      <section class="filter-bar mb-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0 fw-bold"><i class="bi bi-bezier2 text-primary me-2"></i>Contratos SOI Ejecutables</h6>
          <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
            ${state.processContracts.length} contratos
          </span>
        </div>
        <p class="text-muted small mb-3">Flujos normativos que Hermes orquesta en tareas interdepartamentales.</p>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">
          ${contractCards}
        </div>
      </section>

      <!-- Barra de Filtros y Búsqueda de Casos -->
      <div class="filter-bar mb-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-body"><i class="bi bi-search"></i></span>
              <input
                id="proc-search"
                type="text"
                class="form-control"
                placeholder="Buscar caso por nombre, código de proceso o correlation_id…"
                value="${esc(state.filtroBusqueda)}"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select id="proc-filter-depto" class="form-select form-select-sm">
              <option value="todos">Todos los departamentos</option>
              ${deptoOptions}
            </select>
          </div>
          <div class="col-md-3 text-md-end">
            <span class="small text-muted" id="proc-counter"></span>
          </div>
        </div>
      </div>

      <!-- Grid de Procedimientos Activos -->
      <div id="proc-grid-container" class="row row-cols-1 row-cols-lg-2 g-3">
        <!-- Rendered by _renderFilteredGrid -->
      </div>
    </div>`

  _renderFilteredGrid(container)
}

function _renderFilteredGrid(container) {
  const grid = container.querySelector('#proc-grid-container')
  const counter = container.querySelector('#proc-counter')
  if (!grid) return

  const filtrados = _filtrarProcedimientos(state.procedimientos)

  if (counter) {
    counter.textContent = `Mostrando ${filtrados.length} de ${state.procedimientos.length} caso(s)`
  }

  if (filtrados.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
        <p class="mb-0">No se encontraron procedimientos con los filtros seleccionados.</p>
      </div>`
    return
  }

  grid.innerHTML = filtrados.map(renderProcCard).join('')
}

function renderProcCard(p) {
  const prioColor = PRIORIDAD_COLOR[p.prioridad_max] || 'secondary'
  const barColor = p.bloqueadas > 0 ? 'bg-danger' : p.pct_avance === 100 ? 'bg-success' : 'bg-primary'
  const deptChips = (p.departamentos || [])
    .map((d) => `<span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle me-1">${esc(DEPARTAMENTOS[d] || d)}</span>`)
    .join('')

  const alertas = []
  if (p.bloqueadas > 0) alertas.push(`<span class="badge bg-danger me-1"><i class="bi bi-slash-circle"></i> ${p.bloqueadas} bloqueada${p.bloqueadas > 1 ? 's' : ''}</span>`)
  if (p.observadas > 0) alertas.push(`<span class="badge bg-warning text-dark me-1"><i class="bi bi-eye"></i> ${p.observadas} observada${p.observadas > 1 ? 's' : ''}</span>`)

  return `
    <div class="col">
      <div class="case-card">
        <div>
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 class="case-title mb-0">${esc(p.titulo_muestra || p.process_code || 'Procedimiento')}</h6>
            <span class="badge bg-${prioColor} text-capitalize">${esc(p.prioridad_max || 'media')}</span>
          </div>
          <div class="mb-2">${deptChips || '<span class="small text-muted">—</span>'}</div>
          <div class="progress progress-minimal mb-2" role="progressbar" aria-valuenow="${p.pct_avance || 0}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar ${barColor}" style="width: ${p.pct_avance || 0}%"></div>
          </div>
          <div class="d-flex justify-content-between small text-muted mb-2">
            <span><strong>${p.pct_avance || 0}%</strong> completado</span>
            <span>${p.completadas || 0}/${p.total || 0} tareas</span>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap pt-2 border-top">
          <div>${alertas.join('') || '<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle"></i> En tiempo</span>'}</div>
          <button class="btn btn-sm btn-outline-primary" data-open-case-detail data-process-code="${esc(p.process_code || '')}" data-correlation-id="${esc(p.correlation_id || '')}">
            <i class="bi bi-folder2-open me-1"></i> Ver Expediente
          </button>
        </div>
      </div>
    </div>`
}

function renderProcessContractCard(contract) {
  const departments = (contract.responsible_departments || [])
    .map((d) => `<span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle me-1">${esc(DEPARTAMENTOS[d] || d)}</span>`)
    .join('')
  const automation = {
    manual: 'Manual',
    semi_auto: 'Semi-auto',
    automated: 'Automatizado',
    deprecated: 'Deprecado',
  }[contract.automation_status] || contract.automation_status

  return `
    <div class="col">
      <div class="contract-card">
        <div>
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <div>
              <div class="contract-code">${esc(contract.process_code)}</div>
              <div class="small fw-semibold">${esc(contract.process_name)}</div>
            </div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">${esc(automation)}</span>
          </div>
          <div class="small text-muted mt-1">
            Dueño: <strong>${esc(DEPARTAMENTOS[contract.department_owner] || contract.department_owner)}</strong>
          </div>
          <div class="mt-2">${departments}</div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <span class="small text-muted">${contract.recurrence_count || 0} recurrencia${contract.recurrence_count === 1 ? '' : 's'}</span>
          <button class="btn btn-sm btn-outline-primary" data-start-process-code="${esc(contract.process_code)}">
            <i class="bi bi-play-circle me-1"></i> Abrir Caso
          </button>
        </div>
      </div>
    </div>`
}
