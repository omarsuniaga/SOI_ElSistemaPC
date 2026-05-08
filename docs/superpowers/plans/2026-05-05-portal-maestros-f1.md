# Portal Maestros F1 — Fundación Offline-First — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la base completa del Portal Maestros: segundo entry point Vite, auth con detección de rol, arquitectura IndexedDB + sync queue, indicador de sincronización, Vista Hoy (básica) y Calendario (cuadrícula mensual con colores de estado).

**Architecture:** Segunda SPA Vanilla JS que comparte Supabase y el client de autenticación con el admin pero tiene su propio entry point (`maestros.html`), router hash-based, estilos mobile-first y una capa de persistencia offline-first sobre IndexedDB (biblioteca `idb`). Toda acción del maestro escribe primero en IndexedDB y sincroniza a Supabase en background.

**Tech Stack:** Vite 8 (multi-entry), Vanilla JS ES modules, Supabase JS v2 (compartido), `idb` v8 (IndexedDB wrapper), Vitest + jsdom (tests), CSS custom properties (sin Bootstrap en portal).

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Modificar | `vite.config.js` |
| Crear | `maestros.html` |
| Crear | `src/main-maestros.js` |
| Crear | `src/portal-maestros/styles/portal.css` |
| Crear | `src/portal-maestros/auth/maestroAuth.js` |
| Crear | `src/portal-maestros/auth/usePortalAuth.js` |
| Crear | `src/portal-maestros/router/portalRouter.js` |
| Crear | `src/portal-maestros/services/offlineQueue.js` |
| Crear | `src/portal-maestros/views/loginView.js` |
| Crear | `src/portal-maestros/views/hoyView.js` |
| Crear | `src/portal-maestros/views/calendarioView.js` |
| Crear | `src/portal-maestros/views/metricasView.js` (stub) |
| Crear | `tests/portal-maestros/offlineQueue.test.js` |
| Crear | `tests/portal-maestros/maestroAuth.test.js` |
| Crear | `tests/portal-maestros/portalRouter.test.js` |

---

## Task 1: Vite multi-entry + maestros.html

**Files:**
- Modify: `vite.config.js`
- Create: `maestros.html`

- [ ] **Step 1: Actualizar vite.config.js para multi-entry**

Reemplazar el contenido completo de `vite.config.js`:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        admin:    'index.html',
        maestros: 'maestros.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('supabase')) return 'supabase'
          if (id.includes('bootstrap')) return 'vendor'
          if (id.includes('idb'))       return 'idb'
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'idb']
  },
  server: {
    host: true,
    port: 5173
  }
})
```

- [ ] **Step 2: Crear maestros.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="#6366f1" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <title>Portal Maestros — SOI</title>
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</head>
<body>
  <div id="portal-app"></div>
  <script type="module" src="/src/main-maestros.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verificar que el servidor arranca sin errores**

```bash
npm run dev
```

Navegar a `http://localhost:5173/maestros.html`. Debe mostrar página en blanco sin errores en consola (el div `#portal-app` está vacío por ahora).

- [ ] **Step 4: Commit**

```bash
git add vite.config.js maestros.html
git commit -m "feat: add maestros.html multi-entry Vite config"
```

---

## Task 2: Instalar idb + crear offlineQueue.js

**Files:**
- Create: `src/portal-maestros/services/offlineQueue.js`
- Create: `tests/portal-maestros/offlineQueue.test.js`

- [ ] **Step 1: Instalar biblioteca idb**

```bash
npm install idb
```

Verificar que aparece en `package.json` en `dependencies`.

- [ ] **Step 2: Escribir el test primero**

Crear `tests/portal-maestros/offlineQueue.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock de idb: devuelve un store en memoria
vi.mock('idb', () => {
  const store = new Map()
  const mockDB = {
    add: vi.fn(async (storeName, item) => {
      const id = Date.now() + Math.random()
      store.set(id, { ...item, id })
      return id
    }),
    getAll: vi.fn(async () => [...store.values()]),
    delete: vi.fn(async (storeName, id) => store.delete(id)),
    transaction: vi.fn(() => ({ store: { getAll: vi.fn(async () => [...store.values()]) } })),
  }
  return {
    openDB: vi.fn(async () => mockDB),
    __mockDB: mockDB,
    __store: store,
  }
})

import { enqueue, getQueue, dequeue, clearQueue } from '../../src/portal-maestros/services/offlineQueue.js'

describe('offlineQueue', () => {
  beforeEach(async () => {
    const { __store } = await import('idb')
    __store.clear()
  })

  it('enqueue adds item to the queue', async () => {
    await enqueue({ tabla: 'sesiones_clase', operacion: 'insert', payload: { id: '1' } })
    const queue = await getQueue()
    expect(queue.length).toBe(1)
    expect(queue[0].tabla).toBe('sesiones_clase')
    expect(queue[0].operacion).toBe('insert')
  })

  it('dequeue removes item from queue', async () => {
    const { __mockDB } = await import('idb')
    await enqueue({ tabla: 'asistencia_sesion', operacion: 'insert', payload: { id: '2' } })
    const queue = await getQueue()
    await dequeue(queue[0].id)
    expect(__mockDB.delete).toHaveBeenCalled()
  })

  it('getQueue returns all pending items', async () => {
    await enqueue({ tabla: 'sesiones_clase', operacion: 'insert', payload: { id: 'a' } })
    await enqueue({ tabla: 'sesiones_clase', operacion: 'update', payload: { id: 'b' } })
    const queue = await getQueue()
    expect(queue.length).toBe(2)
  })
})
```

- [ ] **Step 3: Ejecutar el test — debe fallar**

```bash
npx vitest run tests/portal-maestros/offlineQueue.test.js
```

Esperado: FAIL — `Cannot find module '../../src/portal-maestros/services/offlineQueue.js'`

- [ ] **Step 4: Implementar offlineQueue.js**

Crear `src/portal-maestros/services/offlineQueue.js`:

```js
import { openDB } from 'idb'

const DB_NAME    = 'portal-maestros'
const DB_VERSION = 1
const STORE_NAME = 'sync_queue'

/** @type {import('idb').IDBPDatabase | null} */
let _db = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath:       'id',
          autoIncrement: true,
        })
        store.createIndex('by_created_at', 'created_at')
      }
    },
  })
  return _db
}

/**
 * Agrega una operación a la cola de sincronización.
 * @param {{ tabla: string, operacion: 'insert'|'update'|'delete', payload: object }} item
 */
export async function enqueue({ tabla, operacion, payload }) {
  const db = await getDB()
  await db.add(STORE_NAME, {
    tabla,
    operacion,
    payload,
    intentos: 0,
    created_at: new Date().toISOString(),
  })
}

/**
 * Devuelve todos los items pendientes en la cola, en orden FIFO.
 * @returns {Promise<Array>}
 */
export async function getQueue() {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

/**
 * Elimina un item de la cola por su id (tras sincronización exitosa).
 * @param {number} id
 */
export async function dequeue(id) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/**
 * Limpia toda la cola (uso en tests o reset manual).
 */
export async function clearQueue() {
  const db = await getDB()
  const tx    = db.transaction(STORE_NAME, 'readwrite')
  await tx.store.clear()
  await tx.done
}

/**
 * Procesa la cola: intenta sincronizar cada item con Supabase.
 * Llama a `syncFn` por cada item. Si tiene éxito, lo elimina.
 * Si falla, incrementa intentos (máximo 5 reintentos).
 * @param {(item: object) => Promise<void>} syncFn
 */
export async function processQueue(syncFn) {
  const queue = await getQueue()
  for (const item of queue) {
    try {
      await syncFn(item)
      await dequeue(item.id)
    } catch (_err) {
      // Incrementar intentos en el registro
      const db = await getDB()
      const MAX_INTENTOS = 5
      if (item.intentos >= MAX_INTENTOS) {
        await dequeue(item.id) // Descartar tras N fallos
      } else {
        await db.put(STORE_NAME, { ...item, intentos: item.intentos + 1 })
      }
    }
  }
}
```

- [ ] **Step 5: Correr los tests — deben pasar**

```bash
npx vitest run tests/portal-maestros/offlineQueue.test.js
```

Esperado: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/portal-maestros/services/offlineQueue.js tests/portal-maestros/offlineQueue.test.js package.json package-lock.json
git commit -m "feat: add IndexedDB offline queue service with tests"
```

---

## Task 3: maestroAuth.js + usePortalAuth.js

**Files:**
- Create: `src/portal-maestros/auth/maestroAuth.js`
- Create: `src/portal-maestros/auth/usePortalAuth.js`
- Create: `tests/portal-maestros/maestroAuth.test.js`

- [ ] **Step 1: Escribir el test primero**

Crear `tests/portal-maestros/maestroAuth.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de supabaseClient
vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  }
}))

import { supabase } from '../../src/lib/supabaseClient.js'
import { loginMaestro, detectarRolMaestro, logoutPortal } from '../../src/portal-maestros/auth/maestroAuth.js'

describe('maestroAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('loginMaestro retorna error si Supabase falla', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' }
    })

    const result = await loginMaestro('x@x.com', 'wrong')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid login credentials')
  })

  it('loginMaestro retorna error si el user_id no existe en tabla maestros', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'tok' },
        user: { id: 'uid-123', email: 'x@x.com' }
      },
      error: null
    })

    // Simular que no existe en maestros
    const selectMock = { data: null, error: { message: 'No rows' } }
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(selectMock)
    })

    const result = await loginMaestro('x@x.com', 'pass')
    expect(result.success).toBe(false)
    expect(result.error).toContain('acceso de maestro')
  })

  it('loginMaestro retorna success con maestro si existe en tabla', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'tok' },
        user: { id: 'uid-123', email: 'x@x.com' }
      },
      error: null
    })

    const maestroMock = { id: 'maestro-1', user_id: 'uid-123', nombre_completo: 'Ana López' }
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: maestroMock, error: null })
    })

    const result = await loginMaestro('x@x.com', 'pass')
    expect(result.success).toBe(true)
    expect(result.maestro.nombre_completo).toBe('Ana López')
  })

  it('detectarRolMaestro devuelve null si no hay sesión', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    const maestro = await detectarRolMaestro()
    expect(maestro).toBeNull()
  })
})
```

- [ ] **Step 2: Ejecutar — debe fallar**

```bash
npx vitest run tests/portal-maestros/maestroAuth.test.js
```

Esperado: FAIL — `Cannot find module`

- [ ] **Step 3: Implementar maestroAuth.js**

Crear `src/portal-maestros/auth/maestroAuth.js`:

```js
import { supabase } from '../../lib/supabaseClient.js'

const STORAGE_KEY = 'portal-maestros:maestro'

/**
 * Login con email + password. Verifica que el user_id exista en tabla maestros.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, maestro?: object, error?: string}>}
 */
export async function loginMaestro(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Error de autenticación' }
  }

  // Verificar que el usuario tiene rol de maestro
  const { data: maestro, error: errMaestro } = await supabase
    .from('maestros')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  if (errMaestro || !maestro) {
    await supabase.auth.signOut()
    return { success: false, error: 'No tenés acceso de maestro en este sistema.' }
  }

  // Guardar en localStorage para acceso rápido
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maestro))

  return { success: true, maestro, session: data.session }
}

/**
 * Detecta el maestro activo desde la sesión de Supabase.
 * Útil al recargar la página (refresh de sesión).
 * @returns {Promise<object|null>}
 */
export async function detectarRolMaestro() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }

  // Intentar desde caché local primero
  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached) {
    try { return JSON.parse(cached) } catch { /* corrupted, continuar */ }
  }

  // Buscar en Supabase
  const { data: maestro, error } = await supabase
    .from('maestros')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error || !maestro) {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(maestro))
  return maestro
}

/**
 * Cierra sesión del portal maestros.
 */
export async function logoutPortal() {
  localStorage.removeItem(STORAGE_KEY)
  await supabase.auth.signOut()
}

/**
 * Devuelve el maestro cacheado en localStorage (sync, sin await).
 * @returns {object|null}
 */
export function getMaestroLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Implementar usePortalAuth.js**

Crear `src/portal-maestros/auth/usePortalAuth.js`:

```js
import { detectarRolMaestro, getMaestroLocal, logoutPortal } from './maestroAuth.js'

const state = {
  maestro:  null,
  loading:  true,
  listeners: [],
}

function notify() {
  state.listeners.forEach(fn => fn({ ...state }))
}

export const usePortalAuth = {
  /** Suscribirse a cambios de estado. Devuelve función de cleanup. */
  subscribe(fn) {
    state.listeners.push(fn)
    return () => { state.listeners = state.listeners.filter(l => l !== fn) }
  },

  /** Inicializa la sesión al cargar la app. */
  async init() {
    // Optimistic load desde caché para UX instantánea
    state.maestro = getMaestroLocal()
    state.loading  = true
    notify()

    // Verificación real con Supabase
    const maestro = await detectarRolMaestro()
    state.maestro = maestro
    state.loading  = false
    notify()

    return maestro
  },

  /** Establece el maestro activo tras login exitoso. */
  setMaestro(maestro) {
    state.maestro = maestro
    state.loading  = false
    notify()
  },

  async logout() {
    await logoutPortal()
    state.maestro = null
    notify()
  },

  getMaestro: () => state.maestro,
  isAuthenticated: () => !!state.maestro,
  isLoading: () => state.loading,
}
```

- [ ] **Step 5: Ejecutar tests — deben pasar**

```bash
npx vitest run tests/portal-maestros/maestroAuth.test.js
```

Esperado: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/portal-maestros/auth/ tests/portal-maestros/maestroAuth.test.js
git commit -m "feat: add maestroAuth and usePortalAuth with role detection"
```

---

## Task 4: portalRouter.js (hash-based)

**Files:**
- Create: `src/portal-maestros/router/portalRouter.js`
- Create: `tests/portal-maestros/portalRouter.test.js`

- [ ] **Step 1: Escribir el test primero**

Crear `tests/portal-maestros/portalRouter.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPortalRouter } from '../../src/portal-maestros/router/portalRouter.js'

describe('portalRouter', () => {
  let router

  beforeEach(() => {
    // Limpiar hash
    window.location.hash = ''
    router = createPortalRouter()
  })

  it('devuelve ruta actual desde hash', () => {
    window.location.hash = '#/hoy'
    expect(router.currentRoute()).toBe('hoy')
  })

  it('devuelve ruta por defecto si hash está vacío', () => {
    window.location.hash = ''
    expect(router.currentRoute()).toBe('calendario')
  })

  it('navigate cambia el hash y dispara handlers', () => {
    const handler = vi.fn()
    router.on('hoy', handler)
    router.navigate('hoy')
    expect(window.location.hash).toBe('#/hoy')
  })

  it('registrar handler para ruta desconocida usa fallback', () => {
    const fallback = vi.fn()
    router.onNotFound(fallback)
    router.navigate('inexistente')
    // Si no hay handler para 'inexistente', llama fallback
    router._dispatch('inexistente')
    expect(fallback).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Ejecutar — debe fallar**

```bash
npx vitest run tests/portal-maestros/portalRouter.test.js
```

Esperado: FAIL — `Cannot find module`

- [ ] **Step 3: Implementar portalRouter.js**

Crear `src/portal-maestros/router/portalRouter.js`:

```js
const DEFAULT_ROUTE = 'calendario'

/**
 * Crea una instancia del router hash-based del portal.
 * Rutas válidas: 'login', 'calendario', 'hoy', 'metricas', 'perfil', 'asistencia'
 */
export function createPortalRouter() {
  const handlers   = new Map()
  let notFoundFn   = null

  function currentRoute() {
    const hash = window.location.hash // '#/hoy'
    if (!hash || hash === '#' || hash === '#/') return DEFAULT_ROUTE
    return hash.replace('#/', '')
  }

  function navigate(route) {
    window.location.hash = `#/${route}`
  }

  function on(route, handler) {
    handlers.set(route, handler)
  }

  function onNotFound(handler) {
    notFoundFn = handler
  }

  function _dispatch(route) {
    const handler = handlers.get(route)
    if (handler) {
      handler(route)
    } else if (notFoundFn) {
      notFoundFn(route)
    }
  }

  function start() {
    // Escuchar cambios de hash
    window.addEventListener('hashchange', () => {
      _dispatch(currentRoute())
    })
    // Despachar ruta inicial
    _dispatch(currentRoute())
  }

  return { currentRoute, navigate, on, onNotFound, start, _dispatch }
}
```

- [ ] **Step 4: Ejecutar tests — deben pasar**

```bash
npx vitest run tests/portal-maestros/portalRouter.test.js
```

Esperado: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/router/portalRouter.js tests/portal-maestros/portalRouter.test.js
git commit -m "feat: add hash-based portal router with tests"
```

---

## Task 5: Portal CSS (mobile-first)

**Files:**
- Create: `src/portal-maestros/styles/portal.css`

- [ ] **Step 1: Crear portal.css**

Crear `src/portal-maestros/styles/portal.css`:

```css
/* ============================================================
   PORTAL MAESTROS — Estilos mobile-first
   ============================================================ */

/* -- Variables ------------------------------------------------ */
:root {
  --pm-primary:        #6366f1;  /* Índigo */
  --pm-primary-dark:   #4f46e5;
  --pm-surface:        #ffffff;
  --pm-surface-2:      #f8fafc;
  --pm-text:           #0f172a;
  --pm-text-muted:     #64748b;
  --pm-border:         #e2e8f0;
  --pm-success:        #22c55e;
  --pm-warning:        #eab308;
  --pm-danger:         #ef4444;
  --pm-pending:        #f59e0b;

  /* Layout */
  --pm-bottom-nav-h:   64px;
  --pm-header-h:       52px;
  --pm-radius:         12px;
  --pm-radius-sm:      8px;
  --pm-shadow:         0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
}

[data-bs-theme="dark"], .pm-dark {
  --pm-surface:      #1e293b;
  --pm-surface-2:    #0f172a;
  --pm-text:         #f1f5f9;
  --pm-text-muted:   #94a3b8;
  --pm-border:       #334155;
}

/* -- Reset base ---------------------------------------------- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--pm-surface-2);
  color: var(--pm-text);
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}

#portal-app {
  display: flex;
  flex-direction: column;
  height: 100dvh;       /* dynamic viewport height — evita salto en móvil */
  overflow: hidden;
}

/* -- Header -------------------------------------------------- */
.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--pm-header-h);
  padding: 0 1rem;
  background: var(--pm-primary);
  color: #fff;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.pm-header-title {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -.01em;
}

.pm-header-right {
  display: flex;
  align-items: center;
  gap: .5rem;
}

/* -- Indicador de sincronización ----------------------------- */
.pm-sync-indicator {
  display: flex;
  align-items: center;
  gap: .25rem;
  font-size: .7rem;
  font-weight: 500;
  padding: .2rem .5rem;
  border-radius: 99px;
  transition: background .2s, color .2s;
}

.pm-sync-indicator.synced   { background: rgba(34,197,94,.18); color: #4ade80; }
.pm-sync-indicator.pending  { background: rgba(234,179,8,.18);  color: #fbbf24; }
.pm-sync-indicator.error    { background: rgba(239,68,68,.18);  color: #f87171; cursor: pointer; }

/* -- Contenedor de vistas ------------------------------------ */
.pm-view {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: calc(var(--pm-bottom-nav-h) + .5rem);
  -webkit-overflow-scrolling: touch;
}

/* -- Bottom nav --------------------------------------------- */
.pm-bottom-nav {
  display: flex;
  height: var(--pm-bottom-nav-h);
  background: var(--pm-surface);
  border-top: 1px solid var(--pm-border);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.pm-bottom-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--pm-text-muted);
  font-size: .65rem;
  font-weight: 500;
  padding: .4rem;
  transition: color .15s;
  position: relative;
}

.pm-bottom-tab i {
  font-size: 1.35rem;
  line-height: 1;
}

.pm-bottom-tab.active {
  color: var(--pm-primary);
}

.pm-bottom-tab.active::before {
  content: '';
  position: absolute;
  top: 0; left: 25%; right: 25%;
  height: 2px;
  background: var(--pm-primary);
  border-radius: 0 0 2px 2px;
}

/* -- Card genérico ------------------------------------------ */
.pm-card {
  background: var(--pm-surface);
  border-radius: var(--pm-radius);
  box-shadow: var(--pm-shadow);
  padding: 1rem;
  margin-bottom: .75rem;
}

.pm-card-row {
  display: flex;
  align-items: center;
  gap: .75rem;
}

/* -- Badge de estado ---------------------------------------- */
.pm-badge {
  display: inline-flex;
  align-items: center;
  gap: .2rem;
  font-size: .65rem;
  font-weight: 600;
  padding: .15rem .45rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.pm-badge-danger  { background: #fee2e2; color: #991b1b; }
.pm-badge-success { background: #dcfce7; color: #166534; }
.pm-badge-warning { background: #fef3c7; color: #92400e; }
.pm-badge-muted   { background: var(--pm-border); color: var(--pm-text-muted); }

/* -- Login view --------------------------------------------- */
.pm-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 2rem 1.5rem;
  background: var(--pm-primary);
}

.pm-login-logo {
  font-size: 3rem;
  color: #fff;
  margin-bottom: 1.5rem;
}

.pm-login-title {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: .25rem;
  text-align: center;
}

.pm-login-subtitle {
  color: rgba(255,255,255,.7);
  font-size: .875rem;
  margin-bottom: 2rem;
  text-align: center;
}

.pm-login-card {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: var(--pm-radius);
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}

.pm-input-group {
  margin-bottom: 1rem;
}

.pm-input-group label {
  display: block;
  font-size: .8rem;
  font-weight: 600;
  color: var(--pm-text-muted);
  margin-bottom: .35rem;
}

.pm-input {
  width: 100%;
  padding: .75rem 1rem;
  border: 1.5px solid var(--pm-border);
  border-radius: var(--pm-radius-sm);
  font-size: 1rem;
  color: var(--pm-text);
  background: var(--pm-surface);
  transition: border-color .15s;
  outline: none;
}

.pm-input:focus {
  border-color: var(--pm-primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,.12);
}

.pm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .875rem;
  border: none;
  border-radius: var(--pm-radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s, transform .1s;
}

.pm-btn:active { transform: scale(.98); }
.pm-btn:disabled { opacity: .6; cursor: not-allowed; }

.pm-btn-primary {
  background: var(--pm-primary);
  color: #fff;
}

.pm-btn-primary:hover:not(:disabled) { background: var(--pm-primary-dark); }

.pm-error-msg {
  color: var(--pm-danger);
  font-size: .8rem;
  margin-top: .75rem;
  text-align: center;
  min-height: 1.2em;
}

/* -- Calendario -------------------------------------------- */
.pm-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.pm-cal-day-header {
  text-align: center;
  font-size: .65rem;
  font-weight: 700;
  color: var(--pm-text-muted);
  padding: .4rem 0;
  text-transform: uppercase;
}

.pm-cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--pm-radius-sm);
  font-size: .85rem;
  cursor: pointer;
  position: relative;
  transition: background .1s;
}

.pm-cal-day:hover { background: var(--pm-border); }

.pm-cal-day.today {
  font-weight: 700;
  border: 2px solid var(--pm-primary);
}

/* Colores de estado según spec */
.pm-cal-day.estado-registrada { background: #dcfce7; color: #166534; }
.pm-cal-day.estado-pendiente  { background: #fef3c7; color: #92400e; }
.pm-cal-day.estado-vencida    { background: #fee2e2; color: #991b1b; }
.pm-cal-day.estado-sin-clase  { color: var(--pm-text-muted); }
.pm-cal-day.otro-mes          { opacity: .3; pointer-events: none; }

/* Dot indicador */
.pm-cal-day::after {
  content: '';
  position: absolute;
  bottom: 3px;
  width: 4px; height: 4px;
  border-radius: 50%;
  display: none;
}

.pm-cal-day.estado-registrada::after { display: block; background: #16a34a; }
.pm-cal-day.estado-pendiente::after  { display: block; background: #ca8a04; }
.pm-cal-day.estado-vencida::after    { display: block; background: #dc2626; }

/* Leyenda */
.pm-cal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem 1rem;
  margin-top: 1rem;
  font-size: .7rem;
  color: var(--pm-text-muted);
}

.pm-cal-legend-item {
  display: flex;
  align-items: center;
  gap: .3rem;
}

.pm-cal-legend-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
}

/* -- Hoy view (lista de clases) ----------------------------- */
.pm-clase-card {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  padding: .875rem 1rem;
  background: var(--pm-surface);
  border-radius: var(--pm-radius);
  box-shadow: var(--pm-shadow);
  margin-bottom: .65rem;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: border-color .15s;
}

.pm-clase-card.sin-registrar { border-left-color: var(--pm-danger); }
.pm-clase-card.registrada    { border-left-color: var(--pm-success); }

.pm-clase-nombre {
  font-weight: 700;
  font-size: 1rem;
}

.pm-clase-meta {
  font-size: .8rem;
  color: var(--pm-text-muted);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* -- Spinner ------------------------------------------------ */
.pm-spinner {
  width: 24px; height: 24px;
  border: 3px solid var(--pm-border);
  border-top-color: var(--pm-primary);
  border-radius: 50%;
  animation: pm-spin .7s linear infinite;
}

@keyframes pm-spin { to { transform: rotate(360deg); } }

.pm-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

/* -- Utilidades -------------------------------------------- */
.pm-empty {
  text-align: center;
  color: var(--pm-text-muted);
  padding: 3rem 1rem;
  font-size: .9rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/styles/portal.css
git commit -m "feat: add portal-maestros mobile-first CSS"
```

---

## Task 6: loginView.js

**Files:**
- Create: `src/portal-maestros/views/loginView.js`

- [ ] **Step 1: Implementar loginView.js**

Crear `src/portal-maestros/views/loginView.js`:

```js
import { loginMaestro } from '../auth/maestroAuth.js'
import { usePortalAuth } from '../auth/usePortalAuth.js'

/**
 * Renderiza la vista de login del portal maestros en el contenedor dado.
 * @param {HTMLElement} container
 * @param {{ onSuccess: () => void }} options
 */
export function renderLoginView(container, { onSuccess }) {
  container.innerHTML = `
    <div class="pm-login">
      <div class="pm-login-logo">🎵</div>
      <h1 class="pm-login-title">Portal Maestros</h1>
      <p class="pm-login-subtitle">SOI · Sistema Operativo Institucional</p>

      <div class="pm-login-card">
        <div class="pm-input-group">
          <label for="pm-email">Correo electrónico</label>
          <input
            type="email"
            id="pm-email"
            class="pm-input"
            placeholder="tu@correo.com"
            autocomplete="username"
            inputmode="email"
          />
        </div>

        <div class="pm-input-group">
          <label for="pm-password">Contraseña</label>
          <input
            type="password"
            id="pm-password"
            class="pm-input"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <button type="button" class="pm-btn pm-btn-primary" id="pm-login-btn">
          Iniciar sesión
        </button>

        <p class="pm-error-msg" id="pm-login-error" aria-live="polite"></p>
      </div>
    </div>
  `

  const emailInput    = container.querySelector('#pm-email')
  const passwordInput = container.querySelector('#pm-password')
  const loginBtn      = container.querySelector('#pm-login-btn')
  const errorMsg      = container.querySelector('#pm-login-error')

  async function handleLogin() {
    const email    = emailInput.value.trim()
    const password = passwordInput.value

    if (!email || !password) {
      errorMsg.textContent = 'Completá tu correo y contraseña.'
      return
    }

    loginBtn.disabled     = true
    loginBtn.textContent  = 'Ingresando...'
    errorMsg.textContent  = ''

    const result = await loginMaestro(email, password)

    if (result.success) {
      usePortalAuth.setMaestro(result.maestro)
      onSuccess()
    } else {
      errorMsg.textContent  = result.error
      loginBtn.disabled     = false
      loginBtn.textContent  = 'Iniciar sesión'
    }
  }

  loginBtn.addEventListener('click', handleLogin)

  passwordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin()
  })

  // Focus automático en email
  requestAnimationFrame(() => emailInput.focus())
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/views/loginView.js
git commit -m "feat: add portal login view"
```

---

## Task 7: hoyView.js (Vista básica de clases del día)

**Files:**
- Create: `src/portal-maestros/views/hoyView.js`

- [ ] **Step 1: Implementar hoyView.js**

Crear `src/portal-maestros/views/hoyView.js`:

```js
import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'

const DIAS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

/**
 * Renderiza la vista Hoy: lista de clases del día actual ordenadas por hora.
 * @param {HTMLElement} container
 * @param {{ onClaseClick?: (claseId: string) => void }} options
 */
export async function renderHoyView(container, { onClaseClick } = {}) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  const hoy     = new Date()
  const diaHoy  = DIAS_ES[hoy.getDay()]   // ej: 'lunes'
  const fechaStr = hoy.toISOString().split('T')[0] // ej: '2026-05-05'

  try {
    // 1. Obtener clases del maestro que tienen horario hoy
    const { data: horarios, error: errH } = await supabase
      .from('clase_horarios')
      .select(`
        hora_inicio,
        hora_fin,
        salon_id,
        clase:clases!inner(
          id,
          nombre,
          instrumento,
          capacidad_maxima,
          maestro_principal_id
        )
      `)
      .eq('dia', diaHoy)
      .eq('clase.maestro_principal_id', maestro.id)
      .order('hora_inicio', { ascending: true })

    if (errH) throw errH

    if (!horarios || horarios.length === 0) {
      container.innerHTML = `<p class="pm-empty">No tenés clases hoy.<br><small>Día: ${_capitalize(diaHoy)}</small></p>`
      return
    }

    // 2. Obtener qué sesiones ya fueron registradas hoy
    const claseIds = horarios.map(h => h.clase.id)
    const { data: sesionesHoy } = await supabase
      .from('sesiones_clase')
      .select('clase_id, borrador')
      .in('clase_id', claseIds)
      .eq('fecha', fechaStr)
      .eq('borrador', false)

    const registradasHoy = new Set((sesionesHoy || []).map(s => s.clase_id))

    // 3. Obtener cantidad de alumnos por clase
    const { data: inscripciones } = await supabase
      .from('alumnos_clases')
      .select('clase_id')
      .in('clase_id', claseIds)
      .eq('activo', true)

    const alumnosPorClase = {}
    for (const insc of (inscripciones || [])) {
      alumnosPorClase[insc.clase_id] = (alumnosPorClase[insc.clase_id] || 0) + 1
    }

    // 4. Renderizar
    const listHTML = horarios.map(h => {
      const clase         = h.clase
      const registrada    = registradasHoy.has(clase.id)
      const totalAlumnos  = alumnosPorClase[clase.id] || 0
      const estadoClass   = registrada ? 'registrada' : 'sin-registrar'
      const badgeHTML     = registrada
        ? `<span class="pm-badge pm-badge-success">✓ Registrada</span>`
        : `<span class="pm-badge pm-badge-danger">Sin registrar</span>`

      return `
        <div class="pm-clase-card ${estadoClass}" data-clase-id="${clase.id}" data-horario-inicio="${h.hora_inicio}">
          <div class="pm-clase-nombre">${_escHTML(clase.nombre)}</div>
          <div class="pm-clase-meta">
            <span>🕐 ${_formatHora(h.hora_inicio)} – ${_formatHora(h.hora_fin)}</span>
            <span>🎸 ${_escHTML(clase.instrumento || '—')}</span>
            <span>👥 ${totalAlumnos} alumnos</span>
            ${h.salon_id ? `<span>📍 Salón ${h.salon_id}</span>` : ''}
          </div>
          ${badgeHTML}
        </div>
      `
    }).join('')

    container.innerHTML = `
      <h2 style="font-size:.9rem;font-weight:700;color:var(--pm-text-muted);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">
        ${_capitalize(diaHoy)} ${_formatFecha(hoy)}
      </h2>
      ${listHTML}
    `

    // 5. Eventos de click en cada clase
    container.querySelectorAll('.pm-clase-card').forEach(card => {
      card.addEventListener('click', () => {
        onClaseClick?.(card.dataset.claseId)
      })
    })

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${_escHTML(err.message)}</p>`
  }
}

// -- Helpers privados ---------------------------------------

function _escHTML(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function _formatHora(hora) {
  if (!hora) return '—'
  return hora.substring(0, 5) // '08:00:00' → '08:00'
}

function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function _formatFecha(date) {
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/views/hoyView.js
git commit -m "feat: add hoyView with today's classes list"
```

---

## Task 8: calendarioView.js (cuadrícula mensual + colores de estado)

**Files:**
- Create: `src/portal-maestros/views/calendarioView.js`

- [ ] **Step 1: Implementar calendarioView.js**

Crear `src/portal-maestros/views/calendarioView.js`:

```js
import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'

const DIAS_HEADER    = ['Do','Lu','Ma','Mi','Ju','Vi','Sa']
const DIAS_ES        = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
const MESES_ES       = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const UMBRAL_VENCIDA = 7 // días sin registrar → estado vencida

/**
 * Renderiza el calendario mensual con colores de estado de sesiones.
 * @param {HTMLElement} container
 * @param {{ onFechaClick?: (fecha: string) => void }} options
 */
export async function renderCalendarioView(container, { onFechaClick } = {}) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  const hoy   = new Date()
  let anio    = hoy.getFullYear()
  let mes     = hoy.getMonth()      // 0-indexed

  async function cargarYRenderizar() {
    try {
      const estado = await _calcularEstadoMes(maestro.id, anio, mes)
      _renderCalendario(container, anio, mes, hoy, estado, {
        onFechaClick,
        onPrev: () => {
          if (mes === 0) { anio--; mes = 11 } else { mes-- }
          cargarYRenderizar()
        },
        onNext: () => {
          if (mes === 11) { anio++; mes = 0 } else { mes++ }
          cargarYRenderizar()
        },
      })
    } catch (err) {
      container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${_escHTML(err.message)}</p>`
    }
  }

  await cargarYRenderizar()
}

/**
 * Calcula el estado de cada fecha del mes para un maestro.
 * Retorna un Map<'YYYY-MM-DD', 'registrada'|'pendiente'|'vencida'|'sin-clase'>
 */
async function _calcularEstadoMes(maestroId, anio, mes) {
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const desde     = primerDia.toISOString().split('T')[0]
  const hasta     = ultimoDia.toISOString().split('T')[0]

  // 1. Horarios del maestro (qué días de la semana tiene clases)
  const { data: horarios } = await supabase
    .from('clase_horarios')
    .select('dia, clase:clases!inner(id, maestro_principal_id)')
    .eq('clase.maestro_principal_id', maestroId)

  // Set de días de la semana con clases
  const diasConClase = new Set((horarios || []).map(h => h.dia.toLowerCase()))

  // 2. Sesiones registradas en el mes
  const { data: sesiones } = await supabase
    .from('sesiones_clase')
    .select('fecha')
    .eq('maestro_id', maestroId)
    .eq('borrador', false)
    .gte('fecha', desde)
    .lte('fecha', hasta)

  const fechasRegistradas = new Set((sesiones || []).map(s => s.fecha))

  // 3. Calcular estado por día
  const estadoMap = new Map()
  const hoy       = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    const fecha     = d.toISOString().split('T')[0]
    const diaEs     = DIAS_ES[d.getDay()]
    const tieneCl   = diasConClase.has(diaEs)

    if (!tieneCl) {
      estadoMap.set(fecha, 'sin-clase')
      continue
    }

    if (fechasRegistradas.has(fecha)) {
      estadoMap.set(fecha, 'registrada')
      continue
    }

    const fechaDate = new Date(d)
    const diffDias  = Math.floor((hoy - fechaDate) / 86400000)

    if (diffDias < 0) {
      // Fecha futura — no aplicar color de alerta
      estadoMap.set(fecha, 'sin-clase')
    } else if (diffDias === 0) {
      estadoMap.set(fecha, 'pendiente')  // Amarillo: clase hoy sin registrar
    } else if (diffDias <= UMBRAL_VENCIDA) {
      estadoMap.set(fecha, 'pendiente')  // Amarillo: dentro de la semana
    } else {
      estadoMap.set(fecha, 'vencida')    // Rojo: más de 7 días sin registrar
    }
  }

  return estadoMap
}

function _renderCalendario(container, anio, mes, hoy, estadoMap, { onFechaClick, onPrev, onNext }) {
  const primerDia     = new Date(anio, mes, 1)
  const ultimoDia     = new Date(anio, mes + 1, 0)
  const primerDiaSem  = primerDia.getDay() // 0 = domingo
  const hoyStr        = hoy.toISOString().split('T')[0]

  // Celdas del grid: días del mes anterior (padding) + días del mes
  let diasHTML = DIAS_HEADER.map(d => `<div class="pm-cal-day-header">${d}</div>`).join('')

  // Padding días anteriores
  for (let i = 0; i < primerDiaSem; i++) {
    diasHTML += `<div class="pm-cal-day otro-mes"></div>`
  }

  // Días del mes
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const fecha    = `${anio}-${String(mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const estado   = estadoMap.get(fecha) || 'sin-clase'
    const esHoy    = fecha === hoyStr ? 'today' : ''

    diasHTML += `
      <div class="pm-cal-day estado-${estado} ${esHoy}" data-fecha="${fecha}" title="${fecha}">
        ${d}
      </div>
    `
  }

  container.innerHTML = `
    <!-- Navegación mes -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
      <button id="pm-cal-prev" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--pm-primary);padding:.25rem .5rem;">‹</button>
      <h2 style="font-size:1.1rem;font-weight:700;">${MESES_ES[mes]} ${anio}</h2>
      <button id="pm-cal-next" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--pm-primary);padding:.25rem .5rem;">›</button>
    </div>

    <!-- Grid -->
    <div class="pm-card" style="padding:.75rem;">
      <div class="pm-cal-grid">
        ${diasHTML}
      </div>

      <!-- Leyenda -->
      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#16a34a"></div> Registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#ca8a04"></div> Pendiente
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#dc2626"></div> Vencida (+7 días)
        </div>
      </div>
    </div>
  `

  // Eventos
  container.querySelector('#pm-cal-prev').addEventListener('click', onPrev)
  container.querySelector('#pm-cal-next').addEventListener('click', onNext)

  container.querySelectorAll('.pm-cal-day[data-fecha]').forEach(cell => {
    cell.addEventListener('click', () => {
      onFechaClick?.(cell.dataset.fecha)
    })
  })
}

function _escHTML(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/views/calendarioView.js
git commit -m "feat: add calendarioView with monthly grid and session status colors"
```

---

## Task 9: metricasView.js stub + main-maestros.js (bootstrap completo)

**Files:**
- Create: `src/portal-maestros/views/metricasView.js`
- Create: `src/main-maestros.js`

- [ ] **Step 1: Crear metricasView.js (stub para F7)**

Crear `src/portal-maestros/views/metricasView.js`:

```js
/**
 * Vista Métricas — implementación completa en F7.
 * @param {HTMLElement} container
 */
export function renderMetricasView(container) {
  container.innerHTML = `
    <div class="pm-empty">
      <div style="font-size:2.5rem;margin-bottom:.5rem;">📊</div>
      <p>Métricas disponibles próximamente.</p>
      <small style="color:var(--pm-text-muted)">Esta vista se completa en Fase 7.</small>
    </div>
  `
}
```

- [ ] **Step 2: Crear main-maestros.js (bootstrap completo)**

Crear `src/main-maestros.js`:

```js
// ============================================================
// PORTAL MAESTROS — Entry Point
// ============================================================
import './portal-maestros/styles/portal.css'

import { usePortalAuth }        from './portal-maestros/auth/usePortalAuth.js'
import { createPortalRouter }   from './portal-maestros/router/portalRouter.js'
import { enqueue, processQueue, getQueue } from './portal-maestros/services/offlineQueue.js'
import { supabase }             from './lib/supabaseClient.js'

import { renderLoginView }      from './portal-maestros/views/loginView.js'
import { renderHoyView }        from './portal-maestros/views/hoyView.js'
import { renderCalendarioView } from './portal-maestros/views/calendarioView.js'
import { renderMetricasView }   from './portal-maestros/views/metricasView.js'

const TABS = [
  { id: 'calendario', label: 'Inicio',   icon: 'bi-calendar3' },
  { id: 'hoy',        label: 'Hoy',      icon: 'bi-house-door' },
  { id: 'metricas',   label: 'Métricas', icon: 'bi-bar-chart-line' },
]

const router = createPortalRouter()

// ── Sync indicator ─────────────────────────────────────────

async function _syncWithSupabase(item) {
  const { tabla, operacion, payload } = item
  if (operacion === 'insert') {
    const { error } = await supabase.from(tabla).insert(payload)
    if (error) throw error
  } else if (operacion === 'update') {
    const { error } = await supabase.from(tabla).update(payload).eq('id', payload.id)
    if (error) throw error
  } else if (operacion === 'delete') {
    const { error } = await supabase.from(tabla).delete().eq('id', payload.id)
    if (error) throw error
  }
}

let _syncTimeout = null

async function _updateSyncIndicator() {
  const indicator = document.getElementById('pm-sync-indicator')
  if (!indicator) return

  try {
    const queue = await getQueue()
    if (queue.length === 0) {
      indicator.className  = 'pm-sync-indicator synced'
      indicator.textContent = '✓ Sincronizado'
    } else {
      indicator.className  = 'pm-sync-indicator pending'
      indicator.textContent = `⏳ Pendiente (${queue.length})`
    }
  } catch {
    indicator.className  = 'pm-sync-indicator error'
    indicator.textContent = '⚠️ Error de sync'
  }
}

async function _triggerSync() {
  clearTimeout(_syncTimeout)
  _syncTimeout = setTimeout(async () => {
    if (!navigator.onLine) return
    try {
      await processQueue(_syncWithSupabase)
    } finally {
      await _updateSyncIndicator()
    }
  }, 1000)
}

window.addEventListener('online',  _triggerSync)
window.addEventListener('offline', _updateSyncIndicator)

// ── Shell (estructura persistente) ─────────────────────────

function _renderShell(app, maestro) {
  app.innerHTML = `
    <!-- Header -->
    <header class="pm-header">
      <span class="pm-header-title">
        ${maestro?.nombre_completo?.split(' ')[0] ?? 'Maestro'}
      </span>
      <div class="pm-header-right">
        <span class="pm-sync-indicator synced" id="pm-sync-indicator">✓ Sincronizado</span>
        <button id="pm-btn-perfil" style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;padding:.25rem;" title="Perfil">
          <i class="bi bi-person-circle"></i>
        </button>
      </div>
    </header>

    <!-- Contenido de la vista activa -->
    <main class="pm-view" id="pm-view-container"></main>

    <!-- Bottom nav -->
    <nav class="pm-bottom-nav" id="pm-bottom-nav">
      ${TABS.map(tab => `
        <button class="pm-bottom-tab" data-route="${tab.id}">
          <i class="bi ${tab.icon}"></i>
          <span>${tab.label}</span>
        </button>
      `).join('')}
    </nav>
  `

  // Importar Bootstrap Icons (ya instalado en el proyecto)
  if (!document.querySelector('link[href*="bootstrap-icons"]')) {
    const link = document.createElement('link')
    link.rel   = 'stylesheet'
    link.href  = '/node_modules/bootstrap-icons/font/bootstrap-icons.css'
    document.head.appendChild(link)
  }

  // Inicializar sync indicator
  _updateSyncIndicator()

  // Eventos bottom nav
  const bottomNav = document.getElementById('pm-bottom-nav')
  bottomNav.querySelectorAll('.pm-bottom-tab').forEach(tab => {
    tab.addEventListener('click', () => router.navigate(tab.dataset.route))
  })

  document.getElementById('pm-btn-perfil').addEventListener('click', () => {
    router.navigate('perfil')
  })

  // Reintentar sync al tocar el indicador de error
  document.getElementById('pm-sync-indicator').addEventListener('click', async (e) => {
    if (e.target.classList.contains('error')) {
      await _triggerSync()
    }
  })
}

function _setActiveTab(route) {
  document.querySelectorAll('.pm-bottom-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === route)
  })
}

// ── Renderizado de vistas ───────────────────────────────────

function _renderView(route) {
  const container = document.getElementById('pm-view-container')
  if (!container) return

  _setActiveTab(route)

  switch (route) {
    case 'calendario':
      renderCalendarioView(container)
      break
    case 'hoy':
      renderHoyView(container)
      break
    case 'metricas':
      renderMetricasView(container)
      break
    case 'perfil':
      container.innerHTML = `<p class="pm-empty">Perfil disponible en F6.</p>`
      break
    default:
      renderCalendarioView(container)
  }
}

// ── Bootstrap ───────────────────────────────────────────────

async function bootstrap() {
  const app = document.getElementById('portal-app')
  if (!app) return

  // 1. Inicializar auth (con optimistic load desde cache)
  const maestro = await usePortalAuth.init()

  if (!maestro) {
    // Sin sesión → mostrar login
    renderLoginView(app, {
      onSuccess: () => bootstrap() // re-bootstrap tras login exitoso
    })
    return
  }

  // 2. Hay sesión → renderizar shell con navegación
  _renderShell(app, maestro)

  // 3. Configurar router
  router.on('calendario', () => _renderView('calendario'))
  router.on('hoy',        () => _renderView('hoy'))
  router.on('metricas',   () => _renderView('metricas'))
  router.on('perfil',     () => _renderView('perfil'))
  router.onNotFound(()   => _renderView('calendario'))

  router.start()

  // 4. Intentar sync inicial
  _triggerSync()
}

bootstrap()
```

- [ ] **Step 3: Probar en el navegador**

```bash
npm run dev
```

Navegar a `http://localhost:5173/maestros.html`. Debe mostrar el login del portal. Ingresar con un usuario que existe en tabla `maestros`. Tras login exitoso, debe aparecer el shell con header, bottom nav (Inicio / Hoy / Métricas) y el calendario cargando.

- [ ] **Step 4: Correr todos los tests del portal**

```bash
npx vitest run tests/portal-maestros/
```

Esperado: PASS (todos los tests existentes).

- [ ] **Step 5: Commit**

```bash
git add src/main-maestros.js src/portal-maestros/views/metricasView.js
git commit -m "feat: bootstrap portal-maestros F1 complete — auth, router, offline queue, hoy and calendario views"
```

---

## Task 10: Migración DB — tabla sesiones_clase

**Files:**
- (Solo SQL para ejecutar en Supabase)

- [ ] **Step 1: Ejecutar la migración en Supabase SQL Editor**

Esta es la tabla mínima que necesita F1 para que calendarioView y hoyView puedan consultar sesiones existentes. Ejecutar en Supabase → SQL Editor:

```sql
-- Sesiones de clase (asistencia + contenido juntos)
CREATE TABLE IF NOT EXISTS sesiones_clase (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id     UUID        NOT NULL REFERENCES clases(id) ON DELETE CASCADE,
  maestro_id   UUID        NOT NULL REFERENCES maestros(id),
  fecha        DATE        NOT NULL,
  hora_inicio  TIME,
  hora_fin     TIME,
  contenido_dsl TEXT,
  borrador     BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas de calendario y hoy
CREATE INDEX IF NOT EXISTS idx_sesiones_maestro_fecha
  ON sesiones_clase(maestro_id, fecha);

CREATE INDEX IF NOT EXISTS idx_sesiones_clase_fecha
  ON sesiones_clase(clase_id, fecha);

-- RLS: solo el maestro dueño puede ver y editar sus sesiones
ALTER TABLE sesiones_clase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maestro_propias" ON sesiones_clase
  FOR ALL TO authenticated
  USING (
    maestro_id IN (
      SELECT id FROM maestros WHERE user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Verificar que la tabla existe**

En Supabase → Table Editor → buscar `sesiones_clase`. Debe aparecer con todas las columnas definidas.

- [ ] **Step 3: Commit del recordatorio**

```bash
git commit --allow-empty -m "chore: sesiones_clase migration applied to Supabase"
```

---

## Checklist de verificación final

Antes de considerar F1 completa, verificar:

- [ ] `npm run dev` → portal accesible en `/maestros.html` sin errores de consola
- [ ] Login con usuario inexistente en `maestros` → mensaje de error claro
- [ ] Login con usuario válido → shell con header, bottom nav, vista Calendario
- [ ] Bottom nav: Inicio / Hoy / Métricas navegan sin reload de página
- [ ] Vista Hoy → lista clases del día con horarios y estado (registrada / sin registrar)
- [ ] Vista Calendario → cuadrícula con colores correctos (verde/amarillo/rojo/gris)
- [ ] Sync indicator visible en header
- [ ] `npx vitest run tests/portal-maestros/` → todos PASS
- [ ] Build sin errores: `npm run build`

```bash
npm run build
```

Esperado: Build exitoso con dos entry points: `admin` y `maestros`.
