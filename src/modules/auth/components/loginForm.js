/**
 * Login Form Component
 * Formulario de inicio de sesión
 */

import { showToast } from '../../shared/components/toast.js'

/**
 * Crea el formulario de login
 * @param {Function} onSubmit - Callback cuando se enviar el formulario
 * @returns {HTMLFormElement}
 */
export function createLoginForm(onSubmit) {
  const form = document.createElement('form')
  form.className = 'login-form'
  form.id = 'login-form'
  form.innerHTML = `
    <div class="form-group">
      <label for="login-email">Correo electrónico</label>
      <input 
        type="email" 
        id="login-email" 
        name="email" 
        class="form-control"
        placeholder="correo@example.com"
        required
        autocomplete="email"
      >
      <div class="error-message" id="email-error"></div>
    </div>
    <div class="form-group">
      <label for="login-password">Contraseña</label>
      <input 
        type="password" 
        id="login-password" 
        name="password" 
        class="form-control"
        placeholder="••••••••"
        required
        autocomplete="current-password"
      >
      <div class="error-message" id="password-error"></div>
    </div>
    <div class="form-group">
      <button type="submit" class="btn btn-primary btn-block" id="login-submit-btn">
        <span class="btn-text">Iniciar sesión</span>
        <span class="btn-loading" style="display: none;">
          <span class="spinner-border spinner-border-sm" role="status"></span>
          Procesando...
        </span>
      </button>
    </div>
  `
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!validateForm(form)) return
    const data = getFormData(form)
    try {
      await onSubmit(data)
    } catch (error) {
      showFieldError('password', error.message || 'Credenciales inválidas')
    }
  })

  const emailInput = form.querySelector('#login-email')
  emailInput.addEventListener('input', () => clearFieldError('email'))
  const passwordInput = form.querySelector('#login-password')
  passwordInput.addEventListener('input', () => clearFieldError('password'))

  return form
}

/**
 * Extrae email y password del formulario
 * @param {HTMLFormElement} form
 * @returns {{email: string, password: string}}
 */
export function getFormData(form) {
  const formData = new FormData(form)
  return {
    email: formData.get('email')?.trim()?.toLowerCase() || '',
    password: formData.get('password') || '',
  }
}

/**
 * Valida el formulario antes de enviar
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
export function validateForm(form) {
  const data = getFormData(form)
  let isValid = true

  clearFieldError('email')
  clearFieldError('password')

  if (!data.email) {
    showFieldError('email', 'El correo electrónico es requerido')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    showFieldError('email', 'Ingrese un correo electrónico válido')
    isValid = false
  }

  if (!data.password) {
    showFieldError('password', 'La contraseña es requerida')
    isValid = false
  }

  return isValid
}

/**
 * Muestra error en un campo
 * @param {string} field - 'email' | 'password'
 * @param {string} message
 */
export function showFieldError(field, message) {
  const errorEl = document.getElementById(`${field}-error`)
  const inputEl = document.getElementById(`login-${field}`)
  if (errorEl) {
    errorEl.textContent = message
    errorEl.classList.add('visible')
  }
  if (inputEl) {
    inputEl.classList.add('is-invalid')
  }
}

/**
 * Limpia el error de un campo
 * @param {string} field - 'email' | 'password'
 */
export function clearFieldError(field) {
  const errorEl = document.getElementById(`${field}-error`)
  const inputEl = document.getElementById(`login-${field}`)
  if (errorEl) {
    errorEl.textContent = ''
    errorEl.classList.remove('visible')
  }
  if (inputEl) {
    inputEl.classList.remove('is-invalid')
  }
}

/**
 * Muestra/oculta estado de carga
 * @param {HTMLFormElement} form
 * @param {boolean} loading
 */
export function setFormLoading(form, loading) {
  const btn = form.querySelector('#login-submit-btn')
  const btnText = btn?.querySelector('.btn-text')
  const btnLoading = btn?.querySelector('.btn-loading')
  
  if (btn) {
    btn.disabled = loading
    if (btnText) btnText.style.display = loading ? 'none' : 'inline'
    if (btnLoading) btnLoading.style.display = loading ? 'inline' : 'none'
  }

  const inputs = form.querySelectorAll('input')
  inputs.forEach(input => input.disabled = loading)
}