/**
 * Input validation and sanitization
 */

/**
 * Basic HTML sanitizer to prevent common XSS
 * NOTE: It is highly recommended to install and use DOMPurify for production.
 */
export function sanitizeHTML(str) {
  if (!str) return ''
  
  // If DOMPurify is available globally or via import, use it
  if (typeof window !== 'undefined' && window.DOMPurify) {
    return window.DOMPurify.sanitize(str)
  }

  // Basic fallback
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/javascript:/gi, '')
}

/**
 * Validate observation text
 */
export function validateObservation(text) {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'La observación no puede estar vacía.' }
  }
  
  if (text.length > 5000) {
    return { valid: false, error: 'La observación excede el límite de 5000 caracteres.' }
  }
  
  return { valid: true }
}

export default { sanitizeHTML, validateObservation }
