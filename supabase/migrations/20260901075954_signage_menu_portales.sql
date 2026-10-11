-- En qué portales departamentales aparece el menú "Cartelera" (además del portal
-- Admin principal, donde siempre está). Lo controla el Estudio de la cartelera.
-- Aditivo, solo signage_pantallas.
alter table public.signage_pantallas
  add column if not exists menu_portales text[] not null default '{}'::text[];
