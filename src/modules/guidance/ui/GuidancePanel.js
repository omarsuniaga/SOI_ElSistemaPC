/**
 * GuidancePanel.js — Slide-from-right contextual guidance panel.
 *
 * Replaces the generic chatWidget with business-aware guidance.
 * Shows: Available Actions, Reactive Hints, Q&A input.
 *
 * @module guidance/ui
 */

import { getGuidanceService } from '../guidanceService.js'

/**
 * @typedef {Object} GuidancePanelOptions
 * @property {Function} [onNavigate] - Callback when user clicks an action (receives action key)
 */

/**
 * Create a GuidancePanel instance.
 * @param {GuidancePanelOptions} [opts={}]
 * @returns {Object} Panel API
 */
export function createGuidancePanel(opts = {}) {
  /** @type {HTMLElement|null} */
  let _panel = null
  /** @type {HTMLElement|null} */
  let _overlay = null
  /** @type {HTMLElement|null} */
  let _triggerBtn = null
  /** @type {boolean} */
  let _isOpen = false
  /** @type {Function} */
  let _unsubscribe = null

  const PANEL_ID = 'guidance-panel'

  function _createPanel() {
    if (_panel) return _panel

    _panel = document.createElement('aside')
    _panel.id = PANEL_ID
    _panel.className = 'guidance-panel'
    _panel.setAttribute('role', 'dialog')
    _panel.setAttribute('aria-label', 'Panel de orientación')
    _panel.setAttribute('aria-hidden', 'true')

    _panel.innerHTML = `
      <div class="guidance-panel__header">
        <h2 class="guidance-panel__title">
          <i class="bi bi-compass" style="margin-right: 8px;"></i>Orientación
        </h2>
        <button class="guidance-panel__close" aria-label="Cerrar panel" data-guidance-close>
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="guidance-panel__body">
        <div class="guidance-section" data-guidance-actions-section>
          <h3 class="guidance-section__title">Acciones disponibles</h3>
          <div class="guidance-actions" data-guidance-actions></div>
        </div>
        <div class="guidance-section" data-guidance-hints-section>
          <h3 class="guidance-section__title">Sugerencias</h3>
          <div data-guidance-reactive-hints></div>
        </div>
        <div class="guidance-section" data-guidance-qa-section>
          <h3 class="guidance-section__title">Consultar</h3>
          <div class="guidance-qa-input">
            <input type="text"
                   class="guidance-qa-field"
                   placeholder="Escribí tu pregunta..."
                   data-guidance-qa-input
                   aria-label="Pregunta para orientación" />
            <button class="guidance-qa-send"
                    data-guidance-qa-send
                    aria-label="Enviar pregunta">
              <i class="bi bi-send"></i>
            </button>
          </div>
          <div class="guidance-qa-response" data-guidance-qa-response></div>
        </div>
      </div>
    `

    // Close handlers
    _panel.querySelector('[data-guidance-close]')?.addEventListener('click', _close)
    _panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') _close()
    })

    document.body.appendChild(_panel)

    // Overlay
    _overlay = document.createElement('div')
    _overlay.className = 'guidance-overlay'
    _overlay.addEventListener('click', _close)
    document.body.appendChild(_overlay)

    return _panel
  }

  function _renderActions() {
    if (!_panel) return
    const service = getGuidanceService()
    const actions = service.getActions()
    const container = _panel.querySelector('[data-guidance-actions]')
    if (!container) return

    container.innerHTML = ''

    if (actions.length === 0) {
      container.innerHTML = '<p style="color: var(--pm-text-muted); font-size: 14px;">No hay acciones disponibles para esta vista.</p>'
      return
    }

    for (const action of actions) {
      const btn = document.createElement('button')
      btn.className = `guidance-action ${action.priority === 'secondary' ? 'guidance-action--secondary' : ''}`
      btn.setAttribute('data-action', action.action)
      btn.innerHTML = `
        <span class="guidance-action__icon"><i class="bi ${action.icon}"></i></span>
        <span>${_escapeHtml(action.label)}</span>
      `
      btn.addEventListener('click', () => {
        if (opts.onNavigate) opts.onNavigate(action.action)
      })
      container.appendChild(btn)
    }
  }

  function _renderReactiveHints() {
    if (!_panel) return
    const service = getGuidanceService()
    const { reactive } = service.getHints()
    const container = _panel.querySelector('[data-guidance-reactive-hints]')
    if (!container) return

    container.innerHTML = ''

    if (reactive.length === 0) {
      container.innerHTML = '<p style="color: var(--pm-text-muted); font-size: 14px;">No hay sugerencias pendientes.</p>'
      return
    }

    for (const hint of reactive) {
      const el = document.createElement('div')
      el.className = `guidance-hint guidance-hint--${hint.priority}`
      el.innerHTML = `
        <div class="guidance-hint__body">
          <p class="guidance-hint__message">${_escapeHtml(hint.message)}</p>
          ${hint.action ? `<p class="guidance-hint__action">${_escapeHtml(hint.action)}</p>` : ''}
        </div>
      `
      container.appendChild(el)
    }
  }

  function _renderAll() {
    _renderActions()
    _renderReactiveHints()
  }

  function _toggle() {
    if (_isOpen) _close()
    else _open()
  }

  function _open() {
    _createPanel()
    _isOpen = true
    _panel.classList.add('guidance-panel--open')
    _panel.setAttribute('aria-hidden', 'false')
    _overlay?.classList.add('guidance-overlay--visible')
    _renderAll()
    const closeBtn = _panel.querySelector('[data-guidance-close]')
    closeBtn?.focus()
  }

  function _close() {
    if (!_panel) return
    _isOpen = false
    _panel.classList.remove('guidance-panel--open')
    _panel.setAttribute('aria-hidden', 'true')
    _overlay?.classList.remove('guidance-overlay--visible')
    _triggerBtn?.focus()
  }

  function _createTriggerButton() {
    if (_triggerBtn) return

    _triggerBtn = document.createElement('button')
    _triggerBtn.className = 'guidance-trigger'
    _triggerBtn.setAttribute('aria-label', 'Abrir panel de orientación')
    _triggerBtn.innerHTML = '<i class="bi bi-compass"></i>'
    _triggerBtn.addEventListener('click', _toggle)

    // Find a good place to put it (bottom-right, above bottom nav)
    _triggerBtn.style.cssText = `
      position: fixed;
      bottom: calc(var(--pm-bottom-nav-h, 64px) + 16px);
      right: 16px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--pm-primary);
      color: white;
      border: none;
      box-shadow: var(--pm-shadow-lg);
      cursor: pointer;
      z-index: var(--pm-z-nav);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      transition: transform var(--pm-transition-fast), box-shadow var(--pm-transition-fast);
    `
    _triggerBtn.addEventListener('mouseenter', () => {
      _triggerBtn.style.transform = 'scale(1.08)'
    })
    _triggerBtn.addEventListener('mouseleave', () => {
      _triggerBtn.style.transform = 'scale(1)'
    })

    document.body.appendChild(_triggerBtn)
  }

  return {
    /**
     * Open the guidance panel.
     */
    open: _open,

    /**
     * Close the guidance panel.
     */
    close: _close,

    /**
     * Toggle open/close.
     */
    toggle: _toggle,

    /**
     * Check if panel is open.
     * @returns {boolean}
     */
    get isOpen() {
      return _isOpen
    },

    /**
     * Refresh panel contents.
     */
    refresh() {
      if (_isOpen) _renderAll()
    },

    /**
     * Start: add trigger button and subscribe to service changes.
     */
    start() {
      _createTriggerButton()
      const service = getGuidanceService()
      _unsubscribe = service.subscribe(() => {
        if (_isOpen) _renderAll()
      })
    },

    /**
     * Stop: remove everything.
     */
    stop() {
      if (_unsubscribe) {
        _unsubscribe()
        _unsubscribe = null
      }
      this.close()
      _panel?.remove()
      _overlay?.remove()
      _triggerBtn?.remove()
      _panel = null
      _overlay = null
      _triggerBtn = null
    },
  }
}

function _escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
