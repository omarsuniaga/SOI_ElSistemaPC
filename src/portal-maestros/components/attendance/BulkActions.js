/**
 * createBulkActions
 * Manejadores para botones de marcar todos presentes/ausentes.
 */
export function createBulkActions(container, { onMarkAll }) {
  if (!onMarkAll) return { destroy() {} }

  const btnP = container.querySelector('#btn-bulk-p')
  const btnA = container.querySelector('#btn-bulk-a')
  const _listeners = []

  function _on(el, event, handler) {
    if (!el) return
    el.addEventListener(event, handler)
    _listeners.push(() => el.removeEventListener(event, handler))
  }

  _on(btnP, 'click', (e) => {
    e.preventDefault()
    onMarkAll('P')
  })

  _on(btnA, 'click', (e) => {
    e.preventDefault()
    onMarkAll('A')
  })

  return {
    destroy() {
      _listeners.forEach((fn) => { try { fn() } catch { /* ignore */ } })
      _listeners.length = 0
    },
  }
}
