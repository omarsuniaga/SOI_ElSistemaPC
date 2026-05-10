/**
 * Portal Maestros — Utilidades compartidas
 */

export const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/**
 * Asigna evento click de forma segura (con null check)
 * @param {Element|null} el - Elemento DOM
 * @param {Function} handler - Callback (puede ser async)
 */
export function onClick(el, handler) {
  if (el && typeof el.addEventListener === 'function') {
    el.addEventListener('click', (e) => {
      try {
        const result = handler(e)
        if (result && typeof result.then === 'function') {
          result.catch(err => console.warn('Click handler error:', err))
        }
      } catch (err) {
        console.warn('Click handler error:', err)
      }
    })
  }
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} str
 * @returns {string}
 */
export function escHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Formatea una hora (HH:MM:SS) a formato legible (HH:MM)
 * @param {string} hora
 * @returns {string}
 */
export function formatHora(hora) {
  if (!hora) return '—'
  return hora.substring(0, 5)
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Formatea una fecha para visualización en el portal
 * @param {Date|string} date
 * @returns {string}
 */
export function formatFechaPortal(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}

/**
 * Obtiene las iniciales de un nombre
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
 * Detecta el breakpoint actual del dispositivo
 * @returns {'mobile'|'tablet'|'desktop'}
 */
export function getBreakpoint() {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Suscribe un callback al cambio de breakpoint
 * @param {Function} callback - (breakpoint: string) => void
 * @returns {Function} - Función para desuscribirse
 */
export function onBreakpointChange(callback) {
  let current = getBreakpoint()
  const handler = () => {
    const next = getBreakpoint()
    if (next !== current) {
      current = next
      callback(current)
    }
  }
  window.addEventListener('resize', handler, { passive: true })
  return () => window.removeEventListener('resize', handler)
}
