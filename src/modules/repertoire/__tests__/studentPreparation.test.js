import { describe, expect, it } from 'vitest'
import { applyPreparationScope, assertStudentMutationAllowed, effectivePreparationState, PREPARATION_UPDATE_SCOPES } from '../domain/studentPreparation.js'

describe('student preparation scope semantics', () => {
  const base = { rowState: 'DOMINADO', studentStates: { juan: 'SIN_ESTUDIAR', pedro: 'CONSOLIDADO' } }
  it('keeps individual overrides when updating the collective row state', () => {
    expect(applyPreparationScope({ ...base, state: 'CONSOLIDADO', scope: PREPARATION_UPDATE_SCOPES.ROW })).toEqual({ ...base, rowState: 'CONSOLIDADO' })
  })
  it('updates all or selected students only when explicitly requested', () => {
    expect(applyPreparationScope({ ...base, state: 'DOMINADO', scope: PREPARATION_UPDATE_SCOPES.ALL_STUDENTS }).studentStates).toEqual({ juan: 'DOMINADO', pedro: 'DOMINADO' })
    expect(applyPreparationScope({ ...base, state: 'DOMINADO', selectedStudentIds: ['juan'], scope: PREPARATION_UPDATE_SCOPES.SELECTED_STUDENTS }).studentStates).toEqual({ juan: 'DOMINADO', pedro: 'CONSOLIDADO' })
  })

  it('resolves individual overrides before collective state and supports inheritance', () => {
    expect(effectivePreparationState({ collectiveState: 'DOMINADO', individualState: 'SIN_ESTUDIAR' })).toBe('SIN_ESTUDIAR')
    expect(effectivePreparationState({ collectiveState: 'CONSOLIDADO', individualState: null })).toBe('CONSOLIDADO')
    expect(effectivePreparationState({ collectiveState: 'CONSOLIDADO', individualState: 'SIN_ESTUDIAR', applicability: 'SILENCIO' })).toBeNull()
  })

  it('blocks student mutations outside the authorized fila scope', () => {
    expect(() => assertStudentMutationAllowed({ authorizedStudentIds: ['juan'], studentId: 'carlos' })).toThrow('fuera del alcance')
    expect(assertStudentMutationAllowed({ authorizedStudentIds: ['juan'], studentId: 'juan' })).toBe(true)
  })
})
