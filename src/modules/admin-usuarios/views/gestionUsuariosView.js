/**
 * Vista "Gestión de Usuarios" del panel admin.
 * Permite a un administrador activo crear otros usuarios (admin o maestro)
 * directamente, sin auto-registro ni aprobación, vía la Edge Function create-user.
 */

import { crearUsuario, listarUsuariosPorRol } from '../api/adminUsuariosApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

export async function renderGestionUsuariosView(container) {
  container.innerHTML = `
    <div class="gu-root">
      <div class="pm-view-header">
        <h2><i class="bi bi-person-gear"></i> Gestión de Usuarios</h2>
        <p class="pm-view-subtitle">Creá administradores o maestros con acceso inmediato.</p>
      </div>

      <div class="gu-grid">
        <!-- Formulario de creación -->
        <form class="gu-form" id="gu-form" autocomplete="off">
          <h4 class="gu-card-title"><i class="bi bi-person-plus"></i> Nuevo usuario</h4>

          <div class="mb-3">
            <label class="form-label">Nombre completo</label>
            <input type="text" class="form-control" id="gu-nombre" placeholder="Ej. Ana Pérez" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" id="gu-email" placeholder="correo@ejemplo.com" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <div class="input-group">
              <input type="password" class="form-control" id="gu-password" placeholder="Mínimo 8 caracteres" required minlength="8">
              <button class="btn btn-outline-secondary" type="button" id="gu-toggle-pass">
                <i class="bi bi-eye"></i>
              </button>
            </div>
            <small class="text-muted">Comunicale esta contraseña al nuevo usuario.</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Rol</label>
            <select class="form-select" id="gu-rol">
              <option value="admin" selected>Administrador</option>
              <option value="maestro">Maestro</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-100" id="gu-submit">
            <span class="gu-submit-text"><i class="bi bi-check-circle me-1"></i> Crear usuario</span>
            <span class="gu-submit-loading d-none">
              <span class="spinner-border spinner-border-sm me-2"></span>Creando...
            </span>
          </button>
        </form>

        <!-- Lista de administradores -->
        <div class="gu-list-card">
          <h4 class="gu-card-title"><i class="bi bi-shield-check"></i> Administradores</h4>
          <div id="gu-admins-list">
            <div class="pm-loading"><div class="pm-spinner"></div><span>Cargando...</span></div>
          </div>
        </div>
      </div>
    </div>
  `

  _injectStyles()
  _bindForm(container)
  await _loadAdmins(container)
}

function _bindForm(container) {
  const form = container.querySelector('#gu-form')
  const toggle = container.querySelector('#gu-toggle-pass')
  const passInput = container.querySelector('#gu-password')

  toggle?.addEventListener('click', () => {
    const isPwd = passInput.type === 'password'
    passInput.type = isPwd ? 'text' : 'password'
    toggle.innerHTML = isPwd ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>'
  })

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await _handleCreate(container)
  })
}

async function _handleCreate(container) {
  const nombre = container.querySelector('#gu-nombre').value.trim()
  const email = container.querySelector('#gu-email').value.trim()
  const password = container.querySelector('#gu-password').value
  const rol = container.querySelector('#gu-rol').value

  if (!nombre || !email || !password) {
    AppToast.error('Completá nombre, email y contraseña')
    return
  }
  if (password.length < 8) {
    AppToast.error('La contraseña debe tener al menos 8 caracteres')
    return
  }

  _setLoading(container, true)
  try {
    const user = await crearUsuario({ nombre, email, password, rol })
    AppToast.success(`Usuario ${user.email} creado como ${user.rol}. Ya puede iniciar sesión.`)
    container.querySelector('#gu-form').reset()
    await _loadAdmins(container)
  } catch (err) {
    AppToast.error(err.message || 'Error al crear el usuario')
  } finally {
    _setLoading(container, false)
  }
}

function _setLoading(container, loading) {
  const btn = container.querySelector('#gu-submit')
  if (!btn) return
  btn.disabled = loading
  container.querySelector('.gu-submit-text')?.classList.toggle('d-none', loading)
  container.querySelector('.gu-submit-loading')?.classList.toggle('d-none', !loading)
}

async function _loadAdmins(container) {
  const listEl = container.querySelector('#gu-admins-list')
  if (!listEl) return
  try {
    const admins = await listarUsuariosPorRol('admin')
    if (!admins.length) {
      listEl.innerHTML = `<p class="text-muted m-0">No hay administradores registrados.</p>`
      return
    }
    listEl.innerHTML = `
      <ul class="gu-admin-items">
        ${admins
          .map(
            (a) => `
          <li class="gu-admin-item">
            <div class="gu-admin-avatar"><i class="bi bi-person-fill"></i></div>
            <div class="gu-admin-info">
              <span class="gu-admin-name">${_esc(a.nombre_completo) || '—'}</span>
              <span class="gu-admin-email">${_esc(a.email)}</span>
            </div>
            <span class="gu-admin-badge gu-admin-badge--${a.estado === 'activo' ? 'active' : 'pending'}">
              ${_esc(a.estado)}
            </span>
          </li>
        `,
          )
          .join('')}
      </ul>
    `
  } catch (err) {
    listEl.innerHTML = `<p class="text-danger m-0">Error al cargar administradores: ${_esc(err.message)}</p>`
  }
}

function _esc(value) {
  if (value == null) return ''
  const s = typeof value === 'string' ? value : String(value)
  return s.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m])
}

function _injectStyles() {
  if (document.getElementById('gu-styles')) return
  const s = document.createElement('style')
  s.id = 'gu-styles'
  s.textContent = `
  .gu-root { padding: 1.25rem 1rem 2rem; max-width: 980px; }
  .gu-grid {
    display: grid; gap: 1.25rem; margin-top: 1rem;
    grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
  }
  @media (max-width: 720px) { .gu-grid { grid-template-columns: 1fr; } }
  .gu-form, .gu-list-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 0.85rem; padding: 1.25rem;
  }
  .gu-card-title { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
  .gu-admin-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
  .gu-admin-item { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.7rem; border-radius: 0.6rem; background: rgba(255,255,255,0.03); }
  .gu-admin-avatar {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(124,58,237,0.18); color: #a78bfa;
  }
  .gu-admin-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
  .gu-admin-name { font-weight: 600; font-size: 0.9rem; }
  .gu-admin-email { font-size: 0.78rem; opacity: 0.65; }
  .gu-admin-badge { font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 999px; text-transform: capitalize; }
  .gu-admin-badge--active { background: rgba(34,197,94,0.18); color: #4ade80; }
  .gu-admin-badge--pending { background: rgba(245,158,11,0.18); color: #fbbf24; }
  `
  document.head.appendChild(s)
}

export default { renderGestionUsuariosView }
