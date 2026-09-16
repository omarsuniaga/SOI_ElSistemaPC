import { PASSAGE_FOCUS_TAGS, normalizeMeasureSelection } from './passages.js'

export function normalizeMeasureRange(start, end) {
  const first = Number(start)
  const last = Number(end)
  if (!Number.isInteger(first) || !Number.isInteger(last) || first < 0 || last < first) throw new RangeError('Rango de compases inválido')
  return Array.from({ length: last - first + 1 }, (_, index) => String(first + index))
}

export function createSessionRepertoireWork({ sessionId, montajeId, createdBy, measureIds, focusTags = [], filaId = null, alumnoId = null, passageId = null, notes = '', tempoActual = null, tempoObjetivo = null } = {}) {
  if (!sessionId || !montajeId || !createdBy) throw new TypeError('El trabajo requiere sesión, montaje y creador')
  const measures = normalizeMeasureSelection(measureIds)
  if (!measures.length) throw new TypeError('El trabajo requiere al menos un compás')
  const invalidTag = focusTags.find((tag) => !PASSAGE_FOCUS_TAGS.includes(tag))
  if (invalidTag) throw new RangeError(`focus inválido: ${invalidTag}`)
  if (tempoActual != null && (!Number.isInteger(Number(tempoActual)) || Number(tempoActual) <= 0)) throw new RangeError('tempo actual inválido')
  if (tempoObjetivo != null && (!Number.isInteger(Number(tempoObjetivo)) || Number(tempoObjetivo) <= 0)) throw new RangeError('tempo objetivo inválido')
  if (tempoActual != null && tempoObjetivo != null && Number(tempoObjetivo) < Number(tempoActual)) throw new RangeError('El tempo objetivo no puede ser menor al actual')
  return { sessionId, montajeId, filaId, alumnoId, passageId, measureIds: measures, focusTags: [...new Set(focusTags)], notes, tempoActual, tempoObjetivo, preparationMutation: null }
}
