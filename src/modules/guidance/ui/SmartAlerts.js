/**
 * SmartAlerts.js — Proactive alert banners for critical situations.
 *
 * Shows dismissible alert banners at the top of the view for
 * critical/high-priority conditions detected by the rules engine.
 *
 * @module guidance/ui
 */

import { getGuidanceService } from '../guidanceService.js'

const ALERT_ICONS = {
  critical: 'bi-exclamation-triangle-fill',
  high: 'bi-exclamation-circle-fill',
}

/**
 * Create a SmartAlerts instance.
 * @param {Object} opts
 * @param {string} opts.containerSelector - CSS selector for alert container
 * @param {number} [opts.maxAlerts=2]     - Max alerts to show
 * @param {Function} [opts.onAlertAction] - Callback when user clicks alert action
 * @returns {Object} Smart alerts API
 */
export function createSmartAlerts(opts) {
  const { containerSelector, maxAlerts = 2, onAlertAction } = opts

  let _container = null
  let _wrapper = null
  const _dismissed = new Set()
  let _unsubscribe = null

  function _findContainer() {
    _container = document.querySelector(containerSelector)
    return _container
  }

  function _createWrapper() {
    if (_wrapper && _wrapper.parentNode) return _wrapper
    _wrapper = document.createElement('div')
    _wrapper.className = 'guidance-alerts'
    _wrapper.setAttribute('role', 'alert')
    _wrapper.setAttribute('aria-live', 'assertive')
    return _wrapper
  }

  function _renderAlert(alert) {
    const el = document.createElement('div')
    el.className = `guidance-alert guidance-alert--${alert.priority}`
    el.setAttribute('data-alert-id', alert.id)

    const iconClass = ALERT_ICONS[alert.priority] || 'bi-info-circle-fill'

    el.innerHTML = `
      <div class="guidance-hint__icon">
        <i class="bi ${iconClass}"></i>
      </div>
      <div class="guidance-alert__body">
        <p class="guidance-alert__message">${_escapeHtml(alert.message)}</p>
        ${alert.action ? `<p class="guidance-alert__action">${_escapeHtml(alert.action)}</p>` : ''}
      </div>
      <button class="guidance-alert__dismiss"
              aria-label="Cerrar alerta"
              data-dismiss-alert="${alert.id}">
        <i class="bi bi-x"></i>
      </button>
    `

    el.querySelector('[data-dismiss-alert]')?.addEventListener('click', () => _dismiss(alert.id))

    if (onAlertAction) {
      el.querySelector('.guidance-alert__body')?.addEventListener('click', () => {
        onAlertAction(alert.id, alert)
      })
      el.querySelector('.guidance-alert__body').style.cursor = 'pointer'
    }

    return el
  }

  function _dismiss(alertId) {
    _dismissed.add(alertId)
    const el = _wrapper?.querySelector(`[data-alert-id="${alertId}"]`)
    if (el) el.remove()
    _persistDismissed()
  }

  function _persistDismissed() {
    try {
      localStorage.setItem('guidance-dismissed-alerts', JSON.stringify([..._dismissed]))
    } catch { /* ignore */ }
  }

  function _restoreDismissed() {
    try {
      const stored = JSON.parse(localStorage.getItem('guidance-dismissed-alerts') || '[]')
      for (const id of stored) _dismissed.add(id)
    } catch { /* ignore */ }
  }

  function _render() {
    if (!_findContainer()) return

    const service = getGuidanceService()
    const { alerts } = service.getHints()

    _createWrapper()
    _restoreDismissed()
    _wrapper.innerHTML = ''

    const visible = alerts
      .filter(a => !_dismissed.has(a.id))
      .slice(0, maxAlerts)

    if (visible.length === 0) {
      _wrapper.style.display = 'none'
      return
    }

    _wrapper.style.display = ''

    for (const alert of visible) {
      _wrapper.appendChild(_renderAlert(alert))
    }

    if (_container && !_container.contains(_wrapper)) {
      _container.prepend(_wrapper)
    }
  }

  return {
    start() {
      _render()
      const service = getGuidanceService()
      _unsubscribe = service.subscribe(() => _render())
    },

    stop() {
      if (_unsubscribe) { _unsubscribe(); _unsubscribe = null }
      if (_wrapper?.parentNode) _wrapper.remove()
      _wrapper = null
      _dismissed.clear()
    },

    refresh() {
      _render()
    },

    dismiss(alertId) {
      _dismiss(alertId)
    },

    getDismissed() {
      return [..._dismissed]
    },

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
