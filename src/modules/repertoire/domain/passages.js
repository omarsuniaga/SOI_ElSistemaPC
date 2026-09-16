export const PASSAGE_FOCUS_TAGS = Object.freeze(['LECTURA', 'RITMO', 'AFINACION', 'ARTICULACION', 'DINAMICA', 'DIGITACION', 'ARCO', 'SONIDO', 'BALANCE', 'ENSAMBLE', 'TEMPO', 'MEMORIA', 'INTERPRETACION'])
export const PASSAGE_DIFFICULTIES = Object.freeze([1, 2, 3, 4, 5])

export function normalizeMeasureSelection(measureIds) {
  return [...new Set((measureIds || []).filter(Boolean))]
}

export function createPassage({ name, description = '', difficulty = null, focusTags = [], measureIds, scope = {} }) {
  if (!name?.trim()) throw new TypeError('El pasaje requiere nombre')
  const measures = normalizeMeasureSelection(measureIds)
  if (!measures.length) throw new TypeError('El pasaje requiere al menos un compás')
  if (difficulty != null && !PASSAGE_DIFFICULTIES.includes(Number(difficulty))) throw new RangeError('dificultad inválida')
  const invalidTags = focusTags.filter((tag) => !PASSAGE_FOCUS_TAGS.includes(tag))
  if (invalidTags.length) throw new RangeError(`focus inválido: ${invalidTags[0]}`)
  return { name: name.trim(), description, difficulty: difficulty == null ? null : Number(difficulty), focusTags: [...new Set(focusTags)], measureIds: measures, scope }
}

export function applyLinkedMeasureState(group, measureId, state, mode = 'ONE') {
  if (!group?.measureIds?.includes(measureId)) throw new RangeError('El compás no pertenece al grupo')
  return mode === 'ALL' ? { ...group.states, ...Object.fromEntries(group.measureIds.map((id) => [id, state])) } : { ...group.states, [measureId]: state }
}
