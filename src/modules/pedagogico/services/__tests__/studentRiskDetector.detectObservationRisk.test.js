import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectObservationRisk } from '../studentRiskDetectorService.js'
import { supabase } from '../../../../lib/supabaseClient.js'
import { getActiveRuleByTipo } from '../seguimientoRulesService.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

vi.mock('../seguimientoRulesService.js', () => ({
  getActiveRuleByTipo: vi.fn(),
}))

const ACTIVE_RULE = {
  tipo: 'observacion_requiere_seguimiento',
  activo: true,
  config: {},
}

function mockChain(data) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    then: vi.fn((onFulfilled) => Promise.resolve(data).then(onFulfilled)),
  }
  return chain
}

function setupMocks({ perfilData }) {
  supabase.from.mockImplementation((table) => {
    if (table === 'perfil_conocimiento') {
      return mockChain({ data: perfilData || [], error: null })
    }
    return mockChain({ data: [], error: null })
  })
}

describe('detectObservationRisk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActiveRuleByTipo.mockResolvedValue(ACTIVE_RULE)
  })

  it('returns null when no active rule', async () => {
    getActiveRuleByTipo.mockResolvedValue(null)
    const result = await detectObservationRisk('alumno-1')
    expect(result).toBeNull()
  })

  it('returns null with count 0 when no problem assertions exist', async () => {
    setupMocks({ perfilData: [] })
    const result = await detectObservationRisk('alumno-1')
    expect(result.level).toBeNull()
    expect(result.count).toBe(0)
    expect(result.razon).toBeNull()
  })

  it('returns bajo for 1 problem assertion', async () => {
    setupMocks({
      perfilData: [
        {
          id: 'p1',
          item: 'Falta a clases',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
      ],
    })
    const result = await detectObservationRisk('alumno-1')
    expect(result.level).toBe('bajo')
    expect(result.count).toBe(1)
  })

  it('returns medio for 2 problem assertions', async () => {
    setupMocks({
      perfilData: [
        {
          id: 'p1',
          item: 'Falta a clases',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
        {
          id: 'p2',
          item: 'No trae instrumento',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
      ],
    })
    const result = await detectObservationRisk('alumno-1')
    expect(result.level).toBe('medio')
    expect(result.count).toBe(2)
  })

  it('returns alto for 3 problem assertions', async () => {
    setupMocks({
      perfilData: [
        {
          id: 'p1',
          item: 'Falta a clases',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
        {
          id: 'p2',
          item: 'No trae instrumento',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
        {
          id: 'p3',
          item: 'Llega tarde',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
      ],
    })
    const result = await detectObservationRisk('alumno-1')
    expect(result.level).toBe('alto')
    expect(result.count).toBe(3)
  })

  it('returns alto for 5 problem assertions (3+ bucket)', async () => {
    setupMocks({
      perfilData: [
        {
          id: 'p1',
          item: 'Falta a clases',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
        {
          id: 'p2',
          item: 'No trae instrumento',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
        {
          id: 'p3',
          item: 'Llega tarde',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
        {
          id: 'p4',
          item: 'No practica',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
        {
          id: 'p5',
          item: 'Mal comportamiento',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
      ],
    })
    const result = await detectObservationRisk('alumno-1')
    expect(result.level).toBe('alto')
    expect(result.count).toBe(5)
  })

  it('only counts dimension=problema (DB-level filter)', async () => {
    // The DB query filters dimension='problema', so mock only returns problema rows
    setupMocks({
      perfilData: [
        {
          id: 'p1',
          item: 'Falta a clases',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
      ],
    })
    const result = await detectObservationRisk('alumno-1')
    expect(result.count).toBe(1)
    expect(result.level).toBe('bajo')
  })

  it('only counts estado=confirmado (DB-level filter)', async () => {
    // The DB query filters estado='confirmado', so mock only returns confirmado rows
    setupMocks({
      perfilData: [
        {
          id: 'p1',
          item: 'Falta a clases',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
      ],
    })
    const result = await detectObservationRisk('alumno-1')
    expect(result.count).toBe(1)
    expect(result.level).toBe('bajo')
  })

  it('returns correct result structure', async () => {
    setupMocks({
      perfilData: [
        {
          id: 'p1',
          item: 'Falta a clases',
          dimension: 'problema',
          estado: 'confirmado',
          confianza: 1.0,
        },
      ],
    })
    const result = await detectObservationRisk('alumno-1')
    expect(result).toHaveProperty('tipo', 'observacion_requiere_seguimiento')
    expect(result).toHaveProperty('count')
    expect(result).toHaveProperty('level')
    expect(result).toHaveProperty('razon')
    expect(result.razon).toContain('problema')
  })

  it('queries perfil_conocimiento table with dimension and estado filters', async () => {
    // Track eq calls manually
    const eqCalls = []
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn((...args) => {
        eqCalls.push(args)
        return chain
      }),
      then: vi.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled)),
    }
    supabase.from.mockReturnValue(chain)

    await detectObservationRisk('alumno-99')

    expect(supabase.from).toHaveBeenCalledWith('perfil_conocimiento')
    expect(eqCalls).toContainEqual(['alumno_id', 'alumno-99'])
    expect(eqCalls).toContainEqual(['dimension', 'problema'])
    expect(eqCalls).toContainEqual(['estado', 'confirmado'])
  })
})
