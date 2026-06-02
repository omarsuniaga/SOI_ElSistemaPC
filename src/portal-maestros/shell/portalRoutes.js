/**
 * portalRoutes.js
 * Responsabilidad: Registrar todas las rutas del router SPA y
 * gestionar los contenedores de vistas persistentes.
 */

// ── Vistas de maestro ──────────────────────────────────────────
import { renderLoginView } from '../views/loginView.js'
import { renderRegisterView } from '../views/registerView.js'
import { renderPendingApprovalView } from '../views/pendingApprovalView.js'
import { renderHoyView } from '../views/hoyView.js'
import { renderCalendarioView } from '../views/calendarioView.js'
import { renderMetricasView } from '../views/metricasView.js'
import { renderAsistenciaView } from '../views/asistenciaView.js'
import { renderClaseEmergenteView } from '../views/claseEmergenteView.js'
import { renderPerfilView } from '../views/perfilView.js'
import { renderPlanificacionView } from '../views/planificacionView.js'
import { renderAlumnoPerfilView } from '../views/alumnoPerfilView.js'
import { renderGamificacionView } from '../views/gamificacionView.js'
import { renderRutaGameificadaView } from '../views/rutaGameificadaView.js'
import { renderCrearClaseView } from '../views/crearClaseView.js'
import { renderAcademicPlanBuilderView } from '../views/academicPlanBuilderView.js'
import { renderWeeklyPlanView } from '../views/weeklyPlanView.js'
import { RouteLibraryView } from '../views/routeLibraryView.js'
import { RouteDetailView } from '../views/routeDetailView.js'
import { renderGestionarClasesView } from '../views/gestionarClasesView.js'

// ── Vistas de admin ────────────────────────────────────────────
import { renderAlumnosView } from '../../modules/alumnos/views/alumnosView.js'
import { renderProgramasView } from '../../modules/programas/views/programasView.js'
import { renderMaestrosView } from '../../modules/maestros/views/maestrosView.js'
import { renderDashboardMetricasView as renderAdminMetricasView } from '../../modules/metricas/views/dashboardMetricasView.js'
import { renderAcademicAdminView } from '../../modules/academic-admin/views/academicAdminView.js'
import { renderClasesView } from '../../modules/clases/views/clasesView.js'
import { renderAprobacionView } from '../../modules/admin-aprobacion/views/aprobacionView.js'
import { renderAusenciasAdminView } from '../../modules/admin-aprobacion/views/ausenciasAdminView.js'
import { renderAdminNotificacionesView } from '../../modules/admin-notificaciones/views/adminNotificacionesView.js'

const MAESTRO_VIEWS = [
  'login', 'logout', 'register', 'pending-approval',
  'calendario', 'clases', 'hoy', 'asistencia', 'metricas',
  'perfil', 'clase-emergente', 'planificacion', 'alumno',
  'gamificacion', 'ruta', 'crear-clase', 'ruta-plan-builder',
  'ruta-semanal', 'ruta-libreria', 'ruta-detalle', 'gestionar-clases',
]

const ADMIN_VIEWS = [
  'admin-alumnos', 'admin-programas', 'admin-maestros', 'admin-metricas',
  'admin-config', 'admin-clases', 'admin-sesiones', 'admin-aprobacion',
  'admin-ausencias', 'admin-notificaciones',
]

export const CACHEABLE_VIEWS = new Set([
  'hoy', 'calendario', 'metricas', 'perfil', 'ruta',
  'gamificacion', 'crear-clase', 'planificacion', 'ruta-libreria',
])

export function setupRouterRoutes(router, isAdmin, renderView) {
  const route = (name) => router.on(name, (r, params) => renderView(name, params))

  ;[
    'login', 'logout', 'calendario', 'clases', 'hoy', 'asistencia',
    'metricas', 'perfil', 'clase-emergente', 'planificacion', 'alumno',
    'gamificacion', 'ruta', 'crear-clase', 'ruta-plan-builder',
    'ruta-semanal', 'ruta-libreria', 'gestionar-clases',
    'register', 'pending-approval',
  ].forEach(route)

  router.on('ruta-detalle/:id', (r, params) => renderView('ruta-detalle', params))

  if (isAdmin) {
    ;[
      'admin-alumnos', 'admin-programas', 'admin-maestros', 'admin-metricas',
      'admin-config', 'admin-clases', 'admin-sesiones', 'admin-aprobacion',
      'admin-ausencias', 'admin-notificaciones',
    ].forEach(route)
    router.onNotFound(() => renderView('admin-alumnos'))
  } else {
    router.onNotFound(() => renderView('hoy'))
  }
}

export function initViewContainers(isAdmin) {
  const container = document.getElementById('pm-view-container')
  if (!container) return {}

  container.innerHTML = ''
  const viewContainers = {}
  const allViews = isAdmin ? [...MAESTRO_VIEWS, ...ADMIN_VIEWS] : MAESTRO_VIEWS

  allViews.forEach((viewName) => {
    const el = document.createElement('div')
    el.id = `pm-view-${viewName}`
    el.className = 'pm-view-content'
    el.style.display = 'none'
    container.appendChild(el)
    viewContainers[viewName] = el
  })

  return viewContainers
}

export async function renderViewContent(route, container, params, urlParams, context) {
  const { maestroId, permisos, router, showLoginScreen, cleanupPushService, stopRealtime, logoutMaestro } = context

  switch (route) {
    case 'login':
      renderLoginView(container, { onSuccess: context.onLoginSuccess })
      break
    case 'register':
      renderRegisterView(container, { onSuccess: () => router.navigate('pending-approval') })
      break
    case 'pending-approval':
      renderPendingApprovalView(container, { onBackToLogin: () => router.navigate('login') })
      break
    case 'logout':
      showLoginScreen()
      cleanupPushService()
      stopRealtime()
      logoutMaestro().then(() => window.location.reload())
      break
    case 'calendario':
    case 'clases':
      return await renderCalendarioView(container)
    case 'hoy':
      return await renderHoyView(container, {
        onClaseClick: (id) => router.navigate(`asistencia?clase=${id}`),
      })
    case 'asistencia':
      return await renderAsistenciaView(container, {
        claseId: urlParams.get('clase'),
        fecha: urlParams.get('fecha'),
        sesionId: urlParams.get('sesion'),
      })
    case 'metricas':
      return renderMetricasView(container)
    case 'perfil':
      return renderPerfilView(container)
    case 'clase-emergente':
      return renderClaseEmergenteView(container, { maestroId })
    case 'planificacion':
      return await renderPlanificacionView(container)
    case 'alumno':
      return renderAlumnoPerfilView(container, { alumnoId: urlParams.get('id') || params.id })
    case 'gamificacion':
      await renderGamificacionView(container)
      break
    case 'ruta':
      await renderRutaGameificadaView(container, {
        onTopicSelected: (id) => router.navigate(`asistencia?clase=${id}`),
      })
      break
    case 'crear-clase':
      renderCrearClaseView(container)
      break
    case 'ruta-plan-builder':
      renderAcademicPlanBuilderView(container, { alumnoId: urlParams.get('id') })
      break
    case 'ruta-semanal':
      renderWeeklyPlanView(container, { alumnoId: urlParams.get('id') })
      break
    case 'ruta-libreria':
      RouteLibraryView.render().then((view) => { container.innerHTML = ''; container.appendChild(view) })
      break
    case 'ruta-detalle':
      RouteDetailView.render(params).then((view) => { container.innerHTML = ''; container.appendChild(view) })
      break
    case 'gestionar-clases':
      if (!permisos?.puede_inscribir_clases) { router.navigate('hoy'); return }
      return await renderGestionarClasesView(container)
    // ── Admin ──────────────────────────────────────────────────
    case 'admin-alumnos':
      renderAlumnosView(container); break
    case 'admin-programas':
      renderProgramasView(container); break
    case 'admin-maestros':
      renderMaestrosView(container); break
    case 'admin-metricas':
      renderAdminMetricasView(container); break
    case 'admin-config':
      renderAcademicAdminView(container); break
    case 'admin-clases':
      renderClasesView?.(container); break
    case 'admin-sesiones':
      break
    case 'admin-aprobacion':
      await renderAprobacionView(container); break
    case 'admin-ausencias':
      await renderAusenciasAdminView(container); break
    case 'admin-notificaciones':
      return await renderAdminNotificacionesView(container)
    default:
      break
  }

  return null
}
