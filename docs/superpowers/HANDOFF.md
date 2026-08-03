---
doc_id: PORTAL-018
doc_type: manual
version: V10
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-08-03
next_review_due: 2027-01-30
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\superpowers\HANDOFF.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: "Sesión 2026-08-03: fixes previos a demo de Portal ACM + Portal Maestros, arranque del catálogo propio de planificación."
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
- **Enrutamiento:** El portal de maestros usa su propio router SPA (`portal-maestros/router/portalRouter.js`, expuesto en `window.router` por `main-maestros.js`) sobre `#portal-app` — **no** el router de `core/router/router.js` (ese es de ACM/admin, navega sobre `#app`, que no existe en `maestros.html`). Las vistas compartidas entre portales (ej. `src/modules/planificacion/views/*`) deben resolver `window.router` en runtime, nunca importar un router fijo — ver incidente 2026-08-03 abajo.
- **Consultas DB:** Nunca usar joins complejos de Supabase (`.eq('tabla.columna', ...)`). Realizar 2 consultas separadas.
- **Variables:** Español, camelCase.

## Roadmap de Fases

1. **F1 - Base y Estructura:** ✅ COMPLETADA.
2. **F2 - Asistencia Core:** ✅ Implementada (`asistenciaView.js`), en uso.
3. **F3 - Editor DSL:** ✅ Implementado (editor DSL de registro de clase dentro de `asistenciaView.js`).
4. **F4 - IA con GROQ:** ✅ Integrada (`groqService.js`, `aiEvaluacionService.js`) — pero solo a nivel masivo (genera un nivel curricular completo de una), no por objetivo puntual. Ver pendientes abajo.

## Sesión 2026-08-03 — Estado y pendientes (leer antes de continuar)

Contexto: demo de Portal ACM + Portal Maestros con plazo de 2 días. Se hizo una batería de fixes de bugs reales encontrados en vivo (con logs de Postgres/Auth del proyecto, no especulación) y se arrancó una feature nueva grande (catálogo de planificación). Todo lo de abajo está commiteado y pusheado a `master`.

### Bugs corregidos (verificados con build + tests + prueba en navegador contra producción)

- **MIME error `early-error-suppression.js`**: los 14 HTML de portal lo cargaban con `<script src>` plano; Vite solo procesa `type="module"` o imports reales. Index/maestros/admin ya lo cargaban bien vía `main.js`/`main-maestros.js` (se sacó el tag duplicado); el resto de portales se les agregó `type="module"`.
- **`AppModal.updateBody()` faltante**: `rutaSelectorModal.js` lo llamaba pero nunca existía en esta rama (existía huérfano en `feature/acm-responsive-standardization-pr1`, commit `b512151`, nunca mergeado). Se portó. De paso, el `catch` de `AppModal.onSave` ya no traga errores en silencio — muestra un toast con `AppToast`.
- **FK rota `permisos_maestros.concedido_por` / `solicitudes_permisos.aprobado_por`**: apuntaban a `maestros(id)`, pero ambos campos siempre los llena un admin (el trigger de integridad fuerza NULL/OLD en cualquier escritura no-admin). Repunteadas a `auth.users(id)`.
- **Alta de maestro desde ACM rota**: usaba `supabase.auth.signUp()` del lado cliente — secuestraba la sesión del coordinador (signUp devuelve sesión porque el email queda auto-confirmado) y disparaba el auth hook de envío de email, que fallaba con "Edge Function returned a non-2xx status code". `/admin` ya tenía la solución correcta desplegada en producción (Edge Function `create-user`, `admin.createUser()` con service role) pero nunca se había subido al repo ni la usaba ACM. Se trajo al repo (`supabase/functions/create-user/index.ts`), se le agregó vinculación explícita a `maestros` (no depender solo del trigger DB), y ACM ahora la usa vía `maestrosApi.crearMaestroConAuth`.
- **`validarEmail()` en ACM bloqueaba el caso real de uso**: un maestro cargado antes en ACM (con clases ya asignadas) pero sin credenciales todavía se detectaba como "email ya registrado". Ahora solo bloquea si el maestro ya tiene `user_id`.
- **Botón "Dar acceso"** agregado en el perfil de un maestro sin credenciales (`maestrosView.js` + `maestrosApi.js`): vincula por `maestroId` explícito en vez de por email — evita crear una ficha duplicada cuando el email de login no coincide con el que ACM tiene cargado (pasó en pruebas reales: "Francisco Domínguez" con correo institucional en ACM vs. email personal al loguearse).
- **3 bugs de vinculación de cuenta en login** (`maestroAuth.js`), confirmados con logs reales de `postgres_logs`:
  - Buscaba maestro por `.or('correo.eq.X,email.eq.X')` — la tabla `maestros` no tiene columna `email`, solo `correo`. Rompía la vinculación por correo del caso anterior.
  - Leía `profiles.resena`, columna inexistente en `profiles`.
  - El insert de "último recurso" no incluía `especialidad` (NOT NULL sin default) y no revisaba el error de Supabase — siempre caía en el mensaje genérico "No se pudo vincular tu cuenta".
- **Router roto en planificación**: 5 vistas (`DisenadorCurricularView`, `RutaPedagogicaView`, `MapaClaseView`, `AcmAprobacionView`, `portal-maestros/views/planificacionView.js`) importaban `core/router/router.js` (navega sobre `#app`) en vez de usar `window.router` — dentro del portal de maestros (`#portal-app`, sin `#app`) los botones no hacían nada, sin error visible. Corregido: todas resuelven `window.router` en runtime.
- **Calendario del portal de maestros crasheaba** (`Cannot read properties of undefined (reading 'get')`) para cualquier maestro sin clases asignadas: `_calcularEstadoMes` en `calendarioView.js` retornaba `new Map()` en el caso de "0 clases" en vez de `{ estadoMap, dotsMap }` — el caller destructuraba ambas claves de un `Map` (siempre `undefined`).
- **Fuga de datos entre cuentas en el portal de maestros**: `logoutPortal()`/`loginMaestro()` nunca invalidaban `viewCache` (cache en memoria, sobrevive a un logout sin recarga completa de página). Si en la misma pestaña se probaban varias cuentas seguidas, clases/horarios de la cuenta anterior podían quedar servidos bajo la sesión nueva. Reportado en vivo como "a un maestro de Cello le aparecen clases de Violín de otro maestro". Se invalida el cache en cada login/logout.

### Feature nueva en curso: catálogo propio de planificación (Nivel → Objetivo General → Objetivo Específico)

El usuario pidió que el maestro pueda armar una "ruta de contenido" por clase con jerarquía Nivel→Objetivo General→Objetivo Específico (indicadores), con auto-completado del objetivo general cuando sus indicadores hijos están bien calificados. Investigación confirmó que **el backend de esto ya existía y funcionaba** (`clase_mapa_objetivos`/`clase_mapa_indicadores`, vista `vw_clase_objetivo_estrellas` con la lógica exacta de auto-completado) — lo que faltaba era el catálogo de origen y conectar la UI.

Había un catálogo global preexistente (`routes`→`route_versions`→`levels`→`nodes`→`objetivos`→`indicators`, 480 objetivos / 4163 indicators, pero **solo para Violín**, nada de Cello) — se decidió **no tocarlo** porque lo usan 50+ archivos de otros módulos y `clases.route_version_id` es FK directa desde la tabla core `clases`. En su lugar se construyó un catálogo nuevo e independiente:

- Migraciones `20260803000001_catalogo_propio_mapa_gamificado.sql` + `20260803000002_catalogo_fix_security_advisors.sql`: tablas `catalogo_niveles` / `catalogo_objetivos_generales` / `catalogo_objetivos_especificos` (scoped por `catalogo_niveles.instrumento`), RPC `clonar_catalogo_a_clase`, y se eliminó el trigger `trg_validar_nivel_asignado_a_clase` que exigía una fila activa en `acm_active_routes` (tabla con 0 filas en producción — bloqueaba el 100% de los inserts en `clase_mapa_objetivos` para cualquiera, independientemente del catálogo).
- `mapaClaseService.js`: `obtenerNivelesAsignadosClase` ahora resuelve por `clases.instrumento` contra `catalogo_niveles` (mismo nombre/forma de retorno — `objetivoEditorModal.js`/`MapaClaseView.js` no necesitaron cambios). Nuevas funciones: `obtenerCatalogoNiveles`, `crearNivelCatalogo`, `obtenerObjetivosGeneralesCatalogo`, `crearObjetivoGeneralCatalogo`, `obtenerObjetivosEspecificosCatalogo`, `crearObjetivoEspecificoCatalogo`, `clonarCatalogoAClase`.
- `DisenadorCurricularView.js`: "Clonar desde plantilla" pasa a ser "Clonar desde catálogo" (ya no depende de `mapa_plantillas`). De paso se corrigió un bug pendiente de una auditoría anterior: el flujo "Generar con IA" no calculaba `orden_objetivo` (NOT NULL sin default) al crear objetivos — el insert fallaba siempre contra la base real (invisible en tests porque mockean el service).

**Bloqueante inmediato para la demo: el catálogo nuevo está vacío (0 filas).** Sin una pantalla de curación, ACM no tiene forma de cargar Niveles/Objetivos Generales/Objetivos Específicos, y sin contenido no hay nada que clonar ni mostrar.

### Pendiente (orden sugerido)

1. **Pantalla de curación del catálogo** (ACM) — bloqueante, sin esto no hay nada que demostrar.
2. Árbol visual expandible Nivel→Objetivo→Indicador (hoy el CRUD funciona pero es plano, se edita en un modal).
3. Vista de solo lectura maestro↔alumno↔contenido (decisión tomada: reusar `MapaClaseView` con un modo "Ver progreso" en vez de duplicar vista).
4. Botón "Continuar" real en `asistenciaView.js` → seleccionar objetivos trabajados → calificar con estrellas reusando los alumnos presentes ya resueltos (hoy son 2 pantallas separadas con navegación manual).
5. "Sugerir con IA" por objetivo puntual dentro de `objetivoEditorModal.js` (hoy `sugerirRutaDidacticaIA` solo genera un nivel completo de una).

## Documentos de Referencia
- Spec de Diseño: `docs/superpowers/specs/2026-05-04-portal-maestros-design.md`
- Plan de Ejecución F1: `docs/superpowers/plans/2026-05-05-portal-maestros-f1.md`
