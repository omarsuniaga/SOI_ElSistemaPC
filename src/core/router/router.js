import { Modal } from 'bootstrap'

export const router = {
  routes: {},
  _authCheck: null,
  _publicRoutes: ['login', 'register'],
  _guardEnabled: false,
  _portalPrefix: '',

  setPortalPrefix(prefix) {
    this._portalPrefix = prefix ? `/${prefix.replace(/^\/+|\/+$/g, '')}` : ''
  },

  register(path, renderFunction) {
    this.routes[path] = renderFunction
  },

  setAuthGuard(authCheckFn, publicRoutes = ['login', 'register']) {
    this._authCheck = authCheckFn
    this._publicRoutes = publicRoutes
    this._guardEnabled = true
  },

  _cleanupModals() {
    // Dispose all Bootstrap modal instances to remove backdrop and body classes
    document.querySelectorAll('.modal.show, .modal.fade').forEach((el) => {
      try {
        const instance = Modal.getInstance(el)
        if (instance) instance.dispose()
      } catch {}
    })
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  },

  _matchRoute(path) {
    if (!path) return null
    const cleanPath = String(path).replace(/^#\/?/, '').replace(/^\/+|\/+$/g, '')

    // 1. Coincidencia exacta directa
    if (this.routes[cleanPath]) {
      return { renderFn: this.routes[cleanPath], matchedRoute: cleanPath, routeParams: {} }
    }

    // 2. Coincidencia por patrón con parámetros dinámicos (:param)
    for (const pattern of Object.keys(this.routes)) {
      if (!pattern.includes(':')) continue
      const patternParts = pattern.replace(/^\/+|\/+$/g, '').split('/')
      const pathParts = cleanPath.split('/')

      if (patternParts.length !== pathParts.length) continue

      const routeParams = {}
      let match = true

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          const paramName = patternParts[i].slice(1)
          routeParams[paramName] = decodeURIComponent(pathParts[i])
        } else if (patternParts[i] !== pathParts[i]) {
          match = false
          break
        }
      }

      if (match) {
        return { renderFn: this.routes[pattern], matchedRoute: pattern, routeParams }
      }
    }

    // 3. Fallback inteligente por variantes (ej. 'alumnos-duplicados' <-> 'alumnos/duplicados')
    const slashVersion = cleanPath.replace(/-/g, '/')
    if (this.routes[slashVersion]) {
      return { renderFn: this.routes[slashVersion], matchedRoute: slashVersion, routeParams: {} }
    }

    const hyphenVersion = cleanPath.replace(/\//g, '-')
    if (this.routes[hyphenVersion]) {
      return { renderFn: this.routes[hyphenVersion], matchedRoute: hyphenVersion, routeParams: {} }
    }

    return null
  },

  navigate(path, params = {}) {
    const { routePath, queryParams } = this._splitRoutePath(path)
    const match = this._matchRoute(routePath)

    if (!match) {
      console.warn(`[Router] Route '${routePath}' not found in current context. Falling back to default.`)
      const fallbackRoute = this.routes['clases-hoy']
        ? 'clases-hoy'
        : (this.routes['dir-score']
          ? 'dir-score'
          : (this.routes['programas'] ? 'programas' : Object.keys(this.routes)[0]))
      if (fallbackRoute && fallbackRoute !== routePath) {
        this.navigate(fallbackRoute, {})
        return
      }
      console.error(`Route ${routePath} not found`)
      return
    }

    const mergedParams = { ...match.routeParams, ...queryParams, ...(params || {}) }

    if (this._guardEnabled && this._authCheck && !this._publicRoutes.includes(match.matchedRoute)) {
      if (!this._authCheck()) {
        localStorage.setItem('current-view', 'login')
        localStorage.setItem('intended-route', routePath)
        if (Object.keys(mergedParams).length > 0) {
          localStorage.setItem('intended-route-params', JSON.stringify(mergedParams))
        } else {
          localStorage.removeItem('intended-route-params')
        }
        this._navigateTo('login', 'login', {})
        return
      }
    }
    this._navigateTo(match.matchedRoute, routePath, mergedParams)
  },

  _navigateTo(matchedKey, originalPath, params = {}) {
    const app = document.querySelector('#app')
    if (app) {
      this._cleanupModals()
      app.innerHTML = ''
      this.routes[matchedKey](app, params)
      localStorage.setItem('current-view', originalPath)
      if (params && Object.keys(params).length > 0) {
        localStorage.setItem('current-view-params', JSON.stringify(params))
      } else {
        localStorage.removeItem('current-view-params')
      }

      // Sincronizar URL limpia en la barra del navegador (sin .html ni #)
      if (typeof window.history?.pushState === 'function' && typeof window.location !== 'undefined') {
        const cleanPath = originalPath.replace(/^#\/?/, '').replace(/^\/+/, '')
        const newUrl = this._portalPrefix ? `${this._portalPrefix}/${cleanPath}` : `/${cleanPath}`
        if (window.location.pathname !== newUrl && !window.location.protocol.startsWith('file')) {
          window.history.pushState(null, '', newUrl)
        }
      }

      window.dispatchEvent(new CustomEvent('routeChanged', { detail: originalPath }))
    }
  },

  _splitRoutePath(path) {
    if (typeof path !== 'string') {
      return { routePath: path, queryParams: {} }
    }

    const clean = path.replace(/^#\/?/, '')
    const [routePath, queryString = ''] = clean.split('?')
    const queryParams = {}

    if (queryString) {
      const searchParams = new URLSearchParams(queryString)
      for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value
      }
    }

    return { routePath, queryParams }
  },

  init(defaultRoute = 'clases-hoy') {
    let pathFromUrl = ''
    const pathname = window.location?.pathname || ''
    if (this._portalPrefix && (pathname === this._portalPrefix || pathname.startsWith(this._portalPrefix + '/'))) {
      pathFromUrl = pathname.slice(this._portalPrefix.length).replace(/^\/+/, '')
    } else if (!this._portalPrefix && pathname !== '/' && !pathname.endsWith('.html')) {
      pathFromUrl = pathname.replace(/^\/+/, '')
    }

    const hashRoute = window.location?.hash ? window.location.hash.replace(/^#\/?/, '') : ''
    const currentView = (pathFromUrl && this._matchRoute(this._splitRoutePath(pathFromUrl).routePath))
      ? pathFromUrl
      : ((hashRoute && this._matchRoute(this._splitRoutePath(hashRoute).routePath))
        ? hashRoute
        : (localStorage.getItem('current-view') || defaultRoute))

    const { routePath } = this._splitRoutePath(currentView)
    const paramsRaw = localStorage.getItem('current-view-params')
    const params = paramsRaw ? JSON.parse(paramsRaw) : {}

    if (!this._matchRoute(routePath)) {
      const fallback = this.routes[defaultRoute]
        ? defaultRoute
        : (this.routes['clases-hoy']
          ? 'clases-hoy'
          : (this.routes['dir-score'] ? 'dir-score' : Object.keys(this.routes)[0]))
      if (fallback) {
        this.navigate(fallback, {})
        return
      }
    }
    this.navigate(currentView, params)
  },

  // Escucha eventos de navegación emitidos por componentes hijos y por el historial del navegador
  initCustomEvents() {
    window.addEventListener('popstate', () => {
      let pathFromUrl = ''
      const pathname = window.location?.pathname || ''
      if (this._portalPrefix && (pathname === this._portalPrefix || pathname.startsWith(this._portalPrefix + '/'))) {
        pathFromUrl = pathname.slice(this._portalPrefix.length).replace(/^\/+/, '')
      } else if (!this._portalPrefix && pathname !== '/' && !pathname.endsWith('.html')) {
        pathFromUrl = pathname.replace(/^\/+/, '')
      }
      if (pathFromUrl && this._matchRoute(pathFromUrl)) {
        this.navigate(pathFromUrl)
      }
    })

    window.addEventListener('hashchange', () => {
      const hash = window.location?.hash ? window.location.hash.replace(/^#\/?/, '') : ''
      const { routePath } = this._splitRoutePath(hash)
      if (routePath && this._matchRoute(routePath)) {
        this.navigate(hash)
      }
    })

    window.addEventListener('navigate:alumno', (e) => {
      const id = e.detail?.alumnoId || e.detail?.id
      if (id) this.navigate(`alumnos/${id}`, { selectedId: id })
    })

    window.addEventListener('navigate:observaciones', (e) => {
      const alumnoId = e.detail?.alumnoId
      if (alumnoId) this.navigate('observaciones', { filtroAlumnoId: alumnoId })
    })

    window.addEventListener('navigate:metricas-alumno', (e) => {
      const id = e.detail?.alumnoId || e.detail?.id
      if (id) this.navigate('metricas-riesgo', { highlightId: id })
    })
  },
}
