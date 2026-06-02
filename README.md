# Portal Maestros PWA 🎵

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://codecov.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Last Updated](https://img.shields.io/badge/last%20updated-2026--06--01-blue)](https://github.com)
[![Tests](https://img.shields.io/badge/tests-1363%20passed-brightgreen)](https://github.com)

Enterprise-grade teacher portal for El Sistema Punta Cana. Streamlined lesson planning, smart observation recording, evaluation, and student progress tracking.

---

## ✨ Features

| Feature                   | Status | Tier       |
| ------------------------- | ------ | ---------- |
| Lesson Planning           | ✅     | Core       |
| Observation Recording     | ✅     | Core       |
| Evaluation Engine         | ✅     | Core       |
| Student Progress Tracking | ✅     | Core       |
| Real-time Notifications   | ✅     | Core       |
| Web Push Support          | ✅     | Enhanced   |
| Error Tracking            | ✅     | Enterprise |
| Audit Logging             | ✅     | Enterprise |
| GDPR Compliance           | ✅     | Enterprise |
| Performance Monitoring    | ✅     | Enterprise |

---

## 📋 Descripción

Sistema de información académica para instituciones educativas. Gestiona programas, alumnos, maestros, clases, horarios, asistencias, planificaciones, progresos y métricas institucionales.

### Características Principales

- **Portal Maestros** — Dashboard responsive con diseño Apple-style, KPIs en tiempo real, alertas de riesgo
- **Notificaciones Push** — Polling optimizado (30s), deduplicación inteligente, preferencias por maestro
- **Ruta de Aprendizaje** — Niveles, nodos, indicadores con gamificación integrada
- **Asistencia** — Registro rápido con bulk actions, justificación, estado de clase
- **Métricas** — Tableros con gráficos, breakdown de asistencia, alertas de riesgo
- **Modo Demo** — `demo@soi.com` / `demo123` para pruebas sin backend

---

## 🚀 Quick Start

### Installation

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Environment Setup

```bash
cp .env.example .env.local
```

Configure:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
```

### Running Tests

```bash
npm run test
npm run test:coverage
npm run test:e2e
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │  Portal        │  │  Router     │  │  Components     │   │
│  │  Maestros      │  │  (SPA)      │  │  (Apple-style)  │   │
│  │  (responsive)  │  │  ViewTrans. │  │  CSS modules    │   │
│  └────────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │  Notif.     │ │  Push       │ │  DataAdapter        │    │
│  │  Service    │ │  Service    │ │  (Mock/Supabase)   │    │
│  └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│        JSON (Demo Mode)  │  Supabase (Producción)          │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

| Principio                   | Implementación                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| **DataAdapter Pattern**     | Mock First — toda funcionalidad disponible en Demo (JSON) antes de producción (Supabase) |
| **Module Autocontenido**    | `portal-maestros/` con views, api, hooks, components                                     |
| **Responsive Design**       | Breakpoints: mobile (<768px), tablet (768-1023px), desktop (≥1024px)                     |
| **Progressive Enhancement** | PWA con service worker para offline                                                      |

### Stack Tecnológico

| Capa        | Tecnología           | Propósito                             |
| ----------- | -------------------- | ------------------------------------- |
| **Bundler** | Vite 8.x             | HMR instantáneo, build optimizado     |
| **Backend** | Supabase             | PostgreSQL, Auth, RLS, Realtime       |
| **UI**      | CSS Modules + Custom | Diseño Apple-style, tokens semánticos |
| **Testing** | Vitest + jsdom       | 1363 tests (unitarios + integración)  |
| **PWA**     | Service Worker       | Offline, installable                  |

---

## 📁 Estructura del Proyecto

```
sistema-academico-pwa/
├── src/
│   ├── main.js                     # Entry principal (módulos legacy)
│   ├── main-maestros.js           # Entry portal maestros (responsive)
│   ├── portal-maestros/            # 🔑 Portal Maestros
│   │   ├── components/            # studentProgressPanel, notificacionesPanel
│   │   ├── hooks/                 # useNotificaciones, useAlumnos
│   │   ├── router/                # portalRouter.js (SPA con View Transitions)
│   │   ├── services/              # pushService, notificationService
│   │   ├── styles/                # CSS modular (01-11 tokens/responsive)
│   │   ├── utils/                 # portalUtils, fuzzyMatch
│   │   └── views/                 # hoyView, metricasView, asistenciaView
│   ├── core/                      # Router, Auth, Config (shared)
│   ├── lib/                       # Supabase client
│   ├── shared/                    # Componentes, utils compartidos
│   └── services/                  # Cross-app services
│       ├── errorReporter.js       # Sentry integration
│       ├── auditService.js        # Data mutation logging
│       ├── analyticsService.js    # User behavior
│       └── database.js            # DB interactions
├── public/
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service Worker
├── docs/                          # Documentación
│   ├── USER_GUIDE.md             # Guía para profesores
│   ├── DEVELOPER.md              # Guía para desarrolladores
│   ├── API_REFERENCE.md          # Referencia de endpoints
│   ├── DEPLOYMENT.md             # Guía de despliegue
│   ├── ARCHITECTURE.md           # Arquitectura del sistema
│   ├── SECURITY.md               # Modelo de seguridad
│   └── COMPLIANCE.md             # Checklist de cumplimiento
└── vite.config.js
```

---

## 🔒 Seguridad

Portal Maestros implementa seguridad multicapa:

- **RBAC Granular** — Teacher, Admin, Observer con permisos específicos
- **Protección CSRF** — Token en todas las mutaciones de estado
- **Validación de Input** — DOMPurify (cliente), Joi (servidor)
- **Rate Limiting** — 100 req/min por usuario
- **GDPR Compliance** — Derecho al olvido, exportación de datos
- **Security Headers** — CSP, X-Frame-Options, X-XSS-Protection

### Autenticación

- **JWT Tokens** — Válidos 1 hora (renewable)
- **Session Default** — 1 hora
- **"Mantener Sesión"** — 30 días
- **Biometric** — WebAuthn con PIN local

---

## 📊 Rendimiento

| Métrica                            | Target                          |
| ---------------------------------- | ------------------------------- |
| **Bundle Size**                    | < 500KB (gzipped)               |
| **LCP (Largest Contentful Paint)** | < 2.5s                          |
| **FID (First Input Delay)**        | < 100ms                         |
| **CLS (Cumulative Layout Shift)**  | < 0.1                           |
| **Route Lazy Loading**             | Todos los routes no-críticos    |
| **Service Worker Caching**         | Offline-first strategy          |
| **Database Indexing**              | Optimizado para queries rápidas |

---

## 🧪 Testing

```
 Test Files  150 passed | 2 skipped (162)
      Tests  1363 passed | 7 skipped (1370)
   Duration  ~76s
```

### Cobertura de Tests

| Servicio/Componente  | Tests                                    |
| -------------------- | ---------------------------------------- |
| Push Service         | Subscription status, permission handling |
| Notification Service | Polling, deduplication, badge updates    |
| Data Adapter         | Mock/Supabase switching                  |
| View Registry        | Navigation, active tab sync              |
| Fuzzy Matching       | Levenshtein distance, ruta resolution    |
| Auth                 | Login, session, logout                   |
| Utils                | Portal utilities, breakpoint detection   |

### Ejecutar Tests

```bash
npm run test                  # All tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run test:e2e             # E2E only
```

---

## 📈 Monitoreo

Portal Maestros integra:

- **Sentry** — Error tracking y alertas
- **Web Vitals** — Métricas de rendimiento (LCP, FID, CLS)
- **Audit Logs** — Todas las mutaciones de datos registradas
- **Analytics** — Tracking de comportamiento de usuario (consent-based)

---

## 🚀 Despliegue

### Production Checklist

```bash
# 1. Test
npm run test && npm run test:e2e

# 2. Build
npm run build

# 3. Analyze bundle
npm run build --analyze

# 4. Deploy
vercel deploy --prod
```

### Configuración de Producción

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🔧 Scripts

| Comando            | Descripción                 |
| ------------------ | --------------------------- |
| `npm run dev`      | Servidor desarrollo con HMR |
| `npm run build`    | Build producción (dist/)    |
| `npm run preview`  | Preview build local         |
| `npm run test`     | Tests modo watch            |
| `npm run test:run` | Tests una ejecución         |

---

## 📚 Documentación

- [User Guide](./docs/USER_GUIDE.md) — Guía paso a paso para profesores
- [Developer Guide](./docs/DEVELOPER.md) — Setup y arquitectura
- [API Reference](./docs/API_REFERENCE.md) — Todos los endpoints
- [Deployment Guide](./docs/DEPLOYMENT.md) — Checklist de producción
- [Architecture Overview](./docs/ARCHITECTURE.md) — Diseño del sistema
- [Security Model](./docs/SECURITY.md) — RBAC y compliance
- [Compliance Checklist](./docs/COMPLIANCE.md) — GDPR y regulaciones

---

## 🔄 Responsive Breakpoints

| Dispositivo | Viewport | Navegación                      |
| ----------- | -------- | ------------------------------- |
| iPhone SE   | 375px    | Bottom nav (estilo Apple pill)  |
| iPad Mini   | 768px    | Header tabs + footer nav oculto |
| Desktop HD  | 1920px   | Header tabs + sidebar visible   |

---

## 🤝 Contributing

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit convencional: `feat: agregar nueva funcionalidad`
4. Push y abrir Pull Request

### Commits Recientes

```
b920ae6 feat(postulados): add PDF download by date range
99f289b feat(planificacion): integrate DSL editor with toolbar
7fc68c2 refactor(planificacion): consolidate state management
93523f7 fix(admin-notifications): add lifecycle management
bdafbe2 fix(admin-observability-harden): remove admin auth gate
a73e4c7 feat(admin-observability-harden): PR 2 — CSP, auth, tests
9079019 feat(admin-observability-harden): PR 1 — infrastructure
8b4901d feat: agregar panel de gestión de rutas
985b2f6 fix: correct import path for openRutaSelectorModal
0056ff3 feat(clases): integrate route selection
```

---

## 📄 Licencia

MIT License - ver archivo `LICENSE`

---

## 🐛 Bug Reports

¿Encontraste un bug? Crea un issue en GitHub o contacta al equipo de desarrollo.

---

## 📧 Contacto

**Desarrollado por** — El Sistema Punta Cana  
**Documentación** — SOI (Sistema Operativo Institucional)

---

## Modo Demo

El proyecto incluye modo demo completo con datos simulados:

```
URL: http://localhost:5173
Email: demo@soi.com
Password: demo123
```

No requiere configuración de Supabase para pruebas locales.

---

_Construido con estándares de arquitectura empresarial para instituciones educativas._

**Last Updated:** June 1, 2026  
**Maintained by:** Dev Team  
**Version:** 2.0.0
