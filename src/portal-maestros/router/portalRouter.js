/**
 * PortalRouter - Router SPA para el Portal Maestros
 * USA history.pushState + popstate para navegación SIN RECARGA
 * No usa window.location.hash que causa recargas completas
 */

const DEFAULT_ROUTE = 'hoy'

export function createPortalRouter() {
  const handlers = new Map()
  let notFoundFn = null
  let _currentRoute = null
  let _authCheck = null
  let _publicRoutes = ['login']
  let _guardEnabled = false

  function currentRoute() {
    const path = window.location.pathname
    const hash = window.location.hash
    if (hash && hash !== '#') {
      return hash.replace('#/', '').replace('#', '')
    }
    if (path && path !== '/') {
      return path.replace('/', '')
    }
    return DEFAULT_ROUTE
  }

  function setAuthGuard(authCheckFn, publicRoutes = ['login']) {
    _authCheck = authCheckFn
    _publicRoutes = publicRoutes
    _guardEnabled = true
  }

  function navigate(route) {
    if (_guardEnabled && _authCheck && !_publicRoutes.includes(route)) {
      if (!_authCheck()) {
        localStorage.setItem('intended-route', route)
        history.pushState({ route: 'login' }, '', '#/login')
        _dispatch('login')
        return
      }
    }
    const url = `#/${route}`
    history.pushState({ route }, '', url)
    _dispatch(route)
  }

  function replace(route) {
    if (_guardEnabled && _authCheck && !_publicRoutes.includes(route)) {
      if (!_authCheck()) {
        localStorage.setItem('intended-route', route)
        history.replaceState({ route: 'login' }, '', '#/login')
        _dispatch('login')
        return
      }
    }
    const url = `#/${route}`
    history.replaceState({ route }, '', url)
    _dispatch(route)
  }

  function on(route, handler) {
    handlers.set(route, handler)
  }

  function onNotFound(handler) {
    notFoundFn = handler
  }

  let _activeTransition = null

  function _dispatch(fullRoute) {
    if (_currentRoute === fullRoute && _currentRoute !== null) {
      return
    }
    _currentRoute = fullRoute

    const routePart = fullRoute.split('?')[0]
    
    let handler = handlers.get(routePart)
    let params = {}

    if (!handler) {
      for (const [key, value] of handlers.entries()) {
        if (key.includes(':')) {
          const regexStr = '^' + key.replace(/:[^\s/]+/g, '([^\\/]+)') + '$'
          const regex = new RegExp(regexStr)
          const match = routePart.match(regex)
          if (match) {
            handler = value
            const paramNames = key.match(/:[^\s/]+/g)
            paramNames.forEach((name, index) => {
              params[name.substring(1)] = match[index + 1]
            })
            break
          }
        }
      }
    }

    const fn = handler || notFoundFn
    if (!fn) return

    const callFn = () => fn(fullRoute, params)

    if (!document.startViewTransition || _activeTransition) {
      if (_activeTransition) {
        _activeTransition.skipTransition()
        _activeTransition = null
      }
      
      const view = document.querySelector('.pm-view-content.active')
      if (view) {
        view.classList.remove('pm-animate-fade-in')
        void view.offsetWidth // force reflow
      }
      
      callFn()
      
      const newView = document.querySelector('.pm-view-content.active')
      if (newView) {
        newView.classList.add('pm-animate-fade-in')
      }
      return
    }

    try {
      const transition = document.startViewTransition(() => callFn())
      _activeTransition = transition

      const suppress = (p) => p.catch(() => {})
      suppress(transition.ready)
      suppress(transition.updateCallbackDone)
      suppress(transition.finished)

      transition.finished.finally(() => { _activeTransition = null })
    } catch (error) {
      _activeTransition = null
      callFn()
    }
  }

  function start() {
    window.addEventListener('popstate', (e) => {
      if (e.state?.route) {
        _dispatch(e.state.route)
      } else {
        _dispatch(currentRoute())
      }
    })

    const initialRoute = currentRoute()
    if (initialRoute !== DEFAULT_ROUTE) {
      history.replaceState({ route: initialRoute }, '', `#/${initialRoute}`)
    }
    _dispatch(initialRoute)
  }

  return { currentRoute, setAuthGuard, navigate, replace, on, onNotFound, start, _dispatch }
}