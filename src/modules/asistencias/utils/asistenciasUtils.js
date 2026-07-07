/**
 * Utilidades para el módulo de Asistencias
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
 * Formatea una fecha a formato YYYY-MM-DD para inputs
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDateISO(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0]
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return ''
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;'
    if (m === '<') return '&lt;'
    if (m === '>') return '&gt;'
    return m
  })
}

/**
 * Devuelve la clase de Bootstrap para el estado de asistencia
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoClass(estado) {
  const clases = {
    'P': 'bg-success',
    'A': 'bg-danger',
    'J': 'bg-warning text-dark',
  }
  return clases[estado] || 'bg-secondary'
}

/**
 * Devuelve el label del estado de asistencia
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoLabel(estado) {
  const labels = {
    'P': 'Presente',
    'A': 'Ausente',
    'J': 'Justificado',
  }
  return labels[estado] || estado
}

/**
 * Devuelve el ícono de Bootstrap Icons para el estado
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoIcon(estado) {
  const iconos = {
    'P': 'bi-check-circle',
    'A': 'bi-x-circle',
    'J': 'bi-file-earmark-text',
  }
  return iconos[estado] || 'bi-question-circle'
}

/**
 * Devuelve el color de Bootstrap para el estado
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoColor(estado) {
  const colores = {
    'P': 'success',
    'A': 'danger',
    'J': 'warning',
  }
  return colores[estado] || 'secondary'
}

/**
 * Obtiene iniciales del nombre
 * @param {string} nombre
 * @returns {string}
 */
export function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Calcula el porcentaje de asistencia
 * @param {number} presentes
 * @param {number} total
 * @returns {number}
 */
export function calcularPorcentajeAsistencia(presentes, total) {
  if (total === 0) return 0
  return Math.round((presentes / total) * 100)
}

/**
 * Formatea el resumen de asistencia para mostrar
 * @param {object} stats
 * @returns {string}
 */
export function formatResumen(stats) {
  if (!stats) return 'Sin datos'
  return `${stats.presentes}P / ${stats.ausentes}A / ${stats.justificados}J (${stats.porcentajePresentes}%)`
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
