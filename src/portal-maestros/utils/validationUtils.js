/**
 * @deprecated Use src/shared/utils/sanitize.js and src/shared/utils/validators.js instead.
 * This file is kept as a compatibility shim.
 */
export { escapeHTML as sanitizeHTML } from '../../shared/utils/sanitize.js'

export function validateObservation(text) {
  if (!text || text.trim().length === 0)
    return { valid: false, error: 'La observación no puede estar vacía.' }
  if (text.length > 5000)
    return { valid: false, error: 'La observación excede el límite de 5000 caracteres.' }
  return { valid: true }
}

export default { sanitizeHTML: (v) => v, validateObservation }
