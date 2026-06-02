import { describe, it, expect } from 'vitest'
import {
  crearWizard,
  avanzar,
  retroceder,
  irAPaso,
  marcarEnviado,
} from '../../../../src/portal-maestros/components/wizard/wizardStateMachine.js'

const noopValidator = () => ({ valid: true, errors: {} })
const failValidator = () => ({ valid: false, errors: { nombre_completo: 'Requerido' } })

describe('crearWizard', () => {
  it('creates initial state with currentStep=1', () => {
    const state = crearWizard(5)
    expect(state.currentStep).toBe(1)
    expect(state.totalSteps).toBe(5)
    expect(state.submitted).toBe(false)
    expect(state.errors).toEqual({})
    expect(state.draft).toEqual({})
  })

  it('maxReachedStep starts at totalSteps', () => {
    const state = crearWizard(5)
    expect(state.maxReachedStep).toBe(5)
  })
})

describe('avanzar', () => {
  it('advances to the next step when validation passes', () => {
    const state = crearWizard(5)
    const next = avanzar(state, { nombre_completo: 'Ana' }, noopValidator)
    expect(next.currentStep).toBe(2)
    expect(next.errors).toEqual({})
  })

  it('stays on current step when validation fails', () => {
    const state = crearWizard(5)
    const next = avanzar(state, {}, failValidator)
    expect(next.currentStep).toBe(1)
    expect(next.errors.nombre_completo).toBe('Requerido')
  })

  it('merges stepData into draft on advance', () => {
    const state = crearWizard(5)
    const next = avanzar(state, { nombre_completo: 'Pedro' }, noopValidator)
    expect(next.draft.nombre_completo).toBe('Pedro')
  })

  it('does not advance past the last step', () => {
    let state = crearWizard(5)
    // advance to step 5
    for (let i = 0; i < 4; i++) {
      state = avanzar(state, {}, noopValidator)
    }
    expect(state.currentStep).toBe(5)
    const next = avanzar(state, {}, noopValidator)
    expect(next.currentStep).toBe(5)
  })

  it('maxReachedStep stays at totalSteps when advancing (already at max)', () => {
    const state = crearWizard(5)
    const next = avanzar(state, {}, noopValidator)
    expect(next.maxReachedStep).toBe(5)
  })
})

describe('retroceder', () => {
  it('goes to the previous step', () => {
    const state = crearWizard(5)
    const atStep2 = avanzar(state, {}, noopValidator)
    const back = retroceder(atStep2)
    expect(back.currentStep).toBe(1)
  })

  it('does not go below step 1', () => {
    const state = crearWizard(5)
    const back = retroceder(state)
    expect(back.currentStep).toBe(1)
  })

  it('clears errors when going back', () => {
    const stateWithErrors = { ...crearWizard(5), currentStep: 2, errors: { x: 'err' } }
    const back = retroceder(stateWithErrors)
    expect(back.errors).toEqual({})
  })
})

describe('irAPaso', () => {
  it('jumps to a visited step (n <= maxReachedStep)', () => {
    const state = { ...crearWizard(5), currentStep: 3, maxReachedStep: 3 }
    const jumped = irAPaso(state, 2)
    expect(jumped.currentStep).toBe(2)
  })

  it('does not jump to an unvisited step', () => {
    const state = { ...crearWizard(5), currentStep: 1, maxReachedStep: 1 }
    const jumped = irAPaso(state, 3)
    expect(jumped.currentStep).toBe(1)
  })

  it('does not jump to step 0 or below', () => {
    const state = { ...crearWizard(5), currentStep: 2, maxReachedStep: 3 }
    const jumped = irAPaso(state, 0)
    expect(jumped.currentStep).toBe(2)
  })
})

describe('marcarEnviado', () => {
  it('sets submitted=true', () => {
    const state = crearWizard(5)
    const done = marcarEnviado(state)
    expect(done.submitted).toBe(true)
  })

  it('preserves draft when marking as submitted', () => {
    const state = { ...crearWizard(5), draft: { nombre_completo: 'Ana' } }
    const done = marcarEnviado(state)
    expect(done.draft.nombre_completo).toBe('Ana')
  })
})
