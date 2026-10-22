-- Regresión con registros existentes elegidos dinámicamente, sin identidades personales.
-- Toda la ejecución se revierte; no se guardan matrículas ni cambios de datos.
BEGIN;
DO $$
DECLARE actor uuid; target uuid;
BEGIN
  SELECT m.user_id INTO actor FROM public.maestros m
  JOIN public.profiles p ON p.id = m.user_id
  JOIN public.permisos_maestros pm ON pm.maestro_id = m.id
  WHERE m.activo IS TRUE AND p.activo IS TRUE AND p.estado = 'activo' AND p.rol = 'maestro'
    AND (pm.puede_inscribir_clases IS TRUE OR pm.permisos && ARRAY['clases:enroll','inscribir_clases'])
  ORDER BY m.id LIMIT 1;
  IF actor IS NULL THEN RAISE EXCEPTION 'Se requiere un maestro con permiso para ejecutar esta prueba'; END IF;
  SELECT a.id INTO target FROM public.alumnos a WHERE a.activo IS TRUE AND NOT EXISTS (
    SELECT 1 FROM public.alumnos_clases ac JOIN public.clases c ON c.id = ac.clase_id
    JOIN public.maestros m ON m.id IN (c.maestro_principal_id, c.maestro_suplente_id)
    WHERE ac.alumno_id = a.id AND m.user_id = actor
  ) ORDER BY a.id LIMIT 1;
  IF target IS NULL THEN RAISE EXCEPTION 'Se requiere un alumno fuera de las clases del maestro'; END IF;
  PERFORM set_config('request.jwt.claims', json_build_object('sub',actor,'role','authenticated')::text, true);
  PERFORM set_config('test.enrollment_target',target::text,true);
  IF has_function_privilege('anon', 'public.obtener_alumnos_para_inscripcion(integer,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Anonymous execution must be denied';
  END IF;
END $$;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.obtener_alumnos_para_inscripcion() WHERE id = current_setting('test.enrollment_target')::uuid) THEN
    RAISE EXCEPTION 'Alumno from another class must appear in enrollment directory';
  END IF;
  IF EXISTS (SELECT 1 FROM public.alumnos WHERE id = current_setting('test.enrollment_target')::uuid) THEN
    RAISE EXCEPTION 'Full expediente must remain scoped before enrollment';
  END IF;
  IF EXISTS (SELECT 1 FROM public.obtener_alumnos_para_inscripcion() WHERE activo IS NOT TRUE) THEN
    RAISE EXCEPTION 'Inactive alumnos must not appear';
  END IF;
END $$;
SELECT set_config('request.jwt.claims', '{"role":"authenticated"}', true);
DO $$ BEGIN
  BEGIN
    PERFORM * FROM public.obtener_alumnos_para_inscripcion();
    RAISE EXCEPTION 'Missing auth context must be denied';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
ROLLBACK;
