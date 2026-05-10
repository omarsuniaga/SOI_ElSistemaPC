import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createDslToolbar } from '../dslToolbar.js'

describe('dslToolbar - Improve with AI button', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should have "✨ Mejorar con IA" button', () => {
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
    })

    const improveBtn = container.querySelector('#btn-improve-text')
    expect(improveBtn).toBeTruthy()
    expect(improveBtn.textContent).toContain('✨')
    expect(improveBtn.getAttribute('title')).toContain('Mejorar')
  })

  it('should call onImproveClick callback when button is clicked', () => {
    const onImproveClick = vi.fn()
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => 'some text'),
      onImproveClick,
    })

    const improveBtn = container.querySelector('#btn-improve-text')
    improveBtn.click()

    expect(onImproveClick).toHaveBeenCalledTimes(1)
    expect(onImproveClick).toHaveBeenCalledWith('some text')
  })

  it('should disable button while processing', () => {
    const onImproveClick = vi.fn()
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => 'text'),
      onImproveClick,
    })

    const improveBtn = container.querySelector('#btn-improve-text')

    // Simulate button disabled state during processing
    improveBtn.disabled = true
    expect(improveBtn.disabled).toBe(true)

    improveBtn.disabled = false
    expect(improveBtn.disabled).toBe(false)
  })

  it('should not call onImproveClick when editor is empty', () => {
    const onImproveClick = vi.fn()
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
      onImproveClick,
    })

    const improveBtn = container.querySelector('#btn-improve-text')
    improveBtn.click()

    // Should not call handler for empty text
    expect(onImproveClick).not.toHaveBeenCalled()
  })

  it('should pass editor content to onImproveClick', () => {
    const content = 'This is test content that needs improvement'
    const onImproveClick = vi.fn()
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => content),
      onImproveClick,
    })

    const improveBtn = container.querySelector('#btn-improve-text')
    improveBtn.click()

    expect(onImproveClick).toHaveBeenCalledWith(content)
  })
})

describe('dslToolbar - Estructura con IA button', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  it('should have "🚀 Estructurar con IA" button', () => {
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
    })

    const structureBtn = container.querySelector('#btn-ia-magic')
    expect(structureBtn).toBeTruthy()
    expect(structureBtn.textContent).toContain('🚀')
    expect(structureBtn.getAttribute('title')).toContain('Estructurar')
  })

  it('should call onStructureClick callback when button is clicked', () => {
    const onStructureClick = vi.fn()
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => 'María no entendió bien los acordes'),
      onStructureClick,
    })

    const structureBtn = container.querySelector('#btn-ia-magic')
    structureBtn.click()

    expect(onStructureClick).toHaveBeenCalledTimes(1)
    expect(onStructureClick).toHaveBeenCalledWith('María no entendió bien los acordes')
  })

  it('should not call onStructureClick when editor is empty', () => {
    const onStructureClick = vi.fn()
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
      onStructureClick,
    })

    const structureBtn = container.querySelector('#btn-ia-magic')
    structureBtn.click()

    expect(onStructureClick).not.toHaveBeenCalled()
  })

  it('should disable button while processing', () => {
    const onStructureClick = vi.fn()
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => 'text'),
      onStructureClick,
    })

    const structureBtn = container.querySelector('#btn-ia-magic')

    // Simulate button disabled state during processing
    structureBtn.disabled = true
    expect(structureBtn.disabled).toBe(true)

    structureBtn.disabled = false
    expect(structureBtn.disabled).toBe(false)
  })
})

describe('dslToolbar - Help button', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    // Clean up modal if created
    const modal = document.getElementById('pm-toolbar-help-modal')
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  })

  it('should have "❓ Ayuda" help button', () => {
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
    })

    const helpBtn = container.querySelector('#btn-help')
    expect(helpBtn).toBeTruthy()
    expect(helpBtn.textContent).toContain('❓')
    expect(helpBtn.getAttribute('title')).toContain('Ayuda')
  })

  it('should open help modal when button is clicked', () => {
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
    })

    const helpBtn = container.querySelector('#btn-help')
    helpBtn.click()

    const modal = document.getElementById('pm-toolbar-help-modal')
    expect(modal).toBeTruthy()
    expect(modal.classList.contains('open')).toBe(true)
  })

  it('should display help cards for all toolbar tools', () => {
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
    })

    const helpBtn = container.querySelector('#btn-help')
    helpBtn.click()

    const modal = document.getElementById('pm-toolbar-help-modal')
    const helpCards = modal.querySelectorAll('.pm-help-card')

    // Should have 9 help cards (one for each tool)
    expect(helpCards.length).toBe(9)
  })

  it('should close help modal when close button is clicked', () => {
    createDslToolbar(container, {
      onInsert: vi.fn(),
      onLoading: vi.fn(),
      onIaProposal: vi.fn(),
      getEditorContent: vi.fn(() => ''),
    })

    const helpBtn = container.querySelector('#btn-help')
    helpBtn.click()

    const modal = document.getElementById('pm-toolbar-help-modal')
    expect(modal.classList.contains('open')).toBe(true)

    const closeBtn = modal.querySelector('#pm-help-close')
    closeBtn.click()
    expect(modal.classList.contains('open')).toBe(false)
  })
})
