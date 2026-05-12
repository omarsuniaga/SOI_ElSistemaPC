/**
 * Error reporting to Sentry
 * Tracks unhandled errors, exceptions, and performance issues
 */

let sentryInitialized = false
let userId = null

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
    console.warn('Error reporting disabled: no DSN provided')
    return
  }

  // Dynamic Sentry access (assumes Sentry is loaded via script tag or global)
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.init({
      dsn,
      environment,
      tracesSampleRate,
    })
    sentryInitialized = true
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
  if (!sentryInitialized && (!window || !window.Sentry)) return

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
  if (window.Sentry) {
    window.Sentry.addBreadcrumb({
      message,
      data,
      level: 'info'
    })
  }
  console.log(`[Breadcrumb] ${message}`, data)
}

export default {
  initErrorReporter,
  reportError,
  setErrorUser,
  addBreadcrumb,
}
