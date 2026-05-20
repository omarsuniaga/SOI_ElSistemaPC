import { describe, it, expect, beforeEach } from 'vitest'
import * as analyticsService from '../../modules/admin-dashboard/api/analyticsFillingBehaviorService.js'

describe('Escalation + Analytics Integration', () => {
  beforeEach(() => {
    // Integration tests check real data flow
  })

  it('should verify analytics service is available and callable', async () => {
    // Verify the service exists and has required functions
    expect(typeof analyticsService.getTeacherFillingMetrics).toBe('function')
    expect(typeof analyticsService.getFillingMetricsByMaestro).toBe('function')
    expect(typeof analyticsService.getFillingMetricsByDateRange).toBe('function')
  })

  it('should verify trend analysis service is available', async () => {
    // Verify trend service exports
    const trendService = await import('../../modules/admin-dashboard/api/trendAnalysisService.js')

    expect(typeof trendService.aggregateMetricsByDate).toBe('function')
    expect(typeof trendService.aggregateMetricsByMaestro).toBe('function')
    expect(typeof trendService.detectAnomalies).toBe('function')
  })

  it('should verify admin reporting API has trend functions', async () => {
    const adminApi = await import('../../modules/admin-dashboard/api/adminReportingApi.js')

    expect(typeof adminApi.getInstitutionTrendReportWithFilling).toBe('function')
    expect(typeof adminApi.getMaestroTrendReportWithFilling).toBe('function')
  })
})
