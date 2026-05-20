import { describe, it, expect } from 'vitest'
import * as trendService from '../trendAnalysisService.js'

describe('trendAnalysisService', () => {
  it('should aggregate fill metrics by date', () => {
    const metrics = [
      { fecha: '2026-05-20', orden_asistencia_primero: 1, uso_ai_fill_percent: 0 },
      { fecha: '2026-05-20', orden_asistencia_primero: 0, uso_ai_fill_percent: 100 },
      { fecha: '2026-05-21', orden_asistencia_primero: 1, uso_ai_fill_percent: 50 }
    ]

    const trend = trendService.aggregateMetricsByDate(metrics)

    expect(trend['2026-05-20'].total_classes).toBe(2)
    expect(trend['2026-05-20'].asistencia_first_percent).toBe('50.0')
    expect(trend['2026-05-20'].avg_ai_usage_percent).toBe('50.0')
  })

  it('should aggregate fill metrics by maestro', () => {
    const metrics = [
      { maestro_id: '1', maestro_nombre: 'García', orden_asistencia_primero: 1, uso_ai_fill_percent: 50, promedio_duracion_observaciones: 120 },
      { maestro_id: '1', maestro_nombre: 'García', orden_asistencia_primero: 1, uso_ai_fill_percent: 100, promedio_duracion_observaciones: 180 },
      { maestro_id: '2', maestro_nombre: 'Martínez', orden_asistencia_primero: 0, uso_ai_fill_percent: 0, promedio_duracion_observaciones: 100 }
    ]

    const result = trendService.aggregateMetricsByMaestro(metrics)

    expect(result['1'].maestro_nombre).toBe('García')
    expect(result['1'].total_classes).toBe(2)
    expect(result['1'].asistencia_first_percent).toBe('100.0')
  })
})
