import { supabase } from '../../lib/supabaseClient.js'
import { setFieldError, clearFieldError, clearAllFieldErrors } from '../utils/a11yUtils.js'

/**
 * Renderiza la vista de registro para maestros.
 * @param {HTMLElement} container
 * @param {{ onSuccess: () => void }} options
 */
export function renderRegisterView(container, { onSuccess }) {
  container.innerHTML = `
    <div class="pm-login">
      <!-- Branding Side (Desktop) -->
      <div class="pm-login-branding">
        <div class="pm-login-logo"><i class="bi bi-music-note-beamed"></i></div>
        <h1 class="pm-login-title">Registro de Maestro</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <!-- Form Side -->
      <div class="pm-login-form">
        <div class="pm-login-card">
          <div class="pm-input-group">
            <label for="pm-reg-nombre">Nombre completo</label>
            <input
              type="text"
              id="pm-reg-nombre"
              class="pm-input"
              placeholder="Tu nombre completo"
              autocomplete="name"
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-email">Correo electrónico</label>
            <input
              type="email"
              id="pm-reg-email"
              class="pm-input"
              placeholder="tu@correo.com"
              autocomplete="email"
              inputmode="email"
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-password">Contraseña</label>
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-reg-password"
                class="pm-input"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
              />
              <button
                type="button"
                id="pm-reg-toggle-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-confirm-password">Confirmar contraseña</label>
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-reg-confirm-password"
                class="pm-input"
                placeholder="Repetí tu contraseña"
                autocomplete="new-password"
              />
              <button
                type="button"
                id="pm-reg-toggle-confirm-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-instrumento">Instrumento principal</label>
            <input
              type="text"
              id="pm-reg-instrumento"
              class="pm-input"
              placeholder="Ej: Violín, Piano, Guitarra..."
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-resena">Breve reseña (opcional)</label>
            <textarea
              id="pm-reg-resena"
              class="pm-input"
              placeholder="Contanos brevemente sobre tu experiencia..."
              rows="3"
            ></textarea>
          </div>

          <button type="button" class="pm-btn-primary" id="pm-register-btn">
            <span class="pm-btn-text">Crear cuenta</span>
            <span class="pm-btn-loader d-none">
              <span class="pm-spinner-sm"></span>
              Registrando...
            </span>
          </button>

          <p class="pm-error-msg" id="pm-reg-error" aria-live="polite"></p>

          <p class="pm-login-register-link">
            <a href="#" data-route="login" class="pm-link">¿Ya tienes cuenta? Iniciar sesión</a>
          </p>
        </div>
      </div>
    </div>
  `

  const nombreInput = container.querySelector('#pm-reg-nombre')
  const emailInput = container.querySelector('#pm-reg-email')
  const passwordInput = container.querySelector('#pm-reg-password')
  const confirmPasswordInput = container.querySelector('#pm-reg-confirm-password')
  const instrumentoInput = container.querySelector('#pm-reg-instrumento')
  const resenaInput = container.querySelector('#pm-reg-resena')
  const registerBtn = container.querySelector('#pm-register-btn')
  const errorMsg = container.querySelector('#pm-reg-error')
  const togglePwdBtn = container.querySelector('#pm-reg-toggle-password')
  const toggleConfirmPwdBtn = container.querySelector('#pm-reg-toggle-confirm-password')

  // --- Show/Hide Password ---
  let passwordVisible = false
  togglePwdBtn.addEventListener('click', () => {
    passwordVisible = !passwordVisible
    passwordInput.type = passwordVisible ? 'text' : 'password'
    togglePwdBtn.querySelector('i').className = passwordVisible ? 'bi bi-eye-slash' : 'bi bi-eye'
    togglePwdBtn.title = passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
    togglePwdBtn.setAttribute('aria-label', passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña')
  })

  let confirmPasswordVisible = false
  toggleConfirmPwdBtn.addEventListener('click', () => {
    confirmPasswordVisible = !confirmPasswordVisible
    confirmPasswordInput.type = confirmPasswordVisible ? 'text' : 'password'
    toggleConfirmPwdBtn.querySelector('i').className = confirmPasswordVisible ? 'bi bi-eye-slash' : 'bi bi-eye'
    toggleConfirmPwdBtn.title = confirmPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
    toggleConfirmPwdBtn.setAttribute('aria-label', confirmPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña')
  })

  async function handleRegister() {
    const nombre = nombreInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value
    const instrumento = instrumentoInput.value.trim()

    errorMsg.textContent = ''
    clearAllFieldErrors(container)
    setInputsDisabled(false)

    let hasError = false

    if (!nombre) {
      setFieldError(nombreInput, 'Ingresá tu nombre completo')
      if (!hasError) nombreInput.focus()
      hasError = true
    }

    if (!email) {
      setFieldError(emailInput, 'Ingresá tu correo electrónico')
      if (!hasError) emailInput.focus()
      hasError = true
    }

    if (!password || password.length < 6) {
      setFieldError(passwordInput, 'La contraseña debe tener al menos 6 caracteres')
      if (!hasError) passwordInput.focus()
      hasError = true
    }

    if (!confirmPassword) {
      setFieldError(confirmPasswordInput, 'Confirmá tu contraseña')
      if (!hasError) confirmPasswordInput.focus()
      hasError = true
    } else if (password !== confirmPassword) {
      setFieldError(confirmPasswordInput, 'Las contraseñas no coinciden')
      if (!hasError) confirmPasswordInput.focus()
      hasError = true
    }

    if (hasError) return

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nombre,
          rol: 'maestro',
          instrumento,
          resena: resenaInput.value.trim(),
        },
      },
    })

    if (error) {
      errorMsg.textContent = error.message === 'User already registered'
        ? 'Este correo ya está registrado. Si ya sos maestro, intentá iniciar sesión.'
        : error.message || 'Error al registrarse. Intentá de nuevo.'
      setLoading(false)
      return
    }

    // Garantizar el row en profiles aunque el trigger DB falle
    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        nombre_completo: nombre,
        resena: `Instrumento: ${instrumento}${resenaInput.value.trim() ? ' | ' + resenaInput.value.trim() : ''}`,
        rol: 'maestro',
        estado: 'pendiente',
      }, { onConflict: 'id', ignoreDuplicates: false })
    }

    setLoading(false)
    if (onSuccess) onSuccess()
  }

  function setLoading(loading) {
    registerBtn.disabled = loading
    nombreInput.disabled = loading
    emailInput.disabled = loading
    passwordInput.disabled = loading
    confirmPasswordInput.disabled = loading
    instrumentoInput.disabled = loading
    resenaInput.disabled = loading
    togglePwdBtn.disabled = loading
    toggleConfirmPwdBtn.disabled = loading

    const btnText = registerBtn.querySelector('.pm-btn-text')
    const btnLoader = registerBtn.querySelector('.pm-btn-loader')

    if (loading) {
      btnText?.classList.add('d-none')
      btnLoader?.classList.remove('d-none')
    } else {
      btnText?.classList.remove('d-none')
      btnLoader?.classList.add('d-none')
    }
  }

  function setInputsDisabled(disabled) {
    nombreInput.disabled = disabled
    emailInput.disabled = disabled
    passwordInput.disabled = disabled
    confirmPasswordInput.disabled = disabled
    instrumentoInput.disabled = disabled
    resenaInput.disabled = disabled
    togglePwdBtn.disabled = disabled
    toggleConfirmPwdBtn.disabled = disabled
  }

  registerBtn.addEventListener('click', handleRegister)
  confirmPasswordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister()
  })

  // Handle navigation links
  const loginLink = container.querySelector('[data-route="login"]')
  loginLink?.addEventListener('click', (e) => {
    e.preventDefault()
    if (window.router) {
      window.router.navigate('login')
    } else {
      console.error('[RegisterView] Router not found in window')
    }
  })

  requestAnimationFrame(() => nombreInput.focus())
}
