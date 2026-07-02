import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'acm_weekly_plans_demo'
const PROGRESS_STORAGE_KEY = 'student_indicator_progress_demo'
const TEACHER_ADJUSTMENTS_STORAGE_KEY = 'acm_teacher_plan_adjustments_demo'

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PROGRESS_STORAGE_KEY)
  localStorage.removeItem(TEACHER_ADJUSTMENTS_STORAGE_KEY)
}

async function flushPromises(ms = 150) {
  await new Promise((r) => setTimeout(r, ms))
}

describe('weeklyPlanAdapter routing & mock lifecycle', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('should route and fetch curriculum sources in demo mode', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/weeklyPlanAdapter.js')
    await flushPromises()

    const sources = await adapter.obtenerFuentesCurriculares()
    expect(Array.isArray(sources)).toBe(true)
    expect(sources.length).toBe(2)
    expect(sources[0].id).toBe('source-violin-rector')
    expect(sources[1].id).toBe('source-manuel-inicial')
  })

  it('should fetch weekly plan items by level', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/weeklyPlanAdapter.js')
    await flushPromises()

    const plan = await adapter.obtenerPlanSemanalPorNivel('pnivel_001', 'violín')
    expect(plan).toBeDefined()
    expect(plan.id).toBe('wplan-violin-n0')
    expect(Array.isArray(plan.items)).toBe(true)
    expect(plan.items.length).toBe(6)
    expect(plan.items[0].week_number).toBe(1)
    expect(plan.items[0].topic).toContain('Diagnóstico')
  })

  it('should expose curriculum versions and publish one in demo mode', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/weeklyPlanAdapter.js')
    await flushPromises()

    const versions = await adapter.obtenerVersionesCurriculares()
    expect(Array.isArray(versions)).toBe(true)
    expect(versions.length).toBeGreaterThan(0)

    const published = await adapter.publicarVersionCurricular(versions[0].id)
    expect(published.id).toBe(versions[0].id)
    expect(published.status).toBe('active')
  })

  it('should create and update active route status', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/weeklyPlanAdapter.js')
    await flushPromises()

    const newRoute = await adapter.crearRutaActiva({
      weekly_plan_id: 'wplan-violin-n0',
      teacher_id: 'maestro_999',
      group_id: 'clase_999',
      level_id: 'pnivel_001'
    })

    expect(newRoute.id).toBeDefined()
    expect(newRoute.teacher_id).toBe('maestro_999')
    expect(newRoute.current_week).toBe(1)

    const updated = await adapter.actualizarSemanaRutaActiva(newRoute.id, 4)
    expect(updated.current_week).toBe(4)
  })

  it('should keep a single active route per class in demo mode', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/weeklyPlanAdapter.js')
    await flushPromises()

    const firstRoute = await adapter.crearRutaActiva({
      weekly_plan_id: 'wplan-violin-n0',
      teacher_id: 'maestro_999',
      group_id: 'clase_unica',
      level_id: 'pnivel_001',
    })

    const secondRoute = await adapter.crearRutaActiva({
      weekly_plan_id: 'wplan-violin-n0',
      teacher_id: 'maestro_999',
      group_id: 'clase_unica',
      level_id: 'pnivel_001',
    })

    const activeRoutes = await adapter.obtenerRutasActivas('maestro_999')
    const sameGroupRoutes = activeRoutes.filter((route) => route.group_id === 'clase_unica')
    const activeSameGroupRoutes = sameGroupRoutes.filter((route) => route.status === 'active')

    expect(activeSameGroupRoutes).toHaveLength(1)
    expect(activeSameGroupRoutes[0].id).toBe(secondRoute.id)

    const archivedFirstRoute = sameGroupRoutes.find((route) => route.id === firstRoute.id)
    expect(archivedFirstRoute?.status).toBe('archived')

    const resolvedActiveRoute = await adapter.obtenerRutaActivaPorGrupo('clase_unica')
    expect(resolvedActiveRoute?.id).toBe(secondRoute.id)
  })

  it('should register and fetch student indicator progress maps', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/weeklyPlanAdapter.js')
    await flushPromises()

    const progress = await adapter.registrarProgresoIndicador(
      'student_001',
      'pind_001',
      'achieved',
      'Excelente postura hoy',
      'http://storage/evidence.mp4'
    )

    expect(progress.id).toBeDefined()
    expect(progress.status).toBe('achieved')
    expect(progress.observation).toBe('Excelente postura hoy')

    const map = await adapter.obtenerProgresoGrupo('clase_001')
    expect(map['student_001_pind_001']).toBeDefined()
    expect(map['student_001_pind_001'].status).toBe('achieved')
  })

  it('should save and retrieve controlled teacher plan adjustments in demo mode', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/weeklyPlanAdapter.js')
    await flushPromises()

    const saved = await adapter.guardarAjustePlanDocente({
      group_id: 'clase_001',
      teacher_id: 'maestro_001',
      weekly_plan_id: 'wplan-violin-n0',
      week_number: 1,
      teacher_strategy: 'Trabajo por estaciones y modelado.',
      student_activity: 'Rotación breve por postura y arco.',
      homework: 'Práctica guiada de 3 minutos.',
      evidence: 'Video corto de postura.',
      teacher_notes: 'Se adaptó por heterogeneidad del grupo.',
    })

    expect(saved.week_number).toBe(1)
    expect(saved.teacher_strategy).toContain('estaciones')

    const adjustments = await adapter.obtenerAjustesPlanDocente(
      'clase_001',
      'maestro_001',
      'wplan-violin-n0',
    )

    expect(adjustments).toHaveLength(1)
    expect(adjustments[0].teacher_notes).toContain('heterogeneidad')
  })
})
