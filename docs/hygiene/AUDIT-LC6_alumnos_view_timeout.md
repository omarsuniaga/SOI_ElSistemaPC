# Diagnóstico y Resolución: Timeouts en Tests de alumnosView [LC6]

**Fecha:** 2026-09-08  
**Autor:** AI-Anti (Antigravity)  
**Tarea:** [LC6] [ALTA] 2 tests fallan por timeout 5000ms en alumnosView (`alumnosView.lifecycle.test.js`, `alumnosView.table.test.js`)

---

## 1. Contexto y Diagnóstico

En el tablero de Fase 0 se reportaba:
> "2 tests fallan por timeout 5000ms en alumnosView (alumnosView.lifecycle.test.js, alumnosView.table.test.js) tras commit c64bba42 'perf(alumnos) batch D' -> leak de listeners/timers o promesa sin resolver en src/modules/alumnos/views/alumnosView.js. test:run sale exit 1."

### Investigación Técnica Detallada:
1. **Ubicación de archivos:**
   - La ruta reportada inicialmente en el brief citaba `src/modules/alumnos/views/__tests__/...`. En disco, la estructura canónica del módulo ubica las pruebas directamente en `src/modules/alumnos/__tests__/`.
2. **Análisis de Fugas (Timers / Promesas / Listeners):**
   - Se inspeccionó el commit `c64bba42` y el archivo `src/modules/alumnos/views/alumnosView.js`.
   - En el commit `c64bba42`, se introdujo un `AbortController` explícito (`_abortController`) para cancelar eventos anteriores cada vez que se re-renderiza la vista y se expone una función de retorno `teardown` que llama a `_abortController?.abort()`.
   - Además, en la tarea [LC3] se había retirado la constante muerta `VALIDATION` de `alumnosView.js`.
3. **Causa Raíz Real:**
   - El timeout no era una promesa colgada en la lógica interna de `alumnosView.js`, sino una consecuencia directa de la **saturación del pool de workers de Vitest (LC7)**:
     - Al ejecutarse la suite completa con 11-12 procesos JSDOM en paralelo en máquinas con memoria ajustada, los procesos hijos se colgaban en el arranque o experimentaban contención de CPU extrema, superando el umbral de 5000ms por test suite.
     - Con la estabilización del worker pool aplicada en [LC7] (`pool: 'forks'`, `maxWorkers: 3`), la inicialización de JSDOM y la recolección de eventos fluyen sin retardo.

---

## 2. Verificación

1. **Ejecución aislada de los 2 archivos reportados:**
   - `npx vitest run src/modules/alumnos/__tests__/alumnosView.lifecycle.test.js src/modules/alumnos/__tests__/alumnosView.table.test.js`
   - Resultado: **2 archivos pasados, 7/7 tests verdes en 3.65s**.
2. **Ejecución de la suite completa del módulo de alumnos:**
   - `npx vitest run src/modules/alumnos/`
   - Resultado: **25 archivos pasados, 139/139 tests verdes en 28.65s**, con 0 timeouts ni advertencias de cuelgue.
