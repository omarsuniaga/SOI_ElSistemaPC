/**
 * Utilidades para el módulo de Alumnos
 */

/**
 * Formatea una fecha a formato legible
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Fecha desconocida'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, function(m) {
    if (m === '&') return '&amp;'
    if (m === '<') return '&lt;'
    if (m === '>') return '&gt;'
    if (m === '"') return '&quot;'
    if (m === "'") return '&#39;'
    return m
  })
}

/**
 * Valida si un email es válido
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Formatea género a label legible
 * @param {string} genero
 * @returns {string}
 */
export function formatGenero(genero) {
  const mapa = {
    'M': 'Masculino',
    'F': 'Femenino',
    'O': 'Otro',
    'N': 'No binario',
  }
  return mapa[genero?.toUpperCase()] || 'No especificado'
}

/**
 * Obtiene el ícono de género en Bootstrap Icons
 * @param {string} genero
 * @returns {string}
 */
export function getGeneroIcon(genero) {
  const iconos = {
    'M': 'bi-gender-male',
    'F': 'bi-gender-female',
    'O': 'bi-question-circle',
    'N': 'bi-question-circle',
  }
  return iconos[genero?.toUpperCase()] || 'bi-person'
}

/**
 * Devuelve la clase de Bootstrap para el estado
 * @param {boolean} esActivo
 * @returns {string}
 */
export function getEstadoClass(esActivo) {
  return esActivo ? 'bg-success' : 'bg-secondary'
}

/**
 * Devuelve el label del estado
 * @param {boolean} esActivo
 * @returns {string}
 */
export function getEstadoLabel(esActivo) {
  return esActivo ? 'Activo' : 'Inactivo'
}

/**
 * Compara dos strings ignorando mayúsculas y acentos
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function equalsIgnoreAccents(a, b) {
  if (!a || !b) return false
  return a
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase() === b
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/**
 * Obtiene iniciales del nombre
 * @param {string} nombre
 * @returns {string}
 */
export function getInitials(nombre) {
  if (!nombre) return '?'
  const initials = nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  // Single word: take first 2 chars instead of 1
  if (initials.length === 1) {
    return nombre.trim().slice(0, 2).toUpperCase()
  }
  return initials
}

/**
 * Formatea teléfono con máscara (simplificado)
 * @param {string} telefono
 * @returns {string}
 */
export function formatPhoneNumber(telefono) {
  if (!telefono) return ''
  const cleaned = telefono.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 5)}) ${cleaned.substring(5, 8)}-${cleaned.substring(8)}`
  }
  return telefono
}

/**
 * Obtiene color de badge aleatorio pero consistente según el ID
 * @param {string} id
 * @returns {string}
 */
export function getConsistentColor(id) {
  const colores = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
  if (!id) return 'primary'
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return colores[code % colores.length]
}
