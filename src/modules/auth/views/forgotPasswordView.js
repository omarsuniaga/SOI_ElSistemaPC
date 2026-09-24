import { Toast } from 'bootstrap'
import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { CompactUI } from '../../../shared/utils/compactUI.js'

export function renderForgotPasswordView(container) {
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
              <i class="bi bi-key-fill"></i>
            </div>
            <h4 class="auth-title">Recuperar contraseña</h4>
            <p class="auth-subtitle">Te enviamos un enlace para elegir una nueva</p>
          </div>

          <form id="forgotPasswordForm" class="auth-form">
            <div class="mb-3">
              <label class="form-label-compact">Correo electrónico</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  class="form-control input-dense"
                  id="forgotEmail"
                  placeholder="correo@ejemplo.com"
                  required
                  autocomplete="email"
                >
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm-compact w-100" id="btnForgotSubmit">
              <span class="btn-text">Enviar enlace de recuperación</span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2"></span>Enviando...
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p class="mb-0">
              <a href="#" id="linkBackToLogin" class="auth-link">Volver a iniciar sesión</a>
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
      .auth-container { width: 100%; max-width: 400px; }
      .auth-card {
        background: var(--bs-body-bg);
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 2rem;
      }
      .auth-header { text-align: center; margin-bottom: 1.5rem; }
      .auth-logo {
        width: 60px; height: 60px;
        background: var(--bs-primary);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.75rem; color: white;
      }
      .auth-title { margin-bottom: 0.25rem; font-weight: 600; }
      .auth-subtitle { color: var(--bs-secondary); font-size: 0.875rem; margin-bottom: 0; }
      .auth-form .input-group-text { border-right: none; background: var(--bs-body-bg); }
      .auth-form .form-control:focus { border-left: none; }
      .auth-footer {
        text-align: center; margin-top: 1.5rem; padding-top: 1.5rem;
        border-top: 1px solid var(--bs-border-color); font-size: 0.875rem;
      }
      .auth-link { color: var(--bs-primary); text-decoration: none; font-weight: 500; }
      .auth-link:hover { text-decoration: underline; }
    </style>
  `
}

function attachEvents(container) {
  const form = document.getElementById('forgotPasswordForm')
  const emailInput = document.getElementById('forgotEmail')
  const linkBackToLogin = document.getElementById('linkBackToLogin')

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleForgotPassword(emailInput.value.trim(), container)
  })

  linkBackToLogin?.addEventListener('click', (e) => {
    e.preventDefault()
    router.navigate('login')
  })
}

async function handleForgotPassword(email, container) {
  if (!email) {
    showToast('Ingresá tu correo electrónico', 'error', container)
    return
  }

  updateButtonState(true)

  try {
    // redirectTo apunta a la ruta reset-password dentro del mismo portal
    // (respeta el prefijo actual: /adm/reset-password, /acm/reset-password, etc.)
    const currentPath = window.location.pathname.replace(/\/[^/]*$/, '')
    const redirectTo = `${window.location.origin}${currentPath}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    // Nunca revelar si el correo existe o no (evita enumeración de cuentas) —
    // siempre mostrar el mismo mensaje de éxito, salvo error real de red/servicio.
    if (error && error.status && error.status >= 500) {
      showToast('No pudimos enviar el correo. Intentá de nuevo en unos minutos.', 'error', container)
      return
    }

    showToast(
      'Si el correo está registrado, vas a recibir un enlace para elegir una nueva contraseña.',
      'success',
      container,
    )
  } catch (error) {
    console.error('[ForgotPasswordView] Error:', error)
    showToast('Error de conexión. Intentá de nuevo.', 'error', container)
  } finally {
    updateButtonState(false)
  }
}

function updateButtonState(loading) {
  const btn = document.getElementById('btnForgotSubmit')
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
  const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info'
  const iconClass = type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'

  const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white">
        <i class="bi ${iconClass} me-2"></i>
        <strong class="me-auto">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${message}</div>
    </div>
  `

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = toastHTML
  const toastElement = tempDiv.firstElementChild
  toastContainer.appendChild(toastElement)

  const bootstrapToast = new Toast(toastElement, { autohide: true, delay: 5000 })
  bootstrapToast.show()

  toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove())
}

export default { renderForgotPasswordView }
