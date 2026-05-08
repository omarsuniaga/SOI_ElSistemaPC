// ============================================================
// PORTAL MAESTROS — Entry Point
// ============================================================
import './portal-maestros/styles/portal.css'

import { usePortalAuth, logoutMaestro } from './portal-maestros/auth/usePortalAuth.js'
import { createPortalRouter }   from './portal-maestros/router/portalRouter.js'
import { processQueue, getQueue } from './portal-maestros/services/offlineQueue.js'
import { supabase }             from './lib/supabaseClient.js'
import { prefetchMonthData, getMisClases, getHorariosClases, getSesiones } from './portal-maestros/services/maestroDataService.js'
import { scheduleLocalAlerts }  from './portal-maestros/services/pushService.js'

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
import { renderCrearClaseView } from './portal-maestros/views/crearClaseView.js'
import { renderAcademicPlanBuilderView } from './portal-maestros/views/academicPlanBuilderView.js'
import { renderWeeklyPlanView } from './portal-maestros/views/weeklyPlanView.js'
import { RouteLibraryView }      from './portal-maestros/views/routeLibraryView.js'
import { RouteDetailView }       from './portal-maestros/views/routeDetailView.js'

// Nuevos componentes de UI
import { themeToggle } from './portal-maestros/components/themeToggle.js'
import { notificacionesPanel } from './portal-maestros/components/notificacionesPanel.js'
import { onNotificacionesChange, getUnreadCount, fetchNotificaciones } from './portal-maestros/services/notificationService.js'
import { setNavigationCallbacks } from './portal-maestros/services/navigationHooks.js'

// Módulo de Rutas Académicas
import './modules/academic-routes/styles/academic-routes.css'

const TABS = [
  { id: 'hoy',        label: 'Hoy',        icon: 'bi-house-door' },
  { id: 'calendario', label: 'Calendario',  icon: 'bi-calendar3' },
  { id: 'metricas',   label: 'Métricas',    icon: 'bi-bar-chart-line' },
]

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

// ── Shell (estructura persistente) ─────────────────────────

function _renderShell(app, maestro) {
  _maestro = maestro

  const renderTabs = () => TABS.map(tab => `
      <button class="pm-bottom-tab" data-route="${tab.id}">
        <i class="bi ${tab.icon}"></i>
        <span>${tab.label}</span>
      </button>
    `).join('')

  app.innerHTML = `
    <!-- Header -->
    <header class="pm-header">
      <div class="pm-header-left">
        <span class="pm-header-greeting">Hola,</span>
        <span class="pm-header-title">
          ${maestro?.nombre?.split(' ')[0] ?? 'Maestro'}
        </span>
      </div>
      <div class="pm-header-right">
        <span class="pm-sync-indicator synced" id="pm-sync-indicator">✓ Sincronizado</span>
        
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

    <!-- Bottom nav -->
    <nav class="pm-bottom-nav" id="pm-bottom-nav">
      ${renderTabs()}
    </nav>
  `

  _updateSyncIndicator()

  // Inicializar theme toggle
  const themeContainer = document.getElementById('pm-theme-toggle-container')
  if (themeContainer) {
    themeContainer.appendChild(themeToggle.createToggleButton())
  }

  // Bottom nav events - SPA navigation (no reload)
  const bottomNav = document.getElementById('pm-bottom-nav')
  bottomNav.querySelectorAll('.pm-bottom-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault()
      router.navigate(tab.dataset.route)
    })
  })

  document.getElementById('pm-btn-perfil').addEventListener('click', (e) => {
    e.preventDefault()
    router.navigate('perfil')
  })

  document.getElementById('pm-btn-logout').addEventListener('click', async () => {
    await logoutMaestro()
    window.location.reload()
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
}

function _setActiveTab(route) {
  document.querySelectorAll('.pm-bottom-tab').forEach(tab => {
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
    'alumno', 'gamificacion', 'crear-clase', 'ruta-plan-builder', 
    'ruta-semanal', 'ruta-libreria', 'ruta-detalle'
  ]

  views.forEach(viewName => {
    const el = document.createElement('div')
    el.id = `pm-view-${viewName}`
    el.className = 'pm-view-content'
    el.style.display = 'none'
    container.appendChild(el)
    _viewContainers[viewName] = el
  })
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
    if (!targetContainer.querySelector('.pm-loading')) {
      const spinner = document.createElement('div')
      spinner.className = 'pm-loading pm-loading-overlay'
      spinner.innerHTML = '<div class="pm-spinner"></div>'
      targetContainer.prepend(spinner)
    }
  }, 300)

  try {
    switch (baseRoute) {
      case 'login':
        renderLoginView(targetContainer, { onSuccess: () => initPortal() })
        break
      case 'logout':
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
      default:
        router.navigate('hoy')
    }

    clearTimeout(spinnerTimeout)
    targetContainer.querySelector('.pm-loading-overlay')?.remove()

    // Vistas que se cachean tras primer render (no se re-renderizan al navegar)
    // Excluidas: asistencia (depende de query params), alumno (depende de id)
    const CACHEABLE_VIEWS = new Set([
      'hoy', 'calendario', 'metricas', 'perfil',
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

  // 1. Init auth (optimistic load from cache)
  const maestro = await usePortalAuth.init()

  if (!maestro) {
    const loginContainer = _viewContainers['login']
    if (loginContainer) {
      loginContainer.style.display = 'block'
      renderLoginView(loginContainer, { onSuccess: (intended) => {
        if (intended && intended !== 'login') {
          router.navigate(intended)
        } else {
          initPortal()
        }
      } })
    }
    return
  }

  // 2. Render shell with navigation
  _renderShell(app, maestro)
  
  // 2.1 Re-inicializar los contenedores dentro del nuevo pm-view-container
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
  router.on('crear-clase',    (route, params) => _renderView('crear-clase', params))
  router.on('ruta-plan-builder', (route, params) => _renderView('ruta-plan-builder', params))
  router.on('ruta-semanal',      (route, params) => _renderView('ruta-semanal', params))
  router.on('ruta-libreria',  (route, params) => _renderView('ruta-libreria', params))
  router.on('ruta-detalle/:id', (route, params) => _renderView('ruta-detalle', params))
  router.onNotFound(()         => _renderView('hoy'))

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

initPortal()
