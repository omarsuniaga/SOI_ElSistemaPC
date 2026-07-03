-- Fix: crearTareas.ts (telegram-classifier-cron) hace
-- .upsert(..., { onConflict: 'process_code, source' }) sobre hermes_process_cases,
-- pero nunca existió un unique index/constraint que respalde ese ON CONFLICT.
-- Sin este índice, PostgREST/Postgres responde 42P10 y el paso de creación de
-- tareas falla para todo mensaje de Telegram clasificado (queda logeado en
-- hermes_inbox pero nunca se convierte en caso/tarea).
--
-- Aplicada en producción vía MCP el 2026-07-03. Reemplaza al archivo local sin
-- trackear "20260702_drop_process_cases_code_source_uniq.sql" (nunca se aplicó;
-- de haberse aplicado DESPUÉS de este fix habría vuelto a romper el upsert).
--
-- Nota: process_code es nullable (los casos "fallback" de clasificación lo dejan
-- NULL); un unique index estándar trata cada NULL como distinto, así que múltiples
-- casos sin clasificar conviven sin problema.

create unique index if not exists hermes_process_cases_code_source_uniq
  on public.hermes_process_cases (process_code, source);
