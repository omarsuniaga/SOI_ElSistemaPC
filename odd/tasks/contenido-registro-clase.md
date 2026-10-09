# contenido-registro-clase

**Objetivo:** el texto escrito en el registro de clase reaparece al reabrir; nunca se muestra «guardado» antes de confirmarlo ni se pierde en silencio.

**Origen:** plan pegado por el usuario (4 pasos) + fix previo `44bb6c1c`.
**TDD:** activo (estricto) · fuente: CLAUDE.md global · runner: `npx vitest run <archivo>`
**Ruta:** inline (cambio acotado, módulos nuevos pequeños).

## Hallazgos (causa raíz)
1. `_contenidoPersistido` se asigna al encolar, no al confirmar → el flush al salir ve «sin cambios» y no guarda (borrador < 2 s se pierde).
2. `shouldQueueDraftSave` descarta sesiones registradas; el autosave escribe `borrador:true`, por eso se excluyó.
3. La cola offline (`sync_queue`) no se lee al reabrir; `initSyncManager()` no se llama en ningún lado → nunca sincroniza al reconectar.
4. `processQueue` descarta items tras 5 intentos fallidos sin aviso.
5. No hay indicador de estado para el maestro.

## Tareas
- [x] T1 RED: tests de ciclo escribir→salir→reabrir (borrador <2 s, sesión registrada, offline)
- [x] T2 GREEN: `contentSaveTracker` (persistido solo tras confirmar) + flush al salir + contenido de sesión registrada sin pasar a borrador
- [x] T3 Offline: recuperar texto pendiente de la cola al reabrir, activar sync al reconectar, no descartar en silencio, indicador guardado/pendiente/falló
- [ ] T4 Verificación: tests focalizados + `npm run policy:check`/lint, Demo y real

## Evidencia
- RED: 4 suites fallaban (módulos inexistentes, descarte de cola tras 5 intentos).
- GREEN: `npx vitest run src/portal-maestros src/modules/planificacion/api` → 115 archivos / 934 tests OK. ESLint: 0 errores.
- Hallazgo extra: la vista llamaba `shouldQueueDraftSave` sin importarla (ReferenceError en cada cambio del editor).
- Pendiente T4: verificación manual en Demo y flujo real (no ejecutada).
