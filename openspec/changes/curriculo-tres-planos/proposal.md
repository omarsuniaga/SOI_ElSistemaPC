# Propuesta: Arquitectura de Tres Planos para Currículo y Planificación (curriculo-tres-planos)

## Intent

El portal ACM guía su "guía heredada" desde tablas que **no existen en producción** (`acm_weekly_plans`, `acm_active_routes`, `acm_curriculum_sources`, `acm_curriculum_versions`, `acm_teacher_week_adjustments`, `student_indicator_progress` — 0 filas, verificado contra `SOI_DDBB_EL_SISTEMAPC`). El error se traga silenciosamente (`isMissingSchemaTableError → null`), así que la sincronización PLAN↔ACM de junio solo funciona en modo demo. En paralelo, el parser IA (`planningParserService.js`) que convierte la planificación subida por el maestro (PDF/DOCX/MD) en estructura Nivel→Tema→Objetivo→Indicador está construido y sin consumidores (código muerto), y `nodes` no distingue tema de objetivo (un solo campo `objective` no soporta N objetivos por tema). Resultado: 4 modelos de contenido paralelos, ninguno calificable salvo el spine `routes→route_versions→levels→nodes→indicators` (con datos reales: 4163 indicadores).

Esta propuesta consolida todo en **un único plano calificable de tres capas** (catálogo, clase, expediente) con autoría bidireccional (ACM y maestro proponen, ACM publica), cerrando el callejón sin salida del contenido de maestro y activando el parser existente como acelerador de captura.

## Scope

### In Scope
- Nivel "objetivos" explícito entre `nodes` (temas) e `indicators`, reemplazando el campo único `objective` en `nodes`
- Extensión de `route_status` con `propuesta` y `devuelta`; columnas `origen`, `propuesta_por`, `clase_id`, `feedback` en `route_versions`
- Flujo de autoría bidireccional: maestro propone `route_version` con `origen='maestro'`, ACM revisa y publica o devuelve con feedback (ACM conserva única autoridad de publicación)
- Motor de progresión secuencial (mastery-based) sobre `academic_plans` + `indicator_attempts`: objetivo actual = primero con indicadores obligatorios sin aprobar; desbloqueo en cascada objetivo→tema→nivel
- Activación de `planningParserService.js` como acelerador de captura del maestro, con: chunking (hoy trunca a 8000 chars), salida en modo borrador con revisión obligatoria del maestro antes de guardar, validación de esquema JSON antes de insertar, y mapeo del output de 4 niveles al spine corregido
- Derivar la guía heredada directo de `route_versions` publicadas (eliminando la dependencia de tablas `acm_*` fantasma en `weeklyPlanSupabase.js`)
- Congelar `planificaciones` (jsonb) como payload de captura que alimenta el parser
- Eliminar lectura de tablas DEPRECATED `plan_*` en `routeSupabase.js`

### Out of Scope
- Migración de datos histórica de `planificaciones` jsonb hacia el nuevo modelo (se evalúa en spec/design si aplica; el foco es el flujo hacia adelante)
- Reescritura de `student_node_progress` / `student_level_progress` (triggers existentes se mantienen; el motor de progresión secuencial es una capa nueva, no un reemplazo)
- UI/UX final de revisión ACM (pantallas) — se define en design, no en esta propuesta
- Cambio de modelo/proveedor del parser IA (Groq `llama-3.1-8b-instant` se mantiene; mejoras de calidad del prompt quedan fuera)
- Borrado físico de tablas `acm_*` fantasma o `plan_*` deprecated (se dejan de leer/escribir, no se dropean en esta iteración — riesgo de migración se maneja aparte)

## Capabilities

### New Capabilities
- `curriculum-objetivos-tier`: Nivel intermedio Tema→Objetivo→Indicador en el catálogo curricular (reemplaza campo único `objective` en `nodes`)
- `curriculum-bidirectional-authorship`: Flujo de propuesta de contenido por maestro (`propuesta`/`devuelta`) con publicación exclusiva de ACM
- `student-sequential-progression`: Motor de progresión secuencial mastery-based derivado de `indicator_attempts`
- `planning-parser-bridge`: Activación del parser IA como puente borrador→revisión→propuesta, con chunking y validación de esquema

### Modified Capabilities
- `SP-ACM-CURRICULUM-ROUTES-INGEST-V1`: Esta spec propuso las tablas `acm_weekly_plans`, `acm_active_routes`, `acm_curriculum_sources`, `student_indicator_progress` que **nunca se implementaron en prod** (0 filas). Esta propuesta reemplaza ese diseño: la guía heredada se deriva de `route_versions` publicadas del spine existente, no de una capa `acm_*` paralela. Requiere spec delta que marque `SP-ACM-CURRICULUM-ROUTES-INGEST-V1` como superseded.

## Approach

**Una columna, dos puertas, una autoridad.** Todo lo calificable vive en `routes→route_versions→levels→nodes→objetivos(nuevo)→indicators`. Puerta ACM: crea y publica (única autoridad — doctrina V9 se mantiene intacta). Puerta maestro: propone contenido de clase (técnicas, escalas, dinámicas), acelerado por el parser IA, materializado como `route_version` en estado `propuesta` scoped a su clase. ACM revisa: publica (`propuesta→publicada`) o devuelve con feedback (`propuesta→devuelta`). La guía heredada que consume el portal se deriva directo de versiones `published` — sin tablas fantasma de por medio. El motor de progresión secuencial calcula el objetivo/tema/nivel activo del alumno a partir de `indicator_attempts`, sin depender de tablas nuevas de estado (puede materializarse luego en `alumnos_rutas`/`alumnos_modulos`, hoy vacías, como cache).

**Piloto end-to-end (slice más barato primero)**: un maestro sube una planificación real → parser → revisión → propuesta → ACM publica → un alumno recibe calificación con progresión secuencial visible.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/*_objetivos_tier.sql` | New | Tabla `objetivos` entre `nodes` e `indicators`; migración de `nodes.objective` existente |
| `supabase/migrations/*_route_status_bidireccional.sql` | New | Enum `route_status` +`propuesta`+`devuelta`; columnas `origen`,`propuesta_por`,`clase_id`,`feedback` en `route_versions` |
| `src/modules/planificacion/api/weeklyPlanSupabase.js` | Modified | Reemplazar lectura de tablas `acm_*` fantasma por derivación desde `route_versions` published |
| `src/modules/planificacion/api/routeSupabase.js` | Modified | Eliminar lectura de tablas DEPRECATED `plan_*` |
| `src/portal-maestros/services/planningParserService.js` | Modified | Chunking, output-como-borrador, validación de esquema, mapeo a spine de 4 niveles |
| `src/modules/progresos/api/` (o nuevo módulo) | New | Motor de progresión secuencial mastery-based |
| `src/modules/planificacion/views/` (ACM) | New | UI de revisión de propuestas maestro (publicar/devolver) |
| `src/portal-maestros/views/` | New | UI de propuesta de contenido de clase + revisión de borrador del parser |
| `openspec/specs/SP-ACM-CURRICULUM-ROUTES-INGEST-V1.md` | Superseded | Marcar como reemplazada por el nuevo diseño de derivación desde spine |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Migración de 4163 indicadores sembrados a la jerarquía corregida (con tier objetivos) rompe referencias existentes | High | Migración aditiva: crear `objetivos` y remapear `indicators.node_id`→`indicators.objetivo_id` en transacción única, con rollback probado en staging antes de prod |
| Extensión de enum `route_status` sobre tabla viva (`route_versions`, 9 filas) en prod | Medium | `ALTER TYPE ... ADD VALUE` es no transaccional en Postgres — ejecutar en migración aislada, fuera de transacción con otros cambios de esquema |
| Calidad del parser IA (`llama-3.1-8b-instant`) genera JSON inválido o mapeo incorrecto a 4 niveles | Medium | Validación de esquema JSON obligatoria antes de insertar + revisión humana del maestro como gate obligatorio (nunca autosave) |
| Chunking del parser (hoy trunca a 8000 chars) pierde contenido de documentos largos sin aviso | High | Implementar chunking con merge de resultados parciales; fallar visiblemente si un chunk no puede procesarse, no truncar en silencio |
| Romper el flujo de calificación existente (`indicator_attempts`) o el trabajo PLAN↔ACM de junio en portal-maestros | Medium | Feature flag para el nuevo flujo de propuesta; spine actual (`nodes`/`indicators`) no se toca hasta que la migración de objetivos esté validada en staging |
| 400-line review budget por PR — el cambio toca migraciones + 2 servicios + 2 UIs nuevas | High | Delivery strategy `auto-chain`: slices independientes (ver Tasks) con work-unit commits, cada uno mergeable y reversible por separado |

## Rollback Plan

Cada slice es una migración aditiva o un cambio de lectura (no destructivo):
- Migraciones de esquema (`objetivos`, enum, columnas) son `ADD`, no `DROP` — revertibles con migración inversa sin pérdida de datos existentes
- Cambios en `weeklyPlanSupabase.js`/`routeSupabase.js` se revierten con `git revert` del commit; las tablas fantasma/deprecated no se tocan en esta iteración, así que no hay pérdida de acceso a datos legacy
- El parser bridge se activa detrás de una vista de revisión explícita — si falla, el maestro simplemente no usa el flujo de propuesta y sigue subiendo `planificaciones` como hoy
- Motor de progresión secuencial es de solo lectura sobre `indicator_attempts` — si falla, no afecta la calificación existente, solo la visualización de progreso

## Dependencies

- Migraciones revisadas manualmente antes de aplicar a `SOI_DDBB_EL_SISTEMAPC` (zmhmdvmyeyswunurcyow) — nunca aplicadas automáticamente por fases de planificación SDD
- Decisión de Omar sobre si migrar datos históricos de `planificaciones` jsonb o solo congelarla hacia adelante (abierta, ver Open Questions)
- Groq edge function (`groq-proxy`) operativa y con cuota disponible para el modelo `llama-3.1-8b-instant`

## Success Criteria

- [ ] Un maestro sube una planificación real (PDF/DOCX) → parser produce borrador estructurado Nivel→Tema→Objetivo→Indicador sin truncar contenido
- [ ] Maestro revisa y confirma el borrador → se crea `route_version` en estado `propuesta` scoped a su clase
- [ ] ACM ve la propuesta, la publica o la devuelve con feedback — nunca hay dos autoridades de publicación simultáneas
- [ ] Guía heredada del portal ACM se deriva de `route_versions` published, sin errores silenciosos de tablas inexistentes
- [ ] Un alumno recibe calificación (`indicator_attempts`) y su objetivo/tema/nivel activo avanza automáticamente según el motor de progresión secuencial
- [ ] Tests existentes de calificación (`indicator_attempts`) y sincronización PLAN↔ACM de junio siguen pasando (`npm run test:run`)
- [ ] Modo Demo funciona end-to-end con mocks equivalentes antes de considerar cualquier slice completo

## Open Questions

- ¿Se migra el histórico de `planificaciones` jsonb hacia el nuevo modelo de propuestas, o se congela y el histórico queda solo como archivo consultable?
- ¿`alumnos_rutas`/`alumnos_modulos` (hoy vacías) se materializan como cache del motor de progresión en esta iteración, o se calcula 100% on-the-fly y se difiere la materialización a una optimización futura?
