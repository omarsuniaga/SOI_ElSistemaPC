import { Modal, Toast } from 'bootstrap'
import { useAuth } from '../hooks/useAuth.js'
import { router } from '../../../core/router/router.js'
import { CompactUI } from '../../../shared/utils/compactUI.js'

const state = {
  loading: false,
}

export function renderLoginView(container) {
  CompactUI.injectStyles()
  renderContent(container)
  attachEvents(container)
}

function renderContent(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <h4 class="auth-title">Sistema Académico</h4>
            <p class="auth-subtitle">Ingresa a tu cuenta</p>
          </div>

          <form id="loginForm" class="auth-form">
            <div class="mb-3">
              <label class="form-label-compact">Correo electrónico</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-envelope"></i>
                </span>
                <input 
                  type="email" 
                  class="form-control input-dense" 
                  id="loginEmail" 
                  placeholder="correo@ejemplo.com"
                  required
                  autocomplete="email"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-compact">Contraseña</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-lock"></i>
                </span>
                <input 
                  type="password" 
                  class="form-control input-dense" 
                  id="loginPassword" 
                  placeholder="••••••••"
                  required
                  autocomplete="current-password"
                >
                <button class="btn btn-outline-secondary input-dense" type="button" id="togglePassword">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="rememberMe">
                <label class="form-check-label" for="rememberMe">
                  Recordar contraseña
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm-compact w-100" id="btnLogin">
              <span class="btn-text">Iniciar sesión</span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2"></span>Autenticando...
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p class="mb-0">
              ¿No tienes cuenta?
              <a href="#" id="linkRegister" class="auth-link">Regístrate aquí</a>
            </p>
          </div>
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>

    <style>
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--bs-primary) 0%, #1a365d 100%);
        padding: 1rem;
      }
      .auth-container {
        width: 100%;
        max-width: 400px;
      }
      .auth-card {
        background: var(--bs-body-bg);
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 2rem;
      }
      .auth-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .auth-logo {
        width: 60px;
        height: 60px;
        background: var(--bs-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.75rem;
        color: white;
      }
      .auth-title {
        margin-bottom: 0.25rem;
        font-weight: 600;
      }
      .auth-subtitle {
        color: var(--bs-secondary);
        font-size: 0.875rem;
        margin-bottom: 0;
      }
      .auth-form .input-group-text {
        border-right: none;
        background: var(--bs-body-bg);
      }
      .auth-form .form-control:focus {
        border-left: none;
      }
      .auth-form .form-check-label {
        font-size: 0.8rem;
      }
      .auth-footer {
        text-align: center;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--bs-border-color);
        font-size: 0.875rem;
      }
      .auth-link {
        color: var(--bs-primary);
        text-decoration: none;
        font-weight: 500;
      }
      .auth-link:hover {
        text-decoration: underline;
      }
    </style>
  `
}

function attachEvents(container) {
  const form = document.getElementById('loginForm')
  const emailInput = document.getElementById('loginEmail')
  const passwordInput = document.getElementById('loginPassword')
  const togglePassword = document.getElementById('togglePassword')
  const linkRegister = document.getElementById('linkRegister')

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = emailInput.value.trim()
    const password = passwordInput.value
    const remember = document.getElementById('rememberMe')?.checked || false
    await handleLogin(email, password, remember, container)
  })

  togglePassword?.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password'
    passwordInput.type = type
    togglePassword.innerHTML = type === 'password' 
      ? '<i class="bi bi-eye"></i>' 
      : '<i class="bi bi-eye-slash"></i>'
  })

  linkRegister?.addEventListener('click', (e) => {
    e.preventDefault()
    router.navigate('register')
  })
}

async function handleLogin(email, password, remember, container) {
  if (!email || !password) {
    showToast('Por favor ingresa email y contraseña', 'error', container)
    return
  }

  state.loading = true
  updateButtonState(true)

  try {
    const result = await useAuth.login(email, password, remember)

    if (result.success) {
      if (result.pendingApproval) {
        router.navigate('pending-approval')
        return
      }
      if (result.rejected) {
        showToast('Tu solicitud fue rechazada. Contactá al administrador.', 'error', container)
        return
      }
      showToast('¡Bienvenido!', 'success', container)
      setTimeout(() => {
        const intended = localStorage.getItem('intended-route')
        localStorage.removeItem('intended-route')
        router.navigate(intended || 'programas')
      }, 500)
    } else {
      showToast(result.error || 'Error al iniciar sesión', 'error', container)
    }
  } catch (error) {
    console.error('Login error:', error)
    showToast('Error de conexión', 'error', container)
  } finally {
    state.loading = false
    updateButtonState(false)
  }
}

function updateButtonState(loading) {
  const btn = document.getElementById('btnLogin')
  const btnText = btn?.querySelector('.btn-text')
  const btnLoading = btn?.querySelector('.btn-loading')

  if (!btn) return

  btn.disabled = loading

  if (loading) {
    btnText?.classList.add('d-none')
    btnLoading?.classList.remove('d-none')
  } else {
    btnText?.classList.remove('d-none')
    btnLoading?.classList.add('d-none')
  }
}

function showToast(message, type, container) {
  const toastContainer = document.getElementById('toastContainer')
  if (!toastContainer) return

  const msg = message && typeof message === 'object' ? message.message || message.error || JSON.stringify(message) : String(message || 'Error')
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
        ${msg}
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

function escapeHTML(str) {
  if (!str) return ''
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))
}

export default { renderLoginView }