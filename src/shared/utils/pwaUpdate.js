/**
 * Checks for a newer service worker and refreshes the application.
 * The reload is intentionally explicit: the user requested a manual update
 * action from the installed application's profile screen.
 */
export async function updatePwaApp({ serviceWorker, reload } = {}) {
  const sw = serviceWorker || (typeof navigator !== 'undefined' ? navigator.serviceWorker : null)
  const refresh = reload || (() => window.location.reload())

  if (!sw) {
    refresh()
    return { supported: false, updated: false }
  }

  const registration = sw.getRegistration
    ? await sw.getRegistration()
    : await sw.ready

  if (!registration) {
    refresh()
    return { supported: true, updated: false }
  }

  await registration.update()

  const installing = registration.installing
  if (installing) {
    await new Promise((resolve) => {
      if (installing.state === 'installed' || installing.state === 'activated') {
        resolve()
        return
      }
      const onStateChange = () => {
        if (installing.state !== 'installed' && installing.state !== 'activated') return
        installing.removeEventListener('statechange', onStateChange)
        resolve()
      }
      installing.addEventListener('statechange', onStateChange)
    })
  }

  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  } else {
    refresh()
  }

  return { supported: true, updated: Boolean(registration.waiting) }
}
