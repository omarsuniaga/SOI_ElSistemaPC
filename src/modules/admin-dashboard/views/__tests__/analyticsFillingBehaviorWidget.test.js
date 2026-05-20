import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyticsFillingBehaviorWidget } from '../analyticsFillingBehaviorWidget.js'

describe('analyticsFillingBehaviorWidget', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'analytics-container'
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    container?.remove()
  })

  it('should initialize with loading state', async () => {
    const mockMetrics = []

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMetrics)
      })
    )

    const widget = analyticsFillingBehaviorWidget('analytics-container')
    await widget.init()
    expect(container.innerHTML).toContain('Cargando analítica')
  })

  it('should load metrics from teacher_class_fill_metrics view', async () => {
    const mockMetrics = [
      {
        maestro_id: '1',
        maestro_nombre: 'Prof. García',
        total_clases: 10,
        orden_asistencia_primero: 6,
        orden_observaciones_primero: 3,
        orden_simultaneo: 1,
        promedio_duracion_observaciones: 120,
        uso_ai_fill_percent: 40
      }
    ]

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMetrics)
      })
    )

    const widget = analyticsFillingBehaviorWidget('analytics-container')
    await widget.init()

    expect(global.fetch).toHaveBeenCalledWith('/api/analytics/fill-metrics')
    expect(container.innerHTML).toContain('Prof. García')
  })

  it('should calculate fill order distribution stats', async () => {
    const mockMetrics = [
      { orden_asistencia_primero: 1, orden_observaciones_primero: 0, orden_simultaneo: 0 }, // asistencia first
      { orden_asistencia_primero: 1, orden_observaciones_primero: 0, orden_simultaneo: 0 },
      { orden_asistencia_primero: 0, orden_observaciones_primero: 1, orden_simultaneo: 0 }, // observaciones first
      { orden_asistencia_primero: 0, orden_observaciones_primero: 0, orden_simultaneo: 1 }  // simultaneous
    ]

    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockMetrics) })
    )

    const widget = analyticsFillingBehaviorWidget('analytics-container')
    await widget.init()

    expect(container.textContent).toContain('50.0%') // asistencia first
    expect(container.textContent).toContain('25.0%') // observaciones first
    expect(container.textContent).toContain('25.0%') // simultaneous
  })

  it('should calculate AI fill usage percentage', async () => {
    const mockMetrics = [
      { uso_ai_fill_percent: 0 },
      { uso_ai_fill_percent: 50 },
      { uso_ai_fill_percent: 100 },
      { uso_ai_fill_percent: 100 }
    ]

    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockMetrics) })
    )

    const widget = analyticsFillingBehaviorWidget('analytics-container')
    await widget.init()

    expect(container.textContent).toContain('62.5%') // average AI usage
  })
})
