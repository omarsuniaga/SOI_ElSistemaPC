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

describe('TASK-09: dashboardInventarioView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderiza KPIs con valores del mock', async () => {
    const { renderDashboardInventarioView } = await import('../views/dashboardInventarioView.js')
    await renderDashboardInventarioView(container)

    expect(container.querySelector('#kpi-total')).toBeTruthy()
    expect(container.querySelector('#kpi-en-uso')).toBeTruthy()
    expect(container.querySelector('#kpi-disponibles')).toBeTruthy()
    expect(container.querySelector('#kpi-ociosos')).toBeTruthy()
    expect(container.querySelector('#kpi-en-reparacion')).toBeTruthy()
    expect(container.querySelector('#kpi-de-baja')).toBeTruthy()
    expect(container.querySelector('#kpi-valor-total')).toBeTruthy()

    const total = container.querySelector('#kpi-total .kpi-value')
    expect(total).toBeTruthy()
    expect(Number(total.textContent)).toBeGreaterThan(0)
  })

  test('renderiza grafico de torta CSS', async () => {
    const { renderDashboardInventarioView } = await import('../views/dashboardInventarioView.js')
    await renderDashboardInventarioView(container)

    const pie = container.querySelector('#pie-chart')
    expect(pie).toBeTruthy()
  })

  test('renderiza tabla de proximos a vencer', async () => {
    const { renderDashboardInventarioView } = await import('../views/dashboardInventarioView.js')
    await renderDashboardInventarioView(container)

    const tabla = container.querySelector('#tabla-proximos-vencer')
    expect(tabla).toBeTruthy()
    const rows = tabla.querySelectorAll('tbody tr')
    expect(rows.length).toBeGreaterThan(0)
  })

  test('renderiza tabla de ultimas reparaciones', async () => {
    const { renderDashboardInventarioView } = await import('../views/dashboardInventarioView.js')
    await renderDashboardInventarioView(container)

    const tabla = container.querySelector('#tabla-ultimas-reparaciones')
    expect(tabla).toBeTruthy()
    const rows = tabla.querySelectorAll('tbody tr')
    expect(rows.length).toBeGreaterThan(0)
  })

  test('renderiza distribucion por tipo en la leyenda', async () => {
    const { renderDashboardInventarioView } = await import('../views/dashboardInventarioView.js')
    await renderDashboardInventarioView(container)

    const legend = container.querySelector('#pie-legend')
    expect(legend).toBeTruthy()
    const items = legend.querySelectorAll('li')
    expect(items.length).toBeGreaterThan(0)
  })

  test('teardown aborta controller', async () => {
    const { renderDashboardInventarioView } = await import('../views/dashboardInventarioView.js')
    const result = await renderDashboardInventarioView(container)
    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })
})
