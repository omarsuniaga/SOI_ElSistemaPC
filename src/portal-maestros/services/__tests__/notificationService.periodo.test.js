import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * notificationService.periodo.test.js
 *
 * `fetchNotificaciones()` traía las últimas 30 notificaciones del maestro
 * ordenadas por `created_at`, sin ningún filtro de fecha ni de período. Un
 * recordatorio de clase ('recordatorio_clase', generado por el cron
 * fn_generate_class_start_reminders) de un semestre YA CERRADO se seguía
 * colando indefinidamente mientras no se hubieran generado 30 notificaciones
 * nuevas desde entonces — exactamente el bug reportado ("me aparecen clases
 * por registrar desde MAYO" con el semestre siguiente ya activo).
 */

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-1' })),
}))

vi.mock('../maestroDataService.js', () => ({
  getMisClases: vi.fn(() => Promise.resolve([])),
  getHorariosClases: vi.fn(() => Promise.resolve([])),
  getSesiones: vi.fn(() => Promise.resolve([])),
}))

vi.mock('../pushService.js', () => ({ onPushReceived: vi.fn() }))

vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '../../../lib/supabaseClient.js'

function chain(resolvedValue) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve(resolvedValue)),
    then: (onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled),
  }
}

function setupSupabase({ notificaciones = [], periodoActivo = null }) {
  supabase.from.mockImplementation((table) => {
    if (table === 'notificaciones') return chain({ data: notificaciones, error: null })
    if (table === 'periodos') return chain({ data: periodoActivo, error: periodoActivo ? null : new Error('no rows') })
    return chain({ data: [], error: null })
  })
}

describe('notificationService — fetchNotificaciones se acota al período activo (solo recordatorio_clase)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    localStorage.clear()
  })

  it('descarta un recordatorio_clase de un período YA CERRADO (anterior a fecha_inicio del activo)', async () => {
    setupSupabase({
      notificaciones: [
        { id: 'n1', tipo: 'recordatorio_clase', estado: 'pendiente', created_at: '2026-05-15T10:00:00Z', profile_id: 'maestro-1' },
        { id: 'n2', tipo: 'recordatorio_clase', estado: 'pendiente', created_at: '2026-08-01T10:00:00Z', profile_id: 'maestro-1' },
      ],
      periodoActivo: { id: 'per-2', nombre: '2do Semestre 2026', fecha_inicio: '2026-07-01', fecha_fin: '2026-12-15', activo: true },
    })

    const { fetchNotificaciones } = await import('../notificationService.js')
    const result = await fetchNotificaciones()

    const ids = result.map(n => n.id)
    expect(ids).toContain('n2') // dentro del período activo
    expect(ids).not.toContain('n1') // de mayo, período ya cerrado
  })

  it('NO filtra otros tipos de notificación (ej. "sistema") aunque sean anteriores al período activo', async () => {
    setupSupabase({
      notificaciones: [
        { id: 'n3', tipo: 'sistema', estado: 'pendiente', created_at: '2026-05-15T10:00:00Z', profile_id: 'maestro-1' },
      ],
      periodoActivo: { id: 'per-2', nombre: '2do Semestre 2026', fecha_inicio: '2026-07-01', fecha_fin: '2026-12-15', activo: true },
    })

    const { fetchNotificaciones } = await import('../notificationService.js')
    const result = await fetchNotificaciones()

    expect(result.map(n => n.id)).toContain('n3')
  })

  it('sin período activo configurado, no filtra nada (fail-open)', async () => {
    setupSupabase({
      notificaciones: [
        { id: 'n4', tipo: 'recordatorio_clase', estado: 'pendiente', created_at: '2026-05-15T10:00:00Z', profile_id: 'maestro-1' },
      ],
      periodoActivo: null,
    })

    const { fetchNotificaciones } = await import('../notificationService.js')
    const result = await fetchNotificaciones()

    expect(result.map(n => n.id)).toContain('n4')
  })
})
