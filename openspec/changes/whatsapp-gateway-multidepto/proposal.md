# Proposal: whatsapp-gateway-multidepto

## Resumen ejecutivo

Convertir el módulo WhatsApp de instancia única a un sistema **multi departamento, de solo salida, instalado en la PC de cada departamento vía una app Electron con Baileys**, con horario laboral por departamento y despacho automático de la cola. v1 cubre **ADM** (piloto) y **FIN**. Se elimina Evolution API y todo el transporte REST. Se documentan las **9 fases**; se implementan primero F1 a F4 (columna vertebral), se valida con tráfico real de ADM, luego F5 a F8 en paralelo y por último F9 (cutover y limpieza).

## Problem Statement

El envío de WhatsApp del SOI hoy no funciona de forma confiable ni escala a más de un departamento:

| Problema | Evidencia (verificada en código) | Consecuencia |
|----------|----------------------------------|--------------|
| **Nadie drena la cola de forma agendada** | `whatsapp-dispatcher` y `process-whatsapp-queue.js` no tienen cron; el Baileys runner (`scripts/whatsapp-runner/index.js`) se corre a mano | Los mensajes encolados quedan en `pendiente` indefinidamente salvo que alguien ejecute el runner manualmente |
| **Todo asume una sola instancia** | `hermes_whatsapp_config` se lee siempre con `WHERE activo = true LIMIT 1` en la claim fn, `fn_whatsapp_cap_hoy`, el dispatcher, `process-whatsapp-queue.js` y `gatewayApi.js` | Imposible que ADM y FIN tengan números y colas separadas sin colisionar |
| **La cola no sabe de qué departamento es cada mensaje** | `hermes_whatsapp_queue` no tiene columna `departamento` ni `origen` | No se puede rutear, filtrar por panel ni reportar por departamento |
| **El `service_role` no puede viajar en un binario** | El runner usa `service_role` (o `anon`) directo contra Supabase | Distribuir una app de escritorio con esa credencial es una exposición de seguridad inaceptable |
| **FIN no tiene integración real** | `WhatsAppReminderModal.tsx` abre `https://wa.me/<num>?text=...` (deep link manual) con cooldown en `localStorage` | La cobranza depende de que un humano haga clic y envíe a mano, sin cola, sin auditoría, sin opt-out |
| **Transporte fragmentado** | 4 implementaciones divergentes (Baileys runner, edge dispatcher, outbox one-shot, Docker Evolution) | Costo de mantenimiento alto y comportamiento impredecible según cuál se use |

**Por qué ahora:** ADM necesita enviar campañas de inscripción y avisos operativos, y FIN necesita cobranza real por WhatsApp. Ninguno de los dos puede avanzar sobre la arquitectura actual, y cada semana de deep links manuales es trabajo perdido y riesgo de cumplimiento (SIS-COM-01, opt-out).

## Intent / Goals

1. **Cola multi departamento**: `hermes_whatsapp_queue` etiquetada con `departamento` + `origen`; `hermes_whatsapp_config` pasa a una fila por departamento; la claim fn filtra por departamento.
2. **Despacho automático**: la app Electron de cada departamento sondea su cola y despacha dentro de su horario, sin intervención humana.
3. **Cero credencial de DB en el binario**: el `service_role` vive solo en una edge function `whatsapp-gateway`; la app se autentica con un **device token** por instalación.
4. **ADM y FIN operativos en v1**: ADM primero (validado con tráfico real), FIN después, reutilizando el mismo módulo de datos.
5. **Cumplimiento mínimo de opt-out**: edge function `whatsapp-optout-webhook` que da de baja al responder "BAJA", más footer en las plantillas.
6. **Retiro de Evolution**: al cutover se eliminan `whatsapp-dispatcher`, `process-whatsapp-queue.js` y `docker/whatsapp-gateway/`, y se rotan las credenciales expuestas.

**Cómo se ve el éxito:**

- [ ] ADM envía y recibe ACK real (status >= 2) desde su PC, dentro de 10:00-19:00, sin que nadie ejecute nada a mano.
- [ ] FIN encola recordatorios de cobranza vía `fn_whatsapp_encolar_manual('FIN', ...)` y se despachan desde la PC de FIN.
- [ ] El binario distribuido no contiene `service_role` ni `anon` key (revisión de seguridad del artefacto).
- [ ] Un representante que responde "BAJA" queda en `whatsapp_optout` y deja de recibir mensajes de todos los departamentos.
- [ ] La dedup 1 msg/jid/24h opera por `(jid, departamento)`: un padre bloqueado por un aviso de ADM igual recibe el recordatorio de pago de FIN.
- [ ] Evolution API, el dispatcher REST y el outbox one-shot están retirados del repo y de la infra.

## Non-Goals

| No se hace en v1 | Motivo |
|------------------|--------|
| Bot de entrada / auto respuestas / FAQ pública / reagendado de citas / justificaciones por WhatsApp | El `whatsapp-webhook` completo (711 líneas) queda tras el flag `whatsapp_inbound_full_enabled=false`; solo se conserva el path de opt-out |
| VPS, Raspberry Pi o servidor central de WhatsApp | La decisión es correr en la PC del departamento vía Electron |
| Más de un número por departamento | Enfoque A (columna `departamento`), no `gateway_instances` con FK; se descarta la sobre-ingeniería |
| App Electron para ACM como instalación separada | Las alertas R6/R7/R8 salen por el **número de ADM** en v1; se **diseña** el concepto `departamento_envio` para moverlas después, no se construye |
| Firma de código Windows | Fast-follow v1.1; v1 sale sin firmar con guía de instalación "ejecutar de todas formas" |
| Gate de aprobación para envíos manuales | Los envíos manuales de un usuario admin entran como `estado='pendiente'` directo; `pendiente_aprobacion` sigue existiendo solo para R6 |
| Migración de LOG / COM / LUT / TECNICO | Extensible por diseño (1 INSERT de config), fuera de alcance de v1 |

## Scope: In / Out

### In Scope (9 fases)

| Fase | Alcance | Capacidad(es) | Depende |
|------|---------|---------------|---------|
| **F1. Fundación DB multi depto** | `+departamento` y `+origen` en `hermes_whatsapp_queue` (nullable -> backfill a `ADM` -> `NOT NULL DEFAULT 'ADM'`); `+departamento`, `+ventana_inicio/fin`, `+solo_dias_habiles` en `hermes_whatsapp_config` + índice único parcial `(departamento) WHERE activo`; fila FIN `activo=false`; `fn_whatsapp_reclamar_pendientes(p_departamento text, p_limite int)` (overload, mantiene la firma vieja como compat); parametrizar `fn_whatsapp_cap_hoy` / `fn_whatsapp_enviados_hoy` / conteo horario; actualizar los ~6 call sites de "fila única" en el mismo cambio | `whatsapp-multidept-outbox` | - |
| **F2. Auth device + edge fn** | Tabla `whatsapp_gateway_devices(id, departamento, token_hash, nombre_equipo, activo, created_at, last_seen_at, revoked_at)`; edge function `whatsapp-gateway` con `/claim`, `/report`, `/heartbeat` (`service_role` solo como secret de la función); provisioning de token en el portal | `whatsapp-device-auth` | F1 |
| **F3. Lib runner reutilizable** | Extraer `scripts/whatsapp-runner/index.js` -> `src/services/whatsapp-runner/` con tests en `tests/`; `createSocket`, `esperarConfirmacionServidor` (ACK real), `dispatchLoop` (claim/report ahora vía edge fn); importar `whatsappSecurityGuard.js` tal cual; recortar el forward de inbound a solo opt-out | `whatsapp-desktop-gateway` (lib) | F2 |
| **F4. Shell Electron** | `apps/whatsapp-desktop/`: main process corre la lib; tray + auto-launch (`app.setLoginItemSettings`); single-instance OS (`requestSingleInstanceLock`) + cruzado (vía `fn_hermes_gateway_get_live_status`); ventana de QR; config de depto en primer arranque; token en `safeStorage`; gate de horario como poll gate; `electron-updater` + `electron-log`; build Windows sin firmar + guía de instalación | `whatsapp-desktop-gateway` (shell) | F3 |
| **F5. Módulo envío manual** | `src/modules/whatsapp-envios/` (DataAdapter: `whatsappEnviosMock.js` + `whatsappEnviosSupabase.js`); `fn_whatsapp_encolar_manual(p_departamento, p_destinatarios jsonb, p_mensaje, p_plantilla_id)` SECURITY DEFINER (valida rol, aplica guard, respeta opt-out, devuelve `{encolados, omitidos_optout, bloqueados}`); selector de destinatarios (roster de clase, listas guardadas `whatsapp_listas` + `whatsapp_lista_miembros`, ad-hoc); visor de outbox filtrado `departamento` + `origen='manual'` con reintentar; el `departamento` lo fija el portal, nunca el usuario | `whatsapp-manual-send` | F1 |
| **F6. Ruteo de productores** | `hermes_reactive_rules.departamento_envio` (R6/R7/R8 -> número ADM en v1); `campanias_periodo.departamento text DEFAULT 'ADM'` propagado por `fn_encolar_campania`; reemplazar el deep link `wa.me` de `WhatsAppReminderModal.tsx` por `fn_whatsapp_encolar_manual('FIN', ...)`; migrar el cooldown de `localStorage` a DB; cada INSERT setea `departamento` + `origen` (`r6|r7|r8|campania|cobranza|manual|inbound_optout`) | `whatsapp-multidept-outbox` (productores) | F1 |
| **F7. Paneles de portal** | Nav group "WhatsApp" + `registerRoutesWhatsappEnvios` en `src/portales/adm/adm.js` (panel `departamento='ADM'`); panel/route React nuevo en `src/portales/fin/` (`departamento='FIN'`, reemplaza el modal `wa.me`); `src/modules/gateway-config/` depto-aware o absorbido, arreglar la consola de prueba falsa; KPIs por departamento; (opcional) vista read-only agregada en DIR | `whatsapp-manual-send` (UI) | F5 |
| **F8. Opt-out mínimo** | Edge function `whatsapp-optout-webhook` (~40 líneas): valida secret -> `esOptOut(texto)` -> `fn_whatsapp_optout(jid, 'usuario_baja')`; footer "Responda BAJA para no recibir más mensajes" en plantillas R6 / campañas / cobranza; acción manual "Dar de baja" en el portal; `whatsapp-webhook` completo tras flag `whatsapp_inbound_full_enabled=false` | `whatsapp-optout-minimal` | F1 |
| **F9. Cutover y limpieza** | Rollout ADM -> FIN; apagar el runner viejo; retirar `whatsapp-dispatcher`, `process-whatsapp-queue.js`, `docker/whatsapp-gateway/`; rotar `EVOLUTION_API_KEY` y `sk_live_soi_baileys_secure`; confirmar que ninguna credencial viva quedó en el binario ni en el historial activo | (retiro) | F2 a F8 |

### Out of Scope

- Inbound completo (Groq intent, state machine de agendado, `kb.ts` FAQ, captura de leads en `applicants`).
- Instalación Electron dedicada para ACM (se diseña `departamento_envio`, no se construye).
- Firma de código Windows (v1.1).
- Departamentos más allá de ADM y FIN.
- Más de un número por departamento.
- Dashboards de reporting nuevos más allá de KPIs por departamento en los paneles existentes.
- Backfill histórico de `origen` (solo `departamento` se backfillea, todo a `ADM`).

## New Capabilities

| Capacidad | Descripción |
|-----------|-------------|
| `whatsapp-multidept-outbox` | Cola única etiquetada por `departamento` + `origen`; config de una fila por departamento; claim fn parametrizada; caps, ventana horaria y dedup `(jid, departamento)` por departamento; ruteo de todos los productores |
| `whatsapp-device-auth` | Device token por instalación + edge function `whatsapp-gateway` (`/claim`, `/report`, `/heartbeat`); `service_role` aislado en la función; tabla `whatsapp_gateway_devices` con revocación y auditoría por `last_seen_at` |
| `whatsapp-desktop-gateway` | App Electron por departamento (lib runner Baileys + shell); tray, auto-launch, single-instance x2, QR, config de primer arranque, poll gate de horario, `electron-updater`; token en `safeStorage` |
| `whatsapp-manual-send` | Módulo `src/modules/whatsapp-envios/` (DataAdapter) + `fn_whatsapp_encolar_manual`; composición, selector de destinatarios multi fuente, listas guardadas, outbox filtrado; panel reutilizable en ADM (vanilla) y FIN (React) |
| `whatsapp-optout-minimal` | Edge function `whatsapp-optout-webhook` + footer de baja en plantillas + acción manual en portal; flag `whatsapp_inbound_full_enabled` para el resto del inbound |

## Affected Areas

| Área | Impacto | Detalle |
|------|---------|---------|
| `supabase/migrations/` | Nuevo | `hermes_whatsapp_queue` (+`departamento`, +`origen`, índices); `hermes_whatsapp_config` (+`departamento`, +`ventana_inicio/fin`, +`solo_dias_habiles`, índice único parcial, fila FIN); `fn_whatsapp_reclamar_pendientes` overload; parametrizar `fn_whatsapp_cap_hoy` / `fn_whatsapp_enviados_hoy` / conteo horario; `fn_encolar_campania` propaga depto; `campanias_periodo.departamento`; `hermes_reactive_rules.departamento_envio`; tablas nuevas `whatsapp_gateway_devices`, `whatsapp_listas`, `whatsapp_lista_miembros`; `fn_whatsapp_encolar_manual` nueva; `hermes_gateway_health` (`instance_name` -> `<depto>-gateway`) |
| `supabase/functions/` | Nuevo / Modificado / Retiro | Nueva `whatsapp-gateway`; nueva `whatsapp-optout-webhook`; `whatsapp-webhook` reducido tras flag; `whatsapp-dispatcher` **retirado** en F9; `event-spine-logger/handlers/r6|r7|r8-whatsapp-*.ts` setean `departamento` + `origen` |
| `scripts/` | Retiro | `scripts/whatsapp-runner/index.js` extraído a `src/services/`; `supabase/process-whatsapp-queue.js` **retirado** en F9 |
| `src/services/` | Nuevo | `src/services/whatsapp-runner/` (lib Baileys reutilizable) + tests en `tests/` |
| `apps/` | Nuevo | `apps/whatsapp-desktop/` (Electron) |
| `src/modules/` | Nuevo / Modificado | `src/modules/whatsapp-envios/` nuevo; `src/modules/gateway-config/` depto-aware o absorbido (consola de prueba falsa corregida); `src/modules/campanias/` pasa `departamento` |
| `src/portales/adm/adm.js` | Modificado | Nav group + ruta `whatsapp-envios` (vanilla JS) |
| `src/portales/fin/` | Modificado | Panel/route React nuevo; `WhatsAppReminderModal.tsx` y `hooks/useWhatsAppReminders.ts` reemplazan `wa.me` por enqueue real + cooldown en DB |
| `src/portales/_shared/allRegistrars.js` / `src/main.js` | Modificado | Registro de rutas del panel; revisar `gateway-config` legacy |
| `docker/whatsapp-gateway/` | Retiro | Eliminado en F9 |
| Plantillas de mensajes (R6, campañas, cobranza) | Modificado | Footer "Responda BAJA para no recibir más mensajes" |
| Secrets / env | Modificado | `EVOLUTION_API_KEY` y `sk_live_soi_baileys_secure` rotados en F9; secret de `whatsapp-gateway` y de `whatsapp-optout-webhook` nuevos |

## Key Risks + Mitigations

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| **PC del departamento apagada / offline**: sin heartbeat no sale nada de ese depto | Alta | Reintentos con backoff en la app; modo degradado visible en el tray; alerta a DIR si un depto lleva > N horas sin heartbeat en horario laboral (`fn_hermes_gateway_get_live_status`, frescura 60s) |
| **La edge function `whatsapp-gateway` es punto único de falla** en el camino de todo envío | Media | Función delgada y sin estado; reintentos/backoff en la app; la cola persiste en DB, así que un outage solo retrasa, no pierde; monitoreo de errores de la función |
| **~6 call sites que asumen "fila única" de config**: si se olvida uno, lee la config de ADM para todos los deptos en silencio | Media | Auditar y actualizar los 6 en F1 en el mismo PR; test que verifica que la claim fn de FIN no toca la fila de ADM; grep de `WHERE activo` en revisión |
| **Superficie de ban de Baileys con 2 números** | Media | Warm-up por número nuevo (`warmup_inicio`, `warmup_dias`, `cap_diario`); jitter anti-ban ya existente; footer de opt-out; ventana horaria acota el volumen |
| **Cumplimiento de opt-out** si solo se hace el path del webhook mínimo y nadie lee las respuestas | Media | Webhook mínimo automático (no depende de que un humano lea) + footer en todas las plantillas + acción manual como complemento; dedup por `(jid, departamento)` no debilita el opt-out (que es global por jid) |
| **Secretos en el binario Electron** | Alta si no se revisa | Revisión de seguridad obligatoria del artefacto antes de distribuir; el binario solo tiene el device token (revocable), nunca `service_role` ni `anon`; `safeStorage` (DPAPI / Keychain) para el token en disco |
| **Duplicación de panel ADM (vanilla) vs FIN (React)** | Media | `src/modules/whatsapp-envios/` expone una API de datos limpia (DataAdapter); solo se duplica la capa de UI, no la lógica; `fn_whatsapp_encolar_manual` es el único punto de entrada |
| **Cambio de firma de `fn_whatsapp_reclamar_pendientes`** rompe consumidores existentes | Baja | Overload: se mantiene `(p_limite int)` como compat que delega a `(p_departamento => 'ADM', p_limite)`; caps con `p_departamento` default NULL = global |
| **Backfill de `departamento` en cola existente** | Baja | Columna nullable -> `UPDATE ... SET departamento = 'ADM'` -> `SET DEFAULT 'ADM'` + `NOT NULL`, todo en una migración transaccional |
| **F1 y F4 superan el presupuesto de 400 líneas** | Media | PRs encadenados o `size:exception` aprobado; F1 se puede partir (migraciones vs call sites), F4 por subsistema (tray/QR/updater) |

## Rollout Plan

| Paso | Acción | Criterio de avance |
|------|--------|--------------------|
| 1 | Desplegar migraciones F1 + edge function `whatsapp-gateway` (F2) | Migraciones aplicadas, claim fn de ADM y FIN responden, fila FIN existe `activo=false` |
| 2 | Instalar la app en la PC de ADM: provisionar device token, pairing por QR, activar auto-launch | App conecta, heartbeat fresco, QR escaneado |
| 3 | Apagar el Baileys runner manual; ADM despacha solo por la app | Sin ejecución manual durante 1-2 días |
| 4 | **Validar 1-2 días con tráfico real de ADM** (campañas + avisos + R6/R7/R8 ruteados al número ADM) | ACK real en > 95% de los envíos dentro de horario; sin bans; opt-out funcionando |
| 5 | Activar la fila FIN (`activo=true`), instalar la app en la PC de FIN, integrar cobranza (`WhatsAppReminderModal.tsx` -> enqueue real) | FIN despacha desde su PC; cooldown en DB |
| 6 | Validar FIN con tráfico real de cobranza | Recordatorios despachados, sin doble envío por cooldown |
| 7 | **F9 cutover**: retirar `whatsapp-dispatcher`, `process-whatsapp-queue.js`, `docker/whatsapp-gateway/`; rotar `EVOLUTION_API_KEY` y `sk_live_soi_baileys_secure` | Código y secrets muertos eliminados; revisión de seguridad del binario firmada |

**Rollback:** cada fase de DB es reversible por migración (`DROP COLUMN` / `DROP FUNCTION` del overload nuevo). Si la app Electron falla en producción, se puede reactivar el Baileys runner manual apuntando a la claim fn compat `(p_limite int)` mientras se corrige, sin tocar el esquema.

## Open Questions (diferidas a spec / design)

| # | Pregunta | Fase que decide |
|---|----------|-----------------|
| 1 | Forma exacta del payload de `/claim` y `/report` (batch size, formato de `results`, manejo de ACK parcial) | spec + design F2 |
| 2 | `dias_habiles int[]` configurable vs solo `solo_dias_habiles boolean` (lun-vie fijo) | spec F1 |
| 3 | Detección de single-instance cruzada: umbral de frescura del heartbeat para considerar "otra PC ya está despachando" | design F4 |
| 4 | Esquema de `whatsapp_listas` / `whatsapp_lista_miembros` (¿miembros por jid o por FK a `alumnos` / `representantes`?) | spec F5 |
| 5 | `gateway-config` legacy: absorber dentro de `whatsapp-envios` o mantener como vista de admin separada depto-aware | design F7 |
| 6 | Estrategia de `electron-updater` (feed de release, canal, rollback de versión) | design F4 |
| 7 | Formato del footer de opt-out por plantilla (¿texto fijo o variable por departamento?) | spec F8 |

## Dependencies

- Supabase con Edge Functions habilitadas (proyecto SOI).
- `@whiskeysockets/baileys` ^6.7.13 (ya en el repo, vía `scripts/whatsapp-runner/`).
- Electron + `electron-updater` + `electron-log` (nuevas dependencias en `apps/whatsapp-desktop/`).
- Infra HERMES existente: `hermes_whatsapp_queue`, `hermes_whatsapp_config`, `hermes_gateway_health`, `whatsapp_optout`, `whatsapp_consentimientos`, `fn_hermes_gateway_heartbeat`.
- Change relacionado: `soi-event-spine` (los handlers R6/R7/R8 viven en `event-spine-logger`).
- Una PC dedicada por departamento (ADM, FIN) encendida durante el horario laboral.

## Success Criteria

- [ ] `hermes_whatsapp_queue` tiene `departamento NOT NULL DEFAULT 'ADM'` y `origen`, con la cola histórica backfilleada a `ADM`.
- [ ] `hermes_whatsapp_config` tiene una fila por departamento con índice único parcial `(departamento) WHERE activo`; existen filas ADM y FIN.
- [ ] `fn_whatsapp_reclamar_pendientes('ADM', n)` devuelve solo mensajes de ADM y respeta la ventana 10:00-19:00 America/Santo_Domingo; la firma vieja `(n)` sigue funcionando.
- [ ] La edge function `whatsapp-gateway` responde `/claim`, `/report`, `/heartbeat` autenticando por device token; `whatsapp_gateway_devices` permite revocar un equipo al instante.
- [ ] La app Electron de ADM despacha automáticamente desde la PC de ADM, con tray, auto-launch, QR y poll gate de horario; el binario no contiene `service_role` ni `anon`.
- [ ] `fn_whatsapp_encolar_manual('FIN', ...)` encola cobranza de FIN respetando opt-out y guard de contenido, y devuelve `{encolados, omitidos_optout, bloqueados}`.
- [ ] `WhatsAppReminderModal.tsx` ya no usa `wa.me`; el cooldown vive en DB.
- [ ] R6/R7/R8 y campañas encolan con `departamento` + `origen` correctos y salen por el número de ADM.
- [ ] Responder "BAJA" da de baja el jid en `whatsapp_optout` vía `whatsapp-optout-webhook`; las plantillas llevan el footer.
- [ ] Dedup 1 msg/jid/24h opera por `(jid, departamento)`.
- [ ] `whatsapp-dispatcher`, `process-whatsapp-queue.js` y `docker/whatsapp-gateway/` eliminados; `EVOLUTION_API_KEY` y `sk_live_soi_baileys_secure` rotados.
- [ ] Tests (Vitest, `npm run test:run`) cubren: filtrado por departamento en la claim fn, aislamiento de config ADM/FIN, `fn_whatsapp_encolar_manual` (opt-out, guard, retorno), overload compat, gate de horario.
