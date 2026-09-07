-- Ficha 360 (portal FIN): instrumentos en comodato del alumno.
--
-- Devuelve una fila por comodato ACTIVO del alumno, con los datos del
-- instrumento (inventario_activos) y, si la hay, la reparación abierta más
-- reciente (inventario_reparaciones con estado 'recibido' o 'en_reparacion').
--
-- Mismo gate de rol que fn_alumno_ficha_360: finanzas / admin / direccion.
-- SECURITY DEFINER para leer inventario sin depender de las RLS de esas tablas
-- (el acceso queda acotado por el gate de rol de esta función).

CREATE OR REPLACE FUNCTION public.fn_alumno_instrumentos_comodato(p_alumno_id uuid)
RETURNS TABLE (
  comodato_id uuid,
  tipo_comodato text,
  fecha_entrega date,
  fecha_vencimiento date,
  comodato_estado text,
  contrato_firmado_url text,
  activo_id uuid,
  codigo_inventario text,
  tipo_instrumento text,
  marca text,
  modelo text,
  numero_serie text,
  estado_conservacion text,
  estado_uso text,
  ubicacion text,
  en_reparacion boolean,
  reparacion_estado text,
  reparacion_descripcion text,
  reparacion_fecha_ingreso date
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF get_user_role() NOT IN ('finanzas', 'admin', 'direccion') THEN
    RAISE EXCEPTION 'No autorizado para consultar los instrumentos del alumno.';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.tipo_comodato::text,
    c.fecha_entrega,
    c.fecha_vencimiento,
    c.estado::text,
    c.contrato_firmado_url::text,
    i.id,
    i.codigo_inventario::text,
    i.tipo_instrumento::text,
    i.marca::text,
    i.modelo::text,
    i.numero_serie::text,
    i.estado_conservacion::text,
    i.estado_uso::text,
    i.ubicacion::text,
    (r.id IS NOT NULL) AS en_reparacion,
    r.estado::text AS reparacion_estado,
    r.descripcion AS reparacion_descripcion,
    r.fecha_ingreso AS reparacion_fecha_ingreso
  FROM public.comodatos_activos c
  JOIN public.inventario_activos i ON i.id = c.activo_id
  LEFT JOIN LATERAL (
    SELECT rr.id, rr.estado, rr.descripcion, rr.fecha_ingreso, rr.created_at
    FROM public.inventario_reparaciones rr
    WHERE rr.activo_id = i.id
      AND rr.estado IN ('recibido', 'en_reparacion')
    ORDER BY rr.fecha_ingreso DESC NULLS LAST, rr.created_at DESC
    LIMIT 1
  ) r ON true
  WHERE c.alumno_id = p_alumno_id
    AND c.estado = 'activo'
  ORDER BY c.fecha_entrega DESC NULLS LAST, c.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_alumno_instrumentos_comodato(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_alumno_instrumentos_comodato(uuid) TO authenticated;
