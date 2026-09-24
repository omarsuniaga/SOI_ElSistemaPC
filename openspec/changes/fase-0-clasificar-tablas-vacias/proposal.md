# Proposal: Fase 0.1 — Clasificar las tablas vacías

## Problem Statement

`docs/SOI_RUTA_A_REFERENCIA.md` (diagnóstico 2026-09-07) mide 247 tablas en
producción, 123 completamente vacías (50%). El documento identifica esto
como el hallazgo que ordena todo el roadmap y recomienda explícitamente
(§8, "Secuencia recomendada"): *"si hubiera que elegir un solo movimiento
para empezar: Fase 0.1 — clasificar las 123 tablas vacías"*, porque
desbloquea todo lo demás y evita que la Fase 1 agregue superficie sobre
superficie ya construida y no cerrada.

`docs/POLITICA_DE_DESARROLLO.md` (R1) ya trinquetea esto: el baseline actual
(2026-09-07) registra 13 tablas huérfanas y 151 sin `institucion_id`, y
`npm run policy:check` falla si esos números suben. Pero el trinquete solo
impide que crezca la deuda — no la reduce. Esta tarea es la primera reducción
real y deliberada.

## Scope

**In:**
- Producir `docs/INVENTARIO_TABLAS_2026Q3.md` — una fila por cada una de las
  123 tablas vacías, con decisión: **terminar** (tiene escritor planeado a
  corto plazo, ej. en un change de OpenSpec activo) / **archivar**
  (`COMMENT ON TABLE ... IS 'DEPRECATED'`, sin `DROP` todavía) / **eliminar**
  (`DROP`, solo si se confirma que nunca tuvo intención real o quedó
  completamente superada).
- Decidir el destino de la familia `acm_*` (9 tablas, 0 filas) — ¿reemplaza a
  `planificacion` o se archiva? (Acción 0.3 del roadmap original.)
- Consolidar los 8 portales-cascarón detectados (Acción 0.4) — cruzar contra
  `supabase/migrations/20260908150000_fase0_portal_catalog_desactivacion.sql`,
  que ya desactivó AUD/TEC/COM: confirmar si quedan más portales sin uso real
  o si esa migración ya cubrió el punto.
- Ejecutar la migración de poda para las tablas clasificadas como
  "eliminar" (siguiendo el patrón ya usado en
  `20260908140000_fase0_poda_DEPRECATE.sql` /
  `20260908141000_fase0_poda_DROP.sql` — **no reinventar el patrón, hay
  precedente directo en este mismo repo**).

**Out:**
- Cerrar los bucles de evaluación/acción (Fase 1 del roadmap) — eso viene
  después y depende de que esta poda esté hecha.
- Decidir sobre tablas que SÍ tienen filas — el criterio "vacía" es literal,
  no una revisión de calidad de dato en tablas con contenido.
- La capacidad `accesorios`/`fn_decrementar_stock` (huérfana pero NO vacía en
  esquema — ya tiene su propio change en
  `openspec/changes/fn-decrementar-stock-accesorios-huerfano/`. Referenciar
  desde el inventario, no duplicar el análisis).

## Approach

1. **No hay atajo para el conteo real** — correr contra producción, no contra
   el diagnóstico de hace 2 semanas (los números ya cambiaron desde
   2026-09-07: hay migraciones de poda del 09-08 que probablemente bajaron el
   conteo de huérfanas — confirmar antes de reclasificar algo ya resuelto).
2. Por cada tabla vacía, tres preguntas del diagnóstico original aplicadas
   una por una: ¿tiene código que la lee/escribe en `src/`? ¿tiene una
   migración/change activo en `openspec/changes/` que la va a llenar pronto?
   ¿su intención sigue vigente en algún doc de visión?
3. Clasificación por defecto cuando hay duda: **archivar, no eliminar**. El
   `DROP` es la única acción irreversible de esta lista — requiere
   confirmación explícita de Omar por tabla, no inferencia del agente
   (coherente con AGENTS.md §6: autonomía total salvo "operaciones
   destructivas irreversibles").

## Risk Treatment

| Riesgo | Mitigación |
|---|---|
| Clasificar como "eliminar" una tabla que en realidad tiene un escritor planeado en un change activo no revisado | Cruzar cada tabla vacía contra los 6 changes activos de `openspec/changes/` (`teacher-portal-ai-grading`, `cierre-periodo`, `panel-hermes-calendario`, `justificacion-actividades-emergentes`, `seguimiento-ausentes`, `soi-event-spine`) antes de clasificar |
| El conteo de 123 está desactualizado por las migraciones de poda ya aplicadas el 09-08 | Task 1 de tasks.md es recontar contra prod antes de clasificar nada |
| `DROP` accidental de una tabla con RLS/triggers dependientes | Ninguna clasificación llega a `DROP` sin pasar primero por `DEPRECATE` en un PR separado y una ventana de confirmación — mismo patrón que el precedente del 09-08 |

## Success

- [ ] `docs/INVENTARIO_TABLAS_2026Q3.md` existe, con las 123 (o el número real
      recontado) tablas clasificadas, una fila cada una, con dueño y fecha
- [ ] Familia `acm_*` con decisión explícita registrada (ADR o nota en el
      inventario)
- [ ] `npm run policy:list` muestra el número de huérfanas bajando respecto al
      baseline (criterio de salida del roadmap: ≤ 40 tablas vacías, cada una
      con dueño y fecha objetivo)
- [ ] `npm run policy:record` corrido y revisado a mano (el diff del
      baseline debe tener más líneas borradas que agregadas)
