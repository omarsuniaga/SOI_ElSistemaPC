import { loginMaestro } from '../auth/maestroAuth.js'
import { usePortalAuth } from '../auth/usePortalAuth.js'
import { setFieldError, clearFieldError, clearAllFieldErrors } from '../utils/a11yUtils.js'

/**
 * Renderiza la vista de login del portal maestros en el contenedor dado.
 * @param {HTMLElement} container
 * @param {{ onSuccess: () => void }} options
 */
export function renderLoginView(container, { onSuccess }) {
  container.innerHTML = `
    <div class="pm-login">
      <!-- Branding Side (Desktop) -->
      <div class="pm-login-branding">
        <div class="pm-login-logo"><i class="bi bi-music-note-beamed"></i></div>
        <h1 class="pm-login-title">Portal Maestros</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <!-- Form Side -->
      <div class="pm-login-form">
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
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-password"
                class="pm-input"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button
                type="button"
                id="pm-toggle-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>

        <div class="pm-checkbox-group">
          <label class="pm-checkbox-label">
            <input type="checkbox" id="pm-remember-email" />
            Recordar correo electrónico
          </label>
          <label class="pm-checkbox-label">
            <input type="checkbox" id="pm-keep-session" />
            Mantener sesión abierta por 30 días
          </label>
        </div>

        <button type="button" class="pm-btn-primary" id="pm-login-btn">
          <span class="pm-btn-text">Iniciar sesión</span>
          <span class="pm-btn-loader d-none">
            <span class="pm-spinner-sm"></span>
            Validando...
          </span>
        </button>

        <button type="button" class="pm-btn-secondary" id="pm-biometric-btn" style="display:none;">
          <i class="bi bi-fingerprint"></i> Usar huella o Face ID
        </button>

        <p class="pm-error-msg" id="pm-login-error" aria-live="polite"></p>

        <p class="pm-login-register-link">
          <a href="#" data-route="register" class="pm-link">¿No tenés cuenta? Registrate como maestro</a>
        </p>
      </div>
    </div>
    <style>
      .pm-input[aria-invalid="true"] {
        border-color: var(--pm-danger, #ef4444);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
      }
    </style>
  `

  const emailInput       = container.querySelector('#pm-email')
  const passwordInput    = container.querySelector('#pm-password')
  const loginBtn         = container.querySelector('#pm-login-btn')
  const errorMsg         = container.querySelector('#pm-login-error')
  const togglePwdBtn     = container.querySelector('#pm-toggle-password')
  const rememberEmailChk = container.querySelector('#pm-remember-email')
  const keepSessionChk   = container.querySelector('#pm-keep-session')

  // --- Show/Hide Password ---
  let passwordVisible = false
  // Use click instead of mousedown/mouseup so keyboard (Enter/Space) works too
  togglePwdBtn.addEventListener('click', () => {
    passwordVisible = !passwordVisible
    passwordInput.type = passwordVisible ? 'text' : 'password'
    togglePwdBtn.querySelector('i').className = passwordVisible ? 'bi bi-eye-slash' : 'bi bi-eye'
    togglePwdBtn.title = passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
    togglePwdBtn.setAttribute('aria-label', passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña')
    togglePwdBtn.setAttribute('aria-pressed', passwordVisible ? 'true' : 'false')
  })

  // --- Load saved email ---
  const savedEmail = localStorage.getItem('pm-saved-email')
  if (savedEmail) {
    emailInput.value = savedEmail
    rememberEmailChk.checked = true
  }

  // --- Handle Remember Email checkbox ---
  rememberEmailChk.addEventListener('change', () => {
    if (rememberEmailChk.checked) {
      localStorage.setItem('pm-saved-email', emailInput.value)
    } else {
      localStorage.removeItem('pm-saved-email')
    }
  })

  // Update saved email when user types
  emailInput.addEventListener('input', () => {
    if (rememberEmailChk.checked) {
      localStorage.setItem('pm-saved-email', emailInput.value)
    }
  })

  async function handleLogin() {
    const email    = emailInput.value.trim()
    const password = passwordInput.value

    errorMsg.textContent = ''
    // Clear any previous inline field errors
    clearAllFieldErrors(container)
    setInputsDisabled(false)

    let hasError = false
    if (!email) {
      setFieldError(emailInput, 'Ingresa tu correo electrónico')
      emailInput.focus()
      hasError = true
    }
    if (!password) {
      setFieldError(passwordInput, 'Ingresa tu contraseña')
      if (!hasError) passwordInput.focus()
      hasError = true
    }
    if (hasError) return

    setLoading(true)

    const sessionDuration = keepSessionChk.checked ? 30 * 24 * 60 * 60 * 1000 : undefined
    if (sessionDuration) {
      localStorage.setItem('pm-session-expires', new Date(Date.now() + sessionDuration).toISOString())
    }

    const result = await loginMaestro(email, password)

    if (result.success) {
      usePortalAuth.setMaestro(result.maestro)
      const intended = localStorage.getItem('intended-route')
      localStorage.removeItem('intended-route')
      if (onSuccess) {
        onSuccess(intended)
      }
    } else {
      errorMsg.textContent = result.error
      setLoading(false)
      localStorage.removeItem('pm-session-expires')
      passwordInput.value = ''
      passwordInput.focus()
    }
  }

  function setLoading(loading) {
    loginBtn.disabled = loading
    emailInput.disabled = loading
    passwordInput.disabled = loading
    keepSessionChk.disabled = loading
    togglePwdBtn.disabled = loading

    const btnText = loginBtn.querySelector('.pm-btn-text')
    const btnLoader = loginBtn.querySelector('.pm-btn-loader')

    if (loading) {
      btnText?.classList.add('d-none')
      btnLoader?.classList.remove('d-none')
    } else {
      btnText?.classList.remove('d-none')
      btnLoader?.classList.add('d-none')
    }
  }

  function setInputsDisabled(disabled) {
    emailInput.disabled = disabled
    passwordInput.disabled = disabled
    keepSessionChk.disabled = disabled
    togglePwdBtn.disabled = disabled
  }

  loginBtn.addEventListener('click', handleLogin)
  passwordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin()
  })

  // WebAuthn / Biométrico
  const biometricBtn = container.querySelector('#pm-biometric-btn')

  async function checkWebAuthnSupport() {
    if (!window.PublicKeyCredential) return false
    try {
      const isAvailable = await navigator.credentials.get({ mediation: 'optional' })
      return true // Si no throw, el browser soporta WebAuthn
    } catch {
      return false
    }
  }

  // Verificar si hay credencial guardada
  async function tryBiometricLogin() {
    try {
      const credential = await navigator.credentials.get({
        mediation: 'required',
        publicKey: {
          challenge: new TextEncoder().encode('login-challenge'),
        }
      })
      
        if (credential) {
          const cachedMaestro = localStorage.getItem('portal-maestros:maestro')
          if (cachedMaestro) {
            const maestro = JSON.parse(cachedMaestro)
            usePortalAuth.setMaestro(maestro)
            const intended = localStorage.getItem('intended-route')
            localStorage.removeItem('intended-route')
            if (onSuccess) {
              onSuccess(intended)
            }
          } else {
          errorMsg.textContent = 'No hay sesión biométrica guardada. Iniciá sesión con contraseña primero.'
        }
      }
    } catch (err) {
      console.log('[WebAuthn] No se pudo usar biometría:', err.message)
    }
  }

  // Mostrar botón biométrico si está disponible
  checkWebAuthnSupport().then(supported => {
    if (supported) {
      biometricBtn.style.display = 'flex'
      biometricBtn.onclick = tryBiometricLogin
    }
  })

  // Handle navigation links
  const registerLink = container.querySelector('[data-route="register"]')
  registerLink?.addEventListener('click', (e) => {
    e.preventDefault()
    if (window.router) {
      window.router.navigate('register')
    } else {
      console.error('[LoginView] Router not found in window')
    }
  })

  requestAnimationFrame(() => emailInput.focus())
}
