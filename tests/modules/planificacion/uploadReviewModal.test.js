import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { openUploadReviewModal, closeUploadReviewModal } from '../../../src/modules/planificacion/components/uploadReviewModal.js'

vi.mock('../../../src/shared/components/AppToast.js', () => ({
  AppToast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}))

const { AppToast } = await import('../../../src/shared/components/AppToast.js')

function emptyHierarchy() {
  return { route: { nombre: '', nivel: '' }, levels: [] }
}

function sampleHierarchy() {
  return {
    route: { nombre: 'Violín', nivel: 'Inicial' },
    levels: [
      {
        nombre: 'Nivel 1',
        nodes: [
          {
            nombre: 'Tema A',
            objetivos: [
              { descripcion: 'Objetivo 1', indicadores: [{ descripcion: 'Indicador 1a', tipo: 'formativo' }] },
            ],
          },
        ],
      },
    ],
  }
}

function getModal() {
  return document.getElementById('upload-review-modal')
}

function getTreeContainer() {
  return getModal()?.querySelector('#urm-tree-container')
}

function clickAddLevel() {
  getModal()?.querySelector('#urm-add-level')?.click()
}

function clickAction(action, levelIdx, nodeIdx, objIdx, indIdx) {
  const btn = getModal()?.querySelector(
    `[data-action="${action}"][data-level-idx="${levelIdx}"]` +
    (nodeIdx !== undefined ? `[data-node-idx="${nodeIdx}"]` : '') +
    (objIdx !== undefined ? `[data-obj-idx="${objIdx}"]` : '') +
    (indIdx !== undefined ? `[data-ind-idx="${indIdx}"]` : '')
  )
  btn?.click()
}

describe('uploadReviewModal — manual creation', () => {
  let onSave

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    onSave = vi.fn()
  })

  afterEach(() => {
    closeUploadReviewModal()
  })

  it('opens with empty hierarchy and shows correct title', () => {
    openUploadReviewModal(emptyHierarchy(), {
      title: 'Crear Planificación',
      subtitle: 'Construí la estructura manualmente',
      onSave,
    })

    const modal = getModal()
    expect(modal).not.toBeNull()
    expect(modal.querySelector('.urm-title').textContent).toBe('Crear Planificación')
    expect(modal.querySelector('.urm-subtitle').textContent).toBe('Construí la estructura manualmente')
  })

  it('shows default title when none provided', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })

    expect(getModal().querySelector('.urm-title').textContent).toBe('Revisar Jerarquía')
  })

  it('renders empty tree with no levels', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })

    const tree = getTreeContainer()
    expect(tree).not.toBeNull()
    expect(tree.querySelectorAll('.urm-level')).toHaveLength(0)
  })

  it('adds a level when clicking "Agregar nivel"', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })

    clickAddLevel()

    const levels = getTreeContainer().querySelectorAll('.urm-level')
    expect(levels).toHaveLength(1)
    expect(levels[0].querySelector('.urm-input-sm').value).toBe('Nivel 1')
  })

  it('adds a node inside a level', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    clickAddLevel()

    clickAction('add-node', 0)

    const nodes = getTreeContainer().querySelectorAll('.urm-node')
    expect(nodes).toHaveLength(1)
    expect(nodes[0].querySelector('.urm-input-sm').value).toBe('Nuevo tema')
  })

  it('adds an objective inside a node', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    clickAddLevel()
    clickAction('add-node', 0)
    clickAction('add-obj', 0, 0)

    const objs = getTreeContainer().querySelectorAll('.urm-objetivo')
    expect(objs).toHaveLength(1)
    expect(objs[0].querySelector('.urm-input-sm').value).toBe('Nuevo objetivo')
  })

  it('adds an indicator inside an objective', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    clickAddLevel()
    clickAction('add-node', 0)
    clickAction('add-obj', 0, 0)
    clickAction('add-ind', 0, 0, 0)

    const inds = getTreeContainer().querySelectorAll('.urm-indicador')
    expect(inds).toHaveLength(1)
    expect(inds[0].querySelector('.urm-input-sm').value).toBe('Nuevo indicador')
  })

  it('removes a level', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    clickAddLevel()
    expect(getTreeContainer().querySelectorAll('.urm-level')).toHaveLength(1)

    clickAction('remove-level', 0)

    expect(getTreeContainer().querySelectorAll('.urm-level')).toHaveLength(0)
  })

  it('removes a node', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    clickAddLevel()
    clickAction('add-node', 0)
    expect(getTreeContainer().querySelectorAll('.urm-node')).toHaveLength(1)

    clickAction('remove-node', 0, 0)

    expect(getTreeContainer().querySelectorAll('.urm-node')).toHaveLength(0)
  })

  it('edits route name via input', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })

    const input = getModal().querySelector('#urm-route-nombre')
    input.value = 'Guitarra'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(input.value).toBe('Guitarra')
  })

  it('saves and calls onSave with the hierarchy data', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    clickAddLevel()
    clickAction('add-node', 0)
    clickAction('add-obj', 0, 0)

    const nombreInput = getModal().querySelector('#urm-route-nombre')
    nombreInput.value = 'Piano'
    nombreInput.dispatchEvent(new Event('input', { bubbles: true }))

    getModal().querySelector('.urm-save-btn').click()

    expect(onSave).toHaveBeenCalledTimes(1)
    const saved = onSave.mock.calls[0][0]
    expect(saved.route.nombre).toBe('Piano')
    expect(saved.levels).toHaveLength(1)
    expect(saved.levels[0].nodes[0].objetivos).toHaveLength(1)
  })

  it('rejects save when no levels exist', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })

    getModal().querySelector('.urm-save-btn').click()

    expect(onSave).not.toHaveBeenCalled()
    expect(AppToast.error).toHaveBeenCalledWith('Debe haber al menos un nivel')
  })

  it('rejects save when no objectives exist in any node', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    clickAddLevel()

    getModal().querySelector('.urm-save-btn').click()

    expect(onSave).not.toHaveBeenCalled()
    expect(AppToast.error).toHaveBeenCalledWith('Debe haber al menos un objetivo en algún nodo')
  })

  it('closes on Escape key', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    expect(getModal()).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    setTimeout(() => {
      expect(getModal()).toBeNull()
    }, 300)
  })

  it('closes on backdrop click', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })
    expect(getModal()).not.toBeNull()

    getModal().querySelector('.urm-backdrop').click()

    setTimeout(() => {
      expect(getModal()).toBeNull()
    }, 300)
  })

  it('loads pre-existing hierarchy data correctly', () => {
    const data = sampleHierarchy()
    openUploadReviewModal(data, { onSave })

    expect(getModal().querySelector('#urm-route-nombre').value).toBe('Violín')
    expect(getModal().querySelector('#urm-route-nivel').value).toBe('Inicial')
    expect(getTreeContainer().querySelectorAll('.urm-level')).toHaveLength(1)
    expect(getTreeContainer().querySelectorAll('.urm-node')).toHaveLength(1)
    expect(getTreeContainer().querySelectorAll('.urm-objetivo')).toHaveLength(1)
    expect(getTreeContainer().querySelectorAll('.urm-indicador')).toHaveLength(1)
  })

  it('full manual flow: build complete hierarchy from scratch', () => {
    openUploadReviewModal(emptyHierarchy(), { onSave })

    const nombreInput = getModal().querySelector('#urm-route-nombre')
    nombreInput.value = 'Canto'
    nombreInput.dispatchEvent(new Event('input', { bubbles: true }))

    const nivelInput = getModal().querySelector('#urm-route-nivel')
    nivelInput.value = 'Intermedio'
    nivelInput.dispatchEvent(new Event('input', { bubbles: true }))

    clickAddLevel()
    clickAction('add-node', 0)
    clickAction('add-obj', 0, 0)
    clickAction('add-ind', 0, 0, 0)

    const indInput = getTreeContainer().querySelector('.urm-indicador .urm-input-sm')
    indInput.value = 'Ejecuta escalas mayor'
    indInput.dispatchEvent(new Event('input', { bubbles: true }))

    getModal().querySelector('.urm-save-btn').click()

    expect(onSave).toHaveBeenCalledTimes(1)
    const saved = onSave.mock.calls[0][0]
    expect(saved.route.nombre).toBe('Canto')
    expect(saved.route.nivel).toBe('Intermedio')
    expect(saved.levels[0].nombre).toBe('Nivel 1')
    expect(saved.levels[0].nodes[0].nombre).toBe('Nuevo tema')
    expect(saved.levels[0].nodes[0].objetivos[0].indicadores[0].descripcion).toBe('Ejecuta escalas mayor')
  })
})
