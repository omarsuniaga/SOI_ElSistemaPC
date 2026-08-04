/**
 * Vista "Gestión de Usuarios" del panel admin.
 * Flujo MVP:
 * 1. Permite seleccionar un maestro existente y autocompletar identidad.
 * 2. También permite crear un usuario manual genérico.
 * 3. Muestra las credenciales temporales recién creadas en una columna lateral.
 */

import { ROLES_USUARIO, crearUsuario, listarUsuarios } from '../api/adminUsuariosApi.js'
import { obtenerMaestros } from '../../maestros/api/maestrosApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const DEFAULT_SOURCE_MODE = 'maestro'
const DEFAULT_PASSWORD_MODE = 'auto'
const DEFAULT_ROLE_BY_SOURCE = {
  maestro: 'maestro',
  manual: 'user',
}

export async function renderGestionUsuariosView(container) {
  const state = _createState()
  container.__guState = state

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
  }
}

function _renderLayout(state) {
  return `
    <div class="gu-root">
      <div class="pm-view-header">
        <h2><i class="bi bi-person-gear"></i> Gestión de Usuarios</h2>
        <p class="pm-view-subtitle">Asigna accesos desde maestros existentes o crea usuarios manuales con credenciales temporales.</p>
      </div>

      <div class="gu-grid">
        <form class="gu-form" id="gu-form" autocomplete="off">
          <h4 class="gu-card-title"><i class="bi bi-person-plus"></i> Provisionar acceso</h4>

          <div class="gu-section">
            <label class="form-label">Origen del usuario</label>
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
            <label class="form-label">Seleccionar maestro</label>
            <select class="form-select" id="gu-maestro-select">
              <option value="">Selecciona un maestro...</option>
            </select>
            <small class="text-muted" id="gu-maestro-help">Los maestros con acceso existente aparecen bloqueados para evitar duplicados.</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Nombre completo</label>
            <input type="text" class="form-control" id="gu-nombre" placeholder="Ej. Ana Pérez" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" id="gu-email" placeholder="correo@ejemplo.com" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Rol</label>
            <select class="form-select" id="gu-rol">
              ${ROLES_USUARIO.map((rol) => `<option value="${rol}" ${rol === 'maestro' ? 'selected' : ''}>${_formatRol(rol)}</option>`).join('')}
            </select>
          </div>

          <div class="gu-section">
            <label class="form-label">Modo de contraseña</label>
            <div class="gu-segment" role="radiogroup" aria-label="Modo de contraseña">
              <label class="gu-segment-option">
                <input type="radio" name="gu-password-mode" id="gu-password-mode-auto" value="auto" checked>
                <span>Automática</span>
              </label>
              <label class="gu-segment-option">
                <input type="radio" name="gu-password-mode" id="gu-password-mode-manual" value="manual">
                <span>Escribir manualmente</span>
              </label>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Contraseña temporal</label>
            <div class="input-group">
              <input type="password" class="form-control" id="gu-password" placeholder="Mínimo 8 caracteres" required minlength="8">
              <button class="btn btn-outline-secondary" type="button" id="gu-toggle-pass" aria-label="Mostrar u ocultar contraseña">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-primary" type="button" id="gu-regenerate-pass">
                <i class="bi bi-magic me-1"></i> Generar
              </button>
            </div>
            <small class="text-muted" id="gu-pass-help">La contraseña se mostrará también en el panel lateral después de crear el usuario.</small>
          </div>

          <button type="submit" class="btn btn-primary w-100" id="gu-submit">
            <span class="gu-submit-text"><i class="bi bi-check-circle me-1"></i> Crear usuario</span>
            <span class="gu-submit-loading d-none">
              <span class="spinner-border spinner-border-sm me-2"></span>Creando...
            </span>
          </button>
        </form>

        <div class="gu-side-stack">
          <div class="gu-list-card">
            <div class="gu-side-header">
              <h4 class="gu-card-title"><i class="bi bi-key"></i> Credenciales creadas</h4>
              <span class="gu-side-pill">Esta sesión</span>
            </div>
            <div id="gu-credenciales-list">
              <p class="text-muted m-0">Todavía no has creado credenciales en esta sesión.</p>
            </div>
          </div>

          <div class="gu-list-card">
            <div class="gu-side-header">
              <h4 class="gu-card-title"><i class="bi bi-people"></i> Usuarios del sistema</h4>
              <select class="form-select form-select-sm gu-filter-select" id="gu-user-filter">
                <option value="all">Todos</option>
                <option value="maestro">Maestros</option>
                <option value="admin">Administradores</option>
                <option value="user">Usuarios base</option>
              </select>
            </div>
            <div id="gu-usuarios-list">
              <div class="pm-loading"><div class="pm-spinner"></div><span>Cargando...</span></div>
            </div>
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

  maestroSelect?.addEventListener('change', () => _applySelectedMaestro(container))
  filterSelect?.addEventListener('change', () => _renderUsuariosList(container))

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
}

async function _loadInitialData(container) {
  const state = _getState(container)

  try {
    const [maestros, usuarios] = await Promise.all([obtenerMaestros(), listarUsuarios()])
    state.maestros = Array.isArray(maestros) ? maestros : []
    state.usuarios = Array.isArray(usuarios) ? usuarios : []
  } catch (error) {
    AppToast.error(error.message || 'No se pudo cargar la configuración de usuarios')
  }

  _renderMaestrosSelect(container)
  _renderUsuariosList(container)
  _applySourceState(container)
}

async function _refreshUsuarios(container) {
  const state = _getState(container)
  state.usuarios = await listarUsuarios()
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
    return
  }

  nombreInput.readOnly = false
  emailInput.readOnly = false
  container.querySelector('#gu-maestro-select').value = ''
  nombreInput.value = ''
  emailInput.value = ''
  rolSelect.value = DEFAULT_ROLE_BY_SOURCE.manual
}

function _updateSourceModeUI(container) {
  const state = _getState(container)
  const maestroGroup = container.querySelector('#gu-maestro-group')
  maestroGroup.classList.toggle('d-none', state.sourceMode !== 'maestro')
}

function _applySelectedMaestro(container) {
  const state = _getState(container)
  const maestroId = container.querySelector('#gu-maestro-select').value
  const maestro = state.maestros.find((item) => item.id === maestroId)
  const nombreInput = container.querySelector('#gu-nombre')
  const emailInput = container.querySelector('#gu-email')
  const rolSelect = container.querySelector('#gu-rol')

  if (!maestro) {
    nombreInput.value = ''
    emailInput.value = ''
    rolSelect.value = DEFAULT_ROLE_BY_SOURCE.maestro
    return
  }

  nombreInput.value = maestro.nombre || maestro.nombre_completo || ''
  emailInput.value = maestro.email || maestro.correo || ''
  rolSelect.value = 'maestro'
}

function _updatePasswordModeUI(container) {
  const state = _getState(container)
  const input = container.querySelector('#gu-password')
  const regenerateBtn = container.querySelector('#gu-regenerate-pass')

  if (state.passwordMode === 'auto') {
    input.readOnly = true
    input.value = _generatePassword()
    regenerateBtn.disabled = false
    return
  }

  input.readOnly = false
  input.value = ''
  regenerateBtn.disabled = true
}

async function _handleCreate(container) {
  const state = _getState(container)
  const nombre = container.querySelector('#gu-nombre').value.trim()
  const email = container.querySelector('#gu-email').value.trim().toLowerCase()
  const password = container.querySelector('#gu-password').value
  const rol = container.querySelector('#gu-rol').value
  const maestroId = container.querySelector('#gu-maestro-select').value

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
    AppToast.error('Ya existe un usuario con ese correo. Usa otro email o regenera credenciales por otra vía.')
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
    const user = await crearUsuario({ nombre, email, password, rol })
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
    AppToast.success(`Usuario ${user.email} creado como ${user.rol}. Ya puede iniciar sesión.`)

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
  const filter = container.querySelector('#gu-user-filter')?.value || 'all'
  const users = state.usuarios.filter((user) => filter === 'all' ? true : user.rol === filter)

  if (!users.length) {
    listEl.innerHTML = `<p class="text-muted m-0">No hay usuarios para el filtro seleccionado.</p>`
    return
  }

  listEl.innerHTML = `
    <ul class="gu-admin-items">
      ${users
        .map(
          (user) => `
        <li class="gu-admin-item">
          <div class="gu-admin-avatar"><i class="bi bi-person-fill"></i></div>
          <div class="gu-admin-info">
            <span class="gu-admin-name">${_esc(user.nombre_completo) || '—'}</span>
            <span class="gu-admin-email">${_esc(user.email)}</span>
          </div>
          <div class="gu-user-meta">
            <span class="gu-role-badge">${_esc(_formatRol(user.rol))}</span>
            <span class="gu-admin-badge gu-admin-badge--${user.estado === 'activo' ? 'active' : 'pending'}">
              ${_esc(user.estado)}
            </span>
          </div>
        </li>
      `,
        )
        .join('')}
    </ul>
  `
}

function _updateRecientesList(container) {
  const listEl = container.querySelector('#gu-credenciales-list')
  const recientes = _getState(container).credencialesRecientes

  if (!recientes.length) {
    listEl.innerHTML = `<p class="text-muted m-0">Todavía no has creado credenciales en esta sesión.</p>`
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
  btn.disabled = loading
  container.querySelector('.gu-submit-text')?.classList.toggle('d-none', loading)
  container.querySelector('.gu-submit-loading')?.classList.toggle('d-none', !loading)
}

function _generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  let result = ''
  for (let index = 0; index < 12; index += 1) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function _formatRol(rol) {
  const label = String(rol || 'user').replaceAll('_', ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function _esc(value) {
  if (value == null) return ''
  const s = typeof value === 'string' ? value : String(value)
  return s.replace(/[&<>"]/g, (match) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  })[match])
}

function _getState(container) {
  return container.__guState
}

function _injectStyles() {
  if (document.getElementById('gu-styles')) return
  const style = document.createElement('style')
  style.id = 'gu-styles'
  style.textContent = `
    .gu-root { padding: 1.25rem 1rem 2rem; max-width: 1180px; }
    .gu-grid {
      display: grid; gap: 1.25rem; margin-top: 1rem;
      grid-template-columns: minmax(320px, 1.1fr) minmax(320px, 0.9fr);
      align-items: start;
    }
    @media (max-width: 840px) { .gu-grid { grid-template-columns: 1fr; } }
    .gu-form, .gu-list-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 0.85rem;
      padding: 1.25rem;
    }
    .gu-side-stack { display: grid; gap: 1rem; }
    .gu-card-title {
      font-size: 1rem; font-weight: 600; margin-bottom: 1rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .gu-section { margin-bottom: 1rem; }
    .gu-segment {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.65rem;
    }
    .gu-segment-option {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.7rem 0.8rem; border-radius: 0.7rem;
      border: 1px solid rgba(255,255,255,0.08); cursor: pointer;
      background: rgba(255,255,255,0.03);
    }
    .gu-side-header { display: flex; justify-content: space-between; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
    .gu-side-header .gu-card-title { margin-bottom: 0; }
    .gu-side-pill {
      padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.72rem;
      background: rgba(59,130,246,0.18); color: #93c5fd;
    }
    .gu-filter-select { width: 170px; max-width: 100%; }
    .gu-admin-items, .gu-credential-items {
      list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;
    }
    .gu-admin-item {
      display: flex; align-items: center; gap: 0.7rem; padding: 0.75rem;
      border-radius: 0.6rem; background: rgba(255,255,255,0.03);
    }
    .gu-admin-avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(124,58,237,0.18); color: #a78bfa;
    }
    .gu-admin-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .gu-admin-name { font-weight: 600; font-size: 0.9rem; }
    .gu-admin-email { font-size: 0.78rem; opacity: 0.65; }
    .gu-admin-badge, .gu-role-badge {
      font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 999px;
      text-transform: capitalize; white-space: nowrap;
    }
    .gu-user-meta { display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-end; }
    .gu-role-badge { background: rgba(59,130,246,0.18); color: #93c5fd; }
    .gu-admin-badge--active { background: rgba(34,197,94,0.18); color: #4ade80; }
    .gu-admin-badge--pending { background: rgba(245,158,11,0.18); color: #fbbf24; }
    .gu-credential-item {
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
      border-radius: 0.75rem;
      padding: 0.8rem;
    }
    .gu-credential-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.75rem; margin-bottom: 0.5rem;
    }
    .gu-credential-field {
      display: flex; justify-content: space-between; gap: 0.75rem;
      font-size: 0.82rem; padding: 0.18rem 0;
    }
    .gu-credential-field span { opacity: 0.75; }
    .gu-credential-field code {
      background: rgba(15,23,42,0.55); padding: 0.1rem 0.3rem; border-radius: 0.35rem;
      color: #e2e8f0;
    }
  `
  document.head.appendChild(style)
}

export default { renderGestionUsuariosView }
