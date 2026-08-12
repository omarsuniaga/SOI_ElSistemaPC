import { capabilityIds } from './portalModuleMatrix.js'
import { moduleCatalog } from './moduleCatalog.js'
import { portalCatalog } from './portalCatalog.js'

/**
 * Deliberately local vocabulary for reviewing a future capability change.
 * It has no side effects: it does not call storage, services, guards, or RLS.
 */
export const shadowApprovalStates = Object.freeze([
  'draft',
  'submitted',
  'approved',
  'rejected',
  'simulated',
])

export const shadowApprovalActions = Object.freeze([
  'submit',
  'approve',
  'reject',
  'revise',
  'simulate',
])

const transitions = Object.freeze({
  draft: Object.freeze({ submit: 'submitted' }),
  submitted: Object.freeze({ approve: 'approved', reject: 'rejected' }),
  approved: Object.freeze({ simulate: 'simulated' }),
  rejected: Object.freeze({ revise: 'draft' }),
  simulated: Object.freeze({}),
})

const changeOperations = Object.freeze(['propose-enable', 'propose-disable'])
const changeReasons = Object.freeze(['catalog-owner', 'coverage-correction', 'operational-review'])
const rollbackStrategies = Object.freeze(['discard-proposal', 'restore-previous-proposal'])
const rollbackVerifications = Object.freeze(['catalog-audit', 'navigation-smoke'])
const payloadKeys = Object.freeze([
  'changeId',
  'portalId',
  'moduleId',
  'capabilityId',
  'operation',
  'reasonCode',
  'rollbackPlan',
])
const authenticChanges = new WeakSet()

const frozen = value => Object.freeze(value)
const hasOnlyKeys = (value, keys) => Object.keys(value).every(key => keys.includes(key))
const isKnownPortal = portalId => portalCatalog.some(portal => portal.portalId === portalId)
const isKnownModule = moduleId => moduleCatalog.some(moduleDefinition => moduleDefinition.moduleId === moduleId)

function validateRollbackPlan(rollbackPlan, { required = false } = {}) {
  if (!rollbackPlan) {
    return required ? ['A rollback plan is required before approval or simulation.'] : []
  }

  if (typeof rollbackPlan !== 'object' || Array.isArray(rollbackPlan)) {
    return ['Rollback plan must be an object.']
  }

  if (!hasOnlyKeys(rollbackPlan, ['strategy', 'verification'])) {
    return ['Rollback plan cannot include free-form or personal fields.']
  }

  const errors = []
  if (!rollbackStrategies.includes(rollbackPlan.strategy)) errors.push('Rollback strategy is not supported.')
  if (!rollbackVerifications.includes(rollbackPlan.verification)) errors.push('Rollback verification is not supported.')
  return errors
}

/**
 * Validates a structural, PII-free proposal. Free text and actor identifiers
 * are intentionally excluded so this shadow workflow cannot become a user log.
 */
export function validateShadowCapabilityPayload(payload, { requireRollback = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return frozen(['Capability change payload must be an object.'])
  }

  const errors = []
  if (!hasOnlyKeys(payload, payloadKeys)) errors.push('Capability change payload contains unsupported fields.')
  if (typeof payload.changeId !== 'string' || !/^shadow-[a-z0-9-]+$/.test(payload.changeId)) errors.push('Change ID must be a local shadow identifier.')
  if (!isKnownPortal(payload.portalId)) errors.push('Portal is not catalogued.')
  if (!isKnownModule(payload.moduleId)) errors.push('Module is not catalogued.')
  if (!capabilityIds.includes(payload.capabilityId)) errors.push('Capability is not defined by the matrix contract.')
  if (!changeOperations.includes(payload.operation)) errors.push('Operation is not supported.')
  if (!changeReasons.includes(payload.reasonCode)) errors.push('Reason code is not supported.')
  errors.push(...validateRollbackPlan(payload.rollbackPlan, { required: requireRollback }))
  return frozen(errors)
}

const immutableRollbackPlan = rollbackPlan => rollbackPlan
  ? frozen({ strategy: rollbackPlan.strategy, verification: rollbackPlan.verification })
  : null

const immutableEvent = event => frozen({
  kind: 'shadow-approval-transition',
  changeId: event.changeId,
  from: event.from,
  to: event.to,
  at: event.at,
})

const normalizeTimestamp = value => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new TypeError('Shadow approval timestamp must be a valid ISO string.')
  }
  return new Date(value).toISOString()
}

const immutableChange = change => {
  const result = frozen({
  changeId: change.changeId,
  portalId: change.portalId,
  moduleId: change.moduleId,
  capabilityId: change.capabilityId,
  operation: change.operation,
  reasonCode: change.reasonCode,
  rollbackPlan: immutableRollbackPlan(change.rollbackPlan),
  status: change.status,
  auditEvents: frozen(change.auditEvents.map(immutableEvent)),
  })
  authenticChanges.add(result)
  return result
}

const payloadFromChange = change => Object.fromEntries(
  payloadKeys.map(key => [key, change[key]]),
)

export function createShadowCapabilityChange(payload, { now = () => new Date().toISOString() } = {}) {
  const errors = validateShadowCapabilityPayload(payload)
  if (errors.length) throw new TypeError(errors.join(' '))

  const createdAt = normalizeTimestamp(now())
  return immutableChange({
    ...payload,
    rollbackPlan: payload.rollbackPlan || null,
    status: 'draft',
    auditEvents: [{
      kind: 'shadow-approval-transition',
      changeId: payload.changeId,
      from: null,
      to: 'draft',
      at: createdAt,
    }],
  })
}

export function getShadowApprovalTransition(status, action) {
  return transitions[status]?.[action] || null
}

/**
 * Returns a new immutable proposal and audit trail. It never performs access
 * changes; "simulated" is terminal evidence for human review only.
 */
export function transitionShadowCapabilityChange(change, action, { now = () => new Date().toISOString() } = {}) {
  if (!change || typeof change !== 'object') throw new TypeError('Shadow change is required.')
  if (!authenticChanges.has(change)) throw new TypeError('Shadow change must originate from this approval workflow.')
  if (!shadowApprovalActions.includes(action)) throw new TypeError('Shadow approval action is not supported.')
  const nextStatus = getShadowApprovalTransition(change.status, action)
  if (!nextStatus) throw new RangeError(`Cannot ${action} a ${change.status} shadow change.`)

  const requiresRollback = nextStatus === 'approved' || nextStatus === 'simulated'
  const errors = validateShadowCapabilityPayload(payloadFromChange(change), { requireRollback: requiresRollback })
  if (errors.length) throw new TypeError(errors.join(' '))

  return immutableChange({
    ...change,
    status: nextStatus,
    auditEvents: [...(change.auditEvents || []), {
      kind: 'shadow-approval-transition',
      changeId: change.changeId,
      from: change.status,
      to: nextStatus,
      at: normalizeTimestamp(now()),
    }],
  })
}

export const shadowApprovalFlow = Object.freeze([
  frozen({ status: 'draft', label: 'Borrador', description: 'Se define una propuesta estructurada sin datos personales.' }),
  frozen({ status: 'submitted', label: 'En revisión', description: 'La propuesta queda lista para revisión humana.' }),
  frozen({ status: 'approved', label: 'Aprobada', description: 'Exige un plan de reversión antes de avanzar.' }),
  frozen({ status: 'rejected', label: 'Rechazada', description: 'Puede volver a borrador mediante una revisión explícita.' }),
  frozen({ status: 'simulated', label: 'Simulada', description: 'Produce evidencia local; no cambia ningún acceso.' }),
])

export const shadowApprovalExample = createShadowCapabilityChange({
  changeId: 'shadow-acm-clases-write',
  portalId: 'ACM',
  moduleId: 'clases',
  capabilityId: 'write',
  operation: 'propose-enable',
  reasonCode: 'catalog-owner',
  rollbackPlan: { strategy: 'discard-proposal', verification: 'navigation-smoke' },
}, { now: () => '2026-08-12T00:00:00.000Z' })
