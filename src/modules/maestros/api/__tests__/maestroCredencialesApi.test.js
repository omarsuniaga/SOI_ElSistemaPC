import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import {
  obtenerEstadoCredencialesMaestro,
  revelarCredencialesMaestro,
  generarCredencialesMaestro,
} from '../maestroCredencialesApi.js'

describe('maestroCredencialesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('consulta el estado de credenciales del maestro', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { ok: true, maestroId: 'm1', hasCredentials: true },
      error: null,
    })

    const result = await obtenerEstadoCredencialesMaestro('m1')

    expect(supabase.functions.invoke).toHaveBeenCalledWith('maestro-credentials', {
      body: { action: 'status', maestroId: 'm1' },
    })
    expect(result.hasCredentials).toBe(true)
  })

  it('propaga el error del backend al revelar credenciales', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { ok: false, error: 'Todavía no existe una contraseña' },
      error: null,
    })

    await expect(revelarCredencialesMaestro('m1')).rejects.toThrow(
      'Todavía no existe una contraseña',
    )
  })

  it('valida maestroId antes de generar credenciales', async () => {
    await expect(generarCredencialesMaestro('')).rejects.toThrow('El maestroId es obligatorio')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })
})
