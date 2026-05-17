import { Toast } from 'bootstrap'
import { AppModal } from '../../../shared/components/AppModal.js'
import {
  obtenerProgramas,
  crearPrograma,
  actualizarPrograma,
  eliminarPrograma,
  exportarProgramasPDF,
  NIVELES,
  getNivelLabel,
} from '../api/programasApi.js'

const state = {
  programas: [],
  programasOriginales: [],
  cargando: false,
  viewingId: null,
  deletingId: null,
  editando: null,
}

const VALIDATION = {
  nombreMax: 100,
  descripcionMax: 500,
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function getInitials(nombre) {
  if (!nombre) return '?'
  const parts = String(nombre).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getStatusColor(activo) {
  return activo ? 'bg-success' : 'bg-secondary'
}

function getStatusLabel(activo) {
  return activo ? 'Activo' : 'Inactivo'
}

function getNivelOptions(selectedValue = '') {
  return NIVELES.map(n => 
    `<option value="${n.value}" ${n.value === selectedValue ? 'selected' : ''}>${n.label}</option>`
  ).join('')
}



export async function renderProgramasView(container) {
  try {
    state.cargando = true
    renderLoading(container)

    const programas = await obtenerProgramas()
    state.programas = programas
    state.programasOriginales = [...programas]
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
        <p class="text-muted">Cargando programas...</p>
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
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderProgramasView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <!-- Page Header Compact -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-journal-bookmark me-2 text-primary"></i>Programas</span>
          <span class="badge bg-secondary">${state.programas.length}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm-compact" id="btnExportarPDF" title="Exportar a PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="btn btn-primary btn-sm-compact" id="btnAgregarPrograma">
            <i class="bi bi-plus-lg"></i> Nuevo
          </button>
        </div>
      </div>

      <!-- Toolbar Compact -->
      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar programa..." id="buscar" autocomplete="off">
        </div>
        <select class="form-select input-dense" id="filtroEstado" style="width: auto; min-width: 120px;">
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <!-- Table Compact -->
      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="programasTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th class="d-none d-sm-table-cell">Nivel</th>
              <th class="d-none d-md-table-cell">Descripción</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody id="programasTBody">
            ${renderTableRows(state.programas)}
          </tbody>
        </table>
        ${state.programas.length === 0 ? renderEmpty() : ''}
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `
}

function renderTableRows(programas) {
  if (!programas.length) return '<tr><td colspan="5" class="text-center text-muted py-3">No hay programas</td></tr>'

  return programas.map(p => {
    const nombre = p.nombre || '-'
    const descripcion = p.descripcion || '-'
    const activo = p.activo ?? true
    const nivelLabel = getNivelLabel(p.nivel)
    return `
      <tr data-id="${p.id}" class="align-middle">
        <td>
          <div class="d-flex align-items-center gap-3">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle">${getInitials(nombre)}</div>
            <div>
              <div class="fw-bold text-truncate" style="max-width: 180px;" title="${nombre}">${escapeHTML(nombre)}</div>
              <div class="small text-muted d-sm-none">${nivelLabel}</div>
            </div>
          </div>
        </td>
        <td class="d-none d-sm-table-cell"><span class="badge bg-info-subtle text-info border border-info-subtle">${nivelLabel}</span></td>
        <td class="d-none d-md-table-cell text-truncate text-muted small" style="max-width: 200px;" title="${descripcion}">${escapeHTML(descripcion)}</td>
        <td>
          <span class="badge badge-pill bg-${activo ? 'success' : 'secondary'}-subtle text-${activo ? 'success' : 'secondary'} border border-${activo ? 'success' : 'secondary'}-subtle">${activo ? 'Activo' : 'Inactivo'}</span>
        </td>
        <td class="text-end">
          <div class="quick-actions justify-content-end">
            <button class="btn btn-sm btn-light text-primary border btn-icon-compact" data-action="edit" data-id="${p.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-light text-danger border btn-icon-compact" data-action="delete" data-id="${p.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

function renderEmpty() {
  return `
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay programas</h4>
      <p class="text-muted">Crea tu primer programa haciendo clic en el botón "Nuevo"</p>
    </div>
  `
}

function attachGlobalEvents(container) {
  currentContainer = container

  const btnNuevo = container.querySelector('#btnAgregarPrograma')
  if (btnNuevo) {
    btnNuevo.addEventListener('click', () => openCreateModal())
  }

  const btnExport = container.querySelector('#btnExportarPDF')
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      try {
        await exportarProgramasPDF(state.programasOriginales)
        showToast('PDF exportado exitosamente', 'success')
      } catch (error) {
        console.error(error)
        showToast('Error al exportar PDF', 'error')
      }
    })
  }

  const searchInput = container.querySelector('#buscar')
  searchInput?.addEventListener('input', applyFilters)

  container.querySelector('#filtroEstado')?.addEventListener('change', applyFilters)

  const tbody = container.querySelector('#programasTBody')
  tbody?.addEventListener('click', async (e) => {
    const row = e.target.closest('tr[data-id]')
    if (row && !e.target.closest('[data-action]')) {
      const id = row.dataset.id
      openViewModal(id)
      return
    }

    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = btn.dataset.id
    if (btn.dataset.action === 'edit') {
      openEditModal(id)
    } else if (btn.dataset.action === 'delete') {
      openDeleteModal(id)
    }
  })
}

function applyFilters() {
  const searchTerm = currentContainer.querySelector('#buscar')?.value.trim().toLowerCase() || ''
  const filtroEstado = currentContainer.querySelector('#filtroEstado')?.value || 'todos'

  state.programas = state.programasOriginales.filter(p => {
    const matchSearch = !searchTerm ||
      (p.nombre || '').toLowerCase().includes(searchTerm) ||
      (p.descripcion || '').toLowerCase().includes(searchTerm)

    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && p.activo) ||
      (filtroEstado === 'inactivo' && !p.activo)

    return matchSearch && matchEstado
  })

  refreshTable()
}

let currentContainer = null

function openCreateModal() {
  state.editando = null
  AppModal.open({
    title: 'Crear Nuevo Programa',
    body: `<form class="row g-2" id="formPrograma">
      <div class="col-md-8">
        <label class="form-label-compact">Nombre del Programa *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ingeniería en Sistemas" maxlength="${VALIDATION.nombreMax}">
      </div>
      <div class="col-md-4">
        <label class="form-label-compact">Nivel/Año</label>
        <select class="form-select input-dense" id="modal-nivel">
          ${getNivelOptions()}
        </select>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="3" placeholder="Descripción del programa..." maxlength="${VALIDATION.descripcionMax}"></textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" checked>
          <label class="form-check-label" for="modal-esActivo">Programa activo</label>
        </div>
      </div>
    </form>`,
    saveText: 'Guardar',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const nivel = modalBody.querySelector('#modal-nivel').value
      const descripcion = modalBody.querySelector('#modal-descripcion').value.trim()
      const esActivo = modalBody.querySelector('#modal-esActivo').checked

      if (!nombre) {
        showToast('El nombre es obligatorio', 'error')
        return false
      }

      const datosPrograma = { 
        nombre, 
        nivel: nivel || null,
        descripcion: descripcion || null, 
        activo: esActivo 
      }
      const nuevo = await crearPrograma(datosPrograma)
      state.programasOriginales.push(nuevo)
      applyFilters()
      showToast('Programa creado exitosamente', 'success')
    }
  })
}

function openEditModal(id) {
  const programa = state.programasOriginales.find(p => p.id === id)
  if (!programa) {
    showToast('Programa no encontrado', 'error')
    return
  }

  state.editando = id
  AppModal.open({
    title: 'Editar Programa',
    body: `<form class="row g-2" id="formPrograma">
      <div class="col-md-8">
        <label class="form-label-compact">Nombre del Programa *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${VALIDATION.nombreMax}" value="${escapeHTML(programa.nombre || '')}">
      </div>
      <div class="col-md-4">
        <label class="form-label-compact">Nivel/Año</label>
        <select class="form-select input-dense" id="modal-nivel">
          ${getNivelOptions(programa.nivel)}
        </select>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="3" maxlength="${VALIDATION.descripcionMax}">${escapeHTML(programa.descripcion || '')}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${programa.activo !== false ? 'checked' : ''}>
          <label class="form-check-label" for="modal-esActivo">Programa activo</label>
        </div>
      </div>
    </form>`,
    saveText: 'Guardar cambios',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const nivel = modalBody.querySelector('#modal-nivel').value
      const descripcion = modalBody.querySelector('#modal-descripcion').value.trim()
      const esActivo = modalBody.querySelector('#modal-esActivo').checked

      if (!nombre) {
        showToast('El nombre es obligatorio', 'error')
        return false
      }

      const datosPrograma = { 
        nombre, 
        nivel: nivel || null,
        descripcion: descripcion || null, 
        activo: esActivo 
      }
      await actualizarPrograma(state.editando, datosPrograma)
      const idx = state.programasOriginales.findIndex(p => p.id === state.editando)
      if (idx !== -1) {
        state.programasOriginales[idx] = { ...state.programasOriginales[idx], ...datosPrograma }
      }
      applyFilters()
      showToast('Programa actualizado correctamente', 'success')
    }
  })
}

function openViewModal(id) {
  const programa = state.programasOriginales.find(p => p.id === id)
  if (!programa) {
    showToast('Programa no encontrado', 'error')
    return
  }

  state.viewingId = id
  AppModal.open({
    title: escapeHTML(programa.nombre || 'Programa'),
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(programa.nombre || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Nivel/Año</label>
            <p class="form-control-plaintext">
              <span class="badge bg-info bg-opacity-25 text-info">${getNivelLabel(programa.nivel)}</span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getStatusColor(programa.activo)}">
                ${getStatusLabel(programa.activo)}
              </span>
            </p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Creado</label>
            <p class="form-control-plaintext">${formatDate(programa.created_at)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Actualizado</label>
            <p class="form-control-plaintext">${formatDate(programa.updated_at)}</p>
          </div>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label fw-bold">Descripción</label>
            <p class="form-control-plaintext">${escapeHTML(programa.descripcion || 'Sin descripción')}</p>
          </div>
        </div>
      </div>
    `
  })
}

function openDeleteModal(id) {
  const programa = state.programasOriginales.find(p => p.id === id)
  if (!programa) {
    showToast('Programa no encontrado', 'error')
    return
  }

  state.deletingId = id
  AppModal.open({
    title: '⚠️ Eliminar Programa',
    size: 'sm',
    saveText: 'Eliminar',
    body: `<p>¿Eliminar el programa <strong>${escapeHTML(programa.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>`,
    onSave: async () => {
      await eliminarPrograma(id)
      state.programasOriginales = state.programasOriginales.filter(p => p.id !== id)
      applyFilters()
      showToast('Programa eliminado correctamente', 'success')
    }
  })
}

function refreshTable() {
  const tbody = currentContainer.querySelector('#programasTBody')
  if (!tbody) return
  if (state.programas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No hay programas</td></tr>'
  } else {
    tbody.innerHTML = renderTableRows(state.programas)
  }
}

function showToast(message, type = 'info') {
  const toastContainer = currentContainer.querySelector('#toastContainer')
  if (!toastContainer) return

  const toastId = 'toast-' + Date.now()
  const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info'
  const iconClass = type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'

  const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white">
        <i class="bi ${iconClass} me-2"></i>
        <strong class="me-auto">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${escapeHTML(message)}
      </div>
    </div>
  `

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = toastHTML
  const toastElement = tempDiv.firstElementChild
  toastContainer.appendChild(toastElement)

  const bootstrapToast = new Toast(toastElement, { autohide: true, delay: 3000 })
  bootstrapToast.show()

  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove()
  })
}
