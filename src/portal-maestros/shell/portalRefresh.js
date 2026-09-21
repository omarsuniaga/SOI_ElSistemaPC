/**
 * portalRefresh.js
 * Responsabilidad: rehacer el estado del portal sin recargar la página.
 *
 * El portal cachea en dos niveles: los datos (viewCache, SWR con respaldo en
 * sessionStorage) y las vistas ya renderizadas (`_viewRendered`). Por eso
 * navegar a otra pestaña y volver no trae nada nuevo, y el maestro terminaba
 * cerrando la app para verla actualizada. Este refresco tira los dos niveles y
 * vuelve a pintar la ruta en la que está.
 */

/**
 * @param {Object} deps
 * @param {Function} deps.invalidateData - Limpia el cache de datos (viewCache + vuelos en curso).
 * @param {Function} deps.invalidateViews - Limpia el cache de vistas renderizadas.
 * @param {Function} deps.renderView - Vuelve a pintar una ruta (async).
 * @param {Function} deps.getCurrentRoute - Ruta activa.
 * @param {Function} [deps.checkForUpdate] - Le pide al service worker que busque versión nueva.
 * @param {Function} [deps.onStateChange] - Recibe 'running' | 'done' | 'error'.
 * @returns {() => Promise<{ok: boolean, route?: string, skipped?: boolean, error?: Error}>}
 */
export function createPortalRefresher({
  invalidateData,
  invalidateViews,
  renderView,
  getCurrentRoute,
  checkForUpdate,
  onStateChange,
}) {
  let running = false

  return async function refresh() {
    // Toques repetidos mientras el refresco corre no encolan trabajo: el
    // maestro suele apretar dos veces cuando la red está lenta.
    if (running) return { ok: false, skipped: true }
    running = true
    onStateChange?.('running')

    try {
      invalidateData?.()
      invalidateViews?.()

      const route = getCurrentRoute?.() || 'hoy'
      await renderView(route)

      // La versión nueva del código llega por el aviso del service worker; acá
      // solo se dispara la búsqueda, sin hacer esperar al refresco de datos.
      try {
        checkForUpdate?.()
      } catch {
        // Buscar actualización es oportunista: que falle no invalida el refresco.
      }

      onStateChange?.('done')
      return { ok: true, route }
    } catch (error) {
      onStateChange?.('error')
      return { ok: false, error }
    } finally {
      running = false
    }
  }
}
