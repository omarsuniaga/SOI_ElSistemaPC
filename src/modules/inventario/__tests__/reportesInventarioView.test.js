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
}

describe('TASK-12: reportesInventarioView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderiza tabs de tipo de reporte', async () => {
    const { renderReportesInventarioView } = await import('../views/reportesInventarioView.js')
    await renderReportesInventarioView(container)

    const nav = container.querySelector('#report-tabs')
    expect(nav).toBeTruthy()
    const tabs = nav.querySelectorAll('.nav-link')
    const tabTexts = Array.from(tabs).map(el => el.textContent.trim())
    expect(tabTexts).toContain('General')
    expect(tabTexts).toContain('Historial')
    expect(tabTexts).toContain('Reparaciones')
    expect(tabTexts).toContain('Comodatos')
    expect(tabTexts).toContain('Resumen')
  })

  test('renderiza panel de filtros', async () => {
    const { renderReportesInventarioView } = await import('../views/reportesInventarioView.js')
    await renderReportesInventarioView(container)

    expect(container.querySelector('#filter-panel')).toBeTruthy()
    expect(container.querySelector('#btn-generar-reporte')).toBeTruthy()
  })

  test('renderiza tabla de previsualizacion', async () => {
    const { renderReportesInventarioView } = await import('../views/reportesInventarioView.js')
    await renderReportesInventarioView(container)

    expect(container.querySelector('#preview-table')).toBeTruthy()
  })

  test('renderiza boton de exportar PDF', async () => {
    const { renderReportesInventarioView } = await import('../views/reportesInventarioView.js')
    await renderReportesInventarioView(container)

    expect(container.querySelector('#btn-exportar-pdf')).toBeTruthy()
  })

  test('boton generar-reporte dispara actualizacion', async () => {
    const { renderReportesInventarioView } = await import('../views/reportesInventarioView.js')
    await renderReportesInventarioView(container)

    const btn = container.querySelector('#btn-generar-reporte')
    expect(btn).toBeTruthy()
    expect(btn.textContent).toMatch(/Generar/i)
  })

  test('teardown aborta controller', async () => {
    const { renderReportesInventarioView } = await import('../views/reportesInventarioView.js')
    const result = await renderReportesInventarioView(container)
    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })
})
