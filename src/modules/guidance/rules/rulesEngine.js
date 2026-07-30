/**
 * rulesEngine.js — Evaluates guidance rules against current context.
 *
 * Rules are pure functions: (context, data) → boolean.
 * The engine matches triggered rules to registered actions (hints, alerts, tips).
 *
 * @module guidance/rules
 */

/**
 * @typedef {Object} GuidanceRule
 * @property {string}  id          - Unique rule id
 * @property {string}  category    - 'proactive' | 'reactive' | 'alert'
 * @property {string}  priority    - 'critical' | 'high' | 'medium' | 'low'
 * @property {Function} condition  - (context, data) → boolean
 * @property {string}  message     - User-facing message (Spanish)
 * @property {string}  action      - Recommended action text
 * @property {string[]} views      - Views where this rule applies ('*' = all)
 * @property {string[]} roles      - Roles this applies to ('*' = all)
 */

/**
 * Create a rules engine instance.
 * @param {GuidanceRule[]} [initialRules=[]]
 * @returns {Object} Rules engine API
 */
export function createRulesEngine(initialRules = []) {
  /** @type {GuidanceRule[]} */
  let _rules = [...initialRules]

  /** @type {Set<Function>} */
  const _listeners = new Set()

  return {
    /**
     * Register one or more rules.
     * @param {GuidanceRule[]} rules
     */
    register(rules) {
      _rules.push(...rules)
      _notify()
    },

    /**
     * Remove rules by id.
     * @param {string[]} ids
     */
    unregister(ids) {
      const idSet = new Set(ids)
      _rules = _rules.filter(r => !idSet.has(r.id))
      _notify()
    },

    /**
     * Evaluate all rules against a context and return triggered results.
     * @param {Object} context - GuidanceContext
     * @returns {{ proactive: EvaluatedRule[], reactive: EvaluatedRule[], alerts: EvaluatedRule[] }}
     */
    evaluate(context) {
      const proactive = []
      const reactive = []
      const alerts = []

      for (const rule of _rules) {
        // Check view filter
        if (!rule.views.includes('*') && !rule.views.includes(context.view)) continue

        // Check role filter
        if (!rule.roles.includes('*') && !rule.roles.includes(context.role)) continue

        // Evaluate condition
        try {
          if (!rule.condition(context, context.data)) continue
        } catch {
          // If condition throws, skip this rule
          continue
        }

        const evaluated = {
          id: rule.id,
          category: rule.category,
          priority: rule.priority,
          message: rule.message,
          action: rule.action,
          process: rule.process,
        }

        if (rule.category === 'alert') {
          alerts.push(evaluated)
        } else if (rule.category === 'proactive') {
          proactive.push(evaluated)
        } else {
          reactive.push(evaluated)
        }
      }

      // Sort each bucket by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const sortByPriority = (a, b) =>
        (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)

      proactive.sort(sortByPriority)
      reactive.sort(sortByPriority)
      alerts.sort(sortByPriority)

      // Proactive: max 3 (top critical/high only)
      const topProactive = proactive.filter(
        r => r.priority === 'critical' || r.priority === 'high'
      ).slice(0, 3)

      return {
        proactive: topProactive,
        reactive,
        alerts,
        total: topProactive.length + reactive.length + alerts.length,
      }
    },

    /**
     * Get all registered rules.
     * @returns {GuidanceRule[]}
     */
    getRules() {
      return [..._rules]
    },

    /**
     * Get rules filtered by category.
     * @param {string} category
     * @returns {GuidanceRule[]}
     */
    getRulesByCategory(category) {
      return _rules.filter(r => r.category === category)
    },

    /**
     * Subscribe to rule changes.
     * @param {Function} callback
     * @returns {Function} Unsubscribe
     */
    onChange(callback) {
      _listeners.add(callback)
      return () => _listeners.delete(callback)
    },
  }

  function _notify() {
    for (const cb of _listeners) {
      try { cb(_rules.length) } catch { /* ignore */ }
    }
  }
}
