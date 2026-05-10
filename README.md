# SOI - Sistema Operativo Institucional

> Plataforma de gestión académica profesional con Portal Maestros responsive estilo Apple, notificaciones push en tiempo real y modo demo integrado.

[![Tests](https://img.shields.io/badge/tests-332%20passed-green)](#testing)
[![Stack](https://img.shields.io/badge/stack-Vite%208%20%7C%20Supabase%20%7C%20PWA-blue)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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

| Principio | Implementación |
|-----------|----------------|
| **DataAdapter Pattern** | Mock First — toda funcionalidad disponible en Demo (JSON) antes de producción (Supabase) |
| **Module Autocontenido** | `portal-maestros/`, `modules/` con views, api, hooks, components, models, utils |
| **Responsive Design** | Breakpoints: mobile (<768px), tablet (768-1023px), desktop (≥1024px) |
| **Progressive Enhancement** | PWA con service worker para offline |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Bundler** | Vite 8.x | HMR instantáneo, build optimizado |
| **Backend** | Supabase | PostgreSQL, Auth, RLS, Realtime |
| **UI** | CSS Modules + Custom | Diseño Apple-style, tokens semánticos |
| **Icons** | Bootstrap Icons | Consistencia visual |
| **Testing** | Vitest + jsdom | 332 tests unitarios e integración |
| **Fonts** | System fonts + Inter | Legibilidad, rendimiento |
| **PWA** | Service Worker | Offline, installable |

---

## 📁 Estructura del Proyecto

```
sistema-academico-pwa/
├── src/
│   ├── main.js                     # Entry principal (módulos legacy)
│   ├── main-maestros.js           # Entry portal maestros (responsive)
│   ├── portal-maestros/            # 🔑 Portal Maestros (trabajo actual)
│   │   ├── components/            # studentProgressPanel, notificacionesPanel, etc.
│   │   ├── hooks/                 # useNotificaciones, useAlumnos
│   │   ├── router/                # portalRouter.js (SPA con View Transitions)
│   │   ├── services/              # pushService, notificationService
│   │   ├── styles/                # CSS modular (01-11 tokens/responsive)
│   │   ├── utils/                 # portalUtils, fuzzyMatch, etc.
│   │   └── views/                 # hoyView, metricasView, asistenciaView, etc.
│   ├── core/                      # Router, Auth, Config (shared)
│   ├── lib/                       # Supabase client
│   ├── shared/                    # Componentes, utils compartidos
│   ├── styles/                    # Estilos globales
│   └── modules/                   # Módulos legacy (alumnos, maestros, etc.)
├── public/
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service Worker
├── vite.config.js
├── package.json
└── README.md
```

### Portal Maestros — Estructura CSS

```
styles/
├── 01-tokens.css        # Design tokens (Apple semantic layer)
├── 02-reset.css         # Normalize + base
├── 03-layout.css        # Header, nav, sidebar, footer
├── 04-components.css    # Modal, drawer, forms, cards
├── 05-views.css         # View-specific styles
├── 06-modules.css        # Ausencias, tareas, AI menu
├── 07-dsl.css            # DSL editor (contenido planificación)
├── 08-apple.css          # Apple design system (chips, buttons, etc.)
├── 09-routes.css         # Route tree, gamificación
├── 10-responsive.css     # Breakpoint strategy
└── 11-forms.css          # Content selection, planning
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/omarsuniaga/SOI_ElSistemaPC.git
cd SOI_ElSistemaPC

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Tests
npm run test:run
```

### Modo Demo

El proyecto incluye modo demo completo con datos simulados:

```
URL: http://localhost:5173
Email: demo@soi.com
Password: demo123
```

No requiere configuración de Supabase para pruebas locales.

### Variables de Entorno (Producción)

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica
```

---

## 📊 Testing

```
 Test Files  28 passed (28)
      Tests  332 passed (332)
   Duration  ~16s
```

### Cobertura de Tests

| Servicio/Componente | Tests |
|---------------------|-------|
| Push Service | Subscription status, permission handling |
| Notification Service | Polling, deduplication, badge updates |
| Data Adapter | Mock/Supabase switching |
| View Registry | Navigation, active tab sync |
| Fuzzy Matching | Levenshtein distance, ruta resolution |
| Auth | Login, session, logout |
| Utils | Portal utilities, breakpoint detection |

---

## 🔄 Responsive Breakpoints

| Dispositivo | Viewport | Navegación |
|-------------|----------|------------|
| iPhone SE | 375px | Bottom nav (estilo Apple pill) |
| iPad Mini | 768px | Header tabs + footer nav oculto |
| Desktop HD | 1920px | Header tabs + sidebar visible |

### Breakpoints CSS

```css
/* Mobile first */
@media (max-width: 767px)  { /* Mobile: full-width, stacked */ }
@media (min-width: 768px)   { /* Tablet: 2 cols, header tabs */ }
@media (min-width: 1024px)  { /* Desktop: sidebar, 6 KPIs */ }
@media (min-width: 1280px)  { /* Large: more KPIs */ }
@media (min-width: 1440px)  { /* WQHD: dense layout */ }
```

---

## 🔧 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor desarrollo con HMR |
| `npm run build` | Build producción (dist/) |
| `npm run preview` | Preview build local |
| `npm run test` | Tests modo watch |
| `npm run test:run` | Tests una ejecución |

---

## 🧩 Módulos Principales

### Portal Maestros

Dashboard responsive con:
- **Hoy** — Clases del día, estado de registro
- **Asistencia** — Registro por alumno, bulk actions
- **Calendario** — Mes completo, estados por día
- **Métricas** — KPIs, breakdown, alertas riesgo
- **Ruta** — Niveles, nodos, indicadores, gamificación
- **Configuración** — Perfil, notificaciones push

### Servicios

- **pushService** — Web Push API, suscripción, preferencias
- **notificationService** — Polling 30s, deduplicación, badges
- **DataAdapter** — Abstracción Mock ↔ Supabase

---

## 📝 Commits Recientes

```
dbf6678 docs: add portal professionalization implementation plan
fae7cf7 fix(portal): restore bottom nav and add header tabs for tablet
36c2a06 feat(portal): complete UX/UI responsive design phases 2-4
6009b50 test: complete manual testing checklist for notification system
369fb9f test: add notification system integration tests
e1e61b6 feat: apply deduplication in notification panel rendering
ce5d329 test: add notification settings UI tests for configView
2f8b1bd feat: add notification settings UI section to config view
a6c455d test: add pushService subscription status tests
d566711 test: add deduplication logic tests
```

---

## 🤝 Contributing

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit convencional: `feat: agregar nueva funcionalidad`
4. Push y abrir Pull Request

---

## 📄 Licencia

MIT License - ver archivo `LICENSE`

---

## 📧 Contacto

**Desarrollado por** — El Sistema Punta Cana  
**Documentación** — SOI (Sistema Operativo Institucional)

---

*Construido con estándares de arquitectura empresarial para instituciones educativas.*