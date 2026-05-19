/**
 * ausenciaUtils — Pure utility helpers for absence management.
 */

const WEEKEND_DAYS = new Set([0, 6]); // Sunday=0, Saturday=6

/**
 * Filter a list of classes to exclude sessions that fall on weekends.
 * @param {Array<{ sessionDate: string }>} classes
 * @returns {Array}
 */
export function filterBusinessDays(classes) {
  return classes.filter((c) => {
    if (!c.sessionDate) return true;
    const d = new Date(c.sessionDate + 'T00:00:00');
    return !WEEKEND_DAYS.has(d.getDay());
  });
}

/**
 * Truncate WhatsApp message text to maxChars, preserving header/footer.
 * @param {string} text
 * @param {number} [maxChars=1800]
 * @returns {string}
 */
export function truncateWhatsAppText(text, maxChars = 1800) {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars - 25);
  return truncated + '… (ver documento adjunto)';
}

/**
 * Build a wa.me deep-link URL.
 * @param {string} phone - Phone number with country code, digits only
 * @param {string} text - Message text (will be URL-encoded)
 * @returns {string}
 */
export function prepareWhatsAppLink(phone, text) {
  const encoded = encodeURIComponent(truncateWhatsAppText(text));
  return `https://wa.me/${phone}?text=${encoded}`;
}
