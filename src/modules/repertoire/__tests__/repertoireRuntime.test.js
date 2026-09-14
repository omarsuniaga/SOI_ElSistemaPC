import { describe, expect, it } from 'vitest'
import { getRepertoireAdapter, RepertoireUnavailableError } from '../api/repertoireRuntime.js'

describe('Repertoire runtime adapter selection', () => {
  it('selects Demo only when explicitly requested', () => {
    expect(getRepertoireAdapter({ mode: 'demo' }).mode).toBeUndefined()
    expect(getRepertoireAdapter({ mode: 'demo' }).listMontajes).toEqual(expect.any(Function))
  })

  it('fails closed for missing real configuration or invalid mode', () => {
    expect(() => getRepertoireAdapter({ mode: 'real', supabaseClient: null })).toThrow(RepertoireUnavailableError)
    expect(() => getRepertoireAdapter({ mode: 'invalid' })).toThrow('Modo de Repertorio inválido')
  })
})
