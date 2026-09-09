# Auditoría y Remoción: Middleware Muerto [LA2]

**Fecha:** 2026-09-08  
**Autor:** AI-Anti (Antigravity)  
**Tarea:** [LA2] [MEDIA] Middleware muerto: `src/middleware/permissionCheck.js` y `src/middleware/csrfProtection.js`

---

## 1. Contexto y Diagnóstico

En la auditoría del Bloque B (`audit/soi-lila-2026-09`), se identificó la presencia de módulos obsoletos en `src/middleware/`:

1. **`src/middleware/permissionCheck.js`**:
   - **Propósito original:** Sistema cliente RBAC (Role-Based Access Control) con roles genéricos (`teacher`, `admin`, `observer`) y comprobación manual de `resource.maestro_id`.
   - **Inconsistencia arquitectónica:** SOI no utiliza este modelo de autorización. El control de acceso real está gobernado por:
     - Autenticación y navegación por portales mediante `src/core/auth/portalAccessService.js`.
     - Políticas de seguridad a nivel de base de datos (560+ PostgreSQL Row-Level Security policies).
     - RPCs transaccionales protegidos por rol de sesión Supabase.
   - **Hallazgo de consumo:** `ripgrep` sobre todo el proyecto arrojó **0 importaciones** tanto en producción como en tests fuera de su propio test suite `permissionCheck.test.js`. Código 100% muerto y desalineado con la arquitectura.

2. **`src/middleware/csrfProtection.js`**:
   - **Propósito original:** Generación y validación en memoria de tokens anti-CSRF (`X-CSRF-Token`) para peticiones mutantes tipo `fetch/XHR`.
   - **Inconsistencia arquitectónica:** SOI es una SPA desacoplada servida estáticamente desde CDN / Vite, cuyas llamadas de mutación viajan directamente al SDK `@supabase/supabase-js` o Edge Functions autenticadas mediante JWT Bearer tokens en la cabecera `Authorization`. Los ataques CSRF clásicos se mitigan por el uso de Bearer tokens (no cookies de sesión con credenciales implícitas en navegadores modernos). Además, el backend de Supabase jamás validó ni requirió cabeceras `X-CSRF-Token`.
   - **Hallazgo de consumo:**
     - En `src/main-maestros.js` existía `import { initCSRF } from './middleware/csrfProtection.js'` y una llamada huérfana `initCSRF()`.
     - `csrfMiddleware` o `validateToken` **no se usaban en ningún interceptor de red ni llamada API de toda la aplicación**. Era un llamado puramente cosmético.

3. **`src/middleware/rateLimit.js`**:
   - Se mantiene intacto. Es importado e inicializado en `src/main-maestros.js` (`initRateLimit({ windowMs: 60000, max: 100 })`) como middleware de limitación en cliente.

---

## 2. Acciones Ejecutadas

1. **Eliminación de archivos muertos:**
   - `src/middleware/permissionCheck.js` (eliminado)
   - `src/middleware/__tests__/permissionCheck.test.js` (eliminado)
   - `src/middleware/csrfProtection.js` (eliminado)
   - `src/middleware/__tests__/csrfProtection.test.js` (eliminado)

2. **Limpieza de entrypoint:**
   - `src/main-maestros.js`: Removido el import muerto `initCSRF` y la llamada `initCSRF()`.

---

## 3. Verificación

- **Pruebas de middleware:**
  `npx vitest run src/middleware/`
  Resultado: `rateLimit.test.js` pasa con éxito (6/6 tests pasando).
- **Compilación / Build:**
  Ejecución de `npm run build` confirmando que ningún chunk ni bundle de Vite tiene dependencias rotas.
