/**
 * Auth Utilities
 * Utilidades de autenticación
 */

import { supabase } from '../../lib/supabaseClient.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

/**
 * Valida formato de email
 * @param {string} email
 * @returns {boolean}
 */
export function validarEmail(email) {
  if (!email || typeof email !== 'string') return false
  return EMAIL_REGEX.test(email.trim())
}

/**
 * Valida que la contraseña cumpla los requisitos
 * @param {string} password
 * @returns {{valid: boolean, hasMinLength: boolean, hasUppercase: boolean, hasNumber: boolean, hasSymbol: boolean}}
 */
export function validarPassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, hasMinLength: false, hasUppercase: false, hasNumber: false, hasSymbol: false }
  }

  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  return {
    valid: hasMinLength && hasUppercase && hasNumber && hasSymbol,
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSymbol,
  }
}

/**
 * Valida nombre (3-100 caracteres)
 * @param {string} nombre
 * @returns {boolean}
 */
export function validarNombre(nombre) {
  if (!nombre || typeof nombre !== 'string') return false
  const trimmed = nombre.trim()
  return trimmed.length >= 3 && trimmed.length <= 100
}

/**
 * Formatea usuario para mostrar
 * @param {Object} user - {name, role}
 * @returns {string}
 */
export function formatUserDisplay(user) {
  if (!user) return ''
  const name = user.name || user.nombre || 'Usuario'
  const role = user.role || user.rol || ''
  return role ? `${name} (${role})` : name
}

/**
 * Obtiene color para avatar basado en email
 * @param {string} email
 * @returns {string}
 */
export function getAvatarColor(email) {
  if (!email) return '#6c757d'
  
  const colors = [
    '#e83e8c', '#6610f2', '#007bff', '#28a745', 
    '#ffc107', '#dc3545', '#17a2b8', '#6f42c1',
    '#fd7e14', '#20c997', '#3498db', '#9b59b6'
  ]
  
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Obtiene iniciales del nombre
 * @param {string} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return ''
  
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return ''
  
  let initials = ''
  if (parts.length === 1) {
    initials = parts[0].charAt(0).toUpperCase()
    if (parts[0].length > 1) {
      initials += parts[0].charAt(1).toUpperCase()
    }
  } else {
    initials = parts[0].charAt(0).toUpperCase()
    initials += parts[parts.length - 1].charAt(0).toUpperCase()
  }
  
  return initials
}

/**
 * Verifica si el email ya está en uso en Supabase
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function isEmailAlreadyUsed(email) {
  if (!email || !validarEmail(email)) return false

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1)

    if (error) {
      console.error('Error verificando email:', error)
      return false
    }

    return data && data.length > 0
  } catch (err) {
    console.error('Error en isEmailAlreadyUsed:', err)
    return false
  }
}

/**
 * Enmasca el email para mostrar
 * @param {string} email
 * @returns {string}
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return ''
  
  const trimmed = email.trim()
  if (!validarEmail(trimmed)) return trimmed

  const [local, domain] = trimmed.split('@')
  
  if (local.length <= 2) {
    return `${'*'.repeat(local.length)}@${domain}`
  }
  
  const masked = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
  return `${masked}@${domain}`
}