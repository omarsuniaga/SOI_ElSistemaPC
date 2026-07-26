/**
 * Early Error Suppression
 * This runs BEFORE any other scripts load to suppress non-critical errors at the source.
 * Must be imported as the first script in index.html
 */

// Patterns that should be suppressed (non-critical errors)
const SUPPRESSED_PATTERNS = [
  'useCache',
  'WebSocket closed without opened',
  'Could not establish connection',
  'Receiving end does not exist',
  'chrome-extension://',
  'polyfill',
  'content.js',
  'Failed to load module script',
  'net::ERR_BLOCKED_BY_CLIENT',
  'lock:sb-soi-auth',
  'gotrue-js: Lock',
  'was not released within',
]

/**
 * Check if an error message matches any suppressed pattern
 */
function isSuppressed(message = '') {
  const msg = String(message).toLowerCase()
  return SUPPRESSED_PATTERNS.some(pattern => msg.includes(pattern.toLowerCase()))
}

// ============================================
// Suppress console.error calls
// ============================================
const originalError = console.error
console.error = function(...args) {
  if (args.length > 0 && !isSuppressed(args[0])) {
    originalError.apply(console, args)
  }
}

// ============================================
// Suppress console.warn calls
// ============================================
const originalWarn = console.warn
console.warn = function(...args) {
  if (args.length > 0 && !isSuppressed(args[0])) {
    originalWarn.apply(console, args)
  }
}

// ============================================
// Suppress unhandledrejection events
// ============================================
window.addEventListener('unhandledrejection', (event) => {
  const reason = String(event.reason || '')
  if (isSuppressed(reason)) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}, true) // Capture phase to intercept early

// ============================================
// Suppress global error handler
// ============================================
window.addEventListener('error', (event) => {
  const message = event.message || ''
  if (isSuppressed(message)) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}, true) // Capture phase to intercept early

// NOTE: window.fetch monkey-patch REMOVED — was silently returning null on
// suppressed errors, causing cascading bugs. Console/event suppression kept
// for browser extension noise (chrome-extension://, content.js, polyfill).
