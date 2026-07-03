-- Agrega el flag de "requiere revisión" a clases: se activa cuando un conflicto
-- de horario/salón/maestro (o de inscripción de alumno) se resuelve a favor de
-- OTRA clase, liberando el horario/inscripción de esta. El admin lo limpia
-- manualmente desde la UI ("Marcar como revisado") una vez corregido.
--
-- Aplicada en producción vía MCP el 2026-07-03.

alter table public.clases
  add column if not exists necesita_revision boolean not null default false,
  add column if not exists revision_motivo text;
