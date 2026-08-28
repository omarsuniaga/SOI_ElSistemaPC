export const routeKinds = Object.freeze([
  'primary-visible',
  'internal-detail',
  'workflow',
  'legacy-candidate',
  'auth',
  'external-entry',
])

const freezeRoute = (routeId, kind, source, owner) => Object.freeze({ routeId, kind, source, owner })

const defineModule = (moduleId, { source, owner, routes }) => {
  const routeDescriptors = routes.map(([routeId, kind = 'primary-visible']) =>
    freezeRoute(routeId, kind, source, owner),
  )

  return Object.freeze({
    moduleId,
    source,
    owner,
    routeDescriptors: Object.freeze(routeDescriptors),
    // Compatibility for existing diagnostic consumers. Route descriptors are the
    // authoritative descriptive metadata; this list is deliberately read-only.
    routeIds: Object.freeze(routeDescriptors.map(route => route.routeId)),
    lifecycle: 'legacy-static',
    health: 'unknown',
    help: Object.freeze({ status: 'pending', contentVersion: 0 }),
  })
}

const module = (moduleId, source, owner, routes) => defineModule(moduleId, { source, owner, routes })

/**
 * Read-only route inventory. It never imports or invokes route registrars.
 *
 * The 29 entries that mirror MODULES_REGISTRY contain 91 registrations. A
 * previous 79-route report was an arithmetic undercount of the same sources,
 * not a difference between the registry and portal shells.
 */
export const moduleCatalog = Object.freeze([
  module('periodos', 'src/modules/periodos/periodos.router.js', 'ACM', [
    ['periodos'], ['periodos-academicos', 'legacy-candidate'], ['reporte-cierre'], ['periodo-lectivo'],
  ]),
  module('programas', 'src/modules/programas/programas.router.js', 'ACM', [['programas']]),
  module('academic-admin', 'src/modules/academic-admin/academic-admin.router.js', 'ACM', [
    ['gestion-curricular', 'legacy-candidate'], ['planificacion-curricular', 'legacy-candidate'], ['torre-de-control', 'legacy-candidate'],
  ]),
  module('admin-dashboard', 'src/modules/admin-dashboard/admin-dashboard.router.js', 'DIR', [
    ['admin-dashboard'], ['admin-dashboard-reportes'], ['admin-dashboard-analitca-llenado'], ['admin-maestro-detalle', 'internal-detail'], ['admin-dashboard-tendencias'],
  ]),
  module('proyecto-manager', 'src/modules/admin-dashboard/admin-dashboard.router.js', 'DIR', [
    ['proyecto-manager'],
  ]),
  module('admin-notificaciones', 'src/modules/admin-notificaciones/admin-notificaciones.router.js', 'DIR', [['admin-notificaciones']]),
  module('admin-aprobacion', 'src/modules/admin-aprobacion/admin-aprobacion.router.js', 'DIR', [['admin-aprobacion'], ['admin-ausencias']]),
  module('gestion-usuarios', 'src/modules/admin-usuarios/admin-usuarios.router.js', 'DIR', [['gestion-usuarios']]),
  module('maestros', 'src/modules/maestros/maestros.router.js', 'ADM', [
    ['maestros'], ['clases-hoy'], ['bitacora-suplentes', 'workflow'],
  ]),
  module('alumnos', 'src/modules/alumnos/alumnos.router.js', 'shared', [
    ['alumnos'], ['alumnos-duplicados', 'workflow'], ['alumnos-inactivos'], ['alumnos-reporte-mes', 'workflow'], ['alumnos-inscribir', 'workflow'], ['alumnos-pdf-demo', 'workflow'], ['alumno', 'internal-detail'], ['postulados'], ['postulado', 'internal-detail'], ['postulados-calendario'],
  ]),
  module('salones', 'src/modules/salones/salones.router.js', 'ACM', [['salones']]),
  module('clases', 'src/modules/clases/clases.router.js', 'ACM', [['clases']]),
  module('horario-builder', 'src/modules/horario-builder/horario-builder.router.js', 'ACM', [['horario-builder']]),
  module('asistencias', 'src/modules/asistencias/asistencias.router.js', 'shared', [['asistencias'], ['asistencias-reportes', 'workflow']]),
  module('planificacion', 'src/modules/planificacion/planificacion.router.js', 'ACM', [
    ['planificacion'], ['planificacion-acm', 'workflow'], ['planificacion-maestros'], ['planificacion-disenador', 'workflow'], ['planificacion-ruta'], ['planificacion-cobertura'], ['planificacion-clase', 'workflow'], ['planificacion-print', 'workflow'], ['maestro-propuestas-pendientes', 'workflow'],
  ]),
  module('bitacora-clase', 'src/modules/bitacora/bitacora.router.js', 'ACM', [['bitacora-clase']]),
  module('progresos', 'src/modules/progresos/progresos.router.js', 'ACM', [['progresos']]),
  module('observaciones', 'src/modules/observaciones/observaciones.router.js', 'ACM', [['observaciones']]),
  module('metricas', 'src/modules/metricas/metricas.router.js', 'shared', [
    ['metricas'], ['metricas-alertas', 'internal-detail'], ['metricas-riesgo', 'internal-detail'], ['metricas-maestros', 'internal-detail'], ['metricas-destacados', 'internal-detail'], ['cierre-academico'], ['cierre-academico-historico'], ['metricas-ia-reportes', 'workflow'],
  ]),
  module('permisos', 'src/modules/permisos/permisos.router.js', 'DIR', [
    ['permisos'], ['matriz-permisos-sombra', 'internal-detail'],
  ]),
  module('pedagogico', 'src/modules/pedagogico/pedagogico.router.js', 'ACM', [
    ['pedagogico-dashboard'], ['pedagogico-seguimiento'], ['pedagogico-reportes'], ['pedagogico-solicitudes', 'workflow'], ['pedagogico-seguimiento-institucional', 'internal-detail'], ['pedagogico-caso', 'internal-detail'], ['pedagogico-seguimiento-reglas', 'internal-detail'], ['pedagogico-evaluaciones'],
  ]),
  module('config', 'src/modules/config/index.js', 'DIR', [
    ['configuracion'], ['importar-datos'], ['exportar-datos'], ['documentos-historial', 'workflow'], ['inicio-periodo-seguro'],
  ]),
  module('finanzas', 'src/modules/finanzas/finanzas.router.js', 'DIR', [['finanzas-balance'], ['finanzas-registro']]),
  module('luteria', 'src/modules/luteria/index.js', 'DIR', [['luteria-diagnosticos', 'workflow'], ['luteria-ordenes']]),
  module('inventario', 'src/modules/inventario/inventario.router.js', 'DIR', [
    ['inventario-stock'], ['inventario-comodatos'], ['inventario-alertas', 'workflow'], ['inventario-dashboard', 'workflow'], ['inventario-detalle', 'internal-detail'], ['inventario-historial', 'internal-detail'], ['inventario-reportes', 'workflow'], ['inventario-reparaciones'], ['inventario-reparacion', 'internal-detail'], ['inventario-facturas', 'workflow'], ['inventario-intercambio', 'workflow'],
  ]),
  module('campanias', 'src/modules/campanias/campanias.router.js', 'DIR', [['campanias']]),
  module('gateway-config', 'src/modules/gateway-config/gateway-config.router.js', 'DIR', [['gateway-config']]),
  module('comunicaciones', 'src/modules/comunicaciones/index.js', 'DIR', [['comunicaciones'], ['com-seguimiento'], ['com-calendario']]),
  module('departamentos', 'src/modules/departamentos/index.js', 'DIR', [['departamentos']]),
  module('simulador', 'src/modules/simulador/index.js', 'DIR', [
    ['simulador-sala-trabajo', 'workflow'], ['simulador-panel-control'], ['simulador-calendario', 'workflow'], ['simulador-log', 'workflow'], ['simulador-outbox', 'workflow'],
  ]),
  module('horario-general', 'src/modules/horario-general/horario-general.router.js', 'DIR', [['horario-general']]),

  module('auth', 'src/modules/auth/index.js', 'shared', [
    ['login', 'auth'], ['register', 'auth'], ['perfil', 'auth'], ['pending-approval', 'auth'],
  ]),
  module('hermes-core', 'src/main.js', 'DIR', [
    ['dir-score'], ['hermes-tareas'], ['hermes-caso', 'internal-detail'], ['hermes-procedimientos'], ['hermes-consulta'],
    ['hermes-evento'], ['hermes-pulso'], ['hermes-reglas'], ['hermes-conciertos'], ['hermes-orquestador'], ['dir-alianzas'],
    ['hermes-kanban'],
  ]),
  module('help', 'src/modules/help/index.js', 'shared', [['ayuda', 'workflow']]),
  module('catalog-diagnostics', 'src/main.js', 'DIR', [['diagnostico-catalogo']]),
  // Independent entry point: the admin navigation intentionally leaves the SPA.
  module('audiciones-entry', 'src/portales/audiciones/audiciones.js', 'ACM', [['audiciones', 'external-entry']]),
  // Teacher shell routes are descriptive only. "metricas" and "perfil" are
  // owned above by their shared/auth counterparts because they reuse identities.
  module('teacher-core', 'src/portal-maestros/shell/portalRoutes.js', 'MAESTROS', [
    ['hoy'], ['fechas'], ['calendario'], ['asistencia'],
  ]),
])

export const cataloguedRouteIds = Object.freeze(moduleCatalog.flatMap(moduleDefinition => moduleDefinition.routeIds))
export const routeCatalog = Object.freeze(moduleCatalog.flatMap(moduleDefinition => moduleDefinition.routeDescriptors))
export const externalRouteIds = Object.freeze(routeCatalog
  .filter(route => route.kind === 'external-entry')
  .map(route => route.routeId))

export const findCataloguedRoute = routeId => routeCatalog.find(route => route.routeId === routeId) || null
export const isCataloguedExternalRoute = routeId => externalRouteIds.includes(routeId)

export const MODULE_REGISTRY_ROUTE_COUNT = 91
