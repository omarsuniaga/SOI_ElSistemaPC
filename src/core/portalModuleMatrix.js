import { moduleCatalog } from './moduleCatalog.js'
import { portalCatalog } from './portalCatalog.js'

/**
 * This is a planning vocabulary, not an authorization layer. Keeping the
 * contract here prevents a future permissions rollout from inferring meaning
 * from labels used by individual portal screens.
 */
export const capabilityDefinitions = Object.freeze([
  Object.freeze({ id: 'read', label: 'Lectura', description: 'Consultar información y vistas del módulo.' }),
  Object.freeze({ id: 'write', label: 'Escritura', description: 'Crear o modificar información del módulo.' }),
  Object.freeze({ id: 'administer', label: 'Administración', description: 'Configurar el módulo o gestionar su asignación futura.' }),
  Object.freeze({ id: 'execute', label: 'Ejecución', description: 'Iniciar flujos operativos definidos por el módulo.' }),
])

export const capabilityIds = Object.freeze(capabilityDefinitions.map(capability => capability.id))
export const assignmentStates = Object.freeze(['proposed', 'current-observed'])

// This entry is deliberately data-only: only src/main.js consumes it, and no
// portal guard, RLS rule, authentication check, or persistence service reads it.
export const governanceMatrixRoute = Object.freeze({
  routeId: 'matriz-permisos-sombra',
  portalId: 'admin',
  label: 'Matriz de Módulos',
  icon: 'bi-diagram-3',
  mode: 'shadow',
})

export const shadowNavigationByPortal = Object.freeze({
  admin: Object.freeze([governanceMatrixRoute]),
  ADM: Object.freeze([]),
  ACM: Object.freeze([]),
  MAESTROS: Object.freeze([]),
})

const freezeCapabilities = values => Object.freeze(Object.fromEntries(
  capabilityIds.map(capabilityId => [capabilityId, values.includes(capabilityId) ? 'proposed' : 'not-proposed']),
))

const hasWorkflow = moduleDefinition => moduleDefinition.routeDescriptors
  .some(route => route.kind === 'workflow')

const ownerAssignment = (portal, moduleDefinition) => {
  const isAdminPortal = portal.portalId === 'admin'
  const ownsModule = portal.portalId === moduleDefinition.owner
  const isShared = moduleDefinition.owner === 'shared'

  if (isAdminPortal) {
    return {
      included: true,
      reason: ownsModule
        ? 'Coincidencia entre el responsable DIR y el portal administrativo raíz.'
        : 'Cobertura propuesta para la futura gobernanza central desde /admin.',
      capabilities: [
        'read',
        ...(ownsModule ? ['write'] : []),
        'administer',
        ...(ownsModule && hasWorkflow(moduleDefinition) ? ['execute'] : []),
      ],
    }
  }

  if (ownsModule) {
    return {
      included: true,
      reason: `Propuesta derivada del responsable actual ${moduleDefinition.owner}.`,
      capabilities: ['read', 'write', ...(hasWorkflow(moduleDefinition) ? ['execute'] : [])],
    }
  }

  if (isShared) {
    return {
      included: true,
      reason: 'Propuesta conservadora para un módulo inventariado como shared.',
      capabilities: ['read'],
    }
  }

  return { included: false }
}

const freezeAssignment = assignment => Object.freeze({
  ...assignment,
  capabilities: freezeCapabilities(assignment.capabilities),
})

/**
 * Produces suggestions from the static inventory only. It intentionally does
 * not inspect users, roles, Supabase policies, route guards, or local storage.
 */
export function buildPortalModuleMatrix(portals = portalCatalog, modules = moduleCatalog) {
  return Object.freeze(portals.flatMap(portal => modules.flatMap(moduleDefinition => {
    const proposal = ownerAssignment(portal, moduleDefinition)
    if (!proposal.included) return []
    return [freezeAssignment({
      portalId: portal.portalId,
      moduleId: moduleDefinition.moduleId,
      owner: moduleDefinition.owner,
      state: 'proposed',
      basis: 'catalog-owner',
      reason: proposal.reason,
      capabilities: proposal.capabilities,
    })]
  })))
}

export const portalModuleMatrix = buildPortalModuleMatrix()

export function filterPortalModuleAssignments(assignments = portalModuleMatrix, filters = {}) {
  const {
    portalId = 'all', owner = 'all', moduleId = 'all', capability = 'all', state = 'all',
  } = filters

  return assignments.filter(assignment => (
    (portalId === 'all' || assignment.portalId === portalId)
    && (owner === 'all' || assignment.owner === owner)
    && (moduleId === 'all' || assignment.moduleId === moduleId)
    && (capability === 'all' || assignment.capabilities[capability] === 'proposed')
    && (state === 'all' || assignment.state === state)
  ))
}

export function summarizePortalModuleMatrix(assignments = portalModuleMatrix) {
  const coveredPortalIds = new Set(assignments.map(assignment => assignment.portalId))
  const coveredModuleIds = new Set(assignments.map(assignment => assignment.moduleId))
  const proposedCapabilityCount = assignments.reduce((total, assignment) => (
    total + capabilityIds.filter(capabilityId => assignment.capabilities[capabilityId] === 'proposed').length
  ), 0)

  return Object.freeze({
    assignmentCount: assignments.length,
    proposedCapabilityCount,
    portalCoverage: `${coveredPortalIds.size} de ${portalCatalog.length}`,
    moduleCoverage: `${coveredModuleIds.size} de ${moduleCatalog.length}`,
  })
}

export const getShadowNavigation = portalId => shadowNavigationByPortal[portalId] || Object.freeze([])
