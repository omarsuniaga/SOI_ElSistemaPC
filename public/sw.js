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

  // IGNORAR peticiones internas de Vite (HMR) para que no se rompa el WebSocket en desarrollo local
  if (url.pathname.includes('@vite') || url.pathname.includes('@fs') || url.search.includes('import') || url.search.includes('t=')) {
    return;
  }

  // Estrategia diferenciada por tipo de archivo
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match(request);
  }
}

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
    badge: '/icons/icon-96.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || 'soi-push-notification'
  };

  // Notificar a las pestañas abiertas que llegó un push
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'SOI', options),
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            notification: {
              title: data.title,
              body: options.body,
              data: options.data
            }
          });
        });
      })
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag, '| action:', event.action);
  event.notification.close();

  // Acción "dismiss": solo cerrar, no navegar
  if (event.action === 'dismiss') return;

  const data = event.notification.data || {};

  // Resolver la ruta correcta según el tipo de notificación
  const targetHash = _resolveRoute(data);
  const baseUrl = self.registration.scope; // ej: https://soi.com/
  const urlToOpen = `${baseUrl}maestros.html${targetHash}`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Si ya hay una ventana con el portal abierto → enfocarla y navegar
        for (const client of windowClients) {
          if (client.url.includes('maestros') && 'focus' in client) {
            client.focus();
            // Enviar mensaje al cliente para que el router navegue sin reload
            client.postMessage({
              type: 'NAVIGATE_TO',
              hash: targetHash,
            });
            return;
          }
        }
        // Sin ventana abierta → abrir la URL directamente
        return clients.openWindow(urlToOpen);
      })
  );
});

/**
 * Resuelve el hash de navegación in-app a partir de los datos de la notificación.
 * Mapea tipo + ids a la ruta concreta del SPA.
 */
function _resolveRoute(data) {
  // Si el backend envió una URL explícita, usarla directamente
  if (data.url && data.url !== '/') {
    // Convertir rutas absolutas a hashes si hace falta
    if (data.url.startsWith('#')) return data.url;
    if (data.url.includes('#')) return '#' + data.url.split('#')[1];
    return data.url;
  }

  const tipo = data.tipo || data.type || '';
  const claseId = data.clase_id || data.claseId;
  const alumnoId = data.alumno_id || data.alumnoId;
  const fecha = data.fecha || new Date().toISOString().split('T')[0];

  switch (tipo) {
    case 'sesion_sin_registrar':
    case 'recordatorio_clase':
      // Ir a la vista de asistencia de esa clase si hay clase_id, o a "hoy"
      return claseId
        ? `#/asistencia?clase=${claseId}&fecha=${fecha}`
        : '#/hoy';

    case 'mensaje_admin':
      return '#/perfil';

    case 'tarea_vencida':
      return alumnoId
        ? `#/alumno?id=${alumnoId}`
        : '#/hoy';

    case 'in_app':
    default:
      return '#/hoy';
  }
}



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