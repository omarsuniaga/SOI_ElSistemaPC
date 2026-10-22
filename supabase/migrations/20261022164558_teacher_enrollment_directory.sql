-- Catálogo mínimo de inscripción: capacidad explícita, NO acceso al expediente.
-- No modifica RLS de alumnos ni permisos de escritura. Sin tablas nuevas.
BEGIN;
CREATE OR REPLACE FUNCTION soi_security.enrollment_directory(p_offset integer, p_limit integer)
RETURNS TABLE(id uuid, nombre_completo text, instrumento_principal text, activo boolean, sin_clase boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT (
    soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica'])
    OR (
      soi_security.has_role(ARRAY['maestro']) AND EXISTS (
        SELECT 1 FROM public.maestros m
        JOIN public.permisos_maestros pm ON pm.maestro_id = m.id
        WHERE m.activo IS TRUE
          AND (m.user_id = auth.uid() OR (m.user_id IS NULL AND m.id = auth.uid()))
          AND (pm.puede_inscribir_clases IS TRUE OR
            COALESCE(pm.permisos && ARRAY['clases:enroll','inscribir_clases'], false))
      )
    )
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Sin permiso para consultar el catálogo de inscripción';
  END IF;
  IF p_offset IS NULL OR p_offset < 0 OR p_limit IS NULL OR p_limit < 1 OR p_limit > 500 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Paginación inválida';
  END IF;
  RETURN QUERY SELECT a.id, a.nombre_completo::text, a.instrumento_principal::text, a.activo,
    NOT EXISTS (SELECT 1 FROM public.alumnos_clases ac WHERE ac.alumno_id = a.id AND ac.activo IS TRUE)
    FROM public.alumnos a WHERE a.activo IS TRUE
    ORDER BY a.nombre_completo, a.id LIMIT p_limit OFFSET p_offset;
END;
$$;
REVOKE ALL ON FUNCTION soi_security.enrollment_directory(integer,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION soi_security.enrollment_directory(integer,integer) TO authenticated;

-- Fachada invoker en el esquema expuesto; privilegio restringido al helper privado.
CREATE OR REPLACE FUNCTION public.obtener_alumnos_para_inscripcion(p_offset integer DEFAULT 0, p_limit integer DEFAULT 500)
RETURNS TABLE(id uuid, nombre_completo text, instrumento_principal text, activo boolean, sin_clase boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$ SELECT * FROM soi_security.enrollment_directory(p_offset, p_limit); $$;
REVOKE ALL ON FUNCTION public.obtener_alumnos_para_inscripcion(integer,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.obtener_alumnos_para_inscripcion(integer,integer) TO authenticated;
COMMIT;
