/**
 * InlineContextHints.js — Renders contextual hints inline at the top of a view.
 *
 * Uses the guidance service to evaluate rules and shows up to 3
 * proactive hints as dismissible cards.
 *
 * @module guidance/ui
 */

import { getGuidanceService } from '../guidanceService.js'

/**
 * @typedef {Object} InlineHintsOptions
 * @property {string}  containerSelector - CSS selector for the hint container
 * @property {number}  [maxHints=3]      - Max proactive hints to show
 * @property {boolean} [animate=true]    - Enable enter/exit animations
 */

const HINT_ICONS = {
  critical: 'bi-exclamation-triangle-fill',
  high: 'bi-exclamation-circle-fill',
  medium: 'bi-info-circle-fill',
  low: 'bi-lightbulb',
}

/**
 * Create an InlineContextHints instance.
 * @param {InlineHintsOptions} opts
 * @returns {Object} Inline hints API
 */
export function createInlineHints(opts) {
  const { containerSelector, maxHints = 3, animate = true } = opts

  /** @type {HTMLElement|null} */
  let _container = null
  /** @type {HTMLElement|null} */
  let _wrapper = null
  /** @type {Set<string>} Dismissed hint ids */
  const _dismissed = new Set()
  /** @type {Function} */
  let _unsubscribe = null

  function _findContainer() {
    _container = document.querySelector(containerSelector)
    return _container
  }

  function _createWrapper() {
    if (_wrapper && _wrapper.parentNode) return _wrapper
    _wrapper = document.createElement('div')
    _wrapper.className = 'guidance-hints'
    _wrapper.setAttribute('role', 'region')
    _wrapper.setAttribute('aria-label', 'Sugerencias contextuales')
    return _wrapper
  }

  function _renderHint(hint) {
    const el = document.createElement('div')
    el.className = `guidance-hint guidance-hint--${hint.priority}`
    el.setAttribute('data-hint-id', hint.id)
    el.setAttribute('role', 'alert')
    el.setAttribute('aria-live', 'polite')

    const iconClass = HINT_ICONS[hint.priority] || HINT_ICONS.medium

    el.innerHTML = `
      <div class="guidance-hint__icon">
        <i class="bi ${iconClass}"></i>
      </div>
      <div class="guidance-hint__body">
        <p class="guidance-hint__message">${_escapeHtml(hint.message)}</p>
        ${hint.action ? `<p class="guidance-hint__action">${_escapeHtml(hint.action)}</p>` : ''}
      </div>
      <button class="guidance-hint__dismiss"
              aria-label="Cerrar sugerencia"
              data-dismiss-hint="${hint.id}">
        <i class="bi bi-x"></i>
      </button>
    `

    // Dismiss handler
    const btn = el.querySelector('[data-dismiss-hint]')
    btn?.addEventListener('click', () => _dismiss(hint.id))

    return el
  }

  function _dismiss(hintId) {
    _dismissed.add(hintId)
    const el = _wrapper?.querySelector(`[data-hint-id="${hintId}"]`)
    if (!el) return

    if (animate) {
      el.classList.add('guidance-hint--exiting')
      el.addEventListener('animationend', () => el.remove(), { once: true })
    } else {
      el.remove()
    }
  }

  function _render() {
    if (!_findContainer()) return

    const service = getGuidanceService()
    const { proactive } = service.getHints()

    const visible = proactive
      .filter(h => !_dismissed.has(h.id))
      .slice(0, maxHints)

    _createWrapper()
    _wrapper.innerHTML = ''

    if (visible.length === 0) {
      // No hints — hide wrapper entirely
      _wrapper.style.display = 'none'
      return
    }

    _wrapper.style.display = ''

    for (const hint of visible) {
      _wrapper.appendChild(_renderHint(hint))
    }

    // Insert into container if not already there
    if (_container && !_container.contains(_wrapper)) {
      _container.prepend(_wrapper)
    }
  }

  return {
    /**
     * Start listening for context changes and render hints.
     */
    start() {
      _render()
      const service = getGuidanceService()
      _unsubscribe = service.subscribe(() => _render())
    },

    /**
     * Stop listening and remove hints from DOM.
     */
    stop() {
      if (_unsubscribe) {
        _unsubscribe()
        _unsubscribe = null
      }
      if (_wrapper?.parentNode) {
        _wrapper.remove()
      }
      _wrapper = null
      _dismissed.clear()
    },

    /**
     * Force re-render.
     */
    refresh() {
      _render()
    },

    /**
     * Dismiss a specific hint programmatically.
     * @param {string} hintId
     */
    dismiss(hintId) {
      _dismiss(hintId)
    },

    /**
     * Get dismissed hint ids (for persistence).
     * @returns {string[]}
     */
    getDismissed() {
      return [..._dismissed]
    },

    /**
     * Restore dismissed hints (from localStorage).
     * @param {string[]} ids
     */
    restoreDismissed(ids) {
      for (const id of ids) _dismissed.add(id)
    },
  }
}

function _escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
