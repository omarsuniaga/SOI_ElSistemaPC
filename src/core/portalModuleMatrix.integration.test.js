import { describe, expect, it } from 'vitest'
import { portalCatalog } from './portalCatalog.js'
import { getShadowNavigation, governanceMatrixRoute } from './portalModuleMatrix.js'

describe('governance matrix portal integration contract', () => {
  it('exposes the matrix route and navigation contract only to /admin', () => {
    const portalsWithMatrix = portalCatalog.filter(portal => (
      getShadowNavigation(portal.portalId).some(entry => entry.routeId === governanceMatrixRoute.routeId)
    ))

    expect(governanceMatrixRoute).toMatchObject({ routeId: 'matriz-permisos-sombra', portalId: 'admin', mode: 'shadow' })
    expect(portalsWithMatrix).toHaveLength(1)
    expect(portalsWithMatrix[0]).toMatchObject({ portalId: 'admin', path: '/admin' })
  })
})
