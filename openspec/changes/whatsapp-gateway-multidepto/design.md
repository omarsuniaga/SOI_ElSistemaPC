# Design: whatsapp-gateway-multidepto

## Technical Approach

Enfoque A del exploration: una sola cola (`hermes_whatsapp_queue`) etiquetada por
`departamento` + `origen`, `hermes_whatsapp_config` pasa a una fila por
departamento, y la claim fn se parametriza por departamento leyendo unicamente la
config de ese depto. El transporte se consolida en una lib Baileys reutilizable
(`src/services/whatsapp-runner/`) empaquetada en una app Electron por depto que
nunca ve el `service_role`: se autentica con un device token contra una edge
function delgada `whatsapp-gateway` (`/claim`, `/report`, `/heartbeat`). El envio
manual entra por `fn_whatsapp_encolar_manual` y se consume desde un modulo de
datos comun (`src/modules/whatsapp-envios/`) reusado por ADM (vanilla) y FIN
(React). Opt-out minimo por webhook. Evolution API y el dispatcher REST se
retiran en F9.

Zona horaria fija `America/Santo_Domingo`. Enum departamento:
`DIR/ACM/ADM/FIN/LOG/COM/TECNICO/LUT`.

## Architecture Decisions

| # | Decision | Choice | Alternatives rechazadas | Rationale |
|---|----------|--------|-------------------------|-----------|
| D1 | Modelo multi depto | Columna `departamento` en cola + config multi fila | Tabla de cola por depto; `gateway_instances` + FK | Cambio minimo, cola unica para reporting, FK `campania_envio_id` intacta, "agregar LOG" = 1 INSERT |
| D2 | Firma de la claim fn | Overload: nueva `(text,int)` + compat `(int)` que resuelve el unico depto activo o error si >1 | Breaking change directo | El runner viejo sigue vivo durante el rollout; se rompe solo cuando se activa FIN, momento en que el runner viejo ya esta apagado |
| D3 | Auth de la app | Device token + edge fn `whatsapp-gateway` con `service_role` como secret | Rol DB de baja prioridad + RLS; anon key + JWT largo | Cero credencial DB en el binario; revocacion instantanea; scope de depto server-side |
| D4 | Header de auth de la edge fn | `Authorization: Bearer <device_token>`, funcion desplegada con `verify_jwt = false` | `x-device-token` custom | Estandar; el dispatcher/webhook ya corren con secrets propios y verify_jwt off |
| D5 | Dedup 1/jid/24h | Por par `(jid, departamento)` | Global por jid | Un padre bloqueado por aviso de ADM igual recibe el recordatorio de pago de FIN; el opt-out sigue global por jid y no se debilita |
| D6 | Guard de contenido en RPC | Cliente aplica el guard JS completo; la RPC hace un port SQL minimo (patrones de inyeccion + clamp 1200) como defensa en profundidad | Solo cliente; solo servidor | El guard vive en JS y evoluciona; duplicar la lista completa en SQL es fragil, pero una RPC SECURITY DEFINER no puede confiar solo en el cliente |
| D7 | Feed de `electron-updater` | `provider: generic` apuntando a un bucket publico de Supabase Storage (`latest.yml` + `.exe`) | GitHub Releases (repo privado) | El repo es privado: GitHub Releases exige token en el binario o un proxy; Supabase ya existe, bucket de lectura publica = cero infra nueva y cero secreto distribuido |
| D8 | `gateway-config` legacy | Absorber dentro de `whatsapp-envios` como pestana "Estado del gateway" y borrar la ruta suelta | Mantener panel separado depto-aware | Mismo dominio; hoy asume fila unica (superficie de bug); menos nav; la consola de prueba falsa se reemplaza por envio real `origen='test'` |
| D9 | Cooldown de cobranza FIN | Tabla `whatsapp_cobranza_cooldown` + RPC wrapper `fn_whatsapp_cobranza_enviar` | Seguir en `localStorage`; columna en `cuotas` | La logica de cooldown debe ser server-side y auditable; wrapper mantiene el chequeo fuera del cliente |
| D10 | Watchdog | Funcion SQL pura corrida por `pg_cron` directo (sin edge fn), dedup en `whatsapp_watchdog_alertas` | Edge fn dedicada | Igual que los otros crons puros del proyecto; menos piezas |
| D11 | Reaper de `procesando` | El watchdog devuelve a `pendiente` filas `procesando` mas viejas que 15 min (si `intentos < 3`) | Confiar solo en `intentos < 3` | Un `/claim` cuyo `/report` nunca llego dejaria la fila colgada; el reaper cierra ese hueco |
| D12 | Instancia unica cruzada | OS lock local + poll del heartbeat de `<depto>-gateway`; si otro `nombre_equipo` latio hace < 90s -> STANDBY; recheck 60s; tiebreak lexicografico ante arranque simultaneo | Lock por advisory lock en DB | Reusa `fn_hermes_gateway_get_live_status` (frescura ya implementada); sin nueva infra de locking |

## Data Flow

```
Productores (R6/R7/R8, fn_encolar_campania, fn_whatsapp_encolar_manual, cobranza FIN)
        │  INSERT { departamento, origen, jid, mensaje, estado='pendiente' }
        ▼
  hermes_whatsapp_queue  ◄── hermes_whatsapp_config (1 fila por depto: ventana, caps, warmup, activo)
        │
        │  fn_whatsapp_reclamar_pendientes(departamento, limite)   [service_role]
        │  (kill switch, ventana, caps, warmup, dedup (jid,depto), opt-out, consentimiento)
        ▼
  Edge fn whatsapp-gateway  ── valida device_token -> deriva departamento del device
   /claim   ──►  { mensajes, ventana_ok, cap_restante }
   /report  ◄──  { resultados: [{id, estado, error_msg?}] }
   /heartbeat ─► fn_hermes_gateway_heartbeat('<depto>-gateway')
        ▲
        │ HTTPS + Bearer device_token (backoff exponencial si cae)
        │
  App Electron (PC del depto)  ──  src/services/whatsapp-runner (Baileys, ACK real status>=2)
        │
        ▼
  WhatsApp  ──(inbound "BAJA")──►  whatsapp-optout-webhook ─► fn_whatsapp_optout(jid)
```

Paneles ADM/FIN leen via `src/modules/whatsapp-envios/api` (mismo modulo de
datos, cliente Supabase inyectado por el portal anfitrion).

## DB Layer

### hermes_whatsapp_queue (migracion 1)

```sql
ALTER TABLE public.hermes_whatsapp_queue
  ADD COLUMN IF NOT EXISTS departamento text,
  ADD COLUMN IF NOT EXISTS origen text;

UPDATE public.hermes_whatsapp_queue SET departamento = 'ADM' WHERE departamento IS NULL;

ALTER TABLE public.hermes_whatsapp_queue
  ALTER COLUMN departamento SET DEFAULT 'ADM',
  ALTER COLUMN departamento SET NOT NULL;

ALTER TABLE public.hermes_whatsapp_queue
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_queue_departamento_check,
  ADD  CONSTRAINT hermes_whatsapp_queue_departamento_check
       CHECK (departamento IN ('DIR','ACM','ADM','FIN','LOG','COM','TECNICO','LUT'));

ALTER TABLE public.hermes_whatsapp_queue
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_queue_origen_check,
  ADD  CONSTRAINT hermes_whatsapp_queue_origen_check
       CHECK (origen IS NULL OR origen IN
       ('r6','r7','r8','campania','cobranza','manual','inbound_optout','test'));

DROP INDEX IF EXISTS idx_hermes_whatsapp_queue_claim;
CREATE INDEX IF NOT EXISTS idx_hermes_whatsapp_queue_claim
  ON public.hermes_whatsapp_queue (departamento, estado, created_at)
  WHERE estado = 'pendiente';

DROP INDEX IF EXISTS idx_hermes_whatsapp_queue_jid_sent;
CREATE INDEX IF NOT EXISTS idx_hermes_whatsapp_queue_jid_depto_sent
  ON public.hermes_whatsapp_queue (departamento, jid, procesado_at DESC)
  WHERE estado = 'enviado';
```

Secuencia nullable -> backfill -> `NOT NULL DEFAULT`: obligatoria porque la tabla
tiene filas historicas sin depto. `origen` queda nullable (no se backfillea, ver
Non-Goals); los productores de v1 lo setean siempre.

### hermes_whatsapp_config (migracion 2)

```sql
ALTER TABLE public.hermes_whatsapp_config
  ADD COLUMN IF NOT EXISTS departamento text,
  ADD COLUMN IF NOT EXISTS ventana_inicio time NOT NULL DEFAULT '10:00',
  ADD COLUMN IF NOT EXISTS ventana_fin    time NOT NULL DEFAULT '19:00',
  ADD COLUMN IF NOT EXISTS solo_dias_habiles boolean NOT NULL DEFAULT true;

UPDATE public.hermes_whatsapp_config
   SET departamento = 'ADM', instance_name = 'adm-gateway'
 WHERE activo = true AND departamento IS NULL;
UPDATE public.hermes_whatsapp_config SET departamento = 'ADM' WHERE departamento IS NULL;

ALTER TABLE public.hermes_whatsapp_config ALTER COLUMN departamento SET NOT NULL;
ALTER TABLE public.hermes_whatsapp_config
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_config_departamento_check,
  ADD  CONSTRAINT hermes_whatsapp_config_departamento_check
       CHECK (departamento IN ('DIR','ACM','ADM','FIN','LOG','COM','TECNICO','LUT'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_wa_config_depto_activa
  ON public.hermes_whatsapp_config (departamento) WHERE activo;

INSERT INTO public.hermes_whatsapp_config
  (departamento, instance_name, numero_nombre, activo, warmup_desde)
SELECT 'FIN', 'fin-gateway', 'El Sistema PC - Cobranza', false, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.hermes_whatsapp_config WHERE departamento = 'FIN');
```

`instance_name` pasa a ser `<depto>-gateway`; `hermes_gateway_health` no cambia de
esquema, solo de convencion de clave.

### fn_whatsapp_reclamar_pendientes (migracion 3)

```sql
-- caps parametrizadas: p_departamento NULL = comportamiento global de compat
CREATE OR REPLACE FUNCTION public.fn_whatsapp_cap_hoy(p_departamento text DEFAULT NULL) ...
CREATE OR REPLACE FUNCTION public.fn_whatsapp_enviados_hoy(p_departamento text DEFAULT NULL) ...
--   ... WHERE (p_departamento IS NULL OR departamento = p_departamento)

CREATE OR REPLACE FUNCTION public.fn_whatsapp_reclamar_pendientes(
  p_departamento text, p_limite integer DEFAULT NULL)
RETURNS SETOF public.hermes_whatsapp_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cfg public.hermes_whatsapp_config;
  v_enabled boolean;
  v_now  timestamptz := now() AT TIME ZONE 'America/Santo_Domingo';
  v_t    time := v_now::time;
  v_dow  int  := extract(isodow FROM v_now);      -- 1=lun .. 7=dom
  v_ini time; v_fin time;
  v_cap_d int; v_cap_h int; v_env_d int; v_env_h int; v_lim int;
BEGIN
  SELECT * INTO v_cfg FROM public.hermes_whatsapp_config
   WHERE departamento = p_departamento AND activo LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT coalesce((SELECT value FROM public.system_config
         WHERE key='whatsapp_ingest_enabled'),'false')='true' INTO v_enabled;
  IF v_enabled IS NOT true THEN RETURN; END IF;

  -- ventana por depto; fallback a quiet-hours global si las columnas fueran nulas
  v_ini := coalesce(v_cfg.ventana_inicio,
           nullif((SELECT value FROM public.system_config WHERE key='whatsapp_quiet_hours_end'),'')::time);
  v_fin := coalesce(v_cfg.ventana_fin,
           nullif((SELECT value FROM public.system_config WHERE key='whatsapp_quiet_hours_start'),'')::time);
  IF v_ini IS NOT NULL AND (v_t < v_ini OR v_t >= v_fin) THEN RETURN; END IF;
  IF coalesce(v_cfg.solo_dias_habiles,true) AND v_dow > 5 THEN RETURN; END IF;

  v_cap_d := public.fn_whatsapp_cap_hoy(p_departamento);
  v_cap_h := coalesce(v_cfg.cap_horario,0);
  v_env_d := public.fn_whatsapp_enviados_hoy(p_departamento);
  SELECT count(*) INTO v_env_h FROM public.hermes_whatsapp_queue
   WHERE departamento = p_departamento AND estado='enviado'
     AND procesado_at >= now() - interval '1 hour';

  v_lim := least(coalesce(nullif(p_limite,0), v_cfg.batch_size, 10),
                 coalesce(v_cfg.batch_size,10),
                 greatest(v_cap_d - v_env_d,0),
                 greatest(v_cap_h - v_env_h,0));
  IF v_lim <= 0 THEN RETURN; END IF;

  RETURN QUERY
  WITH candidatas AS (
    SELECT q.id
    FROM public.hermes_whatsapp_queue q
    LEFT JOIN public.campania_envios ce ON ce.id = q.campania_envio_id
    WHERE q.departamento = p_departamento
      AND q.estado = 'pendiente'
      AND coalesce(q.intentos,0) < 3
      AND NOT EXISTS (SELECT 1 FROM public.whatsapp_optout o WHERE o.jid = q.jid)
      AND (q.campania_envio_id IS NULL OR EXISTS (
            SELECT 1 FROM public.whatsapp_consentimientos wc
            WHERE wc.jid = q.jid AND wc.campania_id = ce.campania_id
              AND wc.acepta_campania = true))
      AND NOT EXISTS (
            SELECT 1 FROM public.hermes_whatsapp_queue s
            WHERE s.jid = q.jid AND s.departamento = q.departamento
              AND s.estado = 'enviado'
              AND s.procesado_at >= now() - interval '24 hours')
    ORDER BY q.created_at
    FOR UPDATE OF q SKIP LOCKED
    LIMIT v_lim)
  UPDATE public.hermes_whatsapp_queue q
     SET estado='procesando', intentos = coalesce(q.intentos,0)+1
    FROM candidatas c WHERE q.id = c.id
  RETURNING q.*;
END $$;

-- compat wrapper: resuelve el unico depto activo, o error si hay >1
CREATE OR REPLACE FUNCTION public.fn_whatsapp_reclamar_pendientes(p_limite integer DEFAULT NULL)
RETURNS SETOF public.hermes_whatsapp_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_depto text; v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM public.hermes_whatsapp_config WHERE activo;
  IF v_n = 0 THEN RETURN; END IF;
  IF v_n > 1 THEN
    RAISE EXCEPTION 'multiples departamentos activos: use fn_whatsapp_reclamar_pendientes(departamento, limite)';
  END IF;
  SELECT departamento INTO v_depto FROM public.hermes_whatsapp_config WHERE activo;
  RETURN QUERY SELECT * FROM public.fn_whatsapp_reclamar_pendientes(v_depto, p_limite);
END $$;

REVOKE ALL ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text,integer) FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_reclamar_pendientes(text,integer) TO service_role;
```

### whatsapp_gateway_devices (migracion 4)

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.whatsapp_gateway_devices (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento  text NOT NULL CHECK (departamento IN ('DIR','ACM','ADM','FIN','LOG','COM','TECNICO','LUT')),
  token_hash    text NOT NULL UNIQUE,          -- sha256 hex; nunca el token en claro
  nombre_equipo text NOT NULL,
  activo        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  last_seen_at  timestamptz,
  revoked_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_wa_devices_depto_vivo
  ON public.whatsapp_gateway_devices (departamento)
  WHERE activo AND revoked_at IS NULL;

ALTER TABLE public.whatsapp_gateway_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wgd_admin_all ON public.whatsapp_gateway_devices;
CREATE POLICY wgd_admin_all ON public.whatsapp_gateway_devices FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.whatsapp_gateway_devices FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_gateway_devices TO authenticated;
```

Helpers:

| Funcion | Firma | Rol | Comportamiento |
|---------|-------|-----|----------------|
| issue | `fn_whatsapp_device_issue(p_departamento text, p_nombre_equipo text) RETURNS text` | `authenticated` + `es_admin()` | genera `encode(gen_random_bytes(32),'hex')`, guarda `encode(digest(token,'sha256'),'hex')`, devuelve el token en claro **una sola vez** |
| validate | `fn_whatsapp_device_validate(p_token text) RETURNS TABLE(device_id uuid, departamento text)` | `service_role` | match por hash + `activo` + `revoked_at IS NULL`; hace `UPDATE last_seen_at = now()`; 0 filas si invalido |
| revoke | `fn_whatsapp_device_revoke(p_id uuid) RETURNS void` | `authenticated` + `es_admin()` | `revoked_at = now(), activo = false` |

### fn_whatsapp_encolar_manual (migracion 5)

```sql
-- p_destinatarios: [{ "jid": "18291234567", "nombre": "..." }, ...]
CREATE OR REPLACE FUNCTION public.fn_whatsapp_encolar_manual(
  p_departamento  text,
  p_destinatarios jsonb,
  p_mensaje       text,
  p_plantilla_id  uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_enc int:=0; v_opt int:=0; v_blk int:=0; v_ded int:=0;
        v_rec jsonb; v_jid text; v_msg text;
BEGIN
  -- 1. validacion de rol (v1: es_admin(); ver Open Questions para rol por depto)
  IF NOT es_admin() THEN RAISE EXCEPTION 'no autorizado'; END IF;
  -- 2. validacion de entrada (orden: rol -> depto -> mensaje -> destinatarios)
  IF p_departamento IS NULL
     OR p_departamento NOT IN ('DIR','ACM','ADM','FIN','LOG','COM','TECNICO','LUT')
  THEN RAISE EXCEPTION 'departamento invalido'; END IF;
  IF p_mensaje IS NULL OR length(btrim(p_mensaje)) = 0
  THEN RAISE EXCEPTION 'mensaje vacio'; END IF;
  IF jsonb_typeof(p_destinatarios) <> 'array' OR jsonb_array_length(p_destinatarios) = 0
  THEN RAISE EXCEPTION 'sin destinatarios'; END IF;
  -- 3. guard SQL minimo de defensa en profundidad
  IF public.fn_whatsapp_guard_bloquea(p_mensaje) THEN
    RETURN jsonb_build_object('encolados',0,'omitidos_optout',0,
                              'bloqueados', jsonb_array_length(p_destinatarios),
                              'diferidos_dedup',0);
  END IF;
  v_msg := public.fn_whatsapp_clamp(p_mensaje);
  -- 4. por destinatario
  FOR v_rec IN SELECT jsonb_array_elements(p_destinatarios) LOOP
    v_jid := regexp_replace(coalesce(v_rec->>'jid',''), '\D', '', 'g');
    CONTINUE WHEN length(v_jid) < 8;
    IF EXISTS (SELECT 1 FROM public.whatsapp_optout o WHERE o.jid = v_jid)
      THEN v_opt := v_opt + 1; CONTINUE; END IF;
    IF EXISTS (SELECT 1 FROM public.hermes_whatsapp_queue s
               WHERE s.jid = v_jid AND s.departamento = p_departamento
                 AND s.estado = 'enviado'
                 AND s.procesado_at >= now() - interval '24 hours')
      THEN v_ded := v_ded + 1; CONTINUE; END IF;
    INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado, departamento, origen)
      VALUES (v_jid, v_msg, 'pendiente', p_departamento, 'manual');
    v_enc := v_enc + 1;
  END LOOP;
  RETURN jsonb_build_object('encolados',v_enc,'omitidos_optout',v_opt,
                            'bloqueados',v_blk,'diferidos_dedup',v_ded);
END $$;
REVOKE ALL ON FUNCTION public.fn_whatsapp_encolar_manual(text,jsonb,text,uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_encolar_manual(text,jsonb,text,uuid) TO authenticated;
```

`fn_whatsapp_guard_bloquea(text) returns boolean` y `fn_whatsapp_clamp(text) returns text`
son ports SQL de `detectPromptInjection` (lista de regex) y `clampMessageText`
(1200 chars) de `whatsappSecurityGuard.js`. Un test mantiene ambas
implementaciones en paridad sobre un corpus compartido.

### whatsapp_listas / whatsapp_lista_miembros (migracion 5)

```sql
CREATE TABLE IF NOT EXISTS public.whatsapp_listas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL,
  departamento text NOT NULL CHECK (departamento IN ('DIR','ACM','ADM','FIN','LOG','COM','TECNICO','LUT')),
  owner_id     uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (departamento, nombre)
);
CREATE TABLE IF NOT EXISTS public.whatsapp_lista_miembros (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id     uuid NOT NULL REFERENCES public.whatsapp_listas(id) ON DELETE CASCADE,
  jid          text NOT NULL,
  nombre       text,
  persona_tipo text CHECK (persona_tipo IN ('alumno','representante','maestro')),
  persona_id   uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lista_id, jid)
);
-- RLS: authenticated con es_admin() (v1); service_role ALL. Igual patron que gateway_devices.
```

Tradeoff (reusar `comunicaciones` secciones vs tablas nuevas): `comunicaciones`
modela boletines/secciones/calendario, no listas de destinatarios con jid ni FK
opcional a persona; forzar ese modelo acopla dos dominios y complica su RLS. Se
eligen tablas nuevas: superficie chica, `ON DELETE CASCADE` limpio, y el jid
(dato de transporte) no contamina `comunicaciones`.

### Routing de productores (migracion 6)

```sql
ALTER TABLE public.campanias_periodo
  ADD COLUMN IF NOT EXISTS departamento text NOT NULL DEFAULT 'ADM';
ALTER TABLE public.hermes_reactive_rules
  ADD COLUMN IF NOT EXISTS departamento_envio text;   -- NULL -> 'ADM' en el handler
```

`fn_encolar_campania`: resolver `departamento` desde `campanias_periodo` via
`campania_id` (default `'ADM'`), pasar ese depto a `fn_whatsapp_cap_hoy` /
`fn_whatsapp_enviados_hoy`, y el `INSERT ... hermes_whatsapp_queue` agrega
`departamento` + `origen = 'campania'`.

### Cooldown de cobranza FIN (migracion 7)

```sql
CREATE TABLE IF NOT EXISTS public.whatsapp_cobranza_cooldown (
  cuota_id                   uuid PRIMARY KEY,
  familia_id                 uuid,
  alumno_id                  uuid,
  total_vueltas              int  NOT NULL DEFAULT 0,
  fecha_inicio_vuelta_actual timestamptz,
  fecha_ultimo_envio         timestamptz,
  historial                  jsonb NOT NULL DEFAULT '[]',
  updated_at                 timestamptz NOT NULL DEFAULT now()
);
-- RLS: authenticated (es_admin() o rol FIN); service_role ALL.
INSERT INTO public.system_config (key, value, description) VALUES
  ('whatsapp_cobranza_cooldown_horas','48','Horas de enfriamiento entre recordatorios de cobranza por cuota.')
ON CONFLICT (key) DO NOTHING;
```

RPC `fn_whatsapp_cobranza_enviar(p_cuota_id uuid, p_familia_id uuid, p_alumno_id uuid,
p_destinatarios jsonb, p_mensaje text, p_plantilla_id uuid, p_forzar boolean DEFAULT false)`:
chequea cooldown contra la tabla; si `en_cooldown AND NOT p_forzar` -> devuelve
`{ bloqueado_cooldown: true, horas_restantes }`; si pasa, llama
`fn_whatsapp_encolar_manual('FIN', ...)`, hace upsert del cooldown (incrementa
`total_vueltas`, resetea `fecha_inicio_vuelta_actual`, append a `historial`) y
devuelve el shape de `encolar_manual` + `{ vuelta: total_vueltas }`.

### Watchdog + cron (migracion 8)

```sql
CREATE TABLE IF NOT EXISTS public.whatsapp_watchdog_alertas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento text NOT NULL,
  tipo         text NOT NULL CHECK (tipo IN ('cola_atascada','sin_heartbeat')),
  ventana_hora timestamptz NOT NULL,   -- date_trunc('hour', now()) para dedup
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (departamento, tipo, ventana_hora)
);

INSERT INTO public.system_config (key, value, description) VALUES
  ('whatsapp_watchdog_stuck_min','30','Minutos que una fila pendiente/procesando puede vivir en horario antes de alertar.'),
  ('whatsapp_watchdog_heartbeat_min','10','Minutos sin heartbeat en horario antes de alertar.'),
  ('whatsapp_procesando_reap_min','15','Minutos tras los que una fila procesando vuelve a pendiente.')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_watchdog() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; v_now timestamptz := now() AT TIME ZONE 'America/Santo_Domingo';
        v_hora timestamptz := date_trunc('hour', now());
BEGIN
  -- reaper de procesando colgado
  UPDATE public.hermes_whatsapp_queue
     SET estado = CASE WHEN coalesce(intentos,0) < 3 THEN 'pendiente' ELSE 'fallido' END
   WHERE estado = 'procesando'
     AND intentos IS NOT NULL
     AND created_at < now() - ((SELECT value FROM public.system_config
         WHERE key='whatsapp_procesando_reap_min')||' min')::interval;

  FOR r IN SELECT * FROM public.hermes_whatsapp_config WHERE activo LOOP
    CONTINUE WHEN v_now::time < r.ventana_inicio OR v_now::time >= r.ventana_fin;
    CONTINUE WHEN r.solo_dias_habiles AND extract(isodow FROM v_now) > 5;
    -- A. cola atascada
    IF EXISTS (SELECT 1 FROM public.hermes_whatsapp_queue q
               WHERE q.departamento = r.departamento
                 AND q.estado IN ('pendiente','procesando')
                 AND q.created_at < now() - ((SELECT value FROM public.system_config
                     WHERE key='whatsapp_watchdog_stuck_min')||' min')::interval)
    THEN
      INSERT INTO public.whatsapp_watchdog_alertas (departamento,tipo,ventana_hora)
      VALUES (r.departamento,'cola_atascada',v_hora) ON CONFLICT DO NOTHING;
      -- si INSERT aplico (xmax=0) -> notificar admins (fn_hermes_crear_notificacion / task DIR)
    END IF;
    -- B. sin heartbeat
    IF NOT EXISTS (SELECT 1 FROM public.fn_hermes_gateway_get_live_status(r.instance_name) s
                   WHERE s.seconds_since_heartbeat < (SELECT value::int * 60 FROM public.system_config
                         WHERE key='whatsapp_watchdog_heartbeat_min'))
    THEN
      INSERT INTO public.whatsapp_watchdog_alertas (departamento,tipo,ventana_hora)
      VALUES (r.departamento,'sin_heartbeat',v_hora) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

DO $$ BEGIN PERFORM cron.unschedule('whatsapp-watchdog');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('whatsapp-watchdog', '*/10 * * * *',
  $$ SELECT public.fn_whatsapp_watchdog() $$);
```

Nota HANDOFF #7: si el watchdog necesitara `net.http_post` (no es el caso aca),
la URL del proyecto va hardcodeada `https://zmhmdvmyeyswunurcyow.supabase.co`,
igual que `20260821000000_fix_event_spine_cron_and_permissions.sql`.

## Edge Function `whatsapp-gateway`

Deno `Deno.serve`, CORS identico a `whatsapp-dispatcher`
(`Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`).
Desplegar con `verify_jwt = false` en `supabase/config.toml`. Ruteo por sufijo de
path (`/whatsapp-gateway/claim` etc.). Toda request:
`Authorization: Bearer <device_token>` -> `fn_whatsapp_device_validate` ->
`{ device_id, departamento }` o `401 { error: "token_invalido" }`. El
`departamento` sale SIEMPRE del device; un `departamento` en el body se ignora.

### POST /claim

```jsonc
// request (body opcional)
{ "limite": 5 }
// 200
{
  "mensajes": [ { "id": "uuid", "jid": "18291234567", "mensaje": "texto ya clampeado" } ],
  "ventana_ok": true,
  "cap_restante": 42
}
// fuera de ventana / cap agotado
{ "mensajes": [], "ventana_ok": false, "cap_restante": 0 }
```

Server: `fn_whatsapp_reclamar_pendientes(departamento, limite)`. `ventana_ok` se
deriva de si la fn devolvio filas o de una consulta barata a la config;
`cap_restante = cap_hoy - enviados_hoy`.

### POST /report

```jsonc
// request
{ "resultados": [
    { "id": "uuid", "estado": "enviado", "procesado_at": "2026-09-07T18:04:00Z" },
    { "id": "uuid", "estado": "fallido", "error_msg": "timeout ACK servidor" }
] }
// 200
{ "aplicados": 2, "ignorados": 0 }
```

Server, por fila (idempotente, solo transiciona filas `estado='procesando'` del
`departamento` del device):
- `enviado` -> `estado='enviado', procesado_at=coalesce(body, now())` (dispara el
  trigger `trg_sync_campania_envio`).
- `fallido` -> si `intentos >= 3` -> `estado='fallido', error_msg`; si no ->
  `estado='pendiente'` (reintento en el proximo claim).

### POST /heartbeat

```jsonc
// request
{ "status": "connected", "phone": "18295550188", "battery": null, "qr": null,
  "nombre_equipo": "PC-ADM-01" }
// 200
{ "ok": true, "instance_name": "adm-gateway",
  "owner_equipo": "PC-ADM-01", "seconds_since_heartbeat": 4.1 }
```

Server: `fn_hermes_gateway_heartbeat('<depto>-gateway', status, phone, battery,
qr, jsonb_build_object('nombre_equipo', nombre_equipo))`, luego lee
`fn_hermes_gateway_get_live_status` y devuelve `owner_equipo` (=
`metadata->>'nombre_equipo'`) y `seconds_since_heartbeat` para que una segunda PC
decida standby.

### Rate / replay

TLS cubre el replay de red. `/claim` es seguro ante doble llamada por
`FOR UPDATE SKIP LOCKED`; `/report` solo mueve filas `procesando`, asi que
reenviarlo no hace dano. `last_seen_at` da visibilidad de frecuencia; un rate
limit duro (p.ej. > 2 req/s por device -> `429`) queda como fast-follow.

### Modo degradado (app)

Si la edge fn no responde: backoff exponencial `5s, 10s, 20s, ... , 300s` cap;
el tray muestra "Sin conexion al servidor (reintentando)"; **nunca** se cierra el
socket Baileys (la sesion se mantiene tibia y el inbound de opt-out se sigue
reenviando). Las filas ya reclamadas cuyo `/report` no llego se reintentan al
reconectar; las que quedaron en `procesando` sin `/report` las recupera el reaper
del watchdog. La cola vive en DB: un outage retrasa, no pierde.

## Runner Library `src/services/whatsapp-runner/`

| Modulo | Responsabilidad | Naturaleza | Tests (`tests/whatsapp-runner/`) |
|--------|-----------------|------------|----------------------------------|
| `businessHours.js` | `dentroDeVentana(now, { inicio, fin, soloDiasHabiles, tz })` -> bool | **pura** | bordes de ventana, sabado/domingo, tz |
| `ackWaiter.js` | `createAckWaiter()` -> `{ waitFor(id, timeoutMs), onUpdate(updates) }` | casi pura (timers inyectables) | resuelve con status>=2, rechaza por timeout |
| `contentGuard.js` | re-export de `src/modules/hermes/api/whatsappSecurityGuard.js` | passthrough | n/a (cubierto por el guard) |
| `edgeClient.js` | `createEdgeClient({ baseUrl, deviceToken, fetchImpl })` -> `claim/report/heartbeat` | side-effect HTTP, `fetch` inyectable | arma requests correctos, parsea responses, tira en 401 |
| `socket.js` | `createSocket({ authDir, logger })`: ciclo Baileys, reconexion con backoff, `creds.update` | side-effecting | smoke con mock de Baileys |
| `dispatchLoop.js` | `createDispatchLoop({ edgeClient, socket, ackWaiter, guard, businessHours, config, logger })`: `tick()` = claim -> enviar -> esperar ACK -> report | orquestacion; `tick()` testable con todo mockeado | claim vacio = noop; N msgs = N envios + estados correctos; ACK timeout -> fallido/retry; `ventana_ok=false` -> no envia |
| `index.js` | `createRunner(runnerConfig)` compone y expone `{ start, stop, on }` | composicion | smoke |

Config inyectada por Electron (sin `process.env` dentro de la lib):

```js
const runnerConfig = {
  edgeFnUrl:     'https://<ref>.supabase.co/functions/v1/whatsapp-gateway',
  deviceToken:   '<desde safeStorage>',
  instanceName:  'adm-gateway',      // '<depto>-gateway'
  departamento:  'ADM',
  nombreEquipo:  'PC-ADM-01',
  authDir:       '<userData>/baileys_auth',
  pollIntervalMs: 6000,
  claimLimit:     5,
  logger,                            // electron-log
}
```

La ventana horaria efectiva llega en la respuesta de `/claim` (`ventana_ok`); el
loop tambien la evalua localmente con `businessHours.js` para no golpear la edge
fn fuera de horario.

## Electron Shell `apps/whatsapp-desktop/`

```
apps/whatsapp-desktop/
  package.json            electron, electron-builder, electron-updater, electron-log
  electron-builder.yml    target nsis (win x64); dmg mac opcional; asar:true
  src/main/
    index.js              lifecycle
    singleInstance.js     requestSingleInstanceLock + standby cruzado
    tray.js               icono + menu + labels de estado
    autoLaunch.js         app.setLoginItemSettings
    config.js             carga/arma runnerConfig (primer arranque)
    secrets.js            safeStorage encrypt/decrypt -> userData/token.enc
    updater.js            electron-updater (provider: generic)
    windows.js            ventanas QR / config / estado
    ipc.js                ipcMain handlers
  src/preload/index.js    contextBridge (API minima)
  src/renderer/
    config.(html|js)      primer arranque: token + departamento
    qr.(html|js)          QR de pairing
    estado.(html|js)      estado: ventana, cola, heartbeat, tail de logs
  build/                  iconos
```

**Updater**: `provider: generic`, `url` a bucket publico de Supabase Storage
`whatsapp-desktop-releases/` con `latest.yml` + `.exe`. Sin secreto en el binario.
Canal unico `stable` en v1; rollback = re-publicar el `.exe` anterior y bump de
version.

**Instancia unica cruzada**: al arrancar y cada 60s, POST `/heartbeat` (devuelve
`owner_equipo` + `seconds_since_heartbeat`). Si `owner_equipo` existe, `!=
nombreEquipo` y `seconds_since_heartbeat < 90` -> **STANDBY**:
`dispatchLoop.stop()`, tray "otra PC activa (<owner>)", recheck 60s. Si no hay
owner fresco o es uno mismo -> **ACTIVE**: heartbeat cada 30s + dispatchLoop. Ante
arranque simultaneo, jitter 0-15s antes del primer claim y desempate por
`nombre_equipo` menor.

**Secretos**: primer arranque -> `safeStorage.encryptString(token)` -> base64 en
`userData/token.enc`. Al arrancar, si `!safeStorage.isEncryptionAvailable()` ->
ventana de error y **no corre** (sin fallback en claro). Auth Baileys en
`userData/baileys_auth/`. `app.asar` solo lleva codigo.

**IPC (main <-> renderer), minimo**:

| Canal | Direccion | Payload |
|-------|-----------|---------|
| `config:get` | render->main | `{ departamento, nombreEquipo, tokenSet, edgeFnUrl }` |
| `config:save` | render->main | `{ token, departamento } -> { ok }` |
| `qr:subscribe` | main->render | stream `qrString | 'connected'` |
| `estado:get` | render->main | `{ conexion, ventanaOk, standby, ownerEquipo, cola:{pendiente,procesando}, enviadosHoy, lastHeartbeat }` |
| `app:openLogs` / `app:quit` | render->main | -- |

## Frontend

### `src/modules/whatsapp-envios/`

```
api/
  whatsappEnviosMock.js            // sin cliente
  whatsappEnviosSupabase.js        // export createWhatsappEnviosApi(supabaseClient)
  index.js                         // elige adapter por config.isDemoMode (patron gatewayApi.js)
whatsapp-envios.router.js          // registerRoutesWhatsappEnvios(register)
views/
  enviosView.js                    // composer + selector destinatarios + preview
  outboxView.js                    // visor cola filtrado por departamento + origen
  estadoGatewayView.js             // heartbeat + KPIs + cola por estado (ex gateway-config)
index.js
```

API de datos (identica en Mock y Supabase):

| Metodo | Retorno |
|--------|---------|
| `encolarManual({ departamento, destinatarios, mensaje, plantillaId })` | `{ encolados, omitidos_optout, bloqueados, diferidos_dedup }` |
| `listarOutbox({ departamento, origen?, estado?, limite })` | `row[]` |
| `reintentar({ departamento, id })` | `row` (solo si `row.departamento === departamento`) |
| `listarListas/crearLista/agregarMiembros/listarMiembros({ departamento, ... })` | listas/miembros |
| `rosterClase({ claseId })` | `[{ jid, nombre, personaId }]` |
| `estadoGateway({ departamento })` | `{ enviadosHoy, liveStatus, colaPorEstado }` |
| `darDeBaja({ jid })` | via `fn_whatsapp_optout` |

**Seam para FIN** (cliente Supabase propio): `whatsappEnviosSupabase.js` NO
importa `src/lib/supabaseClient.js`; exporta la factory
`createWhatsappEnviosApi(supabaseClient)`. El `index.js` vanilla la instancia con
el cliente compartido; el wrapper React de FIN
(`src/portales/fin/src/features/whatsapp/`) la instancia con el cliente de FIN. El
Mock no necesita cliente.

**Que se comparte vs que se duplica**:
- Compartido (importado por ambos portales): TODO `api/`, el contrato de RPC, los
  tipos. Punto de entrada unico de escritura: `fn_whatsapp_encolar_manual`.
- Duplicado (solo UI): ADM renderiza con DOM vanilla en `views/`; FIN arma un
  arbol React delgado que llama la misma factory.

**`gateway-config` legacy** (D8): se pliega como pestana "Estado del gateway"
dentro de `whatsapp-envios`; se borra la ruta suelta. `gatewayApi.js` CRUD de
config migra a `whatsappEnviosSupabase.js` como
`obtenerConfig({departamento})` / `actualizarConfig({departamento, updates})`
filtrado por depto. `enviarMensajePrueba` (que hoy inserta `estado:'enviado'`
falso) pasa a `encolarManual` con `origen='test'`, `estado='pendiente'`.

**Wiring ADM**: `src/portales/adm/adm.js` agrega un nav group `whatsapp` con
items `whatsapp-envios`, `whatsapp-outbox`, `whatsapp-estado`.
`src/portales/_shared/allRegistrars.js`: sustituye el import de
`registerRoutesGatewayConfig` por `registerRoutesWhatsappEnvios`
(`../../modules/whatsapp-envios/index.js`); el registrar viejo se conserva
durante F7 y se elimina en F9.

**Wiring FIN**: ruta nueva `/whatsapp` en el router React de FIN; el
`WhatsAppReminderModal` deja de abrir `wa.me` y llama
`fn_whatsapp_cobranza_enviar`; `useWhatsAppReminders` deja `localStorage` y lee
el cooldown de `whatsapp_cobranza_cooldown`.

## Migration / Rollout

### Lista ordenada de migraciones (una por archivo, transaccional, idempotente)

1. `whatsapp_multidepto_queue.sql` - cola `+departamento/+origen`, backfill, CHECKs, reindex claim/dedup.
2. `whatsapp_multidepto_config.sql` - config `+departamento/+ventana/+solo_dias_habiles`, `soi-main -> ADM` + `instance_name='adm-gateway'`, indice unico parcial, fila FIN inactiva.
3. `whatsapp_claim_parametrizada.sql` - `fn_whatsapp_cap_hoy(text)`, `fn_whatsapp_enviados_hoy(text)`, `fn_whatsapp_reclamar_pendientes(text,int)` + wrapper compat, grants.
4. `whatsapp_gateway_devices.sql` - pgcrypto, tabla, `fn_whatsapp_device_issue/validate/revoke`.
5. `whatsapp_encolar_manual.sql` - `fn_whatsapp_guard_bloquea/clamp`, `fn_whatsapp_encolar_manual`, `whatsapp_listas` + `whatsapp_lista_miembros`.
6. `whatsapp_producer_routing.sql` - `campanias_periodo.departamento`, `hermes_reactive_rules.departamento_envio`, `fn_encolar_campania` propaga.
7. `whatsapp_cobranza_cooldown.sql` - tabla cooldown + `fn_whatsapp_cobranza_enviar`.
8. `whatsapp_watchdog.sql` - `whatsapp_watchdog_alertas`, `fn_whatsapp_watchdog` (+ reaper), `cron.schedule`.
9. `whatsapp_optout_min.sql` (F8) - flag `whatsapp_inbound_full_enabled=false`, claves de footer.

### Call sites que cambian en lockstep con la migracion 3

| Call site | Cambio |
|-----------|--------|
| `fn_whatsapp_reclamar_pendientes` | nueva firma `(text,int)` + wrapper `(int)` |
| `fn_whatsapp_cap_hoy()` | `+ p_departamento text DEFAULT NULL` (NULL = global) |
| `fn_whatsapp_enviados_hoy()` | `+ p_departamento text DEFAULT NULL` |
| `fn_encolar_campania` | pasa depto a las caps; INSERT setea `departamento` + `origen='campania'` |
| `scripts/whatsapp-runner/index.js` | reemplazado por `src/services/whatsapp-runner/` (edge client, no RPC directa); archivo viejo borrado en F9 |
| `supabase/functions/whatsapp-dispatcher/index.ts` | borrado en F9 (usaba `{p_limite}` + config fila unica) |
| `supabase/process-whatsapp-queue.js` | borrado en F9 |
| `src/modules/gateway-config/api/gatewayApi.js` | `.eq('activo',true).single()` -> `.eq('departamento',depto).eq('activo',true)`; conteos de cola `+ .eq('departamento',depto)`; `fn_hermes_gateway_get_live_status` -> `'<depto>-gateway'` |
| `supabase/functions/event-spine-logger/handlers/r6\|r7\|r8-whatsapp-*.ts` | INSERT `+ departamento` (de `hermes_reactive_rules.departamento_envio ?? 'ADM'`) `+ origen='r6'\|'r7'\|'r8'` |
| `src/portales/fin/.../WhatsAppReminderModal.tsx` + `hooks/useWhatsAppReminders.ts` | sin `wa.me`; `fn_whatsapp_cobranza_enviar`; cooldown en DB |
| `supabase/functions/whatsapp-webhook/index.ts` | opt-out INSERT `+ origen='inbound_optout'` + depto; resto tras `whatsapp_inbound_full_enabled` |

### Cutover fila unica -> multi fila

Solo hay UNA config activa (`ADM`) hasta el rollout de FIN. El wrapper compat
`(p_limite int)` resuelve sin ambiguedad mientras tanto y raise recien cuando
`FIN.activo=true`. Secuencia: (a) migraciones 1-3, (b) instalar app ADM + device
token + QR, (c) apagar el runner manual, (d) validar 1-2 dias, (e)
`UPDATE hermes_whatsapp_config SET activo=true WHERE departamento='FIN'` +
instalar app FIN, (f) F9 borra dispatcher/one-shot/Docker y rota
`EVOLUTION_API_KEY` + `sk_live_soi_baileys_secure`.

### Test de aislamiento

Seed config `ADM` (activa) + `FIN` (activa para el test). Insertar `pendiente`:
3 `ADM`, 2 `FIN`.
- `fn_whatsapp_reclamar_pendientes('ADM', 10)` -> exactamente los 3 ids `ADM`, todos `procesando`; las 2 filas `FIN` intactas en `pendiente`.
- Poner `FIN.ventana_fin='00:01'` (siempre cerrada): `('FIN',10)` -> 0 filas, `('ADM',10)` -> sigue devolviendo -> prueba que la config de FIN no se lee para ADM.
- Caps: `ADM.enviados_hoy` cerca del cap -> claim de ADM limitado, claim de FIN sin afectar.
- Dedup: fila `enviado` de `ADM` para jid X hace 2h; `pendiente` de `ADM` y de `FIN` para X -> `ADM` difiere X, `FIN` devuelve X.

### Feature flag / kill switch durante el rollout

- Global: `system_config.whatsapp_ingest_enabled` (mata todos los deptos).
- Por depto: `hermes_whatsapp_config.activo=false` (claim devuelve 0; FIN nace asi).
- Inbound: `whatsapp_inbound_full_enabled=false`.
- Rollback: `activo=false` frena un depto al instante; `DROP FUNCTION` del overload `(text,int)` + restaurar el cuerpo viejo de `(int)` revierte la DB; el runner viejo puede volver via el wrapper compat.

## Tradeoffs

| Tema | Opcion elegida | Costo / consecuencia aceptada |
|------|----------------|-------------------------------|
| Firma de la claim fn | Overload compat `(int)` + nueva `(text,int)` | 2 funciones a mantener; el wrapper raise cuando hay >1 depto activo (aceptable: el runner viejo ya esta apagado para entonces) |
| Listas de destinatarios | Tablas nuevas `whatsapp_listas` / `whatsapp_lista_miembros` | 2 tablas + RLS extra; a cambio, `comunicaciones` no se acopla al transporte ni al jid |
| Feed de updates | Bucket publico de Supabase Storage (`provider: generic`) | Sin changelog UI de GitHub; a cambio, cero secreto en el binario y cero infra nueva |
| `gateway-config` | Absorber en `whatsapp-envios` | Hay que migrar el CRUD de config y reescribir la consola de prueba; a cambio, un solo panel depto-aware y menos superficie de "fila unica" |
| Dedup `(jid, departamento)` | Por par | Un mismo jid puede recibir 1 msg de ADM y 1 de FIN el mismo dia (hasta 2/dia); el opt-out sigue global y no se debilita |
| Edge fn como SPOF | Edge fn delgada + backoff + cola en DB | Latencia extra y un punto nuevo en el camino critico; a cambio, cero `service_role` en el binario y revocacion instantanea. Alternativa (rol DB scoped) descartada: igual deja credencial rotable en N equipos |

## Testing Strategy

| Capa | Que se prueba | Como |
|------|---------------|------|
| Unit (Vitest) | `businessHours`, `ackWaiter`, `edgeClient`, `dispatchLoop.tick`, adapters Mock/Supabase (paridad de firmas) | `tests/whatsapp-runner/`, `src/modules/whatsapp-envios/**/__tests__` con `fetch`/cliente mockeados |
| DB (Vitest + supabase client, TDD estricto) | claim filtra por depto; aislamiento config ADM/FIN; ventana horaria + `solo_dias_habiles`; overload compat; caps por depto; dedup `(jid,depto)`; `fn_whatsapp_encolar_manual` (opt-out, guard, shape de retorno, rol); `fn_whatsapp_device_validate` (revocacion) | fixtures que siembran config + cola por depto y asertan filas reclamadas |
| Guard paridad | `fn_whatsapp_guard_bloquea` vs `detectPromptInjection` sobre corpus compartido | test que corre ambos y compara |
| Edge fn | `/claim` `/report` `/heartbeat`: token valido -> depto derivado; token revocado -> 401; body con `departamento` ajeno -> se ignora | Deno test o test de integracion contra fn desplegada en staging |
| Seguridad artefacto | binario Electron sin `service_role` ni `anon` | grep del `.exe`/`app.asar` en CI de release |

## Open Questions

- [ ] Validacion de rol en `fn_whatsapp_encolar_manual`: v1 usa `es_admin()`. Si existe (o se crea) un helper de pertenencia a departamento, restringir FIN a rol FIN y ADM a rol ADM. Confirmar en tasks.
- [ ] `fn_encolar_campania`: ruta exacta `campania_id -> campanias_periodo.departamento` (nombre de la FK) a verificar contra el esquema real de campanias.
- [ ] Canal concreto de notificacion del watchdog a admins (`fn_hermes_crear_notificacion` vs task `tareas_institucionales` depto DIR) a fijar en tasks.
- [ ] `mac dmg` como target de build: incluir en v1 o solo Windows NSIS.
