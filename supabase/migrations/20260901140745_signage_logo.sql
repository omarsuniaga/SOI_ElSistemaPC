-- Logo de la cabecera de la cartelera (PNG en el bucket 'signage', p. ej.
-- logos/2026...-logo.png). Si está vacío, el player muestra el asterisco ✳.
-- Aditivo, solo signage_pantallas.
alter table public.signage_pantallas
  add column if not exists logo_path text;
