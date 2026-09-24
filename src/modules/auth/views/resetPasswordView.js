import { Toast } from 'bootstrap'
import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { CompactUI } from '../../../shared/utils/compactUI.js'

export function renderResetPasswordView(container) {
  CompactUI.injectStyles()
  renderContent(container)
  attachEvents(container)
  checkRecoverySession(container)
}

function renderContent(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <i class="bi bi-shield-lock-fill"></i>
            </div>
            <h4 class="auth-title">Elegí tu nueva contraseña</h4>
            <p class="auth-subtitle" id="resetSubtitle">Verificando el enlace...</p>
          </div>

          <form id="resetPasswordForm" class="auth-form d-none">
            <div class="mb-3">
              <label class="form-label-compact">Nueva contraseña</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  class="form-control input-dense"
                  id="newPassword"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minlength="8"
                  autocomplete="new-password"
                >
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
                  id="confirmPassword"
                  placeholder="Repetí la contraseña"
                  required
                  minlength="8"
                  autocomplete="new-password"
                >
              </div>
              <div class="error-message text-danger small mt-1 d-none" id="confirmError">
                Las contraseñas no coinciden
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm-compact w-100" id="btnResetSubmit">
              <span class="btn-text">Guardar nueva contraseña</span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2"></span>Guardando...
              </span>
            </button>
          </form>

          <div id="resetInvalidLink" class="d-none text-center">
            <p class="text-danger mb-3">
              <i class="bi bi-exclamation-triangle"></i>
              Este enlace ya no es válido o expiró.
            </p>
            <a href="#" id="linkRequestNew" class="auth-link">Pedir un enlace nuevo</a>
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
      .auth-link { color: var(--bs-primary); text-decoration: none; font-weight: 500; }
      .auth-link:hover { text-decoration: underline; }
    </style>
  `
}

/**
 * El link del correo trae el token de recuperación en la URL. El cliente de
 * Supabase (detectSessionInUrl: true, ver lib/supabaseClient.js) lo procesa
 * solo y dispara el evento PASSWORD_RECOVERY con una sesión temporal —
 * suficiente para llamar updateUser(), no para navegar el resto de la app.
 */
function checkRecoverySession(container) {
  const subtitle = document.getElementById('resetSubtitle')
  const form = document.getElementById('resetPasswordForm')
  const invalidLink = document.getElementById('resetInvalidLink')

  let resolved = false

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      resolved = true
      subscription.unsubscribe()
      subtitle.textContent = 'Enlace verificado — elegí tu nueva contraseña'
      form.classList.remove('d-none')
    }
  })

  // Si Supabase ya procesó el token antes de que este listener se conectara
  // (carrera posible en la primera carga), chequear la sesión actual también.
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (resolved) return
    if (session) {
      resolved = true
      subscription.unsubscribe()
      subtitle.textContent = 'Enlace verificado — elegí tu nueva contraseña'
      form.classList.remove('d-none')
    }
  })

  // Si en unos segundos no llegó ninguna sesión de recuperación, el link es
  // inválido/expirado — no dejar al usuario esperando indefinidamente.
  setTimeout(() => {
    if (resolved) return
    subscription.unsubscribe()
    subtitle.textContent = ''
    invalidLink.classList.remove('d-none')
  }, 4000)

  document.getElementById('linkRequestNew')?.addEventListener('click', (e) => {
    e.preventDefault()
    router.navigate('forgot-password')
  })
}

function attachEvents(container) {
  const form = document.getElementById('resetPasswordForm')

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const newPassword = document.getElementById('newPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    const confirmError = document.getElementById('confirmError')

    if (newPassword !== confirmPassword) {
      confirmError.classList.remove('d-none')
      return
    }
    confirmError.classList.add('d-none')

    await handleResetPassword(newPassword, container)
  })
}

async function handleResetPassword(newPassword, container) {
  updateButtonState(true)

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      showToast(error.message || 'No se pudo actualizar la contraseña', 'error', container)
      return
    }

    showToast('Contraseña actualizada. Redirigiendo al login...', 'success', container)
    // Cerrar la sesión temporal de recuperación — el usuario debe volver a
    // entrar con su contraseña nueva, no queda logueado desde el link.
    await supabase.auth.signOut()
    setTimeout(() => router.navigate('login'), 1500)
  } catch (error) {
    console.error('[ResetPasswordView] Error:', error)
    showToast('Error de conexión. Intentá de nuevo.', 'error', container)
  } finally {
    updateButtonState(false)
  }
}

function updateButtonState(loading) {
  const btn = document.getElementById('btnResetSubmit')
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

  const bootstrapToast = new Toast(toastElement, { autohide: true, delay: 4000 })
  bootstrapToast.show()

  toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove())
}

export default { renderResetPasswordView }
