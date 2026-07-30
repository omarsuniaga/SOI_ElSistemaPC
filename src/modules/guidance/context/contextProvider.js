/**
 * contextProvider.js — Guidance Engine context singleton.
 *
 * Detects the current view, user role, and relevant data state.
 * Emits events when context changes so Rules Engine can re-evaluate.
 *
 * @module guidance/context
 */

/**
 * @typedef {Object} GuidanceContext
 * @property {string} view           - Current view/route id
 * @property {string} role           - User role (maestro, admin, etc.)
 * @property {Object} data           - Relevant data snapshot
 * @property {number} timestamp      - When context was last updated
 */

/**
 * Creates a context provider instance.
 * @param {Object} [opts]
 * @param {Function} [opts.dataFetcher] - Async function that returns data for the current view
 * @returns {Object} Context provider API
 */
export function createContextProvider(opts = {}) {
  /** @type {GuidanceContext} */
  let _context = {
    view: null,
    role: null,
    data: {},
    timestamp: 0,
  }

  /** @type {Set<Function>} */
  const _listeners = new Set()

  /** @type {Set<string>} Views already visited this session (for onboarding hints) */
  const _visitedViews = new Set()

  return {
    /**
     * Get the current context snapshot (read-only copy).
     * @returns {GuidanceContext}
     */
    getContext() {
      return { ..._context, data: { ..._context.data } }
    },

    /**
     * Set the current view and optionally refresh data.
     * @param {string} view - View/route id
     * @param {Object} [meta] - { role?, extraData? }
     */
    async setView(view, meta = {}) {
      const isFirstVisit = !_visitedViews.has(view)
      _visitedViews.add(view)

      _context = {
        view,
        role: meta.role || _context.role,
        data: { ..._context.data, ...meta.extraData },
        timestamp: Date.now(),
        isFirstVisit,
      }

      // Fetch view-specific data if a fetcher is provided
      if (opts.dataFetcher) {
        try {
          const viewData = await opts.dataFetcher(view, _context)
          _context.data = { ..._context.data, ...viewData }
        } catch (err) {
          console.warn('[Guidance] dataFetcher error:', err.message)
        }
      }

      _notify()
    },

    /**
     * Update just the role.
     * @param {string} role
     */
    setRole(role) {
      if (_context.role !== role) {
        _context = { ..._context, role, timestamp: Date.now() }
        _notify()
      }
    },

    /**
     * Merge additional data into context.
     * @param {Object} partial - Partial data to merge
     */
    mergeData(partial) {
      _context = {
        ..._context,
        data: { ..._context.data, ...partial },
        timestamp: Date.now(),
      }
      _notify()
    },

    /**
     * Subscribe to context changes.
     * @param {Function} callback - Called with (GuidanceContext) on every change
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
      _listeners.add(callback)
      return () => _listeners.delete(callback)
    },

    /**
     * Check if a view has been visited this session.
     * @param {string} view
     * @returns {boolean}
     */
    isVisited(view) {
      return _visitedViews.has(view)
    },

    /**
     * Reset context (for testing or logout).
     */
    reset() {
      _context = { view: null, role: null, data: {}, timestamp: 0 }
      _visitedViews.clear()
      _notify()
    },
  }

  function _notify() {
    const snapshot = { ..._context, data: { ..._context.data } }
    for (const cb of _listeners) {
      try { cb(snapshot) } catch (e) { console.warn('[Guidance] listener error:', e) }
    }
  }
}
