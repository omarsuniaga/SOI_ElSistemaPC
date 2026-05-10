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
          <div style="position: relative;">
            <input
              type="password"
              id="pm-password"
              class="pm-input"
              placeholder="••••••••"
              autocomplete="current-password"
              style="padding-right: 40px;"
            />
            <button
              type="button"
              id="pm-toggle-password"
              style="
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                color: var(--pm-text-muted);
                padding: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
              "
              title="Mostrar contraseña"
            >
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--pm-text-muted);">
            <input
              type="checkbox"
              id="pm-remember-email"
              style="cursor: pointer; width: 18px; height: 18px;"
            />
            Recordar correo electrónico
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--pm-text-muted);">
            <input
              type="checkbox"
              id="pm-keep-session"
              style="cursor: pointer; width: 18px; height: 18px;"
            />
            Mantener sesión abierta por 30 días
          </label>
        </div>

        <button type="button" class="pm-btn pm-btn-primary" id="pm-login-btn">
          Iniciar sesión
        </button>

        <button type="button" class="pm-btn pm-btn-secondary" id="pm-biometric-btn" style="display:none;">
          <i class="bi bi-fingerprint"></i> Usar huella o Face ID
        </button>

        <p class="pm-error-msg" id="pm-login-error" aria-live="polite"></p>
      </div>
    </div>
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
  togglePwdBtn.addEventListener('mousedown', () => {
    passwordVisible = true
    passwordInput.type = 'text'
    togglePwdBtn.querySelector('i').className = 'bi bi-eye-slash'
  })

  togglePwdBtn.addEventListener('mouseup', () => {
    passwordVisible = false
    passwordInput.type = 'password'
    togglePwdBtn.querySelector('i').className = 'bi bi-eye'
  })

  togglePwdBtn.addEventListener('mouseleave', () => {
    if (passwordVisible) {
      passwordVisible = false
      passwordInput.type = 'password'
      togglePwdBtn.querySelector('i').className = 'bi bi-eye'
    }
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

    if (!email || !password) {
      errorMsg.textContent = 'Completá tu correo y contraseña.'
      return
    }

    loginBtn.disabled    = true
    loginBtn.textContent = 'Ingresando...'
    errorMsg.textContent = ''

    // Set session duration based on checkbox
    const sessionDuration = keepSessionChk.checked ? 30 * 24 * 60 * 60 * 1000 : undefined // 30 days or default
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
      loginBtn.disabled    = false
      loginBtn.textContent = 'Iniciar sesión'
      localStorage.removeItem('pm-session-expires')
    }
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

  requestAnimationFrame(() => emailInput.focus())
}
