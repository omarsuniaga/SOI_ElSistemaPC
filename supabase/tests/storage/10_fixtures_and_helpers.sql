-- Datos de prueba y utilidades. Solo para bases aisladas.
--   admin   : profiles.rol = 'admin'
--   u1/u2   : maestros (maestros.id distinto del uid, como en producción)
--   alu     : usuario autenticado sin ficha de maestro (p. ej. alumno/representante)
--   inv     : 'inventarista' (el CHECK de producción lo impide; se levanta SOLO en la prueba
--             para demostrar que las políticas sensibles no dependen de ese rol)

create schema t;
grant usage on schema t to anon, authenticated;
create table t.results (n serial primary key, name text not null, ok boolean not null);

create function t.expect(p_name text, p_ok boolean) returns text language plpgsql security definer
set search_path = t, pg_temp as $$
begin
  insert into t.results (name, ok) values (p_name, coalesce(p_ok, false));
  return case when coalesce(p_ok, false) then 'PASS  ' else 'FAIL  ' end || p_name;
end $$;

create function t.as_user(p_uid uuid, p_email text default null) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_uid, 'role', 'authenticated', 'email', p_email)::text, false);
  set role authenticated;
end $$;

create function t.as_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', false);
  set role anon;
end $$;

create function t.back() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', '', false);
end $$;

-- Solo se interpreta como "denegado" el error de RLS/privilegios (42501).
create function t.try_insert(b text, n text) returns boolean language plpgsql as $$
begin
  insert into storage.objects (bucket_id, name, owner) values (b, n, auth.uid());
  return true;
exception when insufficient_privilege then return false;
end $$;

create function t.try_update(b text, n text) returns boolean language plpgsql as $$
declare c int;
begin
  update storage.objects set metadata = '{"x":1}' where bucket_id = b and name = n;
  get diagnostics c = row_count;
  return c > 0;
exception when insufficient_privilege then return false;
end $$;

create function t.try_delete(b text, n text) returns boolean language plpgsql as $$
declare c int;
begin
  delete from storage.objects where bucket_id = b and name = n;
  get diagnostics c = row_count;
  return c > 0;
exception when insufficient_privilege then return false;
end $$;

create function t.can_see(b text, n text) returns boolean language sql as
$$ select exists (select 1 from storage.objects where bucket_id = b and name = n) $$;

create function t.try_estricto() returns boolean language plpgsql as $$
begin
  perform public.es_admin_estricto();
  return true;
exception when insufficient_privilege then return false;
end $$;

create function t.seed(b text, n text) returns void language sql as
$$ insert into storage.objects (bucket_id, name) values (b, n) on conflict do nothing $$;

create function t.wipe() returns void language sql as $$ delete from storage.objects $$;

-- Fixtures
insert into public.profiles (id, rol) values
  ('a0000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000001', 'maestro'),
  ('00000000-0000-0000-0000-000000000002', 'maestro'),
  ('c0000000-0000-0000-0000-000000000001', 'alumno');
alter table public.profiles drop constraint profiles_rol_check;      -- solo en la prueba
insert into public.profiles (id, rol) values ('d0000000-0000-0000-0000-000000000001', 'inventarista');

insert into public.maestros (id, user_id) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000002');
insert into public.clases (id, maestro_principal_id) values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000b1'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-0000000000b2');
insert into public.justificaciones (clase_id, evidencia_url, creado_por, motivo) values
  ('11111111-1111-1111-1111-111111111111',
   'justificaciones/00000000-0000-0000-0000-000000000001/f1.jpg',
   '00000000-0000-0000-0000-0000000000b1', 'cita médica alumno de m1'),
  ('22222222-2222-2222-2222-222222222222',
   'justificaciones/00000000-0000-0000-0000-000000000002/f2.jpg',
   '00000000-0000-0000-0000-0000000000b2', 'cita médica alumno de m2');
