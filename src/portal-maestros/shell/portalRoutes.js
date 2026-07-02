/**
 * portalRoutes.js
 * Responsabilidad: Registrar las rutas del portal de maestros y
 * gestionar los contenedores de vistas persistentes.
 *
 * Las vistas se cargan con dynamic import() para que Vite las divida
 * en chunks separados — el bundle inicial solo incluye la vista activa.
 *
 * Este portal es exclusivo para maestros.
 * El panel admin vive en /admin (admin.html).
 */

const VIEW_LOADERS = {
  login:             () => import('../views/loginView.js'),
  register:          () => import('../views/registerView.js'),
  'pending-approval':() => import('../views/pendingApprovalView.js'),
  hoy:               () => import('../views/hoyView.js'),
  fechas:            () => import('../views/calendarioView.js'),
  calendario:        () => import('../views/calendarioView.js'),
  clases:            () => import('../views/calendarioView.js'),
  metricas:          () => import('../views/metricasView.js'),
  asistencia:        () => import('../views/asistenciaView.js'),
  'clase-emergente': () => import('../views/claseEmergenteView.js'),
  perfil:            () => import('../views/perfilView.js'),
  planificacion:     () => import('../views/planificacionView.js'),
  alumno:            () => import('../views/alumnoPerfilView.js'),
  gamificacion:      () => import('../views/gamificacionView.js'),
  ruta:              () => import('../views/rutaGameificadaView.js'),
  'crear-clase':     () => import('../views/crearClaseView.js'),
  'ruta-plan-builder':() => import('../views/academicPlanBuilderView.js'),
  'ruta-semanal':    () => import('../views/weeklyPlanView.js'),
  'ruta-libreria':   () => import('../views/routeLibraryView.js'),
  'ruta-detalle':    () => import('../views/routeDetailView.js'),
  'gestionar-clases':() => import('../views/gestionarClasesView.js'),
  'gestionar-horario':() => import('../views/disponibilidadView.js'),
}

const MAESTRO_VIEWS = Object.keys(VIEW_LOADERS).concat(['logout'])

export const CACHEABLE_VIEWS = new Set([
  'hoy', 'fechas', 'calendario', 'metricas', 'perfil', 'ruta',
  'gamificacion', 'crear-clase', 'planificacion', 'ruta-libreria',
  'gestionar-horario',
])

export function setupRouterRoutes(router, _isAdmin, renderView) {
  const route = (name) => router.on(name, (r, params) => renderView(name, params))

  ;[
    'login', 'logout', 'fechas', 'calendario', 'clases', 'hoy', 'asistencia',
    'metricas', 'perfil', 'clase-emergente', 'planificacion', 'alumno',
    'gamificacion', 'ruta', 'crear-clase', 'ruta-plan-builder',
    'ruta-semanal', 'ruta-libreria', 'gestionar-clases',
    'register', 'pending-approval', 'gestionar-horario',
  ].forEach(route)

  router.on('ruta-detalle/:id', (r, params) => renderView('ruta-detalle', params))
  router.onNotFound(() => renderView('hoy'))
}

export function initViewContainers() {
  const container = document.getElementById('pm-view-container')
  if (!container) return {}

  container.innerHTML = ''
  const viewContainers = {}

  MAESTRO_VIEWS.forEach((viewName) => {
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

  if (route === 'logout') {
    showLoginScreen()
    cleanupPushService()
    stopRealtime()
    logoutMaestro().then(() => window.location.reload())
    return null
  }

  if (route === 'gestionar-clases' && !permisos?.puede_inscribir_clases) {
    router.navigate('hoy')
    return
  }

  const load = VIEW_LOADERS[route]
  if (!load) return null

  const mod = await load()

  switch (route) {
    case 'login':
      mod.renderLoginView(container, { onSuccess: context.onLoginSuccess })
      break
    case 'register':
      mod.renderRegisterView(container, { onSuccess: () => router.navigate('pending-approval') })
      break
    case 'pending-approval':
      mod.renderPendingApprovalView(container, { onBackToLogin: () => router.navigate('login') })
      break
    case 'fechas':
    case 'calendario':
    case 'clases':
      return await mod.renderCalendarioView(container)
    case 'hoy':
      return await mod.renderHoyView(container, {
        onClaseClick: (id) => router.navigate(`asistencia?clase=${id}`),
      })
    case 'asistencia':
      return await mod.renderAsistenciaView(container, {
        claseId: urlParams.get('clase'),
        fecha: urlParams.get('fecha'),
        sesionId: urlParams.get('sesion'),
        router,
      })
    case 'metricas':
      return mod.renderMetricasView(container)
    case 'perfil':
      return mod.renderPerfilView(container)
    case 'clase-emergente':
      return mod.renderClaseEmergenteView(container, { maestroId })
    case 'planificacion':
      return await mod.renderPlanificacionView(container, { maestroId })
    case 'alumno':
      return mod.renderAlumnoPerfilView(container, { alumnoId: urlParams.get('id') || params.id })
    case 'gamificacion':
      await mod.renderGamificacionView(container)
      break
    case 'ruta':
      await mod.renderRutaGameificadaView(container, {
        onTopicSelected: (id) => router.navigate(`asistencia?clase=${id}`),
      })
      break
    case 'crear-clase':
      mod.renderCrearClaseView(container)
      break
    case 'ruta-plan-builder':
      mod.renderAcademicPlanBuilderView(container, { alumnoId: urlParams.get('id') })
      break
    case 'ruta-semanal':
      mod.renderWeeklyPlanView(container, { alumnoId: urlParams.get('id') })
      break
    case 'ruta-libreria':
      mod.RouteLibraryView.render().then((view) => { container.innerHTML = ''; container.appendChild(view) })
      break
    case 'ruta-detalle':
      mod.RouteDetailView.render(params).then((view) => { container.innerHTML = ''; container.appendChild(view) })
      break
    case 'gestionar-clases':
      return await mod.renderGestionarClasesView(container)
    case 'gestionar-horario':
      return await mod.renderDisponibilidadView(container, { maestroId })
  }

  return null
}
