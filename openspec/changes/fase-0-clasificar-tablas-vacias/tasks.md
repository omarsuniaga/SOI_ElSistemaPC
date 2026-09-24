# Tasks: Fase 0.1 — Clasificar las tablas vacías

## Phase 1: Recontar contra producción (no asumir el diagnóstico de 2026-09-07)

- [ ] 1.1 Correr contra prod: `SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE n_live_tup = 0 ORDER BY relname;` (vía `mcp__Supabase__execute_sql` o `npm run policy:list`, que ya expone las huérfanas del baseline).
- [ ] 1.2 Diferenciar del resultado de 1.1 las vistas (`n_live_tup` siempre reporta 0 en vistas — no son tablas vacías, son vistas; excluirlas explícitamente, tal como advierte `docs/SOI_RUTA_A_REFERENCIA.md` §0).
- [ ] 1.3 Comparar el número resultante contra el baseline de `scripts/.structural-baseline.json` y contra el diagnóstico original (123). Documentar la diferencia — las migraciones `20260908140000_fase0_poda_DEPRECATE.sql` / `20260908141000_fase0_poda_DROP.sql` ya corrieron una ronda de poda; este número debería ser menor.

**Verification:** lista real de N tablas vacías (N ≤ 123 esperado), con fuente y fecha del conteo documentada en el inventario.

## Phase 2: Clasificar cada tabla

- [ ] 2.1 Por cada tabla de la lista de 1.1: `grep -rn "'<tabla>'" src supabase/functions` — ¿tiene algún lector/escritor en código?
- [ ] 2.2 Si no tiene código: revisar si aparece como entidad en alguno de los 6 changes activos de `openspec/changes/` (`teacher-portal-ai-grading`, `cierre-periodo`, `panel-hermes-calendario`, `justificacion-actividades-emergentes`, `seguimiento-ausentes`, `soi-event-spine`) — si sí, clasificación = **terminar** (tiene escritor planeado, no tocar hasta que ese change cierre).
- [ ] 2.3 Si no tiene código ni change activo: revisar si su intención sigue documentada en algún doc de visión (`SOI_MASTER_SPEC_*.md`, `docs/architecture/`, `docs/planning/`) — si sí y sigue vigente, clasificación = **archivar** (queda con `COMMENT ON TABLE ... DEPRECATED`, se resuelve más adelante). Si no hay rastro de intención vigente, clasificación = candidata a **eliminar**, pero pasa a 2.4 antes de tocar nada.
- [ ] 2.4 Toda candidata a **eliminar** se le confirma a Omar una por una (o en lote, pero explícito) antes de escribir cualquier `DROP` — no inferir. Registrar la respuesta en el inventario con fecha.
- [ ] 2.5 Caso especial familia `acm_*` (9 tablas): determinar si reemplaza a `planificacion` (revisar si algún change activo o doc reciente la referencia como sucesora) o si se archiva — documentar como ADR corto dentro del propio inventario, no un archivo aparte a menos que la decisión sea compleja.
- [ ] 2.6 Caso especial portales-cascarón: confirmar contra `portal_catalog` en prod cuáles siguen `activo=true` sin uso real, más allá de los 3 ya desactivados (AUD/TEC/COM) en la migración del 09-08.

**Verification:** cada tabla de la lista tiene exactamente una de las 3 clasificaciones, con la razón en una línea.

## Phase 3: Producir el inventario

- [ ] 3.1 Escribir `docs/INVENTARIO_TABLAS_2026Q3.md` — tabla markdown: `tabla | clasificación (terminar/archivar/eliminar) | razón | dueño | fecha objetivo | referencia (change/doc si aplica)`.
- [ ] 3.2 Para las clasificadas "terminar": el "dueño" y "fecha objetivo" salen del change de OpenSpec que la va a llenar — no inventar una fecha nueva, usar la que ya tiene ese change si la tiene, o marcar "sin fecha — change sin estimación" si no.

**Verification:** `docs/INVENTARIO_TABLAS_2026Q3.md` existe y cubre el 100% de la lista de Phase 1.

## Phase 4: Ejecutar la poda (solo archivar/eliminar confirmadas)

- [ ] 4.1 Migración `supabase/migrations/<timestamp>_fase0_poda_ronda2_DEPRECATE.sql` — `COMMENT ON TABLE` para todas las clasificadas "archivar", siguiendo exactamente el formato de `20260908140000_fase0_poda_DEPRECATE.sql`.
- [ ] 4.2 Migración separada `supabase/migrations/<timestamp>_fase0_poda_ronda2_DROP.sql` — solo para las que Omar confirmó explícitamente en 2.4, siguiendo el formato de `20260908141000_fase0_poda_DROP.sql`. PR independiente del de 4.1 — el `DROP` no viaja junto con nada más.
- [ ] 4.3 Si la familia `acm_*` se archiva (según 2.5): incluir en 4.1, no en un tercer archivo.

**Verification:** ambas migraciones aplicadas en un branch de prueba de Supabase antes de ir a prod (`apply_migration` contra branch, no directo a producción).

## Phase 5: Cerrar el trinquete

- [ ] 5.1 `npm run policy:record` — regrabar el baseline. Revisar a mano que el diff tenga más líneas borradas que agregadas (regla explícita de `docs/POLITICA_DE_DESARROLLO.md`).
- [ ] 5.2 `npm run policy:check` en verde.
- [ ] 5.3 Actualizar `openspec/TASK_BOARD.md`: marcar esta tarea `completada`.
- [ ] 5.4 Mover este change a `openspec/changes/archive/` con fecha.
