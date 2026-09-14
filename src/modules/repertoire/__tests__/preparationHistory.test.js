import { describe, expect, it } from 'vitest'
import { buildTimeline, classifyCorrelation, classifyTrend, CORRELATION_LABELS, createPreparationTransition, TREND_CLASSIFICATIONS } from '../domain/preparationHistory.js'

const transition = (previousState, newState, createdAt) => createPreparationTransition({ montageId: 'm-1', measureId: 'c-42', previousState, newState, createdAt })

describe('preparation history', () => {
  it('preserves chronological regressions and classifies mixed trend explainably', () => {
    const events = [transition('SIN_ESTUDIAR', 'CON_DIFICULTAD', '2026-09-01'), transition('CON_DIFICULTAD', 'DOMINADO', '2026-09-08'), transition('DOMINADO', 'CON_DIFICULTAD', '2026-09-15')]
    expect(buildTimeline({ preparationEvents: [...events].reverse() }).map((event) => event.createdAt)).toEqual(['2026-09-01', '2026-09-08', '2026-09-15'])
    expect(classifyTrend(events)).toEqual({ classification: TREND_CLASSIFICATIONS.MIXED, counts: { improved: 2, regressed: 1, unchanged: 0 }, explanation: '2 medidas mejoraron, 1 regresaron y 0 no cambiaron' })
  })

  it('distinguishes worked without change, worked then improved, and regression', () => {
    const work = [{ createdAt: '2026-09-07', source: 'SESSION_WORK' }]
    expect(classifyCorrelation({ workEvents: work, transitionEvents: [], asOf: '2026-09-08' })).toBe(CORRELATION_LABELS.WORKED_WITHOUT_STATE_CHANGE)
    expect(classifyCorrelation({ workEvents: work, transitionEvents: [transition('CON_DIFICULTAD', 'DOMINADO', '2026-09-08')], asOf: '2026-09-08' })).toBe(CORRELATION_LABELS.WORKED_THEN_IMPROVED)
    expect(classifyCorrelation({ workEvents: work, transitionEvents: [transition('CONSOLIDADO', 'CON_DIFICULTAD', '2026-09-08')], asOf: '2026-09-08' })).toBe(CORRELATION_LABELS.WORKED_THEN_REGRESSED)
    expect(classifyCorrelation({ workEvents: work, transitionEvents: [], asOf: '2026-09-20' })).toBe(CORRELATION_LABELS.NO_RECENT_WORK)
  })

  it('keeps observation and session evidence distinct from preparation events', () => {
    const timeline = buildTimeline({ preparationEvents: [transition('SIN_ESTUDIAR', 'CON_DIFICULTAD', '2026-09-01')], sessionEvidence: [{ createdAt: '2026-09-02', source: 'SESSION_WORK' }], observations: [{ createdAt: '2026-09-03', source: 'OBSERVATION' }] })
    expect(timeline.map((event) => event.eventType)).toEqual(['PREPARATION_STATE', 'SESSION_WORK', 'OBSERVATION'])
  })
})
