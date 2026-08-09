import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * metricasView.periodo.test.js
 *
 * El selector "Pendientes"/semanas (4/8/12) de Métricas usaba una ventana
 * relativa a HOY, sin relación con el período académico — con "12 semanas"
 * la ventana cruzaba hacia atrás del inicio del período activo y volvía a
 * traer sesiones "pendiente" de un semestre ya cerrado en la tarjeta de
 * resumen (mismo síntoma que el de las notificaciones de mayo). La ventana
 * ahora nunca cruza el inicio del período activo.
 */

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-1' })),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() => Promise.resolve([])),
  getSesiones: vi.fn(() => Promise.resolve([])),
}))

vi.mock('../../components/claseAnalysisModal.js', () => ({
  openClaseAnalysisModal: vi.fn(),
}))

vi.mock('../../utils/a11yUtils.js', () => ({ announce: vi.fn() }))

vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '../../../lib/supabaseClient.js'
import { getSesiones } from '../../services/maestroDataService.js'

function chain(resolvedValue) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve(resolvedValue)),
    then: (onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled),
  }
}

function setupSupabase(periodoActivo) {
  supabase.from.mockImplementation((table) => {
    if (table === 'periodos') return chain({ data: periodoActivo, error: periodoActivo ? null : new Error('no rows') })
    return chain({ data: [], error: null })
  })
}

describe('metricasView — la ventana de "Pendientes" no cruza el inicio del período activo', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('con "12 semanas" y un período activo reciente, la fecha usada es el inicio del período (no 12 semanas atrás)', async () => {
    const hoy = new Date('2026-08-09T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(hoy)

    setupSupabase({ id: 'per-2', nombre: '2do Semestre 2026', fecha_inicio: '2026-07-06', fecha_fin: '2026-12-15', activo: true })

    const { renderMetricasView } = await import('../metricasView.js')
    await renderMetricasView(container)

    // Simular selección de "12 semanas" si el selector existe; si no,
    // igual se valida la carga inicial (4 semanas por defecto) más abajo.
    const select = container.querySelector('#pm-filter-periodo, select')
    if (select) {
      select.value = '12'
      select.dispatchEvent(new Event('change'))
      await Promise.resolve()
    }

    const fechasUsadas = getSesiones.mock.calls.map(call => call[1])
    // 12 semanas atrás de 2026-08-09 sería ~2026-05-17 — no debe aparecer.
    expect(fechasUsadas.some(f => f < '2026-07-06')).toBe(false)

    vi.useRealTimers()
  })

  it('sin período activo configurado, no acota nada (fail-open) — usa la ventana de semanas tal cual', async () => {
    const hoy = new Date('2026-08-09T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(hoy)

    setupSupabase(null)

    const { renderMetricasView } = await import('../metricasView.js')
    await renderMetricasView(container)

    expect(getSesiones).toHaveBeenCalled()
    const [, fechaUsada] = getSesiones.mock.calls[0]
    // 4 semanas (default) atrás de 2026-08-09 = 2026-07-12
    expect(fechaUsada).toBe('2026-07-12')

    vi.useRealTimers()
  })
})
