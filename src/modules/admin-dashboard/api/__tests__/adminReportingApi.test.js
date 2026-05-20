import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as adminReportingApi from '../adminReportingApi.js'
import * as analyticsService from '../analyticsFillingBehaviorService.js'
import * as trendService from '../trendAnalysisService.js'

vi.mock('../analyticsFillingBehaviorService.js')
vi.mock('../trendAnalysisService.js')

describe('adminReportingApi trend functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate institution trend report with filling behavior', async () => {
    const mockMetrics = [
      { maestro_id: '1', maestro_nombre: 'García', fecha: '2026-05-20', orden_asistencia_primero: 1, uso_ai_fill_percent: 50 },
      { maestro_id: '1', maestro_nombre: 'García', fecha: '2026-05-21', orden_asistencia_primero: 0, uso_ai_fill_percent: 100 }
    ]

    analyticsService.getTeacherFillingMetrics.mockResolvedValueOnce(mockMetrics)
    trendService.aggregateMetricsByDate.mockReturnValueOnce({
      '2026-05-20': { total_classes: 1, asistencia_first_percent: '100.0', avg_ai_usage_percent: '50.0' }
    })
    trendService.aggregateMetricsByMaestro.mockReturnValueOnce({
      '1': { maestro_nombre: 'García', total_classes: 2, asistencia_first_percent: '50.0' }
    })

    const result = await adminReportingApi.getInstitutionTrendReportWithFilling(30)

    expect(result).toHaveProperty('institution_summary')
    expect(result).toHaveProperty('date_trends')
    expect(result).toHaveProperty('maestro_trends')
    expect(analyticsService.getTeacherFillingMetrics).toHaveBeenCalled()
  })
})
