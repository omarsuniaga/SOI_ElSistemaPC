const CACHE_NAME = 'sistema-academico-v6';
const STATIC_PRECACHE = ['/', '/index.html', '/offline.html', '/manifest.json'];

self.addEventListener('install', event => {
  console.log('[SW] Instalando nueva versión...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_PRECACHE).catch(err => {
        console.warn('[SW] Fallo al precachear algunos recursos', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activando y purgando cachés anteriores...');
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Eliminando caché antigua:', key);
          return caches.delete(key);
        })
      );
      try {
        await self.clients.claim();
      } catch (err) {
        console.warn('[SW] clients.claim warning:', err);
      }
    })()
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE' || event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    );
  }
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo mismo origen y GET
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Ignorar herramientas de desarrollo (Vite HMR, imports CSS/ESM, node_modules, etc.)
  if (
    url.pathname.includes('@vite') ||
    url.pathname.includes('@fs') ||
    url.pathname.startsWith('/node_modules/') ||
    url.search.includes('import') ||
    url.search.includes('direct') ||
    url.search.includes('t=')
  ) return;

  // Estrategia según tipo de recurso:
  // 1. Navegación y código fuente (HTML, JS, CSS, MJS): NETWORK FIRST obligatorio
  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    url.pathname.match(/\.(js|mjs|css)$/)
  ) {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API: network first con fallback
    event.respondWith(networkFirst(request));
  } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff2?)$/)) {
    // Recursos estáticos pesados (fuentes/imágenes): stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Otros: network first
    event.respondWith(networkFirst(request));
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
    if (cached) return cached;
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Sin conexión', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response && response.ok && !isHtmlFallbackForAsset(request, response)) {
      cache.put(request, response.clone());
    }
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

function isHtmlFallbackForAsset(request, response) {
  const url = new URL(request.url);
  const isAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?)$/);
  const contentType = response.headers.get('content-type') || '';
  return Boolean(isAsset && contentType.includes('text/html'));
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

  // Ejecutar la acción de verdad contra el backend (no depende de que haya una
  // pestaña abierta). Usa el JWT del maestro persistido vía el bridge de IndexedDB.
  if (VALID_BACKGROUND_ACTIONS.has(action) && data.notification_id) {
    await _executeNotificationAction(action, data.notification_id);
  }
}

const VALID_BACKGROUND_ACTIONS = new Set(['mark-read']);

async function _executeNotificationAction(action, notificationId) {
  try {
    const { accessToken, anonKey, supabaseUrl } = await _getFreshAccessToken();
    if (!accessToken || !anonKey || !supabaseUrl) {
      console.warn('[SW] Sin credenciales frescas para ejecutar la acción en backend:', action);
      return;
    }
    const res = await fetch(`${supabaseUrl}/functions/v1/notification-actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ notification_id: notificationId, action }),
    });
    if (!res.ok) {
      console.warn(`[SW] notification-actions respondió ${res.status} para acción ${action}`);
    }
  } catch (err) {
    console.error('[SW] Error ejecutando acción en backend:', err.message);
  }
}

function resolveNotificationUrl(data) {
  // 1. Explicit hash URL from backend (already resolved)
  if (data.url) return data.url;

  // 2. deepLink from Edge Functions — use directly if it's a hash, ignore custom schemes
  if (data.deepLink && data.deepLink.startsWith('#')) return data.deepLink;

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
});

// ─── AUTH BRIDGE (IndexedDB) ────────────────────────────────
// El SW no tiene acceso a localStorage ni a import.meta.env. pushService.js
// (hilo principal) persiste aquí el JWT de sesión y la VAPID key para que el SW
// pueda autenticar llamadas en background (pushsubscriptionchange, botones de
// acción) incluso horas después, con el teléfono bloqueado y sin pestañas abiertas.
const AUTH_BRIDGE_DB = 'soi-push-bridge';
const AUTH_BRIDGE_STORE = 'kv';

function _openBridgeDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(AUTH_BRIDGE_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(AUTH_BRIDGE_STORE)) {
        req.result.createObjectStore(AUTH_BRIDGE_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function _getBridgeValue(key) {
  try {
    const db = await _openBridgeDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(AUTH_BRIDGE_STORE, 'readonly');
      const req = tx.objectStore(AUTH_BRIDGE_STORE).get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function _setBridgeValue(key, value) {
  try {
    const db = await _openBridgeDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(AUTH_BRIDGE_STORE, 'readwrite');
      tx.objectStore(AUTH_BRIDGE_STORE).put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[SW] No se pudo escribir en el bridge de auth:', err.message);
  }
}

function _decodeJwtSub(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(json).sub || null;
  } catch {
    return null;
  }
}

/**
 * El access_token persistido puede llevar horas vencido si el SW despierta con
 * la app cerrada. Se intenta refrescar con el refresh_token antes de usarlo,
 * ya que aquí no hay un cliente supabase-js con auto-refresh vivo.
 */
async function _getFreshAccessToken() {
  const [supabaseUrl, anonKey, refreshToken, accessToken] = await Promise.all([
    _getBridgeValue('supabase_url'),
    _getBridgeValue('supabase_anon_key'),
    _getBridgeValue('refresh_token'),
    _getBridgeValue('access_token'),
  ]);

  if (!supabaseUrl || !anonKey || !refreshToken) {
    return { accessToken, anonKey, supabaseUrl };
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res.ok) {
      const refreshed = await res.json();
      await Promise.all([
        _setBridgeValue('access_token', refreshed.access_token),
        _setBridgeValue('refresh_token', refreshed.refresh_token),
      ]);
      return { accessToken: refreshed.access_token, anonKey, supabaseUrl };
    }
  } catch (err) {
    console.warn('[SW] No se pudo refrescar el token en background:', err.message);
  }

  return { accessToken, anonKey, supabaseUrl };
}

function _urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// ─── RENOVACIÓN DE SUSCRIPCIÓN EN BACKGROUND ────────────────
// El navegador puede rotar/invalidar la suscripción push sin que la app esté
// abierta. Sin este handler, esa suscripción quedaba huérfana en push_subscriptions
// y el maestro dejaba de recibir push silenciosamente.
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(_resubscribeAndPersist(event.newSubscription));
});

async function _resubscribeAndPersist(providedNewSubscription) {
  try {
    let subscription = providedNewSubscription;
    if (!subscription) {
      const vapidKey = await _getBridgeValue('vapid_public_key');
      if (!vapidKey) {
        console.warn('[SW] pushsubscriptionchange sin VAPID key en el bridge; no se puede re-suscribir.');
        return;
      }
      subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _urlBase64ToUint8Array(vapidKey),
      });
    }

    const { accessToken, anonKey, supabaseUrl } = await _getFreshAccessToken();
    const profileId = accessToken ? _decodeJwtSub(accessToken) : null;
    if (!accessToken || !anonKey || !supabaseUrl || !profileId) {
      console.warn('[SW] Sin credenciales frescas para persistir la nueva suscripción push.');
      return;
    }

    const subJSON = subscription.toJSON();
    const res = await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify([{
        profile_id: profileId,
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth,
        activo: true,
        updated_at: new Date().toISOString(),
      }]),
    });
    if (!res.ok) {
      console.warn('[SW] Falló la persistencia de la nueva suscripción push:', res.status);
    }
  } catch (err) {
    console.error('[SW] Error re-suscribiendo push tras pushsubscriptionchange:', err.message);
  }
}
