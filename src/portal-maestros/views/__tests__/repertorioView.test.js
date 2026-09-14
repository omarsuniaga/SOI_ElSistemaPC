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
      alumnos: [{ id: 'juan', nombre: 'Juan', estado_preparacion: 'SIN_ESTUDIAR' }, { id: 'pedro', nombre: 'Pedro', estado_preparacion: 'CONSOLIDADO' }],
      prioridad: 1,
      estado: 'EN_MONTAJE',
      compases: [1, 2, 3].map((number) => ({ id: `m-${number}`, numero_visible: String(number), aplicabilidad: 'TOCA', estado_preparacion: 'SIN_EVALUAR' }))
    }]
  },
  updateMeasureState: vi.fn(async (_id, state) => ({ estado_preparacion: state })),
  updateStudentState: vi.fn(async (studentId, measureId, state) => ({ studentId, measureId, estado_preparacion: state })),
  createPassage: vi.fn(async (payload) => ({ id: 'p-1', ...payload })),
  createLinkedGroup: vi.fn(async (payload) => ({ id: 'g-1', ...payload })),
  addLinkedMeasures: vi.fn(async (rows) => rows),
  updateLinkedGroupState: vi.fn(async (_id, state) => ({ affected: 2, state })),
  removeLinkedMeasures: vi.fn(async (_id, ids) => ({ affected: ids.length })),
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

  it('shows individual student states without conflating them with the row map', async () => {
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter() })
    container.querySelector('.repertoire-open').click()
    expect(container.querySelector('.repertoire-students').textContent).toContain('Juan: Sin estudiar')
    expect(container.querySelector('.repertoire-students').textContent).toContain('Pedro: Consolidado')
  })

  it('switches to a student map and writes an override without changing the row state', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    container.querySelector('[data-student-id="juan"]').click()
    const measure = container.querySelector('.repertoire-measure')
    measure.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
    container.querySelector('[data-state="CONSOLIDADO"]').click()
    await Promise.resolve()
    await Promise.resolve()
    expect(adapter.updateStudentState).toHaveBeenCalledWith('juan', 'm-1', 'CONSOLIDADO')
    expect(adapter.updateMeasureState).not.toHaveBeenCalled()
  })

  it('creates an independent passage and linked group from the same selection', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    container.querySelector('.repertoire-multi').click()
    container.querySelectorAll('.repertoire-measure')[0].click()
    container.querySelectorAll('.repertoire-measure')[2].click()
    container.querySelector('.repertoire-create-passage').click()
    container.querySelector('[name="name"]').value = 'Patrón de corcheas'
    container.querySelector('[name="difficulty"]').value = '3'
    container.querySelector('[name="focus"]').value = 'RITMO, ARTICULACION'
    container.querySelector('.repertoire-action-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await Promise.resolve()
    await Promise.resolve()
    expect(adapter.createPassage).toHaveBeenCalledWith(expect.objectContaining({ measureIds: ['m-1', 'm-3'], difficulty: 3 }))
    expect(container.textContent).toContain('Patrón de corcheas')
  })

  it('requires an explicit linked scope choice and supports selected unlinking', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    container.querySelector('.repertoire-multi').click()
    container.querySelectorAll('.repertoire-measure')[0].click()
    container.querySelectorAll('.repertoire-measure')[2].click()
    container.querySelector('.repertoire-create-group').click()
    container.querySelector('[name="name"]').value = 'Patrón A'
    container.querySelector('.repertoire-action-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await Promise.resolve()
    await Promise.resolve()
    container.querySelector('.repertoire-measure').click()
    expect(container.querySelector('.repertoire-scope-dialog').textContent).toContain('Solo este compás')
    container.querySelector('[data-scope="cancel"]').click()
    expect(adapter.updateLinkedGroupState).not.toHaveBeenCalled()
  })

  it('propagates the intended new state only after choosing all linked measures', async () => {
    const adapter = makeAdapter({
      listMontajes: async () => [{
        id: 'montaje-1', obra: { titulo: 'Obra de prueba' }, version: { nombre: 'Versión' }, evento: { nombre: 'Evento', fecha: '2026-12-18' }, filas: [{ nombre: 'Trompetas' }], alumnos: [], prioridad: 1, estado: 'EN_MONTAJE',
        compases: [1, 4, 8, 16].map((number) => ({ id: `m-${number}`, numero_visible: String(number), aplicabilidad: 'TOCA', estado_preparacion: 'SIN_EVALUAR' }))
      }],
      createLinkedGroup: vi.fn(async () => ({ id: 'g-1', nombre: 'Patrón A' })),
      addLinkedMeasures: vi.fn(async (rows) => rows),
      updateLinkedGroupState: vi.fn(async (_id, state) => ({ affected: 4, state }))
    })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-open').click()
    container.querySelector('.repertoire-multi').click()
    for (let index = 0; index < 4; index += 1) container.querySelectorAll('.repertoire-measure')[index].click()
    container.querySelector('.repertoire-create-group').click()
    container.querySelector('[name="name"]').value = 'Patrón A'
    container.querySelector('.repertoire-action-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(container.querySelector('.repertoire-measure.is-linked')).not.toBeNull())
    container.querySelector('.repertoire-measure').click()
    container.querySelector('[data-scope="all"]').click()
    await vi.waitFor(() => expect(adapter.updateLinkedGroupState).toHaveBeenCalledWith('g-1', 'SIN_ESTUDIAR'))
    expect([...container.querySelectorAll('.repertoire-measure')].every((button) => button.getAttribute('aria-label').includes('Sin estudiar'))).toBe(true)
  })
})
