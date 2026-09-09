---
doc_id: PORTAL-003
doc_type: manual
version: V10
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-09-08
next_review_due: 2027-03-08
review_cycle_days: 180
canonical_path: docs/ARCHITECTURE.md
origin_path: null
destination_path: null
supersedes: V9
superseded_by: null
change_reason: "Fase 0 (LA1) — Reescritura completa para alinear la documentación con la topología real del sistema (eliminación de servidor HTTP/Joi/Sentry ficticios; documentación de cliente Supabase directo, RLS, lens de portales y DataAdapters)"
aliases:
  - PORTAL-003
tags:
  - portal
  - web
  - arquitectura
related_docs:
  - "CONTEXT.md"
  - "AGENTS.md"
  - "docs/hygiene/FASE-0_hallazgos.md"
---

# Arquitectura del Sistema SOI (El Sistema Punta Cana)

El Sistema Operativo Institucional (**SOI**) es una plataforma web modular diseñada para la gestión académica, operativa, patrimonial y financiera del Sistema de Orquestas Infantil y Juvenil de Punta Cana.

---

## 1. Topología General

SOI opera como una **Single Page Application (SPA) multi-portal** servida estáticamente vía Vite (HTML5/ESM) que se comunica de forma **directa** con **Supabase Backend-as-a-Service (BaaS)** mediante PostgreSQL, Row-Level Security (RLS) y Edge Functions.

> ⚠️ **Aclaración Arquitectónica Fundamental:**  
> SOI **NO** posee un servidor de aplicación intermedio (Node.js/Express, Joi ni middlewares de enrutamiento HTTP en servidor). Toda la persistencia, integridad relacional y validación de permisos de datos reside en la base de datos PostgreSQL mediante **RLS y RPCs transaccionales**.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENTE WEB / PWA (Navegador)                      │
│                                                                                │
│  ┌─────────────────────────┐  ┌────────────────────────┐  ┌─────────────────┐  │
│  │   Portal Administrativo │  │    Portal Académico    │  │  Portal Docente │  │
│  │       (/adm.html)       │  │       (/acm.html)      │  │  (/index.html)  │  │
│  └────────────┬────────────┘  └───────────┬────────────┘  └────────┬────────┘  │
│               │                           │                        │           │
│  ┌────────────┴───────────────────────────┴────────────────────────┴────────┐  │
│  │                        Patrón "Lens" Multi-Portal                        │  │
│  │  (adminPortalShell.js / portalAccessService.js / portalCatalog.js)       │  │
│  └──────────────────────────────────────┬───────────────────────────────────┘  │
│                                         │                                      │
│  ┌──────────────────────────────────────┴───────────────────────────────────┐  │
│  │                           Módulos de Negocio                             │  │
│  │   src/modules/ (alumnos, clases, asistencias, finanzas, inventario, etc.)│  │
│  └──────────────────────────────────────┬───────────────────────────────────┘  │
│                                         │                                      │
│  ┌──────────────────────────────────────┴───────────────────────────────────┐  │
│  │                         Capa de Abstracción de Datos                     │  │
│  │               DataAdapter Pattern (Real vs Demo/JSON Mock)               │  │
│  │       src/modules/*/api/*Adapter.js  ──►  src/lib/supabaseClient.js      │  │
│  └──────────────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────┘
                                          │ HTTPS (REST / RPC / Realtime)
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE BACKEND (PostgreSQL)                        │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         Autenticación (GoTrue)                           │  │
│  │  - JWT (Bearer) almacenado bajo la clave 'sb-soi-auth'                   │  │
│  │  - Tabla pública profiles (id, email, rol, nombre, etc.)                 │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                     Gobernanza y Autorización en BD                      │  │
│  │  - Control de Portales: portal_catalog, user_portal_access               │  │
│  │  - RPCs: get_user_portales, has_portal_access, set_user_portales         │  │
│  │  - 560+ Políticas RLS (Row-Level Security) en tablas de dominio         │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      Funciones RPC Transaccionales                       │  │
│  │  - Cobros y pagos atómicos (fn_registrar_pago_transaccional)             │  │
│  │  - Asignación y conciliación de caja, asistencias y cuotas               │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                             Edge Functions                               │  │
│  │  - Procesamiento asíncrono, webhooks y automatizaciones de mensajería    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Capas de la Aplicación

### 2.1 Presentación y Enrutamiento (UI & Router)
- **Tecnología:** JavaScript Vanilla moderno (ESModules nativos), Tailwind CSS, Bootstrap 5 y componentes React aislados para interfaces complejas (ej. Ficha 360 y Finanzas en `src/portales/fin/`, Calendario).
- **Arquitectura Multi-Portal ("Lens"):**  
  En lugar de duplicar aplicaciones, cada punto de entrada (`/adm.html`, `/acm.html`, `/fin.html`, etc.) actúa como un *visor o lente temático* que inicializa una barra de navegación y un contenedor SPA, cargando únicamente las vistas correspondientes a dicho portal desde `src/modules/`.
- **Router:** Sistema de enrutamiento SPA basado en hash y rutas jerárquicas con extracción de parámetros dinámicos (`core/router/router.js`).

### 2.2 Capa de Módulos (Domain Modules)
Cada funcionalidad está empaquetada en su propio subdirectorio dentro de `src/modules/[nombre]/`:
- `api/`: Lógica de comunicación con el backend (adaptadores y clientes Supabase).
- `components/`: Elementos visuales reutilizables del módulo.
- `views/`: Vistas o pantallas completas consumidas por el router.
- `utils/` o `services/`: Validaciones y lógica de cálculo específica del módulo.

### 2.3 Capa de Acceso a Datos: DataAdapter Pattern
El proyecto adopta como estándar mandatorio el patrón **DataAdapter**:
- Las vistas y componentes **no deben invocar directamente a Supabase**.
- Cada módulo expone una fachada estrecha (`*Adapter.js`) que resuelve hacia:
  - **Modo Real:** Módulos de consulta (`*Supabase.js`) utilizando el singleton `src/lib/supabaseClient.js`.
  - **Modo Demo:** Módulos de prueba (`*Mock.js`) alimentados por fixtures estáticos en `src/assets/data/mocks/`.

### 2.4 Control de Acceso y Seguridad (RBAC & RLS)
- **Roles Canónicos:**  
  Los roles reconocidos por el dominio SOI (definidos en `profiles` y `portalAccessService.js`) son:
  - `superadmin`: Control total de la plataforma y administración de portales.
  - `admin`: Administración operativa institucional.
  - `direccion`: Dirección general y supervisión estratégica.
  - `coordinacion_academica`: Gestión de nóminas, cátedras y clases.
  - `maestro`: Registro de asistencias, planificaciones y evaluaciones de alumnos.
  - `finanzas`: Gestión de cuotas, recaudación y arqueo de caja.
  - `operaciones`: Logística, mantenimiento técnico y lutería.
  - `jurado`: Evaluación en audiciones.
- **Autorización de Portales:**
  Orquestada por `src/core/auth/portalAccessService.js` consultando la tabla `portal_catalog` y validada en servidor mediante la función RPC `has_portal_access(p_portal_id, p_user_id)`.
- **Seguridad de Datos:**
  La integridad y privacidad están salvaguardadas en la base de datos mediante políticas **RLS (Row Level Security)** en PostgreSQL, evaluando el `auth.uid()` del token JWT contra los permisos de cada tabla.

---

## 3. Subsistemas y Workers Especializados

### 3.1 WhatsApp Runner (`scripts/whatsapp-runner/`)
- **Propósito:** Automatización del envío y recepción de mensajes transaccionales y notificaciones vía WhatsApp (Baileys).
- **Diseño Resiliente:**
  - Inyección de dependencias (DI) y control de concurrencia mediante mutex asíncrono y bloqueos de ejecución (`runnerLock.js`).
  - Arrendamiento cooperativo de tareas (`workerLease.js`) para prevenir el procesamiento duplicado de mensajes.
  - Bucle de despacho (`dispatchLoop`) con timeout de confirmación (ACK) terminal y handoff de reintentos mediante reaper.

### 3.2 Ingesta de Mensajes Telegram (`soi-telegram-ingest`)
- Webhook que almacena mensajes entrantes sin procesar.
- Tarea cron con clasificación semántica mediante LLM (Groq) para derivar requerimientos a tareas operativas en `tareas_institucionales`.

---

## 4. Filosofía de Desarrollo y Gobernanza de Código

- **Lenguaje Ubicuo:** Consulte estrictamente [`CONTEXT.md`](../CONTEXT.md) para garantizar la coherencia terminológica del dominio orquestal y pedagógico.
- **Reglas para Agentes y Desarrolladores:** Consulte [`AGENTS.md`](../AGENTS.md) para directrices de commits convencionales (100% en inglés), diseño de módulos profundos (*deep modules*) y autonomía operativa.
- **Modo Demo First:** Cualquier nueva pantalla o funcionalidad debe diseñarse asegurando compatibilidad con el entorno Mock antes de su despliegue en producción.
