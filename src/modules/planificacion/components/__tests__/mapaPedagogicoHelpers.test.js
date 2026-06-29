import { describe, expect, it } from 'vitest'
import {
  buildAcademicIndicatorLabel,
  classifyIndicatorAttempt,
  mapMasteryStateMeta,
  summarizeIndicatorMastery,
} from '../mapaPedagogicoHelpers.js'

describe('mapaPedagogicoHelpers', () => {
  it('builds readable academic indicator labels', () => {
    expect(
      buildAcademicIndicatorLabel({
        level_name: '1',
        node_name: 'Postura',
        indicator_name: 'Sostiene el arco correctamente',
      }),
    ).toBe('Nivel 1 · Postura · Sostiene el arco correctamente')
  })

  it('classifies attempts by nota and status', () => {
    expect(classifyIndicatorAttempt({ nota: 5 })).toBe('mastered')
    expect(classifyIndicatorAttempt({ status: 'completed' })).toBe('mastered')
    expect(classifyIndicatorAttempt({ id: 'a1', nota: 2 })).toBe('in_progress')
    expect(classifyIndicatorAttempt(null)).toBe('pending')
  })

  it('summarizes latest student mastery state', () => {
    const summary = summarizeIndicatorMastery(
      [{ id: 's1' }, { id: 's2' }, { id: 's3' }],
      [
        { id: 'old-1', student_id: 's1', nota: 2, created_at: '2026-06-01T00:00:00Z' },
        { id: 'new-1', student_id: 's1', nota: 4, created_at: '2026-06-02T00:00:00Z' },
        { id: 'only-2', student_id: 's2', nota: 2, created_at: '2026-06-02T00:00:00Z' },
      ],
    )

    expect(summary).toEqual({
      total: 3,
      mastered: 1,
      in_progress: 1,
      pending: 1,
    })
  })

  it('maps mastery state to ui metadata', () => {
    expect(mapMasteryStateMeta('mastered')).toEqual({ label: 'Domina', tone: 'ok' })
    expect(mapMasteryStateMeta('in_progress')).toEqual({ label: 'En progreso', tone: 'warn' })
    expect(mapMasteryStateMeta('pending')).toEqual({ label: 'Sin evidencia', tone: 'muted' })
  })
})
