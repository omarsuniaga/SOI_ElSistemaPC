# Auditoría y Limpieza: Entrypoints y Archivos Muertos en el Build [LA4]

**Fecha:** 2026-09-08  
**Autor:** AI-Anti (Antigravity)  
**Tarea:** [LA4] [MEDIA] Entrypoints/archivos muertos en el build: `app.html`, `src/main-phase-c.js`, `lut.html` == `luteria.html`.

---

## 1. Contexto y Diagnóstico

En la auditoría del Bloque B (`audit/soi-lila-2026-09`) y el inventario preliminar de Fase 0 (`docs/hygiene/FASE-0_hallazgos.md §0.4`), se detectaron archivos huérfanos y duplicados en el árbol de Vite:

1. **`app.html` (0 bytes)**:
   - Archivo vacío commiteado en la raíz del repositorio.
   - Sin entradas en `vite.config.js`, sin rutas asociadas en `public/_redirects` ni en `portalCatalog.js`.
   - **Acción:** Eliminado.

2. **`src/main-phase-c.js` (397 líneas, 14.7 KB)**:
   - Prototipo simplificado de un flujo de pruebas E2E ("Phase C: E2E Testing - Ultra-simplified Portal Maestros") creado durante sesiones previas.
   - Tenía 0 importaciones en toda la aplicación y ningún archivo HTML lo cargaba.
   - **Acción:** Eliminado.

3. **`lut.html` vs `luteria.html` (Duplicado byte-a-byte, 4579 bytes c/u)**:
   - Ambos archivos HTML eran idénticos y cargaban `/src/early-error-suppression.js` y `/src/portales/luteria/luteria.js`.
   - `vite.config.js` compilaba ambos como inputs de Rollup independientes (`lut: 'lut.html'` y `luteria: 'luteria.html'`), duplicando la emisión del artefacto HTML en `dist/`.
   - **Acción:**
     - Eliminado `lut.html`.
     - Actualizado `vite.config.js` removiendo el input `lut: 'lut.html'`.
     - Mapeado el prefijo `/lut` directamente a `/luteria.html` en el middleware de desarrollo de `vite.config.js`.
     - Actualizado `public/_redirects` para que `/lut/*` redirija a `/luteria.html 200`.

4. **`admin.html` vs `adm.html` (Preservación por Anti-Regresión)**:
   - El archivo `tests/portal-entrypoint-guard.test.js` contiene un guardián de anti-regresión explícito que exige que tanto `admin.html` como `adm.html` existan y carguen el portal moderno V2 (`src/portales/adm/adm.js`).
   - Se mantuvieron ambos intactos y sincronizados para no violar el contrato del test suite ni romper bookmarks/enlaces legacy.

---

## 2. Verificación

- **Build de producción:**
  `npm run build` ejecutado con éxito en ~20s. Ya no se genera el chunk redundante de `lut.html`.
- **Test suite de guardia:**
  `npx vitest run tests/portal-entrypoint-guard.test.js`
  Resultado: 4/4 tests pasando exitosamente.
