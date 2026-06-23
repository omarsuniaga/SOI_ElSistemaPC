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

describe('TASK-10: historialInstrumentoView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderiza timeline con eventos del mock', async () => {
    const { renderHistorialInstrumentoView } = await import('../views/historialInstrumentoView.js')
    await renderHistorialInstrumentoView(container, { activoId: 'act-001' })

    const timeline = container.querySelector('#timeline')
    expect(timeline).toBeTruthy()
    const items = timeline.querySelectorAll('.timeline-item')
    expect(items.length).toBeGreaterThan(0)
  })

  test('renderiza filtros de tipo de evento', async () => {
    const { renderHistorialInstrumentoView } = await import('../views/historialInstrumentoView.js')
    await renderHistorialInstrumentoView(container, { activoId: 'act-001' })

    const filter = container.querySelector('#filter-tipo-evento')
    expect(filter).toBeTruthy()
    const checkboxes = filter.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  test('renderiza boton para agregar evento manual', async () => {
    const { renderHistorialInstrumentoView } = await import('../views/historialInstrumentoView.js')
    await renderHistorialInstrumentoView(container, { activoId: 'act-001' })

    expect(container.querySelector('#btn-agregar-evento')).toBeTruthy()
  })

  test('renderiza modal para evento manual', async () => {
    const { renderHistorialInstrumentoView } = await import('../views/historialInstrumentoView.js')
    await renderHistorialInstrumentoView(container, { activoId: 'act-001' })

    const modal = container.querySelector('#modal-evento-manual')
    expect(modal).toBeTruthy()
    expect(container.querySelector('#form-evento-manual')).toBeTruthy()
    expect(container.querySelector('[name="tipo_evento"]')).toBeTruthy()
    expect(container.querySelector('[name="descripcion"]')).toBeTruthy()
    expect(container.querySelector('#btn-guardar-evento')).toBeTruthy()
  })

  test('eventos tienen iconos de Bootstrap', async () => {
    const { renderHistorialInstrumentoView } = await import('../views/historialInstrumentoView.js')
    await renderHistorialInstrumentoView(container, { activoId: 'act-001' })

    const icons = container.querySelectorAll('.timeline-item i')
    expect(icons.length).toBeGreaterThan(0)
    icons.forEach(icon => {
      expect(icon.className).toMatch(/bi-/)
    })
  })

  test('eventos agrupados por fecha', async () => {
    const { renderHistorialInstrumentoView } = await import('../views/historialInstrumentoView.js')
    await renderHistorialInstrumentoView(container, { activoId: 'act-001' })

    const groups = container.querySelectorAll('.timeline-group')
    expect(groups.length).toBeGreaterThan(0)
  })

  test('teardown aborta controller', async () => {
    const { renderHistorialInstrumentoView } = await import('../views/historialInstrumentoView.js')
    const result = await renderHistorialInstrumentoView(container, { activoId: 'act-001' })
    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })
})
