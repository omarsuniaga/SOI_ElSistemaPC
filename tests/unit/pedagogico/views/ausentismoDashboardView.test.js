import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

vi.mock('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js', () => ({
  getPeriodoActivo: vi.fn(async () => ({ id: 'p1', nombre: 'Semestre 2026-II' })),
  fetchKpisAusentismo: vi.fn(async () => ({
    nivel1: 10, nivel2: 4, nivel3: 2, sinContacto: 3, totalAusentes: 16,
    retencionesActivas: 2, retencionesLevantadas: 5, contactosUltimas72h: 7,
  })),
  fetchCasosCerrados: vi.fn(async () => ([
    { id: 'c1', fecha: '2026-09-01T10:00:00Z', nivel: 2, canal: 'whatsapp', resultado: 'resuelto', contacto_nombre: 'Rep A', notas: 'Justificó' },
    { id: 'c2', fecha: '2026-08-20T10:00:00Z', nivel: 3, canal: 'reunion', resultado: 'resuelto', contacto_nombre: 'Rep B', notas: 'Reincorporado' },
  ])),
}))

let dom, container

describe('AusentismoDashboardView (ADM read-only)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>')
    global.document = dom.window.document
    global.window = dom.window
    global.HTMLElement = dom.window.HTMLElement
    global.Blob = dom.window.Blob
    global.URL.createObjectURL = vi.fn(() => 'blob:x')
    global.URL.revokeObjectURL = vi.fn()
    container = document.getElementById('app')
  })

  it('renders KPI cards from fetchKpisAusentismo', async () => {
    const { renderAusentismoDashboardView } = await import('../../../../src/modules/pedagogico/views/AusentismoDashboardView.js')
    await renderAusentismoDashboardView(container)
    const html = container.innerHTML
    expect(html).toContain('Semestre 2026-II')
    expect(html).toContain('16 alumnos en seguimiento')
    expect(html).toContain('3 sin contacto')
    // nivel counts land in the KPI cards
    expect(container.querySelector('[data-kpi="nivel-1"]')?.textContent).toContain('10')
    expect(container.querySelector('[data-kpi="nivel-3"]')?.textContent).toContain('2')
  })

  it('renders the closed-cases table with rows, alumno column, and an enabled CSV button', async () => {
    const { renderAusentismoDashboardView } = await import('../../../../src/modules/pedagogico/views/AusentismoDashboardView.js')
    await renderAusentismoDashboardView(container)
    expect(container.querySelectorAll('tbody tr').length).toBe(2)
    expect(container.innerHTML).toContain('Reincorporado')
    expect(container.innerHTML).toContain('<th>Alumno</th>')
    const csvBtn = container.querySelector('[data-csv]')
    expect(csvBtn.hasAttribute('disabled')).toBe(false)
  })

  it('escapes HTML to prevent stored XSS in notes and names', async () => {
    const svc = await import('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js')
    svc.fetchCasosCerrados.mockResolvedValueOnce([
      {
        id: 'c-xss',
        fecha: '2026-09-01T10:00:00Z',
        nivel: 1,
        canal: '<script>bad()</script>',
        resultado: 'resuelto',
        contacto_nombre: '<img src=x onerror=alert(1)>',
        alumno_nombre: '<b>Bold Student</b>',
        notas: '<script>alert("xss")</script>',
      },
    ])
    const { renderAusentismoDashboardView } = await import('../../../../src/modules/pedagogico/views/AusentismoDashboardView.js')
    await renderAusentismoDashboardView(container)

    expect(container.innerHTML).not.toContain('<script>alert("xss")</script>')
    expect(container.innerHTML).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;')
    expect(container.innerHTML).not.toContain('<img src=x')
    expect(container.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(container.innerHTML).not.toContain('<b>Bold Student</b>')
    expect(container.innerHTML).toContain('&lt;b&gt;Bold Student&lt;/b&gt;')
  })

  it('CSV button triggers a download with alumno included', async () => {
    const { renderAusentismoDashboardView } = await import('../../../../src/modules/pedagogico/views/AusentismoDashboardView.js')
    await renderAusentismoDashboardView(container)
    const clickSpy = vi.spyOn(dom.window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    container.querySelector('[data-csv]').click()
    expect(global.URL.createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
  })

  it('date filter re-queries fetchCasosCerrados', async () => {
    const svc = await import('../../../../src/modules/pedagogico/services/seguimientoAusentesService.js')
    const { renderAusentismoDashboardView } = await import('../../../../src/modules/pedagogico/views/AusentismoDashboardView.js')
    await renderAusentismoDashboardView(container)
    container.querySelector('[data-desde]').value = '2026-08-01'
    container.querySelector('[data-filtrar]').click()
    await new Promise((r) => setTimeout(r, 30))
    expect(svc.fetchCasosCerrados).toHaveBeenLastCalledWith(expect.objectContaining({ desde: '2026-08-01' }))
  })
})
