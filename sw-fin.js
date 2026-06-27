const CACHE_NAME = 'fin-v1'

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ─── PUSH NOTIFICATIONS ────────────────────────────────────
self.addEventListener('push', event => {
  let payload = { title: 'Portal FIN', body: '', data: {}, actions: [] }
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() } } catch { payload.body = event.data.text() }
  }

  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: 'fin-push',
    lang: 'es',
    dir: 'ltr',
    actions: payload.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Portal FIN', options)
      .then(() => {
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
          clientList.forEach(client => client.postMessage({
            type: 'PUSH_RECEIVED',
            notification: { title: payload.title, body: options.body, data: options.data },
          }))
        })
      })
      .catch(err => console.error('[SW-Fin] Error showing notification:', err))
  )
})

// ─── NOTIFICATION CLICK ────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const finClient = clientList.find(c => c.url.includes('fin'))
      if (finClient) return finClient.focus()
      return clients.openWindow('/fin.html#/dashboard')
    })
  )
})

// ─── MESSAGES FROM APP ─────────────────────────────────────
self.addEventListener('message', event => {
  if (!event.data) return
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting()
})
