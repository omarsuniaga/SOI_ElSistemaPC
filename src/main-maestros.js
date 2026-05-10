import './portal-maestros/styles/index.css'
import { usePortalAuth, logoutMaestro } from './portal-maestros/auth/usePortalAuth.js'
import { createPortalRouter }   from './portal-maestros/router/portalRouter.js'
import { processQueue, getQueue } from './portal-maestros/services/offlineQueue.js'
import { supabase }             from './lib/supabaseClient.js'
import { prefetchMonthData, getMisClases, getHorariosClases, getSesiones } from './portal-maestros/services/maestroDataService.js'
import { scheduleLocalAlerts }  from './portal-maestros/services/pushService.js'
import { AppModal }             from './shared/components/AppModal.js'

// Icons only — NO Bootstrap CSS/JS in portal
import 'bootstrap-icons/font/bootstrap-icons.css'

import { renderLoginView }        from './portal-maestros/views/loginView.js'
import { renderHoyView }          from './portal-maestros/views/hoyView.js'
import { renderCalendarioView }   from './portal-maestros/views/calendarioView.js'
import { renderMetricasView }     from './portal-maestros/views/metricasView.js'
import { renderAsistenciaView }   from './portal-maestros/views/asistenciaView.js'
import { renderClaseEmergenteView } from './portal-maestros/views/claseEmergenteView.js'
import { renderPerfilView }       from './portal-maestros/views/perfilView.js'
import { renderPlanificacionView } from './portal-maestros/views/planificacionView.js'
import { renderAlumnoPerfilView } from './portal-maestros/views/alumnoPerfilView.js'
import { renderGamificacionView } from './portal-maestros/views/gamificacionView.js'
import { renderRutaPlayerView }  from './portal-maestros/views/rutaPlayerView.js'
import { renderCrearClaseView } from './portal-maestros/views/crearClaseView.js'
import { renderAcademicPlanBuilderView } from './portal-maestros/views/academicPlanBuilderView.js'
import { renderWeeklyPlanView } from './portal-maestros/views/weeklyPlanView.js'
import { RouteLibraryView }      from './portal-maestros/views/routeLibraryView.js'
import { RouteDetailView }       from './portal-maestros/views/routeDetailView.js'
import { renderAlumnosView }     from './modules/alumnos/views/alumnosView.js'
import { renderProgramasView }   from './modules/programas/views/programasView.js'
import { renderMaestrosView }    from './modules/maestros/views/maestrosView.js'
import { renderMetricasCompletaView as renderAdminMetricasView } from './modules/metricas/views/metricasCompletaView.js'
import { renderAcademicAdminView } from './modules/academic-admin/views/academicAdminView.js'
import { renderClasesView }        from './modules/clases/views/clasesView.js'

// Nuevos componentes de UI
import { themeToggle } from './portal-maestros/components/themeToggle.js'
import { notificacionesPanel } from './portal-maestros/components/notificacionesPanel.js'
import { onNotificacionesChange, getUnreadCount, fetchNotificaciones } from './portal-maestros/services/notificationService.js'
import { setNavigationCallbacks } from './portal-maestros/services/navigationHooks.js'

// Módulo de Rutas Académicas
import './modules/academic-routes/styles/academic-routes.css'

const IS_ADMIN = window.__SOI_MODE__ === 'admin'

const MAESTRO_TABS = [
  { id: 'hoy',        label: 'Hoy',        icon: 'bi-house-door' },
  { id: 'calendario', label: 'Calendario',  icon: 'bi-calendar3' },
  { id: 'ruta',       label: 'Ruta',        icon: 'bi-diagram-3' },
  { id: 'metricas',   label: 'Métricas',    icon: 'bi-bar-chart-line' },
]

const ADMIN_TABS = [
  { id: 'admin-alumnos',   label: 'Alumnos',      icon: 'bi-people-fill' },
  { id: 'admin-programas', label: 'Programas',    icon: 'bi-grid-1x2' },
  { id: 'admin-maestros',  label: 'Maestros',     icon: 'bi-person-badge' },
  { id: 'admin-metricas',  label: 'Métricas',     icon: 'bi-bar-chart-line' },
]

const ALL_TABS = () => IS_ADMIN ? ADMIN_TABS : MAESTRO_TABS

let _maestro = null

const router = createPortalRouter()

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
      indicator.className  = 'pm-sync-indicator synced'
      indicator.textContent = '✓ Sincronizado'
    } else {
      indicator.className  = 'pm-sync-indicator pending'
      indicator.textContent = `⏳ Pendiente (${queue.length})`
    }
  } catch {
    indicator.className  = 'pm-sync-indicator error'
    indicator.textContent = '⚠️ Error de sync'
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

window.addEventListener('online',  _triggerSync)
window.addEventListener('offline', _updateSyncIndicator)

// ── Shell visibility (logout / auth states) ──────────────────

function _hideShell() {
  const app = document.getElementById('portal-app')
  if (!app) return
  const header = app.querySelector('.pm-header')
  const nav    = app.querySelector('.pm-bottom-nav')
  const view   = app.querySelector('.pm-view')
  if (header) header.style.display = 'none'
  if (nav)    nav.style.display = 'none'
  if (view)   view.style.display = 'none'
}

function _showShell() {
  const app = document.getElementById('portal-app')
  if (!app) return
  const header = app.querySelector('.pm-header')
  const nav    = app.querySelector('.pm-bottom-nav')
  const view   = app.querySelector('.pm-view')
  if (header) header.style.display = ''
  if (nav)    nav.style.display = ''
  if (view)   view.style.display = ''
}

function _showLoginScreen() {
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
  const app = document.getElementById('portal-app')
  if (!app) return
  app.innerHTML = ''
  renderLoginView(app, {
    onSuccess: () => initPortal()
  })
}

// ── Shell (estructura persistente) ─────────────────────────

// Breakpoint detection utilities
export function getBreakpoint() {
  const w = window.innerWidth
  if (w < 768)  return 'mobile'
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

function _renderShell(app, maestro) {
  _maestro = maestro
  const bp = _currentBreakpoint

  const tabs = ALL_TABS()

  app.innerHTML = `
    <!-- Header -->
    <header class="pm-header">
      <div class="pm-header-left">
        <span class="pm-header-greeting">${IS_ADMIN ? 'Panel Admin' : 'Hola,'}</span>
        <span class="pm-header-title">
          ${IS_ADMIN
            ? (maestro?.nombre_completo?.split(' ')[0] ?? 'Administrador')
            : (maestro?.nombre_completo?.split(' ')[0] ?? 'Maestro')
          }
        </span>
      </div>

      <!-- Header right controls -->
      <div class="pm-header-right">
        <!-- Search (desktop only) -->
        ${bp === 'desktop' ? `
          <div class="pm-header-search">
            <i class="bi bi-search"></i>
            <input type="search" placeholder="Buscar alumno..." id="pm-header-search-input" />
          </div>
        ` : ''}

        <span class="pm-sync-indicator synced" id="pm-sync-indicator">✓</span>

        <!-- Toggle de tema -->
        <div id="pm-theme-toggle-container"></div>

        <!-- Botón de notificaciones -->
        <button id="pm-btn-notificaciones" class="pm-icon-btn" title="Notificaciones" style="position: relative;">
          <i class="bi bi-bell"></i>
          <span class="pm-ausencias-badge" id="pm-notif-badge" style="display: none; background: var(--pm-danger);">0</span>
        </button>

        <button id="pm-btn-logout" class="pm-icon-btn" title="Cerrar sesión">
          <i class="bi bi-box-arrow-right"></i>
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

    <!-- Footer Nav (always visible) -->
    <nav class="pm-footer-nav" id="pm-footer-nav">
      <div class="pm-footer-nav__inner">
        ${tabs.map(tab => `
          <button class="pm-nav-tab" data-route="${tab.id}" title="${tab.label}">
            <i class="bi ${tab.icon}"></i>
          </button>
        `).join('')}
      </div>
    </nav>
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

  document.getElementById('pm-btn-perfil').addEventListener('click', (e) => {
    e.preventDefault()
    router.navigate('perfil')
  })

  document.getElementById('pm-btn-logout').addEventListener('click', (e) => {
    e.preventDefault()
    AppModal.open({
      title: 'Cerrar Sesión',
      body: '<div class="text-center py-3"><i class="bi bi-box-arrow-right text-danger mb-3 d-block" style="font-size: 2.5rem;"></i><p class="mb-0">¿Estás seguro de que deseas salir del portal?</p></div>',
      saveText: 'Salir',
      cancelText: 'Cancelar',
      size: 'sm',
      onSave: async () => {
        await logoutMaestro()
        window.location.reload()
      }
    })
  })

  // Header search (desktop)
  const searchInput = document.getElementById('pm-header-search-input')
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim()
      if (q.length > 1) {
        router.navigate(`alumno?id=${encodeURIComponent(q)}`)
      }
    }
  })

  // Retry sync on error indicator click
  document.getElementById('pm-sync-indicator').addEventListener('click', async (e) => {
    if (e.target.classList.contains('error')) {
      await _triggerSync()
    }
  })

  // Eventos de notificaciones
  document.getElementById('pm-btn-notificaciones')?.addEventListener('click', () => {
    notificacionesPanel.open()
  })

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
  
  // Disparar la primera carga
  fetchNotificaciones();

  // Keyboard shortcuts (desktop only)
  if (bp === 'desktop') {
    const _keys = []
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      _keys.push(e.key)
      if (_keys[_keys.length - 2] === 'g') {
        switch (e.key) {
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
  }

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
        setTimeout(() => {
          // Re-register footer nav events
          document.querySelectorAll('.pm-nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
              e.preventDefault()
              router.navigate(tab.dataset.route)
            })
          })
          const route = (router.currentRoute?.() || 'hoy').split('?')[0]
          _setActiveTab(route)
        }, 50)
      }
    }, 250)
  }, { passive: true })
}

function _setActiveTab(route) {
  document.querySelectorAll('.pm-nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === route)
  })
}

// ── Contenedores de vistas persistentes ───────────────────────

const _viewContainers = {}
const _viewRendered = new Set()

function _initViewContainers() {
  const container = document.getElementById('pm-view-container')
  if (!container) return

  container.innerHTML = ''

  const views = [
    'login', 'logout', 'calendario', 'clases', 'hoy', 'asistencia', 
    'metricas', 'perfil', 'clase-emergente', 'planificacion', 
    'alumno', 'gamificacion', 'ruta', 'crear-clase', 'ruta-plan-builder',
    'ruta-semanal', 'ruta-libreria', 'ruta-detalle',
  ]

  const adminViews = [
    'admin-alumnos', 'admin-programas', 'admin-maestros',
    'admin-metricas', 'admin-config', 'admin-clases', 'admin-sesiones',
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
    _setActiveTab(baseRoute)
  }

  const targetContainer = _viewContainers[baseRoute]
  if (!targetContainer) {
    console.warn(`[Router] Contenedor no encontrado: ${baseRoute}`)
    return
  }

  if (!silent) {
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
      case 'logout':
        _showLoginScreen()
        logoutMaestro().then(() => window.location.reload())
        break
      case 'calendario':
      case 'clases':
        await renderCalendarioView(targetContainer)
        break
      case 'hoy':
        await renderHoyView(targetContainer, {
          onClaseClick: (id) => router.navigate(`asistencia?clase=${id}`)
        })
        break
      case 'asistencia':
        await renderAsistenciaView(targetContainer, { claseId: urlParams.get('clase'), fecha: urlParams.get('fecha') })
        break
      case 'metricas':
        renderMetricasView(targetContainer)
        break
      case 'perfil':
        renderPerfilView(targetContainer)
        break
      case 'clase-emergente':
        renderClaseEmergenteView(targetContainer, { maestroId: _maestro?.id })
        break
      case 'planificacion':
        renderPlanificacionView(targetContainer)
        break
      case 'alumno':
        renderAlumnoPerfilView(targetContainer, { alumnoId: urlParams.get('id') })
        break
      case 'gamificacion':
        renderGamificacionView(targetContainer)
        break
      case 'ruta':
        renderPlanificacionView(targetContainer)
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
      getMisClases().then(c => getSesiones(_maestro.id, fechaHoy, fechaHoy)),
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

  if (!maestro) {
    console.log('[Init] No maestro, mostrando login screen')
    _showLoginScreen()
    console.log('[Init] LoginScreen mostrado')
    return
  }

  // 2. Render shell with navigation
  console.log('[Init] Renderizando shell...')
  _renderShell(app, maestro)
  console.log('[Init] Shell renderizado')

  // 2.1 Init view containers AFTER shell (shell creates #pm-view-container)
  _initViewContainers()

  // 3. Registrar callbacks de navegación
  setNavigationCallbacks(invalidateView, invalidateAllViews)

  // 3. Configure router — F1-F6 routes
  router.on('login',         (route, params) => _renderView('login', params))
  router.on('logout',        (route, params) => _renderView('logout', params))
  router.on('calendario',    (route, params) => _renderView('calendario', params))
  router.on('clases',        (route, params) => _renderView('clases', params))
  router.on('hoy',           (route, params) => _renderView('hoy', params))
  router.on('asistencia',    (route, params) => _renderView('asistencia', params))
  router.on('metricas',      (route, params) => _renderView('metricas', params))
  router.on('perfil',          (route, params) => _renderView('perfil', params))
  router.on('clase-emergente', (route, params) => _renderView('clase-emergente', params))
  router.on('planificacion',   (route, params) => _renderView('planificacion', params))
  router.on('alumno',         (route, params) => _renderView('alumno', params))
  router.on('gamificacion',   (route, params) => _renderView('gamificacion', params))
  router.on('ruta',           (route, params) => _renderView('ruta', params))
  router.on('crear-clase',    (route, params) => _renderView('crear-clase', params))
  router.on('ruta-plan-builder', (route, params) => _renderView('ruta-plan-builder', params))
  router.on('ruta-semanal',      (route, params) => _renderView('ruta-semanal', params))
  router.on('ruta-libreria',  (route, params) => _renderView('ruta-libreria', params))
  router.on('ruta-detalle/:id', (route, params) => _renderView('ruta-detalle', params))

  // Admin routes (solo visible cuando IS_ADMIN=true)
  if (IS_ADMIN) {
    router.on('admin-alumnos',   (route, params) => _renderView('admin-alumnos', params))
    router.on('admin-programas', (route, params) => _renderView('admin-programas', params))
    router.on('admin-maestros',  (route, params) => _renderView('admin-maestros', params))
    router.on('admin-metricas',  (route, params) => _renderView('admin-metricas', params))
    router.on('admin-config',    (route, params) => _renderView('admin-config', params))
    router.on('admin-clases',    (route, params) => _renderView('admin-clases', params))
    router.on('admin-sesiones',  (route, params) => _renderView('admin-sesiones', params))
    // Admin default route
    router.onNotFound(() => _renderView('admin-alumnos'))
  } else {
    router.onNotFound(() => _renderView('hoy'))
  }

  // 3.1 Activar guard de rutas
  router.setAuthGuard(() => usePortalAuth.isAuthenticated(), ['login'])

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
    })
    .catch(err => console.warn('[Prefetch] Error:', err.message))

  // 4. Initial sync attempt
  _triggerSync()
}

// Global error trap — shows errors visually so we can debug without DevTools
window.addEventListener('error', (e) => {
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
