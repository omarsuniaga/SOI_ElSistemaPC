import '../styles/clases.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerClases,
  eliminarClase,
} from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  formatDate,
  escapeHTML,
  formatHora,
  getEstadoBadgeClass,
  getEstadoLabel,
  getInstrumentoIcon,
  getInitials,
  getConsistentColor,
} from '../utils/clasesUtils.js'
import { openClaseModal } from '../components/claseModal.js'

const state = {
  clases: [],
  clasesOriginales: [],
  maestros: [],
  salones: [],
  programas: [],
  alumnos: [],
  cargando: false,
  filtroEstado: 'todos',
  filtroInstrumento: '',
  vista: 'tabla',
  container: null,
}

/**
 * Vista de Clases Académicas (Simplified Refactor)
 */
export async function renderClasesView(container) {
  if (!container) return
  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    const [clases, maestros, salones, programas, alumnos] = await Promise.all([
      obtenerClases(),
      supabase.from('maestros').select('*').order('nombre_completo', { ascending: true }),
      supabase.from('salones').select('*').order('nombre', { ascending: true }),
      supabase.from('programas').select('*').order('nombre', { ascending: true }),
      supabase.from('alumnos').select('*').eq('activo', true).order('nombre_completo', { ascending: true }),
    ])

    state.clases = clases
    state.clasesOriginales = [...clases]
    state.maestros = maestros.data || []
    state.salones = salones.data || []
    state.programas = programas.data || []
    state.alumnos = alumnos.data || []
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
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5 text-center">
      <div class="alert alert-danger d-inline-block" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${escapeHTML(mensaje)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderClasesView(container))
}

function renderContent(container) {
  const instrumentos = [...new Set(state.clases.map(c => c.instrumento).filter(Boolean))].sort()

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-book me-2 text-primary"></i>Clases</span>
          <span class="badge bg-secondary rounded-pill">${state.clases.length}</span>
        </div>
        <div class="d-flex gap-2">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-primary ${state.vista === 'tabla' ? 'active' : ''}" id="btn-vista-tabla"><i class="bi bi-list-ul"></i></button>
            <button class="btn btn-outline-primary ${state.vista === 'calendario' ? 'active' : ''}" id="btn-vista-calendario"><i class="bi bi-calendar3"></i></button>
          </div>
          <button class="btn btn-primary btn-sm-compact" id="btnAgregarClase">
            <i class="bi bi-plus-lg"></i> Nuevo
          </button>
        </div>
      </div>

      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar clase o instrumento..." id="buscar">
        </div>
        <select class="form-select input-dense w-auto" id="filtroEstado">
          <option value="todos">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="suspendida">Suspendidas</option>
          <option value="finalizada">Finalizadas</option>
        </select>
      </div>

      <div id="view-content">
        ${state.vista === 'tabla' ? renderTableView() : renderCalendarView()}
      </div>
    </div>
  `
}

function renderTableView() {
  if (state.clases.length === 0) {
    return renderEmpty()
  }

  return `
    <div class="page-glass rounded w-100">
      <div class="list-group list-group-flush w-100" id="clasesListBody">
        ${state.clases.map(c => renderClaseCard(c)).join('')}
      </div>
    </div>
  `
}

function renderClaseCard(clase) {
  const nombre = clase.nombre || 'Sin nombre'
  const maestro = state.maestros.find(m => m.id === clase.maestro_principal_id)
  const maestroNombre = maestro?.nombre || 'Sin maestro'
  const initials = getInitials(nombre)
  const estado = clase.estado || 'activa'
  const estadoColor = getEstadoBadgeClass(estado)
  const horarios = (clase.horarios || []).slice(0, 3) // Mostrar máximo 3 horarios
  const horariosTexto = horarios.length > 0
    ? horarios.map(h => `${(h.dia || '').slice(0, 2).toUpperCase()} ${(h.hora_inicio || '').slice(0, 5)}`).join(' • ')
    : 'Sin horarios'

  return `
    <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100" data-id="${clase.id}" style="cursor: pointer;">
      <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
        <div class="position-relative flex-shrink-0">
          <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle" style="width: 48px; height: 48px; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
            ${initials}
          </div>
          <span class="position-absolute bottom-0 end-0 p-1 bg-${estado === 'activa' ? 'success' : 'warning'} border border-light rounded-circle" style="transform: translate(10%, 10%);">
            <span class="visually-hidden">${estado}</span>
          </span>
        </div>
        <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
          <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(nombre)}</span>
          <small class="text-muted text-truncate">${escapeHTML(maestroNombre)} • ${escapeHTML(clase.instrumento || '-')}</small>
          <small class="text-muted extra-small mt-1" style="font-size: 0.85rem;">${escapeHTML(horariosTexto)}</small>
        </div>
      </div>
      <div class="flex-shrink-0 text-end">
        <span class="badge badge-compact ${estadoColor} mb-2">${getEstadoLabel(estado)}</span>
        <div class="quick-actions gap-2" style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${clase.id}" title="Editar" style="font-size: 0.875rem; padding: 0.25rem 0.5rem;">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${clase.id}" title="Eliminar" style="font-size: 0.875rem; padding: 0.25rem 0.5rem;">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `
}

function renderEmpty() {
  return `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No se encontraron clases.</p>
    </div>
  `
}

function renderCalendarView() {
  // Placeholder para la vista de calendario simplificada
  return `
    <div class="alert alert-info text-center">
      <i class="bi bi-info-circle me-2"></i> La vista de calendario se está optimizando para esta versión modular.
    </div>
  `
}

function attachGlobalEvents(container) {
  container.querySelector('#btnAgregarClase')?.addEventListener('click', () => {
    openClaseModal(null, {
      maestros: state.maestros,
      salones: state.salones,
      programas: state.programas,
      alumnos: state.alumnos,
      onSuccess: () => renderClasesView(container)
    })
  })

  container.querySelector('#btn-vista-tabla')?.addEventListener('click', () => {
    state.vista = 'tabla'
    renderContent(container)
    attachGlobalEvents(container)
  })

  container.querySelector('#btn-vista-calendario')?.addEventListener('click', () => {
    state.vista = 'calendario'
    renderContent(container)
    attachGlobalEvents(container)
  })

  container.querySelector('#buscar')?.addEventListener('input', applyFilters)
  container.querySelector('#filtroEstado')?.addEventListener('change', applyFilters)

  const viewContent = container.querySelector('#view-content')

  viewContent?.addEventListener('click', (e) => {
    // Manejo de clicks en botones de acción
    const btn = e.target.closest('button[data-action]')
    if (btn) {
      e.stopPropagation()
      const { action, id } = btn.dataset
      if (action === 'edit') {
        const clase = state.clasesOriginales.find(c => c.id === id)
        openClaseModal(clase, {
          maestros: state.maestros,
          salones: state.salones,
          programas: state.programas,
          alumnos: state.alumnos,
          onSuccess: () => renderClasesView(container)
        })
      }
      if (action === 'delete') openDeleteModal(id)
      return
    }

    // Manejo de clicks en tarjetas de la lista
    const item = e.target.closest('.list-group-item[data-id]')
    if (item && !e.target.closest('button')) {
      const id = item.dataset.id
      const clase = state.clasesOriginales.find(c => c.id === id)
      if (clase) {
        openClaseModal(clase, {
          maestros: state.maestros,
          salones: state.salones,
          programas: state.programas,
          alumnos: state.alumnos,
          onSuccess: () => renderClasesView(container)
        })
      }
    }
  })
}

function applyFilters() {
  const searchTerm = state.container.querySelector('#buscar')?.value.trim().toLowerCase() || ''
  const filtroEstado = state.container.querySelector('#filtroEstado')?.value || 'todos'

  state.clases = state.clasesOriginales.filter(c => {
    const matchSearch = !searchTerm || c.nombre.toLowerCase().includes(searchTerm) || c.instrumento.toLowerCase().includes(searchTerm)
    const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const viewContent = state.container.querySelector('#view-content')
  if (viewContent) {
    viewContent.innerHTML = state.vista === 'tabla' ? renderTableView() : renderCalendarView()
  }
}

function openDeleteModal(id) {
  const clase = state.clasesOriginales.find(c => c.id === id)
  if (!clase) return

  AppModal.open({
    title: '⚠️ Eliminar Clase',
    saveText: 'Eliminar Definitivamente',
    body: `<p>¿Estás seguro de eliminar la clase <strong>${escapeHTML(clase.nombre)}</strong>? Esta acción no se puede deshacer.</p>`,
    onSave: async () => {
      try {
        await eliminarClase(id)
        AppToast.success('Clase eliminada')
        renderClasesView(state.container)
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}
