# Exploration: whatsapp-gateway-multidepto

Convertir el módulo WhatsApp de instancia única a un sistema **multi departamento, instalado en escritorio (Electron), con horario laboral y solo salida**. Cada departamento (ADM y FIN primero, luego LOG/COM/LUT) tiene su propio número, su propia app Electron en la PC del depto, y solo despacha los mensajes de su departamento.

## 0. Recomendaciones en una línea

| Tema | Recomendación |
|------|---------------|
| 1. Modelo de datos multi depto | **Enfoque A**: columna `departamento` + `origen` en `hermes_whatsapp_queue`; `hermes_whatsapp_config` pasa a fila-por-depto; `fn_whatsapp_reclamar_pendientes(p_departamento, p_limite)` |
| 2. Auth de la app Electron | **Device token + Edge Function** `whatsapp-gateway` (claim / report / heartbeat). El service_role vive solo en la Edge Function. Token en `safeStorage` de Electron |
| 3. Shell Electron | Main process corre la lib Baileys extraída; tray + auto-launch + single-instance (OS lock + lock cruzado vía heartbeat); ventana QR; config de depto en primer arranque; `electron-updater` |
| 4. Horario 10:00-19:00 | Columnas `ventana_inicio` / `ventana_fin` por fila de config; se valida en la claim fn y se re-valida como gate de polling en Electron |
| 5. Envío manual | Módulo nuevo `src/modules/whatsapp-envios/` (patrón DataAdapter), reutilizado como panel en ADM y FIN. Encola vía `fn_whatsapp_encolar_manual(p_departamento, ...)` |
| 6. Ruteo de productores | Cada punto de inserción (R6/R7/R8, campañas, cobranza FIN) etiqueta `departamento` + `origen` al encolar |
| 7. Portales | Panel en `src/portales/adm/adm.js` (nav group nuevo) y panel React en `src/portales/fin/`, cada uno filtrado a su depto |
| 8. Drop de inbound | Se pierde opt-out automático ("BAJA"), justificaciones por WhatsApp, reagendado de citas y FAQ pública. Mantener webhook mínimo **solo opt-out** (~40 líneas) + footer "responda BAJA" en plantillas |
| 9. Riesgo de migración | Backfill `departamento` en cola existente, convertir la fila `soi-main` en `departamento='ADM'`, índice único parcial `(departamento) WHERE activo`, overload compatible de la claim fn |
| 10. Esfuerzo total | ~9 unidades de trabajo, 9 fases. ADM primero, FIN después |

**Listo para propuesta: SÍ** (con 7 decisiones abiertas que la propuesta debe cerrar).

## 1. Estado actual (verificado en código)

### 1.1 Transporte: implementaciones divergentes

| Impl | Archivo | Técnica | Estado | Credencial |
|------|---------|---------|--------|-----------|
| Baileys runner (proceso vivo) | `scripts/whatsapp-runner/index.js` (245 líneas) | `@whiskeysockets/baileys` ^6.7.13, sondeo cada 6s a `fn_whatsapp_reclamar_pendientes`, espera ACK real del servidor (`messages.update` status >= 2) | No desplegado como servicio; se corre a mano | **service_role** (o anon) directo |
| Edge dispatcher | `supabase/functions/whatsapp-dispatcher/index.ts` | REST a Evolution API v2 `POST /message/sendText/<instance>`, jitter anti-ban, heartbeat | No agendado (sin cron) | service_role (Edge secret) |
| Outbox one-shot | `supabase/process-whatsapp-queue.js` | REST a `gateway_url/message/sendText`, aplica `whatsappSecurityGuard.js` | Script suelto, sin cron | service_role |
| Infra Docker | `docker/whatsapp-gateway/` | Imagen `atendai/evolution-api:v2.1.2` | Definida, no corriendo | `EVOLUTION_API_KEY` |

Decisión ya tomada: consolidar sobre el Baileys runner envuelto en Electron. Evolution API y el dispatcher REST quedan deprecados. `src/modules/hermes/api/whatsappSecurityGuard.js` (`clampMessageText`, `shouldBlockSensitiveMessage`, `estimateTokenBudget`, `detectPromptInjection`) es lógica reutilizable para la lib compartida.

### 1.2 Cola: `hermes_whatsapp_queue`
- Columnas: `id, jid, mensaje, estado, intentos, error_msg, created_at, procesado_at, campania_envio_id` (FK -> `campania_envios(id) ON DELETE SET NULL`).
- **No hay columna `departamento`.**
- `estado` CHECK actual (`20260820000000_r6_requiere_aprobacion.sql`): `pendiente | pendiente_aprobacion | procesando | enviado | fallido | cancelado`.
- RLS endurecido en `20260820020000_close_open_rls_gaps.sql`: `SELECT` a `authenticated`; `ALL` a `service_role`; `INSERT/UPDATE/DELETE` **revocados** a `authenticated`. Escritura in-app solo por RPC SECURITY DEFINER o service_role.
- La legacy `20260623_hermes_whatsapp_integration.sql` con `FOR ALL USING(true)` **ya fue superada** por `20260820020000`.

### 1.3 Claim fn: `fn_whatsapp_reclamar_pendientes(p_limite integer)`
`20260819110000_whatsapp_outbox_policy_gate.sql`. SECURITY DEFINER, `GRANT EXECUTE ... TO service_role` únicamente. Reglas, **todas globales**: config activa (`WHERE activo = true LIMIT 1`), kill switch (`system_config.whatsapp_ingest_enabled`), quiet hours (`system_config.whatsapp_quiet_hours_start/end` 20:00-08:00), cap diario warm-up (`fn_whatsapp_cap_hoy()`), enviados hoy (`fn_whatsapp_enviados_hoy()`), cap horario, opt-out (`whatsapp_optout` PK jid), consentimiento campaña (`whatsapp_consentimientos`), 1 msg/jid/24h, `FOR UPDATE OF q SKIP LOCKED`, `intentos < 3`. Solo devuelve `estado='pendiente'`.

### 1.4 Config y salud
- `hermes_whatsapp_config`: **asume una sola fila activa** (`WHERE activo = true LIMIT 1` en claim fn, `fn_whatsapp_cap_hoy`, dispatcher, `process-whatsapp-queue.js`, `gatewayApi.js`). Columnas: `gateway_url, api_key, instance_name` (default `'soi-main'`), `numero_wid, numero_nombre, cap_diario, cap_horario, jitter_min/max_seg, batch_size, batch_cooldown_seg, warmup_inicio, warmup_dias, warmup_desde, consentimiento_registrado, activo`.
- `hermes_gateway_health`: keyed por `instance_name` UNIQUE. RPCs `fn_hermes_gateway_heartbeat(p_instance_name, p_status, p_phone, p_battery, p_qr, p_metadata)` y `fn_hermes_gateway_get_live_status(p_instance_name)` (frescura 60s). Migración `20260812000006`.
- `instance_name` ya existe: semilla natural de "una instancia por departamento".

### 1.5 Productores (quién encola)

| Productor | Archivo | Cómo encola | Depto real |
|-----------|---------|-------------|------------|
| R6 ausencias -> padres | `supabase/functions/event-spine-logger/handlers/r6-whatsapp-padres.ts` | `INSERT` directo (service_role), `estado` = `pendiente_aprobacion` / `pendiente`; task de aprobación en `tareas_institucionales` (ACM) | regla `hermes_reactive_rules` `departamento='ACM'` |
| R7 cumplimiento maestros | `.../r7-whatsapp-maestros.ts` | `INSERT` directo | ACM (casi siempre skip) |
| R8 tareas vencidas | `.../r8-whatsapp-tareas.ts` | `INSERT` directo, ya recibe `departamento` como parámetro; task a `DIR` | DIR/param |
| Campañas inscripción/reinscripción | `fn_encolar_campania(p_campania_id, p_limite)`, UI `src/modules/campanias/` | RPC admin -> `INSERT ... campania_envio_id`. `campanias_periodo` **no tiene columna depto** | ADM (admisiones) |
| Cobranza / mora FIN | `src/portales/fin/src/components/WhatsAppReminderModal.tsx`, `hooks/useWhatsAppReminders.ts` | **NO usa la cola.** Abre `https://wa.me/<num>?text=...` (deep link manual). Cooldown en `localStorage` | FIN |
| Webhook (respuestas auto) | `supabase/functions/whatsapp-webhook/index.ts` | `INSERT` directo (service_role) | ADM/ACM |
| Cron R6/R7/R8 | `20260821000000_fix_event_spine_cron_and_permissions.sql` | `*/10 7-21 * * 1-5` | - |

**Hallazgo clave:** la cobranza FIN hoy **no está integrada** con `hermes_whatsapp_queue` (deep link `wa.me` desde el navegador). Integrarla es trabajo neto nuevo.
**Hallazgo clave 2:** los productores automáticos (R6/R7) son de dominio **académico (ACM)**, no ADM ni FIN. Hay que decidir a qué número salen.

### 1.6 UI administrativa
- `src/modules/gateway-config/`: KPIs, pill de heartbeat, consola de prueba **falsa** (`enviarMensajePrueba` inserta fila ya en `estado:'enviado'`), formulario de política, visor de outbox.
- Ruta `gateway-config` en `src/portales/_shared/allRegistrars.js:66` y `src/main.js` (monolito legacy). **No** en `src/portales/adm/adm.js`.
- `src/modules/comunicaciones/`: boletines / secciones / calendario. No toca WhatsApp.
- Portal ADM (`src/portales/adm/adm.js`): vanilla JS, `bootAdminPortal({ navGroups, hermesDept: 'ADM' })`.
- Portal FIN (`src/portales/fin/`): **stack distinto** (React + TS, infra Supabase propia).

### 1.7 Inbound (lo que se quiere descartar)
`whatsapp-webhook/index.ts` (711 líneas): auth por `x-webhook-secret`; kill switch; **opt-out** `esOptOut(texto)` (`BAJA/STOP/CANCELAR/SALIR/...`) -> `fn_whatsapp_optout(jid)`; rate-limit por jid; reconocimiento de representante -> Groq intent -> `justificaciones` + `soi_eventos` + task ACM; reconocimiento de postulante -> state machine de agendado; servicio público FAQ (`kb.ts`) + lead en `applicants`. El runner ya forwardea `messages.upsert` al webhook.

## 2. Áreas afectadas

**DB (migraciones nuevas):** `hermes_whatsapp_queue` (+`departamento`, +`origen`, índices); `hermes_whatsapp_config` (+`departamento`, +`ventana_inicio/fin`, índice único parcial, fila FIN); `fn_whatsapp_reclamar_pendientes` (nueva firma con `p_departamento`); `fn_whatsapp_cap_hoy`/`fn_whatsapp_enviados_hoy`/conteo horario (parametrizar); `fn_encolar_campania` (propagar depto); tabla nueva `whatsapp_gateway_devices`; `fn_whatsapp_encolar_manual` (nueva); `hermes_gateway_health` (`instance_name` -> `<depto>-gateway`).

**Edge Functions:** nueva `whatsapp-gateway` (claim/report/heartbeat); deprecar `whatsapp-dispatcher`; reducir `whatsapp-webhook` a solo opt-out o flag.

**Frontend/apps:** extraer `scripts/whatsapp-runner/index.js` -> `src/services/whatsapp-runner/` (tests bajo `tests/`); app Electron nueva (`apps/whatsapp-desktop/`); `src/modules/whatsapp-envios/` nuevo; `src/portales/adm/adm.js` (nav + ruta); panel React FIN; `src/modules/gateway-config/` (depto-aware o absorber); `WhatsAppReminderModal.tsx` (reemplazar `wa.me`); `src/modules/campanias/` (pasar `departamento`).

## 3. Punto 1 — Modelo de datos multi departamento

**Enfoque A: columna `departamento` + config multi fila (RECOMENDADO)**
- `hermes_whatsapp_queue.departamento text` (nullable -> backfill -> `NOT NULL DEFAULT 'ADM'`).
- `hermes_whatsapp_config.departamento text` + `CREATE UNIQUE INDEX uq_wa_config_depto_activa ON hermes_whatsapp_config (departamento) WHERE activo`.
- `fn_whatsapp_reclamar_pendientes(p_departamento text, p_limite int)` filtra `q.departamento` y lee la config de ese depto; caps y ventana por depto.
- La fila de config **es** el registro de instancias (ya tiene `instance_name`, `numero_wid`, warm-up).
- Pros: cambio mínimo, cola única (reporting simple), FK `campania_envio_id` intacta, RLS ya sirve, backfill trivial, "agregar LOG" = 1 INSERT de config.
- Cons: auditar ~6 call sites que asumen "fila única"; conteos globales pasan a `WHERE departamento = ...`.
- Esfuerzo: **Medio**.

**Enfoque B: tabla de cola por depto** — aislamiento físico total, pero N tablas, N triggers, reporting `UNION ALL`. Mata la extensibilidad. **Rechazado.**

**Enfoque C: tabla `gateway_instances` + `queue.instance_id FK`** — más "limpio", permite >1 número por depto a futuro, pero sobre-ingeniería para 1 número/depto. **Rechazado.**

**Recomendación: Enfoque A.**

## 4. Punto 2 — Auth de la app Electron (sin service_role)

Requisito duro: el binario distribuido no puede contener el service_role key.

**Opción 1: Device token + Edge Function delgada (RECOMENDADO)**
- Tabla `whatsapp_gateway_devices(id, departamento, token_hash, nombre_equipo, activo, created_at, last_seen_at, revoked_at)`.
- Edge Function `whatsapp-gateway` (service_role como secret de la función): `POST /claim {device_token}` -> valida hash + `activo` -> `fn_whatsapp_reclamar_pendientes(departamento, limite)`; `POST /report {device_token, results}` -> update de la cola; `POST /heartbeat` -> `fn_hermes_gateway_heartbeat`.
- Token generado en el portal al provisionar el equipo, guardado con `safeStorage.encryptString` (DPAPI Windows / Keychain mac).
- Pros: cero credencial DB en el device; revocación instantánea; scope de depto server-side; único lugar con service_role; rotación; audit vía `last_seen_at`.
- Cons: punto único de falla nuevo en el camino crítico; latencia extra; hay que construir el provisioning en el portal.
- Esfuerzo: **Medio**.

**Opción 2: rol de DB de baja prioridad + RLS** — igual hay credencial en el binario; rotar password en N equipos es frágil. **Rechazado.**

**Opción 3: anon key + RLS por claim firmado (JWT)** — emitir/rotar JWTs de larga duración para un no-usuario; reescribir el modelo de permisos de la claim fn; el anon key igual queda en el binario. **Rechazado.**

**Recomendación: Opción 1.** Mitigar el punto de falla con reintentos/backoff en la app y modo degradado visible en el tray.

## 5. Punto 3 — Shell Electron mínimo viable

**No existe nada de Electron en el repo hoy.**

**Lib reutilizable** — `scripts/whatsapp-runner/index.js` -> `src/services/whatsapp-runner/` (Vitest, tests bajo `tests/` porque `scripts/**` no está en el `include` de Vitest):

| Pieza | Origen | Nota |
|-------|--------|------|
| `createSocket()` / `connection.update` / reconexión | runner L65-126 | sin cambios de fondo |
| `esperarConfirmacionServidor()` (ACK real status >= 2) | runner L48-63 | mantener |
| `dispatchLoop()` (claim -> send -> report) | runner L176-232 | claim/report pasa a ir por la Edge Function |
| Guard de contenido | `whatsappSecurityGuard.js` | importar tal cual |
| Auth de sesión Baileys | `useMultiFileAuthState` | en Electron -> `app.getPath('userData')/baileys_auth` |
| Forward de inbound | runner L132-168 | recortar a solo opt-out o quitar |

**Shell mínimo (MVP):** tray + auto-launch (`app.setLoginItemSettings`) + single-instance OS (`app.requestSingleInstanceLock`) + single-instance cross-machine (vía `fn_hermes_gateway_get_live_status`) + ventana de QR + config de depto primer arranque + gate de horario + `electron-updater` + `electron-log`. Firma de código Windows: recomendada, diferible a v1.1.

## 6. Punto 4 — Horario laboral 10:00-19:00
- **Dónde:** columnas `ventana_inicio time` / `ventana_fin time` en la fila de `hermes_whatsapp_config` del depto (default `10:00`/`19:00`). Zona fija `America/Santo_Domingo`.
- **Enforce primario (DB):** `fn_whatsapp_reclamar_pendientes(p_departamento, ...)` reemplaza el chequeo de `whatsapp_quiet_hours_*` global por la ventana del depto.
- **Enforce secundario (Electron):** el loop chequea la ventana antes de `/claim`; el tray muestra "Fuera de horario, próximo envío 10:00".
- Mantener `whatsapp_quiet_hours_*` global como fallback para filas sin ventana propia.
- Decisión menor: días hábiles (el cron R6/R7/R8 es `* * 1-5`). Agregar `solo_dias_habiles` / `dias_habiles int[]`.

## 7. Punto 5 — Envío manual desde el portal

**El flujo necesita:** (1) composición (textarea + plantillas + variables + preview burbuja); (2) destinatarios de 3 fuentes: roster de clase (misma cascada que R6), lista guardada (tabla nueva `whatsapp_listas` + `whatsapp_lista_miembros`), números ad-hoc; (3) encolar vía `fn_whatsapp_encolar_manual(p_departamento text, p_destinatarios jsonb, p_mensaje text, p_plantilla_id uuid)` SECURITY DEFINER — valida rol, aplica guard de contenido, `INSERT` con `departamento`, `origen='manual'`, respeta opt-out, devuelve `{encolados, omitidos_optout, bloqueados}`; (4) visor de outbox filtrado `departamento` + `origen='manual'` con reintentar.

**Recomendación: módulo nuevo `src/modules/whatsapp-envios/`** (DataAdapter: `api/whatsappEnviosMock.js` + `api/whatsappEnviosSupabase.js`), vista reutilizable como panel embebible. El `departamento` lo fija el portal que monta el panel, nunca lo elige el usuario.

## 8. Punto 6 — Ruteo de productores a departamento

Regla: cada INSERT setea `departamento` + `origen` (`{'r6','r7','r8','campania','cobranza','manual','inbound_optout'}`).

| Productor | Depto destino | Cambio |
|-----------|---------------|--------|
| R6 padres | Decisión: ADM v1 (o ACM con install propio) | agregar `departamento` al INSERT; leer `departamento_envio` de `hermes_reactive_rules` |
| R7 maestros | ídem | ídem |
| R8 tareas | ADM o DIR | ya recibe `departamento` param; mapear a `departamento_envio` |
| Campañas | ADM | `campanias_periodo` +`departamento text DEFAULT 'ADM'`; `fn_encolar_campania` propaga |
| Cobranza FIN | FIN | reemplazar deep link `wa.me` por `fn_whatsapp_encolar_manual('FIN', ...)`; migrar cooldown `localStorage` -> DB |
| Webhook opt-out | depto dueño del número | `origen='inbound_optout'` + `departamento` según `instance` |

## 9. Punto 7 — Portales

| Portal | Stack | Cambio | Esfuerzo |
|--------|-------|--------|----------|
| ADM (`src/portales/adm/adm.js`) | vanilla JS | nuevo nav group "WhatsApp"; `registerRoutesWhatsappEnvios`; panel `departamento='ADM'` | Medio |
| FIN (`src/portales/fin/`) | React + TS | panel/route React nuevo; `departamento='FIN'`; reemplaza el modal `wa.me` | Medio-Alto |
| Legacy `gateway-config` | vanilla | depto-aware o deprecar/absorber; arreglar la consola de prueba falsa | Bajo-Medio |
| DIR (opcional) | vanilla | vista read-only agregada de todos los deptos | Bajo |

## 10. Punto 8 — Drop de inbound: qué se rompe y cumplimiento

| Función | Impacto | ¿Crítico? |
|---------|---------|----------|
| **Opt-out automático ("BAJA"/"STOP")** | representante que responde BAJA ya no se da de baja solo | **SÍ (cumplimiento SIS-COM-01)** |
| Justificación de ausencia por WhatsApp (cierra loop R6) | no se crea `justificaciones` ni task ACM | Medio |
| Reagendado de cita de postulante | respuestas no mueven la cita | Medio |
| FAQ pública automática + captura de lead | consultas frías sin respuesta hasta que un humano lea | Bajo-Medio |

**Path mínimo de opt-out (v1):**
1. **Webhook mínimo (~40 líneas):** Edge Function `whatsapp-optout-webhook` que SOLO hace: validar secret -> `esOptOut(texto)` -> `fn_whatsapp_optout(jid, 'usuario_baja')`. Sin Groq, sin state machine.
2. **Acción manual en el portal:** botón "Dar de baja" -> `fn_whatsapp_optout`.
3. **Footer en plantillas:** "Responda BAJA para no recibir más mensajes" en R6, campañas, cobranza.

**Recomendación:** (1) + (3) en v1; (2) como complemento. Dejar `whatsapp-webhook` completo tras flag `whatsapp_inbound_full_enabled=false`.

## 11. Punto 9 — Riesgo de migración / rollout

| Riesgo | Mitigación |
|--------|-----------|
| Cola existente sin `departamento` | columna nullable -> backfill (todo -> ADM) -> `SET DEFAULT 'ADM'` + `NOT NULL` |
| Fila única de config (`soi-main`) | `UPDATE ... SET departamento='ADM', instance_name='adm-gateway' WHERE activo`; `INSERT` fila FIN `activo=false`; **actualizar todos los call sites en el mismo cambio** |
| Cambio de firma de `fn_whatsapp_reclamar_pendientes` | overload: mantener `(p_limite int)` compat + nueva `(p_departamento text, p_limite int)` |
| Caps globales -> por depto | parametrizar `p_departamento` default NULL (= global, compat) |
| Regla 1 msg/jid/24h | decisión: global por jid vs por (jid, departamento) |
| Consola de prueba falsa | reemplazar por `INSERT estado='pendiente' departamento=<depto> origen='manual'` |
| Cobranza FIN en `localStorage` | migrar a DB o aceptar pérdida al integrar |
| `EVOLUTION_API_KEY` / `sk_live_soi_baileys_secure` en historial git | rotar/confirmar en cutover al retirar Evolution |

**Rollout:** (1) migraciones DB + Edge Function; (2) app ADM en la PC de ADM, device token, pairing QR, runner viejo apagado; (3) validar 1-2 días con tráfico real ADM; (4) FIN; (5) retirar `whatsapp-dispatcher`, `process-whatsapp-queue.js`, Docker.

## 12. Esfuerzo y split de fases

| Fase | Alcance | Esfuerzo | Depende |
|------|---------|----------|---------|
| F1. Fundación DB multi depto | migraciones + actualizar call sites | **M** (~250-350 líneas) | - |
| F2. Auth device + Edge Function | tabla devices, Edge Function claim/report/heartbeat, provisioning en portal | **M** | F1 |
| F3. Lib runner reutilizable | `src/services/whatsapp-runner/` + tests, cliente Edge Function | **S-M** | F2 |
| F4. Shell Electron | tray, auto-launch, single-instance x2, QR, config, gate horario, electron-updater, build Win | **L** | F3 |
| F5. Módulo envío manual | `src/modules/whatsapp-envios/`, `fn_whatsapp_encolar_manual`, selector destinatarios, outbox | **M-L** | F1 |
| F6. Ruteo de productores | R6/R7/R8 `departamento_envio`, `campanias_periodo.departamento`, integrar cobranza FIN | **M** | F1 |
| F7. Paneles de portal | nav+ruta ADM, panel React FIN, deprecar/adaptar `gateway-config`, KPIs por depto | **M** | F5 |
| F8. Opt-out mínimo | Edge Function `whatsapp-optout-webhook`, footer plantillas, acción manual, flag | **S** | F1 |
| F9. Cutover y limpieza | rollout ADM -> FIN, retirar Evolution/dispatcher/Docker, rotar credenciales | **S** | F2-F8 |

Columna vertebral: **F1 -> F2 -> F3 -> F4**. F5/F6/F7/F8 en paralelo tras F1/F2. F1 y F4 son candidatos a exceder 400 líneas: PRs encadenados o `size:exception`.

## 13. Decisiones abiertas para la propuesta
1. A qué número salen R6/R7/R8 (alertas ACM): número ADM v1 o ACM con install propio.
2. Regla 1 msg/jid/24h: global por jid o por (jid, departamento).
3. Aprobación en envío manual: `pendiente` vs `pendiente_aprobacion` por depto.
4. Ubicación de la app Electron: `apps/whatsapp-desktop/` (monorepo) vs repo/paquete separado.
5. Firma de código Windows en v1 o fast-follow.
6. Cooldown de cobranza FIN: migrar `localStorage` -> DB en v1 o aceptar reset.
7. Días hábiles en la ventana: agregar `solo_dias_habiles` / `dias_habiles int[]` o solo rango horario.

## 14. Riesgos transversales
- Punto único de falla nuevo: la Edge Function `whatsapp-gateway` en el camino de todo envío.
- PC del departamento apagada: sin heartbeat no sale nada de ese depto; alerta a DIR si un depto lleva >N horas sin heartbeat en horario.
- Baileys y bans: más números = más superficie de ban; warm-up por número nuevo + footer opt-out.
- Cumplimiento opt-out si solo se hace el path manual y nadie lee las respuestas.
- Deriva de stack ADM (vanilla) vs FIN (React): el panel se implementa 2 veces; `whatsapp-envios` debe exponer una API de datos limpia para duplicar solo UI.
- Secretos en binario: revisión de seguridad obligatoria del artefacto Electron antes de distribuir.
- Migración de call sites "fila única": si se olvida uno, lee la config de ADM para todos los deptos silenciosamente.

## 15. Listo para propuesta
**SÍ.** Siguiente fase: `sdd-propose`. La propuesta debe cerrar las 7 decisiones de la sección 13.
