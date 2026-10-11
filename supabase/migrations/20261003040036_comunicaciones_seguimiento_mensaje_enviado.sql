alter table public.comunicaciones_seguimiento
  add column if not exists mensaje_enviado text;

comment on column public.comunicaciones_seguimiento.mensaje_enviado is
  'Texto exacto del mensaje de WhatsApp enviado/abierto para este contacto (auditoría REQ-05).';
