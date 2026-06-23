import { describe, test, expect, beforeAll, vi } from 'vitest'
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
  Tab: class {
    constructor(el) { this.el = el }
    show() {}
  },
}

describe('TASK-09: detalleInstrumentoView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderiza breadcrumb con nombre de instrumento', async () => {
    const { renderDetalleInstrumentoView } = await import('../views/detalleInstrumentoView.js')
    await renderDetalleInstrumentoView(container, { activoId: 'act-001' })

    const breadcrumb = container.querySelector('.breadcrumb')
    expect(breadcrumb).toBeTruthy()
    expect(breadcrumb.textContent).toMatch(/Inventario/)
    expect(breadcrumb.textContent).toMatch(/V8-VIO-001/)
  })

  test('renderiza header con codigo y tipo', async () => {
    const { renderDetalleInstrumentoView } = await import('../views/detalleInstrumentoView.js')
    await renderDetalleInstrumentoView(container, { activoId: 'act-001' })

    expect(container.querySelector('h4')).toBeTruthy()
    expect(container.querySelector('.detail-badge')).toBeTruthy()
  })

  test('renderiza tabs: General, Comodato, Historial, Accesorios, Reparaciones', async () => {
    const { renderDetalleInstrumentoView } = await import('../views/detalleInstrumentoView.js')
    await renderDetalleInstrumentoView(container, { activoId: 'act-001' })

    const nav = container.querySelector('.nav-tabs')
    expect(nav).toBeTruthy()
    const tabTexts = Array.from(nav.querySelectorAll('.nav-link')).map(el => el.textContent.trim())
    expect(tabTexts).toContain('General')
    expect(tabTexts).toContain('Comodato')
    expect(tabTexts).toContain('Historial')
    expect(tabTexts).toContain('Accesorios')
    expect(tabTexts).toContain('Reparaciones')
  })

  test('tab General muestra datos del instrumento', async () => {
    const { renderDetalleInstrumentoView } = await import('../views/detalleInstrumentoView.js')
    await renderDetalleInstrumentoView(container, { activoId: 'act-001' })

    const general = container.querySelector('#tab-general')
    expect(general).toBeTruthy()
    expect(general.textContent).toMatch(/Violín/)
  })

  test('renderiza botones de accion', async () => {
    const { renderDetalleInstrumentoView } = await import('../views/detalleInstrumentoView.js')
    await renderDetalleInstrumentoView(container, { activoId: 'act-001' })

    expect(container.querySelector('#btn-editar-activo')).toBeTruthy()
    expect(container.querySelector('#btn-baja-activo')).toBeTruthy()
  })

  test('teardown aborta controller', async () => {
    const { renderDetalleInstrumentoView } = await import('../views/detalleInstrumentoView.js')
    const result = await renderDetalleInstrumentoView(container, { activoId: 'act-001' })
    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })
})
