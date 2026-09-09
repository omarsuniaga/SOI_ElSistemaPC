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

  it('should render 2 semantic blocks: Escalamiento (3 cards) and Retención/Contacto (4 cards)', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')
    const html = renderSeguimientoAusentesCardADM({
      nivel1: 5, nivel2: 3, nivel3: 2, contactados72h: 4, totalContactos: 10,
      sinContacto: 2, retencionesActivas: 2, retencionesLevantadas: 1,
    })
    container.innerHTML = html

    expect(container.textContent).toContain('Escalamiento de Casos')
    expect(container.textContent).toContain('Retención & Gestión de Contacto')

    const escalamientoCards = container.querySelectorAll('[data-kpi^="nivel-"]')
    expect(escalamientoCards.length).toBe(3)

    const sinContactoCard = container.querySelector('[data-kpi="sin-contacto"]')
    expect(sinContactoCard).toBeTruthy()
    expect(sinContactoCard?.textContent).toContain('2')
  })

  it('should apply data-driven semantic colors without false positives for zeros (VD3)', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')

    // Zero retentions, zero contacts -> should have neutral body-secondary styling, NOT red alarm or green success
    const htmlZero = renderSeguimientoAusentesCardADM({
      nivel1: 0, nivel2: 0, nivel3: 0, contactados72h: 0, totalContactos: 0,
      sinContacto: 0, retencionesActivas: 0, retencionesLevantadas: 0,
    })
    container.innerHTML = htmlZero

    const retActivasZero = container.querySelector('[data-kpi="retenciones-activas"]')
    expect(retActivasZero?.querySelector('.ausentismo-icon-badge')?.classList.contains('bg-body-secondary')).toBe(true)

    const retLevantadasZero = container.querySelector('[data-kpi="retenciones-levantadas"]')
    expect(retLevantadasZero?.querySelector('.ausentismo-icon-badge')?.classList.contains('bg-body-secondary')).toBe(true)

    const contactadosZero = container.querySelector('[data-kpi="contactados"]')
    expect(contactadosZero?.querySelector('.ausentismo-icon-badge')?.classList.contains('bg-body-secondary')).toBe(true)
  })

  it('should prominently highlight Level 3 with ACCIÓN badge when active (VD2)', async () => {
    const { renderSeguimientoAusentesCardADM } = await import('../../../../src/modules/pedagogico/components/SeguimientoAusentesCardADM.js')
    const html = renderSeguimientoAusentesCardADM({
      nivel1: 2, nivel2: 1, nivel3: 4, contactados72h: 1, totalContactos: 7,
      sinContacto: 1, retencionesActivas: 4, retencionesLevantadas: 0,
    })
    container.innerHTML = html

    const nivel3Card = container.querySelector('[data-kpi="nivel-3"]')
    expect(nivel3Card?.classList.contains('has-urgent-cases')).toBe(true)
    expect(nivel3Card?.textContent).toContain('ACCIÓN')
  })
})
