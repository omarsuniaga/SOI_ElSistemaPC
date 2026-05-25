// ============================================
// EARLY ERROR SUPPRESSION (Must be first!)
// ============================================
import './early-error-suppression.js'

// Desactivar gestos de recarga pull-to-refresh (Look and Feel nativo)
import { disablePullToRefresh } from './shared/utils/pullToRefreshBlocker.js'
disablePullToRefresh()

// ============================================
// PWA: Registrar Service Worker
// ============================================
if ('serviceWorker' in navigator) {
  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA] Service Worker registered:', registration.scope);
    } catch (error) {
      console.log('[PWA] Service Worker registration failed:', error);
    }
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

// PWA: Banner de instalación automática
import './portal-maestros/components/pwaInstaller.js'

import './portal-maestros/styles/index.css'

// ============================================
// NUEVOS SERVICIOS - Portal Professionalization
// ============================================

// Error Reporter - Sentry integration
import { initErrorReporter, reportError } from './services/errorReporter.js'

// Analytics - tracking (GDPR compliant)
import { initAnalytics } from './services/analyticsService.js'

// GDPR Service — imported but not yet wired

// Rate Limiter
import { initRateLimit } from './middleware/rateLimit.js'

// CSRF Protection
import { initCSRF } from './middleware/csrfProtection.js'

// Web Vitals
import { initWebVitals } from './services/webVitals.js'

// Inicializar servicios
console.log('[SOI] Initializing professionalization services...')

// CSRF
initCSRF()

// Rate Limit (100 req/min)
initRateLimit({ windowMs: 60000, max: 100 })

// Analytics (disabled by default, consent required)
initAnalytics({ enabled: false, consent: false })

// Web Vitals
initWebVitals({ debug: false })

// Sentry (requires VITE_SENTRY_DSN env var)
initErrorReporter({
  dsn: import.meta.env.VITE_SENTRY_DSN || null,
  environment: import.meta.env.MODE || 'development',
})

// ============================================
// FIN NUEVOS SERVICIOS
// ============================================

import { usePortalAuth, logoutMaestro } from './portal-maestros/auth/usePortalAuth.js'
import { createPortalRouter } from './portal-maestros/router/portalRouter.js'
import { processQueue, getQueue } from './portal-maestros/services/offlineQueue.js'
import { supabase } from './lib/supabaseClient.js'
import { prefetchMonthData, getMisClases, getHorariosClases, getSesiones } from './portal-maestros/services/maestroDataService.js'
import { scheduleLocalAlerts } from './portal-maestros/services/pushService.js'


// Icons only -- NO Bootstrap CSS/JS in portal
import 'bootstrap-icons/font/bootstrap-icons.css'

// Toast system -- sin dependencia de Bootstrap JS
import { AppToast } from './shared/components/AppToast.js'
window.addEventListener('showToast', (e) => {
  const { message, type = 'info' } = e.detail || {};
  if (message) AppToast.show(message, type);
});


import { renderLoginView } from './portal-maestros/views/loginView.js'
import { renderRegisterView } from './portal-maestros/views/registerView.js'
import { renderPendingApprovalView } from './portal-maestros/views/pendingApprovalView.js'
import { renderHoyView } from './portal-maestros/views/hoyView.js'
import { renderCalendarioView } from './portal-maestros/views/calendarioView.js'
import { renderMetricasView, getAlumnoIndexFromMetricas } from './portal-maestros/views/metricasView.js'
import { renderAsistenciaView } from './portal-maestros/views/asistenciaView.js'
import { renderClaseEmergenteView } from './portal-maestros/views/claseEmergenteView.js'
import { renderPerfilView } from './portal-maestros/views/perfilView.js'
import { renderPlanificacionView } from './portal-maestros/views/planificacionView.js'
import { renderAlumnoPerfilView } from './portal-maestros/views/alumnoPerfilView.js'
import { renderGamificacionView } from './portal-maestros/views/gamificacionView.js'
import { renderRutaGameificadaView } from './portal-maestros/views/rutaGameificadaView.js'
import { renderCrearClaseView } from './portal-maestros/views/crearClaseView.js'
import { renderAcademicPlanBuilderView } from './portal-maestros/views/academicPlanBuilderView.js'
import { renderWeeklyPlanView } from './portal-maestros/views/weeklyPlanView.js'
import { RouteLibraryView } from './portal-maestros/views/routeLibraryView.js'
import { RouteDetailView } from './portal-maestros/views/routeDetailView.js'
import { renderAlumnosView } from './modules/alumnos/views/alumnosView.js'
import { renderProgramasView } from './modules/programas/views/programasView.js'
import { renderMaestrosView } from './modules/maestros/views/maestrosView.js'
import { renderDashboardMetricasView as renderAdminMetricasView } from './modules/metricas/views/dashboardMetricasView.js'
import { renderAcademicAdminView } from './modules/academic-admin/views/academicAdminView.js'
import { renderClasesView } from './modules/clases/views/clasesView.js'
import { renderRegistroAlumnoView } from './portal-maestros/views/registroAlumnoView.js'
import { renderGestionarClasesView } from './portal-maestros/views/gestionarClasesView.js'
import { renderAprobacionView } from './modules/admin-aprobacion/views/aprobacionView.js'
import { renderAusenciasAdminView } from './modules/admin-aprobacion/views/ausenciasAdminView.js'
import { adminAusenciasInsights } from './modules/admin-aprobacion/components/adminAusenciasInsights.js'
import { renderAdminNotificacionesView } from './modules/admin-notificaciones/views/adminNotificacionesView.js'
import { getPermisos } from './portal-maestros/services/permisoService.js'

// Nuevos componentes de UI
import { themeToggle } from './portal-maestros/components/themeToggle.js'
import { notificacionesPanel } from './portal-maestros/components/notificacionesPanel.js'
import { onNotificacionesChange, getUnreadCount, fetchNotificaciones, startRealtime, stopRealtime } from './portal-maestros/services/notificationService.js'

import { pushDiagnostic } from './portal-maestros/components/pushDiagnostic.js'
import { setNavigationCallbacks } from './portal-maestros/services/navigationHooks.js'

// Módulo de Rutas Académicas
import './modules/academic-routes/styles/academic-routes.css'

// IS_ADMIN se determina desde la DB tras autenticar (maestros.es_admin)
// No depende de window.__SOI_MODE__ ni de ningún flag hardcodeado
let IS_ADMIN = false

function buildMaestroTabs(permisos) {
  const tabs = [
    { id: 'calendario', label: 'Calendario', icon: 'bi-calendar3' },
    { id: 'hoy', label: 'Hoy', icon: 'bi-house-door' },
    { id: 'planificacion', label: 'Plan', icon: 'bi-signpost-split' },
    { id: 'metricas', label: 'Métricas', icon: 'bi-bar-chart-line' },
  ]
  // PERM-05: Only show "Registrar Alumno" tab if teacher has permission
  if (permisos?.puede_registrar_alumnos) {
    tabs.push({ id: 'registrar-alumno', label: 'Registrar', icon: 'bi-person-plus' })
  }
  // PERM-06: Only show "Gestionar Clases" tab if teacher has enrollment permission
  if (permisos?.puede_inscribir_clases) {
    tabs.push({ id: 'gestionar-clases', label: 'Clases', icon: 'bi-mortarboard' })
  }
  return tabs
}

const ADMIN_TABS = [
  { id: 'admin-alumnos', label: 'Alumnos', icon: 'bi-people-fill' },
  { id: 'admin-programas', label: 'Programas', icon: 'bi-grid-1x2' },
  { id: 'admin-maestros', label: 'Maestros', icon: 'bi-person-badge' },
  { id: 'admin-notificaciones', label: 'Actividad', icon: 'bi-bell-fill' },
  { id: 'admin-ausencias', label: 'Ausencias', icon: 'bi-calendar-x' },
  { id: 'admin-metricas', label: 'Métricas', icon: 'bi-bar-chart-line' },
]

// Admin con clases (ej: desarrollador) ve ambos grupos de tabs
// Admin sin clases ve solo tabs de admin
// Maestro normal ve solo tabs de maestro
const ALL_TABS = (permisos) => {
  if (!IS_ADMIN) return buildMaestroTabs(permisos)
  return [...ADMIN_TABS, ...buildMaestroTabs(permisos)]
}

let _maestro = null
let _permisos = null
const router = createPortalRouter()
window.router = router // Exponer para las vistas

// ── Sync indicator ─────────────────────────────────────────

async function _syncWithSupabase(item) {
  const { tabla, operacion, payload: rawPayload } = item

  // Limpieza de emergencia para evitar fallos por esquemas viejos en IndexedDB
  const payload = { ...rawPayload }
  if (tabla === 'sesiones_clase') {
    // NOTA: NO borrar 'borrador' ni 'estado' — son campos reales usados por
    // hoyView, calendarioView y metricasView para determinar si la sesión
    // está registrada. Borrarlos causaba que los cards nunca cambiaran a verde.
    if (payload.contenido_dsl !== undefined) {
      payload.contenido = payload.contenido_dsl
      delete payload.contenido_dsl
    }
    // Compatibilidad: si viene 'asistencias' de datos viejos, convertir a 'asistencia'
    if (payload.asistencias !== undefined && payload.asistencia === undefined) {
      payload.asistencia = payload.asistencias
      delete payload.asistencias
    }
  }

  console.log(`[SYNC] Intentando ${operacion} en ${tabla}:`, payload)

  try {
    if (operacion === 'insert') {
      const { error } = await supabase.from(tabla).insert([payload])
      if (error) {
        console.error(`[SYNC] Error en INSERT ${tabla}:`, error)
        throw error
      }
    } else if (operacion === 'update') {
      const { id, ...cleanPayload } = payload
      const { error } = await supabase.from(tabla).update(cleanPayload).eq('id', id)
      if (error) {
        console.error(`[SYNC] Error en UPDATE ${tabla}:`, error)
        throw error
      }
    } else if (operacion === 'delete') {
      const { error } = await supabase.from(tabla).delete().eq('id', payload.id)
      if (error) {
        console.error(`[SYNC] Error en DELETE ${tabla}:`, error)
        throw error
      }
    }
  } catch (err) {
    if (err.code === 'PGRST204') {
      const { data: testData } = await supabase.from(tabla).select().limit(1)
      if (testData && testData.length > 0) {
        console.warn('[SYNC] Columnas REALES encontradas:', Object.keys(testData[0]))
      } else {
        console.warn('[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?')
      }
    }
    console.error(`[SYNC] Error crítico en _syncWithSupabase:`, err)
    throw err
  }
}

let _syncTimeout = null

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

// ── Shell visibility (logout / auth states) ──────────────────

function _hideShell() {
  const app = document.getElementById('portal-app')
  if (!app) return
  const header = app.querySelector('.pm-header')
  const nav = app.querySelector('.pm-bottom-nav')
  const view = app.querySelector('.pm-view')
  if (header) header.style.display = 'none'
  if (nav) nav.style.display = 'none'
  if (view) view.style.display = 'none'
}

function _showShell() {
  const app = document.getElementById('portal-app')
  if (!app) return
  const header = app.querySelector('.pm-header')
  const nav = app.querySelector('.pm-bottom-nav')
  const view = app.querySelector('.pm-view')
  if (header) header.style.display = ''
  if (nav) nav.style.display = ''
  if (view) view.style.display = ''
}

function _showLoginScreen() {
  const app = document.getElementById('portal-app')
  if (!app) return

  // Si estamos en una ruta pública que no sea login (ej: register), dejar que el router la maneje
  const publicRoutes = ['login', 'register', 'pending-approval']
  const current = (router.currentRoute?.() || 'login').split('?')[0]
  
  if (publicRoutes.includes(current) && current !== 'login') {
    console.log('[Auth] Manteniendo ruta pública:', current)
    
    if (!document.getElementById('pm-view-container')) {
      app.innerHTML = '<main class="pm-view" id="pm-view-container"></main>'
    }

    _initViewContainers()
    _setupRouterRoutes()
    router.setAuthGuard(() => usePortalAuth.isAuthenticated(), publicRoutes)
    router.start()
    return
  }

  // Si el shell ya está montado, usar el contenedor de vistas
  const loginContainer = _viewContainers['login']
  if (loginContainer) {
    _hideShell()
    loginContainer.style.display = 'block'
    loginContainer.innerHTML = ''
    renderLoginView(loginContainer, {
      onSuccess: (intended) => {
        if (intended && intended !== 'login') {
          _showShell()
          router.navigate(intended)
        } else {
          initPortal()
        }
      }
    })
    return
  }

  // Sin shell montado (primer load sin sesión): renderizar directo en el app
  app.innerHTML = ''
  renderLoginView(app, {
    onSuccess: () => initPortal()
  })
}

// Factorizar el setup de rutas para reuso
function _setupRouterRoutes() {
  router.on('login', (route, params) => _renderView('login', params))
  router.on('logout', (route, params) => _renderView('logout', params))
  router.on('calendario', (route, params) => _renderView('calendario', params))
  router.on('clases', (route, params) => _renderView('clases', params))
  router.on('hoy', (route, params) => _renderView('hoy', params))
  router.on('asistencia', (route, params) => _renderView('asistencia', params))
  router.on('metricas', (route, params) => _renderView('metricas', params))
  router.on('perfil', (route, params) => _renderView('perfil', params))
  router.on('clase-emergente', (route, params) => _renderView('clase-emergente', params))
  router.on('planificacion', (route, params) => _renderView('planificacion', params))
  router.on('alumno', (route, params) => _renderView('alumno', params))
  router.on('gamificacion', (route, params) => _renderView('gamificacion', params))
  router.on('ruta', (route, params) => _renderView('ruta', params))
  router.on('crear-clase', (route, params) => _renderView('crear-clase', params))
  router.on('ruta-plan-builder', (route, params) => _renderView('ruta-plan-builder', params))
  router.on('ruta-semanal', (route, params) => _renderView('ruta-semanal', params))
  router.on('ruta-libreria', (route, params) => _renderView('ruta-libreria', params))
  router.on('ruta-detalle/:id', (route, params) => _renderView('ruta-detalle', params))
  router.on('registrar-alumno', (route, params) => _renderView('registrar-alumno', params))
  router.on('gestionar-clases', (route, params) => _renderView('gestionar-clases', params))

  router.on('register', (route, params) => _renderView('register', params))
  router.on('pending-approval', (route, params) => _renderView('pending-approval', params))

  // Admin routes (solo visible cuando IS_ADMIN=true)
  if (IS_ADMIN) {
    router.on('admin-alumnos', (route, params) => _renderView('admin-alumnos', params))
    router.on('admin-programas', (route, params) => _renderView('admin-programas', params))
    router.on('admin-maestros', (route, params) => _renderView('admin-maestros', params))
    router.on('admin-metricas', (route, params) => _renderView('admin-metricas', params))
    router.on('admin-config', (route, params) => _renderView('admin-config', params))
    router.on('admin-clases', (route, params) => _renderView('admin-clases', params))
    router.on('admin-sesiones', (route, params) => _renderView('admin-sesiones', params))
    router.on('admin-aprobacion', (route, params) => _renderView('admin-aprobacion', params))
    router.on('admin-ausencias', (route, params) => _renderView('admin-ausencias', params))
    router.on('admin-notificaciones', (route, params) => _renderView('admin-notificaciones', params))
    // Admin default route
    router.onNotFound(() => _renderView('admin-alumnos'))
  } else {
    router.onNotFound(() => _renderView('hoy'))
  }
}

// ── Shell (estructura persistente) ─────────────────────────

// Breakpoint detection utilities
export function getBreakpoint() {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

let _currentBreakpoint = getBreakpoint()
window.addEventListener('resize', () => {
  const next = getBreakpoint()
  if (next !== _currentBreakpoint) {
    _currentBreakpoint = next
    document.body.dataset.pmLayout = next
  }
}, { passive: true })

function _renderShell(app, maestro, permisos) {
  _maestro = maestro
  _permisos = permisos || _permisos
  const bp = _currentBreakpoint

  const tabs = ALL_TABS(_permisos)

  app.innerHTML = `
    <!-- Sidebar (desktop only) -->
    <aside class="pm-sidebar" id="pm-sidebar">
      <div class="pm-sidebar-header">
        <div class="pm-sidebar-logo">
          <i class="bi bi-music-note-beamed"></i>
          <span>SOI</span>
        </div>
      </div>
      <nav class="pm-sidebar-nav">
        ${tabs.map(tab => `
          <a class="pm-sidebar-link" data-route="${tab.id}" title="${tab.label}">
            <i class="bi ${tab.icon}"></i>
            <span>${tab.label}</span>
          </a>
        `).join('')}
      </nav>
      <div class="pm-sidebar-footer">
        <button id="pm-btn-perfil-sidebar" class="pm-sidebar-link" data-route="perfil">
          <i class="bi bi-person-circle"></i>
          <span>Perfil</span>
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="pm-main-area">
      <!-- Header -->
      <header class="pm-header" id="pm-header">
        <div class="pm-header-left" id="pm-header-left">
          <span class="pm-header-greeting">${IS_ADMIN ? 'Panel Admin' : 'Portal Maestros'}</span>
          <span class="pm-header-title" style="font-size:clamp(1rem,3.5vw,1.5rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw;">
            ${IS_ADMIN
        ? (maestro?.nombre_completo ?? 'Administrador')
        : ('Prof. ' + (maestro?.nombre_completo ?? ''))
      }
            <span class="pm-online-dot" id="pm-sync-indicator" title="Sincronizado"></span>
          </span>
        </div>

        <!-- Dynamic WhatsApp-Style Search Container -->
        <div class="pm-header-search-container" id="pm-header-search-container">
          <button id="pm-search-back-btn" class="pm-icon-btn pm-search-back-btn" title="Cerrar búsqueda">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="pm-header-search" id="pm-header-search">
            <i class="bi bi-search"></i>
            <input type="search" placeholder="Buscar alumno..." id="pm-header-search-input" autocomplete="off" />
          </div>
        </div>

        <!-- Header right controls -->
        <div class="pm-header-right" id="pm-header-right">
          <!-- Botón de búsqueda para mobile/tablet (WhatsApp Lupa) -->
          <button id="pm-search-toggle-btn" class="pm-icon-btn pm-search-toggle-btn" title="Buscar alumno">
            <i class="bi bi-search"></i>
          </button>

          <!-- Toggle de tema -->
          <div id="pm-theme-toggle-container"></div>

          <!-- Botón de notificaciones -->
          <button id="pm-bell-btn" class="pm-icon-btn" title="Notificaciones" style="position: relative;">
            <i class="bi bi-bell"></i>
            <span class="pm-ausencias-badge" id="pm-notif-badge" style="display: none; background: var(--pm-danger);">0</span>
          </button>
          
          <button id="pm-btn-perfil" class="pm-avatar-btn" title="Perfil">
            ${maestro?.avatar_url
        ? `<img src="${maestro.avatar_url}" alt="Avatar">`
        : `<i class="bi bi-person-circle"></i>`
      }
          </button>
        </div>

      </header>

      <!-- Contenido de la vista activa -->
      <main class="pm-view" id="pm-view-container"></main>

      <!-- Footer Nav (mobile/tablet only - hidden on desktop) -->
      <nav class="pm-footer-nav" id="pm-footer-nav">
        <div class="pm-footer-nav__inner">
          ${tabs.map(tab => `
            <button class="pm-nav-tab" data-route="${tab.id}" title="${tab.label}">
              <i class="bi ${tab.icon}"></i>
            </button>
          `).join('')}
        </div>
      </nav>
    </div>
  `

  _updateSyncIndicator()

  // Inicializar theme toggle
  const themeContainer = document.getElementById('pm-theme-toggle-container')
  if (themeContainer) {
    themeContainer.appendChild(themeToggle.createToggleButton())
  }

  // Footer nav events - SPA navigation
  const footerNav = document.getElementById('pm-footer-nav')
  if (footerNav) {
    footerNav.querySelectorAll('.pm-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault()
        router.navigate(tab.dataset.route)
      })
    })
  }

  // Sidebar nav events - SPA navigation (desktop + landscape tablet)
  const sidebar = document.getElementById('pm-sidebar')
  if (sidebar) {
    sidebar.querySelectorAll('.pm-sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        router.navigate(link.dataset.route)
      })
    })
  }

  document.getElementById('pm-btn-perfil').addEventListener('click', (e) => {
    e.preventDefault()
    router.navigate('perfil')
  })


  // WhatsApp-style header search
  const headerEl = document.getElementById('pm-header')
  const searchInput = document.getElementById('pm-header-search-input')
  const searchToggleBtn = document.getElementById('pm-search-toggle-btn')
  const searchBackBtn = document.getElementById('pm-search-back-btn')

  const openSearch = () => {
    headerEl?.classList.add('search-active')
    setTimeout(() => {
      searchInput?.focus()
    }, 50)
  }

  const closeSearch = () => {
    headerEl?.classList.remove('search-active')
    if (searchInput) searchInput.value = ''
    document.getElementById('pm-header-search-dropdown')?.remove()
  }

  searchToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    openSearch()
  })

  searchBackBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    closeSearch()
  })

  // Reactive header search — dropdown with results
  let _searchDropdown = null
  let _searchTimer = null

  const removeDropdown = () => {
    _searchDropdown?.remove()
    _searchDropdown = null
  }

  const showDropdown = (items) => {
    removeDropdown()
    if (!items.length) return
    const dd = document.createElement('div')
    dd.id = 'pm-header-search-dropdown'
    dd.setAttribute('role', 'listbox')
    dd.innerHTML = items.map(a => `
      <div class="pm-hsd-item" role="option" tabindex="0" data-id="${a.id}">
        <i class="bi bi-person-fill pm-hsd-icon"></i>
        <div class="pm-hsd-info">
          <span class="pm-hsd-name">${a.nombre_completo}</span>
          ${a.instrumento_principal ? `<span class="pm-hsd-meta">${a.instrumento_principal}</span>` : ''}
        </div>
        <i class="bi bi-chevron-right pm-hsd-arrow"></i>
      </div>`).join('')
    document.body.appendChild(dd)

    // Position below the search bar
    const rect = searchInput.getBoundingClientRect()
    dd.style.cssText = `position:fixed;top:${rect.bottom + 4}px;left:${Math.max(8, rect.left)}px;width:${Math.min(320, window.innerWidth - 16)}px;z-index:9999;background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;`
    _searchDropdown = dd

    dd.querySelectorAll('.pm-hsd-item').forEach(row => {
      const go = () => { closeSearch(); removeDropdown(); router.navigate(`alumno?id=${row.dataset.id}`) }
      row.addEventListener('click', go)
      row.addEventListener('keypress', (e) => { if (e.key === 'Enter') go() })
    })
  }

  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim()
    clearTimeout(_searchTimer)
    if (q.length < 1) { removeDropdown(); return }

    // If metricas data is loaded in memory, filter locally — zero network, zero delay
    const localIndex = getAlumnoIndexFromMetricas()
    if (localIndex) {
      const lower = q.toLowerCase()
      const hits = localIndex
        .filter(a => a.nombre_completo?.toLowerCase().includes(lower))
        .slice(0, 8)
        .map(a => ({ ...a, instrumento_principal: a.clases?.join(', ') || null }))
      showDropdown(hits)
      return
    }

    // Fallback: query Supabase (any other view)
    _searchTimer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('alumnos')
          .select('id, nombre_completo, instrumento_principal')
          .ilike('nombre_completo', `%${q}%`)
          .limit(8)
        showDropdown(data || [])
      } catch { removeDropdown() }
    }, 200)
  })

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); removeDropdown() }
  })

  // Inject dropdown styles once
  if (!document.getElementById('pm-hsd-styles')) {
    const s = document.createElement('style')
    s.id = 'pm-hsd-styles'
    s.textContent = `.pm-hsd-item{display:flex;align-items:center;gap:0.625rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid var(--pm-border);transition:background 0.1s}.pm-hsd-item:last-child{border-bottom:none}.pm-hsd-item:hover,.pm-hsd-item:focus{background:var(--pm-surface-2);outline:none}.pm-hsd-icon{font-size:1rem;color:var(--pm-primary);flex-shrink:0}.pm-hsd-info{flex:1;min-width:0}.pm-hsd-name{display:block;font-size:0.875rem;font-weight:500;color:var(--pm-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-hsd-meta{font-size:0.7rem;color:var(--pm-text-muted)}.pm-hsd-arrow{color:var(--pm-text-muted);font-size:0.75rem}`
    document.head.appendChild(s)
  }

  document.addEventListener('click', (e) => {
    if (!searchInput?.contains(e.target) && !_searchDropdown?.contains(e.target)) {
      removeDropdown()
    }
  })

  // Retry sync on error indicator click
  document.getElementById('pm-sync-indicator').addEventListener('click', async (e) => {
    if (e.target.classList.contains('error')) {
      await _triggerSync()
    }
  })

  // Eventos de notificaciones
  document.getElementById('pm-bell-btn')?.addEventListener('click', () => {
    notificacionesPanel.open()
  })

  // Instalación PWA movida al Perfil (perfilView.js → renderInstallApp)

  const route = (router.currentRoute?.() || 'hoy').split('?')[0]
  _setActiveTab(route)
}

/**
 * Registra listeners globales que solo deben activarse UNA VEZ.
 * (Evita fugas de memoria y errores de duplicación en Realtime)
 */
let _globalEventsInitialized = false
function _setupGlobalAppEvents() {
  if (_globalEventsInitialized) return
  _globalEventsInitialized = true

  // Suscribirse al badge de notificaciones
  onNotificacionesChange(() => {
    const badge = document.getElementById('pm-notif-badge');
    if (!badge) return;
    const count = getUnreadCount();
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });

  // Disparar primera carga y abrir canal Realtime de notificaciones
  fetchNotificaciones();
  startRealtime();

  // PERM-REALTIME: Subscribe to permisos_maestros changes for instant shell updates
  if (!IS_ADMIN) {
    const maestroLocal = _maestro
    if (maestroLocal?.id) {
      const permisosChannel = supabase
        .channel(`permisos-maestro:${maestroLocal.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'permisos_maestros',
            filter: `maestro_id=eq.${maestroLocal.id}`,
          },
          async (payload) => {
            console.log('[Realtime] Permisos actualizados:', payload.new)
            try {
              const nuevosPermisos = await getPermisos(maestroLocal.id)
              const app = document.getElementById('portal-app')
              if (!app) return

              // Detect permission gains and losses
              const ganados = []
              if (nuevosPermisos.puede_registrar_alumnos && !_permisos?.puede_registrar_alumnos) {
                ganados.push('Registrar Alumnos')
              }
              if (nuevosPermisos.puede_inscribir_clases && !_permisos?.puede_inscribir_clases) {
                ganados.push('Gestionar e Inscribir Clases')
              }
              const perdidos = []
              if (_permisos?.puede_registrar_alumnos && !nuevosPermisos.puede_registrar_alumnos) {
                perdidos.push('Registrar Alumnos')
              }
              if (_permisos?.puede_inscribir_clases && !nuevosPermisos.puede_inscribir_clases) {
                perdidos.push('Gestionar e Inscribir Clases')
              }

              // Capture current route BEFORE shell wipes the DOM
              const currentRoute = (router.currentRoute?.() || 'perfil').split('?')[0]

              // If the maestro is currently on a now-forbidden route, redirect to 'hoy'
              const routeNowForbidden =
                (currentRoute === 'registrar-alumno' && !nuevosPermisos.puede_registrar_alumnos) ||
                (currentRoute === 'gestionar-clases' && !nuevosPermisos.puede_inscribir_clases)
              let safeRoute = routeNowForbidden ? 'hoy' : currentRoute

              // If teacher was on pending-approval and just got approved, send them to hoy
              if (currentRoute === 'pending-approval' && ganados.length > 0) {
                safeRoute = 'hoy'
              }

              // Re-render shell with updated permissions (updates nav tabs instantly)
              _renderShell(app, maestroLocal, nuevosPermisos)
              _initViewContainers()
              _setupRouterRoutes()
              router.setAuthGuard(() => usePortalAuth.isAuthenticated(), ['login', 'register', 'pending-approval'])

              // CRITICAL: clear stale render cache so the active view re-renders
              _viewRendered.clear()

              // Navigate to safe route (may differ from current if permission revoked)
              await _renderView(safeRoute)
              router.navigate(safeRoute)

              if (ganados.length > 0) {
                AppToast.success(`¡Nuevos permisos activados: ${ganados.join(', ')}! Ahora podés acceder desde el Perfil o la barra de navegación.`)
              } else if (perdidos.length > 0) {
                AppToast.show(`El administrador removió tu acceso a: ${perdidos.join(', ')}.`, 'warning')
              } else {
                AppToast.show('Tus permisos fueron actualizados por el administrador.', 'info')
              }
            } catch (err) {
              console.warn('[Realtime] Error actualizando permisos:', err.message)
            }
          }
        )
        .subscribe(status => {
          console.log('[Realtime] Canal permisos_maestros:', status)
        })

      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        supabase.removeChannel(permisosChannel)
      }, { once: true })
    }
  }

  // Keyboard shortcuts (desktop only)
  document.addEventListener('keydown', (e) => {
    if (getBreakpoint() !== 'desktop') return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    
    // Simple state machine for shortcuts
    if (!window._globalAppKeys) window._globalAppKeys = []
    const _keys = window._globalAppKeys
    
    _keys.push(e.key.toLowerCase())
    if (_keys[_keys.length - 2] === 'g') {
      switch (e.key.toLowerCase()) {
        case 'h': router.navigate('hoy'); _keys.length = 0; break
        case 'c': router.navigate('calendario'); _keys.length = 0; break
        case 'r': router.navigate('ruta'); _keys.length = 0; break
        case 'm': router.navigate('metricas'); _keys.length = 0; break
        case 'p': router.navigate('perfil'); _keys.length = 0; break
        default: break
      }
    }
    if (_keys.length > 3) _keys.splice(0, _keys.length - 2)
  })

  // Breakpoint change handler
  let _resizeTimer = null
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer)
    _resizeTimer = setTimeout(() => {
      const next = getBreakpoint()
      if (next !== _currentBreakpoint) {
        _currentBreakpoint = next
        document.body.dataset.pmLayout = next
        _renderShell(document.getElementById('portal-app'), _maestro)
        _initViewContainers()
        
        // El nuevo DOM necesita re-activar el tab correcto
        const route = (router.currentRoute?.() || 'hoy').split('?')[0]
        _setActiveTab(route)
      }
    }, 250)
  }, { passive: true })
}

function _setActiveTab(route) {
  document.querySelectorAll('.pm-nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === route)
  })
  document.querySelectorAll('.pm-sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.route === route)
  })
}

// ── Contenedores de vistas persistentes ───────────────────────

const _viewContainers = {}
let _activeViewCleanup = null
const _viewRendered = new Set()

function _initViewContainers() {
  const container = document.getElementById('pm-view-container')
  if (!container) return

  container.innerHTML = ''

  const views = [
    'login', 'logout', 'register', 'pending-approval',
    'calendario', 'clases', 'hoy', 'asistencia',
    'metricas', 'perfil', 'clase-emergente', 'planificacion',
    'alumno', 'gamificacion', 'ruta', 'crear-clase', 'ruta-plan-builder',
    'ruta-semanal', 'ruta-libreria', 'ruta-detalle', 'registrar-alumno',
    'gestionar-clases',
  ]

  const adminViews = [
    'admin-alumnos', 'admin-programas', 'admin-maestros',
    'admin-metricas', 'admin-config', 'admin-clases', 'admin-sesiones',
    'admin-aprobacion', 'admin-ausencias', 'admin-notificaciones',
  ]

  views.forEach(viewName => {
    const el = document.createElement('div')
    el.id = `pm-view-${viewName}`
    el.className = 'pm-view-content'
    el.style.display = 'none'
    container.appendChild(el)
    _viewContainers[viewName] = el
  })

  if (IS_ADMIN) {
    adminViews.forEach(viewName => {
      const el = document.createElement('div')
      el.id = `pm-view-${viewName}`
      el.className = 'pm-view-content'
      el.style.display = 'none'
      container.appendChild(el)
      _viewContainers[viewName] = el
    })
  }
}

// ── Renderizado de vistas (SPA sin reload) ───────────────────

async function _renderView(route, params = {}, { silent = false } = {}) {
  const queryStr = window.location.hash.includes('?')
    ? window.location.hash.split('?')[1]
    : ''
  const urlParams = new URLSearchParams(queryStr)
  const baseRoute = route.split('?')[0]

  // En modo silent (preload), solo renderizar contenido sin cambiar visibilidad
  if (!silent) {
    // Cerrar buscador estilo WhatsApp al navegar
    const headerEl = document.getElementById('pm-header')
    if (headerEl && headerEl.classList.contains('search-active')) {
      headerEl.classList.remove('search-active')
      const input = document.getElementById('pm-header-search-input')
      if (input) input.value = ''
    }
    _setActiveTab(baseRoute)

    // Re-evaluar alertas superiores (SOI Smart Insights) al cambiar de vista
    if (window.pwaInstaller) {
      window.pwaInstaller.evaluateInsights()
    }
    // Admin: re-evaluar banner de ausencias pendientes
    if (window.adminAusenciasInsights) {
      window.adminAusenciasInsights.evaluate()
    }
  }

  const targetContainer = _viewContainers[baseRoute]
  if (!targetContainer) {
    console.warn(`[Router] Contenedor no encontrado: ${baseRoute}`)
    return
  }

  if (!silent) {
    // ── CLEANUP ANTERIOR ──
    if (typeof _activeViewCleanup === 'function') {
      console.log(`[Router] Ejecutando cleanup de vista anterior...`)
      _activeViewCleanup()
      _activeViewCleanup = null
    }

    Object.values(_viewContainers).forEach(el => {
      el.style.display = 'none'
      el.classList.remove('active')
    })
    targetContainer.style.display = 'block'
    // Force reflow before adding active class for transition
    targetContainer.offsetHeight
    targetContainer.classList.add('active')
  }

  if (_viewRendered.has(baseRoute)) {
    return
  }

  // Show spinner only if loading takes >300ms (keep stale content visible meanwhile)
  const spinnerTimeout = setTimeout(() => {
    // Remove any existing spinners first
    targetContainer.querySelectorAll('.pm-loading-overlay').forEach(el => el.remove())

    const spinner = document.createElement('div')
    spinner.className = 'pm-loading pm-loading-overlay'
    spinner.innerHTML = '<div class="pm-spinner"></div>'
    targetContainer.prepend(spinner)
  }, 300)

  try {
    switch (baseRoute) {
      case 'login':
        renderLoginView(targetContainer, { onSuccess: () => initPortal() })
        break
      case 'register':
        renderRegisterView(targetContainer, {
          onSuccess: () => router.navigate('pending-approval')
        })
        break
      case 'pending-approval':
        renderPendingApprovalView(targetContainer, {
          onBackToLogin: () => router.navigate('login')
        })
        break
      case 'logout':
        _showLoginScreen()
        stopRealtime()
        logoutMaestro().then(() => window.location.reload())
        break
      case 'calendario':
      case 'clases':
        _activeViewCleanup = await renderCalendarioView(targetContainer)
        break
      case 'hoy':
        _activeViewCleanup = await renderHoyView(targetContainer, {
          onClaseClick: (id) => router.navigate(`asistencia?clase=${id}`)
        })
        break
      case 'asistencia':
        _activeViewCleanup = await renderAsistenciaView(targetContainer, { claseId: urlParams.get('clase'), fecha: urlParams.get('fecha') })
        break
      case 'metricas':
        _activeViewCleanup = renderMetricasView(targetContainer)
        break
      case 'perfil':
        _activeViewCleanup = renderPerfilView(targetContainer)
        break
      case 'clase-emergente':
        _activeViewCleanup = renderClaseEmergenteView(targetContainer, { maestroId: _maestro?.id })
        break
      case 'planificacion':
        _activeViewCleanup = await renderPlanificacionView(targetContainer)
        break
      case 'alumno':
        _activeViewCleanup = renderAlumnoPerfilView(targetContainer, { alumnoId: urlParams.get('id') })
        break
      case 'gamificacion':
        await renderGamificacionView(targetContainer)
        break
      case 'ruta':
        await renderRutaGameificadaView(targetContainer, {
          onTopicSelected: (id) => router.navigate(`asistencia?clase=${id}`)
        })
        break
      case 'crear-clase':
        renderCrearClaseView(targetContainer)
        break
      case 'ruta-plan-builder':
        renderAcademicPlanBuilderView(targetContainer, { alumnoId: urlParams.get('id') })
        break
      case 'ruta-semanal':
        renderWeeklyPlanView(targetContainer, { alumnoId: urlParams.get('id') })
        break
      case 'ruta-libreria':
        RouteLibraryView.render().then(view => {
          targetContainer.innerHTML = ''
          targetContainer.appendChild(view)
        })
        break
      case 'ruta-detalle':
        RouteDetailView.render(params).then(view => {
          targetContainer.innerHTML = ''
          targetContainer.appendChild(view)
        })
        break
      // ── Admin routes ──────────────────────────────────────
      case 'admin-alumnos':
        renderAlumnosView(targetContainer)
        break
      case 'admin-programas':
        renderProgramasView(targetContainer)
        break
      case 'admin-maestros':
        renderMaestrosView(targetContainer)
        break
      case 'admin-metricas':
        renderAdminMetricasView(targetContainer)
        break
      case 'admin-config':
        renderAcademicAdminView(targetContainer)
        break
      case 'admin-clases':
        renderClasesView?.(targetContainer)
        break
      case 'admin-sesiones':
        break
      case 'admin-aprobacion':
        await renderAprobacionView(targetContainer)
        _activeViewCleanup = null
        break
      case 'admin-ausencias':
        await renderAusenciasAdminView(targetContainer)
        _activeViewCleanup = null
        break
      case 'admin-notificaciones':
        await renderAdminNotificacionesView(targetContainer)
        _activeViewCleanup = null
        break
      case 'registrar-alumno':
        if (!_permisos?.puede_registrar_alumnos) {
          router.navigate('hoy')
          return
        }
        renderRegistroAlumnoView(targetContainer)
        break
      case 'gestionar-clases':
        if (!_permisos?.puede_inscribir_clases) {
          router.navigate('hoy')
          return
        }
        _activeViewCleanup = await renderGestionarClasesView(targetContainer)
        break
      default:
    }

    clearTimeout(spinnerTimeout)
    targetContainer.querySelector('.pm-loading-overlay')?.remove()

    // Vistas que se cachean tras primer render (no se re-renderizan al navegar)
    // Excluidas: asistencia (depende de query params), alumno (depende de id)
    const CACHEABLE_VIEWS = new Set([
      'hoy', 'calendario', 'metricas', 'perfil', 'ruta',
      'gamificacion', 'crear-clase', 'planificacion',
      'ruta-libreria'
    ])
    if (CACHEABLE_VIEWS.has(baseRoute)) {
      _viewRendered.add(baseRoute)
    }
  } catch (err) {
    clearTimeout(spinnerTimeout)
    targetContainer.innerHTML = `<p class="pm-error">Error cargando vista: ${err.message}</p>`
  }
}

// ── Programar alertas del día en el Service Worker ────────────

async function _scheduleSwAlerts() {
  if (!_maestro) return
  try {
    const hoy = new Date()
    const diaHoy = hoy.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
    const fechaHoy = hoy.toISOString().split('T')[0]

    const [clases, horarios, sesiones] = await Promise.all([
      getMisClases(),
      getMisClases().then(c => getHorariosClases(c.map(x => x.id))),
      getMisClases().then(() => getSesiones(_maestro.id, fechaHoy, fechaHoy)),
    ])

    const clasesMap = Object.fromEntries(clases.map(c => [c.id, c]))
    const horariosHoy = horarios
      .filter(h => h.dia?.toLowerCase() === diaHoy)
      .map(h => ({
        ...h,
        clase_nombre: clasesMap[h.clase_id]?.nombre || 'Clase',
      }))

    const sesionesRegistradas = sesiones
      .filter(s => s.borrador === false || s.estado === 'registrada')
      .map(s => s.clase_id)

    await scheduleLocalAlerts(horariosHoy, sesionesRegistradas)
  } catch (err) {
    console.warn('[Alerts] Error programando alertas:', err.message)
  }
}

// ── Invalidate views after session save ────────────────────────

export function invalidateAllViews() {
  _viewRendered.clear()
}

export function invalidateView(name) {
  _viewRendered.delete(name)
}

// ── Bootstrap ───────────────────────────────────────────────

async function initPortal() {
  const app = document.getElementById('portal-app')
  if (!app) return

  console.log('[Init] Iniciando Portal...')

  // 1. Init auth (optimistic load from cache)
  console.log('[Init] Llamando usePortalAuth.init()...')
  const maestro = await usePortalAuth.init()
  console.log('[Init] Auth completado:', maestro ? 'con maestro' : 'sin maestro')

  // Determinar modo admin desde el campo es_admin de la tabla maestros
  IS_ADMIN = maestro?.es_admin === true
  console.log('[Init] IS_ADMIN:', IS_ADMIN)

  // Determinar si estamos en una ruta pública
  const routerInstance = window.router || createPortalRouter()
  const publicRoutes = ['login', 'register', 'pending-approval']
  const currentPath = routerInstance.currentRoute().split('?')[0]
  const isPublicRoute = publicRoutes.includes(currentPath)

  if (!maestro && !isPublicRoute) {
    console.log('[Init] No maestro y ruta privada, mostrando login screen')
    _showLoginScreen()
    return
  }

  // Si no hay maestro pero es ruta pública, necesitamos inicializar el shell mínimo o los contenedores
  if (!maestro && isPublicRoute) {
    console.log('[Init] No maestro pero ruta pública detectada:', currentPath)
    
    // Inyectar un contenedor de vistas mínimo si no existe (ya que no hay shell)
    if (!document.getElementById('pm-view-container')) {
      app.innerHTML = '<main class="pm-view" id="pm-view-container"></main>'
    }

    // Inicializar contenedores de vista sin shell completo
    _initViewContainers()
    
    // Configurar router y activar guard
    _setupRouterRoutes()
    router.setAuthGuard(() => usePortalAuth.isAuthenticated(), publicRoutes)
    router.start()
    return
  }

  // 2. Fetch permissions (for tab visibility, etc.)
  let permisos = null
  if (!IS_ADMIN) {
    try {
      permisos = await getPermisos(maestro.id)
    } catch (err) {
      console.warn('[Init] Error fetching permissions:', err.message)
    }
  }

  // 3. Render shell with navigation
  console.log('[Init] Renderizando shell...')
  _renderShell(app, maestro, permisos)
  console.log('[Init] Shell renderizado')

  // 3.1 Admin: inicializar banner de ausencias pendientes
  if (IS_ADMIN) {
    adminAusenciasInsights.init()
  }

  // 4. Init view containers AFTER shell (shell creates #pm-view-container)
  _initViewContainers()

  // 5. Setup global events (Realtime, shortcuts, resize) — ONCE
  _setupGlobalAppEvents()

  // 6. Registrar callbacks de navegación
  setNavigationCallbacks(invalidateView, invalidateAllViews)

  // 7. Configure router — F1-F6 routes
  _setupRouterRoutes()

  // 3.1 Activar guard de rutas
  router.setAuthGuard(() => usePortalAuth.isAuthenticated(), ['login', 'register', 'pending-approval'])

  router.start()

  // ── Prefetch datos del mes + precargar vistas ──────────────
  // Paso 1: Cargar TODOS los datos del mes en paralelo (1 ráfaga de queries)
  // Paso 2: Con datos en cache, renderizar las vistas restantes (instantáneo)
  prefetchMonthData()
    .then(async () => {
      // Precargar vistas restantes (datos ya en cache = instantáneo)
      const PRELOAD_VIEWS = ['hoy', 'calendario', 'metricas']
      const current = (router.currentRoute?.() || 'hoy').split('?')[0]
      const pending = PRELOAD_VIEWS.filter(v => v !== current && !_viewRendered.has(v))

      await pending.reduce((chain, viewName) => {
        return chain.then(() => {
          const container = _viewContainers[viewName]
          if (container) return _renderView(viewName, {}, { silent: true })
        })
      }, Promise.resolve())

      // Programar alertas locales del día en el Service Worker
      _scheduleSwAlerts()

      // Evaluar alertas superiores (SOI Smart Insights)
      if (window.pwaInstaller) {
        window.pwaInstaller.evaluateInsights()
      }
      // Admin: primera evaluación del banner de ausencias pendientes
      if (window.adminAusenciasInsights) {
        window.adminAusenciasInsights.evaluate()
      }
    })
    .catch(err => console.warn('[Prefetch] Error:', err.message))

  // 4. Initial sync attempt
  _triggerSync()

}

// Global error trap — shows errors visually + report to services
window.addEventListener('error', (e) => {
  // Filter out non-critical errors
  const ignoredPatterns = [
    'useCache',
    'WebSocket',
    'content.js',
  ]

  const errorMsg = e.message || ''
  const isIgnored = ignoredPatterns.some(p => errorMsg.includes(p))

  if (isIgnored) {
    console.warn('[Ignored Error]', errorMsg)
    return
  }

  // Report to Sentry
  reportError(new Error(e.message), {
    context: 'window.error',
    filename: e.filename,
    lineno: e.lineno,
  })

  const app = document.getElementById('portal-app')
  if (app) app.innerHTML = `
    <div style="padding:40px; color:#fff; font-family:'Outfit',sans-serif; background:radial-gradient(circle at top right, #1e293b, #0f172a); z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
      <div style="background:rgba(255,255,255,0.05); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:40px; max-width:600px; width:90%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <div style="width:80px; height:80px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px; margin:0 auto 24px;">
          <i class="bi bi-x-circle-fill"></i>
        </div>
        <h2 style="margin-bottom:16px; font-weight:700;">Ups! Algo salió mal</h2>
        <p style="color:rgba(255,255,255,0.6); margin-bottom:24px;">Se ha producido un error inesperado en la aplicación.</p>
        <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:12px; text-align:left; font-family:monospace; font-size:13px; margin-bottom:24px; overflow:auto; max-height:200px; border-left:4px solid #ef4444;">
          <div style="color:#ef4444; font-weight:bold; margin-bottom:8px;">${e.message}</div>
          <div style="color:rgba(255,255,255,0.4);">${e.filename?.split('/').pop()}:${e.lineno}</div>
        </div>
        <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6); color:white; border:none; padding:12px 32px; border-radius:12px; font-weight:600; cursor:pointer; transition:all 0.2s;">
          Recargar Aplicación
        </button>
      </div>
    </div>`
})
window.addEventListener('unhandledrejection', (e) => {
  // Additional handling for unhandled rejections
  // (early-error-suppression.js already filters most non-critical errors)

  // Report to Sentry
  reportError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), {
    context: 'unhandledRejection',
  })

  const app = document.getElementById('portal-app')
  if (app) app.innerHTML = `
    <div style="padding:40px; color:#fff; font-family:'Outfit',sans-serif; background:radial-gradient(circle at top right, #1e293b, #0f172a); z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
      <div style="background:rgba(255,255,255,0.05); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:40px; max-width:600px; width:90%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <div style="width:80px; height:80px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px; margin:0 auto 24px;">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h2 style="margin-bottom:16px; font-weight:700;">Error de Sincronización</h2>
        <p style="color:rgba(255,255,255,0.6); margin-bottom:24px;">Hubo un problema al procesar una solicitud de red.</p>
        <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:12px; text-align:left; font-family:monospace; font-size:13px; margin-bottom:24px; overflow:auto; max-height:200px; border-left:4px solid #ef4444;">
          <div style="color:#ef4444; font-weight:bold; margin-bottom:8px;">Promise Rejection</div>
          <div style="color:rgba(255,255,255,0.4);">${String(e.reason)}</div>
        </div>
        <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6); color:white; border:none; padding:12px 32px; border-radius:12px; font-weight:600; cursor:pointer; transition:all 0.2s;">
          Recargar Aplicación
        </button>
      </div>
    </div>`
})

initPortal().catch(err => {
  const app = document.getElementById('portal-app')
  if (app) app.innerHTML = `<div style="padding:20px;color:red;font-family:monospace;background:#fff;z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"><h2>❌ initPortal() falló</h2><pre>${err?.message || err}\n${err?.stack || ''}</pre></div>`
})
