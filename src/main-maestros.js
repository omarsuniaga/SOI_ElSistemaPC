// ============================================
// EARLY ERROR SUPPRESSION (Must be first!)
// ============================================
import './early-error-suppression.js'

// Desactivar gestos de recarga pull-to-refresh (Look and Feel nativo)
import { disablePullToRefresh } from './shared/utils/pullToRefreshBlocker.js'
disablePullToRefresh()

// ============================================
// PWA: Registrar Service Worker + Update Detection
// ============================================
let _swRegistration = null
let _swUpdateToast = null

function _showUpdateToast() {
  if (_swUpdateToast) return
  _swUpdateToast = true

  // Inject base toast styles if not yet present
  if (!document.getElementById('app-toast-styles')) {
    const s = document.createElement('style')
    s.id = 'app-toast-styles'
    s.textContent = `
      #app-toast-container {
        position: fixed; bottom: 1.25rem; right: 1.25rem;
        z-index: 11020; display: flex; flex-direction: column;
        gap: 0.5rem; pointer-events: none;
      }
      .app-toast {
        pointer-events: all; display: flex; align-items: flex-start;
        gap: 0.65rem; min-width: 280px; max-width: 360px;
        padding: 0.85rem 1rem; border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(24,24,32,0.97);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3); color: #fff;
        font-size: 0.875rem; line-height: 1.4;
        opacity: 0; transform: translateY(12px) scale(0.97);
        transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
      }
      .app-toast--visible { opacity: 1; transform: translateY(0) scale(1); }
      .app-toast__icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
      .app-toast__body { flex: 1; min-width: 0; }
      .app-toast__title { font-weight: 700; font-size: 0.78rem; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 2px; opacity: 0.75; }
      .app-toast__msg { font-size: 0.875rem; color: rgba(255,255,255,0.9); }
      .app-toast--info .app-toast__icon { color: #60a5fa; }
      .app-toast--info { border-color: rgba(96,165,250,0.2); }
      @media (max-width: 400px) {
        #app-toast-container { right: 0.75rem; left: 0.75rem; }
        .app-toast { min-width: unset; max-width: 100%; }
      }
    `
    document.head.appendChild(s)
  }

  // Ensure toast container exists
  let container = document.getElementById('app-toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'app-toast-container'
    document.body.appendChild(container)
  }

  const toastEl = document.createElement('div')
  toastEl.className = 'app-toast app-toast--info'
  toastEl.setAttribute('role', 'alert')
  toastEl.innerHTML = `
    <i class="bi bi-arrow-clockwise app-toast__icon" aria-hidden="true"></i>
    <div class="app-toast__body">
      <div class="app-toast__title">ACTUALIZACIÓN</div>
      <div class="app-toast__msg">Nueva versión disponible</div>
    </div>
    <button class="app-toast__close" id="pm-update-btn" style="background:var(--pm-primary,#007aff);color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;">Actualizar</button>
  `
  container.appendChild(toastEl)
  requestAnimationFrame(() => requestAnimationFrame(() => toastEl.classList.add('app-toast--visible')))

  toastEl.querySelector('#pm-update-btn')?.addEventListener('click', () => {
    if (_swRegistration?.waiting) {
      _swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    toastEl.remove()
  })

  // Re-load when the new SW takes control
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const registerSW = async () => {
    try {
      _swRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('[PWA] Service Worker registered:', _swRegistration.scope)

      // Check if a new SW is already waiting
      if (_swRegistration.waiting) _showUpdateToast()

      // Listen for new SW installations
      _swRegistration.addEventListener('updatefound', () => {
        const newSW = _swRegistration.installing
        if (!newSW) return
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            _showUpdateToast()
          }
        })
      })
    } catch (error) {
      console.log('[PWA] Service Worker registration failed:', error)
    }
  }
  document.readyState === 'complete' ? registerSW() : window.addEventListener('load', registerSW)
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch((err) => console.log('[PWA] Service Worker cleanup failed:', err))
}

// PWA: Banner de instalación automática
import './portal-maestros/components/pwaInstaller.js'
import './portal-maestros/styles/index.css'

// ============================================
// SERVICIOS DE INFRAESTRUCTURA
// ============================================
import { initErrorReporter, reportError } from './services/errorReporter.js'
import { initAnalytics } from './services/analyticsService.js'
import { initRateLimit } from './middleware/rateLimit.js'
import { initCSRF } from './middleware/csrfProtection.js'
import { initWebVitals } from './services/webVitals.js'

initCSRF()
initRateLimit({ windowMs: 60000, max: 100 })
initAnalytics({ enabled: false, consent: false })
initWebVitals({ debug: false })
initErrorReporter({
  dsn: import.meta.env.VITE_SENTRY_DSN || null,
  environment: import.meta.env.MODE || 'development',
})

// Bootstrap CSS — requerido por vistas admin
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// ============================================
// MÓDULOS DEL PORTAL
// ============================================
import { usePortalAuth, logoutMaestro } from './portal-maestros/auth/usePortalAuth.js'
import { createPortalRouter } from './portal-maestros/router/portalRouter.js'
import { processQueue, getQueue } from './portal-maestros/services/offlineQueue.js'
import { supabase } from './lib/supabaseClient.js'
import {
  prefetchMonthData,
  getMisClases,
  getHorariosClases,
  getSesiones,
} from './portal-maestros/services/maestroDataService.js'
import { scheduleLocalAlerts, cleanupPushService } from './portal-maestros/services/pushService.js'
import { getPermisos } from './portal-maestros/services/permisoService.js'
import { setNavigationCallbacks } from './portal-maestros/services/navigationHooks.js'
import { AppToast } from './shared/components/AppToast.js'

// Shell, rutas y eventos — módulos extraídos
import { renderShell, setActiveTab, hideShell } from './portal-maestros/shell/portalShell.js'
import {
  setupRouterRoutes,
  initViewContainers,
  renderViewContent,
  CACHEABLE_VIEWS,
} from './portal-maestros/shell/portalRoutes.js'
import { setupGlobalAppEvents } from './portal-maestros/shell/portalEvents.js'

// Módulo de Rutas Académicas
import './modules/academic-routes/styles/academic-routes.css'

// Toast system — sin dependencia de Bootstrap JS
window.addEventListener('showToast', (e) => {
  const { message, type = 'info' } = e.detail || {}
  if (message) AppToast.show(message, type)
})

// ============================================
// ESTADO GLOBAL DEL PORTAL
// ============================================
let _maestro = null
let _permisos = null
const _isAdmin = false

const router = createPortalRouter()
window.router = router

const _viewContainers = {}
let _activeViewCleanup = null
const _viewRendered = new Set()

// ============================================
// TAB DEFINITIONS — solo vistas de maestro
// ============================================
function buildTabs(permisos) {
  const tabs = [
    { id: 'fechas', label: 'Fechas', icon: 'bi-calendar3' },
    { id: 'hoy', label: 'Hoy', icon: 'bi-house-door' },
    { id: 'planificacion', label: 'Plan', icon: 'bi-signpost-split' },
    { id: 'metricas', label: 'Métricas', icon: 'bi-bar-chart-line' },
  ]
  if (permisos?.puede_inscribir_clases) {
    tabs.push({ id: 'gestionar-clases', label: 'Clases', icon: 'bi-mortarboard' })
  }
  return tabs
}

// ============================================
// SYNC
// ============================================
async function _syncWithSupabase(item) {
  const { tabla, operacion, payload: rawPayload } = item
  const payload = { ...rawPayload }

  if (tabla === 'sesiones_clase') {
    if (payload.contenido_dsl !== undefined) {
      payload.contenido = payload.contenido_dsl
      delete payload.contenido_dsl
    }
    if (payload.asistencias !== undefined && payload.asistencia === undefined) {
      payload.asistencia = payload.asistencias
      delete payload.asistencias
    }
  }

  console.log(`[SYNC] Intentando ${operacion} en ${tabla}:`, payload)

  try {
    if (operacion === 'insert') {
      const { error } = await supabase.from(tabla).insert([payload])
      if (error) throw error
    } else if (operacion === 'update') {
      const { id, ...cleanPayload } = payload
      const { error } = await supabase.from(tabla).update(cleanPayload).eq('id', id)
      if (error) throw error
    } else if (operacion === 'delete') {
      const { error } = await supabase.from(tabla).delete().eq('id', payload.id)
      if (error) throw error
    }
  } catch (err) {
    if (err.code === 'PGRST204') {
      const { data: testData } = await supabase.from(tabla).select().limit(1)
      if (testData?.length > 0) {
        console.warn('[SYNC] Columnas REALES encontradas:', Object.keys(testData[0]))
      } else {
        console.warn('[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?')
      }
    }
    console.error('[SYNC] Error crítico:', err)
    throw err
  }
}

let _syncTimeout = null

async function updateAppBadge() {
  if (!navigator.setAppBadge) return
  try {
    const queue = await getQueue()
    const count = queue.length
    if (count > 0) {
      await navigator.setAppBadge(count)
    } else {
      await navigator.clearAppBadge()
    }
  } catch {
    // Badging API not supported or denied
  }
}

async function _updateSyncIndicator() {
  const indicator = document.getElementById('pm-sync-indicator')
  if (!indicator) return
  try {
    const queue = await getQueue()
    if (queue.length === 0) {
      indicator.className = 'pm-online-dot synced'
      indicator.title = 'Sincronizado'
    } else {
      indicator.className = 'pm-online-dot pending'
      indicator.title = `Pendiente (${queue.length})`
    }
  } catch {
    indicator.className = 'pm-online-dot error'
    indicator.title = 'Error de sincronización'
  }
  await updateAppBadge()
}

async function _triggerSync() {
  clearTimeout(_syncTimeout)
  _syncTimeout = setTimeout(async () => {
    if (!navigator.onLine) return
    try {
      await processQueue(_syncWithSupabase)
    } finally {
      await _updateSyncIndicator()
    }
  }, 1000)
}

window.addEventListener('online', _triggerSync)
window.addEventListener('offline', _updateSyncIndicator)

// ============================================
// VISTAS — render + cache
// ============================================
export function invalidateAllViews() {
  _viewRendered.clear()
}
export function invalidateView(name) {
  _viewRendered.delete(name)
}

async function _renderView(route, params = {}, { silent = false } = {}) {
  const queryStr = window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '')
  const urlParams = new URLSearchParams(queryStr)
  const baseRoute = route.split('?')[0]

  if (!silent) {
    // Cerrar buscador al navegar
    const headerEl = document.getElementById('pm-header')
    if (headerEl?.classList.contains('search-active')) {
      headerEl.classList.remove('search-active')
      const input = document.getElementById('pm-header-search-input')
      if (input) input.value = ''
    }
    setActiveTab(baseRoute)
    window.pwaInstaller?.evaluateInsights()
  }

  const targetContainer = _viewContainers[baseRoute]
  if (!targetContainer) {
    console.warn(`[Router] Contenedor no encontrado: ${baseRoute}`)
    return
  }

  if (!silent) {
    if (typeof _activeViewCleanup === 'function') {
      _activeViewCleanup()
      _activeViewCleanup = null
    }
    Object.values(_viewContainers).forEach((el) => {
      el.style.display = 'none'
      el.classList.remove('active')
    })
    targetContainer.style.display = 'block'
    targetContainer.offsetHeight // force reflow
    targetContainer.classList.add('active')
  }

  if (_viewRendered.has(baseRoute)) return

  const spinnerTimeout = setTimeout(() => {
    targetContainer.querySelectorAll('.pm-loading-overlay').forEach((el) => el.remove())
    const spinner = document.createElement('div')
    spinner.className = 'pm-loading pm-loading-overlay'
    spinner.innerHTML = '<div class="pm-spinner"></div>'
    targetContainer.prepend(spinner)
  }, 300)

  try {
    const cleanup = await renderViewContent(baseRoute, targetContainer, params, urlParams, {
      maestroId: _maestro?.id,
      permisos: _permisos,
      router,
      showLoginScreen: _showLoginScreen,
      cleanupPushService,
      stopRealtime: () => {},
      logoutMaestro,
      onLoginSuccess: () => initPortal(),
    })

    if (cleanup) _activeViewCleanup = cleanup

    clearTimeout(spinnerTimeout)
    targetContainer.querySelector('.pm-loading-overlay')?.remove()

    if (CACHEABLE_VIEWS.has(baseRoute)) {
      _viewRendered.add(baseRoute)
    }
  } catch (err) {
    clearTimeout(spinnerTimeout)
    targetContainer.innerHTML = `<p class="pm-error">Error cargando vista: ${err.message}</p>`
  }
}

// ============================================
// SHELL SETUP
// ============================================
function _buildShell(app, maestro, permisos) {
  _maestro = maestro
  _permisos = permisos || _permisos

  renderShell(
    app,
    maestro,
    buildTabs(_permisos),
    (route, params) => router.navigate(route, params),
    _updateSyncIndicator,
  )

  // Sync indicator click → retry sync
  document.getElementById('pm-sync-indicator')?.addEventListener('click', async (e) => {
    if (e.target.classList.contains('error')) await _triggerSync()
  })

  const route = (router.currentRoute?.() || 'hoy').split('?')[0]
  setActiveTab(route)
}

function _showLoginScreen() {
  const app = document.getElementById('portal-app')
  if (!app) return

  const publicRoutes = ['login', 'register', 'pending-approval']
  const current = (router.currentRoute?.() || 'login').split('?')[0]

  if (publicRoutes.includes(current) && current !== 'login') {
    if (!document.getElementById('pm-view-container')) {
      app.innerHTML = '<main class="pm-view" id="pm-view-container"></main>'
    }
    Object.assign(_viewContainers, initViewContainers())
    _setupRouter()
    router.setAuthGuard(() => usePortalAuth.isAuthenticated(), publicRoutes)
    router.start()
    return
  }

  const loginContainer = _viewContainers['login']
  if (loginContainer) {
    hideShell()
    loginContainer.style.display = 'block'
    loginContainer.innerHTML = ''
    renderViewContent('login', loginContainer, {}, new URLSearchParams(), {
      router,
      onLoginSuccess: (intended) => {
        if (intended && intended !== 'login') {
          router.navigate(intended)
        } else {
          initPortal()
        }
      },
    })
    return
  }

  app.innerHTML = '<main class="pm-view" id="pm-view-container"></main>'
  Object.assign(_viewContainers, initViewContainers())
  _setupRouter()
  router.setAuthGuard(() => usePortalAuth.isAuthenticated(), publicRoutes)
  history.replaceState({ route: 'login' }, '', '/login')
  _renderView('login')
}

function _setupRouter() {
  setupRouterRoutes(router, _isAdmin, _renderView)
}

// ============================================
// ALERTAS DEL DÍA
// ============================================
async function _scheduleSwAlerts() {
  if (!_maestro) return
  try {
    const hoy = new Date()
    const diaHoy = hoy.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

    const clases = await getMisClases()
    const [horarios, sesiones] = await Promise.all([
      getHorariosClases(clases.map((x) => x.id)),
      getSesiones(_maestro.id, fechaHoy, fechaHoy),
    ])

    const clasesMap = Object.fromEntries(clases.map((c) => [c.id, c]))
    const horariosHoy = horarios
      .filter((h) => h.dia?.toLowerCase() === diaHoy)
      .map((h) => ({ ...h, clase_nombre: clasesMap[h.clase_id]?.nombre || 'Clase' }))

    const sesionesRegistradas = sesiones
      .filter((s) => s.borrador === false || s.estado === 'registrada')
      .map((s) => s.clase_id)

    await scheduleLocalAlerts(horariosHoy, sesionesRegistradas)
  } catch (err) {
    console.warn('[Alerts] Error programando alertas:', err.message)
  }
}

// ============================================
// SPLASH SCREEN — PROGRESSIVE DISCLOSURE
// ============================================
const _SPLASH_PHASES = {
  auth:      { bar: 25 },
  profile:   { bar: 50, txt: 'Cargando tu perfil...' },
  preparing: { bar: 75, txt: 'Preparando tu espacio de trabajo...' },
  ready:     { bar: 100, txt: '¡Listo!' },
}

function _removeSplash() {
  const splash = document.getElementById('pm-loading-splash')
  if (!splash) return
  splash.style.transition = 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)'
  splash.style.opacity = '0'
  splash.style.transform = 'scale(0.97)'
  splash.style.pointerEvents = 'none'
  setTimeout(() => splash.remove(), 400)
}

function _updateSplashState(phase, maestro) {
  const splash = document.getElementById('pm-loading-splash')
  if (!splash) return

  if (phase === 'remove') { _removeSplash(); return }

  const step = _SPLASH_PHASES[phase]
  if (!step) return

  const statusEl = document.getElementById('pm-loading-status')
  const greetingEl = document.getElementById('pm-loading-greeting')
  const barEl = document.getElementById('pm-loading-progress-bar')
  const spinnerEl = document.getElementById('pm-loading-spinner')

  switch (phase) {
    case 'auth':
      if (greetingEl) greetingEl.textContent = `Hola, ${maestro?.nombre_completo || 'Maestro'}!`
      if (statusEl) statusEl.textContent = 'Conectando...'
      break
    case 'profile':
      if (statusEl && step.txt) statusEl.textContent = step.txt
      break
    case 'preparing':
      if (statusEl && step.txt) statusEl.textContent = step.txt
      if (spinnerEl) spinnerEl.style.opacity = '0.5'
      break
    case 'ready':
      if (statusEl && step.txt) statusEl.textContent = step.txt
      if (spinnerEl) spinnerEl.remove()
      break
  }

  if (barEl) {
    barEl.style.transition = 'width 0.6s cubic-bezier(0.22,1,0.36,1)'
    barEl.style.width = step.bar + '%'
  }

  if (phase === 'ready') {
    setTimeout(() => _removeSplash(), 400)
  }
}

// ============================================
// BOOTSTRAP PRINCIPAL
// ============================================
async function initPortal() {
  const app = document.getElementById('portal-app')
  if (!app) return

  console.log('[Init] Iniciando Portal...')

  // 1. Auth
  const maestro = await usePortalAuth.init()
  console.log('[Init] Auth:', maestro ? 'con maestro' : 'sin maestro')

  if (maestro) _updateSplashState('auth', maestro)

  // Cuenta registrada pero pendiente de aprobación por un administrador.
  // Mostrar pantalla de espera sin importar qué ruta intentó abrir el usuario.
  if (usePortalAuth.isPendingApproval()) {
    console.log('[Init] Cuenta pendiente de aprobación — mostrando pantalla de espera')
    if (!document.getElementById('pm-view-container')) {
      app.innerHTML = '<main class="pm-view" id="pm-view-container"></main>'
    }
    Object.assign(_viewContainers, initViewContainers(false))
    _setupRouter()
    history.replaceState({ route: 'pending-approval' }, '', '/pending-approval')
    _renderView('pending-approval')
    _removeSplash()
    return
  }

  const publicRoutes = ['login', 'register', 'pending-approval']
  const currentPath = (window.router || router).currentRoute().split('?')[0]
  const isPublicRoute = publicRoutes.includes(currentPath)

  if (!maestro && !isPublicRoute) {
    _showLoginScreen()
    _removeSplash()
    return
  }

  if (!maestro && isPublicRoute) {
    if (!document.getElementById('pm-view-container')) {
      app.innerHTML = '<main class="pm-view" id="pm-view-container"></main>'
    }
    Object.assign(_viewContainers, initViewContainers())
    _setupRouter()
    router.setAuthGuard(() => usePortalAuth.isAuthenticated(), publicRoutes)
    router.start()
    _removeSplash()
    return
  }

  // Admin puro (sin rol de maestro) → redirigir al panel admin
  if (maestro.es_admin && !maestro.es_maestro) {
    console.log('[Init] Admin puro detectado → redirigiendo a /admin')
    _removeSplash()
    window.location.href = '/admin'
    return
  }

  // 2. Permisos del maestro
  _updateSplashState('profile', maestro)
  let permisos = null
  try {
    permisos = await getPermisos(maestro.id)
  } catch (err) {
    console.warn('[Init] Error fetching permissions:', err.message)
  }

  // 3. Shell
  _buildShell(app, maestro, permisos)
  _updateSplashState('preparing')

  // 4. Contenedores de vista
  Object.assign(_viewContainers, initViewContainers())

  // 5. Eventos globales (una sola vez)
  setupGlobalAppEvents({
    isAdmin: false,
    getMaestro: () => _maestro,
    getPermisosCached: () => _permisos,
    onPermisosUpdate: async (nuevosPermisos, { ganados, perdidos }) => {
      const currentRoute = (router.currentRoute?.() || 'perfil').split('?')[0]
      const routeNowForbidden =
        currentRoute === 'gestionar-clases' && !nuevosPermisos.puede_inscribir_clases
      const safeRoute = routeNowForbidden
        ? 'hoy'
        : currentRoute === 'pending-approval' && ganados.length > 0
          ? 'hoy'
          : currentRoute

      _buildShell(app, _maestro, nuevosPermisos)
      Object.assign(_viewContainers, initViewContainers())
      _setupRouter()
      router.setAuthGuard(() => usePortalAuth.isAuthenticated(), publicRoutes)
      _viewRendered.clear()
      await _renderView(safeRoute)
      router.navigate(safeRoute)
    },
    onNavigate: (route) => router.navigate(route),
    onResize: () => {
      const route = (router.currentRoute?.() || 'hoy').split('?')[0]
      setActiveTab(route)
      _updateSyncIndicator()
    },
  })

  // 6. Callbacks de navegación
  setNavigationCallbacks(invalidateView, invalidateAllViews)

  // 7. Router
  _setupRouter()
  router.setAuthGuard(() => usePortalAuth.isAuthenticated(), publicRoutes)
  router.start()

  // App is interactive — smooth reveal of shell
  _updateSplashState('ready')

  // Después del login siempre aterrizar en 'hoy'.
  // Si el hash sigue en #/login (o está vacío), navegar a 'hoy'.
  const startRoute = (router.currentRoute?.() || '').split('?')[0]
  if (!startRoute || startRoute === 'login' || startRoute === 'logout') {
    router.navigate('hoy')
  }

  // 8. Prefetch + precargar vistas
  prefetchMonthData()
    .then(async () => {
      const PRELOAD_VIEWS = ['hoy', 'fechas', 'calendario', 'metricas']
      const current = (router.currentRoute?.() || 'hoy').split('?')[0]
      const pending = PRELOAD_VIEWS.filter((v) => v !== current && !_viewRendered.has(v))

      await Promise.all(pending.map((viewName) => {
        const container = _viewContainers[viewName]
        if (container) return _renderView(viewName, {}, { silent: true })
      }))

      _scheduleSwAlerts()
      window.pwaInstaller?.evaluateInsights()
    })
    .catch((err) => console.warn('[Prefetch] Error:', err.message))

  // 9. Sync inicial
  _triggerSync()
}

// ============================================
// GLOBAL ERROR HANDLERS
// ============================================
const _errorTemplate = (icon, title, subtitle, detail) => `
  <div style="padding:40px;color:#fff;font-family:'Outfit',sans-serif;background:radial-gradient(circle at top right,#1e293b,#0f172a);z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;max-width:600px;width:90%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="width:80px;height:80px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 24px;"><i class="bi ${icon}"></i></div>
      <h2 style="margin-bottom:16px;font-weight:700;">${title}</h2>
      <p style="color:rgba(255,255,255,0.6);margin-bottom:24px;">${subtitle}</p>
      <div style="background:rgba(0,0,0,0.3);padding:16px;border-radius:12px;text-align:left;font-family:monospace;font-size:13px;margin-bottom:24px;overflow:auto;max-height:200px;border-left:4px solid #ef4444;">${detail}</div>
      <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:600;cursor:pointer;">Recargar Aplicación</button>
    </div>
  </div>`

window.addEventListener('error', (e) => {
  const ignoredPatterns = ['useCache', 'WebSocket', 'content.js']
  if (ignoredPatterns.some((p) => (e.message || '').includes(p))) {
    console.warn('[Ignored Error]', e.message)
    return
  }
  reportError(new Error(e.message), {
    context: 'window.error',
    filename: e.filename,
    lineno: e.lineno,
  })
  const app = document.getElementById('portal-app')
  if (app)
    app.innerHTML = _errorTemplate(
      'bi-x-circle-fill',
      'Ups! Algo salió mal',
      'Se ha producido un error inesperado en la aplicación.',
      `<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">${e.message}</div><div style="color:rgba(255,255,255,0.4);">${e.filename?.split('/').pop()}:${e.lineno}</div>`,
    )
})

window.addEventListener('unhandledrejection', (e) => {
  reportError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), {
    context: 'unhandledRejection',
  })
  const app = document.getElementById('portal-app')
  if (app)
    app.innerHTML = _errorTemplate(
      'bi-exclamation-triangle-fill',
      'Error de Sincronización',
      'Hubo un problema al procesar una solicitud de red.',
      `<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">Promise Rejection</div><div style="color:rgba(255,255,255,0.4);">${String(e.reason)}</div>`,
    )
})

initPortal().catch((err) => {
  const app = document.getElementById('portal-app')
  if (app)
    app.innerHTML = `<div style="padding:20px;color:red;font-family:monospace;background:#fff;z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"><h2>❌ initPortal() falló</h2><pre>${err?.message || err}\n${err?.stack || ''}</pre></div>`
})
