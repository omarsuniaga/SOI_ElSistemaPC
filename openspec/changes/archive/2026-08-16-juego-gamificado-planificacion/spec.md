# Spec: juego-gamificado-planificacion
**Date**: 2026-08-16
**Version**: 1.0
**Change**: `juego-gamificado-planificacion` — portar capacidades faltantes a `maestro_routes`, conectar gamificación existente (rachas/logros), capa visual GSAP+Rive, métricas e índice de enseñanza guiada.

---

## Batch A — Paridad con Sistema A (portado, no bloqueante)

### A-01 Export PDF de la ruta

El sistema MUST permitir exportar a PDF la ruta completa de una clase (Unidad→Objetivo→Indicador con estrellas/avance), reutilizando el patrón institucional ya establecido (membrete, `jsPDF`+`jspdf-autotable`).

**Files**: nuevo `src/portal-maestros/domain/generarPdfRutaMaestro.js` (adaptado de `src/modules/planificacion/domain/generarPdfRutaClase.js` a la jerarquía de 4 niveles de `maestro_routes`)
**Test**: `src/portal-maestros/domain/__tests__/generarPdfRutaMaestro.test.js`

#### Scenario: Exportar ruta con progreso

- GIVEN una ruta con 2 unidades, cada una con objetivos e indicadores evaluados
- WHEN el maestro exporta a PDF
- THEN el PDF resultante lista cada unidad, sus objetivos, y por cada indicador su descripción y nota (si fue evaluado)

#### Scenario: Exportar ruta sin evaluaciones

- GIVEN una ruta recién creada sin evaluaciones
- WHEN el maestro exporta a PDF
- THEN el PDF se genera sin error, mostrando indicadores sin evaluar como "—"

---

### A-02 IA con contexto de contenido previo

`maestroRouteService` MUST poder generar sugerencias de unidades/objetivos/indicadores que tengan en cuenta el contenido ya existente en la ruta del maestro, para no repetir ni contradecir lo ya creado.

**Files**: extender el generador IA existente en `maestroRouteService.js` (o el módulo GROQ que use la creación de rutas) para aceptar `unidadesExistentes`
**Test**: `src/portal-maestros/services/__tests__/maestroRouteService.iaContexto.test.js`

#### Scenario: Generar con contexto

- GIVEN una ruta que ya tiene la unidad "Postura y emisión de sonido" con 2 objetivos
- WHEN el maestro pide generar la siguiente unidad con IA
- THEN el prompt enviado a GROQ incluye los nombres de los objetivos existentes
- AND la respuesta no repite literalmente ninguno de esos nombres

#### Scenario: Generar sin contexto (ruta vacía)

- GIVEN una ruta recién creada sin unidades
- WHEN el maestro pide generar con IA
- THEN el sistema genera contenido genérico apropiado al instrumento/nivel, sin fallar por falta de contexto

---

### A-03 RLS de coordinador académico en `maestro_routes`

Las tablas `maestro_routes`, `maestro_unidades`, `maestro_objetivos`, `maestro_indicadores` MUST permitir lectura/escritura al coordinador académico (`es_coordinador_acm()`), no solo al maestro dueño de la ruta (`maestro_id = auth.uid()` o equivalente).

**Files**: nueva migración `supabase/migrations/<timestamp>_maestro_routes_coordinador_acm_rls.sql`
**Test**: `openspec` migration test siguiendo el patrón de `migration.coordinadorAcmRedactaMapaClase.test.js`

#### Scenario: Coordinador edita ruta de un maestro

- GIVEN un usuario con `profiles.rol = 'coordinacion_academica'`
- WHEN intenta actualizar una unidad de la ruta de un maestro que no es él mismo
- THEN la operación se permite (antes del cambio, RLS lo bloqueaba)

#### Scenario: Maestro sin relación no puede editar

- GIVEN un maestro que no es dueño de la ruta ni coordinador académico
- WHEN intenta editar esa ruta
- THEN la operación es rechazada por RLS (comportamiento sin cambios)

---

## Batch B — Gamificación conectada

### B-01 Rachas actualizadas por evaluación real

`rachas.racha_actual`/`racha_maxima`/`ultima_fecha_activa` MUST actualizarse automáticamente cuando se registra una evaluación (`evaluacion_indicador` vía `maestro_indicador_id`) para un alumno, contando días de actividad consecutivos (no de calendario continuo — un día sin clase programada no rompe la racha).

**Files**: nueva migración con trigger `AFTER INSERT ON evaluacion_indicador` + función `fn_actualizar_racha_alumno(alumno_id, fecha)`
**Test**: migration test + test SQL directo del trigger (patrón `execute_sql` en un entorno de test, o mock si no hay DB real disponible)

#### Scenario: Primera evaluación del alumno

- GIVEN un alumno sin fila en `rachas`
- WHEN se registra su primera evaluación
- THEN se crea una fila con `racha_actual = 1`, `racha_maxima = 1`

#### Scenario: Evaluación en día consecutivo de clase

- GIVEN un alumno con `racha_actual = 3`, última actividad el día de su clase anterior programada
- WHEN se registra una evaluación en su siguiente clase programada
- THEN `racha_actual` sube a 4, `racha_maxima` se actualiza si corresponde

#### Scenario: Evaluación tras faltar a una clase programada

- GIVEN un alumno con `racha_actual = 4`, faltó a la clase programada intermedia
- WHEN se registra una evaluación en la siguiente clase
- THEN `racha_actual` se reinicia a 1 (no se acumula sobre una ausencia)

---

### B-02 Logros otorgados por criterio

Al registrar una evaluación, el sistema MUST evaluar los `logros.criterio` (jsonb) activos y, si se cumplen y el alumno no lo tiene ya, insertar la fila correspondiente en `alumnos_logros`.

**Files**: función `fn_evaluar_logros_alumno(alumno_id)` invocada desde el mismo trigger de B-01
**Test**: migration test + casos por tipo de criterio soportado

#### Scenario: Logro por primer objetivo completado

- GIVEN un logro con criterio `{"tipo": "primer_objetivo_completado"}`, un alumno que acaba de superar todos los indicadores requeridos de su primer objetivo
- WHEN se evalúan los logros tras la evaluación
- THEN se inserta una fila en `alumnos_logros` para ese alumno y logro

#### Scenario: Logro ya obtenido no se duplica

- GIVEN un alumno que ya tiene un logro en `alumnos_logros`
- WHEN vuelve a cumplir el mismo criterio en una evaluación posterior
- THEN no se inserta una fila duplicada

#### Scenario: "Primero en desbloquear" dentro de la clase

- GIVEN un logro con criterio `{"tipo": "primero_en_desbloquear_objetivo"}` y dos alumnos de la misma clase acercándose al mismo objetivo
- WHEN el primer alumno lo completa
- THEN solo ese alumno recibe el logro; el segundo alumno que lo completa después no lo recibe (aunque cumpla el criterio de "objetivo completado" para logros que no sean de tipo "primero")

---

### B-03 `AchievementsSummaryModal` reconectado

El modal de resumen de logros MUST mostrarse tras guardar una sesión de calificación cuando el alumno obtuvo un logro nuevo o subió de racha, leyendo de `alumnos_logros`/`rachas` reales — no del sistema legado de `indicator_attempts` (código muerto).

**Files**: `src/portal-maestros/components/AchievementsSummaryModal.js` (modificar fuente de datos), wiring en `IndicadorGradingModal.js`
**Test**: `src/portal-maestros/components/__tests__/AchievementsSummaryModal.test.js`

#### Scenario: Modal se muestra con logro nuevo

- GIVEN una calificación guardada que dispara un logro nuevo para un alumno
- WHEN se completa el guardado
- THEN se muestra el modal con el nombre/ícono del logro obtenido

#### Scenario: Sin logros nuevos, no se muestra el modal

- GIVEN una calificación guardada que no dispara ningún logro ni cambio de racha
- WHEN se completa el guardado
- THEN el modal no se muestra (no hay interrupción innecesaria del flujo del maestro)

---

## Batch C — Capa visual

### C-01 Transiciones GSAP en el mapa de rutas

Los cambios de estado visual de un nodo (bloqueado → en progreso → superado) MUST animarse con GSAP en vez de un cambio instantáneo de color.

**Files**: `src/portal-maestros/components/TeacherRouteBuilder.js` o `teacherRouteMapPanel.js` (el renderer del mapa)
**Test**: test de integración verificando que se llama a la API de GSAP con los parámetros esperados (mock de `gsap`)

#### Scenario: Nodo pasa a superado

- GIVEN un nodo en estado "en progreso"
- WHEN el alumno acumula suficientes estrellas para superarlo
- THEN el mapa dispara una transición animada (no un re-render instantáneo) hacia el color/ícono de "superado"

---

### C-02 Celebración de insignia con Rive

Al otorgarse un logro nuevo, el sistema MUST mostrar una animación de celebración usando `@rive-app/canvas-lite`, cargada de forma diferida (no en el bundle principal del mapa).

**Files**: nuevo `src/portal-maestros/components/InsigniaCelebrationOverlay.js`
**Test**: `src/portal-maestros/components/__tests__/InsigniaCelebrationOverlay.test.js` (mock del runtime Rive)

#### Scenario: Import diferido

- GIVEN que el mapa de rutas se carga normalmente
- WHEN no hay ningún logro nuevo que celebrar
- THEN el código de Rive NUNCA se descarga (verificable por `import()` dinámico, no import estático)

#### Scenario: Celebración se reproduce una vez

- GIVEN un logro nuevo otorgado
- WHEN se abre el overlay de celebración
- THEN la animación de Rive se reproduce y el overlay se puede cerrar sin bloquear el flujo del maestro

---

## Batch D — Métricas e índice de enseñanza guiada

### D-01 Vista de índice de adopción por maestro

El sistema MUST exponer, por maestro, la proporción de sesiones de clase donde se registró al menos una evaluación por indicador (`evaluacion_indicador` vía `maestro_indicador_id`) frente al total de sesiones registradas (con o sin bitácora de texto libre).

**Files**: nueva vista SQL `vw_indice_ensenanza_guiada`, mismo patrón que `vw_clase_objetivo_estrellas`
**Test**: migration test verificando la estructura de la vista

#### Scenario: Maestro con adopción alta

- GIVEN un maestro con 8 de 10 sesiones registradas con al menos una evaluación por indicador
- WHEN se consulta la vista para ese maestro
- THEN el índice reportado es 0.8 (80%)

#### Scenario: Maestro sin ninguna evaluación por indicador

- GIVEN un maestro que solo usa bitácora de texto libre
- WHEN se consulta la vista
- THEN el índice reportado es 0, sin error

---

### D-02 Copy institucional de reconocimiento, no de sanción

Cualquier superficie de UI que muestre el índice de enseñanza guiada MUST enmarcarlo como reconocimiento (ej. "Maestros destacados por enseñanza guiada"), y MUST NOT presentarlo como un ranking negativo o de bajo desempeño visible a otros maestros.

**Files**: vista/reporte que consuma D-01 (a definir en design.md)
**Test**: revisión de copy en code review — no automatizable, se documenta como criterio de aceptación manual

#### Scenario: Vista de reconocimiento

- GIVEN el reporte de índice de enseñanza guiada
- WHEN un maestro con índice bajo lo consulta (si tiene acceso)
- THEN no ve una comparación explícita "peor que" frente a otros maestros con nombre — solo su propio dato y, opcionalmente, un promedio institucional anónimo
