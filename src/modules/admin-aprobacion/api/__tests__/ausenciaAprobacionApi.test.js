import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aprobarAusencia, rechazarAusencia } from '../ausenciaAprobacionApi.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn(), auth: { getUser: vi.fn() } },
}))

/**
 * Builder encadenable de PostgREST: .update().eq() y luego .select() resuelve
 * a { data, error }.
 */
function mutationChain(resolvedValue) {
  const chain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue(resolvedValue),
  }
  return chain
}

describe('ausenciaAprobacionApi (admin) — actualizarDecisionAusencia via aprobar/rechazar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('aprobarAusencia persiste estado + decision_notas + decidido_en', async () => {
    const chain = mutationChain({
      data: [{ id: 'a1', estado: 'aprobada', decision_notas: 'ok' }],
      error: null,
    })
    supabase.from.mockReturnValue(chain)

    const result = await aprobarAusencia('a1', 'ok')

    expect(supabase.from).toHaveBeenCalledWith('ausencias_maestros')
    const payload = chain.update.mock.calls[0][0]
    expect(payload.estado).toBe('aprobada')
    expect(payload.decision_notas).toBe('ok')
    expect(typeof payload.decidido_en).toBe('string')
    expect(chain.eq).toHaveBeenCalledWith('id', 'a1')
    expect(result.estado).toBe('aprobada')
  })

  it('rechazarAusencia mapea a estado=rechazada', async () => {
    const chain = mutationChain({ data: [{ id: 'a1', estado: 'rechazada' }], error: null })
    supabase.from.mockReturnValue(chain)

    await rechazarAusencia('a1', 'motivo')

    expect(chain.update.mock.calls[0][0].estado).toBe('rechazada')
  })

  it('decision_notas vacío se guarda como null (no string vacío)', async () => {
    const chain = mutationChain({ data: [{ id: 'a1', estado: 'aprobada' }], error: null })
    supabase.from.mockReturnValue(chain)

    await aprobarAusencia('a1')

    expect(chain.update.mock.calls[0][0].decision_notas).toBeNull()
  })

  it('LANZA cuando la mutación no afecta ninguna fila (id inexistente / RLS) — ya no es no-op silencioso', async () => {
    const chain = mutationChain({ data: [], error: null })
    supabase.from.mockReturnValue(chain)

    await expect(aprobarAusencia('id-que-no-existe', 'ok')).rejects.toMatchObject({
      code: 'NO_ROWS_AFFECTED',
    })
  })

  it('propaga el error de transporte de Supabase', async () => {
    const chain = mutationChain({ data: null, error: { message: 'db down' } })
    supabase.from.mockReturnValue(chain)

    await expect(aprobarAusencia('a1', 'ok')).rejects.toThrow('db down')
  })

  it('fuerza .select() para verificar filas afectadas', async () => {
    const chain = mutationChain({ data: [{ id: 'a1', estado: 'aprobada' }], error: null })
    supabase.from.mockReturnValue(chain)

    await aprobarAusencia('a1', 'ok')

    expect(chain.select).toHaveBeenCalled()
  })
})
