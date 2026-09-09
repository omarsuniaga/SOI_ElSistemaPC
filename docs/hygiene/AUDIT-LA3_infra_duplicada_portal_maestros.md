# AUDIT LA3 — Mapeo de Infraestructura Duplicada: Portal Maestros vs Core

## 1. Resumen Ejecutivo
La auditoría arquitectónica (`audit/soi-lila-2026-09` #3502) identificó que **Portal Maestros** opera como un "universo paralelo" dentro del repositorio, manteniendo copias independientes de servicios de infraestructura, enrutador y autenticación frente al resto de los portales de SOI.

Este documento presenta el **mapa exhaustivo de duplicaciones**, los **consumidores actuales** de cada archivo, los **análisis de divergencia técnica** y una **propuesta de consolidación gradual sin rotura de producción ni regresiones offline**.

---

## 2. Matriz Comparativa de Servicios Duplicados

| Servicio | Instancia Global (`src/services/` o `src/middleware/`) | Instancia Maestros (`src/portal-maestros/services/`) | Consumidores Reales | Veredicto Técnico |
|---|---|---|---|---|
| **Analytics** | `src/services/analyticsService.js` (108 lín) | `src/portal-maestros/services/analyticsService.js` (31 lín) | Global: `src/main-maestros.js` (init). Maestros: **0 imports**. | **Maestros es cascarón muerto (31 líneas no usadas).** La versión de `src/services/` implementa consentimiento GDPR, contexto de usuario y eventos. |
| **Audit Log** | `src/services/auditService.js` (110 lín) | `src/portal-maestros/services/auditService.js` (36 lín) | Global: tests unitarios. Maestros: **0 imports**. | **Ambos tienen 0 consumidores en vistas de producción.** La versión de Maestros apunta directamente a la tabla `audit_logs` de Supabase; la versión global depende de un objeto `database` inyectado que no existe. |
| **Error Reporter** | `src/services/errorReporter.js` (151 lín) | `src/portal-maestros/services/errorReporter.js` (102 lín) | Global: `src/main-maestros.js` (init). Maestros: **0 imports**. | **Maestros es copia vieja.** La versión global (`src/services/errorReporter.js`) incluye búfer en memoria `recentErrors` (máx 10) para diagnósticos de IA y manejo de trazas. |
| **Permission Check** | `src/middleware/permissionCheck.js` (120 lín) | `src/portal-maestros/services/permissionCheck.js` (41 lín) | Ambos: **0 imports en todo el código**. | **Ambos son código muerto (LA2).** No corresponden al modelo de roles institucionales de SOI. La autorización real opera mediante `src/core/auth/portalAccessService.js` + RLS en Supabase. |

---

## 3. Duplicaciones Mayores de Arquitectura

Más allá de los 4 servicios de infraestructura analizados, Portal Maestros duplica los pilares arquitectónicos de la SPA:

### 3.1 Enrutador (Router)
- **Core:** `src/core/router/router.js` (242 líneas).
  - Usado por: todos los portales administrativos (`adm.html`, `acm.html`, `fin.html`, `com.html`, etc.).
  - Soporta: limpieza automática de modales Bootstrap, rutas jerárquicas con parámetros dinámicos (`:id`), prefijos de portal.
- **Maestros:** `src/portal-maestros/router/portalRouter.js` (251 líneas).
  - Usado por: `index.html` / `main-maestros.js`.
  - Diseñado específicamente con soporte para interceptar navegación en PWA standalone, guards de redirección a `intended-route` y vistas exclusivas de maestro.
- **Divergencia:** El router de Maestros maneja transiciones específicas de PWA mobile-first que el router genérico de Bootstrap no contemplaba originalmente.

### 3.2 Autenticación y Sesión
- **Core:** `src/modules/auth/` (`useAuth.js`, `authSupabase.js`).
  - Opera sobre `profiles` y la sesión estándar de Supabase.
- **Maestros:** `src/portal-maestros/auth/` (`maestroAuth.js`, `usePortalAuth.js`).
  - Opera sobre la verificación cruzada con la tabla `maestros` (`user_id`), soporte de cuenta pendiente de aprobación (`PENDING_APPROVAL_SENTINEL`), persistencia estricta de 30 días para modo standalone PWA (`pm-session-expires`) y caché local de vistas (`viewCache`).

---

## 4. Plan de Consolidación Propuesto (Sin Refactor Destructivo)

Para unificar la base de código sin arriesgar la estabilidad operativa del portal docente, se propone la siguiente ruta:

### Fase 1: Limpieza Quirúrgica de Módulos Muertos (Inmediata)
1. **Eliminar servicios no importados de Portal Maestros:**
   - `src/portal-maestros/services/analyticsService.js` (0 imports).
   - `src/portal-maestros/services/auditService.js` (0 imports).
   - `src/portal-maestros/services/errorReporter.js` (0 imports).
   - `src/portal-maestros/services/permissionCheck.js` (0 imports).
2. **Eliminar middleware muerto:**
   - `src/middleware/permissionCheck.js` (absorbido en LA2).

### Fase 2: Unificación de Servicios de Diagnóstico e Infraestructura (Bajo Riesgo)
1. Si Portal Maestros requiere rastreo de errores o analítica, debe importar directamente el módulo canónico en `src/services/errorReporter.js` y `src/services/analyticsService.js`.
2. Mantener la configuración centralizada en `src/main-maestros.js`.

### Fase 3: Convergencia de Routers (Planificación a Mediano Plazo)
1. Extender `src/core/router/router.js` para incorporar las capacidades de persistencia de ruta (`intended-route`) y detección PWA de `portalRouter.js`.
2. Una vez verificado con pruebas automatizadas, migrar `portal-maestros` al router unificado del core.

### Fase 4: Preservación de Dominio en Autenticación
1. Mantener `maestroAuth.js` como una capa especializada de dominio docente, pero asegurar que delegue las operaciones de bajo nivel de sesión al cliente canónico de Supabase (`src/lib/supabaseClient.js`).

---

## 5. Conclusión y Recomendación
El análisis confirma el diagnóstico de auditoría: las copias en `src/portal-maestros/services/` corresponden a remanentes de una refactorización previa ("portal professionalization plan") que quedaron huérfanas de consumidores reales. Su retiro y la adopción de los servicios canónicos de `src/services/` reduce la superficie de mantenimiento sin impacto en el comportamiento de producción.
