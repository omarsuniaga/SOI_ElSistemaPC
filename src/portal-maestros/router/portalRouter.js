const DEFAULT_ROUTE = 'calendario'

/**
 * Crea una instancia del router hash-based del portal.
 * Rutas válidas: 'login', 'calendario', 'hoy', 'metricas', 'perfil', 'asistencia'
 */
export function createPortalRouter() {
  const handlers = new Map()
  let notFoundFn = null

  function currentRoute() {
    const hash = window.location.hash
    if (!hash || hash === '#' || hash === '#/') return DEFAULT_ROUTE
    return hash.replace('#/', '')
  }

  function navigate(route) {
    window.location.hash = `#/${route}`
  }

  function on(route, handler) {
    handlers.set(route, handler)
  }

  function onNotFound(handler) {
    notFoundFn = handler
  }

  function _dispatch(route) {
    const handler = handlers.get(route)
    if (handler) {
      handler(route)
    } else if (notFoundFn) {
      notFoundFn(route)
    }
  }

  function start() {
    window.addEventListener('hashchange', () => {
      _dispatch(currentRoute())
    })
    _dispatch(currentRoute())
  }

  return { currentRoute, navigate, on, onNotFound, start, _dispatch }
}
