import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => {
  const rpcMock = vi.fn()
  const fromMock = vi.fn()
  return {
    supabase: {
      rpc: rpcMock,
      from: fromMock,
    },
  }
})

import { supabase } from '../../../lib/supabaseClient.js'
import { getPulsoScore, getPulsoScoreHistory } from '../api/tareasSupabase.js'

describe('Pulso Score Suite (Phase 4B)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getPulsoScore should call fn_calcular_pulso_score RPC and return normalized score', async () => {
    const mockScoreResponse = {
      score: 87.5,
      nivel: 'optimo',
      componentes: {
        asistencia_pct: 92.0,
        tareas_tiempo_pct: 85.0,
        cobertura_registro_pct: 80.0,
        penalizacion_vencidas_pct: 100.0,
      },
      conteos: {
        asistencias_total_7d: 150,
        asistencias_presentes_7d: 138,
        tareas_completadas_30d: 20,
        tareas_a_tiempo_30d: 17,
        sesiones_7d: 25,
        sesiones_con_asistencia_7d: 20,
        tareas_activas: 10,
        tareas_vencidas_activas: 0,
      },
      calculado_at: new Date().toISOString(),
    }

    supabase.rpc.mockResolvedValueOnce({ data: mockScoreResponse, error: null })

    const result = await getPulsoScore(true)

    expect(supabase.rpc).toHaveBeenCalledWith('fn_calcular_pulso_score', {
      p_persistir: true,
    })
    expect(result).toEqual(mockScoreResponse)
    expect(result.score).toBe(87.5)
    expect(result.nivel).toBe('optimo')
  })

  it('getPulsoScoreHistory should fetch recent scores ordered by calculated date', async () => {
    const mockHistory = [
      { id: 'h-1', score: 87.5, nivel: 'optimo', calculado_at: '2026-08-18T18:00:00Z' },
      { id: 'h-2', score: 82.0, nivel: 'optimo', calculado_at: '2026-08-18T12:00:00Z' },
    ]

    const limitMock = vi.fn().mockResolvedValueOnce({ data: mockHistory, error: null })
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    supabase.from.mockReturnValue({ select: selectMock })

    const res = await getPulsoScoreHistory(5)

    expect(supabase.from).toHaveBeenCalledWith('pulso_score_history')
    expect(selectMock).toHaveBeenCalledWith('*')
    expect(orderMock).toHaveBeenCalledWith('calculado_at', { ascending: false })
    expect(limitMock).toHaveBeenCalledWith(5)
    expect(res).toEqual(mockHistory)
  })
})
