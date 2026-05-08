import { Modal, Toast } from 'bootstrap'
import { useAuth } from '../hooks/useAuth.js'
import { router } from '../../../core/router/router.js'
import { CompactUI } from '../../../shared/utils/compactUI.js'

const state = {
  loading: false,
}

const PASSWORD_REQUIREMENTS = [
  { test: (p) => p.length >= 8, message: 'Mínimo 8 caracteres' },
  { test: (p) => /[A-Z]/.test(p), message: 'Al menos 1 mayúscula' },
  { test: (p) => /[0-9]/.test(p), message: 'Al menos 1 número' },
  { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), message: 'Al menos 1 símbolo' },
]

export function renderRegisterView(container) {
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
              <i class="bi bi-person-plus-fill"></i>
            </div>
            <h4 class="auth-title">Crear Cuenta</h4>
            <p class="auth-subtitle">Regístrate para comenzar</p>
          </div>

          <form id="registerForm" class="auth-form">
            <div class="mb-3">
              <label class="form-label-compact">Nombre completo</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-person"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control input-dense" 
                  id="registerName" 
                  placeholder="Juan Pérez"
                  required
                  autocomplete="name"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-compact">Correo electrónico</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-envelope"></i>
                </span>
                <input 
                  type="email" 
                  class="form-control input-dense" 
                  id="registerEmail" 
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
                  id="registerPassword" 
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                >
                <button class="btn btn-outline-secondary input-dense" type="button" id="togglePassword">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
              <div class="password-requirements mt-2" id="passwordRequirements">
                ${renderPasswordRequirements('')}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-compact">Confirmar contraseña</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-lock-fill"></i>
                </span>
                <input 
                  type="password" 
                  class="form-control input-dense" 
                  id="registerConfirmPassword" 
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                >
              </div>
              <div class="invalid-feedback d-none" id="confirmPasswordError">
                Las contraseñas no coinciden
              </div>
            </div>

            <div class="mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="acceptTerms" required>
                <label class="form-check-label" for="acceptTerms">
                  Acepto los <a href="#" id="linkTerms" class="auth-link">términos y condiciones</a>
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm-compact w-100" id="btnRegister">
              <span class="btn-text">Crear cuenta</span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2"></span>Registrando...
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p class="mb-0">
              ¿Ya tienes cuenta?
              <a href="#" id="linkLogin" class="auth-link">Iniciar sesión</a>
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
        max-width: 420px;
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
      .auth-form .form-check-label .auth-link {
        color: var(--bs-primary);
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
      .password-requirements {
        font-size: 0.75rem;
      }
      .password-requirement {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-bottom: 0.25rem;
        color: var(--bs-secondary);
      }
      .password-requirement.valid {
        color: var(--bs-success);
      }
      .password-requirement.invalid {
        color: var(--bs-secondary);
      }
      .password-requirement i {
        font-size: 0.7rem;
      }
    </style>
  `
}

function renderPasswordRequirements(password) {
  return PASSWORD_REQUIREMENTS.map((req, index) => {
    const isValid = req.test(password)
    return `
      <div class="password-requirement ${isValid ? 'valid' : 'invalid'}" id="req-${index}">
        <i class="bi ${isValid ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
        <span>${req.message}</span>
      </div>
    `
  }).join('')
}

function attachEvents(container) {
  const form = document.getElementById('registerForm')
  const nameInput = document.getElementById('registerName')
  const emailInput = document.getElementById('registerEmail')
  const passwordInput = document.getElementById('registerPassword')
  const confirmPasswordInput = document.getElementById('registerConfirmPassword')
  const togglePassword = document.getElementById('togglePassword')
  const linkLogin = document.getElementById('linkLogin')

  passwordInput?.addEventListener('input', (e) => {
    const password = e.target.value
    updatePasswordRequirements(password)
    validateConfirmPassword()
  })

  confirmPasswordInput?.addEventListener('input', validateConfirmPassword)

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleRegister(container)
  })

  togglePassword?.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password'
    passwordInput.type = type
    confirmPasswordInput.type = type
    togglePassword.innerHTML = type === 'password' 
      ? '<i class="bi bi-eye"></i>' 
      : '<i class="bi bi-eye-slash"></i>'
  })

  linkLogin?.addEventListener('click', (e) => {
    e.preventDefault()
    router.navigate('login')
  })
}

function updatePasswordRequirements(password) {
  const container = document.getElementById('passwordRequirements')
  if (!container) return

  PASSWORD_REQUIREMENTS.forEach((req, index) => {
    const el = document.getElementById(`req-${index}`)
    if (el) {
      const isValid = req.test(password)
      el.className = `password-requirement ${isValid ? 'valid' : 'invalid'}`
      el.innerHTML = `
        <i class="bi ${isValid ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
        <span>${req.message}</span>
      `
    }
  })
}

function validateConfirmPassword() {
  const password = document.getElementById('registerPassword').value
  const confirmPassword = document.getElementById('registerConfirmPassword').value
  const errorEl = document.getElementById('confirmPasswordError')
  const confirmInput = document.getElementById('registerConfirmPassword')

  if (confirmPassword && password !== confirmPassword) {
    errorEl?.classList.remove('d-none')
    confirmInput?.classList.add('is-invalid')
    return false
  } else {
    errorEl?.classList.add('d-none')
    confirmInput?.classList.remove('is-invalid')
    return true
  }
}

function validatePassword(password) {
  return PASSWORD_REQUIREMENTS.every(req => req.test(password))
}

async function handleRegister(container) {
  const name = document.getElementById('registerName').value.trim()
  const email = document.getElementById('registerEmail').value.trim()
  const password = document.getElementById('registerPassword').value
  const confirmPassword = document.getElementById('registerConfirmPassword').value
  const acceptTerms = document.getElementById('acceptTerms').checked

  if (!name || !email || !password || !confirmPassword) {
    showToast('Por favor completa todos los campos', 'error', container)
    return
  }

  if (!validatePassword(password)) {
    showToast('La contraseña no cumple los requisitos', 'error', container)
    return
  }

  if (password !== confirmPassword) {
    showToast('Las contraseñas no coinciden', 'error', container)
    return
  }

  if (!acceptTerms) {
    showToast('Debes aceptar los términos y condiciones', 'error', container)
    return
  }

  state.loading = true
  updateButtonState(true)

  try {
    const result = await useAuth.register(email, password, { full_name: name })

    if (result.success) {
      if (result.needsConfirmation) {
        showToast(result.message, 'info', container)
        setTimeout(() => {
          router.navigate('login')
        }, 2000)
      } else {
        showToast('¡Cuenta creada exitosamente!', 'success', container)
        setTimeout(() => {
          router.navigate('programas')
        }, 500)
      }
    } else {
      showToast(result.error || 'Error al registrar', 'error', container)
    }
  } catch (error) {
    console.error('Register error:', error)
    showToast('Error de conexión', 'error', container)
  } finally {
    state.loading = false
    updateButtonState(false)
  }
}

function updateButtonState(loading) {
  const btn = document.getElementById('btnRegister')
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

  const toastId = 'toast-' + Date.now()
  const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : type === 'info' ? 'bg-info' : 'bg-warning'
  const iconClass = type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : type === 'info' ? 'bi-info-circle' : 'bi-exclamation-triangle'

  const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white">
        <i class="bi ${iconClass} me-2"></i>
        <strong class="me-auto">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : type === 'info' ? 'Información' : 'Advertencia'}</strong>
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

function escapeHTML(str) {
  if (!str) return ''
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))
}

export default { renderRegisterView }