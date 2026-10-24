import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('../../api/asistenciasApi.js', () => ({
  getPeriodos: vi.fn(async () => [{ id: 'p1', nombre: 'Actual' }]),
  getPeriodoActivo: vi.fn(async () => ({ id: 'p1' })),
  getClases: vi.fn(async () => []),
  getReporteConsolidado: vi.fn(async () => ({ timelineByDate: [] })),
  getDetalleSesion: vi.fn(), ESTADO_LABEL: {},
}))
import { renderAsistenciasView } from '../asistenciasView.js'
import { getReporteConsolidado } from '../../api/asistenciasApi.js'
beforeEach(() => { document.body.innerHTML = ''; vi.clearAllMocks() })
it('keeps the focused search input alive across consecutive keystrokes', async () => {
  const container = document.body.appendChild(document.createElement('div'))
  await renderAsistenciasView(container)
  container.querySelector('#btnToggleFiltros').click()
  const input = container.querySelector('#inputBuscarAsistencias')
  input.focus()
  input.value = 'Monserrat'
  input.dispatchEvent(new Event('input', { bubbles: true }))
  expect(document.activeElement).toBe(input)
  expect(input.isConnected).toBe(true)
})
it('shows a recoverable error instead of an empty report when loading fails', async () => {
  getReporteConsolidado.mockRejectedValueOnce(new Error('Sin conexión'))
  const container = document.body.appendChild(document.createElement('div'))
  await renderAsistenciasView(container)
  expect(container.textContent).toContain('Sin conexión')
  expect(container.querySelector('#retry-btn')).not.toBeNull()
})

it('registers one delegated click handler after repeated filter redraws', async () => {
  const container = document.body.appendChild(document.createElement('div'))
  const add = vi.spyOn(container, 'addEventListener')
  await renderAsistenciasView(container)
  for (let index = 0; index < 4; index++) container.querySelector('#btnToggleFiltros').click()
  const listeners = add.mock.calls.filter(([type]) => type === 'click')
  expect(listeners.filter(([, , options]) => !options?.signal?.aborted)).toHaveLength(1)
})

it('offers a visible entry to teacher pending records and exemptions', async () => {
  const container = document.body.appendChild(document.createElement('div'))
  await renderAsistenciasView(container)
  const entry = container.querySelector('a[href="#/admin-dashboard"]')
  expect(entry).not.toBeNull()
  expect(entry.textContent).toContain('Pendientes y exoneraciones')
})
