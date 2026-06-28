import { describe, expect, it } from 'vitest'
import { resolvePolicyForInput } from '../../../src/modules/hermes/api/soiPolicyApi.js'

describe('resolvePolicyForInput', () => {
  it('resuelve mora a FIN-P13', () => {
    const result = resolvePolicyForInput({ query: 'Hay morosidad de una familia desde hace 2 meses' })
    expect(result.ok).toBe(true)
    expect(result.doc_id).toBe('FIN-P13')
  })

  it('rechaza comunicaciones sin política vigente en catálogo', () => {
    const result = resolvePolicyForInput({ query: 'Necesitamos material audiovisual para una campaña', department: 'COM' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('policy_gap')
  })

  it('usa fallback por departamento cuando existe política canónica', () => {
    const result = resolvePolicyForInput({ query: 'Necesito revisar una crisis institucional', department: 'DIR' })
    expect(result.ok).toBe(true)
    expect(result.doc_id).toBe('DIR-P05')
  })
})
