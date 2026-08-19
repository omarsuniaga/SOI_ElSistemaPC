import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => {
  const fromMock = vi.fn()
  return {
    supabase: {
      from: fromMock,
    },
  }
})

import { supabase } from '../../../lib/supabaseClient.js'
import { getRuleEffectiveness } from '../api/tareasSupabase.js'

describe('Rules Effectiveness Suite (Phase 4D)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getRuleEffectiveness should fetch reactive rule statistics', async () => {
    const mockStats = [
      { rule_type: 'R1', nombre: 'Ausencia Acumulada', total_activaciones: 10, casos_resueltos: 9, tasa_exito: 90.0 },
      { rule_type: 'R6', nombre: 'WhatsApp Padres', total_activaciones: 5, casos_resueltos: 5, tasa_exito: 100.0 },
    ]

    const orderMock = vi.fn().mockResolvedValueOnce({ data: mockStats, error: null })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    supabase.from.mockReturnValue({ select: selectMock })

    const res = await getRuleEffectiveness()

    expect(supabase.from).toHaveBeenCalledWith('soi_rule_effectiveness')
    expect(selectMock).toHaveBeenCalledWith('*')
    expect(orderMock).toHaveBeenCalledWith('rule_type', { ascending: true })
    expect(res).toEqual(mockStats)
  })
})
