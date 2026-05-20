import { describe, it, expect } from 'vitest'
import { aggregateStudentProgress, aggregateBatch, InvalidWindowError } from '../progresoAggregationService.js'

describe('progresoAggregationService', () => {
  const mockClock = { now: () => new Date('2026-05-18T12:00:00Z').getTime() }

  describe('aggregateStudentProgress(alumnoId, options)', () => {
    it('should return StudentProgress DTO with all nulls when all sources empty', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [],
          progresos: [],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result).toMatchObject({
        alumnoId: 'alum-001',
        indicators: { total: 0, passed: 0, pass_rate: null },
        grades: { count: 0, promedio: null, calificaciones: [] },
        attendance: { total: 0, presente: 0, ausente: 0, tarde: 0, justificado: 0, rate: null },
        risk: { en_riesgo: false, risk_reasons: [] },
        observaciones: [],
      })
    })

    it('should compute indicators from indicatorAttempts', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [],
          progresos: [],
          indicatorAttempts: [
            { alumno_id: 'alum-001', passed: true, fecha: '2026-05-05' },
            { alumno_id: 'alum-001', passed: true, fecha: '2026-05-10' },
            { alumno_id: 'alum-001', passed: false, fecha: '2026-05-15' },
          ],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result.indicators).toEqual({ total: 3, passed: 2, pass_rate: 2 / 3 })
    })

    it('should exclude calificacion=null from grade average', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [],
          progresos: [
            { alumno_id: 'alum-001', calificacion: 8.0, fecha_evaluacion: '2026-05-05', evaluacion_id: 'eval-1' },
            { alumno_id: 'alum-001', calificacion: null, fecha_evaluacion: '2026-05-10', evaluacion_id: 'eval-2' },
            { alumno_id: 'alum-001', calificacion: 6.0, fecha_evaluacion: '2026-05-15', evaluacion_id: 'eval-3' },
          ],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result.grades.count).toBe(2)
      expect(result.grades.promedio).toBe(7.0)
    })

    it('should compute attendance rate correctly', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [
            { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' },
            { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-02' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-03' },
            { alumno_id: 'alum-001', estado: 'tarde', fecha: '2026-05-04' },
            { alumno_id: 'alum-001', estado: 'justificado', fecha: '2026-05-05' },
          ],
          progresos: [],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result.attendance).toEqual({
        total: 5,
        presente: 2,
        ausente: 1,
        tarde: 1,
        justificado: 1,
        rate: 4 / 5, // (presente + tarde + justificado) / total
      })
    })

    it('should merge observaciones with correct source attribution', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [],
          progresos: [],
          indicatorAttempts: [],
          observaciones: [
            { id: 'obs-1', alumno_id: 'alum-001', texto: 'Good work', fecha: '2026-05-05', tipo: 'sesion', sesion_id: 'ses-1' },
            { id: 'obs-2', alumno_id: 'alum-001', texto: 'Needs improvement', fecha: '2026-05-10', tipo: 'alumno' },
          ],
        },
        clock: mockClock,
      })

      expect(result.observaciones).toHaveLength(2)
      expect(result.observaciones[0]).toMatchObject({
        id: 'obs-1',
        texto: 'Good work',
        source: 'sesion',
      })
      expect(result.observaciones[1]).toMatchObject({
        id: 'obs-2',
        texto: 'Needs improvement',
        source: 'alumno',
      })
    })

    it('should evaluate risk correctly for attendance below threshold', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [
            { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' },
            { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-02' },
            { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-03' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-04' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-05' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-06' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-07' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-08' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-09' },
            { alumno_id: 'alum-001', estado: 'ausente', fecha: '2026-05-10' },
          ],
          progresos: [],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result.risk.en_riesgo).toBe(true)
      expect(result.risk.risk_reasons).toContain('attendance_below_threshold')
    })

    it('should evaluate risk correctly for grade below threshold', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [],
          progresos: [
            { alumno_id: 'alum-001', calificacion: 5.0, fecha_evaluacion: '2026-05-05', evaluacion_id: 'eval-1' },
            { alumno_id: 'alum-001', calificacion: 5.5, fecha_evaluacion: '2026-05-10', evaluacion_id: 'eval-2' },
            { alumno_id: 'alum-001', calificacion: 5.8, fecha_evaluacion: '2026-05-15', evaluacion_id: 'eval-3' },
          ],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result.risk.en_riesgo).toBe(true)
      expect(result.risk.risk_reasons).toContain('grade_below_threshold')
    })

    it('should filter by correct alumnoId when multiple students in sources', () => {
      const result = aggregateStudentProgress('alum-002', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [
            { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' },
            { alumno_id: 'alum-002', estado: 'ausente', fecha: '2026-05-01' },
          ],
          progresos: [],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result.attendance.total).toBe(1)
      expect(result.attendance.ausente).toBe(1)
      expect(result.attendance.presente).toBe(0)
    })

    it('should treat indicator passed=null as not passed', () => {
      const result = aggregateStudentProgress('alum-001', {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [],
          progresos: [],
          indicatorAttempts: [
            { alumno_id: 'alum-001', passed: true, fecha: '2026-05-05' },
            { alumno_id: 'alum-001', passed: null, fecha: '2026-05-10' },
            { alumno_id: 'alum-001', passed: false, fecha: '2026-05-15' },
          ],
          observaciones: [],
        },
        clock: mockClock,
      })

      expect(result.indicators.total).toBe(3)
      expect(result.indicators.passed).toBe(1)
    })

    it('should throw InvalidWindowError when from > to', () => {
      expect(() => {
        aggregateStudentProgress('alum-001', {
          from: '2026-05-18',
          to: '2026-05-01',
          sources: { asistencias: [], progresos: [], indicatorAttempts: [], observaciones: [] },
          clock: mockClock,
        })
      }).toThrow(InvalidWindowError)
    })
  })

  describe('aggregateBatch(alumnoIds, options)', () => {
    it('should return Map with entry for each alumnoId', () => {
      const result = aggregateBatch(['alum-001', 'alum-002'], {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [
            { alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' },
            { alumno_id: 'alum-002', estado: 'presente', fecha: '2026-05-01' },
          ],
          progresos: [],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: { now: () => new Date('2026-05-18T12:00:00Z').getTime() },
      })

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(2)
      expect(result.has('alum-001')).toBe(true)
      expect(result.has('alum-002')).toBe(true)
    })

    it('should include alumnoId not present in any source (returns zero/null defaults)', () => {
      const result = aggregateBatch(['alum-001', 'alum-999'], {
        from: '2026-05-01',
        to: '2026-05-18',
        sources: {
          asistencias: [{ alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' }],
          progresos: [],
          indicatorAttempts: [],
          observaciones: [],
        },
        clock: { now: () => new Date('2026-05-18T12:00:00Z').getTime() },
      })

      expect(result.has('alum-999')).toBe(true)
      const alum999 = result.get('alum-999')
      expect(alum999.attendance.total).toBe(0)
      expect(alum999.grades.count).toBe(0)
    })

    it('should throw InvalidWindowError when from > to', () => {
      expect(() => {
        aggregateBatch(['alum-001'], {
          from: '2026-05-18',
          to: '2026-05-01',
          sources: { asistencias: [], progresos: [], indicatorAttempts: [], observaciones: [] },
          clock: { now: () => new Date('2026-05-18T12:00:00Z').getTime() },
        })
      }).toThrow(InvalidWindowError)
    })
  })
})
