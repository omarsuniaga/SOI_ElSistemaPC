import { describe, expect, it } from 'vitest'
import { getActionableCount, projectNotifications } from '../domain/notificationProjection.js'

describe('unified notification projection', () => {
  it('combines legacy and repertoire items without merging persistence semantics', () => {
    const items = projectNotifications([{ id: 'legacy', estado: 'pendiente', created_at: '2026-01-01' }], [{ id: 'delivery', status: 'PENDING', created_at: '2026-01-02', repertoire_signals: { id: 'signal', severity: 'CRITICAL', lifecycle: 'OPEN', reason: 'Cuello crítico', createdAt: '2026-01-02' } }])
    expect(items.map((item) => item.source)).toEqual(['REPERTOIRE_SIGNAL', 'LEGACY_NOTIFICATION'])
    expect(getActionableCount(items)).toBe(2)
  })

  it('excludes acknowledged and resolved repertoire signals', () => {
    const items = projectNotifications([], [
      { id: 'a', status: 'READ', repertoire_signals: { id: 's1', lifecycle: 'ACKNOWLEDGED', reason: 'x' } },
      { id: 'b', status: 'PENDING', repertoire_signals: { id: 's2', lifecycle: 'RESOLVED', reason: 'y' } },
    ])
    expect(getActionableCount(items)).toBe(0)
  })
})
