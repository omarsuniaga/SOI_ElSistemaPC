/**
 * Performance monitoring using Web Vitals API
 */

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Basic implementation of Core Web Vitals monitoring
  window.addEventListener('load', () => {
    // LCP
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log('[Performance] LCP:', entry.startTime, entry)
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // FID
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const delay = entry.processingStart - entry.startTime
        console.log('[Performance] FID:', delay, entry)
      }
    }).observe({ type: 'first-input', buffered: true })

    // CLS
    new PerformanceObserver((entryList) => {
      let clsValue = 0
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      console.log('[Performance] CLS:', clsValue)
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

export default { initPerformanceMonitoring }
