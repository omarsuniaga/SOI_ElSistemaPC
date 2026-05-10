import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createImproveTextModal } from '../improveTextModal.js'

describe('improveTextModal', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    // Clean up any modal in body
    const modal = document.getElementById('pm-improve-text-modal')
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  })

  it('should render modal with original and improved text', () => {
    const modal = createImproveTextModal(container, {})

    const original = 'original text'
    const improved = 'improved text'

    modal.open({ original, improved })

    const modalEl = document.getElementById('pm-improve-text-modal')
    expect(modalEl).toBeTruthy()
    expect(modalEl.classList.contains('open')).toBe(true)
    expect(modalEl.textContent).toContain(original)
    expect(modalEl.textContent).toContain(improved)
  })

  it('should display original text in left panel', () => {
    const modal = createImproveTextModal(container, {})
    const original = 'This is the original text'
    const improved = 'This is the improved text'

    modal.open({ original, improved })

    const originalPanel = document.querySelector('#pm-improve-original')
    expect(originalPanel).toBeTruthy()
    expect(originalPanel.textContent).toContain(original)
  })

  it('should display improved text in right panel', () => {
    const modal = createImproveTextModal(container, {})
    const original = 'This is the original text'
    const improved = 'This is the improved text'

    modal.open({ original, improved })

    const improvedPanel = document.querySelector('#pm-improve-text')
    expect(improvedPanel).toBeTruthy()
    expect(improvedPanel.textContent).toContain(improved)
  })

  it('should call onAccept when accept button clicked', () => {
    const onAccept = vi.fn()
    const modal = createImproveTextModal(container, { onAccept })

    const original = 'original'
    const improved = 'improved text that has been polished'

    modal.open({ original, improved })

    const acceptBtn = document.querySelector('#pm-improve-accept')
    acceptBtn.click()

    expect(onAccept).toHaveBeenCalledWith(improved)
    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  it('should close modal when reject button clicked', () => {
    const modal = createImproveTextModal(container, {})
    const original = 'original'
    const improved = 'improved'

    modal.open({ original, improved })
    const modalEl = document.getElementById('pm-improve-text-modal')
    expect(modalEl.classList.contains('open')).toBe(true)

    const rejectBtn = document.querySelector('#pm-improve-reject')
    rejectBtn.click()

    expect(modalEl.classList.contains('open')).toBe(false)
  })

  it('should close modal when close button clicked', () => {
    const modal = createImproveTextModal(container, {})
    const original = 'original'
    const improved = 'improved'

    modal.open({ original, improved })
    const modalEl = document.getElementById('pm-improve-text-modal')
    expect(modalEl.classList.contains('open')).toBe(true)

    const closeBtn = document.querySelector('#pm-improve-close')
    closeBtn.click()

    expect(modalEl.classList.contains('open')).toBe(false)
  })

  it('should allow editing improved text before accept', () => {
    const onAccept = vi.fn()
    const modal = createImproveTextModal(container, { onAccept })

    modal.open({ original: 'original', improved: 'initial improved text' })

    const improvedPanel = document.querySelector('#pm-improve-text')
    improvedPanel.textContent = 'edited improved text'

    document.querySelector('#pm-improve-accept').click()

    expect(onAccept).toHaveBeenCalledWith('edited improved text')
  })

  it('should reuse existing modal if already in DOM', () => {
    const modal1 = createImproveTextModal(container, {})
    const modal2 = createImproveTextModal(container, {})

    const modals = document.querySelectorAll('#pm-improve-text-modal')
    expect(modals.length).toBe(1)
  })

  it('should not call onAccept when reject is clicked', () => {
    const onAccept = vi.fn()
    const modal = createImproveTextModal(container, { onAccept })

    modal.open({ original: 'original', improved: 'improved' })
    document.querySelector('#pm-improve-reject').click()

    expect(onAccept).not.toHaveBeenCalled()
  })
})
