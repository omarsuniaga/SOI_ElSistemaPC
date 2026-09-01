-- Permitir tipo='slide' en signage_media (diapositivas nativas creadas en el Estudio).
-- El check original solo aceptaba imagen/video/youtube y exigía storage_path o
-- youtube_url; una diapositiva no tiene ninguno de los dos, su fuente es `contenido`.
alter table public.signage_media drop constraint if exists signage_media_tipo_check;
alter table public.signage_media add constraint signage_media_tipo_check
  check (tipo = any (array['imagen','video','youtube','slide']));

alter table public.signage_media drop constraint if exists signage_media_fuente_chk;
alter table public.signage_media add constraint signage_media_fuente_chk check (
  (tipo = 'youtube' and youtube_url is not null)
  or (tipo in ('imagen','video') and storage_path is not null)
  or (tipo = 'slide' and contenido is not null)
);
