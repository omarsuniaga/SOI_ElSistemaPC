/**
 * sanitize.js — Single source of truth for escaping and input sanitization.
 *
 * Rules:
 *  - escapeHTML  → use when rendering user data inside innerHTML templates
 *  - sanitizeText → use before saving free-text fields to the database
 *  - sanitizeFormData → use at form submit to clean an entire data object
 *
 * This module has NO external dependencies. DOMPurify is intentionally NOT
 * used here because we control what goes into innerHTML via escapeHTML, and
 * we do NOT allow rich HTML input from end users anywhere in this app.
 */

// ---------------------------------------------------------------------------
// HTML escaping — prevents XSS when interpolating data into innerHTML
// ---------------------------------------------------------------------------

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
}

/**
 * Escape all HTML-special characters in a string so it renders as plain text.
 * Use this every time you interpolate user-supplied data into an innerHTML template.
 *
 * @param {*} value - Any value (non-strings are coerced or returned as '')
 * @returns {string}
 *
 * @example
 * element.innerHTML = `<p>${escapeHTML(user.nombre)}</p>`
 */
export function escapeHTML(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[&<>"'/]/g, ch => HTML_ESCAPE_MAP[ch])
}

// ---------------------------------------------------------------------------
// Text sanitization — strips control characters and dangerous patterns
// before persisting to the database
// ---------------------------------------------------------------------------

/**
 * Sanitize a plain-text string before saving it.
 * - Removes null bytes and other ASCII control characters (except tab/newline)
 * - Strips `javascript:` URI schemes (belt-and-suspenders)
 * - Trims leading/trailing whitespace
 * - Enforces an optional max length
 *
 * Does NOT strip HTML tags — that is escapeHTML's job at render time.
 *
 * @param {string} value
 * @param {{ maxLength?: number }} [options]
 * @returns {string}
 */
export function sanitizeText(value, { maxLength } = {}) {
  if (!value) return ''
  let result = String(value)
    .trim()
    // Remove null bytes and ASCII control chars except \t (9) and \n (10)
    .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '')
    // Strip javascript: URI scheme (case-insensitive, with optional whitespace/encoding)
    .replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '')
  if (maxLength && result.length > maxLength) {
    result = result.slice(0, maxLength)
  }
  return result
}

// ---------------------------------------------------------------------------
// Form data sanitizer — applies sanitizeText to every string field in an object
// ---------------------------------------------------------------------------

/**
 * Sanitize all string fields in a plain data object.
 * Non-string values (numbers, booleans, nulls, arrays) are passed through unchanged.
 * Nested objects are NOT recursed — pass nested objects separately if needed.
 *
 * @param {Record<string, unknown>} data
 * @param {Record<string, { maxLength?: number }>} [fieldOptions] - Per-field options
 * @returns {Record<string, unknown>} New object with sanitized string fields
 *
 * @example
 * const clean = sanitizeFormData(
 *   { nombre: rawNombre, correo: rawEmail, nota: rawNota },
 *   { nota: { maxLength: 500 } }
 * )
 */
export function sanitizeFormData(data, fieldOptions = {}) {
  const result = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value, fieldOptions[key] ?? {})
    } else {
      result[key] = value
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Convenience re-export for callers that previously used common.js
// ---------------------------------------------------------------------------
export default { escapeHTML, sanitizeText, sanitizeFormData }
