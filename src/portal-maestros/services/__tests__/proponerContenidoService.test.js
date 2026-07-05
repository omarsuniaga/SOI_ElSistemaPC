/**
 * Tests para proponerContenidoService.js — curriculo-tres-planos WU #7.
 *
 * enviarPropuesta(estructura, { maestroId, claseId }) resuelve el route_id
 * existente de la clase, inserta una nueva route_version con
 * origen='maestro' y status='propuesta', y en cascada persiste
 * levels -> nodes -> objetivos -> indicators a partir de la estructura ya
 * parseada y validada (planningParserService, WU #4).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { enviarPropuesta } from '../proponerContenidoService.js'

const estructuraValida = {
  niveles: [
    {
      nombre: 'Nivel 1',
      numero_nivel: 1,
      temas: [
        {
          nombre: 'Postura',
          objetivos: [
            {
              nombre: 'Mantener la espalda recta',
              indicadores: [{ descripcion: 'Espalda alineada', es_requerido: true }],
            },
          ],
        },
      ],
    },
  ],
}

/**
 * Simula el router de tablas de Supabase: cada tabla devuelve su propia
 * cadena encadenable, terminando en single() (insert/select por fila) o en
 * order()/limit() (select de lookup).
 */
function setupSupabaseMock({
  routeIdLookup = { data: [{ route_id: 'route-1' }], error: null },
  routeVersionInsert = { data: { id: 'rv-new' }, error: null },
  levelInsert = { data: { id: 'level-1' }, error: null },
  nodeInsert = { data: { id: 'node-1' }, error: null },
  objetivoInsert = { data: { id: 'obj-1' }, error: null },
  indicatorInsert = { data: null, error: null },
} = {}) {
  const chains = {}

  chains.route_versions_lookup = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(routeIdLookup),
  }

  chains.route_versions_insert = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(routeVersionInsert),
  }

  chains.levels = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(levelInsert),
  }

  chains.nodes = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(nodeInsert),
  }

  chains.objetivos = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(objetivoInsert),
  }

  chains.indicators = {
    insert: vi.fn().mockResolvedValue(indicatorInsert),
  }

  let routeVersionsCallCount = 0
  supabase.from.mockImplementation((table) => {
    if (table === 'route_versions') {
      routeVersionsCallCount += 1
      return routeVersionsCallCount === 1 ? chains.route_versions_lookup : chains.route_versions_insert
    }
    return chains[table]
  })

  return chains
}

describe('enviarPropuesta', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resuelve el route_id de la clase e inserta una route_version con origen=maestro y status=propuesta', async () => {
    const chains = setupSupabaseMock()

    const result = await enviarPropuesta(estructuraValida, {
      maestroId: 'maestro-1',
      claseId: 'clase-1',
    })

    expect(chains.route_versions_lookup.eq).toHaveBeenCalledWith('clase_id', 'clase-1')
    expect(chains.route_versions_insert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        route_id: 'route-1',
        origen: 'maestro',
        status: 'propuesta',
        propuesta_por: 'maestro-1',
        clase_id: 'clase-1',
      }),
    )
    expect(result).toEqual({ id: 'rv-new' })
  })

  it('inserta en cascada levels -> nodes -> objetivos -> indicators respetando las FKs reales', async () => {
    const chains = setupSupabaseMock()

    await enviarPropuesta(estructuraValida, { maestroId: 'maestro-1', claseId: 'clase-1' })

    expect(chains.levels.insert).toHaveBeenCalledWith(
      expect.objectContaining({ route_version_id: 'rv-new', level_number: 1, name: 'Nivel 1' }),
    )
    expect(chains.nodes.insert).toHaveBeenCalledWith(
      expect.objectContaining({ level_id: 'level-1', name: 'Postura' }),
    )
    expect(chains.objetivos.insert).toHaveBeenCalledWith(
      expect.objectContaining({ node_id: 'node-1', nombre: 'Mantener la espalda recta' }),
    )
    expect(chains.indicators.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        node_id: 'node-1',
        objetivo_id: 'obj-1',
        description: 'Espalda alineada',
        is_required: true,
      }),
    ])
  })

  it('requiere maestroId y claseId (constraint de la DB los exige para origen=maestro)', async () => {
    await expect(enviarPropuesta(estructuraValida, { claseId: 'clase-1' })).rejects.toThrow(/maestroId/)
    await expect(enviarPropuesta(estructuraValida, { maestroId: 'maestro-1' })).rejects.toThrow(/claseId/)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('nunca usa status distinto de "propuesta" (RLS solo permite ese valor en INSERT)', async () => {
    const chains = setupSupabaseMock()

    await enviarPropuesta(estructuraValida, { maestroId: 'maestro-1', claseId: 'clase-1' })

    const insertedPayload = chains.route_versions_insert.insert.mock.calls[0][0]
    expect(insertedPayload.status).toBe('propuesta')
  })

  it('lanza si no hay ninguna ruta existente asociada a la clase', async () => {
    setupSupabaseMock({ routeIdLookup: { data: [], error: null } })

    await expect(
      enviarPropuesta(estructuraValida, { maestroId: 'maestro-1', claseId: 'clase-1' }),
    ).rejects.toThrow(/ruta/i)
  })

  it('propaga el error si Supabase rechaza el insert de route_version (ej. RLS)', async () => {
    setupSupabaseMock({ routeVersionInsert: { data: null, error: { message: 'RLS violation' } } })

    await expect(
      enviarPropuesta(estructuraValida, { maestroId: 'maestro-1', claseId: 'clase-1' }),
    ).rejects.toThrow(/RLS violation/)
  })
})
