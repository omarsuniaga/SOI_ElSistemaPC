import { describe, expect, it, vi, beforeEach } from 'vitest'
import { supabase } from '../../../lib/supabaseClient.js'
import { analyzeAllStudentsRisk } from '../services/studentRiskDetectorService.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

vi.mock('../services/seguimientoRulesService.js', () => ({
  getActiveRuleByTipo: vi.fn(),
}))

describe('studentRiskDetectorService analyzeAllStudentsRisk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the paginated Seguimiento RPC instead of browser-side alumno_id batching', async () => {
    supabase.rpc
      .mockResolvedValueOnce({
        data: [
          {
            alumno_id: 'a-1',
            nombre_completo: 'Ana Rivera',
            asistencia_total: 10,
            asistencia_presentes: 5,
            asistencia_rate: 0.5,
            progreso_count: 2,
            progreso_promedio: 8,
            observaciones_count: 0,
            risk_reasons: ['asistencia'],
            en_riesgo: true,
            risk_score: 40,
            nivel_riesgo: 'medio',
            total_count: 2,
            risk_count: 2,
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            alumno_id: 'a-2',
            nombre_completo: 'Luis P?rez',
            asistencia_total: 8,
            asistencia_presentes: 4,
            progreso_count: 1,
            progreso_promedio: 9,
            observaciones_count: 0,
            risk_reasons: ['asistencia'],
            en_riesgo: true,
            risk_score: 40,
            nivel_riesgo: 'medio',
            total_count: 2,
            risk_count: 2,
          },
        ],
        error: null,
      })

    const result = await analyzeAllStudentsRisk({
      period: { from: '2026-06-01', to: '2026-06-30' },
      limit: 1,
    })

    expect(supabase.rpc).toHaveBeenCalledTimes(2)
    expect(supabase.from).not.toHaveBeenCalled()
    expect(supabase.rpc).toHaveBeenNthCalledWith(1, 'analizar_seguimiento_alumnos', expect.objectContaining({
      p_desde: '2026-06-01',
      p_hasta: '2026-06-30',
      p_limit: 1,
      p_offset: 0,
    }))
    expect(supabase.rpc).toHaveBeenNthCalledWith(2, 'analizar_seguimiento_alumnos', expect.objectContaining({
      p_offset: 1,
    }))
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      alumnoId: 'a-1',
      alumnoNombre: 'Ana Rivera',
      nivelRiesgo: 'medio',
      score: 40,
    })
  })
})
