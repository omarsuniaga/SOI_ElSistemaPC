import { describe, expect, it } from 'vitest'
import { getActionableCount, projectNotifications, normalizeRepertoireDelivery } from '../domain/notificationProjection.js'

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

describe('normalizeRepertoireDelivery · columnas reales de la entrega', () => {
  /**
   * `repertoire_signal_deliveries` no tiene `updated_at`: tiene `delivered_at`.
   * La consulta pedía la columna inexistente, Postgres rechazaba el SELECT
   * entero y el canal de señales quedaba muerto — en consola solo se veía
   * "Repertoire signals unavailable".
   */
  it('usa delivered_at como marca de actualización', () => {
    const r = normalizeRepertoireDelivery({
      id: 'entrega-1',
      profile_id: 'perfil-1',
      channel: 'IN_APP',
      status: 'PENDING',
      created_at: '2026-09-16T10:00:00Z',
      delivered_at: '2026-09-16T10:05:00Z',
      repertoire_signals: { id: 'senal-1', signal_type: 'PREPARATION_STALLED', severity: 'HIGH', reason: 'Sin avance', created_at: '2026-09-16T09:59:00Z' },
    })

    expect(r.updatedAt).toBe('2026-09-16T10:05:00Z')
  })

  it('cae en created_at si la entrega aún no salió', () => {
    const r = normalizeRepertoireDelivery({
      id: 'entrega-2',
      profile_id: 'perfil-1',
      channel: 'IN_APP',
      status: 'PENDING',
      created_at: '2026-09-16T10:00:00Z',
      delivered_at: null,
      repertoire_signals: { id: 'senal-2', signal_type: 'PREPARATION_STALLED', severity: 'LOW', reason: 'x', created_at: '2026-09-16T09:00:00Z' },
    })

    expect(r.updatedAt).toBe('2026-09-16T09:00:00Z')
  })
})
