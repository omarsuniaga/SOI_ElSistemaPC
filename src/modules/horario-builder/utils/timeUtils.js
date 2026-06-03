/**
 * timeUtils.js — Utilidades de tiempo para el horario-builder.
 * Todas las funciones trabajan con strings HH:MM (24h, sin segundos).
 */

/**
 * Convierte "HH:MM" a minutos desde medianoche.
 * @param {string} timeStr
 * @returns {number}
 */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/**
 * Suma minutos a un string "HH:MM" y devuelve "HH:MM".
 * @param {string} timeStr
 * @param {number} minutes
 * @returns {string}
 */
export function addMinutes(timeStr, minutes) {
  const total = timeToMinutes(timeStr) + minutes
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Devuelve la duración en minutos entre dos strings "HH:MM".
 * @param {string} start
 * @param {string} end
 * @returns {number}
 */
export function minutesBetween(start, end) {
  return timeToMinutes(end) - timeToMinutes(start)
}

/**
 * Redondea "HH:MM" hacia abajo a la hora exacta ("HH:00").
 * @param {string} timeStr
 * @returns {string}
 */
export function roundToHour(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return '00:00'
  const [h] = timeStr.split(':')
  return `${h.padStart(2, '0')}:00`
}
