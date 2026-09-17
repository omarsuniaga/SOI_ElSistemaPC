import { describe, expect, it } from 'vitest'
import { getRepertoireAdapter, RepertoireUnavailableError } from '../api/repertoireRuntime.js'
import { createRepertoireAdapter } from '../api/repertoireAdapter.js'

describe('Repertoire runtime adapter selection', () => {
  it('selects Demo only when explicitly requested', () => {
    // El adaptador se identifica: la vista muestra el sello "DEMO · persistencia
    // local" según esto. Antes el sello estaba escrito a mano en la plantilla y
    // aparecía también sobre datos reales, diciéndole al maestro que su trabajo
    // era de mentira.
    expect(getRepertoireAdapter({ mode: 'demo' }).mode).toBe('demo')
    expect(getRepertoireAdapter({ mode: 'demo' }).listMontajes).toEqual(expect.any(Function))
  })

  it('marks the real adapter as real, so the demo badge stays hidden', () => {
    // Se construye directo: pasar por el runtime exigiría además que el id esté
    // en la lista de pilotos, que vive en variables de entorno.
    expect(createRepertoireAdapter({ from: () => ({}) }).mode).toBe('real')
  })

  it('fails closed for missing real configuration or invalid mode', () => {
    expect(() => getRepertoireAdapter({ mode: 'real', enabled: false, supabaseClient: {} })).toThrow('no está activado')
    expect(() => getRepertoireAdapter({ mode: 'real', supabaseClient: null })).toThrow(RepertoireUnavailableError)
    expect(() => getRepertoireAdapter({ mode: 'invalid' })).toThrow('Modo de Repertorio inválido')
  })
})
