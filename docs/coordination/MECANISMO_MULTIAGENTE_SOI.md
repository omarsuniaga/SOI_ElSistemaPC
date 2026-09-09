# Mecanismo multi-agente SOI — especificación técnica

> Estado: propuesta · Autor: Claude-Code · Fecha: 2026-09-09
> Canónico en Engram: `coordination/mecanismo` (este archivo es el espejo versionado).
> Complementa y detalla: `coordination/soi-multi-agent-protocol` (#2589), `coordination/modelo-de-trabajo` (#3545).

---

## 1. Propósito

Un sistema de trabajo continuo en el que varios agentes LLM (AI-Anti / Antigravity, AI-Codex, Claude-Code) **mejoran el SOI de forma autónoma y coordinada**: detectan fallas y deuda, las publican en un backlog compartido, y las resuelven una por una en ramas aisladas que un humano (Omar) integra.

El mecanismo debe garantizar:

1. **Cero colisión de archivos** entre agentes trabajando en paralelo.
2. **Cero pérdida de estado** por el modelo de escritura de Engram (upsert).
3. **Coherencia**: cada cambio sigue el contexto del sistema; si el agente no lo tiene, lo busca o pregunta, nunca improvisa.
4. **Trazabilidad**: de cada cambio se puede reconstruir qué falla resolvía, por qué, quién y en qué PR.
5. **Distribución de carga según presupuesto de tokens** de cada agente.
6. **Un único punto de integración** (Omar) — ningún agente mergea.

---

## 2. Principios (heredados de SOI-MAP + nuevos)

| # | Principio | Origen |
|---|-----------|--------|
| P1 | Proyecto Engram único: `soi_elsistemapc`. Nunca la raíz. | SOI-MAP |
| P2 | Un ÁREA = un dueño a la vez (candado blando). | SOI-MAP |
| P3 | Cada agente su rama; nadie mergea a `master`. Omar es el único integrador. | SOI-MAP |
| P4 | Antes de crear un concepto nuevo, buscar en Engram si ya existe. Conectar, no duplicar. | SOI-MAP |
| P5 | **Regla anti-clobber**: ningún agente escribe en un topic compartido con una nota parcial. Cada agente escribe en su propio topic; el coordinador consolida. | nuevo (§8) |
| P6 | **Contexto obligatorio antes de actuar**: leer protocolo + carriles + backlog + topic-fuente de la tarea. | nuevo (§6) |
| P7 | **Ante la duda, preguntar**: si el agente no puede resolver de forma coherente con el sistema, escribe la duda y para. No improvisa. | nuevo (§6.5) |
| P8 | **Presupuesto primero**: el agente declara su presupuesto de tokens al inicio de cada iteración; el reparto de carga lo respeta. | nuevo (§7) |

---

## 3. Actores

### 3.1 Claude-Code — Coordinador + INTEGRACIÓN
- **Escribe** (exclusivo): `coordination/lanes`, `tablero/reparaciones`.
- **Tría**: lee `tablero/intake/*` cada pasada, convierte hallazgos en tareas del backlog, limpia el intake procesado.
- **Ejecuta** el área INTEGRACIÓN (shared/core): `src/lib/*`, `adminPortalShell`, `allRegistrars`, `vite.config`, `*.html`, `supabase/migrations/*`, CI, `tareasApi/Mock/Supabase`.
- **Puente git de Codex**: commitea y abre PR de los drafts que produce AI-Codex.
- Capacidad git: completa (worktrees, ramas, commits, PR).

### 3.2 AI-Anti (Antigravity) — Agente de loop completo
- **Beat**: UI/UX de portales. Refactor a `docs/UI_THEME_IMPLEMENTATION_STANDARD_V9.md`, componetización de vistas monolíticas, accesibilidad, responsive, empty states, eliminación de `style=` inline.
- **Escribe**: `tablero/<id>/progress` (el suyo), `tablero/intake/ai-anti`.
- Capacidad git: completa. Trabaja en worktree propio.

### 3.3 AI-Codex (Codex CLI) — Descubrimiento + Drafts
- **Beat**: correctness. Mutaciones Supabase sin verificación de filas, `.single()` sobre conjuntos no unitarios, error swallowing, dead code, `==`, gaps de cobertura de tests, validación de inputs, N+1.
- **Restricción dura**: NO puede operar git — hay una ACL `Deny Write,Delete` sobre `.git` para la identidad `msi\codexsandboxoffline`. No puede crear ramas, commits ni refs. Sí puede editar archivos del working tree.
- **Modo de trabajo**: escanea su beat, publica hallazgos en `tablero/intake/ai-codex`, y opcionalmente deja **borradores de archivos** en un worktree que Claude-Code o AI-Anti commitean.
- **Escribe** (Engram): `tablero/<id>/progress` (cuando draftea), `tablero/intake/ai-codex`.
- Si Omar corrige la ACL o Codex corre su git desde una terminal con permisos normales → pasa a agente de loop completo.

### 3.4 Omar — Puente humano + Integrador único
- Pasa los prompts a los agentes (desde el visor, botón copiar).
- Pregunta el presupuesto de tokens antes de repartir lotes.
- **Mergea** los PR (en orden de prioridad). Es el único que lo hace.
- Al mergear: marca el área como `LIBRE` en `coordination/lanes` (o avisa a Claude-Code).
- Decide todo lo destructivo o ambiguo: DROP/DDL, cambios de comportamiento en prod, veredictos de arquitectura.
- Mantiene el repo principal limpio (o los agentes usan worktrees y lo ignoran).

---

## 4. Sustrato de datos: Engram

Engram es la capa de **memoria + coordinación**. Modelo de almacenamiento relevante:

- Cada `topic_key` tiene **una sola versión vigente** (`observations.content`, TEXT). `mem_save` sobre un `topic_key` existente hace **upsert**: reemplaza el contenido. `revision_count` cuenta revisiones pero **no** se pueden leer las anteriores por API.
- `mem_search` / MCP **truncan** el contenido. Para el texto completo: `mem_get_observation(id)`.
- Consecuencia crítica → **P5 (anti-clobber)**: si dos agentes hacen `mem_save` sobre el mismo `topic_key` con notas parciales, el segundo borra lo del primero. Por eso el diseño usa **un topic por agente/tarea** y consolidación por el coordinador.

### 4.1 Catálogo de topics

| topic_key | Propósito | Escritor(es) | Formato | Semántica de escritura |
|-----------|-----------|--------------|---------|------------------------|
| `coordination/soi-multi-agent-protocol` | El protocolo base. Se lee, no se toca. | (congelado) | prosa | — |
| `coordination/mecanismo` | Este documento (canónico). | Claude-Code | markdown | reemplazo completo |
| `coordination/lanes` | Candado por ÁREA: quién trabaja qué ahora. | **solo Claude-Code** | tabla markdown (ver §4.2) | reemplazo completo, siempre la tabla entera |
| `coordination/modelo-de-trabajo` | Resumen operativo de alto nivel. | Claude-Code | markdown | reemplazo completo |
| `tablero/reparaciones` | El backlog: QUÉ hay que arreglar. | **solo Claude-Code** | markdown con tablas (ver §4.3) | reemplazo completo, siempre el backlog entero |
| `tablero/<id>/progress` | Bitácora de la tarea `<id>` (ej. `tablero/lc1/progress`). | el agente dueño de `<id>` | markdown libre + campos clave (ver §4.4) | reemplazo completo por su propio dueño; nadie más escribe |
| `tablero/intake/<agente>` | Cola de hallazgos crudos de un agente (`ai-anti`, `ai-codex`, `claude-code`). | ese agente | lista append-only (ver §4.5) | **append**: releer, agregar al final, guardar todo |
| `audit/<nombre>` | Resultados de auditorías (fuente de tareas). | quien audita | markdown | reemplazo completo |
| `fase-0/tablas-vacias-inventario` | Inventario BD FASE 0. | (archivo) | markdown | — |

### 4.2 Schema de `coordination/lanes`

Tabla markdown. Una fila por ÁREA. El coordinador la reescribe **entera** en cada cambio.

```
| Área | Estado | Dueño | Rama / worktree | Nota |
|------|--------|-------|-----------------|------|
| <nombre de área> | LIBRE \| EN-CURSO \| EN-REVIEW | <agente o —> | <rama> @ <ruta worktree> | <texto libre> |
```

Áreas canónicas: `INTEGRACIÓN`, `BD/api`, `Pedagógico/ausentismo`, `Testing infra`, `ACM`, `FIN`, `DIR`, `Hermes`, `Portales`, `Tooling`. (Ampliable; agregar fila, no renombrar sin migrar.)

### 4.3 Schema de `tablero/reparaciones`

Markdown. Secciones `##` por estado. Tablas con encabezados reconocidos por el visor: `ID`, `Área`, `Prio`, `Estado`, `Tarea`, `Agente`, `Origen`.

- `## 🔵 EN-CURSO / EN-REVIEW` — tareas tomadas.
- `## 🟢 LIBRE` — tomables ahora.
- `## ⏸ Espera Omar` — LIBRE pero necesitan un insumo humano.
- `## ✅ CERRADA` — párrafo con IDs cerrados (referencia al PR).

Cada tarea LIBRE **debe** tener: `ID`, `Área`, `Prio` (ALTA/MEDIA/BAJA), descripción con **archivo\:línea**, el **porqué**, y el **topic-fuente** (`audit/...`, `#nnnn`).

### 4.4 Campos clave de `tablero/<id>/progress`

Markdown libre, pero la **primera línea** y ciertos marcadores son parseados por el visor:

```
<ID> <ESTADO> [<Agente>/<AAAA-MM-DD>]. Rama: <rama>. <resumen de una línea>
PRESUPUESTO: alto | medio | bajo        (línea propia, actualizada cada iteración)

## <fecha> — <qué se hizo / qué se descubrió>
...
## Bloqueos / dudas
...
## Qué falta
...
```

`<ESTADO>` ∈ `EN-CURSO | EN-REVIEW | BLOQUEADO | CERRADA`.

### 4.5 Schema de `tablero/intake/<agente>`

Lista **append-only**. El agente relee el contenido, agrega líneas al final, guarda todo. Una línea por hallazgo:

```
[AAAA-MM-DD] <área> · <ALTA|MEDIA|BAJA> · <archivo:línea> · <qué está mal> · <por qué> · <fix propuesto> · <estado: NUEVO|TRIADO:<id>>
```

El coordinador marca `TRIADO:<id>` cuando lo pasa al backlog, y periódicamente poda las líneas `TRIADO`.

---

## 5. Sustrato de código: Git

- **Rama base de todo**: `feat/planificacion-clases-rediseño` (la de integración de facto). `origin/master` está congelada — **no** se usa.
- **Aislamiento**: cada agente trabaja en su propio **git worktree** bajo `.claude/worktrees/<nombre>`, con `node_modules` como junction al del repo principal. Nunca en el checkout principal (suele estar sucio con trabajo sin integrar).
- **Rama por tarea**: `<agente>/<id>-<slug>` (ej. `anti/AUS1-ausentismo-dashboard`).
- **PR**: siempre `base = feat/planificacion-clases-rediseño`. Un PR por tarea o por slice.
- **Tamaño**: si el diff estimado supera ~400 líneas → partir en slices, un PR por slice (chained).
- **Integración**: solo Omar mergea. Al mergear, el área vuelve a `LIBRE`.

---

## 6. El ciclo del agente

Pseudocódigo del bucle que corre cada agente de loop (Anti; Codex igual pero sin los pasos git).

```
loop:
  # 6.1 CONTEXTO
  protocolo := mem_get_observation( mem_search("coordination/soi-multi-agent-protocol") )
  mecanismo := mem_get_observation( mem_search("coordination/mecanismo") )
  lanes     := mem_get_observation( mem_search("coordination/lanes") )
  backlog   := mem_get_observation( mem_search("tablero/reparaciones") )

  # 6.2 PRESUPUESTO
  budget := estimar_presupuesto()            # alto | medio | bajo
  # se escribirá en el progress al reclamar (6.4) o al reportar (6.7)

  # 6.3 ELEGIR
  candidatas := backlog.LIBRE
               .filter(t -> t.area == mi_beat OR (mi_beat==INTEGRACION AND t.area∈INTEGRACION))
               .filter(t -> lanes[t.area].estado == LIBRE)
               .filter(t -> not t.espera_omar)
               .sort_by(prioridad DESC)
  # filtro por presupuesto:
  if budget == bajo:    candidatas := candidatas.filter(t -> t.tamaño == puntual)
  if budget == medio:   candidatas := candidatas.filter(t -> t.tamaño <= un_slice)

  if candidatas.empty:
     goto 6.8 DESCUBRIMIENTO

  tarea := candidatas.first

  # 6.4 RECLAMAR  (nunca escribir en coordination/lanes — P5)
  rama := "<agente>/<tarea.id>-<slug>"
  mem_save("tablero/<tarea.id>/progress",
           "<tarea.id> EN-CURSO [<agente>/<hoy>]. Rama: <rama>. <plan 2-3 líneas>\nPRESUPUESTO: <budget>")
  # el coordinador verá el progress y actualizará coordination/lanes

  # 6.5 AISLAR + ANALIZAR
  git worktree add ../soi-<agente>-<tarea.id> feat/planificacion-clases-rediseño
  cd  ../soi-<agente>-<tarea.id>
  git switch -c <rama>
  if fallo(git):
     mem_save("tablero/<tarea.id>/progress", ... "BLOQUEADO: <motivo>")
     goto 6.9 PARAR
  fuente := mem_get_observation( tarea.topic_fuente )
  confirmar_diagnostico_contra_codigo(tarea, fuente)   # grep exhaustivo, BD solo-lectura
  if not entiendo_como_resolver_coherentemente:
     mem_save("tablero/<tarea.id>/progress", ... "## Dudas: <preguntas concretas>")
     goto 6.9 PARAR                                     # P7 — no improvisar

  # 6.6 RESOLVER
  if diff_estimado > 400 líneas: tarea := slice_1(tarea)
  para cada cambio:
     if hay_tests_que_corren: TDD (test rojo -> fix -> test verde)
     editar SOLO archivos de tarea.area
  lint(archivos_tocados)
  # nada destructivo en BD sin Decisión+Dueño de Omar

  # 6.7 ENTREGAR
  mem_save("tablero/<tarea.id>/progress",
           "<tarea.id> EN-REVIEW [<agente>/<hoy>]. Rama: <rama>. PR #<n>.\nPRESUPUESTO: <budget>\n## Hecho: ...\n## Qué falta: ...")
  git commit ; git push ; gh pr create --base feat/planificacion-clases-rediseño
  # NO merge

  # 6.8 volver
  goto loop

DESCUBRIMIENTO (6.8):
  escanear mi_beat en busca de: fallas, deuda técnica, violaciones de estándar,
    oportunidades de refactor/UX/perf.
  para cada hallazgo:
     append a "tablero/intake/<agente>":  "[hoy] <área> · <sev> · <archivo:línea> · <qué> · <porqué> · <fix> · NUEVO"
  goto 6.3   # quizás el coordinador ya trió algo

PARAR (6.9):
  reportar a Omar (canal humano) el motivo.
  mem_session_summary(...)
  fin.
```

### 6.x Condiciones de parada (cualquier agente)

- No quedan tareas tomables (ni en modo descubrimiento hay más que reportar).
- No se puede crear rama/worktree.
- Una tarea necesita una decisión de Omar.
- Un fix requeriría tocar otra área (fuera del carril).
- Un test que estaba verde se rompe y no es trivial.
- El presupuesto de tokens cae a **bajo** a mitad de tarea → cerrar el slice actual como se pueda, guardar progress detallado, `mem_session_summary`, parar.

---

## 7. Presupuesto de tokens y reparto de carga

### 7.1 Reporte
Cada agente, al inicio de cada iteración y al entregar, escribe en su `progress` una línea:
```
PRESUPUESTO: alto | medio | bajo
```
- **alto** — > ~60 % de contexto/tokens libres.
- **medio** — ~30–60 %.
- **bajo** — < ~30 %.

(El agente lo estima de su propia ventana; no hay API. Si el runtime expone un contador, usarlo.)

### 7.2 Reglas de routing
| Presupuesto | Qué puede tomar |
|-------------|-----------------|
| alto | refactor grande / multi-archivo / slice completo / descubrimiento profundo de un área entera |
| medio | tarea de 1–2 archivos / un slice acotado / triage |
| bajo | fix puntual (1 archivo, mecánico) **o** cerrar y documentar lo en curso; luego `mem_session_summary` y terminar |

### 7.3 Quién decide
- El **agente** se auto-filtra en 6.3 según su presupuesto.
- **Omar** (o Claude-Code), antes de pasar un lote de tareas, pregunta "¿cómo van de tokens?" y reparte: lo pesado al que tiene **alto**, lo liviano al que tiene **medio/bajo**.
- El **visor** lee `PRESUPUESTO:` de cada `progress` y lo muestra en la tira de actividad, para que Omar lo vea de un vistazo.

---

## 8. Regla anti-clobber (detalle)

**Problema.** `mem_save(topic, contenido)` reemplaza. Si un agente hace `mem_save("coordination/lanes", "Tomé el área X")`, borra toda la tabla de carriles. Pasó dos veces (con `fase-0/tablero-tareas` y con `coordination/lanes`).

**Solución.**
1. **Topics compartidos** (`coordination/lanes`, `tablero/reparaciones`) → **un solo escritor**: Claude-Code. Siempre reescribe el documento completo.
2. **Estado propio de cada agente** → su topic `tablero/<id>/progress` (uno por tarea/agente). Nadie más lo toca.
3. **Cola de entrada** → `tablero/intake/<agente>`, **append-only**: releer, agregar al final, guardar todo. Sin escritores concurrentes en un mismo intake.
4. **Consolidación** → Claude-Code lee los `progress` y los `intake`, y actualiza los topics compartidos. El visor deriva la "Actividad de agentes" directamente de los `progress` (no depende de que nadie mantenga una tabla).

---

## 9. Máquinas de estados

### 9.1 Tarea
```
        crea el coordinador (desde intake/auditoría)
                     │
                     ▼
   ┌────────────► LIBRE ──────────────────────────┐
   │                 │ agente reclama (6.4)       │ Omar necesita dar un insumo
   │                 ▼                            ▼
   │             EN-CURSO                    (LIBRE · "espera Omar")
   │                 │ agente abre PR (6.7)       │ Omar da el insumo
   │                 ▼                            └────────► LIBRE
   │             EN-REVIEW
   │        Omar mergea │        Omar pide cambios │
   │                 ▼         └──────► EN-CURSO ──┘
   │             CERRADA
   └── (si el agente abandona / se bloquea sin PR → el coordinador la devuelve a LIBRE)
```

### 9.2 Carril (área)
```
LIBRE ──(coordinador registra reclamo de un agente)──► EN-CURSO
EN-CURSO ──(hay PR abierto para el área)──► EN-REVIEW
EN-REVIEW ──(Omar mergea)──► LIBRE
EN-CURSO/EN-REVIEW ──(agente abandona)──► LIBRE   [coordinador]
```
Invariante: **como máximo un agente** por área en estado ≠ LIBRE. Excepción: área `INTEGRACIÓN` puede tener varias tareas del mismo dueño (Claude-Code), nunca de dueños distintos.

---

## 10. Pipeline de intake (compartir una falla)

```
 agente en modo descubrimiento
        │  append línea NUEVO
        ▼
 tablero/intake/<agente>
        │  Claude-Code lee cada pasada
        ▼
 triage:  ¿es real? ¿duplica una tarea/hallazgo existente (buscar en Engram)?
        │  sí, nueva → asignar ID + área + prioridad
        ▼
 tablero/reparaciones (## LIBRE)      ── y marcar la línea de intake como TRIADO:<id>
        │
        ▼
 (podado periódico de líneas TRIADO)
```

- **SLA de triage**: Claude-Code procesa el intake al menos una vez por sesión de coordinación.
- **De-dup**: antes de crear la tarea, `mem_search` del área + palabras clave, para no duplicar (P4).
- Un hallazgo de severidad **ALTA** puede saltar a EN-CURSO en la misma pasada si hay un agente libre con presupuesto alto en esa área.

---

## 11. El visor (`tools/tablero/tablero.mjs`)

- **Read-only** sobre `~/.engram/engram.db` (`node:sqlite`, sin deps). No escribe en Engram.
- **Lee**: `tablero/reparaciones`, `coordination/lanes`, todos los `tablero/%/progress`.
- **Deriva**: la tira "Actividad de agentes" (id, estado, agente, rama, presupuesto, timestamp) a partir de los `progress` — resiliente al clobber.
- **Muestra**: kanban por estado (Libre/En curso/En review/Cerrada), carriles, actividad, pendientes de Omar, el protocolo, la tabla de topic_keys y el prompt copiable.
- **Uso**: `node tools/tablero/tablero.mjs --watch` en el escritorio de Omar (regenera cada 15 s, la página se auto-recarga).
- Modo oscuro forzado.
- Pendiente: sección "Intake pendiente de triage" (lee `tablero/intake/*`, líneas `NUEVO`).

---

## 12. Ciclo de vida de una sesión de agente

1. **Arranque**: `mem_context` + leer los 4 topics de contexto (§6.1).
2. **Trabajo**: el bucle de §6.
3. **Cierre** (obligatorio antes de "listo"): `mem_session_summary` con Goal / Discoveries / Accomplished / Next Steps / Relevant Files. Deja el `progress` de cada tarea tocada en un estado claro (EN-REVIEW con PR, o BLOQUEADO con motivo, o EN-CURSO con "qué falta").
4. **Post-compactación**: si el runtime compacta, `mem_session_summary` con el resumen compactado + `mem_context` antes de seguir.

---

## 13. Manejo de fallas del mecanismo

| Falla | Detección | Recuperación |
|-------|-----------|--------------|
| Agente reclama y desaparece sin PR | `progress` en EN-CURSO sin actualizar > N horas; carril bloqueado | Claude-Code devuelve la tarea a LIBRE, marca el carril LIBRE, nota en el `progress` |
| Clobber de un topic compartido | El visor muestra 0 carriles / backlog raro; o `revision_count` saltó | Claude-Code restaura desde su copia local / memoria + reafirma P5 al agente culpable |
| PR con conflicto | `gh pr view` mergeable=CONFLICTING | El dueño rebasa su rama sobre `feat/planificacion-clases-rediseño` y re-pushea; si no puede, Claude-Code |
| Codex sin git | ya conocido (§3.3) | Codex drafts → Claude-Code/Anti commitean; o Omar ajusta la ACL |
| Repo principal sucio bloquea ramas | `git switch` falla por working tree | Todos usan worktrees; Omar `git stash push -u -m` del trabajo suelto |
| Dos agentes tras la misma tarea | Dos `progress` para el mismo `<id>` | Gana el timestamp más viejo; el otro elige otra tarea; Claude-Code arbitra en `lanes` |
| Presupuesto agotado a mitad | El agente lo detecta en 6.x | Cierra el slice, `progress` detallado con "qué falta", `mem_session_summary`, para. Otro agente retoma desde el `progress` |
| Tarea mal especificada (sin archivo\:línea / sin porqué) | El agente no puede confirmar el diagnóstico | Escribe la duda en `progress`, para; Claude-Code completa la tarea en el backlog |

---

## 14. Qué NO hace el mecanismo (límites explícitos)

- No mergea nada automáticamente. Omar siempre.
- No ejecuta DDL/DROP ni cambios de comportamiento en prod sin Decisión+Dueño de Omar.
- No toca `origin/master`.
- No coordina por archivos ni por locks de SO — solo por el registro de áreas en Engram (candado blando) + ramas.
- No garantiza serialización estricta: dos agentes en áreas distintas trabajan de verdad en paralelo; el aislamiento lo dan las áreas + worktrees + PR.

---

## 15. Glosario

- **Área / carril (lane)**: partición del sistema con un dueño a la vez. Unidad del candado blando.
- **Beat**: el área de mejora continua asignada por defecto a un agente.
- **Backlog**: `tablero/reparaciones` — la lista de tareas.
- **Intake**: cola de hallazgos crudos por agente, antes del triage.
- **Triage**: convertir un hallazgo de intake en una tarea del backlog (ID + área + prioridad).
- **Coordinador**: Claude-Code. Único escritor de los topics compartidos.
- **Integrador**: Omar. Único que mergea.
- **Modo descubrimiento**: lo que hace un agente cuando no hay tarea LIBRE en su área — escanear y reportar.
- **Presupuesto**: nivel de tokens/contexto libre de un agente (alto/medio/bajo).
- **Clobber**: sobrescritura destructiva de un topic por el upsert de Engram.
- **Worktree**: checkout git aislado bajo `.claude/worktrees/`.
