-- Minimal subset of production (profiles + soi_security.has_role) for the LOCAL validation stack. Not a migration of the real project.
create table public.profiles (id uuid primary key references auth.users(id), rol text, estado text, activo boolean);
create schema soi_security;
grant usage on schema soi_security to anon, authenticated, service_role;
create or replace function soi_security.has_role(allowed_roles text[])
 returns boolean language sql stable security definer set search_path to ''
as $function$ select exists (select 1 from public.profiles p where p.id = auth.uid() and p.estado = 'activo' and p.activo is true and p.rol = any(allowed_roles)); $function$;
revoke all on function soi_security.has_role(text[]) from public, anon;
grant execute on function soi_security.has_role(text[]) to authenticated;
alter table public.profiles enable row level security;
grant all on public.profiles to service_role;
-- Como en producción (f0_profiles_read): cada usuario lee su propio perfil; admin/superadmin leen todos.
grant select on public.profiles to authenticated;
create policy profiles_self_or_admin_read on public.profiles for select to authenticated using (id = auth.uid() or soi_security.has_role(array['admin','superadmin']));
