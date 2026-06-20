/**
 * Error reporting to Sentry
 * Tracks unhandled errors, exceptions, and performance issues
 */

let sentryInitialized = false
let userId = null
const recentErrors = []
const MAX_RECENT_ERRORS = 10

/**
 * Initialize Sentry error reporting
 * @param {Object} options
 * @param {string} options.dsn - Sentry DSN
 * @param {string} [options.environment] - Environment (dev/staging/prod)
 * @param {number} [options.tracesSampleRate] - Performance sampling rate
 */
export function initErrorReporter(options = {}) {
  const { dsn, environment = 'development', tracesSampleRate = 0.1 } = options

  if (!dsn) {
    // console.warn('[ErrorReporter] Disabled: no DSN provided') // Silenced for cleaner local dev console
    return
  }

  if (typeof window !== 'undefined' && window.Sentry) {
    const integrations = []
    if (window.Sentry.Replay) {
      integrations.push(new window.Sentry.Replay({ maskAllText: true, blockAllMedia: true }))
    }
    
    window.Sentry.init({
      dsn,
      environment,
      tracesSampleRate,
      integrations,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
    sentryInitialized = true
    console.log('[ErrorReporter] Initialized:', environment)
  }
}

/**
 * Report an error to Sentry
 * @param {Error|string} error - Error object or message
 * @param {Object} context - Additional context
 * @param {string} [context.userId] - User ID
 * @param {string} [context.context] - Error context
 * @param {string} [context.level] - Severity level
 */
export function reportError(error, context = {}) {
  // Record in-memory for AI diagnostics
  const timestamp = new Date().toISOString()
  const errorMsg = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : null
  recentErrors.push({
    message: errorMsg,
    stack: errorStack,
    context: context.context || 'unknown',
    level: context.level || 'error',
    timestamp,
  })
  if (recentErrors.length > MAX_RECENT_ERRORS) {
    recentErrors.shift()
  }

  if (!sentryInitialized && !window.Sentry) return

  const { userId: uid, context: ctx, level = 'error', ...extra } = context

  if (uid) {
    userId = uid
    window.Sentry?.setUser({ id: uid })
  }

  if (ctx) {
    window.Sentry?.setTag('context', ctx)
  }

  if (Object.keys(extra).length > 0) {
    window.Sentry?.setContext('details', extra)
  }

  if (error instanceof Error) {
    window.Sentry?.captureException(error, { level })
    console.error(`[Error] ${error.message}`, error)
  } else {
    window.Sentry?.captureMessage(String(error), level)
    console.warn(`[${level}] ${error}`)
  }
}

/**
 * Set current user for error tracking
 * @param {string} id - User ID
 * @param {Object} [info] - Additional user info
 */
export function setErrorUser(id, info = {}) {
  userId = id
  window.Sentry?.setUser({ id, ...info })
}

/**
 * Add breadcrumb (user action) for debugging
 * @param {string} message - Action description
 * @param {Object} [data] - Additional data
 */
export function addBreadcrumb(message, data = {}) {
  window.Sentry?.addBreadcrumb({
    message,
    data,
    level: 'info',
  })
  console.log(`[Breadcrumb] ${message}`, data)
}

/**
 * Start performance monitoring
 * @param {string} operation - Operation name
 * @returns {Object} Transaction object with finish() method
 */
export function startTransaction(operation) {
  if (!window.Sentry) {
    return { finish: () => {} }
  }

  const startTime = performance.now()
  return {
    finish: () => {
      const duration = performance.now() - startTime
      if (duration > 1000) {
        addBreadcrumb(`Slow operation: ${operation}`, { duration: duration.toFixed(2) })
      }
    },
  }
}

export function getRecentErrors() {
  return [...recentErrors]
}

export default {
  initErrorReporter,
  reportError,
  setErrorUser,
  addBreadcrumb,
  startTransaction,
  getRecentErrors,
}