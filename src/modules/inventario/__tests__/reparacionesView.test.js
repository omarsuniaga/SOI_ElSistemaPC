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

describe('TASK-14: reparacionesView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderiza tabla con reparaciones', async () => {
    const { renderReparacionesView } = await import('../views/reparacionesView.js')
    await renderReparacionesView(container)
    expect(container.querySelector('h4')).toBeTruthy()
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('thead')).toBeTruthy()
  })

  test('renderiza filtros: estado, tipo_tallerista, date range', async () => {
    const { renderReparacionesView } = await import('../views/reparacionesView.js')
    await renderReparacionesView(container)
    expect(container.querySelector('#filter-estado')).toBeTruthy()
    expect(container.querySelector('#filter-tipo-tallerista')).toBeTruthy()
    expect(container.querySelector('#filter-desde')).toBeTruthy()
    expect(container.querySelector('#filter-hasta')).toBeTruthy()
    expect(container.querySelector('#search-input')).toBeTruthy()
  })

  test('renderiza header counter', async () => {
    const { renderReparacionesView } = await import('../views/reparacionesView.js')
    await renderReparacionesView(container)
    const counter = container.querySelector('#reparaciones-counter')
    expect(counter).toBeTruthy()
    expect(counter.textContent).toMatch(/reparación/i)
  })

  test('renderiza boton nueva reparacion', async () => {
    const { renderReparacionesView } = await import('../views/reparacionesView.js')
    await renderReparacionesView(container)
    expect(container.querySelector('#btn-nueva-reparacion')).toBeTruthy()
  })

  test('renderiza tabla con datos del mock', async () => {
    const { renderReparacionesView } = await import('../views/reparacionesView.js')
    await renderReparacionesView(container)
    const tbody = container.querySelector('#tbody-reparaciones')
    expect(tbody).toBeTruthy()
    const rows = tbody.querySelectorAll('tr')
    expect(rows.length).toBeGreaterThan(0)
  })

  test('teardown aborta controller', async () => {
    const { renderReparacionesView } = await import('../views/reparacionesView.js')
    const result = await renderReparacionesView(container)
    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })
})