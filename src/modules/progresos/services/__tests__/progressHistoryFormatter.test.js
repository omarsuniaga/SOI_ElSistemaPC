import { describe, it, expect } from 'vitest'
import { format } from '../progressHistoryFormatter.js'

describe('progressHistoryFormatter', () => {
  describe('format(options)', () => {
    it('should return Map with entry for each alumnoId', () => {
      const result = format({
        alumnoIds: ['alum-001', 'alum-002'],
        from: '2026-05-01',
        to: '2026-05-08',
        granularity: 'week',
        asis: [],
        prog: [],
        attempts: [],
        obs: [],
      })

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(2)
      expect(result.has('alum-001')).toBe(true)
      expect(result.has('alum-002')).toBe(true)
    })

    it('should return ProgressHistory with buckets for each week in range', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-21',
        granularity: 'week',
        asis: [],
        prog: [],
        attempts: [],
        obs: [],
      })

      const history = result.get('alum-001')
      // 2026-05-01 is Friday, week 18. 2026-05-21 is Thursday, week 20
      // Should have buckets for weeks 18, 19, 20
      expect(history.buckets.length).toBeGreaterThan(0)
      expect(history.granularity).toBe('week')
    })

    it('should fill empty weeks with null values', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-15',
        granularity: 'week',
        asis: [{ alumno_id: 'alum-001', estado: 'presente', fecha: '2026-05-01' }],
        prog: [],
        attempts: [],
        obs: [],
      })

      const history = result.get('alum-001')
      // All buckets should have null calificacion and asistencia_rate if no data
      const emptyBuckets = history.buckets.filter(
        b => b.calificacion === null && b.asistencia_rate === null
      )
      expect(emptyBuckets.length).toBeGreaterThan(0)
    })

    it('should aggregate grades by month when granularity=month', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-07-31',
        granularity: 'month',
        asis: [],
        prog: [
          { alumno_id: 'alum-001', calificacion: 8.0, fecha_evaluacion: '2026-05-15', evaluacion_id: 'eval-1' },
          { alumno_id: 'alum-001', calificacion: 7.0, fecha_evaluacion: '2026-06-15', evaluacion_id: 'eval-2' },
          { alumno_id: 'alum-001', calificacion: 9.0, fecha_evaluacion: '2026-07-15', evaluacion_id: 'eval-3' },
        ],
        attempts: [],
        obs: [],
      })

      const history = result.get('alum-001')
      expect(history.buckets.length).toBe(3)
      expect(history.buckets[0].bucket_key).toBe('2026-05')
      expect(history.buckets[1].bucket_key).toBe('2026-06')
      expect(history.buckets[2].bucket_key).toBe('2026-07')
    })

    it('should aggregate by evaluacion_id when granularity=evaluacion', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-31',
        granularity: 'evaluacion',
        asis: [],
        prog: [
          { alumno_id: 'alum-001', calificacion: 8.0, fecha_evaluacion: '2026-05-05', evaluacion_id: 'eval-mid', tipo_evaluacion: 'parcial' },
          { alumno_id: 'alum-001', calificacion: 7.5, fecha_evaluacion: '2026-05-15', evaluacion_id: 'eval-final', tipo_evaluacion: 'final' },
        ],
        attempts: [],
        obs: [],
      })

      const history = result.get('alum-001')
      expect(history.buckets.length).toBe(2)
      // Buckets are sorted alphabetically by evaluacion_id
      expect(history.buckets[0].bucket_key).toBe('eval-final')
      expect(history.buckets[0].tipo_evaluacion).toBe('final')
      expect(history.buckets[1].bucket_key).toBe('eval-mid')
      expect(history.buckets[1].tipo_evaluacion).toBe('parcial')
    })

    it('should include observaciones in buckets for same time period', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-08',
        granularity: 'week',
        asis: [],
        prog: [],
        attempts: [],
        obs: [
          { alumno_id: 'alum-001', id: 'obs-1', texto: 'Good', fecha: '2026-05-03', tipo: 'alumno' },
        ],
      })

      const history = result.get('alum-001')
      const bucketWithObs = history.buckets.find(b => b.observaciones.length > 0)
      expect(bucketWithObs).toBeDefined()
      expect(bucketWithObs.observaciones[0].texto).toBe('Good')
    })

    it('should deduplicate observaciones by sha256(alumno + texto + fecha)', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-08',
        granularity: 'week',
        asis: [],
        prog: [],
        attempts: [],
        obs: [
          { alumno_id: 'alum-001', id: 'obs-1', texto: 'Same text', fecha: '2026-05-03', tipo: 'alumno' },
          { alumno_id: 'alum-001', id: 'obs-2', texto: 'Same text', fecha: '2026-05-03', tipo: 'sesion' },
          { alumno_id: 'alum-001', id: 'obs-3', texto: 'Different', fecha: '2026-05-03', tipo: 'alumno' },
        ],
      })

      const history = result.get('alum-001')
      const bucketWithObs = history.buckets.find(b => b.observaciones.length > 0)
      // Should have 2 unique (same text+fecha is deduped, different text is kept)
      expect(bucketWithObs.observaciones.length).toBe(2)
    })

    it('should sort observaciones within bucket by fecha ascending', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-08',
        granularity: 'week',
        asis: [],
        prog: [],
        attempts: [],
        obs: [
          { alumno_id: 'alum-001', id: 'obs-3', texto: 'Third', fecha: '2026-05-05', tipo: 'alumno' },
          { alumno_id: 'alum-001', id: 'obs-1', texto: 'First', fecha: '2026-05-01', tipo: 'alumno' },
          { alumno_id: 'alum-001', id: 'obs-2', texto: 'Second', fecha: '2026-05-03', tipo: 'alumno' },
        ],
      })

      const history = result.get('alum-001')
      const bucketWithObs = history.buckets.find(b => b.observaciones.length > 0)
      expect(bucketWithObs.observaciones[0].texto).toBe('First')
      expect(bucketWithObs.observaciones[1].texto).toBe('Second')
      expect(bucketWithObs.observaciones[2].texto).toBe('Third')
    })

    it('should aggregate indicator attempts in buckets', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-08',
        granularity: 'week',
        asis: [],
        prog: [],
        attempts: [
          { alumno_id: 'alum-001', passed: true, fecha: '2026-05-02' },
          { alumno_id: 'alum-001', passed: true, fecha: '2026-05-03' },
          { alumno_id: 'alum-001', passed: false, fecha: '2026-05-04' },
        ],
        obs: [],
      })

      const history = result.get('alum-001')
      const bucketWithData = history.buckets.find(b => b.indicadores.total > 0)
      expect(bucketWithData.indicadores.total).toBe(3)
      expect(bucketWithData.indicadores.passed).toBe(2)
    })

    it('should return empty buckets with null fields when no data in bucket', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-08',
        granularity: 'week',
        asis: [],
        prog: [],
        attempts: [],
        obs: [],
      })

      const history = result.get('alum-001')
      const bucket = history.buckets[0]
      expect(bucket.calificacion).toBeNull()
      expect(bucket.asistencia_rate).toBeNull()
      expect(bucket.indicadores.total).toBe(0)
      expect(bucket.indicadores.passed).toBe(0)
    })

    it('should sort buckets by fecha_inicio ascending', () => {
      const result = format({
        alumnoIds: ['alum-001'],
        from: '2026-05-01',
        to: '2026-05-31',
        granularity: 'month',
        asis: [],
        prog: [
          { alumno_id: 'alum-001', calificacion: 8.0, fecha_evaluacion: '2026-05-15', evaluacion_id: 'eval-1' },
        ],
        attempts: [],
        obs: [],
      })

      const history = result.get('alum-001')
      for (let i = 1; i < history.buckets.length; i++) {
        expect(history.buckets[i].fecha_inicio >= history.buckets[i - 1].fecha_inicio).toBe(true)
      }
    })
  })
})
