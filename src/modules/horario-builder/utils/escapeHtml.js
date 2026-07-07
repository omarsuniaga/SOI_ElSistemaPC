// src/modules/horario-builder/utils/escapeHtml.js

/**
 * Escapes HTML special characters to prevent XSS when inserting
 * user-supplied data into innerHTML template literals.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
