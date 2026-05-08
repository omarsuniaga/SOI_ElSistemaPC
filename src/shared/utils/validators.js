/**
 * Shared Validators
 * Validaciones comunes reutilizables
 */

export const Validators = {
  /**
   * Valida email
   */
  email(value) {
    if (!value) return true // opcional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },

  /**
   * Valida longitud mínima y máxima
   */
  length(value, min = 0, max = Infinity) {
    if (!value) return min === 0
    return value.length >= min && value.length <= max
  },

  /**
   * Valida campo requerido
   */
  required(value) {
    return value !== undefined && value !== null && String(value).trim() !== ''
  },

  /**
   * Valida número en rango
   */
  range(value, min = -Infinity, max = Infinity) {
    const num = Number(value)
    return !isNaN(num) && num >= min && num <= max
  },

  /**
   * Valida fecha no futura
   */
  notFuture(value) {
    if (!value) return true
    return new Date(value) <= new Date()
  },

  /**
   * Valida teléfono (formato básico)
   */
  phone(value) {
    if (!value) return true
    return /^[\d\s\+\-\(\)]{7,20}$/.test(value)
  },

  /**
   * Valida cédula (solo dígitos, longitud)
   */
  cedula(value) {
    if (!value) return true
    return /^\d{5,20}$/.test(value.trim())
  },

  /**
   * Valida URL
   */
  url(value) {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  /**
   * Ejecuta múltiples validaciones
   * @returns {string[]} Array de mensajes de error
   */
  run(validations) {
    const errors = []
    for (const { test, message } of validations) {
      if (!test()) errors.push(message)
    }
    return errors
  },
}
