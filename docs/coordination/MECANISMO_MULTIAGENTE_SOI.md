# Mecanismo multi-agente SOI — v1.0

> **Estado: PROPUESTA PARA ADOPCIÓN.** No entra en vigor hasta que Omar la apruebe con
> versión + commit + fecha, y cada agente acuse haberla leído. Mientras tanto rige
> SOI-MAP (`coordination/soi-multi-agent-protocol`, #2589).
>
> Autor: Claude-Code · Fecha: 2026-09-09 · Canónico en Engram: `coordination/mecanismo`.
> Incorpora la contrarrevisión `coordination/mecanismo/contrarrevision-ai-codex/claude-code/*` (#3559)
> sobre la revisión de AI-Codex (#3549), sobre el borrador previo (commit 0a07307d).
> Base normativa previa: SOI-MAP #2589, corrección de coordinación #2588.

---

## 0. TL;DR — cómo se usa esto

- **Omar** abre el visor: `node tools/tablero/tablero.mjs --watch`. Ahí ve el tablero, los
  carriles, la actividad de cada agente, y **los prompts para copiar**.
- Al arrancar un lote, Omar **publica la asignación de ámbitos** (§4) y **pega el prompt de contexto + el prompt de loop** (§9, botones de copiar en el visor) a AI-Anti y AI-Codex.
- Los agentes corren un **loop continuo**: leen el contexto → eligen/reclaman una tarea de su ámbito → la aíslan en un worktree → la resuelven (toca **UI/UX, tests, lógica, base de datos, lo que la tarea pida**) → abren un PR → repiten. Si no hay tareas, escanean su ámbito y **proponen** nuevas.
- **Omar mergea** los PR (en orden, §11). Ningún agente mergea.
- **Omar puede pasarle a Claude-Code la ruta de una vista** ("evaluá `/adm/x`"): Claude la audita, mete los hallazgos como tareas en el tablero, y el agente dueño de ese ámbito las toma (§13).

---

## 1. Propósito y garantías

Sistema de trabajo continuo donde AI-Anti (Antigravity), AI-Codex y Claude-Code
**mejoran el SOI de forma coordinada**: detectan fallas y deuda en cualquier capa
(UI/UX, tests, lógica de negocio, base de datos, build/CI, docs), las publican como
tareas, y las resuelven en ramas aisladas que Omar integra.

**Objetivos (verificables), no garantías absolutas:**
1. Evitar escritura concurrente sobre un mismo checkout de código.
2. Detectar reclamaciones incompatibles (rutas de archivo solapadas) **antes** de implementar.
3. Conservar evidencia recuperable de cada transición — **Git + PR es la fuente de verdad del código**.
4. Que la ausencia de cualquier agente (incluido Claude-Code) **no detenga** el trabajo de los demás ámbitos.
5. Trazabilidad: de cada cambio se reconstruye qué falla resolvía, por qué, quién, en qué PR.
6. Repartir carga según capacidad real (permisos, herramientas, WIP, riesgo), no según porcentajes inventados.

**Lo que NO se garantiza** (y por qué): exclusión estricta con `mem_save` (Engram no
tiene lock ni CAS); ausencia de conflictos semánticos (dos archivos distintos pueden
romper el mismo contrato); pérdida cero sin respaldo verificado. Ningún resumen
agregado (`lanes`, `backlog`, visor) basta para liberar un ámbito.

---

## 2. Principios

| # | Principio |
|---|-----------|
| P1 | Proyecto Engram único: `soi_elsistemapc`. Nunca la raíz. |
| P2 | **La coordinación es una función, no una identidad.** Nadie es indispensable. |
| P3 | Un ÁMBITO = un dueño a la vez. La propiedad la da la **asignación de lote de Omar**, no una fila LIBRE en un tablero. |
| P4 | Cada agente su rama. **Nadie mergea.** Omar es el único integrador y el único que decide lo destructivo. |
| P5 | Antes de crear un concepto nuevo, buscar en Engram si ya existe. Conectar, no duplicar. |
| P6 | **Contexto obligatorio antes de actuar** (§8): protocolo + asignación + backlog + topic-fuente de la tarea, con `mem_get_observation` (las búsquedas truncan). |
| P7 | **Ante la duda, preguntar.** Si el agente no puede resolver de forma coherente con el sistema, escribe la duda y para. No improvisa. |
| P8 | **Regla anti-clobber**: cada topic compartido tiene un único escritor; cada agente escribe sólo su propio `progress`; el intake es de un solo productor. |
| P9 | **Evidencia antes de estado**: EN-REVIEW se publica *después* de verificar commit + push + PR. |
| P10 | **Presión de retorno**: terminar e integrar tiene prioridad sobre producir. Hay límites de WIP (§11). |

---

## 3. Actores

### 3.1 Omar — Integrador y asignador
- Publica la **asignación de ámbitos** de cada lote (§4).
- **Mergea** los PR, en el orden de §11. Único que lo hace.
- Decide todo lo destructivo o ambiguo: DDL/DROP, cambios de comportamiento en prod, veredictos de arquitectura, habilitar cualquier automatización.
- Resuelve traspasos y recuperaciones cuando un dueño no responde.
- Puede pasarle a Claude-Code una **ruta de vista** para evaluación (§13).
- Designa un responsable de respaldos de Engram y una prueba de restauración antes de depender del mecanismo para trabajo no supervisado.

### 3.2 Claude-Code
- **Ejecutor** del ámbito que Omar le asigne (por defecto: INTEGRACIÓN + coordinación).
- **Consolida** `coordination/lanes` y `tablero/reparaciones` como *resúmenes* — esto **no** otorga propiedad ni bloquea trabajo ya asignado. Si Claude no está, otro agente o el propio Omar puede consolidar.
- **Evalúa rutas** que Omar le pase y convierte los hallazgos en tareas (§13).
- **Receptor** de los borradores de AI-Codex (§3.4).
- Git: completo.

### 3.3 AI-Anti (Antigravity)
- **Ejecutor de loop completo.** Especialidad (preferencia, no propiedad): vistas de portales y UI/UX. Pero **dentro de su ámbito asignado toca lo que la tarea pida** — un fix de UI que necesita cambiar una consulta, un test, una migración: lo hace, declarando esas rutas.
- Git: completo. Worktree propio.

### 3.4 AI-Codex (Codex CLI)
- **Descubrimiento + borradores.** Especialidad: correctness (mutaciones sin verificar, `.single()` frágil, dead code, cobertura, validación, N+1).
- **Restricción dura**: ACL `Deny Write,Delete` sobre `.git` para `msi\codexsandboxoffline`. No crea ramas/commits/refs. **No se sortea** con otra identidad, otra ubicación de metadata, ni un puente que ejecute comandos arbitrarios.
- **No toma carriles.** Cada encargo de borrador designa un **receptor autorizado** (Anti o Claude) que conserva la propiedad del ámbito y la responsabilidad de entrega.
- Entrega un **manifiesto**: `base_sha`, rutas, diff/borrador, hashes, pruebas hechas, limitaciones. El receptor verifica que `base_sha` sigue vigente, revisa el diff, corre los checks faltantes, y recién entonces commit + PR. Un solo borrador pendiente de recepción a la vez.
- Autonomía git de Codex requiere un entorno separado, provisionado y aprobado por Omar. Hasta entonces: análisis sí, ciclo git no.

---

## 4. Asignación de ámbitos (lo que autoriza)

Antes de cada lote, **Omar publica** en el topic `coordination/lanes` (que Claude-Code
consolida) una tabla de ámbitos **no solapados**:

```
| Ámbito | Rutas (glob) | Dueño | owner_instance | base_sha | Estado |
|--------|--------------|-------|----------------|----------|--------|
| ui/portales      | src/portales/**, src/modules/*/views/**, src/modules/*/components/** | AI-Anti | <id de sesión> | <sha remoto de integración> | ACTIVO |
| correctness/api  | src/modules/*/api/**, src/**/services/** | (Codex draftea → Claude recibe) | ... | ... | ACTIVO |
| integracion      | src/lib/**, src/portales/_shared/**, src/core/router/**, vite.config.js, vitest.config.js, *.html (entrada), supabase/migrations/**, src/**/database.types.ts, .github/workflows/** | Claude-Code | ... | ... | ACTIVO |
```

Reglas:
- **Los globs de dos ámbitos activos no pueden solapar.** Si un trabajo necesita cruzar
  ámbitos, se pausa y se pide a Omar una asignación nueva.
- La asignación **identifica la instancia** (`owner_instance`): dos sesiones del mismo
  agente **no** son un único escritor. Sólo la instancia nombrada ejecuta.
- La asignación fija el `base_sha` de integración del lote.
- INTEGRACIÓN se subdivide cuando hace falta: `shell/routing`, `persistencia-compartida`,
  `CI/build`, `esquema-BD`.
- **Lista fija de archivos que son siempre INTEGRACIÓN** (un solo dueño, nunca concurrentes,
  aunque un `paths[]` no solape exacto): `src/lib/*`, `src/portales/_shared/adminPortalShell.js`,
  `src/portales/_shared/allRegistrars.js`, `src/core/router/*`, `vite.config.js`,
  `vitest.config.js`, los `*.html` de entrada, `supabase/migrations/*`,
  `src/**/database.types.ts`, `supabase/migrations/schema_reference.sql`, `.github/workflows/*`.

---

## 5. Sustrato de datos: Engram

- Cada `topic_key` tiene **una sola versión vigente**. `mem_save` hace **upsert** (reemplaza).
  `revision_count` cuenta revisiones pero **no** hay lectura del historial por API.
- `mem_search` / MCP **truncan**. Texto completo: `mem_get_observation(id)`.
- **No asumir**: CAS, append atómico, orden global, historial recuperable, ni que
  `mem_search` enumere todos los eventos.
- **Identidad del almacén**: `~/.engram/engram.db`, proyecto `soi_elsistemapc`. Todos los
  participantes verifican que leen ese proyecto y unos eventos testigo. Copias locales
  divergentes **no** otorgan asignaciones.

### 5.1 Catálogo de topics

| topic_key | Propósito | Escritor(es) | Escritura |
|-----------|-----------|--------------|-----------|
| `coordination/soi-multi-agent-protocol` | Protocolo base (SOI-MAP). Se lee, no se toca. | congelado | — |
| `coordination/mecanismo` | Índice canónico de esta versión (apunta al commit del doc). | Claude-Code | reemplazo |
| `coordination/lanes` | Asignación de ámbitos + estado. Autoriza. | **Omar publica; Claude-Code consolida** | reemplazo completo, tabla entera |
| `tablero/reparaciones` | El backlog: QUÉ hay que arreglar. | **un solo consolidador** (Claude-Code por defecto; Omar u otro si Claude no está) | reemplazo completo, backlog entero |
| `tablero/<task_id>/progress/<owner_instance>` | Bitácora de la instancia dueña de esa tarea. | esa instancia, y sólo ella | reemplazo por su dueño |
| `tablero/intake/<agente>` | Cola de hallazgos crudos de UN productor. | ese agente, nadie más | append: releer + agregar al final + guardar |
| `tablero/intake/<agente>/acuses` | Respuestas del triador a ese intake. | el consolidador | append |
| `coordination/rutas-evaluadas/<slug>` | Informe de evaluación de una ruta que pasó Omar (§13). | Claude-Code | reemplazo |
| `audit/<nombre>` | Resultados de auditorías (fuente de tareas). | quien audita | reemplazo |

### 5.2 Schema de una tarea (fila del backlog)

Encabezados que el visor reconoce: `ID`, `Ámbito`, `Prio`, `Estado`, `Tarea`, `paths`, `base_sha`, `parent`, `slice`, `depends_on`, `Dueño`, `Origen`.

Toda tarea LIBRE debe tener: `ID` canónico, `Ámbito`, `Prio` (ALTA/MEDIA/BAJA con
severidad = impacto×alcance), descripción con **archivo:línea**, el **porqué**, el
**topic-fuente**, `paths[]` (rutas que se van a tocar), y un **criterio de aceptación**.

### 5.3 Estados de tarea (7)

```
LIBRE → EN-CURSO → LISTA-PARA-PR → EN-REVIEW → CERRADA
  │         │            │              │
  │         └─ BLOQUEADA ─┘              └─ (Omar pide cambios) → EN-CURSO
  │                                      └─ (PR cerrado sin merge) → CANCELADA
  └─ (creada por el dueño del ámbito o por evaluación §13)
```

- **BLOQUEADA** lleva `reason_code`, `blocked_by`, `next_action`, responsable de desbloqueo.
  No es tomable. "Espera Omar" = `BLOQUEADA(reason: decision-omar)`.
- **El merge de un slice cierra ESE slice, no el padre.** El padre pasa a CERRADA cuando se
  verifican todos sus criterios de aceptación.
- **Estado de tarea**, **estado de reserva** y **disponibilidad del ejecutor** son campos
  distintos. El visor no los infiere de un mismo rótulo.

---

## 6. Sustrato de código: Git

- **Rama base de todo**: `feat/planificacion-clases-rediseño` (integración de facto).
  `origin/master` está congelada — **no se usa**.
- **Aislamiento**: cada ejecutor autorizado trabaja en su propio **git worktree** bajo
  `.claude/worktrees/<nombre>`. Se crea con **una sola operación** desde el SHA remoto:
  `git worktree add -b <agente>/<task_id>-<slug> <ruta> <base_sha>` — sin checkout intermedio
  de la rama base.
- Registrar `base_sha` + versión del lockfile de dependencias.
- `node_modules` puede compartirse **solo lectura** (junction). Si un agente necesita
  instalar o cambiar el lockfile → worktree con dependencias propias.
- **Nunca** limpiar, stashear ni resetear trabajo ajeno como paso automático.
- **PR**: siempre `base = feat/planificacion-clases-rediseño`. Un PR por tarea o por slice.
  Lleva `task_id`, `parent_task`, `slice_id`, `depends_on`, `base_sha`, `head_sha`.
- Diff estimado > ~400 líneas → partir en slices, PRs encadenados. Un slice dependiente
  espera el merge de su predecesor y parte de la base actualizada.

---

## 7. Capacidad y reparto de carga

- El "presupuesto de tokens" **NO es un gate**. Cada agente reporta en su `progress`:
  `CONTEXTO: alto | medio | bajo | DESCONOCIDO` (con fuente + timestamp; si no hay contador
  verificable → DESCONOCIDO, no inventar %).
- El routing usa, en orden: **capacidad comprobada** (leer / editar / probar / git / PR),
  **WIP activo**, **tamaño y riesgo** del slice.
- Regla dura: **todo slice deja un checkpoint recuperable**. Agotar el contexto produce un
  checkpoint incompleto identificable, **nunca** "slice terminado". La reserva de cierre no
  se sustituye por "terminar como se pueda".
- Omar (o el consolidador) pregunta la capacidad antes de repartir un lote y asigna lo
  pesado a quien tiene margen.

---

## 8. Poner un agente en contexto

Todo agente, al **arrancar** y tras cualquier **compactación/pausa**, ejecuta:

```
mem_context()                                          # sesiones recientes
mem_get_observation( mem_search "coordination/soi-multi-agent-protocol" )   # #2589
mem_get_observation( mem_search "coordination/mecanismo" )                  # esta versión — índice
   → y el doc que referencia: docs/coordination/MECANISMO_MULTIAGENTE_SOI.md
mem_get_observation( mem_search "coordination/lanes" )                      # tu ámbito y base_sha
mem_get_observation( mem_search "tablero/reparaciones" )                    # el backlog
# si vas a tomar una tarea concreta:
mem_get_observation( <topic-fuente de la tarea> )                          # audit/..., #nnnn
mem_get_observation( mem_search "tablero/<task_id>/progress/<tu-instancia>" ) # ¿ya empezaste?
```

**Mapa de dónde vive cada cosa en Engram** (esto va también en el visor, con botón de copiar):

| Necesitás… | Buscá el topic_key |
|------------|--------------------|
| Las reglas del juego | `coordination/soi-multi-agent-protocol`, `coordination/mecanismo` |
| Qué ámbito es tuyo / cuál es la base | `coordination/lanes` |
| Qué hay para hacer | `tablero/reparaciones` |
| Tu propio avance | `tablero/<task_id>/progress/<tu-instancia>` |
| Publicar un hallazgo | `tablero/intake/<tu-nombre>` (append) |
| El detalle de una tarea | su `Origen`: `audit/soi-lila-2026-09`, `audit/ausentismo-dashboard-2026-09`, `coordination/rutas-evaluadas/<slug>`, o un `#nnnn` |
| El inventario de la BD | `fase-0/tablas-vacias-inventario` |
| Por qué no dependemos de Claude | `roadmap/columna-vertebral-y-coordinacion` (#2588) |
| Bloqueos de entorno conocidos | `coordination/bloqueo-git-2026-09-09` |

Si una fuente falta, se declara la limitación. **No se inventa su contenido.**

---

## 9. El loop del agente

```
CONTEXTO (§8)
loop:
  # A. REFRESCAR
  releer coordination/lanes y tablero/reparaciones.
  budget := "CONTEXTO: alto|medio|bajo|DESCONOCIDO"

  # B. ELEGIR
  candidatas := backlog.LIBRE
                .filter(t -> t.ámbito == mi_ámbito_asignado)
                .filter(t -> t.paths ∩ (paths de toda tarea activa) == ∅)   # + lista fija INTEGRACIÓN
                .filter(t -> t.estado != BLOQUEADA)
                .sort_by(prioridad, luego dependencias satisfechas, luego antigüedad)
  if budget == bajo:  candidatas := sólo las de 1 archivo / mecánicas
  if WIP(yo) >= 1 slice activo  OR  PRs_equipo_listos >= 3:
       → no tomar nada nuevo; ir a REVISAR/CORREGIR/PREPARAR-MERGE
  if candidatas.empty:  goto DESCUBRIR

  tarea := candidatas.first

  # C. RECLAMAR  (primera acción, antes de tocar archivos)
  mem_save("tablero/<tarea.id>/progress/<mi_instancia>",
     "<tarea.id> EN-CURSO [<agente>/<mi_instancia>/<hoy>]. Rama: <rama>. base_sha: <sha>. paths: <lista>.\nCONTEXTO: <budget>\n## Plan\n<2-4 líneas>")
  releer backlog + progress de otras tareas → ¿alguien declaró paths que solapan los míos?
     sí → estado EN-DISPUTA en mi progress, NO toco archivos, consulto. goto loop.

  # D. AISLAR
  git worktree add -b <rama> ../soi-<agente>-<tarea.id> <base_sha_remoto>
  cd ../soi-<agente>-<tarea.id>
  registrar base_sha + lockfile
  if fallo:  progress → BLOQUEADA(reason: entorno); reportar a Omar; PARAR

  # E. ANALIZAR
  fuente := mem_get_observation(tarea.origen)
  confirmar el diagnóstico contra el código real (grep exhaustivo; BD sólo lectura)
  registrar baseline: SHA + comandos de test/lint + resultados actuales
  if no sé resolverlo coherente con el sistema:
     progress → "## Duda: <preguntas concretas>"; PARAR (P7)

  # F. RESOLVER  (toca lo que la tarea pida: UI, test, lógica, BD, build…)
  if diff_estimado > 400:  tarea := slice_1
  para cada cambio:  editar SÓLO archivos dentro de mi ámbito / paths declarados
      si hay tests que corren:  TDD (rojo → verde)
  una prueba antes-verde que regresa  →  DETIENE la entrega hasta resolverla (sin excepción "trivial")
  fallos preexistentes  →  registrar + excepción explícita del gate afectado
  lint del alcance
  NADA destructivo en BD (DDL/DROP) ni cambio de comportamiento en prod sin Decisión+Dueño de Omar

  # G. ENTREGAR  (evidencia antes de estado — P9)
  progress → LISTA-PARA-PR
  verificar criterio de aceptación → git commit → git push → crear/obtener PR
     (idempotente: antes de crear, chequear si el commit/PR ya existe)
  verificar URL del PR + base + head SHA
  progress → EN-REVIEW  con: PR #, head_sha, criterio verificado, "## Qué falta"
  # NO merge

  # H. después de rebase o cambio de base:  repetir los checks afectados

  goto loop

DESCUBRIR:
  refrescar tareas + asignación + hallazgos relacionados
  escanear mi ámbito, base_sha declarado, pasada acotada: máx 5 hallazgos nuevos o 30 min
  registrar también "sin hallazgos accionables" con ámbito + base_sha
  deduplicar por módulo / símbolo / síntoma / invariante  (archivo:línea es sólo un localizador)
  para cada hallazgo nuevo:
     append a "tablero/intake/<agente>":
       "[hoy] <ámbito> · <ALTA|MEDIA|BAJA> · <archivo:línea> · <qué> · <porqué> · <fix propuesto> · <paths> · <criterio de aceptación> · NUEVO"
  # AUTO-PROMOCIÓN: si el hallazgo tiene repro/evidencia + impacto + paths + criterio,
  #   NO es cross-cutting, NO es destructivo, y NO necesita decisión de Omar
  #   → el dueño del ámbito lo agrega él mismo al backlog como tarea LISTA.
  # Lo demás (cross-cutting / ambiguo / destructivo / cambio de comportamiento) → queda en
  #   intake para triage/decisión.
  umbral: 10 hallazgos NUEVO pendientes de un mismo productor → suspender descubrimiento general
  incidente grave → avisar a Omar de inmediato (publicar en Engram NO notifica)
  resumir la pasada y volver a REFRESCAR (sin polling activo)

PARAR:
  reportar a Omar el motivo (canal humano)
  dejar cada progress en estado claro (EN-REVIEW+PR, BLOQUEADA+motivo, o EN-CURSO+"qué falta")
  mem_session_summary(Goal / Discoveries / Accomplished / Next Steps / Relevant Files)
```

### 9.x Condiciones de parada
- No hay tareas tomables ni hallazgos que reportar.
- No se puede crear rama/worktree.
- Una tarea necesita decisión de Omar.
- Un fix requeriría salir del ámbito asignado.
- Una prueba antes-verde se rompe y no es trivial.
- `CONTEXTO` cae a **bajo** a mitad de tarea → cerrar el slice con checkpoint recuperable,
  `progress` detallado, `mem_session_summary`, parar.

---

## 10. Recuperación de dueño y traspaso

- Toda reclamación fija `next_check_at`. Si vence: estado → **REQUIERE-CONFIRMACIÓN**
  (no LIBRE). El visor lo muestra como tal.
- Antes de retomar tras pausa/compactación, el dueño **verifica que su asignación sigue
  vigente** (misma `owner_instance`, mismo lote).
- **Un PR abierto se cierra, reemplaza o transfiere explícitamente antes de liberar la
  reserva.** Nunca se libera una tarea EN-REVIEW por silencio.
- Traspaso ordinario: acuse de cese + manifiesto de entrega del dueño anterior.
- Si el dueño no responde: **Omar** inventaría rama, PR y trabajo sin pushear, y registra
  la resolución. Una `owner_instance`/lote nuevo invalida instrucciones viejas a nivel de
  protocolo (no es fencing técnico).

---

## 11. Presión de retorno (WIP y orden de integración)

- **Límite**: 1 slice de implementación activo por ejecutor; **~3 PRs listos para revisión
  en todo el equipo**. Al alcanzar la cola: priorizar revisión, correcciones y preparación
  de merges — **no** iniciar mejoras nuevas.
- **Orden de integración** (lo aplica Omar): (1) incidentes autorizados; (2) dependencias
  en orden topológico; (3) dentro de ellas, prioridad y antigüedad.
- Tras cada cambio de base, se re-valida cada candidato afectado.
- **Auto-merge deshabilitado.** Sólo una decisión explícita de Omar puede habilitar una
  cola automatizada, con criterios de aprobación y checks — sin confundir tests verdes con
  autorización.

---

## 12. El visor (`tools/tablero/tablero.mjs`)

- **Solo lectura** sobre `~/.engram/engram.db` (`node:sqlite`, sin deps). No escribe en Engram.
- **Modo oscuro forzado.**
- **Lee**: `tablero/reparaciones`, `coordination/lanes`, todos los `tablero/%/progress/%`,
  todos los `tablero/intake/%`.
- **Muestra**:
  - Kanban por estado (Libre / En curso / Lista-para-PR / En review / Cerrada), con chips de
    ámbito / prioridad / dueño / rama.
  - **Carriles**: la asignación de ámbitos.
  - **Actividad de agentes**: derivada de los `progress` — id, estado, agente, instancia,
    rama, `CONTEXTO`, timestamp.
  - **Intake pendiente de triage**: líneas `NUEVO` de los `tablero/intake/*`.
  - **Guía de Omar** (§0 + §14) y **prompts para copiar**: contexto, loop, evaluación de ruta.
  - **Mapa de topic_keys** (§8).
  - Timestamp de lectura + errores de parseo. Ante contenido inválido o desacuerdo entre
    eventos y agregados: muestra **DESCONOCIDO / EN-DISPUTA**, nunca LIBRE por defecto.
- **Uso**: `node tools/tablero/tablero.mjs --watch` (regenera cada 15 s; la página se
  auto-recarga).

---

## 13. Flujo "Omar pasa una ruta para evaluar"

Cuando Omar le dice a Claude-Code *"evaluá `http://localhost:5173/adm/<x>`"* (o una ruta,
un módulo, un archivo):

1. **Claude-Code audita** la ruta: localiza la vista + componentes + servicios + tablas que
   toca; revisa correctness, arquitectura, UI/UX vs `docs/UI_THEME_IMPLEMENTATION_STANDARD_V9.md`,
   a11y, tests, y la BD viva (sólo lectura) si aplica. (Igual que se hizo con el dashboard de
   ausentismo, ver `audit/ausentismo-dashboard-2026-09` #3538.)
2. **Publica el informe** en `coordination/rutas-evaluadas/<slug>` — con severidad, archivo:línea,
   porqué y fix propuesto por hallazgo.
3. **Crea las tareas** en `tablero/reparaciones`: una por sub-slice coherente (datos / tema /
   UX, o lo que corresponda), con `Ámbito`, `Prio`, `paths[]`, `criterio de aceptación` y
   `Origen: coordination/rutas-evaluadas/<slug>`.
4. **Asigna el ámbito** si hace falta uno nuevo (o lo pide a Omar) y avisa: el agente dueño
   de ese ámbito toma la tarea en su siguiente iteración del loop.
5. Si hay un incidente ALTA (XSS, pérdida de datos, no-op silencioso) → Claude-Code lo marca
   y avisa a Omar de inmediato para que priorice.

Resultado: Omar tira una URL y, sin más intervención, aparece la tarea en el tablero y un
agente la levanta.

---

## 14. Guía operativa de Omar (buenas prácticas)

**Al empezar una jornada / lote:**
1. Abrir el visor: `node tools/tablero/tablero.mjs --watch`.
2. Revisar la cola de PRs. **Mergear primero** lo que está listo (orden §11) antes de pedir
   trabajo nuevo — si no, la cola crece y bloquea ámbitos.
3. Al mergear un PR: marcar su reserva liberada en `coordination/lanes` (o pedírselo a
   Claude-Code).
4. Publicar/actualizar la **asignación de ámbitos** del lote (§4): ámbitos no solapados,
   dueño, `owner_instance`, `base_sha`.
5. Copiar del visor y pegar a cada agente: **el prompt de contexto** + **el prompt de loop**.
6. Preguntar a cada agente su `CONTEXTO` (alto/medio/bajo) antes de cargarle un ámbito grande.

**Durante:**
- Mirar el visor. La tira "Actividad de agentes" dice quién va por dónde y con cuánto contexto.
- La tira "Intake pendiente" dice qué hallazgos esperan que alguien los convierta en tarea.
- Si ves un `EN-REVIEW` con PR → revisá y mergeá o pedí cambios. No lo dejes colgado.
- Si un agente reporta un incidente grave → atendelo antes que cualquier mejora.

**Para evaluar una vista concreta:**
- Decile a Claude-Code: *"evaluá `<ruta>`"*. Sale el informe + las tareas + el aviso si hay algo ALTA (§13).

**Nunca:**
- Mergear a `origin/master` (está congelada; la integración es `feat/planificacion-clases-rediseño`).
- Dejar que dos agentes trabajen el mismo ámbito o el mismo archivo.
- Habilitar auto-merge sin una decisión explícita y criterios escritos.
- Pedirle a Codex que haga commits (no puede; que draftee y otro entrega).

---

## 15. Manejo de fallas del mecanismo

| Falla | Detección | Recuperación |
|-------|-----------|--------------|
| Dos sesiones del mismo agente, mismo ámbito | dos `progress/<instancia>` distintos para el mismo `task_id` | gana la `owner_instance` de la asignación de lote; la otra para. No es prevenible técnicamente — por eso la asignación nombra la instancia |
| Dos tareas tocan el mismo archivo | `paths` solapados al reclamar (paso C) | EN-DISPUTA, nadie toca archivos, Omar reasigna o secuencia |
| Claude-Code ausente días | intake crece; PRs sin consolidar | los ámbitos con dueño siguen; auto-promoción de hallazgos bien formados; Omar u otro agente consolida `lanes`/`backlog` |
| Dueño vuelve tras traspaso | `owner_instance`/lote no coincide | el dueño verifica antes de retomar; si ya se transfirió, para |
| Productor publica mientras hay triage | — | intake tiene un solo escritor; el triador acusa en `tablero/intake/<agente>/acuses`, nunca edita el intake |
| Visor atrasado / no lee todo | timestamp de lectura viejo; errores de parseo | muestra DESCONOCIDO/EN-DISPUTA, nunca LIBRE; no se reclama sobre esa base |
| PR creado, falla el guardado en Engram | `progress` sin la transición pero el PR existe | el PR lleva `task_id`; se reconcilia al reanudar; no se crea PR duplicado (idempotencia) |
| Slice mergeado, padre incompleto | criterios de aceptación del padre sin verificar | el merge cierra el slice; el padre sigue EN-CURSO hasta verificar todo |
| Cola de PRs llena + incidente | WIP en el tope | incidentes van primero en el orden de integración; se avisa a Omar directo |
| Codex draftea sobre un SHA viejo | `base_sha` del manifiesto ≠ HEAD de integración | el receptor rebasa el borrador o lo devuelve; no commitea a ciegas |
| Corrupción/pérdida de Engram | `revision_count` anómalo, tabla inconsistente | suspender asignaciones del ámbito afectado; recuperar desde respaldo identificado (SQLite Online Backup API, no copiar el archivo vivo); reconciliar con PRs/progress; no restaurar hechos desde recuerdos |

---

## 16. Qué NO hace el mecanismo (límites)

- No mergea nada automáticamente. Omar siempre.
- No ejecuta DDL/DROP ni cambios de comportamiento en prod sin Decisión+Dueño de Omar.
- No toca `origin/master`.
- No coordina por locks de SO — sólo por la asignación de ámbitos en Engram + ramas + PR.
- No garantiza serialización estricta: dos agentes en ámbitos disjuntos trabajan en paralelo
  de verdad.
- No convierte a 3 agentes en una plataforma distribuida: no hay elección de líder, ni
  leases automáticos, ni event-sourcing con orden global. Son convenciones con riesgos
  residuales que Omar acepta.

---

## 17. Adopción

1. Este documento es **PROPUESTA** hasta que Omar lo apruebe.
2. La aprobación fija **versión + commit + fecha de entrada en vigor** en `coordination/mecanismo`.
3. Cambios incompatibles futuros enumeran las reglas sustituidas y requieren **acuse de cada
   ejecutor** antes de iniciar otro lote.
4. Ante conflicto de versiones, se detiene el ámbito afectado y se consulta — sin sobrescribir
   SOI-MAP.
5. **Antes de activar el loop autónomo** hay que:
   - B1. Que Omar publique la asignación de ámbitos del primer lote (§4).
   - B2. Cerrar los ~6 PRs abiertos de la ronda anterior o migrarlos a este esquema.
   - B3. Correr los 10 escenarios de §15 como prueba de escritorio contra esta versión, con
     un revisor distinto del autor, y que cada uno muestre *dueño único autorizado o pausa
     explícita + evidencia conservada + ruta de recuperación*.
6. Diferido a "antes de escalar a 3 agentes en paralelo": mapa de rutas/contratos más fino,
   respaldo verificado + prueba de restauración, revisión fresca obligatoria por otro agente
   en cada PR.

---

## 18. Glosario

- **Ámbito**: partición del código con globs de rutas y un dueño a la vez. Unidad de la
  asignación de lote. Autoriza.
- **Especialidad / beat**: la clase de trabajo que un agente hace mejor (UI/UX, correctness).
  Es preferencia, **no** propiedad.
- **owner_instance**: identificador de la sesión concreta que ejecuta un ámbito. Dos sesiones
  del mismo agente no son la misma instancia.
- **base_sha**: el commit remoto de integración sobre el que se creó una rama / se draftea.
- **paths[]**: las rutas de archivo que una tarea declara que va a tocar. Base del chequeo
  de solapamiento.
- **Backlog**: `tablero/reparaciones`.
- **Intake**: cola de hallazgos crudos de un productor, antes del triage/auto-promoción.
- **Consolidador**: quien mantiene los resúmenes (`lanes`, `backlog`). Por defecto Claude-Code;
  no es indispensable.
- **Integrador**: Omar. Único que mergea.
- **Manifiesto**: el paquete que AI-Codex entrega a un receptor (base_sha, diff, pruebas, límites).
- **Checkpoint recuperable**: estado guardado que permite a otro agente retomar la tarea.
- **Clobber**: sobrescritura destructiva de un topic por el upsert de Engram.
