/**
 * Tests for focusTrap utility
 *
 * Tests Tab/Shift+Tab cycling, auto-focus, Escape close,
 * and focus restoration on dispose.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { enableTrap } from '../focusTrap.js'

describe('enableTrap', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <button id="btn-1">First</button>
      <input id="input-1" type="text" />
      <select id="select-1"><option>1</option></select>
      <textarea id="textarea-1"></textarea>
      <button id="btn-2">Last</button>
      <div tabindex="0" id="div-focusable">Focusable div</div>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container.parentNode) container.parentNode.removeChild(container)
  })

  it('should return an object with a dispose function', () => {
    const trap = enableTrap(container, { onClose: vi.fn() })
    expect(trap).toBeTruthy()
    expect(typeof trap.dispose).toBe('function')
  })

  it('should auto-focus the first focusable element inside the container', () => {
    enableTrap(container, { onClose: vi.fn() })
    expect(document.activeElement).toBe(document.getElementById('btn-1'))
  })

  it('should trap Tab and cycle forward through focusable elements', () => {
    enableTrap(container, { onClose: vi.fn() })
    // btn-1 is already focused (auto-focus)

    // Tab to input-1
    document.getElementById('btn-1').focus()
    document.getElementById('btn-1').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('input-1'))

    // Tab to select-1
    document.getElementById('input-1').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('select-1'))

    // Tab to textarea-1
    document.getElementById('select-1').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('textarea-1'))

    // Tab to btn-2
    document.getElementById('textarea-1').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('btn-2'))

    // Tab to div-focusable
    document.getElementById('btn-2').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('div-focusable'))
  })

  it('should wrap from the last to the first element on Tab', () => {
    enableTrap(container, { onClose: vi.fn() })
    const last = document.getElementById('div-focusable')
    last.focus()

    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('btn-1'))
  })

  it('should reverse cycle on Shift+Tab', () => {
    enableTrap(container, { onClose: vi.fn() })
    // Focus the last element
    const last = document.getElementById('div-focusable')
    last.focus()

    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('btn-2'))
  })

  it('should wrap from the first to the last element on Shift+Tab', () => {
    enableTrap(container, { onClose: vi.fn() })
    const first = document.getElementById('btn-1')
    first.focus()

    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(document.getElementById('div-focusable'))
  })

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    enableTrap(container, { onClose })

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should restore focus to previously active element on dispose', () => {
    // Set up a trigger element that is outside the container
    const trigger = document.createElement('button')
    trigger.id = 'trigger-btn'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    const trap = enableTrap(container, { onClose: vi.fn() })
    // After trap, focus moved inside
    expect(document.activeElement).not.toBe(trigger)

    trap.dispose()
    expect(document.activeElement).toBe(trigger)

    document.body.removeChild(trigger)
  })

  it('should stop trapping Tab after dispose', () => {
    const trap = enableTrap(container, { onClose: vi.fn() })
    trap.dispose()

    const first = document.getElementById('btn-1')
    const second = document.getElementById('input-1')
    first.focus()

    // Tab should move freely (not trapped)
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    // Without trap, the event isn't prevented so focus shouldn't wrap
    expect(document.activeElement).toBe(first) // Default Tab behavior won't auto-move in jsdom
  })

  it('should not call onClose for Escape after dispose', () => {
    const onClose = vi.fn()
    const trap = enableTrap(container, { onClose })
    trap.dispose()

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onClose).not.toHaveBeenCalled()
  })
})
