-- Responsable de cada departamento (nombre + correo de contacto directo).
-- Aplicada en producción vía MCP el 2026-06-25.

alter table public.departamentos
  add column if not exists responsable_nombre text,
  add column if not exists responsable_email text;
