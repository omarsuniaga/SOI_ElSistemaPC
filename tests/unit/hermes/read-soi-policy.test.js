import { describe, expect, it } from 'vitest'
import { resolveSoiPolicy } from '../../../scripts/lib/soi-policy-resolver.js'

describe('resolveSoiPolicy', () => {
  it('resuelve por categoría usando el índice vigente', () => {
    const result = resolveSoiPolicy({ category: 'mora_pago' })
    expect(result.ok).toBe(true)
    expect(result.doc_id).toBe('FIN-P13')
    expect(result.status).toBe('vigente')
  })

  it('resuelve por doc_id exacto sin caer en legacy', () => {
    const result = resolveSoiPolicy({ docId: 'DIR-P05' })
    expect(result.ok).toBe(true)
    expect(result.doc_id).toBe('DIR-P05')
    expect(result.path).toContain('DIR-P05_Gestion_Crisis_V8.md')
  })

  it('rechaza categorías sin documento canónico vigente', () => {
    const result = resolveSoiPolicy({ category: 'material_audiovisual' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('policy_gap')
  })
})
