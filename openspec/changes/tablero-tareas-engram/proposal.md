# Proposal: Tablero de tareas cross-agente usando Engram + OpenSpec

## Problem Statement

Hoy la coordinación entre agentes (Claude Code, y potencialmente otros) pasa
por documentos estáticos leídos manualmente: `openspec/TRIAGE.md`,
`docs/PORTAL_FIN_BACKLOG.md`, handoffs sueltos en `docs/planning/`. Cada
agente que entra a una sesión nueva tiene que releer todo para saber qué
está libre, qué está tomado y qué ya se cerró — y no hay forma de que dos
agentes trabajando en paralelo sepan si alguien más ya tomó una tarea, salvo
que revisen `git log` o pregunten a Omar.

Ya existe un precedente documentado: `docs/superpowers/HANDOFF.md` instruye
a los agentes a correr `mem_search(query, project: "sistema-academico-pwa")`
en Engram antes de empezar cualquier fase del Portal Maestros. Es decir,
Engram **ya es la capa de memoria técnica cross-sesión** que este proyecto
usa — pero no está siendo usada como tablero de tareas con estados, solo
como bitácora de contexto/decisiones.

## Lo que se puede confirmar hoy vs. lo que falta verificar

**Confirmado en la documentación del repo:**
- Engram opera por `project` (este repo = `"sistema-academico-pwa"`) y por
  `topic` dentro del proyecto (ej. `architecture/necesidades-flow`).
- Existen operaciones de lectura: `mem_search(query, project)` y
  `mem_get_observation`.

**No confirmado (no aparece documentado, y el conector no está disponible en
esta sesión para probarlo en vivo):**
- Si existe una operación de escritura (`mem_create` / `mem_update` /
  equivalente) y su firma exacta.
- Si Engram ofrece algún tipo de bloqueo atómico (para que "tomar una tarea"
  sea una operación segura entre agentes concurrentes) o si es solo
  almacenamiento de observaciones sin control de concurrencia.
- La relación exacta entre Engram y el `coordination/lanes` + `tablero #3536`
  que menciona `SOI_MASTER_SPEC_v2.0_UNIFICADO.md:237` — ese tablero no vive
  en ninguno de los dos repos de GitHub en alcance (`SOI_ElSistemaPC`,
  `ElSistemaPC`); probablemente es un tablero externo (Linear/Notion/vault
  Obsidian institucional) que Engram referencia pero no reemplaza.

## Actualización 2026-09-24 — evidencia nueva que cambia el diagnóstico

Una sesión de agente distinta (local, Windows, Engram conectado) demostró en
vivo un backlog activo mucho más grande que el de este archivo —
`CDA1-6`, `ACM2-4`, `ESC1`, `LC1/5/8`, `T0.5c`,
`decision-maestro-actividad-especial`, `Repertorio R1-B/R1-C` — y lo
reportó con detalle (estados, PRs, bloqueos por decisión de Omar). Eso
confirma dos cosas que antes estaban en duda:

1. **Engram sí tiene uso de escritura/actualización de estado en la
   práctica** — aunque yo no pude verificar la firma exacta de la API
   (sigo sin el conector en esta sesión), el hecho de que ese backlog exista
   con estados actualizados prueba que alguien lo escribe.
2. **El problema ya no es "¿existe un mecanismo?" — existe y funciona en al
   menos una sesión.** El problema real es que **hay múltiples fuentes de
   verdad divergentes al mismo tiempo**: el Engram de esa sesión, mi
   `openspec/TASK_BOARD.md`, y potencialmente lo que rastrean Codex/AntiGravity
   por su lado (mencionados en el handoff de esa sesión como auditores). Esto
   es coordinación multi-agente, no solo "un tablero de tareas" — el scope de
   este change se amplía en consecuencia (ver Fases 5-7 en `tasks.md`).

**Decisión de diseño derivada:** no voy a intentar replicar ni adivinar el
backlog de Engram de memoria (lo que reporté en esta conversación es
second-hand, vino de un pegado del usuario, no de una consulta directa mía).
Cualquier plan de coordinación tiene que asumir que **Engram es la fuente de
verdad cuando está disponible**, y que las sesiones sin conector (como esta)
operan en modo degradado explícito, nunca fingiendo paridad.

**Decisión de diseño que se deriva de esto:** no diseñar el tablero
asumiendo que Engram tiene locking atómico. Diseñarlo **optimista**, con
detección de conflicto en vez de prevención — es el patrón más seguro dado
lo que no está verificado.

## Approach — dos capas, cada una con el rol que ya sabe hacer bien

**Capa 1 — OpenSpec (`openspec/changes/`): la definición del trabajo.**
Ya es el mecanismo real y probado de este repo (visto en 8 changes activos +
20 archivados). Cada tarea asignable a un agente es un change con
`proposal.md` + `tasks.md` — exactamente el formato que ya usamos hoy para
`planificacion-dataadapter-migracion-restante` y
`fn-decrementar-stock-accesorios-huerfano`. No se reinventa nada acá.

**Capa 2 — Engram (`project: "sistema-academico-pwa"`, `topic:
"coordination/task-board"`): el índice vivo de estado.**
Una entrada por change de OpenSpec, con estado y quién la tiene tomada.
Cuando un agente entra a una sesión nueva, en vez de leer 5 documentos
sueltos, corre **una sola búsqueda**:

```
mem_search(query: "coordination/task-board", project: "sistema-academico-pwa")
```

y obtiene la lista completa de tareas con su estado actual, sin tener que
adivinar cuáles de los `openspec/changes/*` están libres.

## Esquema de la entrada de tablero (una observación por tarea en Engram)

```yaml
task_id: planificacion-dataadapter-migracion-restante   # = carpeta en openspec/changes/
titulo: "Migrar 4 consumidores restantes al DataAdapter de planificación"
estado: disponible   # disponible | tomada | en_progreso | bloqueada | en_revision | completada
prioridad: media      # alta | media | baja
agente_asignado: null # nombre/id de sesión, null si disponible
tomada_en: null       # timestamp ISO, null si disponible
openspec_change: "openspec/changes/planificacion-dataadapter-migracion-restante"
rama_git: null         # se llena cuando el agente crea su branch
ultima_actualizacion: "2026-09-24T00:00:00Z"
notas: ""
```

## Protocolo de "tomar" una tarea (optimista, sin asumir locking)

1. Agente corre `mem_search` sobre `coordination/task-board`.
2. Filtra por `estado: disponible`.
3. Antes de tomarla, **relee la entrada específica** con
   `mem_get_observation` para confirmar que sigue disponible (mitiga la
   ventana de carrera entre el search y el claim — no la elimina).
4. Escribe la actualización marcándola `tomada`, con su identificador de
   agente/sesión y timestamp — **esto requiere la operación de escritura no
   verificada**; si no existe, ver "Plan B" abajo.
5. Crea el branch de trabajo y lo referencia en la entrada.
6. Al terminar cada fase de `tasks.md`, actualiza `estado` (`en_progreso` →
   `en_revision` → `completada`) y dispara push del change a `archive/` si
   corresponde, siguiendo el mismo flujo que ya usamos hoy.

**Riesgo de carrera aceptado:** si dos agentes leen "disponible" casi al
mismo tiempo y ambos escriben "tomada", el conflicto se resuelve como se
resuelve en git: el segundo commit/push gana o falla por conflicto, y el
agente que pierde la carrera lo nota al re-sincronizar y pasa a la siguiente
tarea disponible. No es peor que lo que ya pasa hoy sin tablero — es
estrictamente mejor porque al menos hay señal, aunque no haya garantía dura.

## Plan B — si Engram no tiene escritura (o no se puede conectar aún)

No bloquear todo el mecanismo a que se resuelva la duda de la API de
Engram. Arrancar con un tablero de archivo en el propio repo:

`openspec/TASK_BOARD.md` — una tabla markdown con las mismas columnas del
esquema de arriba. Menos elegante que Engram (requiere `git pull` para ver
estado fresco en vez de una consulta), pero **funciona hoy, sin
dependencias externas**, y es trivialmente migrable a Engram después: el
esquema es el mismo, solo cambia el medio de almacenamiento.

Este change arranca por el Plan B (Fase 1) y deja la migración a Engram como
Fase 2, condicionada a confirmar la API de escritura.

## Scope

**In:**
- Crear `openspec/TASK_BOARD.md` con el esquema de arriba, sembrado con las
  tareas ya identificadas esta sesión.
- Documentar el protocolo de tomar/actualizar tareas en un archivo que los
  agentes lean al empezar (extensión de `AGENTS.md` o archivo propio
  referenciado desde ahí).
- Dejar preparado (sin ejecutar) el plan de migración a Engram una vez esté
  disponible el conector y confirmada su API de escritura.

**Out:**
- Implementar contra la API real de Engram — bloqueado hasta tener el
  conector disponible y la firma de escritura confirmada.
- Tocar el `coordination/lanes` / tablero `#3536` institucional — es externo
  a estos dos repos, fuera de este alcance.
- Construir una UI web para el tablero — el markdown + Engram (cuando esté)
  es suficiente para agentes que leen texto; no hay pedido de UI humana acá.

## Success

- [ ] `openspec/TASK_BOARD.md` existe, sembrado con las 3 tareas ya
      identificadas (`planificacion-dataadapter-migracion-restante`,
      `fn-decrementar-stock-accesorios-huerfano`, y la de Fase 0.1 —
      clasificar tablas vacías — pendiente de convertir a change formal)
- [ ] `AGENTS.md` referencia el protocolo del tablero como paso obligatorio
      antes de empezar trabajo
- [ ] Confirmado (por quien conecte Engram) si existe `mem_create`/`mem_update`
      y su firma — documentado en este mismo change antes de intentar Fase 2
- [ ] Si se confirma la escritura: entradas espejo creadas en Engram bajo
      `topic: "coordination/task-board"`, `project: "sistema-academico-pwa"`

## Protocolo de coordinación multi-agente (ampliación 2026-09-24)

Tres problemas separados, que hasta ahora se estaban tratando como uno solo:

### A. ¿Quién es la fuente de verdad? (resuelto arriba: Engram, cuando está disponible)

Regla explícita: **ninguna sesión inventa su propio tablero paralelo si
Engram está al alcance.** Una sesión sin conector (modo degradado) puede
seguir trabajando, pero:
- Marca todo lo que produce como "vista parcial, sesión sin Engram — fecha X"
  (ya se hizo en `TASK_BOARD.md`).
- Al primer momento en que Engram esté disponible, esa sesión reconcilia
  (no reemplaza) lo que escribió contra lo que ya existe ahí — Fase 6 abajo.

### B. Candado por área ("lanes") — evitar que dos agentes toquen lo mismo a la vez

`SOI_MASTER_SPEC_v2.0_UNIFICADO.md:237` menciona `coordination/lanes (candado
por área)` sin detallar el mecanismo. Sin poder inspeccionarlo, se propone un
diseño mínimo compatible con lo que ya sabemos de Engram (topics):

- **Área = dominio funcional**, no archivo individual (ej.: `finanzas`,
  `academico-planificacion`, `hermes-notificaciones`, `lutheria`,
  `repertorio`, `portal-maestros-calendario`) — lo bastante granular para no
  bloquear todo el repo por una tarea, lo bastante amplio para que dos
  agentes no choquen en la misma tabla/RPC sin saberlo.
- Antes de tocar código de un área: `mem_search(query: "coordination/lanes/<area>",
  project: "sistema-academico-pwa")`. Si hay una entrada con `estado: ocupado`
  y `expira_at` en el futuro, esperar o coordinar con quien la tiene.
- Al empezar: escribir `estado: ocupado`, `agente`, `tipo_agente` (Claude
  Code / Codex / AntiGravity / humano), `task_id` (el change de OpenSpec que
  lo justifica), `expira_at` (timestamp — un lock que nunca expira es un lock
  que se olvida liberado; sugerido: +4h renovable).
- Al terminar (o si `expira_at` ya pasó): liberar. Un lock vencido se trata
  como libre — no bloquea indefinidamente por una sesión que se cortó.
- **Esto es advisory, no hard-lock.** El backstop real sigue siendo git: si
  dos agentes igual chocan, el conflicto de merge es quien realmente lo
  impide. El lane solo reduce la probabilidad y dice "por qué" cuando pasa.

### C. Identidad de agente — saber quién hizo qué

Todo commit, entrada de Engram o fila de `TASK_BOARD.md` debe poder
atribuirse a: **tipo de agente** (Claude Code / Codex / AntiGravity / lila /
AI-Anti / humano) + **identificador de sesión** cuando exista (ej. el
`Claude-Session:` que ya llevan mis commits). Sin esto, un lock huérfano o
una tarea "tomada" no tiene a quién preguntarle si sigue viva.

## Success (ampliado)

- [ ] Diseño de lanes documentado arriba, con acuerdo explícito de que es
      advisory (no reemplaza git como backstop real)
- [ ] Convención de identidad de agente aplicada de forma consistente en
      Engram, `TASK_BOARD.md` y mensajes de commit
- [ ] Al menos una reconciliación real ejecutada entre esta sesión y la
      sesión con Engram (ver `tasks.md` Fase 6) — no solo diseñada en papel
