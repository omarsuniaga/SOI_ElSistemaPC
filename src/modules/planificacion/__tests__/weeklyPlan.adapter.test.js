import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'acm_weekly_plans_demo'
const PROGRESS_STORAGE_KEY = 'student_indicator_progress_demo'

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PROGRESS_STORAGE_KEY)
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
})
