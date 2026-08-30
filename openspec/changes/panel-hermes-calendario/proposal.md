# Proposal: Panel Hermes Proactivo — Calendario Institucional

## Intent

El portal Calendario (`localhost:5173/calendario`) hoy no refleja nada de lo que Hermes/Telegram ya procesa: cero visibilidad sobre `hermes_process_cases`. Una auditoría técnica externa comparó lo que el prototipo esperaba de "HERMES" (motor asíncrono con `hermes_jobs`, niveles AUTO/PROPOSAL/HUMAN_REQUIRED, cola con reintentos) contra el esquema real de Supabase: `hermes_jobs` **no existe**; `trg_hermes_event_inserted` y `fn_hermes_auto_delegar_tareas()` **sí existen**. El modelo real es gobernanza híbrida manual-primero ("la máquina propone, el líder decide"), con Telegram como punto de entrada operativo y 7 agentes de dominio (AGT-DIR, AGT-ACM, AGT-FIN, AGT-OPR, AGT-ATN, AGT-COM, AGT-FOLDER) que escalan por `owner_department`.

**Hallazgo clave de esta sesión (verificado por query directa a Supabase, proyecto `zmhmdvmyeyswunurcyow`):** el reparto anticipado de tareas por evento **ya funciona** en producción vía `fn_hermes_auto_delegar_tareas()` (trigger AFTER INSERT en `calendario_institucional`): al insertar un evento, busca en `hermes_protocolos` un protocolo activo cuya `categoria_evento` coincida, itera `tareas_plantilla` (jsonb) y crea filas en `tareas_institucionales` con `fecha_vencimiento = fecha_inicio::date + (diferencia_dias || ' days')::interval` — `diferencia_dias` puede ser negativo, generando verdadera anticipación (ej. tareas a -45, -30, -15, -7, -1 días de un evento). **No hace falta un nuevo motor de ejecución**; el gap real es que nada lo *muestra* ni *vigila*.

Este cambio amplía el panel original (solo `hermes_process_cases`) a un **Motor de Anticipación Institucional**: visibilidad cruzada calendario+tareas+casos, y monitoreo proactivo que alerta vencimientos sin ejecutar nada por sí solo.

## Scope

### In Scope

**A. Panel de casos (alcance original, sin cambios)**
- Vista de solo-lectura de `hermes_process_cases` (todos los roles ven todos los casos)
- Aprobar/rechazar un caso, scoped por `owner_department`, autorizado server-side (RLS/RPC)
- `automationLevel` (si existe en `orchestration/`) redefinido como metadato de política, no de ejecución

**B. Visibilidad cruzada (nuevo)**
- Vista temporal única que cruza `calendario_institucional` + `tareas_institucionales` + `hermes_process_cases`: para cada evento próximo, mostrar el pipeline de tareas generadas por `fn_hermes_auto_delegar_tareas()`, agrupadas por `departamento` y ordenadas por `fecha_vencimiento`
- Responde "qué se acerca, qué se le pidió a cada depto, qué está pendiente/vencido"

**C. Monitoreo proactivo de vencimientos (nuevo)**
- Función/cron NUEVO (mismo patrón que `analyze-risk.js` para riesgo académico) que escanea `tareas_institucionales` con `fecha_vencimiento` en ventana [hoy, hoy+N días] y `estado != 'completado'`
- Al detectar riesgo de vencimiento, **crea/actualiza un `hermes_process_case`** (o notificación) escalando al `owner_department` correspondiente
- Es automatización nueva, pero sigue "la máquina propone": genera el caso/alerta, **no** cambia estados de tareas ni ejecuta acciones fuera del sistema

**D. Asistencia de contenido — exploración futura, NO comprometida en este change**
- A explorar en fase de diseño: para tareas de tipo "comunicación", generar un borrador (copy de flyer, guión de mensaje) guardado como propuesta (en `metadata` de la tarea o un `hermes_process_case`)
- Requiere aprobación humana explícita **antes** de publicar o enviar — restricción dura, no negociable
- No se define implementación en esta propuesta; queda como candidato de fase posterior del mismo change o de un change hijo

### Out of Scope
- Tabla `hermes_jobs`, cola, reintentos, o niveles AUTO/PROPOSAL/HUMAN_REQUIRED como ejecución
- Reemplazar Telegram como punto de entrada operativo
- **Automatización de Instagram (autoresponder) y WhatsApp (flujo conversacional hasta agendar cita)**: fuera de alcance explícito de este change. Corresponde a Fase 2/3 del roadmap de la auditoría técnica ("Fase 2 — Cron autónomo: en desarrollo", "Fase 3 — Integración SOI completa: pendiente"). Ningún autoenvío de primer contacto no solicitado ni autopublicación sin aprobación humana, en ningún caso
- Edición de campos de `hermes_process_cases` fuera de status (approve/reject)
- Implementación de generación de contenido (punto D) — solo exploración en design

## Capabilities

### New Capabilities
- `hermes-panel-calendario`: vista de casos + acciones approve/reject scoped por departamento (alcance original)
- `hermes-vista-anticipacion`: vista cruzada calendario + tareas_institucionales + casos, agrupada por departamento/vencimiento
- `hermes-monitoreo-vencimientos`: función/cron que escanea tareas próximas a vencer y escala como caso/alerta

### Modified Capabilities
- Ninguna existente a nivel de spec (todo es capability nueva o UI); `fn_hermes_auto_delegar_tareas()` no se modifica

## Approach

Nueva vista/ruta en el dominio Calendario que consulta `hermes_process_cases`, `calendario_institucional` y `tareas_institucionales` vía el DataAdapter pattern existente. Autorización approve/reject server-side (RLS/RPC) sin cambios respecto al alcance original. El monitoreo de vencimientos (C) es una función Supabase (Edge Function o cron SQL) de solo lectura sobre `tareas_institucionales` que produce escritura acotada (crear/actualizar un caso), sin loops de reintento ni cola.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/domains/calendario/` | New | Panel Hermes: casos + vista de anticipación cruzada |
| `src/domains/orchestration/` | Modified | `automationLevel` como metadato de política |
| Supabase RLS/RPC sobre `hermes_process_cases` | New | Autorización approve/reject por `owner_department` |
| Supabase función/cron nueva | New | Escaneo de `tareas_institucionales` próximas a vencer → escalamiento a caso |
| Vault `.hermes/`, `00_SISTEMA_MAESTRO/` | Read-only (a definir) | Lectura opcional de Task Contracts YAML |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Reintroducir semántica de "motor autónomo" por accidente vía UI/naming | Med | Nombrar componentes "vista"/"panel"/"alerta", nunca "engine"/"queue"; revisar en design |
| **Monitoreo proactivo (C) confundido con ejecución autónoma** | Med-High | Documentar explícitamente en design y en la UI que la función SOLO crea/actualiza el caso de alerta — nunca cambia `estado` de la tarea, nunca contacta a nadie, nunca publica nada. El humano decide y ejecuta la acción real |
| Scoping por `owner_department` mal implementado permite cross-domain approve | Med | RLS/RPC server-side, no solo ocultar botón en UI; test de autorización obligatorio |
| Asistencia de contenido (D) se implementa apresuradamente sin gate de aprobación | Med | D queda explícitamente fuera de implementación de este change; requiere su propio diseño y aprobación humana dura antes de cualquier build |
| Lectura de Task Contracts del vault añade complejidad de I/O fuera de Supabase | Low | Evaluar viabilidad en design; puede diferirse a fase 2 |

## Rollback Plan

Feature flag o remover la ruta/componente del router de Calendario. Sin migraciones destructivas: la función de monitoreo de vencimientos (C) es reversible (drop function/cron); no borra ni corrompe `tareas_institucionales` ni `calendario_institucional`, solo lee y crea/actualiza casos.

## Dependencies

- Esquema real: `hermes_process_cases`, `calendario_institucional`, `hermes_protocolos`, `tareas_institucionales` (Supabase, proyecto `zmhmdvmyeyswunurcyow`)
- `fn_hermes_auto_delegar_tareas()` y `trg_hermes_event_inserted` (ya existentes, no se modifican)
- Sistema de auth/roles existente del portal (usuario → `owner_department`)
- Patrón de referencia: `analyze-risk.js` (monitoreo académico existente) para el diseño del cron de vencimientos

## Success Criteria

- [ ] Todos los roles ven todos los casos de `hermes_process_cases` en el panel Calendario
- [ ] Solo el `owner_department` correspondiente puede aprobar/rechazar un caso (verificado server-side)
- [ ] La vista de anticipación muestra, por evento próximo, las tareas de `tareas_institucionales` agrupadas por departamento y ordenadas por vencimiento
- [ ] La función de monitoreo detecta tareas por vencer y crea/actualiza un caso de escalamiento, sin ejecutar ninguna acción externa
- [ ] No existe tabla `hermes_jobs` ni cola/reintentos en el cambio
- [ ] La asistencia de contenido (D) no tiene código de implementación en este change — solo queda documentada como exploración futura con gate de aprobación humana
- [ ] Ninguna automatización de Instagram/WhatsApp incluida en este change
