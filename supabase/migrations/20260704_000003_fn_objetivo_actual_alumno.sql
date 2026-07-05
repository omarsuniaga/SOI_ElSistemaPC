-- Slice 2 (curriculo-tres-planos WU #5): motor de progresion.
--
-- fn_objetivo_actual_alumno(p_student_id, p_route_version_id) devuelve el
-- "objetivo actual" de un alumno dentro de una ruta: el primer objetivo
-- (ordenado por level_number, node.order_index, objetivo.order_index) que
-- tiene al menos un indicador REQUERIDO (indicators.is_required = true —
-- columna real de produccion, ver supabase/migrations/ruta-academica-tables.sql)
-- sin un intento 'approved' registrado en indicator_attempts.
--
-- Contrato de salida (json):
-- {
--   "objetivo_actual_id": uuid | null,
--   "nombre": text | null,
--   "tema_id": uuid | null,
--   "tema_nombre": text | null,
--   "nivel_id": uuid | null,
--   "indicadores_pendientes_requeridos": int
-- }
--
-- Si no hay ningun objetivo pendiente (todos los requeridos aprobados o la
-- ruta no tiene objetivos), devuelve todos los campos null y el contador en 0
-- (ruta completada / vacia).

CREATE OR REPLACE FUNCTION public.fn_objetivo_actual_alumno(
  p_student_id uuid,
  p_route_version_id uuid
)
RETURNS json
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_result json;
BEGIN
  WITH ordered_objetivos AS (
    SELECT
      o.id AS objetivo_id,
      o.nombre AS objetivo_nombre,
      n.id AS node_id,
      n.name AS node_nombre,
      lv.id AS level_id,
      lv.level_number,
      n.order_index AS node_order,
      o.order_index AS objetivo_order
    FROM public.levels lv
    JOIN public.nodes n ON n.level_id = lv.id
    JOIN public.objetivos o ON o.node_id = n.id
    WHERE lv.route_version_id = p_route_version_id
      AND o.activo = true
  ),
  indicadores_requeridos AS (
    SELECT
      i.id AS indicator_id,
      i.objetivo_id
    FROM public.indicators i
    WHERE i.objetivo_id IN (SELECT objetivo_id FROM ordered_objetivos)
      AND COALESCE(i.is_required, true) = true
  ),
  aprobados AS (
    SELECT DISTINCT ia.indicator_id
    FROM public.indicator_attempts ia
    WHERE ia.student_id = p_student_id
      AND ia.result = 'approved'
      AND ia.indicator_id IN (SELECT indicator_id FROM indicadores_requeridos)
  ),
  pendientes_por_objetivo AS (
    SELECT
      ir.objetivo_id,
      COUNT(*) FILTER (WHERE a.indicator_id IS NULL) AS pendientes
    FROM indicadores_requeridos ir
    LEFT JOIN aprobados a ON a.indicator_id = ir.indicator_id
    GROUP BY ir.objetivo_id
  )
  SELECT json_build_object(
    'objetivo_actual_id', oo.objetivo_id,
    'nombre', oo.objetivo_nombre,
    'tema_id', oo.node_id,
    'tema_nombre', oo.node_nombre,
    'nivel_id', oo.level_id,
    'indicadores_pendientes_requeridos', COALESCE(pp.pendientes, 0)
  )
  INTO v_result
  FROM ordered_objetivos oo
  LEFT JOIN pendientes_por_objetivo pp ON pp.objetivo_id = oo.objetivo_id
  WHERE COALESCE(pp.pendientes, 0) > 0
  ORDER BY oo.level_number, oo.node_order, oo.objetivo_order
  LIMIT 1;

  IF v_result IS NULL THEN
    v_result := json_build_object(
      'objetivo_actual_id', NULL,
      'nombre', NULL,
      'tema_id', NULL,
      'tema_nombre', NULL,
      'nivel_id', NULL,
      'indicadores_pendientes_requeridos', 0
    );
  END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.fn_objetivo_actual_alumno(uuid, uuid) IS
  'Devuelve el objetivo actual (primer objetivo con indicadores requeridos pendientes) de un alumno dentro de una ruta.';

GRANT EXECUTE ON FUNCTION public.fn_objetivo_actual_alumno(uuid, uuid) TO authenticated;
