import { describe, expect, it, vi, beforeEach } from 'vitest'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  fetchSeguimientoAlumnos,
  getDefaultSeguimientoPeriod,
  mapSeguimientoAlumnoRow,
} from '../services/seguimientoAlumnosService.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

describe('seguimientoAlumnosService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps RPC rows to the view model', () => {
    const result = mapSeguimientoAlumnoRow({
      alumno_id: 'a-1',
      nombre_completo: 'Ana Rivera',
      instrumento_principal: 'Piano',
      asistencia_total: 10,
      asistencia_presentes: 6,
      asistencia_rate: 0.6,
      progreso_count: 3,
      progreso_promedio: 5.5,
      observaciones_count: 2,
      risk_reasons: ['asistencia', 'calificacion'],
      en_riesgo: true,
      risk_score: 70,
      nivel_riesgo: 'alto',
    })

    expect(result).toMatchObject({
      id: 'a-1',
      nombre_completo: 'Ana Rivera',
      asistencia: { total: 10, presentes: 6, rate: 0.6 },
      progreso: { count: 3, promedio: 5.5 },
      risk_reasons: ['asistencia', 'calificacion'],
      en_riesgo: true,
      nivel_riesgo: 'alto',
    })
  })

  it('calls the paginated Seguimiento RPC with filters', async () => {
    supabase.rpc.mockResolvedValue({
      data: [
        {
          alumno_id: 'a-1',
          nombre_completo: 'Ana Rivera',
          asistencia_total: 4,
          asistencia_presentes: 2,
          risk_reasons: ['asistencia'],
          en_riesgo: true,
          risk_score: 40,
          total_count: 10,
          risk_count: 3,
        },
      ],
      error: null,
    })

    const result = await fetchSeguimientoAlumnos({
      desde: '2026-06-01',
      hasta: '2026-06-30',
      limit: 25,
      offset: 50,
      busqueda: 'ana',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('analizar_seguimiento_alumnos', {
      p_desde: '2026-06-01',
      p_hasta: '2026-06-30',
      p_limit: 25,
      p_offset: 50,
      p_busqueda: 'ana',
    })
    expect(result.totalCount).toBe(10)
    expect(result.riskCount).toBe(3)
    expect(result.alumnos).toHaveLength(1)
  })

  it('builds a 28-day default period', () => {
    const period = getDefaultSeguimientoPeriod(new Date('2026-06-18T12:00:00Z'))
    expect(period).toEqual({ desde: '2026-05-21', hasta: '2026-06-18' })
  })
})
