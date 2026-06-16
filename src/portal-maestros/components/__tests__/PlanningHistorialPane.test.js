/**
 * PlanningHistorialPane.test.js
 * Covers W2: the _promoverInFlight guard prevents a second overlay
 * being appended when _openPromoverModal is called concurrently.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../modules/planning/services/historialService.js', () => ({
  getHistorial: vi.fn().mockResolvedValue([
    {
      id: 'item-1',
      type: 'observacion',
      fecha: '2026-06-01',
      clase_id: 'clase-1',
      clase_nombre: 'Violín I',
      clase_instrumento: 'Violín',
      contenido_raw: 'Trabajamos escalas',
      contenido_ia_dsl: null,
      estado: 'sin_planificar',
      created_at: '2026-06-01T10:00:00Z',
    },
  ]),
}))

vi.mock('../../../modules/bitacora/index.js', () => ({
  getContenidosDeClase: vi.fn(),
  getAlumnosByClase: vi.fn(),
}))

vi.mock('../../../modules/bitacora/components/RegistrarContenidoModal.js', () => ({
  renderRegistrarContenidoModal: vi.fn(),
}))

vi.mock('../../utils/portalUtils.js', () => ({
  escHTML: vi.fn((s) => String(s ?? '')),
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { error: vi.fn(), success: vi.fn() },
}))

import { getContenidosDeClase, getAlumnosByClase } from '../../../modules/bitacora/index.js'
import { renderPlanningHistorialPane } from '../PlanningHistorialPane.js'

// ── DOM setup ────────────────────────────────────────────────────────────────

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)

  getContenidosDeClase.mockResolvedValue([
    { id: 'cont-1', descripcion: 'Escalas mayores' },
  ])
  getAlumnosByClase.mockResolvedValue([
    { id: 'al-1', nombre_completo: 'Ana García' },
  ])
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('PlanningHistorialPane — W2 double-promover guard', () => {
  it('opens the overlay on first click', async () => {
    await renderPlanningHistorialPane(container, {
      maestroId: 'maestro-1',
      claseId: 'clase-1',
      publishedRouteVersionId: null,
    })

    const btn = container.querySelector('[data-action="promover"]')
    expect(btn).toBeTruthy()

    btn.click()
    // Allow the async data-load to settle (microtask + one event-loop tick)
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    const overlays = document.body.querySelectorAll(
      'div[style*="position: fixed"]',
    )
    expect(overlays.length).toBeGreaterThanOrEqual(1)
  })

  it('does NOT open a second overlay when clicked twice while in-flight', async () => {
    // Make data loading take long enough for us to fire a second click
    let resolveData
    getContenidosDeClase.mockReturnValue(
      new Promise((resolve) => {
        resolveData = () =>
          resolve([{ id: 'cont-1', descripcion: 'Escalas mayores' }])
      }),
    )

    await renderPlanningHistorialPane(container, {
      maestroId: 'maestro-1',
      claseId: 'clase-1',
      publishedRouteVersionId: null,
    })

    const btn = container.querySelector('[data-action="promover"]')
    expect(btn).toBeTruthy()

    // Fire two synchronous clicks before the async fetch resolves
    btn.click()
    btn.click()

    // Now resolve the pending data
    resolveData()
    getAlumnosByClase.mockResolvedValue([{ id: 'al-1', nombre_completo: 'Ana' }])
    await new Promise((r) => setTimeout(r, 0))

    const overlays = document.body.querySelectorAll(
      'div[style*="position: fixed"]',
    )
    expect(overlays.length).toBe(1)
  })
})
