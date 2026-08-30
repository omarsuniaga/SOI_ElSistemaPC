/**
 * Guidance Engine — Public API
 *
 * The Guidance Engine is an intelligent contextual layer that helps
 * staff use the Portal de Maestros correctly by providing:
 *
 * 1. Inline contextual hints (Fase 3 - Proactive)
 * 2. Contextual Q&A panel (Fase 4 - Reactive)
 * 3. Smart alerts (Fase 5 - Proactive)
 *
 * @module guidance
 */

// Core service
import { getGuidanceService } from './guidanceService.js'
export { createGuidanceService, getGuidanceService } from './guidanceService.js'

// Context layer
export { createContextProvider } from './context/contextProvider.js'
export { VIEWS, getViewDefinition, getAllViewIds } from './context/viewRegistry.js'
export { viewDataFetcher } from './context/dataSnapshot.js'

// Knowledge layer
export { PROCESS_RULES, getRulesForView, getRulesByPriority, getProcessNames } from './knowledge/processKnowledge.js'
export { ROLE_VIEW_CAPABILITIES, getCapabilities, getViewsForRole, canPerformAction } from './knowledge/roleCapabilities.js'

/**
 * Initialize the Guidance Engine for the current portal session.
 *
 * Usage:
 *   import { initGuidance } from '@/modules/guidance'
 *   await initGuidance('maestro')
 *
 * @param {string} role - User role
 * @returns {Promise<import('./guidanceService.js').GuidanceService>}
 */
export async function initGuidance(role) {
  const service = getGuidanceService()
  await service.init(role)
  return service
}
