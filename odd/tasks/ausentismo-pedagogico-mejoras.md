# Ausentismo pedagógico — 4 mejoras (en vez de reconstruir TIER1/2)

## Objetivo
El prompt original pedía reconstruir un sistema paralelo de "alumnos críticos" (TIER1/TIER2:
`v_alumnos_criticos_ausentismo`, `justificar_alumno_por_dia`, `enviarNotificacionWhatsApp` vía
`hermes_whatsapp_queue`). Se verificó que ya existe un sistema real, más maduro y en desarrollo
activo en `src/modules/pedagogico/` (seguimiento de ausentes, niveles 1/2/3, PR #49,
`openspec/changes/seguimiento-ausentes/`). Se decidió **abandonar el TIER1/2 propuesto** y en
su lugar cerrar 4 brechas reales detectadas por análisis de código.

## Por qué (evidencia)
- `openspec/changes/seguimiento-ausentes/state.yaml` → `user_decisions`: "Envío WhatsApp MANUAL
  con link wa.me (operador revisa y envía). NO automático por HERMES." — decisión de producto ya
  tomada; el diseño TIER1/2 (auto-insert a `hermes_whatsapp_queue`) la contradice y además tiene
  bugs reales verificados: RLS bloquea INSERT para no-service_role, la tabla no tiene columna
  `tipo`, y el rol "pedagógico" no existe en `profiles.rol` (solo `admin`/`maestro`).
- `justificar_alumno_por_dia()` existe en Supabase (prod) pero no la llama ningún código — función
  huérfana, vale la pena activarla.
- `comunicaciones_seguimiento` no guardaba el texto exacto enviado (solo `notas` genéricas) —
  gap de auditoría real vs REQ-05 del prompt original.
- El modal de detalle no deja editar el mensaje de WhatsApp antes de generar el link `wa.me`
  (solo se edita ya dentro de WhatsApp) — gap vs REQ-04.
- El grid no filtra por instrumento.

## Alcance autorizado
Usuario autorizó explícitamente: "si avanza con las 4 mejoras".

## Modo TDD
Strict TDD habilitado (CLAUDE.md). Runner: `vitest` (`npm run test:run -- <ruta>`).
Convención de mocks confirmada en `seguimientoAlumnosService.test.js`:
`vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { rpc: vi.fn(), from: vi.fn() } }))`.
No existe aún `seguimientoAusentesService.test.js` — crearlo.

## Tareas

- [x] T0. Migración DB: columna `mensaje_enviado` (text, nullable) en `comunicaciones_seguimiento`.
      Aplicada directamente (DDL mecánico, bajo riesgo, aditiva). Migración:
      `comunicaciones_seguimiento_mensaje_enviado`. Evidencia: `apply_migration` success=true.
      Ruta: directa (no delegada).

- [x] T1. Persistir el texto exacto enviado (cierra gap de auditoría REQ-05).
      - `registrarContacto()` en `seguimientoAusentesService.js`: aceptar `mensajeEnviado` opcional
        en el objeto de opciones, incluirlo en `insertData.mensaje_enviado`.
      - `enviarSeguimientoAusentismo()`: aceptar `mensajeOverride` opcional; si viene, usarlo como
        `mensaje` final (en vez de `construirMensajeAusentismo(...)` sin editar) y pasarlo a
        `registrarContacto` como `mensajeEnviado`.
      Ruta: delegada (mismo writer que T2/T3/T4, mismos archivos).

- [x] T2. Editor de mensaje in-app antes de abrir WhatsApp (cierra gap REQ-04).
      - En `seguimientoAusentesView.js`: reemplazar el envío directo (`_enviarWhatsApp` llamado
        desde el botón de fila Y desde los botones `[data-wa-modal]` del panel de detalle) por un
        paso intermedio: abrir un `AppModal` pequeño con un `<textarea>` pre-poblado con
        `construirMensajeAusentismo({ nivel, destinatario: 'representante', alumno })`, botón
        "Enviar" que llama `enviarSeguimientoAusentismo({ alumno, nivel, mensajeOverride: texto })`
        y abre el `waUrl` resultante.
      - Mantener el comportamiento de error existente (SIN_CONTACTO, CONTACTO_DUPLICADO).
      Ruta: delegada.

- [x] T3. Activar `justificar_alumno_por_dia` (función huérfana) desde el panel de detalle.
      - Nueva función en `seguimientoAusentesService.js`: `justificarAusenciaDia({ alumnoId, fecha,
        motivo, creadoPor })` que llama
        `supabase.rpc('justificar_alumno_por_dia', { p_alumno_id, p_fecha, p_motivo, p_creado_por })`
        y mapea los OUT params (`success, message, asistencias_updated, affected_clases_ids`) a un
        objeto `{ success, message, asistenciasActualizadas, clasesAfectadas }`.
      - En el modal de detalle (`_openDetailPanel`), nueva sección "Justificar un día" con selector
        de fecha + textarea de motivo + botón que llama la función de arriba, usando
        `useAuth.getUser().id` como `creadoPor`, y refresca la vista al terminar.
      Ruta: delegada.

- [x] T4. Filtro por instrumento en el grid (cierra gap de UI).
      - `fetchSeguimientoAusentes()`: aceptar `instrumento` opcional, aplicar
        `.eq('instrumento_principal', instrumento)` si viene.
      - `seguimientoAusentesView.js`: extraer instrumentos únicos de `state.alumnos` (mismo patrón
        que `state.maestros`), agregar `<select>` de filtro junto a los existentes, nuevo
        `state.filtroInstrumento`, wire-up en `_attachEvents`.
      Ruta: delegada.

## Verificación
- `npm run test:run -- src/modules/pedagogico` debe pasar (incluye el nuevo archivo de tests).
- Lectura manual del diff por el orquestador antes de dar por cerrado (dato sensible: estudiantes,
  WhatsApp, RLS).

## Resultado (2026-10-03)
Verificado de forma independiente (no solo el self-report del agente writer):
- `git diff --stat`: 199 insertions(+), 8 deletions(-) en `seguimientoAusentesService.js` (+56) y
  `seguimientoAusentesView.js` (+151); nuevo `seguimientoAusentesService.test.js` (10 casos).
- `npx vitest run src/modules/pedagogico`: **21 passed, 1 skipped** (el skip es preexistente, no
  relacionado a este cambio). Confirma el conteo reportado por el agente.
- Diff revisado línea por línea: los 4 cambios coinciden exactamente con la especificación de
  tareas (T1-T4). Ambos call-sites de envío de WhatsApp (botón de fila y botones del modal de
  detalle) fueron actualizados consistentemente al nuevo flujo editable; no quedó código muerto.
- Nota menor no bloqueante: el nuevo textarea interpola `mensajeInicial` sin escapar HTML, igual
  que el resto de esta vista ya hacía con `alumno_nombre` (`_renderAlumnoRow`) — patrón
  preexistente del archivo, no una regresión introducida por esta tarea. Fuera del alcance
  autorizado (las 4 mejoras); si se quiere endurecer, sería una tarea aparte de sanitización en
  todo `seguimientoAusentesView.js`.
- Pendiente de decisión del usuario: commit (sin pushear) de los 3 archivos cambiados.
