-- Preferencia de instrumento del postulante (opcional, no determinante).
-- estado ya es texto libre sin constraint -> 'lista_espera' se usa sin cambios de esquema.
-- Aplicada en produccion via MCP el 2026-06-25.
alter table public.postulantes add column if not exists instrumento text;
comment on column public.postulantes.instrumento is
  'Instrumento de interes del postulante (opcional, solo preferencia, no determina nada).';
