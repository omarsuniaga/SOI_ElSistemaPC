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
