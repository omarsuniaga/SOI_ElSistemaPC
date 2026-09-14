import { describe, expect, it } from 'vitest'
import { applyLinkedMeasureState, createPassage } from '../domain/passages.js'

describe('repertoire passages and linked measures', () => {
  it('creates continuous or non-contiguous pedagogical passages without duplicates', () => {
    expect(createPassage({ name: 'Tema A', measureIds: ['20', '21', '22'] }).measureIds).toEqual(['20', '21', '22'])
    expect(createPassage({ name: 'Patrón A', focusTags: ['afinación', 'afinación'], measureIds: ['1', '4', '8', '16', '4'] }).focusTags).toEqual(['afinación'])
  })
  it('supports changing one linked measure or all linked measures', () => {
    const group = { measureIds: ['1', '4', '8', '16'], states: { 1: 'DOMINADO', 4: 'DOMINADO', 8: 'SIN_ESTUDIAR', 16: 'DOMINADO' } }
    expect(applyLinkedMeasureState(group, '8', 'CONSOLIDADO')).toMatchObject({ 1: 'DOMINADO', 8: 'CONSOLIDADO' })
    expect(Object.values(applyLinkedMeasureState(group, '8', 'CONSOLIDADO', 'ALL'))).toEqual(['CONSOLIDADO', 'CONSOLIDADO', 'CONSOLIDADO', 'CONSOLIDADO'])
  })
})
