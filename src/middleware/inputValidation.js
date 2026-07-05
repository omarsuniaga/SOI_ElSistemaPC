/**
 * Input Validation Middleware
 *
 * @deprecated For new code use src/shared/utils/sanitize.js (escaping/sanitization)
 * and src/shared/utils/validators.js (format validation).
 * This file is kept because existing tests depend on it.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidUUID(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value)
}

export function validateObservation(data) {
  const errors = []
  if (!data.student_id || !isValidUUID(data.student_id)) {
    errors.push('student_id is required and must be a valid UUID')
  }
  if (data.clase_id && !isValidUUID(data.clase_id)) {
    errors.push('clase_id must be a valid UUID')
  }
  if (!data.texto || typeof data.texto !== 'string') {
    errors.push('texto is required')
  } else if (data.texto.length > 5000) {
    errors.push('texto must be less than 5000 characters')
  }
  if (data.indicators && Array.isArray(data.indicators)) {
    if (data.indicators.length > 10) errors.push('Maximum 10 indicators allowed')
  }
  return { valid: errors.length === 0, errors }
}

export function validateLessonPlan(data) {
  const errors = []
  if (!data.route_id || !isValidUUID(data.route_id)) {
    errors.push('route_id is required and must be a valid UUID')
  }
  if (typeof data.level !== 'number' || data.level < 1 || data.level > 10) {
    errors.push('level must be between 1 and 10')
  }
  if (!data.objectives || typeof data.objectives !== 'string') {
    errors.push('objectives is required')
  } else if (data.objectives.length > 2000) {
    errors.push('objectives must be less than 2000 characters')
  }
  if (!data.activities || typeof data.activities !== 'string') {
    errors.push('activities is required')
  } else if (data.activities.length > 2000) {
    errors.push('activities must be less than 2000 characters')
  }
  if (typeof data.duration_minutes !== 'number' || data.duration_minutes < 1 || data.duration_minutes > 240) {
    errors.push('duration_minutes must be between 1 and 240')
  }
  return { valid: errors.length === 0, errors }
}

export function validateStudent(data) {
  const errors = []
  if (!data.nombre || typeof data.nombre !== 'string') {
    errors.push('nombre is required')
  } else if (data.nombre.length > 100) {
    errors.push('nombre must be less than 100 characters')
  }
  if (!data.apellido || typeof data.apellido !== 'string') {
    errors.push('apellido is required')
  } else if (data.apellido.length > 100) {
    errors.push('apellido must be less than 100 characters')
  }
  if (data.email && !isValidEmail(data.email)) {
    errors.push('email must be a valid email address')
  }
  return { valid: errors.length === 0, errors }
}

export function validateEvaluation(data) {
  const errors = []
  if (!data.student_id || !isValidUUID(data.student_id)) errors.push('student_id is required')
  if (!data.route_id   || !isValidUUID(data.route_id))   errors.push('route_id is required')
  if (!data.period     || typeof data.period !== 'string') errors.push('period is required')
  if (!data.criteria   || typeof data.criteria !== 'object') errors.push('criteria is required')
  return { valid: errors.length === 0, errors }
}

/**
 * @deprecated Use escapeHTML from src/shared/utils/sanitize.js instead.
 */
export function sanitizeInput(input, _options = {}) {
  if (!input) return ''
  return String(input)
    .replace(/[&<>"'/]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' }[ch]))
}

export function validate(validator, data) {
  const result = validator(data)
  if (!result.valid) {
    const error = new Error(result.errors.join(', '))
    error.name = 'ValidationError'
    error.errors = result.errors
    throw error
  }
  return true
}

export default { validateObservation, validateLessonPlan, validateStudent, validateEvaluation, sanitizeInput, validate }
