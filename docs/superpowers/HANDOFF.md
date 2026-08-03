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

## ⚠️ Sesión 2026-08-03 (tarde) — rama `feat/planificacion-clases-rediseño` — LEER ANTES DE TOCAR "Publicar Plan"

**CONFLICTO SIN RESOLVER, no mergeado:** dos sesiones distintas reescribieron en paralelo la persistencia de `DisenadorCurricularView.js` (el flujo "Publicar Plan Oficial") con arquitecturas incompatibles:

1. **Mi rama local `work-feat-planificacion`** (push parcial en `feat/planificacion-clases-rediseño` hasta el commit `0c4e090`, ANTES del conflicto): agregué columnas reales a `planificaciones` (`objetivos_estructurados` jsonb, `frecuencia_semanal`, `semanas_totales`, `nivel_texto` — migración `20260803010000_planificaciones_add_objetivos_estructurados.sql`, YA APLICADA en producción) y actualicé `Planificacion` (modelo) para leer/escribir esas columnas. También corregí que el payload de "Publicar Plan" mandaba `fecha_inicio` faltante (NOT NULL) y `estado: 'publicada'` (inválido — el CHECK constraint real de `planificaciones.estado` es `borrador|activa|cerrada|archivada`, no lo que usa el modelo `planificado/ejecutado/revisado` — **esa inconsistencia del modelo quedó sin arreglar, es deuda separada**).

2. **Otra sesión pusheó `910ba15`** ("replace broken Publicar Plan with crearPlantillaPlanificacion") que abandona `planificaciones.objetivos_estructurados` por completo y migra todo a una tabla `plantillas` distinta (`crearPlantillaPlanificacion`/`obtenerPlantillasPlanificacion`, agregó `clase_id` a `plantillas`).

**Antes de seguir**: decidir cuál de los dos mecanismos de persistencia es el vigente (probablemente el de `910ba15` por ser el más reciente en el remoto), y si se adopta ese, verificar si mi migración de columnas en `planificaciones` quedó huérfana (sin uso) o si conviene revertirla. **No asumir sin comprobar en la base real.**

**Dato que sí quedó persistido y es válido independientemente de cuál gane**: 3 unidades reales de "Iniciación de Violoncello" (Postura y Familiarización, Cuerdas al Aire y Emisión de Sonido, Primera Posición y Primeros Dedos — 9 indicadores) insertadas directo por SQL en `planificaciones` para la clase `35f2d6a9-5a31-4884-867c-acbd0e943c13` (Francisco Domínguez, Violoncello). Si el mecanismo vigente termina siendo el de `plantillas` (opción 2), ese contenido real probablemente haya que migrarlo/reingresarlo ahí.

Otros bugs reales encontrados y arreglados en esta rama (independientes del conflicto de arriba, ya en remoto):
- Cache cruzado entre cuentas de maestro (`viewCache` sin invalidar en login/logout).
- Botones de cabecera del portal navegaban sin `claseId` en contexto (Diseñador/Ruta SVG mostraban la primera clase de la lista, no la que se acababa de abrir).
- Clic en tarjeta de clase abría un modal de pestañas viejo — ahora navega directo a `/planificacion-ruta?clase=<id>`.
- "Salud IDIA Promedio" quedaba congelado tras calificar (solo se recalculaba al cargar la clase).
- Frecuencia semanal adivinada desde campos inexistentes (`clases.diasSemana`/`horario`) — ahora se detecta de la tabla real `horarios`.
- `sugerirSiguienteUnidadIA` (GROQ) no validaba el rango 2-4 indicadores prometido en el prompt.
- La "muestra demo" (2 unidades hardcodeadas) se apilaba con la primera unidad real en vez de reemplazarse — corregido con flag `esDataDemo` + aviso visible (esto puede haber quedado pisado por el rewrite de `910ba15`, **revisar**).

## Documentos de Referencia
- Spec de Diseño: `docs/superpowers/specs/2026-05-04-portal-maestros-design.md`
- Plan de Ejecución F1: `docs/superpowers/plans/2026-05-05-portal-maestros-f1.md`
