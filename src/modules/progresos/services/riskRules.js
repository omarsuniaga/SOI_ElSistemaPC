/**
 * Risk evaluation logic for student progress
 * Pure function: takes progress DTO and optional injected clock, returns risk assessment
 */

export const THRESHOLDS = {
  attendance_min_rate: 0.70,
  attendance_window_weeks: 4,
  grade_min_avg: 6.0,
  grade_window_count: 3,
  indicator_min_pass_rate: 0.50,
  indicator_window_weeks: 4,
}

/**
 * Evaluates risk signals for a student's progress
 * @param {Object} progress - StudentProgress DTO
 * @param {Object} clock - { now: () => timestamp } (injected for testing)
 * @returns {Object} { en_riesgo: boolean, risk_reasons: string[] }
 */
export function evaluate(progress, clock = Date) {
  const reasons = []

  // Attendance rule: undefined data (count === 0) does NOT trigger risk
  if (progress.attendance && progress.attendance.total > 0) {
    if (progress.attendance.rate < THRESHOLDS.attendance_min_rate) {
      reasons.push('attendance_below_threshold')
    }
  }

  // Grade rule: undefined data (count === 0) does NOT trigger risk
  if (progress.grades && progress.grades.count > 0) {
    if (progress.grades.promedio < THRESHOLDS.grade_min_avg) {
      reasons.push('grade_below_threshold')
    }
  }

  // Indicator rule: only trigger if we have actual attempts (total > 0)
  if (progress.indicators && progress.indicators.total > 0) {
    if (progress.indicators.pass_rate < THRESHOLDS.indicator_min_pass_rate) {
      reasons.push('indicator_pass_rate_below_threshold')
    }
  }

  return {
    en_riesgo: reasons.length > 0,
    risk_reasons: reasons,
  }
}
