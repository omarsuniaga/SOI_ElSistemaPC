-- fn_decrementar_stock: descuento atómico de stock de un accesorio.
--
-- El módulo Caja (src/modules/caja/api/cajaSupabase.js → asignarAccesorio)
-- llamaba a esta RPC, pero nunca existió en la base: la llamada resolvía con
-- error y el fallback usaba `supabase.raw()`, que no existe en supabase-js v2,
-- así que el stock nunca se descontaba al asignar un accesorio.
--
-- Idempotente: CREATE OR REPLACE. No baja el stock por debajo de 0.

create or replace function public.fn_decrementar_stock(
  p_accesorio_id uuid,
  p_cantidad integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nuevo_stock integer;
begin
  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'p_cantidad debe ser un entero positivo (recibido: %)', p_cantidad;
  end if;

  update public.accesorios
     set stock_actual = greatest(0, coalesce(stock_actual, 0) - p_cantidad)
   where id = p_accesorio_id
  returning stock_actual into v_nuevo_stock;

  if not found then
    raise exception 'accesorio % no encontrado', p_accesorio_id;
  end if;

  return v_nuevo_stock;
end;
$$;

revoke all on function public.fn_decrementar_stock(uuid, integer) from public;
grant execute on function public.fn_decrementar_stock(uuid, integer) to authenticated;
