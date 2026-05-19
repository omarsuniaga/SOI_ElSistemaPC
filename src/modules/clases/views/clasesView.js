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
  const grouped = groupClasses(state.clases)
  const groupNames = Object.keys(grouped).sort()

  return `
    <div class="accordion accordion-apple" id="clasesAccordion">
      ${groupNames.map((name, index) => renderAccordionItem(name, grouped[name], index)).join('')}
    </div>
    <div id="emptyContainer">
      ${state.clases.length === 0 ? renderEmpty() : ''}
    </div>
  `
}

function groupClasses(clases) {
  const groups = {}
  clases.forEach(c => {
    const key = c.nombre || 'Sin nombre'
    if (!groups[key]) groups[key] = []
    groups[key].push(c)
  })
  return groups
}

function renderAccordionItem(name, classes, index) {
  const firstClass = classes[0]
  const total = classes.length

  return `
    <div class="accordion-item border-0 mb-2 rounded shadow-sm overflow-hidden">
      <h2 class="accordion-header" id="heading-${index}">
        <button class="accordion-button collapsed bg-white py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}">
          <div class="d-flex align-items-center w-100 me-3">
            <div class="avatar-compact me-3" style="background: ${getConsistentColor(firstClass.id)}20; color: ${getConsistentColor(firstClass.id)};">
              ${getInitials(name)}
            </div>
            <div class="flex-grow-1">
              <div class="fw-bold text-dark">${escapeHTML(name)}</div>
              <div class="text-muted extra-small text-uppercase letter-spacing-05">
                ${total} ${total === 1 ? 'clase identificada' : 'clases identificadas'}
              </div>
            </div>
            <div class="ms-auto pe-2 d-none d-sm-block">
              <span class="badge bg-light text-primary border border-primary-subtle small">${escapeHTML(firstClass.instrumento)}</span>
            </div>
          </div>
        </button>
      </h2>
      <div id="collapse-${index}" class="accordion-collapse collapse" data-bs-parent="#clasesAccordion">
        <div class="accordion-body p-0 bg-light-subtle">
          <div class="table-responsive">
            <table class="table table-compact table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr class="extra-small text-uppercase text-muted">
                  <th class="ps-4">Detalle / Maestro</th>
                  <th>Horarios</th>
                  <th>Estado</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${classes.map(c => `
                  <tr data-id="${c.id}" style="cursor: pointer;" class="clickable-row">
                    <td class="ps-4">
                      <div class="small fw-semibold">${escapeHTML(c.instrumento)}</div>
                      <div class="text-muted extra-small">${state.maestros.find(m => m.id === c.maestro_principal_id)?.nombre_completo || 'Sin maestro'}</div>
                    </td>
                    <td>
                      <div class="d-flex flex-wrap gap-1">
                        ${(c.horarios || []).map(h => `<span class="badge bg-white text-dark border extra-small fw-normal">${(h.dia || '').slice(0,2)} ${(h.hora_inicio || '').slice(0,5)}</span>`).join('')}
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-compact ${getEstadoBadgeClass(c.estado)}">${getEstadoLabel(c.estado)}</span>
                    </td>
                    <td class="text-end pe-4">
                      <div class="quick-actions justify-content-end">
                        <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${c.id}" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${c.id}" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
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

  container.querySelector('#view-content')?.addEventListener('click', (e) => {
    // Manejo de clicks en botones de acción
    const btn = e.target.closest('button[data-action]')
    if (btn) {
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

    // Manejo de clicks en filas de la tabla
    const row = e.target.closest('tr.clickable-row')
    if (row && !e.target.closest('button')) {
      const id = row.dataset.id
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
