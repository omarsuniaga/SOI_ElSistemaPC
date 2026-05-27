/**
 * PortalRouter - Router SPA para el Portal Maestros
 * USA history.pushState + popstate para navegación SIN RECARGA
 * No usa window.location.hash que causa recargas completas
 */

const DEFAULT_ROUTE = 'calendario'

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

  // _pendingParams: params passed via navigate() that _dispatch will forward to the handler
  let _pendingParams = null

  function navigate(route, params = {}) {
    if (_guardEnabled && _authCheck && !_publicRoutes.includes(route)) {
      if (!_authCheck()) {
        localStorage.setItem('intended-route', route)
        history.pushState({ route: 'login' }, '', '#/login')
        _dispatch('login')
        return
      }
    }
    if (params && Object.keys(params).length > 0) {
      _pendingParams = params
      // Force re-dispatch even if already on this route (e.g. open a specific record)
      _currentRoute = null
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

  /**
   * Focus the first heading (h1/h2) or [role="main"] element inside a view container.
   * Adds tabindex="-1" if the element isn't natively focusable.
   */
  function _focusViewHeading(view) {
    const target = view.querySelector('h1, h2, [role="main"]')
    if (target) {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1')
      }
      target.focus({ preventScroll: true })
    }
  }

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

    // Merge any params passed via navigate() with route-pattern params
    if (_pendingParams) {
      params = { ...params, ..._pendingParams }
      _pendingParams = null
    }

    const fn = handler || notFoundFn
    if (!fn) return

    const callFn = async () => {
      // If the function is a dynamic import or async, await it
      if (typeof fn === 'function') {
        await fn(fullRoute, params)
      }
    }

    if (!document.startViewTransition || _activeTransition) {
      if (_activeTransition) {
        _activeTransition.skipTransition()
        _activeTransition = null
      }
      
      const view = document.querySelector('.pm-view-content.active')
      if (view) {
        view.classList.remove('pm-animate-fade-in', 'pm-view-enter', 'pm-view-enter-active')
        void view.offsetWidth // force reflow
      }
      
      callFn()
      
      const newView = document.querySelector('.pm-view-content.active')
      if (newView) {
        newView.classList.add('pm-animate-fade-in')
        // View transition: two-step class toggle for fade-in effect
        newView.classList.add('pm-view-enter')
        requestAnimationFrame(() => {
          newView.classList.add('pm-view-enter-active')
          // Focus first heading for a11y after the new view has rendered
          _focusViewHeading(newView)
          // Clean up classes after transition completes
          const cleanUp = () => {
            newView.classList.remove('pm-view-enter', 'pm-view-enter-active')
          }
          newView.addEventListener('transitionend', cleanUp, { once: true })
          // Fallback cleanup if transitionend doesn't fire
          setTimeout(cleanUp, 250)
        })
      }
      return
    }

    try {
      const transition = document.startViewTransition(async () => {
        await callFn()
      })
      _activeTransition = transition

      const suppress = (p) => p.catch(() => {})
      suppress(transition.ready)
      suppress(transition.updateCallbackDone)
      suppress(transition.finished)

      transition.finished.finally(() => {
        _activeTransition = null
        // Focus first heading after the view transition completes
        const newView = document.querySelector('.pm-view-content.active')
        if (newView) {
          requestAnimationFrame(() => _focusViewHeading(newView))
        }
      })
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