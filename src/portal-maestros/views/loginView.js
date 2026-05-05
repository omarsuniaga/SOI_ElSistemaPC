import { loginMaestro } from '../auth/maestroAuth.js'
import { usePortalAuth } from '../auth/usePortalAuth.js'

/**
 * Renderiza la vista de login del portal maestros en el contenedor dado.
 * @param {HTMLElement} container
 * @param {{ onSuccess: () => void }} options
 */
export function renderLoginView(container, { onSuccess }) {
  container.innerHTML = `
    <div class="pm-login">
      <div class="pm-login-logo">🎵</div>
      <h1 class="pm-login-title">Portal Maestros</h1>
      <p class="pm-login-subtitle">SOI · Sistema Operativo Institucional</p>

      <div class="pm-login-card">
        <div class="pm-input-group">
          <label for="pm-email">Correo electrónico</label>
          <input
            type="email"
            id="pm-email"
            class="pm-input"
            placeholder="tu@correo.com"
            autocomplete="username"
            inputmode="email"
          />
        </div>

        <div class="pm-input-group">
          <label for="pm-password">Contraseña</label>
          <input
            type="password"
            id="pm-password"
            class="pm-input"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <button type="button" class="pm-btn pm-btn-primary" id="pm-login-btn">
          Iniciar sesión
        </button>

        <p class="pm-error-msg" id="pm-login-error" aria-live="polite"></p>
      </div>
    </div>
  `

  const emailInput    = container.querySelector('#pm-email')
  const passwordInput = container.querySelector('#pm-password')
  const loginBtn      = container.querySelector('#pm-login-btn')
  const errorMsg      = container.querySelector('#pm-login-error')

  async function handleLogin() {
    const email    = emailInput.value.trim()
    const password = passwordInput.value

    if (!email || !password) {
      errorMsg.textContent = 'Completá tu correo y contraseña.'
      return
    }

    loginBtn.disabled    = true
    loginBtn.textContent = 'Ingresando...'
    errorMsg.textContent = ''

    const result = await loginMaestro(email, password)

    if (result.success) {
      usePortalAuth.setMaestro(result.maestro)
      onSuccess()
    } else {
      errorMsg.textContent = result.error
      loginBtn.disabled    = false
      loginBtn.textContent = 'Iniciar sesión'
    }
  }

  loginBtn.addEventListener('click', handleLogin)
  passwordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin()
  })

  requestAnimationFrame(() => emailInput.focus())
}
