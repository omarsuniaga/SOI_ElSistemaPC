import { describe, expect, it } from 'vitest'
import { applyPreparationScope, PREPARATION_UPDATE_SCOPES } from '../domain/studentPreparation.js'

describe('student preparation scope semantics', () => {
  const base = { rowState: 'DOMINADO', studentStates: { juan: 'SIN_ESTUDIAR', pedro: 'CONSOLIDADO' } }
  it('keeps individual overrides when updating the collective row state', () => {
    expect(applyPreparationScope({ ...base, state: 'CONSOLIDADO', scope: PREPARATION_UPDATE_SCOPES.ROW })).toEqual({ ...base, rowState: 'CONSOLIDADO' })
  })
  it('updates all or selected students only when explicitly requested', () => {
    expect(applyPreparationScope({ ...base, state: 'DOMINADO', scope: PREPARATION_UPDATE_SCOPES.ALL_STUDENTS }).studentStates).toEqual({ juan: 'DOMINADO', pedro: 'DOMINADO' })
    expect(applyPreparationScope({ ...base, state: 'DOMINADO', selectedStudentIds: ['juan'], scope: PREPARATION_UPDATE_SCOPES.SELECTED_STUDENTS }).studentStates).toEqual({ juan: 'DOMINADO', pedro: 'CONSOLIDADO' })
  })
})
