/** Match individual instrument assignments without confusing Clarinete with Clarinete bajo. */
export function matchesInstrument(value, instrument) {
  if (!instrument) return true
  const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
  return String(value || '').split(',').some(token => normalize(token) === normalize(instrument))
}
