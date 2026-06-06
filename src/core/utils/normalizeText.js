/**
 * Strips diacritics, removes non-word characters, lowercases, and trims.
 * Use for accent-insensitive search comparisons.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim()
}
