/**
 * Auth Validators Schema
 * Schemas de validación para autenticación
 */

export const emailSchema = {
  name: 'email',
  validate(value) {
    if (!value) return { valid: false, error: 'El correo electrónico es requerido' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return { valid: false, error: 'Ingrese un correo electrónico válido' }
    }
    return { valid: true, error: null }
  },
}

export const passwordSchema = {
  name: 'password',
  validate(value) {
    if (!value) return { valid: false, error: 'La contraseña es requerida' }

    const errors = []
    if (value.length < 8) errors.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(value)) errors.push('Una letra mayúscula')
    if (!/\d/.test(value)) errors.push('Un número')
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) errors.push('Un símbolo')

    if (errors.length > 0) {
      return { valid: false, error: errors.join(', ') }
    }
    return { valid: true, error: null }
  },
}

export const nameSchema = {
  name: 'name',
  validate(value) {
    if (!value) return { valid: false, error: 'El nombre es requerido' }
    const trimmed = String(value).trim()
    if (trimmed.length < 3) {
      return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' }
    }
    if (trimmed.length > 100) {
      return { valid: false, error: 'El nombre debe tener máximo 100 caracteres' }
    }
    return { valid: true, error: null }
  },
}

export const loginSchema = {
  name: 'login',
  fields: ['email', 'password'],
  validate(value) {
    const { email, password } = value || {}
    const errors = {}

    const emailResult = emailSchema.validate(email)
    if (!emailResult.valid) errors.email = emailResult.error

    const passwordResult = passwordSchema.validate(password)
    if (!passwordResult.valid) errors.password = passwordResult.error

    const isValid = Object.keys(errors).length === 0
    return { valid: isValid, errors }
  },
}

export const registerSchema = {
  name: 'register',
  fields: ['email', 'password', 'name', 'confirmPassword', 'terms'],
  validate(value) {
    const { email, password, name, confirmPassword, terms } = value || {}
    const errors = {}

    const nameResult = nameSchema.validate(name)
    if (!nameResult.valid) errors.name = nameResult.error

    const emailResult = emailSchema.validate(email)
    if (!emailResult.valid) errors.email = emailResult.error

    const passwordResult = passwordSchema.validate(password)
    if (!passwordResult.valid) errors.password = passwordResult.error

    if (confirmPassword !== password) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!terms) {
      errors.terms = 'Debe aceptar los términos y condiciones'
    }

    const isValid = Object.keys(errors).length === 0
    return { valid: isValid, errors }
  },
}

export function validateField(schema, value) {
  return schema.validate(value)
}

export function validateForm(schema, formData) {
  return schema.validate(formData)
}
