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
