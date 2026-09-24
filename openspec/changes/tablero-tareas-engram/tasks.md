# Tasks: Tablero de tareas cross-agente (Engram + OpenSpec)

## Phase 1 — Plan B primero: tablero en archivo (no depende de Engram, ejecutable hoy)

- [ ] 1.1 Crear `openspec/TASK_BOARD.md` en la raíz de `openspec/` con una
      tabla markdown, columnas: `task_id | título | estado | prioridad |
      agente_asignado | rama_git | openspec_change | última_actualización`.
- [ ] 1.2 Sembrar 3 filas iniciales:
      - `planificacion-dataadapter-migracion-restante` — disponible — media
      - `fn-decrementar-stock-accesorios-huerfano` — disponible (bloqueada
        en Phase 1 de su propio tasks.md hasta que Omar decida A/B) — media
      - `fase-0-clasificar-tablas-vacias` — **no existe todavía como change
        formal** — antes de listarla como "disponible", crear su
        `openspec/changes/fase-0-clasificar-tablas-vacias/` con
        proposal.md + tasks.md (usar `docs/SOI_RUTA_A_REFERENCIA.md` §5,
        Fase 0.1 como fuente) — sin esto la fila del tablero apunta a nada.
- [ ] 1.3 Escribir en el propio `TASK_BOARD.md` el protocolo de 3 pasos:
      leer tabla → antes de tomar, `git pull` para confirmar que nadie la
      tomó en un commit más reciente → editar la fila (estado, agente,
      rama) en el mismo commit donde se crea el branch de trabajo, para que
      el "tomar" sea atómico con el commit que lo registra.
- [ ] 1.4 Añadir a `AGENTS.md` §3 (Directory Structure) o una sección nueva
      corta: "antes de tomar trabajo nuevo, consultar
      `openspec/TASK_BOARD.md`" — sin esto el tablero existe pero nadie lo
      va a mirar.

**Verification:** `openspec/TASK_BOARD.md` legible, referenciado desde
AGENTS.md, con las 3 tareas (la tercera con su change ya creado, no solo
prometido).

## Phase 2 — Confirmar la API de escritura de Engram (bloqueante, requiere conector)

- [ ] 2.1 Conectar el servidor MCP de Engram a una sesión de Claude Code
      (fuera del alcance de este agente hoy — requiere que Omar u otro
      operador lo habilite, igual que están habilitados GitHub/Supabase/
      Vercel en esta sesión).
- [ ] 2.2 Una vez conectado: listar las funciones disponibles del servidor
      (equivalente a lo que `ToolSearch` hace en esta sesión) y confirmar
      si existe `mem_create`/`mem_update`/`mem_upsert` o equivalente, y su
      firma exacta (¿requiere `topic` + `project` + `content`? ¿versiona
      automáticamente o hay que leer-modificar-escribir?).
- [ ] 2.3 Documentar la firma confirmada en este archivo (reemplazar esta
      tarea por la firma real una vez se sepa) — es el insumo que le falta
      al `proposal.md` para decidir si Fase 3 es viable tal como está
      diseñada o necesita ajuste.
- [ ] 2.4 Probar con una escritura de bajo riesgo: crear UNA entrada de
      prueba bajo `topic: "coordination/task-board-test"` (no el topic real
      todavía), leerla de vuelta con `mem_get_observation`, confirmar que
      persiste entre sesiones distintas (cerrar sesión, abrir otra, volver
      a leer).

**Verification:** una entrada de prueba en Engram, escrita en una sesión y
leída exitosamente desde otra sesión distinta.

## Phase 3 — Migrar el tablero real a Engram (solo si Phase 2 confirma escritura viable)

- [ ] 3.1 Migrar las filas de `openspec/TASK_BOARD.md` a observaciones
      individuales en Engram bajo `topic: "coordination/task-board"`,
      `project: "sistema-academico-pwa"`, con el esquema YAML definido en
      `proposal.md`.
- [ ] 3.2 Decidir explícitamente: ¿`TASK_BOARD.md` se retira (Engram como
      única fuente de verdad) o se mantiene como espejo de solo-lectura
      generado desde Engram (para quien no tenga el conector)? — recomendado:
      mantenerlo como espejo mientras no todos los agentes tengan Engram
      conectado, para no dejar a nadie ciego.
- [ ] 3.3 Actualizar `AGENTS.md` con el comando real
      (`mem_search(query: "coordination/task-board", project:
      "sistema-academico-pwa")`) reemplazando la instrucción de leer el
      archivo markdown.
- [ ] 3.4 Definir quién/qué regenera el espejo `TASK_BOARD.md` desde Engram
      (¿un script en `scripts/`? ¿manual en cada cierre de tarea?) — no
      dejarlo como promesa sin dueño, mismo principio que R1 de la política
      estructural.

**Verification:** un agente en una sesión nueva, sin haber leído esta
conversación, puede correr el `mem_search` de 3.3, obtener la lista de
tareas disponibles, tomar una, y que otro agente que consulte 5 minutos
después ya la vea como tomada.

## Phase 4 — Cierre

- [ ] 4.1 Si Phase 2 confirma que Engram NO tiene escritura utilizable (o
      el conector no se habilita en un plazo razonable), cerrar este change
      dejando Phase 1 (el archivo markdown) como solución definitiva, no
      como parche temporal — actualizar `proposal.md` quitando la promesa
      de Fase 3 para no dejar deuda documental de algo que no va a pasar.
- [ ] 4.2 `npm run test:run` no debería verse afectado (este change es
      documentación/proceso, cero código) — confirmar igual que no se rompió
      nada por accidente.
