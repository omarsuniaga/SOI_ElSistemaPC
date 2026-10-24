# Task Board — SOI (`sistema-academico-pwa`)

> ⚠️ **VISTA PARCIAL, NO CANÓNICA.** Confirmado el 2026-09-24: hay al menos
> otra sesión de agente (local, con Engram conectado y funcionando en
> escritura) operando un backlog mucho más grande y activo que este —
> `CDA1-6`, `ACM2-4`, `ESC1`, `LC1/5/8`, `T0.5c`,
> `decision-maestro-actividad-especial`, `Repertorio R1-B/R1-C`, y más,
> ninguno reflejado acá. Ese backlog vive en Engram
> (`mem_search(query, project: "sistema-academico-pwa")`) y **es el que se
> usa de verdad**. Este archivo nació como Plan B mientras se verificaba si
> Engram tenía API de escritura — esa duda ya está resuelta (sí la tiene, al
> menos desde esa sesión), así que este archivo quedó obsoleto en su premisa
> original.
>
> **Antes de tomar cualquier tarea de esta lista, correr primero
> `mem_search` en Engram** y verificar que la tarea no esté ya tomada, en
> progreso o resuelta ahí — este archivo puede estar desactualizado respecto
> a esa fuente. Las 4 filas de abajo siguen siendo válidas como diagnóstico
> propio de esta sesión (changes reales en `openspec/changes/`, no
> inventados), pero no reemplazan ni compiten con el backlog de Engram.

Tablero de tareas asignables a agentes. Espejo en archivo del plan de
`openspec/changes/tablero-tareas-engram/` — ver ahí el protocolo completo.

**Protocolo para tomar una tarea:**

1. `git pull` primero — nunca tomar una tarea sobre una copia vieja de este archivo.
2. Elegir una fila con `estado: disponible`.
3. En el **mismo commit** donde se crea el branch de trabajo, editar esta
   fila: `estado → tomada`, llenar `agente_asignado`, `rama_git`,
   `última_actualización`. Ese commit es el "claim" — si dos agentes
   compiten, el segundo push falla por conflicto de merge y ese agente pasa
   a la siguiente tarea disponible.
4. Al empezar a trabajar de verdad: `estado → en_progreso`.
5. Al abrir PR o terminar: `estado → en_revision` o `completada`, según
   corresponda. Si la tarea llega a 100% de su `tasks.md` y se archiva en
   OpenSpec, marcar `completada` y dejar la fila (no borrar filas — es
   historial).
6. Si una tarea queda bloqueada por una decisión de negocio (ver columna
   `notas`), `estado → bloqueada` — no la toma nadie más hasta que se
   resuelva la nota.

**Prioridad** es orientativa, no un orden estricto — un agente puede tomar
cualquier tarea `disponible` según su contexto o especialidad.

| task_id | título | estado | prioridad | agente_asignado | rama_git | openspec_change | notas | última_actualización |
|---|---|---|---|---|---|---|---|---|
| `adm-five-views-usability` | Reparar cinco vistas ADM y adaptar móvil | en_revision | alta | Codex / c0b56369375d | `fix/adm-views-usability` | `docs/planning/SPEC_REPARACION_VISTAS_ADM.md` | Autorizado por Omar; pruebas focalizadas, lint/tipos/build aprobados; revisión visual pendiente; lane liberado | 2026-10-19 |
| `adm-permission-switch-reactivity` | Corregir bloqueo de switches de permisos ADM | en_revision | alta | Codex / 09a7f6673c6b | `fix/adm-permission-switch-reactivity` | `docs/planning/FIX_PERMISOS_ADM_REACTIVIDAD.md` | Autorizado por Omar; 47 tests, build, tipos y lint aprobados; lane liberado | 2026-10-19 |
| `optional-active-class-navigation` | Hacer opcional la apertura de clase en curso y respetar navegación manual | completada | alta | Codex / aa0fc8a3d1e7 | `fix/optional-active-class-navigation` | `docs/planning/SPEC_NAVEGACION_CLASE_EN_CURSO.md` | PR #142; 4.711 tests aprobados; lane liberado; publicación autorizada por Omar | 2026-10-19 |
| `planificacion-dataadapter-migracion-restante` | Migrar 4 consumidores restantes al DataAdapter de planificación | disponible | media | — | — | `openspec/changes/planificacion-dataadapter-migracion-restante/` | 3 PRs encadenados; empezar por Phase 1 (extender adapter) | 2026-09-24 |
| `fn-decrementar-stock-accesorios-huerfano` | Cerrar la capacidad huérfana `accesorios`/`fn_decrementar_stock` | bloqueada | media | — | — | `openspec/changes/fn-decrementar-stock-accesorios-huerfano/` | Phase 0 (diagnóstico de datos) sí se puede correr ya; Phase 1 requiere decisión de Omar (Opción A reconstruir vs. B archivar) antes de tocar código | 2026-09-24 |
| `fase-0-clasificar-tablas-vacias` | Fase 0.1 — clasificar y podar las tablas vacías (roadmap `SOI_RUTA_A_REFERENCIA.md`) | disponible | alta | — | — | `openspec/changes/fase-0-clasificar-tablas-vacias/` | El propio roadmap la marca como "el movimiento recomendado para empezar"; Phase 4 (DROP) requiere confirmación de Omar por tabla | 2026-09-24 |
| `tablero-tareas-engram` | Migrar este tablero a Engram cuando el conector esté disponible | disponible | baja | — | — | `openspec/changes/tablero-tareas-engram/` | Phase 2 bloqueada hasta confirmar conector + API de escritura de Engram; no urgente, el archivo funciona mientras tanto | 2026-09-24 |

---

## Backlog no convertido a change todavía

Fuentes con trabajo pendiente identificado pero sin `openspec/changes/`
propio aún — no forman parte del tablero hasta que alguien las convierta
(seguir el mismo formato de `proposal.md` + `tasks.md`):

- `docs/PORTAL_FIN_BACKLOG.md` — Módulo 1 Cobro de Mensualidades (`#/cobro`,
  `#/registro`), decisiones abiertas D7 (excedente de pago) y CI de
  migraciones.
- `openspec/TRIAGE.md` — 9 changes institucionales en `~/soi/openspec/changes/`
  (fuera de este repo) esperando priorización de Omar para 2026.
- 5 changes de OpenSpec ya activos con tareas pendientes propias (no
  necesitan nuevo change, ya están en `openspec/changes/`, simplemente no
  están todavía en este tablero — añadir cuando alguien los tome):
  `teacher-portal-ai-grading` (34/42), `cierre-periodo` (0/14),
  `panel-hermes-calendario` (0/22), `justificacion-actividades-emergentes`
  (parcial), `seguimiento-ausentes` (0/muchas). `soi-event-spine` necesita
  reconciliación contra prod antes de convertirse en tarea tomable (ver
  `openspec/TRIAGE.md`).

| `class-history-report` | Informe individual e historial de clase | en_revision | alta | Codex / 7c4d3317573e | `feat/class-history-report` | `docs/planning/CLASS_HISTORY_REPORT.md` | Autorizado por Omar; 247 pruebas + 105 focalizadas, build/tipos aprobados; revisión visual pendiente; lane liberado | 2026-10-20 |
| `class-present-ratings` | Evaluar presentes (0–5) en asistencia del portal e informe de clase | en_revision | alta | Claude Code / session_01D1nsfKJMXGVzFYWdGmPZfP | `feat/class-history-report` | `docs/planning/CLASS_HISTORY_REPORT.md` | Migración pendiente de aplicar; sin fusionar ni desplegar | 2026-10-20 |

| `observations-toolbar-dictation` | Simplificar barra de observaciones y añadir dictado según imagen de Omar | en_revision | alta | Codex / observations-toolbar-20261020 | `fix/observations-toolbar-dictation` | `docs/planning/OBSERVATION_TOOLBAR_DICTATION.md` | 13 comprobaciones aisladas del dictado aprobadas; suite/build y prueba visual pendientes; lane liberado; sin producción | 2026-10-20 |

| `assisted-lesson-review` | Mejorar etiquetas, revisar destinatarios y evaluar presentes; planificación contraída | en_revision | alta | Codex / lesson-review-20261020 | `fix/observations-toolbar-dictation` | `docs/planning/ASSISTED_LESSON_REVIEW.md` | Implementado para revisión; pruebas CI pendientes; columnas de valoración ausentes confirmadas con lectura de esquema; sin nueva migración ni producción; lane liberado | 2026-10-20 |

| `ratings-schema-missing-fix` | Corregir valoraciones sin migración aplicada y manejar indisponibilidad | en_revision | alta | Codex / rating-schema-20261020 | `fix/observations-toolbar-dictation` | `docs/planning/ASSISTED_LESSON_REVIEW.md` | Migración 20261020170631 aplicada; regresión reproducida/corregida; pruebas SQL con rollback aprobadas; CI pendiente; lane liberado; frontend sin fusionar | 2026-10-20 |

| `class-validity-exemptions` | Vigencia y exoneración administrativa de registros | en_revision | alta | Codex / c16e853e5497 | `fix/class-validity-exemptions` | `docs/planning/CLASS_VALIDITY_EXEMPTIONS.md` | Implementado y probado; publicación bloqueada por revisión automática hasta autorización explícita; lane liberado | 2026-10-24 |
