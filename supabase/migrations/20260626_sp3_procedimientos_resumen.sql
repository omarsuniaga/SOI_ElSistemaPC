-- 20260626_sp3_procedimientos_resumen.sql
-- SP-3: vista consolidada de procedimientos para el Director.
-- Agrupa tareas_institucionales por correlation_id (el CASO), con avance, estados,
-- departamentos involucrados y prioridad maxima. Lo consume procedimientosView.js.
CREATE OR REPLACE FUNCTION public.fn_procedimientos_resumen()
RETURNS TABLE (
  correlation_id uuid,
  titulo_muestra text,
  total int,
  completadas int,
  pendientes int,
  en_progreso int,
  bloqueadas int,
  observadas int,
  canceladas int,
  pct_avance int,
  departamentos text[],
  prioridad_max text,
  ultima_actividad timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    t.correlation_id,
    (array_agg(t.titulo ORDER BY t.created_at))[1] AS titulo_muestra,
    count(*)::int AS total,
    count(*) FILTER (WHERE t.estado = 'completada')::int AS completadas,
    count(*) FILTER (WHERE t.estado = 'pendiente')::int AS pendientes,
    count(*) FILTER (WHERE t.estado = 'en_progreso')::int AS en_progreso,
    count(*) FILTER (WHERE t.estado = 'bloqueada')::int AS bloqueadas,
    count(*) FILTER (WHERE t.estado = 'observada')::int AS observadas,
    count(*) FILTER (WHERE t.estado = 'cancelada')::int AS canceladas,
    CASE WHEN count(*) FILTER (WHERE t.estado <> 'cancelada') = 0 THEN 0
      ELSE round(100.0 * count(*) FILTER (WHERE t.estado = 'completada')
        / count(*) FILTER (WHERE t.estado <> 'cancelada'))::int END AS pct_avance,
    array_agg(DISTINCT t.departamento::text) AS departamentos,
    (array_agg(t.prioridad::text ORDER BY
      CASE t.prioridad::text WHEN 'critica' THEN 0 WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END))[1] AS prioridad_max,
    max(t.updated_at) AS ultima_actividad
  FROM public.tareas_institucionales t
  GROUP BY t.correlation_id
  ORDER BY max(t.updated_at) DESC;
$$;
REVOKE ALL ON FUNCTION public.fn_procedimientos_resumen() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_procedimientos_resumen() TO authenticated;
