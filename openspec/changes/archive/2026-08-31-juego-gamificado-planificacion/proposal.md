# Proposal: Juego Gamificado para Planificación de Maestros

## Intent

**Problem**: Docentes de El Sistema necesitan un sistema de evaluación gamificado tipo Duolingo para modelar el progreso musical de estudiantes. Actualmente existen **tres sistemas paralelos en competencia** en la base de datos y codebase (jerarquía Unidad→Objetivo→Indicador), ninguno unificado, lo que genera fragmentación arquitectónica, falta de tracción con usuarios reales, y datos huérfanos. El usuario dueño del producto (OR, Dirección Ejecutiva) ha solicitado explícitamente:

1. Mapa visual estilo "camino de niveles" (Duolingo-like) con calidad gráfica moderna.
2. Evaluación individual del alumno (estrella 1-5 tras cada clase) contra indicadores concretos.
3. Rachas, insignias/badges, leaderboard de "primero en desbloquear objetivo".
4. Métricas para maestros (avance por clase/unidad, alumnos en riesgo, indicadores con baja tasa de superación).
5. Puntuación institucional comparativa (maestros usando modelo guiado vs bitácora texto plano).

**Why now**: 
- Investigación reciente completó auditoría crítica y descubrió la fragmentación (3 sistemas, 0 datos en 2 de ellos, datos huérfanos de integridad en el 3º).
- La rama `feat/planificacion-clases-rediseño` (sistema #2) ya tiene datos reales en producción (5 evaluaciones vía `maestro_indicador_id`).
- El sistema legado (sistema #3) fue confirmado como código muerto explícitamente en comentarios del propio codebase.
- Supabase ha seedeado ya tablas de gamificación (`rachas`, `logros`, `alumnos_logros`) pero no están conectadas a ningún flujo real.

**Success looks like**:
- Un único sistema canónico (consolidado) que unifica jerarquía Unidad→Objetivo→Indicador.
- Datos existentes migrados sin pérdida (5 registros de evaluación vivos en el otro sistema + tabla plantilla legada).
- Rachas + logros + insignias wireadas a ese sistema único, completas y funcionales.
- Interfaz visual moderna (mapa SVG mejorado con GSAP para transiciones, Rive para celebraciones de hitos).
- Cobertura de tests ampliada (vitest) para todo comportamiento gamificado.
- Capacidad comprobada de maestros construir, clonar, y generar mapas con IA.

## Scope

### In Scope

#### Architecture & Integration (Decisión de Consolidación)
- **Decision #1 (required before other tasks)**: Evaluar sistema #1 (`clase_mapa_objetivos`, mergeado a master) vs sistema #2 (`maestro_routes`, rama no-mergeada) como modelo canónico.
  - System #1: en master, 620+ tests, RLS, PDF export, IA, pero 0 filas en prod, "Unidad" como alias de `clase_mapa_objetivos.nivel`.
  - System #2: en rama feat/planificacion, datos reales (5 filas `evaluacion_indicador` vía `maestro_indicador_id`), modelo con "Unidad" como tabla real (`maestro_unidades`), pero NO mergeado a master.
  - Recomendación: **System #2 es canónico** (tracción real + integridad estructural); System #1 se depreca.

#### Data Migration & Integrity
- Migrar los ~5 registros reales de `evaluacion_indicador.maestro_indicador_id` (sistema #2 activo) de forma segura.
- Deprecar sistema #1 (`clase_mapa_objetivos` / `clase_mapa_indicadores` / `evaluacion_indicador.clase_indicador_id`) — cero filas en prod, bajo riesgo.
- Verificar y corregir CHECK constraint `evaluacion_indicador_exactly_one_indicator_source` (hoy excluye `clase_indicador_id` de la lógica XOR).
- Plan explícito de deprecación (cuándo se elimina schema del sistema #1).

#### Gamification Wiring
- Conectar tabla `rachas` (alumno_id, racha_actual, racha_maxima, ultima_fecha_activa) al flujo de evaluación indicador.
- Conectar tabla `logros` (id, nombre, descripcion, criterio jsonb, icono, activo) + `alumnos_logros` (alumno_id, logro_id, obtenido_en) al hito de objetivo desbloqueado.
- Reemplazar componente `AchievementsSummaryModal.js` (hoy atado a sistema legado #3, nodos/levelPromoted) con versión que consume `alumnos_logros` real.
- Cargar/inicializar `logros` seedeados en base (3 logros ya existen) o crear un script de migración.

#### Visual & Animation Layer
- Mejorar mapa SVG existente (`src/portal-maestros/components/teacherRouteMapPanel.js` o equivalente en sistema #2) con GSAP (~70KB, ya avalado por usuario).
- Rive para celebraciones de insignias/hitos (validado como decisión anterior, no más de ~100KB).
- Rechazar Phaser (~670KB), Babylon.js, PixiJS — usuario explícitamente lo pidió (costo de ancho de banda, Punta Cana).
- UI tipo "camino de niveles" con transiciones suaves, estados visuales claros (bloqueado/activo/completado).

#### Testing & Validation
- Extender vitest suite para sistema #2 si no tiene cobertura gamificación completa.
- Tests unitarios para lógica de racha (incremento, reset, streak longest streak).
- Tests para evaluar si alumno desbloquea logro tras superar indicador N-ésimo.
- Tests para métrica "alumnos en riesgo" (indicador XY con tasa superación <30%).

### Out of Scope

**Explicitly NOT this proposal**:
- Mergear completa la rama `feat/planificacion-clases-rediseño` a master "a ciegas" — eso requiere su propia revisión de código (PR review formal).
- Mini-juegos reales integrados (Phaser, Babylon.js). Futuro posible si IA identifica necesidad pedagógica.
- Leaderboard público con nombres de alumnos expuestos (riesgo pedagógico: desmoralización). Leaderboard interno de maestros (quién usa modelo guiado) es in-scope, leaderboard alumno anónimo/badges privadas sí, leaderboard alumno público no.
- Cambios de esquema DB más allá de deprecación limpia del sistema #1 y wiring gamificación existente.
- i18n (multiidioma). UI en español ES la realidad actual.
- Integración de "bitácora texto plano" legacy en el mapa gamificado. Son dos flujos distintos; métrica comparativa es report, no integración.
- Cambios en módulo "Planificaciones" legacy (`EditorPlanificacionModal.js`, fuera de sistema #2) — deuda técnica conocida, separada.

## Capabilities

### New Capabilities
- Juego gamificado en maestros: construir mapa (Unidad→Objetivo→Indicador), clonar, generar con IA.
- Evaluación individual alumno → indicador con estrellas (1-5), avance visible.
- Racha diaria/semanal de indicadores superados por alumno.
- Insignias desbloqueables (primero en superar objetivo X, racha 7 días, X% indicadores de unidad).
- Leaderboard maestros (% uso modelo guiado vs bitácora) — report, no UI pública.
- Métricas visuales: alumnos en riesgo, indicadores con baja tasa superación, retrocesos.
- Notificaciones push cuando alumno desbloquea insignia (o genera alerta riesgo).

### Modified Capabilities
- Asistencia + indicador: hoy separados, quedan separados — asistencia vive en otro módulo, evaluación indicador es juego.
- Exportación PDF: sistema #1 lo tiene → validar si sistema #2 lo conserva o agregar.
- Generación IA: sistema #1 lo tiene → validar si sistema #2 lo conserva o agregar (opcional para esta propuesta, no bloqueador).

## Approach

### Phase 1: Consolidation Decision & Architecture (CRITICAL, unblocks all others)

**Outcome**: Documento formal de decisión (qué sistema es canónico, por qué, plan de migración).

- Comparar ambos sistemas contra criterios explícitos:
  - **Data traction**: ¿qué sistema tiene filas reales en prod? (Sistema #2 gana: 5 filas)
  - **Code maturity**: ¿merged a master, tests, RLS? (Sistema #1 gana: master + 620 tests)
  - **Data model integrity**: ¿Unidad es tabla real o alias? (Sistema #2 gana: tabla real `maestro_unidades`)
  - **Existing features**: PDF export, IA generation, RLS, coordinador ACM perms (verificar en ambos)
  
- **Recomendación propuesta**:
  - **Sistema #2 (`maestro_routes`)** es canónico por:
    1. Tracción real (usuarios están escribiendo datos ahora).
    2. Modelo relacional más coherente (Unidad como tabla de verdad).
    3. Necesitamos llevarlo a master de todas formas.
    4. Migración del sistema #1 es trivial (0 filas, puede deprecarse limpiamente).
  - Alternativa: Sistema #1 como canónico (invierte en consolidar tests legacy, pero pierde tracción real).
  
- Verificar con ACM/DIR aprobación de decisión antes de continuar.

### Phase 2: Migration & Data Integrity (Depende de Phase 1)

**Outcome**: Datos migrados, schema limpio, integridad verificada.

- **Si sistema #2 es canónico**:
  - Copiar los 5 registros `evaluacion_indicador` vía `maestro_indicador_id` a tabla de auditoría o backup.
  - Verificar CHECK constraint `evaluacion_indicador_exactly_one_indicator_source` — ¿incluye lógica para deprecar `clase_indicador_id`?
  - Plan deprecación (6-8 semanas): marcar `clase_mapa_objetivos` / `clase_mapa_indicadores` como DEPRECATED, eliminar en fecha posterior.
  - Escribir script idempotente de migración (SQL + función RPC si es compleja).

- **Si sistema #1 es canónico**:
  - Reescribir sistema #2 para usar tablas de sistema #1.
  - Copiar 5 filas existentes a sistema #1 (`clase_mapa_indicadores`, `evaluacion_indicador.clase_indicador_id`).
  - Deprecar `maestro_routes`, etc.

- Validar RLS (es_maestro_de_clase, es_coordinador_acm, es_admin) en tablas canónicas.

### Phase 3: Gamification Wiring (Paralelo a Phase 2, depende de decisión Phase 1)

**Outcome**: Rachas + logros + insignias funcionales, wireadas al flujo de evaluación.

#### 3a. Racha (Streak)
- Trigger de BD en `evaluacion_indicador` que actualiza `rachas.racha_actual` y `ultima_fecha_activa`.
- Reset automático si `ultima_fecha_activa < hoy - 1 día`.
- Lógica: racha incremente si hay ≥1 indicador con ⭐≥3 en la misma clase/sesión/día.
- Test: evaluar indicador hoy → racha +1; nada mañana → reset; evaluar mañana → +1 de 1.

#### 3b. Logros (Achievements)
- Loadear/crear 3+ logros seedeados (ej: "Primero en desbloquear Objetivo 5", "Racha 7 días", "Superó 80% indicadores de Unidad").
- Trigger en `evaluacion_indicador` que evalúa criterio JSONB de cada logro (ej: `{"tipo": "first_objective", "objetivo_id": 5}` vs `SELECT COUNT(*) FROM alumnos_logros WHERE logro_id = ? AND alumno_id = ?` = 0 AND es este alumno).
- Insertar en `alumnos_logros(alumno_id, logro_id, obtenido_en)` cuando se cumple.
- No duplicar: `alumnos_logros` debe tener UK(alumno_id, logro_id).

#### 3c. Insignias (UI para Logros)
- Reemplazar `AchievementsSummaryModal.js` para leer de `alumnos_logros`, no de nodes/levelPromoted (sistema legado).
- Mostrar insignia con icono (campo `logros.icono` — URL), nombre, descripción.
- Animación Rive (~100KB) cuando alumno recibe insignia nueva (celebración no-intrusiva).
- Guardar en localStorage si insignia ya mostrada (para no repetir animación).

#### 3d. Notificaciones (Push/Toast)
- Cuando logro se obtiene, disparar notificación (AppToast o push).
- Si hay múltiples alumnos en la clase, notificación privada al alumno logrador.
- Opcional: notificación al maestro (feedback positivo sobre su enseñanza).

### Phase 4: Visual & Animation Layer (Depende Phase 1)

**Outcome**: Mapa SVG mejorado, transiciones suaves, celebraciones.

- Mejorar `MapaContenidoSVG.js` (sistema #1) o equivalente en sistema #2.
- GSAP para:
  - Transición visual cuando indicador pasa de ⭐⭐ a ⭐⭐⭐ (glow, bounce).
  - Unidad bloqueada → desbloqueada (animación entrada).
  - Progreso visual (barra %) de objetivo.
- Rive para celebración insignia (un anim, reutilizable).
- Test visuales: verificar no hay jank, transiciones < 300ms.
- Performance: bundle + GSAP + Rive < 500KB delta.

### Phase 5: Metrics & Reporting (Depende Phase 3)

**Outcome**: Reportes de métricas accesibles a coordinador ACM.

- **Racha**: tabla alumno_id, racha_actual, racha_max, última_fecha.
- **Alumnos en riesgo**: ¿algún indicador con tasa superación < 30% en los últimos 10 evals?
- **Maestros guiados vs bitácora**: COUNT(maestros con ≥1 clase vía mapa) / COUNT(maestros activos).
- Vista read-only para coordinador ACM: filtrar por unidad, objetivo, alumno, fecha.
- Exportación CSV: alumnos + estrellas + racha + logros (para análisis externo).

### Phase 6: Testing & Validation (Contínuo, completa cada fase)

- Vitest: unit tests para racha, logro, cálculo riesgo, métrica maestro.
- E2E (opcional): flujo maestro crea indicador → alumno recibe eval estrellas → racha incrementa → logro dispara.
- Smoke tests: no hay n+1 queries en mapa load, no hay memory leaks en SPA nav.

## Rationale

**Why system #2?**
- **Data is the source of truth**: 5 registros reales en `maestro_indicador_id` sugieren que usuarios ya están usando ese flujo, no el sistema #1.
- **Structural integrity**: "Unidad" como tabla real (`maestro_unidades`) es más correcto que como alias. Facilita relaciones futuras (ej: Unidad tiene múltiples Objetivos en paralelo, no secuencial).
- **Clean deprecation path**: Sistema #1 tiene 0 filas — migración trivial, riesgo bajo.
- **Investment efficiency**: De todas formas necesitamos llevar system #2 a master para que el código vivo llegue a todos los usuarios. Hacerlo como parte de gamificación es más eficiente que PR separada.

**Why GSAP + Rive, no Phaser?**
- Usuario explícitamente pidió NO meter motores de juego pesados (Phaser ~670KB).
- GSAP (~70KB) + Rive (~100KB) = ~170KB vs 670KB → respeta constraints ancho de banda Punta Cana.
- Duolingo mismo no usa Phaser; usa animación dirigida por estados + componentes UI normales.
- Si en futuro se agregan mini-juegos (pedagógicos reales), ir a Phaser es evolución natural.

**Why wiring gamification existente, no crear tablas nuevas?**
- `rachas`, `logros`, `alumnos_logros` ya existen (schema ya pago, seedeo ya hecho).
- Reutilizar evita duplicación y simplifica deploy (no hay nueva migración).
- AchievementsSummaryModal existe pero desconectada — rewiring es más barato que reescribir.

## Alternatives Considered

### Alternative A: System #1 as Canonical
- **Pros**: 
  - Código mergeado a master, mejor visibilidad.
  - 620+ tests ya escritos.
  - PDF export + IA generation implementado.
- **Cons**:
  - 0 filas en producción → no hay validación real del modelo.
  - "Unidad" es alias, no tabla de verdad → menos flexible.
  - Requiere reescribir/backport sistema #2 (rama no-mergeada) a tablas de #1.
  - Invierte trabajo en consolidar tests de un modelo sin tracción.
  - Los usuarios reales están en sistema #2 → contracorriente.
- **Decision**: Rechazado. Costo de reescritura supera beneficio de tests legacy.

### Alternative B: Dual Systems (Don't Consolidate)
- **Pros**:
  - Evita reescritura, ambos sistemas coexisten.
  - Menos riesgo de migración data.
- **Cons**:
  - Fragmentación amplificada → bugs de consistencia, confusión de maestros.
  - Dos UIs diferentes, dos conjuntos de tests, dos historias de datos.
  - Imposible construir gamificación coherente (¿rachas aplican a cuál sistema?).
  - Deuda técnica se vuelve impagable (¿cuál tabla mata primero?).
  - Violeta filosofía "Single Source of Truth".
- **Decision**: Rechazado. Gamificación necesita coherencia.

### Alternative C: Rewrite Both Systems from Scratch
- **Pros**:
  - Código limpio, sin legacy.
  - Mejor oportunidad diseñar bien schema desde inicio.
- **Cons**:
  - Pierde 620 tests de sistema #1, IA, PDF export.
  - Reescribe datos reales del sistema #2 (riesgo de pérdida).
  - Alto esfuerzo, bajo valor agregado si los dos sistemas son ya funcionales.
  - Timeline de entrega se extiende 4-6 semanas mínimo.
- **Decision**: Rechazado. Overkill para lo que es principalmente cuestión de consolidación, no rediseño.

### Alternative D: Use Three.js for 3D Map Visualization
- **Pros**:
  - 3D "Sala de Trabajo" ya usa three.js (743KB) → reutilizar.
  - Visualmente impactante.
- **Cons**:
  - Three.js bundled pero casi no usado (la sala 3D es periférica).
  - Aumenta complejidad cognitive (3D para un mapa plano es overengineering).
  - Duolingo no usa 3D.
  - Usuario explícitamente pidió evitar pesos nuevos.
- **Decision**: Rechazado. SVG + GSAP es más que suficiente.

### Alternative E: Leaderboard Público (Alumno vs Alumno)
- **Pros**:
  - Gamificación "completa" tipo Duolingo.
  - Puede motivar competencia sana.
- **Cons**:
  - Riesgo pedagógico: desmoralización de alumnos con bajo desempeño.
  - Contextos vulnerables (Punta Cana, educación musical comunitaria) requieren cuidado.
  - Usuario pidió explícitamente "nunca exponer bajo desempeño públicamente".
  - Leaderboard maestro (% uso modelo) es suficiente para medir tracción institucional.
- **Decision**: Out of Scope. Insignias privadas + racha personal sí.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/portal-maestros/services/maestroRouteService.js` | Modified | Sistema canónico; agregar lógica racha/logro triggers |
| `src/portal-maestros/components/TeacherRouteBuilder.js` | Modified | Mantener (sistema #2 canónico) |
| `src/portal-maestros/components/teacherRouteMapPanel.js` | Enhanced | Mejorar SVG + GSAP animaciones, visual estrellas indicador |
| `src/portal-maestros/components/IndicadorGradingModal.js` | Enhanced | Estrellas 1-5, integrar con racha/logro triggers |
| `src/portal-maestros/components/AchievementsSummaryModal.js` | Rewritten | Leer de `alumnos_logros`, agregar Rive animation |
| `src/modules/planificacion/services/mapaClaseService.js` | Deprecated | Deprecar si sistema #1 es abandonado (0 filas en prod) |
| `src/modules/planificacion/views/MapaClaseView.js` | Deprecated | Deprecar si sistema #1 es abandonado |
| `src/modules/planificacion/components/MapaContenidoSVG.js` | Deprecated | Deprecar si sistema #1 es abandonado |
| `src/modules/planificacion/__tests__/mapaClaseService.test.js` | Deprecated | Deprecar si sistema #1 es abandonado |
| `supabase/migrations/` | New | Migración deprecación `clase_mapa_*`, wiring gamificación, triggers racha/logro |
| `__tests__/gamificacionService.test.js` | New | Tests para racha, logro, cálculo riesgo, métrica maestro |
| `src/shared/utils/streakCalculator.js` | New | Lógica racha (reutilizable) |
| `src/shared/services/achievementService.js` | New | Lógica logro (reutilizable) |
| `src/modules/reportes/` | Enhanced | Agregar vistas métricas racha, alumnos en riesgo, maestros guiados |
| `package.json` | Modified | Agregar GSAP (~70KB), validar Rive (~100KB) si no presente |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Consolidación elige sistema incorrecto | Med | Alto (reescritura, pérdida tracción) | Verifying criterios explícitos con ACM + DIR antes de decisión; piloto con maestro real |
| Migración data sistema #2 → #1 pierde registros | Low | Alto (pérdida eval) | Backup explícito; auditoría antes/después; test restore |
| Triggers racha/logro crean N+1 queries | Med | Med (perf mapa load) | Índices en `rachas(alumno_id)`, `alumnos_logros(alumno_id, logro_id)`; test performance |
| Rive animation causa crashes en móvil/navegador viejo | Low | Med (UX degrada) | Feature flag animation, fallback static badge; test en Chrome 90+, Safari 12+ |
| Bundle GSAP + Rive supera 500KB delta | Low | Med (carga lenta) | Lazy-load Rive, minify agresivo, verificar tree-shake GSAP; build análisis |
| AchievementsSummaryModal rewrite rompe con existing callers | Low | Med (UI blank) | `rg` search todos imports; audit en Batch anticipation |
| RLS falla en sistema #2 (coordinador ACM ve alumnos que no debe) | Low | Alto (seguridad) | Auditoría RLS actual; test explícito: coordinador solo ve clases asignadas; penetration test |
| Código legado sistema #1 sigue vivo (no deprecado limpiamente) | Med | Med (deuda acumula) | Plan deprecación formal + fecha; reminders git commit messages; verificar en PR review |

## Rollback Plan

1. **Por fase**:
   - **Phase 1 (decisión)**: Si se elige sistema incorrecto → volver a exploración, requiere dir aprobación formal para cambiar.
   - **Phase 2-3 (migración + wiring)**: `git revert` commit de migración; restore BD backup pre-migración.
   - **Phase 4-5 (visual + reports)**: Revert commits GSAP/Rive, volver a mapa estático; deshabilitar reports.
   
2. **Feature flags**:
   - `feature.gamification_enabled` (default true post-deploy) → rollback vuelve false.
   - `feature.new_racha_logic` → puede rollback a "no update racha".
   - `feature.rive_celebration` → fallback a static badge si falla.

3. **Data safety**:
   - Backup `rachas`, `logros`, `alumnos_logros` antes de cualquier cambio de schema.
   - Test restore en staging antes de deploy prod.

## Dependencies

- **Supabase**: BD debe permitir triggers complejos (Python/PL-pgSQL) para racha/logro.
- **ACM aprobación**: Decisión sistema canónico debe ser aprobada por ACM/DIR.
- **GSAP + Rive**: Verificar que no rompen build (Vite, treeshaking, code splitting).
- **AppToast/AppModal**: Si no existen, agregar antes de notificaciones (Batch 3d).
- **RLS functions**: Verificar `es_coordinador_acm()`, `es_maestro_de_clase()`, `es_admin()` existen y correctas en BD.

## Success Criteria

- [ ] **Decision Phase 1**: Sistema canónico elegido formalmente (sistema #2 recomendado), documentado en issue/PR.
- [ ] **Data Integrity**: 5 registros `evaluacion_indicador` migrados sin pérdida; schema consolidado verificado.
- [ ] **Racha**: Evaluación indicador ⭐≥3 incrementa `rachas.racha_actual`; reset automático si ≥1 día sin eval.
- [ ] **Logros**: Mínimo 3 logros seedeados; disparan automáticamente cuando criterio se cumple; sin duplicados.
- [ ] **Insignias**: AchievementsSummaryModal muestra logros reales; Rive anim dispara sin crashes.
- [ ] **Mapa Visual**: SVG mejorado con GSAP; transiciones <300ms; sin jank en Chrome/Safari desktop/mobile.
- [ ] **Métrica Alumnos en Riesgo**: Coordinador ACM ve report de indicadores con tasa <30%; se filtra por unidad.
- [ ] **Métrica Maestros Guiados**: Dashboard shows % maestros usando mapa vs bitácora (lectura correcta de data).
- [ ] **Tests**: Cobertura vitest ≥80% para racha, logro, riesgo, métrica; E2E smoke pass.
- [ ] **No Regressions**: Asistencia, bitácora, pdf export (si existía), IA (si existía) funcionan igual o mejor.
- [ ] **Performance**: Bundle delta GSAP+Rive ≤170KB; mapa load <2s en 4G.
- [ ] **Accessibility**: WCAG AA cumple (accessible badges, alt text iconos, keyboard nav).
- [ ] **Rollback Ready**: Backup/restore script tested, feature flags en place, deprecation plan escrito.

## Open Questions

1. ¿Sistema #2 (`maestro_routes`) tiene PDF export y IA generation funcionales? Si no, ¿agregar como dependencia o out-of-scope?
2. ¿El criterio JSONB en `logros.criterio` permite lógica compleja (ej: `first_to_unlock_objective AND racha > 5`)? O empezamos con criterios simples.
3. ¿Leaderboard maestros (% uso modelo guiado) es un report o una UI interactiva en dashboard ACM?
4. ¿Notificaciones push reales (service worker + Web Push API) o solo toast in-app?
5. ¿Qué maestro/alumno sampleo probamos primero? (Pedir dato a DIR para case real).
