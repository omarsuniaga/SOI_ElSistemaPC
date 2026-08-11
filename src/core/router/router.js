import { Modal } from 'bootstrap'

export const router = {
  routes: {},
  _authCheck: null,
  _publicRoutes: ['login', 'register'],
  _guardEnabled: false,

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

  navigate(path, params = {}) {
    const { routePath, queryParams } = this._splitRoutePath(path)
    const mergedParams = { ...queryParams, ...(params || {}) }

    if (!this.routes[routePath]) {
      console.warn(`[Router] Route '${routePath}' not found in current context. Falling back to default.`)
      const fallbackRoute = this.routes['dir-score']
        ? 'dir-score'
        : (this.routes['programas'] ? 'programas' : Object.keys(this.routes)[0])
      if (fallbackRoute && fallbackRoute !== routePath) {
        this.navigate(fallbackRoute, {})
        return
      }
      console.error(`Route ${routePath} not found`)
      return
    }

    if (this._guardEnabled && this._authCheck && !this._publicRoutes.includes(routePath)) {
      if (!this._authCheck()) {
        localStorage.setItem('current-view', 'login')
        localStorage.setItem('intended-route', routePath)
        if (Object.keys(mergedParams).length > 0) {
          localStorage.setItem('intended-route-params', JSON.stringify(mergedParams))
        } else {
          localStorage.removeItem('intended-route-params')
        }
        this._navigateTo('login', {})
        return
      }
    }
    this._navigateTo(routePath, mergedParams)
  },

  _navigateTo(path, params = {}) {
    const app = document.querySelector('#app')
    if (app) {
      this._cleanupModals()
      app.innerHTML = ''
      this.routes[path](app, params)
      localStorage.setItem('current-view', path)
      if (params && Object.keys(params).length > 0) {
        localStorage.setItem('current-view-params', JSON.stringify(params))
      } else {
        localStorage.removeItem('current-view-params')
      }
      window.dispatchEvent(new CustomEvent('routeChanged', { detail: path }))
    }
  },

  _splitRoutePath(path) {
    if (typeof path !== 'string') {
      return { routePath: path, queryParams: {} }
    }

    const [routePath, queryString = ''] = path.split('?')
    const queryParams = {}

    if (queryString) {
      const searchParams = new URLSearchParams(queryString)
      for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value
      }
    }

    return { routePath, queryParams }
  },

  init(defaultRoute = 'programas') {
    const currentView = localStorage.getItem('current-view') || defaultRoute
    const { routePath } = this._splitRoutePath(currentView)
    const paramsRaw = localStorage.getItem('current-view-params')
    const params = paramsRaw ? JSON.parse(paramsRaw) : {}

    if (!this.routes[routePath]) {
      const fallback = this.routes[defaultRoute]
        ? defaultRoute
        : (this.routes['dir-score'] ? 'dir-score' : Object.keys(this.routes)[0])
      if (fallback) {
        this.navigate(fallback, {})
        return
      }
    }
    this.navigate(currentView, params)
  },

  // Escucha eventos de navegación emitidos por componentes hijos
  // navigate:alumno   → { alumnoId } o { id }
  // navigate:observaciones → { alumnoId }
  initCustomEvents() {
    window.addEventListener('navigate:alumno', (e) => {
      const id = e.detail?.alumnoId || e.detail?.id
      if (id) this.navigate('alumnos', { selectedId: id })
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
