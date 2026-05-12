/**
 * Analytics service
 * Tracks user behavior (consent-based, GDPR compliant)
 */

let analyticsEnabled = false
let userContext = null

/**
 * Initialize analytics with user consent
 * @param {Object} options
 * @param {boolean} options.enabled - Analytics enabled
 * @param {boolean} options.consent - User has given consent
 */
export function initAnalytics(options = {}) {
  const { enabled = false, consent = false } = options
  analyticsEnabled = enabled && consent
  console.log('[Analytics] Initialized, enabled:', analyticsEnabled)
}

/**
 * Check if analytics is enabled
 */
export function isEnabled() {
  return analyticsEnabled
}

/**
 * Track a user event
 * @param {string} event - Event name
 * @param {Object} properties - Event properties
 * @returns {boolean} Whether event was tracked
 */
export function trackEvent(event, properties = {}) {
  if (!analyticsEnabled) {
    return false
  }

  const payload = {
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      user_id: userContext?.id,
    },
  }

  console.log('[Analytics]', event, payload)
  return true
}

/**
 * Set user context
 * @param {string} userId - User ID
 * @param {Object} properties - User properties
 */
export function setUser(userId, properties = {}) {
  userContext = {
    id: userId,
    ...properties,
  }
  console.log('[Analytics] User set:', userId)
}

/**
 * Track page view
 * @param {string} path - Page path
 */
export function trackPageView(path) {
  return trackEvent('page_view', { path })
}

/**
 * Track button click
 * @param {string} buttonId - Button identifier
 * @param {string} context - Context where clicked
 */
export function trackButtonClick(buttonId, context) {
  return trackEvent('button_click', { button_id: buttonId, context })
}

/**
 * Track form submission
 * @param {string} formId - Form identifier
 * @param {boolean} success - Whether submission was successful
 */
export function trackFormSubmit(formId, success) {
  return trackEvent('form_submit', { form_id: formId, success })
}

/**
 * Reset analytics (user logout)
 */
export function resetAnalytics() {
  userContext = null
  console.log('[Analytics] Reset')
}

export default {
  initAnalytics,
  isEnabled,
  trackEvent,
  setUser,
  trackPageView,
  trackButtonClick,
  trackFormSubmit,
  resetAnalytics,
}