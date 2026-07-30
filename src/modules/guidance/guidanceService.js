/**
 * guidanceService.js — Orchestrator for the Guidance Engine.
 *
 * Wires together context, knowledge, and rules.
 * Single entry point for all Guidance Engine operations.
 *
 * @module guidance
 */

import { createContextProvider } from './context/contextProvider.js'
import { viewDataFetcher } from './context/dataSnapshot.js'
import { getRulesForView } from './knowledge/processKnowledge.js'
import { getCapabilities } from './knowledge/roleCapabilities.js'

/**
 * @typedef {Object} GuidanceService
 * @property {Function} init         - Initialize with user role
 * @property {Function} getContext   - Get current context
 * @property {Function} setView      - Update current view
 * @property {Function} setRole      - Update user role
 * @property {Function} getHints     - Get active hints for current view
 * @property {Function} getActions   - Get available actions for current view
 * @property {Function} subscribe    - Subscribe to context changes
 * @property {Function} destroy      - Cleanup
 */

/**
 * Create a Guidance Engine service instance.
 * @returns {GuidanceService}
 */
export function createGuidanceService() {
  const provider = createContextProvider({ dataFetcher: viewDataFetcher })
  let _lastHints = []

  /**
   * Evaluate which hints to show based on context.
   * Priority: critical > high > medium > low
   * Max 3 proactive + all reactive triggered
   */
  function _evaluateHints(ctx) {
    const rules = getRulesForView(ctx.view, ctx.role)
    const triggered = []

    for (const rule of rules) {
      const [type, key] = rule.trigger.split(':')

      let isActive = false
      if (type === 'context' && key === 'isFirstVisit') {
        isActive = ctx.isFirstVisit
      } else if (type === 'data') {
        isActive = !!ctx.data[key]
      }

      if (isActive) {
        triggered.push({
          id: rule.id,
          message: rule.message,
          action: rule.action,
          priority: rule.priority,
          process: rule.process,
        })
      }
    }

    // Sort by priority, then limit proactive to 3
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    triggered.sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))

    // Top 3 critical/high are proactive (shown inline), rest are available in panel
    const proactive = triggered.filter(r => r.priority === 'critical' || r.priority === 'high').slice(0, 3)
    const reactive = triggered.filter(r => r.priority !== 'critical' && r.priority !== 'high')

    _lastHints = triggered
    return { proactive, reactive, total: triggered.length }
  }

  return {
    /**
     * Initialize the service with a user role.
     * @param {string} role
     */
    async init(role) {
      provider.setRole(role)
      const ctx = provider.getContext()
      await provider.setView(ctx.view || 'hoy', { role })
    },

    /**
     * Get the current context.
     * @returns {import('./context/contextProvider.js').GuidanceContext}
     */
    getContext() {
      return provider.getContext()
    },

    /**
     * Set the current view and refresh context + data.
     * @param {string} view
     */
    async setView(view) {
      const ctx = provider.getContext()
      await provider.setView(view, { role: ctx.role })
    },

    /**
     * Update the user role.
     * @param {string} role
     */
    setRole(role) {
      provider.setRole(role)
    },

    /**
     * Get active hints for the current view.
     * @returns {{ proactive: Array, reactive: Array, total: number }}
     */
    getHints() {
      const ctx = provider.getContext()
      return _evaluateHints(ctx)
    },

    /**
     * Get available actions for the current view and role.
     * @returns {import('./knowledge/roleCapabilities.js').Capability[]}
     */
    getActions() {
      const ctx = provider.getContext()
      return getCapabilities(ctx.role, ctx.view)
    },

    /**
     * Subscribe to context changes.
     * @param {Function} callback
     * @returns {Function} Unsubscribe
     */
    subscribe(callback) {
      return provider.subscribe(callback)
    },

    /**
     * Cleanup.
     */
    destroy() {
      provider.reset()
      _lastHints = []
    },
  }
}

// Singleton for portal-wide use
let _instance = null

/**
 * Get or create the global guidance service singleton.
 * @returns {GuidanceService}
 */
export function getGuidanceService() {
  if (!_instance) {
    _instance = createGuidanceService()
  }
  return _instance
}
