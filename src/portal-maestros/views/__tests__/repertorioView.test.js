import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderRepertoireView } from '../repertorioView.js'

const makeAdapter = (overrides = {}) => ({
  async listMontajes() {
    return [{
      id: 'montaje-1',
      obra: { titulo: 'Obra de prueba', compositor: 'Compositor' },
      version: { nombre: 'Versión' },
      evento: { nombre: 'Evento', fecha: '2026-12-18' },
      filas: [{ nombre: 'Trompetas' }],
      prioridad: 1,
      estado: 'EN_MONTAJE',
      compases: [1, 2, 3].map((number) => ({ id: `m-${number}`, numero_visible: String(number), aplicabilidad: 'TOCA', estado_preparacion: 'SIN_EVALUAR' }))
    }]
  },
  updateMeasureState: vi.fn(async (_id, state) => ({ estado_preparacion: state })),
  ...overrides
})

afterEach(() => { document.body.innerHTML = '' })

describe('repertorioView', () => {
  it('renders assigned works and opens their preparation map', async () => {
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter() })

    expect(container.textContent).toContain('Obra de prueba')
    container.querySelector('.repertoire-open').click()
    expect(container.querySelectorAll('.repertoire-measure')).toHaveLength(3)
    expect(container.querySelector('.repertoire-measure').getAttribute('aria-label')).toContain('Compás 1')
  })

  it('cycles a measure optimistically and reports the saved state', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()

    container.querySelector('.repertoire-measure').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(adapter.updateMeasureState).toHaveBeenCalledWith('m-1', 'SIN_ESTUDIAR')
    expect(container.querySelector('.repertoire-measure').getAttribute('aria-label')).toContain('Sin estudiar')
    expect(container.querySelector('.repertoire-sync').textContent).toBe('Guardado')
  })

  it('selects a contiguous range with Shift and applies one state in bulk', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    container.querySelector('.repertoire-multi').click()

    const measures = container.querySelectorAll('.repertoire-measure')
    measures[0].click()
    measures[2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }))
    expect(container.querySelectorAll('.repertoire-measure.is-selected')).toHaveLength(3)

    const picker = container.querySelector('.repertoire-bulk')
    picker.value = 'CONSOLIDADO'
    container.querySelector('.repertoire-apply').click()
    await Promise.resolve()
    await Promise.resolve()
    expect(adapter.updateMeasureState).toHaveBeenCalledTimes(3)
    expect(container.querySelector('.repertoire-sync').textContent).toBe('Guardado')
  })
})
