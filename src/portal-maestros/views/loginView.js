import { loginMaestro } from '../auth/maestroAuth.js'
import { usePortalAuth } from '../auth/usePortalAuth.js'
import { setFieldError, clearFieldError, clearAllFieldErrors } from '../utils/a11yUtils.js'
import { templateHtml } from './templates/loginDesignTemplate.js'
import '../styles/login.css'

/**
 * Renderiza la vista de login del portal maestros en el contenedor dado.
 * @param {HTMLElement} container
 * @param {{ onSuccess: () => void }} options
 */
export function renderLoginView(container, { onSuccess }) {
  container.innerHTML = templateHtml

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

  const savedKeepSession = localStorage.getItem('pm-keep-session')
  if (savedKeepSession !== null) {
    keepSessionChk.checked = savedKeepSession === 'true'
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

  keepSessionChk.addEventListener('change', () => {
    localStorage.setItem('pm-keep-session', keepSessionChk.checked ? 'true' : 'false')
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

    // La sesión persistente siempre se activa por defecto (30 días).
    // loginMaestro() llama a _setPersistentSession() internamente.
    const result = await loginMaestro(email, password, { keepSession: keepSessionChk.checked })

    if (result.success) {
      usePortalAuth.setMaestro(result.maestro)
      const intended = localStorage.getItem('intended-route')
      localStorage.removeItem('intended-route')
      if (onSuccess) onSuccess(intended)
    } else {
      if (result.pendingApproval) {
        window.router?.navigate('pending-approval')
        return
      }
      errorMsg.textContent = result.error
      setLoading(false)
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
