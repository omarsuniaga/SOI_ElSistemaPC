/**
 * Focus Trap Utility
 *
 * Traps keyboard focus within a container element for accessible modals/panels.
 * - Tab/Shift+Tab cycle through focusable elements
 * - Auto-focuses first focusable element
 * - Stores and restores document.activeElement
 * - Escape calls onClose callback
 *
 * @param {HTMLElement} containerEl - The element to trap focus within
 * @param {Object} options
 * @param {Function} options.onClose - Called when Escape is pressed
 * @returns {{ dispose: Function }}
 */
export function enableTrap(containerEl, { onClose } = {}) {
  if (!containerEl) return { dispose: () => {} }

  const FOCUSABLE_SELECTOR =
    'button:not([disabled]):not([hidden]), ' +
    'input:not([disabled]):not([type=hidden]), ' +
    'select:not([disabled]), ' +
    'textarea:not([disabled]), ' +
    '[tabindex]:not([tabindex="-1"]):not([disabled])'

  /** Store the element that had focus before the trap was enabled */
  const previousActiveElement = document.activeElement

  /** Get all focusable elements inside the container */
  function getFocusableElements() {
    return Array.from(containerEl.querySelectorAll(FOCUSABLE_SELECTOR))
  }

  /** Focus the first focusable element */
  function focusFirst() {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
    }
  }

  /** Handle Tab keydown */
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (typeof onClose === 'function') {
        onClose()
      }
      return
    }

    if (e.key !== 'Tab') return

    const focusable = getFocusableElements()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    e.preventDefault()

    const currentIndex = focusable.indexOf(document.activeElement)

    if (e.shiftKey) {
      // Shift+Tab: move backward, wrap to last if at first or not found
      const nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1
      focusable[nextIndex].focus()
    } else {
      // Tab: move forward, wrap to first if at last or not found
      const nextIndex = currentIndex === -1 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1
      focusable[nextIndex].focus()
    }
  }

  // Auto-focus first element
  focusFirst()

  // Listen for keydown events on the container
  containerEl.addEventListener('keydown', handleKeydown)

  /** Cleanup function: restores focus and removes listeners */
  function dispose() {
    containerEl.removeEventListener('keydown', handleKeydown)
    // Restore focus to the element that was active before the trap
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus()
    }
  }

  return { dispose }
}
