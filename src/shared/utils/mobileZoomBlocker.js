/**
 * Prevent browser zoom gestures on touch devices while preserving normal
 * single-finger scrolling and interaction.
 */
export function disableMobileZoom() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}

  const hasTouch = 'ontouchstart' in window || Number(navigator.maxTouchPoints) > 0
  if (!hasTouch) return () => {}

  const preventPinch = (event) => {
    if (event.touches?.length > 1 && event.cancelable) event.preventDefault()
  }
  const preventSafariGesture = (event) => {
    if (event.cancelable) event.preventDefault()
  }
  const preventTrackpadZoom = (event) => {
    if (event.ctrlKey && event.cancelable) event.preventDefault()
  }

  document.addEventListener('touchmove', preventPinch, { passive: false })
  document.addEventListener('gesturestart', preventSafariGesture, { passive: false })
  document.addEventListener('gesturechange', preventSafariGesture, { passive: false })
  document.addEventListener('gestureend', preventSafariGesture, { passive: false })
  document.addEventListener('wheel', preventTrackpadZoom, { passive: false })

  return () => {
    document.removeEventListener('touchmove', preventPinch)
    document.removeEventListener('gesturestart', preventSafariGesture)
    document.removeEventListener('gesturechange', preventSafariGesture)
    document.removeEventListener('gestureend', preventSafariGesture)
    document.removeEventListener('wheel', preventTrackpadZoom)
  }
}
