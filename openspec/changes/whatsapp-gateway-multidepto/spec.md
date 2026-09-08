# Delta Spec: whatsapp-gateway-multidepto

Enum `departamento` valido: DIR / ACM / ADM / FIN / LOG / COM / TECNICO / LUT.
Zona horaria de referencia: `America/Santo_Domingo`. Naming preservado: `hermes_whatsapp_*` y `whatsapp_*`.

---

## Capability: whatsapp-multidept-outbox

## ADDED Requirements

### Requirement: Cola etiquetada por departamento y origen

`hermes_whatsapp_queue` MUST tener las columnas `departamento text` y `origen text`.
`departamento` MUST terminar `NOT NULL DEFAULT 'ADM'` y restringido al enum de departamentos.
`origen` MUST aceptar `r6 | r7 | r8 | campania | cobranza | manual | inbound_optout`.
La migracion MUST ser idempotente y transaccional: agregar la columna nullable, backfillear todas las filas existentes a `'ADM'`, luego fijar `DEFAULT` y `NOT NULL`.

#### Scenario: Backfill de la cola historica

- GIVEN una `hermes_whatsapp_queue` con filas previas sin `departamento`
- WHEN se aplica la migracion de fundacion
- THEN toda fila preexistente queda con `departamento = 'ADM'`
- AND la columna queda `NOT NULL DEFAULT 'ADM'`

#### Scenario: Insercion sin origen es rechazada por los productores

- GIVEN un productor que encola un mensaje
- WHEN el INSERT no setea `origen`
- THEN la fila queda con `origen` nulo y el checklist de ruteo la marca como no conforme
- AND ningun productor de v1 debe dejar `origen` nulo

### Requirement: Config de una fila por departamento

`hermes_whatsapp_config` MUST tener `departamento text`, `ventana_inicio time`, `ventana_fin time` y `solo_dias_habiles boolean DEFAULT true`.
MUST existir un indice unico parcial `CREATE UNIQUE INDEX ... ON hermes_whatsapp_config (departamento) WHERE activo` (no `ADD CONSTRAINT ... WHERE`).
MUST existir una fila `ADM` (`activo = true`) y una fila `FIN` (`activo = false` hasta el rollout de FIN).
`fn_whatsapp_cap_hoy`, `fn_whatsapp_enviados_hoy` y el conteo horario MUST aceptar `p_departamento` y contar solo filas de ese departamento; con `p_departamento` nulo mantienen el comportamiento global de compat.

#### Scenario: Solo una config activa por departamento

- GIVEN una fila de config activa para `ADM`
- WHEN se intenta insertar una segunda fila activa para `ADM`
- THEN el indice unico parcial rechaza el INSERT
- AND una fila `ADM` con `activo = false` si se permite

#### Scenario: FIN nace inactivo

- GIVEN la migracion de fundacion aplicada
- WHEN se consulta la config de `FIN`
- THEN existe exactamente una fila `FIN` con `activo = false`

### Requirement: Claim fn parametrizada por departamento

`fn_whatsapp_reclamar_pendientes(p_departamento text, p_limite int)` MUST reclamar solo filas `estado = 'pendiente'` con `departamento = p_departamento` e `intentos < 3`, usando `FOR UPDATE ... SKIP LOCKED`.
La fn MUST aplicar, leyendo unicamente la config de `p_departamento`: kill switch, ventana horaria (`ventana_inicio`/`ventana_fin` y `solo_dias_habiles`) en `America/Santo_Domingo`, caps diario/horario y warm-up del departamento, dedup por `(jid, departamento)` en 24h, opt-out global por `jid`, y consentimiento de campania cuando `origen = 'campania'`.
La firma antigua `fn_whatsapp_reclamar_pendientes(p_limite int)` MUST conservarse como overload de compat que delega en `('ADM', p_limite)`.
`GRANT EXECUTE` MUST seguir restringido a `service_role`.

#### Scenario: Aislamiento estricto entre departamentos

- GIVEN filas `pendiente` de `ADM` y de `FIN`, y ambas configs presentes
- WHEN se llama `fn_whatsapp_reclamar_pendientes('ADM', 10)`
- THEN solo se devuelven y bloquean filas de `ADM`
- AND no se lee ni se evalua la fila de config de `FIN`
- AND los contadores de cap consultados son los de `ADM`

#### Scenario: Ventana horaria del departamento

- GIVEN la config de `ADM` con `ventana_inicio = 10:00`, `ventana_fin = 19:00`, `solo_dias_habiles = true`
- WHEN se llama la claim fn un sabado o a las 20:30 hora local
- THEN devuelve cero filas
- AND las filas siguen en `pendiente` sin incrementar `intentos`

#### Scenario: Dedup por par (jid, departamento)

- GIVEN un `jid` que recibio un mensaje de `ADM` hace 2 horas
- WHEN existe una fila `pendiente` de `FIN` para el mismo `jid`
- THEN `fn_whatsapp_reclamar_pendientes('FIN', ...)` si devuelve esa fila
- AND una segunda fila `pendiente` de `ADM` para ese `jid` queda diferida por dedup

#### Scenario: Overload de compat

- GIVEN un consumidor que llama `fn_whatsapp_reclamar_pendientes(50)`
- WHEN se ejecuta
- THEN se comporta identico a `fn_whatsapp_reclamar_pendientes('ADM', 50)`

---

## Capability: whatsapp-device-auth

## ADDED Requirements

### Requirement: Tabla de dispositivos gateway

MUST crearse `whatsapp_gateway_devices` con `id uuid pk`, `departamento text`, `token_hash text`, `nombre_equipo text`, `activo boolean`, `created_at timestamptz`, `last_seen_at timestamptz`, `revoked_at timestamptz`.
El token en claro MUST mostrarse una sola vez al provisionar; en la tabla solo se guarda el hash.

#### Scenario: Provisioning de un dispositivo

- GIVEN un admin que provisiona un equipo para `ADM`
- WHEN se crea el dispositivo
- THEN se persiste `token_hash` (no el token en claro), `departamento = 'ADM'`, `activo = true`
- AND el token en claro se muestra una unica vez

### Requirement: Edge function whatsapp-gateway autenticada por device token

La edge function `whatsapp-gateway` MUST exponer `POST /claim`, `POST /report`, `POST /heartbeat`.
Cada request MUST validar el token por comparacion de hash y exigir `activo = true` y `revoked_at IS NULL`.
El `service_role` MUST vivir solo como secret de la edge function; nunca se devuelve al cliente.
El departamento efectivo de la operacion MUST derivarse del dispositivo en el servidor; un parametro `departamento` enviado por el cliente MUST ignorarse.
`last_seen_at` MUST actualizarse en toda llamada autenticada.

#### Scenario: Token valido reclama su cola

- GIVEN un token valido de un dispositivo de `ADM`
- WHEN llama `POST /claim`
- THEN la funcion invoca la claim fn con `departamento = 'ADM'` derivado del dispositivo
- AND `last_seen_at` del dispositivo se actualiza

#### Scenario: Revocacion inmediata

- GIVEN un dispositivo con `revoked_at` recien seteado
- WHEN ese token llama cualquier endpoint
- THEN la funcion responde 401
- AND no se reclama ni se reporta ninguna fila

#### Scenario: Cliente no puede elevar su alcance

- GIVEN un token de un dispositivo de `FIN`
- WHEN el body incluye `departamento = 'ADM'`
- THEN la operacion se ejecuta contra `FIN`
- AND el parametro del cliente se descarta

---

## Capability: whatsapp-desktop-gateway

## ADDED Requirements

### Requirement: Instancia unica local y cruzada

La app Electron MUST tomar un lock de instancia unica del SO (`requestSingleInstanceLock`).
Antes de despachar MUST consultar `fn_hermes_gateway_get_live_status('<depto>-gateway')`; si hay un heartbeat fresco (frescura 60s) de un `nombre_equipo` distinto, la instancia entra en standby y no llama `/claim`.

#### Scenario: Segunda PC del mismo departamento

- GIVEN la PC A de `ADM` despachando con heartbeat fresco
- WHEN se abre la app en la PC B de `ADM`
- THEN la PC B detecta el heartbeat de A y queda en standby
- AND solo una PC llama `/claim`

### Requirement: Gate de horario en el polling

La app MUST NOT llamar `/claim` fuera de la ventana horaria del departamento; el tray MUST reflejar el estado "fuera de horario".

#### Scenario: Fuera de horario

- GIVEN la ventana de `ADM` 10:00-19:00 dias habiles
- WHEN el reloj local marca las 21:00
- THEN la app no emite `/claim`
- AND el tray muestra estado fuera de horario

### Requirement: Confirmacion real del servidor antes de marcar enviado

La app MUST esperar el ACK real de Baileys (status >= 2) antes de reportar la fila como `enviado`; si no llega, la reporta como reintento o fallo.
Ante desconexion MUST reconectar automaticamente.

#### Scenario: Sin ACK del servidor

- GIVEN un mensaje despachado a Baileys
- WHEN no se recibe status >= 2 dentro del timeout
- THEN la fila no se reporta como `enviado`
- AND se reintenta mientras `intentos < 3`

### Requirement: Primer arranque, credenciales y auto-launch

En el primer arranque la app MUST pedir el device token y el departamento, y ofrecer una ventana de QR para el pairing de Baileys.
El token MUST guardarse cifrado con `safeStorage`; la auth de Baileys y los logs MUST vivir en `app.getPath('userData')`.
La app MUST registrarse para auto-arranque al iniciar sesion del SO.

#### Scenario: Configuracion inicial

- GIVEN una instalacion nueva
- WHEN el usuario ingresa token y departamento y escanea el QR
- THEN el token queda en `safeStorage` y la sesion Baileys en `userData`
- AND la app queda configurada para auto-arranque

---

## Capability: whatsapp-manual-send

## ADDED Requirements

### Requirement: Modulo de envios manuales con DataAdapter

MUST crearse `src/modules/whatsapp-envios/` con adaptadores Mock y Supabase que expongan la misma API de datos.
El `departamento` del envio MUST fijarlo el portal anfitrion; el usuario nunca lo elige.

#### Scenario: Paridad Mock / Supabase

- GIVEN un test del modulo
- WHEN corre contra el adaptador Mock y contra el de Supabase
- THEN ambos exponen las mismas firmas y formas de retorno

### Requirement: RPC fn_whatsapp_encolar_manual

`fn_whatsapp_encolar_manual(p_departamento text, p_destinatarios jsonb, p_mensaje text, p_plantilla_id uuid)` MUST ser `SECURITY DEFINER` y:
validar el rol del llamante, aplicar el guard de contenido (`whatsappSecurityGuard`), filtrar destinatarios en `whatsapp_optout`, respetar la dedup `(jid, departamento)`, e insertar filas con `origen = 'manual'` y `estado = 'pendiente'`.
MUST devolver `{ encolados, omitidos_optout, bloqueados }`.

#### Scenario: Encolado con opt-out y guard

- GIVEN 5 destinatarios, uno en opt-out y uno con contenido bloqueado por el guard
- WHEN se llama `fn_whatsapp_encolar_manual('FIN', ...)`
- THEN se insertan 3 filas `origen = 'manual'`, `estado = 'pendiente'`, `departamento = 'FIN'`
- AND el retorno es `{ encolados: 3, omitidos_optout: 1, bloqueados: 1 }`

#### Scenario: Rol insuficiente

- GIVEN un usuario sin rol autorizado para el departamento
- WHEN llama la RPC
- THEN la RPC falla sin insertar filas

### Requirement: Fuentes de destinatarios y visor de outbox

El selector MUST soportar roster de clase, listas guardadas (`whatsapp_listas` / `whatsapp_lista_miembros`) y numeros ad-hoc.
El visor de outbox MUST filtrar por `departamento` y permitir reintentar filas fallidas de ese departamento.

#### Scenario: Reintento acotado al departamento

- GIVEN filas fallidas de `ADM` y de `FIN`
- WHEN un usuario del portal de `FIN` reintenta desde el visor
- THEN solo se reencolan filas de `FIN`

---

## Capability: whatsapp-producer-routing

## ADDED Requirements

### Requirement: Handlers R6/R7/R8 etiquetan departamento y origen

Los handlers R6/R7/R8 de `event-spine-logger` MUST setear `departamento` y `origen` en cada INSERT, leyendo `hermes_reactive_rules.departamento_envio` con default `'ADM'`.

#### Scenario: R6 encola por el numero de ADM

- GIVEN una regla R6 con `departamento_envio` nulo
- WHEN el handler encola un aviso a padres
- THEN la fila queda con `departamento = 'ADM'` y `origen = 'r6'`

### Requirement: Campanias propagan departamento

`campanias_periodo.departamento` MUST existir con `DEFAULT 'ADM'` y `fn_encolar_campania` MUST propagarlo a cada fila con `origen = 'campania'`.

#### Scenario: Encolado de campania

- GIVEN una campania sin departamento explicito
- WHEN corre `fn_encolar_campania`
- THEN las filas quedan `departamento = 'ADM'`, `origen = 'campania'`

### Requirement: Cobranza FIN usa la cola real

`WhatsAppReminderModal.tsx` MUST encolar via `fn_whatsapp_encolar_manual('FIN', ...)` y MUST NOT abrir `wa.me`.
El cooldown anti reenvio MUST vivir en la base de datos, no en `localStorage`.

#### Scenario: Recordatorio de cobranza

- GIVEN un asesor de FIN que envia un recordatorio
- WHEN confirma en el modal
- THEN se llama `fn_whatsapp_encolar_manual('FIN', ...)` y no se abre ningun deep link
- AND un segundo intento dentro del cooldown queda bloqueado por estado en DB

---

## Capability: whatsapp-optout-minimal

## ADDED Requirements

### Requirement: Edge function whatsapp-optout-webhook

MUST crearse `whatsapp-optout-webhook` que valide un secret compartido, evalue `esOptOut(texto)` y, si aplica, llame `fn_whatsapp_optout(jid, 'usuario_baja')`.
El resto del inbound (`whatsapp-webhook` completo) MUST quedar dormido detras del flag `whatsapp_inbound_full_enabled` con default `false`.

#### Scenario: Respuesta BAJA

- GIVEN un inbound con texto "BAJA"
- WHEN llega al webhook con secret valido
- THEN el `jid` queda en `whatsapp_optout`
- AND deja de recibir mensajes de todos los departamentos

#### Scenario: Secret invalido

- GIVEN un request sin el secret correcto
- WHEN llega al webhook
- THEN responde 401 y no modifica `whatsapp_optout`

#### Scenario: Inbound completo permanece inactivo

- GIVEN `whatsapp_inbound_full_enabled = false`
- WHEN llega un inbound que no es opt-out
- THEN no se procesa intent, FAQ ni agendado

### Requirement: Footer de baja y accion manual

Las plantillas de R6, campañas y cobranza MUST incluir un footer "Responda BAJA para no recibir mas mensajes".
El portal MUST ofrecer una accion manual "Dar de baja" que llame `fn_whatsapp_optout`.

#### Scenario: Footer presente

- GIVEN el render de una plantilla R6, de campania o de cobranza
- WHEN se genera el texto final
- THEN incluye el footer de baja

#### Scenario: Baja manual desde el portal

- GIVEN un operador que usa "Dar de baja" sobre un contacto
- WHEN confirma
- THEN el `jid` queda en `whatsapp_optout`

---

## Capability: whatsapp-gateway-observability

## ADDED Requirements

### Requirement: Estado del gateway por departamento en los paneles

Los paneles de ADM y FIN MUST mostrar, para su departamento: `fn_whatsapp_enviados_hoy(p_departamento)`, el estado vivo del gateway (`fn_hermes_gateway_get_live_status('<depto>-gateway')`) y los conteos de cola por estado.

#### Scenario: Panel de FIN muestra solo FIN

- GIVEN heartbeats y colas de `ADM` y `FIN`
- WHEN se abre el panel de FIN
- THEN los KPIs y conteos corresponden solo a `FIN`

### Requirement: Watchdog de cola atascada y heartbeat ausente

MUST existir un watchdog que alerte a los admins cuando, dentro de la ventana horaria de un departamento:
hay filas `pendiente` o `procesando` mas viejas que N minutos, o no hay heartbeat por mas de N minutos.
Las alertas MUST deduplicarse para no repetir la misma condicion.

#### Scenario: Cola atascada en horario

- GIVEN filas `procesando` de `ADM` con antiguedad mayor a N minutos a las 14:00
- WHEN corre el watchdog
- THEN se emite una alerta a los admins
- AND una segunda corrida con la misma condicion no duplica la alerta

#### Scenario: Sin heartbeat en horario

- GIVEN ningun heartbeat de `<ADM>-gateway` en mas de N minutos a las 11:00
- WHEN corre el watchdog
- THEN se alerta que la PC de ADM puede estar apagada u offline

#### Scenario: Fuera de horario no alerta

- GIVEN filas `pendiente` de `ADM` a las 22:00
- WHEN corre el watchdog
- THEN no se emite alerta por cola atascada

---

## Non-Functional Requirements

### Requirement: Solo salida

El sistema MUST ser solo de salida en v1. El unico inbound permitido es el path de opt-out; todo otro inbound MUST permanecer detras de `whatsapp_inbound_full_enabled = false`.

#### Scenario: Inbound no-optout ignorado

- GIVEN un mensaje entrante que no es "BAJA"
- WHEN llega al sistema
- THEN no genera respuesta ni efecto secundario

### Requirement: Manejo de secretos y datos

El binario Electron MUST NOT contener `service_role` ni `anon` key; solo el device token revocable, cifrado con `safeStorage`.
El sistema MUST NOT loguear contenido de mensajes en claro fuera de la fila de la cola.

#### Scenario: Revision de seguridad del artefacto

- GIVEN el binario Electron construido
- WHEN se inspecciona en busca de credenciales
- THEN no aparece `service_role` ni `anon` key

### Requirement: Migraciones idempotentes y seguras

Las migraciones MUST usar `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` y ser reaplicables.
Los indices unicos parciales MUST crearse con `CREATE UNIQUE INDEX ... WHERE`, nunca con `ADD CONSTRAINT ... WHERE`.

#### Scenario: Reaplicar la migracion

- GIVEN una migracion de este cambio ya aplicada
- WHEN se ejecuta de nuevo
- THEN no falla ni duplica objetos

### Requirement: Cobertura de tests (TDD estricto)

Bajo TDD estricto (Vitest, `npm run test:run`), MUST existir tests que fallen primero y luego pasen para:
filtrado por departamento en la claim fn, aislamiento de config ADM/FIN, `fn_whatsapp_encolar_manual` (opt-out, guard, forma de retorno), overload de compat, gate de horario, y validacion de token de la edge function.
Los tests de runner/lib MUST vivir bajo `tests/`.

#### Scenario: Suite verde

- GIVEN la suite de este cambio
- WHEN se ejecuta `npm run test:run`
- THEN pasa sin fallos
- AND cada requerimiento critico tiene al menos un test asociado

---

## Acceptance Criteria Summary

| ID | Criterio | Estado |
|----|----------|--------|
| AC-01 | `hermes_whatsapp_queue` con `departamento NOT NULL DEFAULT 'ADM'` + `origen`; historico backfilleado a `ADM` | Requerido |
| AC-02 | `hermes_whatsapp_config` una fila por depto; indice unico parcial `(departamento) WHERE activo`; filas ADM (activa) y FIN (inactiva) | Requerido |
| AC-03 | `fn_whatsapp_reclamar_pendientes('ADM', n)` aislada por depto + ventana horaria; overload `(n)` compat | Requerido |
| AC-04 | Claim de un depto nunca lee/bloquea/cuenta filas ni config de otro depto | Requerido |
| AC-05 | `whatsapp_gateway_devices` + edge function `/claim` `/report` `/heartbeat` con device token; revocacion inmediata; `last_seen_at` en cada llamada | Requerido |
| AC-06 | `service_role` solo en la edge function; departamento derivado en el servidor | Requerido |
| AC-07 | App Electron: instancia unica local + cruzada, gate de horario, ACK real (status >= 2), QR, auto-launch, token en `safeStorage` | Requerido |
| AC-08 | `fn_whatsapp_encolar_manual` valida rol, aplica guard, filtra opt-out, respeta dedup, devuelve `{encolados, omitidos_optout, bloqueados}` | Requerido |
| AC-09 | Dedup 1 msg/jid/24h opera por `(jid, departamento)` | Requerido |
| AC-10 | R6/R7/R8 + campanias etiquetan `departamento` + `origen`; default `'ADM'` | Requerido |
| AC-11 | `WhatsAppReminderModal.tsx` sin `wa.me`; cooldown en DB | Requerido |
| AC-12 | `whatsapp-optout-webhook` da de baja al responder "BAJA"; footer en plantillas R6/campania/cobranza; flag `whatsapp_inbound_full_enabled = false` | Requerido |
| AC-13 | Paneles ADM y FIN muestran enviados hoy, estado vivo y conteos de cola por depto | Requerido |
| AC-14 | Watchdog alerta cola atascada / sin heartbeat en horario, con dedup de alerta | Requerido |
| AC-15 | Binario sin `service_role` ni `anon`; sin log de contenido en claro fuera de la cola | Requerido |
| AC-16 | Migraciones idempotentes; `CREATE UNIQUE INDEX ... WHERE` no `ADD CONSTRAINT` | Requerido |
| AC-17 | Tests Vitex (`npm run test:run`) cubren claim por depto, aislamiento config, encolar_manual, overload, gate horario, token edge fn | Requerido |

---

## Out of Scope (v1)

- Inbound completo (intent Groq, state machine de agendado, FAQ `kb.ts`, captura de leads).
- Instalacion Electron dedicada para ACM (se disena `departamento_envio`, no se construye).
- Firma de codigo Windows (v1.1).
- Departamentos mas alla de ADM y FIN; mas de un numero por departamento.
- Backfill historico de `origen` (solo `departamento` se backfillea).
- Gate de aprobacion para envios manuales (`pendiente_aprobacion` sigue solo para R6).
