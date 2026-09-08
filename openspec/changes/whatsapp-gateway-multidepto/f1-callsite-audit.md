# F1.14 — Auditoría de call sites de "config activa única"

Objetivo: que ningún consumidor lea `hermes_whatsapp_config WHERE activo` (o
llame a las fn de caps/claim) asumiendo un solo departamento, salvo los que
están explícitamente marcados para retirarse en F9.

Verificado contra el esquema real del proyecto `zmhmdvmyeyswunurcyow` (Postgres 17).

## Resuelto en F1 (lockstep con las migraciones)

| Call site | Cambio | Estado |
|-----------|--------|--------|
| `fn_whatsapp_reclamar_pendientes(int)` | Reemplazada por `(text, int)` + wrapper compat que resuelve el único depto activo o `RAISE` si hay >1 | ✅ `20260907032000` |
| `fn_whatsapp_cap_hoy()` | Reemplazada por `fn_whatsapp_cap_hoy(text DEFAULT NULL)` | ✅ `20260907032000` |
| `fn_whatsapp_enviados_hoy()` | Reemplazada por `fn_whatsapp_enviados_hoy(text DEFAULT NULL)` | ✅ `20260907032000` |
| `fn_encolar_campania(uuid, int)` | Pasa `'ADM'` a los caps + `INSERT` setea `departamento='ADM'`, `origen='campania'` | ✅ `20260907032000` |
| `src/modules/gateway-config/api/gatewayApi.js` | Fijado a `DEPTO='ADM'`: `.eq('departamento','ADM')` en los 3 reads (config, stats, cola) y en el retry; `instance_name` por defecto `'adm-gateway'`; `DEFAULT_CONFIG` con `departamento`/ventana | ✅ |
| `src/modules/gateway-config/__tests__/gatewayDispatcherIntegration.test.js` | Assertion `instance_name` `soi-main` -> `adm-gateway` | ✅ |

## Consumidores legacy — NO se tocan en F1, se retiran en F9

| Call site | Por qué es seguro dejarlo | Retiro |
|-----------|--------------------------|--------|
| `scripts/whatsapp-runner/index.js` | Llama `fn_whatsapp_reclamar_pendientes({ p_limite })` -> resuelve por el wrapper compat mientras solo ADM esté activo | F9.3 |
| `scripts/whatsapp-runner/verify_runner.js` | Igual (diagnóstico) | F9.3 |
| `supabase/functions/whatsapp-dispatcher/index.ts` | Edge fn no desplegada ni agendada. `.eq('activo',true).single()` -> 1 fila tras la migración | F9.3 |
| `supabase/process-whatsapp-queue.js` | Script suelto sin cron. Wrapper compat | F9.3 |

## Rough edges conocidos (no bloquean F1)

| Ítem | Detalle | Se arregla en |
|------|---------|---------------|
| `gatewayApi.js` `crearGatewayConfig` / `inicializarGatewayDefault` | `INSERT` con `id` fijo `0000...001`; puede chocar con el índice único parcial si se re-ejecuta desde el panel legacy. Ese `id` corresponde a la fila de demo que la migración desactiva | F7.4 (CRUD pasa a `obtener/actualizarConfig({departamento})`) |
| `fn_whatsapp_rate_excedido(p_jid)` | Rate limiter de **entrada** (webhook). Lee `rate_limit_hora` de la primera fila activa -> tras la migración lee la de ADM como default. El path de entrada se apaga en F8 (`whatsapp_inbound_full_enabled=false`) | F8 |
| `whatsapp_quiet_hours_*` global | Sigue leyéndose como interruptor de apagado adicional en la claim fn. Queda vestigial una vez que todas las filas tienen ventana propia | F8/F9 (limpieza) |

## Comando de re-verificación

```bash
grep -rn "hermes_whatsapp_config" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" \
  src/ supabase/functions/ scripts/ | grep -v "database.types.ts\|__tests__\|\.test\."
```

Y en la DB:

```sql
select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.prokind='f'
  and pg_get_functiondef(p.oid) ilike '%hermes_whatsapp_config%';
```
