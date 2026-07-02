-- Cierre académico: bloqueo de período + snapshot de consolidado
-- Crea la RPC fn_cerrar_periodo_academico para congelar el período y registrar auditoría.

alter table if exists public.periodos
  add column if not exists cerrado boolean not null default false,
  add column if not exists cerrado_at timestamptz,
  add column if not exists cerrado_por uuid,
  add column if not exists observaciones_cierre text;

create table if not exists public.periodos_cierre_auditoria (
  id uuid primary key default gen_random_uuid(),
  periodo_id uuid not null references public.periodos(id) on delete cascade,
  fecha_inicio date not null,
  fecha_fin date not null,
  cerrado_por uuid,
  observaciones text,
  resumen jsonb not null default '{}'::jsonb,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.fn_cerrar_periodo_academico(
  p_periodo_id uuid,
  p_fecha_inicio date default null,
  p_fecha_fin date default null,
  p_cerrado_por uuid default null,
  p_observaciones text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_periodo record;
  v_fecha_inicio date;
  v_fecha_fin date;
  v_snapshot jsonb;
  v_resumen jsonb;
  v_result jsonb;
begin
  select * into v_periodo
  from public.periodos
  where id = p_periodo_id
  for update;

  if not found then
    raise exception 'Periodo no encontrado';
  end if;

  v_fecha_inicio := coalesce(p_fecha_inicio, v_periodo.fecha_inicio);
  v_fecha_fin := coalesce(p_fecha_fin, v_periodo.fecha_fin);

  if v_periodo.cerrado then
    raise exception 'El período ya está cerrado';
  end if;

  select jsonb_build_object(
    'totalClases', count(distinct sc.clase_id),
    'totalSesiones', count(*),
    'totalAsistencias', count(a.id),
    'totalPresentes', count(a.id) filter (where a.estado = 'presente'),
    'totalAusentes', count(a.id) filter (where a.estado = 'ausente'),
    'totalJustificados', count(a.id) filter (where a.estado = 'justificado'),
    'tasaGlobalAsistencia',
      case
        when count(a.id) > 0 then
          round(
            ((count(a.id) filter (where a.estado in ('presente', 'justificado')))::numeric / count(a.id)::numeric) * 100,
            2
          )
        else null
      end
  )
  into v_resumen
  from public.sesiones_clase sc
  left join public.asistencias a on a.sesion_clase_id = sc.id
  where sc.fecha between v_fecha_inicio and v_fecha_fin;

  select jsonb_build_object(
    'resumen', v_resumen,
    'clases', coalesce(jsonb_agg(distinct jsonb_build_object(
      'clase_id', sc.clase_id,
      'sesion_id', sc.id,
      'fecha', sc.fecha,
      'estado', sc.estado
    )), '[]'::jsonb)
  )
  into v_snapshot
  from public.sesiones_clase sc
  left join public.asistencias a on a.sesion_clase_id = sc.id
  where sc.fecha between v_fecha_inicio and v_fecha_fin;

  update public.periodos
  set cerrado = true,
      cerrado_at = now(),
      cerrado_por = p_cerrado_por,
      observaciones_cierre = p_observaciones,
      updated_at = now()
  where id = p_periodo_id;

  insert into public.periodos_cierre_auditoria (
    periodo_id,
    fecha_inicio,
    fecha_fin,
    cerrado_por,
    observaciones,
    resumen,
    snapshot
  ) values (
    p_periodo_id,
    v_fecha_inicio,
    v_fecha_fin,
    p_cerrado_por,
    p_observaciones,
    v_resumen,
    v_snapshot
  )
  returning jsonb_build_object(
    'ok', true,
    'periodo_id', periodo_id,
    'snapshot_id', id,
    'fecha_inicio', fecha_inicio,
    'fecha_fin', fecha_fin,
    'snapshot', snapshot
  ) into v_result;

  return v_result;
end;
$$;

-- Trigger: impedir que un período cerrado se reabra manualmente
create or replace function public.fn_prevent_periodo_reopen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.cerrado and not new.cerrado then
    raise exception 'No se puede reabrir un período académico ya cerrado. Usa la RPC fn_cerrar_periodo_academico para cerrar.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_periodo_reopen
  before update on public.periodos
  for each row
  when (old.cerrado is distinct from new.cerrado)
  execute function public.fn_prevent_periodo_reopen();
