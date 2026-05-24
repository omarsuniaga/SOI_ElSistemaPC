import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AppModal } from '../AppModal.js'

describe('AppModal - ESC key close functionality', () => {
  beforeEach(() => {
    // Clear DOM and reset state
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    AppModal.close()
    vi.restoreAllMocks()
  })

  it('should open the modal successfully', () => {
    AppModal.open({
      title: 'Test Modal',
      body: '<p>Content</p>'
    })

    const titleEl = document.querySelector('.app-modal-title')
    expect(titleEl).toBeTruthy()
    expect(titleEl.textContent).toBe('Test Modal')
  })

  it('should close the modal when pressing ESC key', async () => {
    AppModal.open({
      title: 'Test Modal',
      body: '<p>Content</p>'
    })

    // Confirm modal element is visible
    let modalEl = document.getElementById('app-global-modal')
    expect(modalEl.style.display).toBe('flex')

    // Simulate keydown Escape
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)

    // Modal closes with transition timer
    vi.runAllTimers()

    // Confirm modal element is hidden
    modalEl = document.getElementById('app-global-modal')
    expect(modalEl.style.display).toBe('none')
  })

  it('should trigger custom onCancel when pressing ESC key', () => {
    const onCancelMock = vi.fn()
    AppModal.open({
      title: 'Test Modal',
      body: '<p>Content</p>',
      onCancel: onCancelMock
    })

    // Simulate keydown Escape
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)

    expect(onCancelMock).toHaveBeenCalled()
  })
})
