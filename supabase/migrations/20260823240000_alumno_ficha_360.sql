-- Migration: 20260823240000_alumno_ficha_360.sql
-- Description: RPC de solo lectura para la Ficha 360° del Alumno en
-- /soi-finanzas (asistencia + progreso musical + solvencia).
--
-- Por qué un RPC y no una consulta directa a `asistencias`/`progresos`:
-- `asistencias` tiene RLS que solo permite leer al maestro dueño de la
-- sesión o a `es_admin()` — no hay política para el rol `finanzas`, así que
-- una consulta directa devolvería 0 filas en silencio (falso "sin datos").
-- Además, CLAUDE.md establece que FIN no debe leer tablas de otros
-- departamentos directamente. Este RPC (SECURITY DEFINER) sí puede leer
-- esas tablas, pero solo devuelve AGREGADOS (conteos, fechas, última
-- calificación) — nunca el contenido de clase en crudo — y solo a
-- finanzas/admin/direccion.
--
-- Verificado en vivo 2026-08-23 contra un alumno con 22 asistencias reales
-- (9 presentes / 13 ausentes, 41% de asistencia) y un alumno sin ningún
-- registro — el resultado distingue correctamente "0 sesiones registradas"
-- de "0% de asistencia calculado sobre datos reales".

CREATE OR REPLACE FUNCTION public.fn_alumno_ficha_360(p_alumno_id uuid)
 RETURNS TABLE (
   total_sesiones integer,
   presentes integer,
   ausentes integer,
   justificados integer,
   primera_asistencia date,
   ultima_asistencia date,
   total_evaluaciones integer,
   ultima_fecha_evaluacion date,
   ultima_calificacion numeric,
   ultimo_estado_cualitativo text,
   ultimo_objetivo text
 )
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
AS $function$
BEGIN
  IF get_user_role() NOT IN ('finanzas', 'admin', 'direccion') THEN
    RAISE EXCEPTION 'No autorizado para consultar la ficha 360 de alumnos.';
  END IF;

  RETURN QUERY
  SELECT
    count(a.*)::int AS total_sesiones,
    count(*) FILTER (WHERE a.estado = 'presente')::int AS presentes,
    count(*) FILTER (WHERE a.estado = 'ausente')::int AS ausentes,
    count(*) FILTER (WHERE a.estado = 'justificado')::int AS justificados,
    min(a.fecha) AS primera_asistencia,
    max(a.fecha) AS ultima_asistencia,
    (SELECT count(*)::int FROM public.progresos p WHERE p.alumno_id = p_alumno_id) AS total_evaluaciones,
    (SELECT max(p.fecha_evaluacion) FROM public.progresos p WHERE p.alumno_id = p_alumno_id) AS ultima_fecha_evaluacion,
    (SELECT p.calificacion FROM public.progresos p WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultima_calificacion,
    (SELECT p.estado_cualitativo FROM public.progresos p WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultimo_estado_cualitativo,
    (SELECT o.nombre FROM public.progresos p LEFT JOIN public.objetivos o ON o.id = p.objetivo_id WHERE p.alumno_id = p_alumno_id ORDER BY p.fecha_evaluacion DESC NULLS LAST, p.created_at DESC LIMIT 1) AS ultimo_objetivo
  FROM public.asistencias a
  WHERE a.alumno_id = p_alumno_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.fn_alumno_ficha_360(uuid) TO authenticated;
