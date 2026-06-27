-- Registro de correos por departamento para que Hermes (Telegram) despache correos
-- diciendo solo el código del departamento (DIR/ACM/ADM/FIN/COM/LOG/TECNICO).
-- Aplicada en producción vía MCP el 2026-06-25.

alter table public.departamentos add column if not exists email text;

create unique index if not exists ux_departamentos_codigo on public.departamentos (upper(codigo));

insert into public.departamentos (codigo, nombre, activo) values
  ('DIR', 'Dirección', true),
  ('ACM', 'Académica', true),
  ('ADM', 'Administración', true),
  ('FIN', 'Financiero', true),
  ('COM', 'Comunicaciones', true),
  ('LOG', 'Logística', true),
  ('TECNICO', 'Técnico', true)
on conflict (upper(codigo)) do nothing;

-- Resuelve el correo de un departamento por su código (case-insensitive).
create or replace function public.fn_email_departamento(p_codigo text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email from public.departamentos
  where upper(codigo) = upper(p_codigo) and activo and email is not null
  limit 1;
$$;
