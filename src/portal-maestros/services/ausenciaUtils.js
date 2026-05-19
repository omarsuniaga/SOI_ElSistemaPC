/**
 * ausenciaUtils.js
 * Pure utility functions for absence workflow.
 * No side effects, no I/O — safe to unit test without mocks.
 */

const WHATSAPP_SUFFIX = '… (ver documento adjunto)'
const DEFAULT_MAX_CHARS = 1800

/**
 * Filters an array of ISO date strings to weekdays only (Mon–Fri).
 *
 * @param {string[]} dates - Array of YYYY-MM-DD strings
 * @returns {string[]} Only the dates that fall on Monday through Friday
 */
export function filterBusinessDays(dates) {
  if (!Array.isArray(dates)) return []
  return dates.filter((dateStr) => {
    const day = new Date(`${dateStr}T00:00:00`).getDay()
    // 0 = Sunday, 6 = Saturday
    return day !== 0 && day !== 6
  })
}

/**
 * Truncates a text string to fit within WhatsApp deep-link limits.
 * Short texts are returned unchanged. Long texts are truncated and
 * the suffix "… (ver documento adjunto)" is appended.
 *
 * @param {string} text - The message text to (potentially) truncate
 * @param {number} [maxChars=1800] - Character ceiling for the result
 * @returns {string} The original text or a truncated version with suffix
 */
export function truncateWhatsAppText(text, maxChars = DEFAULT_MAX_CHARS) {
  if (typeof text !== 'string') return ''
  if (text.length <= maxChars) return text
  const allowedBody = maxChars - WHATSAPP_SUFFIX.length
  return text.slice(0, allowedBody) + WHATSAPP_SUFFIX
}

/**
 * Builds a wa.me deep link for WhatsApp.
 *
 * @param {string|null|undefined} phone - Director phone number (any format)
 * @param {string} text - Pre-composed message text
 * @returns {string|null} Full wa.me URL or null if phone is falsy
 */
export function prepareWhatsAppLink(phone, text) {
  if (!phone) return null
  const digits = String(phone).replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
