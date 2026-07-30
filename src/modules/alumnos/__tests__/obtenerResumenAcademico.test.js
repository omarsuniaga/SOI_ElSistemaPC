import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { obtenerResumenAcademico } from '../api/alumnosSupabase.js'

function mockTables({ alumno, evaluaciones }) {
  supabase.from.mockImplementation((table) => {
    if (table === 'alumnos') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: alumno, error: null }),
      }
    }
    if (table === 'progresos') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockResolvedValue({ data: evaluaciones, error: null }),
      }
    }
    throw new Error(`unexpected table ${table}`)
  })
}

describe('obtenerResumenAcademico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('treats the base average as one more data point, diluting it as real evaluations come in', async () => {
    // base 50 (escala 0-100) + una evaluación de 4/5 (=80 en 0-100) -> promedio (50+80)/2 = 65
    mockTables({
      alumno: { nivel: 'basico', promedio_notas: 50 },
      evaluaciones: [{ calificacion: 4, fecha_evaluacion: '2026-06-01', contenido_dsl: 'Escalas' }],
    })

    const resumen = await obtenerResumenAcademico('alumno-1')

    expect(resumen.nivel).toBe('basico')
    expect(resumen.promedioBase).toBe(50)
    expect(resumen.totalEvaluaciones).toBe(1)
    expect(resumen.promedioEvaluaciones).toBe(80)
    expect(resumen.promedioActualizado).toBe(65)
  })

  it('returns only the base when there are no teacher evaluations yet', async () => {
    mockTables({ alumno: { nivel: 'intermedio', promedio_notas: 72 }, evaluaciones: [] })

    const resumen = await obtenerResumenAcademico('alumno-2')

    expect(resumen.promedioBase).toBe(72)
    expect(resumen.totalEvaluaciones).toBe(0)
    expect(resumen.promedioEvaluaciones).toBeNull()
    expect(resumen.promedioActualizado).toBe(72)
  })

  it('averages only the evaluations when there is no base yet (alumno never reconciled)', async () => {
    mockTables({
      alumno: { nivel: null, promedio_notas: null },
      evaluaciones: [{ calificacion: 3 }, { calificacion: 5 }],
    })

    const resumen = await obtenerResumenAcademico('alumno-3')

    expect(resumen.promedioBase).toBeNull()
    // (60 + 100) / 2 = 80
    expect(resumen.promedioActualizado).toBe(80)
  })

  it('returns all nulls when there is neither base nor evaluations', async () => {
    mockTables({ alumno: { nivel: null, promedio_notas: null }, evaluaciones: [] })

    const resumen = await obtenerResumenAcademico('alumno-4')

    expect(resumen.promedioBase).toBeNull()
    expect(resumen.promedioActualizado).toBeNull()
  })
})
