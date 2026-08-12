import { describe, expect, it } from 'vitest'
import { moduleCatalog } from './moduleCatalog.js'
import { portalCatalog } from './portalCatalog.js'
import {
  capabilityIds,
  filterPortalModuleAssignments,
  getShadowNavigation,
  governanceMatrixRoute,
  portalModuleMatrix,
  summarizePortalModuleMatrix,
} from './portalModuleMatrix.js'

describe('portal module shadow matrix', () => {
  it('uses the fixed capability contract without becoming an authorization source', () => {
    expect(capabilityIds).toEqual(['read', 'write', 'administer', 'execute'])
    expect(portalModuleMatrix.every(assignment => assignment.state === 'proposed')).toBe(true)
    expect(portalModuleMatrix.every(assignment => Object.keys(assignment.capabilities).sort().join(',') === capabilityIds.slice().sort().join(','))).toBe(true)
  })

  it('derives conservative proposals from the catalog owner and shared modules', () => {
    const acmClases = portalModuleMatrix.find(assignment => assignment.portalId === 'ACM' && assignment.moduleId === 'clases')
    const admSharedAlumnos = portalModuleMatrix.find(assignment => assignment.portalId === 'ADM' && assignment.moduleId === 'alumnos')
    expect(acmClases.capabilities).toMatchObject({ read: 'proposed', write: 'proposed', administer: 'not-proposed' })
    expect(admSharedAlumnos.capabilities).toMatchObject({ read: 'proposed', write: 'not-proposed', administer: 'not-proposed' })
  })

  it('filters proposals by portal, module owner, module, capability and state', () => {
    expect(filterPortalModuleAssignments(portalModuleMatrix, { portalId: 'MAESTROS', moduleId: 'teacher-core' })).toHaveLength(1)
    expect(filterPortalModuleAssignments(portalModuleMatrix, { owner: 'DIR', capability: 'administer' }).every(assignment => assignment.portalId === 'admin')).toBe(true)
    expect(filterPortalModuleAssignments(portalModuleMatrix, { state: 'current-observed' })).toEqual([])
  })

  it('reports coverage against the real static catalogs', () => {
    const summary = summarizePortalModuleMatrix()
    expect(summary.portalCoverage).toBe(`4 de ${portalCatalog.length}`)
    expect(summary.moduleCoverage).toBe(`35 de ${moduleCatalog.length}`)
    expect(summary.proposedCapabilityCount).toBeGreaterThan(summary.assignmentCount)
  })

  it('declares the shadow route and navigation only for the admin portal', () => {
    expect(governanceMatrixRoute).toMatchObject({ routeId: 'matriz-permisos-sombra', portalId: 'admin', mode: 'shadow' })
    expect(getShadowNavigation('admin').map(entry => entry.routeId)).toEqual(['matriz-permisos-sombra'])
    expect(['ADM', 'ACM', 'MAESTROS'].every(portalId => getShadowNavigation(portalId).length === 0)).toBe(true)
  })
})
