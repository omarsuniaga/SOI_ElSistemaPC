-- Réplica mínima del estado de PRODUCCIÓN (2026-10-17) previa a la migración
-- 20261017200000_storage_buckets_privados_y_politicas.sql. Solo para pruebas en una base
-- de datos aislada; nunca ejecutar contra Supabase.
--
-- Emula: roles anon/authenticated/service_role, auth.uid()/auth.jwt(), storage.buckets/objects
-- con RLS, storage.foldername(), y las funciones y políticas reales usadas por las políticas
-- de Storage (es_admin, maestro_actual, is_super_admin, maestro_en_clase, justificaciones).

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon')          then create role anon          nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role')  then create role service_role  nologin noinherit bypassrls; end if;
end $$;

create schema auth;
create schema storage;
grant usage on schema auth, storage, public to anon, authenticated, service_role;

create function auth.jwt() returns jsonb language sql stable as
$$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as
$$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
grant execute on function auth.jwt(), auth.uid() to anon, authenticated, service_role;

create table storage.buckets (
  id text primary key, name text not null, public boolean not null default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text, owner uuid, metadata jsonb,
  unique (bucket_id, name)
);
alter table storage.objects enable row level security;
grant select on storage.buckets to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;

-- Idéntica a la función de Supabase Storage.
create function storage.foldername(name text) returns text[] language plpgsql as $$
declare _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1:array_length(_parts, 1) - 1];
end $$;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;

-- ─── Tablas públicas mínimas (mismas restricciones relevantes que producción) ─────
create table public.profiles (
  id uuid primary key,
  rol text not null default 'user',
  activo boolean default true,
  constraint profiles_rol_check check (rol = any (array['superadmin','admin','direccion',
    'coordinacion_academica','maestro','monitor','finanzas','operaciones','representante',
    'alumno','jurado','user']))
);
create table public.maestros (id uuid primary key default gen_random_uuid(), user_id uuid);
create table public.clases (
  id uuid primary key default gen_random_uuid(),
  maestro_principal_id uuid, maestro_suplente_id uuid
);
create table public.justificaciones (
  id uuid primary key default gen_random_uuid(),
  clase_id uuid, evidencia_url text, creado_por uuid, motivo text
);
grant select on public.profiles, public.maestros, public.clases to anon, authenticated;
grant select, insert, update, delete on public.justificaciones to authenticated;

-- ─── Funciones tal como están en producción ──────────────────────────────────────
create function public.es_admin() returns boolean language plpgsql security definer as $$
declare v_role text;
begin
  select p.rol into v_role from public.profiles p where p.id = auth.uid();
  return coalesce(v_role in ('admin', 'inventarista'), false);
end $$;

create function public.maestro_actual() returns uuid language plpgsql security definer as $$
begin
  return (select id from public.maestros where user_id = auth.uid()
          or (user_id is null and id = auth.uid()));
end $$;

create function public.is_super_admin() returns boolean language plpgsql stable security definer as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) = 'osuniagarivera@gmail.com' then return true; end if;
  if lower(coalesce(auth.jwt() ->> 'role', '')) in ('superadmin', 'service_role') then return true; end if;
  if exists (select 1 from public.profiles where id = auth.uid() and lower(rol) = 'superadmin'
             and (activo is null or activo = true)) then return true; end if;
  return false;
end $$;

create function public.maestro_en_clase(p_clase_id uuid) returns boolean language plpgsql stable as $$
begin
  return exists (select 1 from public.clases where id = p_clase_id
    and (maestro_principal_id = public.maestro_actual() or maestro_suplente_id = public.maestro_actual()));
end $$;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- RLS de justificaciones (copiada de producción)
alter table public.justificaciones enable row level security;
create policy justificaciones_admin_select on public.justificaciones for select to authenticated
  using (es_admin() or maestro_en_clase(clase_id));
create policy justificaciones_admin_insert on public.justificaciones for insert to authenticated
  with check (es_admin() or maestro_en_clase(clase_id));
create policy justificaciones_admin_update on public.justificaciones for update to authenticated
  using (es_admin() or maestro_en_clase(clase_id)) with check (es_admin() or maestro_en_clase(clase_id));
create policy justificaciones_superadmin_delete on public.justificaciones for delete to authenticated
  using ((select is_super_admin()) = true);
create policy teacher_manage_justificaciones on public.justificaciones for all to authenticated
  using (creado_por in (select id from maestros where user_id = auth.uid()))
  with check (creado_por in (select id from maestros where user_id = auth.uid()));

-- ─── Buckets y políticas de Storage de producción ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('db-backups',         'db-backups',         false, null,    null),
  ('documentos',         'documentos',         true,  null,    null),
  ('instrumentos-fotos', 'instrumentos-fotos', true,  5242880, array['image/jpeg','image/png','image/webp']),
  ('signage',            'signage',            true,  null,    null);

create policy db_backups_superadmin_delete on storage.objects for delete to public
  using (bucket_id = 'db-backups' and is_super_admin());
create policy db_backups_superadmin_read on storage.objects for select to public
  using (bucket_id = 'db-backups' and is_super_admin());
create policy db_backups_superadmin_write on storage.objects for insert to public
  with check (bucket_id = 'db-backups' and is_super_admin());

create policy justificaciones_evidencia_delete on storage.objects for delete to authenticated
  using (bucket_id = 'documentos' and name like 'justificaciones/%' and (es_admin() or maestro_actual() is not null));
create policy justificaciones_evidencia_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and name like 'justificaciones/%' and (es_admin() or maestro_actual() is not null));
create policy justificaciones_evidencia_select on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and name like 'justificaciones/%' and (es_admin() or maestro_actual() is not null));

create policy signage_bucket_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'signage' and es_admin()) with check (bucket_id = 'signage' and es_admin());
create policy signage_bucket_auth_read on storage.objects for select to authenticated
  using (bucket_id = 'signage');
