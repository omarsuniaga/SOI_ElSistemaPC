import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerPermisos,
  actualizarPermiso,
} from '../api/permisosApi.js'
import { config } from '../../../core/config/config.js'
import { useAuth } from '../../auth/hooks/useAuth.js'

const state = {
  permisos: [],
  cargando: false,
  togglingId: null,
  togglingField: null,
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
  document.getElementById('retryBtn')?.addEventListener('click', () => renderPermisosView(container))
}

function renderContent(container) {
  const maestroActual = useAuth.getUser ? useAuth.getUser() : null
  const adminName = maestroActual?.nombre_completo || maestroActual?.email || 'Admin'

  container.innerHTML = `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-shield-lock me-2 text-primary"></i>Permisos de Maestros</span>
          <span class="badge bg-secondary">${state.permisos.length}</span>
        </div>
      </div>

      ${!state.permisos.length ? renderEmpty() : `
      <!-- Table -->
      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="permisosTable">
          <thead>
            <tr>
              <th style="width: 20%;">Maestro</th>
              <th style="width: 20%;">Email</th>
              <th style="width: 18%;">Registrar Alumnos</th>
              <th style="width: 18%;">Inscribir Clases</th>
              <th style="width: 14%;">Concedido por</th>
              <th style="width: 10%;">Actualizado</th>
            </tr>
          </thead>
          <tbody id="permisosTBody">
            ${renderTableRows()}
          </tbody>
        </table>
      </div>
      `}

      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle"></i>
        Los cambios se guardan automáticamente al alternar un permiso.
        ${config.isDemoMode ? '<span class="badge bg-warning text-dark ms-1">Demo</span>' : ''}
      </div>
    </div>
  `
}

function renderTableRows() {
  return state.permisos.map(p => {
    const isToggling = state.togglingId === p.maestro_id
    const concedidoPor = p.concedido_por_nombre || p.concedido_por || '-'
    const actualizado = p.actualizado_en
      ? new Date(p.actualizado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      : '-'

    const solicitudes = p.solicitudes || []
    const reqAlumnos = !p.puede_registrar_alumnos && solicitudes.includes('alumnos:create')
    const reqClases = !p.puede_inscribir_clases && solicitudes.includes('clases:enroll')

    return `
      <tr data-maestro-id="${escapeHTML(p.maestro_id)}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-compact bg-primary text-white">${getInitials(p.maestro_nombre || p.maestro_id)}</div>
            <span class="text-truncate" style="max-width: 150px;" title="${escapeHTML(p.maestro_nombre)}">${escapeHTML(p.maestro_nombre || 'Sin nombre')}</span>
          </div>
        </td>
        <td class="text-truncate" style="max-width: 150px;" title="${escapeHTML(p.maestro_email)}">${escapeHTML(p.maestro_email || '-')}</td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${escapeHTML(p.maestro_id)}"
              data-field="puede_registrar_alumnos"
              ${p.puede_registrar_alumnos ? 'checked' : ''}
              ${isToggling ? 'disabled' : ''}>
            <span class="small ${p.puede_registrar_alumnos ? 'text-success' : 'text-muted'}">
              ${p.puede_registrar_alumnos ? 'Sí' : 'No'}
            </span>
          </div>
          ${reqAlumnos ? `
            <div class="mt-1 d-flex align-items-center gap-1">
              <span class="badge bg-warning text-dark" style="font-size: 0.65rem; padding: 2px 4px;"><i class="bi bi-exclamation-triangle"></i> Solicitado</span>
              <button class="btn btn-sm btn-outline-primary aprobar-btn px-1 py-0" 
                data-maestro-id="${escapeHTML(p.maestro_id)}" 
                data-permiso="alumnos:create" 
                data-field="puede_registrar_alumnos" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          ` : ''}
        </td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${escapeHTML(p.maestro_id)}"
              data-field="puede_inscribir_clases"
              ${p.puede_inscribir_clases ? 'checked' : ''}
              ${isToggling ? 'disabled' : ''}>
            <span class="small ${p.puede_inscribir_clases ? 'text-success' : 'text-muted'}">
              ${p.puede_inscribir_clases ? 'Sí' : 'No'}
            </span>
          </div>
          ${reqClases ? `
            <div class="mt-1 d-flex align-items-center gap-1">
              <span class="badge bg-warning text-dark" style="font-size: 0.65rem; padding: 2px 4px;"><i class="bi bi-exclamation-triangle"></i> Solicitado</span>
              <button class="btn btn-sm btn-outline-primary aprobar-btn px-1 py-0" 
                data-maestro-id="${escapeHTML(p.maestro_id)}" 
                data-permiso="clases:enroll" 
                data-field="puede_inscribir_clases" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          ` : ''}
        </td>
        <td class="small text-muted">${escapeHTML(concedidoPor)}</td>
        <td class="small text-muted">${actualizado}</td>
      </tr>
    `
  }).join('')
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

function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function attachEvents(container) {
  const table = container.querySelector('#permisosTable')
  if (!table) return

  // Event delegation for toggle switches
  table.addEventListener('change', async (e) => {
    const toggle = e.target.closest('.permiso-toggle')
    if (!toggle) return

    const maestroId = toggle.dataset.maestroId
    const field = toggle.dataset.field
    const newValue = toggle.checked

    // Optimistic: disable the toggle
    toggle.disabled = true
    state.togglingId = maestroId
    state.togglingField = field

    // Update the label next to the toggle immediately
    const label = toggle.closest('.form-check')?.querySelector('span')
    if (label) {
      label.textContent = newValue ? 'Sí' : 'No'
      label.className = `small ${newValue ? 'text-success' : 'text-muted'}`
    }

    try {
      const match = state.permisos.find(p => p.maestro_id === maestroId)
      let changes = { [field]: newValue }

      if (match) {
        if (newValue) {
          const key = field === 'puede_registrar_alumnos' ? 'alumnos:create' : 'clases:enroll'
          const arrayPermisos = match.permisos || []
          if (!arrayPermisos.includes(key)) {
            arrayPermisos.push(key)
          }
          const solicitudes = (match.solicitudes || []).filter(s => s !== key)
          const adminUser = useAuth.getUser ? useAuth.getUser() : null
          const adminName = adminUser?.nombre_completo || adminUser?.email || 'Administrador'

          changes = {
            ...changes,
            permisos: arrayPermisos,
            solicitudes: solicitudes,
            concedido_por: adminUser?.id || 'admin',
            concedido_por_nombre: adminName
          }

          match.permisos = arrayPermisos
          match.solicitudes = solicitudes
          match.concedido_por = adminUser?.id || 'admin'
          match.concedido_por_nombre = adminName
        } else {
          const key = field === 'puede_registrar_alumnos' ? 'alumnos:create' : 'clases:enroll'
          const arrayPermisos = (match.permisos || []).filter(pk => pk !== key)
          
          changes = {
            ...changes,
            permisos: arrayPermisos
          }
          match.permisos = arrayPermisos
        }
        match.actualizado_en = new Date().toISOString()
      }

      await actualizarPermiso(maestroId, changes)
      
      if (match) {
        match[field] = newValue
      }

      AppToast.success(`Permiso actualizado: ${field === 'puede_registrar_alumnos' ? 'Registrar Alumnos' : 'Inscribir Clases'}`)

      // Volver a renderizar para limpiar badges de solicitudes si existían
      const tbody = container.querySelector('#permisosTBody')
      if (tbody) {
        tbody.innerHTML = renderTableRows()
      }
    } catch (err) {
      // Rollback on error
      toggle.checked = !newValue
      if (label) {
        label.textContent = !newValue ? 'Sí' : 'No'
        label.className = `small ${!newValue ? 'text-success' : 'text-muted'}`
      }
      AppToast.error('Error al actualizar permiso: ' + err.message)
    } finally {
      toggle.disabled = false
      state.togglingId = null
      state.togglingField = null
    }
  })

  // Event delegation for clicks (like "Aprobar" button)
  table.addEventListener('click', async (e) => {
    const btn = e.target.closest('.aprobar-btn')
    if (!btn) return

    const maestroId = btn.dataset.maestroId
    const permiso = btn.dataset.permiso
    const field = btn.dataset.field

    btn.disabled = true
    const originalHtml = btn.innerHTML
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`

    try {
      const match = state.permisos.find(p => p.maestro_id === maestroId)
      if (!match) throw new Error('No se encontró el registro de permisos del maestro')

      const arrayPermisos = match.permisos || []
      if (!arrayPermisos.includes(permiso)) {
        arrayPermisos.push(permiso)
      }
      const solicitudes = (match.solicitudes || []).filter(s => s !== permiso)

      const adminUser = useAuth.getUser ? useAuth.getUser() : null
      const adminName = adminUser?.nombre_completo || adminUser?.email || 'Administrador'

      const changes = {
        permisos: arrayPermisos,
        solicitudes: solicitudes,
        concedido_por: adminUser?.id || 'admin',
        concedido_por_nombre: adminName,
        [field]: true
      }

      await actualizarPermiso(maestroId, changes)

      match.permisos = arrayPermisos
      match.solicitudes = solicitudes
      match.concedido_por = adminUser?.id || 'admin'
      match.concedido_por_nombre = adminName
      match[field] = true
      match.actualizado_en = new Date().toISOString()

      AppToast.success(`Solicitud aprobada: ${field === 'puede_registrar_alumnos' ? 'Registrar Alumnos' : 'Inscribir Clases'}`)

      const tbody = container.querySelector('#permisosTBody')
      if (tbody) {
        tbody.innerHTML = renderTableRows()
      }
    } catch (err) {
      AppToast.error('Error al aprobar solicitud: ' + err.message)
      btn.disabled = false
      btn.innerHTML = originalHtml
    }
  })
}
