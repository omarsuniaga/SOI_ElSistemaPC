/**
 * portalRoutes.js
 * Responsabilidad: Registrar las rutas del portal de maestros y
 * gestionar los contenedores de vistas persistentes.
 *
 * Este portal es exclusivo para maestros.
 * El panel admin vive en /admin (admin.html).
 */

// Views are lazy-loaded via dynamic import() inside renderViewContent (see below).
// This keeps them out of the main-maestros entry bundle so the login path only
// downloads the view it actually renders. ES module caching makes repeat
// navigations to an already-loaded view instant.

const MAESTRO_VIEWS = [
  'login', 'logout', 'register', 'pending-approval',
  'calendario', 'clases', 'hoy', 'asistencia', 'metricas',
  'perfil', 'clase-emergente', 'planificacion', 'alumno',
  'gamificacion', 'ruta', 'crear-clase', 'ruta-plan-builder',
  'ruta-semanal', 'ruta-libreria', 'ruta-detalle', 'gestionar-clases',
]

export const CACHEABLE_VIEWS = new Set([
  'hoy', 'calendario', 'metricas', 'perfil', 'ruta',
  'gamificacion', 'crear-clase', 'planificacion', 'ruta-libreria',
])

export function setupRouterRoutes(router, _isAdmin, renderView) {
  const route = (name) => router.on(name, (r, params) => renderView(name, params))

  ;[
    'login', 'logout', 'calendario', 'clases', 'hoy', 'asistencia',
    'metricas', 'perfil', 'clase-emergente', 'planificacion', 'alumno',
    'gamificacion', 'ruta', 'crear-clase', 'ruta-plan-builder',
    'ruta-semanal', 'ruta-libreria', 'gestionar-clases',
    'register', 'pending-approval',
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

  switch (route) {
    case 'login': {
      const { renderLoginView } = await import('../views/loginView.js')
      renderLoginView(container, { onSuccess: context.onLoginSuccess })
      break
    }
    case 'register': {
      const { renderRegisterView } = await import('../views/registerView.js')
      renderRegisterView(container, { onSuccess: () => router.navigate('pending-approval') })
      break
    }
    case 'pending-approval': {
      const { renderPendingApprovalView } = await import('../views/pendingApprovalView.js')
      renderPendingApprovalView(container, { onBackToLogin: () => router.navigate('login') })
      break
    }
    case 'logout':
      showLoginScreen()
      cleanupPushService()
      stopRealtime()
      logoutMaestro().then(() => window.location.reload())
      break
    case 'calendario':
    case 'clases': {
      const { renderCalendarioView } = await import('../views/calendarioView.js')
      return await renderCalendarioView(container)
    }
    case 'hoy': {
      const { renderHoyView } = await import('../views/hoyView.js')
      return await renderHoyView(container, {
        onClaseClick: (id) => router.navigate(`asistencia?clase=${id}`),
      })
    }
    case 'asistencia': {
      const { renderAsistenciaView } = await import('../views/asistenciaView.js')
      return await renderAsistenciaView(container, {
        claseId: urlParams.get('clase'),
        fecha: urlParams.get('fecha'),
        sesionId: urlParams.get('sesion'),
        router,
      })
    }
    case 'metricas': {
      const { renderMetricasView } = await import('../views/metricasView.js')
      return renderMetricasView(container)
    }
    case 'perfil': {
      const { renderPerfilView } = await import('../views/perfilView.js')
      return renderPerfilView(container)
    }
    case 'clase-emergente': {
      const { renderClaseEmergenteView } = await import('../views/claseEmergenteView.js')
      return renderClaseEmergenteView(container, { maestroId })
    }
    case 'planificacion': {
      const { renderPlanificacionView } = await import('../views/planificacionView.js')
      return await renderPlanificacionView(container, { maestroId })
    }
    case 'alumno': {
      const { renderAlumnoPerfilView } = await import('../views/alumnoPerfilView.js')
      return renderAlumnoPerfilView(container, { alumnoId: urlParams.get('id') || params.id })
    }
    case 'gamificacion': {
      const { renderGamificacionView } = await import('../views/gamificacionView.js')
      await renderGamificacionView(container)
      break
    }
    case 'ruta': {
      const { renderRutaGameificadaView } = await import('../views/rutaGameificadaView.js')
      await renderRutaGameificadaView(container, {
        onTopicSelected: (id) => router.navigate(`asistencia?clase=${id}`),
      })
      break
    }
    case 'crear-clase': {
      const { renderCrearClaseView } = await import('../views/crearClaseView.js')
      renderCrearClaseView(container)
      break
    }
    case 'ruta-plan-builder': {
      const { renderAcademicPlanBuilderView } = await import('../views/academicPlanBuilderView.js')
      renderAcademicPlanBuilderView(container, { alumnoId: urlParams.get('id') })
      break
    }
    case 'ruta-semanal': {
      const { renderWeeklyPlanView } = await import('../views/weeklyPlanView.js')
      renderWeeklyPlanView(container, { alumnoId: urlParams.get('id') })
      break
    }
    case 'ruta-libreria': {
      const { RouteLibraryView } = await import('../views/routeLibraryView.js')
      RouteLibraryView.render().then((view) => { container.innerHTML = ''; container.appendChild(view) })
      break
    }
    case 'ruta-detalle': {
      const { RouteDetailView } = await import('../views/routeDetailView.js')
      RouteDetailView.render(params).then((view) => { container.innerHTML = ''; container.appendChild(view) })
      break
    }
    case 'gestionar-clases': {
      if (!permisos?.puede_inscribir_clases) { router.navigate('hoy'); return }
      const { renderGestionarClasesView } = await import('../views/gestionarClasesView.js')
      return await renderGestionarClasesView(container)
    }
    default:
      break
  }

  return null
}
