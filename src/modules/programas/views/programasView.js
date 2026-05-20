import '../styles/programas.css'
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
      <div class="programas-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-journal-bookmark fs-4"></i>
          </div>
          <div>
            <h1 class="programas-title-premium page-title mb-0">Programas</h1>
            <p class="text-muted small mb-0">${state.programas.length} programas en total</p>
          </div>
        </div>
        
        <div class="programas-header-actions">
          <button class="btn btn-outline-secondary btn-sm-compact me-2" id="btnExportarPDF" title="Exportar PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="btn btn-premium-action" id="btnAgregarPrograma">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Programa
          </button>
        </div>
      </div>

      <div class="programas-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar programa..." id="buscar">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="programasTBody">
          ${renderTableRows(state.programas)}
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

  return programas.map(p => {
    const initials = getInitials(p.nombre)
    const nivel = getNivelLabel(p.nivel)
    const descripcion = escapeHTML(p.descripcion || 'Sin descripción')
    const accentClass = `border-accent-${p.activo ? 'success' : 'secondary'}`
    const statusDotClass = `bg-${p.activo ? 'success' : 'secondary'}`

    return `
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${accentClass}" data-id="${p.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${initials}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${statusDotClass} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(p.nombre)}</span>
            <small class="text-muted text-truncate">${nivel} • ${descripcion.substring(0, 50)}${descripcion.length > 50 ? '...' : ''}</small>
          </div>
        </div>
        <div class="flex-shrink-0 text-muted ms-2 pe-1">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `
  }).join('')
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
      const row = e.target.closest('.list-group-item[data-id]')
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
    title: 'Perfil del Programa',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="programa-profile">
        <!-- Header Banner / Avatar Section -->
        <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
          <div class="position-relative" style="flex-shrink: 0;">
            <div class="avatar-large bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center fw-bold" 
                 style="width: 60px; height: 60px; font-size: 1.6rem; border-radius: 50%;">
              ${getInitials(p.nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 bg-${p.activo ? 'success' : 'danger'} border border-light rounded-circle" 
                  style="transform: translate(10%, 10%);"
                  title="${p.activo ? 'Activo' : 'Inactivo'}">
            </span>
          </div>
          <div class="overflow-hidden">
            <h4 class="h5 mb-1 fw-bold text-truncate" style="letter-spacing: -0.01em;">${escapeHTML(p.nombre)}</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">${getNivelLabel(p.nivel)}</span>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="row g-3">
          <div class="col-md-6">
            <div class="programa-profile-card h-100">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-clock me-1 text-primary"></i> Duración
              </label>
              <p class="mb-0 fw-semibold programa-profile-value" style="font-size: 0.95rem;">
                ${p.duracion_anios ? `${p.duracion_anios} ${p.duracion_anios === 1 ? 'año' : 'años'}` : 'No especificada'}
              </p>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="programa-profile-card h-100 d-flex flex-column justify-content-between">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-fingerprint me-1 text-primary"></i> Identificador
              </label>
              <div class="d-flex align-items-center justify-content-between">
                <span class="font-monospace programa-profile-value small text-truncate pe-2" style="font-size: 0.85rem;">${p.id}</span>
                <button class="btn btn-link btn-sm p-0 text-decoration-none text-muted" id="copy-id-btn" title="Copiar ID" style="cursor: pointer;">
                  <i class="bi bi-copy"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="programa-profile-card">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-file-text me-1 text-primary"></i> Descripción
              </label>
              <p class="mb-0 programa-profile-desc" style="font-size: 0.9rem; line-height: 1.5; white-space: pre-line;">
                ${escapeHTML(p.descripcion || 'Sin descripción detallada.')}
              </p>
            </div>
          </div>

          <div class="col-12">
            <div class="programa-profile-card">
              <div class="row g-2">
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-check me-1"></i> Creado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${formatDate(p.created_at)}</p>
                </div>
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-event me-1"></i> Modificado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${p.updated_at ? formatDate(p.updated_at) : formatDate(p.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="col-12 text-end d-flex align-items-center justify-content-end gap-2 mt-2">
            <button class="btn btn-outline-danger btn-sm px-3" id="view-delete-btn" title="Eliminar programa">
              <i class="bi bi-trash me-1"></i> Eliminar
            </button>
            <button class="btn btn-primary btn-sm px-4" id="view-edit-btn" title="Editar programa">
              <i class="bi bi-pencil me-1"></i> Editar
            </button>
          </div>
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
      modalBody.querySelector('#copy-id-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(p.id)
        AppToast.success('ID copiado al portapapeles')
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
