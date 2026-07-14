# ROADMAP DE IMPLEMENTACIÓN & TABLERO DE CONTROL
**Proyecto**: Sistema Académico PWA (sistema-academico-pwa)  
**Ubicación**: `09_SOI_WEB_PORTAL/sistema-academico-pwa`  
**Última Actualización**: 2026-07-13  
**SSoT Regulatoria**: Normas y Procesos de El Sistema Punta Cana  

---

## 1. ESTADO DE SALUD GLOBAL (DIAGNÓSTICO)

| Métrica | Estado / Valor | Fecha de Medición | Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Estado General** | ✅ **ESTABLE** | 2026-07-14 | Todo respaldado y en GitHub master remoto. |
| **Tests Totales (Vitest)** | 2789 / 2789 Pasados (0 Fallados) | 2026-07-14 | Suite de pruebas global al 100% en verde. |
| **Cambios sin Confirmar** | 0 archivos (Clean) | 2026-07-14 | Working tree libre de cambios pendientes. |
| **Estado Supabase DB** | ✅ Sincronizado | 2026-07-14 | Monitorear la migración de cierre de período. |

### Pruebas Unitarias Recientes:
*   ✅ **TODAS PASANDO**. La suite completa de pruebas unitarias y de integración se ejecutó con éxito (2789 tests en total, 0 fallados). Se integraron los tests del módulo de periodos y se validó la compatibilidad con el sniffer de base de datos.

---

## 2. ÍNDICE DE FEATURES ACTIVAS (`openspec/changes`)

Este índice cruza las especificaciones técnicas estructuradas de los cambios en curso con su progreso real de tareas y archivos afectados.

| Feature ID / Directorio | Estado de Tareas | Tests Asociados | Archivos Afectados Clave | Notas de Arquitectura / Siguiente Paso |
| :--- | :--- | :--- | :--- | :--- |
| **[alumnos-audit-fixes](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/openspec/changes/alumnos-audit-fixes/tasks.md)** | 🟢 **Completada** (100%) | `alumnosView.csv.test.js`<br>`alumnosUtils.test.js`<br>`alumnoCard.test.js` | `alumnosView.js`<br>`alumnoAdminView.js`<br>`alumnosSupabase.js` | Todos los lotes (A, B, C, D, E) están completamente implementados y validados. La suite de pruebas pasa al 100% en verde. |
| **[planificacion-dataadapter](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/openspec/changes/planificacion-dataadapter/tasks.md)** | 🟢 **Completada** (100%) | `planificacion.adapter.test.js` | `planificacionAdapter.js`<br>`planificacionMock.js`<br>`usePlanificacion.js` | Todos los lotes están implementados e integrados en el codebase. El DataAdapter y su almacenamiento mock en localStorage pasan sus tests. |
| **[curriculo-tres-planos](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/openspec/changes/curriculo-tres-planos/tasks.md)** | 🟢 **Completada** (100%) | `weeklyPlan.adapter.test.js` | `weeklyPlanSupabase.js`<br>`weeklyPlanMock.js` | Las Fases de BD y de Capa de Servicios de datos (redirección a tablas reales `route_versions` e `indicator_attempts`) están 100% completas y validadas. |
| **[modulo-planificacion-standardization](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/openspec/changes/modulo-planificacion-standardization/tasks.md)** | 🟢 **Completada** (100%) | `planificacion.adapter.test.js`<br>`planificacion.model.test.js` | `planificacion.model.js`<br>`planificacionView.js` | La unificación visual y de API del módulo bajo el modelo Planificacion, el editor DSL y las vistas consolidadas están 100% integradas. |
| **cierre-periodo** | 🟢 **Completada** (100%) | `periodosApi.test.js` | `periodosView.js`<br>`clasesApi.js`<br>`weeklyPlanSupabase.js`<br>`periodoSniffer.js` | Archivado de ciclos, aislamiento de datos operativos por período activo e inmutabilidad con triggers SQL de Supabase. |

---

## 3. MAPA DE VISTAS Y COMPONENTES FRONTEND (ÍNDICE RÁPIDO)

Usa esta sección para saber a qué archivos ir cuando desees tocar una vista o componente específico del Sistema Académico.

### A. Puntos de Entrada HTML (Raíz del proyecto)
Cada archivo HTML en la raíz carga un script modulado o un script de arranque que inicia las vistas del SPA.

| Vista HTML (Raíz) | Propósito Funcional | Script Principal / Router | Módulo Principal (`src/modules/`) |
| :--- | :--- | :--- | :--- |
| **[index.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/index.html)** | Pantalla de inicio de sesión y autenticación. | `src/main.js` | `src/modules/auth/` |
| **[maestros.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/maestros.html)** | Portal SPA principal para maestros (Asistencias, Clases, Planificaciones). | `src/main-maestros.js` | `src/portal-maestros/` |
| **[admin.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/admin.html)** | Panel administrativo (Auditorías, Configuración, Control de Accesos). | `src/main-admin.js` (si aplica) | `src/modules/admin-*/` |
| **[audiciones.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/audiciones.html)** | Registro y evaluación de audiciones de nuevos ingresos. | `src/modules/audiciones/` | `src/modules/audiciones/` |
| **[calendario.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/calendario.html)** | Vista de calendario de actividades, clases y ensayos. | Módulo de planificación / com | `src/modules/planificacion/` |
| **[inventario.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/inventario.html)** | Registro de activos, instrumentos y asignación a alumnos. | `src/modules/inventario/` | `src/modules/inventario/` |
| **[luteria.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/luteria.html)** | Registro de órdenes de reparación y mantenimiento en taller. | `src/modules/luteria/` | `src/modules/luteria/` |
| **[simulador.html](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/simulador.html)** | Entorno de simulación de flujos de base de datos y scripts de IA. | `src/modules/simulador/` | `src/modules/simulador/` |

### B. Distribución del Código Fuente (`src/`)
*   **`src/portal-maestros/`**: Contiene la lógica SPA exclusiva del maestro.
    *   `shell/`: [portalShell.js](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/portal-maestros/shell/portalShell.js) (Navbar, Sidebar), [portalRoutes.js](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/portal-maestros/shell/portalRoutes.js) (Mapeo de rutas hash).
    *   `views/`: Vistas de negocio del maestro (Asistencia diaria, métricas, perfil).
*   **`src/modules/`**: Módulos de dominio compartidos y encapsulados.
    *   [alumnos/](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/modules/alumnos/): Registro de alumnos y postulantes.
    *   [planificacion/](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/modules/planificacion/): Registro de rutas, objetivos y lecciones.
    *   [hermes/](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/modules/hermes/): Motor de alertas y mensajería omnicanal (WhatsApp/Telegram).
    *   [caja/](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/modules/caja/): Gestión de patrocinios y cobros.

---

## 4. BITÁCORA DE SESIONES DE TRABAJO

### Sesión: 2026-07-13
*   **Objetivo**: Diagnóstico inicial y creación del Tablero de Control del proyecto.
*   **Cambios**: Creación del archivo [ROADMAP_DE_IMPLEMENTACION.md](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/ROADMAP_DE_IMPLEMENTACION.md).
*   **Pendiente Próxima Sesión**: Estabilizar y corregir los 5 tests fallidos identificados en el diagnóstico de entrada.
