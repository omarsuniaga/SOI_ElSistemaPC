export const MEASURES_PER_ROW_OPTIONS = [4, 6, 8, 10, 12, 16]
export const DEFAULT_MEASURES_PER_ROW = 8
const STORAGE_PREFIX = 'soi-repertoire-grid:'

export function normalizeMeasuresPerRow(value) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 4 || parsed > 32) return DEFAULT_MEASURES_PER_ROW
  return parsed
}

export function gridPreferenceKey({ montajeId = '', versionId = '', filaId = '' } = {}) {
  return `${STORAGE_PREFIX}${montajeId}:${versionId}:${filaId}`
}

export function readMeasuresPerRow(scope = {}, storage = globalThis.localStorage) {
  try { return normalizeMeasuresPerRow(storage?.getItem(gridPreferenceKey(scope)) || DEFAULT_MEASURES_PER_ROW) } catch { return DEFAULT_MEASURES_PER_ROW }
}

export function writeMeasuresPerRow(scope, value, storage = globalThis.localStorage) {
  const normalized = normalizeMeasuresPerRow(value)
  try { storage?.setItem(gridPreferenceKey(scope), String(normalized)) } catch { /* local preference is best effort */ }
  return normalized
}

export function normalizeRehearsalMark(mark = {}) {
  const label = String(mark.label || mark.letra || '').trim()
  const measureId = mark.measureId || mark.montaje_compas_id || null
  const measureNumber = mark.measureNumber ?? mark.numero_visible ?? null
  if (!label || (!measureId && measureNumber == null)) throw new TypeError('Una marca de ensayo requiere letra y ancla')
  return { label, measureId, measureNumber, description: String(mark.description || mark.descripcion || '').trim() }
}
