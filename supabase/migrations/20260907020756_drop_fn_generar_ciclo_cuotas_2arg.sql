-- ==============================================================================
-- Migración: 20260907000000_drop_fn_generar_ciclo_cuotas_2arg.sql
-- Limpieza: eliminar la sobrecarga huérfana de 2 args de fn_generar_ciclo_cuotas.
--
-- En prod conviven fn_generar_ciclo_cuotas(int,int) y fn_generar_ciclo_cuotas(
-- int,int,bigint DEFAULT 60000). Una llamada por PostgREST con solo {p_mes,p_anio}
-- es AMBIGUA entre las dos (la de 2 args exacta y la de 3 con default) y falla
-- con "function is not unique". El portal soi-finanzas conoce la firma de 2 args
-- en su database.types.ts, así que hay riesgo real.
--
-- Se deja solo la de 3 args (default 60000). Idempotente.
-- Rollback: recrear la de 2 args como wrapper -> fn_generar_ciclo_cuotas(p_mes, p_anio, 60000).
-- ==============================================================================

DROP FUNCTION IF EXISTS public.fn_generar_ciclo_cuotas(integer, integer);
