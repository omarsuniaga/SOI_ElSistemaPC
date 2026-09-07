# Evaluación: ¿sirven estos XLSX para el módulo de inventario?

Archivos evaluados (raíz del repo):
- `Análisis y limpieza profesional del inventario.md`
- `INVENTARIOELSISTEMAPUNTACANA2026_LIMPIO.xlsx` (1.26 MB, 13 hojas)
- `INVENTARIOELSISTEMAPUNTACANA2026_LIMPIO_PROFESIONAL.xlsx` (1.28 MB, 14 hojas)

## Veredicto

**No.** El formato NO es coherente para construir el módulo, y **NO se deben
importar a la DB** — degradarían los datos que ya existen.

La DB `inventario_activos` ya tiene **307 instrumentos** normalizados
(importados el 2026-06-22 desde una versión ya limpia). Estos XLSX son un
export **crudo, sin deduplicar y con columnas rotas**. Son un paso ATRÁS.

## Qué son estos archivos

- `LIMPIO.xlsx`: 11 fotos mensuales del inventario (oct 2025 → ago 2026)
  **apiladas en una sola hoja** `instrumentos_normalizados` → 2760 filas. NO es
  un maestro deduplicado. El mismo instrumento aparece ~11 veces.
- `LIMPIO_PROFESIONAL.xlsx`: datos idénticos + una hoja `DASHBOARD` de portada.
  Cero normalización adicional. Es cosmético.
- `.md`: autoevaluación honesta que reconoce casi todos estos problemas
  ("fechas bajo TAMAÑO se reportan sin reinterpretación", "no se debe asumir
  unicidad de `codigo`", "id_registro = hoja + fila").

## Problemas de calidad de datos (bloqueantes)

| Problema | Detalle (medido) |
|---|---|
| **Sin deduplicar** | 2760 filas ≈ 257 instrumentos × 11 períodos. `agosto 2026` (última foto) = 315 filas, 257 códigos distintos. No hay PK real. |
| **`tamano` destruido** | Excel convirtió las fracciones (4/4, 3/4, 1/2) a fechas seriales. En `agosto 2026`: **119 fechas basura, 8 valores reales, 188 nulos**. Irrecuperable de este archivo. |
| **`codigo` inconsistente** | 270 distintos. Mezcla: numéricos con separador de miles (`22.094`, `22.100.` con punto final), alfanuméricos (`ESPCCTB10YA`), legacy (`23051`). Sin unicidad. |
| **`estado` no es un estado** | Free-text que mezcla notas de condición + estado de asignación ("EN USO" ×299, "NO" ×15, "DISPONIBLE" ×8) + **nombres de alumnos** ("DARALING PEGUERO" ×5, "MARTHIN RAMOS" ×5). 415 nulos. |
| **`instrumento`** | Aceptable (VIOLIN 698, CLARINETE 214…) pero 180 nulos y mezcla materiales (BAQUETA, ACEITE PARA VALVULAS, GRASA). |
| **`asignado`** | Nombre de alumno como texto libre → requiere fuzzy-match contra `alumnos`. |
| **`marca`** | Incluye "SIN MARCA" y valores `marca: modelo` concatenados ("STEG: BUCHWALDER"). |

## Contraste con la DB (fuente de verdad actual)

`inventario_activos` — **ya poblado y normalizado** (pipeline `20260622_*`:
staging table + CSV normalizado + patches + RPCs):

| Métrica | DB `inventario_activos` | XLSX `agosto 2026` |
|---|---|---|
| Instrumentos | **307** (295 activos) | ~257–315 (según cómo dedupliques) |
| `codigo` distintos | 307 (únicos) | 257, no únicos |
| Con `tamano` | **167** | 8 reales (119 fechas basura) |
| Con `numero_serie` | 106 | ~108 crudos |
| `tipo_instrumento` | normalizado snake_case | crudo, 180 nulos |
| `estado_conservacion` / `estado_uso` | enums propios | inexistente (está en free-text) |
| `tiene_arco/estuche/funda`, `faltantes_detectados` | parseados de observaciones | inexistente |
| Trazabilidad | `fuente_importacion` (301) | `id_registro` + `fila_original_json` |
| Relaciones | `comodatos_activos` (29), FK a `alumnos`, `inventario_reparaciones`, `inventario_accesorios`, `inventario_historial` | ninguna |

**La DB es más limpia Y más completa.**

## Lo que SÍ tiene valor en los XLSX (revisión manual, no import automático)

1. `aux_codigos_el_sistema` — registro canónico de códigos `ESPC...` (~270). Útil
   para validar y eventualmente renombrar los códigos legacy numéricos.
2. `aux_no_asignados` (32 filas) + `aux_nuevos` (33 filas) — instrumentos que
   quizás no estén en la DB. Cruzar por código.
3. Instrumentos de `agosto 2026` con código que NO exista en `inventario_activos`
   → candidatos a INSERT (cruce de códigos, factible pero sucio por el formato).
4. `aux_inventario_activos` (51) — activos NO instrumentales (archiveros,
   atriles…). Solo si se quiere inventario de mobiliario, que hoy no existe.

## Recomendaciones

1. **No importar estos archivos.** Perderías `tamano`, `estado_conservacion` y
   los flags de accesorios que la DB ya tiene.
2. **Sacar los 3 archivos de la raíz** → `docs/inventario/fuentes/` (violan
   "Root Cleanliness" de AGENTS.md). O `.gitignore` si son de trabajo.
3. Para **actualizar la DB con datos frescos de agosto 2026** (lo correcto):
   - Conseguir el Excel ORIGINAL (`INVENTARIOELSISTEMAPUNTACANA2026.xlsx`) con la
     hoja de agosto sin apilar.
   - Re-correr el pipeline de normalización `20260622_*` sobre esa hoja sola.
   - `diff` contra `inventario_activos` por código → INSERT nuevos, UPDATE
     cambios de ubicación/estado/asignación.
   - Reconstruir `tamano` de la fuente original (las fechas no se pueden
     revertir a fracciones sin el archivo sin corromper).
4. Para el **módulo de inventario**: el esquema
   (`inventario_activos` + `comodatos_activos` + `inventario_reparaciones` +
   `inventario_accesorios` + `inventario_historial`) **ya es coherente y está
   poblado**. Falta UI/features, no datos ni estructura.
5. El portal LUT ya lee de `inventario_activos` real (307). El portal FIN tiene
   la copia MOCK (decisión pendiente: híbrido — ver
   `decision-fin-luteria-mock.md`). Ninguno necesita estos XLSX.
