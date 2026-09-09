# FASE 0 · Análisis Profundo y Gobernanza de Portales [T0.4]

**Auditora técnica:** Lila (Senior Technical Auditor & Architect)  
**Fecha:** 2026-09-08  
**Autorización de Decisión:** Omar Suniaga (Owner)  
**Estado:** **VEREDICTO OFICIAL EJECUTADO EN BASE DE DATOS Y CLIENTES**

---

## 1. Topología y Gobernanza de Portales

En la auditoría inicial de Fase 0 ([`docs/hygiene/FASE-0_hallazgos.md §0.4`](./FASE-0_hallazgos.md)), se constató que la tabla de navegación física `portal_catalog` publicaba 11 portales con `activo = true`, exponiendo rutas vacías o embrionarias que confundían tanto a usuarios como a agentes de desarrollo.

Siguiendo las decisiones oficiales dictadas por Omar:

### A. Matriz de Decisiones por Portal

| Portal ID | Nombre en Catálogo | Ruta Entrypoint | Estado Anterior | Decisión Omar | Estado Resultante en BD | Justificación Técnica & Dominio |
|:---:|---|---|:---:|:---:|:---:|---|
| **SUPERADMIN** | SuperAdmin Master | `/admin.html` | Activo | **MANTENER** | `activo = true` | Centro de comando global institucional. |
| **ADM** | Portal Administración | `/adm.html` | Activo | **MANTENER** | `activo = true` | Gestión administrativa, logística, personal. Absorbe herramientas técnicas. |
| **ACM** | Portal Académico | `/acm.html` | Activo | **MANTENER** | `activo = true` | Coordinación curricular y seguimiento de cohortes (alineado a T0.3). |
| **FIN** | Portal Finanzas SOI | `/soi-finanzas.html` | Activo | **MANTENER** | `activo = true` | Tesorería, cobranzas y balances (aplicación React dedicada). |
| **CAL** | Portal Calendario | `/calendario.html` | Activo | **MANTENER** | `activo = true` | Eventos, ensayos, protocolos y asignación espacial (131 archivos). |
| **MAE** | Portal Docente | `/index.html` | Activo | **MANTENER** | `activo = true` | Asistencias, bitácora diaria y contenidos pedagógicos. |
| **LUT** | Portal Lutería | `/luteria.html` | Activo | **MANTENER** | `activo = true` | Taller de instrumentos, comodato e inventario. |
| **SIM** | Portal Simulador | `/simulador.html` | Activo | **MANTENER** | `activo = true` | Simulador de escenarios y balance de carga. |
| **COM** | Portal Comunicaciones | `/com.html` | Activo | **DESACTIVAR PROVISIONALMENTE** | `activo = false` | **COM continúa siendo departamento CORE del SOI.** Se congela el portal cascarón actual para evitar enlaces rotos hasta que cuente con implementación productiva suficiente. |
| **TEC** | Portal Técnico | `/tecnico.html` | Activo | **FUSIONAR** | `activo = false` | Deja de justificarse como portal independiente. Sus utilidades pasan conceptualmente a **ADM → Configuración / Sistema**. |
| **AUD** | Portal Audiciones | `/audiciones.html` | Activo | **DESACTIVAR** | `activo = false` | El concepto de audiciones pertenece al dominio de admisiones pero no justifica un portal separado. |

---

## 2. Acciones Ejecutadas y Blindaje de Navegación

1. **Persistencia en Base de Datos Real (`SOI_DDBB_EL_SISTEMAPC`):**
   * Migración versionada: [`supabase/migrations/20260908150000_fase0_portal_catalog_desactivacion.sql`](../../supabase/migrations/20260908150000_fase0_portal_catalog_desactivacion.sql).
   * Ejecutado en Supabase: `UPDATE public.portal_catalog SET activo = false, is_active = false WHERE portal_id IN ('AUD', 'TEC', 'COM');`
   * Verificación: `get_user_portales()` RPC y `getPortalCatalog()` filtran automáticamente por `is_active = true`, evitando que cualquier usuario o rol reciba enlaces a portales inactivos.
2. **Sincronización del Catálogo Estático de Fallback:**
   * En [`src/core/auth/portalAccessService.js`](../../src/core/auth/portalAccessService.js), se actualizaron las entradas de `DEFAULT_PORTAL_CATALOG` marcando `activo: false` en `COM`, `TEC` y `AUD`, y se blindó el fallback de `superadmin` para no exponer portales inactivos.
3. **Auditoría de Entrypoints Físicos:**
   * Se verificó que ningún archivo HTML de los portales desactivados sea eliminado destructivamente en esta fase para evitar pérdidas accidentales de código mientras se planifica la consolidación de pantallas en ADM.
