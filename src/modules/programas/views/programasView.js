import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { Programa } from '../models/programa.model.js'
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
    year: 'numeric', month: 'short', day: 'numeric'
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

/**
 * Vista de Programas Académicos (Refactored)
 */
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
    console.error('[ProgramasView]', error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando programas...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${escapeHTML(mensaje)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderProgramasView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-journal-bookmark me-2 text-primary"></i>Programas</span>
          <span class="badge bg-secondary rounded-pill">${state.programas.length}</span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm-compact" id="btnExportarPDF" title="Exportar PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="btn btn-primary btn-sm-compact" id="btnAgregarPrograma">
            <i class="bi bi-plus-lg"></i> Nuevo
          </button>
        </div>
      </div>

      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar programa..." id="buscar">
        </div>
        <select class="form-select input-dense w-auto" id="filtroEstado">
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 50px;"></th>
                <th>Nombre</th>
                <th class="d-none d-md-table-cell">Nivel</th>
                <th class="d-none d-lg-table-cell">Descripción</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="programasTBody">
              ${renderTableRows(state.programas)}
            </tbody>
          </table>
        </div>
        <div id="emptyContainer">
          ${state.programas.length === 0 ? renderEmpty() : ''}
        </div>
      </div>
    </div>
  `
}

function renderTableRows(programas) {
  if (!programas.length) return ''

  return programas.map(p => `
    <tr data-id="${p.id}">
      <td>
        <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle" style="width: 32px; height: 32px; font-size: 0.8rem;">
          ${getInitials(p.nombre)}
        </div>
      </td>
      <td>
        <div class="fw-bold text-truncate" style="max-width: 250px;">${escapeHTML(p.nombre)}</div>
      </td>
      <td class="d-none d-md-table-cell">
        <span class="badge bg-info bg-opacity-10 text-info border border-info-subtle">${getNivelLabel(p.nivel)}</span>
      </td>
      <td class="d-none d-lg-table-cell text-muted small text-truncate" style="max-width: 300px;">
        ${escapeHTML(p.descripcion || '-')}
      </td>
      <td>
        <span class="badge badge-compact ${getStatusColor(p.activo)}">${getStatusLabel(p.activo)}</span>
      </td>
      <td class="text-end">
        <div class="quick-actions justify-content-end">
          <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${p.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${p.id}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('')
}

function renderEmpty() {
  return `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No hay programas que coincidan con la búsqueda.</p>
    </div>
  `
}

let currentContainer = null

function attachGlobalEvents(container) {
  currentContainer = container

  container.querySelector('#btnAgregarPrograma')?.addEventListener('click', () => openCreateModal())
  
  container.querySelector('#btnExportarPDF')?.addEventListener('click', async () => {
    try {
      await exportarProgramasPDF(state.programas)
      AppToast.success('PDF generado exitosamente')
    } catch (err) {
      AppToast.error('Error al generar PDF')
    }
  })

  container.querySelector('#buscar')?.addEventListener('input', applyFilters)
  container.querySelector('#filtroEstado')?.addEventListener('change', applyFilters)

  container.querySelector('#programasTBody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]')
    if (!btn) {
      const row = e.target.closest('tr[data-id]')
      if (row) openViewModal(row.dataset.id)
      return
    }

    const { action, id } = btn.dataset
    if (action === 'edit') openEditModal(id)
    if (action === 'delete') openDeleteModal(id)
  })
}

function applyFilters() {
  const searchTerm = currentContainer.querySelector('#buscar')?.value.trim().toLowerCase() || ''
  const filtroEstado = currentContainer.querySelector('#filtroEstado')?.value || 'todos'

  state.programas = state.programasOriginales.filter(p => {
    const matchSearch = !searchTerm ||
      p.nombre.toLowerCase().includes(searchTerm) ||
      (p.descripcion || '').toLowerCase().includes(searchTerm)

    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && p.activo) ||
      (filtroEstado === 'inactivo' && !p.activo)

    return matchSearch && matchEstado
  })

  refreshTable()
}

function refreshTable() {
  const tbody = currentContainer.querySelector('#programasTBody')
  if (tbody) tbody.innerHTML = renderTableRows(state.programas)
  
  const empty = currentContainer.querySelector('#emptyContainer')
  if (empty) empty.innerHTML = state.programas.length === 0 ? renderEmpty() : ''
}

function openCreateModal() {
  _renderFormModal({ title: 'Nuevo Programa', saveText: 'Crear Programa' })
}

function openEditModal(id) {
  const prog = state.programasOriginales.find(p => p.id === id)
  if (!prog) return AppToast.error('Programa no encontrado')
  _renderFormModal({ title: 'Editar Programa', saveText: 'Guardar Cambios', programa: prog })
}

function _renderFormModal({ title, saveText, programa = null }) {
  AppModal.open({
    title,
    saveText,
    body: `
      <form id="form-programa" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Nombre del Programa *</label>
          <input type="text" class="form-control input-dense" id="prog-nombre" required maxlength="${VALIDATION.nombreMax}" value="${escapeHTML(programa?.nombre || '')}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Nivel / Año *</label>
          <select class="form-select input-dense" id="prog-nivel">
            ${getNivelOptions(programa?.nivel || '')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Duración (años)</label>
          <input type="number" class="form-control input-dense" id="prog-duracion" min="0" step="0.5" value="${programa?.duracion_anios || ''}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción</label>
          <textarea class="form-control input-dense" id="prog-descripcion" rows="3" maxlength="${VALIDATION.descripcionMax}">${escapeHTML(programa?.descripcion || '')}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="prog-activo" ${programa?.activo !== false ? 'checked' : ''}>
            <label class="form-check-label" for="prog-activo">Programa Activo</label>
          </div>
        </div>
      </form>
    `,
    onSave: async (modalBody) => {
      const data = {
        nombre: modalBody.querySelector('#prog-nombre').value.trim(),
        nivel: modalBody.querySelector('#prog-nivel').value,
        duracion_anios: modalBody.querySelector('#prog-duracion').value ? parseFloat(modalBody.querySelector('#prog-duracion').value) : null,
        descripcion: modalBody.querySelector('#prog-descripcion').value.trim(),
        activo: modalBody.querySelector('#prog-activo').checked
      }

      const p = new Programa(data)
      const validLevels = NIVELES.map(n => n.value).filter(Boolean)
      const errores = p.validate(validLevels)

      if (errores.length > 0) {
        AppToast.error(errores[0])
        return false
      }

      try {
        if (programa) {
          const updated = await actualizarPrograma(programa.id, data)
          const idx = state.programasOriginales.findIndex(x => x.id === programa.id)
          state.programasOriginales[idx] = updated
          AppToast.success('Programa actualizado')
        } else {
          const nuevo = await crearPrograma(data)
          state.programasOriginales.unshift(nuevo)
          AppToast.success('Programa creado')
        }
        applyFilters()
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}

function openViewModal(id) {
  const p = state.programasOriginales.find(x => x.id === id)
  if (!p) return

  AppModal.open({
    title: escapeHTML(p.nombre),
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="row g-4">
        <div class="col-md-6">
          <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Identificador</label>
          <p class="mb-0 font-monospace small">${p.id}</p>
        </div>
        <div class="col-md-3">
          <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Nivel</label>
          <span class="badge bg-info bg-opacity-10 text-info border border-info-subtle">${getNivelLabel(p.nivel)}</span>
        </div>
        <div class="col-md-3">
          <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Estado</label>
          <span class="badge ${getStatusColor(p.activo)}">${getStatusLabel(p.activo)}</span>
        </div>
        <div class="col-12">
          <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Descripción</label>
          <p class="mb-0 text-secondary">${escapeHTML(p.descripcion || 'Sin descripción detallada.')}</p>
        </div>
        <div class="col-md-6">
          <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Fecha Creación</label>
          <p class="mb-0 small">${formatDate(p.created_at)}</p>
        </div>
        <div class="col-md-6 text-end d-flex align-items-end justify-content-end gap-2">
          <button class="btn btn-outline-danger btn-sm" id="view-delete-btn"><i class="bi bi-trash"></i></button>
          <button class="btn btn-primary btn-sm" id="view-edit-btn"><i class="bi bi-pencil me-1"></i> Editar</button>
        </div>
      </div>
    `,
    onShow: (modalBody) => {
      modalBody.querySelector('#view-edit-btn').addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openEditModal(id), 300)
      })
      modalBody.querySelector('#view-delete-btn').addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openDeleteModal(id), 300)
      })
    }
  })
}

function openDeleteModal(id) {
  const p = state.programasOriginales.find(x => x.id === id)
  if (!p) return

  AppModal.open({
    title: '⚠️ Eliminar Programa',
    saveText: 'Confirmar Eliminación',
    body: `
      <p>¿Estás seguro de eliminar el programa <strong>${escapeHTML(p.nombre)}</strong>?</p>
      <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Esta acción no se puede deshacer.</p>
    `,
    onSave: async () => {
      try {
        await eliminarPrograma(id)
        state.programasOriginales = state.programasOriginales.filter(x => x.id !== id)
        applyFilters()
        AppToast.success('Programa eliminado')
        return true
      } catch (err) {
        AppToast.error('Error al eliminar')
        return false
      }
    }
  })
}
