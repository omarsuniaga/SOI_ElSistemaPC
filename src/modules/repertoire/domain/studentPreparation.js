import { assertEnum, ESTADOS_PREPARACION } from './repertoireFoundation.js'

export const PREPARATION_UPDATE_SCOPES = Object.freeze({
  ROW: 'ROW',
  ALL_STUDENTS: 'ALL_STUDENTS',
  SELECTED_STUDENTS: 'SELECTED_STUDENTS'
})

export function applyPreparationScope({ rowState, studentStates = {}, selectedStudentIds = [], state, scope }) {
  assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
  if (!Object.values(PREPARATION_UPDATE_SCOPES).includes(scope)) throw new RangeError(`alcance inválido: ${scope}`)
  const nextStudents = { ...studentStates }
  if (scope === PREPARATION_UPDATE_SCOPES.ALL_STUDENTS) Object.keys(nextStudents).forEach((id) => { nextStudents[id] = state })
  if (scope === PREPARATION_UPDATE_SCOPES.SELECTED_STUDENTS) selectedStudentIds.forEach((id) => { if (id in nextStudents) nextStudents[id] = state })
  return { rowState: scope === PREPARATION_UPDATE_SCOPES.ROW ? state : rowState, studentStates: nextStudents }
}
