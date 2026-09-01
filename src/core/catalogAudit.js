import { cataloguedRouteIds, externalRouteIds, moduleCatalog, routeCatalog } from './moduleCatalog.js'
import { findPortal, portalCatalog } from './portalCatalog.js'

export const CATALOG_VERSION = 2
const auditStore = new Map()

const duplicates = values => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]
const unique = values => [...new Set(values)]
const isExternalNavItem = item => Boolean(
  item?.external || item?.kind === 'external-entry' || item?.href || externalRouteIds.includes(item?.id),
)
const hasIssues = ([key, value]) => (
  !['catalogVersion', 'portalId', 'issueCount', 'validExternalNavRoutes', 'legacyCandidateRoutes', 'orphanCandidateRoutes'].includes(key)
  && (value === true || (Array.isArray(value) && value.length > 0))
)

export function auditCatalog({ portalId, defaultRoute, navGroups = [], registeredRoutes = [] }) {
  const portal = findPortal(portalId)
  const navItems = navGroups.flatMap(group => group.items || []).filter(item => item?.id)
  const navRoutes = navItems.map(item => item.id)
  const registered = new Set(registeredRoutes)
  const knownRoutes = new Set(cataloguedRouteIds)
  const externalNavRoutes = unique(navItems.filter(isExternalNavItem).map(item => item.id))
  const validExternalNavRoutes = externalNavRoutes.filter(route => externalRouteIds.includes(route))
  const uncataloguedExternalNavRoutes = externalNavRoutes.filter(route => !knownRoutes.has(route))
  const orphanNavRoutes = unique(navRoutes.filter(route => !registered.has(route) && !externalNavRoutes.includes(route)))
  const legacyCandidateRoutes = unique(routeCatalog
    .filter(route => route.kind === 'legacy-candidate' && registered.has(route.routeId))
    .map(route => route.routeId))
  const result = {
    catalogVersion: CATALOG_VERSION,
    portalId,
    duplicateModuleIds: duplicates(moduleCatalog.map(moduleDefinition => moduleDefinition.moduleId)),
    duplicateRouteIds: duplicates(cataloguedRouteIds),
    duplicateNavRoutes: duplicates(navRoutes),
    orphanNavRoutes,
    // A registered route outside this shadow inventory is not broken; it needs
    // ownership classification before any consolidation is considered.
    registeredUncataloguedRoutes: unique(registeredRoutes.filter(route => !knownRoutes.has(route))),
    uncataloguedNavRoutes: unique(navRoutes.filter(route => !knownRoutes.has(route) && !externalNavRoutes.includes(route))),
    uncataloguedExternalNavRoutes,
    validExternalNavRoutes,
    legacyCandidateRoutes,
    orphanCandidateRoutes: orphanNavRoutes,
    missingPortal: !portal,
    defaultRouteMismatch: Boolean(portal && defaultRoute && portal.defaultRoute !== defaultRoute),
    missingDefaultRoute: Boolean(defaultRoute && !registered.has(defaultRoute) && !externalRouteIds.includes(defaultRoute)),
  }
  result.issueCount = Object.entries(result).filter(hasIssues).length
  return result
}

export function reportCatalogAudit(input) {
  try {
    const result = auditCatalog(input)
    auditStore.set(result.portalId, Object.freeze({ ...result, observedAt: new Date().toISOString() }))
    const issues = Object.entries(result).filter(hasIssues)
    // El audit de catálogo es una herramienta de desarrollo: la "deuda conocida"
    // (rutas sin catalogar, candidatas legacy, etc.) no es un fallo. Se emite como
    // console.debug (oculto por defecto en devtools, visible con nivel "Verbose")
    // para no ensuciar la consola de nadie. El evento `catalog:audit` y
    // `getCatalogAuditResults()` siguen disponibles para paneles internos.
    if (issues.length) console.debug(`[catalog-shadow] ${input.portalId}`, result)
    if (typeof globalThis.dispatchEvent === 'function' && typeof globalThis.CustomEvent === 'function') {
      globalThis.dispatchEvent(new CustomEvent('catalog:audit', { detail: result }))
    }
    return result
  } catch (error) {
    console.warn('[catalog-shadow] audit unavailable', error)
    return null
  }
}

export const getCatalogAuditResults = () => [...auditStore.values()].map(audit => ({ ...audit }))
export const clearCatalogAuditResults = () => auditStore.clear()

export function classifyCatalogAudit(audit) {
  if (!audit) return 'SIN_EVIDENCIA'
  // Only portal/default failures are "ROTO". Legacy and orphan candidates are
  // intentionally descriptive until a human explicitly decides their lifecycle.
  if (audit.missingPortal || audit.missingDefaultRoute) return 'ROTO'
  if (audit.defaultRouteMismatch || audit.orphanNavRoutes.length || audit.duplicateNavRoutes.length
    || audit.duplicateModuleIds.length || audit.duplicateRouteIds.length) return 'REVISAR'
  if (audit.uncataloguedNavRoutes.length || audit.uncataloguedExternalNavRoutes.length
    || audit.registeredUncataloguedRoutes.length) return 'DEUDA_CONOCIDA'
  if (audit.legacyCandidateRoutes.length) return 'CANDIDATOS'
  return 'COHERENTE'
}

export function summarizeCatalogDiagnostics() {
  const audits = getCatalogAuditResults()
  const helpReady = moduleCatalog.filter(moduleDefinition => moduleDefinition.help?.status === 'ready').length
  return {
    portalCount: portalCatalog.length,
    moduleCount: moduleCatalog.length,
    routeCount: cataloguedRouteIds.length,
    observedPortalCount: audits.length,
    issueCount: audits.reduce((sum, audit) => sum + audit.issueCount, 0),
    helpReady,
    helpCoverage: moduleCatalog.length ? Math.round(helpReady / moduleCatalog.length * 100) : 0,
    statusCounts: portalCatalog.reduce((counts, portal) => {
      const status = classifyCatalogAudit(audits.find(audit => audit.portalId === portal.portalId))
      counts[status] = (counts[status] || 0) + 1
      return counts
    }, {}),
    audits,
  }
}
