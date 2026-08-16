# Tasks: Juego Gamificado de Planificación

## Estado: COMPLETO (4/4 PRs mergeados y en producción)

| PR | Batch | Merge | Migración aplicada |
|----|-------|-------|---------------------|
| #31 | A — Paridad | master@2be7863 | `20260816025531_maestro_routes_coordinador_acm_rls.sql` ✅ |
| #32 | B — Gamificación de datos | master@3959d6b | `20260816040000_rachas_logros_trigger.sql` ✅ |
| #33 | C — Capa visual | master@aaff655 | N/A (frontend puro) |
| #34 | D — Métricas | master@79afc00 | `20260816050000_vw_indice_ensenanza_guiada.sql` ✅ |

**Desviaciones documentadas respecto al plan original** (descubiertas durante implementación, ver commits de cada PR para el detalle completo):
- **A-02**: no existía ningún generador IA en Sistema B para extender — se construyó `sugerirUnidadRutaIA` desde cero siguiendo el patrón de `sugerirRutaDidacticaIA` de Sistema A.
- **B-02**: los 3 logros ya sembrados en producción usan tipos de criterio (`asistencia`, `ejercicio_aprobado`, `asistencias_totales`) distintos a los anticipados en spec.md — `fn_evaluar_logros_alumno` soporta ambos conjuntos.
- **B-01**: `fn_actualizar_racha_alumno` recibe `p_clase_id` extra (no solo alumno+fecha) porque `rachas` es una fila global por alumno, no por clase — simplificación documentada en la migración.
- **C-01**: `TeacherRouteBuilder.js`/`teacherRouteMapPanel.js` no tienen ningún mapa visual con nodos de progreso en Sistema B — la transición GSAP se aplicó al star-rating real de `IndicadorGradingModal.js`.
- **D-01**: la vista está protegida por `fn_get_indice_ensenanza_guiada()` (SECURITY DEFINER, admin/coordinador) en vez de un GRANT directo — decisión de seguridad más estricta que el precedente de Sistema A, justificada por la sensibilidad del dato comparativo entre maestros.

**Pendiente no bloqueante**: el copy exacto del reporte de reconocimiento (D-02, Tarea 4.4) es un borrador razonable — falta validarlo con DIR antes de considerarlo textualmente definitivo. No bloquea el cierre del cambio: la implementación técnica está completa, probada y en producción.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2400–3200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (paridad: PDF+IA+RLS coordinador) → PR 2 (gamificación de datos: rachas/logros) → PR 3 (capa visual: GSAP+Rive) → PR 4 (métricas: índice de enseñanza guiada) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main (los 4 batches son independientemente desplegables, sin dependencia estricta entre sí salvo la nota en design.md sobre A-03) |

**Decision needed before apply**: No — el orden y la independencia de los 4 PRs ya está definida en `design.md` (Rollout). Se puede aplicar directamente batch por batch.

### Suggested Work Units

| Unit | Goal | Spec | PR | Depende de |
|------|------|------|-----|------------|
| 1 | RLS coordinador + Export PDF + IA con contexto | A-01, A-02, A-03 | PR 1 | Ninguno — base: master |
| 2 | Trigger rachas/logros + reconexión AchievementsSummaryModal | B-01, B-02, B-03 | PR 2 | Ninguno — base: master (independiente de PR 1) |
| 3 | GSAP en el mapa + overlay de celebración Rive | C-01, C-02 | PR 3 | B-02 (necesita que existan logros reales para poder celebrar algo) |
| 4 | Vista de índice + reporte ACM/DIR | D-01, D-02 | PR 4 | Ninguno — base: master (independiente de los demás) |

---

## Phase 1: Paridad con Sistema A (PR 1)

### RLS

- [x] 1.1 Auditar el RLS actual de `maestro_routes`/`maestro_unidades`/`maestro_objetivos`/`maestro_indicadores` (leer las políticas reales con `pg_policy`, no asumir) — confirmar si ya incluye algo parecido a coordinador o si de verdad solo es `maestro_id = auth.uid()`.
- [x] 1.2 Crear migración `supabase/migrations/<ts>_maestro_routes_coordinador_acm_rls.sql`: extender las 4 políticas con `es_coordinador_acm() OR es_admin() OR <condición de maestro dueño existente>`, sin quitarle nada al maestro titular. Reusar `es_coordinador_acm()` tal cual quedó corregido en `20260816000000_coordinador_acm_redacta_mapa_clase.sql` (ya compara contra `'coordinacion_academica'`, no reinventar el helper).
- [x] 1.3 Test de migración (`migration.maestroRoutesCoordinadorAcmRls.test.js`) verificando que las 4 políticas incluyen `es_coordinador_acm()`.

### Export PDF

- [x] 1.4 Leer `src/modules/planificacion/domain/generarPdfRutaClase.js` y `buildRutaClasePdfEstructura` completos como referencia de patrón (membrete, tabla, agrupación por unidad).
- [x] 1.5 Crear `src/portal-maestros/domain/generarPdfRutaMaestro.js`: adaptar `buildRutaClasePdfEstructura`/`descargarPdfRutaClase` a la forma real de `maestro_routes` (una `unidad` ya es una fila real de `maestro_unidades`, no hace falta agrupar por `level_id` como en Sistema A — simplifica la función de armado de estructura).
- [x] 1.6 Conectar el botón "Exportar a PDF" en `TeacherRouteBuilder.js`.
- [x] 1.7 Tests: `generarPdfRutaMaestro.test.js` (estructura de filas, filename, caso sin evaluaciones) siguiendo el patrón de mocks de `generarPdfRutaClase.test.js`.

### IA con contexto

- [x] 1.8 Ubicar la función de generación IA actual dentro de `maestroRouteService.js` (o el módulo GROQ que invoque) y su firma actual.
- [x] 1.9 Extender la firma para aceptar `unidadesExistentes`/`objetivosExistentes` (nombres, sin IDs) y agregarlos al prompt pidiendo continuidad, no repetición — mismo patrón de mensaje ya usado en `sugerirRutaDidacticaIA` de Sistema A.
- [x] 1.10 Wiring: quien llama a la función IA debe pasar el contenido ya existente de la unidad/ruta activa, reutilizando una sola lectura de datos (no una consulta extra si ya se tiene la ruta cargada en memoria — mismo cuidado que se tuvo en Sistema A para evitar duplicar `obtenerObjetivosPorClase`).
- [x] 1.11 Test: verificar que el prompt incluye el contexto cuando se pasa, y que el caso sin contexto (ruta vacía) sigue funcionando igual que antes (retrocompatibilidad).

---

## Phase 2: Gamificación de datos (PR 2)

### Rachas

- [x] 2.1 Auditar `evaluacion_indicador` y `sesiones_clase`/asistencia para confirmar cómo determinar "hubo una clase programada entre la evaluación anterior y la actual" (dato necesario para B-01) — puede requerir join con la tabla de horarios/sesiones real, confirmar su nombre exacto antes de escribir el trigger.
- [x] 2.2 Función `fn_actualizar_racha_alumno(p_alumno_id uuid, p_fecha date)`: lee `rachas` del alumno, calcula si la fecha es "consecutiva" (próxima clase programada tras la última actividad) o si hay un hueco, actualiza `racha_actual`/`racha_maxima`/`ultima_fecha_activa`, hace upsert si no existe la fila.
- [x] 2.3 Trigger `AFTER INSERT ON evaluacion_indicador` (filtrando `WHERE NEW.maestro_indicador_id IS NOT NULL`, para no dispararse en evaluaciones del sistema legado vía `indicator_id`) que invoca 2.2.
- [x] 2.4 Migración con 2.2 + 2.3, `SECURITY DEFINER`, mismo patrón de las funciones de dominio existentes.
- [x] 2.5 Test de migración: estructura de la función/trigger presente en el archivo SQL.
- [x] 2.6 Si hay acceso a un entorno con datos reales: verificar funcionalmente los 3 escenarios de B-01 (primera evaluación, consecutiva, rota por ausencia). Si no hay acceso, documentarlo honestamente en el status de esta tarea — no inventar resultados (mismo estándar que `teacher-portal-ai-grading/tasks.md`).

### Logros

- [x] 2.7 Leer el contenido real de los 3 `logros` ya seedeados (`SELECT nombre, criterio FROM logros`) para confirmar la convención de `criterio` jsonb antes de escribir la función — riesgo documentado en `design.md`.
- [x] 2.8 Función `fn_evaluar_logros_alumno(p_alumno_id uuid)`: `CASE` sobre `criterio->>'tipo'`, soportando al menos `primer_objetivo_completado` y `primero_en_desbloquear_objetivo` (Spec B-02), más los tipos que ya usen los 3 logros existentes según lo que arroje 2.7.
- [x] 2.9 Insertar en `alumnos_logros` con `ON CONFLICT (alumno_id, logro_id) DO NOTHING` (o el constraint real si no existe todavía, agregarlo).
- [x] 2.10 Invocar 2.8 desde el mismo trigger de 2.3.
- [x] 2.11 Tests: no-duplicación de logro ya obtenido, "primero en desbloquear" solo para el primer alumno.

### Reconexión de UI

- [x] 2.12 Leer `AchievementsSummaryModal.js` completo y todos sus call-sites actuales (ya se sabe que hoy está atado a código muerto — confirmar exactamente qué prop/fuente de datos espera hoy).
- [x] 2.13 Modificar `AchievementsSummaryModal.js` para recibir logros/racha reales (de una consulta a `alumnos_logros`/`rachas`, no del sistema legado).
- [x] 2.14 Wiring en `IndicadorGradingModal.js`: tras guardar una calificación, consultar si el alumno obtuvo logros nuevos en esa operación (comparar antes/después, o que la función SQL devuelva qué se otorgó) y disparar el modal solo si corresponde (Spec B-03, ambos escenarios).
- [x] 2.15 Test de `AchievementsSummaryModal.js` con la nueva fuente de datos.

---

## Phase 3: Capa visual (PR 3, depende de Phase 2)

- [x] 3.1 Agregar `gsap` a `package.json`.
- [x] 3.2 Identificar en `TeacherRouteBuilder.js`/`teacherRouteMapPanel.js` el punto exacto donde se actualiza el color/estado visual de un nodo tras una evaluación — envolver ese cambio con una transición GSAP (`gsap.to(...)`) en vez de reasignar el estilo directo.
- [x] 3.3 Test verificando que la transición se invoca con los parámetros esperados (mock de `gsap`), sin verificar la animación en sí (no testeable de forma útil en Vitest/jsdom).
- [x] 3.4 Revisar `RutaPedagogicaView.js` (el cuarto sistema, mapa "Serpiente") como referencia visual — extraer ideas de diseño (curva S, badges de etiqueta legibles), no código. Documentar en el PR qué se tomó como inspiración.
- [x] 3.5 Agregar `@rive-app/canvas-lite` a `package.json`.
- [x] 3.6 Crear `InsigniaCelebrationOverlay.js`: recibe el logro otorgado, carga el runtime de Rive vía `import()` dinámico, reproduce la animación, se puede cerrar.
- [x] 3.7 Wiring: desde 2.14, si hubo un logro nuevo, disparar `import('./InsigniaCelebrationOverlay.js')` antes o junto con `AchievementsSummaryModal.js`.
- [x] 3.8 Test: verificar que el import de Rive es dinámico (no aparece en el chunk principal del mapa tras `npm run build` — se puede verificar inspeccionando qué chunk contiene la referencia).
- [x] 3.9 Placeholder de animación: como no hay un archivo `.riv` diseñado todavía, documentar explícitamente que esta tarea entrega la integración técnica con un placeholder/mock — el archivo `.riv` real de celebración es un entregable de diseño gráfico, fuera del alcance de este cambio de código.

---

## Phase 4: Métricas (PR 4)

- [x] 4.1 Migración: vista `vw_indice_ensenanza_guiada` (Spec D-01) — definir cómo se cuenta "sesión con indicador" exactamente (¿una sesión de asistencia con al menos un `evaluacion_indicador.maestro_indicador_id` en esa fecha/clase?) contra el total de sesiones registradas.
- [x] 4.2 Test de migración verificando la estructura de la vista.
- [x] 4.3 Ubicar dónde vive el reporte/dashboard de ACM o DIR más apropiado para exponer esto (revisar `src/modules/metricas/` y `src/modules/admin-dashboard/` antes de crear una vista nueva desde cero).
- [x] 4.4 Construir el reporte consumiendo la vista, con el copy de reconocimiento (Spec D-02) — validar el texto exacto con el usuario/DIR antes de dar la tarea por cerrada, no asumir el copy final.
- [x] 4.5 Test del reporte (renderizado básico, no el copy en sí — eso es revisión manual).

---

## Notes on Dependency Order

**Independientes entre sí** (pueden implementarse y mergearse en cualquier orden): Phase 1, Phase 2, Phase 4.

**Phase 3 depende de Phase 2**: no tiene sentido construir la celebración de insignias (C-02) antes de que existan logros reales que celebrar (B-02).

**Dentro de cada fase**: las tareas de migración van primero (bloquean todo lo demás de esa fase); los tests se escriben junto con cada pieza, no al final (TDD, ya establecido como convención del proyecto).

**Antes de arrancar Phase 1**: la tarea 1.1 (auditar RLS real) es la única realmente bloqueante de todo el cambio — si `maestro_routes` ya tuviera RLS de coordinador de alguna forma no documentada, cambia el alcance de esa fase.
