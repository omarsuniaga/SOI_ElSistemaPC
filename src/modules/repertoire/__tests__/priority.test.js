import { describe, expect, it } from 'vitest'
import { buildPriorityCandidate, deduplicateCandidates, PRIORITY_CATEGORIES, prioritizeCandidates } from '../domain/priority.js'

describe('priority engine', () => {
  it('ranks an overdue regressing bottleneck above a healthy difficult passage', () => {
    const candidates = prioritizeCandidates([
      buildPriorityCandidate({ id: 'a', label: 'Tema A', states: ['CONSOLIDADO'], difficulty: 5, lastWorkedDaysAgo: 1 }),
      buildPriorityCandidate({ id: 'b', label: 'Tema B', states: ['SIN_ESTUDIAR'], critical: true, recentRegressions: 2, daysRemaining: -1, lastWorkedDaysAgo: 9, target: { thresholdPercent: 90, actualPercent: 70 } })
    ])
    expect(candidates[0].id).toBe('b')
    expect(candidates[0].urgency).toBe('CRITICAL')
    expect(candidates[0].reasons).toEqual(expect.arrayContaining([PRIORITY_CATEGORIES.CRITICAL_BLOCKER, PRIORITY_CATEGORIES.REGRESSION_RISK]))
  })

  it('keeps tempo gap and student exception independent from collective state', () => {
    const tempo = buildPriorityCandidate({ id: 'tempo', label: 'Violín I', states: ['CONSOLIDADO'], tempoActual: 96, tempoTarget: 120, daysRemaining: 5 })
    const student = buildPriorityCandidate({ id: 'juan', label: 'Oboe · Juan', states: ['SIN_ESTUDIAR'], studentException: true })
    expect(tempo.reasons).toContain(PRIORITY_CATEGORIES.TEMPO_GAP)
    expect(tempo.tempoGap).toBe(24)
    expect(student.reasons).toContain(PRIORITY_CATEGORIES.STUDENT_EXCEPTION)
  })

  it('deduplicates the same passage while retaining underlying measure references', () => {
    const result = deduplicateCandidates([{ id: 'm42', passageId: 'p1', label: 'Tema A', urgency: 'HIGH', reasons: ['MILESTONE_BEHIND'] }, { id: 'm43', passageId: 'p1', label: 'Tema A', urgency: 'HIGH', reasons: ['TEMPO_GAP'] }])
    expect(result).toHaveLength(1)
    expect(result[0].underlying).toEqual(['m42', 'm43'])
    expect(result[0].why).toContain('TEMPO_GAP')
  })
})
