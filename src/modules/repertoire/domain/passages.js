export function normalizeMeasureSelection(measureIds) {
  return [...new Set((measureIds || []).filter(Boolean))]
}

export function createPassage({ name, description = '', difficulty = null, focusTags = [], measureIds, scope = {} }) {
  if (!name?.trim()) throw new TypeError('El pasaje requiere nombre')
  const measures = normalizeMeasureSelection(measureIds)
  if (!measures.length) throw new TypeError('El pasaje requiere al menos un compás')
  return { name: name.trim(), description, difficulty, focusTags: [...new Set(focusTags.filter(Boolean))], measureIds: measures, scope }
}

export function applyLinkedMeasureState(group, measureId, state, mode = 'ONE') {
  if (!group?.measureIds?.includes(measureId)) throw new RangeError('El compás no pertenece al grupo')
  return mode === 'ALL' ? { ...group.states, ...Object.fromEntries(group.measureIds.map((id) => [id, state])) } : { ...group.states, [measureId]: state }
}
