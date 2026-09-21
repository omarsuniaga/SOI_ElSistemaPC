import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '../../../../lib/supabaseClient.js'
import { confirmarCobertura } from '../coberturaSupabase.js'
import { marcarRevisadasMasivo } from '../planificacionSupabase.js'
import { actualizarPlantilla } from '../plantillasSupabase.js'

/** Builder de PostgREST: .update().eq()/.in() y luego .select() resuelve. */
function chain(resolved) {
  const c = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue(resolved),
  }
  return c
}

beforeEach(() => vi.clearAllMocks())

describe('LC1 · guardas de mutación en planificacion/api', () => {
  it('marcarRevisadasMasivo LANZA si 0 planificaciones fueron marcadas (RLS / ids ajenos)', async () => {
    supabase.from.mockReturnValue(chain({ data: [], error: null }))
    await expect(marcarRevisadasMasivo(['a', 'b'])).rejects.toMatchObject({
      code: 'NO_ROWS_AFFECTED',
    })
  })

  it('marcarRevisadasMasivo con [] no llama a la BD', async () => {
    const r = await marcarRevisadasMasivo([])
    expect(r).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('confirmarCobertura exige que TODAS las filas hayan sido afectadas (min = ids.length)', async () => {
    supabase.from.mockReturnValue(chain({ data: [{ id: 'a' }], error: null })) // 1 de 2
    await expect(confirmarCobertura(['a', 'b'])).rejects.toMatchObject({ code: 'NO_ROWS_AFFECTED' })
  })

  it('actualizarPlantilla propaga NO_ROWS_AFFECTED; envuelve otros errores', async () => {
    supabase.from.mockReturnValue(chain({ data: [], error: null }))
    await expect(actualizarPlantilla('x', {})).rejects.toMatchObject({ code: 'NO_ROWS_AFFECTED' })

    supabase.from.mockReturnValue(chain({ data: null, error: { message: 'boom' } }))
    await expect(actualizarPlantilla('x', {})).rejects.toThrow('No se pudo actualizar la plantilla')
  })

  it('camino feliz: actualizarPlantilla devuelve la fila', async () => {
    supabase.from.mockReturnValue(chain({ data: [{ id: 'x', nombre: 'ok' }], error: null }))
    expect(await actualizarPlantilla('x', { nombre: 'ok' })).toEqual({ id: 'x', nombre: 'ok' })
  })
})
