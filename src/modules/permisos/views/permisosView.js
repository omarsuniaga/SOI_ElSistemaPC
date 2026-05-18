import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerPermisos,
  actualizarPermiso,
} from '../api/permisosApi.js'
import { config } from '../../../core/config/config.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { AddMaestroModal } from './components/AddMaestroModal.js'
import { renderPermisoRow } from './components/PermisoRow.js'
import { grantBulk } from '../services/grantBulk.js'

const state = {
  permisos: [],
  cargando: false,
}

let currentContainer = null

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function renderPermisosView(container) {
  currentContainer = container
  try {
    state.cargando = true
    renderLoading(container)

    const permisos = await obtenerPermisos()
    state.permisos = permisos
    state.cargando = false

    renderContent(container)
    attachEvents(container)
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
        <p class="text-muted">Cargando permisos...</p>
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
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderPermisosView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header d-flex align-items-center justify-content-between mb-3">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-shield-lock me-2 text-primary"></i>Permisos de Maestros</span>
          <span class="badge bg-secondary">${state.permisos.length}</span>
        </div>
        <button class="btn btn-primary btn-sm" data-action="add-maestro">
          <i class="bi bi-plus-lg me-1"></i>Agregar Maestro
        </button>
      </div>

      <!-- Bulk Action Bar -->
      <div class="d-flex align-items-center gap-2 mb-2" id="bulkActionBar">
        <input type="checkbox" class="form-check-input" data-action="select-all" id="selectAll">
        <label class="form-check-label small me-2" for="selectAll">Seleccionar todos</label>
        <select class="form-select form-select-sm" data-action="grant-key" style="width:auto;">
          <option value="">-- Permiso --</option>
          <option value="alumnos:create">Registrar Alumnos</option>
          <option value="clases:enroll">Inscribir Clases</option>
          <option value="planificacion:write">Planificación</option>
          <option value="asistencias:write">Asistencias</option>
        </select>
        <button class="btn btn-secondary btn-sm" data-action="apply-bulk">Aplicar</button>
      </div>

      ${!state.permisos.length ? renderEmpty() : `
      <!-- Table -->
      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="permisosTable">
          <thead>
            <tr>
              <th>Maestro</th>
              <th>Email</th>
              <th>Permisos</th>
              <th>Acceso</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="permisosTBody"></tbody>
        </table>
      </div>
      `}

      <!-- Toast container -->
      <div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>

      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle"></i>
        Los cambios se guardan automáticamente.
        ${config.isDemoMode ? '<span class="badge bg-warning text-dark ms-1">Demo</span>' : ''}
      </div>
    </div>
  `

  // Render rows using PermisoRow component
  const tbody = container.querySelector('#permisosTBody')
  if (tbody) {
    state.permisos.forEach(p => {
      tbody.appendChild(renderPermisoRow(p))
    })
  }
}

function renderEmpty() {
  return `
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-shield-exclamation" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay permisos configurados</h4>
      <p class="text-muted">Los permisos aparecerán aquí cuando los administradores los configuren.</p>
    </div>
  `
}

function attachEvents(container) {
  // Add maestro button
  container.querySelector('[data-action="add-maestro"]')?.addEventListener('click', async () => {
    const modal = new AddMaestroModal(container)
    await modal.open()
  })

  // maestro-added event → refresh list
  container.addEventListener('maestro-added', async () => {
    await renderPermisosView(container)
  })

  // Select-all checkbox
  container.querySelector('[data-action="select-all"]')?.addEventListener('change', (e) => {
    const checked = e.target.checked
    container.querySelectorAll('.bulk-select').forEach(cb => {
      cb.checked = checked
    })
  })

  // Apply bulk grant
  container.querySelector('[data-action="apply-bulk"]')?.addEventListener('click', async () => {
    const selectedIds = Array.from(container.querySelectorAll('.bulk-select:checked'))
      .map(cb => cb.dataset.maestroId)

    if (!selectedIds.length) {
      AppToast.error('Seleccioná al menos un maestro')
      return
    }

    const permisoKey = container.querySelector('[data-action="grant-key"]')?.value
    if (!permisoKey) {
      AppToast.error('Seleccioná un permiso para otorgar')
      return
    }

    const result = await grantBulk(selectedIds, permisoKey)
    const total = result.succeeded.length + result.failed.length
    const msg = `${result.succeeded.length} de ${total} actualizados`
    if (result.failed.length === 0) {
      AppToast.success(msg)
    } else {
      AppToast.error(`${msg} (${result.failed.length} fallaron)`)
    }
  })

  // Toggle switches — delegated on table (handled inside PermisoRow via attachRowEvents)
  // Additional: direct delegation for actualizarPermiso on permiso-toggle for backward compat
  container.querySelector('#permisosTable')?.addEventListener('change', async (e) => {
    const toggle = e.target.closest('.permiso-toggle')
    if (!toggle) return

    const maestroId = toggle.dataset.maestroId
    const field = toggle.dataset.field
    const newValue = toggle.checked

    toggle.disabled = true

    try {
      await actualizarPermiso(maestroId, { [field]: newValue })
      const permiso = state.permisos.find(p => p.maestro_id === maestroId)
      if (permiso) permiso[field] = newValue
    } catch (err) {
      toggle.checked = !newValue
      AppToast.error('Error al actualizar permiso: ' + err.message)
    } finally {
      toggle.disabled = false
    }
  })
}
