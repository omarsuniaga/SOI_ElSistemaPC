import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
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

function canGrantClassManagement(permiso) {
  return Number(permiso?.total_clases_asignadas || 0) > 0
}

function canGrantClassCreation(permiso) {
  return Number(permiso?.total_clases_asignadas || 0) > 0
}

function isClassManagementField(field) {
  return field === 'puede_inscribir_clases'
}

function isClassCreationField(field) {
  return field === 'puede_crear_clases'
}

function isClassPermissionField(field) {
  return isClassManagementField(field) || isClassCreationField(field)
}

function getPermissionKey(field) {
  if (field === 'puede_registrar_alumnos') return 'alumnos:create'
  if (field === 'puede_crear_clases') return 'clases:create'
  return 'clases:enroll'
}

function getClassSummaryLabel(permiso) {
  const total = Number(permiso?.total_clases_asignadas || 0)
  const titular = Number(permiso?.clases_titular || 0)
  const suplente = Number(permiso?.clases_suplente || 0)

  if (total <= 0) {
    return `
      <div class="small text-muted">0 asignadas</div>
      <div class="small text-warning-emphasis">
        <i class="bi bi-exclamation-circle me-1"></i>Asigna clases primero
      </div>
    `
  }

  return `
    <div class="small fw-semibold text-body">${total} asignada${total !== 1 ? 's' : ''}</div>
    <div class="small text-muted">
      ${titular} titular${titular !== 1 ? 'es' : ''}${suplente > 0 ? ` · ${suplente} suplente${suplente !== 1 ? 's' : ''}` : ''}
    </div>
  `
}

function getStatusMarkup(permiso) {
  const activo = permiso?.maestro_activo !== false
  const eligible = canGrantClassManagement(permiso)

  return `
    <div class="d-flex flex-column gap-1">
      <div class="d-flex flex-wrap gap-1">
        <span class="badge ${activo ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}">
          ${activo ? 'Activo' : 'Inactivo'}
        </span>
        <span class="badge ${eligible ? 'bg-primary-subtle text-primary-emphasis' : 'bg-warning-subtle text-warning-emphasis'}">
          ${eligible ? 'Puede gestionar clases' : 'Sin clases asignadas'}
        </span>
      </div>
      <span class="small text-muted">Por: ${escapeHTML(permiso?.concedido_por_nombre || permiso?.concedido_por || '-')}</span>
    </div>
  `
}

export async function renderPermisosView(container) {
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
              <th style="width: 18%;">Maestro</th>
              <th style="width: 18%;">Email</th>
              <th style="width: 14%;">Clases asignadas</th>
              <th style="width: 14%;">Registrar alumnos</th>
              <th style="width: 14%;">Gestionar clases</th>
              <th style="width: 14%;">Crear clases</th>
              <th style="width: 12%;">Estado</th>
              <th style="width: 8%;">Actualizado</th>
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
        <span class="ms-1">Los accesos de gestión y creación de clases solo se habilitan cuando el maestro ya tiene clases asignadas.</span>
        ${config.isDemoMode ? '<span class="badge bg-warning text-dark ms-1">Demo</span>' : ''}
      </div>
    </div>
  `
}

function renderTableRows() {
  return state.permisos.map(p => {
    const isToggling = state.togglingId === p.maestro_id
    const actualizado = p.actualizado_en
      ? new Date(p.actualizado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      : '-'
    const canManageClasses = canGrantClassManagement(p)
    const canCreateClasses = canGrantClassCreation(p)
    const classToggleDisabled = isToggling || (!p.puede_inscribir_clases && !canManageClasses)
    const createToggleDisabled = isToggling || (!p.puede_crear_clases && !canCreateClasses)

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
          ${getClassSummaryLabel(p)}
        </td>
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
              ${classToggleDisabled ? 'disabled' : ''}>
            <span class="small ${p.puede_inscribir_clases ? 'text-success' : 'text-muted'}">
              ${p.puede_inscribir_clases ? 'Sí' : 'No'}
            </span>
          </div>
          ${!p.puede_inscribir_clases && !canManageClasses ? `
            <div class="mt-1 small text-warning-emphasis">
              <i class="bi bi-lock me-1"></i>Asigna al menos una clase para habilitar este acceso.
            </div>
          ` : ''}
          ${reqClases ? `
            <div class="mt-1 d-flex align-items-center gap-1">
              <span class="badge bg-warning text-dark" style="font-size: 0.65rem; padding: 2px 4px;"><i class="bi bi-exclamation-triangle"></i> Solicitado</span>
              ${canManageClasses
                ? `<button class="btn btn-sm btn-outline-primary aprobar-btn px-1 py-0" 
                    data-maestro-id="${escapeHTML(p.maestro_id)}" 
                    data-permiso="clases:enroll" 
                    data-field="puede_inscribir_clases" 
                    style="font-size: 0.65rem; line-height: 1;">Aprobar</button>`
                : '<span class="small text-muted">Asigna clases para aprobar</span>'
              }
            </div>
          ` : ''}
        </td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${escapeHTML(p.maestro_id)}"
              data-field="puede_crear_clases"
              ${p.puede_crear_clases ? 'checked' : ''}
              ${createToggleDisabled ? 'disabled' : ''}>
            <span class="small ${p.puede_crear_clases ? 'text-success' : 'text-muted'}">
              ${p.puede_crear_clases ? 'Sí' : 'No'}
            </span>
          </div>
          ${!p.puede_crear_clases && !canCreateClasses ? `
            <div class="mt-1 small text-warning-emphasis">
              <i class="bi bi-lock me-1"></i>Asigna al menos una clase para habilitar este acceso.
            </div>
          ` : ''}
        </td>
        <td>${getStatusMarkup(p)}</td>
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
      <h4>No hay maestros para gestionar</h4>
      <p class="text-muted">Cuando existan maestros registrados, aparecerán aquí junto con sus permisos y clases asignadas.</p>
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
    const match = state.permisos.find(p => p.maestro_id === maestroId)

    if (isClassManagementField(field) && newValue && !canGrantClassManagement(match)) {
      toggle.checked = false
      AppToast.error('No puedes habilitar gestionar clases hasta asignarle al menos una clase al maestro.')
      return
    }

    if (isClassCreationField(field) && newValue && !canGrantClassCreation(match)) {
      toggle.checked = false
      AppToast.error('No puedes habilitar crear clases hasta asignarle al menos una clase al maestro.')
      return
    }

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
      let changes = { [field]: newValue }

      if (match) {
        if (newValue) {
          const key = getPermissionKey(field)
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
          const key = getPermissionKey(field)
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

      AppToast.success(`Permiso actualizado: ${
        field === 'puede_registrar_alumnos'
          ? 'Registrar Alumnos'
          : field === 'puede_crear_clases'
            ? 'Crear Clases'
            : 'Gestionar Clases'
      }`)

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
      if (isClassPermissionField(field) && !canGrantClassManagement(match)) {
        throw new Error('Asigna al menos una clase al maestro antes de aprobar este acceso')
      }

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

      AppToast.success(`Solicitud aprobada: ${
        field === 'puede_registrar_alumnos'
          ? 'Registrar Alumnos'
          : field === 'puede_crear_clases'
            ? 'Crear Clases'
            : 'Gestionar Clases'
      }`)

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
