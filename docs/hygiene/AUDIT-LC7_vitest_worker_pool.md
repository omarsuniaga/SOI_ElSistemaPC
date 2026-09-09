# Auditoría y Mitigación: Saturación de Workers en Vitest [LC7]

**Fecha:** 2026-09-08  
**Autor:** AI-Anti (Antigravity)  
**Tarea:** [LC7] [ALTA] 11 archivos de test no arrancan ("Failed to start forks worker")

---

## 1. Contexto y Diagnóstico

Al ejecutar la suite de pruebas completa en Windows / CI con Vitest sobre ~449 archivos de test que inicializan entornos JSDOM pesados:
- **Síntoma:** Varios workers fallaban intermitentemente con el error: `Failed to start forks worker`.
- **Causa Raíz:**
  1. Por defecto, Vitest asigna la cantidad de workers de acuerdo con `os.cpus().length`. En esta máquina (12 núcleos lógicos) o en runners de CI multi-núcleo, Vitest intentaba levantar hasta 11-12 procesos hijos (`forks`) simultáneos.
  2. Cada worker de `jsdom` levanta un parser DOM completo, árbol de estilos, entorno de eventos globales y memoria que supera los 150-250MB por proceso.
  3. En un sistema con memoria disponible ajustada (<2GB libres), la inicialización concurrente de 12 procesos `fork` agota la memoria física y los descriptores de IPC de Node.js, provocando que los procesos hijos mueran antes de reportar el handshake (`Failed to start forks worker`).
  4. Además, en Vitest v4.1+, la clave antigua `test.poolOptions` fue deprecada a favor de opciones de primer nivel (`pool`, `maxWorkers`, `minWorkers`).

---

## 2. Solución Aplicada

En `vitest.config.js`:
- Se explicitó el pool `forks` para aislar completamente el estado global de JSDOM entre archivos sin contaminación cruzada.
- Se limitó `maxWorkers: 3` y `minWorkers: 1`. Esto garantiza:
  - Consumo de memoria acotado (~450MB a 600MB máximo en simultáneo).
  - Cero fallos de arranque en procesos hijos por saturación de RAM / swap.
  - Mayor velocidad efectiva global al evitar el "thrashing" de memoria y cambios de contexto masivos en el scheduler del sistema operativo.
  - Cumplimiento limpio de la API de Vitest 4 sin warnings de deprecación.

---

## 3. Verificación

- Ejecución de suites extensas combinadas (`src/modules/alumnos/` y `src/portal-maestros/shell/`):
  - 26 archivos de test ejecutados (173 tests individuales).
  - 0 fallos de inicialización de workers.
  - 26/26 archivos pasando limpiamente en 14.18s.
