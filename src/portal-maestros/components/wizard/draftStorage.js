/**
 * Draft storage — localStorage wrappers for the inscripción wizard draft.
 *
 * Key: 'wizard-inscripcion-draft'
 */

const DRAFT_KEY = 'wizard-inscripcion-draft'

/**
 * Save draft object to localStorage.
 *
 * @param {object} draft
 */
export function guardarBorrador(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

/**
 * Load draft from localStorage.
 * Returns null if not found or if stored value is not valid JSON.
 *
 * @returns {object|null}
 */
export function cargarBorrador() {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Remove the draft from localStorage.
 */
export function limpiarBorrador() {
  localStorage.removeItem(DRAFT_KEY)
}
