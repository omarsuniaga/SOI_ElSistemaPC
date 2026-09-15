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
  it('opens a real repertoire home with a pedagogical new-work action', async () => {
    const adapter = makeAdapter({ listMontajes: async () => [], listObras: async () => [], createObra: vi.fn(async (payload) => ({ id: 'obra-1', ...payload })), createVersion: vi.fn(async (payload) => ({ id: 'version-1', ...payload })) })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    expect(container.querySelector('h1').textContent).toContain('Repertorio')
    expect(container.textContent).toContain('Tu repertorio está vacío')
    container.querySelector('.repertoire-new-work').click()
    container.querySelector('[name="title"]').value = 'Estudio de prueba'
    container.querySelector('[name="version"]').value = 'Edición pedagógica'
    container.querySelector('.repertoire-work-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(adapter.createObra).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Estudio de prueba' })))
    expect(adapter.createVersion).toHaveBeenCalledWith(expect.objectContaining({ obra_id: 'obra-1', nombre: 'Edición pedagógica' }))
  })

  it('loads real teaching scopes and submits multiple authorized filas as one canonical work', async () => {
    const createPedagogicalWork = vi.fn(async () => ({ id: 'work-1' }))
    const adapter = makeAdapter({ listMontajes: async () => [], listObras: async () => [], listTeacherTeachingScopes: vi.fn(async () => [
      { id: 'class-1', name: 'Violines I', instrument: 'Violín', students: [{ id: 'student-1' }] },
      { id: 'class-2', name: 'Violas', instrument: 'Viola', students: [{ id: 'student-2' }] }
    ]), createPedagogicalWork })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-new-work').click()
    container.querySelector('[name="title"]').value = 'Obra de prueba'
    container.querySelector('[name="measures"]').value = '120'
    container.querySelectorAll('[name="scope"]')[0].checked = true
    container.querySelectorAll('[name="scope"]')[1].checked = true
    container.querySelector('.repertoire-work-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(createPedagogicalWork).toHaveBeenCalledWith(expect.objectContaining({ title: 'Obra de prueba', measures: 120, scopeIds: ['class-1', 'class-2'] })))
  })

  it('renders assigned works and opens their preparation map', async () => {
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter() })

    expect(container.textContent).toContain('Obra de prueba')
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    expect(container.querySelectorAll('.repertoire-measure')).toHaveLength(3)
    expect(container.querySelector('.repertoire-measure').getAttribute('aria-label')).toContain('Compás 1')
  })

  it('navigates multiple filas while keeping one canonical measure map', async () => {
    const adapter = makeAdapter({ listMontajes: async () => [{
      id: 'montaje-1', obra: { titulo: 'Obra de prueba', compositor: 'Compositor' }, version: { nombre: 'Versión' }, filas: [
        { id: 'fila-1', nombre: 'Violines I' }, { id: 'fila-2', nombre: 'Violas' }
      ], alumnos: [{ id: 'student-1', montaje_fila_id: 'fila-1', nombre: 'César', estado_preparacion: 'DOMINADO' }, { id: 'student-2', montaje_fila_id: 'fila-2', nombre: 'Edelyn', estado_preparacion: 'CON_DIFICULTAD' }], prioridad: 1, estado: 'EN_MONTAJE', compases: [{ id: 'm-1', numero_visible: '1', aplicabilidad: 'TOCA', estado_preparacion: 'SIN_EVALUAR' }]
    }] })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    expect(container.textContent).toContain('Violines I')
    container.querySelector('[data-fila-id="fila-2"]').click()
    expect(container.querySelector('.repertoire-students').textContent).toContain('Edelyn')
    expect(container.querySelector('.repertoire-students').textContent).not.toContain('César')
    expect(container.querySelectorAll('.repertoire-measure')).toHaveLength(1)
  })

  it('cycles a measure optimistically and reports the saved state', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()

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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    expect(container.querySelectorAll('.repertoire-measure')).toHaveLength(1000)
    expect(container.querySelector('[data-measure-id="m-0"]').getAttribute('aria-label')).toContain('Silencio')
  })

  it('shows individual student states without conflating them with the row map', async () => {
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter() })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    expect(container.querySelector('.repertoire-students').textContent).toContain('Juan: Sin estudiar')
    expect(container.querySelector('.repertoire-students').textContent).toContain('Pedro: Consolidado')
  })

  it('switches to a student map and writes an override without changing the row state', async () => {
    const adapter = makeAdapter()
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
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

  it('renders numbered cells in configured musical rows and preserves the setting across state changes', async () => {
    const adapter = makeAdapter({ listMontajes: async () => [{ ...(await makeAdapter().listMontajes())[0], compases: Array.from({ length: 12 }, (_, index) => ({ id: `m-${index + 1}`, numero_visible: String(index + 1), aplicabilidad: 'TOCA', estado_preparacion: 'SIN_EVALUAR' })) }] })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    const setting = container.querySelector('.repertoire-measures-per-row')
    setting.value = '4'
    setting.dispatchEvent(new Event('change'))
    expect(container.querySelectorAll('.repertoire-grid__row')).toHaveLength(3)
    expect(container.querySelector('[data-measure-id="m-1"] .measure-number').textContent).toBe('1')
    expect(container.querySelector('[data-measure-id="m-1"]').textContent).not.toContain('🔴')
    container.querySelector('[data-measure-id="m-1"]').click()
    await vi.waitFor(() => expect(container.querySelector('.repertoire-measures-per-row').value).toBe('4'))
  })

  it('keeps eight configured measures in each row on narrow layouts', async () => {
    localStorage.clear()
    const adapter = makeAdapter({ listMontajes: async () => [{ ...(await makeAdapter().listMontajes())[0], compases: Array.from({ length: 16 }, (_, index) => ({ id: `m-${index + 1}`, numero_visible: String(index + 1), aplicabilidad: 'TOCA', estado_preparacion: 'SIN_EVALUAR' })) }] })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()

    const rows = container.querySelectorAll('.repertoire-grid__row')
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelectorAll('.repertoire-measure')).toHaveLength(8)
    expect(rows[0].querySelectorAll('.measure-number')[7].textContent).toBe('8')
    expect(container.querySelector('.repertoire-grid').getAttribute('style')).toContain('--measures-per-row: 8')
  })

  it('exposes rehearsal marks and passage context in cell accessibility labels', async () => {
    const adapter = makeAdapter({ listMontajes: async () => [{ ...(await makeAdapter().listMontajes())[0], rehearsalMarks: [{ label: 'B', measureNumber: 2 }], compases: [1, 2, 3].map((number) => ({ id: `m-${number}`, numero_visible: String(number), aplicabilidad: 'TOCA', estado_preparacion: 'CON_DIFICULTAD' })) }] })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    expect(container.querySelector('.repertoire-rehearsal-mark').textContent).toContain('B')
    expect(container.querySelector('[data-measure-id="m-2"]').getAttribute('aria-label')).toContain('Letra B comienza en compás 2')
  })

  it('loads bounded measure history from the read-only history action', async () => {
    const historyByMeasure = vi.fn(async () => [{ createdAt: '2026-09-14', newState: 'DOMINADO', source: 'PREPARATION_MUTATION' }])
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter({ historyByMeasure }) })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    const measure = container.querySelector('.repertoire-measure')
    measure.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
    container.querySelector('.repertoire-history').click()
    await vi.waitFor(() => expect(historyByMeasure).toHaveBeenCalledWith('montaje-1', 'm-1'))
    expect(container.querySelector('.repertoire-history-list').textContent).toContain('Dominado')
  })

  it('renders the mobile work-detail scope switch and controlled student navigation', async () => {
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter({ listMontajes: async () => [{ ...(await makeAdapter().listMontajes())[0], filas: [{ id: 'fila-1', nombre: 'Trompetas' }], alumnos: [{ id: 'juan', montaje_fila_id: 'fila-1', nombre: 'Juan' }, { id: 'pedro', montaje_fila_id: 'fila-1', nombre: 'Pedro' }] }] }) })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    expect(container.querySelector('#repertoire-detail-mode').getAttribute('aria-label')).toBe('Alcance de evaluación')
    container.querySelector('#repertoire-detail-mode [data-value="alumnos"]').click()
    expect(container.querySelector('.repertoire-student-picker').textContent).toContain('Juan')
    container.querySelector('.repertoire-student-next').click()
    expect(container.querySelector('.repertoire-student-picker').textContent).toContain('Pedro')
    expect(container.querySelector('.repertoire-student-next').disabled).toBe(true)
  })

  it('fails closed for collective writes when real fila backend capability is unavailable', async () => {
    const adapter = makeAdapter({ mode: 'real', supportsFilaPreparation: false })
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    container.querySelector('.repertoire-measure').click()
    await vi.waitFor(() => expect(container.querySelector('.repertoire-sync').textContent).toContain('Actualización de backend requerida'))
    expect(adapter.updateMeasureState).not.toHaveBeenCalled()
  })

  it('renders controlled empty state when the snapshot has no authorized filas', async () => {
    const container = document.createElement('main')
    await renderRepertoireView(container, { adapter: makeAdapter({ listMontajes: async () => [{ id: 'montaje-1', obra: { titulo: 'Obra sin filas' }, filas: [], alumnos: [], compases: [] }] }) })
    container.querySelector('.repertoire-card[data-montaje-id="montaje-1"]').click()
    expect(container.textContent).toContain('No hay filas autorizadas para esta obra.')
    expect(container.querySelector('.repertoire-measure')).toBeNull()
  })
})
