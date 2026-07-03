import { Modal } from 'bootstrap'

export const router = {
  routes: {},
  _authCheck: null,
  _publicRoutes: ['login', 'register'],
  _guardEnabled: false,
  _history: [],
  _navigatingBack: false,

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
    document.querySelectorAll('.modal.show, .modal.fade').forEach(el => {
      try {
        const instance = Modal.getInstance(el)
        if (instance) instance.dispose()
      } catch {}
    })
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  },

  navigate(path, params = {}) {
    if (!this.routes[path]) {
      console.error(`Route ${path} not found`)
      return
    }
    if (this._guardEnabled && this._authCheck && !this._publicRoutes.includes(path)) {
      if (!this._authCheck()) {
        localStorage.setItem('current-view', 'login')
        localStorage.setItem('intended-route', path)
        this._navigateTo('login', {})
        return
      }
    }
    this._navigateTo(path, params)
  },

  _navigateTo(path, params = {}) {
    const app = document.querySelector('#app')
    if (app) {
      // Push the route we're leaving onto the history stack so the header's
      // back button can return to it. Skip when this navigation IS a "back",
      // when it's a no-op, or when the previous route isn't registered here.
      const prev = localStorage.getItem('current-view')
      if (!this._navigatingBack && prev && prev !== path && this.routes[prev]) {
        const prevParamsRaw = localStorage.getItem('current-view-params')
        this._history.push({ path: prev, params: prevParamsRaw ? JSON.parse(prevParamsRaw) : {} })
        if (this._history.length > 50) this._history.shift()
      }
      this._navigatingBack = false

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

  /** Whether there is a previous route to return to. */
  canGoBack() {
    return this._history.length > 0
  },

  /**
   * Navigate to the previous route in history. Skips any stale entries whose
   * route is no longer registered. Returns true if it navigated.
   */
  back() {
    while (this._history.length > 0) {
      const entry = this._history.pop()
      if (this.routes[entry.path]) {
        this._navigatingBack = true
        this.navigate(entry.path, entry.params || {})
        return true
      }
    }
    return false
  },

  /** Clears the navigation history (e.g. on portal boot or logout). */
  resetHistory() {
    this._history = []
    this._navigatingBack = false
  },

  init() {
    const currentView = localStorage.getItem('current-view') || 'programas'
    const paramsRaw = localStorage.getItem('current-view-params')
    const params = paramsRaw ? JSON.parse(paramsRaw) : {}
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
  }
}
