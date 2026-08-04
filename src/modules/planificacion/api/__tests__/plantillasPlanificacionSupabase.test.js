import { describe, it, expect, beforeEach, vi } from 'vitest'

const { rpcMock, fromMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
}))

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    rpc: rpcMock,
    from: fromMock,
  },
}))

function makePlantillaChain(response) {
  const single = vi.fn().mockResolvedValue(response)
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const upsert = vi.fn(() => ({ select }))
  return { insert, upsert, select, single }
}

function makeIndicatorsChain(response) {
  const select = vi.fn(() => Promise.resolve(response))
  const upsert = vi.fn(() => ({ select }))
  return { upsert, select }
}

describe('plantillasPlanificacionSupabase.guardarArbolCurricular', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usa fallback directo cuando la RPC no está disponible en schema cache', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST202',
        message: 'Could not find the function public.fn_sincronizar_arbol_curricular(p_clase_id, p_nombre, p_objetivos, p_plantilla_id) in the schema cache',
      },
    })

    const plantillaChain = makePlantillaChain({ data: { id: 'plan-1' }, error: null })
    const indicatorsChain = makeIndicatorsChain({ data: [{ id: '123e4567-e89b-12d3-a456-426614174000' }], error: null })

    fromMock.mockImplementation((table) => {
      if (table === 'plantillas_planificacion') return plantillaChain
      if (table === 'indicators') return indicatorsChain
      throw new Error(`Unexpected table: ${table}`)
    })

    const { guardarArbolCurricular } = await import('../plantillasPlanificacionSupabase.js')

    const result = await guardarArbolCurricular({
      plantillaId: null,
      claseId: 'clase-1',
      nombre: 'Plan Curricular Institucional',
      unidades: [
        {
          id: 'u-1',
          titulo: 'Unidad 1',
          objetivos: [
            {
              id: 'o-1',
              titulo: 'Objetivo 1',
              indicadores: [
                {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  titulo: 'Indicador 1',
                  descripcion: 'Indicador 1',
                },
              ],
            },
          ],
        },
      ],
    })

    expect(rpcMock).toHaveBeenCalledWith('fn_sincronizar_arbol_curricular', expect.objectContaining({
      p_clase_id: 'clase-1',
      p_nombre: 'Plan Curricular Institucional',
    }))
    expect(fromMock).toHaveBeenCalledWith('plantillas_planificacion')
    expect(fromMock).toHaveBeenCalledWith('indicators')
    expect(result.plantillaId).toBe('plan-1')
    expect(result.unidades[0].persistido).toBe(true)
    expect(result.unidades[0].objetivos[0].indicadores[0].persistido).toBe(true)
  })
})

describe('plantillasPlanificacionSupabase.obtenerPlantillasPlanificacion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('consulta clase_id para permitir que el diseñador encuentre la plantilla vinculada', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'plan-1',
          clase_id: 'clase-1',
          nombre: 'Plan real',
        },
      ],
      error: null,
    })
    const eq = vi.fn(() => ({ order }))
    const select = vi.fn(() => ({ eq }))
    fromMock.mockReturnValue({ select })

    const { obtenerPlantillasPlanificacion } = await import('../plantillasPlanificacionSupabase.js')
    const result = await obtenerPlantillasPlanificacion()

    expect(select).toHaveBeenCalledWith('id, clase_id, nombre, objetivos, contenido, recursos, evaluacion_metodo')
    expect(eq).toHaveBeenCalledWith('activo', true)
    expect(order).toHaveBeenCalledWith('nombre')
    expect(result).toEqual([
      {
        id: 'plan-1',
        clase_id: 'clase-1',
        nombre: 'Plan real',
      },
    ])
  })
})
