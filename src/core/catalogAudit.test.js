import { describe, expect, it } from 'vitest'
import { MODULE_REGISTRY_ROUTE_COUNT, cataloguedRouteIds, moduleCatalog, routeCatalog } from './moduleCatalog.js'
import { portalCatalog } from './portalCatalog.js'
import { auditCatalog } from './catalogAudit.js'

describe('shadow catalog', () => {
  it('has unique module and route identities', () => {
    expect(new Set(moduleCatalog.map(module => module.moduleId)).size).toBe(moduleCatalog.length)
    const routeIds = moduleCatalog.flatMap(module => module.routeIds)
    expect(new Set(routeIds).size).toBe(routeIds.length)
    expect(routeCatalog.every(route => route.source && route.owner && route.kind)).toBe(true)
  })

  it('documents the real registry count instead of the previous aggregate undercount', () => {
    const registryModules = moduleCatalog.slice(0, 29)
    expect(registryModules).toHaveLength(29)
    expect(registryModules.flatMap(module => module.routeIds)).toHaveLength(MODULE_REGISTRY_ROUTE_COUNT)
    expect(MODULE_REGISTRY_ROUTE_COUNT).toBe(96)
  })

  it('freezes critical defaults without becoming runtime authority', () => {
    expect(Object.fromEntries(portalCatalog.map(portal => [portal.portalId, portal.defaultRoute])))
      .toMatchObject({ admin: 'clases-hoy', ADM: 'clases-hoy', ACM: 'clases', MAESTROS: 'hoy' })
    expect(Object.isFrozen(portalCatalog)).toBe(true)
    expect(Object.isFrozen(moduleCatalog[0].routeIds)).toBe(true)
  })

  it('detects duplicate, orphan and uncatalogued navigation once per route', () => {
    const result = auditCatalog({
      portalId: 'ACM',
      defaultRoute: 'clases',
      navGroups: [{ items: [{ id: 'clases' }, { id: 'ghost' }, { id: 'ghost' }] }],
      registeredRoutes: ['clases'],
    })
    expect(result.duplicateNavRoutes).toEqual(['ghost'])
    expect(result.orphanNavRoutes).toEqual(['ghost'])
    expect(result.uncataloguedNavRoutes).toEqual(['ghost'])
    expect(result.registeredUncataloguedRoutes).toEqual([])
    expect(result.catalogVersion).toBe(2)
    expect(result.issueCount).toBe(3)
  })

  it('accepts catalogued external entries without reporting an orphan route', () => {
    const result = auditCatalog({
      portalId: 'admin',
      defaultRoute: 'dir-score',
      navGroups: [{ items: [{ id: 'audiciones' }] }],
      registeredRoutes: ['dir-score'],
    })
    expect(result.validExternalNavRoutes).toEqual(['audiciones'])
    expect(result.orphanNavRoutes).toEqual([])
    expect(result.uncataloguedNavRoutes).toEqual([])
  })

  it('keeps registered unknown routes as catalog debt, not a broken portal', () => {
    const result = auditCatalog({
      portalId: 'ACM',
      defaultRoute: 'clases',
      registeredRoutes: ['clases', 'future-module'],
    })
    expect(result.registeredUncataloguedRoutes).toEqual(['future-module'])
    expect(result.missingDefaultRoute).toBe(false)
  })
})
