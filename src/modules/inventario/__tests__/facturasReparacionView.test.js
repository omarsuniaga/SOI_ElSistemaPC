import { describe, test, expect, beforeAll } from 'vitest'
import { config } from '../../../core/config/config.js'

process.env.VITE_SUPABASE_URL = 'http://localhost'
process.env.VITE_SUPABASE_ANON_KEY = 'test-key'
config.isDemoMode = true

globalThis.bootstrap = {
  Modal: class {
    constructor() { this._shown = false }
    show() { this._shown = true }
    hide() { this._shown = false }
  },
}

describe('TASK-11: facturasReparacionView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderiza tabla con facturas', async () => {
    const { renderFacturasReparacionView } = await import('../views/facturasReparacionView.js')
    await renderFacturasReparacionView(container)

    expect(container.querySelector('h4')).toBeTruthy()
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('thead')).toBeTruthy()
  })

  test('renderiza filtros: estado_pago, tipo_factura, date range', async () => {
    const { renderFacturasReparacionView } = await import('../views/facturasReparacionView.js')
    await renderFacturasReparacionView(container)

    expect(container.querySelector('#filter-estado-pago')).toBeTruthy()
    expect(container.querySelector('#filter-tipo-factura')).toBeTruthy()
    expect(container.querySelector('#filter-desde')).toBeTruthy()
    expect(container.querySelector('#filter-hasta')).toBeTruthy()
  })

  test('renderiza footer con sumas', async () => {
    const { renderFacturasReparacionView } = await import('../views/facturasReparacionView.js')
    await renderFacturasReparacionView(container)

    const footer = container.querySelector('#facturas-footer')
    expect(footer).toBeTruthy()
    expect(footer.textContent).toMatch(/Total/)
  })

  test('renderiza columna de acciones', async () => {
    const { renderFacturasReparacionView } = await import('../views/facturasReparacionView.js')
    await renderFacturasReparacionView(container)

    const ths = container.querySelectorAll('thead th')
    const textos = Array.from(ths).map(th => th.textContent.trim().toLowerCase())
    expect(textos).toContain('acciones')
  })

  test('teardown aborta controller', async () => {
    const { renderFacturasReparacionView } = await import('../views/facturasReparacionView.js')
    const result = await renderFacturasReparacionView(container)
    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })

  test('tabla tiene filas con datos del mock', async () => {
    const { renderFacturasReparacionView } = await import('../views/facturasReparacionView.js')
    await renderFacturasReparacionView(container)

    const tbody = container.querySelector('#tbody-facturas')
    expect(tbody).toBeTruthy()
    const rows = tbody.querySelectorAll('tr')
    expect(rows.length).toBeGreaterThan(0)
  })
})