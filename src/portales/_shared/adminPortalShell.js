import { abrirModalConmutadorPortales } from './portalHubModal.js'
/**
 * adminPortalShell.js — Shell parametrizado para portales departamentales (ACM, ADM, ...).
 *
 * Reutiliza la infraestructura probada del portal admin (main.js): tema, registro de
 * módulos vía el router central, gating de auth + rol, sidebar agrupado y montaje del
 * router en #app. Cada portal solo aporta su "perfil" (qué grupos de nav, qué módulos,
 * qué rol puede entrar y qué departamento Hermes le corresponde).
 *
 * Los datos viven una sola vez en Supabase: un portal departamental es una LENTE
 * (subconjunto de módulos + permisos), no una copia de datos.
 *
 * @typedef {Object} PortalProfile
 * @property {string} brandText            — texto de marca (ej. "SOI · Académica")
 * @property {string} brandIcon            — clase bootstrap-icon (ej. "bi-easel")
 * @property {Array<{id,label,icon,items:Array<{id,label,icon}>}>} navGroups
 * @property {Array<Function>} registrars  — funciones registerRoutes* de cada módulo
 * @property {string[]} allowedRoles       — roles de profiles.rol con acceso (ej. ['admin'])
 * @property {string} defaultRoute         — ruta inicial (id de un item de navGroups)
 * @property {string} hermesDept           — enum soi_departamento (ACM|ADM|...) para tareas Hermes
 */

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../../style.css'
import '../../styles/bootstrap-support.css'
import '../../styles/sidebar.css'

// PWA: Registrar Service Worker con actualización automática para portales administrativos
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })

  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        }
      })
    } catch (err) {
      console.warn('[portalShell] SW registration error:', err)
    }
  }

  if (document.readyState === 'complete') {
    registerSW()
  } else {
    window.addEventListener('load', registerSW)
  }
}

import { supabase } from '../../lib/supabaseClient.js'
import { router } from '../../core/router/router.js'
import { useAuth } from '../../modules/auth/hooks/useAuth.js'
import { registerRoutesAuth } from '../../modules/auth/index.js'
import { renderTareasView } from '../../modules/hermes/views/tareasView.js'
import { renderSeguimientoTareasView } from '../../modules/hermes/views/seguimientoTareasView.js'
import { renderProcedimientosView } from '../../modules/hermes/views/procedimientosView.js'
import { renderCasoDetalleView } from '../../modules/hermes/views/casoDetalleView.js'
import { renderScoreDirectorView } from '../../modules/hermes/views/scoreDirectorView.js'
import { renderHermesConsultaView } from '../../modules/hermes/views/hermesConsultaView.js'
import { renderCierreAcademicoView } from '../../modules/metricas/views/cierreAcademicoView.js'
import { reportCatalogAudit } from '../../core/catalogAudit.js'
import { checkPortalAccess } from '../../core/auth/portalAccessService.js'

window.router = router

const HERMES_ROUTE = 'hermes-tareas'

// ── Tema ────────────────────────────────────────────────────────────────────
function initializeTheme() {
  const saved = localStorage.getItem('app-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved === 'dark' || (saved === null && prefersDark)
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light')
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-bs-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-bs-theme', next)
  localStorage.setItem('app-theme', next)
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
let _navAbortController = null

function getGroupForRoute(navGroups, route) {
  for (const g of navGroups) {
    if (g.items.some((i) => i.id === route)) return g.id
  }
  return navGroups[0]?.id
}

function renderNavbar(profile, isAuthenticated, storageKey) {
  _navAbortController?.abort()
  _navAbortController = new AbortController()

  document.querySelector('.app-sidebar')?.remove()
  document.querySelector('.app-bottom-nav')?.remove()
  document.querySelector('.mobile-sub-sheet')?.remove()

  if (!isAuthenticated) return

  const auth = useAuth.getUser()
  const userDisplay = auth ? auth.email || auth.full_name || 'Usuario' : ''
  const currentRoute = localStorage.getItem(storageKey) || profile.defaultRoute
  const activeGroup = getGroupForRoute(profile.navGroups, currentRoute)
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark'

  const sidebar = document.createElement('aside')
  sidebar.className = 'app-sidebar'
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi ${profile.brandIcon}"></i></div>
      <span class="sidebar-brand-text">${profile.brandText}</span>
      <button class="btn btn-sm btn-outline-light rounded-pill ms-auto me-1 py-0 px-2" id="sidebarBtnHub" title="Hub de Portales Departamentales">
        <i class="bi bi-grid-3x3-gap"></i>
      </button>
    </div>
    <nav class="sidebar-nav">
      ${profile.navGroups
        .map(
          (g) => `
        <div class="nav-group ${g.id === activeGroup ? 'expanded' : ''}" data-group="${g.id}">
          <button class="nav-group-header">
            <i class="bi ${g.icon} group-icon"></i>
            <span>${g.label}</span>
            <i class="bi bi-chevron-down chevron"></i>
          </button>
          <div class="nav-group-items">
            ${g.items
              .map(
                (item) => `
              <button class="nav-item-btn ${item.id === currentRoute ? 'active' : ''}" data-route="${item.id}">
                <i class="bi ${item.icon}"></i>
                <span>${item.label}</span>
                ${item.badge ? `<span class="${item.badgeClass || 'badge bg-success-subtle text-success border border-success-subtle'} ms-auto" style="font-size:0.68rem; padding: 0.2rem 0.45rem;">${item.badge}</span>` : ''}
              </button>`,
              )
              .join('')}
          </div>
        </div>`,
        )
        .join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="bi bi-person-circle"></i>
        <span class="sidebar-user-name" title="${userDisplay}">${userDisplay.split('@')[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `

  const bottomNav = document.createElement('nav')
  bottomNav.className = 'app-bottom-nav'
  bottomNav.innerHTML = profile.navGroups
    .map(
      (g) => `
    <button class="bottom-tab ${g.id === activeGroup ? 'active' : ''}" data-group="${g.id}">
      <i class="bi ${g.icon}"></i>
      <span>${g.label}</span>
    </button>
  `,
    )
    .join('')

  const subSheet = document.createElement('div')
  subSheet.className = 'mobile-sub-sheet'
  subSheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `

  document.body.prepend(sidebar)
  document.body.prepend(bottomNav)
  document.body.prepend(subSheet)

  const { signal } = _navAbortController

  const syncBottomNavState = (route = localStorage.getItem(storageKey) || profile.defaultRoute) => {
    const nextGroup = getGroupForRoute(profile.navGroups, route)
    bottomNav.querySelectorAll('.bottom-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.group === nextGroup)
    })
    const currentSheetGroup = subSheet.dataset.group
    if (subSheet.classList.contains('open') && currentSheetGroup && currentSheetGroup !== nextGroup) {
      subSheet.classList.remove('open')
    }
  }

  sidebar.querySelectorAll('.nav-group-header').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const group = btn.closest('.nav-group')
        const wasExpanded = group.classList.contains('expanded')
        sidebar.querySelectorAll('.nav-group').forEach((g) => g.classList.remove('expanded'))
        if (!wasExpanded) group.classList.add('expanded')
      },
      { signal },
    )
  })

  sidebar.querySelectorAll('.nav-item-btn').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        router.navigate(btn.dataset.route)
      },
      { signal },
    )
  })

  sidebar.querySelector('#sidebarBtnHub')?.addEventListener(
    'click',
    (e) => {
      e.stopPropagation()
      abrirModalConmutadorPortales()
    },
    { signal },
  )

  sidebar.querySelector('#sidebarBtnTheme').addEventListener(
    'click',
    () => {
      toggleTheme()
      const isDarkNow = document.documentElement.getAttribute('data-bs-theme') === 'dark'
      sidebar.querySelector('#sidebarBtnTheme i').className = isDarkNow
        ? 'bi bi-sun-fill'
        : 'bi bi-moon-fill'
    },
    { signal },
  )

  sidebar.querySelector('#sidebarBtnLogout').addEventListener(
    'click',
    async () => {
      await supabase.auth.signOut()
      window.location.reload()
    },
    { signal },
  )

  function openSheet(groupId) {
    const group = profile.navGroups.find((g) => g.id === groupId)
    if (!group) return
    const route = localStorage.getItem(storageKey) || profile.defaultRoute
    const titleEl = document.getElementById('sheetTitle')
    const itemsEl = document.getElementById('sheetItems')
    if (!titleEl || !itemsEl) return

    titleEl.textContent = group.label
    itemsEl.innerHTML = group.items
      .map(
        (item) => `
      <button class="sheet-item ${item.id === route ? 'active' : ''}" data-route="${item.id}">
        <i class="bi ${item.icon}"></i>
        <span>${item.label}</span>
        ${item.badge ? `<span class="${item.badgeClass || 'badge bg-success-subtle text-success border border-success-subtle'} ms-auto" style="font-size:0.68rem; padding: 0.2rem 0.45rem;">${item.badge}</span>` : ''}
      </button>
    `,
      )
      .join('')

    subSheet.dataset.group = groupId
    subSheet.classList.add('open')

    itemsEl.querySelectorAll('.sheet-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        router.navigate(btn.dataset.route)
        subSheet.classList.remove('open')
        bottomNav.querySelectorAll('.bottom-tab').forEach((t) =>
          t.classList.toggle('active', t.dataset.group === getGroupForRoute(profile.navGroups, btn.dataset.route)),
        )
      })
    })
  }

  bottomNav.querySelectorAll('.bottom-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const groupId = tab.dataset.group
      if (subSheet.classList.contains('open') && subSheet.dataset.group === groupId) {
        subSheet.classList.remove('open')
      } else {
        openSheet(groupId)
        bottomNav
          .querySelectorAll('.bottom-tab')
          .forEach((t) => t.classList.toggle('active', t.dataset.group === groupId))
      }
    })
  })

  window.addEventListener(
    'routeChanged',
    (e) => {
      const route = e.detail
      syncBottomNavState(route)
      sidebar.querySelectorAll('.nav-item-btn').forEach((btn) => {
        const isActive = btn.dataset.route === route
        btn.classList.toggle('active', isActive)
        if (isActive) {
          const parentGroup = btn.closest('.nav-group')
          if (parentGroup && !parentGroup.classList.contains('expanded')) {
            sidebar.querySelectorAll('.nav-group').forEach((g) => g.classList.remove('expanded'))
            parentGroup.classList.add('expanded')
          }
        }
      })
    },
    { signal },
  )

  syncBottomNavState(currentRoute)
}

// ── Acceso por rol ────────────────────────────────────────────────────────────
async function getUserRole(userId) {
  const { data } = await supabase.from('profiles').select('rol').eq('id', userId).maybeSingle()
  return data?.rol || null
}

function renderAccessDenied(app, brandText) {
  document.querySelector('.app-sidebar')?.remove()
  document.querySelector('.app-bottom-nav')?.remove()
  document.querySelector('.mobile-sub-sheet')?.remove()
  app.innerHTML = `
    <div class="d-flex align-items-center justify-content-center" style="min-height:100vh">
      <div class="text-center p-4">
        <i class="bi bi-shield-lock" style="font-size:3rem;opacity:0.4"></i>
        <h4 class="mt-3">Sin acceso a ${brandText}</h4>
        <p class="text-muted">Tu cuenta no tiene permiso para este portal.</p>
        <button class="btn btn-outline-secondary btn-sm" id="btnSalir">
          <i class="bi bi-box-arrow-right me-1"></i>Cambiar de cuenta
        </button>
      </div>
    </div>
  `
  app.querySelector('#btnSalir')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.reload()
  })
}

// ── Boot ──────────────────────────────────────────────────────────────────────
/**
 * Arranca un portal departamental.
 * @param {PortalProfile} profile
 */
export async function bootAdminPortal(profile) {
  const storageKey = `current-view-${profile.hermesDept.toLowerCase()}`
  const app = document.querySelector('#app')
  if (!app) {
    console.error('El contenedor #app no existe en el HTML')
    return
  }

  initializeTheme()
  router.setPortalPrefix(profile.hermesDept.toLowerCase())

  // Registrar auth + módulos del perfil
  try {
    registerRoutesAuth()
  } catch (e) {
    console.error('Error registrando auth:', e)
  }
  profile.registrars.forEach((register) => {
    try {
      register()
    } catch (e) {
      console.error('Error registrando módulo:', e)
    }
  })

  // Ruta de Tareas Hermes del departamento
  router.register(HERMES_ROUTE, (mount, params = {}) =>
    renderTareasView(mount, {
      departamento: profile.hermesDept,
      hideCalendarBtn: true,
      ...params,
    }),
  )
  router.register('hermes-caso', (mount, params = {}) =>
    renderCasoDetalleView(mount, params),
  )
  router.register('seguimiento-tareas', (mount) =>
    renderSeguimientoTareasView(mount, { departamento: profile.hermesDept }),
  )
  router.register('cierre-academico', (mount) => renderCierreAcademicoView(mount))

  // SP-3: vistas de Dirección (procedimientos consolidados + score por departamento).
  router.register('hermes-procedimientos', (mount) => renderProcedimientosView(mount))
  router.register('dir-score', (mount) => renderScoreDirectorView(mount))
  // SP-5: capa de consulta de Hermes (respuestas factuales).
  router.register('hermes-consulta', (mount) => renderHermesConsultaView(mount))

  // El catálogo sombra cubre inicialmente ADM y ACM. Los demás perfiles se
  // incorporarán cuando sus contratos estén inventariados y probados.
  if (profile.hermesDept === 'ADM' || profile.hermesDept === 'ACM') {
    reportCatalogAudit({
      portalId: profile.hermesDept,
      defaultRoute: profile.defaultRoute,
      navGroups: profile.navGroups,
      registeredRoutes: Object.keys(router.routes),
    })
  }

  router.initCustomEvents()

  await useAuth.refreshAuth()
  router.setAuthGuard(() => useAuth.isAuthenticated(), ['login', 'register'])

  const isValidRoute = (r) => Boolean(r && profile.navGroups.some((g) => g.items.some((i) => i.id === r)))

  // Persistencia de ruta por portal (evita colisión entre portales en el mismo origin)
  router.init = function init() {
    const stored = localStorage.getItem(storageKey)
    const view = isValidRoute(stored) && this.routes[stored] ? stored : profile.defaultRoute
    this.navigate(view)
  }
  const origNavigateTo = router._navigateTo.bind(router)
  router._navigateTo = function (path, params = {}) {
    origNavigateTo(path, params)
    localStorage.setItem(storageKey, path)
  }

  const dismissSplashScreen = () => {
    const splash = document.querySelector('.pm-loading-splash, #pm-loading-splash')
    if (!splash) return
    splash.style.transition = 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    splash.style.opacity = '0'
    splash.style.transform = 'scale(0.98)'
    splash.style.pointerEvents = 'none'
    setTimeout(() => splash.remove(), 400)
  }

  const gate = async () => {
    if (!useAuth.isAuthenticated()) {
      renderNavbar(profile, false, storageKey)
      router.navigate('login')
      dismissSplashScreen()
      return
    }
    // getUser() lee del authManager; state.user es el fallback confiable tras refreshAuth.
    const user = useAuth.getUser() || useAuth.getState?.().user
    const role = await getUserRole(user.id)
    const hasAccess = await checkPortalAccess(profile.hermesDept, {
      userId: user.id,
      role
    })

    if (!hasAccess) {
      renderAccessDenied(app, profile.brandText)
      dismissSplashScreen()
      return
    }
    renderNavbar(profile, true, storageKey)
    const deptPrefix = `/${profile.hermesDept.toLowerCase()}`
    let pathFromUrl = ''
    const pathname = window.location?.pathname || ''
    if (pathname === deptPrefix || pathname.startsWith(deptPrefix + '/')) {
      pathFromUrl = pathname.slice(deptPrefix.length).replace(/^\/+/, '')
    }

    const hashRoute = window.location?.hash ? window.location.hash.replace(/^#\/?/, '') : ''
    const stored = localStorage.getItem(storageKey)
    const targetRoute = (pathFromUrl && router._matchRoute(pathFromUrl))
      ? pathFromUrl
      : ((hashRoute && router._matchRoute(hashRoute))
        ? hashRoute
        : (isValidRoute(stored) && router._matchRoute(stored) ? stored : profile.defaultRoute))
    router.navigate(targetRoute)
    dismissSplashScreen()
  }

  // Sincronizar navegación por hash si el usuario cambia el fragmento en la URL
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash ? window.location.hash.replace(/^#\/?/, '') : ''
    if (hash && router.routes[hash]) {
      router.navigate(hash)
    }
  })

  try {
    await gate()
  } catch (err) {
    console.error('[portalShell] Error en boot:', err)
    renderBootError(app, profile.brandText, err)
    return
  }

  let _gating = false
  useAuth.subscribe(async (state) => {
    if (_gating) return
    _gating = true
    try {
      if (state.user) {
        await gate()
      } else {
        document.querySelector('.app-sidebar')?.remove()
        app.innerHTML = ''
        router.navigate('login')
      }
    } catch (err) {
      console.error('[portalShell] Error en re-gate:', err)
    } finally {
      _gating = false
    }
  })
}

function renderBootError(app, brandText, err) {
  document.querySelector('.app-sidebar')?.remove()
  document.querySelector('.app-bottom-nav')?.remove()
  document.querySelector('.mobile-sub-sheet')?.remove()
  app.innerHTML = `
    <div class="d-flex align-items-center justify-content-center" style="min-height:100vh">
      <div class="text-center p-4" style="max-width:520px">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size:2.5rem"></i>
        <h5 class="mt-3">No se pudo iniciar ${brandText}</h5>
        <pre class="text-start small bg-body-secondary p-3 rounded mt-3" style="white-space:pre-wrap;overflow:auto;max-height:240px">${String(err?.stack || err?.message || err)}</pre>
        <button class="btn btn-outline-secondary btn-sm" onclick="window.location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
        </button>
      </div>
    </div>
  `
}
