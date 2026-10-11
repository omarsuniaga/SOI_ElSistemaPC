---
doc_id: PORTAL-018
doc_type: manual
version: V10
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-10-09
next_review_due: 2027-04-07
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\superpowers\HANDOFF.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: "Sesión 2026-10-09: fix de evidencia de justificación (bucket/RLS/botón J) + investigación de duplicate-key en sesiones_clase (ya resuelta por PR #128, sin acción adicional)."
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
- **Idioma UI:** Español neutro e institucional (estricto tratamiento formal / impersonal; prohibido el voseo o dialectos regionales — ver `docs/planning/HANDOFF_ESTANDARIZACION_ESPANOL_NEUTRO.md`).

## Roadmap de Fases

1. **F1 - Base y Estructura:** ✅ COMPLETADA.
2. **F2 - Asistencia Core:** ✅ Implementada (`asistenciaView.js`), en uso y mantenimiento activo.
3. **F3 - Editor DSL:** Ver Spec sección 4.
4. **F4 - IA con GROQ:** Ver Spec sección 5.

## Sesión 2026-10-09 — Estado y pendientes (leer antes de continuar)

Contexto: diagnóstico y fix pedido por el usuario sobre "justificar inasistencia con evidencia" en el portal de maestros, originado en `src/portal-maestros/views/asistenciaView.js` + `components/JustificacionModal.js` + `components/attendance/JustifModalManager.js` + `services/justificacionService.js` (⚠️ no confundir con `src/modules/asistencias/views/asistenciasView.js`, que es solo un visor de solo lectura del módulo admin). Todo lo de abajo está commiteado y mergeado en `master` (PRs #126, #127), salvo lo marcado como pendiente.

### Bugs corregidos (verificados con build + tests + prueba en navegador contra producción)

- **Bucket de Storage inexistente (`documentos-private`)**: `justificacionService.js` subía evidencia a un bucket que nunca se creó en ninguna migración. El upload fallaba y el `catch` lo tragaba en silencio — el motivo se guardaba, la foto no, y la UI reportaba éxito igual. Corregido a `'documentos'` (el bucket real que ya usan `ausenciaService.js`, `fileUploadService.js`, `planningDocService.js`).
- **Quitar evidencia no se persistía**: el botón "×" solo limpiaba estado local del modal; el registro en BD conservaba la URL vieja. Se agregó el flag `_evidenciaRemoved` que viaja hasta `actualizarJustificacion()`, la cual ahora distingue 3 casos (reemplazar / quitar / sin cambios) y sube el archivo nuevo *antes* de borrar el viejo (evita referencias rotas si la subida falla).
- **Sin validación de tamaño/tipo** en el input de evidencia: se agregó (5 MB, `pdf|jpeg|png`) reusando los errores tipados de `fileUploadService.js`.
- **RLS faltante en el bucket `documentos`**: `storage.objects` tenía RLS activo pero sin ninguna policy para ese bucket — toda subida fallaba con `new row violates row-level security policy`, incluso después del fix anterior. Esto no era un descuido nuevo: ya había una discovery de seguridad previa (mayo 2026) marcando el bucket como público-sin-protección y pidiendo privatizarlo con RLS — quedó pospuesto hasta ahora. Se agregaron 3 políticas (insert/select/delete) acotadas a `documentos/justificaciones/*`, solo para maestro autenticado (`maestro_actual()`) o admin (`es_admin()`). Migración: `supabase/migrations/20261009010000_documentos_justificaciones_storage_rls.sql`, ya aplicada en producción.
- **Botón "J" borraba al instante sin confirmación**: presionarlo estando ya activo ejecutaba `eliminarJustificacion` directo, sin abrir modal ni pedir confirmación visible. Ahora el click (activo o inactivo) siempre abre `JustificacionModal` — vacío para registrar, o precargado para revisar/editar. "Limpiar" (antes "Eliminar") es la única vía explícita de borrado, con `confirm()` dentro del modal.

### Investigado pero NO tocar — ya resuelto por otro PR

El usuario reportó en consola un spam de `duplicate key value violates unique constraint "sesiones_clase_clase_fecha_maestro_unique"` al abrir una clase ya registrada. Se diagnosticó la causa raíz (INSERT directo cuando `sesionId` local no se resuelve, cae a la cola offline, que reintentaba un conflicto permanente) y se implementó un fix (branch `fix/sesiones-clase-upsert-duplicado`, PR #129) — pero **se cerró sin mergear** al descubrir que el **PR #128** (mergeado en paralelo, mismo día) ya lo había resuelto con un diseño mejor: `src/portal-maestros/services/queueSyncHandler.js` (nuevo, reemplaza `_syncWithSupabase` que vivía en `main-maestros.js` — esa función ya no existe) detecta el código 23505 específicamente y actualiza *solo* `contenido`+`asistencia`, sin tocar `borrador`/`estado` — evita el riesgo de devolver a borrador una sesión ya registrada desde otro dispositivo, que el approach descartado sí tenía. **No reabrir este tema sin releer `queueSyncHandler.js` primero.**

### Pendiente

1. **Verificación manual en navegador** de la subida de evidencia con las políticas RLS ya puestas — se intentó cerrar el ciclo con una prueba en vivo pero la extensión de Chrome falló repetidamente al navegar; quedó sin confirmar visualmente que la foto persiste end-to-end (el análisis de código y Supabase indica que sí debería funcionar).
2. `master` local de este equipo quedó muy desactualizado en algún punto (apuntaba a un commit de ~50 PRs atrás) — causó que `gh pr merge` no pudiera sincronizar la rama local automáticamente. No se tocó (podría tener historia local sin pushear); si alguien lo revisa, partir de `origin/master` para cualquier rama nueva, no del `master` local.

## Documentos de Referencia
- Spec de Diseño: `docs/superpowers/specs/2026-05-04-portal-maestros-design.md`
- Plan de Ejecución F1: `docs/superpowers/plans/2026-05-05-portal-maestros-f1.md`
