import { AppModal } from '../../../shared/components/AppModal.js'
import { Toast } from 'bootstrap'
import {
  obtenerObservaciones,
  crearObservacion,
  actualizarObservacion,
  eliminarObservacion,
  agregarSeguimiento,
  resolverObservacion,
  getEstadisticas,
} from '../api/observacionesApi.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerMaestros } from '../../maestros/api/maestrosApi.js'
import {
  formatDate,
  escapeHTML,
  getTipoLabel,
  getTipoIcon,
  getTipoBadgeClass,
  getPrioridadLabel,
  getPrioridadColor,
  getPrioridadIcon,
  getEstadoClass,
  getEstadoLabel,
  getInitials,
  calcularDiasAbierta,
} from '../utils/observacionesUtils.js'
import { openObservacionModal } from '../components/observacionModal.js'
import { openSeguimientoModal } from '../components/seguimientoModal.js'

const state = {
  observaciones: [],
  observacionesOriginales: [],
  alumnos: [],
  maestros: [],
  cargando: false,
  editando: null,
  viewingId: null,
  deletingId: null,
  filtroTipo: '',
  filtroEstado: 'todos',
  filtroPrioridad: '',
  estadisticas: null,
}

const VALIDATION = {
  tituloMax: 100,
  descripcionMax: 1000,
  seguimientoMax: 500,
}



export async function renderObservacionesView(container) {
  try {
    state.cargando = true
    renderLoading(container)

    const [observaciones, alumnos, maestros, estadisticas] = await Promise.all([
      obtenerObservaciones(),
      obtenerAlumnos().catch(() => []),
      obtenerMaestros().catch(() => []),
      getEstadisticas().catch(() => null),
    ])

    state.observaciones = observaciones
    state.observacionesOriginales = [...observaciones]
    state.alumnos = alumnos
    state.maestros = maestros
    state.estadisticas = estadisticas
    state.cargando = false

    renderContent(container)
    attachGlobalEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando observaciones...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${escapeHTML(mensaje)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  document.getElementById('retryBtn')?.addEventListener('click', () => renderObservacionesView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <!-- Page Header Compact -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-clipboard2-pulse me-2 text-primary"></i>Observaciones</span>
          <span class="badge bg-secondary">${state.observaciones.length}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-primary btn-sm-compact" id="btnAgregarObservacion">
            <i class="bi bi-plus-lg"></i> Nueva
          </button>
        </div>
      </div>

      <!-- Stats Cards Compact -->
      ${renderStatsCards()}

      <!-- Toolbar Compact -->
      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar observación..." id="buscar" autocomplete="off">
        </div>
        <select class="form-select input-dense" id="filtroTipo" style="width: auto; min-width: 140px;">
          <option value="">Todos los tipos</option>
          <option value="comportamiento">Comportamiento</option>
          <option value="academico">Académico</option>
          <option value="social">Social</option>
          <option value="disciplina">Disciplina</option>
        </select>
        <select class="form-select input-dense" id="filtroEstado" style="width: auto; min-width: 120px;">
          <option value="todos">Todos</option>
          <option value="abierta">Abiertas</option>
          <option value="resuelta">Resueltas</option>
          <option value="seguimiento">Seguimiento</option>
        </select>
        <select class="form-select input-dense" id="filtroPrioridad" style="width: auto; min-width: 120px;">
          <option value="">Todas</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      <!-- Table Compact -->
      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="observacionesTable">
          <thead>
            <tr>
              <th style="width: 25%;">Título</th>
              <th style="width: 18%;">Alumno</th>
              <th style="width: 12%;">Tipo</th>
              <th style="width: 10%;">Prioridad</th>
              <th style="width: 10%;">Estado</th>
              <th style="width: 10%;">Fecha</th>
              <th style="width: 15%;" class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody id="observacionesTBody">
            ${renderTableRows(state.observaciones)}
          </tbody>
        </table>
        ${state.observaciones.length === 0 ? renderEmpty() : ''}
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `
}

function renderStatsCards() {
  const stats = state.estadisticas
  const abiertas = stats?.porEstado?.abierta || 0
  const resueltas = stats?.porEstado?.resuelta || 0
  const seguimiento = stats?.porEstado?.seguimiento || 0
  const total = stats?.total || state.observaciones.length

  return `
    <div class="row g-2 mb-3">
      <div class="col-6 col-md-3">
        <div class="card border-primary h-100">
          <div class="card-body text-center py-2">
            <div class="h5 text-primary mb-1"><i class="bi bi-clipboard2-pulse"></i></div>
            <h6 class="mb-0">${total}</h6>
            <small class="text-muted">Total</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-warning h-100">
          <div class="card-body text-center py-2">
            <div class="h5 text-warning mb-1"><i class="bi bi-exclamation-circle"></i></div>
            <h6 class="mb-0">${abiertas}</h6>
            <small class="text-muted">Abiertas</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-success h-100">
          <div class="card-body text-center py-2">
            <div class="h5 text-success mb-1"><i class="bi bi-check-circle"></i></div>
            <h6 class="mb-0">${resueltas}</h6>
            <small class="text-muted">Resueltas</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-info h-100">
          <div class="card-body text-center py-2">
            <div class="h5 text-info mb-1"><i class="bi bi-arrow-repeat"></i></div>
            <h6 class="mb-0">${seguimiento}</h6>
            <small class="text-muted">Seguimiento</small>
          </div>
        </div>
      </div>
    </div>
  `
}

function getAlumnoName(alumnoId) {
  const alumno = state.alumnos.find(a => a.id === alumnoId)
  return alumno ? (alumno.name || alumno.nombre) : 'Alumno no asignado'
}

function getMaestroName(maestroId) {
  if (!maestroId) return '-'
  const maestro = state.maestros.find(m => m.id === maestroId)
  return maestro ? (maestro.nombre || maestro.name) : '-'
}

function renderTableRows(observaciones) {
  if (!observaciones.length) return '<tr><td colspan="7" class="text-center text-muted py-3">No hay observaciones</td></tr>'

  return observaciones.map(o => `
    <tr data-id="${o.id}">
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar-compact bg-primary text-white">${getInitials(o.titulo)}</div>
          <span class="text-truncate" style="max-width: 120px;" title="${o.titulo}">${escapeHTML(o.titulo)}</span>
        </div>
      </td>
      <td class="text-truncate" style="max-width: 100px;" title="${getAlumnoName(o.alumno_id)}">${escapeHTML(getAlumnoName(o.alumno_id))}</td>
      <td>
        <span class="badge badge-compact ${getTipoBadgeClass(o.tipo)}"><i class="bi ${getTipoIcon(o.tipo)}"></i> ${getTipoLabel(o.tipo)}</span>
      </td>
      <td>
        <span class="badge badge-compact bg-${getPrioridadColor(o.prioridad)}"><i class="bi ${getPrioridadIcon(o.prioridad)}"></i> ${getPrioridadLabel(o.prioridad)}</span>
      </td>
      <td>
        <span class="badge badge-compact ${getEstadoClass(o.estado)}">${getEstadoLabel(o.estado)}</span>
      </td>
      <td>${formatDate(o.fecha_observacion || o.created_at)}</td>
      <td class="text-end">
        <div class="quick-actions justify-content-end">
          <button class="btn btn-sm btn-outline-info btn-icon-compact" data-action="view" data-id="${o.id}" title="Ver">
            <i class="bi bi-eye"></i>
          </button>
          ${o.estado === 'abierta' ? `
            <button class="btn btn-sm btn-outline-warning btn-icon-compact" data-action="seguimiento" data-id="${o.id}" title="Seguimiento">
              <i class="bi bi-arrow-repeat"></i>
            </button>
            <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="resolver" data-id="${o.id}" title="Resolver">
              <i class="bi bi-check-lg"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${o.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${o.id}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('')
}

function renderEmpty() {
  return `
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay observaciones</h4>
      <p class="text-muted">Crea tu primera observación haciendo clic en el botón "Nueva"</p>
    </div>
  `
}

function attachGlobalEvents(container) {
  document.getElementById('btnAgregarObservacion')?.addEventListener('click', () => {
    openCreateModal()
  })

  const searchInput = document.getElementById('buscar')
  searchInput?.addEventListener('input', applyFilters)

  document.getElementById('filtroTipo')?.addEventListener('change', applyFilters)
  document.getElementById('filtroEstado')?.addEventListener('change', applyFilters)
  document.getElementById('filtroPrioridad')?.addEventListener('change', applyFilters)

  const tbody = document.getElementById('observacionesTBody')
  tbody?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = btn.dataset.id
    const action = btn.dataset.action

    if (action === 'view') {
      openViewModal(id)
    } else if (action === 'edit') {
      openEditModal(id)
    } else if (action === 'delete') {
      openDeleteModal(id)
    } else if (action === 'seguimiento') {
      openSeguimientoAction(id)
    } else if (action === 'resolver') {
      openResolverAction(id)
    }
  })
}

function applyFilters() {
  const searchTerm = document.getElementById('buscar')?.value.trim().toLowerCase() || ''
  const filtroTipo = document.getElementById('filtroTipo')?.value || ''
  const filtroEstado = document.getElementById('filtroEstado')?.value || 'todos'
  const filtroPrioridad = document.getElementById('filtroPrioridad')?.value || ''

  state.observaciones = state.observacionesOriginales.filter(o => {
    const alumnoName = getAlumnoName(o.alumno_id).toLowerCase()

    const matchSearch = !searchTerm ||
      (o.titulo || '').toLowerCase().includes(searchTerm) ||
      (o.descripcion || '').toLowerCase().includes(searchTerm) ||
      alumnoName.includes(searchTerm)

    const matchTipo = !filtroTipo || o.tipo === filtroTipo

    const matchEstado = filtroEstado === 'todos' || o.estado === filtroEstado

    const matchPrioridad = !filtroPrioridad || o.prioridad === filtroPrioridad

    return matchSearch && matchTipo && matchEstado && matchPrioridad
  })

  refreshTable()
}

function openCreateModal() {
  openObservacionModal('create', {}, {
    alumnos: state.alumnos,
    maestros: state.maestros,
    onSubmit: async (data) => {
      const nuevo = await crearObservacion(data)
      state.observacionesOriginales.unshift(nuevo)
      applyFilters()
      showToast('Observación creada exitosamente', 'success')
    },
  })
}

function openEditModal(id) {
  const obs = state.observacionesOriginales.find(o => o.id === id)
  if (!obs) { showToast('Observación no encontrada', 'error'); return }

  openObservacionModal('edit', obs, {
    alumnos: state.alumnos,
    maestros: state.maestros,
    onSubmit: async (data) => {
      const actualizada = await actualizarObservacion(id, data)
      const idx = state.observacionesOriginales.findIndex(o => o.id === id)
      if (idx !== -1) state.observacionesOriginales[idx] = { ...state.observacionesOriginales[idx], ...actualizada }
      applyFilters()
      showToast('Observación actualizada', 'success')
    },
  })
}

function openViewModal(id) {
  const obs = state.observacionesOriginales.find(o => o.id === id)
  if (!obs) { showToast('Observación no encontrada', 'error'); return }

  const diasAbierta = obs.estado === 'abierta' ? calcularDiasAbierta(obs.fecha_observacion || obs.created_at) : null

  AppModal.open({
    title:      escapeHTML(obs.titulo),
    hideSave:   true,
    cancelText: 'Cerrar',
    body: `
      <div class="row">
        <div class="col-md-6">
          <p class="mb-2"><strong>Alumno:</strong> ${escapeHTML(getAlumnoName(obs.alumno_id))}</p>
          <p class="mb-2"><strong>Tipo:</strong> <span class="badge ${getTipoBadgeClass(obs.tipo)}"><i class="bi ${getTipoIcon(obs.tipo)}"></i> ${getTipoLabel(obs.tipo)}</span></p>
          <p class="mb-2"><strong>Prioridad:</strong> <span class="badge bg-${getPrioridadColor(obs.prioridad)}"><i class="bi ${getPrioridadIcon(obs.prioridad)}"></i> ${getPrioridadLabel(obs.prioridad)}</span></p>
        </div>
        <div class="col-md-6">
          <p class="mb-2"><strong>Estado:</strong> <span class="badge ${getEstadoClass(obs.estado)}">${getEstadoLabel(obs.estado)}</span>${diasAbierta ? ` <small class="text-muted">(${diasAbierta}d)</small>` : ''}</p>
          <p class="mb-2"><strong>Maestro:</strong> ${escapeHTML(getMaestroName(obs.maestro_id))}</p>
          <p class="mb-2"><strong>Fecha:</strong> ${formatDate(obs.fecha_observacion || obs.created_at)}</p>
        </div>
      </div>
      <hr>
      <p class="mb-2"><strong>Descripción:</strong></p>
      <p class="text-secondary">${escapeHTML(obs.descripcion)}</p>
      ${obs.seguimiento_observacion ? `
        <hr>
        <h6 class="text-warning fw-semibold"><i class="bi bi-arrow-repeat me-1"></i>Seguimiento</h6>
        <p class="mb-1"><strong>Fecha:</strong> ${formatDate(obs.seguimiento_fecha)}</p>
        <p class="small p-2 rounded" style="background:var(--bs-secondary-bg)">${escapeHTML(obs.seguimiento_observacion)}</p>
      ` : ''}
    `,
  })
}

function openSeguimientoAction(id) {
  const obs = state.observacionesOriginales.find(o => o.id === id)
  if (!obs) { showToast('Observación no encontrada', 'error'); return }

  openSeguimientoModal(obs, null, async (fecha, observacionSeg) => {
    const actualizada = await agregarSeguimiento(id, fecha, observacionSeg)
    const idx = state.observacionesOriginales.findIndex(o => o.id === id)
    if (idx !== -1) state.observacionesOriginales[idx] = { ...state.observacionesOriginales[idx], ...actualizada }
    applyFilters()
    showToast('Seguimiento agregado correctamente', 'success')
  })
}

function openResolverAction(id) {
  const obs = state.observacionesOriginales.find(o => o.id === id)
  if (!obs) { showToast('Observación no encontrada', 'error'); return }

  AppModal.open({
    title:    'Confirmar Resolución',
    size:     'sm',
    saveText: 'Marcar Resuelta',
    body:     `<p class="mb-1">¿Marcar como resuelta esta observación?</p><p class="fw-bold">${escapeHTML(obs.titulo)}</p>`,
    onSave:   async () => {
      const actualizada = await resolverObservacion(id)
      const idx = state.observacionesOriginales.findIndex(o => o.id === id)
      if (idx !== -1) state.observacionesOriginales[idx] = { ...state.observacionesOriginales[idx], ...actualizada }
      applyFilters()
      showToast('Observación resuelta', 'success')
    },
  })
}

function openDeleteModal(id) {
  const obs = state.observacionesOriginales.find(o => o.id === id)
  if (!obs) { showToast('Observación no encontrada', 'error'); return }

  AppModal.open({
    title:    'Eliminar observación',
    size:     'sm',
    saveText: 'Eliminar',
    body:     `<p class="mb-1">¿Eliminar esta observación? No se puede deshacer.</p><p class="fw-bold text-danger">${escapeHTML(obs.titulo)}</p>`,
    onSave:   async () => {
      await eliminarObservacion(id)
      state.observacionesOriginales = state.observacionesOriginales.filter(o => o.id !== id)
      applyFilters()
      showToast('Observación eliminada', 'success')
    },
  })
}

function refreshTable() {
  const tbody = document.getElementById('observacionesTBody')
  if (!tbody) return
  if (state.observaciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay observaciones</td></tr>'
  } else {
    tbody.innerHTML = renderTableRows(state.observaciones)
  }
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer')
  if (!toastContainer) return

  const toastId  = 'toast-' + Date.now()
  const bgClass  = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info'
  const iconClass= type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white">
        <i class="bi ${iconClass} me-2"></i>
        <strong class="me-auto">${type === 'success' ? 'OK' : type === 'error' ? 'Error' : 'Info'}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${escapeHTML(message)}</div>
    </div>
  `
  const toastElement = tempDiv.firstElementChild
  toastContainer.appendChild(toastElement)

  const t = new Toast(toastElement, { autohide: true, delay: 3000 })
  t.show()
  toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove())
}