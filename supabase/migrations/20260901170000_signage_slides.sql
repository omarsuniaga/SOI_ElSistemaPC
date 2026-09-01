-- Diapositivas creadas dentro del Estudio (sin salir a Canva).
-- signage_media.tipo = 'slide' + contenido jsonb con la plantilla y sus campos:
--   { plantilla, titulo, subtitulo, cuerpo, fecha, lugar, hora, autor, icono,
--     fondo: { tipo: 'gradiente'|'color', valor } }
-- El player las dibuja nativo en HTML (public/signage/js/components/slide.js).
-- Aditivo, solo signage_media.
alter table public.signage_media
  add column if not exists contenido jsonb;
