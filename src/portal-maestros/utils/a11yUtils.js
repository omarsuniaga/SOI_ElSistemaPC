/**
 * Accessibility utilities for form validation and live region announcements.
 *
 * Provides:
 * - setFieldError / clearFieldError: inline form error management using aria-describedby + aria-invalid
 * - clearAllFieldErrors: batch clear all field errors in a container
 * - announce: live region announcements for dynamic content updates
 */

// ─── Live Region Announce ────────────────────────────────
let _liveRegion = null
let _announceTimer = null

/**
 * Announces a message to screen readers via an aria-live region.
 *
 * @param {string} message - The text to announce.
 * @param {'polite'|'assertive'} [priority='polite'] - ARIA live region priority.
 */
export function announce(message, priority = 'polite') {
  if (!_liveRegion) {
    _liveRegion = document.createElement('div')
    _liveRegion.setAttribute('aria-live', priority)
    _liveRegion.setAttribute('aria-atomic', 'true')
    _liveRegion.classList.add('pm-visually-hidden')
    document.body.appendChild(_liveRegion)
  }

  // Set correct role/aria-live for the requested priority
  if (priority === 'assertive') {
    _liveRegion.setAttribute('role', 'alert')
    _liveRegion.setAttribute('aria-live', 'assertive')
  } else {
    _liveRegion.removeAttribute('role')
    _liveRegion.setAttribute('aria-live', 'polite')
  }

  // Clear and re-set so repeated identical messages are re-announced
  clearTimeout(_announceTimer)
  _announceTimer = setTimeout(() => {
    _liveRegion.textContent = ''
    requestAnimationFrame(() => {
      _liveRegion.textContent = message
    })
  }, 50)
}

// ─── Inline Field Errors ─────────────────────────────────

/**
 * Sets an inline error on a form field using aria-describedby and aria-invalid.
 *
 * @param {HTMLElement} inputEl - The input/select/textarea element.
 * @param {string} message - The error message to display.
 */
export function setFieldError(inputEl, message) {
  if (!inputEl || !inputEl.id) return

  // Remove any existing error for this field first
  clearFieldError(inputEl)

  // Create error element
  const errorId = `${inputEl.id}-error`
  const errorEl = document.createElement('span')
  errorEl.id = errorId
  errorEl.className = 'pm-field-error'
  errorEl.setAttribute('role', 'alert')
  errorEl.textContent = message

  // Insert after the input
  if (inputEl.nextSibling) {
    inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling)
  } else {
    inputEl.parentNode.appendChild(errorEl)
  }

  // Mark input as invalid and link to error
  inputEl.setAttribute('aria-invalid', 'true')
  inputEl.setAttribute('aria-describedby', errorId)
}

/**
 * Clears an inline error from a form field.
 *
 * @param {HTMLElement} inputEl - The input/select/textarea element.
 */
export function clearFieldError(inputEl) {
  if (!inputEl) return

  // Remove ARIA attributes
  inputEl.removeAttribute('aria-invalid')
  inputEl.removeAttribute('aria-describedby')

  // Remove error element
  if (inputEl.id) {
    const errorEl = document.getElementById(`${inputEl.id}-error`)
    if (errorEl) errorEl.remove()
  }
}

/**
 * Clears all field errors inside a container (or the whole document).
 *
 * @param {HTMLElement} [container=document] - Scope for clearing errors.
 */
export function clearAllFieldErrors(container) {
  const scope = container || document
  scope.querySelectorAll('[aria-invalid="true"]').forEach(el => clearFieldError(el))
}
