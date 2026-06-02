/**
 * SyncQueueBadge — Indicador visual de cola de sincronización offline
 *
 * Muestra un badge con la cantidad de operaciones pendientes de sync.
 * Escucha el evento `online`/`offline` nativo del navegador.
 * El procesamiento real de la cola lo maneja `main-maestros.js`
 * con su listener de `window.addEventListener('online', _triggerSync)`.
 *
 * Uso:
 *   import { createSyncQueueBadge } from '../components/SyncQueueBadge.js'
 *   const badge = createSyncQueueBadge()
 *   container.appendChild(badge.el)
 */

import { getQueueCount } from '../services/offlineQueue.js'

/**
 * Crea el badge de estado de sync.
 * @param {object} [options]
 * @param {boolean} [options.showSyncButton=true] - Muestra botón para sync manual
 * @returns {{ el: HTMLElement, destroy: () => void, refresh: () => Promise<void> }}
 */
export function createSyncQueueBadge(options = {}) {
  const { showSyncButton = true } = options

  const el = document.createElement('div')
  el.className = 'pm-sync-badge'
  el.style.cssText = `
    display: none;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    cursor: default;
    transition: all 0.2s ease;
    white-space: nowrap;
  `

  const icon = document.createElement('span')
  icon.textContent = '☁️'
  icon.style.fontSize = '12px'

  const label = document.createElement('span')
  label.textContent = ''

  const syncBtn = document.createElement('button')
  if (showSyncButton) {
    syncBtn.textContent = 'Sincronizar'
    syncBtn.style.cssText = `
      background: transparent;
      border: none;
      color: inherit;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 8px;
      text-decoration: underline;
      text-underline-offset: 2px;
    `
    syncBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      syncBtn.disabled = true
      // Dispara el evento online para que main-maestros.js procese la cola
      window.dispatchEvent(new Event('online'))
      await _refresh()
      syncBtn.disabled = false
    })
  }

  el.appendChild(icon)
  el.appendChild(label)
  if (showSyncButton) el.appendChild(syncBtn)

  /** Actualiza el badge consultando la cola */
  async function _refresh() {
    const count = await getQueueCount()
    if (count === 0) {
      el.style.display = 'none'
      return
    }
    el.style.display = 'inline-flex'
    el.style.background = '#fef3c7'
    el.style.color = '#92400e'
    el.style.border = '1px solid #fde68a'
    icon.textContent = '☁️'
    label.textContent = `${count} pendiente${count !== 1 ? 's' : ''}`
    if (syncBtn) syncBtn.style.display = !navigator.onLine ? 'none' : ''
  }

  // Refrescar al reconectar
  function _onOnline() {
    // Le damos tiempo a main-maestros.js para procesar la cola
    setTimeout(_refresh, 2000)
  }

  function _onOffline() {
    _refresh()
  }

  window.addEventListener('online', _onOnline)
  window.addEventListener('offline', _onOffline)

  // Cargar estado inicial
  _refresh()

  return {
    el,
    destroy: () => {
      window.removeEventListener('online', _onOnline)
      window.removeEventListener('offline', _onOffline)
      el.remove()
    },
    refresh: _refresh,
  }
}
