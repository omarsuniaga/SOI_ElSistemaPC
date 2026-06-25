-- Portal COM: seguimiento de comunicaciones (CRM de interacciones con motor de follow-up).
-- Aplicada en producción vía MCP el 2026-06-25. Versionada aquí para trazabilidad.

create table if not exists public.comunicaciones_seguimiento (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references public.alumnos(id) on delete set null,
  contacto_nombre text,
  contacto_telefono text,
  contacto_email text,
  canal text not null default 'llamada'
    check (canal in ('llamada','whatsapp','correo','reunion','otro')),
  fecha timestamptz not null default now(),
  resultado text not null default 'contactado'
    check (resultado in ('contactado','buzon_no_contesto','reagendar','sin_interes','resuelto')),
  notas text,
  requiere_seguimiento boolean not null default false,
  proxima_accion text,
  proxima_fecha date,
  estado text not null default 'abierto'
    check (estado in ('abierto','cerrado')),
  responsable_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.comunicaciones_seguimiento is
  'Portal COM: registro de interacciones (llamadas/whatsapp/correo/reunion) con motor de proxima-accion (follow-up). Estandar CRM Activity model.';

create index if not exists idx_com_seg_proxima_fecha
  on public.comunicaciones_seguimiento (proxima_fecha)
  where estado = 'abierto' and requiere_seguimiento = true;
create index if not exists idx_com_seg_alumno on public.comunicaciones_seguimiento (alumno_id);
create index if not exists idx_com_seg_estado on public.comunicaciones_seguimiento (estado);

create or replace function public.fn_com_seg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_com_seg_updated_at on public.comunicaciones_seguimiento;
create trigger trg_com_seg_updated_at
  before update on public.comunicaciones_seguimiento
  for each row execute function public.fn_com_seg_touch_updated_at();

alter table public.comunicaciones_seguimiento enable row level security;

drop policy if exists "com_seg_select_authenticated" on public.comunicaciones_seguimiento;
create policy "com_seg_select_authenticated" on public.comunicaciones_seguimiento
  for select to authenticated using (true);

drop policy if exists "com_seg_insert_authenticated" on public.comunicaciones_seguimiento;
create policy "com_seg_insert_authenticated" on public.comunicaciones_seguimiento
  for insert to authenticated with check (true);

drop policy if exists "com_seg_update_authenticated" on public.comunicaciones_seguimiento;
create policy "com_seg_update_authenticated" on public.comunicaciones_seguimiento
  for update to authenticated using (true) with check (true);

drop policy if exists "com_seg_delete_authenticated" on public.comunicaciones_seguimiento;
create policy "com_seg_delete_authenticated" on public.comunicaciones_seguimiento
  for delete to authenticated using (true);
