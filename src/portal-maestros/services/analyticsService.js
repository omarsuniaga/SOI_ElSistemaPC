/**
 * User behavior tracking (consent-based)
 */

let consentGranted = false

export function setAnalyticsConsent(granted) {
  consentGranted = granted
}

export async function trackEvent(name, properties = {}) {
  if (!consentGranted) return

  console.log(`[Analytics] Event: ${name}`, properties)
  
  // Potential future integration with Google Analytics or Mixpanel
  // For now, log to a dedicated table if needed
}

export async function trackPageView(page) {
  if (!consentGranted) return
  
  console.log(`[Analytics] Page View: ${page}`)
}

export default {
  setAnalyticsConsent,
  trackEvent,
  trackPageView
}
