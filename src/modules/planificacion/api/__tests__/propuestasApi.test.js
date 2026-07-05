/**
 * Tests para propuestasApi.js — curriculo-tres-planos WU #6.
 *
 * API de lectura/escritura para el flujo bidireccional maestro -> ACM:
 *   - listarPropuestasPendientes(): route_versions con origen='maestro' y
 *     status='propuesta'
 *   - publicarPropuesta(routeVersionId): status='published'
 *   - devolverPropuesta(routeVersionId, feedback): status='devuelta' + feedback
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import { listarPropuestasPendientes, publicarPropuesta, devolverPropuesta } from '../propuestasApi.js'

function mockChain(finalResult) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(finalResult),
  }
  // order() is the terminal call for list queries (no .single())
  chain.order.mockImplementation(() => Promise.resolve(finalResult))
  return chain
}

describe('listarPropuestasPendientes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('consulta route_versions con origen=maestro y status=propuesta', async () => {
    const rows = [{ id: 'rv-1', origen: 'maestro', status: 'propuesta', clase_id: 'clase-1' }]
    const chain = mockChain({ data: rows, error: null })
    supabase.from.mockReturnValue(chain)

    const result = await listarPropuestasPendientes()

    expect(supabase.from).toHaveBeenCalledWith('route_versions')
    expect(chain.eq).toHaveBeenCalledWith('origen', 'maestro')
    expect(chain.eq).toHaveBeenCalledWith('status', 'propuesta')
    expect(result).toEqual(rows)
  })

  it('devuelve [] si no hay filas', async () => {
    const chain = mockChain({ data: null, error: null })
    supabase.from.mockReturnValue(chain)

    const result = await listarPropuestasPendientes()
    expect(result).toEqual([])
  })

  it('lanza si supabase devuelve error', async () => {
    const chain = mockChain({ data: null, error: { message: 'boom' } })
    supabase.from.mockReturnValue(chain)

    await expect(listarPropuestasPendientes()).rejects.toThrow(/boom/)
  })
})

describe('publicarPropuesta', () => {
  beforeEach(() => vi.clearAllMocks())

  it('actualiza status a published (valor REAL del enum, no "publicada")', async () => {
    const chain = mockChain({ data: { id: 'rv-1', status: 'published' }, error: null })
    supabase.from.mockReturnValue(chain)

    const result = await publicarPropuesta('rv-1')

    expect(supabase.from).toHaveBeenCalledWith('route_versions')
    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }))
    expect(chain.eq).toHaveBeenCalledWith('id', 'rv-1')
    expect(result.status).toBe('published')
  })

  it('requiere routeVersionId', async () => {
    await expect(publicarPropuesta()).rejects.toThrow(/routeVersionId/)
  })
})

describe('devolverPropuesta', () => {
  beforeEach(() => vi.clearAllMocks())

  it('actualiza status a devuelta y guarda el feedback', async () => {
    const chain = mockChain({ data: { id: 'rv-1', status: 'devuelta', feedback: 'Falta nivel 3' }, error: null })
    supabase.from.mockReturnValue(chain)

    const result = await devolverPropuesta('rv-1', 'Falta nivel 3')

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'devuelta', feedback: 'Falta nivel 3' }),
    )
    expect(result.feedback).toBe('Falta nivel 3')
  })

  it('requiere feedback no vacío', async () => {
    await expect(devolverPropuesta('rv-1', '')).rejects.toThrow(/feedback/)
  })
})
