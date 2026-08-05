import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockData = null
let mockError = null

const mockRpc = vi.fn()
const mockFrom = vi.fn()
const mockOrder = vi.fn(() => Promise.resolve({ data: mockData, error: mockError }))
const mockSelect = vi.fn(() => ({ order: mockOrder }))

vi.mock('../../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    rpc: (...args) => mockRpc(...args),
  },
}))

import { fusionarAlumnos, obtenerTodosLosAlumnosParaAnalisis } from '../../../src/modules/alumnos/api/alumnosSupabase.js'

describe('fusionarAlumnos (adapter supabase)', () => {
  beforeEach(() => {
    mockData = null
    mockError = null
    vi.clearAllMocks()
    mockRpc.mockResolvedValue({ data: { success: true, principal_id: 'p1', tablas_migradas: [] }, error: null })
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ order: mockOrder })
  })

  it('llama al RPC fn_fusionar_alumnos_duplicados con los ids y datos', async () => {
    await fusionarAlumnos({
      principalId: 'p1',
      obsoletoId: 'o1',
      datosFusion: { nombre_completo: 'Luis Eduardo Martinez Obando' },
    })
    expect(mockRpc).toHaveBeenCalledWith('fn_fusionar_alumnos_duplicados', {
      p_principal_id: 'p1',
      p_obsoleto_id: 'o1',
      p_datos_fusion: { nombre_completo: 'Luis Eduardo Martinez Obando' },
    })
  })

  it('rechaza ids vacíos o iguales', async () => {
    await expect(fusionarAlumnos({ principalId: '', obsoletoId: 'o1' })).rejects.toThrow()
    await expect(fusionarAlumnos({ principalId: 'x', obsoletoId: 'x' })).rejects.toThrow()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('lanza error si el RPC falla', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RLS bloqueado' } })
    await expect(fusionarAlumnos({ principalId: 'p', obsoletoId: 'o', datosFusion: {} })).rejects.toThrow(/fusionar/i)
  })

  it('lanza error si el RPC responde success=false', async () => {
    mockRpc.mockResolvedValue({ data: { success: false, message: 'No existe' }, error: null })
    await expect(fusionarAlumnos({ principalId: 'p', obsoletoId: 'o', datosFusion: {} })).rejects.toThrow()
  })

  it('resuelve cuando el RPC confirma la fusión', async () => {
    const res = await fusionarAlumnos({ principalId: 'p1', obsoletoId: 'o1', datosFusion: {} })
    expect(res.success).toBe(true)
  })
})

describe('obtenerTodosLosAlumnosParaAnalisis (adapter supabase)', () => {
  beforeEach(() => {
    mockData = null
    mockError = null
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ order: mockOrder })
  })

  it('normaliza los alumnos devueltos', async () => {
    mockData = [
      {
        id: '1',
        nombre_completo: 'Luis Martinez',
        correo_representante: 'lm@x.com',
        instrumento_principal: 'Violín',
        activo: true,
      },
    ]
    mockOrder.mockResolvedValue({ data: mockData, error: null })
    const res = await obtenerTodosLosAlumnosParaAnalisis()
    expect(res[0].nombre).toBe('Luis Martinez')
    expect(res[0].email).toBe('lm@x.com')
  })

  it('lanza error si la consulta falla', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'boom' } })
    await expect(obtenerTodosLosAlumnosParaAnalisis()).rejects.toThrow(/duplicados/i)
  })
})