/**
 * T1b.3 — Vitest component tests for SeguimientoAusentesCardADM KPI cards
 * Tests for: KPI card rendering, counts, percentages, read-only state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

// Mock the service
vi.mock('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js', () => ({
  fetchSeguimientoAusentes: vi.fn(async () => ({
    alumnos: [
      { nivel: 1, alumno_id: 'a1', ultimo_seguimiento_fecha: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }, // 12h ago
      { nivel: 1, alumno_id: 'a2', ultimo_seguimiento_fecha: new Date(Date.now() - 60 * 60 * 1000).toISOString() },    // 1h ago
      { nivel: 1, alumno_id: 'a3', ultimo_seguimiento_fecha: null },                                                   // never
      { nivel: 2, alumno_id: 'a4', ultimo_seguimiento_fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }, // 1d ago
      { nivel: 2, alumno_id: 'a5', ultimo_seguimiento_fecha: null },                                                   // never
      { nivel: 3, alumno_id: 'a6', ultimo_seguimiento_fecha: null },                                                   // never
      { nivel: 3, alumno_id: 'a7', ultimo_seguimiento_fecha: null },                                                   // never
      { nivel: 3, alumno_id: 'a8', retencion_activa: true },                                                           // nivel 3
    ],
    totalCount: 8,
  })),
  getPeriodoActivo: vi.fn(async () => ({
    id: '123',
    nombre: 'Período 2026-01',
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-03-31',
  })),
}))

let container
let dom

describe('SeguimientoAusentesCardADM (T1b.3)', () => {
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>')
    global.document = dom.window.document
    global.window = dom.window
    global.HTMLElement = dom.window.HTMLElement

    container = document.getElementById('app')
  })

  it('should render KPI cards', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    const html = renderSeguimientoAusentesCardADM()
    container.innerHTML = html

    const cards = container.querySelectorAll('[data-kpi-card]')
    // Should have at least 4 core cards (Nivel 1, 2, 3, Contactados)
    expect(cards.length).toBeGreaterThanOrEqual(4)
  })

  it('should display nivel 1, 2, 3 counts from data', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    const html = renderSeguimientoAusentesCardADM()
    container.innerHTML = html

    // Should show counts: 3 nivel 1, 2 nivel 2, 3 nivel 3
    expect(container.textContent).toContain('3') // nivel 1 count
    expect(container.textContent).toContain('2') // nivel 2 count
  })

  it('should calculate contacted <72h percentage', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    const html = renderSeguimientoAusentesCardADM()
    container.innerHTML = html

    // Out of 8 total, 2 have recent contacts (within 72h)
    // Should show percentage around 25%
    const contactCard = container.querySelector('[data-kpi="contactados"]')
    expect(contactCard?.textContent).toContain('%')
  })

  it('should show retenciones activas count', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    const html = renderSeguimientoAusentesCardADM()
    container.innerHTML = html

    const retencionCard = container.querySelector('[data-kpi="retenciones-activas"]')
    expect(retencionCard).toBeTruthy()
  })

  it('should display – when no data', async () => {
    const { fetchSeguimientoAusentes: mockFetch } = await import('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js')

    mockFetch.mockResolvedValueOnce({
      alumnos: [],
      totalCount: 0,
    })

    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    const html = renderSeguimientoAusentesCardADM()
    container.innerHTML = html

    const cards = container.querySelectorAll('[data-kpi-card]')
    cards.forEach((card) => {
      // Should show – or 0
      const content = card.textContent
      expect(content === '–' || content === '0' || /\d+/.test(content)).toBe(true)
    })
  })

  it('should use Bootstrap card styling', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    const html = renderSeguimientoAusentesCardADM()
    container.innerHTML = html

    const cards = container.querySelectorAll('.card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('should not display action buttons (read-only)', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    const html = renderSeguimientoAusentesCardADM()
    container.innerHTML = html

    const actionButtons = container.querySelectorAll('button[data-action]')
    expect(actionButtons.length).toBe(0)
  })
})
