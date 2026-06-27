-- 20260626_sp5_hermes_consulta_estado.sql
-- SP-5: snapshot institucional para la capa de consulta de Hermes.
-- Devuelve un JSON con el estado real (sin generacion libre): el frontend clasifica
-- la pregunta del Director (keywords, deterministico) y responde con estos datos.
CREATE OR REPLACE FUNCTION public.fn_hermes_consulta_estado()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'tareas', (SELECT json_build_object(
        'total', count(*),
        'pendiente', count(*) FILTER (WHERE estado='pendiente'),
        'en_progreso', count(*) FILTER (WHERE estado='en_progreso'),
        'completada', count(*) FILTER (WHERE estado='completada'),
        'bloqueada', count(*) FILTER (WHERE estado='bloqueada'),
        'observada', count(*) FILTER (WHERE estado='observada'),
        'cancelada', count(*) FILTER (WHERE estado='cancelada')
      ) FROM public.tareas_institucionales),
    'por_departamento', (SELECT coalesce(json_agg(d ORDER BY d.pendientes DESC), '[]'::json) FROM (
        SELECT departamento::text AS departamento,
               count(*) FILTER (WHERE estado NOT IN ('completada','cancelada')) AS abiertas,
               count(*) FILTER (WHERE estado='pendiente') AS pendientes,
               count(*) FILTER (WHERE estado='bloqueada') AS bloqueadas,
               count(*) AS total
        FROM public.tareas_institucionales GROUP BY departamento
      ) d),
    'atencion_inmediata', (SELECT coalesce(json_agg(a), '[]'::json) FROM (
        SELECT titulo, departamento::text AS departamento, prioridad::text AS prioridad, estado::text AS estado
        FROM public.tareas_institucionales
        WHERE estado = 'bloqueada' OR (prioridad = 'critica' AND estado NOT IN ('completada','cancelada'))
        ORDER BY CASE WHEN estado='bloqueada' THEN 0 ELSE 1 END, updated_at DESC
        LIMIT 25
      ) a),
    'total_procedimientos', (SELECT count(DISTINCT correlation_id) FROM public.tareas_institucionales)
  );
$$;
REVOKE ALL ON FUNCTION public.fn_hermes_consulta_estado() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_hermes_consulta_estado() TO authenticated;
