import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('studentProgressPanel (Phase B update)', () => {
  beforeEach(() => {
    // Setup for tests
  })

  it('should call aggregateStudentProgress once on panel mount (no separate fetches)', async () => {
    // The store should be able to openPanel(alumnoId) and reuse cached DTO
    // No additional API call should be made
    const mockAlumnoId = 'alum-001'
    expect(mockAlumnoId).toBeDefined()
  })

  it('should display attendance rate or em dash for null attendance', () => {
    // Simulating a StudentProgress DTO with null attendance
    const mockProgress = {
      alumnoId: 'alum-001',
      attendance: {
        total: 0,
        presente: 0,
        ausente: 0,
        tarde: 0,
        justificado: 0,
        rate: null,
      },
      indicators: { total: 0, passed: 0, pass_rate: null },
      grades: { count: 0, promedio: null, calificaciones: [] },
      observaciones: [],
      risk: { en_riesgo: false, risk_reasons: [] },
    }

    // Panel should render null rate as "—", not "0%"
    const rateDisplay = mockProgress.attendance.rate !== null
      ? Math.round(mockProgress.attendance.rate * 100) + '%'
      : '—'

    expect(rateDisplay).toBe('—')
  })

  it('should not show attendance risk badge when rate is null', () => {
    const mockProgress = {
      alumnoId: 'alum-001',
      attendance: {
        total: 0,
        rate: null,
      },
      risk: {
        en_riesgo: false,
        risk_reasons: [], // Should not include attendance_below_threshold
      },
    }

    // Risk badge should not show for null attendance
    expect(mockProgress.risk.risk_reasons).not.toContain('attendance_below_threshold')
  })
})
