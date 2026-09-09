# AUDIT LC2 — Triage y Restauración de `no-undef` en ESLint

## Contexto y Diagnóstico
En la auditoría SOI (`audit/soi-lila-2026-09` #3502), se reportó:
> `no-undef` degradado a warning en `eslint.config.js` (oculta Tesseract/raw/AppToast marcados undef en report viejo).

Se investigó el estado actual de `eslint.config.js`:
1. `eslint.config.js` estaba usando `js.configs.recommended` donde `no-undef` viene por defecto en nivel `'error'`.
2. Para blindar explícitamente la regla contra degradaciones o desconfiguraciones accidentales, se declaró explícitamente `'no-undef': 'error'` en la sección `rules`.
3. Al ejecutar `npm run lint --quiet` para filtrar únicamente errores y detectar los símbolos no definidos en el árbol `src/`, se identificó **1 único error**:
   - `src/modules/clases/views/__tests__/clasesHoyView.grid.test.js:43:34`: `'__dirname' is not defined (no-undef)`.

## Símbolos Históricos Mencionados en Auditoría
- **Tesseract / raw / AppToast**: Fueron resueltos previamente en los commits de saneamiento de Fase B (`52a8929a`, `de7515cc`, `87e6c79e`, `60e2b697`). Las importaciones faltantes de `AppToast` y componentes fueron debidamente agregadas en esos commits, por lo que ya no generan alertas ni errores bajo `no-undef`.

## Solución Aplicada
1. **Configuración de Linter (`eslint.config.js`)**:
   - Se añadió formalmente `'no-undef': 'error'` a la lista de reglas principales.
2. **Corrección en Test (`clasesHoyView.grid.test.js`)**:
   - El archivo es un módulo ES (`"type": "module"` en `package.json`), por lo que `__dirname` no es provisto globalmente por Node de manera nativa.
   - Se importó `fileURLToPath` desde `'url'` y se derivó `__dirname` limpiamente mediante:
     ```js
     import { fileURLToPath } from 'url'
     const __filename = fileURLToPath(import.meta.url)
     const __dirname = path.dirname(__filename)
     ```
     (siguiendo el mismo patrón canónico usado en `alumnosView.form.test.js`).

## Verificación
- `npm run lint --quiet`: **0 errores** (salida limpia, exit code 0).
- `npx vitest run src/modules/clases/views/__tests__/clasesHoyView.grid.test.js`: **2 passed (2)**.
- Integridad: no hay mutaciones en base de datos ni afectaciones a runtime de producción.
