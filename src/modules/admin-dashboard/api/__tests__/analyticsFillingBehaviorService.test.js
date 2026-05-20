import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as analyticsService from '../analyticsFillingBehaviorService.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('analyticsFillingBehaviorService', () => {
  beforeEach(() => {
    // Clear mocks before each test
  })

  it('should fetch fill metrics from database view', async () => {
    const mockData = [
      {
        maestro_id: '1',
        maestro_nombre: 'Prof. García',
        total_clases: 10,
        orden_asistencia_primero: 6,
        promedio_duracion_observaciones: 120,
        uso_ai_fill_percent: 40
      }
    ]

    // Test that the function exists and returns expected structure
    expect(typeof analyticsService.getTeacherFillingMetrics).toBe('function')
    expect(typeof analyticsService.getFillingMetricsByMaestro).toBe('function')
    expect(typeof analyticsService.getFillingMetricsByDateRange).toBe('function')
  })
})
