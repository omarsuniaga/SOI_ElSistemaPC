---
name: soi-telegram-ingest
description: >-
  Telegram ingest pipeline for SOI. Webhook receives messages from authorized
  users, stores them raw, a cron classifier uses GROQ to extract departments
  and process codes, then creates tasks in tareas_institucionales.
trigger:
  - telegram
  - bot
  - ingest
  - clasificador
  - classifier
  - groq
  - webhook telegram
---

# SOI Telegram Ingest Pipeline

## Overview

```
Usuario Telegram
      |
      | message
      v
telegram-webhook (GET /poll)
      |
      | 1. Kill switch check
      | 2. Allowlist validation
      | 3. Opt-out check (STOP)
      | 4. Rate limit check
      | 5. INSERT telegram_messages_raw
      | 6. INSERT hermes_inbox (canal='telegram', processed=false)
      | 7. Send confirmation to user
      v
telegram-classifier-cron (POST /process)  ← llamado cada N minutos
      |
      | 1. Monitor token validation
      | 2. Kill switch check
      | 3. SELECT hermes_inbox WHERE processed=false LIMIT 20
      | 4. For each row:
      |    a. Fetch raw_payload from telegram_messages_raw
      |    b. Call GROQ (llama-3.3-70b-versatile) con prompt v1 + few-shots
      |    c. Validate JSON con Zod schema
      |    d. Fallback threshold (confidence < 0.5 || deptos == [])
      |    e. Match process_code contra soi_process_contracts
      |    f. UPSERT hermes_process_cases
      |    g. INSERT tareas_institucionales (1 por departamento)
      |    h. UPDATE hermes_inbox.processed = true
      |    i. Send Telegram confirmation
      v
tareas_institucionales  ← destino final
```

## Edge Functions

| Function | Path | Trigger |
|---|---|---|
| `telegram-webhook` | `supabase/functions/telegram-webhook/` | HTTP GET /poll (manual o cron cada 5s) |
| `telegram-classifier-cron` | `supabase/functions/telegram-classifier-cron/` | HTTP POST /process (cron cada 1-2 min) |

## Required Supabase Secrets

```sql
-- Aplicar en Supabase Dashboard > Edge Functions > Secrets
-- TELEGRAM_BOT_TOKEN  (token del bot de Telegram)
-- GROQ_API_KEY        (API key de Groq)
-- SUPABASE_URL        (auto)
-- SUPABASE_SERVICE_ROLE_KEY  (auto)
```

## system_config Entries

| Key | Valor | Descripción |
|---|---|---|
| `telegram_ingest_enabled` | `"true"` | Kill switch del pipeline completo |
| `telegram_rate_limit_per_hour` | `"10"` | Max mensajes por usuario por hora |
| `telegram_last_update_id` | `"12345"` | Último update_id procesado (auto) |
| `telegram_monitor_healthcheck_secret` | `"..."` | Token para X-Monitor-Token del cron |

## Agregar Usuario a Allowlist

```sql
INSERT INTO telegram_allowed_users (telegram_user_id, nombre, rol, created_by)
VALUES (
  123456789,                    -- Telegram user ID numerico
  'Nombre del Usuario',        -- Nombre visible
  'docente',                    -- Rol
  (SELECT id FROM profiles WHERE email = 'admin@institucion.edu' LIMIT 1)
);
```

Para obtener el `telegram_user_id`, el usuario debe enviar cualquier mensaje al bot mientras el log del webhook este activo, o usar `@userinfobot` en Telegram.

## Iterar el Prompt del Clasificador

1. Copiar `lib/prompt/v1.ts` a `lib/prompt/v2.ts`
2. Ajustar el `systemPrompt`
3. Actualizar `index.ts` para importar `v2`
4. Hacer deploy de la Edge Function
5. Probar con mensajes reales
6. Cuando este estable, eliminar `v1.ts` y renombrar `v2.ts` a `v1.ts`

## Rollback Rapido

```sql
UPDATE system_config SET value = 'false' WHERE key = 'telegram_ingest_enabled';
```

Esto detiene el webhook y el cron inmediatamente. Ningun mensaje se procesa, pero no se pierden datos (los mensajes quedan en Telegram hasta que se avance el offset).

## Troubleshooting

### Usuario no recibe respuestas
- Verificar que este en `telegram_allowed_users` con `activo = true`
- Verificar que no haya enviado `STOP` (si lo hizo, reactivar con `UPDATE telegram_allowed_users SET activo = true`)
- Verificar `TELEGRAM_BOT_TOKEN` en secrets
- Verificar logs del webhook: `func logs telegram-webhook`

### Rate limit muy estricto
```sql
UPDATE system_config SET value = '20' WHERE key = 'telegram_rate_limit_per_hour';
```

### GROQ falla (timeout o parse error)
- Verificar `GROQ_API_KEY` en secrets
- Verificar que el prompt devuelva JSON valido (revisar few-shots)
- Temporalmente, aumentar `supabase/functions/telegram-classifier-cron/index.ts` el batch size de 20 a 50 para procesar acumulados
- Si GROQ esta caido, activar kill switch y procesar manualmente desde `hermes_inbox`

### El offset se salto mensajes
- Si el webhook crashea y no persiste `telegram_last_update_id`, al reiniciar se puede pasar `?offset=N` manualmente:
  ```
  GET /poll?offset=12345
  ```
- Revisar `system_config.telegram_last_update_id` para ver el ultimo valor guardado

## File Reference

```
supabase/functions/telegram-webhook/
  index.ts              -- Entry point (GET /poll)
  deno.json             -- Import map
  lib/
    log.ts              -- logINFO / logWARNING wrappers
    telegramApi.ts      -- getUpdates / sendMessage
    allowlist.ts        -- isValidUser check
    rateLimit.ts        -- checkRateLimit por hora
    optOut.ts           -- processOptOut (STOP handler)

supabase/functions/telegram-classifier-cron/
  index.ts              -- Entry point (POST /process)
  deno.json             -- Import map
  lib/
    log.ts              -- logINFO / logWARNING wrappers
    classifier.ts       -- Zod schema + parseGroqResponse
    processCases.ts     -- applyFallbackLogic + matchProcessCode
    crearTareas.ts      -- createTasks (UPSERT case + INSERT tasks)
    responderTelegram.ts-- sendConfirmation al usuario
    telegramApi.ts      -- sendMessage wrapper
    prompt/
      v1.ts             -- System prompt actual
      fewshots.ts       -- Ejemplos few-shot

.agent/skills/soi-telegram-ingest/
  SKILL.md              -- Este documento
```
