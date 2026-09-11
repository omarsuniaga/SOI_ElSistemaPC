# Tasks: whatsapp-gateway-multidepto

Modo TDD estricto. Runner de tests: `npm run test:run` (Vitest). Cada unidad de
comportamiento lleva primero un test que falla (RED) y luego la implementacion que
lo pone verde (GREEN). Commits por unidad de trabajo: cada commit = un
comportamiento entregable con sus tests, nunca "todos los modelos y despues todos
los tests".

Tests de DB: `tests/db/whatsapp-*.test.js` (Vitest + cliente Supabase contra
stack local o staging) o `supabase/tests/*.test.sql` con `pgTAP` cuando sea SQL
puro. Tests de runner/lib: `tests/whatsapp-runner/`. Tests de modulo frontend:
`src/modules/whatsapp-envios/**/__tests__/`.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~6.400 (todas las fases sumadas) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 13 PRs encadenados (ver Suggested Work Units) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending (decision de equipo antes de apply) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Lineas estimadas por fase

| Fase | Lineas aprox | Excede 400 | Riesgo 400 |
|------|--------------|------------|------------|
| F1 DB foundation (mig 1-3 + ~11 call sites + tests) | ~560 | Si | High |
| F2 device auth + edge fn (mig 4 + edge fn + tests) | ~540 | Si | High |
| F3 runner lib (7 modulos + tests) | ~1.100 | Si | High |
| F4 Electron shell | ~950 | Si | High |
| F5 manual send (mig 5 + modulo + adapters + tests) | ~880 | Si | High |
| F6 producer routing (mig 6-7 + handlers + modal + tests) | ~720 | Si | High |
| F7 portal panels + observabilidad (mig 8 + paneles + tests) | ~800 | Si | High |
| F8 opt-out minimo (mig 9 + webhook + footers + tests) | ~300 | No | Medium |
| F9 cutover / cleanup (borrados + rotacion + gate seguridad) | ~180 | No | Low |

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Mig 1-2: `hermes_whatsapp_queue` +departamento/+origen (backfill) y `hermes_whatsapp_config` +departamento/+ventana + indice unico parcial + fila FIN inactiva | PR 1 | base = tracker branch; tests de backfill, unicidad, FIN inactivo |
| 2 | Mig 3: `fn_whatsapp_reclamar_pendientes(text,int)` + wrapper compat + caps parametrizadas + ~11 call sites en lockstep + test de aislamiento | PR 2 | base = PR 1; el mas riesgoso, incluye el test de aislamiento ADM/FIN |
| 3 | Mig 4: `whatsapp_gateway_devices` + `fn_whatsapp_device_issue/validate/revoke` | PR 3 | base = PR 2 |
| 4 | Edge fn `whatsapp-gateway` (`/claim` `/report` `/heartbeat`) con device token | PR 4 | base = PR 3 |
| 5 | Runner lib pura: `businessHours`, `ackWaiter`, `edgeClient` + tests | PR 5 | base = tracker (independiente de F5-F8) |
| 6 | Runner lib side-effecting: `socket`, `dispatchLoop`, `index` + tests | PR 6 | base = PR 5 |
| 7 | Electron main: lifecycle, `singleInstance`, `secrets` (safeStorage), `config` primer arranque | PR 7 | base = PR 6 |
| 8 | Electron UX: `tray`, ventanas QR/config/estado, `autoLaunch`, `updater`, `electron-builder.yml` | PR 8 | base = PR 7 |
| 9 | Mig 5 + `src/modules/whatsapp-envios/` (adapters Mock/Supabase, router, views) | PR 9 | base = PR 2 |
| 10 | Mig 6-7 + handlers R6/R7/R8 + `fn_encolar_campania` + `WhatsAppReminderModal` + cooldown DB | PR 10 | base = PR 2 |
| 11 | Mig 8 watchdog + paneles ADM/FIN + `estadoGatewayView` + KPIs por depto | PR 11 | base = PR 9 |
| 12 | Mig 9 + `whatsapp-optout-webhook` + footers en plantillas + accion "Dar de baja" | PR 12 | base = PR 2 |
| 13 | F9 cutover: borrar dispatcher / one-shot / docker, rotar secrets, gate de seguridad del artefacto | PR 13 | base = PR 12 (ultimo) |

---

## Fase F1: Fundacion DB multi depto (secuencial; prerequisito de todo)  ✅ COMPLETA (2026-09-07)

Tests SQL: `supabase/tests/whatsapp_multidepto_foundation.test.sql` (WU1) y
`whatsapp_claim_multidepto.test.sql` (WU2), patron BEGIN/ROLLBACK. Verificados
GREEN contra el proyecto real `zmhmdvmyeyswunurcyow` (Postgres 17). Migraciones
NO aplicadas al proyecto remoto.

### Work Unit 1 — columnas queue + config (commit a7ca2628)
- [x] F1.1 (RED) Test de backfill de cola -> `whatsapp_multidepto_foundation.test.sql` E1/E2.
- [x] F1.2 (GREEN) `supabase/migrations/20260907030000_whatsapp_multidepto_queue.sql`.
- [x] F1.3 (RED) Test de indice unico parcial -> `whatsapp_multidepto_foundation.test.sql` E4.
- [x] F1.4 (RED) Test FIN inactivo -> `whatsapp_multidepto_foundation.test.sql` E5.
- [x] F1.5 (GREEN) `supabase/migrations/20260907031000_whatsapp_multidepto_config.sql` — incluye la deduplicacion de las 2 filas `soi-main` activas reales de prod (se queda con el jid real, desactiva la de demo).

### Work Unit 2 — claim parametrizada + call sites (commit pendiente)
- [x] F1.6 (RED) Test de caps por depto -> cubierto por E1/E2 (aislamiento) de `whatsapp_claim_multidepto.test.sql`.
- [x] F1.7 (GREEN) `fn_whatsapp_cap_hoy(text DEFAULT NULL)` + `fn_whatsapp_enviados_hoy(text DEFAULT NULL)` en `20260907032000`.
- [x] F1.8 (RED) Test de gate de horario -> `whatsapp_claim_multidepto.test.sql` E4 (fuera de ventana: 0 filas, `intentos` no sube).
- [x] F1.9 (RED) Test de overload de compat -> `whatsapp_claim_multidepto.test.sql` E5 + E6 (RAISE con >1 depto activo).
- [x] F1.10 (RED) **Test de aislamiento estricto** -> `whatsapp_claim_multidepto.test.sql` E1 (solo filas ADM, FIN intactas), E2 (no lee config de FIN), E3 (dedup por par: ADM difiere, FIN entrega).
- [x] F1.11 (GREEN) `supabase/migrations/20260907032000_whatsapp_claim_parametrizada.sql` — `fn_whatsapp_reclamar_pendientes(text, int)` + wrapper compat `(int)` + grants a `service_role`.
- [x] F1.12 (RED) Conteo horario por depto -> el claim filtra `departamento = p_departamento` en el conteo de la ultima hora (verificado en E1).
- [x] F1.13 (GREEN) Call sites en lockstep: `fn_encolar_campania` (ADM + `origen='campania'`), `src/modules/gateway-config/api/gatewayApi.js` (fijado a `DEPTO='ADM'`), test `gatewayDispatcherIntegration.test.js` actualizado.
- [x] F1.14 (GREEN) Auditoria de call sites -> `openspec/changes/whatsapp-gateway-multidepto/f1-callsite-audit.md`. Consumidores legacy (runner, dispatcher, process-queue) siguen por el wrapper compat, se retiran en F9.

## Fase F2: Device auth + edge function (secuencial; depende de F1)  ✅ COMPLETA (2026-09-07)

### Work Unit 3 — whatsapp_gateway_devices (commit 8f… / ver git log)
- [x] F2.1 (RED) Test provisioning -> `supabase/tests/whatsapp_gateway_devices.test.sql` E1 (token 64 hex, se guarda solo el hash).
- [x] F2.2 (RED) Test validate + revoke -> `whatsapp_gateway_devices.test.sql` E2 (last_seen_at), E3 (revocación inmediata), E4 (token inválido -> 0 filas).
- [x] F2.3 (GREEN) `supabase/migrations/20260907040000_whatsapp_gateway_devices.sql` — tabla + índice parcial + RLS es_admin()/service_role + `fn_whatsapp_device_issue/validate/revoke`. pgcrypto en schema `extensions` -> `digest`/`gen_random_bytes` calificadas. E5 verifica el gate `es_admin()`.

### Work Unit 4 — edge function whatsapp-gateway (commit pendiente)
- [x] F2.4 (RED) Token de la edge fn -> `tests/edge/whatsapp-gateway.test.ts` `authDevice` (token vacío/revocado/error -> null -> 401 en index.ts).
- [x] F2.5 (RED) Derivación de departamento -> `tests/edge/whatsapp-gateway.test.ts` `handleClaim` "usa el departamento del device, ignora el del body".
- [x] F2.6 (GREEN) `supabase/functions/whatsapp-gateway/index.ts` + `handlers.ts` — `Deno.serve`, CORS como `whatsapp-dispatcher`, ruteo por sufijo (`routeFromPath`), `authDevice` -> 401, deriva departamento del device.
- [x] F2.7 (GREEN) `handleClaim` -> `fn_whatsapp_reclamar_pendientes(departamento, limite)` + `{mensajes, ventana_ok, cap_restante}` (`ventana_ok` de `fn_whatsapp_ventana_abierta`, `cap_restante` = cap_hoy - enviados_hoy).
- [x] F2.8 (GREEN) `handleReport` — solo filas `procesando` del depto del device; `enviado -> enviado/procesado_at`; `fallido -> pendiente` si `intentos<3`, si no `fallido`. Idempotente. 5 tests.
- [x] F2.9 (GREEN) `handleHeartbeat` -> `fn_hermes_gateway_heartbeat('<depto>-gateway', ..., {nombre_equipo})`; instancia única cruzada: si otra PC latió hace <90s NO pisa y devuelve `{ok:false, standby:true, owner_equipo}`. 3 tests.
- [x] F2.10 (GREEN) `supabase/config.toml` — `[functions.whatsapp-gateway]` `verify_jwt = false`.
- [x] Extra: `supabase/migrations/20260907041000_whatsapp_ventana_helper.sql` — extrae la ventana horaria de la claim fn a `fn_whatsapp_ventana_abierta(text)` (única fuente de verdad, la usan la claim fn y `/claim`). Verificado GREEN (E1 aislamiento + E7 helper).

## Fase F3: Lib runner reutilizable (secuencial; depende de F2)  ✅ COMPLETA (2026-09-07)

`src/services/whatsapp-runner/` — sin dependencia de Baileys ni `process.env`
(todo inyectado). 48 tests vitest en `tests/whatsapp-runner/`. eslint limpio.

### Work Unit 5 — módulos puros (commit 4b… / ver git log)
- [x] F3.1/F3.2 `businessHours.js` — `dentroDeVentana(now, {inicio,fin,soloDiasHabiles,tz})`. 11 tests (bordes, sábado/domingo, cruza medianoche, formato inválido).
- [x] F3.3/F3.4 `ackWaiter.js` — `createAckWaiter({setTimeoutImpl,clearTimeoutImpl})` -> `{waitFor, onUpdate, cancelAll, size}`. 7 tests (status>=2, timeout, status en raíz, cancelAll).
- [x] F3.5/F3.6 `edgeClient.js` — `createEdgeClient({baseUrl,deviceToken,fetchImpl})` -> `claim/report/heartbeat`; 401 -> `EdgeClientError` code 401. 8 tests.
- [x] F3.7 `contentGuard.js` — re-export de `whatsappSecurityGuard`. Nota: dispatchLoop solo usa `clampMessageText`; el bloqueo de contenido de salida va al componer (F5), no al despachar (los patrones de `shouldBlockSensitiveMessage` son para ENTRADA).

### Work Unit 6 — socket + loop + composición (commit pendiente)
- [x] F3.8/F3.9 `dispatchLoop.js` — `createDispatchLoop({edgeClient,sendMessage,ackWaiter,guard,businessHours,config,logger,now,sleep})`; `tick()` = ventana -> claim -> por mensaje (clamp + normalizar jid + send + waitFor ACK) -> jitter anti-ban -> report. 10 tests (vacío, N msgs, ACK timeout, ventana_ok=false, businessHours=false, claim 401, jitter, report que falla no tira).
- [x] F3.10/F3.11 `socket.js` — `createSocket({makeWASocket,useMultiFileAuthState,fetchLatestBaileysVersion,authDir,...})` (Baileys inyectado); reconexión backoff 4s salvo loggedOut (401). 8 tests.
- [x] F3.12 `index.js` — `createRunner(runnerConfig)` compone todo; expone `{start, stop, on, tick, standby, conectado}`; emisor minimal (`qr`, `connection`, `tick`, `standby`, `error`); heartbeat cada `heartbeatMs` con detección de standby (otra PC). 5 tests smoke.

## Deuda técnica del backbone (de Judgment Day R1-R3): a resolver en F4/F9

- [ ] **CI de los tests SQL**: agregar `test:sql:whatsapp` en `package.json` (loop sobre `supabase/tests/whatsapp_*.test.sql` contra `$DATABASE_URL`) y correrlo en `.github/workflows/` contra un branch de test. Hoy `test:sql` apunta a un solo archivo no relacionado.
- [ ] **Coexistencia legacy F4→F9**: cuando la app Electron de un departamento entre en producción, hay que apagar por entorno `scripts/whatsapp-runner/index.js` y `supabase/functions/whatsapp-dispatcher` para ESE número (no solo en F9). Los dos despacharían ADM y doble-contarían el cap. Documentar en el runbook de rollout (F4) y en F9.
- [ ] **Durabilidad del report entre reinicios**: `dispatchLoop` guarda los resultados no reportados en memoria (sobreviven entre ticks, no entre reinicios del proceso). F4 (Electron con disco) debe persistirlos en `userData` y replayearlos al arrancar.
- [ ] **Opt-out inbound "BAJA"**: F8 mete `socket.js` escuchando `messages.upsert` + reenvío al webhook mínimo de opt-out. F9 NO puede retirar `scripts/whatsapp-runner` antes de que F8 esté.
- [ ] **Watchdog del tick colgado** (Judgment R4): `dispatchLoop.tick()` `await`ea `sock.sendMessage` / `edgeClient.*` sin timeout propio. Un socket zombie (sendMessage colgado sin evento `close`) deja `corriendo=true` para siempre y detiene el despacho en silencio. F4 debe envolver el tick con un timeout/AbortController y emitir un evento si vence.
- [ ] **Persistencia del buffer de reporte** (Judgment R4): `pendientesDeReporte` vive en memoria. Si el proceso se reinicia con resultados sin confirmar, se pierden y las filas quedan para el reaper (45 min). F4 (Electron con disco) debe persistirlo en `userData` y replayearlo al arrancar.

## Fase F4: Shell Electron (secuencial; depende de F3)

- [ ] F4.1 (RED) `tests/whatsapp-runner/singleInstance.test.js` — dado un `owner_equipo` distinto con `seconds_since_heartbeat<90`, la logica de decision devuelve STANDBY; si es uno mismo o no hay owner fresco -> ACTIVE; tiebreak lexicografico. Cubre spec "Segunda PC del mismo departamento".
- [ ] F4.2 (GREEN) `apps/whatsapp-desktop/src/main/singleInstance.js` — `requestSingleInstanceLock` + poll de heartbeat cruzado (recheck 60s, jitter 0-15s).
- [ ] F4.3 (RED) `tests/whatsapp-runner/secrets.test.js` — `encrypt/decrypt` round-trip; si `!safeStorage.isEncryptionAvailable()` la app no corre (sin fallback en claro).
- [ ] F4.4 (GREEN) `apps/whatsapp-desktop/src/main/secrets.js` — `safeStorage` -> `userData/token.enc` (base64).
- [ ] F4.5 (GREEN) `apps/whatsapp-desktop/src/main/config.js` — arma `runnerConfig`; primer arranque pide token + departamento. Cubre spec "Configuracion inicial".
- [ ] F4.6 (GREEN) `apps/whatsapp-desktop/src/main/index.js` — lifecycle; corre la lib solo en estado ACTIVE; auth Baileys en `userData/baileys_auth/`.
- [ ] F4.7 (GREEN) `apps/whatsapp-desktop/src/main/autoLaunch.js` — `app.setLoginItemSettings` (auto-arranque al iniciar sesion del SO).
- [ ] F4.8 (GREEN) `apps/whatsapp-desktop/src/main/tray.js` — labels de estado: conectado, standby, fuera de horario, sin conexion al servidor. Cubre spec "Fuera de horario" (tray refleja el estado).
- [ ] F4.9 (GREEN) `apps/whatsapp-desktop/src/renderer/qr.(html|js)` + `windows.js` + `ipc.js` (`qr:subscribe`, `config:*`, `estado:get`) + `preload/index.js` (contextBridge minimo).
- [ ] F4.10 (GREEN) `apps/whatsapp-desktop/src/main/updater.js` — `electron-updater` `provider: generic` a bucket publico de Supabase Storage `whatsapp-desktop-releases/`; `electron-log`.
- [ ] F4.11 (GREEN) `apps/whatsapp-desktop/package.json` + `electron-builder.yml` — target `nsis` win x64, `asar: true`, `app.asar` solo lleva codigo; guia de instalacion "ejecutar de todas formas" (sin firma en v1).

## Fase F5: Modulo de envio manual (paralelizable con F6/F8; depende de F1)

- [ ] F5.1 (RED) `tests/db/whatsapp-encolar-manual.test.js` — 5 destinatarios (1 en opt-out, 1 bloqueado por guard) contra `fn_whatsapp_encolar_manual('FIN', ...)` inserta 3 filas `origen='manual'`, `estado='pendiente'`, `departamento='FIN'` y devuelve `{encolados:3, omitidos_optout:1, bloqueados:1}`. Cubre spec "Encolado con opt-out y guard".
- [ ] F5.2 (RED) Mismo archivo — usuario sin rol autorizado: la RPC falla sin insertar filas. Cubre spec "Rol insuficiente".
- [ ] F5.3 (RED) `tests/db/whatsapp-guard-paridad.test.js` — `fn_whatsapp_guard_bloquea` vs `detectPromptInjection` y `fn_whatsapp_clamp` vs `clampMessageText` sobre un corpus compartido dan el mismo veredicto.
- [ ] F5.4 (GREEN) `supabase/migrations/xxxx_whatsapp_encolar_manual.sql` — `fn_whatsapp_guard_bloquea(text)`, `fn_whatsapp_clamp(text)` (port de `whatsappSecurityGuard.js`), `fn_whatsapp_encolar_manual(text, jsonb, text, uuid)` `SECURITY DEFINER` (orden: rol -> depto -> mensaje -> destinatarios -> guard -> opt-out -> dedup `(jid,depto)` -> INSERT), grants a `authenticated`; tablas `whatsapp_listas` + `whatsapp_lista_miembros` con RLS `es_admin()`.
- [ ] F5.5 (RED) `src/modules/whatsapp-envios/api/__tests__/paridad.test.js` — el adaptador Mock y el Supabase exponen las mismas firmas y formas de retorno (`encolarManual`, `listarOutbox`, `reintentar`, listas, `rosterClase`, `estadoGateway`, `darDeBaja`). Cubre spec "Paridad Mock / Supabase".
- [ ] F5.6 (GREEN) `src/modules/whatsapp-envios/api/whatsappEnviosMock.js` + `whatsappEnviosSupabase.js` (factory `createWhatsappEnviosApi(supabaseClient)`, sin importar `src/lib/supabaseClient.js`) + `api/index.js` (elige por `config.isDemoMode`, patron `gatewayApi.js`).
- [ ] F5.7 (RED) `src/modules/whatsapp-envios/api/__tests__/reintentar.test.js` — `reintentar({departamento:'FIN', id})` solo reencola si `row.departamento === 'FIN'`. Cubre spec "Reintento acotado al departamento".
- [ ] F5.8 (GREEN) `src/modules/whatsapp-envios/views/enviosView.js` (composer + selector: roster de clase, listas guardadas, ad-hoc; el `departamento` lo fija el portal) + `outboxView.js` (visor filtrado por `departamento` + `origen`, reintentar).
- [ ] F5.9 (GREEN) `src/modules/whatsapp-envios/whatsapp-envios.router.js` (`registerRoutesWhatsappEnvios`) + `index.js`.

## Fase F6: Ruteo de productores (paralelizable con F5/F8; depende de F1)

- [ ] F6.1 (RED) `tests/db/whatsapp-routing-r6.test.js` — regla R6 con `departamento_envio` nulo -> fila `departamento='ADM'`, `origen='r6'`. Cubre spec "R6 encola por el numero de ADM".
- [ ] F6.2 (RED) `tests/db/whatsapp-routing-campania.test.js` — `fn_encolar_campania` sin departamento explicito -> filas `departamento='ADM'`, `origen='campania'`. Cubre spec "Encolado de campania".
- [ ] F6.3 (GREEN) `supabase/migrations/xxxx_whatsapp_producer_routing.sql` — `campanias_periodo.departamento text NOT NULL DEFAULT 'ADM'`, `hermes_reactive_rules.departamento_envio text`, `fn_encolar_campania` resuelve depto via `campania_id` y propaga.
- [ ] F6.4 (GREEN) `supabase/functions/event-spine-logger/handlers/r6|r7|r8-whatsapp-*.ts` — cada INSERT setea `departamento` (de `hermes_reactive_rules.departamento_envio ?? 'ADM'`) + `origen='r6'|'r7'|'r8'`.
- [ ] F6.5 (RED) `tests/db/whatsapp-cobranza-cooldown.test.js` — `fn_whatsapp_cobranza_enviar` con `en_cooldown AND NOT p_forzar` devuelve `{bloqueado_cooldown:true, horas_restantes}`; un segundo intento dentro del cooldown queda bloqueado por estado en DB. Cubre spec "Recordatorio de cobranza".
- [ ] F6.6 (GREEN) `supabase/migrations/xxxx_whatsapp_cobranza_cooldown.sql` — tabla `whatsapp_cobranza_cooldown`, `system_config` `whatsapp_cobranza_cooldown_horas=48`, RPC `fn_whatsapp_cobranza_enviar` (delega en `fn_whatsapp_encolar_manual('FIN', ...)`, upsert del cooldown).
- [ ] F6.7 (RED) `src/portales/fin/src/features/whatsapp/__tests__/reminderModal.test.tsx` — confirmar el modal llama `fn_whatsapp_cobranza_enviar` y NO abre `wa.me`; el cooldown se lee de DB, no de `localStorage`.
- [ ] F6.8 (GREEN) `src/portales/fin/.../WhatsAppReminderModal.tsx` + `hooks/useWhatsAppReminders.ts` — sin deep link, enqueue real, cooldown desde `whatsapp_cobranza_cooldown`.

## Fase F7: Paneles de portal + observabilidad (depende de F5; F2 para live status)

- [ ] F7.1 (RED) `tests/db/whatsapp-watchdog.test.js` — filas `procesando` de `ADM` mas viejas que N min a las 14:00 -> 1 alerta; segunda corrida no duplica (UNIQUE `(departamento,tipo,ventana_hora)`); a las 22:00 no alerta; sin heartbeat en horario -> alerta `sin_heartbeat`; reaper devuelve `procesando` colgado a `pendiente`. Cubre spec "Cola atascada en horario", "Sin heartbeat en horario", "Fuera de horario no alerta".
- [ ] F7.2 (GREEN) `supabase/migrations/xxxx_whatsapp_watchdog.sql` — tabla `whatsapp_watchdog_alertas`, `system_config` (`stuck_min=30`, `heartbeat_min=10`, `reap_min=15`), `fn_whatsapp_watchdog()` (reaper + cola atascada + sin heartbeat, dedup por hora, notificacion a admins via `fn_hermes_crear_notificacion`), `cron.schedule('whatsapp-watchdog','*/10 * * * *', ...)`.
- [ ] F7.3 (RED) `src/modules/whatsapp-envios/views/__tests__/estadoGateway.test.js` — `estadoGateway({departamento:'FIN'})` devuelve `enviadosHoy`, `liveStatus` de `fin-gateway` y `colaPorEstado` solo de `FIN`. Cubre spec "Panel de FIN muestra solo FIN".
- [ ] F7.4 (GREEN) `src/modules/whatsapp-envios/views/estadoGatewayView.js` — heartbeat + KPIs + cola por estado (absorbe `gateway-config` legacy, D8); `gatewayApi.js` CRUD migra a `obtenerConfig/actualizarConfig({departamento})`; `enviarMensajePrueba` pasa a `encolarManual` con `origen='test'`.
- [ ] F7.5 (GREEN) Wiring ADM: `src/portales/adm/adm.js` nav group `whatsapp` (items `whatsapp-envios`, `whatsapp-outbox`, `whatsapp-estado`); `src/portales/_shared/allRegistrars.js` sustituye `registerRoutesGatewayConfig` por `registerRoutesWhatsappEnvios` (el viejo se conserva hasta F9).
- [ ] F7.6 (GREEN) Wiring FIN: ruta `/whatsapp` en el router React de FIN que instancia `createWhatsappEnviosApi` con el cliente de FIN; panel con `departamento='FIN'`.

## Fase F8: Opt-out minimo (paralelizable con F5/F6; depende de F1)

- [ ] F8.1 (RED) `tests/edge/whatsapp-optout-webhook.test.js` — texto "BAJA" con secret valido -> `jid` en `whatsapp_optout` via `fn_whatsapp_optout(jid,'usuario_baja')`; secret invalido -> 401 sin modificar `whatsapp_optout`; inbound que no es opt-out con `whatsapp_inbound_full_enabled=false` -> sin efecto. Cubre spec "Respuesta BAJA", "Secret invalido", "Inbound completo permanece inactivo".
- [ ] F8.2 (GREEN) `supabase/functions/whatsapp-optout-webhook/index.ts` — valida secret compartido, `esOptOut(texto)`, llama `fn_whatsapp_optout`; `supabase/config.toml` con `verify_jwt=false`.
- [ ] F8.3 (GREEN) `supabase/migrations/xxxx_whatsapp_optout_min.sql` — `system_config` `whatsapp_inbound_full_enabled=false`, claves de footer; `whatsapp-webhook/index.ts` deja el resto del inbound detras del flag y setea `origen='inbound_optout'` + depto en el path de baja.
- [ ] F8.4 (RED) `src/.../__tests__/footer.test.js` — el render de una plantilla R6, de campania y de cobranza incluye "Responda BAJA para no recibir mas mensajes". Cubre spec "Footer presente".
- [ ] F8.5 (GREEN) Agregar el footer a las plantillas de R6, campanias y cobranza; accion manual "Dar de baja" en el portal (`darDeBaja({jid})` -> `fn_whatsapp_optout`). Cubre spec "Baja manual desde el portal".

## Fase F9: Cutover y limpieza (ultima; depende de F2 a F8)

- [ ] F9.1 Rollout: aplicar migraciones F1-F8, instalar app ADM (device token + QR + auto-launch), apagar `scripts/whatsapp-runner/index.js` manual, validar 1-2 dias con trafico real de ADM.
- [ ] F9.2 Activar FIN: `UPDATE hermes_whatsapp_config SET activo=true WHERE departamento='FIN'`, instalar app FIN, validar cobranza real.
- [ ] F9.3 Borrar transporte muerto: `supabase/functions/whatsapp-dispatcher/`, `supabase/process-whatsapp-queue.js`, `scripts/whatsapp-runner/`, `docker/whatsapp-gateway/`, `registerRoutesGatewayConfig` legacy y su import.
- [ ] F9.4 Rotar secrets expuestos: `EVOLUTION_API_KEY` y `sk_live_soi_baileys_secure`; confirmar que el wrapper compat `(int)` ya no tiene consumidores (o dejar el `RAISE` cuando FIN esta activo).
- [ ] F9.5 (RED) `tests/whatsapp-runner/no-legacy.test.js` — grep del arbol: no quedan imports de `whatsapp-dispatcher`, `process-whatsapp-queue`, `scripts/whatsapp-runner`.
- [ ] F9.6 **GATE de seguridad del artefacto Electron** (explicito, bloqueante): script de CI de release que hace `grep` de `app.asar` extraido y del `.exe` empaquetado buscando `service_role`, `anon`, `SUPABASE_SERVICE_ROLE_KEY`, `sk_live`, y la URL de service key; el build falla si aparece cualquiera. Solo debe estar el device token cifrado en `safeStorage` (no en el binario). Cubre spec "Revision de seguridad del artefacto" (AC-15). Firmar el resultado en el PR de cutover.
