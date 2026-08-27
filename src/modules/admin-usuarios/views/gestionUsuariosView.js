/**
 * Vista "Gestión de Usuarios" del panel admin con asignación dinámica de portales y roles.
 */

import {
  ROLES_USUARIO,
  crearUsuario,
  listarUsuarios,
  cargarRolesSistema,
  actualizarRolUsuario,
  actualizarEstadoUsuario,
  getPortalCatalog,
  setUserPortales,
  getAssignedPortalIds
} from '../api/adminUsuariosApi.js'
import { obtenerMaestros } from '../../maestros/api/maestrosApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'

const DEFAULT_SOURCE_MODE = 'maestro'
const DEFAULT_PASSWORD_MODE = 'auto'
const DEFAULT_ROLE_BY_SOURCE = {
  maestro: 'maestro',
  manual: 'user',
}

export async function renderGestionUsuariosView(container) {
  const state = _createState()
  container.__guState = state

  await cargarRolesSistema()

  container.innerHTML = _renderLayout(state)
  _injectStyles()
  _bindEvents(container)
  _updateSourceModeUI(container)
  _updatePasswordModeUI(container)
  _updateRecientesList(container)

  await _loadInitialData(container)
}

function _createState() {
  return {
    sourceMode: DEFAULT_SOURCE_MODE,
    passwordMode: DEFAULT_PASSWORD_MODE,
    maestros: [],
    usuarios: [],
    usuariosFiltrados: [],
    credencialesRecientes: [],
    portalesCatalogo: [],
    activeModalUser: null
  }
}

function _renderLayout(_state) {
  return `
    <div class="gu-root">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-body mb-2 border border-body-tertiary">
        <div class="d-flex align-items-center gap-3">
          <div class="p-2.5 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
            <i class="bi bi-person-gear fs-4"></i>
          </div>
          <div>
            <h4 class="fw-bold mb-0 text-body">Gestión de Usuarios y Portales</h4>
            <small class="text-muted">Crea credenciales, asigna roles y configura los portales autorizados por cada usuario.</small>
          </div>
        </div>
      </div>

      <div class="gu-grid">
        <!-- Formulario de Creación / Provisionamiento -->
        <form class="gu-form shadow-sm" id="gu-form" autocomplete="off">
          <h5 class="gu-card-title"><i class="bi bi-person-plus-fill text-primary me-2"></i>Provisionar Acceso</h5>

          <div class="gu-section mb-3">
            <label class="form-label small fw-semibold">Origen del usuario</label>
            <div class="gu-segment" role="radiogroup" aria-label="Origen del usuario">
              <label class="gu-segment-option">
                <input type="radio" name="gu-source-mode" id="gu-source-mode-maestro" value="maestro" checked>
                <span>Maestro existente</span>
              </label>
              <label class="gu-segment-option">
                <input type="radio" name="gu-source-mode" id="gu-source-mode-manual" value="manual">
                <span>Usuario manual</span>
              </label>
            </div>
          </div>

          <div class="mb-3" id="gu-maestro-group">
            <label class="form-label small fw-semibold">Seleccionar maestro</label>
            <select class="form-select form-select-sm" id="gu-maestro-select">
              <option value="">Selecciona un maestro...</option>
            </select>
            <small class="text-muted d-block mt-1" style="font-size:0.75rem;" id="gu-maestro-help">Los maestros con acceso creado aparecen deshabilitados.</small>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Nombre completo</label>
            <input type="text" class="form-control form-control-sm" id="gu-nombre" placeholder="Ej. Ana Pérez" required>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Correo electrónico</label>
            <input type="email" class="form-control form-control-sm" id="gu-email" placeholder="correo@ejemplo.com" required>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Rol principal</label>
            <select class="form-select form-select-sm" id="gu-rol">
              ${ROLES_USUARIO.map((rol) => `<option value="${rol}" ${rol === 'maestro' ? 'selected' : ''}>${_formatRol(rol)}</option>`).join('')}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold d-flex justify-content-between align-items-center">
              <span>Portales permitidos</span>
              <small class="text-muted" style="font-size:0.72rem;">(Suma al rol base)</small>
            </label>
            <div class="gu-portales-checkboxes" id="gu-portales-checkboxes">
              <div class="text-muted small p-2">Cargando catálogo...</div>
            </div>
          </div>

          <div class="gu-section mb-3">
            <label class="form-label small fw-semibold">Modo de contraseña</label>
            <div class="gu-segment" role="radiogroup" aria-label="Modo de contraseña">
              <label class="gu-segment-option">
                <input type="radio" name="gu-password-mode" id="gu-password-mode-auto" value="auto" checked>
                <span>Automática</span>
              </label>
              <label class="gu-segment-option">
                <input type="radio" name="gu-password-mode" id="gu-password-mode-manual" value="manual">
                <span>Manual</span>
              </label>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Contraseña temporal</label>
            <div class="input-group input-group-sm">
              <input type="password" class="form-control" id="gu-password" placeholder="Mínimo 8 caracteres" required minlength="8">
              <button class="btn btn-outline-secondary" type="button" id="gu-toggle-pass" aria-label="Mostrar u ocultar contraseña">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-primary" type="button" id="gu-regenerate-pass">
                <i class="bi bi-magic me-1"></i> Generar
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-sm w-100 py-2 fw-semibold" id="gu-submit">
            <span class="gu-submit-text"><i class="bi bi-check-circle me-1"></i> Crear y Asignar Usuario</span>
            <span class="gu-submit-loading d-none">
              <span class="spinner-border spinner-border-sm me-2"></span>Creando...
            </span>
          </button>
        </form>

        <!-- Columna Derecha: Credenciales y Listado de Usuarios -->
        <div class="gu-side-stack">
          <!-- Credenciales Creadas en Sesión -->
          <div class="gu-list-card shadow-sm">
            <div class="gu-side-header">
              <h5 class="gu-card-title mb-0"><i class="bi bi-key-fill text-warning me-2"></i>Credenciales Creadas</h5>
              <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2">Esta sesión</span>
            </div>
            <div id="gu-credenciales-list">
              <p class="text-muted small m-0 p-3 text-center">Todavía no has creado credenciales en esta sesión.</p>
            </div>
          </div>

          <!-- Listado y Administración de Usuarios -->
          <div class="gu-list-card shadow-sm">
            <div class="gu-side-header flex-wrap gap-2">
              <div>
                <h5 class="gu-card-title mb-0"><i class="bi bi-people-fill text-info me-2"></i>Usuarios Registrados</h5>
                <small class="text-muted" style="font-size:0.75rem;">Gestiona roles y portales de cada cuenta</small>
              </div>
              <div class="d-flex align-items-center gap-1.5 flex-wrap">
                <select class="form-select form-select-sm" id="gu-user-filter" style="width: auto; font-size:0.78rem;">
                  <option value="all">Todos los roles</option>
                  <option value="superadmin">SuperAdmin</option>
                  <option value="admin">Administradores</option>
                  <option value="direccion">Dirección</option>
                  <option value="coordinacion_academica">Coord. Académica</option>
                  <option value="maestro">Maestros</option>
                  <option value="finanzas">Finanzas</option>
                  <option value="operaciones">Operaciones</option>
                  <option value="user">Usuarios base</option>
                </select>
              </div>
            </div>

            <!-- Buscador Rápido de Usuarios -->
            <div class="mb-2">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-body-tertiary border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="search" class="form-control border-start-0" id="gu-user-search" placeholder="Buscar por nombre o correo...">
              </div>
            </div>

            <div id="gu-usuarios-list">
              <div class="d-flex justify-content-center p-4"><div class="spinner-border text-primary spinner-border-sm me-2"></div><span class="small text-muted">Cargando usuarios...</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Asignación de Portales -->
      <div class="gu-modal-backdrop d-none" id="gu-portales-modal">
        <div class="gu-modal-card shadow-lg">
          <div class="gu-modal-header">
            <h5 class="m-0 fw-bold"><i class="bi bi-door-open-fill me-2 text-primary"></i> Asignar Portales</h5>
            <button type="button" class="btn-close" id="gu-close-modal" aria-label="Cerrar"></button>
          </div>
          <div class="gu-modal-body">
            <div class="gu-user-summary mb-3 p-2.5 rounded-3 bg-body-tertiary border">
              <div class="fw-bold text-body" id="gu-modal-user-name">—</div>
              <div class="small text-muted" id="gu-modal-user-email">—</div>
              <div class="small mt-1 d-flex align-items-center gap-2">
                <span>Rol: <span class="badge bg-primary" id="gu-modal-user-rol">—</span></span>
              </div>
            </div>
            <p class="small text-muted mb-2">Selecciona qué portales tiene permitido abrir este usuario:</p>
            <div class="gu-modal-portales-list" id="gu-modal-portales-list">
              <!-- Checkboxes generados dinámicamente -->
            </div>
          </div>
          <div class="gu-modal-footer">
            <button type="button" class="btn btn-outline-secondary btn-sm" id="gu-cancel-modal">Cancelar</button>
            <button type="button" class="btn btn-primary btn-sm" id="gu-save-portales">
              <i class="bi bi-check2 me-1"></i> Guardar Portales
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

function _bindEvents(container) {
  const form = container.querySelector('#gu-form')
  const toggle = container.querySelector('#gu-toggle-pass')
  const regenerateBtn = container.querySelector('#gu-regenerate-pass')
  const maestroSelect = container.querySelector('#gu-maestro-select')
  const filterSelect = container.querySelector('#gu-user-filter')
  const searchInput = container.querySelector('#gu-user-search')
  const rolSelect = container.querySelector('#gu-rol')

  container.querySelectorAll('input[name="gu-source-mode"]').forEach((input) => {
    input.addEventListener('change', () => {
      const state = _getState(container)
      state.sourceMode = container.querySelector('input[name="gu-source-mode"]:checked')?.value || DEFAULT_SOURCE_MODE
      _applySourceState(container)
    })
  })

  container.querySelectorAll('input[name="gu-password-mode"]').forEach((input) => {
    input.addEventListener('change', () => {
      const state = _getState(container)
      state.passwordMode = container.querySelector('input[name="gu-password-mode"]:checked')?.value || DEFAULT_PASSWORD_MODE
      _updatePasswordModeUI(container)
    })
  })

  rolSelect?.addEventListener('change', () => {
    _syncRolePortalDefaults(container)
  })

  maestroSelect?.addEventListener('change', () => _applySelectedMaestro(container))
  filterSelect?.addEventListener('change', () => _renderUsuariosList(container))
  searchInput?.addEventListener('input', () => _renderUsuariosList(container))

  regenerateBtn?.addEventListener('click', () => {
    container.querySelector('#gu-password').value = _generatePassword()
  })

  toggle?.addEventListener('click', () => {
    const passInput = container.querySelector('#gu-password')
    const isPwd = passInput.type === 'password'
    passInput.type = isPwd ? 'text' : 'password'
    toggle.innerHTML = isPwd ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>'
  })

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()
    await _handleCreate(container)
  })

  // Modal events
  container.querySelector('#gu-close-modal')?.addEventListener('click', () => _closeModal(container))
  container.querySelector('#gu-cancel-modal')?.addEventListener('click', () => _closeModal(container))
  container.querySelector('#gu-save-portales')?.addEventListener('click', async () => await _handleSaveModalPortales(container))
}

async function _loadInitialData(container) {
  const state = _getState(container)

  try {
    const [maestros, usuarios, catalog] = await Promise.all([
      obtenerMaestros().catch(() => []),
      listarUsuarios().catch((err) => {
        console.warn('Error listando usuarios:', err)
        return []
      }),
      getPortalCatalog().catch(() => [])
    ])
    state.maestros = Array.isArray(maestros) ? maestros : []
    state.usuarios = Array.isArray(usuarios) ? usuarios : []
    state.portalesCatalogo = Array.isArray(catalog) ? catalog : []
  } catch (error) {
    AppToast.error(error.message || 'No se pudo cargar la configuración de usuarios')
  }

  _renderFormPortales(container)
  _renderMaestrosSelect(container)
  _renderUsuariosList(container)
  _applySourceState(container)
  _syncRolePortalDefaults(container)
}

function _renderFormPortales(container) {
  const state = _getState(container)
  const wrapper = container.querySelector('#gu-portales-checkboxes')
  if (!wrapper) return

  if (!state.portalesCatalogo.length) {
    wrapper.innerHTML = '<div class="text-muted small p-2">Catálogo no disponible</div>'
    return
  }

  wrapper.innerHTML = `
    <div class="gu-portales-grid">
      ${state.portalesCatalogo.map(p => `
        <label class="gu-portal-chip" for="chk-${_esc(p.portal_id)}">
          <input type="checkbox" name="gu-form-portal" value="${_esc(p.portal_id)}" id="chk-${_esc(p.portal_id)}">
          <span><i class="bi ${_esc(p.icono || 'bi-door-open')} me-1 text-primary"></i>${_esc(p.nombre)}</span>
        </label>
      `).join('')}
    </div>
  `
}

function _syncRolePortalDefaults(container) {
  const state = _getState(container)
  const rol = container.querySelector('#gu-rol')?.value
  if (!rol || !state.portalesCatalogo.length) return

  const defaultPortalIds = new Set(
    state.portalesCatalogo
      .filter(p => Array.isArray(p.roles_default) && p.roles_default.includes(rol))
      .map(p => p.portal_id)
  )

  container.querySelectorAll('input[name="gu-form-portal"]').forEach(chk => {
    if (defaultPortalIds.has(chk.value)) {
      chk.checked = true
    } else {
      chk.checked = false
    }
  })
}

async function _refreshUsuarios(container) {
  const state = _getState(container)
  try {
    state.usuarios = await listarUsuarios()
  } catch (err) {
    console.error('Error refrescando usuarios:', err)
  }
  _renderUsuariosList(container)
}

function _applySourceState(container) {
  const state = _getState(container)
  const nombreInput = container.querySelector('#gu-nombre')
  const emailInput = container.querySelector('#gu-email')
  const rolSelect = container.querySelector('#gu-rol')

  _updateSourceModeUI(container)

  if (state.sourceMode === 'maestro') {
    nombreInput.readOnly = true
    emailInput.readOnly = true
    rolSelect.value = 'maestro'
    _applySelectedMaestro(container)
    _syncRolePortalDefaults(container)
    return
  }

  nombreInput.readOnly = false
  emailInput.readOnly = false
  container.querySelector('#gu-maestro-select').value = ''
  nombreInput.value = ''
  emailInput.value = ''
  rolSelect.value = DEFAULT_ROLE_BY_SOURCE.manual
  _syncRolePortalDefaults(container)
}

function _updateSourceModeUI(container) {
  const state = _getState(container)
  const maestroGroup = container.querySelector('#gu-maestro-group')
  maestroGroup?.classList.toggle('d-none', state.sourceMode !== 'maestro')
}

function _applySelectedMaestro(container) {
  const state = _getState(container)
  const maestroId = container.querySelector('#gu-maestro-select')?.value
  const nombreInput = container.querySelector('#gu-nombre')
  const emailInput = container.querySelector('#gu-email')

  if (!maestroId) {
    if (nombreInput) nombreInput.value = ''
    if (emailInput) emailInput.value = ''
    return
  }

  const maestro = state.maestros.find((item) => item.id === maestroId)
  if (maestro) {
    if (nombreInput) nombreInput.value = maestro.nombre || maestro.nombre_completo || ''
    if (emailInput) emailInput.value = maestro.email || maestro.correo || ''
  }
}

function _updatePasswordModeUI(container) {
  const state = _getState(container)
  const passInput = container.querySelector('#gu-password')
  const regenerateBtn = container.querySelector('#gu-regenerate-pass')

  if (state.passwordMode === 'auto') {
    if (passInput) {
      passInput.value = _generatePassword()
      passInput.readOnly = true
    }
    regenerateBtn?.classList.remove('d-none')
  } else {
    if (passInput) {
      passInput.value = ''
      passInput.readOnly = false
    }
    regenerateBtn?.classList.add('d-none')
  }
}

async function _handleCreate(container) {
  const state = _getState(container)
  const nombre = container.querySelector('#gu-nombre').value.trim()
  const email = container.querySelector('#gu-email').value.trim().toLowerCase()
  const password = container.querySelector('#gu-password').value
  const rol = container.querySelector('#gu-rol').value
  const maestroId = container.querySelector('#gu-maestro-select')?.value

  const selectedPortales = Array.from(container.querySelectorAll('input[name="gu-form-portal"]:checked')).map(el => el.value)

  if (!nombre || !email || !password) {
    AppToast.error('Completa nombre, email y contraseña')
    return
  }

  if (password.length < 8) {
    AppToast.error('La contraseña debe tener al menos 8 caracteres')
    return
  }

  const existingUser = state.usuarios.find((user) => String(user.email || '').toLowerCase() === email)
  if (existingUser) {
    AppToast.error('Ya existe un usuario con ese correo')
    return
  }

  if (state.sourceMode === 'maestro') {
    const maestro = state.maestros.find((item) => item.id === maestroId)
    if (!maestro) {
      AppToast.error('Debes seleccionar un maestro')
      return
    }
    if (maestro.user_id) {
      AppToast.error('Ese maestro ya tiene acceso asociado')
      return
    }
  }

  _setLoading(container, true)
  try {
    const user = await crearUsuario({ nombre, email, password, rol, portales: selectedPortales })
    const recientes = _getState(container).credencialesRecientes
    recientes.unshift({
      id: user.id || `${email}-${Date.now()}`,
      nombre,
      email,
      password,
      rol: user.rol || rol,
      estado: user.estado || 'activo',
    })

    _updateRecientesList(container)
    await _refreshUsuarios(container)

    if (selectedPortales.length > 0 && user.portalesResult?.success === false) {
      AppToast.warning(`Usuario ${user.email} creado, pero hubo un detalle al asignar portales: ${user.portalesResult.error || 'Revisa la asignación'}.`)
    } else {
      const count = user.portalesResult?.assigned_count ?? selectedPortales.length
      AppToast.success(`Usuario ${user.email} creado como ${_formatRol(user.rol)}${count > 0 ? ` con ${count} portales asignados` : ''}.`)
    }

    if (state.sourceMode === 'manual') {
      container.querySelector('#gu-form').reset()
      container.querySelector('#gu-source-mode-manual').checked = true
      state.sourceMode = 'manual'
    }

    container.querySelector('#gu-password-mode-auto').checked = true
    state.passwordMode = 'auto'
    _applySourceState(container)
    _updatePasswordModeUI(container)
  } catch (error) {
    AppToast.error(error.message || 'Error al crear el usuario')
  } finally {
    _setLoading(container, false)
  }
}

function _renderMaestrosSelect(container) {
  const state = _getState(container)
  const select = container.querySelector('#gu-maestro-select')
  if (!select) return

  const options = state.maestros
    .map((maestro) => {
      const hasAccess = Boolean(maestro.user_id)
      const label = `${_esc(maestro.nombre || maestro.nombre_completo || 'Sin nombre')} · ${_esc(maestro.email || maestro.correo || 'Sin correo')}${hasAccess ? ' · acceso creado' : ''}`
      return `<option value="${_esc(maestro.id)}" ${hasAccess ? 'disabled' : ''}>${label}</option>`
    })
    .join('')

  select.innerHTML = `<option value="">Selecciona un maestro...</option>${options}`
}

function _renderUsuariosList(container) {
  const state = _getState(container)
  const listEl = container.querySelector('#gu-usuarios-list')
  if (!listEl) return

  const filter = container.querySelector('#gu-user-filter')?.value || 'all'
  const search = (container.querySelector('#gu-user-search')?.value || '').trim().toLowerCase()

  const users = state.usuarios.filter((user) => {
    const matchRole = filter === 'all' ? true : user.rol === filter
    const matchSearch = !search || 
      (user.nombre_completo || '').toLowerCase().includes(search) || 
      (user.email || '').toLowerCase().includes(search)
    return matchRole && matchSearch
  })

  if (!users.length) {
    listEl.innerHTML = `<p class="text-muted small m-0 p-3 text-center">No hay usuarios para el filtro seleccionado.</p>`
    return
  }

  listEl.innerHTML = `
    <ul class="gu-admin-items">
      ${users
        .map(
          (user) => {
            const count = (user.portales_asignados || []).length
            const isSuper = user.rol === 'superadmin'
            return `
              <li class="gu-admin-item">
                <div class="gu-admin-avatar"><i class="bi bi-person-fill"></i></div>
                <div class="gu-admin-info">
                  <span class="gu-admin-name">${_esc(user.nombre_completo) || '—'}</span>
                  <span class="gu-admin-email">${_esc(user.email)}</span>
                </div>
                <div class="gu-user-meta">
                  <div class="d-flex align-items-center gap-1">
                    <button type="button" class="btn btn-xs btn-outline-secondary gu-btn-cambiar-rol" data-user-id="${_esc(user.id)}" data-user-rol="${_esc(user.rol)}" title="Modificar rol">
                      <span class="gu-role-badge">${_esc(_formatRol(user.rol))}</span>
                      <i class="bi bi-pencil ms-1" style="font-size:0.65rem;"></i>
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-primary gu-btn-portales" data-user-id="${_esc(user.id)}" title="Configurar portales">
                      <i class="bi bi-door-open me-1"></i>
                      ${isSuper ? 'Todos (Super)' : (count > 0 ? `${count} portales` : 'Def. Rol')}
                    </button>
                  </div>
                  <div class="d-flex align-items-center gap-1.5 mt-1">
                    <span class="gu-admin-badge gu-admin-badge--${user.estado === 'activo' ? 'active' : 'pending'}">
                      <i class="bi ${user.estado === 'activo' ? 'bi-check-circle-fill' : 'bi-pause-circle-fill'} me-1"></i>${_esc(user.estado || 'activo')}
                    </span>
                    <button type="button" class="btn btn-link p-0 text-muted gu-btn-toggle-estado" data-user-id="${_esc(user.id)}" data-user-estado="${_esc(user.estado || 'activo')}" title="Cambiar estado" style="font-size:0.7rem; text-decoration:none;">
                      [${user.estado === 'activo' ? 'Desactivar' : 'Activar'}]
                    </button>
                  </div>
                </div>
              </li>
            `
          }
        )
        .join('')}
    </ul>
  `

  // Portales modal trigger
  listEl.querySelectorAll('.gu-btn-portales').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.userId
      _openPortalesModal(container, userId)
    })
  })

  // Role change trigger
  listEl.querySelectorAll('.gu-btn-cambiar-rol').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.userId
      const currentRol = btn.dataset.userRol
      _openCambiarRolModal(container, userId, currentRol)
    })
  })

  // Status toggle trigger
  listEl.querySelectorAll('.gu-btn-toggle-estado').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId
      const currentEstado = btn.dataset.userEstado
      const nextEstado = currentEstado === 'activo' ? 'inactivo' : 'activo'
      try {
        await actualizarEstadoUsuario(userId, nextEstado)
        AppToast.success(`Estado actualizado a "${nextEstado}"`)
        const u = state.usuarios.find(x => x.id === userId)
        if (u) u.estado = nextEstado
        _renderUsuariosList(container)
      } catch (err) {
        AppToast.error(err.message || 'No se pudo cambiar el estado')
      }
    })
  })
}

function _openCambiarRolModal(container, userId, currentRol) {
  const state = _getState(container)
  const user = state.usuarios.find(u => u.id === userId)
  if (!user) return

  let rolSeleccionado = currentRol

  const bodyHTML = `
    <div class="mb-3">
      <label class="form-label small fw-semibold">Usuario</label>
      <div class="form-control-plaintext fw-bold">${_esc(user.nombre_completo || user.email)}</div>
      <div class="small text-muted">${_esc(user.email)}</div>
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold">Nuevo Rol</label>
      <select class="form-select" id="gu-nuevo-rol-select">
        ${ROLES_USUARIO.map(r => `
          <option value="${_esc(r)}" ${r === currentRol ? 'selected' : ''}>${_formatRol(r)}</option>
        `).join('')}
      </select>
      <div class="form-text mt-1">Al cambiar el rol, los accesos por defecto del nuevo rol aplicarán automáticamente.</div>
    </div>
  `

  AppModal.open({
    title: 'Cambiar Rol de Usuario',
    size: 'sm',
    saveText: 'Actualizar Rol',
    body: bodyHTML,
    onShow: (body) => {
      const select = body.querySelector('#gu-nuevo-rol-select')
      select?.addEventListener('change', () => {
        rolSeleccionado = select.value
      })
    },
    onSave: async () => {
      if (!rolSeleccionado) return false
      try {
        await actualizarRolUsuario(userId, rolSeleccionado)
        AppToast.success(`Rol de ${user.email} actualizado a "${_formatRol(rolSeleccionado)}"`)
        user.rol = rolSeleccionado
        _renderUsuariosList(container)
        return true
      } catch (err) {
        AppToast.error(err.message || 'No se pudo actualizar el rol')
        return false
      }
    }
  })
}

async function _openPortalesModal(container, userId) {
  const state = _getState(container)
  const user = state.usuarios.find(u => u.id === userId)
  if (!user) return

  state.activeModalUser = user
  const modal = container.querySelector('#gu-portales-modal')
  
  container.querySelector('#gu-modal-user-name').textContent = user.nombre_completo || user.email
  container.querySelector('#gu-modal-user-email').textContent = user.email
  container.querySelector('#gu-modal-user-rol').textContent = _formatRol(user.rol)

  const portalesListEl = container.querySelector('#gu-modal-portales-list')
  portalesListEl.innerHTML = '<div class="text-muted small p-3 text-center"><div class="spinner-border spinner-border-sm me-2"></div>Consultando permisos actuales...</div>'
  modal.classList.remove('d-none')

  try {
    const assignedIds = await getAssignedPortalIds(userId)
    const assignedSet = new Set(assignedIds.map(id => id.toUpperCase()))

    portalesListEl.innerHTML = `
      <div class="gu-modal-portales-grid">
        ${state.portalesCatalogo.map(p => {
          const isAssigned = assignedSet.has(p.portal_id.toUpperCase())
          const isRoleDefault = Array.isArray(p.roles_default) && p.roles_default.includes(user.rol)
          return `
            <label class="gu-modal-portal-item ${isAssigned ? 'is-active' : ''}">
              <div class="form-check m-0">
                <input class="form-check-input gu-modal-chk" type="checkbox" value="${_esc(p.portal_id)}" id="chk-m-${_esc(p.portal_id)}" ${isAssigned ? 'checked' : ''}>
                <label class="form-check-label ms-2" for="chk-m-${_esc(p.portal_id)}">
                  <div class="fw-bold text-body"><i class="bi ${_esc(p.icono || 'bi-door-open')} text-primary me-1"></i> ${_esc(p.nombre)}</div>
                  <div class="small text-muted">${_esc(p.descripcion || '')} ${isRoleDefault ? '· <span class="badge bg-success-subtle text-success border border-success-subtle ms-1" style="font-size:0.65rem;">Rol base</span>' : ''}</div>
                </label>
              </div>
            </label>
          `
        }).join('')}
      </div>
    `
  } catch (err) {
    portalesListEl.innerHTML = `<div class="text-danger small p-3 text-center">Error al cargar portales: ${err.message}</div>`
  }
}

function _closeModal(container) {
  const modal = container.querySelector('#gu-portales-modal')
  modal?.classList.add('d-none')
  _getState(container).activeModalUser = null
}

async function _handleSaveModalPortales(container) {
  const state = _getState(container)
  const user = state.activeModalUser
  if (!user) return

  const selectedPortalIds = Array.from(
    container.querySelectorAll('#gu-modal-portales-list input.gu-modal-chk:checked')
  ).map(chk => chk.value)

  const saveBtn = container.querySelector('#gu-save-portales')
  saveBtn.disabled = true
  saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Guardando...'

  try {
    const res = await setUserPortales(user.id, selectedPortalIds)
    if (res.success) {
      AppToast.success(`Portales actualizados para ${user.email}`)
      user.portales_asignados = selectedPortalIds
      _closeModal(container)
      _renderUsuariosList(container)
    } else {
      AppToast.error(res.error || 'Error al guardar portales')
    }
  } catch (err) {
    AppToast.error(err.message || 'Error inesperado')
  } finally {
    saveBtn.disabled = false
    saveBtn.innerHTML = '<i class="bi bi-check2 me-1"></i> Guardar Portales'
  }
}

function _updateRecientesList(container) {
  const listEl = container.querySelector('#gu-credenciales-list')
  const recientes = _getState(container).credencialesRecientes

  if (!recientes.length) {
    listEl.innerHTML = `<p class="text-muted small m-0 p-3 text-center">Todavía no has creado credenciales en esta sesión.</p>`
    return
  }

  listEl.innerHTML = `
    <ul class="gu-credential-items">
      ${recientes
        .map(
          (item) => `
        <li class="gu-credential-item">
          <div class="gu-credential-row">
            <strong>${_esc(item.nombre)}</strong>
            <span class="gu-role-badge">${_esc(_formatRol(item.rol))}</span>
          </div>
          <div class="gu-credential-field"><span>Usuario:</span><code>${_esc(item.email)}</code></div>
          <div class="gu-credential-field"><span>Clave:</span><code>${_esc(item.password)}</code></div>
        </li>
      `,
        )
        .join('')}
    </ul>
  `
}

function _setLoading(container, loading) {
  const btn = container.querySelector('#gu-submit')
  if (!btn) return
  btn.disabled = loading
  container.querySelector('.gu-submit-text')?.classList.toggle('d-none', loading)
  container.querySelector('.gu-submit-loading')?.classList.toggle('d-none', !loading)
}

function _generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
  const length = 12
  const array = new Uint32Array(length)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array)
    return Array.from(array, (num) => chars[num % chars.length]).join('')
  }
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function _getState(container) {
  return container.__guState || _createState()
}

function _formatRol(rol) {
  const labels = {
    superadmin: 'SuperAdmin',
    admin: 'Administrador',
    direccion: 'Dirección',
    coordinacion_academica: 'Coord. Académica',
    maestro: 'Maestro',
    monitor: 'Monitor',
    finanzas: 'Finanzas',
    operaciones: 'Operaciones',
    representante: 'Representante',
    alumno: 'Alumno',
    jurado: 'Jurado',
    user: 'Usuario Base',
  }
  return labels[rol] || rol || '—'
}

function _esc(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function _injectStyles() {
  if (document.getElementById('gu-custom-styles')) return
  const style = document.createElement('style')
  style.id = 'gu-custom-styles'
  style.textContent = `
    .gu-root { display: flex; flex-direction: column; gap: 1.25rem; }
    .gu-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 1.25rem; }
    @media (max-width: 991px) { .gu-grid { grid-template-columns: 1fr; } }
    
    .gu-form, .gu-list-card { 
      background: var(--bs-body-bg, #ffffff); 
      border: 1px solid var(--bs-border-color, #dee2e6); 
      border-radius: 14px; 
      padding: 1.25rem; 
      transition: background-color 0.2s, border-color 0.2s;
    }
    
    .gu-card-title { font-size: 1.05rem; font-weight: 700; color: var(--bs-body-color, #1e293b); }
    
    .gu-segment { 
      display: flex; 
      background: var(--bs-tertiary-bg, #f1f5f9); 
      border: 1px solid var(--bs-border-color, #dee2e6);
      border-radius: 9px; 
      padding: 3px; 
      gap: 3px; 
    }
    .gu-segment-option { flex: 1; text-align: center; cursor: pointer; margin: 0; }
    .gu-segment-option input { display: none; }
    .gu-segment-option span { 
      display: block; 
      padding: 6px 12px; 
      font-size: 0.82rem; 
      font-weight: 600; 
      border-radius: 7px; 
      color: var(--bs-secondary-color, #64748b); 
      transition: all 0.2s; 
    }
    .gu-segment-option input:checked + span { 
      background: var(--bs-body-bg, #fff); 
      color: var(--bs-primary, #0d6efd); 
      box-shadow: 0 1px 4px rgba(0,0,0,0.08); 
    }
    
    .gu-side-stack { display: flex; flex-direction: column; gap: 1.25rem; }
    .gu-side-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
    
    .gu-admin-items, .gu-credential-items { 
      list-style: none; 
      padding: 0; 
      margin: 0; 
      display: flex; 
      flex-direction: column; 
      gap: 0.65rem; 
      max-height: 440px; 
      overflow-y: auto; 
    }
    
    .gu-admin-item { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      padding: 0.75rem 0.85rem; 
      background: var(--bs-tertiary-bg, #f8fafc); 
      border-radius: 10px; 
      border: 1px solid var(--bs-border-color, #dee2e6); 
      transition: all 0.15s ease;
    }
    .gu-admin-item:hover {
      border-color: var(--bs-primary, #0d6efd);
    }
    
    .gu-admin-avatar { 
      width: 38px; 
      height: 38px; 
      border-radius: 50%; 
      background: var(--bs-primary-subtle, #e0e7ff); 
      color: var(--bs-primary, #4338ca); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 1.15rem; 
      flex-shrink: 0; 
    }
    
    .gu-admin-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .gu-admin-name { font-weight: 600; font-size: 0.88rem; color: var(--bs-body-color, #1e293b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gu-admin-email { font-size: 0.76rem; color: var(--bs-secondary-color, #64748b); }
    
    .gu-user-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
    .gu-role-badge { font-size: 0.72rem; padding: 2px 6px; background: var(--bs-primary-subtle, #e0f2fe); color: var(--bs-primary, #0369a1); border-radius: 4px; font-weight: 600; }
    
    .gu-admin-badge--active { font-size: 0.7rem; color: #198754; font-weight: 600; }
    .gu-admin-badge--pending { font-size: 0.7rem; color: #ffc107; font-weight: 600; }
    
    .btn-xs { padding: 2px 7px; font-size: 0.72rem; border-radius: 5px; }
    
    .gu-portales-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); 
      gap: 6px; 
      max-height: 140px; 
      overflow-y: auto; 
      padding: 6px; 
      background: var(--bs-tertiary-bg, #f8fafc); 
      border: 1px solid var(--bs-border-color, #dee2e6); 
      border-radius: 8px; 
    }
    
    .gu-portal-chip { 
      display: flex; 
      align-items: center; 
      gap: 6px; 
      font-size: 0.76rem; 
      padding: 4px 7px; 
      background: var(--bs-body-bg, #fff); 
      color: var(--bs-body-color);
      border: 1px solid var(--bs-border-color, #cbd5e1); 
      border-radius: 6px; 
      cursor: pointer; 
      margin: 0; 
      user-select: none; 
      transition: all 0.15s;
    }
    .gu-portal-chip:hover {
      border-color: var(--bs-primary);
    }
    
    .gu-credential-item {
      padding: 0.65rem 0.85rem;
      background: var(--bs-tertiary-bg, #f8fafc);
      border: 1px solid var(--bs-border-color, #dee2e6);
      border-radius: 8px;
      font-size: 0.82rem;
    }
    .gu-credential-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .gu-credential-field { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--bs-secondary-color); margin-top: 2px; }
    .gu-credential-field code { font-size: 0.78rem; padding: 1px 4px; border-radius: 4px; background: rgba(0,0,0,0.06); }
    [data-bs-theme="dark"] .gu-credential-field code { background: rgba(255,255,255,0.1); }
    
    /* Modal Styles */
    .gu-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; }
    .gu-modal-card { background: var(--bs-body-bg, #fff); color: var(--bs-body-color); border: 1px solid var(--bs-border-color, #dee2e6); border-radius: 14px; width: 100%; max-width: 520px; max-height: 85vh; display: flex; flex-direction: column; }
    .gu-modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6); display: flex; justify-content: space-between; align-items: center; }
    .gu-modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
    .gu-modal-footer { padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6); display: flex; justify-content: flex-end; gap: 0.5rem; }
    .gu-modal-portales-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .gu-modal-portal-item { display: block; padding: 0.65rem 0.85rem; border: 1px solid var(--bs-border-color, #dee2e6); background: var(--bs-body-bg); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
    .gu-modal-portal-item:hover { background: var(--bs-tertiary-bg, #f8fafc); border-color: var(--bs-primary); }
    .gu-modal-portal-item.is-active { background: var(--bs-primary-subtle, #eff6ff); border-color: var(--bs-primary); }

    /* Dark Mode Overrides */
    [data-bs-theme="dark"] .gu-form,
    [data-bs-theme="dark"] .gu-list-card,
    [data-bs-theme="dark"] .gu-modal-card {
      background: #1c1c1e !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    [data-bs-theme="dark"] .gu-admin-item,
    [data-bs-theme="dark"] .gu-credential-item,
    [data-bs-theme="dark"] .gu-portales-grid,
    [data-bs-theme="dark"] .gu-segment {
      background: #2c2c2e !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
    }

    [data-bs-theme="dark"] .gu-portal-chip {
      background: #3a3a3c !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
      color: #f5f5f7 !important;
    }

    [data-bs-theme="dark"] .gu-segment-option input:checked + span {
      background: #3a3a3c !important;
      color: #38bdf8 !important;
    }

    [data-bs-theme="dark"] .gu-modal-portal-item {
      background: #2c2c2e !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }

    [data-bs-theme="dark"] .gu-modal-portal-item.is-active {
      background: rgba(14, 165, 233, 0.15) !important;
      border-color: #0ea5e9 !important;
    }
  `
  document.head.appendChild(style)
}
