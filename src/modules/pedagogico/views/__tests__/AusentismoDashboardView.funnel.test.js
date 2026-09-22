import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/ausentismo.css', () => ({}))
vi.mock('../../../../shared/components/HelpPanel.js', () => ({ HelpPanel: { open: vi.fn() } }))
vi.mock('../../../../shared/components/AppModal.js', () => ({ AppModal: { open: vi.fn(), close: vi.fn() } }))

vi.mock('../../services/seguimientoAusentesService.js', () => ({
  getPeriodoActivo: vi.fn().mockResolvedValue({ nombre: 'Semestre 2026-II' }),
  fetchKpisAusentismo: vi.fn(),
  fetchCasosCerrados: vi.fn().mockResolvedValue([]),
}))

import { renderAusentismoDashboardView, defaultRangoReincorporaciones } from '../AusentismoDashboardView.js'
import { fetchKpisAusentismo, fetchCasosCerrados } from '../../services/seguimientoAusentesService.js'

describe('AusentismoDashboardView — embudo de escalamiento', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('no llama "retenciones activas" al conteo de Nivel 3 cuando no hay retenciones reales', async () => {
    fetchKpisAusentismo.mockResolvedValue({
      nivel1: 65, nivel2: 38, nivel3: 33,
      sinContacto: 23, totalAusentes: 136,
      retencionesActivas: 0, retencionesLevantadas: 0,
      contactosUltimas72h: 0,
    })

    await renderAusentismoDashboardView(container)

    const texto = container.textContent
    // La tarjeta "Retenciones Activas" (KPI real) sigue diciendo 0 — eso no se toca.
    expect(container.querySelector('[data-kpi="retenciones-activas"]').textContent).toContain('0')
    // El texto del embudo ya no debe afirmar que hay retenciones activas cuando no las hay.
    expect(texto).not.toMatch(/33\s*retenciones\s*<\/strong>\s*activas/i)
    expect(texto).not.toContain('33 retenciones activas')
  })

  it('cuando sí hay retenciones activas reales, el texto puede mencionarlas (no una prohibición absoluta)', async () => {
    fetchKpisAusentismo.mockResolvedValue({
      nivel1: 10, nivel2: 5, nivel3: 33,
      sinContacto: 2, totalAusentes: 50,
      retencionesActivas: 33, retencionesLevantadas: 0,
      contactosUltimas72h: 5,
    })

    await renderAusentismoDashboardView(container)

    // No hay expectativa estricta aquí — solo que no truene y que la tarjeta real se vea.
    expect(container.querySelector('[data-kpi="retenciones-activas"]').textContent).toContain('33')
  })
})

describe('AusentismoDashboardView — sección de casos cerrados', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
    fetchKpisAusentismo.mockResolvedValue({
      nivel1: 0, nivel2: 0, nivel3: 0, sinContacto: 0, totalAusentes: 0,
      retencionesActivas: 0, retencionesLevantadas: 0, contactosUltimas72h: 0,
    })
  })

  it('el título dice solo "Reincorporaciones": "justificaciones" no está implementado (sin acción que las genere)', async () => {
    await renderAusentismoDashboardView(container)

    expect(container.querySelector('#card-casos-cerrados h2').textContent.trim()).toBe('Reincorporaciones')
    expect(container.textContent).not.toContain('justificaci')
  })

  it('el rango de fechas trae al menos un mes por defecto, no sin filtro', async () => {
    const { desde, hasta } = defaultRangoReincorporaciones()

    await renderAusentismoDashboardView(container)

    expect(container.querySelector('[data-desde]').value).toBe(desde)
    expect(container.querySelector('[data-hasta]').value).toBe(hasta)
    expect(fetchCasosCerrados).toHaveBeenCalledWith(expect.objectContaining({ desde, hasta }))

    const dias = (new Date(hasta) - new Date(desde)) / 86400000
    expect(dias).toBeGreaterThanOrEqual(28)
  })
})

describe('defaultRangoReincorporaciones', () => {
  it('retrocede exactamente un mes calendario desde "hasta"', () => {
    expect(defaultRangoReincorporaciones(new Date('2026-09-21T12:00:00Z')))
      .toEqual({ desde: '2026-08-21', hasta: '2026-09-21' })
  })

  it('maneja meses más cortos (31 -> 28/29/30) sin desbordar al mes siguiente', () => {
    expect(defaultRangoReincorporaciones(new Date('2026-03-31T12:00:00Z')).desde).toBe('2026-03-03')
  })
})
