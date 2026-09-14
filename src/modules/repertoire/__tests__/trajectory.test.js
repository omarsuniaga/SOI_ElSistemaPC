import { describe, expect, it } from 'vitest'
import { createMilestone, createTarget, evaluateTrajectory, TRAJECTORY_STATUS } from '../domain/trajectory.js'

const baseTarget = createTarget({ montageId: 'm-1', passageId: 'p-1', targetState: 'DOMINADO', targetDate: '2026-11-15', thresholdPercent: 90, createdBy: 'teacher-1' })

describe('trajectory', () => {
  it('evaluates the acceptance threshold and exposes raw distribution', () => {
    const states = ['DOMINADO', 'DOMINADO', 'CONSOLIDADO', ...Array(2).fill('CON_DIFICULTAD'), ...Array(2).fill('SIN_ESTUDIAR'), ...Array(17).fill('DOMINADO')].map((state, index) => ({ measureId: `c-${index}`, state, applicability: 'TOCA' }))
    const result = evaluateTrajectory({ target: baseTarget, measureStates: states, asOf: '2026-11-01' })
    expect(result.actual.percent).toBe(83.33)
    expect(result.status).toBe(TRAJECTORY_STATUS.AT_RISK)
    expect(result.actual.distribution.SIN_ESTUDIAR).toBe(2)
    expect(result.reason).toContain('6.67')
  })

  it('surfaces recent regression even when the target threshold is met', () => {
    const states = Array.from({ length: 24 }, (_, index) => ({ measureId: `c-${index}`, state: index === 0 ? 'CON_DIFICULTAD' : 'DOMINADO', applicability: 'TOCA' }))
    const result = evaluateTrajectory({ target: baseTarget, measureStates: states, criticalMeasureIds: ['c-0'], transitionEvents: [{ previousState: 'CONSOLIDADO', newState: 'CON_DIFICULTAD', createdAt: '2026-11-14' }], asOf: '2026-11-15' })
    expect(result.status).toBe(TRAJECTORY_STATUS.REGRESSING)
    expect(result.criticalBlockers).toEqual(['c-0'])
    expect(result.recentRegressions).toHaveLength(1)
  })

  it('keeps tempo targets independent from preparation state', () => {
    const target = createTarget({ montageId: 'm-1', scope: 'fila', targetTempo: 120, createdBy: 'teacher-1' })
    const result = evaluateTrajectory({ target, actualTempo: 96, measureStates: [{ measureId: 'c-1', state: 'CONSOLIDADO', applicability: 'TOCA' }] })
    expect(result.status).toBe(TRAJECTORY_STATUS.AT_RISK)
    expect(result.target.targetTempo).toBe(120)
    expect(result.actual.tempoGap).toBe(24)
  })

  it('orders explicit milestones without inventing future expectations', () => {
    const milestones = [createMilestone({ targetId: 't-1', label: 'Consolidar', targetDate: '2026-12-01', targetState: 'CONSOLIDADO' }), createMilestone({ targetId: 't-1', label: 'Lectura', targetDate: '2026-10-01', targetState: 'DOMINADO' })]
    expect(evaluateTrajectory({ target: baseTarget, milestones }).milestones.map((item) => item.label)).toEqual(['Lectura', 'Consolidar'])
  })
})
