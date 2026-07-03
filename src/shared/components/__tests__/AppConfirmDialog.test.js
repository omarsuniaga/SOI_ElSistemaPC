import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { confirmDialog } from '../AppConfirmDialog.js'

describe('AppConfirmDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('renders the dialog with the given title, message and button labels', () => {
    confirmDialog({
      title: 'Conflicto',
      message: 'Hay un conflicto',
      confirmText: 'Sí',
      cancelText: 'No',
    })

    const dialog = document.querySelector('[role="alertdialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog.textContent).toContain('Conflicto')
    expect(dialog.textContent).toContain('Hay un conflicto')
    expect(dialog.querySelector('.app-confirm-btn-confirm').textContent).toBe('Sí')
    expect(dialog.querySelector('.app-confirm-btn-cancel').textContent).toBe('No')
  })

  it('resolves true when the confirm button is clicked', async () => {
    const promise = confirmDialog({ title: 'T', message: 'M' })
    const dialog = document.querySelector('[role="alertdialog"]')
    dialog.querySelector('.app-confirm-btn-confirm').click()

    await expect(promise).resolves.toBe(true)
  })

  it('resolves false when the cancel button is clicked', async () => {
    const promise = confirmDialog({ title: 'T', message: 'M' })
    const dialog = document.querySelector('[role="alertdialog"]')
    dialog.querySelector('.app-confirm-btn-cancel').click()

    await expect(promise).resolves.toBe(false)
  })

  it('resolves false when Escape is pressed', async () => {
    const promise = confirmDialog({ title: 'T', message: 'M' })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    await expect(promise).resolves.toBe(false)
  })

  it('resolves false when clicking the backdrop (outside the dialog)', async () => {
    const promise = confirmDialog({ title: 'T', message: 'M' })
    const backdrop = document.body.firstElementChild

    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    // Manually set target since jsdom MouseEvent dispatched on backdrop already has target=backdrop
    await expect(promise).resolves.toBe(false)
  })

  it('does not stack on / touch the AppModal singleton DOM', () => {
    // Simulate an already-open AppModal
    const appModalDiv = document.createElement('div')
    appModalDiv.id = 'app-global-modal'
    appModalDiv.innerHTML = '<div class="app-modal-body">Existing content</div>'
    document.body.appendChild(appModalDiv)

    confirmDialog({ title: 'T', message: 'M' })

    // AppModal content must remain untouched
    expect(document.getElementById('app-global-modal').innerHTML).toContain('Existing content')
    // The confirm dialog builds its own separate node
    expect(document.querySelector('[role="alertdialog"]')).toBeTruthy()
  })
})
