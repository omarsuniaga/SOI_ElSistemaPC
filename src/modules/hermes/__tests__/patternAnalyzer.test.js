import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => {
  const fromMock = vi.fn()
  const functionsMock = {
    invoke: vi.fn(),
  }
  return {
    supabase: {
      from: fromMock,
      functions: functionsMock,
    },
  }
})

import { supabase } from '../../../lib/supabaseClient.js'
import { getUltimoAnalisisSemanal, ejecutarAnalisisPatrones } from '../api/tareasSupabase.js'

describe('Pattern Analyzer Suite (Phase 4C)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUltimoAnalisisSemanal should query soi_analisis_semanal and return latest record', async () => {
    const mockAnalisis = {
      id: 'a-1',
      resumen_ejecutivo: 'Operación institucional estable con 120 eventos.',
      patrones: ['Concentración de asistencias en horario vespertino'],
      tendencias: ['Incremento en tasa de resolución de tareas'],
      recomendaciones: ['Reforzar seguimiento a alumnos con inasistencias'],
      created_at: new Date().toISOString(),
    }

    const maybeSingleMock = vi.fn().mockResolvedValueOnce({ data: mockAnalisis, error: null })
    const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    supabase.from.mockReturnValue({ select: selectMock })

    const res = await getUltimoAnalisisSemanal()

    expect(supabase.from).toHaveBeenCalledWith('soi_analisis_semanal')
    expect(selectMock).toHaveBeenCalledWith('*')
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(res).toEqual(mockAnalisis)
  })

  it('ejecutarAnalisisPatrones should invoke soi-pattern-analyzer edge function', async () => {
    const mockAnalisisResult = {
      ok: true,
      analisis: {
        id: 'a-2',
        resumen_ejecutivo: 'Análisis generado con Groq AI.',
        patrones: ['Patrón A'],
        tendencias: ['Tendencia B'],
        recomendaciones: ['Recomendación C'],
      },
    }

    supabase.functions.invoke.mockResolvedValueOnce({ data: mockAnalisisResult, error: null })

    const res = await ejecutarAnalisisPatrones()

    expect(supabase.functions.invoke).toHaveBeenCalledWith('soi-pattern-analyzer', {
      method: 'POST',
    })
    expect(res).toEqual(mockAnalisisResult.analisis)
  })
})
