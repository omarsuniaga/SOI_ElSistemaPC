-- Campañas de Marketing B2B: instituciones, campañas, destinatarios
-- Extiende el Portal COM para prospección, captación y seguimiento comercial.

-- 1. INSTITUCIONES (empresas, colegios, fundaciones, iglesias, etc.)
create table if not exists public.instituciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null default 'empresa'
    check (tipo in ('empresa','institucion','colegio','fundacion','iglesia','club','otro')),
  sector text,
  contacto_nombre text,
  cargo text,
  email text,
  telefono text,
  direccion text,
  sitio_web text,
  redes jsonb default '{}'::jsonb,
  estado text not null default 'lead'
    check (estado in ('lead','contactado','en_negociacion','aceptado','rechazado','inactivo')),
  notas text,
  ultima_gestion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.instituciones is
  'Directorio B2B: empresas, instituciones, colegios, fundaciones para campañas de captación y oferta de conciertos.';

create index if not exists idx_instituciones_estado on public.instituciones (estado);
create index if not exists idx_instituciones_tipo on public.instituciones (tipo);

-- 2. CAMPAÑAS DE MARKETING
create table if not exists public.campanias_marketing (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  temporada text,
  asunto text not null,
  cuerpo_html text not null,
  cuerpo_texto text,
  estado text not null default 'borrador'
    check (estado in ('borrador','programada','enviando','enviada','completada','cancelada')),
  fecha_programada timestamptz,
  fecha_envio timestamptz,
  enviados int not null default 0,
  abiertos int not null default 0,
  respondidos int not null default 0,
  creado_por uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.campanias_marketing is
  'Campañas de email masivo B2B: plantillas, temporada, destinatarios y métricas de envío.';

-- 3. DESTINATARIOS POR CAMPAÑA (join table with tracking)
create table if not exists public.campanias_destinatarios (
  id uuid primary key default gen_random_uuid(),
  campania_id uuid not null references public.campanias_marketing(id) on delete cascade,
  institucion_id uuid not null references public.instituciones(id) on delete cascade,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','enviado','abierto','respondido','rechazado','error')),
  fecha_envio timestamptz,
  fecha_respuesta timestamptz,
  respuesta_texto text,
  notas_seguimiento text,
  created_at timestamptz not null default now(),
  unique (campania_id, institucion_id)
);

comment on table public.campanias_destinatarios is
  'Relación campaña-institución con tracking individual: envío, apertura, respuesta y seguimiento.';

create index if not exists idx_camp_dest_campania on public.campanias_destinatarios (campania_id);
create index if not exists idx_camp_dest_institucion on public.campanias_destinatarios (institucion_id);
create index if not exists idx_camp_dest_estado on public.campanias_destinatarios (estado);

-- 4. PROSPECCIÓN (log de búsquedas automatizadas)
create table if not exists public.prospeccion_log (
  id uuid primary key default gen_random_uuid(),
  termino_busqueda text not null,
  ubicacion text,
  industria text,
  resultados_encontrados int not null default 0,
  resultados_procesados int not null default 0,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','procesando','completado','error')),
  error text,
  ejecutado_por text default 'scanner',
  created_at timestamptz not null default now()
);

comment on table public.prospeccion_log is
  'Log del scanner automático de prospección web: qué se buscó, cuántos resultados, estado.';

-- Triggers updated_at
create or replace function public.fn_camp_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger trg_instituciones_updated_at
  before update on public.instituciones
  for each row execute function public.fn_camp_touch_updated_at();

create trigger trg_campanias_updated_at
  before update on public.campanias_marketing
  for each row execute function public.fn_camp_touch_updated_at();

-- RLS
alter table public.instituciones enable row level security;
alter table public.campanias_marketing enable row level security;
alter table public.campanias_destinatarios enable row level security;
alter table public.prospeccion_log enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'camp_instituciones_select_authenticated') then
    create policy "camp_instituciones_select_authenticated" on public.instituciones
      for select to authenticated using (true);
    create policy "camp_instituciones_insert_authenticated" on public.instituciones
      for insert to authenticated with check (true);
    create policy "camp_instituciones_update_authenticated" on public.instituciones
      for update to authenticated using (true) with check (true);
    create policy "camp_instituciones_delete_authenticated" on public.instituciones
      for delete to authenticated using (true);

    create policy "camp_campanias_select_authenticated" on public.campanias_marketing
      for select to authenticated using (true);
    create policy "camp_campanias_insert_authenticated" on public.campanias_marketing
      for insert to authenticated with check (true);
    create policy "camp_campanias_update_authenticated" on public.campanias_marketing
      for update to authenticated using (true) with check (true);
    create policy "camp_campanias_delete_authenticated" on public.campanias_marketing
      for delete to authenticated using (true);

    create policy "camp_destinatarios_select_authenticated" on public.campanias_destinatarios
      for select to authenticated using (true);
    create policy "camp_destinatarios_insert_authenticated" on public.campanias_destinatarios
      for insert to authenticated with check (true);
    create policy "camp_destinatarios_update_authenticated" on public.campanias_destinatarios
      for update to authenticated using (true) with check (true);
    create policy "camp_destinatarios_delete_authenticated" on public.campanias_destinatarios
      for delete to authenticated using (true);

    create policy "camp_prospeccion_select_authenticated" on public.prospeccion_log
      for select to authenticated using (true);
    create policy "camp_prospeccion_insert_authenticated" on public.prospeccion_log
      for insert to authenticated with check (true);
  end if;
end $$;
