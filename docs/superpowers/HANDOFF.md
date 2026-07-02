---
doc_id: PORTAL-018
doc_type: manual
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\superpowers\HANDOFF.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-018
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# Protocolo de Traspaso (Handoff) - Portal Maestros

Este documento define cómo deben continuar el trabajo los agentes de IA en las distintas fases del Portal Maestros.

## Instrucciones para Agentes (Claude Code / engram)

Antes de empezar cualquier fase, el agente debe ejecutar:
`mem_search(query: "portal maestros", project: "sistema-academico-pwa")`
y leer todos los registros con `mem_get_observation`.

## Convenciones Técnicas Obligatorias

- **Framework:** Vanilla JS ES modules (Prohibido usar frameworks como React/Angular para este portal).
- **Patrón de Render:** `export async function renderXxxView(container, options)`.
- **Supabase:** Importar cliente de `../../lib/supabaseClient.js`.
- **Auth:** Usar `getMaestroLocal()` para obtener el objeto maestro.
- **CSS:** Usar propiedades custom `--pm-*` y clases `pm-*`. Prohibido usar Bootstrap para nuevos componentes del portal.
- **Offline-first:** Todas las escrituras deben pasar por `offlineQueue.enqueue({tabla, operacion, payload})`.
- **Enrutamiento:** Basado en Hash (`#/hoy`, `#/calendario`, etc.).
- **Consultas DB:** Nunca usar joins complejos de Supabase (`.eq('tabla.columna', ...)`). Realizar 2 consultas separadas.
- **Variables:** Español, camelCase.

## Roadmap de Fases

1. **F1 - Base y Estructura:** ✅ COMPLETADA.
2. **F2 - Asistencia Core:** Pendiente. Ver Spec sección 3.4.
3. **F3 - Editor DSL:** Pendiente. Ver Spec sección 4.
4. **F4 - IA con GROQ:** Pendiente. Ver Spec sección 5.

## Documentos de Referencia
- Spec de Diseño: `docs/superpowers/specs/2026-05-04-portal-maestros-design.md`
- Plan de Ejecución F1: `docs/superpowers/plans/2026-05-05-portal-maestros-f1.md`
