-- Identidad de marca de la pantalla (cabecera de la cartelera): institución + siglas.
-- Aditivo, solo signage_pantallas.
alter table public.signage_pantallas
  add column if not exists institucion text,
  add column if not exists siglas text;

update public.signage_pantallas
set institucion = coalesce(institucion, 'El Sistema Punta Cana'),
    siglas      = coalesce(siglas, 'FUNEYCA-PC')
where slug = 'punta-cana-vestibulo';
