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
    state.maestro = getMaestroLocal()
    state.loading  = true
    notify()

    const maestro  = await detectarRolMaestro()
    state.maestro  = maestro
    state.loading  = false
    notify()

    return maestro
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
