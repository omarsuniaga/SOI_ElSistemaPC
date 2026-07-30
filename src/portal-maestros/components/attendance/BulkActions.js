/**
 * createBulkActions
 * Manejadores para botones de marcar todos presentes/ausentes.
 */
export function createBulkActions(container, { onMarkAll, onClearAll }) {
  const btnP = container.querySelector('#btn-bulk-p')
  const btnA = container.querySelector('#btn-bulk-a')
  const btnClear = container.querySelector('#btn-bulk-clear')
  const _listeners = []

  function _on(el, event, handler) {
    if (!el) return
    el.addEventListener(event, handler)
    _listeners.push(() => el.removeEventListener(event, handler))
  }

  _on(btnP, 'click', (e) => {
    e.preventDefault()
    if (onMarkAll) onMarkAll('P')
  })

  _on(btnA, 'click', (e) => {
    e.preventDefault()
    if (onMarkAll) onMarkAll('A')
  })

  _on(btnClear, 'click', (e) => {
    e.preventDefault()
    if (onClearAll) onClearAll()
  })

  return {
    destroy() {
      _listeners.forEach((fn) => { try { fn() } catch { /* ignore */ } })
      _listeners.length = 0
    },
  }
}
