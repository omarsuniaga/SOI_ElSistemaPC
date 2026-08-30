# Arquitectura Canónica del Sistema Operativo Institucional (SOI)

Documento maestro de referencia para el equipo de desarrollo, arquitectura y agentes de IA.

---

## 1. Visión Panorámica del Sistema

```mermaid
graph TD
  subgraph Capa_1_Portales ["Capa 1: Portales Departamentales (PWA Client)"]
    PM["Portal Maestros (index.html)<br/>• Clases del Día & Asistencias<br/>• Diseñador Curricular<br/>• Mapa de Ruta Pedagógica"]
    ADM["Portal Administración (adm.html)<br/>• Ficha 360° & Postulados<br/>• Salones & Gestión Clases<br/>• Nómina Consolidada"]
    ACM["Portal Académico (acm.html)<br/>• Cátedras & Audiciones<br/>• Evaluación Curricular"]
    FIN["Portal Finanzas (fin.html)<br/>• Conciliación de Pagos<br/>• Lutería & Inventario"]
  end

  subgraph Capa_2_Core ["Capa 2: Infraestructura Core & Router"]
    SHELL["adminPortalShell.js (Shell Parametrizado)"]
    ROUTER["Router Modular (src/core/router/)"]
    SW["Service Worker (public/sw.js - v6 Network-First)"]
    DOC_GEN["Generadores PDF/Excel (jsPDF + AutoTable)"]
  end

  subgraph Capa_3_Supabase ["Capa 3: Persistencia Supabase & PostgreSQL (RLS)"]
    AUTH["Supabase Auth (profiles / roles)"]
    TABLAS_CORE["Tablas Core:<br/>alumnos, maestros, clases, sesiones_clase, asistencias, justificaciones"]
    FUNNEL["Embudo Admisiones:<br/>soi_postulados, soi_citas_audicion"]
    RPCS["RPCs Canónicas:<br/>get_maestros_compliance_status, check_teacher_attendance"]
  end

  subgraph Capa_4_Hermes ["Capa 4: Hermes & Automatizaciones IA"]
    WA["WhatsApp Webhook Edge Function<br/>(Meta Graph API + KB FAQ Bot)"]
    KANBAN["Hermes Kanban Ingest & Mirror<br/>(hermes_kanban_cards)"]
    AI["IA Pedagógica (Groq Service / Ollama)"]
  end

  PM --> ROUTER
  ADM --> SHELL
  ACM --> SHELL
  FIN --> SHELL
  SHELL --> ROUTER

  ROUTER --> TABLAS_CORE
  ROUTER --> RPCS
  ROUTER --> AUTH

  WA --> FUNNEL
  WA --> TABLAS_CORE
  KANBAN --> ADM
  AI --> PM
```

---

## 2. Los 4 Pilares Arquitectónicos

### 1. Portales como "Lentes", No Copias de Datos
Los datos residen en **Supabase una sola vez**. Cada portal departamental (`adm.js`, `acm.js`, `fin.js`) es únicamente una **lente** que define:
- Qué grupos de navegación mostrar.
- Qué módulos registrar en el router.
- Qué roles tienen autorización de acceso.

### 2. Modularidad Autocontenida
Cada funcionalidad reside en `src/modules/[nombre]/` y expone:
- `api/`: Llamadas canónicas a Supabase / RPCs.
- `components/`: Modales y componentes interactivos reutilizables.
- `domain/`: Lógica de negocio pura (cálculos de solvencia, generadores PDF/Excel, validaciones).
- `views/`: Vistas completas que se montan en el router.

### 3. Service Worker `Network-First` (v6)
Para erradicar vistas viejas y permitir actualizaciones instantáneas:
- **`Network-First`** para todo el código JavaScript, CSS y HTML.
- Auto-purga en `localhost` mediante `early-error-suppression.js`.
- Actualización en caliente automática vía `SKIP_WAITING` + `controllerchange`.

### 4. Automatización & Hermes
- **WhatsApp Webhook:** Chatbot de admisiones y recordatorios docentes.
- **Kanban Mirror:** Tablero de tareas interno de Hermes reflejado en tiempo real en el portal administrativo.

---

## 3. Diagrama Visual Interactivo

Se ha generado una versión interactiva HTML con animaciones y filtrado por capas disponible en:
[`docs/architecture/soi_architecture_diagram.html`](./soi_architecture_diagram.html)
