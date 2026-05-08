/**
 * Register Form Component
 * Formulario de registro de usuario
 */

import { showToast } from '../../shared/components/toast.js'
import { validarEmail, validarPassword } from '../utils/authUtils.js'
import { isEmailAlreadyUsed } from '../utils/authUtils.js'

/**
 * Crea el formulario de registro
 * @param {Function} onSubmit - Callback cuando se envíe el formulario
 * @returns {HTMLFormElement}
 */
export function createRegisterForm(onSubmit) {
  const form = document.createElement('form')
  form.className = 'register-form'
  form.id = 'register-form'
  form.innerHTML = `
    <div class="form-group">
      <label for="register-name">Nombre completo</label>
      <input 
        type="text" 
        id="register-name" 
        name="name" 
        class="form-control"
        placeholder="Juan Pérez"
        required
        autocomplete="name"
        minlength="3"
        maxlength="100"
      >
      <div class="error-message" id="name-error"></div>
    </div>
    <div class="form-group">
      <label for="register-email">Correo electrónico</label>
      <input 
        type="email" 
        id="register-email" 
        name="email" 
        class="form-control"
        placeholder="correo@example.com"
        required
        autocomplete="email"
      >
      <div class="error-message" id="email-error"></div>
    </div>
    <div class="form-group">
      <label for="register-password">Contraseña</label>
      <input 
        type="password" 
        id="register-password" 
        name="password" 
        class="form-control"
        placeholder="••••••••"
        required
        autocomplete="new-password"
      >
      <div class="password-strength" id="password-strength"></div>
      <div class="password-requirements">
        <div class="requirement" id="req-length">
          <span class="requirement-icon">○</span>
          <span>Mínimo 8 caracteres</span>
        </div>
        <div class="requirement" id="req-uppercase">
          <span class="requirement-icon">○</span>
          <span>Una letra mayúscula</span>
        </div>
        <div class="requirement" id="req-number">
          <span class="requirement-icon">○</span>
          <span>Un número</span>
        </div>
        <div class="requirement" id="req-symbol">
          <span class="requirement-icon">○</span>
          <span>Un símbolo (!@#$%^&*)</span>
        </div>
      </div>
      <div class="error-message" id="password-error"></div>
    </div>
    <div class="form-group">
      <label for="register-confirm-password">Confirmar contraseña</label>
      <input 
        type="password" 
        id="register-confirm-password" 
        name="confirmPassword" 
        class="form-control"
        placeholder="••••••••"
        required
        autocomplete="new-password"
      >
      <div class="error-message" id="confirmPassword-error"></div>
    </div>
    <div class="form-group">
      <div class="form-check">
        <input 
          type="checkbox" 
          id="register-terms" 
          name="terms" 
          class="form-check-input"
          required
        >
        <label for="register-terms" class="form-check-label">
          Acepto los <a href="/terminos" target="_blank">términos y condiciones</a>
        </label>
      </div>
      <div class="error-message" id="terms-error"></div>
    </div>
    <div class="form-group">
      <button type="submit" class="btn btn-primary btn-block" id="register-submit-btn">
        <span class="btn-text">Registrarse</span>
        <span class="btn-loading" style="display: none;">
          <span class="spinner-border spinner-border-sm" role="status"></span>
          Procesando...
        </span>
      </button>
    </div>
  `

  attachPasswordStrengthIndicator(form)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = getRegisterFormData(form)
    if (!await validateRegisterForm(form, data)) return
    try {
      await onSubmit(data)
    } catch (error) {
      showFieldError('email', error.message || 'Error al registrar usuario')
    }
  })

  const nameInput = form.querySelector('#register-name')
  nameInput.addEventListener('input', () => clearFieldError('name'))

  const emailInput = form.querySelector('#register-email')
  emailInput.addEventListener('blur', async () => {
    if (emailInput.value) {
      await validateEmail(emailInput.value)
    }
  })
  emailInput.addEventListener('input', () => clearFieldError('email'))

  const passwordInput = form.querySelector('#register-password')
  passwordInput.addEventListener('input', () => {
    validatePasswordStrength(passwordInput.value)
    clearFieldError('password')
  })

  const confirmPasswordInput = form.querySelector('#register-confirm-password')
  confirmPasswordInput.addEventListener('input', () => {
    validatePasswordMatch()
    clearFieldError('confirmPassword')
  })

  const termsInput = form.querySelector('#register-terms')
  termsInput.addEventListener('change', () => clearFieldError('terms'))

  return form
}

/**
 * Adjunta el indicador de fortaleza de contraseña
 * @param {HTMLFormElement} form
 */
export function attachPasswordStrengthIndicator(form) {
  const passwordInput = form.querySelector('#register-password')
  const passwordStrength = form.querySelector('#password-strength')

  if (!passwordInput || !passwordStrength) return

  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value
    const result = validatePasswordStrength(password)

    let strength = 0
    if (result.hasMinLength) strength++
    if (result.hasUppercase) strength++
    if (result.hasNumber) strength++
    if (result.hasSymbol) strength++

    const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']
    const strengthColors = ['#dc3545', '#dc3545', '#ffc107', '#28a745', '#20c997']

    passwordStrength.innerHTML = `
      <div class="strength-bar">
        <div class="strength-fill" style="width: ${strength * 25}%; background: ${strengthColors[strength]}"></div>
      </div>
      <span class="strength-text" style="color: ${strengthColors[strength]}">${strengthLabels[strength]}</span>
    `
  })
}

/**
 * Valida la fortaleza de la contraseña
 * @param {string} password
 * @returns {{valid: boolean, hasMinLength: boolean, hasUppercase: boolean, hasNumber: boolean, hasSymbol: boolean}}
 */
export function validatePasswordStrength(password) {
  const requirements = validarPassword(password)

  const reqLength = document.getElementById('req-length')
  const reqUppercase = document.getElementById('req-uppercase')
  const reqNumber = document.getElementById('req-number')
  const reqSymbol = document.getElementById('req-symbol')

  if (reqLength) {
    const icon = reqLength.querySelector('.requirement-icon')
    if (icon) icon.textContent = requirements.hasMinLength ? '●' : '○'
    reqLength.classList.toggle('met', requirements.hasMinLength)
  }
  if (reqUppercase) {
    const icon = reqUppercase.querySelector('.requirement-icon')
    if (icon) icon.textContent = requirements.hasUppercase ? '●' : '○'
    reqUppercase.classList.toggle('met', requirements.hasUppercase)
  }
  if (reqNumber) {
    const icon = reqNumber.querySelector('.requirement-icon')
    if (icon) icon.textContent = requirements.hasNumber ? '●' : '○'
    reqNumber.classList.toggle('met', requirements.hasNumber)
  }
  if (reqSymbol) {
    const icon = reqSymbol.querySelector('.requirement-icon')
    if (icon) icon.textContent = requirements.hasSymbol ? '●' : '○'
    reqSymbol.classList.toggle('met', requirements.hasSymbol)
  }

  return requirements
}

/**
 * Valida que las contraseñas coincidan
 * @returns {boolean}
 */
export function validatePasswordMatch() {
  const password = document.getElementById('register-password')?.value
  const confirmPassword = document.getElementById('register-confirm-password')?.value
  const errorEl = document.getElementById('confirmPassword-error')

  if (confirmPassword && password !== confirmPassword) {
    if (errorEl) {
      errorEl.textContent = 'Las contraseñas no coinciden'
      errorEl.classList.add('visible')
    }
    return false
  }

  if (errorEl) {
    errorEl.textContent = ''
    errorEl.classList.remove('visible')
  }
  return true
}

/**
 * Valida que el email no esté en uso
 * @param {string} email
 * @returns {boolean}
 */
export async function validateEmail(email) {
  const errorEl = document.getElementById('email-error')

  if (!validarEmail(email)) {
    if (errorEl) {
      errorEl.textContent = 'Ingrese un correo electrónico válido'
      errorEl.classList.add('visible')
    }
    return false
  }

  const exists = await isEmailAlreadyUsed(email)
  if (exists) {
    if (errorEl) {
      errorEl.textContent = 'Este correo electrónico ya está registrado'
      errorEl.classList.add('visible')
    }
    return false
  }

  if (errorEl) {
    errorEl.textContent = ''
    errorEl.classList.remove('visible')
  }
  return true
}

/**
 * Extrae los datos del formulario de registro
 * @param {HTMLFormElement} form
 * @returns {{name: string, email: string, password: string, confirmPassword: string, terms: boolean}}
 */
export function getRegisterFormData(form) {
  const formData = new FormData(form)
  return {
    name: formData.get('name')?.trim() || '',
    email: formData.get('email')?.trim()?.toLowerCase() || '',
    password: formData.get('password') || '',
    confirmPassword: formData.get('confirmPassword') || '',
    terms: form.querySelector('#register-terms')?.checked || false,
  }
}

/**
 * Valida el formulario de registro completo
 * @param {HTMLFormElement} form
 * @param {Object} data
 * @returns {boolean}
 */
export async function validateRegisterForm(form, data) {
  let isValid = true

  clearFieldError('name')
  clearFieldError('email')
  clearFieldError('password')
  clearFieldError('confirmPassword')
  clearFieldError('terms')

  if (!data.name || data.name.length < 3 || data.name.length > 100) {
    showFieldError('name', 'El nombre debe tener entre 3 y 100 caracteres')
    isValid = false
  }

  if (!validarEmail(data.email)) {
    showFieldError('email', 'Ingrese un correo electrónico válido')
    isValid = false
  }

  const passwordReqs = validatePasswordStrength(data.password)
  if (!passwordReqs.valid) {
    showFieldError('password', 'La contraseña no cumple los requisitos')
    isValid = false
  }

  if (!validatePasswordMatch()) {
    isValid = false
  }

  if (!data.terms) {
    showFieldError('terms', 'Debe aceptar los términos y condiciones')
    isValid = false
  }

  if (isValid) {
    const emailValid = await validateEmail(data.email)
    if (!emailValid) isValid = false
  }

  return isValid
}

/**
 * Muestra error en un campo del formulario de registro
 * @param {string} field
 * @param {string} message
 */
function showFieldError(field, message) {
  const errorEl = document.getElementById(`${field}-error`)
  const inputEl = document.getElementById(`register-${field}`)
  if (errorEl) {
    errorEl.textContent = message
    errorEl.classList.add('visible')
  }
  if (inputEl) {
    inputEl.classList.add('is-invalid')
  }
}

/**
 * Limpia el error de un campo del formulario de registro
 * @param {string} field
 */
function clearFieldError(field) {
  const errorEl = document.getElementById(`${field}-error`)
  const inputEl = document.getElementById(`register-${field}`)
  if (errorEl) {
    errorEl.textContent = ''
    errorEl.classList.remove('visible')
  }
  if (inputEl) {
    inputEl.classList.remove('is-invalid')
  }
}