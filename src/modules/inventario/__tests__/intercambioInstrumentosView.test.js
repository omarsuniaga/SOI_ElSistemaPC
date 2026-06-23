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

describe('TASK-13: intercambioInstrumentosView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  test('renderiza wizard de 3 pasos', async () => {
    const { renderIntercambioInstrumentosView } = await import('../views/intercambioInstrumentosView.js')
    await renderIntercambioInstrumentosView(container)

    expect(container.querySelector('h4')).toBeTruthy()
    const steps = container.querySelectorAll('.step-pane')
    expect(steps.length).toBe(3)
  })

  test('paso 1 tiene selector de alumno', async () => {
    const { renderIntercambioInstrumentosView } = await import('../views/intercambioInstrumentosView.js')
    await renderIntercambioInstrumentosView(container)

    const paso1 = container.querySelector('#paso-1')
    expect(paso1).toBeTruthy()
    const select = paso1.querySelector('select')
    expect(select).toBeTruthy()
  })

  test('paso 3 tiene confirmacion', async () => {
    const { renderIntercambioInstrumentosView } = await import('../views/intercambioInstrumentosView.js')
    await renderIntercambioInstrumentosView(container)

    const paso3 = container.querySelector('#paso-3')
    expect(paso3).toBeTruthy()
    expect(paso3.querySelector('#btn-confirmar-intercambio')).toBeTruthy()
  })

  test('teardown aborta controller', async () => {
    const { renderIntercambioInstrumentosView } = await import('../views/intercambioInstrumentosView.js')
    const result = await renderIntercambioInstrumentosView(container)
    expect(typeof result.teardown).toBe('function')
    result.teardown()
  })
})