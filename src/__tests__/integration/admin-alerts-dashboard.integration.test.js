import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Admin Alerts + Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should verify admin maestro API has critical maestros function', async () => {
    const adminMaestroApi = await import('../../modules/admin-dashboard/api/adminMaestroApi.js')

    expect(typeof adminMaestroApi.getCriticalMaestros).toBe('function')
    expect(typeof adminMaestroApi.getMaestrosComplianceStatus).toBe('function')
    expect(typeof adminMaestroApi.getMaestroPendingRegistros).toBe('function')
  })

  it('should verify analytics widget component exists', async () => {
    const analyticsWidget = await import('../../modules/admin-dashboard/views/analyticsFillingBehaviorWidget.js')

    expect(typeof analyticsWidget.analyticsFillingBehaviorWidget).toBe('function')
  })

  it('should verify director trend report view exists', async () => {
    const trendView = await import('../../modules/admin-dashboard/views/directorTrendReportView.js')

    expect(typeof trendView.directorTrendReportView).toBe('function')
  })

  it('should verify admin reporting API enhancements are available', async () => {
    const adminReporting = await import('../../modules/admin-dashboard/api/adminReportingApi.js')

    // Verify existing functions
    expect(typeof adminReporting.getInstitutionComplianceSummary).toBe('function')
    expect(typeof adminReporting.getCriticalMaestrosReport).toBe('function')

    // Verify new trend functions added in Phase 2
    expect(typeof adminReporting.getInstitutionTrendReportWithFilling).toBe('function')
    expect(typeof adminReporting.getMaestroTrendReportWithFilling).toBe('function')
  })
})
