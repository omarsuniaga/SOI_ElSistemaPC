-- Seed runtime model knobs for Telegram/Hermes classifiers.
-- These are operational settings, not secrets.

insert into public.system_config (key, value, description)
values
  (
    'telegram_classifier_model',
    'llama-3.1-8b-instant',
    'Modelo usado por telegram-classifier-cron para clasificar solicitudes de Telegram'
  ),
  (
    'hermes_classifier_model',
    'llama-3.1-8b-instant',
    'Modelo usado por hermes-crear-tarea para clasificar solicitudes Hermes'
  )
on conflict (key) do update
set
  value = excluded.value,
  description = excluded.description,
  updated_at = now();
