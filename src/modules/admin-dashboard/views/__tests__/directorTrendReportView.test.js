import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { directorTrendReportView } from '../directorTrendReportView.js'
import * as adminReportingApi from '../../api/adminReportingApi.js'

vi.mock('../../api/adminReportingApi.js', () => ({
  getInstitutionTrendReportWithFilling: vi.fn()
}))

describe('directorTrendReportView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'trend-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('should load and render institution trend data', async () => {
    const mockTrendData = {
      institution_summary: {
        avg_ai_usage_institution: 45.5,
        asistencia_first_percent: 60.0,
        observaciones_first_percent: 30.0
      },
      date_trends: {
        '2026-05-20': { total_classes: 10, asistencia_first_percent: '60.0', avg_ai_usage_percent: '45.5' }
      },
      maestro_trends: {
        '1': { maestro_nombre: 'García', asistencia_first_percent: '70.0' }
      },
      generatedAt: new Date().toISOString()
    }

    adminReportingApi.getInstitutionTrendReportWithFilling.mockResolvedValueOnce(mockTrendData)

    const view = directorTrendReportView('trend-container')
    await view.init()

    expect(container.textContent).toContain('Reporte de Tendencias')
    expect(container.textContent).toContain('45.5') // AI usage
    expect(container.textContent).toContain('60.0') // asistencia first
  })
})
