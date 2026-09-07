# Saneamiento del inventario — evaluación + diff vs DB · 2026-09-07

Fuente correcta: **`INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx`**, hoja
`AGOSTO 2026` (la más reciente = estado actual). Los `_LIMPIO*.xlsx` son un
export apilado sin deduplicar — descartados (ver `evaluacion-xlsx-inventario-2026-09-07.md`).

Herramientas construidas (dry-run, no tocan la DB):
- `scripts/inventario/sanitize-inventario-2026.cjs` → normaliza la hoja
- `scripts/inventario/diff-vs-db.cjs` → compara contra `inventario_activos`
- Salidas en `scripts/inventario/out/`

## ¿El formato es coherente para el módulo?

**El esquema de la DB sí. El Excel no — pero es saneable.**

El Excel es una planilla que se re-tipea cada mes. Problemas de raíz:
| Problema | Solución aplicada |
|---|---|
| `TAMAÑO` guardado como fecha (`2024-04-03` = "3/4") | **Reversible**: `día/mes` → fracción. Recupera 154 tamaños. |
| `CODIGO` mezcla ESPC / numérico / basura / con separador Excel | trim, `22.122`→`22122`, junk→null. 272/317 con código válido, 0 duplicados. |
| `UBICACIÓN` + `ASIGNADO` sobrecargados (lugar + estado + alumno) | derivar `estado_uso` / `estado_conservacion` / `asignado_texto` / `ubicacion` |
| `INTRUMENTO` con typos y materiales mezclados | mapa a `tipo_instrumento` canónico + familia; 30 materiales separados |
| Filas de percusión sin código (baquetas, timpani, pads…) | 45 filas — necesitan política (ver decisiones) |

Resultado del saneo: **317 instrumentos + 30 materiales**, con:
- `tamano`: 60×4/4, 46×3/4, 31×1/2, 7×1/4, 3×1/8, 1×7/8, 163 sin dato
- `estado_uso`: 150 prestado, 141 disponible, 26 en_reparacion
- `estado_conservacion`: 102 excelente, 185 bueno, 20 dañado, 10 regular
- 151 asignados a un alumno (texto libre → falta match a `alumnos`)

## Contraste con la DB (`inventario_activos`, 307 filas)

**La DB tampoco está limpia** — fue un primer import rústico (2026-06-22):
tiene los mismos códigos con puntos (`22.100.`), `ubicacion='ASIGNADO'`,
`estado_conservacion='mantenimiento'` ×102 (no es un estado de conservación),
`tipo` inconsistente (`chelo` y `violoncello`, `tuba_mi_bemol` vs otros).

### Diff xlsx-AGOSTO vs DB

| Resultado | Cantidad | Qué es |
|---|---:|---|
| Match sin cambios | 36 | idénticos |
| **UPDATE** | 217 | cambios de campo — ver abajo |
| **INSERT** (solo en xlsx) | 19 | instrumentos nuevos que faltan en la DB |
| **Solo en DB** | 54 | percusión/pianos con código sintético + activos del Luthier |
| Sin código (no matcheable) | 45 | percusión de salón |

**Cambios de UPDATE por campo**: `asignado_texto` 164, `estado_conservacion`
126, `estado_uso` 58, `tipo_instrumento` 21, `numero_serie` 4, `marca`/`modelo`
3, `tamano` 2.

- `asignado_texto` (164): reasignaciones reales de junio → agosto. **Legítimo.**
- `estado_conservacion` (126): en gran parte por el mapeo DB `mantenimiento` →
  saneo `bueno/excelente`. **Necesita reconciliación, no import ciego.**
- `tipo_instrumento` (21): diferencias de ortografía canónica.

### INSERT candidatos (19) — parecen reales

Serie `25275`–`25288` (violines/contrabajos nuevos), `ESPCVLN171-178`,
`ESPCSAX173GC`, `ESPCTPA35EX`, `21C0234` (piano digital). Verificar con la
sede que son adquisiciones recientes.

### Solo en DB (54) — NO son retiros

Casi todos son percusión con código sintético (`AUTO-PER-*`, `DONADO-*`,
`ESPCPAD168IH-323`) o activos del taller (`C-001`, `V-001`, "Luthier SOI") que
el Excel de agosto no lista con código. **Mantener.** Solo 2-3 candidatos
reales a retiro (`ESPCVLN35RO`, `23.070` que ya está `activo=false`).

## Decisiones necesarias antes de generar la migración

1. **`estado_conservacion`**: la DB usa `mantenimiento` como valor. El saneo
   deriva `excelente/bueno/regular/danado` de las observaciones. ¿Reconciliamos
   a un enum canónico (`excelente|bueno|regular|danado|de_baja`) y migramos la
   DB también? ¿O respetamos lo que ya tiene la DB salvo cambio explícito?
2. **`tipo_instrumento`**: fijar lista canónica. Propuesta: unificar
   `chelo`→`violoncello`, `tuba_mib`→`tuba_mi_bemol`, `flauta_traversa`→
   `flauta_trasversa` (respetar la ortografía ya usada en la DB aunque sea rara).
3. **Percusión sin código** (45 filas): ¿generar códigos sintéticos como hizo el
   import viejo (`PERC-SALON-001`)? ¿O tratarlos como "activo de salón" sin
   código individual? La DB ya tiene ~30 así.
4. **Materiales/accesorios** (30): ¿van a `inventario_accesorios`? ¿tabla nueva
   `inventario_materiales`? Hoy no hay dónde ponerlos.
5. **Match `asignado_texto` → `alumnos`**: 151 nombres. ¿Fuzzy match con umbral
   y reporte de los que no matchean para revisión manual? ¿Crear/actualizar
   `comodatos_activos` a partir de eso, o solo llenar `asignado_a_texto`?
6. **Alcance de la migración**: ¿solo INSERT los 19 nuevos + UPDATE los cambios
   de asignación de agosto? ¿O saneo completo (los 126 de conservación, tipos,
   etc.)?
7. **Historial**: las 11 hojas mensuales permiten reconstruir el historial de
   reasignaciones/ubicación en `inventario_historial`. ¿Vale la pena o es
   over-engineering para ahora?

## Recomendación

Fase 1 (bajo riesgo, alto valor): INSERT los 19 nuevos + UPDATE
`asignado_texto`/`estado_uso` de los que cambiaron en agosto + fix de los 21
`tipo_instrumento`. Dejar `estado_conservacion` y la reconciliación de enums
para una Fase 2 con criterio acordado. Materiales y historial: Fase 3.

---

## Fase 1 — EJECUTADA

`supabase/migrations/20260907060000_inventario_saneamiento_fase1_altas.sql`
- 17 altas seguras (verificadas ausentes en prod, `ON CONFLICT DO NOTHING`)
- 2 comentadas para revisión (`23.07` = `23.070` retirado; `ESPCTPA35EX` con asignado)
- Los 21 "cambios de tipo" resultaron ser diferencias de ortografía (`flauta_traversa`
  vs `flauta_trasversa` de la DB) — el saneador se alineó a la DB, no hay nada que fixear.

## Fase 2 — DECISIONES + EJECUTADA

`supabase/migrations/20260907061000_inventario_saneamiento_fase2.sql` — 122 UPDATE
dirigidos, en una transacción, solo sobre filas NO retiradas.

**A) `estado_conservacion` (90 filas):** las que tienen el valor basura
`mantenimiento` (default del import de junio, sin correlación con `estado_uso`)
pasan al valor derivado de las observaciones del Excel (`bueno` 47, `excelente`
22, `regular` 21). `de_baja` no se toca. Las 12 `mantenimiento` sin match en el
xlsx quedan como están (pasada posterior).

**B) asignación (32 filas):**
- reasignaciones nombre→nombre (3) y altas de asignación (13): `asignado_a_texto`
  se resuelve contra `alumnos` con match difuso (token overlap + Levenshtein ≤1);
  `estado_uso = 'prestado'`.
- bajas explícitas (16): el Excel de agosto dice DISPONIBLE / DEVUELTO / EN
  RESTAURACIÓN → `asignado_a_texto = NULL`, `estado_uso` = `disponible` o
  `en_reparacion`.
- 1 sin match confiable (`ESPCTBN140IH` "BRAYNEL PACHECO") → comentada.

**Fuera de Fase 2:** `comodatos_activos` NO se sincroniza — el Excel no tiene
`fecha_entrega` confiable y formalizar comodatos (con contrato firmado) es
workflow del portal LUT. La ficha 360 seguirá leyendo `comodatos_activos` (29);
`inventario_activos.asignado_a_texto` es el registro operativo y puede diferir.
Sync de comodatos → Fase 3.

## Fase 3 — EJECUTADA (parcial, por decisión)

`supabase/migrations/20260907062000_inventario_materiales.sql`
- **HECHO**: tabla `inventario_materiales` (RLS igual que `inventario_activos`)
  + carga de los 30 consumibles a granel (cañas, aceites, cepillos, baquetas),
  idempotente por `(item, marca, modelo)`.
- Nota: el "mojibake" que se veía era artefacto de display del terminal. Los
  datos del Excel están bien codificados (`Ñ`=0xD1, `ó`=0xF3). Sin corrupción.

**NO ejecutado, por decisión:**
- `comodatos_activos` sync: el Excel no tiene `fecha_entrega` y formalizar un
  comodato (con contrato firmado) es workflow del portal LUT.
  `inventario_activos.asignado_a_texto` ya cubre "quién tiene el instrumento".
- `inventario_historial` de las 11 hojas mensuales: over-engineering para la
  necesidad actual.
- 12 `mantenimiento` sin match + 45 sin código: valor marginal, riesgo > beneficio.

---

## Para aplicar — las 3 migraciones del saneamiento, EN ORDEN

1. `supabase/migrations/20260907060000_inventario_saneamiento_fase1_altas.sql`
2. `supabase/migrations/20260907061000_inventario_saneamiento_fase2.sql`
3. `supabase/migrations/20260907062000_inventario_materiales.sql`

Todas en transacción, validadas contra los CHECK constraints y contra prod.
`ON CONFLICT` / `WHERE NOT EXISTS` para idempotencia donde aplica.
