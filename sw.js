const CACHE_NAME = 'sistema-academico-v2';
const STATIC_PRECACHE = ['/', '/index.html']; // Ampliar con build tool

self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_PRECACHE).catch(err => {
        console.warn('[SW] Fallo al precachear algunos recursos', err);
      });
    })
  );
  // No forzar activación inmediata en producción; mejor notificar al usuario.
});

self.addEventListener('activate', event => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Eliminando caché antigua:', key);
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo mismo origen y GET
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Ignorar herramientas de desarrollo (Vite HMR, etc.)
  if (url.pathname.includes('@vite') || url.pathname.includes('@fs') || url.search.includes('import') || url.search.includes('t=')) return;

  // Estrategia según tipo de recurso
  if (request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    // Navegación: network first
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API: stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?)$/)) {
    // Recursos estáticos versionados o no: stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Otros: cache first como fallback
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Sin conexión', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// ─── PUSH NOTIFICATIONS ────────────────────────────────────
self.addEventListener('push', event => {
  console.log('[SW] Push recibido');
  let data = { title: 'SOI', body: 'Nueva notificación', tag: 'soi-general' };
  if (event.data) {
    try { data = event.data.json(); } catch { data.body = event.data.text(); }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || 'soi-push',
    lang: 'es-DO',
    dir: 'ltr',
    renotify: data.renotify || false,
    actions: data.actions || [] // Soportar botones interactivos (ej: Responder, Marcar Leído, etc.)
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SOI', options)
      .then(() => {
        // Notificar a pestañas abiertas
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
          clients.forEach(client => client.postMessage({
            type: 'PUSH_RECEIVED',
            notification: { title: data.title, body: options.body, data: options.data }
          }));
        });
      })
      .catch(err => console.error('[SW] Error mostrando notificación:', err))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const clickedAction = event.action;

  // Si se hizo click en un botón de acción interactiva (ej: marcar leída sin abrir la app)
  if (clickedAction) {
    console.log(`[SW] Acción interactiva clickeada: ${clickedAction}`);
    event.waitUntil(
      handleBackgroundAction(clickedAction, data)
    );
    return;
  }

  const targetUrl = resolveNotificationUrl(data);
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Buscar pestaña del portal abierta y enfocarla
      for (const client of windowClients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE_TO', url: targetUrl });
          return;
        }
      }
      // Si no, abrir nueva con URL absoluta
      const fullUrl = new URL(targetUrl, self.registration.scope).href;
      return clients.openWindow(fullUrl);
    })
  );
});

/**
 * Procesa acciones rápidas de notificaciones en segundo plano sin abrir la app.
 */
async function handleBackgroundAction(action, data) {
  console.log(`[SW] Procesando acción background: ${action}`, data);

  // Notificar a las pestañas activas si están abiertas para que actualicen sus contadores
  try {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientsList.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_ACTION_CLICKED',
        action,
        data
      });
    });
  } catch (err) {
    console.warn('[SW] Error enviando mensaje a pestañas:', err.message);
  }

  // Ejemplo de acción directa contra Supabase en segundo plano:
  // Marcar una notificación como leída directamente usando el endpoint REST de Supabase
  if (action === 'mark-read' && data.notification_id) {
    try {
      const supabaseUrl = 'https://zmhmdvmyeyswunurcyow.supabase.co';
      const anonKey = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P';

      const res = await fetch(`${supabaseUrl}/rest/v1/notificaciones?id=eq.${data.notification_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          estado: 'leida',
          leida_en: new Date().toISOString()
        })
      });
      console.log(`[SW] Notificación ${data.notification_id} marcada como leída en background. Status: ${res.status}`);
    } catch (err) {
      console.error('[SW] Error marcando leída en segundo plano:', err.message);
    }
  }
}

function resolveNotificationUrl(data) {
  if (data.url) return data.url; // El backend ya envió URL completa o hash
  const tipo = data.tipo || data.type || '';
  const claseId = data.clase_id || data.claseId;
  const alumnoId = data.alumno_id || data.alumnoId;
  const fecha = data.fecha || new Date().toISOString().split('T')[0];

  switch (tipo) {
    case 'sesion_sin_registrar':
    case 'recordatorio_clase':
      return claseId ? `#/asistencia?clase=${claseId}&fecha=${fecha}` : '#/hoy';
    case 'mensaje_admin': return '#/perfil';
    case 'tarea_vencida': return alumnoId ? `#/alumno?id=${alumnoId}` : '#/hoy';
    default: return '#/hoy';
  }
}

// ─── MENSAJES DESDE LA APP ─────────────────────────────────
self.addEventListener('message', event => {
  if (!event.data) return;
  // Solo se deja el mensaje SKIP_WAITING para desarrollo si se requiere
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Las alertas locales ya no se manejan aquí.
});