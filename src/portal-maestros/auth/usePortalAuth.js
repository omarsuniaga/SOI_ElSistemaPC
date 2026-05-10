import { detectarRolMaestro, getMaestroLocal, logoutPortal } from './maestroAuth.js'

const state = {
  maestro:   null,
  loading:   true,
  listeners: [],
}

function notify() {
  state.listeners.forEach(fn => fn({ ...state }))
}

export const usePortalAuth = {
  /** Suscribirse a cambios de estado. Devuelve función de cleanup. */
  subscribe(fn) {
    state.listeners.push(fn)
    return () => { state.listeners = state.listeners.filter(l => l !== fn) }
  },

  /** Inicializa la sesión al cargar la app. */
  async init() {
    console.log('[usePortalAuth.init] Iniciando...')
    state.maestro = getMaestroLocal()
    console.log('[usePortalAuth.init] Maestro local:', state.maestro ? 'found' : 'not found')
    state.loading  = true
    notify()

    try {
      // Timeout protection: detectarRolMaestro puede colgar en desarrollo
      console.log('[usePortalAuth.init] Iniciando detectarRolMaestro() con timeout de 8s...')
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout after 8s')), 8000)
      )
      const maestro = await Promise.race([
        detectarRolMaestro(),
        timeoutPromise
      ])
      console.log('[usePortalAuth.init] detectarRolMaestro completado:', maestro ? 'con datos' : 'sin datos')
      state.maestro = maestro
    } catch (err) {
      console.warn('[usePortalAuth.init] Error:', err.message)
      state.maestro = null
    }

    state.loading = false
    notify()
    console.log('[usePortalAuth.init] Completado')

    return state.maestro
  },

  /** Establece el maestro activo tras login exitoso. */
  setMaestro(maestro) {
    state.maestro = maestro
    state.loading  = false
    notify()
  },

  async logout() {
    await logoutPortal()
    state.maestro = null
    notify()
  },

  getMaestro:      () => state.maestro,
  isAuthenticated: () => !!state.maestro,
  isLoading:       () => state.loading,
}

export const logoutMaestro = usePortalAuth.logout
