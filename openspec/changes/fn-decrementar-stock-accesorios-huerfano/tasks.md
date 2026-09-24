# Tasks: `accesorios` / `fn_decrementar_stock` — cerrar la capacidad huérfana

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 0 (diagnóstico) hasta ~200 (Opción A) o ~20 (Opción B) |
| Decision needed before apply | **Sí — bloqueante, ver Phase 1** |
| Chained PRs recommended | Depende de la rama elegida |
| Delivery strategy | single-change hasta Phase 1; luego bifurca |

## Phase 0: Diagnóstico de datos (no requiere decisión previa — ejecutar primero)

- [ ] 0.1 Conectar a prod (vía `mcp__Supabase__execute_sql` o `psql "$DATABASE_URL"`) y correr:
      `SELECT count(*) AS total, count(*) FILTER (WHERE stock_actual > 0) AS con_stock FROM public.accesorios;`
- [ ] 0.2 Buscar otros referenciadores de `fn_decrementar_stock` fuera de `src/` y `supabase/functions/` — vistas, triggers u otras funciones SQL:
      `grep -rn "fn_decrementar_stock" supabase/migrations supabase/*.sql`
- [ ] 0.3 Revisar si `accesorios` aparece en `scripts/.structural-baseline.json` (la lista de tablas huérfanas conocidas del `policy:check`) — si ya está ahí, esto no es un hallazgo nuevo, es deuda ya registrada y el veredicto cambia (confirmar con `npm run policy:list`).
- [ ] 0.4 Revisar si existe algún documento de visión/producto (README, `docs/planning/*`, specs de `openspec/`) que mencione "asignar accesorio a alumno" o "préstamo de accesorio" como intención vigente, distinta de comodato de instrumentos (`comodatos_activos`, que sí está vivo con 29 filas).

**Salida de Phase 0:** un resumen corto (conteo de filas, si está en el baseline, si hay intención de producto documentada) para decidir Opción A vs B.

## Phase 1: Decisión (BLOQUEANTE — requiere a Omar)

- [ ] 1.1 Presentar el resumen de Phase 0 y pedir explícitamente: **¿Opción A (reconstruir) u Opción B (archivar)?**
- [ ] 1.2 No avanzar a Phase 2A o 2B sin respuesta registrada (fecha + quién decide, como pide R1 de la política).

## Phase 2A: Si Opción A — reconstruir el flujo en `portales/fin`

- [ ] 2A.1 Si Phase 0.1 mostró la tabla vacía o sin catálogo real: primero cargar catálogo de accesorios (bloqueante, ya señalado en `docs/PORTAL_FIN_BACKLOG.md` como pendiente de baja prioridad) — coordinar con quien mantiene ese backlog antes de construir UI sobre datos ficticios.
- [ ] 2A.2 Definir dónde vive el flujo: ¿pestaña nueva dentro de `TienditaView.tsx` o vista independiente en `src/portales/fin/src/views/`? Decidir según si el propósito es "inventario físico a préstamo" (más cercano a `src/modules/inventario`) o "consumo de accesorios en caja" (más cercano a Tiendita). Revisar `src/modules/inventario/api/inventarioSupabase.js` — ya maneja `inventario_accesorios` (tabla distinta) — para no crear un tercer concepto de "accesorio" confuso.
- [ ] 2A.3 Crear repositorio/adapter en `src/portales/fin/src/infrastructure/supabase/` que llame `supabase.rpc('fn_decrementar_stock', { p_accesorio_id, p_cantidad })` — la función ya existe y es correcta (revisar SQL en `supabase/migrations/20260905210000_fn_decrementar_stock.sql`, no requiere cambios).
- [ ] 2A.4 UI: selector de accesorio + cantidad + confirmación, siguiendo el patrón de Clean Architecture ya establecido en `portales/fin` (domain/application/infrastructure).
- [ ] 2A.5 Test: asignar accesorio con stock suficiente descuenta correctamente; asignar con stock insuficiente no baja de 0 (la función ya tiene `greatest(0, ...)`, testear que el layer de aplicación refleja ese resultado al usuario en vez de fallar silenciosamente).
- [ ] 2A.6 `npm run test:run` verde.

## Phase 2B: Si Opción B — archivar la capacidad

- [ ] 2B.1 Crear `supabase/migrations/<timestamp>_deprecate_accesorios_stock.sql` siguiendo el patrón exacto de `20260908140000_fase0_poda_DEPRECATE.sql`: `COMMENT ON TABLE public.accesorios IS 'DEPRECATED — sin escritor desde migración caja→portales/fin, ver openspec/changes/fn-decrementar-stock-accesorios-huerfano'` y lo mismo para la función si aplica (`COMMENT ON FUNCTION`).
- [ ] 2B.2 No hacer `DROP` en este mismo change — solo `DEPRECATE`. El `DROP` sigue el ciclo de poda de Fase 0 (`docs/SOI_RUTA_A_REFERENCIA.md` §5.1), con su propia clasificación y ventana de confirmación.
- [ ] 2B.3 Anotar en `docs/PORTAL_FIN_BACKLOG.md` (sección "Tiendita `#/accesorios`") que el bloqueo original (`fn_decrementar_stock` faltante) fue resuelto por la migración de 2026-09-05, pero que la vía completa se archivó por falta de escritor — reemplazar la entrada actual en vez de duplicarla.
- [ ] 2B.4 `npm run policy:check` — confirmar que archivar (no borrar) no afecta el baseline; si el `policy:list` ya contaba esta tabla como huérfana, verificar que el número baja o se mantiene, nunca sube.

## Phase 3: Cierre (ambas rutas)

- [ ] 3.1 Actualizar este `tasks.md` marcando la rama no elegida como "N/A — se eligió la otra opción" en vez de dejarla ambigua.
- [ ] 3.2 `npm run test:run` completo en verde.
- [ ] 3.3 Mover este change a `openspec/changes/archive/` una vez cerrado, con fecha.
