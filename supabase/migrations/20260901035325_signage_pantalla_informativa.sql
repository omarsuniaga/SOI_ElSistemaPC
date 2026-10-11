-- ═══════════════════════════════════════════════════════════════════════════
-- Signage / Pantalla informativa — Sede Punta Cana
-- ═══════════════════════════════════════════════════════════════════════════
-- Trabajo 100% ADITIVO y AISLADO (regla del proyecto):
--   · Tablas nuevas prefijadas signage_*  → NO tocan tablas existentes.
--   · Vistas adaptador de SOLO LECTURA sobre el horario/calendario vivos, para
--     que la SPA de la Raspberry dependa del CONTRATO de la vista y no del
--     esquema interno (que está en rediseño: feat/planificacion-clases-rediseño,
--     tabla `horarios` vacía = probable destino de la migración; hoy la verdad
--     está en `clase_horarios`). El día del cambio se repunta SOLO esta vista.
--   · Convención RLS igual que hermes_kanban_cards / tareas_institucionales:
--     SELECT authenticated, escritura solo es_admin(), anon revocado.
--   · El caché de vídeos de YouTube y el estado de descarga viven LOCALES en
--     la Raspberry (agente + USB), NO en la BD: aquí solo guardamos la
--     intención (qué debe reproducirse). Por eso signage_media no tiene
--     columnas de caché ni necesita cuenta de dispositivo con escritura.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Tablas ────────────────────────────────────────────────────────────

create table if not exists public.signage_pantallas (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  nombre        text not null,
  ubicacion     text,
  orientacion   text not null default 'horizontal'
                  check (orientacion in ('horizontal','vertical')),
  ancho_px      integer not null default 1280,
  alto_px       integer not null default 720,
  layout        jsonb   not null default '{}'::jsonb,
  modo_nocturno jsonb   not null default
                  '{"activo": true, "desde": "21:00", "hasta": "06:00"}'::jsonb,
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.signage_pantallas is
  'Registro de pantallas de señalética. layout = jsonb con proporciones y ajustes de zona. Escrita por el portal Admin (es_admin), leída por la SPA de la Raspberry.';

create table if not exists public.signage_media (
  id              uuid primary key default gen_random_uuid(),
  pantalla_id     uuid references public.signage_pantallas(id) on delete cascade,  -- null = todas
  tipo            text not null check (tipo in ('imagen','video','youtube')),
  titulo          text,
  credito         text,
  storage_path    text,       -- objeto en el bucket 'signage' (imagen/video subidos)
  youtube_url     text,
  youtube_video_id text,
  duracion_seg    integer,    -- imágenes: tiempo en pantalla; vídeo: override opcional
  orden           integer not null default 0,
  activo          boolean not null default true,
  vigente_desde   date,
  vigente_hasta   date,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint signage_media_fuente_chk check (
       (tipo = 'youtube' and youtube_url is not null)
    or (tipo in ('imagen','video') and storage_path is not null)
  )
);

comment on table public.signage_media is
  'Playlist declarativa de la señalética (intención). El caché físico de YouTube y su estado de descarga viven en la Raspberry, no aquí.';

create index if not exists idx_signage_media_activo_orden on public.signage_media (activo, orden);
create index if not exists idx_signage_media_pantalla     on public.signage_media (pantalla_id);
create index if not exists idx_signage_media_youtube      on public.signage_media (tipo) where tipo = 'youtube';

-- ─── 2. Trigger updated_at (propio del módulo, patrón SOI) ────────────────

create or replace function public.fn_signage_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog          -- search_path fijo (advisor: function_search_path_mutable)
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_signage_pantallas_updated_at on public.signage_pantallas;
create trigger trg_signage_pantallas_updated_at
  before update on public.signage_pantallas
  for each row execute function public.fn_signage_set_updated_at();

drop trigger if exists trg_signage_media_updated_at on public.signage_media;
create trigger trg_signage_media_updated_at
  before update on public.signage_media
  for each row execute function public.fn_signage_set_updated_at();

-- ─── 3. RLS ──────────────────────────────────────────────────────────────

alter table public.signage_pantallas enable row level security;
alter table public.signage_media     enable row level security;

drop policy if exists signage_pantallas_auth_read  on public.signage_pantallas;
drop policy if exists signage_pantallas_admin_write on public.signage_pantallas;
create policy signage_pantallas_auth_read  on public.signage_pantallas
  for select to authenticated using (true);
create policy signage_pantallas_admin_write on public.signage_pantallas
  for all to authenticated using (es_admin()) with check (es_admin());

drop policy if exists signage_media_auth_read  on public.signage_media;
drop policy if exists signage_media_admin_write on public.signage_media;
create policy signage_media_auth_read  on public.signage_media
  for select to authenticated using (true);
create policy signage_media_admin_write on public.signage_media
  for all to authenticated using (es_admin()) with check (es_admin());

revoke all on public.signage_pantallas from anon;
revoke all on public.signage_media     from anon;
grant  select, insert, update, delete on public.signage_pantallas to authenticated;
grant  select, insert, update, delete on public.signage_media     to authenticated;

-- ─── 4. Storage: bucket privado 'signage' ────────────────────────────────

insert into storage.buckets (id, name, public)
values ('signage', 'signage', false)
on conflict (id) do nothing;

drop policy if exists "signage_bucket_auth_read"  on storage.objects;
drop policy if exists "signage_bucket_admin_write" on storage.objects;
create policy "signage_bucket_auth_read" on storage.objects
  for select to authenticated using (bucket_id = 'signage');
create policy "signage_bucket_admin_write" on storage.objects
  for all to authenticated
  using      (bucket_id = 'signage' and es_admin())
  with check (bucket_id = 'signage' and es_admin());

-- ─── 5. Vistas adaptador (SOLO LECTURA) ─────────────────────────────────--
--  security_invoker = false (por defecto): la vista corre con los permisos de
--  su dueño (postgres, BYPASSRLS) → la SPA lee datos no sensibles del horario
--  sin necesitar SELECT directo sobre clase_horarios/clases/maestros/salones.
--  Zona horaria fija: America/Santo_Domingo (UTC-4, sin horario de verano).

create or replace view public.signage_v_horario_semana
  with (security_invoker = false) as
select
  ch.id,
  ch.clase_id,
  case lower(ch.dia)
    when 'lunes'     then 1
    when 'martes'    then 2
    when 'miércoles' then 3  when 'miercoles' then 3
    when 'jueves'    then 4
    when 'viernes'   then 5
    when 'sábado'    then 6  when 'sabado'    then 6
    when 'domingo'   then 7
  end                              as dia_iso,
  ch.dia                           as dia_nombre,
  ch.hora_inicio,
  ch.hora_fin,
  c.nombre                         as clase_nombre,
  c.instrumento,
  s.nombre                         as salon_nombre,
  m.nombre_completo                as maestro_nombre
from public.clase_horarios ch
join      public.clases   c on c.id = ch.clase_id and coalesce(c.activo, true)
left join public.salones  s on s.id = ch.salon_id
left join public.maestros m on m.id = coalesce(ch.maestro_id, c.maestro_principal_id);

comment on view public.signage_v_horario_semana is
  'CONTRATO señalética: rejilla semanal normalizada. Hoy lee clase_horarios; si el rediseño migra a `horarios`, se reescribe SOLO esta vista.';

create or replace view public.signage_v_horario_hoy
  with (security_invoker = false) as
select * from (
  select
    w.id, w.clase_id, w.hora_inicio, w.hora_fin, w.clase_nombre,
    w.instrumento, w.salon_nombre, w.maestro_nombre,
    'regular'::text as origen
  from public.signage_v_horario_semana w
  where w.dia_iso = extract(isodow from (now() at time zone 'America/Santo_Domingo'))::int
  union all
  select
    ce.id, ce.clase_id, ce.hora_inicio, ce.hora_fin,
    coalesce(ce.nombre_clase, 'Clase emergente'),
    ce.instrumento, ce.salon,
    (select m.nombre_completo from public.maestros m where m.id = ce.maestro_id),
    'emergente'::text
  from public.clases_emergentes ce
  where ce.fecha = (now() at time zone 'America/Santo_Domingo')::date
    and coalesce(ce.estado, 'activa') <> 'cancelada'
) q
order by hora_inicio nulls last;

comment on view public.signage_v_horario_hoy is
  'CONTRATO señalética: clases de HOY (regular + emergentes) resuelto en America/Santo_Domingo.';

create or replace view public.signage_v_horario_manana
  with (security_invoker = false) as
select * from (
  select
    w.id, w.clase_id, w.hora_inicio, w.hora_fin, w.clase_nombre,
    w.instrumento, w.salon_nombre, w.maestro_nombre,
    'regular'::text as origen
  from public.signage_v_horario_semana w
  where w.dia_iso = extract(isodow from ((now() at time zone 'America/Santo_Domingo') + interval '1 day'))::int
  union all
  select
    ce.id, ce.clase_id, ce.hora_inicio, ce.hora_fin,
    coalesce(ce.nombre_clase, 'Clase emergente'),
    ce.instrumento, ce.salon,
    (select m.nombre_completo from public.maestros m where m.id = ce.maestro_id),
    'emergente'::text
  from public.clases_emergentes ce
  where ce.fecha = ((now() at time zone 'America/Santo_Domingo') + interval '1 day')::date
    and coalesce(ce.estado, 'activa') <> 'cancelada'
) q
order by hora_inicio nulls last;

comment on view public.signage_v_horario_manana is
  'CONTRATO señalética: clases de MAÑANA (regular + emergentes).';

create or replace view public.signage_v_calendario_mes
  with (security_invoker = false) as
select
  ci.id,
  ci.titulo,
  ci.descripcion,
  ci.categoria::text as categoria,
  ci.ubicacion,
  ci.fecha_inicio,
  ci.fecha_fin,
  coalesce(ci.es_macro_evento, false) as es_macro_evento
from public.calendario_institucional ci
where ci.estado = 'programado'
  and ci.fecha_fin   >= date_trunc('month', now() at time zone 'America/Santo_Domingo')
  and ci.fecha_inicio <  date_trunc('month', now() at time zone 'America/Santo_Domingo') + interval '2 months'
order by ci.fecha_inicio;

comment on view public.signage_v_calendario_mes is
  'CONTRATO señalética: eventos del mes en curso + siguiente para el banner superior.';

-- ─── 6. Grants de las vistas ─────────────────────────────────────────────

revoke all on
  public.signage_v_horario_semana,
  public.signage_v_horario_hoy,
  public.signage_v_horario_manana,
  public.signage_v_calendario_mes
from anon;

grant select on
  public.signage_v_horario_semana,
  public.signage_v_horario_hoy,
  public.signage_v_horario_manana,
  public.signage_v_calendario_mes
to authenticated, service_role;

-- ─── 7. Realtime SOLO sobre las tablas nuevas ────────────────────────────--
--  Aditivo: no toca ninguna tabla existente de la publicación. El horario y el
--  calendario NO se añaden aquí; la SPA los refresca por polling cada 2-3 min.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename='signage_media'
    ) then
      execute 'alter publication supabase_realtime add table public.signage_media';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename='signage_pantallas'
    ) then
      execute 'alter publication supabase_realtime add table public.signage_pantallas';
    end if;
  end if;
end $$;

-- ─── 8. Semilla: la pantalla del vestíbulo de Punta Cana ─────────────────

insert into public.signage_pantallas (slug, nombre, ubicacion, layout)
values (
  'punta-cana-vestibulo',
  'Vestíbulo — Sede Punta Cana',
  'Hall de entrada',
  '{
    "cabecera": {"visible": true, "marca": true, "reloj": true, "fecha": true, "centro": "calendario", "texto": ""},
    "sidebar":  {"visible": true, "anchoPct": 31, "hoy": true, "manana": true, "salon": true, "maestro": true, "instrumento": true},
    "central":  {"contenido": "media", "leyendas": true, "ajuste": "contain", "mensaje": ""},
    "footer":   {"visible": false, "altoPct": 7, "contenido": "texto", "texto": ""}
  }'::jsonb
)
on conflict (slug) do nothing;
