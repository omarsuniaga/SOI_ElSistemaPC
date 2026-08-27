import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * metricasView.periodo.test.js
 *
 * El selector de período de Métricas acota la ventana al inicio del período
 * académico activo por defecto para evitar contaminar métricas con datos
 * de semestres ya cerrados.
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

describe('metricasView — la ventana de métricas se acota al período activo', () => {
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

  it('por defecto (período actual) usa la fecha_inicio del período activo', async () => {
    const hoy = new Date('2026-08-27T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(hoy)

    setupSupabase({ id: 'per-2', nombre: 'Semestre 2026-II', fecha_inicio: '2026-08-10', fecha_fin: '2026-12-20', activo: true })

    const { renderMetricasView } = await import('../metricasView.js')
    await renderMetricasView(container)

    expect(getSesiones).toHaveBeenCalledWith('maestro-1', '2026-08-10', '2026-08-27')

    vi.useRealTimers()
  })

  it('con "12 semanas" y un período activo reciente, la fecha usada es el inicio del período (no 12 semanas atrás)', async () => {
    const hoy = new Date('2026-08-09T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(hoy)

    setupSupabase({ id: 'per-2', nombre: '2do Semestre 2026', fecha_inicio: '2026-07-06', fecha_fin: '2026-12-15', activo: true })

    const { renderMetricasView } = await import('../metricasView.js')
    await renderMetricasView(container)

    const select = container.querySelector('#pm-filter-periodo, select')
    if (select) {
      select.value = '12'
      select.dispatchEvent(new Event('change'))
      await Promise.resolve()
    }

    const fechasUsadas = getSesiones.mock.calls.map(call => call[1])
    expect(fechasUsadas.some(f => f < '2026-07-06')).toBe(false)

    vi.useRealTimers()
  })

  it('sin período activo configurado, usa 4 semanas atrás como fallback seguro', async () => {
    const hoy = new Date('2026-08-09T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(hoy)

    setupSupabase(null)

    const { renderMetricasView } = await import('../metricasView.js')
    await renderMetricasView(container)

    expect(getSesiones).toHaveBeenCalled()
    const [, fechaUsada] = getSesiones.mock.calls[0]
    expect(fechaUsada).toBe('2026-07-12')

    vi.useRealTimers()
  })
})
