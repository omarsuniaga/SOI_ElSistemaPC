/**
 * phoneUtils.js — Phone number normalization and formatting utilities.
 *
 * Storage format (E.164): +1XXXXXXXXXX
 * Display format:         (809) 123-4567
 * WhatsApp link:          https://wa.me/18091234567
 */

/**
 * Normalize a raw phone string to E.164 format (+1XXXXXXXXXX).
 * Returns null if the input is clearly invalid (< 7 digits).
 *
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizePhone(raw) {
  if (!raw || !raw.trim()) return null

  // Extract digits only
  const digits = raw.replace(/\D/g, '')

  if (digits.length < 7) return null

  // Concatenated numbers: take the first valid chunk
  let clean = digits
  if (clean.length > 11) {
    clean = clean.startsWith('1') ? clean.slice(0, 11) : clean.slice(0, 10)
  }

  // Already has country code (11 digits starting with 1)
  if (clean.length === 11 && clean.startsWith('1')) {
    return '+' + clean
  }

  // 10 digits → assume +1 (NANP / Dominican Republic)
  if (clean.length === 10) {
    return '+1' + clean
  }

  // Fallback: return digits as-is
  return clean
}

/**
 * Format a phone number for display.
 * Accepts E.164 (+1XXXXXXXXXX), 10-digit, or any raw string.
 *
 * Output examples:
 *   '+18091234567'  → '(809) 123-4567'
 *   '8091234567'    → '(809) 123-4567'
 *   null / ''       → '—'
 *
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone || !phone.trim()) return '—'

  const digits = phone.replace(/\D/g, '')

  // Extract the 10-digit local number (strip leading country code 1 if present)
  const local = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits.length === 10
      ? digits
      : null

  if (!local) return phone // can't parse — return raw

  const area = local.slice(0, 3)
  const mid  = local.slice(3, 6)
  const end  = local.slice(6)

  return `(${area}) ${mid}-${end}`
}

/**
 * Generate a WhatsApp deep link for a phone number.
 * Strips all non-digit characters and prepends wa.me/.
 *
 * @param {string} phone
 * @param {string} [message] — optional pre-filled message
 * @returns {string|null}
 */
export function whatsappLink(phone, message = '') {
  if (!phone) return null

  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null

  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
