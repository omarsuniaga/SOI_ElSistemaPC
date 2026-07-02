-- Verificación manual del cierre académico ACM
-- Ejecutar en el SQL editor de Supabase una vez aplicada la migración.

-- 1) Confirmar columnas de cierre en periodos
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'periodos'
  and column_name in ('cerrado', 'cerrado_at', 'cerrado_por', 'observaciones_cierre')
order by column_name;

-- 2) Confirmar estructura de auditoría
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'periodos_cierre_auditoria'
  and column_name in ('resumen', 'snapshot', 'created_at', 'periodo_id', 'fecha_inicio', 'fecha_fin')
order by column_name;

-- 3) Confirmar que la RPC existe
select routine_name, routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'fn_cerrar_periodo_academico';

-- 4) Revisar últimos cierres
select
  p.nombre,
  p.activo,
  p.cerrado,
  p.cerrado_at,
  a.created_at,
  a.fecha_inicio,
  a.fecha_fin,
  a.resumen
from public.periodos_cierre_auditoria a
join public.periodos p on p.id = a.periodo_id
order by a.created_at desc
limit 20;

