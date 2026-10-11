-- ============================================================
-- Feature: backup completo de la base de datos desde el frontend,
-- solo para superadmin. Todo aditivo: no modifica tablas, triggers
-- ni funciones existentes.
-- ============================================================

-- 1. Tabla de historial/auditoría de backups
create table if not exists public.admin_backups_log (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id),
  storage_path text,
  size_bytes bigint,
  table_count int,
  row_count int,
  status text not null default 'running',
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

comment on table public.admin_backups_log is 'Historial de backups completos de la BD generados desde el panel de superadmin. Cada fila = una corrida (running/completed/failed).';

alter table public.admin_backups_log enable row level security;

drop policy if exists admin_backups_log_superadmin_all on public.admin_backups_log;
create policy admin_backups_log_superadmin_all
  on public.admin_backups_log
  for all
  using (is_super_admin())
  with check (is_super_admin());

-- 2. Listado de tablas públicas + tamaño estimado, solo superadmin
create or replace function public.fn_list_public_tables()
returns table(table_name text, estimated_rows bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_super_admin() then
    raise exception 'not authorized';
  end if;
  return query
  select c.relname::text, c.reltuples::bigint
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
  order by c.relname;
end;
$$;

revoke all on function public.fn_list_public_tables() from public;
grant execute on function public.fn_list_public_tables() to authenticated;

-- 3. Cooldown: evita que se disparen backups completos muy seguido
--    (protege contra saturar la BD si alguien le da click varias veces).
--    Configurable vía system_config.admin_backup_cooldown_hours (default 6h).
create or replace function public.fn_admin_backup_allowed()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  v_cooldown_hours int;
  v_running_count int;
begin
  if not is_super_admin() then
    return false;
  end if;

  -- Si ya hay un backup corriendo (no terminado en los últimos 20 min), no permitir otro en paralelo
  select count(*) into v_running_count
  from admin_backups_log
  where status = 'running' and started_at > now() - interval '20 minutes';
  if v_running_count > 0 then
    return false;
  end if;

  select coalesce(value::int, 6) into v_cooldown_hours
  from system_config where key = 'admin_backup_cooldown_hours';
  if v_cooldown_hours is null then
    v_cooldown_hours := 6;
  end if;

  select max(started_at) into v_last from admin_backups_log where status = 'completed';
  if v_last is null then
    return true;
  end if;
  return (now() - v_last) > make_interval(hours => v_cooldown_hours);
end;
$$;

revoke all on function public.fn_admin_backup_allowed() from public;
grant execute on function public.fn_admin_backup_allowed() to authenticated;

-- 4. Bucket privado de Storage para los archivos de backup
insert into storage.buckets (id, name, public)
values ('db-backups', 'db-backups', false)
on conflict (id) do nothing;

drop policy if exists "db_backups_superadmin_read" on storage.objects;
create policy "db_backups_superadmin_read"
  on storage.objects for select
  using (bucket_id = 'db-backups' and is_super_admin());

drop policy if exists "db_backups_superadmin_write" on storage.objects;
create policy "db_backups_superadmin_write"
  on storage.objects for insert
  with check (bucket_id = 'db-backups' and is_super_admin());

drop policy if exists "db_backups_superadmin_delete" on storage.objects;
create policy "db_backups_superadmin_delete"
  on storage.objects for delete
  using (bucket_id = 'db-backups' and is_super_admin());
