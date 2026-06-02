# Sistema Académico PWA — SOI Portal

Portal web progresivo (PWA) del **Sistema Operativo Institucional** de la Orquesta Sinfónica de Punta Cana. Permite a maestros registrar clases, gestionar alumnos, planificar rutas académicas y sincronizar datos offline. Los administradores tienen un panel completo de gestión.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Vanilla JS (ES Modules) + Vite |
| Backend / DB | Supabase (PostgreSQL + Realtime) |
| CSS | Bootstrap 5 + Bootstrap Icons + CSS custom properties |
| Tests | Vitest + @testing-library/dom |
| PWA | Service Worker manual (`sw.js`) + Web Push |
| Offline | IndexedDB via `idb` + cola de sincronización |
| PDF | jsPDF + jsPDF-AutoTable |
| Error tracking | Sentry (via `VITE_SENTRY_DSN`) |

### ¿Por qué Vanilla JS y no React/Vue?

Esta aplicación fue construida intencionalmente sin framework para mantener cero dependencias de runtime, máximo control sobre el ciclo de vida del DOM, y bundle size mínimo. La arquitectura SPA se implementa con un router propio y contenedores de vista persistentes (las vistas se montan una vez y se ocultan/muestran sin re-render).

---

## Arquitectura

```
src/
├── main-maestros.js          # Orquestador principal (punto de entrada)
├── portal-maestros/
│   ├── shell/                # Shell del portal (separado del negocio)
│   │   ├── portalShell.js    # Render del header/sidebar/footer nav
│   │   ├── portalRoutes.js   # Registro de rutas SPA + contenedores de vista
│   │   └── portalEvents.js   # Listeners globales (Realtime, shortcuts, resize)
│   ├── auth/                 # Autenticación y guards
│   ├── views/                # Vistas del maestro (hoy, calendario, métricas…)
│   ├── components/           # Componentes reutilizables del portal
│   ├── services/             # Servicios: offline queue, sync, push, notificaciones
│   ├── router/               # Router SPA hash-based
│   └── utils/                # Utilidades (modo admin/maestro, etc.)
├── modules/                  # Módulos de dominio (alumnos, programas, clases…)
│   ├── alumnos/
│   │   ├── api/              # postulantesApi.js (facade) → Supabase o Mock según config
│   │   ├── domain/           # Lógica de negocio pura (state machine, PDF)
│   │   └── views/
│   ├── maestros/
│   ├── programas/
│   ├── clases/
│   ├── metricas/
│   ├── academic-routes/
│   └── admin-*/
├── core/
│   ├── auth/                 # Auth manager + Supabase auth
│   └── config/               # Configuración global (modo demo, flags)
├── shared/
│   ├── components/           # AppToast, AppModal, HelpPanel, navbar…
│   ├── utils/                # sanitize, asyncMutex, dslParser…
│   └── services/             # lifecycleManager
├── services/                 # Servicios de infraestructura
│   ├── errorReporter.js      # Sentry integration
│   ├── analyticsService.js   # Analytics GDPR-compliant
│   ├── webVitals.js
│   ├── swCaching.js
│   └── …
├── middleware/
│   ├── csrfProtection.js
│   └── rateLimit.js
└── lib/
    └── supabaseClient.js     # Cliente Supabase singleton
```

### Patrón API Facade (Demo Mode)

Los módulos de datos exponen una **API facade** que delega a la implementación real (Supabase) o a un mock en memoria según `config.isDemoMode`. Esto permite demostraciones sin base de datos y tests unitarios sin red.

```js
// postulantesApi.js
const getApi = () => (config.isDemoMode ? mockImpl : supabaseImpl)
export const obtenerPostulante = (...args) => getApi().obtenerPostulante(...args)
```

### Offline First

La aplicación mantiene una cola de operaciones en IndexedDB (`offlineQueue`). Cuando el dispositivo recupera conexión, el `syncManager` procesa la cola contra Supabase. El indicador visual en el header muestra el estado en tiempo real.

---

## Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Tests (watch)
npm test

# Tests (single run + coverage)
npm run test:run

# Lint
npm run lint
npm run lint:fix

# Formato
npm run format
npm run format:fix
```

---

## Variables de Entorno

Crea un archivo `.env.local` en la raíz (nunca commitear):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx   # opcional
```

---

## Tests

Los tests están co-localizados con el código en carpetas `__tests__/`. Cada módulo tiene su propio suite:

```
src/services/__tests__/                       # Servicios de infraestructura
src/shared/utils/__tests__/                   # Utilidades
src/portal-maestros/services/__tests__/       # Servicios offline/sync
src/modules/*/                                # Tests por módulo
```

Para correr un módulo específico:

```bash
npx vitest run src/portal-maestros/services/__tests__/offlineQueue.test.js
```

---

## Contexto Institucional

Este portal es parte del **SOI (Sistema Operativo Institucional)** de la Fundación para la Expansión Cultural y Artística de Punta Cana (FUNEYCA PC). Gestiona el programa orquestal: alumnos, maestros, clases, asistencias y planificación pedagógica.
