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
    expect(container.querySelector('.repertoire-sync').textContent).toBe('Guardado local (Demo)')
  })

  it('opens a direct state picker from the context menu', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    container.querySelector('.repertoire-measure').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
    container.querySelector('[data-state="CONSOLIDADO"]').click()
    await Promise.resolve()
    await Promise.resolve()
    expect(adapter.updateMeasureState).toHaveBeenCalledWith('m-1', 'CONSOLIDADO')
    expect(container.textContent).toContain('Guardado local (Demo)')
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
    expect(container.querySelector('.repertoire-sync').textContent).toBe('Guardado local (Demo)')
  })

  it('supports non-contiguous selection without Shift', async () => {
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter() })
    container.querySelector('.repertoire-open').click()
    container.querySelector('.repertoire-multi').click()
    const measures = container.querySelectorAll('.repertoire-measure')
    measures[0].click()
    measures[2].click()
    expect(container.querySelectorAll('.repertoire-measure.is-selected')).toHaveLength(2)
  })

  it('restores a failed bulk update and reports a sync error', async () => {
    const adapter = makeAdapter({ updateMeasureState: vi.fn().mockRejectedValue(new Error('offline')) })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    container.querySelector('.repertoire-multi').click()
    container.querySelector('.repertoire-measure').click()
    container.querySelector('.repertoire-apply').click()
    await Promise.resolve()
    await Promise.resolve()
    expect(container.querySelector('.repertoire-measure').getAttribute('aria-label')).toContain('Sin evaluar')
    expect(container.querySelector('.repertoire-sync').textContent).toContain('No se pudo guardar')
  })

  it('keeps applicability independent and exposes it safely for unauthorized users', async () => {
    const adapter = makeAdapter({ updateMeasureApplicability: vi.fn() })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    const measure = container.querySelector('.repertoire-measure')
    measure.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
    expect(container.querySelector('.repertoire-picker').textContent).toContain('solo lectura')
    expect(container.querySelector('.repertoire-measure').getAttribute('aria-label')).toContain('Compás 1 — Sin evaluar')
  })

  it('renders a 1000-measure map without changing the interaction boundary', async () => {
    const adapter = makeAdapter({
      async listMontajes() {
        const [montaje] = await makeAdapter().listMontajes()
        montaje.compases = Array.from({ length: 1000 }, (_, index) => ({ id: `m-${index}`, numero_visible: String(index + 1), aplicabilidad: index % 10 ? 'TOCA' : 'SILENCIO', estado_preparacion: 'SIN_EVALUAR' }))
        return [montaje]
      }
    })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    expect(container.querySelectorAll('.repertoire-measure')).toHaveLength(1000)
    expect(container.querySelector('[data-measure-id="m-0"]').getAttribute('aria-label')).toContain('Silencio')
  })
})
