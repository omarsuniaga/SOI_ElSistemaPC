/**
 * Common Utilities
 * Utilidades generales reutilizables
 */

export const CommonUtils = {
  /**
   * Formatea fecha a formato legible en español
   */
  formatDate(dateStr) {
    if (!dateStr) return 'Fecha desconocida'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  },

  /**
   * Formatea fecha con hora
   */
  formatDateTime(dateStr) {
    if (!dateStr) return 'Fecha desconocida'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  },

  /**
   * Escapa HTML para prevenir XSS
   */
  escapeHTML(str) {
    if (!str) return ''
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
  },

  /**
   * Obtiene iniciales de un nombre
   */
  getInitials(nombre) {
    if (!nombre) return '?'
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  },

  /**
   * Capitaliza la primera letra
   */
  capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  /**
   * Trunca texto a longitud máxima
   */
  truncate(str, max = 50) {
    if (!str || str.length <= max) return str
    return str.substring(0, max) + '...'
  },

  /**
   * Genera color consistente basado en ID
   */
  getConsistentColor(id) {
    const colores = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
    if (!id) return 'primary'
    const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
    return colores[code % colores.length]
  },

  /**
   * Debounce para evitar llamadas excesivas
   */
  debounce(fn, delay = 300) {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  },

  /**
   * Deep clone simple de objeto
   */
  clone(obj) {
    return JSON.parse(JSON.stringify(obj))
  },
}
