import { describe, it, expect } from 'vitest'
import { THRESHOLDS, evaluate } from '../riskRules.js'

describe('riskRules', () => {
  describe('THRESHOLDS', () => {
    it('should export attendance_min_rate as 0.70', () => {
      expect(THRESHOLDS.attendance_min_rate).toBe(0.70)
    })

    it('should export grade_min_avg as 6.0', () => {
      expect(THRESHOLDS.grade_min_avg).toBe(6.0)
    })

    it('should export indicator_min_pass_rate as 0.50', () => {
      expect(THRESHOLDS.indicator_min_pass_rate).toBe(0.50)
    })
  })

  describe('evaluate(progress, clock)', () => {
    const mockClock = { now: () => new Date('2026-05-18T12:00:00Z').getTime() }

    it('should return { en_riesgo: false, risk_reasons: [] } when all sources are zero/null', () => {
      const progress = {
        indicators: { total: 0, passed: 0, pass_rate: null },
        grades: { count: 0, promedio: null },
        attendance: { total: 0, rate: null },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(false)
      expect(result.risk_reasons).toEqual([])
    })

    it('should trigger attendance_below_threshold when rate < 70%', () => {
      const progress = {
        indicators: { total: 0, passed: 0, pass_rate: null },
        grades: { count: 0, promedio: null },
        attendance: { total: 20, rate: 0.65 },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(true)
      expect(result.risk_reasons).toContain('attendance_below_threshold')
    })

    it('should NOT trigger attendance_below_threshold when rate === 70% (boundary)', () => {
      const progress = {
        indicators: { total: 0, passed: 0, pass_rate: null },
        grades: { count: 0, promedio: null },
        attendance: { total: 10, rate: 0.70 },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(false)
      expect(result.risk_reasons).not.toContain('attendance_below_threshold')
    })

    it('should trigger grade_below_threshold when promedio < 6.0', () => {
      const progress = {
        indicators: { total: 0, passed: 0, pass_rate: null },
        grades: { count: 3, promedio: 5.5 },
        attendance: { total: 0, rate: null },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(true)
      expect(result.risk_reasons).toContain('grade_below_threshold')
    })

    it('should NOT trigger grade_below_threshold when promedio === 6.0 (boundary)', () => {
      const progress = {
        indicators: { total: 0, passed: 0, pass_rate: null },
        grades: { count: 3, promedio: 6.0 },
        attendance: { total: 0, rate: null },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(false)
      expect(result.risk_reasons).not.toContain('grade_below_threshold')
    })

    it('should trigger indicator_pass_rate_below_threshold when pass_rate < 50%', () => {
      const progress = {
        indicators: { total: 10, passed: 4, pass_rate: 0.40 },
        grades: { count: 0, promedio: null },
        attendance: { total: 0, rate: null },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(true)
      expect(result.risk_reasons).toContain('indicator_pass_rate_below_threshold')
    })

    it('should NOT trigger indicator rule when total === 0 (undefined data not at-risk)', () => {
      const progress = {
        indicators: { total: 0, passed: 0, pass_rate: null },
        grades: { count: 0, promedio: null },
        attendance: { total: 0, rate: null },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(false)
      expect(result.risk_reasons).not.toContain('indicator_pass_rate_below_threshold')
    })

    it('should include all three risk_reasons when multiple thresholds triggered', () => {
      const progress = {
        indicators: { total: 10, passed: 4, pass_rate: 0.40 },
        grades: { count: 3, promedio: 5.5 },
        attendance: { total: 10, rate: 0.60 },
      }
      const result = evaluate(progress, mockClock)
      expect(result.en_riesgo).toBe(true)
      expect(result.risk_reasons).toContain('attendance_below_threshold')
      expect(result.risk_reasons).toContain('grade_below_threshold')
      expect(result.risk_reasons).toContain('indicator_pass_rate_below_threshold')
      expect(result.risk_reasons.length).toBe(3)
    })
  })
})
