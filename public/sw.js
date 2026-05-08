const CACHE_NAME = 'sistema-academico-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const STATIC_ASSETS_BUILD = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS_BUILD).catch(() => {
        console.log('[SW] Some assets failed to cache, continuing anyway');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  let data = { title: 'SOI', body: 'Nueva notificación' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'SOI', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Nueva notificación del Sistema Académico',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SOI', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

// ── Alertas locales programadas ──────────────────────────────

let _scheduledTimers = [];

function _clearScheduledAlerts() {
  _scheduledTimers.forEach(id => clearTimeout(id));
  _scheduledTimers = [];
}

function _scheduleAlert(ms, title, body, data) {
  if (ms <= 0) return;
  const id = setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      data: data || {},
      vibrate: [200, 100, 200],
      tag: `local-${Date.now()}`,
    });
  }, ms);
  _scheduledTimers.push(id);
}

function _processScheduleAlerts(payload) {
  _clearScheduledAlerts();

  const { horarios, sesionesRegistradas, prefs } = payload;
  const ahora = Date.now();
  const registradas = new Set(sesionesRegistradas || []);

  for (const h of horarios) {
    // Saltar clases ya registradas
    if (registradas.has(h.clase_id)) continue;

    const nombre = h.clase_nombre || 'Tu clase';

    // Alerta PRE-CLASE: X minutos antes del inicio
    if (prefs.alerta_pre_clase && h.hora_inicio) {
      const [hh, mm] = h.hora_inicio.split(':');
      const inicio = new Date();
      inicio.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      const msAntes = inicio.getTime() - (prefs.min_antes_clase * 60000) - ahora;
      if (msAntes > 0) {
        _scheduleAlert(msAntes,
          '🎵 Clase por empezar',
          `${nombre} empieza en ${prefs.min_antes_clase} minutos.`,
          { url: '/maestros#/hoy' }
        );
      }
    }

    // Alerta POST-CLASE: X minutos después sin registrar
    if (prefs.alerta_post_clase && h.hora_fin) {
      const [hh, mm] = h.hora_fin.split(':');
      const fin = new Date();
      fin.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      const msPost = fin.getTime() + (prefs.min_post_clase_sin_registro * 60000) - ahora;
      if (msPost > 0) {
        _scheduleAlert(msPost,
          '⚠️ Clase sin registrar',
          `${nombre} terminó hace ${prefs.min_post_clase_sin_registro} min y no registraste asistencia.`,
          { url: '/maestros#/hoy' }
        );
      }
    }
  }

  console.log(`[SW] ${_scheduledTimers.length} alertas programadas para hoy`);
}

// ── Message handler ──────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'SCHEDULE_ALERTS':
      _processScheduleAlerts(event.data);
      break;
    default:
      console.log('[SW] Unknown message:', event.data.type);
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, returning offline fallback');
    return caches.match('/');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}