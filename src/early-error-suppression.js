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
 * Check if an error message, stack, or object matches any suppressed pattern (Chrome extension noise)
 */
function isSuppressed(target = '') {
  if (!target) return false
  let str = ''
  if (typeof target === 'object' && target !== null) {
    const reason = target.reason
    const reasonStr = typeof reason === 'object' && reason !== null
      ? `${reason.message || ''} ${reason.stack || ''}`
      : String(reason || '')
    str = `${target.message || ''} ${target.stack || ''} ${reasonStr} ${target.filename || ''} ${target.name || ''} ${String(target)}`
  } else {
    str = String(target)
  }
  str = str.toLowerCase()
  return SUPPRESSED_PATTERNS.some(pattern => str.includes(pattern.toLowerCase()))
}

// ============================================
// Suppress console.error calls
// ============================================
const originalError = console.error
console.error = function(...args) {
  const hasSuppressed = args.some(a => isSuppressed(a))
  if (!hasSuppressed) {
    originalError.apply(console, args)
  }
}

// ============================================
// Suppress console.warn calls
// ============================================
const originalWarn = console.warn
console.warn = function(...args) {
  const hasSuppressed = args.some(a => isSuppressed(a))
  if (!hasSuppressed) {
    originalWarn.apply(console, args)
  }
}

// ============================================
// Suppress unhandledrejection events
// ============================================
window.addEventListener('unhandledrejection', (event) => {
  if (isSuppressed(event.reason)) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}, true) // Capture phase to intercept early

// ============================================
// Suppress global error handler
// ============================================
window.addEventListener('error', (event) => {
  if (isSuppressed(event.message) || isSuppressed(event.filename) || isSuppressed(event.error)) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}, true) // Capture phase to intercept early

// NOTE: window.fetch monkey-patch REMOVED — was silently returning null on
// suppressed errors, causing cascading bugs. Console/event suppression kept
// for browser extension noise (chrome-extension://, content.js, polyfill).

// ============================================
// Early Preferences Restoration (Theme, Font Scale, Font Family)
// Runs in module context with zero CSP script-src violations.
// ============================================
try {
  const theme = localStorage.getItem('portal-maestros-theme')
  if (theme) {
    document.documentElement.setAttribute('data-bs-theme', theme)
    document.documentElement.setAttribute('data-portal-theme', theme)
  }
  const scale = localStorage.getItem('portal-maestros-font-scale')
  if (scale) {
    document.documentElement.style.setProperty('--pm-font-scale', scale)
  }
  const family = localStorage.getItem('portal-maestros-font-family')
  const families = {
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    inter: "'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif",
    poppins: "'Poppins', -apple-system, 'Segoe UI', Roboto, sans-serif",
    nunito: "'Nunito', -apple-system, 'Segoe UI', Roboto, sans-serif",
    lato: "'Lato', 'Segoe UI', Roboto, sans-serif",
    merriweather: "'Merriweather', Georgia, 'Times New Roman', serif",
    georgia: "Georgia, 'Times New Roman', serif",
  }
  if (family && families[family]) {
    document.documentElement.style.setProperty('--pm-font-family', families[family])
  }
} catch (_) {}
