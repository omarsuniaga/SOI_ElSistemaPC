import { beforeEach, describe, expect, it, vi } from 'vitest'

const update = vi.fn()
const from = vi.fn(() => ({ update }))

vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from } }))

const { actualizarMedio } = await import('./signageAdminApi.js')

describe('signageAdminApi.actualizarMedio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('confirma que la diapositiva fue persistida', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'slide-1' }, error: null })
    const eq = vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle })) }))
    update.mockReturnValue({ eq })

    await expect(actualizarMedio('slide-1', { contenido: { tipo: 'canvas', elementos: [] } })).resolves.toBeUndefined()
    expect(eq).toHaveBeenCalledWith('id', 'slide-1')
  })

  it('falla explícitamente si RLS o el id impiden actualizar la fila', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const eq = vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle })) }))
    update.mockReturnValue({ eq })

    await expect(actualizarMedio('slide-unknown', { contenido: {} }))
      .rejects.toThrow('No se encontró la diapositiva para actualizar')
  })
})
