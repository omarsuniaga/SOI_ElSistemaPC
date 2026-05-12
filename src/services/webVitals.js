/**
 * Web Vitals monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS) using Web Vitals API
 */

let metrics = {
  LCP: null,
  FID: null,
  CLS: null,
  FCP: null,
  TTFB: null,
}
let observerSupported = false

/**
 * Check if Web Vitals API is supported
 */
export function isSupported() {
  if (typeof window === 'undefined') return false
  return typeof PerformanceObserver !== 'undefined'
}

/**
 * Initialize Web Vitals monitoring
 * @param {Object} options
 * @param {boolean} options.debug - Log metrics to console
 * @param {Function} options.onReport - Callback when metrics are reported
 */
export function initWebVitals(options = {}) {
  const { debug = false, onReport = null } = options

  if (!isSupported()) {
    console.warn('[WebVitals] Not supported in this environment')
    return
  }

  observerSupported = true
  console.log('[WebVitals] Initialized')

  observeLCP(debug, onReport)
  observeFID(debug, onReport)
  observeCLS(debug, onReport)
  observeFCP(debug, onReport)
  observeTTFB(debug, onReport)
}

function observeLCP(debug, onReport) {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      metrics.LCP = lastEntry.value
      if (debug) console.log('[LCP]', lastEntry.value)
      if (onReport) onReport('LCP', lastEntry.value)
    })
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    if (debug) console.log('[LCP] Not available')
  }
}

function observeFID(debug, onReport) {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const firstEntry = entries[0]
      metrics.FID = firstEntry.value
      if (debug) console.log('[FID]', firstEntry.value)
      if (onReport) onReport('FID', firstEntry.value)
    })
    observer.observe({ entryTypes: ['first-input'] })
  } catch (e) {
    if (debug) console.log('[FID] Not available')
  }
}

function observeCLS(debug, onReport) {
  try {
    let clsValue = 0
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      metrics.CLS = clsValue
      if (debug) console.log('[CLS]', clsValue)
      if (onReport) onReport('CLS', clsValue)
    })
    observer.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    if (debug) console.log('[CLS] Not available')
  }
}

function observeFCP(debug, onReport) {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const firstEntry = entries[0]
      metrics.FCP = firstEntry.value
      if (debug) console.log('[FCP]', firstEntry.value)
      if (onReport) onReport('FCP', firstEntry.value)
    })
    observer.observe({ entryTypes: ['paint'] })
  } catch (e) {
    if (debug) console.log('[FCP] Not available')
  }
}

function observeTTFB(debug, onReport) {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const navEntry = entries[0]
      metrics.TTFB = navEntry.responseStart
      if (debug) console.log('[TTFB]', navEntry.responseStart)
      if (onReport) onReport('TTFB', navEntry.responseStart)
    })
    observer.observe({ entryTypes: ['navigation'] })
  } catch (e) {
    if (debug) console.log('[TTFB] Not available')
  }
}

/**
 * Get collected Web Vitals metrics
 */
export function getWebVitals() {
  return { ...metrics }
}

/**
 * Get performance rating for a metric
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 */
export function getRating(metric, value) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  }

  const threshold = thresholds[metric]
  if (!threshold) return 'unknown'

  if (value <= threshold.good) return 'good'
  if (value >= threshold.poor) return 'poor'
  return 'needs-improvement'
}

export default {
  initWebVitals,
  getWebVitals,
  isSupported,
  getRating,
}