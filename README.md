# Sistema Académico - SOI

> Plataforma de gestión académica institucional con arquitectura Progressive Web App

[![Tests](https://img.shields.io/badge/tests-40%20passed-green)](https://github.com/elsistema/sistema-academico-pwa/actions)
[![Build](https://img.shields.io/badge/build-passing-green)](https://github.com/elsistema/sistema-academico-pwa/actions)
[![Stack](https://img.shields.io/badge/stack-Vite%208%20%7C%20Supabase%20%7C%20Bootstrap%205-blue)](https://vitejs.dev)

## 📋 Descripción

Sistema de información académica para instituciones educativas que gestiona:
- **Programas y Planes de Estudio** - Estructura curricular
- **Alumnos** - Registro, historial académico, seguimiento
- **Maestros** - Gestión docente, asignación de clases
- **Salones** - Espacios físicos y disponibilidad
- **Clases** - Horarios, inscripción de estudiantes
- **Asistencias** - Control de presencia por clase
- **Planificaciones** - Contenido pedagógico por período
- **Progresos** - Calificaciones, boletines, reportes
- **Observaciones** - Anotaciones disciplinarias y seguimiento
- **Métricas** - KPIs, alertas de riesgo, análisis institucional

### Modo Demo

Para pruebas sin backend: `demo@soi.com` / `demo123` (datos simulados en memoria)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │   Sidebar   │ │  Router     │ │  Componentes UI     │    │
│  │   Nav       │ │  (SPA)      │ │  (Bootstrap 5)      │    │
│  └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      MODULE LAYER                           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ auth   │ │alumnos │ │maestros│ │clases  │ │metricas│    │
│  │module  │ │module  │ │module  │ │module  │ │module  │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
│  views │ api │ hooks │ components │ models │ utils          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      CORE LAYER                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │   Router     │ │   Auth       │ │  Config      │         │
│  │   (Custom)   │ │   (Supabase) │ │  (Env Vars)  │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│              Supabase (PostgreSQL + Auth + Storage)         │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

| Principio | Implementación |
|-----------|-----------------|
| **Modularidad** | Cada módulo (alumnos, clases, metricas) es autocontenido con views, api, hooks, components, models, utils |
| **SPA Routing** | Router custom con navegación declarative y persistencia de estado en localStorage |
| **Patrón Hooks** | useAlumnos, useClases, useAuth - lógica de estado encapsulada |
| **Separation of Concerns** | Views → Componentes → APIs → Models |
| **Progressive Enhancement** | PWA con service worker para offline |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-------------|---------------|
| **Bundler** | Vite 8.x | HMR instantáneo, build optimizado, tree-shaking |
| **Backend** | Supabase | PostgreSQL, Auth, Row Level Security, Realtime |
| **UI Framework** | Bootstrap 5.3 | Componentes responsive,theming integrado, accesibilidad |
| **Icons** | Bootstrap Icons | Consistencia visual con Bootstrap |
| **Testing** | Vitest | Fast, compatible Jest, integrado Vite |
| **PDF** | jsPDF + AutoTable | Exportación de reportes y boletines |
| **Excel** | SheetJS (xlsx) | Exportación de datos a Excel |
| **Fonts** | Inter | Legibilidad, variable weights |

---

## 📁 Estructura del Proyecto

```
sistema-academico-pwa/
├── src/
│   ├── main.js                 # Entry point, bootstrap, registry de módulos
│   ├── style.css               # Estilos globales
│   ├── core/
│   │   ├── router/             # Router SPA custom
│   │   ├── auth/               # Supabase auth, session management
│   │   ├── config/             # Variables de entorno
│   │   └── utils/              # Utilidades comunes
│   ├── modules/                # Módulos por dominio
│   │   ├── auth/               # Login, register
│   │   ├── alumnos/            # Gestión estudiantes
│   │   ├── maestros/           # Gestión docentes
│   │   ├── clases/             # Horarios, inscripción
│   │   ├── asistencas/         # Control de asistencia
│   │   ├── progresoss/         # Calificaciones, boletines
│   │   ├── metricas/           # KPIs, alertas, análisis
│   │   └── [otros]/            # salones, programas, periodos, etc.
│   │       ├── views/          # Render functions
│   │       ├── api/            # Fetch a Supabase
│   │       ├── hooks/          # Lógica de estado
│   │       ├── components/    # Componentes reutilizables
│   │       ├── models/         # Validadores, tipos
│   │       └── utils/          # Helpers específicos
│   ├── shared/
│   │   ├── components/         # Navbar, Modal, Toast, FormField
│   │   ├── utils/             # Validators, compactUI
│   │   └── styles/            # Soporte Bootstrap
│   └── lib/                   # Supabase client
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service Worker
├── migrations/                 # SQL migrations (referencia)
├── .github/workflows/          # CI/CD pipelines
├── Dockerfile                 # Multi-stage build
├── docker-compose.yml
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Cuenta de Supabase (para producción)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/elsistema/sistema-academico-pwa.git
cd sistema-academico-pwa

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copiar .env.example a .env y completar con tus credenciales Supabase

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon de Supabase | ✅ |

Obtener valores en: **Supabase Dashboard → Settings → API**

### Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (dist/) |
| `npm run preview` | Preview del build local |
| `npm run test` | Tests en modo watch |
| `npm run test:run` | Tests una ejecución |

---

## 🐳 Docker (Opcional)

```bash
# Build y ejecución
docker build -t sistema-academico .
docker run -p 80:80 sistema-academico

# O con docker-compose
docker-compose up -d
```

El contenedor usa Nginx para servir archivos estáticos con gzip y cache optimizados.

---

## 📊 Testing

```
Test Files  2 passed (2)
Tests       40 passed (40)
Duration    ~2s
```

Los tests cubren:
- Modelos (validación de datos)
- Utils (helpers, formateo)
- Componentes (renderizado, interacción)

---

## 🔄 CI/CD

Workflows configurados en `.github/workflows/`:

| Workflow | Trigger | Descripción |
|----------|---------|-------------|
| `ci.yml` | push/PR | Install → Build → Test |
| `deploy.yml` | push a main | Deploy a GitHub Pages |
| `docker.yml` | push a main | Build y push a ghcr.io |

### Secrets Requeridos

Configurar en GitHub: **Settings → Secrets and variables → Actions**

| Secret | Descripción |
|--------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave pública |

---

## 📝 Decisiones de Arquitectura

### ¿Por qué Vanilla JS + Vite?

- **Bundle size reducido**: ~500KB vs React 150KB+ (sin contar libs adicionales)
- **Curva de aprendizaje**: Sin JSX, hooks, state management complejo
- **Flexibilidad**: Componentes como funciones simples, no clases ni objetos
- **Mantenimiento**: Código predecible, sin abstracciones innecesarias

### ¿Por qué Supabase?

- **SQL nativo**: Queries complejas, joins, aggregations
- **RLS granular**: Políticas por tabla, rol, operación
- **Realtime**: Soporte para actualizaciones en vivo
- **Auth integrado**: Sin implementar auth propio

### Patrón de Módulos

Cada módulo sigue la misma estructura interna:
```
module/
├── views/        # Render functions que reciben container
├── api/          # Funciones de fetch a Supabase
├── hooks/        # Lógica de estado (useXxx pattern)
├── components/   # Componentes reutilizables del módulo
├── models/       # Validación, tipos
└── utils/        # Helpers específicos del dominio
```

---

## 🤝 Contributing

1. Fork del repositorio
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit con convencionales: `feat: agregar nueva funcionalidad`
4. Push y abrir Pull Request

Ver `CONTRIBUTING.md` para guidelines completos.

---

## 📄 Licencia

MIT License - ver archivo `LICENSE`

---

## 📧 Contacto

**Desarrollado por** - El Sistema Punta Cana  
**Documentación** - SOI (Sistema Operativo Institucional)

---

*Construido con estándares de arquitectura empresarial para instituciones educativas.*