# Proposal: Juego Gamificado de Planificación (Unidad → Objetivo → Indicador)

## Intent

Construir un sistema de aprendizaje gamificado tipo Duolingo para el portal de maestros: jerarquía **Unidad → Objetivo → Indicador**, evaluada por el maestro (nunca autoevaluada) con estrellas 1-5 tras cada sesión de clase. La acumulación de indicadores superados avanza el objetivo; la acumulación de objetivos avanza la unidad. Incluye mapa visual, métricas, evaluación individualizada por alumno, un índice institucional que compare maestros que usan el modelo guiado vs. bitácora de texto libre, e insignias/rachas para alumnos.

**Estado: la base de código de partida ya está resuelta y fusionada a `master`.** Ver `Decisión #1` abajo — el trabajo de esta propuesta arranca directamente sobre `maestro_routes`.

## Decisión #1 — RESUELTA Y EJECUTADA: `maestro_routes` es el canónico

Auditoría completa de `feat/planificacion-clases-rediseño` (897 commits, último commit hoy mismo). Conclusión: **no es una rama abandonada ni experimental — es un feature branch chain deliberado, documentado con su propio ciclo SDD, y sustancialmente completo.**

Evidencia:
- `openspec/changes/teacher-portal-ai-grading/` en esa rama tiene proposal, design, 5 specs (`teacher-route-map.md`, `indicator-grading-modal.md`, `indicator-prerequisites.md`, `route-indicator-checks.md`, `attendance-debt-tracking.md`) y `tasks.md` con **34/42 tareas completadas (81%)**, cada una con status honesto (incluye qué NO se pudo verificar por falta de acceso a una base real, sin inventar números).
- **3 PRs ya fusionados** con revisión: [#23](https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/23) (TeacherRouteBuilder), [#24](https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/24) (IndicadorGradingModal — estrellas, deuda académica, **prerrequisitos entre indicadores**), [#25](https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/25) (IA "Analizar" + wiring). Los tres apuntan como base a `feat/planificacion-clases-rediseño`, no a `master` directo — exactamente la estrategia de "feature branch chain" que el propio `tasks.md` planificó desde el inicio. Por eso una búsqueda ingenua contra `master` no lo encontraba.
- Tiene **validación DAG de prerrequisitos entre indicadores** (ciclo detection, benchmarkeado <50ms para 60 indicadores) — una capacidad que el Sistema A no tiene.
- Los datos reales en producción (5 evaluaciones vía `maestro_indicador_id`) no son un accidente de testing suelto: son el resultado natural de una feature que ya se usó.
- Lo pendiente (8/42 tareas) es integración menor: import de plantillas ACM (marcado "no aplica todavía"), navegación opcional "siguiente indicador", algunos tests de flujo end-to-end diferidos a una siguiente PR. Nada bloqueante del núcleo.

**Comparación (al momento de decidir):**

| | Sistema A — `clase_mapa_objetivos` (sesión previa) | Sistema B — `maestro_routes` (canónico, elegido) |
|---|---|---|
| En `master` | Sí | Sí — [PR #30](https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/30), mergeado |
| Datos reales | 0 filas | 5 evaluaciones reales |
| "Unidad" como entidad | Alias sobre `catalogo_niveles` | Tabla real, jerarquía de 4 niveles |
| Prerrequisitos entre indicadores (DAG) | No | Sí, con detección de ciclos |
| RLS / tests / PDF / IA | Completo (620+ tests) | RLS + tests presentes, IA integrada (PR #25), PDF no confirmado |
| Planificación formal (SDD) | Sí (`mapa-gamificado-planificacion`) | Sí (`teacher-portal-ai-grading`), 81% completo |

**Ejecutado**: `feat/planificacion-clases-rediseño` tenía 111 commits divergentes mezclando 5 iniciativas sin relación entre sí (este feature, una auditoría hermes/alianzas ya mergeada aparte por [PR #28](https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/28), un cuarto sistema de planificación distinto — `RutaPedagogicaView.js`/`DeudaPedagogicaEngine`, mapa "Serpiente", jerarquía Clase→Nivel→Unidad→Objetivo→Indicador de 5 niveles sobre la tabla legada `planificaciones` —, un motor de orquestación de proyectos WBS sin relación, y commits informales de iteración con un maestro real de prueba). Se extrajo **quirúrgicamente, archivo por archivo**, solo el feature `teacher-portal-ai-grading` (Sistema B), verificando el historial de cada archivo para no arrastrar las otras 4 iniciativas — mergeado en [PR #30](https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/30).

**Pendiente real, no bloqueante**: portar a Sistema B lo que Sistema A ya tenía y B no tiene confirmado — export PDF de la ruta, `sugerirRutaDidacticaIA` con contexto de contenido previo, RLS de coordinador académico. Ver `Dependencies`.

El cuarto sistema (`RutaPedagogicaView`/"Serpiente") queda sin evaluar — tiene una UX de mapa visualmente más pulida que cualquiera de los otros dos; se revisa como insumo de diseño para la Fase 3 (Capa visual) de este cambio, no como bloqueante.

## Scope

### In Scope
- Portar a `maestro_routes` lo que Sistema A ya tenía: export PDF de la ruta, IA con contexto de contenido previo, RLS de coordinador académico.
- Conectar la infraestructura de gamificación ya existente en el schema (`rachas`, `logros`, `alumnos_logros` — 3 logros ya seedeados, hoy sin ningún flujo de escritura real) a `maestro_routes`/`evaluacion_indicador`.
- Rediseño visual del mapa: mantener SVG liviano existente, sumar GSAP (~70KB) para transiciones de desbloqueo, y Rive para animaciones de celebración de insignias/hitos (mismo patrón que usa Duolingo — confirmado por investigación, no se adopta un motor de juego completo).
- Panel de métricas: avance por clase/unidad, alumnos en riesgo, indicadores con baja tasa de superación.
- Evaluación individualizada: marcar un indicador como "necesita refuerzo" para un alumno específico (ya existe parcialmente vía `sugerirTareaRefuerzoIA`, extender a nivel de asignación explícita).
- Índice de adopción del modelo guiado por maestro (sesiones con indicador+estrella vs. solo texto libre en bitácora) — para reconocimiento institucional, no sanción.
- Insignias por desbloquear objetivos primero, con cuidado pedagógico: nunca exponer bajo desempeño de un alumno frente a sus pares.

### Out of Scope (esta propuesta)
- El resto de `feat/planificacion-clases-rediseño` (las otras 4 iniciativas mezcladas: `RutaPedagogicaView`/"Serpiente", el motor WBS, los commits informales) — quedan en esa rama, sin evaluar más allá de lo documentado en la Decisión #1.
- Motor de juego (Phaser/PixiJS) para el mapa principal — descartado por sobrepeso frente a la necesidad real (no hay física ni mundo jugable). Se reconsideraría solo como línea futura aislada si se agregan mini-juegos reales (ej. arrastrar notas, ritmo con toques).
- Deprecación de `clase_mapa_objetivos` (Sistema A) — queda como código muerto documentado (0 filas en producción), sin eliminar en este cambio para no perder la revisión histórica del trabajo ya hecho ahí (620+ tests).
- Deprecación del sistema legado `routes/levels/nodes` + `indicator_attempts` (ya confirmado código muerto por comentario en el propio repo) y del sistema legado `planificaciones`/`EditorPlanificacionModal.js` ("Mis Planes") — quedan documentados como deuda técnica conocida, no se tocan en este cambio.
- Vista de padres/representantes vía WhatsApp — línea futura, depende de infraestructura ya existente (`bot_blindaje`, webhooks) pero no se diseña acá.

## Capabilities

### New Capabilities
- `gamified-learning-path`: Ruta de contenido gamificada Unidad→Objetivo→Indicador con evaluación por estrellas, mapa visual animado, insignias y rachas.
- `teacher-guided-teaching-index`: Métrica institucional que compara adopción del modelo guiado (indicador+estrella) vs. bitácora de texto libre, por maestro.

### Modified Capabilities
- `teacher-portal-ai-grading` (`maestro_routes`) — se extiende con export PDF, IA con contexto, RLS de coordinador (portados de Sistema A), animación (GSAP/Rive), métricas y gamificación conectada.

## Approach

1. **Portar de Sistema A lo que falta en `maestro_routes`**: export PDF de la ruta (adaptar `generarPdfRutaClase.js` a la jerarquía de 4 niveles real), `sugerirRutaDidacticaIA` con contexto de contenido previo (adaptar a `maestro_indicadores`), RLS de coordinador académico en las tablas `maestro_routes`/`maestro_unidades`/`maestro_objetivos`/`maestro_indicadores` (hoy solo tiene RLS de maestro titular, sin auditar si incluye coordinador).
2. **Conectar `rachas`/`logros`/`alumnos_logros`** al flujo real de evaluación: un trigger SQL (`AFTER INSERT/UPDATE ON evaluacion_indicador` filtrando por `maestro_indicador_id IS NOT NULL`) que actualice `rachas.racha_actual` por fecha de actividad, y evalúe `logros.criterio` (jsonb) para otorgar `alumnos_logros` — reutilizando el patrón `SECURITY DEFINER` ya establecido para funciones de dominio en este proyecto.
3. **Capa visual**: envolver el mapa de `TeacherRouteBuilder.js`/`teacherRouteMapPanel.js` con GSAP para las transiciones de nodo (desbloqueo, pulso de progreso) sin reemplazar el renderer — cambio aditivo, cero riesgo de regresión visual. Rive se integra como overlay puntual solo para el modal de celebración de insignia/hito, no en el mapa base. Revisar `RutaPedagogicaView.js` (el cuarto sistema, mapa "Serpiente") como referencia de diseño visual antes de implementar, sin adoptar su código directamente.
4. **Métricas**: nueva vista derivada (SQL view, mismo patrón que `vw_clase_objetivo_estrellas` de Sistema A) que agregue por maestro: sesiones con indicador+estrella vs. sesiones solo con bitácora de texto — expuesta primero como reporte exportable (mismo patrón PDF), dashboard interactivo queda para una iteración posterior si ACM lo pide.
5. **TDD estricto** en cada pieza nueva, siguiendo el patrón de mocks in-memory de Supabase ya establecido en `__tests__/mapaClaseService.test.js` (Sistema A) — replicar para `maestroRouteService`/`maestroDataService`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `maestroRouteService.js` / `maestroDataService.js` | Modified | Portar export PDF + IA con contexto desde Sistema A. |
| RLS de `maestro_routes`/`maestro_unidades`/`maestro_objetivos`/`maestro_indicadores` | Modified | Auditar y extender con `es_coordinador_acm()` (mismo patrón ya aplicado a Sistema A). |
| `rachas` / `logros` / `alumnos_logros` (Supabase) | Modified | De schema sin usar a flujo de escritura real vía trigger. |
| `AchievementsSummaryModal.js` | Modified | Hoy atado al sistema legado (código muerto) — se reconecta al flujo real de `maestro_routes`. |
| `TeacherRouteBuilder.js` / `teacherRouteMapPanel.js` | Modified | Se suma GSAP + Rive, sin reemplazar el renderer base. |
| Nueva vista SQL de índice de adopción por maestro | New | Base del "índice de enseñanza guiada". |
| `package.json` | Modified | Se agregan `gsap` y `@rive-app/canvas-lite` (variante sin Text/Layouts/Scripting/Audio), ambos livianos y compatibles con Vite vía import ESM estándar. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| RLS de `maestro_routes` no tiene coordinador académico (sin auditar todavía) | Medium | Auditar antes de escribir el spec de gamificación — es un prerequisito de la Tarea 1 del Approach. |
| Bundle PWA crece para usuarios con conexión limitada (Punta Cana) | Medium | GSAP (~70KB) y `@rive-app/canvas-lite` (variante sin texto/audio/layouts) son livianos comparado con un motor de juego completo; cargar Rive vía `import()` dinámico solo en el modal de celebración (lazy), no en el mapa base. `three.js` (743KB) ya en el bundle por otro módulo — evaluar aparte si se reutiliza o se retira. |
| Confundir "índice de enseñanza guiada" con una herramienta punitiva y generar rechazo de maestros | Medium | Enmarcarlo explícitamente como reconocimiento, nunca como ranking negativo — validar el copy/UX con DIR antes de lanzar. |

## Rollback Plan
Revertir vía Git. Los cambios de schema (trigger de rachas/logros, vista de índice de adopción) son aditivos — no modifican tablas existentes.

## Dependencies
- Ninguna bloqueante — la reconciliación de `feat/planificacion-clases-rediseño` (`maestro_routes`) ya está en `master` vía [PR #30](https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/30).
- Portar a `maestro_routes` lo que ya existía en Sistema A: export PDF de la ruta, `sugerirRutaDidacticaIA` con contexto de contenido previo, RLS de coordinador académico — primera tarea de este cambio (Approach, punto 1), no un bloqueante externo.

## Success Criteria
- [x] Decisión de sistema canónico tomada, documentada y ejecutada — `maestro_routes` en `master` (PR #30).
- [ ] Export PDF, IA con contexto, y RLS de coordinador portados a `maestro_routes`.
- [ ] `rachas`/`logros`/`alumnos_logros` reciben escrituras reales desde el flujo de evaluación.
- [ ] Mapa visual con transiciones GSAP y celebración de insignias con Rive.
- [ ] Vista de índice de enseñanza guiada por maestro, exportable.
- [ ] Evaluación individualizada por alumno (marcar refuerzo específico) operativa.
- [ ] Ningún alumno ve calificación negativa expuesta frente a sus pares (verificado en UX review).
