import { beforeEach, describe, expect, it, vi } from 'vitest'

const WEEKLY_PLAN_STORAGE_KEY = 'acm_weekly_plans_demo'

describe('academicAdminApi ACM assignment matrix', () => {
  beforeEach(() => {
    localStorage.removeItem(WEEKLY_PLAN_STORAGE_KEY)
    vi.resetModules()
  })

  it('builds the ACM planning assignment matrix in demo mode', async () => {
    vi.doMock('../../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))

    const api = await import('../academicAdminApi.js')
    const rows = await api.getPlanningAssignmentMatrix()

    expect(Array.isArray(rows)).toBe(true)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0]).toHaveProperty('clase_id')
    expect(rows[0]).toHaveProperty('ruta_nombre')
  })

  it('reassigns a class route and keeps a single active guide per class in demo mode', async () => {
    vi.doMock('../../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))

    const api = await import('../academicAdminApi.js')
    const routes = await api.listAssignableRoutes()

    await api.updateClassRouteAssignment('clase_001', routes[0].id)

    const raw = JSON.parse(localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY))
    const activeRoutes = raw.active_routes.filter(
      (route) => route.group_id === 'clase_001' && route.status === 'active',
    )

    expect(activeRoutes).toHaveLength(1)
    expect(activeRoutes[0].weekly_plan_id).toBe(routes[0].id)
  })
})
