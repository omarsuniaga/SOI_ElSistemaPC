import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectImportantEventsRisk } from '../studentRiskDetectorService.js'
import { supabase } from '../../../../lib/supabaseClient.js'
import { getActiveRuleByTipo } from '../seguimientoRulesService.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

vi.mock('../seguimientoRulesService.js', () => ({
  getActiveRuleByTipo: vi.fn(),
}))

const ACTIVE_RULE = {
  tipo: 'eventos_importantes_ausencia_total',
  activo: true,
  config: {
    motivos: ['Concierto'],
    min_eventos: 1,
    threshold_pct: 75,
    periodo: 'semestral',
    acciones: [
      'Suspensión temporal del alumno',
      'Retención del instrumento',
      'Reunión con representante',
    ],
  },
}

function mockChain(data) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    then: vi.fn((onFulfilled) => Promise.resolve(data).then(onFulfilled)),
  }
}

function setupMocks({ sesiones, emergentes, asistenciasData, asistenciasEmergentes }) {
  supabase.from.mockImplementation((table) => {
    const map = {
      sesiones_clase: mockChain({ data: sesiones || [], error: null }),
      clases_emergentes: mockChain({ data: emergentes || [], error: null }),
      asistencias: mockChain({ data: asistenciasData || [], error: null }),
      asistencias_emergentes: mockChain({ data: asistenciasEmergentes || [], error: null }),
    }
    return map[table] || mockChain({ data: [], error: null })
  })
}

describe('detectImportantEventsRisk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActiveRuleByTipo.mockResolvedValue(ACTIVE_RULE)
  })

  it('returns null when no rule is active', async () => {
    getActiveRuleByTipo.mockResolvedValue(null)
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result).toBeNull()
  })

  it('returns null when no events exist in the period', async () => {
    setupMocks({ sesiones: [], emergentes: [] })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result).toBeNull()
  })

  it('returns null when fewer events than min_eventos', async () => {
    const ruleWithMin2 = {
      ...ACTIVE_RULE,
      config: { ...ACTIVE_RULE.config, min_eventos: 2 },
    }
    getActiveRuleByTipo.mockResolvedValue(ruleWithMin2)
    setupMocks({
      sesiones: [{ id: 's1', fecha: '2026-06-01', motivo: 'Concierto', asistencia: [] }],
      emergentes: [],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result).toBeNull()
  })

  it('returns null when student attended all events', async () => {
    setupMocks({
      sesiones: [{ id: 's1', fecha: '2026-06-01', motivo: 'Concierto', asistencia: [] }],
      emergentes: [],
      asistenciasData: [{ sesion_clase_id: 's1', estado: 'P' }],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.level).toBeNull()
    expect(result.count).toBe(0)
    expect(result.total).toBe(1)
  })

  it('returns critico when student missed ALL events from sesiones_clase (Sistema A)', async () => {
    setupMocks({
      sesiones: [{ id: 's1', fecha: '2026-06-01', motivo: 'Concierto', asistencia: [] }],
      emergentes: [],
      asistenciasData: [{ sesion_clase_id: 's1', estado: 'A' }],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.level).toBe('critico')
    expect(result.count).toBe(1)
    expect(result.total).toBe(1)
    expect(result.razon).toContain('1 ausencia(s) de 1')
    expect(result.accionesSugeridas).toEqual([
      'Suspensión temporal del alumno',
      'Retención del instrumento',
      'Reunión con representante',
    ])
  })

  it('returns critico when student missed ALL events from clases_emergentes (Sistema B)', async () => {
    setupMocks({
      sesiones: [],
      emergentes: [{ id: 'e1', fecha: '2026-06-15', motivo: 'Concierto' }],
      asistenciasEmergentes: [{ clase_emergente_id: 'e1', estado: 'ausente' }],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.level).toBe('critico')
    expect(result.count).toBe(1)
    expect(result.total).toBe(1)
  })

  it('returns critico when student missed events from BOTH systems', async () => {
    setupMocks({
      sesiones: [{ id: 's1', fecha: '2026-06-01', motivo: 'Concierto', asistencia: [] }],
      emergentes: [{ id: 'e1', fecha: '2026-06-15', motivo: 'Concierto' }],
      asistenciasData: [{ sesion_clase_id: 's1', estado: 'A' }],
      asistenciasEmergentes: [{ clase_emergente_id: 'e1', estado: 'ausente' }],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.level).toBe('critico')
    expect(result.count).toBe(2)
    expect(result.total).toBe(2)
    expect(result.eventos).toHaveLength(2)
    expect(result.eventos[0].fuente).toBe('sesiones_clase')
    expect(result.eventos[1].fuente).toBe('clases_emergentes')
  })

  it('returns alto when student missed 1 of 2 events', async () => {
    setupMocks({
      sesiones: [
        { id: 's1', fecha: '2026-06-01', motivo: 'Concierto', asistencia: [] },
        { id: 's2', fecha: '2026-06-15', motivo: 'Concierto', asistencia: [] },
      ],
      emergentes: [],
      asistenciasData: [
        { sesion_clase_id: 's1', estado: 'A' },
        { sesion_clase_id: 's2', estado: 'P' },
      ],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.level).toBe('alto')
    expect(result.count).toBe(1)
    expect(result.total).toBe(2)
  })

  it('falls back to JSONB asistencia when asistencias table has no record', async () => {
    setupMocks({
      sesiones: [
        {
          id: 's1',
          fecha: '2026-06-01',
          motivo: 'Concierto',
          asistencia: [{ alumno_id: 'alumno-1', estado: 'A' }],
        },
      ],
      emergentes: [],
      asistenciasData: [],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.level).toBe('critico')
    expect(result.count).toBe(1)
  })

  it('honors custom motivos from rule config', async () => {
    const customRule = {
      ...ACTIVE_RULE,
      config: { ...ACTIVE_RULE.config, motivos: ['Evento institucional', 'Concierto'] },
    }
    getActiveRuleByTipo.mockResolvedValue(customRule)
    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase')
        return mockChain({
          data: [{ id: 's1', fecha: '2026-07-01', motivo: 'Evento institucional', asistencia: [] }],
          error: null,
        })
      if (table === 'clases_emergentes') return mockChain({ data: [], error: null })
      if (table === 'asistencias')
        return mockChain({ data: [{ sesion_clase_id: 's1', estado: 'A' }], error: null })
      if (table === 'asistencias_emergentes') return mockChain({ data: [], error: null })
      return mockChain({ data: [], error: null })
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.level).toBe('critico')
    expect(result.eventos[0].motivo).toBe('Evento institucional')
  })

  it('sorts events by date ascending', async () => {
    setupMocks({
      sesiones: [
        { id: 's2', fecha: '2026-06-15', motivo: 'Concierto', asistencia: [] },
        { id: 's1', fecha: '2026-06-01', motivo: 'Concierto', asistencia: [] },
      ],
      emergentes: [],
      asistenciasData: [
        { sesion_clase_id: 's1', estado: 'A' },
        { sesion_clase_id: 's2', estado: 'A' },
      ],
    })
    const result = await detectImportantEventsRisk('alumno-1')
    expect(result.eventos[0].fecha).toBe('2026-06-01')
    expect(result.eventos[1].fecha).toBe('2026-06-15')
  })
})
