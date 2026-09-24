# Proposal: `accesorios` / `fn_decrementar_stock` — cerrar la capacidad huérfana

## Problem Statement

`docs/PORTAL_FIN_MENU_AUDITORIA.md` y `docs/PORTAL_FIN_BACKLOG.md` (2026-09-06)
describen un bug puntual: `cajaSupabase.js:asignarAccesorio` llamaba a la RPC
`fn_decrementar_stock`, que no existía en prod, y su fallback usaba
`supabase.raw()` (inexistente en supabase-js v2) — el stock nunca se
descontaba. La migración `20260905210000_fn_decrementar_stock.sql` (PR #53)
creó la función para resolver eso.

**Diagnóstico actual (2026-09-24) — el bug descrito ya no aplica, hay uno
nuevo y más grave detrás:**

- `src/modules/caja/` (el módulo que contenía `cajaSupabase.js`) **no existe
  en el checkout actual**. Fue reemplazado por `src/portales/fin/` (rewrite
  TypeScript, Clean Architecture).
- Búsqueda exhaustiva confirma **cero llamadas** a `fn_decrementar_stock` o a
  `.from('accesorios')` en todo `src/` (incluye el nuevo portal fin) y en
  `supabase/functions/*`.
- La tabla `accesorios` (con `stock_actual`) y la función RPC **sí existen**
  en el esquema real de producción (confirmado en
  `src/portales/fin/src/infrastructure/supabase/database.types.ts`).
- El portal fin nuevo tiene una vista "Tiendita" (`TienditaView.tsx`,
  ~1400 líneas), pero es **Procurement Intelligence** — sugerencias de compra
  vía IA/marketplace (`marketplaceProviders.ts`) — un dominio distinto de
  "asignar un accesorio físico a un alumno y descontar stock". No toca la
  tabla `accesorios` en ningún punto.

**Conclusión:** la capacidad "descontar stock al asignar un accesorio" quedó
sin escritor en ningún lugar del código actual. Es exactamente el patrón que
`docs/POLITICA_DE_DESARROLLO.md` R1 busca prevenir ("toda tabla nace con
escritor") — aquí el escritor original existió, se perdió en la migración a
`portales/fin`, y nadie lo repuso. La función RPC quedó viva y funcional,
apuntando a nada.

## Decisión de negocio requerida (bloqueante — no autónoma)

Este change **no se puede ejecutar sin que Omar decida** entre dos caminos,
porque implica una decisión de producto, no una corrección técnica:

### Opción A — Reconstruir el flujo en `portales/fin`
Si "asignar accesorio físico a alumno con descuento de stock" sigue siendo
una capacidad que FUNEYCA necesita (independiente de la Tiendita de IA),
construir una vista/flujo nuevo en `src/portales/fin` que la cubra,
reutilizando `fn_decrementar_stock` tal como está.

**Prerrequisito de datos:** antes de construir nada, correr
`SELECT count(*) FROM accesorios` y `SELECT count(*) FROM accesorios WHERE stock_actual > 0`
en prod. Si la tabla está vacía o sin catálogo real cargado, esto es Fase 0
(cargar catálogo) antes que Fase construcción de UI — ver
`docs/PORTAL_FIN_BACKLOG.md` → "Tiendita `#/accesorios`: cargar catálogo de
accesorios" (ya señalado ahí como pendiente, prioridad baja).

### Opción B — Archivar la capacidad
Si el concepto fue absorbido por la Tiendita de Procurement Intelligence o
ya no aplica al modelo de negocio actual, seguir el patrón ya usado en
`supabase/migrations/20260908140000_fase0_poda_DEPRECATE.sql` /
`20260908141000_fase0_poda_DROP.sql`: marcar la función y la tabla como
deprecadas, y decidir su destino en la próxima ronda de poda de Fase 0
(`docs/SOI_RUTA_A_REFERENCIA.md` §5, Fase 0.1 — clasificar tablas vacías o
huérfanas).

**Este proposal no elige por Omar.** Las tareas abajo cubren el diagnóstico
verificable y dejan la bifurcación explícita en el primer punto de acción.

## Scope

**In:**
- Confirmar con datos reales (conteo de filas, `stock_actual` no nulo) si
  `accesorios` tiene contenido real o está vacía.
- Producir la recomendación técnica (A o B) basada en ese dato + en si existe
  intención de producto documentada en algún lado para "asignar accesorio
  físico" como feature separada de Tiendita/Procurement.
- Ejecutar el camino que Omar confirme.

**Out:**
- Tocar `TienditaView.tsx` / Procurement Intelligence — es un dominio
  distinto, no se mezcla.
- Cualquier decisión de producto tomada unilateralmente por el agente.

## Approach

1. **Task 1 (diagnóstico de datos)** no requiere decisión previa — correr y
   reportar.
2. Con el resultado de Task 1, presentar a Omar: "la tabla tiene N filas /
   está vacía; ¿reconstruimos el flujo o archivamos la capacidad?".
3. Ejecutar según la respuesta (Fase A o Fase B abajo, mutuamente
   excluyentes).

## Risk Treatment

| Riesgo | Mitigación |
|---|---|
| Archivar sin verificar que nadie más depende de `fn_decrementar_stock` (ej. un reporte externo, un cron no versionado) | Grep ya cubrió `src/` y `supabase/functions/`; falta revisar triggers/vistas SQL que la referencien — incluido en Task 1 |
| Construir Opción A sobre una tabla sin catálogo real cargado | El conteo de filas en Task 1 es gate explícito antes de escribir código |
| Duplicar lógica si "accesorios" termina siendo un caso particular de Tiendita/Procurement | Revisar `marketplaceProviders.ts` y el modelo de datos de Tiendita antes de decidir Opción A, por si conviene fusionar en vez de reconstruir por separado |

## Success

- [ ] Conteo real de `accesorios` reportado (filas totales, filas con `stock_actual > 0`)
- [ ] Confirmado si alguna vista/trigger SQL además del código de aplicación referencia `fn_decrementar_stock`
- [ ] Decisión de Omar registrada (Opción A o B) con fecha
- [ ] Si Opción A: flujo nuevo construido en `portales/fin`, con test que confirma que `stock_actual` se descuenta correctamente vía la RPC existente
- [ ] Si Opción B: migración de deprecación siguiendo el patrón `fase0_poda_DEPRECATE.sql`, y `accesorios`/`fn_decrementar_stock` agregados a `docs/INVENTARIO_TABLAS_2026Q3.md` (si ese archivo llega a crearse por Fase 0.1) o a una nota equivalente
