// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ open: vi.fn(), toast: { warning: vi.fn(), error: vi.fn(), success: vi.fn(), info: vi.fn() } }))
vi.mock('../../../../shared/components/AppModal.js', () => ({ AppModal: { open: mocks.open } }))
vi.mock('../../../../shared/components/AppToast.js', () => ({ AppToast: mocks.toast }))

import { createPresentRatingsPanel } from '../PresentRatingsPanel.js'

const alumnos = [
  { id: 'a', nombre_completo: 'Ana Presente' },
  { id: 'b', nombre_completo: 'Beto Ausente' },
  { id: 'c', nombre_completo: 'Carla Justificada' },
  { id: 'd', nombre_completo: 'Dani Sin Marcar' },
  { id: 'e', nombre_completo: 'Eli Tarde' },
]
const estado = { a: 'P', b: 'A', c: 'J', d: null, e: 'T' }

function setup({ sesionId = 'ses', rows, saveRatings = vi.fn(async (_s, items) => ({ saved: items.map(i => i.alumno_id), rejected: [] })) } = {}) {
  const loadRatings = vi.fn(async () => rows ?? [
    { alumno_id: 'a', estado: 'presente', valoracion: 4 },
    { alumno_id: 'e', estado: 'tarde', valoracion: null },
  ])
  const panel = createPresentRatingsPanel({
    getAlumnos: () => alumnos, getEstado: () => estado, getSesionId: () => sesionId, loadRatings, saveRatings,
  })
  return { panel, loadRatings, saveRatings }
}

async function openPanel(ctx) {
  await ctx.panel.open()
  const options = mocks.open.mock.calls.at(-1)[0]
  const root = document.createElement('div'); root.innerHTML = options.body; document.body.append(root)
  options.onShow(root)
  return { options, root }
}
const pick = (root, id, value) => root.querySelector(`[data-student-id="${id}"] [data-rate="${value}"]`).click()
const checked = (root, id) => root.querySelector(`[data-student-id="${id}"] [aria-checked="true"]`)?.dataset.rate

describe('PresentRatingsPanel', () => {
  beforeEach(() => { vi.clearAllMocks(); document.body.innerHTML = '' })

  it('lists only present students and excludes absent, justified and unmarked', async () => {
    const { root } = await openPanel(setup())
    const ids = [...root.querySelectorAll('.pm-pr-row')].map(r => r.dataset.studentId)
    expect(ids).toEqual(['a', 'e'])
    expect(root.textContent).toContain('3 alumnos sin evaluar por estar ausentes')
    expect(root.textContent).not.toContain('Beto Ausente')
  })

  it('recovers saved ratings and shows "Sin evaluar" distinct from zero', async () => {
    const { root } = await openPanel(setup())
    expect(checked(root, 'a')).toBe('4')
    expect(checked(root, 'e')).toBe('')
    pick(root, 'e', 0)
    expect(checked(root, 'e')).toBe('0')
    expect(root.querySelector('[data-student-id="e"] [data-pr-status]').textContent).toContain('0 estrellas')
    pick(root, 'e', '')
    expect(checked(root, 'e')).toBe('')
    expect(root.querySelector('[data-student-id="e"] [data-pr-status]').textContent).toContain('Sin evaluar')
  })

  it('selects 0–5 directly with a single click (no tap cycling)', async () => {
    const { root } = await openPanel(setup())
    for (const v of [5, 0, 3, 1]) { pick(root, 'a', v); expect(checked(root, 'a')).toBe(String(v)) }
  })

  it('sends only changed students, so an untouched row is never rewritten', async () => {
    const ctx = setup()
    const { options, root } = await openPanel(ctx)
    pick(root, 'e', 0)
    expect(await options.onSave(root)).toBe(true)
    expect(ctx.saveRatings).toHaveBeenCalledWith('ses', [{ alumno_id: 'e', valoracion: 0 }])
  })

  it('does nothing when there are no changes and keeps the modal open', async () => {
    const ctx = setup()
    const { options, root } = await openPanel(ctx)
    expect(await options.onSave(root)).toBe(false)
    expect(ctx.saveRatings).not.toHaveBeenCalled()
  })

  it('allows correcting a saved rating and a second save only sends the new correction', async () => {
    const ctx = setup()
    const { options, root } = await openPanel(ctx)
    pick(root, 'a', 2)
    await options.onSave(root)
    expect(ctx.saveRatings).toHaveBeenLastCalledWith('ses', [{ alumno_id: 'a', valoracion: 2 }])
    expect(await options.onSave(root)).toBe(false)
    pick(root, 'a', 5)
    await options.onSave(root)
    expect(ctx.saveRatings).toHaveBeenLastCalledWith('ses', [{ alumno_id: 'a', valoracion: 5 }])
  })

  it('requires a saved session before opening', async () => {
    const ctx = setup({ sesionId: null })
    await ctx.panel.open()
    expect(mocks.open).not.toHaveBeenCalled()
    expect(mocks.toast.warning).toHaveBeenCalledWith(expect.stringContaining('guarda la sesión'))
  })

  it('locks students whose attendance is not saved yet instead of inventing a row', async () => {
    const { root } = await openPanel(setup({ rows: [{ alumno_id: 'a', estado: 'presente', valoracion: null }] }))
    expect(root.querySelector('[data-student-id="e"] [data-rate="3"]').disabled).toBe(true)
    expect(root.querySelector('[data-student-id="e"]').textContent).toContain('Guarda la sesión')
  })

  it('keeps selections and reports the failure when saving fails', async () => {
    const ctx = setup({ saveRatings: vi.fn(async () => { throw new Error('red') }) })
    const { options, root } = await openPanel(ctx)
    pick(root, 'e', 3)
    expect(await options.onSave(root)).toBe(false)
    expect(checked(root, 'e')).toBe('3')
    expect(mocks.toast.error).toHaveBeenCalled()
  })

  it('names students the server rejected', async () => {
    const ctx = setup({ saveRatings: vi.fn(async () => ({ saved: [], rejected: [{ alumno_id: 'e', reason: 'no_presente' }] })) })
    const { options, root } = await openPanel(ctx)
    pick(root, 'e', 3)
    await options.onSave(root)
    expect(mocks.toast.warning).toHaveBeenCalledWith(expect.stringContaining('Eli Tarde'))
  })

  it('escapes student names', async () => {
    const xss = { id: 'x', nombre_completo: '<img src=x onerror=alert(1)>' }
    const panel = createPresentRatingsPanel({
      getAlumnos: () => [xss], getEstado: () => ({ x: 'P' }), getSesionId: () => 's',
      loadRatings: async () => [{ alumno_id: 'x', estado: 'presente', valoracion: null }], saveRatings: vi.fn(),
    })
    await panel.open()
    expect(mocks.open.mock.calls.at(-1)[0].body).not.toContain('<img')
  })
})


describe('PresentRatingsPanel bulk review', () => {
  beforeEach(() => { vi.clearAllMocks(); document.body.innerHTML = '' })
  it('applies only to explicitly selected present students, then permits individual correction', async () => {
    const ctx = setup()
    const { root, options } = await openPanel(ctx)
    root.querySelector('[data-pr-selected][value="e"]').checked = true
    root.querySelector('[data-pr-bulk-value]').value = '3'
    root.querySelector('[data-pr-apply]').click()
    expect(checked(root, 'a')).toBe('4')
    expect(checked(root, 'e')).toBe('3')
    pick(root, 'e', 0)
    await options.onSave(root)
    expect(ctx.saveRatings).toHaveBeenCalledWith('ses', [{ alumno_id: 'e', valoracion: 0 }])
  })
  it('reports missing evaluations and does not fill them by default', async () => {
    const { root } = await openPanel(setup())
    expect(root.querySelector('[data-pr-coverage]').textContent).toBe('1/2 evaluados · 1 sin evaluar')
    root.querySelector('[data-pr-bulk-value]').value = '5'
    root.querySelector('[data-pr-apply]').click()
    expect(checked(root, 'e')).toBe('')
  })
})


describe('PresentRatingsPanel incomplete schema', () => {
  beforeEach(() => { vi.clearAllMocks(); document.body.innerHTML = '' })
  it('explains unavailable ratings without opening or fabricating an editable scale', async () => {
    const error = Object.assign(new Error('Unavailable'), { code: 'RATINGS_SCHEMA_UNAVAILABLE' })
    const loadRatings = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce([])
    const saveRatings = vi.fn()
    const panel = createPresentRatingsPanel({
      getAlumnos: () => alumnos, getEstado: () => estado, getSesionId: () => 'ses',
      loadRatings, saveRatings,
    })
    await panel.open()
    expect(mocks.toast.warning).toHaveBeenCalledWith(expect.stringContaining('aún no están habilitadas'))
    expect(mocks.open).not.toHaveBeenCalled()
    expect(mocks.toast.error).not.toHaveBeenCalled()
    expect(saveRatings).not.toHaveBeenCalled()
    await panel.open()
    expect(loadRatings).toHaveBeenCalledTimes(2)
    expect(mocks.open).toHaveBeenCalledTimes(1)
  })
})
