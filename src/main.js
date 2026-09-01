// ============================================================================
// SISTEMA ACADÉMICO - Main Entry Point
// ============================================================================

// EARLY ERROR SUPPRESSION (Must be first!)
import './early-error-suppression.js'

// Desactivar gestos de recarga pull-to-refresh (Look and Feel nativo)
import { disablePullToRefresh } from './shared/utils/pullToRefreshBlocker.js'
disablePullToRefresh()

// PWA: Registrar Service Worker con actualización automática
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
      console.log('[PWA] Service Worker registered:', registration.scope)

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Nueva versión detectada, activando automáticamente...')
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        }
      })
    } catch (error) {
      console.log('[PWA] Service Worker registration failed:', error)
    }
  }

  if (document.readyState === 'complete') {
    registerSW()
  } else {
    window.addEventListener('load', registerSW)
  }
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => registrations.forEach((registration) => registration.unregister()))
    .catch((error) => console.log('[PWA] Service Worker cleanup failed:', error))
}

// PWA: Banner de instalación automática
import { pwaInstaller } from './portal-maestros/components/pwaInstaller.js'

// Estilos
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import * as bootstrapLib from 'bootstrap'
window.bootstrap = bootstrapLib
import './style.css'
import './styles/design-tokens.css'
import './styles/breakpoints.css'
import './styles/dark-mode.css'
import './styles/utilities.css'
import './styles/patterns.css'
import './styles/bootstrap-support.css'
import './styles/sidebar.css'
import './modules/academic-admin/styles/academic-admin.css'

// Core
import { router } from './core/router/router.js'
window.router = router
import { config } from './core/config/config.js'
import { reportCatalogAudit } from './core/catalogAudit.js'
import { renderCatalogDiagnosticsView } from './core/catalogDiagnosticsView.js'
import { governanceMatrixRoute } from './core/portalModuleMatrix.js'
import { renderPortalModuleMatrixView } from './core/portalModuleMatrixView.js'
import { abrirModalConmutadorPortales } from './portales/_shared/portalHubModal.js'

// Módulos
import { registerRoutesAuth } from './modules/auth/index.js'
import { useAuth } from './modules/auth/hooks/useAuth.js'
import { registerRoutesMaestros } from './modules/maestros/index.js'
import { registerRoutesProgramas } from './modules/programas/index.js'
import { registerRoutesAlumnos } from './modules/alumnos/index.js'
import { registerRoutesSalones } from './modules/salones/index.js'
import { registerRoutesClases } from './modules/clases/index.js'
import { registerRoutesAsistencias } from './modules/asistencias/index.js'
import { registerRoutesPlanificacion } from './modules/planificacion/index.js'
import { registerRoutesProgresos } from './modules/progresos/index.js'
import { registerRoutesObservaciones } from './modules/observaciones/index.js'
import { registerRoutesMetricas } from './modules/metricas/index.js'
import { registerRoutesConfig } from './modules/config/index.js'
import { registerRoutesAcademicAdmin } from './modules/academic-admin/academic-admin.router.js'
import { registerRoutesAdminDashboard } from './modules/admin-dashboard/admin-dashboard.router.js'
import { registerRoutesPermisos } from './modules/permisos/index.js'
import { registerRoutesPedagogico } from './modules/pedagogico/index.js'
import { registerRoutesHorarioBuilder } from './modules/horario-builder/index.js'
import { registerRoutesHorarioGeneral } from './modules/horario-general/index.js'
import { registerRoutesAdminNotificaciones } from './modules/admin-notificaciones/index.js'
import { registerRoutesAdminAprobacion } from './modules/admin-aprobacion/index.js'
import { registerRoutesAdminUsuarios } from './modules/admin-usuarios/index.js'
import { registerRoutesBitacora } from './modules/bitacora/index.js'
import { registerRoutesFinanzas } from './modules/finanzas/index.js'
import { registerRoutesLuteria } from './modules/luteria/index.js'
import { registerRoutesInventario } from './modules/inventario/index.js'
import { registerRoutesHelp } from './modules/help/index.js'
import { registerRoutesPeriodos } from './modules/periodos/index.js'
import { registerRoutesComunicaciones } from './modules/comunicaciones/index.js'
import { registerRoutesDepartamentos } from './modules/departamentos/index.js'
import { registerRoutesCampanias } from './modules/campanias/index.js'
import { registerRoutesGatewayConfig } from './modules/gateway-config/index.js'
import { registerRoutesSimulador } from './modules/simulador/index.js'
import { renderScoreDirectorView } from './modules/hermes/views/scoreDirectorView.js'
import { renderTareasView } from './modules/hermes/views/tareasView.js'
import { renderEventoTrackingView } from './modules/hermes/views/eventoTrackingView.js'
import { renderAlianzasView } from './modules/alianzas/views/alianzasView.js'
import { renderCasoDetalleView } from './modules/hermes/views/casoDetalleView.js'
import { renderProcedimientosView } from './modules/hermes/views/procedimientosView.js'
import { renderHermesConsultaView } from './modules/hermes/views/hermesConsultaView.js'
import { renderPulsoView } from './modules/hermes/views/pulsoView.js'
import { renderRulesView } from './modules/hermes/views/rulesView.js'
import { renderHermesConcertOrchestratorView } from './modules/hermes/views/hermesConcertOrchestratorView.js'
import { renderKanbanBridgeView } from './modules/hermes/views/kanbanBridgeView.js'

import {
  startAdminRealtimeNotifications,
  stopAdminRealtimeNotifications,
} from './modules/admin-notificaciones/realtimeService.js'

// ============================================================================
// MÓDULOS REGISTRY - Define todos los módulos de la aplicación
// ============================================================================
const MODULES_REGISTRY = [
  {
    id: 'periodos',
    label: 'Períodos Académicos',
    icon: 'bi-calendar-event',
    description: 'Gestión y auditoría de períodos y cierres semestrales',
    enabled: true,
    register: registerRoutesPeriodos,
  },
  {
    id: 'programas',
    label: 'Programas',
    icon: 'bi-book',
    description: 'Gestión de programas académicos',
    enabled: true,
    register: registerRoutesProgramas,
  },
  {
    id: 'academic-admin',
    label: 'Gestión Curricular',
    icon: 'bi-diagram-3',
    description: 'Gestión de mapa curricular y recursos',
    enabled: true,
    register: registerRoutesAcademicAdmin,
  },
  {
    id: 'admin-dashboard',
    label: 'Dashboard Administrativo',
    icon: 'bi-speedometer2',
    description: 'Panel de control, reportes y analítica de maestros',
    enabled: true,
    register: registerRoutesAdminDashboard,
  },
  {
    id: 'admin-notificaciones',
    label: 'Centro de Actividad',
    icon: 'bi-bell',
    description: 'Alertas tempranas de riesgo y sustituciones sugeridas',
    enabled: true,
    register: registerRoutesAdminNotificaciones,
  },
  {
    id: 'admin-aprobacion',
    label: 'Aprobación de Maestros',
    icon: 'bi-person-check',
    description: 'Aprobación de maestros y gestión de ausencias',
    enabled: true,
    register: registerRoutesAdminAprobacion,
  },
  {
    id: 'gestion-usuarios',
    label: 'Gestión de Usuarios',
    icon: 'bi-person-gear',
    description: 'Creación de administradores y maestros',
    enabled: true,
    register: registerRoutesAdminUsuarios,
  },
  {
    id: 'maestros',
    label: 'Maestros',
    icon: 'bi-person-check',
    description: 'Gestión de maestros/docentes',
    enabled: true,
    register: registerRoutesMaestros,
  },
  {
    id: 'alumnos',
    label: 'Alumnos',
    icon: 'bi-people',
    description: 'Gestión de estudiantes',
    enabled: true,
    register: registerRoutesAlumnos,
  },
  {
    id: 'salones',
    label: 'Salones',
    icon: 'bi-door-open',
    description: 'Gestión de espacios de clase',
    enabled: true,
    register: registerRoutesSalones,
  },
  {
    id: 'clases',
    label: 'Clases',
    icon: 'bi-easel',
    description: 'Gestión de clases y horarios',
    enabled: true,
    register: registerRoutesClases,
  },
  {
    id: 'horario-builder',
    label: 'Constructor de Horarios',
    icon: 'bi-calendar-range',
    description: 'Motor de asignación y optimización de horarios',
    enabled: true,
    register: registerRoutesHorarioBuilder,
  },
  {
    id: 'horario-general',
    label: 'Horario General',
    icon: 'bi-calendar3-week',
    description: 'Vista y diagnóstico del horario semanal de todas las clases activas',
    enabled: true,
    register: registerRoutesHorarioGeneral,
  },
  {
    id: 'asistencias',
    label: 'Asistencias',
    icon: 'bi-calendar-check',
    description: 'Control de asistencia',
    enabled: true,
    register: registerRoutesAsistencias,
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    icon: 'bi-journal-text',
    description: 'Planificación pedagógica',
    enabled: true,
    register: registerRoutesPlanificacion,
  },
  {
    id: 'bitacora-clase',
    label: 'Bitácora',
    icon: 'bi-journal-check',
    description: 'Bitácora de contenidos por clase',
    enabled: true,
    register: registerRoutesBitacora,
  },
  {
    id: 'bitacora-suplentes',
    label: 'Auditoría Suplentes',
    icon: 'bi-clipboard2-data',
    description: 'Seguimiento de actividad de suplentes',
    enabled: true,
    register: registerRoutesBitacora,
  },
  {
    id: 'progresos',
    label: 'Progresos',
    icon: 'bi-graph-up',
    description: 'Calificaciones y progreso',
    enabled: true,
    register: registerRoutesProgresos,
  },
  {
    id: 'observaciones',
    label: 'Observaciones',
    icon: 'bi-chat-quote',
    description: 'Anotaciones disciplinarias',
    enabled: true,
    register: registerRoutesObservaciones,
  },
  {
    id: 'metricas',
    label: 'Métricas',
    icon: 'bi-bar-chart-line',
    description: 'KPIs, alertas y análisis institucional',
    enabled: true,
    register: registerRoutesMetricas,
  },
  {
    id: 'permisos',
    label: 'Permisos',
    icon: 'bi-shield-lock',
    description: 'Permisos y roles de maestros',
    enabled: true,
    register: registerRoutesPermisos,
  },
  {
    id: 'pedagogico',
    label: 'Pedagógico',
    icon: 'bi-journal-check',
    description: 'Dashboard, seguimiento y reportes pedagógicos',
    enabled: true,
    register: registerRoutesPedagogico,
  },
  {
    id: 'config',
    label: 'Configuración',
    icon: 'bi-gear',
    description: 'Configuración del sistema',
    enabled: true,
    register: registerRoutesConfig,
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: 'bi-bank',
    description: 'Balances de alumnos y registro de pagos',
    enabled: true,
    register: registerRoutesFinanzas,
  },
  {
    id: 'luteria',
    label: 'Lutería',
    icon: 'bi-tools',
    description: 'Diagnósticos y órdenes de reparación',
    enabled: true,
    register: registerRoutesLuteria,
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: 'bi-box-seam',
    description: 'Control de stock y comodatos de instrumentos',
    enabled: true,
    register: registerRoutesInventario,
  },
  {
    id: 'campanias',
    label: 'Períodos y Campañas',
    icon: 'bi-megaphone',
    description: 'Gestión de períodos y campañas institucionales',
    enabled: true,
    register: registerRoutesCampanias,
  },
  {
    id: 'gateway-config',
    label: 'Gateway WhatsApp',
    icon: 'bi-chat-dots',
    description: 'Configuración y estado del gateway WhatsApp',
    enabled: true,
    register: registerRoutesGatewayConfig,
  },
  {
    id: 'comunicaciones',
    label: 'Comunicaciones',
    icon: 'bi-broadcast',
    description: 'Bandeja de difusión y seguimiento de comunicaciones',
    enabled: true,
    register: registerRoutesComunicaciones,
  },
  {
    id: 'departamentos',
    label: 'Correos Departamentos',
    icon: 'bi-envelope-at',
    description: 'Directorio y configuración de correos departamentales',
    enabled: true,
    register: registerRoutesDepartamentos,
  },
  {
    id: 'simulador',
    label: 'Simulador de Operaciones',
    icon: 'bi-cpu',
    description: 'Simulación de operaciones y pruebas de carga',
    enabled: true,
    register: registerRoutesSimulador,
  },
]

// ============================================================================
// INICIALIZAR TEMA
// ============================================================================
function initializeTheme() {
  const savedTheme = localStorage.getItem('app-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark)

  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light')
  return isDark
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-bs-theme')
  const newTheme = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-bs-theme', newTheme)
  localStorage.setItem('app-theme', newTheme)
}

// ============================================================================
// GRUPOS DE NAVEGACIÓN
// ============================================================================
const NAV_GROUPS = [
  {
    id: 'direccion',
    label: 'Dirección & Hermes',
    icon: 'bi-bullseye',
    items: [
      { id: 'dir-score', label: 'Score del Director', icon: 'bi-bullseye' },
      { id: 'hermes-tareas', label: 'Tablero Kanban & Tareas', icon: 'bi-kanban-fill' },
      { id: 'hermes-procedimientos', label: 'Procedimientos Institucionales', icon: 'bi-diagram-3' },
      { id: 'hermes-consulta', label: 'Consultar a Hermes', icon: 'bi-robot' },
      { id: 'hermes-reglas', label: 'Reglas Reactivas', icon: 'bi-sliders' },
      { id: 'hermes-evento', label: 'Seguimiento de Evento', icon: 'bi-calendar3-event' },
      { id: 'dir-alianzas', label: 'Panel de Alianzas', icon: 'bi-handshake' },
    ],
  },
  {
    id: 'personas',
    label: 'Comunidad & Personas',
    icon: 'bi-people',
    items: [
      { id: 'alumnos', label: 'Alumnos', icon: 'bi-people' },
      { id: 'maestros', label: 'Maestros', icon: 'bi-person-check' },
      { id: 'postulados', label: 'Postulados & Admisión', icon: 'bi-person-plus-fill' },
      { id: 'postulados-calendario', label: 'Calendario Citas', icon: 'bi-calendar-event' },
    ],
  },
  {
    id: 'academico',
    label: 'Gestión Académica',
    icon: 'bi-easel',
    items: [
      { id: 'clases-hoy', label: 'Clases de Hoy', icon: 'bi-calendar-day' },
      { id: 'clases', label: 'Gestión de Clases', icon: 'bi-easel2' },
      { id: 'salones', label: 'Salones & Espacios', icon: 'bi-door-open' },
      { id: 'programas', label: 'Programas Curriculares', icon: 'bi-book' },
      { id: 'horario-general', label: 'Horario General', icon: 'bi-calendar3-week' },
      { id: 'horario-builder', label: 'Constructor de Horarios', icon: 'bi-calendar-range' },
    ],
  },
  {
    id: 'pedagogico',
    label: 'Pedagogía & Planes',
    icon: 'bi-journal-check',
    items: [
      { id: 'pedagogico-dashboard', label: 'Dashboard Pedagógico', icon: 'bi-grid-1x2' },
      { id: 'planificacion', label: 'Planificación Curricular', icon: 'bi-journal-text' },
      { id: 'bitacora-clase', label: 'Bitácora de Clases', icon: 'bi-journal-check' },
      { id: 'bitacora-suplentes', label: 'Auditoría Suplentes', icon: 'bi-clipboard2-data' },
      { id: 'planificacion-cobertura', label: 'Cobertura Curricular', icon: 'bi-grid-3x3-gap' },
      { id: 'planificacion-ruta', label: 'Ruta Académica', icon: 'bi-diagram-3' },
      { id: 'pedagogico-seguimiento', label: 'Seguimiento & Evaluaciones', icon: 'bi-person-lines-fill' },
    ],
  },
  {
    id: 'operacion',
    label: 'Períodos & Métricas',
    icon: 'bi-clipboard-data',
    items: [
      { id: 'periodos', label: 'Períodos Académicos', icon: 'bi-calendar-event' },
      { id: 'asistencias', label: 'Resumen Asistencias', icon: 'bi-calendar-check' },
      { id: 'admin-dashboard', label: 'Cumplimiento Maestros', icon: 'bi-clipboard-check' },
      { id: 'admin-ausencias', label: 'Gestión Ausencias', icon: 'bi-calendar-x' },
      { id: 'metricas', label: 'Dashboard Métricas', icon: 'bi-bar-chart-line' },
      { id: 'admin-dashboard-reportes', label: 'Reportes Director', icon: 'bi-file-earmark-pdf' },
      { id: 'reporte-cierre', label: 'Informe de Cierre', icon: 'bi-file-earmark-bar-graph' },
    ],
  },
  {
    id: 'servicios',
    label: 'Finanzas & Logística',
    icon: 'bi-bank',
    items: [
      { id: 'finanzas-balance', label: 'Balances de Alumnos', icon: 'bi-wallet2' },
      { id: 'finanzas-registro', label: 'Registro de Pagos', icon: 'bi-cash-coin' },
      { id: 'inventario-stock', label: 'Stock Instrumentos', icon: 'bi-box-seam' },
      { id: 'inventario-comodatos', label: 'Comodatos & Préstamos', icon: 'bi-file-earmark-text' },
      { id: 'luteria-ordenes', label: 'Órdenes de Lutería', icon: 'bi-wrench' },
      { id: 'comunicaciones', label: 'Bandeja Comunicaciones', icon: 'bi-broadcast' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema & Configuración',
    icon: 'bi-gear',
    items: [
      { id: 'admin-notificaciones', label: 'Centro de Actividad', icon: 'bi-bell' },
      { id: 'admin-aprobacion', label: 'Aprobaciones', icon: 'bi-person-check' },
      { id: 'gestion-usuarios', label: 'Gestión de Usuarios', icon: 'bi-person-gear' },
      { id: 'permisos', label: 'Permisos & Roles', icon: 'bi-shield-lock' },
      { id: 'departamentos', label: 'Correos Departamentos', icon: 'bi-envelope-at' },
      { id: 'gateway-config', label: 'Gateway WhatsApp', icon: 'bi-chat-dots' },
      { id: 'configuracion', label: 'Configuración General', icon: 'bi-sliders' },
      { id: 'diagnostico-catalogo', label: 'Diagnóstico Portales', icon: 'bi-activity' },
      { id: governanceMatrixRoute.routeId, label: governanceMatrixRoute.label, icon: governanceMatrixRoute.icon },
      { id: 'importar-datos', label: 'Importar Datos', icon: 'bi-cloud-upload' },
      { id: 'exportar-datos', label: 'Exportar Datos', icon: 'bi-file-earmark-arrow-down' },
      { id: 'audiciones', label: 'Audiciones', icon: 'bi-music-note-beamed' },
    ],
  },
]

function _getGroupForRoute(route) {
  for (const g of NAV_GROUPS) {
    if (g.items.some((i) => i.id === route)) return g.id
  }
  return NAV_GROUPS[0].id
}

// ============================================================================
// RENDERIZAR SIDEBAR CON AUTH
// ============================================================================
let _navAbortController = null

/**
 * Update the pending-count badge on the "Centro de Actividad" nav button.
 * Called by the Realtime service whenever counts change.
 * @param {number} count
 */
function _updateNotifBadge(count) {
  const badge = document.getElementById('sidebar-notif-badge')
  if (!badge) return
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count)
    badge.style.display = 'inline-flex'
  } else {
    badge.style.display = 'none'
  }
}

function renderNavbar(_container, isAuthenticated = false) {
  // Limpiar instancias previas (DOM + todos los listeners globales de una vez)
  _navAbortController?.abort()
  _navAbortController = new AbortController()
  const { signal } = _navAbortController

  document.querySelector('.app-sidebar')?.remove()
  document.querySelector('.app-mobile-header')?.remove()
  document.querySelector('.app-bottom-nav')?.remove()
  document.querySelector('.mobile-sub-sheet')?.remove()
  document.querySelector('.mobile-sheet-backdrop')?.remove()

  if (!isAuthenticated) return

  const auth = useAuth.getUser()
  const userDisplay = auth ? auth.email || auth.full_name || 'Usuario' : ''
  const currentRoute = localStorage.getItem('current-view') || 'clases-hoy'
  const activeGroup = _getGroupForRoute(currentRoute)
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark'
  const isDemo = config.isDemoMode

  // 1. Barra Superior Móvil (Header)
  const mobileHeader = document.createElement('header')
  mobileHeader.className = 'app-mobile-header'
  mobileHeader.innerHTML = `
    <div class="mobile-header-brand" id="mobileHeaderBrand" title="SOI · Sistema Académico">
      <div class="mobile-header-icon"><i class="bi bi-mortarboard-fill"></i></div>
      <span class="mobile-header-title">SOI · Principal</span>
      ${isDemo ? '<span class="badge bg-warning text-dark ms-1.5" style="font-size: 0.6rem;">DEMO</span>' : ''}
    </div>
    <div class="mobile-header-actions">
      <button class="mobile-header-btn" id="mobileBtnHub" title="Hub de Portales Departamentales">
        <i class="bi bi-grid-3x3-gap"></i>
      </button>
      <button class="mobile-header-btn" id="mobileBtnTheme" title="Cambiar tema">
        <i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}"></i>
      </button>
      <button class="mobile-header-btn danger" id="mobileBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `

  // 2. Sidebar Desktop
  const sidebar = document.createElement('aside')
  sidebar.className = 'app-sidebar'
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
      <span class="sidebar-brand-text">SOI</span>
      <button class="btn btn-sm btn-outline-light rounded-pill ms-auto me-1 py-0 px-2" id="sidebarBtnHub" title="Hub de Portales Departamentales"><i class="bi bi-grid-3x3-gap"></i></button>
      ${isDemo ? '<span class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem;">DEMO</span>' : ''}
    </div>
    <nav class="sidebar-nav">
      ${NAV_GROUPS.map(
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
              <button class="nav-item-btn ${item.id === currentRoute ? 'active' : ''}" data-route="${item.id}" data-href="${item.href || ''}">
                <i class="bi ${item.icon}"></i>
                <span>${item.label}</span>
                ${item.badge ? `<span class="${item.badgeClass || 'badge bg-success-subtle text-success border border-success-subtle'} ms-auto" style="font-size:0.68rem; padding: 0.2rem 0.45rem;">${item.badge}</span>` : ''}
                ${item.id === 'admin-notificaciones' ? '<span class="notif-badge" id="sidebar-notif-badge" style="display:none"></span>' : ''}
              </button>
            `,
              )
              .join('')}
          </div>
        </div>
      `,
      ).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="bi bi-person-circle"></i>
        <span class="sidebar-user-name" title="${userDisplay}">${userDisplay.split('@')[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnHelp" title="Centro de Ayuda">
        <i class="bi bi-question-circle"></i>
      </button>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `

  // 3. Bottom nav (mobile)
  const bottomNav = document.createElement('nav')
  bottomNav.className = 'app-bottom-nav'
  bottomNav.innerHTML = NAV_GROUPS.map(
    (g) => `
    <button class="bottom-tab ${g.id === activeGroup ? 'active' : ''}" data-group="${g.id}">
      <i class="bi ${g.icon}"></i>
      <span>${g.label}</span>
    </button>
  `,
  ).join('')

  // 4. Mobile sub-sheet & Backdrop
  const sheetBackdrop = document.createElement('div')
  sheetBackdrop.className = 'mobile-sheet-backdrop'

  const subSheet = document.createElement('div')
  subSheet.className = 'mobile-sub-sheet'
  subSheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header d-flex align-items-center justify-content-between px-3 pt-1 pb-2">
      <div class="sheet-title" id="sheetTitle"></div>
      <button type="button" class="btn-close sheet-close-btn small opacity-75" id="sheetCloseBtn" aria-label="Cerrar"></button>
    </div>
    <div class="sheet-items" id="sheetItems"></div>
  `

  document.body.prepend(sheetBackdrop)
  document.body.prepend(subSheet)
  document.body.prepend(bottomNav)
  document.body.prepend(mobileHeader)
  document.body.prepend(sidebar)

  const closeSheet = () => {
    subSheet.classList.remove('open')
    sheetBackdrop.classList.remove('open')
  }

  subSheet.querySelector('#sheetCloseBtn')?.addEventListener('click', closeSheet)
  sheetBackdrop.addEventListener('click', closeSheet, { signal })

  // ── Eventos sidebar ───────────────────────────────────────
  sidebar.querySelectorAll('.nav-group-header').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.nav-group')
      const wasExpanded = group.classList.contains('expanded')
      sidebar.querySelectorAll('.nav-group').forEach((g) => g.classList.remove('expanded'))
      if (!wasExpanded) group.classList.add('expanded')
    })
  })

  sidebar.querySelectorAll('.nav-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.href) {
        window.location.href = btn.dataset.href
      } else if (btn.dataset.route === 'audiciones') {
        window.location.href = '/audiciones'
      } else {
        router.navigate(btn.dataset.route)
      }
    })
  })

  sidebar.querySelector('#sidebarBtnHub')?.addEventListener('click', (e) => {
    e.stopPropagation()
    abrirModalConmutadorPortales()
  })

  sidebar.querySelector('#sidebarBtnHelp').addEventListener('click', () => {
    router.navigate('ayuda')
  })

  const updateThemeIcons = () => {
    const isDarkNow = document.documentElement.getAttribute('data-bs-theme') === 'dark'
    sidebar.querySelector('#sidebarBtnTheme i')?.setAttribute('class', isDarkNow ? 'bi bi-sun-fill' : 'bi bi-moon-fill')
    mobileHeader.querySelector('#mobileBtnTheme i')?.setAttribute('class', isDarkNow ? 'bi bi-sun-fill' : 'bi bi-moon-fill')
  }

  sidebar.querySelector('#sidebarBtnTheme')?.addEventListener('click', () => {
    toggleTheme()
    updateThemeIcons()
  }, { signal })

  sidebar.querySelector('#sidebarBtnLogout')?.addEventListener('click', async () => {
    await useAuth.logout()
    router.navigate('login')
  }, { signal })

  // Eventos de la Barra Superior Móvil (Header)
  mobileHeader.querySelector('#mobileHeaderBrand')?.addEventListener('click', () => {
    router.navigate('clases-hoy')
  }, { signal })

  mobileHeader.querySelector('#mobileBtnHub')?.addEventListener('click', (e) => {
    e.stopPropagation()
    abrirModalConmutadorPortales()
  }, { signal })

  mobileHeader.querySelector('#mobileBtnTheme')?.addEventListener('click', () => {
    toggleTheme()
    updateThemeIcons()
  }, { signal })

  mobileHeader.querySelector('#mobileBtnLogout')?.addEventListener('click', async () => {
    await useAuth.logout()
    router.navigate('login')
  }, { signal })

  // ── Eventos bottom nav ────────────────────────────────────
  function openSheet(groupId) {
    const group = NAV_GROUPS.find((g) => g.id === groupId)
    if (!group) return
    const route = localStorage.getItem('current-view') || ''
    document.getElementById('sheetTitle').textContent = group.label.toUpperCase()
    document.getElementById('sheetItems').innerHTML = group.items
      .map(
        (item) => `
      <button class="sheet-item ${item.id === route ? 'active' : ''}" data-route="${item.id}" data-href="${item.href || ''}">
        <span class="sheet-item-icon"><i class="bi ${item.icon}"></i></span>
        <span class="sheet-item-text">${item.label}</span>
        ${item.badge ? `<span class="${item.badgeClass || 'badge bg-success-subtle text-success border border-success-subtle'} ms-auto" style="font-size:0.68rem; padding: 0.2rem 0.45rem;">${item.badge}</span>` : ''}
      </button>
    `,
      )
      .join('')
    subSheet.dataset.group = groupId
    subSheet.classList.add('open')
    sheetBackdrop.classList.add('open')

    subSheet.querySelectorAll('.sheet-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        router.navigate(btn.dataset.route)
        closeSheet()
      })
    })
  }

  bottomNav.querySelectorAll('.bottom-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const groupId = tab.dataset.group
      if (subSheet.classList.contains('open') && subSheet.dataset.group === groupId) {
        closeSheet()
      } else {
        openSheet(groupId)
        bottomNav
          .querySelectorAll('.bottom-tab')
          .forEach((t) => t.classList.toggle('active', t.dataset.group === groupId))
      }
    })
  })

  // Cerrar sub-sheet al tocar fuera
  document.addEventListener(
    'click',
    (e) => {
      if (
        subSheet.classList.contains('open') &&
        !subSheet.contains(e.target) &&
        !bottomNav.contains(e.target)
      ) {
        closeSheet()
      }
    },
    { signal },
  )


  // ── Sincronizar estado activo en route change ─────────────
  window.addEventListener(
    'routeChanged',
    (e) => {
      const route = e.detail
      const group = _getGroupForRoute(route)

      sidebar
        .querySelectorAll('.nav-item-btn')
        .forEach((btn) => btn.classList.toggle('active', btn.dataset.route === route))
      sidebar.querySelectorAll('.nav-group').forEach((g) => {
        if (g.dataset.group === group) g.classList.add('expanded')
        else g.classList.remove('expanded')
      })
      bottomNav
        .querySelectorAll('.bottom-tab')
        .forEach((tab) => tab.classList.toggle('active', tab.dataset.group === group))
    },
    { signal },
  )
}

// ============================================================================
// REGISTRAR MÓDULOS
// ============================================================================
function registerModules() {
  // Registrar auth routes primero
  try {
    registerRoutesAuth()
  } catch (error) {
    console.error('Error registering auth routes:', error)
  }

  const enabledModules = MODULES_REGISTRY.filter((m) => m.enabled && m.register)
  enabledModules.forEach((module) => {
    try {
      module.register()
    } catch (error) {
      console.error(`Error registering module ${module.id}:`, error)
    }
  })

  // Score del Director (DIR) y Rutas Hermes
  try {
    router.register('dir-score', (mount) => renderScoreDirectorView(mount))
    router.register('hermes-tareas', (mount, params = {}) =>
      renderTareasView(mount, { hideCalendarBtn: true, ...params }),
    )
    router.register('hermes-evento', (mount, params = {}) =>
      renderEventoTrackingView(mount, { ...params }),
    )
    router.register('dir-alianzas', (mount) => renderAlianzasView(mount))
    router.register('hermes-caso', (mount, params = {}) =>
      renderCasoDetalleView(mount, params),
    )
    router.register('hermes-procedimientos', (mount) =>
      renderProcedimientosView(mount),
    )
    router.register('hermes-consulta', (mount) =>
      renderHermesConsultaView(mount),
    )
    router.register('hermes-pulso', (mount) =>
      renderPulsoView(mount),
    )
    router.register('hermes-reglas', (mount) =>
      renderRulesView(mount),
    )
    router.register('hermes-conciertos', (mount) =>
      renderHermesConcertOrchestratorView(mount),
    )
    router.register('hermes-orquestador', (mount) =>
      renderHermesConcertOrchestratorView(mount),
    )
    router.register('hermes-kanban', (mount) => renderKanbanBridgeView(mount))

  } catch (error) {
    console.error('Error registering hermes routes:', error)
  }

  // Centro de Ayuda
  try {
    registerRoutesHelp()
    router.register('diagnostico-catalogo', renderCatalogDiagnosticsView)
    router.register(governanceMatrixRoute.routeId, renderPortalModuleMatrixView)
  } catch (error) {
    console.error('Error registering help routes:', error)
  }

  // Centro de Actividad se registra dinámicamente desde MODULES_REGISTRY
}

// ============================================================================
// APLICACIÓN PRINCIPAL
// ============================================================================
async function startApp() {
  const app = document.querySelector('#app')

  if (!app) {
    console.error('El contenedor #app no existe en el HTML')
    return
  }

  // 1. Inicializar tema
  initializeTheme()

  // 2. Registrar todos los módulos y rutas
  registerModules()

  // 2b. Activar escucha de eventos de navegación inter-módulo
  router.initCustomEvents()
  reportCatalogAudit({
    portalId: 'admin',
    defaultRoute: 'clases-hoy',
    navGroups: NAV_GROUPS,
    registeredRoutes: Object.keys(router.routes),
  })

  // 3. Sincronizar sesión con Supabase antes de cualquier otra cosa (CRÍTICO para evitar 404)
  console.log('🔄 Sincronizando sesión...')
  await useAuth.refreshAuth()

  // 4. Configurar guard de rutas (solo admin)
  const authRoutes = ['login', 'register']
  router.setAuthGuard(() => {
    if (!useAuth.isAuthenticated()) return false
    const { user } = useAuth.getState()
    return user?.user_metadata?.rol === 'admin' || user?.app_metadata?.rol === 'admin'
  }, authRoutes)

  // 5. Verificar autenticación Y rol
  const currentRoute = localStorage.getItem('current-view') || 'clases-hoy'
  let isAuthenticated = useAuth.isAuthenticated()

  if (isAuthenticated) {
    const { user } = useAuth.getState()
    const rol = user?.user_metadata?.rol || user?.app_metadata?.rol
    if (rol !== 'admin') {
      await useAuth.logout()
      isAuthenticated = false
    }
  }

  const dismissSplashScreen = () => {
    const splash = document.querySelector('.pm-loading-splash, #pm-loading-splash, .admin-loader-container')
    if (!splash) return
    splash.style.transition = 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    splash.style.opacity = '0'
    splash.style.transform = 'scale(0.98)'
    splash.style.pointerEvents = 'none'
    setTimeout(() => splash.remove(), 400)
  }

  // 5. Lógica de enrutamiento inicial
  if (!isAuthenticated && !authRoutes.includes(currentRoute)) {
    // Redirigir a login si intenta acceder a ruta protegida
    localStorage.setItem('current-view', 'login')
    router.navigate('login')
  } else if (isAuthenticated && authRoutes.includes(currentRoute)) {
    // Tras login, el admin aterriza en el Score del Director (vista DIR)
    localStorage.setItem('current-view', 'clases-hoy')
    renderNavbar(app, true)
    router.navigate('clases-hoy')
  } else {
    // Navegación normal
    if (isAuthenticated) {
      renderNavbar(app, true)
    }
    router.init('clases-hoy')
  }
  dismissSplashScreen()

  // 6. Suscribir a cambios de auth globalmente
  useAuth.subscribe((state) => {
    if (state.user) {
      renderNavbar(app, true)
      startAdminRealtimeNotifications(_updateNotifBadge)
    } else {
      stopAdminRealtimeNotifications()
      app.innerHTML = ''
      const nav = document.querySelector('.app-navbar')
      if (nav) nav.remove()

      // Cleanup DOM elements specific to admin view
      document.querySelector('.app-sidebar')?.remove()
      document.querySelector('.app-bottom-nav')?.remove()
      document.querySelector('.mobile-sub-sheet')?.remove()

      router.navigate('login')
    }
  })
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp)
} else {
  startApp()
}

// ============================================================================
// PORTAL SWITCH BUTTON VISIBILITY (only on main page)
// ============================================================================
function updatePortalButtonVisibility() {
  const currentRoute = localStorage.getItem('current-view') || 'clases-hoy'
  const teacherBridge = document.querySelector('.teacher-bridge')

  if (!teacherBridge) return

  // Show button only on main page (programas)
  if (currentRoute === 'clases-hoy') {
    teacherBridge.classList.add('visible')
  } else {
    teacherBridge.classList.remove('visible')
  }
}

// Update button visibility on initialization
updatePortalButtonVisibility()

// Update button visibility whenever route changes
window.addEventListener('routeChanged', (e) => {
  updatePortalButtonVisibility()
})

// Reset pm-modo to 'maestro' when returning to the teachers portal
const teacherBridge = document.querySelector('.teacher-bridge')
if (teacherBridge) {
  teacherBridge.addEventListener('click', () => {
    localStorage.setItem('pm-modo', 'maestro')
  })
}

// ============================================================================
// EXPORTAR PARA TESTING
// ============================================================================
export { MODULES_REGISTRY, router, config }
