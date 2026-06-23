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

describe('TASK-08: stockInstrumentosView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderStockInstrumentosView carga y muestra la tabla', async () => {
    const { renderStockInstrumentosView } = await import('../views/stockInstrumentosView.js')
    const result = await renderStockInstrumentosView(container)

    expect(container.querySelector('h4')).toBeTruthy()
    expect(container.querySelector('h4').textContent).toMatch(/Inventario/i)
    expect(container.querySelector('#btn-nuevo')).toBeTruthy()
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('thead')).toBeTruthy()

    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })

  test('renderiza modal nuevo/editar con campos completos', async () => {
    const { renderStockInstrumentosView } = await import('../views/stockInstrumentosView.js')
    await renderStockInstrumentosView(container)

    expect(container.querySelector('#modal-instrumento')).toBeTruthy()
    const form = container.querySelector('#form-instrumento')
    expect(form).toBeTruthy()
    expect(form.querySelector('[name="tipo_instrumento"]')).toBeTruthy()
    expect(form.querySelector('[name="codigo_instrumento"]')).toBeTruthy()
    expect(form.querySelector('[name="marca"]')).toBeTruthy()
    expect(form.querySelector('[name="modelo"]')).toBeTruthy()
    expect(form.querySelector('[name="numero_serie"]')).toBeTruthy()
    expect(form.querySelector('[name="estado_conservacion"]')).toBeTruthy()
    expect(form.querySelector('[name="estado_uso"]')).toBeTruthy()
    expect(form.querySelector('[name="ubicacion"]')).toBeTruthy()
    expect(form.querySelector('[name="fecha_adquisicion"]')).toBeTruthy()
    expect(form.querySelector('[name="valor_adquisicion"]')).toBeTruthy()
    expect(form.querySelector('[name="proveedor"]')).toBeTruthy()
    expect(form.querySelector('[name="foto_url"]')).toBeTruthy()
    expect(form.querySelector('[name="notas"]')).toBeTruthy()
    expect(container.querySelector('#btn-guardar-instrumento')).toBeTruthy()
  })

  test('filtros renderizan controles', async () => {
    const { renderStockInstrumentosView } = await import('../views/stockInstrumentosView.js')
    await renderStockInstrumentosView(container)

    expect(container.querySelector('#filter-tipo')).toBeTruthy()
    expect(container.querySelector('#filter-estado-uso')).toBeTruthy()
    expect(container.querySelector('#filter-estado-conservacion')).toBeTruthy()
    expect(container.querySelector('#search-input')).toBeTruthy()
    expect(container.querySelector('#btn-buscar')).toBeTruthy()
  })

  test('tabla tiene columnas antiguedad y detalle', async () => {
    const { renderStockInstrumentosView } = await import('../views/stockInstrumentosView.js')
    await renderStockInstrumentosView(container)

    const ths = container.querySelectorAll('thead th')
    const textos = Array.from(ths).map(th => th.textContent.trim())
    expect(textos).toContain('Antigüedad', 'Acciones')
    expect(textos).toContain('Detalle')
  })

  test('tabla tiene filas con datos del mock', async () => {
    const { renderStockInstrumentosView } = await import('../views/stockInstrumentosView.js')
    await renderStockInstrumentosView(container)

    const tbody = container.querySelector('#tbody-activos')
    expect(tbody).toBeTruthy()
    const rows = tbody.querySelectorAll('tr')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].querySelector('.btn-view')).toBeTruthy()
    expect(rows[0].querySelector('.btn-editar')).toBeTruthy()
  })
})
