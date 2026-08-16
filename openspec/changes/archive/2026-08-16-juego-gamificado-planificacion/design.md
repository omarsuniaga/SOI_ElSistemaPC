# Design: Juego Gamificado de Planificación

## Technical Approach

Todo el trabajo se construye sobre `maestro_routes`/`maestro_unidades`/`maestro_objetivos`/`maestro_indicadores` (el sistema canónico, ya en `master` vía PR #30) y `evaluacion_indicador` (columna `maestro_indicador_id`). No se crean tablas de jerarquía nuevas. La gamificación (`rachas`, `logros`, `alumnos_logros`) ya existe como schema — el trabajo es conectarla, no diseñarla desde cero.

Cuatro capas independientes, cada una desplegable por separado:
1. **Paridad** (Batch A del spec): portar PDF/IA/RLS de coordinador desde Sistema A.
2. **Gamificación de datos** (Batch B): triggers SQL que alimentan rachas/logros desde evaluaciones reales.
3. **Gamificación visual** (Batch C): GSAP para transiciones, Rive para celebraciones — puramente frontend, sin nuevas tablas.
4. **Métricas institucionales** (Batch D): una vista SQL derivada + su consumo en reporte.

## Architecture Decisions

### Decision: Trigger SQL vs. cálculo en el cliente para rachas/logros

**Choice**: Trigger `AFTER INSERT ON evaluacion_indicador` (SECURITY DEFINER), no lógica en `maestroDataService.js`.

**Rationale**: Las evaluaciones también pueden originarse desde flujos que no pasan por el JS del portal (ej. corrección directa en Supabase, futuras integraciones). Un trigger garantiza que rachas/logros SIEMPRE reflejan el estado real de `evaluacion_indicador`, sin depender de que cada call-site del cliente recuerde invocar la actualización. Mismo patrón arquitectónico que `vw_clase_objetivo_estrellas` de Sistema A: las estrellas se derivan en SQL, nunca se escriben desde el cliente.

**Trade-off aceptado**: la lógica de "racha rota por ausencia a clase programada" (Spec B-01) requiere que el trigger consulte `sesiones_clase`/asistencia para saber si hubo una clase programada entre la evaluación anterior y la actual — más complejidad en SQL que en JS, pero evita el riesgo de que el cliente calcule mal la racha por una carrera de condición entre pestañas/dispositivos.

### Decision: Criterios de logros como JSONB interpretado en SQL, no hardcodeados

**Choice**: `logros.criterio` (jsonb, ya existe) se interpreta dentro de `fn_evaluar_logros_alumno()` con un `CASE` sobre `criterio->>'tipo'`, no una función distinta por cada logro.

**Rationale**: Los 3 logros ya seedeados no se conocen en detalle (fuera de alcance de esta sesión auditarlos), pero el patrón `criterio: jsonb` sugiere que la intención original era exactamente esta: agregar logros nuevos vía `INSERT INTO logros` sin tocar código. Se preservan los tipos de criterio ya soportados y se agregan los necesarios para B-02/B-03 del spec (`primer_objetivo_completado`, `primero_en_desbloquear_objetivo`) siguiendo esa convención.

**Riesgo documentado**: si los 3 logros ya seedeados usan una convención de `criterio` distinta a la asumida acá, la función fallará silenciosamente para esos 3 (no otorgará logros, no romperá nada) — se valida en la Tarea 1 de implementación, antes de escribir el resto.

### Decision: Rive vía import() dinámico, nunca en el bundle del mapa

**Choice**: `@rive-app/canvas-lite` se importa solo dentro de `InsigniaCelebrationOverlay.js`, y ese archivo se carga con `import()` dinámico desde el punto donde se detecta un logro nuevo — nunca importado estáticamente desde `TeacherRouteBuilder.js`/`teacherRouteMapPanel.js`.

**Rationale**: La mayoría de las sesiones de calificación NO otorgan un logro nuevo. Cargar el runtime de Rive (aunque sea la variante liviana) en cada carga del mapa sería pagar el costo de bundle para el caso poco frecuente. Mismo criterio que ya se usa en otros módulos del proyecto para código pesado poco frecuente (ej. `html2canvas`, `jspdf` se cargan solo al exportar, no al abrir la vista).

### Decision: GSAP envuelve el renderer existente, no lo reemplaza

**Choice**: Las funciones de render de `TeacherRouteBuilder.js`/`teacherRouteMapPanel.js` siguen generando el DOM/SVG igual que hoy. GSAP se usa solo para animar transiciones de propiedades CSS/SVG (color, opacity, transform) sobre nodos que YA EXISTEN en el DOM — no para renderizar el mapa completo.

**Rationale**: Reduce el riesgo de regresión visual a cero para el caso base (sin animación, el mapa se ve exactamente igual que hoy). Evita reescribir un renderer ya probado en producción (5 evaluaciones reales, 3 PRs revisados) por una dependencia de animación.

## Data Flow

1. **Evaluación**: Maestro califica en `IndicadorGradingModal.js` → `updateIndicadorNota()`/`saveIndicadorNota()` en `maestroDataService.js` → INSERT en `evaluacion_indicador` (vía `maestro_indicador_id`).
2. **Trigger dispara** (SQL, no cliente): `fn_actualizar_racha_alumno()` + `fn_evaluar_logros_alumno()` se ejecutan `AFTER INSERT`.
3. **Cliente refresca**: tras el guardado, `IndicadorGradingModal.js` consulta `alumnos_logros`/`rachas` para el alumno recién evaluado (mismo patrón que ya usa para refrescar check-states).
4. **Si hay logro nuevo**: se dispara `import('./InsigniaCelebrationOverlay.js')` → carga Rive → reproduce celebración → `AchievementsSummaryModal.js` (B-03) muestra el resumen al cerrar la sesión de calificación.
5. **Mapa se actualiza**: al volver al mapa, `teacherRouteMapPanel.js` lee el estado de progreso actualizado y anima la transición del nodo afectado vía GSAP (C-01).
6. **Métricas**: `vw_indice_ensenanza_guiada` (D-01) se consulta on-demand desde un reporte nuevo en el panel de ACM/DIR, sin caché — volumen de datos bajo (una fila por maestro), no justifica materializar.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/<ts>_maestro_routes_coordinador_acm_rls.sql` | New | RLS de coordinador en las 4 tablas de `maestro_routes` (Spec A-03). |
| `supabase/migrations/<ts>_rachas_logros_trigger.sql` | New | `fn_actualizar_racha_alumno`, `fn_evaluar_logros_alumno`, trigger `AFTER INSERT ON evaluacion_indicador` (Spec B-01, B-02). |
| `supabase/migrations/<ts>_vw_indice_ensenanza_guiada.sql` | New | Vista derivada (Spec D-01). |
| `src/portal-maestros/domain/generarPdfRutaMaestro.js` | New | Export PDF adaptado a 4 niveles (Spec A-01). |
| `src/portal-maestros/services/maestroRouteService.js` | Modify | IA con contexto (Spec A-02). |
| `src/portal-maestros/components/AchievementsSummaryModal.js` | Modify | Fuente de datos: `alumnos_logros`/`rachas` en vez del sistema legado (Spec B-03). |
| `src/portal-maestros/components/InsigniaCelebrationOverlay.js` | New | Overlay de celebración con Rive, import diferido (Spec C-02). |
| `src/portal-maestros/components/TeacherRouteBuilder.js` / `teacherRouteMapPanel.js` | Modify | Transiciones GSAP (Spec C-01). |
| `src/portal-maestros/components/IndicadorGradingModal.js` | Modify | Wiring: tras guardar, chequear logros nuevos y disparar overlay/modal. |
| `package.json` | Modify | Agregar `gsap`, `@rive-app/canvas-lite`. |
| Reporte ACM/DIR (vista a definir — probablemente `src/modules/metricas/` o `admin-dashboard/`) | New | Consumo de D-01, con el copy de reconocimiento (D-02). |

## Interfaces / Contracts

### `fn_evaluar_logros_alumno(p_alumno_id uuid)` (SQL)
Recorre `logros` activos, evalúa `criterio->>'tipo'` contra el estado actual del alumno en `evaluacion_indicador`/`maestro_routes`, inserta en `alumnos_logros` los que aplican y no existían ya (`ON CONFLICT DO NOTHING` sobre `(alumno_id, logro_id)`).

### `generarPdfRutaMaestro({ maestroNombre, claseNombre, unidades })` (JS)
Misma forma de `unidades` que `buildRutaClasePdfEstructura` de Sistema A (`{ unidadNombre, objetivos: [{ nombre, estrellas, pctAvance, indicadores: string[] }] }`), para poder reutilizar la lógica de render del PDF casi sin cambios — solo cambia de dónde se arma esa estructura (desde `maestro_unidades`/`maestro_objetivos`/`maestro_indicadores` en vez de `clase_mapa_objetivos`).

### `vw_indice_ensenanza_guiada`
```sql
maestro_id uuid,
total_sesiones integer,
sesiones_con_indicador integer,
indice numeric  -- sesiones_con_indicador / NULLIF(total_sesiones, 0)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Triggers SQL (rachas/logros) | Lógica de racha (consecutiva vs. rota), no-duplicación de logros | Migration test (estructura) + test funcional si hay acceso a DB real; documentar honestamente si no se pudo verificar en vivo (mismo estándar que `tasks.md` de `teacher-portal-ai-grading`) |
| `generarPdfRutaMaestro.js` | Estructura de filas de la tabla PDF | Unit test con jsPDF/autoTable mockeados, mismo patrón que `generarPdfRutaClase.test.js` |
| `InsigniaCelebrationOverlay.js` | Import diferido, no en bundle principal | Test que verifica `import()` dinámico vs. import estático (grep del código fuente o análisis del bundle) |
| RLS de coordinador | Acceso permitido/denegado según rol | Migration test verificando la política SQL, mismo patrón que `migration.coordinadorAcmRedactaMapaClase.test.js` |
| Copy de reconocimiento (D-02) | No automatizable | Checklist manual en code review |

## Rollout

Los 4 batches (A/B/C/D) son independientemente desplegables y no tienen dependencias estrictas entre sí salvo: **A-03 (RLS coordinador) debe ir primero** si se planea que el coordinador también califique, ya que sin eso el resto del flujo funciona igual mientras solo lo use el maestro titular. Se recomienda un PR por batch, siguiendo la convención `chained-pr` ya establecida en el repo (skill registry del proyecto).
