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

## Phase 4 — Cierre (de la parte "tablero de tareas" original)

- [ ] 4.1 Si Phase 2 confirma que Engram NO tiene escritura utilizable en
      *esta* sesión, no cerrar el change entero — la evidencia de la Fase 5
      (otra sesión sí escribe) ya demuestra que el mecanismo funciona en
      general. Lo que cierra es solo "¿esta sesión concreta tiene acceso?",
      no "¿el diseño es viable?".
- [ ] 4.2 `npm run test:run` no debería verse afectado (este change es
      documentación/proceso, cero código) — confirmar igual que no se rompió
      nada por accidente.

## Phase 5 — Reconocer y mapear el backlog real ya existente en Engram

- [ ] 5.1 En cuanto una sesión con Engram conectado esté disponible (esta
      misma, si se conecta, u otra): correr `mem_search(query: "backlog OR
      tablero OR reparaciones", project: "sistema-academico-pwa")` y volcar
      el resultado completo — no el resumen de segunda mano que ya tengo de
      un pegado de chat — a un documento verificable.
- [ ] 5.2 Confirmar el alcance exacto de las entradas ya conocidas por
      referencia indirecta (`CDA1-6`, `ACM2-4`, `ESC1`, `LC1/5/8`, `T0.5c`,
      `decision-maestro-actividad-especial`, `Repertorio R1-B/R1-C`) —
      estado real, no el que aparecía en el momento del pegado (puede haber
      avanzado).
- [ ] 5.3 Cruzar contra `openspec/changes/` de este repo: ¿`Repertorio R1-B/R1-C`
      tiene change propio? Si no, crearlo (mismo patrón que
      `fase-0-clasificar-tablas-vacias`) — no dejar una tarea con 4204 tests
      verdes y despliegue pendiente sin su change formal.

## Phase 6 — Reconciliación entre `TASK_BOARD.md` y Engram

- [ ] 6.1 Las 4 filas actuales de `TASK_BOARD.md` (`planificacion-dataadapter-migracion-restante`,
      `fn-decrementar-stock-accesorios-huerfano`, `fase-0-clasificar-tablas-vacias`,
      `tablero-tareas-engram`) se registran como entradas nuevas en Engram
      bajo `coordination/task-board` — evitar que queden invisibles para
      quien solo consulta Engram.
- [ ] 6.2 Verificar que ninguna de las 4 se solape con algo ya en el backlog
      de Engram (ej.: ¿`decision-maestro-actividad-especial` toca la misma
      tabla `confirmaciones_emergentes`/`justificaciones_actividades_emergentes`
      que mi `justificacion-actividades-emergentes` ya listado en el
      backlog de `TASK_BOARD.md`? — cruzar antes de que dos agentes escriban
      migraciones distintas sobre el mismo dominio).
- [ ] 6.3 Una vez reconciliado: `TASK_BOARD.md` pasa a ser explícitamente un
      espejo de solo-lectura (quitar la sección "vista parcial" y reemplazarla
      por "sincronizado con Engram el <fecha>, ver ahí para estado en vivo").

## Phase 7 — Lanes (candado por área) y convención de identidad

- [ ] 7.1 Crear las primeras entradas de `coordination/lanes/<area>` en
      Engram para las áreas activas hoy: `academico-planificacion` (varios
      changes activos ahí), `finanzas` (Portal FIN backlog), `hermes-notificaciones`
      (frente CDA de la otra sesión), `academico-emergentes` (mi change +
      `decision-maestro-actividad-especial`).
- [ ] 7.2 Adoptar la convención de identidad (`tipo_agente` + `session_id`)
      en los 3 lugares: entradas de Engram, filas de `TASK_BOARD.md`
      (columna nueva `tipo_agente`), y pie de commits (ya existe para Claude
      Code vía `Claude-Session:`; falta para Codex/AntiGravity si aplica).
- [ ] 7.3 Documentar en `AGENTS.md` §5bis el flujo completo: consultar lane
      antes de tocar un área → tomar tarea en el tablero → trabajar → liberar
      lane → actualizar estado. No como texto nuevo suelto, como reemplazo
      del §5bis actual (que hoy solo menciona el tablero, no los lanes).

**Verification (Fases 5-7):** un agente que entra a una sesión nueva, con o
sin Engram conectado, puede responder sin ambigüedad: "¿qué áreas están
ocupadas ahora mismo, por quién, y hasta cuándo?" — y esa respuesta coincide
entre sesiones distintas consultadas en paralelo.
