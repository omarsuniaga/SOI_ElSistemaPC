-- Groq retired llama-3.1-8b-instant for developer/free accounts.
-- Only replace known retired values; preserve deliberate administrator choices.

UPDATE public.system_config
SET value = 'openai/gpt-oss-20b',
    updated_at = now()
WHERE key IN ('telegram_classifier_model', 'hermes_classifier_model')
  AND value IN ('llama-3.1-8b-instant', 'llama-3.3-70b-versatile');

INSERT INTO public.system_config (key, value, description)
VALUES
  ('telegram_classifier_model', 'openai/gpt-oss-20b', 'Modelo Groq para clasificar solicitudes de Telegram.'),
  ('hermes_classifier_model', 'openai/gpt-oss-20b', 'Modelo Groq para clasificar solicitudes de Hermes.')
ON CONFLICT (key) DO NOTHING;
