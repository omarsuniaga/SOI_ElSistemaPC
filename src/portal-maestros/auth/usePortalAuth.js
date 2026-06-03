import { detectarRolMaestro, getMaestroLocal, logoutPortal, PENDING_APPROVAL_SENTINEL } from './maestroAuth.js'
import { supabase } from '../../lib/supabaseClient.js'

const state = {
  maestro: null,
  loading: true,
  pendingApproval: false,   // true cuando la cuenta existe pero está en espera de aprobación
  listeners: [],
}

let _authListener = null
let _isInitializing = false

function notify() {
  state.listeners.forEach((fn) => fn({ ...state }))
}

export const usePortalAuth = {
  /** Suscribirse a cambios de estado. Devuelve función de cleanup. */
  subscribe(fn) {
    state.listeners.push(fn)
    return () => {
      state.listeners = state.listeners.filter((l) => l !== fn)
    }
  },

  /** Inicializa la sesión al cargar la app. */
  async init() {
    // Previene race condition: el listener de onAuthStateChange puede disparar SIGNED_IN
    // sincrónicamente durante el registro. Esta flag evita detectarRolMaestro duplicado.
    _isInitializing = true
    try {
      console.log('[usePortalAuth.init] Iniciando...')
      state.maestro = getMaestroLocal()
      console.log('[usePortalAuth.init] Maestro local:', state.maestro ? 'found' : 'not found')
      state.loading = true
      notify()

      const isTestEnv =
        typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
      if (isTestEnv) {
        state.loading = false
        notify()
        console.log('[usePortalAuth.init] Completado (Test Env)')
        return state.maestro
      }

      // Registrar observador de autenticación en tiempo real de Supabase
      if (!_authListener) {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log(`[usePortalAuth] Evento de auth disparado: ${event}`)

          // Durante init(), el SIGNED_IN inicial lo maneja init() mismo.
          // Saltamos para evitar llamadas duplicadas a detectarRolMaestro().
          if (_isInitializing && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            console.log(
              '[usePortalAuth] Ignorando SIGNED_IN durante inicialización (lo maneja init())',
            )
            return
          }

          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            localStorage.removeItem('portal-maestros:maestro')
            state.maestro = null
            notify()
            const publicRoutes = ['login', 'register', 'pending-approval']
            const currentPath = (window.router?.currentRoute?.() || 'login').split('?')[0]
            if (!publicRoutes.includes(currentPath)) {
              console.log(
                '[usePortalAuth] Sesión inactiva o expirada en ruta privada. Recargando aplicación...',
              )
              window.location.reload()
            }
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              const cached = getMaestroLocal()
              if (!cached || cached.user_id !== session.user.id) {
                console.log(
                  '[usePortalAuth] Nueva sesión detectada. Sincronizando datos de maestro...',
                )
                try {
                  const maestro = await detectarRolMaestro()
                  if (maestro) {
                    state.maestro = maestro
                    notify()
                  }
                } catch (err) {
                  console.warn(
                    '[usePortalAuth] Error sincronizando maestro post-login:',
                    err.message,
                  )
                }
              }
            }
          }
        })
        _authListener = subscription
      }

      try {
        // Timeout protection: detectarRolMaestro puede colgar en desarrollo
        console.log('[usePortalAuth.init] Iniciando detectarRolMaestro() con timeout de 8s...')
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout after 8s')), 8000),
        )
        const result = await Promise.race([detectarRolMaestro(), timeoutPromise])
        console.log(
          '[usePortalAuth.init] detectarRolMaestro completado:',
          result ? (result.__pendingApproval ? 'pendiente de aprobación' : 'con datos') : 'sin datos',
        )

        // Detectar sentinel de cuenta pendiente
        if (result === PENDING_APPROVAL_SENTINEL || result?.__pendingApproval) {
          state.maestro = null
          state.pendingApproval = true
        } else {
          state.maestro = result
          state.pendingApproval = false
        }
      } catch (err) {
        console.warn('[usePortalAuth.init] Error:', err.message)
        state.maestro = null
        state.pendingApproval = false
      }

      state.loading = false
      notify()
      console.log('[usePortalAuth.init] Completado')

      return state.maestro
    } finally {
      _isInitializing = false
    }
  },

  /** Establece el maestro activo tras login exitoso. */
  setMaestro(maestro) {
    state.maestro = maestro
    state.loading = false
    notify()
  },

  async logout() {
    await logoutPortal()
    state.maestro = null
    notify()
  },

  getMaestro: () => state.maestro,
  isAuthenticated: () => !!state.maestro,
  isLoading: () => state.loading,
  isPendingApproval: () => state.pendingApproval,
}

export const logoutMaestro = usePortalAuth.logout
