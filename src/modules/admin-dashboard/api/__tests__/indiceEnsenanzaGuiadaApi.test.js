import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * indiceEnsenanzaGuiadaApi.test.js — Spec D-01
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * Consume fn_get_indice_ensenanza_guiada() vía RPC (no la vista directo,
 * ver comentario en la migración) y hace un segundo query a `maestros` para
 * resolver los nombres (el RPC no soporta embeds de tablas relacionadas).
 */

const rpcMock = vi.fn()
const inMock = vi.fn()
const selectMock = vi.fn(() => ({ in: inMock }))
const fromMock = vi.fn(() => ({ select: selectMock }))

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    rpc: (...args) => rpcMock(...args),
    from: (...args) => fromMock(...args),
  },
}))

import { getIndiceEnsenanzaGuiada } from '../indiceEnsenanzaGuiadaApi.js'

describe('getIndiceEnsenanzaGuiada', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls the RPC and joins maestro names from a second query', async () => {
    rpcMock.mockResolvedValue({
      data: [
        { maestro_id: 'm1', total_sesiones: 10, sesiones_con_indicador: 9, indice: 0.9 },
        { maestro_id: 'm2', total_sesiones: 5, sesiones_con_indicador: 0, indice: 0 },
      ],
      error: null,
    })
    inMock.mockResolvedValue({
      data: [
        { id: 'm1', nombre_completo: 'Ana Pérez' },
        { id: 'm2', nombre_completo: 'Beto Gómez' },
      ],
      error: null,
    })

    const result = await getIndiceEnsenanzaGuiada()

    expect(rpcMock).toHaveBeenCalledWith('fn_get_indice_ensenanza_guiada')
    expect(fromMock).toHaveBeenCalledWith('maestros')
    expect(result).toEqual([
      { maestroId: 'm1', nombre: 'Ana Pérez', totalSesiones: 10, sesionesConIndicador: 9, indice: 0.9 },
      { maestroId: 'm2', nombre: 'Beto Gómez', totalSesiones: 5, sesionesConIndicador: 0, indice: 0 },
    ])
  })

  it('returns an empty array without a second query when the RPC returns no rows', async () => {
    rpcMock.mockResolvedValue({ data: [], error: null })

    const result = await getIndiceEnsenanzaGuiada()

    expect(result).toEqual([])
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('returns an empty array (not throw) when the RPC is rejected by the authorization check', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'No autorizado para consultar el índice de enseñanza guiada' } })

    const result = await getIndiceEnsenanzaGuiada()

    expect(result).toEqual([])
  })

  it('falls back to "Maestro" when a maestro_id has no matching row in maestros', async () => {
    rpcMock.mockResolvedValue({ data: [{ maestro_id: 'm-orphan', total_sesiones: 3, sesiones_con_indicador: 1, indice: 0.3333 }], error: null })
    inMock.mockResolvedValue({ data: [], error: null })

    const result = await getIndiceEnsenanzaGuiada()

    expect(result[0].nombre).toBe('Maestro')
  })
})
